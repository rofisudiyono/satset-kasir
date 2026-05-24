# A_Daun Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign seluruh visual aplikasi pos-kasir mengikuti desain "A _ Daun" — flat white surface, emerald accent, clean airy typography — tanpa mengubah satu pun logika bisnis.

**Architecture:** Update token warna di `brand.ts` + `Colors.ts`, buat 2 atom baru (`AppChip`, `AvatarBadge`) dan 1 molecule baru (`ShiftInfoBanner`), lalu redesign 4 komponen utama (`TopNavHeader`, `SideNav`, `ProductCard`, `CartBar`). Semua screen lain mewarisi perubahan secara otomatis via token.

**Tech Stack:** React Native, StyleSheet, Tamagui (token/theme), Expo LinearGradient (dihapus dari TopNavHeader), Ionicons, Jotai

---

## File Map

### Diubah
| File | Perubahan |
|---|---|
| `src/themes/brand.ts` | Token warna baru, hapus gradient keys |
| `src/themes/Colors.ts` | Update ink, primary, danger values |
| `src/components/layout/TopNavHeader.tsx` | Hapus LinearGradient, flat white design |
| `src/components/layout/SideNav.tsx` | Tambah ShiftInfoBanner, AvatarBadge, redesign layout |
| `src/features/catalog/components/ProductCard/ProductCard.tsx` | Tambah category pill, SKU, flat card |
| `src/features/catalog/components/ProductCard/ProductCard.types.ts` | Tambah `sku` + `categoryLabel` props |
| `src/features/transactions/components/transaksi-baru/ProductGrid.tsx` | Pass `sku` + `categoryLabel` ke ProductCard |
| `src/features/transactions/components/transaksi-baru/CartBar.tsx` | Flat white, tombol Bayar emerald |
| `src/components/atoms/index.ts` | Export AppChip, AvatarBadge |

### Dibuat
| File | Isi |
|---|---|
| `src/components/atoms/AppChip.tsx` | Pill chip: active=emerald solid, inactive=outline |
| `src/components/atoms/AvatarBadge.tsx` | Initial-letter avatar circle |
| `src/components/molecules/ShiftInfoBanner.tsx` | Shift slot + waktu aktif row |

---

## Task 1: Update Color Tokens

**Files:**
- Modify: `src/themes/brand.ts`
- Modify: `src/themes/Colors.ts`

- [ ] **Step 1: Update `brand.ts`**

Ganti seluruh isi file dengan token baru:

```ts
// src/themes/brand.ts
export const BrandColors = {
  deep: "#047857",
  deepDark: "#065f46",
  sage: "#059669",
  sageLight: "#10b981",
  mid: "#047857",
  green: "#059669",
  buttonSolid: "#047857",
  lime: "#d1fae5",
  accentOnDark: "#E6F4EE",
  canvas: "#F7F8F6",
  surface: "#FFFFFF",
  surfaceWarm: "#FFFFFF",
  tint: "#E6F4EE",
  tintStrong: "#d1fae5",
  text: "#171F1B",
  textMuted: "#5B6660",
  border: "rgba(23, 31, 27, 0.08)",
  borderStrong: "rgba(23, 31, 27, 0.14)",
  coral: "#C0392B",
  coralPressed: "#a93226",
  // Gradient keys dihapus — tidak ada gradient di design baru
} as const;
```

- [ ] **Step 2: Update `Colors.ts` — primary dan danger values**

Ubah nilai-nilai berikut (hanya yang perlu berubah):

```ts
// Di dalam ColorPrimary enum:
primary50 = "#E6F4EE",    // was #f0fdf4
primary600 = "#047857",   // was #059669  ← primary action
primary700 = "#065f46",   // was #047857

// Di dalam ColorDanger enum:
danger600 = "#C0392B",    // was #e11d48
danger700 = "#a93226",    // was #be123c

// Di dalam ColorNeutral enum:
neutral50 = "#F7F8F6",    // was #f5f7f5  ← bg screen
neutral900 = "#171F1B",   // was #0b1f17  ← text primary
neutral500 = "#5B6660",   // was #5b7268  ← text secondary
neutral400 = "#9AABA3",   // was #8a9c93  ← text muted

// Di dalam ColorSurface enum:
canvas = "#F7F8F6",       // was #f5f7f5
```

- [ ] **Step 3: Commit**

```bash
git add src/themes/brand.ts src/themes/Colors.ts
git commit -m "style: update A_Daun color tokens — flat emerald palette"
```

---

