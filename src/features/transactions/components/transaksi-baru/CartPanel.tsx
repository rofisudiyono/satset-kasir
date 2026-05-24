import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { YStack } from "tamagui";

import { TextH3 } from "@/components/atoms/Typography";
import { BottomActionBar } from "@/features/cart/components/BottomActionBar";
import { CartItemsCard } from "@/features/cart/components/CartItemsCard";
import { PriceSummaryCard } from "@/features/cart/components/PriceSummaryCard";
import { PromoCard } from "@/features/cart/components/PromoCard";
import { cartCheckoutContextAtom, cartAtom, cartOrderDraftAtom, type CustomerVisitStatus } from "@/features/cart/store/cart.store";
import {
  useTablesQuery,
  useTaxSettingsQuery,
  useValidatePromoMutation,
} from "@/hooks/api/use-kasir-api";
import { getApiErrorMessage } from "@/lib/api/client";
import { calculateTaxBreakdown } from "@/lib/tax";
import { shiftDataAtom } from "@/features/shift/store/shift.store";
import type { KasirTable } from "@/lib/api/types";
import { ColorBase, ColorDanger, ColorNeutral, ColorSurface } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { useDebouncedEffect } from "@/hooks/use-debounced-effect";
import type { AppliedPromo, OrderType } from "@/types";

const ORDER_DRAFT_DEBOUNCE_MS = 400;

type CartPanelProps = {
  compact?: boolean;
};

