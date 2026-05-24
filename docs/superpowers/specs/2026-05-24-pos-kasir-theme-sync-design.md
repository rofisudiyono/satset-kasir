# Design Spec: pos-kasir Theme Sync → Farmapro Clean

**Date:** 2026-05-24  
**Author:** Agent (brainstorming session)  
**Status:** Approved

---

## Goal

Make `pos-kasir` (React Native/Expo + Tamagui) match the visual language of `pos-dashboard` (React Web + Tailwind + shadcn/ui): clean, flat, light — the "Farmapro" aesthetic. Both apps already share the same color palette; this spec closes the gap in shadow style, surface colors, and component visual language.

---

## Background

Both apps use the **Farmapro design system**:
- **Primary:** mint-600 `#059669`
- **Background:** ink-50 `#f5f7f5`
- **Foreground/text:** ink-900 `#0b1f17`
- **Border:** ink-100 `#e9ede9`
- **Font:** Plus Jakarta Sans

The divergence is in how components *apply* these tokens. `pos-kasir` currently has:
- Heavy drop shadows (`shadowOpacity: 0.18, shadowRadius: 8`)
- Dark gradient headers (`LinearGradient primary700 → primary900`)
- Wrong background value in `config/theme.ts` (`#FFFFFF` vs `#f5f7f5`)
- Hardcoded `#1a1a1a` text color in `SearchBar`
- PageHeader with a left green accent bar (not part of dashboard pattern)
- Multiple competing color definition files

---

## Design Decisions

### 1. Surface & Background

| Token | pos-dashboard | pos-kasir (after) |
|---|---|---|
| Screen background | `--background: #f5f7f5` (ink-50) | `$backgroundSecondary` or `#f5f7f5` |
| Card surface | `--card: #ffffff` | `$background` = white |
| Accent surface | `--accent: #ecfdf5` (mint-50) | `$backgroundTertiary` = mint-50 |

**Change:** `src/config/theme.ts` — set `background: '#f5f7f5'` (was `#FFFFFF`).

### 2. Shadow Style

`pos-dashboard` uses `shadow-xs`: `0 1px 2px 0 rgb(0 0 0 / 0.04)` — almost invisible, just enough depth.

**Change `ShadowCard.tsx`:**
```
shadowColor: ColorNeutral.neutral900   // #0b1f17
shadowOpacity: 0.06                    // was 0.18
shadowRadius: 3                        // was 8
shadowOffset: { width: 0, height: 1 } // was default
elevation: 1                           // was 2
borderWidth: 1
borderColor: "$borderColor"            // ink-100 = #e9ede9
```

### 3. HomeHeader — Remove gradient

**Current:** `LinearGradient` from `primary700` → `primary900` (dark green, opaque).  
**After:** Flat surface with mint-50 tint and a subtle border-bottom.

```tsx
backgroundColor="$backgroundTertiary"   // mint-50 = #ecfdf5
borderBottomWidth={1}
borderBottomColor="$borderColor"         // ink-100
```

Text colors update accordingly (semua jadi dark-on-light, bukan white-on-dark):
- Username: `$color` (ink-900 = `#0b1f17`)
- Store name / secondary: `$colorSecondary` (ink-500 = `#5b7268`)
- Time (jam): `$color` (ink-900), bold
- Date: `$colorSecondary` (ink-500)
- Notification icon button: `bg="$backgroundSecondary"` (ink-50), icon color `$colorSecondary`

### 4. PageHeader — Remove accent bar

**Current:** Canvas background + 3px left green accent bar.  
**After:** White/ink-50 background + 1px border-bottom only (consistent with dashboard top-bar pattern).

Remove the `styles.accent` View and update `styles.shell`:
```
backgroundColor: '$background'    // white
borderBottomWidth: 1
borderBottomColor: '$borderColor' // ink-100
```

### 5. SearchBar — Fix hardcoded text color

**Change `SearchBar.tsx`:**
```
color: "#1a1a1a"  →  color: ColorNeutral.neutral900  // #0b1f17
```

### 6. config/theme.ts — Align background

```ts
background: '#f5f7f5',   // was '#FFFFFF' — now matches --background on dashboard
backgroundElement: '#ecfdf5',   // mint-50, unchanged
```

---

## Files Affected

| File | Change Type | Description |
|---|---|---|
| `src/config/theme.ts` | Edit | Fix `background` value |
| `src/components/atoms/ShadowCard.tsx` | Edit | Lighter shadow + border |
| `src/components/molecules/SearchBar.tsx` | Edit | Fix hardcoded text color |
| `src/features/home/components/HomeHeader/HomeHeader.tsx` | Edit | Replace gradient with flat mint-50 surface |
| `src/components/molecules/PageHeader.tsx` | Edit | Remove accent bar, clean border-bottom |

---

## Out of Scope

- Business logic, API calls, navigation — untouched
- `tamagui.config.ts` — already correctly aligned, no changes needed
- `src/themes/Colors.ts`, `src/themes/brand.ts` — values already correct, no changes
- `categoryStyles.ts` — colors already match Farmapro palette
- `LoginScreen.tsx` — gradient brand panel is intentional identity, keep as-is
- Tablet-specific layouts — not in scope for this sync

---

## Success Criteria

1. `HomeHeader` renders as flat mint-50 surface, no gradient
2. `PageHeader` renders as clean white bar with border-bottom only
3. `ShadowCard` shadow is barely visible (opacity 0.06), with ink-100 border
4. Screen backgrounds across all main screens use ink-50 (#f5f7f5)
5. No hardcoded colors that deviate from Farmapro in the changed files
6. Visual result: matches the clean, light, flat aesthetic of pos-dashboard
