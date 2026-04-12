# Phase 0 — Contract Freeze & Source of Truth Audit

Dokumen ini adalah output eksekusi Phase 0 untuk alignment `satset-api`, `satset-dashboard`, dan `satset-kasir`.

Tujuan Phase 0:
- menetapkan source of truth tunggal;
- mengaudit flow lokal/legacy yang masih aktif;
- membekukan kontrak DTO yang akan dipakai pada Phase 1 dan seterusnya.

## 1. Keputusan Arsitektur

### 1.1 Single Source of Truth

Disepakati:
- `satset-api` adalah source of truth tunggal untuk:
  - `ingredient`
  - `stock movement`
  - `recipe`
  - `table`
  - `order checkout / queue`
  - `menu availability` produksi

Konsekuensi:
- `satset-dashboard` hanya menjadi admin client, bukan penyimpan data runtime sendiri.
- `satset-kasir` hanya menjadi POS client, bukan penentu availability/menu stock sendiri.
- local storage / MMKV hanya boleh dipakai untuk:
  - UI draft sementara
  - state presentasional/offline non-source-of-truth
  - cache client yang bisa di-refresh dari API

### 1.2 Yang Tidak Lagi Boleh Jadi Acuan Produksi

Tidak boleh lagi dianggap source of truth produksi:
- `satset-dashboard/src/features/catalog/data/recipesStore.ts`
- `satset-dashboard/src/features/pos/data/orderStockSync.ts`
- `satset-kasir/src/features/catalog/store/catalog.store.ts` untuk availability menu produksi
- input bebas `tableNumber` di kasir untuk order dine-in produksi

---

## 2. Audit Source of Truth Saat Ini

### 2.1 Recipe

Source benar saat ini:
- API admin recipe:
  - `/admin/catalog/recipes/:menuId`
  - file: `/Users/rofisudiyono/Documents/Project/satset-pos/satset-api/src/routes/admin/catalog/recipes.route.ts`

Consumer yang sudah benar:
- dashboard recipe page memakai:
  - `fetchAdminRecipe`
  - `replaceAdminRecipe`
  - file: `/Users/rofisudiyono/Documents/Project/satset-pos/satset-dashboard/src/pages/admin-tenant/katalog/resep-bom/page.tsx`

Consumer legacy yang masih ada:
- `satset-dashboard/src/features/catalog/data/recipesStore.ts`
- `satset-dashboard/src/features/pos/data/orderStockSync.ts`

Status keputusan:
- `recipesStore` ditandai `LEGACY`
- seluruh flow produksi recipe wajib pindah ke API

### 2.2 Ingredient & Stock

Source benar saat ini:
- `/admin/inventory/ingredients`
- `/admin/inventory/stock/adjustments`
- `/admin/inventory/stock/opnames`

Status:
- backend sudah menjadi source of truth inventory
- dashboard admin sudah mengonsumsi API

Catatan mismatch:
- `satset-kasir` masih menggunakan `catalogStockAtom` untuk membentuk status menu `normal/low/empty`
- ini boleh untuk cache/demo, tapi tidak boleh dipakai menentukan availability produksi

### 2.3 Table

Source benar saat ini:
- `/admin/tables`
- file: `/Users/rofisudiyono/Documents/Project/satset-pos/satset-api/src/routes/admin/operations/tables.route.ts`

Consumer yang sudah benar:
- dashboard table management:
  - `/Users/rofisudiyono/Documents/Project/satset-pos/satset-dashboard/src/features/operations/operations-api.ts`
  - `/Users/rofisudiyono/Documents/Project/satset-pos/satset-dashboard/src/pages/admin-tenant/operasional/cabang-meja/page.tsx`

Gap:
- `satset-kasir` belum punya consumer daftar meja aktif
- kasir masih pakai `tableNumber` text input

Status keputusan:
- free text meja untuk dine-in ditandai `LEGACY`
- phase berikutnya wajib ganti ke table picker backend

### 2.4 Checkout / Queue Order

Source benar saat ini:
- `/kasir/orders/queue`
- `/kasir/orders/checkout`
- validator:
  - `/Users/rofisudiyono/Documents/Project/satset-pos/satset-api/src/validators/transaction.validator.ts`

Catatan:
- backend sudah menerima `tableId` dan `tableLabel`
- backend belum enforce rule `dine-in wajib table valid` karena belum ada field `orderType`

Status keputusan:
- kontrak order akan dibekukan ulang untuk mendukung validasi dine-in vs takeaway secara eksplisit

---

## 3. Legacy Flow Yang Dibekukan

Berikut flow yang resmi dianggap legacy dan tidak boleh dijadikan acuan implementasi berikutnya:

### Dashboard
- `recipesStore` local storage recipe
- `orderStockSync` yang membaca recipe dari storage lokal

### Kasir
- `catalogStockAtom` sebagai penentu availability menu produksi
- `tableNumber` sebagai text input bebas untuk dine-in
- pembentukan label meja tanpa `tableId` valid

### Scope note
- legacy di atas tidak harus langsung dihapus di Phase 0
- tetapi semua task baru dilarang menambah dependency baru ke flow tersebut

---

## 4. DTO Contract Freeze

Di bawah ini adalah kontrak target yang dipakai untuk implementasi Phase 1.

## 4.1 `KasirMenu`