export function CartPanel({ compact = false }: CartPanelProps) {
  const router = useRouter();
  const [cart, setCart] = useAtom(cartAtom);
  const [orderDraft, setOrderDraft] = useAtom(cartOrderDraftAtom);
  const [shiftData] = useAtom(shiftDataAtom);
  const [, setCheckoutContext] = useAtom(cartCheckoutContextAtom);

  const [customerName, setCustomerName] = useState(orderDraft.customerName);
  const [customerPhone, setCustomerPhone] = useState(orderDraft.customerPhone ?? "");
  const [orderNote, setOrderNote] = useState(orderDraft.orderNote ?? "");
  const [customerVisitStatus, setCustomerVisitStatus] =
    useState<CustomerVisitStatus | null>(orderDraft.customerVisitStatus ?? null);
  const [selectedTable, setSelectedTable] = useState<KasirTable | null>(null);
  const [orderType, setOrderType] = useState<OrderType>(orderDraft.orderType);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const { data: tables = [], isLoading: isTablesLoading } = useTablesQuery(true);
  const { data: taxSettings } = useTaxSettingsQuery(Boolean(shiftData?.shiftId));
  const validatePromoMutation = useValidatePromoMutation();

  const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0);
  const discount = appliedPromo && promoEnabled ? appliedPromo.discount : 0;
  const afterDiscount = subtotal - discount;
  const taxBreakdown = calculateTaxBreakdown(taxSettings, afterDiscount);
  const ppn = taxBreakdown.taxAmount;
  const total = taxBreakdown.grandTotal;

  React.useEffect(() => {
    if (!orderDraft.tableId) return;
    const restored = tables.find((table: KasirTable) => table.id === orderDraft.tableId);
    if (restored) setSelectedTable(restored);
  }, [orderDraft.tableId, tables]);

  React.useEffect(() => {
    if (orderType !== "Dine In") {
      setSelectedTable(null);
    }
  }, [orderType]);

  React.useEffect(() => {
    if (customerVisitStatus === "returning" && customerName) {
      setCustomerName("");
    }
  }, [customerName, customerVisitStatus]);

  useDebouncedEffect(
    () => {
      setOrderDraft({
        customerName: customerVisitStatus === "new" ? customerName : "",
        customerPhone,
        orderNote,
        customerVisitStatus,
        orderType,
        tableId: selectedTable?.id,
        tableLabel: selectedTable?.label,
      });
    },
    [
      customerName,
      customerPhone,
      customerVisitStatus,
      orderNote,
      orderType,
      selectedTable,
      setOrderDraft,
    ],
    ORDER_DRAFT_DEBOUNCE_MS,
  );

  function handleUpdateQty(cartId: string, qty: number) {
    setCart((prev) =>
      prev.map((c) => (c.cartId === cartId ? { ...c, quantity: qty } : c)),
    );
  }

  function handleRemove(cartId: string) {
    setCart((prev) => prev.filter((c) => c.cartId !== cartId));
  }

  function handleUpdateNote(cartId: string, note: string) {
    setCart((prev) =>
      prev.map((c) => (c.cartId === cartId ? { ...c, note } : c)),
    );
  }

  function handleClearCart() {
    Alert.alert(
      "Hapus Semua Item",
      "Apakah kamu yakin ingin menghapus semua item di keranjang?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => setCart([]) },
      ],
    );
  }

  async function handleApplyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    const menuIds = cart.map((item) => item.productId);
    setPromoLoading(true);
    try {
      const result = await validatePromoMutation.mutateAsync({ code, subtotal, menuIds });
      setAppliedPromo({
        promoId: result.promoId,
        code: result.code ?? code,
        name: result.name,
        type: result.type,
        value: result.value,
        discount: result.discount,
        label:
          result.type === "percent"
            ? `${result.code} — Diskon ${result.value}%`
            : `${result.code} — Hemat Rp ${result.discount.toLocaleString("id-ID")}`,
      });
      setPromoEnabled(true);
      setPromoCode("");
    } catch (err) {
      Alert.alert(
        "Kode Promo Tidak Valid",
        getApiErrorMessage(err) ?? "Kode promo tidak ditemukan atau tidak berlaku.",
      );
    } finally {
      setPromoLoading(false);
    }
  }

  function persistCheckoutContext() {
    setCheckoutContext({ appliedPromo, promoEnabled });
  }

  function handleOpenHoldPage() {
    if (cart.length === 0) return;
    persistCheckoutContext();
    router.push({
      pathname: "/order-info",
      params: { mode: "hold" },
    });
  }

  function handleOpenPayPage() {
    if (cart.length === 0) return;
    persistCheckoutContext();
    router.push({
      pathname: "/order-info",
      params: { mode: "pay" },
    });
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <TextH3
          fontWeight="800"
          color={compact ? ColorNeutral.neutral900 : undefined}
        >
          Keranjang
        </TextH3>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClearCart}
          style={[styles.trashBtn, compact && styles.trashBtnCompact]}
        >
          <Ionicons
            name="trash-outline"
            size={16}
            color={ColorDanger.danger600}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={compact ? 8 : 12}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingBottom: compact ? 100 : 108,
            flexGrow: 1,
          }}
        >
          <YStack
            gap={compact ? 10 : 12}
            paddingHorizontal={compact ? 12 : 16}
            paddingTop={compact ? 10 : 12}
          >
            <CartItemsCard
              cart={cart}
              onUpdateQty={handleUpdateQty}
              onRemove={handleRemove}
              onUpdateNote={handleUpdateNote}
            />
            <PromoCard
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
              onApplyPromo={() => {
                void handleApplyPromo();
              }}
              appliedPromo={appliedPromo}
              promoEnabled={promoEnabled}
              onTogglePromo={() => setPromoEnabled((v) => !v)}
              isLoading={promoLoading}
            />
            <PriceSummaryCard
              subtotal={subtotal}
              discount={discount}
              ppn={ppn}
              total={total}
              taxLabel={taxSettings?.label ?? "PPN"}
              taxRate={taxBreakdown.rate}
            />
          </YStack>
        </ScrollView>

        <BottomActionBar
          cartLength={cart.length}
          onHoldOrder={handleOpenHoldPage}
          onPay={handleOpenPayPage}
          compact={compact}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: ColorSurface.surfaceMuted,
  },
  containerCompact: {
    backgroundColor: BrandColors.surfaceWarm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: ColorSurface.border,
    backgroundColor: ColorBase.white,
  },
  headerCompact: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: BrandColors.surfaceWarm,
    borderBottomColor: BrandColors.border,
  },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ColorDanger.danger50,
    alignItems: "center",
    justifyContent: "center",
  },
  trashBtnCompact: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#FFF1EE",
  },
});
