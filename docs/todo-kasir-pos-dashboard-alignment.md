# TODO Migrasi Flow **Kasir** (Align ke `pos-dashboard`)

> **Scope dokumen ini:** *HANYA role Kasir* — menyesuaikan aplikasi di repo `kasirin-aja` agar perilaku & alur kerjanya setara dengan flow Kasir di `pos-dashboard/docs/flow/flow-kasir.md`.  
> **Out of scope:** Admin tenant, Superadmin, KDS full app (kita hanya siapkan integrasi status “Siap Antar” bila diperlukan).

---

## Ringkasan Gap (kondisi repo saat ini)

Repo ini sudah punya pondasi kasir, tapi flow-nya belum sama dengan `pos-dashboard`:

- **Navigasi kasir** saat ini berbentuk tab: `Home | Transaksi | Inventori | Pengaturan` (`src/config/navigation.ts`).
- **Shift** sudah ada (`/buka-shift`, `/tutup-shift`) tapi:
  - belum ada **slot shift** (Pagi/Siang/Malam),
  - belum ada rekap penjualan per metode (cash/qris/transfer bucket),
  - transaksi “shift scoped” belum jelas (tab `Transaksi` menggabung mock + stored).
- **Flow kasir `pos-dashboard`** butuh tab kerja: **Web Orders | Input Manual | Siap Antar | Riwayat | (Reservasi disabled)** — belum ada pemetaan langsung.
- **Pembayaran** sudah ada (QRIS/Transfer/EDC/Tunai) via `/pilih-pembayaran` tetapi:
  - belum ada **Split Bill** (per item / per nominal),
  - belum ada **Bayar Sebagian / PARTIALLY_PAID**,
  - belum ada konsep order lifecycle (PENDING → PARTIALLY_PAID → PAID).
- **Web Orders + timeout 30 menit** belum ada.
- **Siap Antar** (order READY dari dapur) belum ada.

---

## Target Perilaku (yang harus match flow Kasir `pos-dashboard`)

Minimal yang harus sama:

1. **Buka Shift**: input modal awal + pilih slot `PAGI|SIANG|MALAM`
2. **Input Manual**: pilih menu → modifier → qty → note → pilih meja/takeaway → nama pelanggan opsional
3. **Pembayaran**:
   - bayar penuh multi metode
   - split bill (per item / per nominal)
   - bayar sebagian → status `PARTIALLY_PAID` dan bisa dilunasi dari `Riwayat`
4. **Web Orders**: daftar order QR/Web yang butuh konfirmasi, dengan **timeout 30 menit**
5. **Siap Antar**: daftar order status READY, kasir klik “Sudah Diantar”
6. **Riwayat**: riwayat transaksi untuk konteks shift (hari ini / shift aktif)

---

## Rekomendasi Desain Migrasi (supaya rapi)

### Model domain baru yang perlu ditambahkan (di repo ini)
> Saat ini yang tersimpan adalah `Transaction` sederhana (`src/features/transactions/store/transaction.store.ts`).

Tambahkan entitas internal (frontend-only dulu) agar flow Kasir bisa lengkap:

- **Order**
  - id, createdAt, source: `WALK_IN | WEB`
  - status: `PENDING | PARTIALLY_PAID | PAID | CANCELLED | EXPIRED`
  - fulfillment: `QUEUED | PREPARING | READY | SERVED` (minimal untuk “Siap Antar”)
  - tableLabel / takeaway, customerName
  - items: array (menuId/name/qty/price/modifiers/note)
  - payments: array (method, amount, amountReceived?, label?)
- **Shift**
  - id, openedAt, closedAt?, slot, openingCash, cashierName
  - sales buckets (cash/qris/transfer) + expectedCash + actualCash + discrepancy

Ini bisa dimulai sebagai store Jotai + MMKV, baru nanti diganti API.

---

## PLAN TODO (prioritas eksekusi)

### P0 — Baseline & Refactor Aman (wajib sebelum feature besar)
- [x] **Buat dokumen mapping** halaman existing → target tab kasir (pos-dashboard)
- [x] Audit & rapikan tipe agar tidak rancu (pisahkan `Transaction` vs `Order` POS)

Deliverable:
- Mapping screen existing → tab kerja kasir final
- Types POS dasar (`Order`, `Shift`, status enums) tanpa mengubah behavior app (aman untuk step berikutnya)

---

## P0 Deliverable A — Mapping Screen Existing → Tab Kerja Kasir (Target)

> Target tab kerja kasir (mengacu `pos-dashboard`): **Web Orders | Input Manual | Siap Antar | Riwayat | Reservasi (disabled)**

