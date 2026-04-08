import { Ionicons } from "@expo/vector-icons";
import { useAtom } from "jotai";
import React, { useCallback, useState } from "react";
import { FlatList, ListRenderItem, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  FilterChip,
  IconButton,
  PageHeader,
  SearchBar,
  SplitLayout,
  TextBodySm,
} from "@/components";
import { StatsRow } from "@/features/shift/components/StatsRow";
import { transactionListMock } from "@/features/transactions/api/transactions.data";
import { MemoTransactionCard } from "@/features/transactions/components/TransactionCard";
import { TransactionDetailPanel } from "@/features/transactions/components/TransactionDetailPanel";
import { VoidRefundModal } from "@/features/transactions/components/VoidRefundModal";
import { transactionsAtom } from "@/features/transactions/store/transaction.store";
import { useDeviceLayout } from "@/hooks/useDeviceLayout";
import { ColorBase, ColorDanger, ColorNeutral, ColorPrimary } from "@/themes/Colors";
import type { FilterTab, Transaction } from "@/types";

const FILTERS: FilterTab[] = ["Semua", "Lunas", "Void", "Refund"];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransaksiPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [storedTxs, setStoredTxs] = useAtom(transactionsAtom);
  const { useTwoPaneLayout } = useDeviceLayout();

  const allTransactions: Transaction[] = [...storedTxs, ...transactionListMock];

  const filtered = allTransactions
    .filter((t) => activeFilter === "Semua" || t.status === activeFilter)
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        (t.table ?? "").toLowerCase().includes(q) ||
        (t.items ?? "").toLowerCase().includes(q)
      );
    });

  const totalPendapatan = allTransactions
    .filter((t) => t.status === "Lunas")
    .reduce((sum, t) => sum + Number(t.amount.replace(/[^0-9]/g, "")), 0);
  const totalVoid = allTransactions.filter((t) => t.status === "Void").length;

  const handleTxPress = useCallback((tx: Transaction) => {
    setSelectedTx(tx);
    if (!useTwoPaneLayout) setModalVisible(true);
  }, [useTwoPaneLayout]);

  function handleVoid(id: string) {
    setStoredTxs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Void" as const } : t)),
    );
    if (selectedTx?.id === id) {
      setSelectedTx((prev) =>
        prev ? { ...prev, status: "Void" as const } : null,
      );
    }
  }

  function handleRefund(id: string) {
    setStoredTxs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Refund" as const } : t)),
    );
    if (selectedTx?.id === id) {
      setSelectedTx((prev) =>
        prev ? { ...prev, status: "Refund" as const } : null,
      );
    }
  }

  const renderItem = useCallback<ListRenderItem<Transaction>>(
    ({ item }) => (
      <MemoTransactionCard
        tx={item}
        onPress={handleTxPress}
        isSelected={useTwoPaneLayout && selectedTx?.id === item.id}
      />
    ),
    [handleTxPress, useTwoPaneLayout, selectedTx?.id],
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const listHeader = (
    <YStack gap="$3">
      <SearchBar
        placeholder="Cari nomor order atau pelanggan..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <XStack alignItems="center" gap="$2">
        <XStack flex={1} gap="$2">
          {FILTERS.map((f) => (
            <FilterChip
              key={f}
              label={f}
              active={activeFilter === f}
              onPress={() => setActiveFilter(f)}
            />
          ))}
        </XStack>
        <TouchableOpacity>
          <XStack
            backgroundColor="$background"
            borderRadius={20}
            paddingHorizontal={12}
            paddingVertical={8}
            borderWidth={1}
            borderColor="$borderColor"
            alignItems="center"
            gap={4}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={ColorPrimary.primary600}
            />
            <TextBodySm fontWeight="600" color="$primary">
              Hari Ini
            </TextBodySm>
            <Ionicons
              name="chevron-down"
              size={12}
              color={ColorNeutral.neutral400}
            />
          </XStack>
        </TouchableOpacity>
      </XStack>

      <XStack
        backgroundColor={ColorPrimary.primary600}
        borderRadius={16}
        paddingVertical="$4"
        paddingHorizontal="$4"
        alignItems="center"
      >
        <StatsRow
          variant="dark"
          items={[
            { label: "Total Transaksi", value: String(allTransactions.length) },
            {
              label: "Pendapatan",
              value: `Rp ${totalPendapatan.toLocaleString("id-ID")}`,
              flex: 2,
              smallValue: true,
            },
            {
              label: "Void",
              value: String(totalVoid),
              valueColor: ColorDanger.danger400,
            },
          ]}
        />
      </XStack>

      <TextBodySm color="$colorSecondary" textAlign="center">
        Hari Ini —{" "}
        {new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </TextBodySm>
    </YStack>
  );

  const transactionList = (
    <FlatList
      data={filtered}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 12,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
    />
  );

  // ── Tablet: split layout ───────────────────────────────────────────────────
  if (useTwoPaneLayout) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: ColorBase.bgScreen }}
      >
        <PageHeader
          title="Riwayat Transaksi"
          actions={<IconButton iconName="options-outline" />}
        />
        <SplitLayout
          leftFlex={0.55}
          rightFlex={0.45}
          left={
            <View style={{ flex: 1, backgroundColor: ColorBase.bgScreen }}>
              {transactionList}
            </View>
          }
          right={
            <View style={{ flex: 1, backgroundColor: ColorBase.white }}>
              <TransactionDetailPanel
                tx={selectedTx}
                onVoid={handleVoid}
                onRefund={handleRefund}
              />
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // ── Phone: modal layout ────────────────────────────────────────────────────
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: ColorBase.bgScreen }}
    >
      <PageHeader
        title="Riwayat Transaksi"
        actions={<IconButton iconName="options-outline" />}
      />

      {transactionList}

      <VoidRefundModal
        tx={selectedTx}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onVoid={handleVoid}
        onRefund={handleRefund}
      />
    </SafeAreaView>
  );
}
