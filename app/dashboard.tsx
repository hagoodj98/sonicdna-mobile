import Header from "@/components/Header";
import SoundCharacteristics from "@/components/SoundCharacteristics";
import Card from "@/components/ui/Card";
import IconCustomButton from "@/components/ui/IconButton";
import { Text, View, Pressable } from "react-native";
import React from "react";
import * as DocumentPicker from "expo-document-picker";
export default function Dashboard() {
  const [pickedAudioUri, setPickedAudioUri] = React.useState<string | null>(
    null,
  );
  const [pickedAudioName, setPickedAudioName] = React.useState<string | null>(
    null,
  );

  const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const selectedAudio = result.assets[0];
      setPickedAudioName(selectedAudio.name || null);
      setPickedAudioUri(selectedAudio.uri || null);
    } catch (error) {
      console.error("Error picking audio file:", error);
    }
  };

  return (
    <View
      style={{ flex: 1, alignContent: "center", backgroundColor: "#0B0F1A" }}
    >
      <Header title="Sound DNA API" />
      <View style={{ flex: 1, margin: 10, justifyContent: "center" }}>
        <View
          style={{
            flexDirection: "row",
            gap: 20,
            justifyContent: "space-between",
          }}
        >
          <Card>
            <Text style={{ margin: 10, color: "#FFFFFF" }}>DNA Source</Text>
            <SoundCharacteristics />
          </Card>
          <Card>
            <Text style={{ margin: 10, color: "#FFFFFF" }}>Target Audio</Text>
            <View
              style={{
                flex: 1,
                backgroundColor: "#161C2D",
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "#252D42",
              }}
            >
              <Pressable
                onPress={handlePickAudio}
                testID="target-audio-picker"
                style={{
                  marginTop: 14,
                  flex: 1,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#3A4561",
                  borderStyle: "dashed",
                  backgroundColor: "#0E1422",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 12,
                }}
              >
                <IconCustomButton icon="upload" iconColor="#9B6BFF" size={34} />
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    textAlign: "center",
                    fontWeight: "600",
                    marginTop: 6,
                  }}
                >
                  {pickedAudioName ? "Audio Selected" : "Import Audio"}
                </Text>

                {pickedAudioName ? (
                  <Text
                    style={{
                      color: "#8892A4",
                      fontSize: 12,
                      marginTop: 4,
                      textAlign: "center",
                    }}
                    numberOfLines={2}
                  >
                    {pickedAudioName}
                  </Text>
                ) : null}

                {pickedAudioUri ? (
                  <Text
                    style={{
                      color: "#4DD9FF",
                      fontSize: 11,
                      marginTop: 10,
                      textAlign: "center",
                    }}
                    numberOfLines={2}
                  >
                    Ready to transform
                  </Text>
                ) : null}
              </Pressable>
            </View>
          </Card>
        </View>
      </View>
    </View>
  );
}
