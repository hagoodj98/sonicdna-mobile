import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native";
import React, { useState } from "react";
import { inputStyles } from "@/styles/styles";
type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  style?: object;
  readOnly?: boolean;
};

const Input = ({ value, onChangeText, style, readOnly }: InputProps) => {
  const [text, setText] = useState(value);
  return (
    <SafeAreaView>
      <TextInput
        placeholder="Name your recording"
        value={text}
        editable={!readOnly}
        onChangeText={(newText) => {
          setText(newText);
          onChangeText(newText);
        }}
        style={{
          ...inputStyles.input,
          ...style,
          borderColor: "#252D42",
          borderRadius: 10,
          backgroundColor: "#0B0F1A",
          color: "#FFFFFF",
        }}
        placeholderTextColor="#4A5568"
      />
    </SafeAreaView>
  );
};

export default Input;