## Task 2: Create `AppChip` Atom

**Files:**
- Create: `src/components/atoms/AppChip.tsx`
- Modify: `src/components/atoms/index.ts`

- [ ] **Step 1: Buat file `AppChip.tsx`**

```tsx
// src/components/atoms/AppChip.tsx
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { BrandColors } from "@/themes/brand";
import { TextBodySm, TextCaption } from "./Typography";

export interface AppChipProps {
  label: string;
  active?: boolean;
  count?: number;
  onPress?: () => void;
  size?: "sm" | "md";
}

export function AppChip({
  label,
  active = false,
  count,
  onPress,
  size = "md",
}: AppChipProps) {
  const isSmall = size === "sm";

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        isSmall ? styles.chipSm : styles.chipMd,
        active ? styles.chipActive : styles.chipInactive,
      ]}
    >
      <TextBodySm
        fontWeight="600"
        fontSize={isSmall ? 12 : 13}
        color={active ? BrandColors.surface : BrandColors.textMuted}
      >
        {label}
      </TextBodySm>
      {count !== undefined && (
        <View style={[styles.countBadge, active && styles.countBadgeActive]}>
          <TextCaption
            fontWeight="700"
            fontSize={10}
            color={active ? BrandColors.surface : BrandColors.deep}
          >
            {count}
          </TextCaption>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
  },
  chipSm: {
    height: 28,
    paddingHorizontal: 12,
  },
  chipMd: {
    height: 34,
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: BrandColors.buttonSolid,
  },
  chipInactive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(23, 31, 27, 0.12)",
  },
  countBadge: {
    backgroundColor: BrandColors.tint,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  countBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
```

- [ ] **Step 2: Export dari `index.ts`**

Tambahkan baris berikut di akhir `src/components/atoms/index.ts`:

```ts
export { AppChip } from "./AppChip";
export type { AppChipProps } from "./AppChip";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/atoms/AppChip.tsx src/components/atoms/index.ts
git commit -m "feat: add AppChip atom — pill chip for filter and nav tabs"
```

---

## Task 3: Create `AvatarBadge` Atom

**Files:**
- Create: `src/components/atoms/AvatarBadge.tsx`
- Modify: `src/components/atoms/index.ts`

- [ ] **Step 1: Buat file `AvatarBadge.tsx`**

```tsx
// src/components/atoms/AvatarBadge.tsx
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { BrandColors } from "@/themes/brand";
import { TextBodySm } from "./Typography";

export interface AvatarBadgeProps {
  name: string;
  size?: number;
  bg?: string;
  textColor?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AvatarBadge({
  name,
  size = 36,
  bg = BrandColors.tint,
  textColor = BrandColors.deep,
}: AvatarBadgeProps) {
  const initials = useMemo(() => getInitials(name), [name]);
  const fontSize = Math.round(size * 0.38);

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <TextBodySm
        fontWeight="700"
        fontSize={fontSize}
        color={textColor}
        lineHeight={size}
      >
        {initials}
      </TextBodySm>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
});
```

- [ ] **Step 2: Export dari `index.ts`**

Tambahkan di `src/components/atoms/index.ts`:

```ts
export { AvatarBadge } from "./AvatarBadge";
export type { AvatarBadgeProps } from "./AvatarBadge";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/atoms/AvatarBadge.tsx src/components/atoms/index.ts
git commit -m "feat: add AvatarBadge atom — initial-letter circle avatar"
```

---

## Task 4: Create `ShiftInfoBanner` Molecule

**Files:**
- Create: `src/components/molecules/ShiftInfoBanner.tsx`

- [ ] **Step 1: Buat file `ShiftInfoBanner.tsx`**

```tsx
// src/components/molecules/ShiftInfoBanner.tsx
import React from "react";
import { StyleSheet, View } from "react-native";

import { BrandColors } from "@/themes/brand";
import { TextBodySm, TextCaption } from "@/components/atoms/Typography";

export interface ShiftInfoBannerProps {
  slot: string;       // e.g. "PAGI"
  startTime?: string; // e.g. "07:30"
  isActive: boolean;
}

export function ShiftInfoBanner({ slot, startTime, isActive }: ShiftInfoBannerProps) {
  return (
    <View style={styles.row}>
      <View style={styles.slotPill}>
        <TextCaption fontWeight="700" color={BrandColors.deep} fontSize={10}>
          {slot}
        </TextCaption>
      </View>
      <TextCaption color={BrandColors.textMuted} fontSize={11}>
        {isActive && startTime ? `Aktif sejak ${startTime}` : "Belum buka"}
      </TextCaption>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slotPill: {
    backgroundColor: BrandColors.tint,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/molecules/ShiftInfoBanner.tsx
git commit -m "feat: add ShiftInfoBanner molecule — shift slot + start time row"
```

