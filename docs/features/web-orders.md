# Fitur Web Orders

Kembali ke summary: [app-summary.md](../app-summary.md)

## Tujuan

Fitur ini digunakan untuk menangani order yang masuk dari kanal web atau QR sebelum dikonfirmasi oleh kasir.

## Cakupan Fitur

- daftar web order aktif
- status pending untuk order yang menunggu tindakan kasir
- timeout order 30 menit
- order expired
- konfirmasi order agar masuk ke proses pembayaran

## Peran Dalam Aplikasi

- menjadi jembatan antara kanal order digital dan proses kasir di toko
- membantu kasir memisahkan order web yang aktif dari order yang sudah tidak valid

## Area yang Terkait

- tab Web Orders
- data order POS
- pembayaran setelah order dikonfirmasi

## Catatan

- Flow ini dirancang untuk mendukung order masuk yang tidak berasal dari input manual kasir.
