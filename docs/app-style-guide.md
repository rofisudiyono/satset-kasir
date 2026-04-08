# Kasirin Aja - App Style Guide

Dokumen ini adalah panduan lengkap untuk implementasi UI/UX aplikasi **Staff Application** yang konsisten dengan desain sistem `Kasirin Aja POS`.

---

## 📋 Daftar Isi

1. [Design Tokens](#1-design-tokens)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Sizing](#4-spacing--sizing)
5. [Border Radius](#5-border-radius)
6. [Shadows & Elevation](#6-shadows--elevation)
7. [Component Architecture](#7-component-architecture)
8. [Layout Patterns](#8-layout-patterns)
9. [Responsive Design](#9-responsive-design)
10. [Common UI Patterns](#10-common-ui-patterns)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Design Tokens

### Teknologi Styling

Aplikasi menggunakan **dual styling system**:
- **Tamagui** - Component-based styling dengan design tokens
- **React Native StyleSheet** - Untuk layout-level styling

### Prinsip Utama

✅ **Konsistensi** - Gunakan token yang sama di seluruh aplikasi  
✅ **Semantic naming** - Nama berdasarkan fungsi (primary, success, danger)  
✅ **Scale-based** - Gunakan skala yang sudah ditentukan (25, 50, 100, 200, 400, 600, 900)  
✅ **Responsive-first** - Design untuk tablet, adapt ke mobile  

---

## 2. Color System

### Primary Colors (Blue)

Digunakan untuk brand, action button utama, dan link.

```typescript
primary25:  '#EFF4FF'  // Background hover
primary50:  '#EFF6FF'  // Background light
primary100: '#DBEAFE'  // Border light
primary200: '#BFDBFE'  // Border
primary400: '#60A5FA'  // Icon secondary
primary600: '#2563EB'  // ★ MAIN BRAND - Button active, link
primary700: '#1D4ED8'  // Button hover
primary900: '#1E3A8A'  // Text dark
```

### Success Colors (Green)

Digunakan untuk status berhasil, konfirmasi positif, dan uang kembalian.

```typescript
success50:  '#ECFDF5'  // Background
success200: '#A7F3D0'  // Border light
success400: '#34D399'  // Icon
success500: '#10B981'  // Text medium
success600: '#059669'  // ★ SUCCESS - Button, status badge
success700: '#047857'  // Hover
success900: '#064E3B'  // Text dark
```

### Warning Colors (Amber/Yellow)

Digunakan untuk peringatan, partially paid, dan highlight.

```typescript
warning50:  '#FFFBEB'  // Background
warning100: '#FEF3C7'  // Border light
warning200: '#FDE68A'  // Border
warning400: '#FBBF24'  // Icon
warning500: '#F59E0B'  // ★ WARNING - Badge, alert
warning600: '#D97706'  // Hover
warning700: '#B45309'  // Text dark
```

### Danger Colors (Red)

Digunakan untuk error, hapus, void, dan refund.

```typescript
danger25:  '#FFF5F5'  // Background hover
danger50:  '#FEF2F2'  // Background
danger75:  '#FCE8E8'  // Background medium
danger100: '#FEE2E2'  // Border light
danger200: '#FECACA'  // Border
danger400: '#F87171'  // Icon
danger600: '#DC2626'  // ★ DANGER - Button, error state
danger700: '#B91C1C'  // Hover
```

### Neutral Colors (Gray)

Digunakan untuk text, border, background secondary.

```typescript
neutral50:  '#F9FAFB'  // Background card alternate
neutral100: '#F3F4F6'  // Background secondary
neutral200: '#E5E7EB'  // Border
neutral400: '#9CA3AF'  // Text placeholder
neutral500: '#6B7280'  // Text secondary
neutral600: '#4B5563'  // Text medium
neutral700: '#374151'  // Text primary
neutral800: '#1F2937'  // Text dark
neutral900: '#111827'  // Text darkest
neutralShadow: '#94A3B8'  // Shadow color
```

### Base Colors

```typescript
white:      '#FFFFFF'  // Card background, page background
black:      '#000000'  // Text (rarely used directly)
bgScreen:   '#F8FAFF'  // ★ MAIN SCREEN BACKGROUND
transparent: 'transparent'
```

### Accent Colors

```typescript
// Purple
purple50:  '#FAF5FF'
purple100: '#F3E8FF'
purple600: '#9333EA'
purple900: '#581C87'

// Orange
orange50:  '#FFF7ED'
orange100: '#FFEDD5'
orange600: '#EA580C'
orange900: '#7C2D12'

// Teal
teal700: '#0F766E'
```

### Icon Gradient

Digunakan untuk brand icon dan avatar gradient.

```typescript
gradientStart: '#3C9FFE'
gradientEnd:   '#0274DF'
iconBg:        '#208AEF'
```

### Tamagui Semantic Tokens

Untuk Tamagui components, gunakan token semantic:

```typescript
$primary           // primary600
$primaryLight      // primary400
$primaryMid        // primary600
$primaryDark       // primary900
$success           // success600
$successLight      // success400
$warning           // warning600
$warningLight      // warning400
$danger            // danger600
$dangerLight       // danger400
$background        // white
$backgroundSecondary  // neutral50
$backgroundTertiary   // neutral100
$color             // neutral700 (primary text)
$colorSecondary    // neutral500 (secondary text)
$colorTertiary     // neutral400 (placeholder text)
$borderColor       // neutral200
```

### Color Usage Examples

```tsx
// Button primary
backgroundColor: ColorPrimary.primary600

// Success badge
backgroundColor: ColorGreen.green600,
color: ColorBase.white

// Error state
borderColor: ColorDanger.danger600,
color: ColorDanger.danger600

// Card background
backgroundColor: ColorBase.white

// Screen background
backgroundColor: ColorBase.bgScreen  // #F8FAFF

// Border
borderColor: ColorNeutral.neutral200

// Secondary text
color: "$colorSecondary"  // neutral500
```

---

## 3. Typography

### Font Family

**Poppins** dengan weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Type Scale

| Component | Size | Line Height | Weight | Usage |
|-----------|------|-------------|--------|-------|
| **TextMicro** | 10sp | 14 | 400 | Bottom nav label, badge label |
| **TextCaption** | 11sp | 16 | 500 | Section label (CAPS), timestamp |
| **TextBodySm** | 12sp | 18 | 400 | Subtitle, metadata, hint |
| **TextBody** | 13sp | 20 | 400 | Main content, description |
| **TextBodyLg** | 16sp | 24 | 500 | Section header, card sub-header |
| **TextH3** | 22sp | 30 | 600 | Page title, screen header |
| **TextH2** | 28sp | 36 | 600 | Total, large display numbers |
| **TextH1** | 36sp | 44 | 600 | Hero numbers (rare) |

### Typography Usage Pattern

```tsx
// Page header
<TextH3 fontWeight="700">Nama Halaman</TextH3>
<TextBodySm color="$colorSecondary">Deskripsi halaman</TextBodySm>

// Card title
<TextBodyLg fontWeight="700">Judul Card</TextBodyLg>

// Section label
<TextCaption color="$colorSecondary" style={{ textTransform: 'uppercase' }}>
  Label Section
</TextCaption>

// Data row
<XStack justifyContent="space-between">
  <TextBodySm color="$colorSecondary">Label</TextBodySm>
  <TextBodySm fontWeight="600">Value</TextBodySm>
</XStack>

// Large number
<TextH2 fontWeight="700" color={ColorGreen.green600}>
  Rp 150.000
</TextH2>
```

### Font Weight Guidelines

- **400 (Regular)** - Body text, descriptions, subtitles
- **500 (Medium)** - Section headers, labels that need emphasis
- **600 (SemiBold)** - Card titles, important labels, numbers
- **700 (Bold)** - Page titles, hero text, emphasis numbers

---

## 4. Spacing & Sizing

### Tamagui Space Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `0` | 0px | Reset |
| `0.5` | 2px | Micro gap (icon to text) |
| `1` | 4px | Tight gap (label to input) |
| `2` | 8px | Small gap (related items) |
| `3` | 12px | Section gap |
| `4` | 16px | Card padding, standard gap |
| `5` | 20px | Medium gap |
| `6` | 24px | Large gap |
| `8` | 32px | Section separator |
| `12` | 48px | Page section |

### Size Tokens (for components)

| Token | Value | Usage |
|-------|-------|-------|
| `8` | 32px | Small button height |
| `9` | 36px | Input sm height |
| `10` | 40px | Medium button |
| `11` | 44px | Input md height, icon button |
| `12` | 48px | Large button |
| `14` | 56px | Extra large button |

### Spacing Usage Examples

```tsx
// Card content
<YStack gap="$3">  // 12px gap between items
  <TextBodyLg>Title</TextBodyLg>
  <TextBodySm>Description</TextBodySm>
</YStack>

// Form fields
<YStack gap="$4">  // 16px gap between fields
  <AppInput label="Email" />
  <AppInput label="Password" />
</YStack>

// Page layout
<ScrollView 
  contentContainerStyle={{
    paddingHorizontal: 16,  // $4
    paddingVertical: 24,    // $6
  }}
>
```

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `$1` | 4px | Checkboxes, small elements |
| `$2` | 8px | Minor rounded corners |
| `$3` | 10px | **Buttons, inputs** |
| `$4` | 12px | Search bars, chips |
| `$5` | 16px | **Order cards, detail cards** |
| `$6` | 24px | **Large cards, hero elements** |
| `full` | 999px | **Pills, circles, badges** |

### Border Radius Usage Pattern

```tsx
// Button
borderRadius: 10,  // or $3

// Input
borderRadius: 10,  // or $3

// Card
borderRadius: 16,  // or $5

// Large card/hero
borderRadius: 24,  // or $6

// Chip/badge
borderRadius: 999,  // full (pill shape)

// Circle (avatar, icon button)
borderRadius: 999,  // or half of width/height
```

---

## 6. Shadows & Elevation

### Card Shadow Pattern

```tsx
{
  backgroundColor: ColorBase.white,
  borderRadius: 14,
  shadowColor: ColorNeutral.neutralShadow,  // #94A3B8
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 2,  // Android
}
```

### Elevated Card (Higher)

```tsx
{
  backgroundColor: ColorBase.white,
  borderRadius: 24,
  shadowColor: '#10213A',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 20,
  elevation: 4,
}
```

### Shadow Usage Guidelines

- **Light shadow** (opacity 0.06-0.10) - Hero cards, important panels
- **Medium shadow** (opacity 0.15-0.20) - Standard cards, order cards
- **No shadow** - Use borders instead for flat design sections

### Border Alternative

Untuk design yang lebih flat, gunakan border alih-alih shadow:

```tsx
{
  backgroundColor: ColorBase.white,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: ColorNeutral.neutral200,
}
```

---

## 7. Component Architecture

### Component Hierarchy

```
src/components/
├── atoms/          # Basic building blocks
├── molecules/      # Combinations of atoms
└── layout/         # Page-level layout components
```

### Atoms (Basic Components)

#### AppButton

**Props:**
- `variant`: 'primary' | 'success' | 'danger' | 'warning' | 'outline' | 'outlineGray' | 'ghost' | 'glass'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `loading`: boolean
- `icon`: React.ReactNode
- `iconPosition`: 'left' | 'right'
- `disabled`: boolean

**Variant Styles:**

| Variant | Background | Border | Text Color |
|---------|-----------|--------|------------|
| primary | `$primary` | `$primary` | White |
| success | `$success` | `$success` | White |
| danger | `$danger` | `$danger` | White |
| warning | `$warning` | `$warning` | White |
| outline | Transparent | `$primary` | `$primary` |
| outlineGray | Transparent | `$borderColor` | `$color` |
| ghost | Transparent | Transparent | `$primary` |
| glass | rgba(255,255,255,0.15) | rgba(255,255,255,0.3) | White |

**Size Styles:**

| Size | Height | Padding X | Font Size |
|------|--------|-----------|-----------|
| sm | 36px | 12px | 12sp |
| md | 44px | 16px | 14sp |
| lg | 52px | 20px | 16sp |

**Usage:**
```tsx
<AppButton 
  variant="primary" 
  size="lg"
  title="Simpan"
  loading={isLoading}
  onPress={handleSave}
/>
```

#### AppInput

**Props:**
- `label`: string
- `hint`: string
- `error`: string
- `size`: 'sm' | 'md'
- `leftIcon`: React.ReactNode
- `rightIcon`: React.ReactNode
- State-driven border (default, focused, success, error, disabled)

**Border Colors by State:**
- Default: `$borderColor`
- Focused: `$primary`
- Success: `$success`
- Error: `$danger`
- Disabled: `$backgroundTertiary`

**Usage:**
```tsx
<AppInput
  label="Email"
  placeholder="user@example.com"
  error={errors.email}
  leftIcon={<Ionicons name="mail-outline" size={20} />}
/>
```

#### IconButton

**Props:**
- `iconName`: Ionicon name
- `size`: number (default 36)
- `iconSize`: number (default 20)
- `shape`: 'circle' | 'square'
- `bg`: color
- `iconColor`: color
- `badge`: boolean

**Usage:**
```tsx
<IconButton
  iconName="notifications-outline"
  shape="square"
  size={42}
  onPress={() => {}}
/>
```

#### Typography Components

Semua komponen Typography menerima props:
- `color`: color value or Tamagui token
- `fontWeight`: 400 | 500 | 600 | 700
- `textAlign`: 'left' | 'center' | 'right'
- `style`: ViewStyle

**Usage:**
```tsx
<TextBodyLg fontWeight="700" color="$colorSecondary">
  Important Text
</TextBodyLg>
```

### Molecules (Composite Components)

#### PageHeader

**Props:**
- `title`: string
- `subtitle`: string (optional)
- `showBack`: boolean
- `onBack`: () => void
- `actions`: React.ReactNode[] (right side)
- `maxWidth`: number

**Usage:**
```tsx
<PageHeader
  title="Nama Halaman"
  subtitle="Deskripsi opsional"
  showBack
  onBack={() => router.back()}
  actions={[
    <IconButton key="more" iconName="ellipsis-horizontal" />
  ]}
/>
```

#### SectionCard

**Props:**
- `title`: string
- `children`: React.ReactNode
- `style`: ViewStyle

**Usage:**
```tsx
<SectionCard title="Informasi Personal">
  <YStack gap="$3">
    <TextBodySm>Nama: Budi Santoso</TextBodySm>
    <TextBodySm>Jabatan: Kasir</TextBodySm>
  </YStack>
</SectionCard>
```

#### FilterChip

**Props:**
- `label`: string
- `active`: boolean
- `onPress`: () => void

**Usage:**
```tsx
<FilterChip
  label="Aktif"
  active={filter === 'active'}
  onPress={() => setFilter('active')}
/>
```

#### SearchBar

**Props:**
- `value`: string
- `onChangeText`: (text: string) => void
- `placeholder`: string
- `onFilterPress`: () => void (optional)

**Usage:**
```tsx
<SearchBar
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Cari produk..."
/>
```

### Layout Components

#### TopNavHeader

Header navigasi utama aplikasi. Menggunakan:
- SafeAreaView (top only)
- Brand logo + title
- Shift status pill
- Action buttons (open/close shift)
- Icon buttons (notifications, bluetooth, profile)
- Navigation tabs/chips

#### BottomBar

Bar aksi di bagian bawah halaman.

**Props:**
- `children`: React.ReactNode
- `style`: ViewStyle
- `absolute`: boolean (default false)

**Usage:**
```tsx
<BottomBar>
  <AppButton 
    variant="primary" 
    size="lg"
    title="Bayar Sekarang"
    fullWidth
    onPress={handlePay}
  />
</BottomBar>
```

#### SplitLayout (Tablet)

Layout dua panel untuk tablet.

**Props:**
- `leftPanel`: React.ReactNode (55-65% width)
- `rightPanel`: React.ReactNode (35-45% width)
- `divider`: boolean (default true)

---

## 8. Layout Patterns

### Page Shell Pattern

Struktur standar halaman:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { PageHeader } from '@/components';

export default function MyPage() {
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Judul Halaman"
        subtitle="Deskripsi"
        showBack
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page content */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,  // #F8FAFF
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,  // Space for bottom bar
  },
});
```

### Two-Column Layout (Tablet)

Untuk halaman form atau detail:

```tsx
<XStack flex={1} gap="$4">
  {/* Left Panel - Form */}
  <View style={{ flex: 1.5 }}>
    <YStack gap="$4">
      <AppInput label="Field 1" />
      <AppInput label="Field 2" />
    </YStack>
  </View>
  
  {/* Divider */}
  <View style={{
    width: 1,
    backgroundColor: ColorNeutral.neutral200,
  }} />
  
  {/* Right Panel - Summary */}
  <View style={{ flex: 1 }}>
    <SectionCard title="Ringkasan">
      {/* Summary content */}
    </SectionCard>
  </View>
</XStack>
```

### Card List Pattern

```tsx
<ScrollView>
  <YStack gap="$3">
    {items.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.card,
          selectedId === item.id && styles.cardActive,
        ]}
      >
        <TextBodyLg fontWeight="700">{item.name}</TextBodyLg>
        <TextBodySm color="$colorSecondary">{item.description}</TextBodySm>
      </TouchableOpacity>
    ))}
  </YStack>
</ScrollView>

const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  cardActive: {
    borderColor: ColorPrimary.primary600,
    backgroundColor: ColorPrimary.primary50,
  },
});
```

### Action Button Pattern

Primary action button:

```tsx
<TouchableOpacity
  style={[
    styles.primaryButton,
    loading && styles.primaryButtonDisabled,
  ]}
  onPress={handleSubmit}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator color={ColorBase.white} />
  ) : (
    <>
      <Ionicons name="checkmark-circle" size={20} color={ColorBase.white} />
      <TextBodyLg fontWeight="700" color={ColorBase.white}>
        Simpan
      </TextBodyLg>
    </>
  )}
