import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { StyleSheet } from "react-native";
import { SoundProfile } from "@/types";

type PickerProps = {
  getValue: (value: string | null) => void;
  audioMetas: SoundProfile[];
};

const CustomPicker = ({ getValue, audioMetas }: PickerProps) => {
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  return (
    <Picker
      selectedValue={selectedAudio}
      onValueChange={(itemValue, itemIndex) => {
        setSelectedAudio(itemValue);
        getValue(itemValue);
      }}
      style={styles.picker}
      dropdownIconColor="#FFFFFF"
    >
      <Picker.Item label="Select an audio file" value={null} />
      {audioMetas.map((audio, index) => (
        <Picker.Item
          key={index}
          label={audio.audioName}
          value={audio.audioFileId}
        />
      ))}
    </Picker>
  );
};

const styles = StyleSheet.create({
  picker: {
    color: "#FFFFFF",
    width: 200,
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: "#0B0F1A",
    borderColor: "#279430",
    borderWidth: 1,
    borderRadius: 10,
  },
});

export default CustomPicker;
