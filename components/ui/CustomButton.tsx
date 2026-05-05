import { Text, TouchableOpacity } from "react-native";
import type { DimensionValue } from "react-native";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  width?: DimensionValue;
  variant?: "primary" | "secondary";
};

const CustomButton = ({
  title,
  onPress,
  width,
  variant,
}: CustomButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: variant === "secondary" ? "#6c757d" : "#007bff",
      padding: 10,
      borderRadius: 10,
      width: width,
    }}
  >
    <Text style={{ textAlign: "center", color: "white", fontSize: 18 }}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default CustomButton;
