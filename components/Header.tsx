import React from "react";
import { View, Text } from "react-native";

const Header = ({ title }: { title: string }) => {
  return (
    <View
      style={{
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 20,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#1E2739",
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: "#FFFFFF",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
    </View>
  );
};

export default Header;