</TouchableOpacity>

const styles = StyleSheet.create({
  primaryButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: ColorPrimary.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
});
```

Secondary action button:

```tsx
<TouchableOpacity
  style={styles.secondaryButton}
  onPress={handleCancel}
>
  <Ionicons name="close-circle" size={18} color={ColorPrimary.primary600} />
  <TextBodyLg fontWeight="700" color={ColorPrimary.primary600}>
    Batal
  </TextBodyLg>
</TouchableOpacity>

const styles = StyleSheet.create({
  secondaryButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: ColorBase.white,
    borderWidth: 1.5,
    borderColor: ColorPrimary.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
```

### Info Row Pattern

Label-value pair:

```tsx
<YStack gap={12}>
  <XStack justifyContent="space-between">
    <TextBodySm color="$colorSecondary">Label 1</TextBodySm>
    <TextBodySm fontWeight="600">Value 1</TextBodySm>
  </XStack>
  <XStack justifyContent="space-between">
    <TextBodySm color="$colorSecondary">Label 2</TextBodySm>
    <TextBodySm fontWeight="600">Value 2</TextBodySm>
  </XStack>
  <XStack justifyContent="space-between">
    <TextBodySm color="$colorSecondary">Label 3</TextBodySm>
    <TextBodySm fontWeight="600">Value 3</TextBodySm>
  </XStack>
</YStack>
```

### Badge/Status Pattern

```tsx
<View style={[
  styles.badge,
  { backgroundColor: getStatusColor(status) }
]}>
  <TextCaption color={ColorBase.white} fontWeight="700">
    {status}
  </TextCaption>
</View>

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
});

