# Design: Kasir KDS State (Full Board)

**Date:** 2026-05-24  
**Status:** Approved  
**Scope:** `pos-api` (backend) + `pos-kasir` (React Native frontend)

---

## Background

The KDS dashboard (`pos-dashboard` at `/koki`) shows a 3-column board:
**Antrean Masuk → Sedang Dimasak → Siap Diantar**, with real-time SSE updates and full action buttons.

Currently the kasir app only has a partial "Siap Antar" screen (`SiapAntarScreen`) which uses
a separate kasir endpoint (`GET /kasir/orders/ready`), has no real-time updates, and shows only
the ready column — no pending or cooking state.

The client wants the kasir app to show the same full KDS state and be able to execute all KDS actions.

---

## Goal

Upgrade the kasir app's "Siap Antar" tab into a full **KDS Board** with:
- 3-column state: Antrian Masuk | Sedang Dimasak | Siap Diantar
- Full action buttons: Mulai Masak, Selesai, Sudah Diantar
- Real-time SSE updates (fallback: 15s polling)

---

## Section 1: Backend (`pos-api`)

### Problem
`/api/kds/*` routes are guarded by:
```ts
requireRole('kds', 'kds_koki', 'kds_barista', 'admin_coffee')
```
Role `kasir` is NOT in this list, so all KDS endpoints return 403.

### Change

**File:** `src/routes/kds/index.ts`

Add `'kasir'` to `requireRole(...)`:
```ts
kdsRoutes.use(
  '*',
  authMiddleware,
  tenantMiddleware,
  requireRole('kds', 'kds_koki', 'kds_barista', 'admin_coffee', 'kasir'),
)
```

**File:** `src/routes/kds/kds.route.ts`

Update the comment in `getStationFilter()` to reflect that `kasir` also gets `null` (sees all stations):
```ts
function getStationFilter(role: string): 'KOKI' | 'BARISTA' | null {
  if (role === 'kds_koki') return 'KOKI'
  if (role === 'kds_barista') return 'BARISTA'
  return null // kds (legacy), admin_coffee, kasir: see all stations
}
```

No other backend changes needed. `kasir` seeing all stations is correct — a cashier needs visibility of both kitchen and barista orders.

### Endpoints now accessible to kasir

| Method | Path | Action |
|--------|------|--------|
| GET | `/kds/queue` | List pending orders |
| GET | `/kds/processing` | List cooking orders |
| GET | `/kds/ready` | List ready-to-deliver orders |
| PATCH | `/kds/queue/:id/take` | Move pending → cooking |
| PATCH | `/kds/processing/:id/done` | Move cooking → ready |
| POST | `/kds/ready/:id/deliver` | Mark order as delivered |
| GET | `/kds/stream` | SSE real-time stream |

---

## Section 2: Frontend (`pos-kasir`)

The kasir app is a React Native (Expo) app. Components cannot be shared directly with the
React web dashboard. New native UI components must be created following the existing RN patterns
in `pos-kasir`.

### New Files

#### `src/lib/api/kds.api.ts`
KDS API client — mirrors the interface of `pos-dashboard/src/features/kds/kds-api.ts` but without
the SSE helper (SSE in RN needs a different implementation or simple polling instead).

```ts
// Exported functions:
fetchKdsBoardQueue(): Promise<KdsBoardQueueRecord[]>
fetchKdsBoardProcessing(): Promise<KdsBoardProcessingRecord[]>
fetchKdsBoardReady(): Promise<KdsBoardReadyRecord[]>
takeKdsBoardOrder(id: string): Promise<void>
finishKdsBoardOrder(id: string): Promise<void>
deliverKdsBoardOrder(id: string): Promise<void>
```

Types mirror `KdsQueueOrderRecord`, `KdsProcessingOrderRecord`, `KdsReadyOrderRecord` from the
dashboard.

