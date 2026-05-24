import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AppButton } from "@/components/atoms/AppButton";
import { PageHeader } from "@/components/molecules/PageHeader";
import { CartItemsCard } from "@/features/cart/components/CartItemsCard";
import { CustomerInfoCard } from "@/features/cart/components/CustomerInfoCard";
import { PriceSummaryCard } from "@/features/cart/components/PriceSummaryCard";
import { PromoCard } from "@/features/cart/components/PromoCard";
import {
  cartAtom,
  cartOrderDraftAtom,
  cartSnapshotAtom,
  heldOrdersAtom,
  type CustomerVisitStatus,
} from "@/features/cart/store/cart.store";
import { buildCheckoutOrderBody, buildPosOrderFromCart } from "@/features/pos/pos.utils";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import {
  useActivePromosQuery,
  useCheckoutMutation,
  useTablesQuery,
  useTaxSettingsQuery,
  useTenantInfoQuery,
  useValidatePromoMutation,
} from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { getApiErrorMessage } from "@/lib/api/client";
import type { KasirTable } from "@/lib/api/types";
import { calculateTaxBreakdown } from "@/lib/tax";
import { ColorBase, ColorDanger, ColorPrimary } from "@/themes/Colors";
import { useDebouncedEffect } from "@/hooks/use-debounced-effect";
import type { AppliedPromo, OrderType } from "@/types";

const ORDER_DRAFT_DEBOUNCE_MS = 400;

