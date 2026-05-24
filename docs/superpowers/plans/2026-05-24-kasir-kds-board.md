# Kasir KDS Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the kasir app's "Siap Antar" tab into a full 3-column KDS board (Antrian Masuk → Sedang Dimasak → Siap Diantar) with full action buttons, backed by `/api/kds/*` endpoints.

**Architecture:** Add `'kasir'` to the KDS route role guard in `pos-api` so the kasir JWT can access all `/kds/*` endpoints. In `pos-kasir`, add a KDS API client, React Query hooks, and a new `KdsBoardScreen` component. Replace both the tablet and mobile `siap-antar` tabs to render `KdsBoardScreen` instead of `SiapAntarScreen`.

**Tech Stack:** Hono (pos-api), React Native + Expo Router, Axios, @tanstack/react-query, Tamagui (XStack/YStack), @shopify/flash-list, Ionicons.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `pos-api/src/routes/kds/index.ts` | Add `'kasir'` to role guard |
| Modify | `pos-api/src/routes/kds/kds.route.ts` | Update comment on `getStationFilter` |
| Create | `pos-kasir/src/lib/api/kds.api.ts` | KDS HTTP functions |
| Modify | `pos-kasir/src/hooks/api/query-keys.ts` | Add `kdsKeys` |
| Create | `pos-kasir/src/hooks/api/use-kds-board-api.ts` | React Query hooks for KDS |
| Create | `pos-kasir/src/features/orders/screens/KdsBoardScreen.tsx` | 3-column KDS board UI |
| Modify | `pos-kasir/src/app/tablet/(tabs)/siap-antar.tsx` | Render KdsBoardScreen |
| Modify | `pos-kasir/src/app/mobile/(tabs)/siap-antar.tsx` | Render KdsBoardScreen |

---

## Task 1: Backend — Open KDS routes to kasir role

**Files:**
- Modify: `pos-api/src/routes/kds/index.ts`
- Modify: `pos-api/src/routes/kds/kds.route.ts`

- [ ] **Step 1: Edit `pos-api/src/routes/kds/index.ts`**

Replace the existing `requireRole` call to include `'kasir'`:

```ts
// pos-api/src/routes/kds/index.ts
import { Hono } from 'hono'
import { authMiddleware }   from '../../middleware/auth.middleware'
import { tenantMiddleware } from '../../middleware/tenant.middleware'
import { requireRole }      from '../../middleware/role.middleware'
import { kdsRoute } from './kds.route'

export const kdsRoutes = new Hono()

// KDS endpoints: valid JWT + tenant context + role kds/kds_koki/kds_barista/admin_coffee/kasir
kdsRoutes.use('*', authMiddleware, tenantMiddleware, requireRole('kds', 'kds_koki', 'kds_barista', 'admin_coffee', 'kasir'))

kdsRoutes.route('/', kdsRoute)
```

- [ ] **Step 2: Update comment in `pos-api/src/routes/kds/kds.route.ts`**

Find `getStationFilter` (line ~18) and update only its comment line:

```ts
function getStationFilter(role: string): 'KOKI' | 'BARISTA' | null {
  if (role === 'kds_koki') return 'KOKI'
  if (role === 'kds_barista') return 'BARISTA'
  return null // kds (legacy), admin_coffee, kasir: see all stations
}
```

No other changes to `kds.route.ts`.

- [ ] **Step 3: Verify with curl (requires running API)**

```bash
# Get a kasir token first (from login), then:
curl -H "Authorization: Bearer <kasir_token>" http://localhost:3000/api/kds/queue
# Expected: 200 { data: [...] }  (not 403)
```

- [ ] **Step 4: Commit**

```bash
cd pos-api
git add src/routes/kds/index.ts src/routes/kds/kds.route.ts
git commit --no-gpg-sign -m "feat(kds): allow kasir role to access KDS endpoints"
```

---

## Task 2: KDS API client in pos-kasir

**Files:**
- Create: `pos-kasir/src/lib/api/kds.api.ts`

- [ ] **Step 1: Create `pos-kasir/src/lib/api/kds.api.ts`**

