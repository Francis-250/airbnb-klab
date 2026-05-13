import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Search, SlidersHorizontal } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useThemeColors } from "@/hooks/useThemeColors";

type SearchBarProps = {
  onOpenFilters?: () => void;
};

export default function SearchBar({ onOpenFilters }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { colors } = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.BACKGROUND,
          borderColor: colors.BORDER_LIGHT,
          shadowColor: colors.TEXT_PRIMARY,
        },
      ]}
    >
      <View
        style={[
          styles.searchIconWrap,
          { backgroundColor: colors.BACKGROUND_GRAY },
        ]}
      >
        <Search size={19} color={colors.TEXT_SECONDARY} strokeWidth={2.5} />
      </View>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Where are you going?"
        placeholderTextColor={colors.TEXT_LIGHT}
        returnKeyType="search"
        style={[styles.input, { color: colors.TEXT_PRIMARY }]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open filters"
        onPress={onOpenFilters}
        style={({ pressed }) => [
          styles.filterButton,
          pressed && styles.filterButtonPressed,
        ]}
      >
        <SlidersHorizontal
          size={18}
          color={colors.TEXT_WHITE}
          strokeWidth={2.5}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 28,
    borderWidth: 1,
    elevation: 4,
    flexDirection: "row",
    minHeight: 56,
    paddingLeft: 14,
    paddingRight: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  filterButtonPressed: {
    backgroundColor: COLORS.PRIMARY_DARK,
    transform: [{ scale: 0.97 }],
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    minHeight: 48,
    paddingHorizontal: 10,
  },
  searchIconWrap: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
});