function getStatusColor(status: string) {
  switch(status) {
    case 'ACTIVE': return ColorGreen.green600;
    case 'PENDING': return ColorWarning.warning600;
    case 'INACTIVE': return ColorNeutral.neutral400;
    case 'ERROR': return ColorDanger.danger600;
    default: return ColorNeutral.neutral600;
  }
}
```

---

## 9. Responsive Design

### useResponsiveLayout Hook

```typescript
const {
  isLandscape,
  isTablet,         // width >= 900px
  isLargeTablet,    // width >= 1280px
  contentMaxWidth,  // 1480 | 1200 | '100%'
  horizontalPadding, // 28 | 24 | 16
  sectionGap,       // 20 | 16
} = useResponsiveLayout();
```

### Responsive Pattern

```tsx
const { isTablet, contentMaxWidth, horizontalPadding } = useResponsiveLayout();

return (
  <SafeAreaView style={styles.container}>
    <PageHeader title="Page" />
    
    <View style={[
      styles.shell,
      {
        maxWidth: contentMaxWidth,
        paddingHorizontal: horizontalPadding,
      }
    ]}>
      {isTablet ? (
        // Tablet: Side by side
        <XStack flex={1} gap="$4">
          <View style={{ flex: 1.5 }}>{/* Left panel */}</View>
          <View style={{ flex: 1 }}>{/* Right panel */}</View>
        </XStack>
      ) : (
        // Mobile: Stacked
        <YStack flex={1} gap="$4">
          <View>{/* Top panel */}</View>
          <View>{/* Bottom panel */}</View>
        </YStack>
      )}
    </View>
  </SafeAreaView>
);
```

### Breakpoint Guidelines

| Breakpoint | Width | Layout |
|------------|-------|--------|
| **Mobile** | < 900px | Single column, stacked |
| **Tablet** | 900px - 1279px | Two columns (55/45 split) |
| **Large Tablet** | >= 1280px | Two columns with max-width constraint |

---

## 10. Common UI Patterns

### Form Page Pattern

```tsx
export default function FormPage() {
  const router = useRouter();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Submit logic
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Form Title"
        showBack
        onBack={() => router.back()}
        maxWidth={contentMaxWidth}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: contentMaxWidth,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <SectionCard title="Section 1">
          <YStack gap="$4">
            <AppInput label="Field 1" />
            <AppInput label="Field 2" />
          </YStack>
        </SectionCard>

        <SectionCard title="Section 2" style={{ marginTop: 16 }}>
          {/* Section 2 content */}
        </SectionCard>

        <View style={{ height: 100 }} /> {/* Spacer for bottom bar */}
      </ScrollView>

      <BottomBar>
        <XStack gap="$3" style={{ maxWidth: contentMaxWidth, paddingHorizontal: horizontalPadding }}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <TextBodyLg fontWeight="700" color={ColorPrimary.primary600}>Batal</TextBodyLg>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={ColorBase.white} />
            ) : (
              <TextBodyLg fontWeight="700" color={ColorBase.white}>Simpan</TextBodyLg>
            )}
          </TouchableOpacity>
        </XStack>
      </BottomBar>
    </SafeAreaView>
  );
}
```

### Loading State Pattern

```tsx
if (loading) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ColorPrimary.primary600} />
        <TextBodySm color="$colorSecondary" style={{ marginTop: 16 }}>
          Memuat data...
        </TextBodySm>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### Empty State Pattern

