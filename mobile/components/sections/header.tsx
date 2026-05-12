import { View } from "react-native";
import React from "react";
import SearchBar from "./searchBar";
import Categories from "./categories";

export default function Header() {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
      }}
    >
      <View>
        <SearchBar />
        <Categories />
      </View>
    </View>
  );
}
