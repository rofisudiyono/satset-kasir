# Phase 4 — Verification Matrix

Dokumen ini adalah artefak eksekusi P4 untuk alignment flow `satset-api`, `satset-dashboard`, dan `satset-kasir`.

Tujuan:
- memverifikasi bahwa contract Phase 0-3 benar-benar bekerja end-to-end;
- memberi checklist UAT lintas repo yang bisa dijalankan segera;
- menyiapkan backlog otomatisasi test untuk fase berikutnya.

## 1. Scope Verifikasi

Flow yang harus lolos:
1. Admin membuat bahan baku + stok awal.
2. Admin membuat menu.
3. Admin membuat resep menu / variant.
4. Admin membuat meja di cabang.
5. Kasir membuat manual order.
6. `Dine In` wajib pilih meja aktif.
7. Checkout mengirim `tableId/tableLabel`.
8. Stok bahan baku berkurang setelah pembayaran.
9. Held order menyimpan dan mengembalikan konteks meja.
10. Menu unavailable tetap tampil di kasir tetapi tidak bisa dijual.

---

## 2. Preconditions

Sebelum verifikasi:

### Backend
- `satset-api` berjalan.
- endpoint kasir baru aktif:
  - `GET /kasir/menus`
  - `GET /kasir/tables`
  - `POST /kasir/orders/queue`
  - `POST /kasir/orders/checkout`

### Dashboard
- `satset-dashboard` dapat login sebagai admin tenant.
- halaman yang dipakai:
  - katalog bahan baku
  - katalog menu
  - resep & BOM
  - operasional cabang-meja

### Kasir
- `satset-kasir` dapat login sebagai kasir.
- shift bisa dibuka.
- kasir mengarah ke cabang yang sama dengan data meja dan inventory test.

### Data Awal Disarankan
- Branch: `Cabang A`
- Ingredients:
  - `Gula` stok 1000 gram
  - `Teh` stok 500 gram
- Menu:
  - `Es Teh Manis`
- Recipe:
  - `Gula` 10 gram
  - `Teh` 5 gram
- Tables:
  - `Meja 01`
  - `Meja 02`

---

## 3. Manual Verification Matrix

## Scenario A — Ingredient dibuat dan tersedia untuk resep

### Langkah
1. Buka `satset-dashboard`.
2. Masuk ke halaman bahan baku.
3. Tambah `Gula` dan `Teh` dengan stok awal.
4. Buka kembali detail/list bahan.

### Expected Result
- Bahan muncul di list dashboard.
- Nilai stok awal tersimpan.
- Bahan bisa dipilih pada halaman `Resep & BOM`.

### Evidence
- Screenshot list bahan.
- Catat nilai stok awal.

---

## Scenario B — Recipe tersimpan di API dan terlihat di dashboard

### Langkah
1. Buka halaman menu.
2. Buat `Es Teh Manis`.
3. Buka halaman `Resep & BOM`.
4. Pilih menu `Es Teh Manis`.
5. Tambahkan line:
   - `Gula` = 10
   - `Teh` = 5
6. Simpan resep.

### Expected Result
- Dashboard menampilkan status menu `Sudah ada resep`.
- Reload halaman tetap menampilkan line recipe yang sama.
- Tidak ada ketergantungan pada local storage untuk hasil reload ini.

### Evidence
- Screenshot page `Resep & BOM`.
- Catat `menuId` dan line recipe yang tersimpan.

---

## Scenario C — Table dibuat dan muncul untuk kasir

### Langkah
1. Buka halaman `Operasional > Cabang & Meja`.
2. Tambah `Meja 01` dan `Meja 02`.
3. Pastikan status meja active.
4. Login ke `satset-kasir` dengan kasir cabang yang sama.
5. Masuk ke flow `Input Manual` atau `/keranjang`.
6. Buka selector meja.

### Expected Result
- `Meja 01` dan `Meja 02` muncul di selector meja kasir.
- Jika meja dibuat inactive di dashboard, meja tidak muncul lagi di kasir.

### Evidence
- Screenshot dashboard table list.
- Screenshot selector meja di kasir.

---

## Scenario D — Dine In wajib memilih meja

### Langkah
1. Di kasir, tambah item ke cart.
2. Pastikan mode `Dine In`.
3. Jangan pilih meja.
4. Coba `Hold Order`.
5. Coba lanjut ke pembayaran.

### Expected Result
- Hold order ditolak.
- Pembayaran ditolak.
- User melihat pesan bahwa `Dine In` wajib memilih meja aktif.

### Evidence
- Screenshot alert saat hold.
- Screenshot alert saat pay.

---

## Scenario E — Take Away / Delivery tidak wajib meja

### Langkah
1. Di kasir, tambah item ke cart.
2. Ubah mode ke `Take Away`.
3. Jangan pilih meja.
4. Lanjut ke pembayaran.

### Expected Result
- Order bisa lanjut tanpa meja.
- Payload checkout tetap valid.
- Backend tidak menolak karena `tableId` kosong.

### Evidence
- Screenshot order berhasil lanjut ke payment.

---

## Scenario F — Checkout menyimpan `tableId` dan `tableLabel`

### Langkah
1. Di kasir, buat order `Dine In`.
2. Pilih `Meja 01`.
3. Bayar order.
4. Cek order history kasir.
5. Jika memungkinkan, cek data order di API/database/log.