```tsx
if (items.length === 0) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={64} color={ColorNeutral.neutral400} />
      <TextBodyLg color="$colorSecondary" style={{ marginTop: 16 }}>
        Tidak ada data
      </TextBodyLg>
      <TextBodySm color="$colorSecondary" style={{ marginTop: 4 }}>
        Tekan tombol + untuk menambah
      </TextBodySm>
    </View>
  );
}
```

### Modal Bottom Sheet Pattern

```tsx
<Modal
  visible={showModal}
  transparent
  animationType="slide"
  onRequestClose={() => setShowModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <XStack justifyContent="space-between" alignItems="center">
        <TextH3 fontWeight="700">Modal Title</TextH3>
        <TouchableOpacity onPress={() => setShowModal(false)}>
          <Ionicons name="close-circle" size={24} color={ColorNeutral.neutral400} />
        </TouchableOpacity>
      </XStack>
      
      {/* Modal content */}
    </View>
  </View>
</Modal>

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: ColorBase.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
});
```

### Alert Confirmation Pattern

```tsx
const handleDelete = (id: string) => {
  Alert.alert(
    'Konfirmasi',
    'Yakin ingin menghapus item ini?',
    [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          // Delete logic
        },
      },
    ]
  );
};
```

### Icon Guidelines

