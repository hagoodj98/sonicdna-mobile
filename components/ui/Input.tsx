import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native";
import React, { useState } from "react";

type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  style?: object;
};

const Input = ({ value, onChangeText, style }: InputProps) => {
  const [text, setText] = useState(value);
  return (
    <SafeAreaView>
      <TextInput
        placeholder="Name your recording"
        value={text}
        onChangeText={(newText) => {
          setText(newText);
          onChangeText(newText);
        }}
        style={{
          ...style,
          borderColor: "gray",
          borderRadius: 10,
          borderWidth: 1,
          paddingHorizontal: 10,
        }}
      />
    </SafeAreaView>
  );
};
export default Input;
