import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ColorBase, ColorDanger, ColorNeutral } from "@/themes/Colors";

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorBase.bgScreen,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    gap: 8,
    maxWidth: 320,
  },
  title: {
    color: ColorDanger.danger600,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    color: ColorNeutral.neutral500,
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: ColorDanger.danger600,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryBtnText: {
    color: ColorBase.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Terjadi Kesalahan</Text>
            <Text style={styles.message}>
              {this.state.error?.message ?? "Silakan coba lagi."}
            </Text>
            <TouchableOpacity
              onPress={this.handleReset}
              style={styles.retryBtn}
            >
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
