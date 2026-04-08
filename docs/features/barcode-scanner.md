# Barcode Scanner

Dokumen ini menjelaskan fitur **Barcode Scanner** pada aplikasi `kasirin-aja`.

## Gambaran Umum

Fitur Barcode Scanner memungkinkan kasir untuk memindai barcode produk menggunakan kamera perangkat. Barcode yang berhasil dipindai akan dicocokkan dengan katalog produk dan otomatis ditambahkan ke keranjang belanja.

## Fitur Utama

### 1. Pemindaian Barcode

- **Camera-based scanning**: Menggunakan kamera perangkat untuk memindai barcode secara real-time
- **Format yang didukung**:
  - EAN-13
  - EAN-8
  - Code 128
  - QR Code
- **Scan area overlay**: Tampilan area pemindaian dengan penanda sudut untuk membantu penempatan barcode

### 2. Manual Entry Fallback

- Jika pemindaian otomatis gagal, kasir dapat memasukkan kode barcode secara manual
- Input field tersedia untuk mengetik kode barcode secara langsung

### 3. Product Matching

- Barcode yang dipindai akan dicocokkan dengan produk di katalog
- Jika ditemukan, produk otomatis ditambahkan ke keranjang belanja
- Jika tidak ditemukan, akan muncul notifikasi bahwa produk tidak ditemukan

## Alur Penggunaan

1. Kasir menekan tombol "Scan Barcode" di layar transaksi
2. Aplikasi membuka halaman `/barcode-scanner`
3. Kamera perangkat aktif dan menampilkan preview
4. Kasir mengarahkan kamera ke barcode produk
5. Barcode terdeteksi dan otomatis dipindai
6. Sistem mencari produk berdasarkan barcode
7. Jika ditemukan, produk ditambahkan ke keranjang dan kasir kembali ke layar transaksi
8. Jika tidak ditemukan, kasir dapat mencoba lagi atau memasukkan kode manual

## Lokasi dalam Aplikasi

- **Route**: `/barcode-scanner`
- **Akses**: Tombol di layar transaksi (Input Manual)
- **File utama**: `/src/app/barcode-scanner/index.tsx`

## Permission Handling

- Aplikasi meminta izin akses kamera sebelum mengaktifkan scanner
- Jika izin ditolak, kasir tetap dapat menggunakan manual entry
- Permission state dikelola oleh Expo Camera API

## Integrasi dengan Fitur Lain

- **Cart Integration**: Produk yang dipindai langsung ditambahkan ke keranjang via Jotai atom (`cartAtom`)
- **Catalog Matching**: Barcode dicocokkan dengan data produk di `catalogStockAtom`
- **POS Transaction**: Scanner dapat diakses dari layar transaksi utama

## Catatan Teknis

- Menggunakan `expo-camera` untuk pemindaian barcode
- Barcode types yang didukung dikonfigurasi di Camera component
- State scanner disimpan di `scannedBarcodeAtom`
- Scanner berjalan di mode foreground dengan preview real-time
