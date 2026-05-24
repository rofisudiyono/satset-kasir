# Spec: Input Manual — Cart Panel UX Redesign

**Date:** 2026-05-24  
**Status:** Approved  
**Scope:** Tablet layout only (`TransactionEntryTabletScreen`)

---

## Problem

`CartPanel` saat ini memuat terlalu banyak konten dalam satu `ScrollView`:
`CartItemsCard` → `CustomerInfoCard` (form panjang) → `PromoCard` → `PriceSummaryCard` → `BottomActionBar`.

Kasir harus scroll panjang di panel kanan untuk mengisi info pelanggan, padahal alur kerja alami adalah: **pilih menu dulu → isi info pelanggan di akhir sebelum bayar**.

---

## Solusi: OrderInfoSheet (Modal + KeyboardAvoidingView)

Saat kasir menekan "Lanjut Bayar", muncul sebuah **modal sheet** yang berisi form info order. Panel kanan (CartPanel) menjadi bersih — hanya menampilkan item, promo, dan ringkasan harga.

Library: **React Native `Modal`** (bukan `@gorhom/bottom-sheet`). Konsisten dengan `VariantSheet` yang sudah ada di `src/features/transactions/components/transaksi-baru/VariantSheet.tsx`.

---

## Perubahan File

### 1. `CartPanel.tsx` — `src/features/transactions/components/transaksi-baru/CartPanel.tsx`

**Hapus** dari JSX:
- `<CustomerInfoCard ... />` dan semua props terkait

**Tambah** state baru:
```ts
const [isOrderInfoSheetVisible, setIsOrderInfoSheetVisible] = useState(false);
```

**Ubah** `handlePay()` dan `handleHoldOrder()`:
- Keduanya tidak lagi memanggil `validateCustomerInfo()` secara langsung.
- "Lanjut Bayar" → set `isOrderInfoSheetVisible(true)` (buka sheet).
- "Tahan Order" → tetap validasi dan proses langsung (tidak perlu sheet, karena hold tidak memerlukan navigasi ke pembayaran). Namun `validateCustomerInfo()` masih dibutuhkan untuk hold — state customer info tetap ada di CartPanel.

**Tambah** komponen di JSX:
```tsx
<OrderInfoSheet
  visible={isOrderInfoSheetVisible}
  onClose={() => setIsOrderInfoSheetVisible(false)}
  onConfirm={handlePay}
  // semua props customer info (lihat section 2)
  ...
/>
```

**Pertahankan** semua state customer info di `CartPanel` (tidak dipindah ke sheet), karena:
- "Tahan Order" masih butuh data tersebut.
- State persisten selama sesi (kasir bisa buka-tutup sheet tanpa kehilangan data).

**Hapus** import `CustomerInfoCard` dari file ini.

---

### 2. `OrderInfoSheet.tsx` — file baru

**Path:** `src/features/transactions/components/transaksi-baru/OrderInfoSheet.tsx`

**Props interface:**
```ts
interface OrderInfoSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;

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
```

**Struktur JSX:**
```
Modal (animationType="slide", transparent=true, visible, onRequestClose=onClose)
  └─ View (modalBackdrop) — semi-transparent dark overlay, TouchableWithoutFeedback untuk dismiss keyboard
       └─ KeyboardAvoidingView
            behavior: "padding" (iOS) | "height" (Android)
            keyboardVerticalOffset: 0
            style: { flex: 1, justifyContent: "flex-end" }
            └─ View (sheetContainer)
                 borderRadius: 24 (top-left, top-right only)
                 backgroundColor: white
                 maxHeight: "85%"
                 └─ View (dragHandle) — dekoratif, 40x5px pill centered
                 └─ View (sheetHeader)
                      TextH3 "Info Order"
                      TouchableOpacity (X button, onPress=onClose)
                 └─ ScrollView
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle: paddingBottom cukup agar tidak tertutup tombol bawah
                      └─ CustomerInfoCard (reuse komponen existing)
                 └─ View (footer, sticky di bawah, di luar ScrollView)
                      TouchableOpacity "Konfirmasi & Bayar"
                        onPress: () => { onConfirm(); onClose(); }
                        disabled: isConfirmDisabled (cart kosong)
                        style: full-width, height 52, borderRadius 14, BrandColors.buttonSolid
```

