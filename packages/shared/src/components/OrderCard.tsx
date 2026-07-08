import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import type { Order, PendingAction, TripStop } from "../types";
import {
  orderToCardModel,
  pendingActionToCardModel,
  tripStopToCardModel,
  type OrderCardModel,
} from "./adapters";
import { colors, toneColors } from "./tokens";

/**
 * ONE card component, three rendering modes (R4).
 *
 * Each app passes its own domain object under the matching `variant` — the
 * adapter functions in `adapters.ts` translate that into a shared visual
 * model, so this component never has to know about orders, trips, or
 * pending actions individually. Optional `leadingSlot` / `rightSlot` render
 * props let a screen override a region without forking the component.
 */
export type OrderCardProps =
  | { variant: "customer"; data: Order; onPress?: () => void; rightSlot?: never }
  | { variant: "driver"; data: TripStop; onPress?: () => void; rightSlot?: never }
  | {
      variant: "admin";
      data: PendingAction;
      onPress?: () => void;
      /** Overrides the default action chip, e.g. to wire a real handler. */
      rightSlot?: (model: OrderCardModel) => React.ReactNode;
    };

function toModel(props: OrderCardProps): OrderCardModel {
  switch (props.variant) {
    case "customer":
      return orderToCardModel(props.data);
    case "driver":
      return tripStopToCardModel(props.data);
    case "admin":
      return pendingActionToCardModel(props.data);
  }
}

export function OrderCard(props: OrderCardProps) {
  const model = toModel(props);
  const tone = toneColors[model.tone];
  const containerStyle: ViewStyle[] = [
    styles.card,
    model.highlighted ? { borderColor: colors.brand, borderWidth: 2 } : styles.cardBorder,
  ];

  const Wrapper = props.onPress ? Pressable : View;

  return (
    <Wrapper
      style={containerStyle}
      onPress={props.onPress}
      testID={`order-card-${model.key}`}
      accessibilityRole={props.onPress ? "button" : undefined}
    >
      <View style={styles.row}>
        {model.leadingBadge ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: toneColors[model.leadingBadge.tone].bg },
            ]}
          >
            <Text style={[styles.badgeText, { color: toneColors[model.leadingBadge.tone].fg }]}>
              {model.leadingBadge.content === "check" ? "✓" : model.leadingBadge.content}
            </Text>
          </View>
        ) : null}

        <View style={styles.body}>
          <Text style={[styles.eyebrow, { color: tone.fg }]} numberOfLines={1}>
            {model.eyebrow}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {model.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {model.subtitle}
          </Text>
          {model.warning ? <Text style={styles.warning}>⚠ {model.warning}</Text> : null}
        </View>

        <View style={styles.right}>
          {"rightSlot" in props && props.rightSlot ? (
            props.rightSlot(model)
          ) : model.rightChip ? (
            <View style={[styles.chip, { backgroundColor: toneColors[model.rightChip.tone].fg }]}>
              <Text style={styles.chipText}>{model.rightChip.label}</Text>
            </View>
          ) : model.meta ? (
            <Text style={styles.meta}>{model.meta}</Text>
          ) : null}
        </View>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
  },
  cardBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontWeight: "700",
    fontSize: 13,
  },
  body: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  warning: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.danger,
    marginTop: 4,
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  meta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "700",
  },
});