**Common Icon Mapping:**

| Action | Icon | Size |
|--------|------|------|
| Back/Return | `arrow-back` | 24 |
| Add/Create | `add-circle-outline` | 20-24 |
| Edit | `create-outline` | 20 |
| Delete | `trash-outline` | 20 |
| Search | `search-outline` | 20 |
| Filter | `filter-outline` | 20 |
| Refresh | `refresh-outline` | 20 |
| Settings | `settings-outline` | 20 |
| Info | `information-circle-outline` | 20 |
| Success | `checkmark-circle` | 20-24 |
| Error | `close-circle` | 20-24 |
| Warning | `warning-outline` | 20 |
| Notifications | `notifications-outline` | 20 |
| Profile | `person-outline` | 20 |
| Print | `print-outline` | 18-20 |
| Share | `share-outline` | 18-20 |
| Bluetooth | `bluetooth` | 18-20 |

---

## 11. Implementation Checklist

Gunakan checklist ini saat mengimplementasi halaman baru:

### Setup Halaman

- [ ] Import komponen yang diperlukan
- [ ] Setup `SafeAreaView` dengan `backgroundColor: ColorBase.bgScreen`
- [ ] Tambahkan `PageHeader` dengan judul dan back button
- [ ] Gunakan `useResponsiveLayout()` untuk responsive values
- [ ] Wrap content dengan `ScrollView` atau layout yang sesuai