Status:
- kontrak existing di `satset-kasir/src/lib/api/types.ts` belum cukup untuk availability produksi

Kontrak final:

```ts
export type KasirMenuVariant = {
  id: string;
  name: string;
  price: number;
  sortOrder: number;
  isActive: boolean;
};

export type KasirMenu = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
  hasVariants: boolean;
  hasRecipe: boolean;
  isActive: boolean;
  isAvailable: boolean;
  availabilityReason: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "NO_RECIPE" | "HIDDEN";
  variants: KasirMenuVariant[];
};
```

Keputusan:
- `isAvailable` datang dari API
- frontend kasir tidak lagi menghitung sendiri availability produksi dari stock lokal
- variant inactive harus ikut ditandai di payload

## 4.2 `KasirTable`

Saat ini belum ada kontrak consumer kasir resmi.

Kontrak final:

```ts
export type KasirTable = {
  id: string;
  branchId: string;
  label: string;
  capacity: number | null;
  isActive: boolean;
};
```

Keputusan:
- kasir hanya mengonsumsi meja `isActive=true`
- `label` hanya untuk display
- `id` adalah referensi utama saat checkout

## 4.3 `OrderType`

Kontrak baru yang perlu dibekukan:

```ts
export type KasirOrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
```

Keputusan:
- `DINE_IN` wajib punya `tableId`
- `TAKEAWAY` dan `DELIVERY` tidak wajib `tableId`

## 4.4 `QueueOrderBody`

Kontrak existing belum eksplisit memisahkan dine-in/takeaway.

Kontrak final:

```ts
export type QueueOrderItem = {
  menuId: string;
  menuVariantId?: string;
  qty: number;
  note?: string;
  modifiers?: { modifierOptionId: string }[];
};

export type QueueOrderBody = {
  source?: "WALK_IN" | "WEB";
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableId?: string;
  tableLabel?: string;
  customerId?: string;
  customerName?: string;
  orderNote?: string;
  promoId?: string;
  promoCode?: string;
  items: QueueOrderItem[];
};
```

Validation freeze:
- jika `orderType === "DINE_IN"` maka `tableId` wajib ada
- `tableLabel` adalah snapshot display, bukan pengganti `tableId`

## 4.5 `CheckoutOrderBody`

Kontrak final:

```ts
export type CheckoutPayment = {
  method: "CASH" | "QRIS" | "TRANSFER" | "DEBIT" | "CREDIT" | "EWALLET";
  amountPaid: number;
  amountReceived?: number;
  label?: string;
};

export type CheckoutOrderBody = {
  source?: "WALK_IN" | "WEB";
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableId?: string;
  tableLabel?: string;
  customerId?: string;
  customerName?: string;
  orderNote?: string;
  promoId?: string;
  promoCode?: string;
  items: QueueOrderItem[];
  payments: CheckoutPayment[];
};
```

Validation freeze:
- `CASH` wajib `amountReceived`
- `DINE_IN` wajib `tableId`
- semua `tableId` harus valid dan aktif

---

## 5. Mapping Existing -> Target Contract

### `satset-kasir` existing

Current:
- `KasirMenu` belum punya `isActive`, `hasRecipe`, `isAvailable`, `availabilityReason`
- `CheckoutOrderBody` belum punya `orderType`
- `CheckoutOrderBody` belum punya `tableId`
- `QueueOrderBody` belum punya `orderType`

Target:
- tambahkan field-field di atas pada Phase 1

### `satset-api` existing

Current:
- validator queue/checkout belum punya `orderType`
- validasi table dine-in belum enforced

Target:
- extend schema validator
- enforce branch-scoped active table validation

### `satset-dashboard` existing

Current:
- admin recipe page sudah sesuai API
- POS legacy dashboard masih membaca recipe local storage

Target:
- hanya API yang boleh dipakai flow recipe produksi

---

## 6. Eksekusi Phase 0 Checklist

Status Phase 0:

- [x] Tetapkan `satset-api` sebagai source of truth tunggal
- [x] Audit source lokal/legacy di dashboard
- [x] Audit source lokal/legacy di kasir
- [x] Bekukan kontrak target `KasirMenu`
- [x] Bekukan kontrak target `KasirTable`
- [x] Bekukan kontrak target `QueueOrderBody`
- [x] Bekukan kontrak target `CheckoutOrderBody`
- [x] Tandai flow legacy yang tidak boleh dipakai untuk feature baru

---

## 7. Output Untuk Phase 1

Phase 1 bisa mulai dengan scope berikut:

### `satset-api`
- tambah `orderType` pada validator queue/checkout
- tambah endpoint consumer-safe daftar meja aktif untuk kasir
- tambah availability field pada `/kasir/menus`
- enforce `DINE_IN -> tableId valid`

### `satset-kasir`
- tambah client `getTables`
- tambah `useTablesQuery`
- ganti `tableNumber` free text menjadi table picker
- update payload checkout/queue ke kontrak baru

### `satset-dashboard`
- audit dan migrasi consumer `recipesStore`
- hentikan dependency baru ke local recipe store

---

## 8. Catatan Keputusan

Keputusan penting dari Phase 0:
- recipe local store tidak akan dipakai sebagai referensi produksi lagi
- stock local atom di kasir tidak boleh menjadi penentu availability produksi
- dine-in tanpa `tableId` valid dianggap flow yang tidak sesuai kontrak target

