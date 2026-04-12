# Test Case — Admin Tenant Katalog Bahan Baku sampai Resep

Dokumen ini mencakup test case untuk flow:

1. `admin-tenant/katalog/bahan-baku`
2. `admin-tenant/katalog/menu`
3. `admin-tenant/katalog/resep-bom`

Tujuan:
- memastikan admin bisa membuat bahan baku;
- memastikan bahan baku bisa dipakai untuk menu dan resep;
- memastikan recipe tersimpan dengan benar dan siap dipakai flow kasir.

## Scope

In scope:
- create/update bahan baku
- validasi form bahan baku
- visibility bahan baku di list
- create menu
- visibility status `hasRecipe`
- create/update recipe base
- create/update recipe variant
- persist data setelah reload

Out of scope:
- stock adjustment
- stock opname
- checkout kasir
- rollback stok

---

## Preconditions

- Admin tenant dapat login ke dashboard.
- API aktif dan terhubung.
- Ada minimal 1 branch aktif.
- Admin berada pada tenant yang sama untuk semua data test.

Data referensi yang disarankan:
- Branch: `Cabang A`
- Ingredient:
  - `Gula`
  - `Teh`
  - `Susu`
- Menu:
  - `Es Teh Manis`
  - `Latte`

---

## Format Kolom

- `ID`: kode test case
- `Module`: area fitur
- `Scenario`: skenario yang diuji
- `Steps`: langkah uji
- `Expected Result`: hasil yang diharapkan

---

## A. Bahan Baku

### TC-ING-001
- Module: `Bahan Baku`
- Scenario: Admin berhasil menambahkan bahan baku baru
- Steps:
  1. Buka halaman `admin-tenant/katalog/bahan-baku`
  2. Klik tambah bahan baku
  3. Isi:
     - nama: `Gula`
     - unit: `gram`
     - min threshold: `100`
     - stok awal: `1000`
     - branch: `Cabang A`
  4. Simpan
- Expected Result:
  - data berhasil tersimpan
  - item `Gula` muncul di list bahan baku
  - stok awal dan unit tampil sesuai input

### TC-ING-002
- Module: `Bahan Baku`
- Scenario: Validasi nama bahan baku wajib diisi
- Steps:
  1. Buka form tambah bahan baku
  2. Kosongkan field nama
  3. Isi field lain valid
  4. Klik simpan
- Expected Result:
  - form gagal submit
  - muncul pesan validasi nama wajib diisi

### TC-ING-003
- Module: `Bahan Baku`
- Scenario: Validasi stok awal tidak boleh negatif
- Steps:
  1. Buka form tambah bahan baku
  2. Isi nama valid
  3. Isi stok awal `-1`
  4. Klik simpan
- Expected Result:
  - form gagal submit
  - muncul pesan validasi stok tidak valid

### TC-ING-004
- Module: `Bahan Baku`
- Scenario: Admin berhasil mengubah data bahan baku
- Steps:
  1. Pilih bahan baku `Gula`
  2. Edit:
     - min threshold dari `100` menjadi `150`
  3. Simpan
- Expected Result:
  - perubahan berhasil tersimpan
  - list menampilkan threshold terbaru

### TC-ING-005
- Module: `Bahan Baku`
- Scenario: Bahan baku tetap ada setelah reload halaman
- Steps:
  1. Pastikan `Gula` sudah dibuat
  2. Reload halaman
- Expected Result:
  - `Gula` tetap muncul
  - data sesuai hasil simpan terakhir

### TC-ING-006
- Module: `Bahan Baku`
- Scenario: Pencarian bahan baku menampilkan hasil yang sesuai
- Steps:
  1. Pastikan ada `Gula`, `Teh`, `Susu`
  2. Cari keyword `Teh`
- Expected Result:
  - list menampilkan item yang match pencarian
  - item yang tidak match tidak tampil

---

## B. Menu

### TC-MENU-001
- Module: `Menu`
- Scenario: Admin berhasil membuat menu tanpa variant
- Steps:
  1. Buka halaman `admin-tenant/katalog/menu`
  2. Klik tambah menu
  3. Isi:
     - nama: `Es Teh Manis`
     - kategori: pilih kategori valid
     - harga: `12000`
     - type: `SINGLE`
  4. Simpan