```ts
// pos-kasir/src/lib/api/kds.api.ts
import { api } from "./client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KdsBoardOrderItem {
  menuId: string;
  name: string;
  qty: number;
  unitPrice: number;
  note?: string;
  modifiers: Array<{ label: string; extraPrice: number }>;
}

export interface KdsBoardQueueRecord {
  id: string;
  branchId: string;
  shiftId: string;
  tableLabel: string | null;
  customerName: string | null;
  items: KdsBoardOrderItem[];
  createdAt: string;
}

export interface KdsBoardProcessingRecord {
  id: string;
  sourceOrderId: string | null;
  branchId: string;
  shiftId: string;
  tableLabel: string | null;
  customerName: string | null;
  items: KdsBoardOrderItem[];
  startedCookingAt: string;
  createdAt: string;
}

export interface KdsBoardReadyRecord {
  id: string;
  orderId: string | null;
  branchId: string;
  shiftId: string;
  tableLabel: string | null;
  customerName: string | null;
  items: KdsBoardOrderItem[];
  canMarkDelivered: boolean;
  readyAt: string;
  createdAt: string;
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function fetchKdsBoardQueue(): Promise<KdsBoardQueueRecord[]> {
  const { data } = await api.get<{ data: KdsBoardQueueRecord[] }>("/kds/queue");
  return data.data ?? [];
}

export async function fetchKdsBoardProcessing(): Promise<KdsBoardProcessingRecord[]> {
  const { data } = await api.get<{ data: KdsBoardProcessingRecord[] }>("/kds/processing");
  return data.data ?? [];
}

export async function fetchKdsBoardReady(): Promise<KdsBoardReadyRecord[]> {
  const { data } = await api.get<{ data: KdsBoardReadyRecord[] }>("/kds/ready");
  return data.data ?? [];
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function takeKdsBoardOrder(id: string): Promise<void> {
  await api.patch(`/kds/queue/${id}/take`);
}

export async function finishKdsBoardOrder(id: string): Promise<void> {
  await api.patch(`/kds/processing/${id}/done`);
}

export async function deliverKdsBoardOrder(id: string): Promise<void> {
  await api.post(`/kds/ready/${id}/deliver`);
}
```

- [ ] **Step 2: Commit**

```bash
cd pos-kasir
git add src/lib/api/kds.api.ts
git commit --no-gpg-sign -m "feat(kasir): add KDS API client functions"
```

---

## Task 3: Add KDS query keys

**Files:**
- Modify: `pos-kasir/src/hooks/api/query-keys.ts`

- [ ] **Step 1: Add `kdsKeys` export to `query-keys.ts`**

Append after the existing `kasirKeys` export:

```ts
// pos-kasir/src/hooks/api/query-keys.ts  (append at end of file)
export const kdsKeys = {
  all: ["kds"] as const,
  queue: () => [...kdsKeys.all, "queue"] as const,
  processing: () => [...kdsKeys.all, "processing"] as const,
  ready: () => [...kdsKeys.all, "ready"] as const,
};
```

- [ ] **Step 2: Commit**

```bash
cd pos-kasir
git add src/hooks/api/query-keys.ts
git commit --no-gpg-sign -m "feat(kasir): add KDS query keys"
```

---

## Task 4: React Query hooks for KDS board

**Files:**
- Create: `pos-kasir/src/hooks/api/use-kds-board-api.ts`

- [ ] **Step 1: Create `pos-kasir/src/hooks/api/use-kds-board-api.ts`**

```ts
// pos-kasir/src/hooks/api/use-kds-board-api.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchKdsBoardQueue,
  fetchKdsBoardProcessing,
  fetchKdsBoardReady,
  takeKdsBoardOrder,
  finishKdsBoardOrder,
  deliverKdsBoardOrder,
} from "@/lib/api/kds.api";
import { getApiErrorMessage } from "@/lib/api/client";
import { kdsKeys } from "./query-keys";

export { getApiErrorMessage };

const POLL_INTERVAL = 15_000;

export function useKdsBoardQueueQuery(enabled: boolean) {
  return useQuery({
    queryKey: kdsKeys.queue(),
    queryFn: fetchKdsBoardQueue,
    enabled,
    staleTime: POLL_INTERVAL,
    refetchInterval: enabled ? POLL_INTERVAL : false,
  });
}

export function useKdsBoardProcessingQuery(enabled: boolean) {
  return useQuery({
    queryKey: kdsKeys.processing(),
    queryFn: fetchKdsBoardProcessing,
    enabled,
    staleTime: POLL_INTERVAL,
    refetchInterval: enabled ? POLL_INTERVAL : false,
  });
}

export function useKdsBoardReadyQuery(enabled: boolean) {
  return useQuery({
    queryKey: kdsKeys.ready(),
    queryFn: fetchKdsBoardReady,
    enabled,
    staleTime: POLL_INTERVAL,
    refetchInterval: enabled ? POLL_INTERVAL : false,
  });
}

function useInvalidateAllKds() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: kdsKeys.queue() });
    void qc.invalidateQueries({ queryKey: kdsKeys.processing() });
    void qc.invalidateQueries({ queryKey: kdsKeys.ready() });
  };
}

export function useTakeKdsBoardMutation() {
  const invalidate = useInvalidateAllKds();
  return useMutation({
    mutationFn: (id: string) => takeKdsBoardOrder(id),
    onSuccess: invalidate,
  });
}

export function useFinishKdsBoardMutation() {
  const invalidate = useInvalidateAllKds();
  return useMutation({
    mutationFn: (id: string) => finishKdsBoardOrder(id),
    onSuccess: invalidate,
  });
}

export function useDeliverKdsBoardMutation() {
  const invalidate = useInvalidateAllKds();
  return useMutation({
    mutationFn: (id: string) => deliverKdsBoardOrder(id),
    onSuccess: invalidate,
  });
}
```

