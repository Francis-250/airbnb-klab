import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Trip() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Text>Trip</Text>
      </View>
    </SafeAreaView>
  );
}
