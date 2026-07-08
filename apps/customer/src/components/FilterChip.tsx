import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@clear-energy/shared";

export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: colors.brand,
  },
  chipInactive: {
    backgroundColor: colors.neutralBg,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.surface,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});
