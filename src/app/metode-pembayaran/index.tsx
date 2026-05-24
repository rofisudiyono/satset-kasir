import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Separator, XStack, YStack } from "tamagui";

import { AppButton } from "@/components/atoms/AppButton";
import { AppInput } from "@/components/atoms/AppInput";
import { SectionCard } from "@/components/molecules/SectionCard";
import { TextBodyLg, TextBodySm, TextCaption, TextH3, TextMicro } from "@/components/atoms/Typography";
import {
  ColorAccentOrange,
  ColorAccentPurple,
  ColorBase,
  ColorDanger,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
  ColorWarning,
} from "@/themes/Colors";
import type { IoniconName } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentMethod = {
  id: string;
  iconName: IoniconName;
  iconColor: string;
  iconBg: string;
  label: string;
  description: string;
  enabled: boolean;
  canDisable: boolean;
};

// ─── Sub-component: PaymentMethodRow ─────────────────────────────────────────

function PaymentMethodRow({
  method,
  onToggle,
  onPress,
}: {
  method: PaymentMethod;
  onToggle: (enabled: boolean) => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={method.canDisable ? onPress : undefined} activeOpacity={0.7}>
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        gap="$3"
      >
        {/* Icon */}
        <YStack
          width={44}
          height={44}
          borderRadius={12}
          backgroundColor={method.enabled ? method.iconBg : ColorNeutral.neutral100}
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons
            name={method.iconName}
            size={22}
            color={method.enabled ? method.iconColor : ColorNeutral.neutral400}
          />
        </YStack>

        {/* Label & Description */}
        <YStack flex={1} gap={2}>
          <TextBodyLg fontWeight="600" color={method.enabled ? undefined : "$colorSecondary"}>
            {method.label}
          </TextBodyLg>
          <TextBodySm color="$colorSecondary" numberOfLines={1}>
            {method.description}
          </TextBodySm>
        </YStack>

        {/* Toggle */}
        <Switch
          value={method.enabled}
          onValueChange={method.canDisable ? onToggle : undefined}
          disabled={!method.canDisable}
          trackColor={{
            true: ColorPrimary.primary600,
            false: ColorNeutral.neutral300,
          }}
        />
      </XStack>
    </TouchableOpacity>
  );
}

// ─── Sub-component: QRISDetailSection ────────────────────────────────────────

function QRISDetailSection({
  merchantId,
  onMerchantIdChange,
}: {
  merchantId: string;
  onMerchantIdChange: (v: string) => void;
}) {
  return (
    <YStack
      backgroundColor={ColorAccentPurple.purple50}
      borderTopWidth={1}
      borderTopColor={ColorAccentPurple.purple200}
      padding="$4"
      gap="$3"
    >
      <XStack alignItems="center" gap="$2">
        <Ionicons name="qr-code-outline" size={16} color={ColorAccentPurple.purple600} />
        <TextBodySm fontWeight="700" color={ColorAccentPurple.purple600}>
          Konfigurasi QRIS
        </TextBodySm>
      </XStack>
      <AppInput
        label="Merchant ID / NMID"
        placeholder="cth. ID1023456789012"
        value={merchantId}
        onChangeText={onMerchantIdChange}
        autoCapitalize="characters"
      />
      <TextCaption color={ColorAccentPurple.purple600}>
        Dapatkan Merchant ID dari penyedia QRIS Anda (GoPay, OVO, Dana, dll.)
      </TextCaption>
    </YStack>
  );
}

// ─── Sub-component: TransferDetailSection ────────────────────────────────────