---

## Task 5: Redesign `TopNavHeader`

**Files:**
- Modify: `src/components/layout/TopNavHeader.tsx`

Hapus `LinearGradient`, ganti background ke flat white. Semua logika (routes, refresh, modal, readyOrders) **tidak berubah**.

- [ ] **Step 1: Hapus LinearGradient import, tambah AppChip import**

Cari baris:
```ts
import { LinearGradient } from "expo-linear-gradient";
```
Hapus baris tersebut.

Cari baris yang mengimport dari `@/components`:
```ts
import { IconButton, TextBodySm, TextCaption, TextH3 } from "@/components";
```
Ubah menjadi:
```ts
import { AppChip, IconButton, TextBodySm, TextCaption, TextH3 } from "@/components";
```

- [ ] **Step 2: Hapus konstanta warna gradient**

Hapus dua konstanta ini (ada di atas fungsi `TopNavHeader`):
```ts
const HEADER_TEXT_SECONDARY = "rgba(255,255,255,0.88)";
const HEADER_TEXT_MUTED = "rgba(255,255,255,0.58)";
```

Ganti dengan:
```ts
const HEADER_TEXT_SECONDARY = BrandColors.textMuted;
const HEADER_TEXT_MUTED = "rgba(23,31,27,0.35)";
```

- [ ] **Step 3: Hapus LinearGradient dari JSX**

Di dalam `return`, cari blok:
```tsx
<View style={styles.wrapper}>
  <LinearGradient
    colors={[
      BrandColors.headerGradientTop,
      BrandColors.headerGradientMid,
      BrandColors.headerGradientBottom,
    ]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.gradientBg}
  />
  <SafeAreaView edges={["top"]} style={styles.safeArea}>
```

Hapus seluruh `<LinearGradient ... />` block. Biarkan `<SafeAreaView>` tetap ada.

- [ ] **Step 4: Update styles wrapper — ganti gradient ke white**

Di `StyleSheet.create`, ubah styles berikut:

```ts
wrapper: {
  position: "relative",
  backgroundColor: BrandColors.surface,
  borderBottomWidth: 1,
  borderBottomColor: BrandColors.border,
},
gradientBg: {
  display: "none", // tidak dipakai, biarkan untuk menghindari error ref lain
},
safeArea: {
  backgroundColor: "transparent",
},
```

- [ ] **Step 5: Update brandIcon colors**

Cari `styles.brandIcon` di StyleSheet:
```ts
brandIcon: {
  width: 40,
  height: 40,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.16)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.28)",
  overflow: "hidden",
},
```
Ganti dengan:
```ts
brandIcon: {
  width: 40,
  height: 40,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: BrandColors.tint,
  borderWidth: 1,
  borderColor: BrandColors.border,
  overflow: "hidden",
},
```

Di JSX, cari ikon fallback dalam `brandIcon`:
```tsx
<Ionicons name="cafe-outline" size={22} color={ColorBase.white} />
```
Ganti warna:
```tsx
<Ionicons name="cafe-outline" size={22} color={BrandColors.deep} />
```

- [ ] **Step 6: Update TextH3 dan TextCaption di brand area dari white ke ink**

Cari di topRow:
```tsx
<TextH3 fontWeight="700" color={ColorBase.white}>
```
Ganti:
```tsx
<TextH3 fontWeight="700" color={BrandColors.text}>
```

Cari:
```tsx
<TextCaption color={HEADER_TEXT_SECONDARY}>
  {branchName && tenantName ? `${branchName} • ` : ""}{cashierLabel}
</TextCaption>
```
Tidak perlu diubah — `HEADER_TEXT_SECONDARY` sudah kita ubah ke `BrandColors.textMuted` di Step 2.

- [ ] **Step 7: Update shiftPill style**

```ts
shiftPill: {
  minWidth: 166,
  height: 38,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  paddingHorizontal: 14,
  borderRadius: 12,
  backgroundColor: BrandColors.tint,
  borderWidth: 1,
  borderColor: BrandColors.border,
},
```

