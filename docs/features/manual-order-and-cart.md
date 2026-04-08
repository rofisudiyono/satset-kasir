# Fitur Input Manual, Keranjang, dan Hold Order

Kembali ke summary: [app-summary.md](../app-summary.md)

## Tujuan

Fitur ini digunakan kasir untuk membuat pesanan langsung dari pelanggan yang datang ke toko.

## Cakupan Fitur

- input manual pesanan dari katalog produk
- pencarian dan pemilihan produk
- pemilihan varian / modifier
- catatan per item
- barcode scanner untuk tambah item
- keranjang transaksi
- informasi pelanggan
- mode dine in / takeaway / delivery
- hold order / pesanan ditahan

## Peran Dalam Aplikasi

- menjadi flow utama untuk transaksi walk-in
- mengumpulkan item order sebelum masuk ke pembayaran
- menjaga fleksibilitas operasional saat order belum siap dibayar

## Area yang Terkait

- tab Input Manual
- halaman transaksi baru
- halaman keranjang
- pesanan ditahan
- barcode scanner

## Catatan

- Fitur ini terhubung erat dengan pembayaran karena order yang dibuat dari keranjang akan diteruskan ke flow pembayaran.
