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
