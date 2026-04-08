# Fitur Manajemen Shift

Kembali ke summary: [app-summary.md](../app-summary.md)

## Tujuan

Fitur ini mengatur awal dan akhir sesi kerja kasir dalam satu shift operasional.

## Cakupan Fitur

- buka shift
- input modal awal kas
- pemilihan slot shift: pagi, siang, malam
- tutup shift
- hitung kas akhir
- rekap transaksi per metode pembayaran
- rekonsiliasi kas aktual vs kas seharusnya

## Peran Dalam Aplikasi

- menjadi fondasi pencatatan transaksi harian
- membatasi konteks transaksi dan riwayat berdasarkan shift aktif
- membantu kasir melakukan closing operasional

## Area yang Terkait

- buka shift
- tutup shift
- ringkasan shift pada header aplikasi
- hubungan dengan order dan pembayaran

## Catatan

- Shift dipakai sebagai konteks utama untuk pelaporan kasir dan riwayat transaksi.
