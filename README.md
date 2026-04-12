# satset-kasir

Aplikasi **Expo (React Native)** untuk peran **kasir**: shift, antrian order, pembayaran, riwayat, dan alur **siap antar / bayar** untuk pesanan web (manual approve vs bayar).

## Flow resmi (ringkas)

1. Login → konteks `tenantId` / `branchId` dari `satset-api`.
2. Buka shift → operasional order mengikat cabang + shift aktif.
3. Order masuk dari kasir atau dari **customer WEB** (sumber `WEB`) ke pipeline backend yang sama.
4. Setelah masak selesai → kasir memproses pembayaran atau **manual approve** sesuai status, lalu dapat menandai **`delivered`** saat pesanan di antar.

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

- Titik utama **checkout** dan **pembayaran** untuk walk-in dan pelengkap alur web.
- Integrasi KDS/ready mengikuti backend; lihat dokumen sync untuk status bridge vs state lokal.
