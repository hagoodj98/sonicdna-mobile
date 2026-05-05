import { Text, TouchableOpacity } from "react-native";
import type { DimensionValue } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  width?: DimensionValue;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

const CustomButton = ({
  title,
  onPress,
  width,
  variant,
  disabled,
  icon,
}: CustomButtonProps) => {
  const bg =
    variant === "secondary"
      ? "#1E2536"
      : variant === "danger"
        ? "#7A1F1F"
        : "#3D2D8A";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: bg,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        width,
        opacity: disabled ? 0.5 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: variant === "secondary" ? "#2E3A50" : "transparent",
      }}
    >
      {icon && <MaterialCommunityIcons name={icon} size={20} color="#FFFFFF" />}
      <Text
        style={{ textAlign: "center", color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
