import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { paymentMethodOptions } from "@/features/payment/api/payment.data";
import { PaymentMethodCard } from "@/features/payment/components/PaymentMethodCard";
import {
  AppButton,
  PageHeader,
  QRCodePlaceholder,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH2,
} from "@/components";
import {
  ColorBase,
  ColorDanger,
  ColorNeutral,
  ColorPrimary,
} from "@/themes/Colors";
import type { PaymentMethod } from "@/types";
import { formatPrice, formatTimer } from "@/utils";
import { useDeviceLayout } from "@/hooks/useDeviceLayout";

const QR_DURATION = 5 * 60;

export default function PilihPembayaranPage() {
  const router = useRouter();
  const { useTwoPaneLayout } = useDeviceLayout();
  const params = useLocalSearchParams<{
    total: string;
    totalItems: string;
    discount: string;
    items: string;
    customerLabel: string;
  }>();

  const total = Number(params.total ?? 0);
  const totalItems = Number(params.totalItems ?? 0);
  const discount = Number(params.discount ?? 0);
  const items = params.items ?? "";
  const customerLabel = params.customerLabel ?? "";

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("qris");
  const [qrTimer, setQrTimer] = useState(QR_DURATION);
  const [qrKey, setQrKey] = useState(0);

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedMethod !== "qris") return;
    setQrTimer(QR_DURATION);
    const interval = setInterval(() => {
      setQrTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedMethod, qrKey]);

  function handleRefreshQR() {
    Animated.sequence([
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      spinAnim.setValue(0);
      setQrKey((k) => k + 1);
    });
  }

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  function handleProcess() {
    const baseParams = {
      total: String(total),
      totalItems: String(totalItems),
      discount: String(discount),
      items,
      customerLabel,
    };

    if (selectedMethod === "tunai") {
      router.push({ pathname: "/pembayaran-tunai", params: baseParams });
      return;
    }

    const methodLabel =
      selectedMethod === "qris"
        ? "QRIS"
        : selectedMethod === "transfer"
          ? "Transfer Bank"
          : "EDC / Kartu";

    Alert.alert(
      "Konfirmasi Pembayaran",
      `Pastikan pembayaran ${methodLabel} sebesar ${formatPrice(total)} sudah diterima.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Sudah Diterima",
          onPress: () => {
            router.push({
              pathname: "/pembayaran-sukses",
              params: {
                ...baseParams,
                method: methodLabel,
                methodId: selectedMethod,
                received: String(total),
                change: "0",
              },
            });
          },
        },
      ],
    );
  }

  // ── Shared: total tagihan card ─────────────────────────────────────────────
  const totalCard = (
    <View style={styles.totalCard}>
      <TextCaption color="rgba(255,255,255,0.8)" marginBottom={6}>
        Total Tagihan
      </TextCaption>
      <TextH2 fontWeight="700" color={ColorBase.white} marginBottom={6}>
        {formatPrice(total)}
      </TextH2>
      <XStack gap={6} alignItems="center">
        <TextBodySm color="rgba(255,255,255,0.85)">
          {totalItems} item
        </TextBodySm>
        {discount > 0 && (
          <>
            <View style={styles.dotSeparator} />
            <TextBodySm color="rgba(255,255,255,0.85)">
              Diskon {formatPrice(discount)}
            </TextBodySm>
          </>
        )}
      </XStack>
    </View>
  );

  // ── Shared: detail panel per method ───────────────────────────────────────
  const qrisPanel = (
    <View style={styles.qrisPanel}>
      <View style={styles.qrWrapper}>
        <QRCodePlaceholder key={qrKey} />
      </View>
      <TextBodyLg fontWeight="700" marginTop={16} marginBottom={4}>
        Scan QR untuk membayar
      </TextBodyLg>
      <XStack alignItems="center" gap={8}>
        <TextBodySm color="$colorSecondary">
          QR berlaku{" "}
          <TextBodySm
            fontWeight="700"
            color={qrTimer < 60 ? ColorDanger.danger600 : "$colorSecondary"}
          >
            {formatTimer(qrTimer)}
          </TextBodySm>{" "}
          menit
        </TextBodySm>
        <TouchableOpacity activeOpacity={0.7} onPress={handleRefreshQR}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="refresh-outline" size={18} color={ColorNeutral.neutral500} />
          </Animated.View>
        </TouchableOpacity>
      </XStack>
      <TextBodySm color="$colorSecondary" marginTop={8} textAlign="center">
        Setelah pelanggan scan, tekan{" "}
        <TextBodySm fontWeight="700">&quot;Proses Pembayaran&quot;</TextBodySm>{" "}
        untuk konfirmasi.
      </TextBodySm>
    </View>
  );

  const transferPanel = (
    <View style={styles.infoPanel}>
      <XStack alignItems="center" gap={10} marginBottom={8}>
        <Ionicons name="business-outline" size={20} color="#3B82F6" />
        <TextBodyLg fontWeight="700">Rekening Toko</TextBodyLg>
      </XStack>
      <YStack gap={6}>
        {[
          { bank: "BCA", no: "1234567890", name: "Toko Makmur" },
          { bank: "Mandiri", no: "0987654321", name: "Toko Makmur" },
        ].map((r) => (
          <XStack
            key={r.bank}
            justifyContent="space-between"
            alignItems="center"
            backgroundColor="$backgroundSecondary"
            borderRadius={10}
            padding={10}
          >
            <YStack>
              <TextBodySm fontWeight="700">{r.bank}</TextBodySm>
              <TextBodySm color="$colorSecondary">{r.no}</TextBodySm>
              <TextCaption color="$colorSecondary">a.n. {r.name}</TextCaption>
            </YStack>
            <Ionicons name="copy-outline" size={16} color={ColorNeutral.neutral400} />
          </XStack>
        ))}
      </YStack>
      <TextBodySm color="$colorSecondary" marginTop={10} textAlign="center">
        Minta pelanggan transfer lalu tekan{" "}
        <TextBodySm fontWeight="700">Proses Pembayaran</TextBodySm>.
      </TextBodySm>
    </View>
  );

  const edcPanel = (
    <View style={styles.infoPanel}>
      <XStack alignItems="center" gap={10} marginBottom={8}>
        <Ionicons name="card-outline" size={20} color="#8B5CF6" />
        <TextBodyLg fontWeight="700">Mesin EDC</TextBodyLg>
      </XStack>
      <YStack gap={8}>
        {[
          { step: "1", text: "Masukkan jumlah tagihan di mesin EDC" },
          { step: "2", text: "Minta pelanggan tap / gesek kartu" },
          { step: "3", text: "Tunggu konfirmasi dari mesin EDC" },
          { step: "4", text: "Tekan Proses Pembayaran setelah berhasil" },
        ].map((s) => (
          <XStack key={s.step} alignItems="flex-start" gap={10}>
            <View style={styles.stepBadge}>
              <TextBodySm fontWeight="700" color="#8B5CF6">
                {s.step}
              </TextBodySm>
            </View>
            <TextBodySm flex={1} color="$colorSecondary">
              {s.text}
            </TextBodySm>
          </XStack>
        ))}
      </YStack>
    </View>
  );

  // ── Process button ────────────────────────────────────────────────────────
  const processButton = (
    <AppButton
      variant="primary"
      size="lg"
      fullWidth
      title="Proses Pembayaran"
      onPress={handleProcess}
    />
  );

  // ── Tablet: 2-column layout ────────────────────────────────────────────────
  if (useTwoPaneLayout) {
    const activeDetailPanel =
      selectedMethod === "qris"
        ? qrisPanel
        : selectedMethod === "transfer"
          ? transferPanel
          : selectedMethod === "edc"
            ? edcPanel
            : null;

    return (
      <SafeAreaView style={styles.container}>
        <PageHeader title="Pilih Pembayaran" showBack onBack={() => router.back()} />

        <XStack flex={1}>
          {/* Left: payment methods */}
          <ScrollView
            style={styles.tabletLeft}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
          >
            {totalCard}

            <TextCaption
              color="$colorSecondary"
              fontWeight="700"
              letterSpacing={0.8}
              paddingHorizontal={4}
              marginTop={4}
            >
              METODE PEMBAYARAN
            </TextCaption>

            {paymentMethodOptions.map((method) => (
              <PaymentMethodCard
                key={method.id}
                {...method}
                selected={selectedMethod === method.id}
                onPress={() => setSelectedMethod(method.id)}
              />
            ))}
          </ScrollView>

          {/* Divider */}
          <View style={styles.tabletDivider} />

          {/* Right: detail + process button */}
          <View style={styles.tabletRight}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
            >
              {activeDetailPanel}
            </ScrollView>
            <View style={styles.tabletBottomBar}>
              {processButton}
              <TextCaption color="$colorSecondary" textAlign="center" marginTop={8}>
                Pastikan pembayaran telah diterima
              </TextCaption>
            </View>
          </View>
        </XStack>
      </SafeAreaView>
    );
  }

  // ── Phone layout ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Pilih Pembayaran" showBack onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <YStack paddingHorizontal={16} gap={12} paddingTop={4}>
          {totalCard}

          <TextCaption
            color="$colorSecondary"
            fontWeight="700"
            letterSpacing={0.8}
            paddingHorizontal={4}
            marginTop={4}
          >
            METODE PEMBAYARAN
          </TextCaption>

          {paymentMethodOptions.map((method) => (
            <React.Fragment key={method.id}>
              <PaymentMethodCard
                {...method}
                selected={selectedMethod === method.id}
                onPress={() => setSelectedMethod(method.id)}
              />

              {method.id === "qris" && selectedMethod === "qris" && qrisPanel}
              {method.id === "transfer" && selectedMethod === "transfer" && transferPanel}
              {method.id === "edc" && selectedMethod === "edc" && edcPanel}
            </React.Fragment>
          ))}
        </YStack>
      </ScrollView>

      <View style={styles.bottomBar}>
        {processButton}
        <TextCaption color="$colorSecondary" textAlign="center" marginTop={8}>
          Pastikan pembayaran telah diterima
        </TextCaption>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  totalCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: ColorPrimary.primary700,
    shadowColor: ColorPrimary.primary700,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  qrisPanel: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: ColorBase.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginTop: -4,
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: ColorBase.white,
    borderRadius: 12,
    shadowColor: ColorBase.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoPanel: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: ColorBase.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginTop: -4,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ColorBase.white,
    borderTopWidth: 1,
    borderTopColor: ColorNeutral.neutral100,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  tabletLeft: {
    flex: 0.45,
    backgroundColor: ColorBase.bgScreen,
  },
  tabletDivider: {
    width: 1,
    backgroundColor: ColorNeutral.neutral200,
  },
  tabletRight: {
    flex: 0.55,
    backgroundColor: ColorBase.white,
  },
  tabletBottomBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: ColorNeutral.neutral100,
    backgroundColor: ColorBase.white,
  },
});
