# Input Manual Cart Panel UX Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pindahkan form info pelanggan dari CartPanel ke sebuah `OrderInfoSheet` (modal) yang muncul saat kasir tekan "Lanjut Bayar" atau "Tahan Order", agar panel kanan tidak perlu di-scroll.

**Architecture:** Buat komponen `OrderInfoSheet` baru yang membungkus `CustomerInfoCard` yang sudah ada dalam sebuah `Modal` + `KeyboardAvoidingView` + `ScrollView`. `CartPanel` tidak lagi merender `CustomerInfoCard` secara langsung — state customer info tetap di `CartPanel` agar persisten selama sesi dan dapat dipakai oleh kedua aksi (bayar & tahan). Tombol "Lanjut Bayar" dan "Tahan Order" masing-masing membuka sheet dengan `mode="pay"` atau `mode="hold"`.

**Tech Stack:** React Native `Modal`, `KeyboardAvoidingView`, `ScrollView` (semua built-in RN), TypeScript. Tidak ada dependensi baru.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/features/transactions/components/transaksi-baru/OrderInfoSheet.tsx` | Modal sheet berisi form info order |
| Modify | `src/features/transactions/components/transaksi-baru/CartPanel.tsx` | Hapus CustomerInfoCard, tambah trigger sheet |
| Modify | `src/features/transactions/components/transaksi-baru/index.ts` | Export OrderInfoSheet |

---

## Task 1: Buat komponen `OrderInfoSheet`

**Files:**
- Create: `src/features/transactions/components/transaksi-baru/OrderInfoSheet.tsx`

- [ ] **Step 1.1: Buat file `OrderInfoSheet.tsx` dengan struktur awal**

```tsx
// src/features/transactions/components/transaksi-baru/OrderInfoSheet.tsx
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { TextBodyLg, TextH3 } from "@/components";
import {
  CustomerInfoCard,
  type CustomerInfoValidationErrors,
  type CustomerVisitStatus,
} from "@/features/cart";
import { ColorBase, ColorNeutral, ColorSurface } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import type { KasirTable } from "@/lib/api/types";
import type { OrderType } from "@/types";

interface OrderInfoSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onHold?: () => void;
  mode?: "pay" | "hold";

  customerVisitStatus: CustomerVisitStatus | null;
  onCustomerVisitStatusChange: (v: CustomerVisitStatus) => void;
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (v: string) => void;
  orderNote: string;
  onOrderNoteChange: (v: string) => void;
  orderType: OrderType;
  onOrderTypeChange: (v: OrderType) => void;
  selectedTableId?: string;
  selectedTableLabel?: string;
  tables: KasirTable[];
  isTablesLoading: boolean;
  onSelectTable: (table: KasirTable) => void;
  validationErrors: CustomerInfoValidationErrors;
}

