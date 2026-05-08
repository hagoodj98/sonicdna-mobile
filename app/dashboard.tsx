import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import IconCustomButton from "@/components/ui/IconButton";
import { Text, View, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";
import CustomButton from "@/components/ui/CustomButton";
import { useAudioPlayerControl } from "@/hooks/useAudioPlayer";
import Picker from "@/components/ui/Picker";
import { useAudios } from "@/hooks/useAudios";
import { SoundProfile, PickerDocfileType } from "@/types";
import Slider from "@react-native-community/slider";
export default function Dashboard() {
  const [importedAudio, setImportedAudio] = useState<PickerDocfileType | null>({
    name: "",
    uri: "",
    mimeType: "",
    size: 0,
  });

  const [downloadedAudioUri, setDownloadedAudioUri] = useState<string | null>(
    null,
  );
  const [sliderRanges, setSliderRanges] = useState({
    bpm: { min: 0, max: 0 },
    bpmValue: 0,
    gainDb: { min: 0, max: 0 },
    gainDbValue: 0,
    pitchShiftSemitones: { min: 0, max: 0 },
    pitchShiftValue: 0,
  });
  const [isImportedPlaying, setIsImportedPlaying] = useState(false);
  const [isImportSelected, setIsImportSelected] = useState(false);
  const { audioMetas, downloadAudio, convertAudio } = useAudios();
  const [audioSelected, setAudioSelected] = useState<SoundProfile | null>(null);
  const [isCoversionResultVisible, setIsConversionResultVisible] =
    useState(false);
  const [isDNASoundPlaying, setIsDNASoundPlaying] = useState(false);
  const { setPlaybackUri, player, status } = useAudioPlayerControl(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioSelectedDownloaded, setAudioSelectedDownloaded] = useState(false);
  const [convertedAudioUri, setConvertedAudioUri] = useState<string | null>(
    null,
  );
  const [isConvertedPlaying, setIsConvertedPlaying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

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
      setImportedAudio(
        selectedAudio.uri
          ? {
              name: selectedAudio.name || "",
              uri: selectedAudio.uri,
              mimeType: selectedAudio.mimeType || "",
              size: selectedAudio.size || 0,
            }
          : null,
      );
    } catch (error) {
      console.error("Error picking audio file:", error);
    }
  };

  const handleConversion = () => {
    setIsLoading(true);
    if (isImportSelected && audioSelectedDownloaded) {
      if (!importedAudio)
        return Alert.alert("No audio file imported for conversion");
      convertAudio(audioSelected?.audioFileId || "", importedAudio).then(
        (conversionResult) => {
          if (conversionResult) {
            setIsConversionResultVisible(true);
            setConvertedAudioUri(conversionResult.convertedAudioUri);
            setSliderRanges({
              bpm: {
                min: conversionResult.conversionPlan.minTempoBpm,
                max: conversionResult.conversionPlan.maxTempoBpm,
              },
              bpmValue: conversionResult.conversionPlan.targetBPM,
              pitchShiftSemitones: {
                min: conversionResult.conversionPlan.minPitchShiftSemitones,
                max: conversionResult.conversionPlan.maxPitchShiftSemitones,
              },
              pitchShiftValue:
                conversionResult.conversionPlan.pitchShiftSemitones,
              gainDb: {
                min: conversionResult.conversionPlan.minGainDb,
                max: conversionResult.conversionPlan.maxGainDb,
              },
              gainDbValue: conversionResult.conversionPlan.gainDb,
            });
            Alert.alert(
              "Profile Applied",
              `Tempo ratio: ${conversionResult.conversionPlan.tempoRatio.toFixed(3)}\nPitch shift (semitones): ${conversionResult.conversionPlan.pitchShiftSemitones.toFixed(2)}\nGain (dB): ${conversionResult.conversionPlan.gainDb.toFixed(2)}`,
            );
          } else {
            Alert.alert("Failed to convert audio");
          }
          setIsLoading(false);
        },
      );
    }
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

  const handleShareConvertedAudio = async () => {
    try {
      if (!convertedAudioUri) {
        Alert.alert("No converted audio available to share");
        return;
      }

      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        Alert.alert("Sharing is not available on this device");
        return;
      }

      setIsSharing(true);

      const sharedAudioDir = new Directory(Paths.cache, "shared-audio");
      if (!sharedAudioDir.exists) {
        sharedAudioDir.create({ idempotent: true, intermediates: true });
      }
      // Clear any previously shared files in the shared audio directory to keep it lightweight and avoid clutter
      const cachedFiles = sharedAudioDir.list();
      for (const cachedFile of cachedFiles) {
        cachedFile.delete();
      }
      // Determine the file extension of the converted audio to set the correct MIME type for sharing
      const fileExtension = convertedAudioUri.toLowerCase().includes(".wav")
        ? "wav"
        : "m4a";
      // Create a new file in the shared audio directory with the appropriate file extension for sharing
      const destinationFile = new File(
        sharedAudioDir,
        `sound-dna-converted.${fileExtension}`,
      );

      const downloadedFile = await File.downloadFileAsync(
        convertedAudioUri,
        destinationFile,
        { idempotent: true },
      );
      // Use the Sharing API to share the converted audio file, providing the correct MIME type based on the file extension for better compatibility with sharing targets
      await Sharing.shareAsync(downloadedFile.uri, {
        dialogTitle: "Share converted audio",
        mimeType: fileExtension === "wav" ? "audio/wav" : "audio/m4a",
        UTI: "public.audio",
      });
    } catch (error) {
      console.error("Error sharing converted audio:", error);
      Alert.alert("Failed to share converted audio");
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    if (status.didJustFinish) {
      // Set the imported audio playing state to false to update the UI accordingly when the audio finishes playing

      setIsImportedPlaying(false);
      setIsDNASoundPlaying(false);
      setIsConvertedPlaying(false);

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
              }}
            >
              <Text style={{ color: "#FFFFFF" }}>Source DNA</Text>
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
            {importedAudio?.name ? (
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
                    if (importedAudio?.uri) {
                      if (isImportedPlaying) {
                        player.pause();
                        setPlaybackUri(null); // Stop playback by setting the playback URI to null
                        setIsImportedPlaying(false); // Set the imported audio playing state to false to update the UI accordingly
                        return;
                      }
                      setPlaybackUri(importedAudio.uri); // Set the playback URI to the selected audio file's URI to play it in the audio player
                      setIsImportedPlaying(true); // Set the imported audio playing state to true to update the UI accordingly
                    }
                  }}
                />
              </View>
            ) : null}
            {importedAudio?.name ? (
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
                justifyContent: importedAudio?.name ? "flex-end" : "center",
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
                  justifyContent: importedAudio?.name ? "flex-end" : "center",
                  alignItems: "center",
                  paddingHorizontal: 6,
                }}
              >
                <IconCustomButton
                  icon="upload"
                  iconColor="#9B6BFF"
                  size={importedAudio?.name ? 25 : 34}
                />
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {importedAudio?.name ? "Audio Selected" : "Import Audio"}
                </Text>

                {importedAudio?.name ? (
                  <Text
                    style={{
                      color: "#8892A4",
                      fontSize: 12,

                      textAlign: "center",
                    }}
                    numberOfLines={2}
                  >
                    {importedAudio.name}
                  </Text>
                ) : null}
              </Pressable>
            </View>
          </Card>
        </View>
        {isCoversionResultVisible && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: "#FFFFFF", textAlign: "center" }}>
              Pitch Ratio
            </Text>
            <Slider
              minimumValue={sliderRanges.pitchShiftSemitones.min}
              maximumValue={sliderRanges.pitchShiftSemitones.max}
              value={sliderRanges.pitchShiftValue}
              minimumTrackTintColor="#4DD9FF"
              maximumTrackTintColor="#3A4561"
              thumbTintColor="#9B6BFF"
            />
            <Text style={{ color: "#FFFFFF", textAlign: "center" }}>BPM</Text>
            <Slider
              minimumValue={sliderRanges.bpm.min}
              maximumValue={sliderRanges.bpm.max}
              value={sliderRanges.bpmValue}
              renderStepNumber
              minimumTrackTintColor="#4DD9FF"
              maximumTrackTintColor="#3A4561"
              thumbTintColor="#9B6BFF"
            />
            <Text style={{ color: "#FFFFFF", textAlign: "center" }}>
              Gain (dB)
            </Text>
            <Slider
              minimumValue={sliderRanges.gainDb.min}
              maximumValue={sliderRanges.gainDb.max}
              value={sliderRanges.gainDbValue}
              renderStepNumber
              minimumTrackTintColor="#4DD9FF"
              maximumTrackTintColor="#3A4561"
              thumbTintColor="#9B6BFF"
            />
            {convertedAudioUri && (
              <Card>
                <Text style={{ color: "#FFFFFF", margin: 10 }}>
                  Converted Audio
                </Text>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCustomButton
                    icon={isConvertedPlaying ? "pause" : "play"}
                    iconColor="#4DD9FF"
                    size={26}
                    onPress={() => {
                      if (isConvertedPlaying) {
                        player.pause();
                        setPlaybackUri(null);
                        setIsConvertedPlaying(false);
                        return;
                      }
                      setPlaybackUri(convertedAudioUri);
                      setIsConvertedPlaying(true);
                    }}
                  />
                  <IconCustomButton
                    icon={isSharing ? "loading" : "share-variant"}
                    iconColor="#4DD9FF"
                    size={26}
                    onPress={isSharing ? undefined : handleShareConvertedAudio}
                  />
                </View>
              </Card>
            )}
          </View>
        )}
        {isImportSelected && audioSelectedDownloaded ? (
          <CustomButton
            title={isLoading ? "Converting..." : "Apply DNA"}
            onPress={handleConversion}
          />
        ) : null}
      </View>
    </View>
  );
}