- [ ] **Step 2: Commit**

```bash
cd pos-kasir
git add src/hooks/api/use-kds-board-api.ts
git commit --no-gpg-sign -m "feat(kasir): add KDS board React Query hooks"
```

---

## Task 5: KdsBoardScreen component

**Files:**
- Create: `pos-kasir/src/features/orders/screens/KdsBoardScreen.tsx`

This is the main UI. It shows 3 columns (segmented tabs on mobile, or all visible on tablet).
Uses `FlashList` from `@shopify/flash-list`, Tamagui `XStack`/`YStack`, and `Ionicons`.

- [ ] **Step 1: Create `pos-kasir/src/features/orders/screens/KdsBoardScreen.tsx`**

```tsx
// pos-kasir/src/features/orders/screens/KdsBoardScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import type { ListRenderItem } from "@shopify/flash-list";
import { useAtomValue } from "jotai";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { PageHeader } from "@/components";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { useAuth } from "@/lib/auth";
import type {
  KdsBoardProcessingRecord,
  KdsBoardQueueRecord,
  KdsBoardReadyRecord,
} from "@/lib/api/kds.api";
import {
  getApiErrorMessage,
  useDeliverKdsBoardMutation,
  useFinishKdsBoardMutation,
  useKdsBoardProcessingQuery,
  useKdsBoardQueueQuery,
  useKdsBoardReadyQuery,
  useTakeKdsBoardMutation,
} from "@/hooks/api/use-kds-board-api";
import { BrandColors } from "@/themes/brand";
import { ColorBase, ColorNeutral, ColorSuccess, ColorWarning } from "@/themes/Colors";
import { formatPrice } from "@/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type BoardColumn = "queue" | "processing" | "ready";

type BoardEntry =
  | { kind: "meta"; id: string; variant: "error" | "loading" | "empty"; column: BoardColumn }
  | { kind: "queue_card"; id: string; record: KdsBoardQueueRecord }
  | { kind: "processing_card"; id: string; record: KdsBoardProcessingRecord }
  | { kind: "ready_card"; id: string; record: KdsBoardReadyRecord };

export type KdsBoardScreenProps = {
  variant: "stack" | "tab";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTs(raw: string): number {
  const t = Date.parse(raw);
  return Number.isNaN(t) ? Date.now() : t;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function itemSummary(
  items: Array<{ name: string; qty: number; note?: string; modifiers: Array<{ label: string }> }>,
): string {
  return items
    .map((it) => {
      const extras = [it.note, ...it.modifiers.map((m) => m.label)].filter(Boolean).join(", ");
      return `${it.qty}x ${it.name}${extras ? ` (${extras})` : ""}`;
    })
    .join(" · ");
}

// ─── Card components ──────────────────────────────────────────────────────────

const QueueCard = memo(function QueueCard({
  record,
  onTake,
  loading,
}: {
  record: KdsBoardQueueRecord;
  onTake: (id: string) => void;
  loading: boolean;
}) {
  const elapsed = Date.now() - parseTs(record.createdAt);
  const isSlow = elapsed > 15 * 60 * 1000;
  return (
    <View style={styles.card}>
      <View style={[styles.accent, styles.accentQueue]} />
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom={4}>
        <Text style={styles.orderCode}>#{record.id.slice(0, 6).toUpperCase()}</Text>
        <Text style={[styles.timer, isSlow && styles.timerSlow]}>{formatElapsed(elapsed)}</Text>
      </XStack>
      <Text style={styles.tableLabel}>{record.tableLabel || record.customerName || "Takeaway"}</Text>
      <Text style={styles.itemSummary} numberOfLines={3}>{itemSummary(record.items)}</Text>
      <Pressable
        style={({ pressed }) => [styles.actionBtn, styles.actionBtnQueue, pressed && styles.pressed]}
        onPress={() => onTake(record.id)}
        disabled={loading}
      >
        <Text style={styles.actionBtnText}>{loading ? "Memproses…" : "Mulai Masak"}</Text>
      </Pressable>
    </View>
  );
});

const ProcessingCard = memo(function ProcessingCard({
  record,
  onFinish,
  loading,
}: {
  record: KdsBoardProcessingRecord;
  onFinish: (id: string) => void;
  loading: boolean;
}) {
  const elapsed = Date.now() - parseTs(record.createdAt);
  const cookElapsed = Date.now() - parseTs(record.startedCookingAt);
  const isSlow = elapsed > 15 * 60 * 1000;
  return (
    <View style={styles.card}>
      <View style={[styles.accent, styles.accentCooking]} />
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom={4}>
        <Text style={styles.orderCode}>#{record.id.slice(0, 6).toUpperCase()}</Text>
        <Text style={[styles.timer, isSlow && styles.timerSlow]}>{formatElapsed(elapsed)}</Text>
      </XStack>
      <Text style={styles.tableLabel}>{record.tableLabel || record.customerName || "Takeaway"}</Text>
      <Text style={styles.cookingLabel}>Memasak {formatElapsed(cookElapsed)}</Text>
      <Text style={styles.itemSummary} numberOfLines={3}>{itemSummary(record.items)}</Text>
      <Pressable
        style={({ pressed }) => [styles.actionBtn, styles.actionBtnFinish, pressed && styles.pressed]}
        onPress={() => onFinish(record.id)}
        disabled={loading}
      >
        <Text style={styles.actionBtnText}>{loading ? "Memproses…" : "Selesai Masak"}</Text>
      </Pressable>
    </View>
  );
});

const ReadyCard = memo(function ReadyCard({
  record,
  onDeliver,
  loading,
}: {
  record: KdsBoardReadyRecord;
  onDeliver: (record: KdsBoardReadyRecord) => void;
  loading: boolean;
}) {
  const elapsed = Date.now() - parseTs(record.readyAt);
  return (
    <View style={styles.card}>
      <View style={[styles.accent, styles.accentReady]} />
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom={4}>
        <Text style={styles.orderCode}>#{record.id.slice(0, 6).toUpperCase()}</Text>
        <Text style={styles.timerReady}>{formatElapsed(elapsed)}</Text>
      </XStack>
      <Text style={styles.tableLabel}>{record.tableLabel || record.customerName || "Takeaway"}</Text>
      <Text style={styles.itemSummary} numberOfLines={3}>{itemSummary(record.items)}</Text>
      {record.canMarkDelivered ? (
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnDeliver, pressed && styles.pressed]}
          onPress={() => onDeliver(record)}
          disabled={loading}
        >
          <Text style={styles.actionBtnText}>{loading ? "Memproses…" : "Sudah Diantar"}</Text>
        </Pressable>
      ) : (
        <View style={styles.pendingPaymentBadge}>
          <Text style={styles.pendingPaymentText}>Menunggu pembayaran</Text>
        </View>
      )}
    </View>
  );
});

// ─── Tab header ───────────────────────────────────────────────────────────────

const COLUMN_LABELS: Record<BoardColumn, string> = {
  queue: "Antrian",
  processing: "Dimasak",
  ready: "Siap Antar",
};

const COLUMN_ICONS: Record<BoardColumn, keyof typeof Ionicons.glyphMap> = {
  queue: "time-outline",
  processing: "flame-outline",
  ready: "checkmark-circle-outline",
};

function ColumnTabBar({
  active,
  counts,
  onSelect,
}: {
  active: BoardColumn;
  counts: Record<BoardColumn, number>;
  onSelect: (col: BoardColumn) => void;
}) {
  const columns: BoardColumn[] = ["queue", "processing", "ready"];
  return (
    <XStack style={styles.tabBar} gap={0}>
      {columns.map((col) => {
        const isActive = col === active;
        return (
          <Pressable
            key={col}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onSelect(col)}
          >
            <XStack alignItems="center" gap={4}>
              <Ionicons
                name={COLUMN_ICONS[col]}
                size={15}
                color={isActive ? BrandColors.deep : ColorNeutral.neutral500}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {COLUMN_LABELS[col]}
              </Text>
              {counts[col] > 0 ? (
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                    {counts[col]}
                  </Text>
                </View>
              ) : null}
            </XStack>
          </Pressable>
        );
      })}
    </XStack>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function KdsBoardScreen({ variant }: KdsBoardScreenProps) {
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const enabled = Boolean(isLoggedIn && isShiftStarted);

  const [activeColumn, setActiveColumn] = useState<BoardColumn>("queue");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const queueQ = useKdsBoardQueueQuery(enabled);
  const processingQ = useKdsBoardProcessingQuery(enabled);
  const readyQ = useKdsBoardReadyQuery(enabled);

  const takeMutation = useTakeKdsBoardMutation();
  const finishMutation = useFinishKdsBoardMutation();
  const deliverMutation = useDeliverKdsBoardMutation();

  const isLoading = queueQ.isLoading || processingQ.isLoading || readyQ.isLoading;
  const isFetching = queueQ.isFetching || processingQ.isFetching || readyQ.isFetching;
  const isError = queueQ.isError || processingQ.isError || readyQ.isError;
  const errorMessage = useMemo(() => {
    const err = queueQ.error ?? processingQ.error ?? readyQ.error;
    return err ? getApiErrorMessage(err, "Gagal memuat data KDS.") : null;
  }, [queueQ.error, processingQ.error, readyQ.error]);

  const counts: Record<BoardColumn, number> = useMemo(
    () => ({
      queue: queueQ.data?.length ?? 0,
      processing: processingQ.data?.length ?? 0,
      ready: readyQ.data?.length ?? 0,
    }),
    [queueQ.data, processingQ.data, readyQ.data],
  );

  const handleRefresh = useCallback(() => {
    void queueQ.refetch();
    void processingQ.refetch();
    void readyQ.refetch();
  }, [queueQ, processingQ, readyQ]);

  const handleTake = useCallback(
    (id: string) => {
      setActionLoadingId(id);
      takeMutation.mutate(id, {
        onSettled: () => setActionLoadingId(null),
        onError: (err) =>
          Alert.alert("Gagal", getApiErrorMessage(err, "Gagal mengambil pesanan.")),
      });
    },
    [takeMutation],
  );

  const handleFinish = useCallback(
    (id: string) => {
      setActionLoadingId(id);
      finishMutation.mutate(id, {
        onSettled: () => setActionLoadingId(null),
        onError: (err) =>
          Alert.alert("Gagal", getApiErrorMessage(err, "Gagal menyelesaikan pesanan.")),
      });
    },
    [finishMutation],
  );

  const handleDeliver = useCallback(
    (record: KdsBoardReadyRecord) => {
      Alert.alert(
        "Tandai sudah diantar?",
        `${record.tableLabel || record.customerName || "Pesanan"} akan hilang dari daftar.`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Sudah Diantar",
            onPress: () => {
              setActionLoadingId(record.id);
              deliverMutation.mutate(record.id, {
                onSettled: () => setActionLoadingId(null),
                onError: (err) =>
                  Alert.alert(
                    "Gagal",
                    getApiErrorMessage(err, "Gagal menandai pesanan sudah diantar."),
                  ),
              });
            },
          },
        ],
      );
    },
    [deliverMutation],
  );

  // Build flat list entries for the active column
  const entries: BoardEntry[] = useMemo(() => {
    if (activeColumn === "queue") {
      if (isLoading) return [{ kind: "meta", id: "loading", variant: "loading", column: "queue" }];
      if (isError) return [{ kind: "meta", id: "error", variant: "error", column: "queue" }];
      if (!queueQ.data?.length) return [{ kind: "meta", id: "empty", variant: "empty", column: "queue" }];
      return queueQ.data.map((r) => ({ kind: "queue_card" as const, id: r.id, record: r }));
    }
    if (activeColumn === "processing") {
      if (isLoading) return [{ kind: "meta", id: "loading", variant: "loading", column: "processing" }];
      if (isError) return [{ kind: "meta", id: "error", variant: "error", column: "processing" }];
      if (!processingQ.data?.length) return [{ kind: "meta", id: "empty", variant: "empty", column: "processing" }];
      return processingQ.data.map((r) => ({ kind: "processing_card" as const, id: r.id, record: r }));
    }
    // ready
    if (isLoading) return [{ kind: "meta", id: "loading", variant: "loading", column: "ready" }];
    if (isError) return [{ kind: "meta", id: "error", variant: "error", column: "ready" }];
    if (!readyQ.data?.length) return [{ kind: "meta", id: "empty", variant: "empty", column: "ready" }];
    return readyQ.data.map((r) => ({ kind: "ready_card" as const, id: r.id, record: r }));
  }, [activeColumn, isLoading, isError, queueQ.data, processingQ.data, readyQ.data]);

  const renderItem = useCallback<ListRenderItem<BoardEntry>>(
    ({ item }) => {
      if (item.kind === "meta") {
        if (item.variant === "loading") {
          return (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyText}>Memuat…</Text>
            </View>
          );
        }
        if (item.variant === "error") {
          return (
            <View style={styles.emptyPanel}>
              <Ionicons name="alert-circle-outline" size={32} color={ColorWarning.warning500} />
              <Text style={styles.emptyText}>{errorMessage ?? "Gagal memuat data."}</Text>
              <Pressable onPress={handleRefresh} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Coba lagi</Text>
              </Pressable>
            </View>
          );
        }
        // empty
        const labels: Record<BoardColumn, string> = {
          queue: "Tidak ada antrian baru.",
          processing: "Tidak ada pesanan yang sedang dimasak.",
          ready: "Belum ada pesanan siap diantar.",
        };
        return (
          <View style={styles.emptyPanel}>
            <Ionicons name="checkmark-done-outline" size={36} color={ColorNeutral.neutral300} />
            <Text style={styles.emptyText}>{labels[item.column]}</Text>
          </View>
        );
      }

      if (item.kind === "queue_card") {
        return (
          <QueueCard
            record={item.record}
            onTake={handleTake}
            loading={actionLoadingId === item.record.id}
          />
        );
      }

      if (item.kind === "processing_card") {
        return (
          <ProcessingCard
            record={item.record}
            onFinish={handleFinish}
            loading={actionLoadingId === item.record.id}
          />
        );
      }

      // ready_card
      return (
        <ReadyCard
          record={(item as { kind: "ready_card"; id: string; record: KdsBoardReadyRecord }).record}
          onDeliver={handleDeliver}
          loading={actionLoadingId === (item as { kind: "ready_card"; id: string; record: KdsBoardReadyRecord }).record.id}
        />
      );
    },
    [actionLoadingId, errorMessage, handleTake, handleFinish, handleDeliver, handleRefresh],
  );

  const keyExtractor = useCallback((item: BoardEntry) => item.id, []);
  const getItemType = useCallback((item: BoardEntry) => item.kind, []);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Status Dapur"
        subtitle="Pantau dan eksekusi pesanan dari dapur langsung di kasir."
        showBack={variant === "stack"}
      />

      <ColumnTabBar
        active={activeColumn}
        counts={counts}
        onSelect={setActiveColumn}
      />

      <FlashList
        data={entries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        estimatedItemSize={140}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        drawDistance={480}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={handleRefresh}
            tintColor={BrandColors.deep}
            colors={[BrandColors.deep]}
          />
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 112,
  },
  // Tab bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: ColorBase.white,
    borderBottomWidth: 1,
    borderBottomColor: ColorNeutral.neutral100,
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: BrandColors.deep,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: ColorNeutral.neutral500,
  },
  tabLabelActive: {
    color: BrandColors.deep,
  },
  badge: {
    backgroundColor: ColorNeutral.neutral200,
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeActive: {
    backgroundColor: BrandColors.tint,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: ColorNeutral.neutral600,
  },
  badgeTextActive: {
    color: BrandColors.deep,
  },
  // Cards
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral100,
    shadowColor: ColorNeutral.neutralShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 4,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  accentQueue: { backgroundColor: BrandColors.deep },
  accentCooking: { backgroundColor: ColorWarning.warning500 },
  accentReady: { backgroundColor: ColorSuccess.success500 },
  orderCode: {
    fontSize: 15,
    fontWeight: "800",
    color: ColorNeutral.neutral900,
  },
  timer: {
    fontSize: 13,
    fontWeight: "600",
    color: ColorNeutral.neutral500,
    fontVariant: ["tabular-nums"],
  },
  timerSlow: {
    color: "#dc2626",
  },
  timerReady: {
    fontSize: 13,
    fontWeight: "600",
    color: ColorSuccess.success700,
    fontVariant: ["tabular-nums"],
  },
  tableLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: ColorNeutral.neutral800,
    marginBottom: 4,
  },
  cookingLabel: {
    fontSize: 12,
    color: ColorWarning.warning700,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemSummary: {
    fontSize: 13,
    color: ColorNeutral.neutral600,
    marginBottom: 10,
    lineHeight: 18,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionBtnQueue: {
    backgroundColor: BrandColors.deep,
  },
  actionBtnFinish: {
    backgroundColor: ColorSuccess.success600,
  },
  actionBtnDeliver: {
    backgroundColor: ColorSuccess.success600,
  },
  actionBtnText: {
    color: ColorBase.white,
    fontWeight: "700",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.82,
  },
  pendingPaymentBadge: {
    backgroundColor: ColorWarning.warning100,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  pendingPaymentText: {
    fontSize: 12,
    fontWeight: "600",
    color: ColorWarning.warning800,
  },
  // Empty / meta states
  emptyPanel: {
    backgroundColor: ColorBase.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral100,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    marginTop: 8,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: ColorNeutral.neutral500,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.deep,
  },
});
```