export function OrderInfoSheet({
  visible,
  onClose,
  onConfirm,
  onHold,
  mode = "pay",
  customerVisitStatus,
  onCustomerVisitStatusChange,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  orderNote,
  onOrderNoteChange,
  orderType,
  onOrderTypeChange,
  selectedTableId,
  selectedTableLabel,
  tables,
  isTablesLoading,
  onSelectTable,
  validationErrors,
}: OrderInfoSheetProps) {
  const isPay = mode === "pay";
  const confirmLabel = isPay ? "Konfirmasi & Bayar" : "Tahan Order";

  function handleConfirm() {
    if (isPay) {
      onConfirm();
    } else {
      onHold?.();
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        pointerEvents="box-none"
      >
        <View style={styles.sheet}>
          {/* Drag handle dekoratif */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <TextH3 fontWeight="800" color={ColorNeutral.neutral900}>
              Info Order
            </TextH3>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={ColorNeutral.neutral500} />
            </TouchableOpacity>
          </View>

          {/* Scrollable form */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.scrollContent}
          >
            <CustomerInfoCard
              customerVisitStatus={customerVisitStatus}
              onCustomerVisitStatusChange={onCustomerVisitStatusChange}
              customerName={customerName}
              onCustomerNameChange={onCustomerNameChange}
              customerPhone={customerPhone}
              onCustomerPhoneChange={onCustomerPhoneChange}
              orderNote={orderNote}
              onOrderNoteChange={onOrderNoteChange}
              orderType={orderType}
              onOrderTypeChange={onOrderTypeChange}
              selectedTableId={selectedTableId}
              selectedTableLabel={selectedTableLabel}
              tables={tables}
              isTablesLoading={isTablesLoading}
              onSelectTable={onSelectTable}
              validationErrors={validationErrors}
            />
          </ScrollView>

          {/* Footer sticky */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.confirmBtn}
              onPress={handleConfirm}
            >
              <TextBodyLg fontWeight="800" color={ColorBase.white}>
                {confirmLabel}
              </TextBodyLg>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: "flex-end",
    pointerEvents: "box-none",
  },
  sheet: {
    backgroundColor: ColorBase.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: ColorSurface.border,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  dragHandle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: ColorNeutral.neutral200,
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: ColorSurface.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: ColorNeutral.neutral100,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: ColorSurface.border,
    backgroundColor: ColorBase.white,
  },
  confirmBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: BrandColors.buttonSolid,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

- [ ] **Step 1.2: Pastikan file tersimpan dengan benar (tidak ada error TypeScript obvious)**

Jalankan:
```bash
npx tsc --noEmit 2>&1 | grep "OrderInfoSheet" | head -20
```

Tidak ada output = tidak ada error di file baru ini. Lanjut ke task berikutnya.

---

## Task 2: Update `CartPanel.tsx`

**Files:**
- Modify: `src/features/transactions/components/transaksi-baru/CartPanel.tsx`

Perubahan yang dilakukan:
1. Tambah state `isOrderInfoSheetVisible` dan `orderInfoSheetMode`
2. Ubah `handlePay()` → buka sheet dengan `mode="pay"` instead of langsung checkout
3. Ubah `handleHoldOrder()` → buka sheet dengan `mode="hold"` instead of langsung hold
4. Tambah `handleConfirmPay()` dan `handleConfirmHold()` (logika checkout/hold yang sudah ada, dipindah dari `handlePay`/`handleHoldOrder`)
5. Hapus `<CustomerInfoCard ... />` dari JSX
6. Tambah `<OrderInfoSheet ... />` ke JSX
7. Hapus import `CustomerInfoCard`

- [ ] **Step 2.1: Tambah state baru di `CartPanel`**

Di dalam `CartPanel` function, setelah baris `const [validationErrors, setValidationErrors] = useState<CustomerInfoValidationErrors>({});` (sekitar baris 78), tambah:

```ts
const [isOrderInfoSheetVisible, setIsOrderInfoSheetVisible] = useState(false);
const [orderInfoSheetMode, setOrderInfoSheetMode] = useState<"pay" | "hold">("pay");
```

- [ ] **Step 2.2: Ubah `handlePay()` menjadi dua fungsi terpisah**

**Ganti** fungsi `handlePay()` yang ada (baris 253–334) dengan:

```ts
// Membuka sheet untuk alur bayar
function handleOpenPaySheet() {
  if (cart.length === 0) return;
  setOrderInfoSheetMode("pay");
  setIsOrderInfoSheetVisible(true);
}

// Dipanggil dari OrderInfoSheet saat mode="pay" di-confirm
async function handleConfirmPay() {
  if (cart.length === 0) return;
  if (!validateCustomerInfo()) return;

  setCartSnapshot([...cart]);
  const orderId = `#ORD-${String(posOrders.length + 1).padStart(4, "0")}`;
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
          orderType: mapOrderTypeToServiceMode(orderType),
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
      setOrderDraft({
        customerName: "",
        customerPhone: "",
        orderNote: "",
        customerVisitStatus: null,
        orderType: "Dine In",
        tableId: undefined,
        tableLabel: undefined,
      });
      setIsOrderInfoSheetVisible(false);
      Alert.alert("Pesanan Masuk Dapur", `Meja ${tableLabel} — bayar setelah selesai makan.`);
    } catch (error) {
      Alert.alert("Gagal", getApiErrorMessage(error, "Transaksi tidak berhasil dikirim ke server."));
    }
    return;
  }

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

  setIsOrderInfoSheetVisible(false);
  router.push({
    pathname: "/pilih-pembayaran",
    params: { orderId },
  });
}
```

- [ ] **Step 2.3: Ubah `handleHoldOrder()` menjadi dua fungsi terpisah**

**Ganti** fungsi `handleHoldOrder()` yang ada (baris 207–251) dengan:

```ts
// Membuka sheet untuk alur tahan order
function handleOpenHoldSheet() {
  if (cart.length === 0) return;
  setOrderInfoSheetMode("hold");
  setIsOrderInfoSheetVisible(true);
}

