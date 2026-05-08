import Header from "@/components/Header";
import IconCustomButton from "@/components/ui/IconButton";
import {
  Text,
  View,
  Pressable,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";
import CustomButton from "@/components/ui/CustomButton";
import { useAudioPlayerControl } from "@/hooks/useAudioPlayer";
import Picker from "@/components/ui/Picker";
import { useAudios } from "@/hooks/useAudios";
import { SoundProfile, PickerDocfileType } from "@/types";
import Slider from "@react-native-community/slider";

const sliderRanges = {
  bpm: { min: 40, max: 180 },
  gainDb: { min: -12, max: 12 },
  pitchShiftSemitones: { min: -12, max: 12 },
};

type SliderValues = {
  bpm: number;
  gainDb: number;
  pitchShiftSemitones: number;
};

const initialSliderValues: SliderValues = {
  bpm: 0,
  gainDb: 0,
  pitchShiftSemitones: 0,
};

export default function Dashboard() {
  const [importedAudio, setImportedAudio] = useState<PickerDocfileType | null>(
    null,
  );
  const [downloadedAudioUri, setDownloadedAudioUri] = useState<string | null>(
    null,
  );
  const [sliderValues, setSliderValues] =
    useState<SliderValues>(initialSliderValues);
  const [lastAppliedSliderValues, setLastAppliedSliderValues] =
    useState<SliderValues | null>(null);
  const [importedTempoBpm, setImportedTempoBpm] = useState<number | undefined>(
    undefined,
  );

  const [isImportedPlaying, setIsImportedPlaying] = useState(false);
  const [isImportSelected, setIsImportSelected] = useState(false);
  const [audioSelected, setAudioSelected] = useState<SoundProfile | null>(null);
  const [isCoversionResultVisible, setIsConversionResultVisible] =
    useState(false);
  const [isReConversionResultVisible, setIsReConversionResultVisible] =
    useState(false);
  const [isDNASoundPlaying, setIsDNASoundPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioSelectedDownloaded, setAudioSelectedDownloaded] = useState(false);
  const [convertedAudioUri, setConvertedAudioUri] = useState<string | null>(
    null,
  );
  const [isConvertedPlaying, setIsConvertedPlaying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const { audioMetas, reConvertAudio, downloadAudio, convertAudio } =
    useAudios();
  const { setPlaybackUri, player, status } = useAudioPlayerControl(null);

  const hasChangesSinceLastApply =
    lastAppliedSliderValues === null ||
    sliderValues.bpm !== lastAppliedSliderValues.bpm ||
    sliderValues.pitchShiftSemitones !==
      lastAppliedSliderValues.pitchShiftSemitones ||
    sliderValues.gainDb !== lastAppliedSliderValues.gainDb;

  const showAdjustments =
    isCoversionResultVisible || isReConversionResultVisible;

  const stopAllPlayback = useCallback(() => {
    player.pause();
    setPlaybackUri(null);
    setIsImportedPlaying(false);
    setIsDNASoundPlaying(false);
    setIsConvertedPlaying(false);
  }, [player, setPlaybackUri]);

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

  const handleConversion = async () => {
    if (!isImportSelected || !audioSelectedDownloaded || !importedAudio) {
      Alert.alert("Select a source and target audio first");
      return;
    }

    setIsLoading(true);
    try {
      const conversionResult = await convertAudio(
        audioSelected?.audioFileId || "",
        importedAudio,
      );

      if (!conversionResult) {
        Alert.alert("Failed to convert audio");
        return;
      }

      setIsConversionResultVisible(true);
      setIsReConversionResultVisible(false);
      setConvertedAudioUri(conversionResult.convertedAudioUri);

      const appliedValues = {
        bpm: conversionResult.conversionPlan.targetBPM,
        pitchShiftSemitones: conversionResult.conversionPlan.pitchShiftSemitones,
        gainDb: conversionResult.conversionPlan.gainDb,
      };
      setSliderValues(appliedValues);
      setLastAppliedSliderValues(appliedValues);
      setImportedTempoBpm(conversionResult.conversionPlan.importedTempoBpm);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioMetaData = (value: string | null) => {
    const selectedMeta = audioMetas.find((meta) => meta.audioFileId === value);
    if (!selectedMeta) {
      setAudioSelected(null);
      setAudioSelectedDownloaded(false);
      return;
    }

    setAudioSelected(selectedMeta);
  };

  const handleDownloadAudio = async () => {
    if (!audioSelected?.audioFileId) {
      Alert.alert("Select source audio first");
      return;
    }

    setIsLoading(true);
    try {
      const uri = await downloadAudio(audioSelected.audioFileId);
      if (!uri) {
        Alert.alert("Failed to download audio");
        return;
      }

      setDownloadedAudioUri(uri);
      setAudioSelectedDownloaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReConversion = async () => {
    if (!isImportSelected || !audioSelectedDownloaded || !importedAudio) {
      Alert.alert("Select a source and target audio first");
      return;
    }

    setIsLoading(true);
    try {
      const reConversionResult = await reConvertAudio(
        audioSelected?.audioFileId || "",
        importedAudio,
        {
          targetBPM: sliderValues.bpm,
          pitchShiftSemitones: sliderValues.pitchShiftSemitones,
          gainDb: sliderValues.gainDb,
          importedTempoBpm,
        },
      );

      if (!reConversionResult) {
        Alert.alert("Failed to re-convert audio");
        return;
      }

      setIsConversionResultVisible(false);
      setIsReConversionResultVisible(true);

      const reAppliedValues = {
        bpm: reConversionResult.conversionPlan.targetBPM,
        pitchShiftSemitones:
          reConversionResult.conversionPlan.pitchShiftSemitones,
        gainDb: reConversionResult.conversionPlan.gainDb,
      };

      setSliderValues(reAppliedValues);
      setLastAppliedSliderValues(reAppliedValues);
      setConvertedAudioUri(reConversionResult.convertedAudioUri);
    } finally {
      setIsLoading(false);
    }
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

      for (const cachedFile of sharedAudioDir.list()) {
        cachedFile.delete();
      }

      const fileExtension = convertedAudioUri.toLowerCase().includes(".wav")
        ? "wav"
        : "m4a";
      const destinationFile = new File(
        sharedAudioDir,
        `sound-dna-converted.${fileExtension}`,
      );

      const downloadedFile = await File.downloadFileAsync(
        convertedAudioUri,
        destinationFile,
        { idempotent: true },
      );

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
    if (!audioSelected) {
      return;
    }

    setAudioSelectedDownloaded(false);
    setDownloadedAudioUri(null);
    setConvertedAudioUri(null);
    setIsConversionResultVisible(false);
    setIsReConversionResultVisible(false);
    setLastAppliedSliderValues(null);
    setSliderValues(initialSliderValues);
    setImportedTempoBpm(undefined);
    setIsConvertedPlaying(false);
  }, [audioSelected]);

  useEffect(() => {
    if (!importedAudio?.uri) {
      return;
    }

    setConvertedAudioUri(null);
    setIsConversionResultVisible(false);
    setIsReConversionResultVisible(false);
    setLastAppliedSliderValues(null);
    setSliderValues(initialSliderValues);
    setImportedTempoBpm(undefined);
    setIsConvertedPlaying(false);
  }, [importedAudio?.uri]);

  useEffect(() => {
    if (!status.didJustFinish) {
      return;
    }

    stopAllPlayback();
  }, [status.didJustFinish, stopAllPlayback]);

  return (
    <View style={styles.screen}>
      <Header title="Sound DNA API" />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pickerWrap}>
          <Picker audioMetas={audioMetas} getValue={handleAudioMetaData} />
        </View>

        <View style={styles.panelGrid}>
          <View style={styles.panel}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelTitle}>Source DNA</Text>
              {audioSelectedDownloaded ? (
                <IconCustomButton
                  icon={isDNASoundPlaying ? "pause" : "play"}
                  iconColor="#4DD9FF"
                  size={24}
                  disabled={isLoading}
                  onPress={() => {
                    if (!downloadedAudioUri) {
                      return;
                    }

                    if (isDNASoundPlaying) {
                      stopAllPlayback();
                      return;
                    }

                    setPlaybackUri(downloadedAudioUri);
                    setIsDNASoundPlaying(true);
                    setIsImportedPlaying(false);
                    setIsConvertedPlaying(false);
                  }}
                />
              ) : audioSelected ? (
                <IconCustomButton
                  icon={isLoading ? "loading" : "download"}
                  iconColor="#FF7A3D"
                  size={24}
                  disabled={isLoading}
                  onPress={handleDownloadAudio}
                />
              ) : null}
            </View>

            <View style={styles.metaGrid}>
              <Text style={styles.metaRow}>Audio Name: {audioSelected?.audioName || "-"}</Text>
              <Text style={styles.metaRow}>BPM: {audioSelected?.tempoBpm || "-"}</Text>
              <Text style={styles.metaRow}>
                Energy Level: {audioSelected?.energyLevel || "-"}
              </Text>
              <Text style={styles.metaRow}>Tone: {audioSelected?.tone || "-"}</Text>
              <Text style={styles.metaRow}>Mood: {audioSelected?.mood || "-"}</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelTitle}>Target Audio</Text>
              {importedAudio?.name ? (
                <IconCustomButton
                  icon={isImportedPlaying ? "pause" : "play"}
                  iconColor="#4DD9FF"
                  size={24}
                  disabled={isLoading}
                  onPress={() => {
                    if (!importedAudio?.uri) {
                      return;
                    }

                    if (isImportedPlaying) {
                      stopAllPlayback();
                      return;
                    }

                    setPlaybackUri(importedAudio.uri);
                    setIsImportedPlaying(true);
                    setIsDNASoundPlaying(false);
                    setIsConvertedPlaying(false);
                  }}
                />
              ) : null}
            </View>

            <Pressable
              onPress={handlePickAudio}
              testID="target-audio-picker"
              disabled={isLoading}
              style={[
                styles.uploadZone,
                importedAudio?.name
                  ? styles.uploadZoneFilled
                  : styles.uploadZoneEmpty,
              ]}
            >
              <IconCustomButton
                icon="upload"
                iconColor="#FF7A3D"
                disabled={isLoading}
                size={importedAudio?.name ? 24 : 34}
              />

              <Text style={styles.uploadTitle}>
                {importedAudio?.name ? "Audio Selected" : "Import Audio"}
              </Text>

              {importedAudio?.name ? (
                <Text style={styles.uploadSubtitle} numberOfLines={2}>
                  {importedAudio.name}
                </Text>
              ) : (
                <Text style={styles.uploadSubtitle}>Tap to choose a target track</Text>
              )}
            </Pressable>
          </View>
        </View>

        {showAdjustments ? (
          <View style={styles.adjustSection}>
            <Text style={styles.sectionTitle}>Adjustment Controls</Text>

            <Text style={styles.sliderLabel}>Pitch Shift (semitones)</Text>
            <Slider
              minimumValue={sliderRanges.pitchShiftSemitones.min}
              maximumValue={sliderRanges.pitchShiftSemitones.max}
              value={sliderValues.pitchShiftSemitones}
              onValueChange={(value) =>
                setSliderValues((prev) => ({
                  ...prev,
                  pitchShiftSemitones: value,
                }))
              }
              step={0.1}
              disabled={isLoading}
              minimumTrackTintColor="#4DD9FF"
              maximumTrackTintColor="#2A344B"
              thumbTintColor="#FF7A3D"
            />

            <Text style={styles.sliderLabel}>Target BPM</Text>
            <Slider
              minimumValue={sliderRanges.bpm.min}
              maximumValue={sliderRanges.bpm.max}
              value={sliderValues.bpm}
              onValueChange={(value) =>
                setSliderValues((prev) => ({
                  ...prev,
                  bpm: value,
                }))
              }
              step={1}
              disabled={isLoading}
              minimumTrackTintColor="#4DD9FF"
              maximumTrackTintColor="#2A344B"
              thumbTintColor="#FF7A3D"
            />

            <Text style={styles.sliderLabel}>Gain (dB)</Text>
            <Slider
              minimumValue={sliderRanges.gainDb.min}
              maximumValue={sliderRanges.gainDb.max}
              value={sliderValues.gainDb}
              onValueChange={(value) =>
                setSliderValues((prev) => ({
                  ...prev,
                  gainDb: value,
                }))
              }
              step={0.1}
              disabled={isLoading}
              minimumTrackTintColor="#4DD9FF"
              maximumTrackTintColor="#2A344B"
              thumbTintColor="#FF7A3D"
            />

            {convertedAudioUri ? (
              <View style={styles.convertedWrap}>
                <Text style={styles.convertedTitle}>Converted Audio</Text>
                <View style={styles.convertedActionsRow}>
                  <IconCustomButton
                    icon={isConvertedPlaying ? "pause" : "play"}
                    iconColor="#4DD9FF"
                    size={24}
                    disabled={isLoading}
                    onPress={() => {
                      if (isConvertedPlaying) {
                        stopAllPlayback();
                        return;
                      }

                      setPlaybackUri(convertedAudioUri);
                      setIsConvertedPlaying(true);
                      setIsImportedPlaying(false);
                      setIsDNASoundPlaying(false);
                    }}
                  />

                  <IconCustomButton
                    icon={isSharing ? "loading" : "share-variant"}
                    iconColor="#4DD9FF"
                    size={24}
                    disabled={isLoading}
                    onPress={isSharing ? undefined : handleShareConvertedAudio}
                  />
                </View>

                <CustomButton
                  title={isLoading ? "Re-Applying DNA..." : "Re-Apply DNA"}
                  onPress={handleReConversion}
                  disabled={isLoading || !hasChangesSinceLastApply}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {isImportSelected && audioSelectedDownloaded ? (
          <CustomButton
            title={isLoading ? "Converting..." : "Apply DNA"}
            onPress={handleConversion}
            disabled={isLoading}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#09111E",
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 14,
  },
  pickerWrap: {
    borderRadius: 14,
    backgroundColor: "#111C30",
    borderWidth: 1,
    borderColor: "#1F2E46",
    padding: 10,
  },
  panelGrid: {
    gap: 12,
  },
  panel: {
    backgroundColor: "#111C30",
    borderWidth: 1,
    borderColor: "#1F2E46",
    borderRadius: 16,
    padding: 12,
    minHeight: 210,
    gap: 12,
  },
  panelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  panelTitle: {
    color: "#F2F6FF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  metaGrid: {
    backgroundColor: "#0B1627",
    borderWidth: 1,
    borderColor: "#1D2B42",
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  metaRow: {
    color: "#D6E2F5",
    fontSize: 13,
    lineHeight: 18,
  },
  uploadZone: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 16,
    gap: 6,
    minHeight: 132,
  },
  uploadZoneEmpty: {
    backgroundColor: "#0B1627",
    borderColor: "#2A3A56",
  },
  uploadZoneFilled: {
    backgroundColor: "#102037",
    borderColor: "#35547A",
  },
  uploadTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  uploadSubtitle: {
    color: "#9CB0CC",
    fontSize: 12,
    textAlign: "center",
  },
  adjustSection: {
    backgroundColor: "#111C30",
    borderWidth: 1,
    borderColor: "#1F2E46",
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: "#F2F6FF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  sliderLabel: {
    color: "#D6E2F5",
    fontSize: 13,
    marginTop: 6,
  },
  convertedWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1F2E46",
    gap: 10,
  },
  convertedTitle: {
    color: "#F2F6FF",
    fontSize: 15,
    fontWeight: "700",
  },
  convertedActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