| Target tab kasir | Status di repo ini | Rekomendasi implementasi | Referensi file (repo ini) |
|---|---|---|---|
| **Input Manual** | Sudah ada “Transaksi Baru” | Rename/alias ke “Input Manual” dan tambahkan meja/takeaway + customer label sebelum bayar | `src/app/transaksi-baru/index.tsx`, `src/features/cart/*`, `src/features/catalog/*` |
| **Riwayat** | Sudah ada tab “Transaksi” | Ubah menjadi “Riwayat Order” shift-scoped (bukan campur mock + stored) | `src/app/(tabs)/transaksi.tsx`, `src/features/transactions/*` |
| **Web Orders** | Belum ada | Buat screen baru + store order `source=WEB` + timeout 30 menit | (baru) `src/app/web-orders/index.tsx` (atau via nested tab kerja) |
| **Siap Antar** | Belum ada | Buat screen baru yang menampilkan order fulfillment `READY` dan aksi “Sudah Diantar” | (baru) `src/app/siap-antar/index.tsx` |
| **Reservasi (disabled)** | Belum ada | Tampilkan sebagai tab disabled/coming soon (tanpa feature) | (baru) UI shell saja |

Catatan navigasi:
- Saat ini tab router utama adalah `Home | Transaksi | Inventori | Pengaturan` (lihat `src/config/navigation.ts` dan `src/app/(tabs)/_layout.tsx`).
- Untuk “tab kerja kasir” ada dua opsi:
  - **Opsi A (besar)**: ganti tab router utama menjadi tab kerja kasir
  - **Opsi B (lebih aman)**: buat “Kasir Home” yang berisi tab kerja internal, tab utama tetap

---

## P0 Deliverable B — Pemisahan Tipe: `Transaction` vs `Order` POS

Masalah yang ingin dihindari:
- Saat ini `Transaction` (`src/features/transactions/transaction.types.ts`) memakai status `"Lunas" | "Void" | "Refund"` yang cocok untuk UI riwayat sederhana.
- Flow kasir `pos-dashboard` butuh lifecycle **Order POS** terpisah (`PENDING/PARTIALLY_PAID/PAID/...`) dan fulfillment (`READY/...`).

Keputusan P0:
- `Transaction` tetap dipakai untuk UI existing **sementara** (supaya tidak break).
- Tambahkan types baru `Order`/`Shift` untuk POS flow yang akan dipakai mulai P1+.

---

### P1 — Shift sesuai flow Kasir
Referensi file saat ini:
- `src/app/buka-shift/index.tsx`
- `src/app/tutup-shift/index.tsx`
- `src/features/shift/store/shift.store.ts`

TODO:
- [x] Tambah field **slot shift**: `PAGI | SIANG | MALAM` (dipilih saat buka shift).
- [x] Simpan `openedAt` (timestamp) dan `shiftId` (bukan hanya `startTime` string).
- [x] Tag transaksi dengan `shiftId` + `paymentMethodId` saat pembayaran sukses (untuk rekap shift).
- [x] Tutup shift:
  - [x] hitung expected cash = openingCash + salesCash (bukan total semua metode)
  - [x] tampilkan rekap per metode: Tunai / QRIS / Transfer-EDC (bucket)
- [x] Batasi transaksi yang dianggap “masuk shift” hanya yang terjadi saat shift OPEN (enforce di screen transaksi/pembayaran).

Acceptance:
- Buka shift menyimpan slot + opening cash.
- Tutup shift menghitung selisih kas berbasis **penjualan tunai**.

---

### P1 — Tab kerja Kasir (struktur navigasi baru)
- [x] Definisikan “tab kerja kasir” sesuai pos-dashboard:
  - [x] **Web Orders**
  - [x] **Input Manual**
  - [x] **Siap Antar**
  - [x] **Riwayat**
  - [x] **Reservasi** (disabled / coming soon)
- [x] Tentukan pendekatan navigasi:
  - [x] **Opsi A**: ganti tab router utama dari `Home | Transaksi | Inventori | Pengaturan` menjadi tab kerja kasir di atas
  - [ ] **Opsi B**: pertahankan tab utama, tapi buat **Kasir Home** yang berisi tab kerja internal (lebih minim perubahan global)
- [x] Implement minimal UI shell untuk 4 tab kerja (tanpa fitur penuh dulu) agar tim bisa iterasi per tab.

Deliverable:
- Kasir punya 4 tab kerja yang bisa diakses cepat (tablet-friendly).

---

### P1 — Input Manual (adaptasi dari `Transaksi Baru`)
Referensi file:
- `src/app/transaksi-baru/index.tsx`
- `src/features/cart/store/cart.store.ts`
- `src/features/catalog/store/catalog.store.ts`

TODO:
- [x] Selaraskan istilah & perilaku:
  - [x] `Transaksi Baru` = **Input Manual**
- [x] Tambahkan pemilihan **meja/takeaway** + nama pelanggan opsional (sebelum checkout).
- [x] Tambahkan struktur item yang mendekati POS:
  - [x] note per item (sudah ada? jika belum, tambah)
  - [x] modifier/varian per item (repo sudah punya variant sheet; jadikan bagian dari item modifiers)