export default function KeranjangPage() {
  const router = useRouter();
  const [cart, setCart] = useAtom(cartAtom);
  const [orderDraft, setOrderDraft] = useAtom(cartOrderDraftAtom);
  const [, setHeldOrders] = useAtom(heldOrdersAtom);
  const [, setCartSnapshot] = useAtom(cartSnapshotAtom);
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const [shiftData] = useAtom(shiftDataAtom);
  const [posOrders, setPosOrders] = useAtom(posOrdersAtom);
  const { isTablet, contentMaxWidth, horizontalPadding } = useResponsiveLayout();

  const [customerName, setCustomerName] = useState(orderDraft.customerName);
  const [customerPhone, setCustomerPhone] = useState(orderDraft.customerPhone ?? "");
  const [orderNote, setOrderNote] = useState(orderDraft.orderNote ?? "");
  const [customerVisitStatus, setCustomerVisitStatus] =
    useState<CustomerVisitStatus | null>(orderDraft.customerVisitStatus ?? null);
  const [selectedTable, setSelectedTable] = useState<KasirTable | null>(null);
  const [orderType, setOrderType] = useState<OrderType>(orderDraft.orderType);
  const { data: tables = [], isLoading: isTablesLoading } = useTablesQuery(isShiftStarted);
  const { data: tenantInfo } = useTenantInfoQuery(isShiftStarted);
  const checkoutMutation = useCheckoutMutation();
  const isPostPay = tenantInfo?.defaultPaymentTiming === 'POSTPAY';

  // ─── Promo & Tax ────────────────────────────────────────────────────────────
  const { data: taxSettings } = useTaxSettingsQuery(isShiftStarted);

  useActivePromosQuery(isShiftStarted); // warm cache; PromoCard uses this list optionally

  const validatePromoMutation = useValidatePromoMutation();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  // ─── Kalkulasi harga ────────────────────────────────────────────────────────
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0);
  const discount = appliedPromo && promoEnabled ? appliedPromo.discount : 0;
  const afterDiscount = subtotal - discount;
  const taxBreakdown = calculateTaxBreakdown(taxSettings, afterDiscount);
  const ppn = taxBreakdown.taxAmount;
  const total = taxBreakdown.grandTotal;

  // ─── Re-validasi promo jika subtotal berubah setelah promo diapply ──────────
  const prevSubtotalRef = useRef(subtotal);
  useEffect(() => {
    if (!appliedPromo || !promoEnabled) return;
    if (prevSubtotalRef.current === subtotal) return;
    prevSubtotalRef.current = subtotal;

    // Jalankan re-validasi di background; jika gagal (e.g. min purchase) reset promo
    const menuIds = cart.map((item) => item.productId);
    validatePromoMutation.mutate(
      { code: appliedPromo.code ?? "", subtotal, menuIds },
      {
        onSuccess: (result) => {
          setAppliedPromo((prev) =>
            prev
              ? {
                  ...prev,
                  discount: result.discount,
                }
              : null,
          );
        },
        onError: () => {
          setAppliedPromo(null);
          setPromoEnabled(false);
          Alert.alert(
            "Promo Tidak Berlaku",
            "Promo dihapus karena tidak memenuhi syarat untuk total belanja saat ini.",
          );
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  useEffect(() => {
    if (!orderDraft.tableId) return;
    const restored = tables.find((table: KasirTable) => table.id === orderDraft.tableId);
    if (restored) setSelectedTable(restored);
  }, [orderDraft.tableId, tables]);

  useEffect(() => {
    if (orderType !== "Dine In") {
      setSelectedTable(null);
    }
  }, [orderType]);

  useEffect(() => {
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

  useEffect(() => {
    if (isShiftStarted) return;
    router.replace("/buka-shift" as never);
  }, [isShiftStarted, router]);

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
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            setCart([]);
            router.back();
          },
        },
      ],
    );
  }

  function validateCustomerInfo() {
    if (!customerVisitStatus) {
      Alert.alert("Lengkapi data pemesan", "Pilih apakah pelanggan sudah pernah mengunjungi atau belum.");
      return false;
    }
    if (!customerPhone.trim()) {
      Alert.alert("Nomor HP wajib diisi", "Masukkan nomor HP pelanggan sebelum melanjutkan.");
      return false;
    }
    if (customerVisitStatus === "new" && !customerName.trim()) {
      Alert.alert("Nama wajib diisi", "Masukkan nama pelanggan baru sebelum melanjutkan.");
      return false;
    }
    return true;
  }

  async function handleApplyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    const menuIds = cart.map((item) => item.productId);
    setPromoLoading(true);
    try {
      const result = await validatePromoMutation.mutateAsync({
        code,
        subtotal,
        menuIds,
      });
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
      prevSubtotalRef.current = subtotal;
    } catch (err) {
      Alert.alert(
        "Kode Promo Tidak Valid",
        getApiErrorMessage(err) ?? "Kode promo tidak ditemukan atau tidak berlaku.",
      );
    } finally {
      setPromoLoading(false);
    }
  }

  function handleHoldOrder() {
    if (cart.length === 0) return;
    if (!validateCustomerInfo()) return;
    if (orderType === "Dine In" && !selectedTable) {
      Alert.alert("Pilih meja dulu", "Order dine-in wajib memilih meja aktif sebelum ditahan.");
      return;
    }

    const resolvedCustomerName = customerVisitStatus === "new" ? customerName : "";
    const resolvedCustomerVisitStatus = customerVisitStatus ?? "returning";
    const label = resolvedCustomerName || customerPhone || selectedTable?.label || orderType;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const held = {
      id: `hold-${Date.now()}`,
      items: [...cart],
      customerName: resolvedCustomerName,
      customerPhone,
      orderNote,
      customerVisitStatus: resolvedCustomerVisitStatus,
      tableId: selectedTable?.id,
      tableLabel: selectedTable?.label,
      tableNumber: selectedTable?.label ?? "",
      orderType,
      createdAt: timeStr,
      label,
    };
    setHeldOrders((prev) => [held, ...prev]);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setOrderNote("");
    setCustomerVisitStatus(null);
    setOrderType("Dine In");
    setSelectedTable(null);
    setOrderDraft({
      customerName: "",
      customerPhone: "",
      orderNote: "",
      customerVisitStatus: null,
      orderType: "Dine In",
      tableId: undefined,
      tableLabel: undefined,
    });
    Alert.alert("Pesanan Ditahan", `Pesanan "${label}" telah ditahan.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  async function handlePay() {
    if (cart.length === 0) return;
    if (!validateCustomerInfo()) return;
    if (orderType === "Dine In" && !selectedTable) {
      Alert.alert("Pilih meja dulu", "Order dine-in wajib memilih meja aktif sebelum pembayaran.");
      return;
    }

    const tableLabel =
      selectedTable?.label ||
      (orderType === "Dine In"
        ? "Dine In"
        : orderType === "Take Away"
          ? "Takeaway"
          : "Delivery");
    const resolvedCustomerName = customerVisitStatus === "new" ? customerName : "";

    if (isPostPay) {
      try {
        await checkoutMutation.mutateAsync(
          buildCheckoutOrderBody({
            cart,
            orderType: orderType === "Dine In" ? "DINE_IN" : orderType === "Take Away" ? "TAKEAWAY" : "DELIVERY",
            tableId: selectedTable?.id,
            customerName: resolvedCustomerName,
            customerPhone,
            orderNote,
            tableLabel,
            promoCode: promoEnabled ? appliedPromo?.code : undefined,
            promoId: promoEnabled ? appliedPromo?.promoId : undefined,
          }),
        );
        setCart([]);
        setOrderDraft({ customerName: "", customerPhone: "", orderNote: "", customerVisitStatus: null, orderType: "Dine In", tableId: undefined, tableLabel: undefined });
        Alert.alert("Pesanan Masuk Dapur", `Meja ${tableLabel} — bayar setelah selesai makan.`, [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch (error) {
        Alert.alert("Gagal", getApiErrorMessage(error, "Transaksi tidak berhasil dikirim ke server."));
      }
      return;
    }

    setCartSnapshot([...cart]);
    const orderId = `#ORD-${String(posOrders.length + 1).padStart(4, "0")}`;

    const order = buildPosOrderFromCart({
      orderId,
      shiftId: shiftData?.shiftId,
      cart,
      tableId: selectedTable?.id,
      customerName: resolvedCustomerName,
      customerPhone,
      orderNote,
      tableLabel,
      orderType,
      discountAmount: discount,
      taxAmount: ppn,
      grandTotal: total,
      promoCode: promoEnabled ? appliedPromo?.code : undefined,
      promoId: promoEnabled ? appliedPromo?.promoId : undefined,
    });

    setPosOrders((prev) => [order, ...prev]);
    setOrderDraft({
      customerName: resolvedCustomerName,
      customerPhone,
      orderNote,
      customerVisitStatus,
      orderType,
      tableId: selectedTable?.id,
      tableLabel: selectedTable?.label,
    });

    router.push({
      pathname: "/pilih-pembayaran",
      params: {
        orderId,
      },
    });
  }

  const trashBtn = (
    <TouchableOpacity activeOpacity={0.7} onPress={handleClearCart}>
      <View style={styles.trashBtn}>
        <Ionicons
          name="trash-outline"
          size={18}
          color={ColorDanger.danger600}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Keranjang"
        subtitle={`${totalItems} item`}
        showBack
        onBack={() => router.back()}
        actions={trashBtn}
        maxWidth={contentMaxWidth}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <XStack
          flex={1}
          gap={0}
          flexDirection={isTablet ? "row" : "column"}
          style={[
            styles.shell,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <ScrollView
            style={[styles.tabletLeft, !isTablet && styles.stackPanel]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          >
          <CartItemsCard
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            onUpdateNote={handleUpdateNote}
          />
        </ScrollView>

        {isTablet ? <View style={styles.tabletDivider} /> : null}

        <ScrollView
          style={[styles.tabletRight, !isTablet && styles.stackPanel]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        >
          <YStack gap={12}>
            <CustomerInfoCard
              customerVisitStatus={customerVisitStatus}
              onCustomerVisitStatusChange={setCustomerVisitStatus}
              customerName={customerName}
              onCustomerNameChange={setCustomerName}
              customerPhone={customerPhone}
              onCustomerPhoneChange={setCustomerPhone}
              orderNote={orderNote}
              onOrderNoteChange={setOrderNote}
              orderType={orderType}
              onOrderTypeChange={setOrderType}
              selectedTableId={selectedTable?.id}
              selectedTableLabel={selectedTable?.label}
              tables={tables}
              isTablesLoading={isTablesLoading}
              onSelectTable={setSelectedTable}
            />

            <PromoCard
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
              onApplyPromo={() => { void handleApplyPromo(); }}
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

            <YStack gap={8}>
              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                title="Bayar Sekarang"
                disabled={cart.length === 0}
                onPress={handlePay}
                icon={
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color={ColorBase.white}
                  />
                }
              />
              <AppButton
                variant="outline"
                size="md"
                fullWidth
                title="Tahan Pesanan"
                disabled={cart.length === 0}
                onPress={handleHoldOrder}
                icon={
                  <Ionicons
                    name="pause-circle-outline"
                    size={16}
                    color={ColorPrimary.primary600}
                  />
                }
              />
            </YStack>
          </YStack>
        </ScrollView>
      </XStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  keyboardAvoid: {
    flex: 1,
  },
  shell: {
    width: "100%",
    alignSelf: "center",
    flex: 1,
  },
  trashBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ColorDanger.danger50,
    alignItems: "center",
    justifyContent: "center",
  },
  tabletLeft: {
    flex: 0.55,
    backgroundColor: ColorBase.bgScreen,
  },
  tabletDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  tabletRight: {
    flex: 0.45,
    backgroundColor: ColorBase.white,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  stackPanel: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
});
