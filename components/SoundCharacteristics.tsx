import React from "react";
import { View, Text } from "react-native";
const SoundCharacteristics = () => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,

        marginTop: 20,
      }}
    >
      <Text style={{ color: "#FFFFFF" }}>Audio Name </Text>
      <Text style={{ color: "#FFFFFF" }}>BPM: </Text>
      <Text style={{ color: "#FFFFFF" }}>Energy: </Text>
      <Text style={{ color: "#FFFFFF" }}>Tone: </Text>
    </View>
  );
};

export default SoundCharacteristics;
