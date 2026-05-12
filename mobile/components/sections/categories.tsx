// Categories.tsx
import { Pressable, Text, ScrollView } from "react-native";
import React, { useState } from "react";
import { categoryData } from "@/constants/data";
import { COLORS } from "@/constants/colors";

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: 16 }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {categoryData.map((category) => {
        const isSelected = selectedCategory === category.name;

        return (
          <Pressable
            onPress={() => setSelectedCategory(category.name)}
            key={category.name}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              marginRight: 24,
              gap: 8,
              paddingVertical: 8,
              paddingHorizontal: 4,
              opacity: pressed ? 0.7 : 1,
              backgroundColor: isSelected ? COLORS.PRIMARY : COLORS.BACKGROUND,
              borderRadius: 6,
            })}
          >
            <category.icon
              size={22}
              color={isSelected ? COLORS.BACKGROUND : COLORS.TEXT_SECONDARY}
            />
            <Text
              style={{
                textTransform: "capitalize",
                fontSize: 14,
                fontWeight: isSelected ? "600" : "500",
                color: isSelected ? COLORS.BACKGROUND : COLORS.TEXT_SECONDARY,
              }}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