- [ ] **Step 2: Commit**

```bash
cd pos-kasir
git add src/features/orders/screens/KdsBoardScreen.tsx
git commit --no-gpg-sign -m "feat(kasir): add KdsBoardScreen with 3-column KDS state"
```

---

## Task 6: Wire tabs to KdsBoardScreen

**Files:**
- Modify: `pos-kasir/src/app/tablet/(tabs)/siap-antar.tsx`
- Modify: `pos-kasir/src/app/mobile/(tabs)/siap-antar.tsx`

- [ ] **Step 1: Replace content of `pos-kasir/src/app/tablet/(tabs)/siap-antar.tsx`**

```tsx
// pos-kasir/src/app/tablet/(tabs)/siap-antar.tsx
import React from "react";
import { KdsBoardScreen } from "@/features/orders/screens/KdsBoardScreen";

export default function TabletSiapAntarTab() {
  return <KdsBoardScreen variant="tab" />;
}
```

- [ ] **Step 2: Replace content of `pos-kasir/src/app/mobile/(tabs)/siap-antar.tsx`**

```tsx
// pos-kasir/src/app/mobile/(tabs)/siap-antar.tsx
import React from "react";
import { KdsBoardScreen } from "@/features/orders/screens/KdsBoardScreen";

export default function MobileSiapAntarTab() {
  return <KdsBoardScreen variant="tab" />;
}
```

