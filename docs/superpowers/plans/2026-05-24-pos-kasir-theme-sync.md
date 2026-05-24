# pos-kasir Theme Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align pos-kasir's visual language with pos-dashboard's Farmapro clean aesthetic — flat surfaces, light shadows, consistent ink-50 background.

**Architecture:** Edit 5 focused files. No new files. No structural refactoring. Each task is independent and self-contained. Verification is visual (run Expo Go / simulator) since these are pure styling changes.

**Tech Stack:** React Native, Expo, Tamagui, expo-linear-gradient (being removed from HomeHeader), TypeScript.

**Spec:** `docs/superpowers/specs/2026-05-24-pos-kasir-theme-sync-design.md`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/config/theme.ts` | Modify | `background` → `#f5f7f5` |
| `src/components/atoms/ShadowCard.tsx` | Modify | Lighter shadow + ink-100 border |
| `src/components/molecules/SearchBar.tsx` | Modify | Text color `#1a1a1a` → `ColorNeutral.neutral900` |
| `src/features/home/components/HomeHeader/HomeHeader.tsx` | Modify | Replace `LinearGradient` with flat mint-50 surface |
| `src/components/molecules/PageHeader.tsx` | Modify | Remove left accent bar, plain border-bottom |

---

## Task 1: Fix background token in config/theme.ts

**Files:**
- Modify: `src/config/theme.ts`

- [ ] **Step 1: Open the file and locate the background value**

  File: `src/config/theme.ts`

  Find:
  ```ts
  background: '#FFFFFF',
  ```

- [ ] **Step 2: Change background to ink-50**

  Replace with:
  ```ts
  background: '#f5f7f5',
  ```

  Full updated `Colors` object after change:
  ```ts
  export const Colors = {
    text: '#0b1f17',
    background: '#f5f7f5',          // was '#FFFFFF' — now ink-50, matches dashboard --background
    backgroundElement: '#ecfdf5',
    backgroundSelected: '#d1fae5',
    textSecondary: '#5b7268',
  } as const;
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/config/theme.ts
  git commit -m "style: align background token to ink-50 (matches pos-dashboard)"
  ```

---

## Task 2: Lighten ShadowCard shadow + add border

**Files:**
- Modify: `src/components/atoms/ShadowCard.tsx`

- [ ] **Step 1: Open ShadowCard and review current shadow values**

  File: `src/components/atoms/ShadowCard.tsx`

  Current (heavy):
  ```ts
  shadowColor: ColorNeutral.neutralShadow,
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 2,
  ```

- [ ] **Step 2: Apply Farmapro shadow-xs values + border**

  Replace the entire file with:
  ```tsx
  /**
   * ShadowCard — Standard elevated card wrapper
   *
   * Shadow matches pos-dashboard shadow-xs: 0 1px 2px rgb(0 0 0 / 0.04)
   * Border matches pos-dashboard .page-card: border border-[ink-100]
   */
  import { styled, YStack } from "tamagui";

  import { ColorNeutral } from "@/themes/Colors";

  export const ShadowCard = styled(YStack, {
    name: "ShadowCard",
    backgroundColor: "$background",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "$borderColor",
    shadowColor: ColorNeutral.neutral900,
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  });
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/atoms/ShadowCard.tsx
  git commit -m "style: ShadowCard shadow-xs + ink-100 border (Farmapro clean)"
  ```

---

## Task 3: Fix hardcoded text color in SearchBar

**Files:**
- Modify: `src/components/molecules/SearchBar.tsx`

- [ ] **Step 1: Locate the hardcoded color**

  File: `src/components/molecules/SearchBar.tsx`

  Find:
  ```tsx
  style={{ flex: 1, fontSize: 15, color: "#1a1a1a", padding: 0 }}
  ```