- Expected Result:
  - menu berhasil tersimpan
  - `Es Teh Manis` muncul di list menu
  - status recipe masih `Belum`

### TC-MENU-002
- Module: `Menu`
- Scenario: Validasi nama menu wajib diisi
- Steps:
  1. Buka form tambah menu
  2. Kosongkan nama
  3. Isi field lain valid
  4. Simpan
- Expected Result:
  - form gagal submit
  - muncul validasi nama menu wajib

### TC-MENU-003
- Module: `Menu`
- Scenario: Menu dengan variant berhasil dibuat
- Steps:
  1. Tambah menu `Latte`
  2. Aktifkan variant
  3. Tambahkan variant:
     - `Small`
     - `Medium`
     - `Large`
  4. Simpan
- Expected Result:
  - menu berhasil tersimpan
  - variant tampil di detail/menu form edit
  - status recipe awal masih `Belum`

### TC-MENU-004
- Module: `Menu`
- Scenario: Status `hasRecipe` awal false untuk menu baru
- Steps:
  1. Buat menu baru yang belum diberi recipe
  2. Kembali ke list menu
- Expected Result:
  - kolom status recipe menampilkan `Belum`

---

## C. Resep & BOM

### TC-REC-001
- Module: `Resep & BOM`
- Scenario: Admin dapat melihat daftar menu di page resep
- Steps:
  1. Buka halaman `admin-tenant/katalog/resep-bom`
- Expected Result:
  - daftar menu tampil di sidebar/list
  - menu yang sudah dibuat muncul di daftar

### TC-REC-002
- Module: `Resep & BOM`
- Scenario: Admin berhasil menambahkan recipe base untuk menu tanpa variant
- Steps:
  1. Pilih menu `Es Teh Manis`
  2. Tambah recipe line
  3. Pilih ingredient `Gula`
  4. Isi qty `10`
  5. Tambah recipe line lagi
  6. Pilih ingredient `Teh`
  7. Isi qty `5`
  8. Simpan resep
- Expected Result:
  - resep berhasil tersimpan
  - list recipe menampilkan `Gula` dan `Teh`
  - status menu berubah menjadi `Sudah ada resep`

### TC-REC-003
- Module: `Resep & BOM`
- Scenario: Validasi qty recipe harus lebih dari 0
- Steps:
  1. Pilih menu
  2. Tambah recipe line
  3. Pilih ingredient valid
  4. Isi qty `0`
  5. Simpan
- Expected Result:
  - line dengan qty tidak valid tidak ikut tersimpan
  - bila semua line invalid, save tidak menghasilkan recipe valid

### TC-REC-004
- Module: `Resep & BOM`
- Scenario: Admin dapat membuat recipe per variant
- Steps:
  1. Pilih menu `Latte`
  2. Ubah scope ke variant `Small`
  3. Tambah recipe line valid
  4. Simpan
  5. Ganti ke variant `Medium`
  6. Tambah recipe line berbeda
  7. Simpan
- Expected Result:
  - masing-masing variant menyimpan recipe berbeda
  - saat pindah variant, line recipe mengikuti variant yang dipilih

### TC-REC-005
- Module: `Resep & BOM`
- Scenario: Recipe tersimpan dan tetap tampil setelah reload
- Steps:
  1. Buat recipe valid untuk `Es Teh Manis`
  2. Reload halaman `Resep & BOM`
  3. Pilih kembali menu yang sama
- Expected Result:
  - seluruh line recipe tetap tampil
  - qty dan ingredient sesuai data terakhir

### TC-REC-006
- Module: `Resep & BOM`
- Scenario: Update recipe menggantikan line sebelumnya
- Steps:
  1. Pastikan `Es Teh Manis` punya 2 line recipe
  2. Hapus salah satu line
  3. Simpan
- Expected Result:
  - recipe lama tergantikan
  - hanya line terbaru yang tampil setelah reload

### TC-REC-007
- Module: `Resep & BOM`
- Scenario: Admin dapat menambahkan beberapa ingredient dalam satu menu
- Steps:
  1. Pilih menu
  2. Tambahkan 3 line recipe berbeda
  3. Simpan
- Expected Result:
  - semua line valid tersimpan
  - estimasi jumlah bahan tampil sesuai line yang ada

