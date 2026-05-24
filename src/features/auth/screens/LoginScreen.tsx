import { useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrinterTestModal } from "@/components/molecules/PrinterTestModal";
import { LoginFormCard } from "@/features/auth/components/LoginFormCard";
import { LoginHeroPanel } from "@/features/auth/components/LoginHeroPanel";
import { loginLayoutSplit } from "@/features/auth/login-background";
import { LoginColors } from "@/features/auth/login-styles";
import {
  isShiftStartedAtom,
  shiftDataAtom,
} from "@/features/shift/store/shift.store";
import { buildShiftSyncState } from "@/features/shift/utils/syncShiftState";
import { kasirKeys } from "@/hooks/api/query-keys";
import { useLoginMutation } from "@/hooks/api/use-kasir-api";
import { useResponsiveLayout } from "@/hooks/use-responsive";
import { getApiErrorMessage } from "@/lib/api/client";
import { getActiveShift } from "@/lib/api/kasir.api";
import { useAuth } from "@/lib/auth";
import {
  getAuthenticatedEntryRoute,
  getHomeRoute,
} from "@/lib/routing/device-routes";
import { queryClient } from "@/providers/query-client";

const KASIR_ROLES = new Set(["kasir", "admin_coffee"]);

type LoginScreenVariant = "mobile" | "tablet";

export function LoginScreen({ variant }: { variant: LoginScreenVariant }) {
  const { loginWithSession } = useAuth();
  const { mutateAsync: loginApi, isPending: isLoginPending } =
    useLoginMutation();
  const router = useRouter();
  const { isLargeTablet, horizontalPadding } = useResponsiveLayout();
  const isTablet = variant === "tablet";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const formCard = (
    <LoginFormCard
      email={email}
      password={password}
      showPassword={showPassword}
      isSubmitting={isLoginPending}
      showMobileBrand={!isTablet}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onTogglePassword={() => setShowPassword((value) => !value)}
      onSubmit={() => void handleLogin()}
      onPrinterTest={() => setShowPrinterTest(true)}
    />
  );

  if (isTablet) {
    return (
      <View style={styles.tabletRoot}>
        <SafeAreaView style={styles.tabletScreen} edges={["top", "bottom"]}>
          <View style={styles.heroColumn}>
            <LoginHeroPanel padding={isLargeTablet ? 64 : 48} />
          </View>

          <View style={styles.formColumn}>
            <KeyboardAvoidingView
              style={styles.formPanelWrapper}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <ScrollView
                contentContainerStyle={styles.formPanelScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                automaticallyAdjustKeyboardInsets
              >
                <View style={styles.formPanelInner}>{formCard}</View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>

        <PrinterTestModal
          visible={showPrinterTest}
          onClose={() => setShowPrinterTest(false)}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mobileScreen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.mobileKeyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.mobileScrollContent,
            { paddingHorizontal: horizontalPadding },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.mobileFormWrap}>{formCard}</View>
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
  tabletRoot: {
    flex: 1,
  },
  tabletScreen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: LoginColors.ink50,
  },
  heroColumn: {
    flex: loginLayoutSplit.heroFlex,
  },
  formColumn: {
    flex: loginLayoutSplit.formFlex,
  },
  formPanelWrapper: {
    flex: 1,
    backgroundColor: LoginColors.ink50,
  },
  formPanelScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 48,
  },
  formPanelInner: {
    width: "100%",
    alignItems: "center",
  },
  mobileScreen: {
    flex: 1,
    backgroundColor: LoginColors.ink50,
  },
  mobileKeyboard: {
    flex: 1,
  },
  mobileScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
    paddingBottom: 40,
  },
  mobileFormWrap: {
    width: "100%",
    alignItems: "center",
  },
});