// Dipanggil dari OrderInfoSheet saat mode="hold" di-confirm
function handleConfirmHold() {
  if (cart.length === 0) return;
  if (!validateCustomerInfo()) return;

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
  setIsOrderInfoSheetVisible(false);
  Alert.alert("Pesanan Ditahan", `Pesanan "${label}" telah ditahan.`);
}
```

- [ ] **Step 2.4: Update `BottomActionBar` props di JSX**

Cari baris `<BottomActionBar` (sekitar baris 436) dan ubah props `onHoldOrder` dan `onPay`:

```tsx
<BottomActionBar
  cartLength={cart.length}
  onHoldOrder={handleOpenHoldSheet}
  onPay={handleOpenPaySheet}
  compact={compact}
/>
```

- [ ] **Step 2.5: Hapus `<CustomerInfoCard ... />` dari JSX**

Hapus seluruh blok `<CustomerInfoCard ... />` (dari `<CustomerInfoCard` sampai `/>` penutupnya, termasuk semua props). Ini ada di dalam `<YStack>` di dalam `<ScrollView>`.

- [ ] **Step 2.6: Tambah `<OrderInfoSheet ... />` ke JSX**

Tepat sebelum tag `</SafeAreaView>` penutup (atau setelah `<VariantSheet ... />` kalau ini bukan CartPanel standalone), tambah:

```tsx
<OrderInfoSheet
  visible={isOrderInfoSheetVisible}
  onClose={() => setIsOrderInfoSheetVisible(false)}
  onConfirm={() => { void handleConfirmPay(); }}
  onHold={handleConfirmHold}
  mode={orderInfoSheetMode}
  customerVisitStatus={customerVisitStatus}
  onCustomerVisitStatusChange={(value) => {
    setCustomerVisitStatus(value);
    setValidationErrors((prev) => ({ ...prev, visitStatus: undefined }));
  }}
  customerName={customerName}
  onCustomerNameChange={(value) => {
    setCustomerName(value);
    setValidationErrors((prev) => ({ ...prev, customerName: undefined }));
  }}
  customerPhone={customerPhone}
  onCustomerPhoneChange={(value) => {
    setCustomerPhone(value);
    setValidationErrors((prev) => ({ ...prev, customerPhone: undefined }));
  }}
  orderNote={orderNote}
  onOrderNoteChange={setOrderNote}
  orderType={orderType}
  onOrderTypeChange={(value) => {
    setOrderType(value);
    setValidationErrors((prev) => ({ ...prev, table: undefined }));
  }}
  selectedTableId={selectedTable?.id}
  selectedTableLabel={selectedTable?.label}
  tables={tables}
  isTablesLoading={isTablesLoading}
  onSelectTable={(table) => {
    setSelectedTable(table);
    setValidationErrors((prev) => ({ ...prev, table: undefined }));
  }}
  validationErrors={validationErrors}