Di JSX, ubah warna teks shiftPill:
```tsx
<TextCaption color={BrandColors.textMuted} fontWeight="700">
  Shift
</TextCaption>
<TextBodySm fontWeight="700" color={BrandColors.text}>
  {shiftLabel}
  {isShiftStarted ? " • Aktif" : " • Belum buka"}
</TextBodySm>
```

- [ ] **Step 8: Update primaryAction styles**

```ts
primaryActionNeutral: {
  backgroundColor: BrandColors.tint,
  borderWidth: 1,
  borderColor: BrandColors.border,
},
primaryActionDanger: {
  backgroundColor: BrandColors.coral,
},
```

Di JSX, Tutup Shift button — teks tetap white (coral bg), Buka Shift button ubah teks:
```tsx
// Buka Shift (neutral):
<Ionicons
  name={isShiftStarted ? "log-out-outline" : "play-outline"}
  size={18}
  color={isShiftStarted ? ColorBase.white : BrandColors.deep}
/>
<TextBodySm fontWeight="700" color={isShiftStarted ? ColorBase.white : BrandColors.deep}>
  {isShiftStarted ? "Tutup Shift" : "Buka Shift"}
</TextBodySm>
```

- [ ] **Step 9: Update action icon buttons**

```ts
// Dalam JSX, ganti bg dari rgba white ke tint:
// IconButton notifications, bluetooth, person:
bg={BrandColors.tint}
iconColor={BrandColors.textMuted}
```

Tiga IconButton yang ada di `actionGroup`:
```tsx
<IconButton
  iconName="notifications-outline"
  shape="square"
  size={38}
  iconSize={18}
  iconColor={BrandColors.textMuted}
  bg={BrandColors.tint}
/>
// (lalu alertDot View tetap)
<IconButton
  iconName="bluetooth-outline"
  shape="square"
  size={38}
  iconSize={18}
  iconColor={BrandColors.textMuted}
  bg={BrandColors.tint}
  onPress={() => router.push("/bluetooth-printer" as never)}
/>
<IconButton
  iconName="person-outline"
  shape="square"
  size={38}
  iconSize={18}
  iconColor={BrandColors.textMuted}
  bg={BrandColors.tint}
  onPress={() => setStaffDetailVisible(true)}
/>
```

- [ ] **Step 10: Update navRow style**

```ts
navRow: {
  gap: 8,
  alignItems: "center",
  paddingHorizontal: 8,
  paddingVertical: 6,
  backgroundColor: BrandColors.canvas,
  borderWidth: 1,
  borderColor: BrandColors.border,
  borderRadius: 18,
},
```

- [ ] **Step 11: Ganti navChip / navChipActive styles**

```ts
navChip: {
  flexDirection: "row",
  alignItems: "center",
  gap: 7,
  minHeight: 34,
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: "transparent",
},
navChipActive: {
  backgroundColor: BrandColors.buttonSolid,
},
```

Di dalam navItems.map(), ubah semua warna teks:
```tsx
<Ionicons
  name={active ? item.iconActive : item.icon}
  size={16}
  color={active ? ColorBase.white : BrandColors.textMuted}
/>
<TextBodySm fontWeight="700" color={active ? ColorBase.white : BrandColors.textMuted}>
  {item.label}
</TextBodySm>
```

- [ ] **Step 12: Update readyChip, refreshChip, comingSoonChip styles**

```ts
readyChip: {
  flexDirection: "row",
  alignItems: "center",
  gap: 7,
  minHeight: 34,
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: "transparent",
},
readyChipActive: {
  backgroundColor: "rgba(4,120,87,0.12)",
},
refreshChip: {
  flexDirection: "row",
  alignItems: "center",
  gap: 7,
  minHeight: 34,
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: BrandColors.tint,
  borderWidth: 1,
  borderColor: BrandColors.border,
},
refreshChipDisabled: {
  opacity: 0.55,
},
comingSoonChip: {
  flexDirection: "row",
  alignItems: "center",
  gap: 7,
  minHeight: 34,
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: "transparent",
},
```

Di JSX readyChip, ubah warna teks:
```tsx
// Siap Diantar chip
<Ionicons
  name={displayReadyCount > 0 ? "bag-check" : "bag-check-outline"}
  size={16}
  color={
    isSiapAntarTabActive
      ? BrandColors.deep
      : displayReadyCount > 0
        ? ColorSuccess.success600
        : BrandColors.textMuted
  }
/>
<TextBodySm
  fontWeight="700"
  color={
    isSiapAntarTabActive
      ? BrandColors.deep
      : displayReadyCount > 0
        ? ColorSuccess.success600
        : BrandColors.textMuted
  }
>
  Siap Diantar
</TextBodySm>
<TextCaption
  color={
    isSiapAntarTabActive
      ? BrandColors.deep
      : displayReadyCount > 0
        ? ColorSuccess.success600
        : HEADER_TEXT_MUTED
  }
  fontWeight={displayReadyCount > 0 ? "700" : "500"}
>
  {displayReadyCount > 0
    ? `${displayReadyCount} READY dari KDS`
    : "Belum ada READY"}
</TextCaption>
```