**Keyboard handling detail:**
- `KeyboardAvoidingView` dengan `behavior="padding"` di iOS membuat sheet naik mengikuti keyboard.
- Di Android, gunakan `behavior="height"` atau `undefined` — test di emulator Android.
- `ScrollView` di dalam sheet memastikan item form yang di bawah tetap bisa di-scroll ke atas saat keyboard muncul.
- `keyboardShouldPersistTaps="handled"` agar tap di luar input tidak langsung dismiss sheet.

**Validasi:**
- Sheet menampilkan `validationErrors` yang dikirim dari parent (CartPanel).
- Saat "Konfirmasi & Bayar" ditekan, sheet memanggil `onConfirm()` yang memicu `handlePay()` di CartPanel.
- `handlePay()` di CartPanel tetap memanggil `validateCustomerInfo()` — jika gagal, error akan muncul di sheet melalui `validationErrors` state, dan sheet tidak tertutup.
- Sheet hanya tertutup (`onClose()`) setelah `handlePay()` berhasil (navigasi ke pembayaran terjadi, sheet otomatis unmount).

---

### 3. Barrel export update

**File:** `src/features/transactions/components/transaksi-baru/index.ts`

Tambah export:
```ts
export { OrderInfoSheet } from "./OrderInfoSheet";
```

---

## Alur Lengkap Setelah Perubahan

```
Kasir pilih menu → CartPanel (kanan) hanya tampilkan item + promo + total
→ Tekan "Lanjut Bayar"
→ OrderInfoSheet muncul dari bawah (slide animation)
→ Kasir isi: tipe order → pilih meja (Dine In) → status pelanggan → nomor HP → nama (kalau baru) → catatan (opsional)
→ Tekan "Konfirmasi & Bayar"
→ Validasi di CartPanel
  → Kalau gagal: error tampil di dalam sheet, sheet tidak tutup
  → Kalau berhasil: navigasi ke /pilih-pembayaran, sheet unmount
```

---

## Alur "Tahan Order" (tidak berubah signifikan)

- Tombol "Tahan Order" di CartPanel tetap memanggil `handleHoldOrder()` langsung (tidak buka sheet).
- `handleHoldOrder()` tetap memanggil `validateCustomerInfo()` — jika field belum diisi, error muncul.
- Karena `CustomerInfoCard` sudah dihapus dari CartPanel, perlu keputusan: **apakah "Tahan Order" juga buka sheet?**

  **Keputusan desain:** Ya — "Tahan Order" juga membuka `OrderInfoSheet`, tapi dengan `mode="hold"` sebagai prop tambahan optional. Jika `mode="hold"`, tombol footer sheet menjadi "Tahan Order" dan memanggil `onHold()` callback. Ini menghindari state tersembunyi yang tidak bisa diisi kasir.

  Tambah props ke `OrderInfoSheet`:
  ```ts
  mode?: "pay" | "hold";  // default: "pay"
  onHold?: () => void;
  ```

---

## Yang Tidak Berubah

- `CustomerInfoCard.tsx` — tidak dimodifikasi, dipakai ulang di dalam `OrderInfoSheet`.
- `CartItemsCard`, `PromoCard`, `PriceSummaryCard` — tidak berubah.
- `BottomActionBar` — tidak berubah.
- Phone screen (`TransactionEntryPhoneScreen`) — tidak dalam scope.
- Logika checkout, hold order, validasi — tidak berubah, hanya dipindah trigger-nya.

---

## Dependensi Baru

Tidak ada. Menggunakan `Modal` dari React Native (sudah tersedia), konsisten dengan `VariantSheet`.
