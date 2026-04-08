# Fitur Siap Antar dan Status Dapur

Kembali ke summary: [app-summary.md](../app-summary.md)

## Tujuan

Fitur ini membantu kasir memantau order yang sudah siap dari dapur dan menandai order yang sudah diantar / diserahkan.

## Cakupan Fitur

- daftar order dengan status READY
- aksi `Sudah Diantar`
- status fulfillment order
- simulasi event dari dapur
- notifikasi order siap
- jembatan integrasi realtime dari dapur / KDS

## Peran Dalam Aplikasi

- menyambungkan proses kasir dengan proses produksi / dapur
- membantu operasional penyerahan order ke pelanggan

## Area yang Terkait

- tab Siap Antar
- event fulfillment
- notifikasi READY

## Catatan

- Fitur ini sudah menyiapkan pondasi integrasi KDS walau konteks aplikasinya tetap fokus ke role kasir.