Refresh chip:
```tsx
<Ionicons
  name={isRefreshing ? "sync" : "refresh-outline"}
  size={16}
  color={BrandColors.deep}
/>
<TextBodySm fontWeight="700" color={BrandColors.deep}>
  Refresh
</TextBodySm>
```

Reservasi chip:
```tsx
<Ionicons name="calendar-clear-outline" size={16} color={BrandColors.textMuted} />
<TextBodySm fontWeight="700" color={BrandColors.textMuted}>
  Reservasi
</TextBodySm>
<TextCaption color={HEADER_TEXT_MUTED}>Segera hadir</TextCaption>
```

- [ ] **Step 13: Update alertDot style**

```ts
alertDot: {
  position: "absolute",
  top: -1,
  right: -1,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: BrandColors.coral,
  borderWidth: 2,
  borderColor: BrandColors.surface,
},
```

- [ ] **Step 14: Commit**

```bash
git add src/components/layout/TopNavHeader.tsx
git commit -m "style: TopNavHeader — flat white surface, remove gradient (A_Daun)"
```

---

## Task 6: Redesign `SideNav`

**Files:**
- Modify: `src/components/layout/SideNav.tsx`

Tambah `ShiftInfoBanner` dan `AvatarBadge`. Semua routing/logic tidak berubah.

- [ ] **Step 1: Tambah imports**

Di atas file, tambah import baru:

```ts
import { AvatarBadge } from "@/components/atoms/AvatarBadge";
import { ShiftInfoBanner } from "@/components/molecules/ShiftInfoBanner";
import { useAtom } from "jotai";
import { shiftDataAtom } from "@/features/shift/store/shift.store";
```

(Catatan: `isShiftStartedAtom` sudah diimport. Tambah `shiftDataAtom` jika belum ada.)

- [ ] **Step 2: Baca shiftData di dalam SideNav**

Di dalam fungsi `SideNav()`, setelah baris `const [isShiftStarted] = useAtom(isShiftStartedAtom);`, tambah:

```ts
const [shiftData] = useAtom(shiftDataAtom);
const cashierName = shiftData?.cashierName ?? "Kasir";
const shiftSlot = shiftData?.slot ?? "PAGI";
const shiftStartTime = shiftData?.startTime ?? undefined;
```

- [ ] **Step 3: Update JSX brand section**

Cari blok `{/* Brand */}`:
```tsx
{/* Brand */}
<View style={styles.brand}>
  <View style={styles.brandIcon}>
    <Ionicons name="storefront" size={22} color={ColorBase.white} />
  </View>
  <YStack gap={2}>
    <TextH3 fontWeight="700">Toko Makmur</TextH3>
    <TextCaption color="$colorSecondary">Budi Santoso</TextCaption>
  </YStack>
</View>
```

Ganti dengan:
```tsx
{/* Brand */}
<View style={styles.brand}>
  <View style={styles.brandIcon}>
    <Ionicons name="storefront" size={22} color={BrandColors.deep} />
  </View>
  <YStack gap={2} flex={1}>
    <TextH3 fontWeight="700" color={BrandColors.text}>Toko</TextH3>
    <TextCaption color={BrandColors.textMuted} numberOfLines={1}>
      Kasir App
    </TextCaption>
  </YStack>
</View>
```

- [ ] **Step 4: Tambah ShiftInfoBanner dan AvatarBadge setelah brand section**

Setelah `</View>` penutup brand section, tambah:

```tsx
{/* Shift info */}
<View style={styles.shiftBannerRow}>
  <ShiftInfoBanner
    slot={shiftSlot}
    startTime={shiftStartTime}
    isActive={isShiftStarted}
  />
  <TouchableOpacity
    activeOpacity={0.85}
    style={[
      styles.shiftBtnCompact,
      isShiftStarted ? styles.shiftBtnCompactOpen : styles.shiftBtnCompactClosed,
    ]}
    onPress={() =>
      router.push(isShiftStarted ? "/tutup-shift" : "/buka-shift")
    }
  >
    <TextBodySm
      fontWeight="700"
      color={isShiftStarted ? ColorBase.white : BrandColors.textMuted}
      fontSize={11}
    >
      {isShiftStarted ? "Tutup Shift" : "Buka Shift"}
    </TextBodySm>
  </TouchableOpacity>
</View>

{/* Kasir info */}
<View style={styles.kasirRow}>
  <AvatarBadge name={cashierName} size={32} />
  <YStack gap={1} flex={1}>
    <TextBodySm fontWeight="600" color={BrandColors.text} numberOfLines={1}>
      {cashierName}
    </TextBodySm>
    <TextCaption color={BrandColors.textMuted}>Kasir</TextCaption>
  </YStack>
</View>

<View style={styles.separator} />
```

- [ ] **Step 5: Update nav item colors**

Di dalam `NAV_ITEMS.map()`, ubah warna aktif/nonaktif:

```tsx
<TouchableOpacity
  key={item.href}
  activeOpacity={0.7}
  style={[styles.navItem, active && styles.navItemActive]}
  onPress={() => router.push(item.href as never)}
>
  <Ionicons
    name={active ? item.iconActive : item.icon}
    size={20}
    color={active ? BrandColors.deep : BrandColors.textMuted}
  />
  <TextBodySm
    fontWeight={active ? "700" : "400"}
    color={active ? BrandColors.deep : BrandColors.textMuted}
  >
    {item.label}
  </TextBodySm>
</TouchableOpacity>
```

- [ ] **Step 6: Update footer section — hapus shiftBtn lama, simplify**

Cari `{/* Shift button */}` block di footer. Ganti seluruh blok footer dengan:

```tsx
{/* Footer: Siap Antar, Reservasi, Refresh */}
<View style={styles.footer}>
  <TouchableOpacity style={styles.footerRow} onPress={() => router.push("/siap-antar" as never)}>
    <Ionicons name="bag-check-outline" size={16} color={BrandColors.textMuted} />
    <TextBodySm color={BrandColors.textMuted} flex={1}>Siap Diantar</TextBodySm>
  </TouchableOpacity>
  <View style={styles.footerRow}>
    <Ionicons name="calendar-clear-outline" size={16} color={BrandColors.textMuted} />
    <YStack flex={1} gap={1}>
      <TextBodySm color={BrandColors.textMuted}>Reservasi</TextBodySm>
      <TextCaption color="rgba(23,31,27,0.35)">Segera hadir</TextCaption>
    </YStack>
  </View>
</View>
```

- [ ] **Step 7: Update `StyleSheet.create` — ganti semua brand/shift styles**

```ts
const styles = StyleSheet.create({
  container: {
    width: 220,
    height: "100%",
    backgroundColor: BrandColors.surface,
    borderRightWidth: 1,
    borderRightColor: BrandColors.border,
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BrandColors.tint,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  shiftBannerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  shiftBtnCompact: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  shiftBtnCompactOpen: {
    backgroundColor: BrandColors.coral,
  },
  shiftBtnCompactClosed: {
    backgroundColor: BrandColors.tint,
  },
  kasirRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  separator: {
    height: 1,
    backgroundColor: BrandColors.border,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: BrandColors.tint,
  },
  footer: {
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    marginTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
});
```

- [ ] **Step 8: Tambah import BrandColors jika belum ada**

Cari baris import BrandColors di atas file — jika belum ada, tambah:
```ts
import { BrandColors } from "@/themes/brand";
```

- [ ] **Step 9: Commit**

```bash
git add src/components/layout/SideNav.tsx
git commit -m "style: SideNav — ShiftInfoBanner, AvatarBadge, flat emerald design (A_Daun)"
```

---

## Task 7: Redesign `ProductCard`

**Files:**
- Modify: `src/features/catalog/components/ProductCard/ProductCard.types.ts`
- Modify: `src/features/catalog/components/ProductCard/ProductCard.tsx`

- [ ] **Step 1: Tambah props baru di `ProductCard.types.ts`**

```ts
export interface ProductCardProps {
  name: string;
  imageUrl?: string;
  basePrice: number;
  categoryIcon: React.ComponentProps<typeof Ionicons>["name"];
  categoryIconBg: string;
  categoryIconColor: string;
  categoryLabel?: string;   // ← baru: e.g. "Kopi", "Makanan"
  sku?: string;             // ← baru: e.g. "KP001"
  stockStatus: ProductStockStatus;
  availabilityReason?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "NO_RECIPE" | "HIDDEN";
  onAdd: () => void;
  width?: number;
  compact?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}
```

