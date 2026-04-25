import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
import { isShiftStartedAtom, shiftDataAtom } from "@/features/shift/store/shift.store";
import { buildShiftSyncState } from "@/features/shift/utils/syncShiftState";
import { useLoginMutation } from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { getActiveShift } from "@/lib/api/kasir.api";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { getAuthenticatedEntryRoute, getHomeRoute } from "@/lib/routing/device-routes";
import { kasirKeys } from "@/hooks/api/query-keys";
import { queryClient } from "@/providers/query-client";
import {
  ColorBase,
  ColorNeutral,
} from "@/themes/Colors";

const KASIR_ROLES = new Set(["kasir", "admin_coffee"]);
const BRAND_DEEP = "#075F55";
const BRAND_GREEN = "#4FBF3E";
const BRAND_MID = "#13985B";
const BRAND_LIME = "#8FCF50";  // softer than neon #BFEA3A
const BRAND_CANVAS = "#F4F8F1";
const BRAND_SURFACE = "#FDFFFA";
const BRAND_TINT = "#F3FCEB";
const BRAND_TEXT = "#08745F";
const BRAND_BORDER = "rgba(65, 184, 58, 0.16)";

type LoginScreenVariant = "mobile" | "tablet";

export function LoginScreen({ variant }: { variant: LoginScreenVariant }) {
  const { loginWithSession } = useAuth();
  const { mutateAsync: loginApi, isPending: isLoginPending } =
    useLoginMutation();
  const router = useRouter();
  const { isLargeTablet, horizontalPadding } = useResponsiveLayout();
  const isTablet = variant === "tablet";
  const [email, setEmail] = useState("bilqis@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrinterTest, setShowPrinterTest] = useState(false);
  const setIsShiftStarted = useSetAtom(isShiftStartedAtom);
  const setShiftData = useSetAtom(shiftDataAtom);

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

      let activeShift = null;
      let hasResolvedShift = false;

      try {
        activeShift = await queryClient.fetchQuery({
          queryKey: kasirKeys.activeShift(),
          queryFn: getActiveShift,
          staleTime: 30_000,
        });
        hasResolvedShift = true;
      } catch {
        hasResolvedShift = false;
      }

      if (hasResolvedShift) {
        const nextState = buildShiftSyncState(activeShift);
        setShiftData(nextState.shiftData);
        setIsShiftStarted(nextState.isShiftStarted);
      }

      router.replace(
        (hasResolvedShift
          ? getAuthenticatedEntryRoute(isTablet, Boolean(activeShift))
          : getHomeRoute(isTablet)) as never,
      );
    } catch (e) {
      Alert.alert(
        "Gagal masuk",
        getApiErrorMessage(e, "Email atau password salah."),
      );
    }
  };

  if (isTablet) {
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={styles.tabletScreen} edges={["top", "bottom"]}>
          <LinearGradient
            colors={[BRAND_GREEN, BRAND_MID, BRAND_DEEP]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandPanel}
          >
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <View style={styles.decorCircle3} />

            <YStack
              flex={1}
              justifyContent="center"
              padding={isLargeTablet ? 48 : 36}
              gap="$6"
            >
              <XStack alignItems="center" gap="$3">
                <View style={styles.tabletLogoFrame}>
                  <Image
                    source={require("../../../../assets/images/satset_1024.png")}
                    style={styles.tabletLogo}
                    resizeMode="contain"
                  />
                </View>
                <YStack gap={2}>
                  <TextH2 color={ColorBase.white} fontWeight="900">
                    SATSET
                  </TextH2>
                  <TextCaption color={BRAND_LIME} fontWeight="700">
                    Akselerasi Bisnis Tanpa Batas
                  </TextCaption>
                </YStack>
              </XStack>

              <YStack gap="$2">
                <TextH1 color={ColorBase.white} fontWeight="700" lineHeight={32}>
                  Satset POS{"\n"}Kasir
                </TextH1>
                <TextBodyLg color="rgba(240,253,232,0.72)" lineHeight={22}>
                  Kelola transaksi outlet dengan cepat dan efisien. Satset POS
                  membantu shift, pesanan, dan pembayaran tetap real-time.
                </TextBodyLg>
              </YStack>

              <YStack gap="$3" marginTop="$2">
                <XStack
                  backgroundColor="rgba(240,253,232,0.12)"
                  borderRadius="$4"
                  padding="$3"
                  gap="$3"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="rgba(218,247,166,0.22)"
                >
                  <YStack
                    width={38}
                    height={38}
                    borderRadius={19}
                    backgroundColor="rgba(240,253,232,0.16)"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons
                      name="sunny-outline"
                      size={18}
                      color={BRAND_LIME}
                    />
                  </YStack>
                  <YStack flex={1} gap={2}>
                    <TextBodySm fontWeight="700" color={ColorBase.white}>
                      Buka shift
                    </TextBodySm>
                    <TextCaption color="rgba(240,253,232,0.68)" lineHeight={16}>
                      Login untuk mulai shift dan catat modal awal kas.
                    </TextCaption>
                  </YStack>
                </XStack>

                <XStack
                  backgroundColor="rgba(240,253,232,0.12)"
                  borderRadius="$4"
                  padding="$3"
                  gap="$3"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="rgba(218,247,166,0.22)"
                >
                  <YStack
                    width={38}
                    height={38}
                    borderRadius={19}
                    backgroundColor="rgba(240,253,232,0.16)"
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
                    <TextCaption color="rgba(240,253,232,0.68)" lineHeight={16}>
                      Hubungi supervisor jika akun tidak bisa diakses.
                    </TextCaption>
                  </YStack>
                </XStack>
              </YStack>
            </YStack>

            <YStack padding={isLargeTablet ? 48 : 36} paddingTop={0}>
              <TextCaption color="rgba(240,253,232,0.38)">
                Est. 2026 • Modern POS Ecosystem
              </TextCaption>
            </YStack>
          </LinearGradient>

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
                <XStack
                  backgroundColor={BRAND_TINT}
                  borderRadius="$4"
                  padding="$3"
                  alignItems="center"
                  gap="$3"
                  borderWidth={1}
                  borderColor={BRAND_BORDER}
                >
                  <YStack
                    width={38}
                    height={38}
                    borderRadius={19}
                    backgroundColor="#E7F8D8"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={BRAND_TEXT}
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

                <YStack gap="$1.5">
                  <TextH2 fontWeight="700">Login Satset POS Kasir</TextH2>
                  <TextBodySm color="$colorSecondary" lineHeight={20}>
                    Login untuk mengelola transaksi outlet Satset dan membuka
                    shift kasir.
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
                        rememberMe ? BRAND_GREEN : ColorBase.transparent
                      }
                      borderWidth={2}
                      borderColor={rememberMe ? BRAND_GREEN : "$borderColor"}
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
                    <TextBodySm fontWeight="600" color={BRAND_TEXT}>
                      Lupa password?
                    </TextBodySm>
                  </TouchableOpacity>
                </XStack>

                <AppButton
                  onPress={() => void handleLogin()}
                  variant="brand"
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
              backgroundColor={BRAND_SURFACE}
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              borderColor={BRAND_BORDER}
            >
              <Image
                source={require("../../../../assets/images/satset_1024.png")}
                style={styles.mobileLogo}
                resizeMode="contain"
              />
            </YStack>
            <TextH3 fontWeight="700" marginTop="$2">
              Satset POS Kasir
            </TextH3>
            <TextBodySm color="$colorSecondary">
              Login untuk mulai transaksi Satset hari ini
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
              borderColor={BRAND_BORDER}
            >
              <XStack
                backgroundColor={BRAND_TINT}
                borderRadius="$4"
                padding="$3"
                alignItems="center"
                gap="$3"
              >
                <YStack
                  width={36}
                  height={36}
                  borderRadius={18}
                  backgroundColor="#E7F8D8"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={BRAND_TEXT}
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
                <TextH3 fontWeight="700">Login Satset POS Kasir</TextH3>
                <TextBodySm color="$colorSecondary" lineHeight={18}>
                  Login untuk mengelola transaksi outlet Satset dan membuka
                  shift kasir.
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
                      rememberMe ? BRAND_GREEN : ColorBase.transparent
                    }
                    borderWidth={2}
                    borderColor={rememberMe ? BRAND_GREEN : "$borderColor"}
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
                  <TextBodySm fontWeight="600" color={BRAND_TEXT}>
                    Lupa password?
                  </TextBodySm>
                </TouchableOpacity>
              </XStack>

              <AppButton
                onPress={() => void handleLogin()}
                variant="brand"
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
                <TextCaption color="$colorSecondary" textAlign="center">
                  Hubungi supervisor outlet
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
                  color={BRAND_LIME}
                />
                <TextBodySm fontWeight="600" textAlign="center">
                  Buka Shift
                </TextBodySm>
                <TextCaption color="$colorSecondary" textAlign="center">
                  Catat modal awal sebelum jualan
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
  screen: {
    flex: 1,
    backgroundColor: BRAND_CANVAS,
  },
  tabletScreen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: BRAND_SURFACE,
  },
  brandPanel: {
    flex: 1,
    backgroundColor: BRAND_DEEP,
    overflow: "hidden",
  },
  formPanelWrapper: {
    flex: 1,
    backgroundColor: BRAND_SURFACE,
  },
  formPanelScroll: {
    flexGrow: 1,
  },
  printerTestButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  tabletLogoFrame: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(253,255,250,0.92)",
    borderWidth: 1,
    borderColor: "rgba(218,247,166,0.34)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tabletLogo: {
    width: 62,
    height: 62,
  },
  mobileLogo: {
    width: 46,
    height: 46,
  },
  decorCircle1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(218,247,166,0.12)",
    top: -70,
    right: -50,
  },
  decorCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(240,253,232,0.1)",
    bottom: 80,
    left: -40,
  },
  decorCircle3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(218,247,166,0.1)",
    bottom: -10,
    right: 90,
  },
});
