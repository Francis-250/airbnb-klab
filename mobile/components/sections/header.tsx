import { View } from "react-native";
import React from "react";
import SearchBar from "./searchBar";
import Categories from "./categories";

type HeaderProps = {
  onOpenFilters?: () => void;
};

export default function Header({ onOpenFilters }: HeaderProps) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
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
