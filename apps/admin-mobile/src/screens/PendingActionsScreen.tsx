import React, { useMemo } from "react";
import { Alert, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import {
  colors,
  EmptyState,
  ErrorState,
  LoadingState,
  OrderCard,
  getPendingActions,
  type PendingAction,
  type PendingActionCategory,
} from "@clear-energy/shared";
import { apiClient, ADMIN_ID } from "../config";

const CATEGORY_LABEL: Record<PendingActionCategory, string> = {
  cash: "Cash",
  mi_empty: "MI Empty",
  mi_full: "MI Full",
  unassigned: "Unassigned orders",
  kyc: "KYC",
  prior_delivery: "Prior delivery",
  verification: "Verification",
  branch_assign: "Branch assign",
};

function groupByCategory(items: PendingAction[]) {
  const order: PendingActionCategory[] = [];
  const buckets = new Map<PendingActionCategory, PendingAction[]>();
  for (const item of items) {
    if (!buckets.has(item.category)) {
      buckets.set(item.category, []);
      order.push(item.category);
    }
    buckets.get(item.category)!.push(item);
  }
  return order.map((category) => ({
    title: CATEGORY_LABEL[category],
    data: buckets.get(category)!,
  }));
}

export function PendingActionsScreen() {
  const insets = useSafeAreaInsets();

  const query = useQuery({
    queryKey: ["pending-actions", ADMIN_ID],
    queryFn: ({ signal }) => getPendingActions(apiClient, ADMIN_ID, { signal }),
  });

  const sections = useMemo(() => groupByCategory(query.data ?? []), [query.data]);
  const categoryCount = sections.length;
  const totalCount = query.data?.length ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Actions</Text>
        <View style={styles.countRow}>
          <Text style={styles.countNumber}>{totalCount}</Text>
          <Text style={styles.countLabel}>
            item{totalCount === 1 ? "" : "s"} across {categoryCount} categor
            {categoryCount === 1 ? "y" : "ies"}
          </Text>
        </View>
      </View>

      <View style={styles.listArea}>
        {query.isLoading ? (
          <LoadingState label="Loading pending actions…" />
        ) : query.isError ? (
          <ErrorState
            message={
              query.error instanceof Error
                ? query.error.message
                : "Could not load pending actions."
            }
            onRetry={() => query.refetch()}
          />
        ) : totalCount === 0 ? (
          <EmptyState title="All clear" message="There is nothing waiting on you right now." />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>
                {section.title} · {section.data.length}
              </Text>
            )}
            renderItem={({ item }) => (
              <View style={styles.itemSpacing}>
                <OrderCard
                  variant="admin"
                  data={item}
                  onPress={() =>
                    Alert.alert(item.id, `Action: ${item.action}\n${item.summary}`)
                  }
                />
              </View>
            )}
            stickySectionHeadersEnabled={false}
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
    backgroundColor: colors.brandDark,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.surface,
    marginBottom: 6,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  countNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.surface,
  },
  countLabel: {
    fontSize: 12,
    color: "#D1FAE5",
    marginBottom: 4,
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 8,
  },
  itemSpacing: {
    marginBottom: 10,
  },
});
