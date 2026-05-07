import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import IconCustomButton from "@/components/ui/IconButton";
import { Text, View, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import CustomButton from "@/components/ui/CustomButton";
import { useAudioPlayerControl } from "@/hooks/useAudioPlayer";
import Picker from "@/components/ui/Picker";
import { useAudios } from "@/hooks/useAudios";
import { SoundProfile } from "@/types";

export default function Dashboard() {
  const [pickedAudioUri, setPickedAudioUri] = useState<string | null>(null);
  const [pickedAudioName, setPickedAudioName] = useState<string | null>(null);
  const [downloadedAudioUri, setDownloadedAudioUri] = useState<string | null>(
    null,
  );
  const [isImportedPlaying, setIsImportedPlaying] = useState(false);
  const [isImportSelected, setIsImportSelected] = useState(false);
  const { audioMetas, downloadAudio } = useAudios();
  const [audioSelected, setAudioSelected] = useState<SoundProfile | null>(null);
  const [isDNASoundPlaying, setIsDNASoundPlaying] = useState(false);
  const { setPlaybackUri, player, status } = useAudioPlayerControl(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioSelectedDownloaded, setAudioSelectedDownloaded] = useState(false);

  const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*", // Only allow audio files
        multiple: false, // Only allow single file selection
        copyToCacheDirectory: true, // Ensure the file is copied to a cache directory for easier access
      });
      // Check if the user canceled the picker or if no file was selected
      if (result.canceled || !result.assets?.length) {
        return;
      }
      // Get the selected audio file's URI and name
      const selectedAudio = result.assets[0];
      setIsImportSelected(true);
      setPickedAudioName(selectedAudio.name || null);
      setPickedAudioUri(selectedAudio.uri || null);
    } catch (error) {
      console.error("Error picking audio file:", error);
    }
  };

  const handleConversion = () => {
    Alert.alert("Converting audio at URI");
    // Here you would typically call your API to convert the audio
  };
  const handleAudioMetaData = (value: string | null) => {
    const selectedMeta = audioMetas.find((meta) => meta.audioFileId === value);
    if (selectedMeta) {
      console.log("old selected", selectedMeta);

      setAudioSelected(selectedMeta);
    } else {
      setAudioSelected(null);
      setAudioSelectedDownloaded(false);
    }
  };
  useEffect(() => {
    if (audioSelected) {
      setAudioSelectedDownloaded(false); // Reset the downloaded state when a new audio is selected
      setDownloadedAudioUri(null);
    }
  }, [audioSelected]);
  const handleDownloadAudio = () => {
    setIsLoading(true);
    downloadAudio(audioSelected?.audioFileId || "").then((uri) => {
      if (uri) {
        setDownloadedAudioUri(uri); // Set the downloaded audio URI to the state
        setAudioSelectedDownloaded(true); // Set the downloaded audio state to true to update the UI accordingly
      } else {
        Alert.alert("Failed to download audio");
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (status.didJustFinish) {
      // Set the imported audio playing state to false to update the UI accordingly when the audio finishes playing

      setIsImportedPlaying(false);
      setIsDNASoundPlaying(false);

      // Reset the playback URI to null to stop the audio player and reset its state
      setPlaybackUri(null);
    }
  }, [setPlaybackUri, status.didJustFinish]);

  return (
    <View
      style={{ flex: 1, alignContent: "center", backgroundColor: "#0B0F1A" }}
    >
      <Header title="Sound DNA API" />
      <View style={{ marginTop: 20, justifyContent: "center" }}>
        <Picker audioMetas={audioMetas} getValue={handleAudioMetaData} />
      </View>
      <View style={{ flex: 1, margin: 10, justifyContent: "center" }}>
        <View
          style={{
            flexDirection: "row",
            gap: 20,
            justifyContent: "space-between",
          }}
        >
          <Card>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Text style={{ margin: 10, color: "#FFFFFF" }}>Source DNA</Text>
            </View>
            {audioSelectedDownloaded ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCustomButton
                  icon={isDNASoundPlaying ? "pause" : "play"}
                  iconColor="#4DD9FF"
                  size={26}
                  onPress={() => {
                    if (downloadedAudioUri) {
                      if (isDNASoundPlaying) {
                        player.pause();
                        setPlaybackUri(null); // Stop playback by setting the playback URI to null
                        setIsDNASoundPlaying(false); // Set the DNA audio playing state to false to update the UI accordingly
                        return;
                      }

                      setPlaybackUri(downloadedAudioUri); // Set the playback URI to the downloaded audio file's URI to play it in the audio player
                      setIsDNASoundPlaying(true); // Set the DNA audio playing state to true to update the UI accordingly
                    }
                  }}
                />
              </View>
            ) : audioSelected ? (
              <IconCustomButton
                icon={isLoading ? "loading" : "download"}
                iconColor="#9B6BFF"
                size={26}
                onPress={handleDownloadAudio}
              />
            ) : null}

            <View
              style={{
                gap: 10,
                justifyContent: "flex-end",
                paddingBottom: 10,
                flex: 1,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: "#FFFFFF" }}>
                Audio Name: {audioSelected?.audioName}
              </Text>
              <Text style={{ color: "#FFFFFF" }}>
                BPM: {audioSelected?.tempoBpm}
              </Text>
              <Text style={{ color: "#FFFFFF" }}>
                Energy Level: {audioSelected?.energyLevel}
              </Text>
              <Text style={{ color: "#FFFFFF" }}>
                Tone: {audioSelected?.tone}
              </Text>
              <Text style={{ color: "#FFFFFF" }}>
                Mood: {audioSelected?.mood}
              </Text>
            </View>
          </Card>
          <Card>
            <Text style={{ margin: 10, color: "#FFFFFF" }}>Target Audio</Text>
            {pickedAudioName ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCustomButton
                  icon={isImportedPlaying ? "pause" : "play"}
                  iconColor="#4DD9FF"
                  size={26}
                  onPress={() => {
                    if (pickedAudioUri) {
                      if (isImportedPlaying) {
                        player.pause();
                        setPlaybackUri(null); // Stop playback by setting the playback URI to null
                        setIsImportedPlaying(false); // Set the imported audio playing state to false to update the UI accordingly
                        return;
                      }
                      setPlaybackUri(pickedAudioUri); // Set the playback URI to the selected audio file's URI to play it in the audio player
                      setIsImportedPlaying(true); // Set the imported audio playing state to true to update the UI accordingly
                    }
                  }}
                />
              </View>
            ) : null}
            {pickedAudioName ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    textAlign: "center",
                    fontWeight: "600",
                    marginTop: 6,
                  }}
                >
                  waveform
                </Text>
              </View>
            ) : null}

            <View
              style={{
                flex: 1,
                backgroundColor: "#161C2D",
                borderRadius: 18,
                borderWidth: 1,
                justifyContent: pickedAudioName ? "flex-end" : "center",
                borderColor: "#252D42",
              }}
            >
              <Pressable
                onPress={handlePickAudio}
                testID="target-audio-picker"
                style={{
                  flex: 1,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#3A4561",
                  borderStyle: "dashed",
                  backgroundColor: "#0E1422",
                  justifyContent: pickedAudioName ? "flex-end" : "center",
                  alignItems: "center",
                  paddingHorizontal: 6,
                }}
              >
                <IconCustomButton
                  icon="upload"
                  iconColor="#9B6BFF"
                  size={pickedAudioName ? 25 : 34}
                />
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {pickedAudioName ? "Audio Selected" : "Import Audio"}
                </Text>

                {pickedAudioName ? (
                  <Text
                    style={{
                      color: "#8892A4",
                      fontSize: 12,

                      textAlign: "center",
                    }}
                    numberOfLines={2}
                  >
                    {pickedAudioName}
                  </Text>
                ) : null}
              </Pressable>
            </View>
          </Card>
        </View>

        {isImportSelected && audioSelectedDownloaded ? (
          <CustomButton title="Apply DNA" onPress={handleConversion} />
        ) : null}
      </View>
    </View>
  );
}
