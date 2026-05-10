import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { SoundProfile } from "@/types";
import { pickerStyles } from "@/styles/styles";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
type PickerProps = {
  getValue: (value: string | null) => void;
  audioMetas: SoundProfile[];
};

const CustomPicker = ({ getValue, audioMetas }: PickerProps) => {
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleValueChange = (value: string | null) => {
    setSelectedAudio(value);
    getValue(value);
  };

  if (Platform.OS === "ios") {
    console.log(audioMetas);

    const selectedLabel =
      audioMetas.find((audio) => audio.audioFileId === selectedAudio)
        ?.audioName ?? "Select an audio file";

    return (
      <>
        <Pressable
          style={styles.iosTrigger}
          onPress={() => setIsOpen(true)}
          accessibilityRole="button"
        >
          <Text style={styles.iosTriggerText} numberOfLines={1}>
            {selectedLabel}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#FFFFFF" />
        </Pressable>

        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Choose Source Audio</Text>
              <FlatList
                data={[
                  { audioName: "Select an audio file", audioFileId: null },
                  ...audioMetas,
                ]}
                keyExtractor={(item, index) =>
                  `${item.audioFileId ?? "none"}-${index}`
                }
                renderItem={({ item }) => {
                  const isSelected = item.audioFileId === selectedAudio;
                  return (
                    <Pressable
                      style={[
                        styles.optionRow,
                        isSelected ? styles.optionRowSelected : null,
                      ]}
                      onPress={() => {
                        handleValueChange(item.audioFileId ?? null);
                        setIsOpen(false);
                      }}
                    >
                      <Text style={styles.optionText} numberOfLines={1}>
                        {item.audioName}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>
          </Pressable>
        </Modal>
      </>
    );
  }

  return (
    <Picker
      selectedValue={selectedAudio}
      onValueChange={(itemValue) => {
        handleValueChange(itemValue);
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

const styles = StyleSheet.create({
  iosTrigger: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1F2E46",
    backgroundColor: "#0B0F1A",
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iosTriggerText: {
    color: "#FFFFFF",
    fontSize: 17,
    flex: 1,
    marginRight: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0F1A2D",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxHeight: "55%",
    borderTopWidth: 1,
    borderColor: "#1F2E46",
  },
  sheetTitle: {
    color: "#EAF1FF",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
  },
  optionRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1F2E46",
    backgroundColor: "#0B1627",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  optionRowSelected: {
    borderColor: "#4DD9FF",
  },
  optionText: {
    color: "#EAF1FF",
    fontSize: 15,
  },
});

export default CustomPicker;