### Content

- [ ] Gunakan `SectionCard` untuk mengelompokkan konten
- [ ] Gunakan Typography components (bukan raw Text)
- [ ] Gunakan spacing tokens (`$1`, `$2`, `$3`, dll) untuk gap
- [ ] Terapkan color semantic (`$colorSecondary`, `$success`, dll)
- [ ] Konsisten dengan border radius (16px untuk cards, 10px untuk buttons)

### Forms

- [ ] Gunakan `AppInput` untuk semua input fields
- [ ] Tambahkan `label` yang jelas
- [ ] Handle `error` state dengan `AppInputError`
- [ ] Gunakan `hint` untuk penjelasan tambahan
- [ ] Tambahkan icon (`leftIcon`, `rightIcon`) jika relevan

### Buttons

- [ ] Gunakan `AppButton` atau pattern yang konsisten
- [ ] Pilih variant yang sesuai (primary, success, danger, outline)
- [ ] Set size yang tepat (sm untuk inline, lg untuk primary action)
- [ ] Handle loading state
- [ ] Disable saat loading

### States

- [ ] Handle loading state (ActivityIndicator)
- [ ] Handle empty state (icon + message)
- [ ] Handle error state (Alert atau inline)
- [ ] Feedback setelah action (Alert atau toast)

