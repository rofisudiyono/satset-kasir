# Design Spec: "A _ Daun" Redesign — pos-kasir

**Date:** 2026-05-24  
**Scope:** Full app redesign — all screens, mobile + tablet  
**Constraint:** Logic unchanged; only visual layer modified

---

## 1. Design Principles

"A _ Daun" = Clean · Airy · Nature-inspired. No gradients, no heavy shadows. Flat white surfaces on a light sage canvas.

- **Flat surfaces** — no gradient headers
- **Emerald accent** — one primary action color (#047857), used sparingly
- **Readable typography** — Plus Jakarta Sans, tight type scale
- **Airy spacing** — generous padding, minimal visual noise

---

## 2. Color Tokens

### Replace in `src/themes/brand.ts` and `src/themes/Colors.ts`

| Token | Old value | New value |
|---|---|---|
| `bg-screen` | `#f5f7f5` | `#F7F8F6` |
| `surface` | `#FFFFFF` | `#FFFFFF` |
| `surface-muted` | `#ecfdf5` | `#E6F4EE` |
| `border` | `rgba(11,31,23,0.08)` | `rgba(23,31,27,0.08)` |
| `border-strong` | `rgba(11,31,23,0.16)` | `rgba(23,31,27,0.14)` |
| `ink-900` (text) | `#0b1f17` | `#171F1B` |
| `ink-500` (secondary) | `#5b7268` | `#5B6660` |
| `ink-300` (muted) | `#8a9c93` | `#9AABA3` |
| `primary-700` | `#059669` | `#047857` |
| `primary-50` | `#ecfdf5` | `#E6F4EE` |
| `danger-600` | `#e11d48` | `#C0392B` |
| `headerGradientTop/Mid/Bottom` | removed | N/A — no gradient |

All gradient-related tokens (`headerGradientTop`, `headerGradientMid`, `headerGradientBottom`) are removed. `buttonSolid` = `#047857`.

---

## 3. Typography

Font stack is unchanged (system-ui in tamagui.config). The design uses **Plus Jakarta Sans** — this is already loaded at the native layer via Expo. No new font files needed.

Type scale stays the same; only color values change to the new ink tokens.

---

## 4. Component: `AppChip` (new — `src/components/atoms/AppChip.tsx`)

A single reusable chip used for filter chips, sub-tabs, and nav tabs.

**Props:**
```ts
interface AppChipProps {
  label: string
  active?: boolean
  count?: number          // shows badge e.g. "18"
  onPress?: () => void
  size?: 'sm' | 'md'
}
```

**Visual:**
- `active=true`: bg `#047857`, text white, border none
- `active=false`: bg transparent, border `rgba(23,31,27,0.12)`, text `#5B6660`
- `count` badge: small circle bg `#E6F4EE`, text `#047857` (or white on active)
- Border radius: 100 (pill shape)
- Height sm=28, md=34

---

## 5. Component: `AvatarBadge` (new — `src/components/atoms/AvatarBadge.tsx`)

Initial-letter avatar circle.

**Props:**
```ts
interface AvatarBadgeProps {
  name: string      // extracts initials (e.g. "Zahra" → "ZA", "Budi Santoso" → "BS")
  size?: number     // default 36
  bg?: string
  textColor?: string
}
```

---

## 6. Component: `ShiftInfoBanner` (new — `src/components/molecules/ShiftInfoBanner.tsx`)

Displays shift slot + start time in a compact row. Used inside SideNav.

**Props:**
```ts
interface ShiftInfoBannerProps {
  slot: string          // e.g. "PAGI"
  startTime?: string    // e.g. "07:30"
  isActive: boolean
}
```

**Visual:** small badge row: `[PAGI]  Aktif sejak 07:30`

---

## 7. Component: `SubTabBar` (new — `src/components/molecules/SubTabBar.tsx`)

Horizontal scrollable tab bar using `AppChip` internally.

**Props:**
```ts
interface SubTabBarProps {
  tabs: Array<{ key: string; label: string; count?: number }>
  activeKey: string
  onTabPress: (key: string) => void
}
```

Renders a `ScrollView` horizontal with `AppChip` items. No logic, purely display.

---

## 8. Component: `TopNavHeader` (redesign — `src/components/layout/TopNavHeader.tsx`)

**Before:** LinearGradient background (mint→teal), white text, translucent chips  
**After:** Flat white background, dark text, clean chip row

### Structure (mobile + tablet shared header):
```
┌─────────────────────────────────────────────────────────┐
│ [logo] Cafe Models                    [avatar] Zahra     │
│        Siliragung · Zahra                       Kasir    │
├─────────────────────────────────────────────────────────┤
│ [Pesanan Web] [Input Manual] [Riwayat] [Siap Diantar 1] │
└─────────────────────────────────────────────────────────┘
```

- Remove `LinearGradient` import and usage
- Background: `#FFFFFF`, border-bottom: `rgba(23,31,27,0.08)` 1px
- Text colors: ink-900 for primary, ink-500 for secondary
- Nav chips use `AppChip` component
- Logo circle: bg `#E6F4EE`, icon color `#047857`
- Shift pill: bg `#E6F4EE`, text ink-900
- "Tutup Shift" action button: bg `#C0392B` (only when shift active, else bg ink-100)
- Action icon buttons (notifications, bluetooth, person): bg `#F7F8F6`, icon ink-500
- All logic (routes, refresh, modal) is unchanged

---

## 9. Component: `SideNav` (redesign — `src/components/layout/SideNav.tsx`)

**Tablet only.** White sidebar, 220px wide.

### New layout:
```
[logo] Cafe Models
       Siliragung · Zahra
───────────────────────
[PAGI] Aktif sejak 07:30    [Tutup Shift ←red]
───────────────────────
[ZA]  Zahra · Kasir
───────────────────────
  ● Pesanan Web
  ● Input Manual  
  ● Riwayat
───────────────────────
  [bag] Siap Diantar   [1 READY]
  [cal] Reservasi      Segera hadir
  [↺]   Refresh
```

- Brand section: logo icon bg `#E6F4EE`, icon color `#047857`
- `ShiftInfoBanner` replaces the old shift pill
- `AvatarBadge` for cashier avatar
- Nav items: active bg `#E6F4EE`, active icon/text `#047857`; inactive text `#5B6660`
- "Tutup Shift" button: bg `#C0392B`, text white, full width, radius 10
- Footer items (Siap Diantar, Reservasi, Refresh): plain rows with icon + text
- All routing logic unchanged

---

## 10. Component: `ProductCard` (redesign — `src/features/catalog/components/ProductCard/ProductCard.tsx`)

Add SKU display and category label pill. Layout restructured.

### New layout:
```
┌────────────────────────────┐
│ [Kopi pill]                │  ← category badge top-left
│                            │
│ [image or icon area]       │  ← unchanged, same logic
│                            │
├────────────────────────────┤
│ Americano Hot              │  ← product name
│ SKU KP001           [+]   │  ← sku + add button same row
│ Rp 18.000                  │  ← price below
└────────────────────────────┘
```

**New prop added:**
```ts
sku?: string   // displayed as "SKU KP001" in muted text
```

**Visual changes:**
- Card: `borderRadius: 14`, `borderColor: rgba(23,31,27,0.08)`, `borderWidth: 1`, no shadow
- Image area bg: unchanged (uses `categoryIconBg`)
- Category pill: absolute top-left over image, bg `rgba(255,255,255,0.88)`, text ink-500, `borderRadius: 999`, `paddingH: 8, paddingV: 3`
- Product name: ink-900, fontWeight 600
- SKU: ink-300, fontSize 11, `letterSpacing: 0.4` (no special font, just muted caption style)
- Price: `#047857`, fontWeight 700
- Add button: bg `#047857`, radius 8, size 30×30

**Existing props unchanged.** `stockStatus`, `onAdd`, `availabilityReason`, etc. work identically.

---

## 11. Screen: Login (`src/features/auth/screens/LoginScreen.tsx`)

- Background: `#F7F8F6`
- Card: white, borderRadius 16, border `rgba(23,31,27,0.08)`
- Primary button: bg `#047857`
- Input borders: follow new `AppInput` tokens

---

## 12. Screen: Buka Shift (`src/app/mobile/buka-shift.tsx` + `src/app/tablet/buka-shift.tsx`)

- Follow same token updates (button color, background)
- No layout changes

---

## 13. Screen: Keranjang / Cart

- Panel headers: ink-900 on white surface
- CTA "Bayar" button: bg `#047857`, full width, radius 14
- `CustomerInfoCard` and `PromoCard`: use new border token

---

## 14. Bottom Bar / CartBar (Mobile)

`src/features/transactions/components/transaksi-baru/CartBar.tsx`

- Background white, border-top `rgba(23,31,27,0.08)`
- "Bayar" button: bg `#047857`, text white
- Item count chip: bg `#E6F4EE`, text `#047857`

---

## 15. Other Screens

All other screens (Tutup Shift, Metode Pembayaran, Riwayat, etc.) automatically inherit the new tokens since they use `BrandColors` and Tamagui theme tokens. No per-screen changes needed beyond token update.

---

## 16. What Does NOT Change

- All API calls, data fetching, state management (Jotai atoms)
- Navigation/routing logic
- Auth flow
- Shift open/close flow
- Cart logic, payment logic
- All TypeScript types/interfaces (except `ProductCardProps` gains optional `sku`)
- Tamagui config structure

---

## 17. Implementation Order

1. Update `brand.ts` + `Colors.ts` tokens
2. Create `AppChip`, `AvatarBadge`, `ShiftInfoBanner`, `SubTabBar` components
3. Redesign `TopNavHeader`
4. Redesign `SideNav`
5. Redesign `ProductCard`
6. Update `CartBar` / BottomBar
7. Verify `LoginScreen`, `BukaShiftScreen`, `CartPanel` inherit correctly
8. Smoke-test on both mobile and tablet layouts
