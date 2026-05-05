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

| File              | Keterangan                                                            |
| ----------------- | --------------------------------------------------------------------- |
| `.env`            | Local development default                                             |
| `.env.staging`    | Staging; package/bundle id berbeda agar bisa ter-install berdampingan |
| `.env.production` | Production                                                            |
| `.env.example`    | Template variabel                                                     |

| Variabel                            | Keterangan                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`               | Base URL `satset-api` tanpa path tambahan, mis. `http://127.0.0.1:3000`                 |
| `EXPO_PUBLIC_ONESIGNAL_APP_ID`      | OneSignal App ID untuk push kasir; kosong berarti push runtime dilewati                 |
| `EXPO_PUBLIC_POS_DEMO_SEED`         | `true` hanya untuk demo data lokal; default produksi `false`                            |
| `EXPO_PUBLIC_APP_NAME`              | Nama app yang muncul di device                                                          |
| `EXPO_PUBLIC_APP_SLUG`              | Expo slug                                                                               |
| `EXPO_PUBLIC_APP_SCHEME`            | Deep-link scheme                                                                        |
| `EXPO_PUBLIC_ANDROID_PACKAGE`       | Android package id                                                                      |
| `EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER` | iOS bundle identifier                                                                   |
| `EXPO_PUBLIC_ONESIGNAL_MODE`        | `development` untuk dev/staging, `production` untuk production                          |
| `EAS_PROJECT_ID`                    | Opsional setelah project di-link dengan EAS; juga bisa ditulis otomatis oleh `eas init` |

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

## EAS Build

`eas.json` menyediakan tiga profile:

| Profile       | Environment source                               | Output                              | Identitas app                                               |
| ------------- | ------------------------------------------------ | ----------------------------------- | ----------------------------------------------------------- |
| `development` | `APP_ENV=development`, lalu `.env.development`   | Internal dev client / APK Android   | `com.sisatset.kasir.dev` / `com.sisatset.kasir.dev`         |
| `staging`     | `APP_ENV=staging`, lalu `.env.staging`           | Internal distribution / APK Android | `com.sisatset.kasir.staging` / `com.sisatset.kasir.staging` |
| `production`  | `APP_ENV=production`, lalu `.env.production`     | Store build                         | `com.sisatset.kasir` / `com.sisatset.kasir`                 |

Perintah build:

```bash
pnpm run eas:build:dev:android
pnpm run eas:build:staging:android
pnpm run eas:build:prod:android
pnpm run eas:build:dev:ios
pnpm run eas:build:staging:ios
pnpm run eas:build:prod:ios
pnpm run eas:build:staging
pnpm run eas:build:prod
```

Submit production:

```bash
pnpm run eas:submit:prod
```

Catatan EAS:

- Install dan login EAS CLI terlebih dahulu jika belum tersedia: `npm install -g eas-cli`, lalu `eas login`.
- Link project ke EAS jika belum pernah dilakukan: `pnpm run eas:init`. Command ini biasanya menulis `extra.eas.projectId` ke config.
- `eas.json` memakai `cli.requireCommit=true`, jadi commit perubahan sebelum menjalankan cloud build.
- `cli.appVersionSource` memakai `remote`; production build akan auto-increment build number/version code dari EAS.
- `eas.json` hanya set `APP_ENV`; nilai detail diambil dari `.env.development`, `.env.staging`, atau `.env.production` lewat `app.config.js`.
- Environment variable yang diset di EAS Dashboard/CLI tetap menang atas nilai file `.env.<APP_ENV>`, karena `app.config.js` hanya mengisi nilai dari file saat `process.env` belum punya key tersebut.
- Ganti `EXPO_PUBLIC_API_URL` staging di `.env.staging` dari placeholder `https://staging-api.example.com` ke URL staging API yang benar sebelum build.
- Jika OneSignal dipakai, isi `EXPO_PUBLIC_ONESIGNAL_APP_ID` di file env atau lewat EAS environment variable yang sesuai.

## Peran dalam ekosistem

- Titik utama **checkout** dan **pembayaran awal** untuk walk-in, serta konfirmasi pembayaran order web.
- Integrasi KDS/ready mengikuti backend: stok tidak dikurangi lokal saat checkout; stok final dipotong di backend ketika KDS mengambil order.
