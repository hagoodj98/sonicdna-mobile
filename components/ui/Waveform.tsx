import React from "react";
import { View, StyleSheet } from "react-native";

type WaveformProps = {
  active?: boolean;
  barColor?: string;
};

const BAR_HEIGHTS = [6, 11, 8, 14, 9, 12, 7, 10];

const Waveform = ({ active = false, barColor = "#4DD9FF" }: WaveformProps) => {
  return (
    <View style={styles.container}>
      {BAR_HEIGHTS.map((height, index) => (
        <View
          key={`${height}-${index}`}
          style={[
            styles.bar,
            {
              height,
              backgroundColor: barColor,
              opacity: active ? 1 : 0.35,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 18,
  },
  bar: {
    width: 3,
    borderRadius: 99,
  },
});

export default Waveform;
