import { View } from "react-native";
import React from "react";
import SearchBar from "./searchBar";
import Categories from "./categories";
import { useThemeColors } from "@/hooks/useThemeColors";

type HeaderProps = {
  onOpenFilters?: () => void;
};

export default function Header({ onOpenFilters }: HeaderProps) {
  const { colors } = useThemeColors();

  return (
    <View
      style={{
        backgroundColor: colors.BACKGROUND,
        borderBottomWidth: 1,
        borderBottomColor: colors.BORDER_LIGHT,
        paddingHorizontal: 20,
      }}
    >
      <View>
        <SearchBar onOpenFilters={onOpenFilters} />
        <Categories />
      </View>
    </View>
  );
}
