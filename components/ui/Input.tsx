import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, StyleSheet } from "react-native";
import React, { useState } from "react";

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
          ...styles.input,
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

const styles = StyleSheet.create({
  input: {
    height: 44,
    margin: 12,
    width: 220,
    borderWidth: 1,
    padding: 10,
    fontSize: 15,
  },
});
export default Input;
