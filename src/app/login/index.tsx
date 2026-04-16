import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import {
  AppButton,
  AppInput,
  TextBodyLg,
  TextBodySm,
  TextCaption,
  TextH1,
  TextH2,
  TextH3,
} from "@/components";
import { PrinterTestModal } from "@/components/molecules/PrinterTestModal";
import { useLoginMutation } from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import {
  ColorBase,
  ColorGreen,
  ColorNeutral,
  ColorPrimary,
  ColorTeal,
  ColorWarning,
} from "@/themes/Colors";

const KASIR_ROLES = new Set(["kasir", "admin_coffee"]);

export default function LoginPage() {
  const { loginWithSession } = useAuth();
  const { mutateAsync: loginApi, isPending: isLoginPending } =
    useLoginMutation();
  const router = useRouter();
  const { isTablet, isLargeTablet, horizontalPadding } = useResponsiveLayout();
  const [email, setEmail] = useState("bilqis@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrinterTest, setShowPrinterTest] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await loginApi({ email: email.trim(), password });
      if (!KASIR_ROLES.has(res.user.role)) {
        Alert.alert(
          "Akses ditolak",
          "Gunakan akun kasir atau admin outlet untuk aplikasi ini.",
        );
        return;
      }
      loginWithSession({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
        email: email.trim(),
      });
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert(
        "Gagal masuk",
        getApiErrorMessage(e, "Email atau password salah."),
      );
    }
  };

  // ── TABLET: Two-panel layout ───────────────────────────────────────────────
  if (isTablet) {
    return (
      <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.tabletScreen} edges={["top", "bottom"]}>
        {/* ── Left: Brand panel ── */}
        <View style={styles.brandPanel}>
          {/* Decorative circles for depth */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorCircle3} />

          <YStack
            flex={1}
            justifyContent="center"
            padding={isLargeTablet ? 48 : 36}
            gap="$6"
          >
            {/* App icon */}
            <YStack
              width={68}
              height={68}
              borderRadius={18}
              backgroundColor="rgba(255,255,255,0.12)"
              alignItems="center"
              justifyContent="center"
              borderWidth={1.5}
              borderColor="rgba(255,255,255,0.25)"
            >
              <Ionicons
                name="storefront-outline"
                size={34}
                color={ColorBase.white}
              />
            </YStack>

            {/* Branding text */}
            <YStack gap="$2">
              <TextH1 color={ColorBase.white} fontWeight="700" lineHeight={32}>
                Kasir Toko{"\n"}Makmur
              </TextH1>
              <TextBodyLg color="rgba(255,255,255,0.65)" lineHeight={22}>
                Sistem kasir pintar untuk operasional toko yang efisien dan
                akurat.
              </TextBodyLg>
            </YStack>

            {/* Info cards */}
            <YStack gap="$3" marginTop="$2">
              <XStack
                backgroundColor="rgba(255,255,255,0.08)"
                borderRadius="$4"
                padding="$3"
                gap="$3"
                alignItems="center"
                borderWidth={1}
                borderColor="rgba(255,255,255,0.12)"
              >
                <YStack
                  width={38}
                  height={38}
                  borderRadius={19}
                  backgroundColor="rgba(255,255,255,0.12)"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons
                    name="sunny-outline"
                    size={18}
                    color={ColorWarning.warning400}
                  />
                </YStack>
                <YStack flex={1} gap={2}>
                  <TextBodySm fontWeight="700" color={ColorBase.white}>
                    Buka shift
                  </TextBodySm>
                  <TextCaption color="rgba(255,255,255,0.6)" lineHeight={16}>
                    Masuk untuk mulai shift dan catat modal awal kas.
                  </TextCaption>
                </YStack>
              </XStack>

              <XStack
                backgroundColor="rgba(255,255,255,0.08)"
                borderRadius="$4"
                padding="$3"
                gap="$3"
                alignItems="center"
                borderWidth={1}
                borderColor="rgba(255,255,255,0.12)"
              >
                <YStack
                  width={38}
                  height={38}
                  borderRadius={19}
                  backgroundColor="rgba(255,255,255,0.12)"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={18}
                    color="rgba(255,255,255,0.85)"
                  />
                </YStack>
                <YStack flex={1} gap={2}>
                  <TextBodySm fontWeight="700" color={ColorBase.white}>
                    Butuh bantuan?
                  </TextBodySm>
                  <TextCaption color="rgba(255,255,255,0.6)" lineHeight={16}>
                    Hubungi supervisor jika akun tidak bisa diakses.
                  </TextCaption>
                </YStack>
              </XStack>
            </YStack>
          </YStack>

          {/* Footer version */}
          <YStack padding={isLargeTablet ? 48 : 36} paddingTop={0}>
            <TextCaption color="rgba(255,255,255,0.3)">
              © 2025 Kasirin Aja
            </TextCaption>
          </YStack>
        </View>

        {/* ── Right: Form panel ── */}
        <KeyboardAvoidingView
          style={styles.formPanelWrapper}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.formPanelScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <YStack
              flex={1}
              justifyContent="center"
              padding={isLargeTablet ? 56 : 40}
              maxWidth={500}
              alignSelf="center"
              width="100%"
              gap="$5"
            >
              {/* Mode Kasir badge */}
              <XStack
                backgroundColor={ColorGreen.green50}
                borderRadius="$4"
                padding="$3"
                alignItems="center"
                gap="$3"
                borderWidth={1}
                borderColor={ColorGreen.green100}
              >
                <YStack
                  width={38}
                  height={38}
                  borderRadius={19}
                  backgroundColor={ColorGreen.green100}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={ColorGreen.green600}
                  />
                </YStack>
                <YStack flex={1}>
                  <TextBodyLg fontWeight="600">Mode Kasir</TextBodyLg>
                  <TextBodySm color="$colorSecondary">
                    Akun staf operasional toko
                  </TextBodySm>
                </YStack>
                <AppButton variant="ghost" size="sm">
                  Ganti
                </AppButton>
              </XStack>

              {/* Title */}
              <YStack gap="$1.5">
                <TextH2 fontWeight="700">Masuk ke akun kasir</TextH2>
                <TextBodySm color="$colorSecondary" lineHeight={20}>
                  Gunakan akun yang sudah terdaftar untuk membuka shift dan
                  memproses transaksi pelanggan.
                </TextBodySm>
              </YStack>

              {/* Inputs */}
              <YStack gap="$3">
                <AppInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email kasir aktif"
                  hint="Email kasir aktif"
                  leftIcon={
                    <Ionicons
                      name="mail-outline"
                      size={16}
                      color={ColorNeutral.neutral400}
                    />
                  }
                  keyboardType="email-address"
                />
                <AppInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimal 8 karakter"
                  hint="Minimal 8 karakter"
                  leftIcon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={16}
                      color={ColorNeutral.neutral400}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={ColorNeutral.neutral400}
                      />
                    </TouchableOpacity>
                  }
                  secureTextEntry={!showPassword}
                />
              </YStack>

              {/* Remember + Forgot */}
              <XStack alignItems="center" justifyContent="space-between">
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <YStack
                    width={20}
                    height={20}
                    borderRadius={4}
                    backgroundColor={
                      rememberMe ? "$primary" : ColorBase.transparent
                    }
                    borderWidth={2}
                    borderColor={rememberMe ? "$primary" : "$borderColor"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {rememberMe && (
                      <TextBodySm color={ColorBase.white}>✓</TextBodySm>
                    )}
                  </YStack>
                  <TextBodySm color="$colorSecondary">
                    Ingat sesi perangkat ini
                  </TextBodySm>
                </TouchableOpacity>
                <TouchableOpacity>
                  <TextBodySm fontWeight="600" color="$primary">
                    Lupa password?
                  </TextBodySm>
                </TouchableOpacity>
              </XStack>

              {/* CTA */}
              <AppButton
                onPress={() => void handleLogin()}
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoginPending}
                title={isLoginPending ? "Memproses…" : "Masuk Sekarang"}
                icon={
                  <Ionicons
                    name="log-in-outline"
                    size={18}
                    color={ColorBase.white}
                  />
                }
              />

              {/* Printer Test Button */}
              <TouchableOpacity
                style={styles.printerTestButton}
                activeOpacity={0.7}
                onPress={() => setShowPrinterTest(true)}
              >
                <Ionicons
                  name="print-outline"
                  size={16}
                  color={ColorNeutral.neutral500}
                />
                <TextBodySm
                  color="$colorSecondary"
                  style={{ marginLeft: 6 }}
                >
                  Test Printer
                </TextBodySm>
              </TouchableOpacity>
            </YStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <PrinterTestModal
        visible={showPrinterTest}
        onClose={() => setShowPrinterTest(false)}
      />
      </View>
    );
  }

  // ── MOBILE: Improved stack layout ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <YStack
            alignItems="center"
            paddingTop="$5"
            paddingBottom="$3"
            gap="$1"
            paddingHorizontal={horizontalPadding}
          >
            <YStack
              width={56}
              height={56}
              borderRadius="$4"
              backgroundColor={ColorTeal.teal700}
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons
                name="storefront-outline"
                size={28}
                color={ColorBase.white}
              />
            </YStack>
            <TextH3 fontWeight="700" marginTop="$2">
              Kasir Toko Makmur
            </TextH3>
            <TextBodySm color="$colorSecondary">
              Masuk untuk mulai transaksi hari ini
            </TextBodySm>
          </YStack>

          <YStack
            width="100%"
            alignSelf="center"
            paddingHorizontal={horizontalPadding}
          >
            <YStack
              backgroundColor="$background"
              borderRadius="$6"
              padding="$4"
              gap="$4"
              shadowColor={ColorNeutral.neutralShadow}
              shadowOpacity={0.18}
              shadowRadius={14}
              shadowOffset={{ width: 0, height: 4 }}
              elevation={3}
              borderWidth={1}
              borderColor={ColorNeutral.neutral100}
            >
              {/* Mode Kasir row */}
              <XStack
                backgroundColor={ColorNeutral.neutral50}
                borderRadius="$4"
                padding="$3"
                alignItems="center"
                gap="$3"
              >
                <YStack
                  width={36}
                  height={36}
                  borderRadius={18}
                  backgroundColor={ColorGreen.green100}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={ColorGreen.green600}
                  />
                </YStack>
                <YStack flex={1}>
                  <TextBodyLg fontWeight="600">Mode Kasir</TextBodyLg>
                  <TextBodySm color="$colorSecondary">
                    Akun staf operasional toko
                  </TextBodySm>
                </YStack>
                <AppButton variant="ghost" size="sm">
                  Ganti
                </AppButton>
              </XStack>

              <YStack gap="$1">
                <TextH3 fontWeight="700">Masuk ke akun kasir</TextH3>
                <TextBodySm color="$colorSecondary" lineHeight={18}>
                  Gunakan akun yang sudah terdaftar untuk membuka shift dan
                  memproses transaksi pelanggan.
                </TextBodySm>
              </YStack>

              <YStack gap="$3">
                <AppInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email kasir aktif"
                  hint="Email kasir aktif"
                  leftIcon={
                    <Ionicons
                      name="mail-outline"
                      size={16}
                      color={ColorNeutral.neutral400}
                    />
                  }
                  keyboardType="email-address"
                />
                <AppInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimal 8 karakter"
                  hint="Minimal 8 karakter"
                  leftIcon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={16}
                      color={ColorNeutral.neutral400}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={ColorNeutral.neutral400}
                      />
                    </TouchableOpacity>
                  }
                  secureTextEntry={!showPassword}
                />
              </YStack>

              <XStack alignItems="center" justifyContent="space-between">
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <YStack
                    width={20}
                    height={20}
                    borderRadius={4}
                    backgroundColor={
                      rememberMe ? "$primary" : ColorBase.transparent
                    }
                    borderWidth={2}
                    borderColor={rememberMe ? "$primary" : "$borderColor"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {rememberMe && (
                      <TextBodySm color={ColorBase.white}>✓</TextBodySm>
                    )}
                  </YStack>
                  <TextBodySm color="$colorSecondary">
                    Ingat sesi perangkat ini
                  </TextBodySm>
                </TouchableOpacity>
                <TouchableOpacity>
                  <TextBodySm fontWeight="600" color="$primary">
                    Lupa password?
                  </TextBodySm>
                </TouchableOpacity>
              </XStack>

              <AppButton
                onPress={() => void handleLogin()}
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoginPending}
                title={isLoginPending ? "Memproses…" : "Masuk Sekarang"}
                icon={
                  <Ionicons
                    name="log-in-outline"
                    size={18}
                    color={ColorBase.white}
                  />
                }
              />

              {/* Printer Test Button */}
              <TouchableOpacity
                style={styles.printerTestButton}
                activeOpacity={0.7}
                onPress={() => setShowPrinterTest(true)}
              >
                <Ionicons
                  name="print-outline"
                  size={16}
                  color={ColorNeutral.neutral500}
                />
                <TextBodySm
                  color="$colorSecondary"
                  style={{ marginLeft: 6 }}
                >
                  Test Printer
                </TextBodySm>
              </TouchableOpacity>
            </YStack>

            <XStack gap="$3" marginTop="$3">
              <YStack
                flex={1}
                backgroundColor="$backgroundSecondary"
                borderRadius="$4"
                padding="$3"
                gap={4}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={ColorNeutral.neutral500}
                />
                <TextBodySm fontWeight="600" textAlign="center">
                  Butuh bantuan?
                </TextBodySm>
                <TextCaption
                  color="$colorSecondary"
                  textAlign="center"
                  lineHeight={16}
                >
                  Hubungi supervisor jika akun tidak bisa diakses.
                </TextCaption>
              </YStack>
              <YStack
                flex={1}
                backgroundColor="$backgroundSecondary"
                borderRadius="$4"
                padding="$3"
                gap={4}
              >
                <Ionicons
                  name="sunny-outline"
                  size={20}
                  color={ColorWarning.warning600}
                />
                <TextBodySm fontWeight="600" textAlign="center">
                  Buka shift
                </TextBodySm>
                <TextCaption
                  color="$colorSecondary"
                  textAlign="center"
                  lineHeight={16}
                >
                  Masuk untuk mulai shift dan catat modal awal kas.
                </TextCaption>
              </YStack>
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>

      <PrinterTestModal
        visible={showPrinterTest}
        onClose={() => setShowPrinterTest(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Mobile ──
  screen: {
    flex: 1,
    backgroundColor: ColorPrimary.primary25,
  },

  // ── Tablet ──
  tabletScreen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: ColorBase.white,
  },
  brandPanel: {
    width: "38%",
    backgroundColor: ColorTeal.teal700,
    position: "relative",
    overflow: "hidden",
  },
  formPanelWrapper: {
    flex: 1,
    backgroundColor: ColorBase.white,
  },
  formPanelScroll: {
    flexGrow: 1,
    justifyContent: "center",
  },

  printerTestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: ColorNeutral.neutral50,
  },

  // Decorative shapes for brand panel
  decorCircle1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -100,
    right: -130,
  },
  decorCircle2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: 80,
    left: -80,
  },
  decorCircle3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -30,
    right: 30,
  },
});