/>
```

**Catatan penting:** `CartPanel` dipakai di dua tempat — sebagai komponen standalone (non-compact) dan di `TransactionEntryTabletScreen` (compact). `OrderInfoSheet` di atas ditempatkan di akhir return JSX `CartPanel`, sehingga berlaku di kedua konteks. Pastikan tidak ada duplikasi penempatan.

- [ ] **Step 2.7: Hapus import `CustomerInfoCard` dan tambah import `OrderInfoSheet`**

Di bagian import, hapus:
```ts
import {
  BottomActionBar,
  CartItemsCard,
  CustomerInfoCard,
  type CustomerInfoValidationErrors,
  PriceSummaryCard,
  PromoCard,
} from "@/features/cart";
```

Ganti dengan:
```ts
import {
  BottomActionBar,
  CartItemsCard,
  type CustomerInfoValidationErrors,
  PriceSummaryCard,
  PromoCard,
} from "@/features/cart";
import { OrderInfoSheet } from "./OrderInfoSheet";
```

---

## Task 3: Update barrel export

**Files:**
- Modify: `src/features/transactions/components/transaksi-baru/index.ts`

- [ ] **Step 3.1: Tambah export `OrderInfoSheet`**

Tambah baris berikut ke `src/features/transactions/components/transaksi-baru/index.ts`:

```ts
export { OrderInfoSheet } from "./OrderInfoSheet";
```

File akhir seharusnya:
```ts
export { CatalogSearchToolbar } from "./CatalogSearchToolbar";
export { CartBar } from "./CartBar";
export { CartIconButton } from "./CartIconButton";
export { CartPanel } from "./CartPanel";
export { OrderInfoSheet } from "./OrderInfoSheet";
export { ProductGrid } from "./ProductGrid";
export { SearchBar } from "./SearchBar";
export { VariantSheet } from "./VariantSheet";
```

---

## Task 4: Verifikasi TypeScript & runtime

- [ ] **Step 4.1: Jalankan type check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: tidak ada error. Jika ada error, baca pesannya dan perbaiki — paling umum adalah nama prop typo atau type mismatch.

- [ ] **Step 4.2: Jalankan app di emulator Android**

```bash
npx expo start --android
```

Buka tab "Input Manual". Verifikasi:
1. Panel kanan (Keranjang) tidak lagi menampilkan form info pelanggan — hanya item list, promo, dan total.
2. Tap "Lanjut Bayar" → sheet muncul dari bawah dengan animasi slide.
3. Tap di area gelap di luar sheet → sheet tertutup.
4. Isi nomor HP → keyboard muncul → form tidak tertutup keyboard (scroll berfungsi).
5. Tap "Konfirmasi & Bayar" tanpa isi field → error muncul inline di sheet, sheet tidak tutup.
6. Isi semua field dengan benar → tap "Konfirmasi & Bayar" → navigasi ke halaman pembayaran.
7. Tap "Tahan Order" → sheet muncul dengan tombol "Tahan Order".
8. Isi field → tap "Tahan Order" → sheet tutup, alert "Pesanan Ditahan" muncul, keranjang kosong.

- [ ] **Step 4.3: Verifikasi di iOS Simulator (jika tersedia)**

```bash
npx expo start --ios
```

Verifikasi khusus iOS:
- Keyboard behavior `"padding"` bekerja — sheet naik saat keyboard muncul.
- Sheet tidak terpotong di bawah safe area (sudah di-handle oleh `paddingBottom: 28` di footer iOS).

- [ ] **Step 4.4: Commit**

```bash
git add src/features/transactions/components/transaksi-baru/OrderInfoSheet.tsx
git add src/features/transactions/components/transaksi-baru/CartPanel.tsx
git add src/features/transactions/components/transaksi-baru/index.ts
git commit -m "feat(kasir): move customer info form to OrderInfoSheet bottom modal"
```

---

## Checklist Spec Coverage

| Requirement | Task |
|-------------|------|
| CartPanel hanya tampilkan items, promo, total — tidak ada scroll panjang | Task 2 (hapus CustomerInfoCard) |
| Sheet muncul saat "Lanjut Bayar" | Task 2 step 2.2 + 2.4 |
| Sheet muncul saat "Tahan Order" | Task 2 step 2.3 + 2.4 |
| Sheet animasi slide dari bawah | Task 1 (`animationType="slide"`) |
| Keyboard tidak menutupi input | Task 1 (`KeyboardAvoidingView` + `ScrollView`) |
| Validasi tetap berjalan, error inline di sheet | Task 2 step 2.2/2.3 (validateCustomerInfo tetap dipanggil) |
| Sheet tidak tutup jika validasi gagal | Task 2 (tidak ada `setIsOrderInfoSheetVisible(false)` saat gagal) |
| mode="pay" → tombol "Konfirmasi & Bayar" | Task 1 step 1.1 |
| mode="hold" → tombol "Tahan Order" | Task 1 step 1.1 |
| State customer info persisten di CartPanel | Task 2 (state tidak dipindah) |
| Tidak ada dependensi baru | Task 1 (hanya RN built-ins) |
