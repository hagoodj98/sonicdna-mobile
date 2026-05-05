import React from "react";
import { View, StyleSheet } from "react-native";

const Card = ({ children }: { children: React.ReactNode }) => {
  return <View style={styles.card}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#161C2D",
    borderRadius: 10,
    display: "flex",
    height: 320,
    marginVertical: 10,
    borderWidth: 1,
    width: "35%",
    borderColor: "#252D42",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    color: "#FFFFFF",
  },
});

export default Card;