### Expected Result
- Order history menampilkan label meja yang benar.
- `tableId` order mengarah ke `Meja 01`.
- `tableLabel` tersimpan sebagai snapshot display.

### Evidence
- Screenshot history order.
- Query/log payload order bila tersedia.

---

## Scenario G — Stock deduction setelah payment

### Langkah
1. Catat stok awal:
   - Gula = 1000
   - Teh = 500
2. Di kasir, jual 2 porsi `Es Teh Manis`.
3. Bayar hingga sukses.
4. Buka dashboard bahan baku / laporan bahan baku.

### Expected Result
- Gula berkurang `20`.
- Teh berkurang `10`.
- Movement stok tercatat sebagai penjualan/order.

### Evidence
- Sebelum / sesudah stok.
- Movement log jika ada.

---

## Scenario H — Held order menyimpan konteks meja

### Langkah
1. Di kasir, buat order `Dine In`.
2. Pilih `Meja 02`.
3. Klik `Hold Order`.
4. Buka `Pesanan Ditahan`.
5. Resume order.

### Expected Result
- Held order menampilkan label meja.
- Setelah resume, cart kembali dengan:
  - item tetap ada
  - mode layanan tetap
  - meja tetap terpilih
  - customer name tetap jika sebelumnya diisi

### Evidence
- Screenshot card held order.
- Screenshot keranjang setelah resume.

---

## Scenario I — Menu unavailable tetap terlihat tapi disabled

### Langkah
1. Di dashboard, nonaktifkan satu menu.
2. Reload `Input Manual` kasir.

### Expected Result
- Menu masih terlihat di katalog.
- Badge/status menunjukkan menu tidak tersedia.
- Tombol add disabled.
- Menu tidak bisa masuk cart.

### Evidence
- Screenshot kartu produk disabled.

---

## Scenario J — Order dine-in ditolak jika meja inactive

### Langkah
1. Pilih meja di kasir.
2. Sebelum checkout, nonaktifkan meja tersebut di dashboard.
3. Coba checkout dari kasir.

### Expected Result
- Backend reject checkout.
- Kasir mendapat error message dari API.

### Evidence
- Screenshot error checkout.

---

## 4. Regression Checklist

- [ ] Shift open/close masih berjalan.
- [ ] Payment tunai masih menghitung `amountReceived`.
- [ ] Payment non-cash tetap bisa checkout.
- [ ] Riwayat transaksi tetap tampil.
- [ ] Ready order flow tidak rusak oleh perubahan contract queue/checkout.
- [ ] Barcode scan tetap bisa add produk yang available.
- [ ] Hold order tanpa meja masih valid untuk `Take Away` / `Delivery`.

---

## 5. Recommended Execution Order

Urutan verifikasi paling efisien:

1. Scenario A
2. Scenario B
3. Scenario C
4. Scenario D
5. Scenario E
6. Scenario F
7. Scenario G
8. Scenario H
9. Scenario I
10. Scenario J

---

## 6. Bug Logging Template

Gunakan format berikut saat menemukan issue:

```md
Title:
[Repo] [Flow] Ringkasan bug

Environment:
- API branch:
- Dashboard branch:
- Kasir branch:

Steps:
1.
2.
3.

Expected:

Actual:

Impact:

Evidence:
- screenshot/log/query
```

---

## 7. Automation Backlog

Karena repo belum punya harness integration test lintas app yang siap pakai, berikut backlog otomatisasi yang direkomendasikan:

### Backend automation (`satset-api`)
- [ ] test `checkout` dine-in tanpa meja -> `400`
- [ ] test `checkout` dine-in dengan meja inactive -> `400`
- [ ] test `checkout` dengan meja valid -> sukses
- [ ] test stock deduction base recipe
- [ ] test rollback stock cancel/refund
- [ ] test `/kasir/tables` hanya return meja aktif cabang valid
- [ ] test `/kasir/menus` return field:
  - `hasRecipe`
  - `isActive`
  - `isAvailable`
  - `availabilityReason`

### Frontend automation (`satset-kasir`)
- [ ] component test `CustomerInfoCard`:
  - dine-in wajib pilih meja
  - takeaway tidak perlu meja
- [ ] state restore test:
  - hold order -> resume -> draft meja kembali
- [ ] product card disabled state untuk `inactive`

### Cross-app smoke automation
- [ ] scripted smoke:
  - create ingredient
  - create menu
  - create recipe
  - create table
  - checkout via kasir
  - assert stock changed

---

## 8. Known Limitations Saat Ini

- `satset-kasir` masih punya error TypeScript lama di area yang tidak terkait alignment:
  - `bluetooth-printer`
  - `pembayaran-sukses`
  - `tutup-shift`
  - `KdsReadyNotifications`
- belum ada infra automated integration test yang siap dipakai lintas repo
- availability backend saat ini masih semantik minimal, belum full stock-engine driven

---

## 9. Exit Criteria P4

P4 dianggap selesai jika:
- seluruh skenario A-J lolos atau terdokumentasi bug-nya;
- tidak ada mismatch lagi pada:
  - recipe source of truth
  - dine-in table selection
  - held order restore context
  - checkout payload table reference
  - visibility menu unavailable

