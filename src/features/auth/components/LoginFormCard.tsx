import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { YStack } from "tamagui";

import { kasirLoginConfig } from "@/features/auth/login-config";
import { LoginColors, loginStyles } from "@/features/auth/login-styles";

type LoginFormCardProps = {
  email: string;
  password: string;
  showPassword: boolean;
  isSubmitting: boolean;
  showMobileBrand?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onPrinterTest?: () => void;
};

function LoginField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoComplete,
  rightAccessory,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "email-address" | "default";
  autoComplete?: "email" | "password";
  rightAccessory?: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={loginStyles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <Ionicons
          name={icon}
          size={16}
          color={LoginColors.mint600}
          style={styles.inputIcon}
        />
        <TextInput
          style={[
            loginStyles.fieldInput,
            rightAccessory ? styles.fieldInputWithRight : null,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={LoginColors.ink400}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
        />
        {rightAccessory}
      </View>
    </View>
  );
}

export function LoginFormCard({
  email,
  password,
  showPassword,
  isSubmitting,
  showMobileBrand = false,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onPrinterTest,
}: LoginFormCardProps) {
  const {
    brandSubtitle,
    formEyebrow,
    formTitle,
    formDescription,
    emailPlaceholder,
  } = kasirLoginConfig;

  return (
    <View style={loginStyles.formCard}>
      {showMobileBrand ? (
        <View style={styles.mobileBrand}>
          <View style={styles.mobileLogoFrame}>
            <Image
              source={require("../../../../assets/images/icon.png")}
              style={styles.mobileLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.mobileBrandTitle}>SATSET POS</Text>
          <Text style={styles.mobileBrandSubtitle}>{brandSubtitle}</Text>
        </View>
      ) : null}

      <YStack marginBottom={32}>
        <Text style={loginStyles.formEyebrow}>{formEyebrow}</Text>
        <Text style={styles.formTitle}>{formTitle}</Text>
        <Text style={styles.formDescription}>{formDescription}</Text>
      </YStack>

      <YStack gap={20}>
        <LoginField
          label="Email"
          icon="mail-outline"
          value={email}
          onChangeText={onEmailChange}
          placeholder={emailPlaceholder}
          keyboardType="email-address"
          autoComplete="email"
        />

        <View style={styles.fieldGroup}>
          <View style={styles.passwordLabelRow}>
            <Text style={loginStyles.fieldLabel}>Password</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.forgotLink}>Lupa password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputShell}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={LoginColors.mint600}
              style={styles.inputIcon}
            />
            <TextInput
              style={[loginStyles.fieldInput, styles.fieldInputWithRight]}
              value={password}
              onChangeText={onPasswordChange}
              placeholder="••••••••"
              placeholderTextColor={LoginColors.ink400}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={onTogglePassword}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword
                  ? "Sembunyikan kata sandi"
                  : "Tampilkan kata sandi"
              }
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={16}
                color={LoginColors.ink400}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            loginStyles.submitButton,
            (isSubmitting || pressed) && styles.submitButtonPressed,
          ]}
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={LoginColors.white} />
          ) : (
            <>
              <Text style={loginStyles.submitButtonText}>Masuk</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={LoginColors.white}
              />
            </>
          )}
        </Pressable>
      </YStack>

      <View style={styles.supportRow}>
        <Text style={styles.supportText}>
          Butuh bantuan?
          <Text style={styles.supportLink}> Hubungi Support</Text>
        </Text>
      </View>

      {onPrinterTest ? (
        <TouchableOpacity
          style={styles.printerTestButton}
          activeOpacity={0.7}
          onPress={onPrinterTest}
        >
          <Ionicons
            name="print-outline"
            size={16}
            color={LoginColors.ink500}
          />
          <Text style={styles.printerTestText}>Test Printer</Text>
        </TouchableOpacity>
      ) : null}

      {showMobileBrand ? (
        <Text style={[loginStyles.mobileFooterMark, styles.mobileFooterMark]}>
          SATSET
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mobileBrand: {
    alignItems: "center",
    marginBottom: 32,
  },
  mobileLogoFrame: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LoginColors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mobileLogo: {
    width: 34,
    height: 34,
  },
  mobileBrandTitle: {
    marginTop: 12,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 18,
    color: LoginColors.ink900,
    letterSpacing: -0.3,
  },
  mobileBrandSubtitle: {
    marginTop: 4,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 12,
    color: LoginColors.ink500,
  },
  formTitle: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: LoginColors.ink900,
    marginTop: 8,
    marginBottom: 12,
  },
  formDescription: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 14,
    lineHeight: 22,
    color: LoginColors.ink500,
  },
  fieldGroup: {
    gap: 0,
  },
  passwordLabelRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  forgotLink: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 12,
    color: LoginColors.mint700,
  },
  inputShell: {
    position: "relative",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  fieldInputWithRight: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  supportRow: {
    marginTop: 32,
    alignItems: "center",
  },
  supportText: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: LoginColors.ink500,
    textAlign: "center",
  },
  supportLink: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
    color: LoginColors.mint700,
  },
  printerTestButton: {
    marginTop: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  printerTestText: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 13,
    color: LoginColors.ink500,
  },
  mobileFooterMark: {
    marginTop: 40,
  },
});