- [ ] **Step 2: Replace with Farmapro token**

  The file already imports `ColorNeutral` from `@/themes/Colors`. Use `neutral900`:

  Replace:
  ```tsx
  style={{ flex: 1, fontSize: 15, color: "#1a1a1a", padding: 0 }}
  ```
  With:
  ```tsx
  style={{ flex: 1, fontSize: 15, color: ColorNeutral.neutral900, padding: 0 }}
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/molecules/SearchBar.tsx
  git commit -m "style: fix SearchBar text color to ink-900 Farmapro token"
  ```

---

## Task 4: Replace HomeHeader gradient with flat Farmapro surface

**Files:**
- Modify: `src/features/home/components/HomeHeader/HomeHeader.tsx`

This is the largest change. The `LinearGradient` (dark green header) is replaced with a flat mint-50 surface matching the dashboard's top-bar aesthetic. All text/icon colors switch from white-on-dark to dark-on-light.

- [ ] **Step 1: Review current imports**

  File: `src/features/home/components/HomeHeader/HomeHeader.tsx`

  Current imports include:
  ```tsx
  import { LinearGradient } from "expo-linear-gradient";
  import { ColorBase, ColorPrimary } from "@/themes/Colors";
  ```

- [ ] **Step 2: Replace entire file**

  Write the full updated file:
  ```tsx
  import { Image } from "expo-image";
  import React, { useEffect, useState } from "react";
  import { View } from "react-native";
  import { XStack, YStack } from "tamagui";

  import {
    IconButton,
    TextBodyLg,
    TextBodySm,
    TextCaption,
    TextH3,
  } from "@/components";
  import { ColorNeutral } from "@/themes/Colors";

  const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];

  function formatDate(date: Date) {
    const day = DAY_NAMES[date.getDay()];
    const d = date.getDate();
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    return `${day}, ${d} ${month} ${year}`;
  }

  function formatTime(date: Date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m} WIB`;
  }

  export function HomeHeader() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
      const timer = setInterval(() => setNow(new Date()), 60_000);
      return () => clearInterval(timer);
    }, []);

    return (
      <XStack
        backgroundColor="$backgroundTertiary"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        paddingHorizontal="$4"
        paddingTop="$4"
        paddingBottom="$3"
        alignItems="center"
        gap="$3"
        flexWrap="wrap"
      >
        <YStack
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Image
            source={require("../../../../../assets/images/satset_1024.png")}
            style={{ width: 40, height: 40 }}
            contentFit="cover"
          />
        </YStack>

        <YStack flex={1} minWidth={160}>
          <TextH3 fontWeight="800" color="$color">
            Budi Santoso
          </TextH3>
          <TextBodySm color="$colorSecondary">Toko Makmur</TextBodySm>
        </YStack>

        <View style={{ marginLeft: "auto" }}>
          <YStack alignItems="flex-end" gap={2}>
            <TextCaption color="$colorSecondary">{formatDate(now)}</TextCaption>
            <TextBodyLg fontWeight="800" color="$color">
              {formatTime(now)}
            </TextBodyLg>
          </YStack>
        </View>

        <View>
          <IconButton
            iconName="notifications-outline"
            size={40}
            bg="$backgroundSecondary"
            iconColor={ColorNeutral.neutral500}
          />
        </View>
      </XStack>
    );
  }
  ```

- [ ] **Step 3: Verify expo-linear-gradient is no longer imported**

  After the edit, `LinearGradient` and `ColorPrimary` should no longer appear in the file. Confirm by searching:
  ```bash
  grep "LinearGradient\|ColorPrimary" src/features/home/components/HomeHeader/HomeHeader.tsx
  ```
  Expected: no output (empty).

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/home/components/HomeHeader/HomeHeader.tsx
  git commit -m "style: HomeHeader flat mint-50 surface, remove gradient (Farmapro clean)"
  ```

---

## Task 5: Clean up PageHeader — remove accent bar, plain border-bottom

**Files:**
- Modify: `src/components/molecules/PageHeader.tsx`