- [ ] **Step 2: Update `ProductCard.tsx` — destructure props baru**

Di destructure props ProductCard, tambah `categoryLabel` dan `sku`:

```tsx
export const ProductCard = React.memo(function ProductCard({
  name,
  imageUrl,
  basePrice,
  categoryIcon,
  categoryIconBg,
  categoryIconColor,
  categoryLabel,
  sku,
  stockStatus,
  availabilityReason,
  onAdd,
  width,
  compact = false,
  style,
}: ProductCardProps) {
```

- [ ] **Step 3: Update card StyleSheet — flat card design**

Ubah `styles.card` dan `styles.cardCompact`:

```ts
card: {
  backgroundColor: BrandColors.surface,
  borderRadius: 14,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: BrandColors.border,
},
cardCompact: {
  borderRadius: 12,
  borderWidth: 1,
  borderColor: BrandColors.border,
},
```

Hapus semua `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation` dari kedua style (flat design = no shadow).

- [ ] **Step 4: Tambah style category pill dan SKU**

Tambah style baru di `StyleSheet.create`:

```ts
categoryPill: {
  position: "absolute",
  top: 7,
  left: 7,
  backgroundColor: "rgba(255,255,255,0.88)",
  borderRadius: 999,
  paddingHorizontal: 8,
  paddingVertical: 3,
},
skuText: {
  letterSpacing: 0.4,
},
```

- [ ] **Step 5: Tambah category pill ke JSX imageArea**

Di dalam `<View style={imageAreaStyle}>`, tambah category pill setelah closing tag gambar/icon:

```tsx
{categoryLabel && (
  <View style={styles.categoryPill}>
    <TextCaption
      fontWeight="600"
      fontSize={10}
      color={BrandColors.textMuted}
    >
      {categoryLabel}
    </TextCaption>
  </View>
)}
```

- [ ] **Step 6: Tambah SKU di bawah nama produk**

Di dalam `<YStack padding={...} gap={...}>`, setelah `<TextBodyLg>` nama produk, tambah:

```tsx
{sku && (
  <TextCaption
    style={styles.skuText}
    color={BrandColors.textMuted}
    fontSize={11}
    numberOfLines={1}
  >
    SKU {sku}
  </TextCaption>
)}
```

- [ ] **Step 7: Update add button style**

```ts
addButtonEnabled: {
  backgroundColor: BrandColors.buttonSolid,
  borderRadius: 8,
  width: 30,
  height: 30,
},
addButtonCompact: {
  backgroundColor: BrandColors.tint,
  borderRadius: 8,
  width: 28,
  height: 28,
},
addButtonDisabled: {
  backgroundColor: BrandColors.border,
  borderRadius: 8,
  width: 28,
  height: 28,
},
```

- [ ] **Step 8: Update price color**

Di JSX harga (`TextBodySm` dengan `formatPrice`), ubah warna:

```tsx
<TextBodySm
  fontWeight="800"
  fontSize={compact ? 12 : undefined}
  color={isDisabled ? BrandColors.textMuted : BrandColors.deep}
>
  {formatPrice(basePrice)}
</TextBodySm>
```

- [ ] **Step 9: Commit**

```bash
git add src/features/catalog/components/ProductCard/ProductCard.types.ts \
        src/features/catalog/components/ProductCard/ProductCard.tsx
git commit -m "style: ProductCard — category pill, SKU label, flat card design (A_Daun)"
```

---

## Task 8: Pass `sku` + `categoryLabel` dari `ProductGrid`

**Files:**
- Modify: `src/features/transactions/components/transaksi-baru/ProductGrid.tsx`

- [ ] **Step 1: Update renderItem — pass sku dan categoryLabel**

Cari blok `renderItem`, ubah bagian `<ProductCard ...>`:

```tsx
<ProductCard
  name={item.name}
  imageUrl={item.imageUrl ?? undefined}
  basePrice={item.basePrice}
  categoryIcon={CATEGORY_ICONS[item.category]}
  categoryIconBg={CATEGORY_COLORS[item.category].bg}
  categoryIconColor={CATEGORY_COLORS[item.category].color}
  categoryLabel={item.category}
  sku={item.sku ?? undefined}
  stockStatus={item.stockStatus}
  availabilityReason={item.availabilityReason}
  width={cardWidth}
  compact={compact}
  onAdd={() => onAddProduct(item)}
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/features/transactions/components/transaksi-baru/ProductGrid.tsx
git commit -m "style: ProductGrid — pass sku and categoryLabel to ProductCard"
```

