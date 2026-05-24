// pos-kasir/src/features/orders/screens/KdsBoardScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import type { ListRenderItem } from "@shopify/flash-list";
import { useAtomValue } from "jotai";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack } from "tamagui";

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

// ─── Types ────────────────────────────────────────────────────────────────────

type BoardColumn = "queue" | "processing" | "ready";

type QueueEntry =
  | { kind: "meta"; id: string; variant: "error" | "loading" | "empty" }
  | { kind: "queue_card"; id: string; record: KdsBoardQueueRecord };

type ProcessingEntry =
  | { kind: "meta"; id: string; variant: "error" | "loading" | "empty" }
  | { kind: "processing_card"; id: string; record: KdsBoardProcessingRecord };

type ReadyEntry =
  | { kind: "meta"; id: string; variant: "error" | "loading" | "empty" }
  | { kind: "ready_card"; id: string; record: KdsBoardReadyRecord };

export type KdsBoardScreenProps = {
  variant: "stack" | "tab";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTs(raw: string): number {
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return Date.now();
  // Some backend timestamps may be serialized as UTC even though the stored
  // value represents local wall time — compensate so timer starts at 00:00.
  if (parsed > Date.now() + 60_000) {
    const adjusted = parsed + new Date().getTimezoneOffset() * 60_000;
    if (adjusted <= Date.now() + 60_000) return adjusted;
  }
  return parsed;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function itemSummary(
  items: { name: string; qty: number; note?: string; modifiers: { label: string }[] }[],
): string {
  return items
    .map((it) => {
      const extras = [it.note, ...it.modifiers.map((m) => m.label)].filter(Boolean).join(", ");
      return `${it.qty}x ${it.name}${extras ? ` (${extras})` : ""}`;
    })
    .join(" · ");
}

// ─── Live timer hook ──────────────────────────────────────────────────────────

function useNowTick(ms: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

// ─── Card components ──────────────────────────────────────────────────────────

const QueueCard = memo(function QueueCard({
  record,
  onTake,
  loading,
  now,
}: {
  record: KdsBoardQueueRecord;
  onTake: (id: string) => void;
  loading: boolean;
  now: number;
}) {
  const summary = useMemo(() => itemSummary(record.items), [record.items]);
  const elapsed = now - parseTs(record.createdAt);
  const isSlow = elapsed > 15 * 60 * 1000;
  return (
    <View style={styles.card}>
      <View style={[styles.accent, styles.accentQueue]} />
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom={4}>
        <Text style={styles.orderCode}>#{record.id.slice(0, 6).toUpperCase()}</Text>
        <Text style={[styles.timer, isSlow && styles.timerSlow]}>{formatElapsed(elapsed)}</Text>
      </XStack>
      <Text style={styles.tableLabel}>{record.tableLabel || record.customerName || "Takeaway"}</Text>
      <Text style={styles.phaseLabel}>Belum dimasak</Text>
      <Text style={styles.itemSummary} numberOfLines={3}>{summary}</Text>
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
  now,
}: {
  record: KdsBoardProcessingRecord;
  onFinish: (id: string) => void;
  loading: boolean;
  now: number;
}) {
  const summary = useMemo(() => itemSummary(record.items), [record.items]);
  const elapsed = now - parseTs(record.createdAt);
  const cookElapsed = now - parseTs(record.startedCookingAt);
  const isSlow = elapsed > 15 * 60 * 1000;
  const cookSec = Math.max(0, Math.floor(cookElapsed / 1000));
  return (
    <View style={styles.card}>
      <View style={[styles.accent, styles.accentCooking]} />
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom={4}>
        <Text style={styles.orderCode}>#{record.id.slice(0, 6).toUpperCase()}</Text>
        <Text style={[styles.timer, isSlow && styles.timerSlow]}>{formatElapsed(elapsed)}</Text>
      </XStack>
      <Text style={styles.tableLabel}>{record.tableLabel || record.customerName || "Takeaway"}</Text>
      <Text style={styles.cookingLabel}>Mulai dimasak {formatElapsed(cookSec * 1000)} lalu</Text>
      <Text style={styles.itemSummary} numberOfLines={3}>{summary}</Text>
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
  now,
}: {
  record: KdsBoardReadyRecord;
  onDeliver: (record: KdsBoardReadyRecord) => void;
  loading: boolean;
  now: number;
}) {
  const summary = useMemo(() => itemSummary(record.items), [record.items]);
  const elapsed = now - parseTs(record.createdAt);
  const readyElapsed = now - parseTs(record.readyAt);
  const isSlow = elapsed > 15 * 60 * 1000;
  return (
    <View style={styles.card}>
      <View style={[styles.accent, styles.accentReady]} />
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom={4}>
        <Text style={styles.orderCode}>#{record.id.slice(0, 6).toUpperCase()}</Text>
        <Text style={[styles.timer, isSlow && styles.timerSlow]}>{formatElapsed(elapsed)}</Text>
      </XStack>
      <Text style={styles.tableLabel}>{record.tableLabel || record.customerName || "Takeaway"}</Text>
      <Text style={styles.readyLabel}>Siap diantar sejak {formatElapsed(readyElapsed)}</Text>
      <Text style={styles.itemSummary} numberOfLines={3}>{summary}</Text>
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

// ─── Column header ─────────────────────────────────────────────────────────────

const COLUMN_ICONS: Record<BoardColumn, keyof typeof Ionicons.glyphMap> = {
  queue: "time-outline",
  processing: "flame-outline",
  ready: "checkmark-circle-outline",
};

const COLUMN_ICON_COLORS: Record<BoardColumn, string> = {
  queue: BrandColors.deep,
  processing: ColorWarning.warning600 ?? "#d97706",
  ready: ColorSuccess.success600 ?? "#16a34a",
};

const COLUMN_LABELS: Record<BoardColumn, string> = {
  queue: "Antrian",
  processing: "Dimasak",
  ready: "Siap Antar",
};

const ColumnHeader = memo(function ColumnHeader({
  column,
  count,
}: {
  column: BoardColumn;
  count: number;
}) {
  return (
    <XStack
      style={styles.columnHeader}
      alignItems="center"
      justifyContent="space-between"
    >
      <XStack alignItems="center" gap={6}>
        <Ionicons
          name={COLUMN_ICONS[column]}
          size={16}
          color={COLUMN_ICON_COLORS[column]}
        />
        <Text style={styles.columnTitle}>{COLUMN_LABELS[column]}</Text>
      </XStack>
      {count > 0 && (
        <View style={[styles.columnBadge, column === "queue" && styles.columnBadgeQueue, column === "processing" && styles.columnBadgeProcessing, column === "ready" && styles.columnBadgeReady]}>
          <Text style={styles.columnBadgeText}>{count}</Text>
        </View>
      )}
    </XStack>
  );
});

// ─── Empty / meta states ───────────────────────────────────────────────────────

const EMPTY_LABELS: Record<BoardColumn, string> = {
  queue: "Tidak ada antrian baru.",
  processing: "Tidak ada pesanan yang sedang dimasak.",
  ready: "Belum ada pesanan siap diantar.",
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export function KdsBoardScreen({ variant }: KdsBoardScreenProps) {
  const { isLoggedIn } = useAuth();
  const isShiftStarted = useAtomValue(isShiftStartedAtom);
  const enabled = Boolean(isLoggedIn && isShiftStarted);

  const now = useNowTick(1000);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const queueQ = useKdsBoardQueueQuery(enabled);
  const processingQ = useKdsBoardProcessingQuery(enabled);
  const readyQ = useKdsBoardReadyQuery(enabled);

  const queueData = queueQ.data;
  const processingData = processingQ.data;
  const readyData = readyQ.data;

  const takeMutation = useTakeKdsBoardMutation();
  const finishMutation = useFinishKdsBoardMutation();
  const deliverMutation = useDeliverKdsBoardMutation();

  const isLoading = queueQ.isLoading || processingQ.isLoading || readyQ.isLoading;
  const isError = queueQ.isError || processingQ.isError || readyQ.isError;
  const errorMessage = useMemo(() => {
    const err = queueQ.error ?? processingQ.error ?? readyQ.error;
    return err ? getApiErrorMessage(err, "Gagal memuat data KDS.") : null;
  }, [queueQ.error, processingQ.error, readyQ.error]);

  const counts: Record<BoardColumn, number> = useMemo(
    () => ({
      queue: queueData?.length ?? 0,
      processing: processingData?.length ?? 0,
      ready: readyData?.length ?? 0,
    }),
    [queueData, processingData, readyData],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([queueQ.refetch(), processingQ.refetch(), readyQ.refetch()]);
    setRefreshing(false);
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

  // ── Column entries ──────────────────────────────────────────────────────────

  const queueEntries: QueueEntry[] = useMemo(() => {
    if (isLoading) return [{ kind: "meta", id: "loading", variant: "loading" }];
    if (isError) return [{ kind: "meta", id: "error", variant: "error" }];
    if (!queueData?.length) return [{ kind: "meta", id: "empty", variant: "empty" }];
    return queueData.map((r) => ({ kind: "queue_card" as const, id: r.id, record: r }));
  }, [isLoading, isError, queueData]);

  const processingEntries: ProcessingEntry[] = useMemo(() => {
    if (isLoading) return [{ kind: "meta", id: "loading", variant: "loading" }];
    if (isError) return [{ kind: "meta", id: "error", variant: "error" }];
    if (!processingData?.length) return [{ kind: "meta", id: "empty", variant: "empty" }];
    return processingData.map((r) => ({ kind: "processing_card" as const, id: r.id, record: r }));
  }, [isLoading, isError, processingData]);

  const readyEntries: ReadyEntry[] = useMemo(() => {
    if (isLoading) return [{ kind: "meta", id: "loading", variant: "loading" }];
    if (isError) return [{ kind: "meta", id: "error", variant: "error" }];
    if (!readyData?.length) return [{ kind: "meta", id: "empty", variant: "empty" }];
    return readyData.map((r) => ({ kind: "ready_card" as const, id: r.id, record: r }));
  }, [isLoading, isError, readyData]);

  // ── Render helpers ──────────────────────────────────────────────────────────

  const renderMetaItem = useCallback(
    (variant: "loading" | "error" | "empty", column: BoardColumn) => {
      if (variant === "loading") {
        return (
          <View style={styles.emptyPanel}>
            <Text style={styles.emptyText}>Memuat…</Text>
          </View>
        );
      }
      if (variant === "error") {
        return (
          <View style={styles.emptyPanel}>
            <Ionicons name="alert-circle-outline" size={28} color={ColorWarning.warning500} />
            <Text style={styles.emptyText}>{errorMessage ?? "Gagal memuat data."}</Text>
            <Pressable onPress={handleRefresh} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Coba lagi</Text>
            </Pressable>
          </View>
        );
      }
      return (
        <View style={styles.emptyPanel}>
          <Ionicons name="checkmark-done-outline" size={28} color={ColorNeutral.neutral300} />
          <Text style={styles.emptyText}>{EMPTY_LABELS[column]}</Text>
        </View>
      );
    },
    [errorMessage, handleRefresh],
  );

  const renderQueueItem = useCallback<ListRenderItem<QueueEntry>>(
    ({ item }) => {
      if (item.kind === "meta") return renderMetaItem(item.variant, "queue");
      return (
        <QueueCard
          record={item.record}
          onTake={handleTake}
          loading={actionLoadingId === item.record.id}
          now={now}
        />
      );
    },
    [actionLoadingId, handleTake, now, renderMetaItem],
  );

  const renderProcessingItem = useCallback<ListRenderItem<ProcessingEntry>>(
    ({ item }) => {
      if (item.kind === "meta") return renderMetaItem(item.variant, "processing");
      return (
        <ProcessingCard
          record={item.record}
          onFinish={handleFinish}
          loading={actionLoadingId === item.record.id}
          now={now}
        />
      );
    },
    [actionLoadingId, handleFinish, now, renderMetaItem],
  );

  const renderReadyItem = useCallback<ListRenderItem<ReadyEntry>>(
    ({ item }) => {
      if (item.kind === "meta") return renderMetaItem(item.variant, "ready");
      return (
        <ReadyCard
          record={item.record}
          onDeliver={handleDeliver}
          loading={actionLoadingId === item.record.id}
          now={now}
        />
      );
    },
    [actionLoadingId, handleDeliver, now, renderMetaItem],
  );

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);
  const getQueueItemType = useCallback((item: QueueEntry) => item.kind, []);
  const getProcessingItemType = useCallback((item: ProcessingEntry) => item.kind, []);
  const getReadyItemType = useCallback((item: ReadyEntry) => item.kind, []);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={BrandColors.deep}
      colors={[BrandColors.deep]}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <PageHeader
        title="Status Dapur"
        subtitle="Pantau dan eksekusi pesanan dari dapur langsung di kasir."
        showBack={variant === "stack"}
      />

      <View style={styles.board}>
        {/* ── Antrian ──────────────────────────────────────────────────────── */}
        <View style={styles.column}>
          <ColumnHeader column="queue" count={counts.queue} />
          <FlashList
            data={queueEntries}
            renderItem={renderQueueItem}
            keyExtractor={keyExtractor}
            getItemType={getQueueItemType}
            contentContainerStyle={styles.columnListContent}
            showsVerticalScrollIndicator={false}
            drawDistance={480}
            refreshControl={refreshControl}
          />
        </View>

        <View style={styles.columnDivider} />

        {/* ── Dimasak ──────────────────────────────────────────────────────── */}
        <View style={styles.column}>
          <ColumnHeader column="processing" count={counts.processing} />
          <FlashList
            data={processingEntries}
            renderItem={renderProcessingItem}
            keyExtractor={keyExtractor}
            getItemType={getProcessingItemType}
            contentContainerStyle={styles.columnListContent}
            showsVerticalScrollIndicator={false}
            drawDistance={480}
            refreshControl={refreshControl}
          />
        </View>

        <View style={styles.columnDivider} />

        {/* ── Siap Antar ───────────────────────────────────────────────────── */}
        <View style={styles.column}>
          <ColumnHeader column="ready" count={counts.ready} />
          <FlashList
            data={readyEntries}
            renderItem={renderReadyItem}
            keyExtractor={keyExtractor}
            getItemType={getReadyItemType}
            contentContainerStyle={styles.columnListContent}
            showsVerticalScrollIndicator={false}
            drawDistance={480}
            refreshControl={refreshControl}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.canvas,
  },
  // 3-column board
  board: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 0,
    gap: 0,
  },
  column: {
    flex: 1,
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral100,
    overflow: "hidden",
    shadowColor: ColorNeutral.neutralShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  columnDivider: {
    width: 8,
  },
  columnHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: ColorNeutral.neutral100,
    backgroundColor: ColorBase.white,
  },
  columnTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: ColorNeutral.neutral700,
  },
  columnBadge: {
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  columnBadgeQueue: {
    backgroundColor: BrandColors.tint,
  },
  columnBadgeProcessing: {
    backgroundColor: ColorWarning.warning100,
  },
  columnBadgeReady: {
    backgroundColor: ColorSuccess.success50,
  },
  columnBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: ColorNeutral.neutral800,
  },
  columnListContent: {
    padding: 8,
    paddingBottom: 80,
  },
  // Cards
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral100,
    shadowColor: ColorNeutral.neutralShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  accentQueue: { backgroundColor: BrandColors.deep },
  accentCooking: { backgroundColor: ColorWarning.warning500 },
  accentReady: { backgroundColor: ColorSuccess.success500 },
  orderCode: {
    fontSize: 14,
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
  tableLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: ColorNeutral.neutral800,
    marginBottom: 2,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: ColorNeutral.neutral400,
    marginBottom: 4,
  },
  cookingLabel: {
    fontSize: 11,
    color: ColorWarning.warning700,
    fontWeight: "600",
    marginBottom: 4,
  },
  readyLabel: {
    fontSize: 11,
    color: ColorSuccess.success700,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemSummary: {
    fontSize: 12,
    color: ColorNeutral.neutral600,
    marginBottom: 10,
    lineHeight: 17,
  },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 9,
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
    fontSize: 13,
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
    fontSize: 11,
    fontWeight: "600",
    color: ColorWarning.warning800,
  },
  // Empty / meta states
  emptyPanel: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: ColorNeutral.neutral500,
    textAlign: "center",
    lineHeight: 17,
  },
  retryBtn: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: BrandColors.deep,
  },
});
