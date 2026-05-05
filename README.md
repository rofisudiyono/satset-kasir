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

Konfigurasi native Expo sekarang memakai `app.config.js`. Base config tetap ada di
`app.json`, lalu environment dipilih lewat `APP_ENV` atau script package.

File environment:

| File | Keterangan |
|------|------------|
| `.env` | Local development default |
| `.env.staging` | Staging; package/bundle id berbeda agar bisa ter-install berdampingan |
| `.env.production` | Production |
| `.env.example` | Template variabel |

| Variabel | Keterangan |
|----------|------------|
| `EXPO_PUBLIC_API_URL` | Base URL `satset-api` tanpa path tambahan, mis. `http://127.0.0.1:3000` |
| `EXPO_PUBLIC_ONESIGNAL_APP_ID` | OneSignal App ID untuk push kasir; kosong berarti push runtime dilewati |
| `EXPO_PUBLIC_POS_DEMO_SEED` | `true` hanya untuk demo data lokal; default produksi `false` |
| `EXPO_PUBLIC_APP_NAME` | Nama app yang muncul di device |
| `EXPO_PUBLIC_APP_SLUG` | Expo slug |
| `EXPO_PUBLIC_APP_SCHEME` | Deep-link scheme |
| `EXPO_PUBLIC_ANDROID_PACKAGE` | Android package id |
| `EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER` | iOS bundle identifier |
| `EXPO_PUBLIC_ONESIGNAL_MODE` | `development` untuk dev/staging, `production` untuk production |

Catatan: `.env.staging` masih memakai placeholder `https://staging-api.example.com`.
Ganti ke URL staging `satset-api` yang benar sebelum build.

## Perintah

```bash
npm install
npx expo start
```

Perintah environment:

```bash
pnpm run start:staging
pnpm run start:prod
pnpm run android:staging
pnpm run android:prod
pnpm run android:phone:staging
pnpm run android:phone:prod
pnpm run ios:staging
pnpm run ios:prod
pnpm run config:staging
pnpm run config:prod
```

## Peran dalam ekosistem

- Titik utama **checkout** dan **pembayaran awal** untuk walk-in, serta konfirmasi pembayaran order web.
- Integrasi KDS/ready mengikuti backend: stok tidak dikurangi lokal saat checkout; stok final dipotong di backend ketika KDS mengambil order.