---

## Task 9: Redesign `CartBar`

**Files:**
- Modify: `src/features/transactions/components/transaksi-baru/CartBar.tsx`

- [ ] **Step 1: Update CartBar styles**

```ts
const styles = StyleSheet.create({
  cartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 10,
    backgroundColor: BrandColors.surface,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
  },
  cartBarInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BrandColors.buttonSolid,
    borderRadius: 14,
    padding: 12,
  },
  cartBarIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
```

- [ ] **Step 2: Update JSX warna teks dalam CartBar**

```tsx
export function CartBar({ totalItems, totalPrice, onPress }: Props) {
  if (totalItems === 0) return null;

  return (
    <View style={styles.cartBar}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={styles.cartBarInner}
      >
        <View style={styles.cartBarIcon}>
          <Ionicons name="bag-outline" size={20} color={ColorBase.white} />
        </View>
        <YStack flex={1} gap={1}>
          <TextBodySm color="rgba(255,255,255,0.75)" fontWeight="600">
            {totalItems} item dipilih
          </TextBodySm>
          <TextBodyLg fontWeight="800" color={ColorBase.white}>
            {formatPrice(totalPrice)}
          </TextBodyLg>
        </YStack>
        <View style={styles.cartBarButton}>
          <TextBodyLg fontWeight="700" color={ColorBase.white}>
            Bayar
          </TextBodyLg>
          <Ionicons name="arrow-forward" size={16} color={ColorBase.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/transactions/components/transaksi-baru/CartBar.tsx
git commit -m "style: CartBar — solid emerald Bayar button, flat white bar (A_Daun)"
```

---

## Task 10: Remove Unused `headerGradient` References

**Files:**
- Search & verify: semua file yang menggunakan `BrandColors.headerGradient*`

- [ ] **Step 1: Cari referensi gradient yang tersisa**

```bash
grep -r "headerGradient\|LinearGradient" \
  src/components src/features \
  --include="*.tsx" --include="*.ts" -l
```

Expected: hanya `TopNavHeader.tsx` — dan kita sudah hapus `LinearGradient` di Task 5. Kalau masih ada file lain, hapus penggunaan gradient dan ganti dengan warna flat.

- [ ] **Step 2: Pastikan `expo-linear-gradient` tidak ada di TopNavHeader**

```bash
grep "LinearGradient\|expo-linear-gradient" \
  src/components/layout/TopNavHeader.tsx
```

Expected: tidak ada output (0 matches).

- [ ] **Step 3: Jalankan TypeScript check**

```bash
cd /Users/rofisudiyono/Documents/Project/satset-pos/apps/pos-kasir
npx tsc --noEmit 2>&1 | head -40
```

Expected: 0 errors. Jika ada error, fix sebelum lanjut.

- [ ] **Step 4: Commit final cleanup jika ada perubahan**

```bash
git add -p
git commit -m "style: remove residual gradient references (A_Daun cleanup)"
```

---

## Task 11: Smoke Verification

- [ ] **Step 1: Start dev server**

```bash
cd /Users/rofisudiyono/Documents/Project/satset-pos/apps/pos-kasir
npx expo start --clear
```

- [ ] **Step 2: Verify mobile layout**

Buka di iOS Simulator atau Android Emulator (phone size ~390px):
- [ ] Header flat white, teks gelap (bukan putih di atas hijau)
- [ ] Nav tabs (Pesanan Web, Input Manual, Riwayat) berbentuk pill rounded
- [ ] ProductCard punya category pill (e.g. "Minuman") dan SKU di bawah nama
- [ ] CartBar background hijau solid (#047857) dengan teks putih

- [ ] **Step 3: Verify tablet layout**

Buka di iPad Simulator atau resize browser ke ≥768px:
- [ ] SideNav putih di kiri, brand icon tint-green
- [ ] Shift info row: slot pill + "Aktif sejak HH:mm"
- [ ] Avatar badge inisial kasir
- [ ] Nav items aktif background `#E6F4EE`, teks `#047857`

- [ ] **Step 4: Verify screens mewarisi token**

Navigasi ke:
- [ ] Login screen — tombol primary `#047857`
- [ ] Buka Shift screen — tombol primary `#047857`
- [ ] Tutup Shift screen — tombol danger `#C0392B`

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "style: A_Daun redesign complete — smoke verified mobile + tablet"
```
