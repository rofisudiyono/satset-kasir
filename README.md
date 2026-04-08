# Kasirin Aja - POS Cashier Application 🚀

A tablet-oriented POS (Point of Sale) cashier application for daily retail/restaurant operations.

## Features

- 🔐 **Cashier Authentication** - Login with session persistence
- ⏰ **Shift Management** - Open/close shift with cash reconciliation
- 🛒 **Manual Order Entry** - Product catalog with variants and categories
- 📋 **Shopping Cart** - Hold orders, customer info, promo codes
- 💳 **Multi-Payment Processing** - Cash, QRIS, Transfer, EDC, E-Wallet with split bill support
- 🧾 **Receipt Printing** - PDF generation, Bluetooth thermal printer, and sharing
- 🌐 **Web Orders** - Manage online orders from QR/web
- 🍳 **Kitchen Display Integration** - Real-time order status from KDS
- 📜 **Order History** - Filter, void, refund, and payment tracking
- 📷 **Barcode Scanner** - Camera-based product scanning
- ⚙️ **Store Configuration** - Store info, payment methods, operating hours
- 🔵 **Bluetooth Printing** - Direct printing to thermal printers

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Tech Stack

- **Framework**: Expo 55 with Expo Router
- **UI**: Tamagui 2.0 + Poppins Font
- **State Management**: Jotai with MMKV persistence
- **Platform**: React Native (iOS, Android, Web)
- **Language**: TypeScript

## Documentation

Comprehensive feature documentation is available in the [`docs/`](./docs/) directory:

- [App Summary](./docs/app-summary.md) - Overview and feature list
- [Features](./docs/features/) - Detailed documentation per feature

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- Learn more about the TypeScript setup in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