#### `src/hooks/api/use-kds-board-api.ts`
React Query hooks:
```ts
useKdsBoardQueueQuery(enabled: boolean)
useKdsBoardProcessingQuery(enabled: boolean)
useKdsBoardReadyQuery(enabled: boolean)
useTakeKdsBoardMutation()
useFinishKdsBoardMutation()
useDeliverKdsBoardMutation()
```

All queries use `refetchInterval: 15_000` as a polling fallback.

#### `src/features/orders/screens/KdsBoardScreen.tsx`
New screen replacing `SiapAntarScreen` for the siap-antar tab.

**Layout:**
- **Mobile (portrait):** Segmented control header (`Antrian | Dimasak | Siap Antar`) with
  badge counts, vertical `FlashList` below showing the selected column's cards.
- **Tablet (landscape):** 3-column `ScrollView` side by side.

**Card actions per column:**

| Column | Button | Mutation |
|--------|--------|----------|
| Antrian Masuk | "Mulai Masak" | `PATCH /kds/queue/:id/take` |
| Sedang Dimasak | "Selesai" | `PATCH /kds/processing/:id/done` |
| Siap Diantar | "Sudah Diantar" | `POST /kds/ready/:id/deliver` |

Each card shows: order code, table/customer label, item list with quantities and notes,
elapsed timer since entry (seconds counter).

**Props:**
```ts
type KdsBoardScreenProps = {
  variant: 'stack' | 'tab'
}
```

### Modified Files

#### `src/app/tablet/(tabs)/siap-antar.tsx`
Change rendered component from `SiapAntarScreen` to `KdsBoardScreen`:
```tsx
import { KdsBoardScreen } from "@/features/orders/screens/KdsBoardScreen"
export default function TabletSiapAntarTab() {
  return <KdsBoardScreen variant="tab" />
}
```

#### `src/app/mobile/(tabs)/siap-antar.tsx`
Same change as tablet:
```tsx
import { KdsBoardScreen } from "@/features/orders/screens/KdsBoardScreen"
export default function MobileSiapAntarTab() {
  return <KdsBoardScreen variant="tab" />
}
```

`SiapAntarScreen.tsx` is kept as-is (not deleted) — it may be referenced elsewhere or
reactivated later.

---

## Data Flow

```
Kasir App
  │
  ├─ useKdsBoardQueueQuery ──────── GET /api/kds/queue
  ├─ useKdsBoardProcessingQuery ─── GET /api/kds/processing
  ├─ useKdsBoardReadyQuery ──────── GET /api/kds/ready
  │    └─ refetchInterval: 15s
  │
  ├─ useTakeKdsBoardMutation ────── PATCH /api/kds/queue/:id/take
  ├─ useFinishKdsBoardMutation ──── PATCH /api/kds/processing/:id/done
  └─ useDeliverKdsBoardMutation ─── POST /api/kds/ready/:id/deliver
```

On any mutation success → invalidate all 3 query keys.

---

## Error Handling

- 403 on any KDS endpoint (kasir role not yet updated on server): surface user-friendly
  banner "Belum ada akses KDS. Hubungi admin."
- Network error / API error: show inline error with retry button.
- Empty state per column: show empty illustration with descriptive text.

---

## Out of Scope

- SSE real-time connection in kasir (polling every 15s is sufficient for MVP)
- Station filter UI (kasir always sees all stations)
- Analytics / reporting for KDS
- Push notifications for new orders

---

## Testing Notes

1. Login with `kasir` role → open "Siap Antar" tab → should see 3-column KDS board
2. Verify `GET /kds/queue` returns 200 (not 403) for `kasir` token
3. Place an order → appears in Antrian Masuk in kasir app
4. Tap "Mulai Masak" → moves to Sedang Dimasak
5. Tap "Selesai" → moves to Siap Diantar
6. Tap "Sudah Diantar" → disappears from board
7. Verify KDS dashboard (`/koki`) reflects same state changes
