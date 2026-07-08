import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
  colors,
  EmptyState,
  ErrorState,
  LoadingState,
  OrderCard,
  getOrders,
  type Order,
} from "@clear-energy/shared";
import { apiClient, CUSTOMER_ID } from "../config";
import { FilterChip } from "../components/FilterChip";

type Filter = "all" | "active" | "delivered" | "returns";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "returns", label: "Returns" },
];

function matchesFilter(order: Order, filter: Filter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "active":
      return ["placed", "assigned", "out_for_delivery"].includes(order.status);
    case "delivered":
      return order.status === "delivered";
    case "returns":
      return order.status === "cancelled" || order.status === "returned";
  }
}

export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>("all");

  const query = useQuery({
    queryKey: ["orders", CUSTOMER_ID],
    queryFn: ({ signal }) => getOrders(apiClient, CUSTOMER_ID, { signal }),
  });

  const filteredOrders = useMemo(
    () => (query.data ?? []).filter((order) => matchesFilter(order, filter)),
    [query.data, filter],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </View>

      <View style={styles.listArea}>
        {query.isLoading ? (
          <LoadingState label="Loading your orders…" />
        ) : query.isError ? (
          <ErrorState
            message={
              query.error instanceof Error
                ? query.error.message
                : "Could not load your orders."
            }
            onRetry={() => query.refetch()}
          />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title={filter === "all" ? "No orders yet" : "Nothing here"}
            message={
              filter === "all"
                ? "Place your first LPG order to see it here."
                : "Try a different filter to see other orders."
            }
          />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(order) => order.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <OrderCard variant="customer" data={item}  onPress={() =>
              Alert.alert(
                "Order",
                "Order Detail screen is out of scope for this take-home."
              )
            } />}
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
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
});
