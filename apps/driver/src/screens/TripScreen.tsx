import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import {
  colors,
  EmptyState,
  ErrorState,
  LoadingState,
  OrderCard,
  getTrips,
} from "@clear-energy/shared";
import { apiClient, DRIVER_ID } from "../config";

export function TripScreen() {
  const insets = useSafeAreaInsets();

  const query = useQuery({
    queryKey: ["trips", DRIVER_ID],
    queryFn: ({ signal }) => getTrips(apiClient, DRIVER_ID, { signal }),
  });

  const stops = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => a.seq - b.seq),
    [query.data],
  );

  const activeStop = stops.find((s) => s.status === "active");
  const remaining = stops.filter((s) => s.status !== "done").length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's route</Text>
        <View style={styles.stopBadge}>
          <Text style={styles.stopBadgeText}>{stops.length} stops</Text>
        </View>
      </View>

      {/* Decorative — the mockup's map is a visual placeholder; the ETA banner
          reflects the driver's current active stop when there is one. */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderIcon}>🚚</Text>
        {activeStop ? (
          <View style={styles.etaBanner}>
            <View style={styles.pulseDot} />
            <Text style={styles.etaBannerText}>
              ETA next stop · <Text style={styles.etaBannerAccent}>{activeStop.etaMin} min</Text>
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.listArea}>
        {query.isLoading ? (
          <LoadingState label="Loading today's trip…" />
        ) : query.isError ? (
          <ErrorState
            message={
              query.error instanceof Error ? query.error.message : "Could not load your trip."
            }
            onRetry={() => query.refetch()}
          />
        ) : stops.length === 0 ? (
          <EmptyState title="No trip today" message="You have no stops assigned for today." />
        ) : (
          <FlatList
            data={stops}
            keyExtractor={(stop) => `${stop.seq}-${stop.orderId}`}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              remaining > 0 ? (
                <Text style={styles.remainingLabel}>{remaining} stop{remaining === 1 ? "" : "s"} remaining</Text>
              ) : null
            }
            renderItem={({ item }) => <OrderCard variant="driver" data={item} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  stopBadge: {
    marginLeft: "auto",
    backgroundColor: colors.positiveBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  stopBadgeText: {
    color: colors.brandDark,
    fontSize: 11,
    fontWeight: "700",
  },
  mapPlaceholder: {
    height: 140,
    backgroundColor: "#EAF6F1",
    alignItems: "center",
    justifyContent: "center",
  },
  mapPlaceholderIcon: {
    fontSize: 32,
  },
  etaBanner: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.positive,
  },
  etaBannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  etaBannerAccent: {
    color: colors.brand,
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  remainingLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 8,
  },
});
