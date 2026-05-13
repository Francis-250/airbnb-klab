import { View } from "react-native";
import React from "react";
import SearchBar from "./searchBar";
import Categories from "./categories";
import { useThemeColors } from "@/hooks/useThemeColors";
import { categoryData } from "@/constants/data";

type HeaderProps = {
  onOpenFilters?: () => void;
  selectedCategory?: string | null;
  onSelectCategory?: (category: (typeof categoryData)[number] | null) => void;
};

export default function Header({
  onOpenFilters,
  selectedCategory,
  onSelectCategory,
}: HeaderProps) {
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
        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      </View>
    </View>
  );
}
