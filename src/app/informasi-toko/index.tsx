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

import {
  AppButton,
  AppInput,
  SectionCard,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH3,
} from "@/components";
import {
  ColorBase,
  ColorNeutral,
} from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";

// ─── Types ───────────────────────────────────────────────────────────────────

type DaySchedule = {
  isOpen: boolean;
  buka: string;
  tutup: string;
};

type JamOperasional = Record<string, DaySchedule>;

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = [
  { key: "sen", label: "Senin" },
  { key: "sel", label: "Selasa" },
  { key: "rab", label: "Rabu" },
  { key: "kam", label: "Kamis" },
  { key: "jum", label: "Jumat" },
  { key: "sab", label: "Sabtu" },
  { key: "min", label: "Minggu" },
];

// ─── Sub-component: DayRow ───────────────────────────────────────────────────

function DayRow({
  label,
  schedule,
  onToggle,
  onBukaChange,
  onTutupChange,
}: {
  label: string;
  schedule: DaySchedule;
  onToggle: () => void;
  onBukaChange: (v: string) => void;
  onTutupChange: (v: string) => void;
}) {
  return (
    <XStack alignItems="center" gap="$2" paddingVertical="$1">
      <TextBodyLg
        fontWeight="600"
        style={{ width: 58 }}
        numberOfLines={1}
      >
        {label}
      </TextBodyLg>

      <Switch
        value={schedule.isOpen}
        onValueChange={onToggle}
        trackColor={{
          true: BrandColors.green,
          false: ColorNeutral.neutral300,
        }}
      />

      {schedule.isOpen ? (
        <XStack flex={1} alignItems="center" gap="$2">
          <YStack flex={1}>
            <AppInput
              placeholder="08:00"
              value={schedule.buka}
              onChangeText={onBukaChange}
              size="sm"
              keyboardType="numbers-and-punctuation"
            />
          </YStack>
          <TextBodySm color="$colorSecondary">—</TextBodySm>
          <YStack flex={1}>
            <AppInput
              placeholder="21:00"
              value={schedule.tutup}
              onChangeText={onTutupChange}
              size="sm"
              keyboardType="numbers-and-punctuation"
            />
          </YStack>
        </XStack>
      ) : (
        <YStack flex={1} alignItems="flex-end">
          <TextBodySm color={ColorNeutral.neutral400}>Tutup</TextBodySm>
        </YStack>
      )}
    </XStack>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function InformasiTokoPage() {
  const router = useRouter();

  // Identitas Toko
  const [namaToko, setNamaToko] = useState("Toko Makmur");
  const [slogan, setSlogan] = useState("Belanja nyaman, harga bersahabat");
  const [kategoriUsaha, setKategoriUsaha] = useState("Toko Sembako / Kelontong");

  // Kontak & Lokasi
  const [telepon, setTelepon] = useState("0812-3456-7890");
  const [email, setEmail] = useState("tokomakmur@email.com");
  const [alamat, setAlamat] = useState("Jl. Merdeka No. 45");
  const [kota, setKota] = useState("Jakarta Selatan");
  const [provinsi, setProvinsi] = useState("DKI Jakarta");
  const [kodePos, setKodePos] = useState("12345");

  // Jam Operasional
  const [jamOps, setJamOps] = useState<JamOperasional>({
    sen: { isOpen: true, buka: "08:00", tutup: "21:00" },
    sel: { isOpen: true, buka: "08:00", tutup: "21:00" },
    rab: { isOpen: true, buka: "08:00", tutup: "21:00" },
    kam: { isOpen: true, buka: "08:00", tutup: "21:00" },
    jum: { isOpen: true, buka: "08:00", tutup: "21:00" },
    sab: { isOpen: true, buka: "09:00", tutup: "20:00" },
    min: { isOpen: false, buka: "09:00", tutup: "17:00" },
  });

  // Informasi Legal
  const [npwp, setNpwp] = useState("");
  const [noSiup, setNoSiup] = useState("");

  // Media Sosial
  const [instagram, setInstagram] = useState("@tokomakmur");
  const [whatsapp, setWhatsapp] = useState("0812-3456-7890");
  const [facebook, setFacebook] = useState("");
  const [website, setWebsite] = useState("");

  function toggleDay(key: string) {
    setJamOps((prev) => ({
      ...prev,
      [key]: { ...prev[key], isOpen: !prev[key].isOpen },
    }));
  }

  function updateJam(key: string, field: "buka" | "tutup", value: string) {
    setJamOps((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  function handleSimpan() {
    if (!namaToko.trim()) {
      Alert.alert("Validasi", "Nama toko tidak boleh kosong.");
      return;
    }
    Alert.alert("Berhasil", `Informasi toko "${namaToko}" berhasil disimpan.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

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
          Informasi Toko
        </TextH3>
        <AppButton variant="primary" size="sm" title="Simpan" onPress={handleSimpan} />
      </XStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Logo Toko ── */}
        <YStack alignItems="center" paddingVertical="$4" gap="$2">
          <YStack style={styles.logoWrapper}>
            <YStack style={styles.logoPlaceholder}>
              <Ionicons name="storefront" size={44} color={BrandColors.mid} />
            </YStack>
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.85}>
              <Ionicons name="camera" size={15} color={ColorBase.white} />
            </TouchableOpacity>
          </YStack>
          <TextBodySm color="$colorSecondary">Ketuk untuk mengganti logo toko</TextBodySm>
        </YStack>

        {/* ── Identitas Toko ── */}
        <SectionCard title="Identitas Toko">
          <YStack gap="$3" padding="$4">
            <AppInput
              label="Nama Toko *"
              placeholder="cth. Toko Makmur Jaya"
              value={namaToko}
              onChangeText={setNamaToko}
            />
            <AppInput
              label="Slogan / Tagline"
              placeholder="cth. Belanja nyaman, harga bersahabat"
              value={slogan}
              onChangeText={setSlogan}
            />
            <AppInput
              label="Kategori Usaha"
              placeholder="cth. Toko Sembako, Kafe, Minimarket"
              value={kategoriUsaha}
              onChangeText={setKategoriUsaha}
            />
          </YStack>
        </SectionCard>

        {/* ── Kontak & Lokasi ── */}
        <SectionCard title="Kontak & Lokasi">
          <YStack gap="$3" padding="$4">
            <AppInput
              label="Nomor Telepon"
              placeholder="cth. 0812-3456-7890"
              value={telepon}
              onChangeText={setTelepon}
              keyboardType="phone-pad"
            />
            <AppInput
              label="Email"
              placeholder="cth. toko@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AppInput
              label="Alamat Lengkap"
              placeholder="cth. Jl. Merdeka No. 45, RT 02/RW 03"
              value={alamat}
              onChangeText={setAlamat}
            />
            <XStack gap="$3">
              <YStack flex={2}>
                <AppInput
                  label="Kota / Kabupaten"
                  placeholder="cth. Jakarta Selatan"
                  value={kota}
                  onChangeText={setKota}
                />
              </YStack>
              <YStack flex={1}>
                <AppInput
                  label="Kode Pos"
                  placeholder="12345"
                  value={kodePos}
                  onChangeText={setKodePos}
                  keyboardType="numeric"
                />
              </YStack>
            </XStack>
            <AppInput
              label="Provinsi"
              placeholder="cth. DKI Jakarta"
              value={provinsi}
              onChangeText={setProvinsi}
            />
          </YStack>
        </SectionCard>

        {/* ── Jam Operasional ── */}
        <SectionCard title="Jam Operasional">
          <YStack padding="$4" gap="$2">
            <TextBodySm color="$colorSecondary" marginBottom="$1">
              Aktifkan hari buka dan atur jam operasional toko Anda
            </TextBodySm>
            {DAYS.map((day, idx) => (
              <React.Fragment key={day.key}>
                {idx > 0 && (
                  <Separator
                    borderColor="$borderColor"
                    marginVertical="$1"
                  />
                )}
                <DayRow
                  label={day.label}
                  schedule={jamOps[day.key]}
                  onToggle={() => toggleDay(day.key)}
                  onBukaChange={(v) => updateJam(day.key, "buka", v)}
                  onTutupChange={(v) => updateJam(day.key, "tutup", v)}
                />
              </React.Fragment>
            ))}
          </YStack>
        </SectionCard>

        {/* ── Informasi Legal ── */}
        <SectionCard title="Informasi Legal">
          <YStack gap="$3" padding="$4">
            <AppInput
              label="NPWP"
              placeholder="cth. 12.345.678.9-123.456"
              value={npwp}
              onChangeText={setNpwp}
              hint="Opsional — digunakan untuk keperluan laporan pajak"
              keyboardType="numbers-and-punctuation"
            />
            <AppInput
              label="Nomor SIUP / NIB"
              placeholder="cth. 123/SIUP/2023"
              value={noSiup}
              onChangeText={setNoSiup}
              hint="Opsional"
            />
          </YStack>
        </SectionCard>

        {/* ── Media Sosial ── */}
        <SectionCard title="Media Sosial">
          <YStack gap="$3" padding="$4">
            <AppInput
              label="Instagram"
              placeholder="@namatoko"
              value={instagram}
              onChangeText={setInstagram}
              autoCapitalize="none"
              leftIcon={
                <Ionicons
                  name="logo-instagram"
                  size={18}
                  color={ColorNeutral.neutral400}
                />
              }
            />
            <AppInput
              label="WhatsApp"
              placeholder="cth. 0812-3456-7890"
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
              leftIcon={
                <Ionicons
                  name="logo-whatsapp"
                  size={18}
                  color={ColorNeutral.neutral400}
                />
              }
            />
            <AppInput
              label="Facebook"
              placeholder="cth. facebook.com/namatoko"
              value={facebook}
              onChangeText={setFacebook}
              autoCapitalize="none"
              leftIcon={
                <Ionicons
                  name="logo-facebook"
                  size={18}
                  color={ColorNeutral.neutral400}
                />
              }
            />
            <AppInput
              label="Website"
              placeholder="cth. www.namatoko.com"
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
              keyboardType="url"
              leftIcon={
                <Ionicons
                  name="globe-outline"
                  size={18}
                  color={ColorNeutral.neutral400}
                />
              }
            />
          </YStack>
        </SectionCard>

        {/* ── Footer info ── */}
        <TextCaption color="$colorTertiary" textAlign="center" marginTop="$2">
          Informasi toko ditampilkan di struk dan laporan penjualan
        </TextCaption>
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View style={styles.bottomBar}>
        <AppButton
          variant="primary"
          size="lg"
          fullWidth
          title="Simpan Informasi Toko"
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
    backgroundColor: BrandColors.canvas,
  },
  scrollContent: {
    gap: 16,
    padding: 16,
    paddingBottom: 32,
  },
  backBtn: {
    padding: 4,
  },
  logoWrapper: {
    position: "relative",
    width: 100,
    height: 100,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: BrandColors.tint,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BrandColors.borderStrong,
    borderStyle: "dashed",
  },
  cameraBtn: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BrandColors.deep,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