function TransferDetailSection({
  bankName,
  accountNumber,
  accountName,
  onBankNameChange,
  onAccountNumberChange,
  onAccountNameChange,
}: {
  bankName: string;
  accountNumber: string;
  accountName: string;
  onBankNameChange: (v: string) => void;
  onAccountNumberChange: (v: string) => void;
  onAccountNameChange: (v: string) => void;
}) {
  return (
    <YStack
      backgroundColor={ColorWarning.warning50}
      borderTopWidth={1}
      borderTopColor={ColorWarning.warning200}
      padding="$4"
      gap="$3"
    >
      <XStack alignItems="center" gap="$2">
        <Ionicons name="swap-horizontal-outline" size={16} color={ColorWarning.warning600} />
        <TextBodySm fontWeight="700" color={ColorWarning.warning600}>
          Konfigurasi Transfer Bank
        </TextBodySm>
      </XStack>
      <AppInput
        label="Nama Bank"
        placeholder="cth. BCA, Mandiri, BNI"
        value={bankName}
        onChangeText={onBankNameChange}
      />
      <AppInput
        label="Nomor Rekening"
        placeholder="cth. 1234567890"
        value={accountNumber}
        onChangeText={onAccountNumberChange}
        keyboardType="numeric"
      />
      <AppInput
        label="Nama Pemilik Rekening"
        placeholder="cth. Budi Santoso"
        value={accountName}
        onChangeText={onAccountNameChange}
      />
    </YStack>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MetodePembayaranPage() {
  const router = useRouter();

  // ── Payment methods state ──────────────────────────────────────
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: "tunai",
      iconName: "cash-outline",
      iconColor: ColorGreen.green600,
      iconBg: ColorGreen.green100,
      label: "Tunai (Cash)",
      description: "Pembayaran langsung dengan uang tunai",
      enabled: true,
      canDisable: false,
    },
    {
      id: "qris",
      iconName: "qr-code-outline",
      iconColor: ColorAccentPurple.purple600,
      iconBg: ColorAccentPurple.purple100,
      label: "QRIS",
      description: "Pembayaran via QR Code GoPay, OVO, Dana, dll.",
      enabled: true,
      canDisable: true,
    },
    {
      id: "kartu",
      iconName: "card-outline",
      iconColor: ColorPrimary.primary600,
      iconBg: ColorPrimary.primary100,
      label: "Kartu Debit / Kredit",
      description: "EDC atau tap card via mesin kasir",
      enabled: true,
      canDisable: true,
    },
    {
      id: "transfer",
      iconName: "swap-horizontal-outline",
      iconColor: ColorWarning.warning600,
      iconBg: ColorWarning.warning100,
      label: "Transfer Bank",
      description: "Konfirmasi transfer manual oleh kasir",
      enabled: true,
      canDisable: true,
    },
    {
      id: "dompet",
      iconName: "wallet-outline",
      iconColor: ColorAccentOrange.orange600,
      iconBg: ColorAccentOrange.orange100,
      label: "Dompet Digital",
      description: "ShopeePay, LinkAja, atau dompet lain",
      enabled: false,
      canDisable: true,
    },
  ]);

  // ── QRIS config ────────────────────────────────────────────────
  const [qrisMerchantId, setQrisMerchantId] = useState("ID1023456789012");

  // ── Transfer Bank config ───────────────────────────────────────
  const [bankName, setBankName] = useState("BCA");
  const [bankAccountNumber, setBankAccountNumber] = useState("1234567890");
  const [bankAccountName, setBankAccountName] = useState("Budi Santoso");

  // ── Transaction settings ───────────────────────────────────────
  const [kembalianOtomatis, setKembalianOtomatis] = useState(true);
  const [konfirmasiSebelumBayar, setKonfirmasiSebelumBayar] = useState(false);
  const [minTransaksi, setMinTransaksi] = useState("");

  // ── Helpers ────────────────────────────────────────────────────
  const activeCount = methods.filter((m) => m.enabled).length;

  function toggleMethod(id: string, value: boolean) {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: value } : m))
    );
  }

  function handleSimpan() {
    if (activeCount === 0) {
      Alert.alert("Peringatan", "Minimal satu metode pembayaran harus aktif.");
      return;
    }
    Alert.alert(
      "Berhasil",
      `${activeCount} metode pembayaran berhasil disimpan.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  }

  const qrisEnabled = methods.find((m) => m.id === "qris")?.enabled;
  const transferEnabled = methods.find((m) => m.id === "transfer")?.enabled;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* ── Header ── */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        backgroundColor={ColorBase.white}
        borderBottomWidth={StyleSheet.hairlineWidth}
        borderBottomColor={ColorNeutral.neutral200}
        gap="$3"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={ColorNeutral.neutral700} />
        </TouchableOpacity>
        <TextH3 fontWeight="700" flex={1}>
          Metode Pembayaran
        </TextH3>
        <AppButton variant="primary" size="sm" title="Simpan" onPress={handleSimpan} />
      </XStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Summary Banner ── */}
        <YStack
          backgroundColor={ColorPrimary.primary600}
          borderRadius={16}
          padding="$4"
          gap="$3"
        >
          <XStack alignItems="center" gap="$3">
            <YStack
              width={48}
              height={48}
              borderRadius={12}
              backgroundColor={ColorPrimary.primary200}
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="card" size={24} color={ColorPrimary.primary700} />
            </YStack>
            <YStack flex={1} gap={2}>
              <TextH3 fontWeight="700" color={ColorBase.white}>
                Metode Pembayaran
              </TextH3>
              <TextBodySm color={ColorPrimary.primary200}>
                Atur cara pelanggan membayar di kasir Anda
              </TextBodySm>
            </YStack>
          </XStack>

          {/* Stats row */}
          <XStack
            backgroundColor="rgba(255,255,255,0.12)"
            borderRadius={10}
            paddingHorizontal="$3"
            paddingVertical="$2"
          >
            {[
              { label: "Total Metode", value: `${methods.length}` },
              { label: "Aktif", value: `${activeCount}` },
              { label: "Nonaktif", value: `${methods.length - activeCount}` },
            ].map((item, idx) => (
              <React.Fragment key={item.label}>
                {idx > 0 && (
                  <YStack
                    width={1}
                    backgroundColor="rgba(255,255,255,0.3)"
                    marginHorizontal="$3"
                  />
                )}
                <YStack flex={1} gap={2}>
                  <TextMicro color={ColorPrimary.primary200}>{item.label}</TextMicro>
                  <TextBodyLg fontWeight="700" color={ColorBase.white}>
                    {item.value}
                  </TextBodyLg>
                </YStack>
              </React.Fragment>
            ))}
          </XStack>
        </YStack>

        {/* ── Daftar Metode Pembayaran ── */}
        <SectionCard title="Daftar Metode Pembayaran">
          <YStack>
            <TextBodySm
              color="$colorSecondary"
              paddingHorizontal="$4"
              paddingTop="$3"
              paddingBottom="$2"
            >
              Aktifkan atau nonaktifkan metode pembayaran sesuai kebutuhan toko Anda.
              Tunai selalu aktif dan tidak dapat dinonaktifkan.
            </TextBodySm>

            {methods.map((method, idx) => (
              <React.Fragment key={method.id}>
                {idx > 0 && (
                  <Separator borderColor="$borderColor" marginHorizontal="$4" />
                )}
                <PaymentMethodRow
                  method={method}
                  onToggle={(val) => toggleMethod(method.id, val)}
                  onPress={() => {}}
                />

                {/* QRIS config panel - shown when enabled */}
                {method.id === "qris" && qrisEnabled && (
                  <QRISDetailSection
                    merchantId={qrisMerchantId}
                    onMerchantIdChange={setQrisMerchantId}
                  />
                )}

                {/* Transfer Bank config panel - shown when enabled */}
                {method.id === "transfer" && transferEnabled && (
                  <TransferDetailSection
                    bankName={bankName}
                    accountNumber={bankAccountNumber}
                    accountName={bankAccountName}
                    onBankNameChange={setBankName}
                    onAccountNumberChange={setBankAccountNumber}
                    onAccountNameChange={setBankAccountName}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Disabled note for Tunai */}
            <YStack
              backgroundColor={ColorGreen.green50}
              borderRadius={8}
              marginHorizontal="$4"
              marginBottom="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              flexDirection="row"
              alignItems="center"
              gap="$2"
            >
              <Ionicons name="information-circle" size={16} color={ColorGreen.green600} />
              <TextCaption color={ColorGreen.green600} flex={1}>
                Metode Tunai selalu aktif karena merupakan metode pembayaran dasar kasir.
              </TextCaption>
            </YStack>
          </YStack>
        </SectionCard>

        {/* ── Pengaturan Transaksi ── */}
        <SectionCard title="Pengaturan Transaksi">
          <YStack>
            {/* Kembalian Otomatis */}
            <XStack
              paddingHorizontal="$4"
              paddingVertical="$3"
              alignItems="center"
              gap="$3"
            >
              <YStack
                width={44}
                height={44}
                borderRadius={12}
                backgroundColor={ColorGreen.green100}
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="refresh-outline" size={20} color={ColorGreen.green600} />
              </YStack>
              <YStack flex={1} gap={2}>
                <TextBodyLg fontWeight="600">Kembalian Otomatis</TextBodyLg>
                <TextBodySm color="$colorSecondary" numberOfLines={1}>
                  Hitung kembalian otomatis saat bayar tunai
                </TextBodySm>
              </YStack>
              <Switch
                value={kembalianOtomatis}
                onValueChange={setKembalianOtomatis}
                trackColor={{
                  true: ColorPrimary.primary600,
                  false: ColorNeutral.neutral300,
                }}
              />
            </XStack>

            <Separator borderColor="$borderColor" marginHorizontal="$4" />

            {/* Konfirmasi sebelum bayar */}
            <XStack
              paddingHorizontal="$4"
              paddingVertical="$3"
              alignItems="center"
              gap="$3"
            >
              <YStack
                width={44}
                height={44}
                borderRadius={12}
                backgroundColor={ColorPrimary.primary100}
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={ColorPrimary.primary600} />
              </YStack>
              <YStack flex={1} gap={2}>
                <TextBodyLg fontWeight="600">Konfirmasi Sebelum Bayar</TextBodyLg>
                <TextBodySm color="$colorSecondary" numberOfLines={1}>
                  Tampilkan ringkasan order sebelum proses bayar
                </TextBodySm>
              </YStack>
              <Switch
                value={konfirmasiSebelumBayar}
                onValueChange={setKonfirmasiSebelumBayar}
                trackColor={{
                  true: ColorPrimary.primary600,
                  false: ColorNeutral.neutral300,
                }}
              />
            </XStack>

            <Separator borderColor="$borderColor" marginHorizontal="$4" />

            {/* Minimal transaksi */}
            <YStack paddingHorizontal="$4" paddingVertical="$3" gap="$2">
              <XStack alignItems="center" gap="$3">
                <YStack
                  width={44}
                  height={44}
                  borderRadius={12}
                  backgroundColor={ColorWarning.warning100}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="trending-up-outline" size={20} color={ColorWarning.warning600} />
                </YStack>
                <YStack flex={1} gap={2}>
                  <TextBodyLg fontWeight="600">Nominal Minimum Transaksi</TextBodyLg>
                  <TextBodySm color="$colorSecondary" numberOfLines={1}>
                    Batas minimum pembelian (opsional)
                  </TextBodySm>
                </YStack>
              </XStack>
              <YStack paddingLeft={56}>
                <AppInput
                  placeholder="cth. 5000"
                  value={minTransaksi}
                  onChangeText={setMinTransaksi}
                  keyboardType="numeric"
                  hint="Kosongkan jika tidak ada batas minimum"
                  leftIcon={
                    <TextBodySm color="$colorSecondary">Rp</TextBodySm>
                  }
                />
              </YStack>
            </YStack>
          </YStack>
        </SectionCard>

        {/* ── Catatan ── */}
        <YStack
          backgroundColor={ColorPrimary.primary25}
          borderRadius={12}
          padding="$3"
          gap="$2"
          borderWidth={1}
          borderColor={ColorPrimary.primary100}
        >
          <XStack alignItems="center" gap="$2">
            <Ionicons name="information-circle-outline" size={18} color={ColorPrimary.primary600} />
            <TextBodySm fontWeight="700" color={ColorPrimary.primary600}>
              Informasi
            </TextBodySm>
          </XStack>
          <TextBodySm color={ColorNeutral.neutral600}>
            Perubahan metode pembayaran akan langsung berlaku di semua transaksi baru.
            Transaksi yang sedang berjalan tidak akan terpengaruh.
          </TextBodySm>
        </YStack>

        <TextCaption color="$colorTertiary" textAlign="center" marginTop="$1">
          Metode pembayaran ditampilkan saat proses checkout
        </TextCaption>
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View style={styles.bottomBar}>
        <AppButton
          variant="primary"
          size="lg"
          fullWidth
          title="Simpan Pengaturan Pembayaran"
          onPress={handleSimpan}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
  },
  scrollContent: {
    gap: 16,
    padding: 16,
    paddingBottom: 32,
  },
  backBtn: {
    padding: 4,
  },
  bottomBar: {
    backgroundColor: ColorBase.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ColorNeutral.neutral200,
  },
});
