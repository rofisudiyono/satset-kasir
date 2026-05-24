import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtom } from "jotai";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { TextBodyLg, TextBodySm, TextCaption, TextH2, TextH3 } from "@/components";
import {
  cartAtom,
  cartCheckoutContextAtom,
  cartOrderDraftAtom,
  cartSnapshotAtom,
  CustomerInfoCard,
  type CustomerInfoValidationErrors,
  type CustomerVisitStatus,
  heldOrdersAtom,
  PriceSummaryCard,
} from "@/features/cart";
import {
  buildCheckoutOrderBody,
  buildPosOrderFromCart,
  mapOrderTypeToServiceMode,
} from "@/features/pos/pos.utils";
import { posOrdersAtom } from "@/features/pos/store/pos.store";
import { shiftDataAtom } from "@/features/shift/store/shift.store";
import {
  useCheckoutMutation,
  useTablesQuery,
  useTaxSettingsQuery,
  useTenantInfoQuery,
} from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { getApiErrorMessage } from "@/lib/api/client";
import type { KasirTable } from "@/lib/api/types";
import { getInputManualRoute } from "@/lib/routing/device-routes";
import { calculateTaxBreakdown } from "@/lib/tax";
import { BrandColors } from "@/themes/brand";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSurface } from "@/themes/Colors";
import type { OrderType } from "@/types";
import { formatPrice } from "@/utils";

type OrderInfoMode = "pay" | "hold";

