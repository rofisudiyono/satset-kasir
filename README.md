# satset-kasir

Aplikasi **Expo (React Native)** untuk peran **kasir**: shift, order web pending, checkout walk-in, pembayaran awal, riwayat, dan alur **siap antar**.

## Flow resmi (ringkas)

1. Login → konteks `tenantId` / `branchId` dari `satset-api`.
2. Buka shift → operasional order mengikat cabang + shift aktif.
3. Order manual kasir dibayar di awal lewat `POST /api/kasir/orders/checkout`, lalu masuk KDS sebagai order `PAID + QUEUED`.
4. Order dari **customer WEB** masuk ke `pending_web_orders`; kasir mengonfirmasi pembayaran lewat `POST /api/kasir/orders/pending-web/{id}/confirm`, lalu order masuk KDS.
5. KDS mengambil order dan backend memotong stok saat `take`; setelah semua station selesai, order menjadi `READY`.
6. Kasir melihat `GET /api/kasir/orders/ready` sebagai daftar **siap diantar** dan hanya dapat menandai `delivered` untuk order `PAID + READY`.

Detail pipeline: [sync-flow-satset-ecosystem.md](../satset-dashboard/docs/sync-flow-satset-ecosystem.md) (atau salin dari repo `satset-dashboard` jika tidak dalam satu folder monorepo).

## Environment

Salin `.env.example` ke `.env` dan sesuaikan:

| Variabel | Keterangan |
|----------|------------|
| `EXPO_PUBLIC_API_URL` | Base URL `satset-api` tanpa path tambahan, mis. `http://127.0.0.1:3000` |
| `EXPO_PUBLIC_POS_DEMO_SEED` | `true` hanya untuk demo data lokal; default produksi `false` |

## Perintah

```bash
npm install
npx expo start
```

## Peran dalam ekosistem

- Titik utama **checkout** dan **pembayaran awal** untuk walk-in, serta konfirmasi pembayaran order web.
- Integrasi KDS/ready mengikuti backend: stok tidak dikurangi lokal saat checkout; stok final dipotong di backend ketika KDS mengambil order.
