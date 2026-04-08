# Kasirin Aja — Ringkasan Aplikasi

Dokumen ini adalah pintu masuk dokumentasi fitur aplikasi `kasirin-aja`.
Fokus aplikasi saat ini adalah **operasional kasir berbasis tablet** untuk alur transaksi harian di toko/tenant.

## Gambaran Singkat

`Kasirin Aja` adalah aplikasi POS kasir yang mendukung:

- login kasir
- buka dan tutup shift
- input order manual
- keranjang dan hold order
- pembayaran multi-metode, split bill, partial payment, dan cetak resi
- web orders
- siap antar / integrasi status dapur
- riwayat order
- pengaturan toko dan metode pembayaran
- scanner barcode

## Daftar Fitur

1. **Autentikasi Kasir**  
   Dokumen: [features/authentication.md](./features/authentication.md)

2. **Manajemen Shift**  
   Dokumen: [features/shift-management.md](./features/shift-management.md)

3. **Input Manual, Keranjang, dan Hold Order**  
   Dokumen: [features/manual-order-and-cart.md](./features/manual-order-and-cart.md)

4. **Pembayaran dan Resi**  
   Dokumen: [features/payment-and-receipt.md](./features/payment-and-receipt.md)

5. **Web Orders**  
   Dokumen: [features/web-orders.md](./features/web-orders.md)

6. **Siap Antar dan Status Dapur**  
   Dokumen: [features/ready-delivery-and-kds.md](./features/ready-delivery-and-kds.md)

7. **Riwayat Order**
   Dokumen: [features/order-history.md](./features/order-history.md)

8. **Pengaturan Toko dan Metode Pembayaran**
   Dokumen: [features/store-settings-and-payment-config.md](./features/store-settings-and-payment-config.md)

9. **Barcode Scanner**
   Dokumen: [features/barcode-scanner.md](./features/barcode-scanner.md)

## Struktur Operasional Utama

Alur penggunaan kasir secara umum:

1. Kasir login ke aplikasi
2. Kasir membuka shift
3. Kasir menerima order dari input manual atau web order
4. Kasir memproses pembayaran
5. Order masuk ke riwayat dan, bila relevan, ke alur siap antar
6. Kasir menutup shift di akhir operasional

## Catatan

- Dokumentasi ini bersifat fungsional, bukan spesifikasi teknis detail.
- Setiap fitur punya dokumen terpisah agar lebih mudah dibaca dan diperbarui.
- Untuk backlog migrasi/alignment flow kasir, lihat [todo-kasir-pos-dashboard-alignment.md](./todo-kasir-pos-dashboard-alignment.md).