- [ ] **Step 1: Review what needs to change**

  File: `src/components/molecules/PageHeader.tsx`

  Current `styles.shell` has:
  ```ts
  shell: {
    backgroundColor: BrandColors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    marginBottom: 0,
  },
  ```

  Current component renders a `<View style={styles.accent} />` — the 3px green bar on the left.

  Target: white/ink-50 background, 1px bottom border, no accent bar. Same as dashboard's top navigation.

- [ ] **Step 2: Replace entire file**

  ```tsx
  import React from "react";
  import { StyleSheet, View } from "react-native";
  import { XStack, YStack } from "tamagui";

  import { IconButton } from "../atoms/IconButton";
  import { TextBodySm, TextH2, TextH3 } from "../atoms/Typography";

  export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    actions?: React.ReactNode;
    largeTitle?: boolean;
    maxWidth?: number | string;
  }

  export function PageHeader({
    title,
    subtitle,
    showBack = false,
    onBack,
    actions,
    largeTitle = false,
    maxWidth = "100%",
  }: PageHeaderProps) {
    return (
      <View style={styles.shell}>
        <XStack
          paddingHorizontal="$4"
          paddingTop="$3"
          paddingBottom="$3"
          alignItems="center"
          gap="$3"
          flexWrap="wrap"
          style={[styles.header, { maxWidth }]}
        >
          {showBack && <IconButton iconName="arrow-back" onPress={onBack} />}

          {subtitle ? (
            <YStack flex={1} gap={2} minWidth={220}>
              {largeTitle ? (
                <TextH2 fontWeight="700">{title}</TextH2>
              ) : (
                <TextH3 fontWeight="700">{title}</TextH3>
              )}
              <TextBodySm color="$colorSecondary">{subtitle}</TextBodySm>
            </YStack>
          ) : (
            <>
              {largeTitle ? (
                <TextH2 fontWeight="700" flex={1}>
                  {title}
                </TextH2>
              ) : (
                <TextH3
                  fontWeight="700"
                  flex={1}
                  textAlign={showBack ? "center" : "left"}
                >
                  {title}
                </TextH3>
              )}
            </>
          )}

          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </XStack>
      </View>
    );
  }

  const styles = StyleSheet.create({
    shell: {
      backgroundColor: "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: "#e9ede9",
    },
    header: {
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 6,
    },
    actions: {
      marginLeft: "auto",
    },
  });
  ```

  > Note: `BrandColors` import removed since it's no longer used in this file.

- [ ] **Step 3: Verify BrandColors is no longer imported**

  ```bash
  grep "BrandColors" src/components/molecules/PageHeader.tsx
  ```
  Expected: no output.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/molecules/PageHeader.tsx
  git commit -m "style: PageHeader clean border-bottom, remove left accent bar (Farmapro clean)"
  ```

---

## Task 6: Visual verification

- [ ] **Step 1: Start dev server**

  ```bash
  npx expo start
  ```

- [ ] **Step 2: Check HomeHeader (main tab screen)**

  Open the home tab. Confirm:
  - Header is mint-50 (`#ecfdf5`) flat background, not dark green
  - Username and time text are dark (ink-900), readable
  - Notification icon has light ink-50 background
  - 1px ink-100 border at the bottom

- [ ] **Step 3: Check PageHeader (e.g. Pengaturan or Transaksi screen)**

  Navigate to any screen that uses `PageHeader`. Confirm:
  - White background
  - 1px ink-100 border-bottom
  - No green accent bar on the left

- [ ] **Step 4: Check ShadowCard (any settings or product card)**

  Confirm:
  - Shadow is very subtle (barely visible)
  - Thin ink-100 border visible on card edges
  - No heavy drop shadow

- [ ] **Step 5: Check SearchBar (Transaksi / Riwayat screen)**

  Confirm text input renders ink-900 dark text, not off-black `#1a1a1a` (visually the same but now uses the correct token).

- [ ] **Step 6: Final commit (lint + format)**

  ```bash
  git add -A
  git commit -m "style: pos-kasir Farmapro clean theme sync complete"
  ```
