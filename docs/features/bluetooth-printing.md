# Cetak Struk Bluetooth

Dokumen ini menjelaskan fitur **Cetak Struk via Bluetooth Thermal Printer** pada aplikasi `kasirin-aja`.

## Gambaran Umum

Fitur cetak struk Bluetooth memungkinkan kasir untuk mencetak struk pembayaran langsung ke printer thermal Bluetooth menggunakan protokol ESC/POS. Printer yang terhubung akan mencetak struk dengan format yang dioptimalkan untuk printer thermal 58mm atau 80mm.

## Fitur Utama

### 1. Koneksi Printer Bluetooth

- **Bluetooth Discovery**: Memindai printer Bluetooth yang tersedia di sekitar perangkat
- **Printer Detection**: Otomatis mendeteksi printer thermal (Xprinter, Gainscha, Epson, RPP, dll)
- **Connection Management**: Kelola koneksi printer dengan indikator status
- **Auto-reconnect**: Printer yang pernah terhubung akan diingat untuk koneksi cepat

### 2. Format ESC/POS

- **ESC/POS Protocol**: Menggunakan standar industri untuk printer thermal
- **Auto Formatting**: Struk diformat otomatis dengan alignment, bold text, dan ukuran font
- **Multi-size Support**: Mendukung printer thermal 58mm dan 80mm
- **Character Encoding**: Dukungan karakter UTF-8 untuk teks Indonesia

### 3. Informasi Struk

Struk yang dicetak mencakup:

**Header:**
- Nama toko (bold, double size, centered)
- Alamat toko
- Nomor telepon

**Informasi Order:**
- Nomor order
- Tanggal dan waktu transaksi

**Item Belanja:**
- Nama produk (dengan variant jika ada)
- Kuantitas
- Harga per item

**Ringkasan Pembayaran:**
- Subtotal
- Diskon (jika ada)
- PPN 11%
- Grand Total (bold)
- Metode pembayaran
- Jumlah dibayar
- Total dibayar (akumulasi untuk partial payment)
- Sisa tagihan

**Untuk Pembayaran Tunai:**
- Uang diterima
- Kembalian

**Footer:**
- Pesan terima kasih
- Pemotongan kertas otomatis

## Alur Penggunaan

### Setup Printer Bluetooth (Pertama Kali)

1. Kasir menekan ikon **Bluetooth** di header navigasi atas
2. Aplikasi membuka halaman **Pengaturan Printer Bluetooth** (`/bluetooth-printer`)
3. Kasir menekan tombol **Pindai Printer Bluetooth**
4. Aplikasi memindai printer Bluetooth yang tersedia
5. Kasir memilih printer dari daftar yang ditemukan
6. Aplikasi menghubungkan ke printer
7. Kasir dapat menekan **Test Print** untuk memverifikasi koneksi
8. Printer siap digunakan

### Cetak Struk via Bluetooth

1. Kasir memproses pembayaran di halaman Input Manual
2. Setelah pembayaran berhasil, aplikasi membuka halaman **Pembayaran Sukses**
3. Di bagian **Preview Resi**, kasir akan melihat 3 tombol:
   - **Cetak Resi (PDF)** - Cetak via sistem PDF/exposure-sharing
   - **Cetak Bluetooth** - Cetak langsung ke printer Bluetooth (hanya muncul jika printer terhubung)
   - **Bagikan Ringkasan** - Bagikan ringkasan teks via share native
4. Kasir menekan **Cetak Bluetooth**
5. Aplikasi mengirimkan data ESC/POS ke printer
6. Struk tercetak di printer thermal

### Putuskan Koneksi Printer

1. Buka **Pengaturan Printer Bluetooth** (`/bluetooth-printer`)
2. Tekan tombol **Putuskan** pada printer yang terhubung
3. Konfirmasi pemutusan koneksi
4. Printer terputus dan status berubah menjadi "Tidak Terhubung"

## Lokasi dalam Aplikasi

- **Route Settings**: `/bluetooth-printer`
- **Akses Settings**: Ikon Bluetooth di header navigasi atas
- **Print Trigger**: Halaman `/pembayaran-sukses` pada bagian Preview Resi
- **Files Utama**:
  - `/src/utils/bluetooth-printer.ts` - Bluetooth printer manager
  - `/src/utils/esc-pos-formatter.ts` - ESC/POS receipt formatter
  - `/src/app/bluetooth-printer/index.tsx` - Settings page

## Printer yang Didukung

Aplikasi mendukung printer thermal Bluetooth dengan protokol ESC/POS:

### Merek Populer:
- **Xprinter** (XP-P300, XP-58IIH, dll)
- **Gainscha** (GP-2120, GP-58L, dll)
- **Epson** (TM系列)
- **RPP** (RPP-300, RPP-80, dll)
- **MUNBYN**
- **POSGo**

### Ukuran Kertas:
- **58mm** - Printer thermal kecil (default)
- **80mm** - Printer thermal besar

## Integrasi dengan Fitur Lain

- **Payment Success**: Terintegrasi langsung di halaman pembayaran sukses
- **POS Transaction**: Struk dihasilkan dari data order POS
- **Receipt Generation**: Menggunakan `ESCPOSReceipt` interface untuk format standar
- **State Management**: Printer state dikelola via singleton `BluetoothPrinterManager`

## Catatan Teknis

### State Management

```typescript
interface PrinterState {
  connected: boolean;      // Status koneksi
  printer: BluetoothPrinter | null;  // Printer yang terhubung
  printing: boolean;       // Status printing (sedang mencetak)
}
```

### ESC/POS Commands

Formatter menggunakan perintah ESC/POS standar:
- `\x1B@` - Initialize printer
- `\x1Ba\x01` - Center alignment
- `\x1BE\x01` - Bold ON
- `\x1D!\x11` - Double height & width
- `\x1DV\x01` - Full cut paper

### Error Handling

- **Bluetooth Not Available**: Alert menginformasikan modul Bluetooth belum diinstal
- **Printer Not Connected**: Alert dengan opsi buka pengaturan
- **Print Failed**: Alert dengan pesan error dan saran coba lagi

### Permissions

Aplikasi memerlukan permission berikut (akan diminta otomatis):
- **Bluetooth Connect**: Untuk menghubungkan ke printer
- **Bluetooth Scan**: Untuk memindai printer tersedia
- **Location** (Android): Diperlukan untuk Bluetooth scanning

## Instalasi Dependencies (Opsional)

Untuk mengaktifkan fitur Bluetooth printing, instal dependensi:

```bash
npm install react-native-bluetooth-escpos-printer
cd ios && pod install
```

**Catatan**: Modul ini memerlukan development build (tidak bisa Expo Go).

## Troubleshooting

### Printer Tidak Ditemukan
- Pastikan printer dalam mode pairing/discoverable
- Pastikan Bluetooth perangkat aktif
- Restart aplikasi dan coba scan ulang
- Periksa apakah printer sudah ter-pair di pengaturan Bluetooth perangkat

### Gagal Terhubung
- Hapus pairing printer dari perangkat
- Pair ulang dari awal
- Pastikan printer tidak terhubung ke perangkat lain
- Restart printer (matikan, nyalakan ulang)

### Cetak Gagal
- Periksa status koneksi printer
- Coba Test Print dari pengaturan
- Pastikan printer memiliki kertas
- Periksa level baterai printer (jika menggunakan baterai)

### Hasil Cetak Tidak Rapi
- Periksa ukuran kertas printer (58mm vs 80mm)
- Sesuaikan width parameter di `esc-pos-formatter.ts`
- Reset printer ke factory settings