- [ ] **Step 3: Commit**

```bash
cd pos-kasir
git add "src/app/tablet/(tabs)/siap-antar.tsx" "src/app/mobile/(tabs)/siap-antar.tsx"
git commit --no-gpg-sign -m "feat(kasir): wire siap-antar tabs to KdsBoardScreen"
```

---

## Verification Checklist

After all tasks are complete:

- [ ] Login sebagai kasir → buka tab "Siap Antar" → tampil ColumnTabBar dengan 3 tab
- [ ] Tab "Antrian" menampilkan daftar pesanan dari `GET /kds/queue` (bukan 403)
- [ ] Tab "Dimasak" menampilkan daftar dari `GET /kds/processing`
- [ ] Tab "Siap Antar" menampilkan daftar dari `GET /kds/ready`
- [ ] Tombol "Mulai Masak" berhasil hit `PATCH /kds/queue/:id/take` → pesanan pindah ke tab Dimasak
- [ ] Tombol "Selesai Masak" berhasil hit `PATCH /kds/processing/:id/done` → pindah ke tab Siap Antar
- [ ] Tombol "Sudah Diantar" dengan konfirmasi Alert → hit `POST /kds/ready/:id/deliver` → hilang dari list
- [ ] Setelah aksi, semua 3 tab otomatis di-invalidate dan refresh
- [ ] Error state tampil dengan pesan dan tombol retry jika API gagal
- [ ] Empty state tampil jika kolom kosong
- [ ] Polling 15s berjalan (bisa dicek dengan Network tab atau log)
- [ ] KDS dashboard di `/koki` tetap berfungsi normal (tidak terpengaruh perubahan backend)