### Navigation

- [ ] Back button berfungsi
- [ ] Clear state saat leaving page (jika perlu)
- [ ] Confirm sebelum navigate saat ada perubahan

### Responsive

- [ ] Test di mobile (< 900px)
- [ ] Test di tablet (>= 900px)
- [ ] Gunakan `horizontalPadding` dari hook
- [ ] Set `maxWidth` untuk container

### Performance

- [ ] Memoize expensive calculations (useMemo)
- [ ] Optimize re-renders
- [ ] Lazy load jika data besar

### Accessibility

- [ ] Kontras warna memadai
- [ ] Touch target >= 44x44px
- [ ] Label jelas untuk semua input
- [ ] Error messages deskriptif

---

## Quick Reference

### Import Statements

```tsx
// Components
import {
  AppButton,
  AppInput,
  PageHeader,
  SectionCard,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH3,
} from '@/components';

// Colors
import {
  ColorBase,
  ColorPrimary,
  ColorSuccess,
  ColorWarning,
  ColorDanger,
  ColorNeutral,
} from '@/themes/Colors';

// Hooks
import { useResponsiveLayout } from '@/hooks/use-responsive';

// Icons
import { Ionicons } from '@expo/vector-icons';

// Navigation
import { useRouter } from 'expo-router';

// State
import { useAtom } from 'jotai';
```

### Common StyleSheet Pattern

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: ColorPrimary.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: ColorBase.white,
    borderWidth: 1.5,
    borderColor: ColorPrimary.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
```

---

## Tips & Best Practices

### DO ✅

- Gunakan design tokens yang sudah ada
- Konsisten dengan spacing scale
- Gunakan semantic color names
- Implement responsive dari awal
- Handle semua states (loading, empty, error)
- Test di berbagai ukuran layar
- Gunakan TypeScript dengan benar

### DON'T ❌

- Hardcode color values (gunakan tokens)
- Buat custom spacing baru
- Mix styling patterns
- Ignore responsive design
- Skip error handling
- Hardcode strings (gunakan i18n jika perlu)
- Copy-paste tanpa memahami pattern

---

Dokumentasi ini akan menjadi referensi utama untuk implementasi Staff Application yang konsisten dengan POS App.
