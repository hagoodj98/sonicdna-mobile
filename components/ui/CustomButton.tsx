import { Text, TouchableOpacity } from "react-native";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
};

const CustomButton = ({ title, onPress }: CustomButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: "#007bff",
      width: 120,
      padding: 5,
      borderRadius: 10,
    }}
  >
    <Text style={{ textAlign: "center", color: "white", fontSize: 18 }}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default CustomButton;
