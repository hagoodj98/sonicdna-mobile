import React from "react";
import { IconButton } from "react-native-paper";

type IconCustomButtonProps = {
  icon: string;
  size?: number;
  iconColor?: string;
  onPress?: () => void;
  disabled?: boolean;
};

const IconCustomButton = (props: IconCustomButtonProps) => (
  <IconButton {...props} />
);

export default IconCustomButton;