### TC-REC-008
- Module: `Resep & BOM`
- Scenario: Status `hasRecipe` di halaman menu sinkron setelah save recipe
- Steps:
  1. Simpan recipe valid untuk menu yang sebelumnya `Belum`
  2. Kembali ke halaman menu
- Expected Result:
  - status recipe di list menu berubah menjadi `Sudah ada resep`

### TC-REC-009
- Module: `Resep & BOM`
- Scenario: Ingredient yang muncul di selector recipe berasal dari master bahan baku
- Steps:
  1. Buka page recipe
  2. Tambah recipe line
  3. Buka dropdown ingredient
- Expected Result:
  - ingredient yang sebelumnya dibuat di halaman bahan baku muncul di dropdown
  - ingredient yang tidak ada di master tidak muncul

### TC-REC-010
- Module: `Resep & BOM`
- Scenario: Jika belum ada ingredient, admin tidak bisa menyusun recipe dengan lengkap
- Steps:
  1. Gunakan tenant/test data tanpa ingredient
  2. Buka page recipe
  3. Coba tambah line recipe
- Expected Result:
  - dropdown ingredient kosong atau tidak memiliki opsi valid
  - admin mendapat sinyal bahwa bahan baku harus dibuat terlebih dahulu

---

## D. Cross-Module Integration

### TC-INT-001
- Module: `Bahan Baku -> Resep`
- Scenario: Bahan baku yang baru dibuat langsung tersedia untuk recipe builder
- Steps:
  1. Buat bahan baku baru `Sirup`
  2. Langsung buka page recipe
  3. Tambah line recipe
- Expected Result:
  - `Sirup` muncul di selector ingredient tanpa perlu manipulasi manual

### TC-INT-002
- Module: `Menu -> Resep`
- Scenario: Menu yang baru dibuat langsung tersedia di page recipe
- Steps:
  1. Buat menu baru
  2. Buka page recipe
- Expected Result:
  - menu baru langsung muncul di daftar menu recipe

### TC-INT-003
- Module: `Menu -> Resep Status`
- Scenario: Status recipe sinkron antar halaman
- Steps:
  1. Pastikan menu awalnya `Belum`
  2. Simpan recipe valid
  3. Kembali ke halaman menu
- Expected Result:
  - status berubah ke `Sudah ada resep`

---

## E. Negative Cases

### TC-NEG-001
- Module: `Resep & BOM`
- Scenario: Simpan recipe dengan ingredient kosong
- Steps:
  1. Tambah line recipe
  2. Jangan pilih ingredient
  3. Isi qty
  4. Simpan
- Expected Result:
  - line invalid tidak ikut tersimpan

### TC-NEG-002
- Module: `Resep & BOM`
- Scenario: Simpan recipe dengan menu belum dipilih
- Steps:
  1. Masuk page recipe dalam kondisi data menu gagal load / belum ada selection
  2. Coba simpan
- Expected Result:
  - save tidak berjalan
  - tidak ada data korup tersimpan

### TC-NEG-003
- Module: `Bahan Baku`
- Scenario: API gagal saat simpan bahan baku
- Steps:
  1. Simulasikan API error
  2. Submit form bahan baku
- Expected Result:
  - muncul error message
  - data tidak muncul palsu di list

### TC-NEG-004
- Module: `Resep & BOM`
- Scenario: API gagal saat simpan recipe
- Steps:
  1. Simulasikan API error saat save recipe
  2. Klik simpan
- Expected Result:
  - muncul error message
  - recipe lama tidak berubah

---

## F. UAT Checklist Ringkas

- [ ] Admin bisa tambah bahan baku
- [ ] Validasi form bahan baku jalan
- [ ] Admin bisa tambah menu
- [ ] Menu baru muncul di page recipe
- [ ] Ingredient baru muncul di selector recipe
- [ ] Recipe base bisa disimpan
- [ ] Recipe variant bisa disimpan
- [ ] Reload tidak menghilangkan recipe
- [ ] Status `hasRecipe` sinkron di halaman menu

---

## G. Saran Eksekusi

Urutan test paling efisien:
1. `TC-ING-001` sampai `TC-ING-006`
2. `TC-MENU-001` sampai `TC-MENU-004`
3. `TC-REC-001` sampai `TC-REC-010`
4. `TC-INT-001` sampai `TC-INT-003`
5. `TC-NEG-001` sampai `TC-NEG-004`