- [ ] Availability menu (match `flow-summary.md` + `flow-kasir.md`):
  - [ ] `is_active=false` → tidak tampil
  - [ ] `is_available=false` → disabled (di repo saat ini baru ada `stockStatus`; perlu mapping eksplisit empty→unavailable)
- [x] Setelah lanjut pembayaran, hasilkan **Order** status `PENDING` (bukan langsung “Transaction” final).

Acceptance:
- Kasir bisa input order manual lengkap (meja/takeaway + notes) dan lanjut ke pembayaran.

---

### P1 — Pembayaran: Full payment parity
Referensi file:
- `src/app/pilih-pembayaran/index.tsx`
- `src/app/pembayaran-tunai/index.tsx`
- `src/features/payment/*`

TODO:
- [x] Selaraskan daftar metode ke kebutuhan kasir (front-end dulu):
  - [x] Cash
  - [x] QRIS
  - [x] Transfer
  - [x] Kartu (DEBIT/CREDIT)
  - [x] E-Wallet (jika belum, sementara treat sebagai QRIS bucket)
- [x] Saat metode Cash:
  - [x] input `amountReceived` dan hitung kembalian (wajib)
- [x] Saat payment sukses:
  - [x] buat `Payment` record dan update Order → `PAID`
  - [x] update shift bucket sales (cash/qris/transfer)
- [x] Update “Riwayat” memakai Order/Payment baru (bukan string `Transaction.amount`).

Acceptance:
- Pembayaran full membuat order `PAID`, tercatat di Riwayat, dan mempengaruhi rekap shift.

---

### P2 — Split Bill (per item & per nominal)
TODO:
- [x] Buat UI “Split Bill” di flow pembayaran:
  - [x] Mode per item (assign item ke payer)
  - [x] Mode per nominal (validasi sum == grand total, tombol “Bagi Rata”)
- [x] Simpan sebagai beberapa `Payment` dengan label (mis. “Split 1/3”).
- [ ] (Opsional) receipt per payment.

Acceptance:
- 1 order dapat diselesaikan dengan >1 payment tanpa mismatch total.

---

### P2 — Bayar Sebagian (PARTIALLY_PAID) + Pelunasan dari Riwayat
TODO:
- [x] Tambah aksi “Bayar Sebagian” pada halaman pembayaran:
  - [x] input nominal dibayar sekarang
  - [x] Order status → `PARTIALLY_PAID`
- [x] Di Riwayat, order `PARTIALLY_PAID` punya aksi “Lunasi”:
  - [x] tambah payment baru sampai lunas → status `PAID`

Acceptance:
- Partial payment bisa dilunasi kapan saja dari Riwayat.

---

### P2 — Web Orders + timeout 30 menit
TODO:
- [x] Tambah tab/screen **Web Orders**
- [x] Tambah model order `source=WEB` + status `PENDING`
- [x] Implement rule timeout 30 menit:
  - [x] order yang belum dikonfirmasi dalam 30 menit → status `EXPIRED` (atau `CANCELLED`, putuskan 1) dan hilang dari daftar aktif
- [x] Aksi kasir: “Konfirmasi” → masuk flow pembayaran / diproses.

Acceptance:
- Web order yang expired tidak bisa diproses dari tab Web Orders.

---

### P2 — Siap Antar (READY → SERVED)
TODO:
- [x] Tambah tab/screen **Siap Antar**
- [x] Tampilkan order fulfillment `READY`
- [x] Aksi “Sudah Diantar” → fulfillment `SERVED` (keluar dari daftar)
- [x] Siapkan integrasi event dari dapur:
  - [x] fase awal: manual toggle status untuk simulasi
  - [x] fase lanjut: subscribe event (polling/SSE/WebSocket)

Acceptance:
- Kasir punya daftar order READY dan bisa menandai “Sudah Diantar”.

---

### P1/P2 — Riwayat (shift-scoped, sesuai kasir)
Referensi file saat ini:
- `src/app/(tabs)/transaksi.tsx`

TODO:
- [x] Ubah dari “Riwayat Transaksi” generik menjadi **Riwayat Order** konteks kasir:
  - [x] default filter: shift aktif (atau hari ini) + status
  - [x] detail order menampilkan item, pembayaran (multi), meja/takeaway, customer
- [x] Void/refund rules (sesuaikan policy):
  - [x] void untuk `PENDING/PARTIALLY_PAID`
  - [x] refund untuk `PAID` (boleh diparkir P3 bila admin-only)

Acceptance:
- Riwayat menunjukkan order sesuai shift dan menyediakan aksi yang tepat.

---

### P3 — Integrasi KDS real-time (opsional setelah core kasir siap)
- [x] Tambah channel event (polling/SSE/WebSocket) untuk update fulfillment dari dapur.
- [x] Notifikasi saat order jadi `READY`.