export default function OrderInfoPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { width } = useWindowDimensions();
  const { isTablet } = useResponsiveLayout();
  const mode: OrderInfoMode = params.mode === "hold" ? "hold" : "pay";
  const isPay = mode === "pay";
  const isSplit = width >= 900;

  const [cart, setCart] = useAtom(cartAtom);
  const [orderDraft, setOrderDraft] = useAtom(cartOrderDraftAtom);
  const [checkoutContext] = useAtom(cartCheckoutContextAtom);
  const [, setCartSnapshot] = useAtom(cartSnapshotAtom);
  const [, setHeldOrders] = useAtom(heldOrdersAtom);
  const [posOrders, setPosOrders] = useAtom(posOrdersAtom);
  const [shiftData] = useAtom(shiftDataAtom);
  const [validationErrors, setValidationErrors] =
    React.useState<CustomerInfoValidationErrors>({});

  const { data: tables = [], isLoading: isTablesLoading } = useTablesQuery(true);
  const { data: tenantInfo } = useTenantInfoQuery(Boolean(shiftData?.shiftId));
  const { data: taxSettings } = useTaxSettingsQuery(Boolean(shiftData?.shiftId));
  const checkoutMutation = useCheckoutMutation();

  const selectedTable = React.useMemo(
    () => tables.find((table: KasirTable) => table.id === orderDraft.tableId) ?? null,
    [orderDraft.tableId, tables],
  );
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount =
    checkoutContext.appliedPromo && checkoutContext.promoEnabled
      ? checkoutContext.appliedPromo.discount
      : 0;
  const taxBreakdown = calculateTaxBreakdown(taxSettings, subtotal - discount);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  function updateDraft(patch: Partial<typeof orderDraft>) {
    setOrderDraft((prev) => ({ ...prev, ...patch }));
  }

  function validateCustomerInfo() {
    const nextErrors: CustomerInfoValidationErrors = {};
    if (!orderDraft.customerVisitStatus) {
      nextErrors.visitStatus = "Pilih status pelanggan sebelum melanjutkan.";
    }
    if (!orderDraft.customerPhone.trim()) {
      nextErrors.customerPhone = "Nomor HP wajib diisi.";
    }
    if (orderDraft.customerVisitStatus === "new" && !orderDraft.customerName.trim()) {
      nextErrors.customerName = "Nama pelanggan baru wajib diisi.";
    }
    if (orderDraft.orderType === "Dine In" && !orderDraft.tableId) {
      nextErrors.table = "Pilih meja aktif untuk order dine-in.";
    }
    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function resetOrderDraft() {
    setOrderDraft({
      customerName: "",
      customerPhone: "",
      orderNote: "",
      customerVisitStatus: null,
      orderType: "Dine In",
      tableId: undefined,
      tableLabel: undefined,
    });
  }

  function handleConfirmHold() {
    if (cart.length === 0) return;
    if (!validateCustomerInfo()) return;

    const resolvedCustomerName =
      orderDraft.customerVisitStatus === "new" ? orderDraft.customerName : "";
    const label =
      resolvedCustomerName ||
      orderDraft.customerPhone ||
      orderDraft.tableLabel ||
      orderDraft.orderType;
    const createdAt = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setHeldOrders((prev) => [
      {
        id: `hold-${Date.now()}`,
        items: [...cart],
        customerName: resolvedCustomerName,
        customerPhone: orderDraft.customerPhone,
        orderNote: orderDraft.orderNote,
        customerVisitStatus: orderDraft.customerVisitStatus ?? "returning",
        tableId: orderDraft.tableId,
        tableLabel: orderDraft.tableLabel,
        tableNumber: orderDraft.tableLabel ?? "",
        orderType: orderDraft.orderType,
        createdAt,
        label,
      },
      ...prev,
    ]);
    setCart([]);
    resetOrderDraft();
    Alert.alert("Pesanan Ditahan", `Pesanan "${label}" telah ditahan.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  async function handleConfirmPay() {
    if (cart.length === 0) return;
    if (!validateCustomerInfo()) return;

    const tableLabel =
      orderDraft.tableLabel ||
      (orderDraft.orderType === "Dine In"
        ? "Dine In"
        : orderDraft.orderType === "Take Away"
          ? "Takeaway"
          : "Delivery");
    const resolvedCustomerName =
      orderDraft.customerVisitStatus === "new" ? orderDraft.customerName : "";

    if (tenantInfo?.defaultPaymentTiming === "POSTPAY") {
      try {
        await checkoutMutation.mutateAsync(
          buildCheckoutOrderBody({
            cart,
            orderType: mapOrderTypeToServiceMode(orderDraft.orderType),
            tableId: orderDraft.tableId,
            customerName: resolvedCustomerName,
            customerPhone: orderDraft.customerPhone,
            orderNote: orderDraft.orderNote,
            tableLabel,
            promoCode: checkoutContext.promoEnabled
              ? checkoutContext.appliedPromo?.code
              : undefined,
            promoId: checkoutContext.promoEnabled
              ? checkoutContext.appliedPromo?.promoId
              : undefined,
          }),
        );
        setCart([]);
        resetOrderDraft();
        Alert.alert("Pesanan Masuk Dapur", `Meja ${tableLabel} - bayar setelah selesai makan.`, [
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
      tableId: orderDraft.tableId,
      customerName: resolvedCustomerName,
      customerPhone: orderDraft.customerPhone,
      orderNote: orderDraft.orderNote,
      tableLabel,
      orderType: orderDraft.orderType,
      discountAmount: discount,
      taxAmount: taxBreakdown.taxAmount,
      grandTotal: taxBreakdown.grandTotal,
      promoCode: checkoutContext.promoEnabled
        ? checkoutContext.appliedPromo?.code
        : undefined,
      promoId: checkoutContext.promoEnabled
        ? checkoutContext.appliedPromo?.promoId
        : undefined,
    });

    setPosOrders((prev) => [order, ...prev]);
    router.replace({
      pathname: "/pilih-pembayaran",
      params: { orderId },
    });
  }

  function handleConfirm() {
    if (isPay) {
      void handleConfirmPay();
      return;
    }
    handleConfirmHold();
  }

  function handleBackToInputManual() {
    router.replace(getInputManualRoute(isTablet) as never);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.75} onPress={handleBackToInputManual} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={ColorNeutral.neutral900} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <TextCaption color={ColorPrimary.primary700} fontWeight="800">
              {isPay ? "LANJUT BAYAR" : "TAHAN ORDER"}
            </TextCaption>
            <TextH2 fontWeight="800" color={ColorNeutral.neutral900}>
              Info Order
            </TextH2>
            <TextBodySm color={ColorNeutral.neutral500}>
              {totalItems} item dalam keranjang
            </TextBodySm>
          </View>
        </View>

        <View style={[styles.content, isSplit && styles.contentSplit]}>
          <ScrollView
            style={[styles.summaryPane, isSplit && styles.summaryPaneSplit]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.summaryContent}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <TextCaption color={ColorPrimary.primary700} fontWeight="800">
                    SUMMARY ORDER
                  </TextCaption>
                  <TextH3 fontWeight="800" color={ColorNeutral.neutral900}>
                    Keranjang
                  </TextH3>
                </View>
                <View style={styles.itemBadge}>
                  <TextBodySm fontWeight="800" color={ColorPrimary.primary700}>
                    {totalItems} item
                  </TextBodySm>
                </View>
              </View>

              <YStack gap={10}>
                {cart.map((item) => (
                  <View key={item.cartId} style={styles.orderRow}>
                    <View style={styles.qtyBadge}>
                      <TextBodySm fontWeight="800" color={ColorPrimary.primary700}>
                        {item.quantity}x
                      </TextBodySm>
                    </View>
                    <View style={styles.orderMeta}>
                      <TextBodyLg fontWeight="800" color={ColorNeutral.neutral900} numberOfLines={2}>
                        {item.productName}
                      </TextBodyLg>
                      {item.variantLabel || item.note ? (
                        <TextCaption color={ColorNeutral.neutral500} numberOfLines={2}>
                          {[item.variantLabel, item.note].filter(Boolean).join(" - ")}
                        </TextCaption>
                      ) : null}
                    </View>
                    <TextBodySm fontWeight="800" color={ColorNeutral.neutral900}>
                      {formatPrice(item.unitPrice * item.quantity)}
                    </TextBodySm>
                  </View>
                ))}
              </YStack>
            </View>

            <PriceSummaryCard
              subtotal={subtotal}
              discount={discount}
              ppn={taxBreakdown.taxAmount}
              total={taxBreakdown.grandTotal}
              taxLabel={taxSettings?.label ?? "PPN"}
              taxRate={taxBreakdown.rate}
            />
          </ScrollView>

          <ScrollView
            style={[styles.formPane, isSplit && styles.formPaneSplit]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.formContent}
          >
            <CustomerInfoCard
              customerVisitStatus={orderDraft.customerVisitStatus}
              onCustomerVisitStatusChange={(value: CustomerVisitStatus) => {
                updateDraft({
                  customerVisitStatus: value,
                  customerName: value === "returning" ? "" : orderDraft.customerName,
                });
                setValidationErrors((prev) => ({ ...prev, visitStatus: undefined }));
              }}
              customerName={orderDraft.customerName}
              onCustomerNameChange={(value) => {
                updateDraft({ customerName: value });
                setValidationErrors((prev) => ({ ...prev, customerName: undefined }));
              }}
              customerPhone={orderDraft.customerPhone}
              onCustomerPhoneChange={(value) => {
                updateDraft({ customerPhone: value });
                setValidationErrors((prev) => ({ ...prev, customerPhone: undefined }));
              }}
              orderNote={orderDraft.orderNote}
              onOrderNoteChange={(value) => updateDraft({ orderNote: value })}
              orderType={orderDraft.orderType}
              onOrderTypeChange={(value: OrderType) => {
                updateDraft({
                  orderType: value,
                  tableId: value === "Dine In" ? orderDraft.tableId : undefined,
                  tableLabel: value === "Dine In" ? orderDraft.tableLabel : undefined,
                });
                setValidationErrors((prev) => ({ ...prev, table: undefined }));
              }}
              selectedTableId={orderDraft.tableId}
              selectedTableLabel={selectedTable?.label ?? orderDraft.tableLabel}
              tables={tables}
              isTablesLoading={isTablesLoading}
              onSelectTable={(table) => {
                updateDraft({ tableId: table.id, tableLabel: table.label });
                setValidationErrors((prev) => ({ ...prev, table: undefined }));
              }}
              validationErrors={validationErrors}
            />
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.86}
            disabled={cart.length === 0}
            onPress={handleConfirm}
            style={[styles.confirmBtn, cart.length === 0 && styles.confirmBtnDisabled]}
          >
            <Ionicons
              name={isPay ? "card-outline" : "pause-circle-outline"}
              size={20}
              color={ColorBase.white}
            />
            <TextBodyLg fontWeight="800" color={ColorBase.white}>
              {isPay ? "Konfirmasi & Bayar" : "Tahan Order"}
            </TextBodyLg>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
  keyboardWrap: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: BrandColors.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: ColorBase.white,
    borderWidth: 1,
    borderColor: ColorSurface.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    flex: 1,
  },
  contentSplit: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
  },
  summaryPane: {
    flex: 1,
  },
  summaryPaneSplit: {
    flex: 0.36,
  },
  summaryContent: {
    gap: 14,
    padding: 16,
    paddingBottom: 96,
  },
  formPane: {
    flex: 1,
  },
  formPaneSplit: {
    flex: 0.64,
  },
  formContent: {
    padding: 16,
    paddingBottom: 96,
  },
  summaryCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorSurface.border,
    shadowColor: ColorSurface.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  itemBadge: {
    borderRadius: 999,
    backgroundColor: BrandColors.tint,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: ColorNeutral.neutral100,
  },
  qtyBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.tint,
  },
  orderMeta: {
    flex: 1,
    minWidth: 0,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    backgroundColor: ColorBase.white,
    borderTopWidth: 1,
    borderTopColor: ColorSurface.border,
  },
  confirmBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: BrandColors.buttonSolid,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
});
