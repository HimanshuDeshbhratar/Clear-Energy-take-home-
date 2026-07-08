import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "./tokens";

/**
 * Shared loading / error / empty presentation so all three screens (R5)
 * handle their four states the same way instead of each inventing its own
 * spinner and error copy.
 */

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <View style={styles.center} testID="screen-state-loading">
      <ActivityIndicator size="large" color={colors.brand} />
      <Text style={styles.loadingLabel}>{label}</Text>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center} testID="screen-state-error">
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.retryButton} onPress={onRetry} accessibilityRole="button">
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View style={styles.center} testID="screen-state-empty">
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  loadingLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  errorMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: colors.brand,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryLabel: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
