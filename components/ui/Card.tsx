import React from "react";
import { View } from "react-native";
import { cardStyles } from "@/styles/styles";

const Card = ({ children }: { children: React.ReactNode }) => {
  return <View style={cardStyles.card}>{children}</View>;
};

export default Card;
