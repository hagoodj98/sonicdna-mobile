import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { SoundProfile } from "@/types";
import { pickerStyles } from "@/styles/styles";
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
      style={pickerStyles.picker}
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

export default CustomPicker;
