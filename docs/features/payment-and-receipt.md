# Fitur Pembayaran dan Resi

Kembali ke summary: [app-summary.md](../app-summary.md)

## Tujuan

Fitur ini menangani penyelesaian pembayaran order dan menyediakan hasil transaksi yang bisa dicetak atau dibagikan.

## Cakupan Fitur

- pilih metode pembayaran
- pembayaran tunai
- QRIS
- transfer
- kartu / EDC
- e-wallet
- full payment
- partial payment
- split bill per nominal
- split bill per item
- status pembayaran order
- halaman pembayaran sukses
- cetak resi
- bagikan ringkasan pembayaran

## Peran Dalam Aplikasi

- mengubah order menjadi transaksi yang tercatat
- mengupdate status order dan kontribusi ke rekap shift
- menghasilkan bukti transaksi untuk pelanggan dan kasir

## Area yang Terkait

- pilih pembayaran
- pembayaran tunai
- pembayaran sukses / preview resi
- metode pembayaran toko

## Catatan

- Pembayaran adalah penghubung utama antara order, riwayat, dan rekap shift.
