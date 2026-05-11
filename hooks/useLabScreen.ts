import { useAudioPlayerControl } from "@/hooks/useAudioPlayer";
import { useAudios } from "@/hooks/useAudios";
import { PickerDocfileType, SliderValues, SoundProfile } from "@/types";
import { validateImportedAudioFileSchema } from "@/utils/inputValidation";
import { Directory, File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { Alert, Animated } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

export const sliderRanges = {
  bpm: { min: 40, max: 180 },
  gainDb: { min: -12, max: 12 },
  pitchShiftSemitones: { min: -12, max: 12 },
};

const initialSliderValues: SliderValues = {
  bpm: 0,
  gainDb: 0,
  pitchShiftSemitones: 0,
};

const getAppliedSliderValues = (
  targetBPM: number,
  pitchShiftSemitones: number,
  gainDb: number,
): SliderValues => ({
  bpm: targetBPM,
  pitchShiftSemitones,
  gainDb,
});

export function useLabScreen() {
  const adjustmentsAnim = useRef(new Animated.Value(0)).current;

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

  const {
    audioMetas,
    reConvertAudio,
    resolveAudioUri,
    downloadAudio,
    convertAudio,
    getAudios,
  } = useAudios();
  const { setPlaybackUri, status } = useAudioPlayerControl(null);

  const hasChangesSinceLastApply =
    lastAppliedSliderValues === null ||
    sliderValues.bpm !== lastAppliedSliderValues.bpm ||
    sliderValues.pitchShiftSemitones !==
      lastAppliedSliderValues.pitchShiftSemitones ||
    sliderValues.gainDb !== lastAppliedSliderValues.gainDb;

  const showAdjustments =
    isCoversionResultVisible || isReConversionResultVisible;

  const sourceStatus = audioSelectedDownloaded
    ? "Ready"
    : audioSelected
      ? "Selected"
      : "Missing";
  const targetStatus = importedAudio?.name ? "Ready" : "Missing";
  const outputStatus = convertedAudioUri ? "Ready" : "Waiting";

  const stopAllPlayback = useCallback(() => {
    setPlaybackUri(null);
    setIsImportedPlaying(false);
    setIsDNASoundPlaying(false);
    setIsConvertedPlaying(false);
  }, [setPlaybackUri]);

  const handlePickAudio = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }
      // We only allow picking one file, so we take the first one from the assets array
      const selectedAudio = result.assets[0];
      // Validate the selected audio file's metadata
      validateImportedAudioFileSchema.parse({
        originalname: selectedAudio.name || "",
        mimetype: selectedAudio.mimeType || "",
        size: selectedAudio.size || 0,
      });

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
      if (error instanceof z.ZodError) {
        Alert.alert(
          "Invalid imported audio",
          error.issues[0]?.message || "Please choose a valid audio file.",
        );
        return;
      }

      console.error("Error picking audio file:", error);
    }
  }, []);

  const handleConversion = useCallback(async () => {
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

      const appliedValues = getAppliedSliderValues(
        conversionResult.conversionPlan.targetBPM,
        conversionResult.conversionPlan.pitchShiftSemitones,
        conversionResult.conversionPlan.gainDb,
      );

      setSliderValues(appliedValues);
      setLastAppliedSliderValues(appliedValues);
      setImportedTempoBpm(conversionResult.conversionPlan.importedTempoBpm);
    } finally {
      setIsLoading(false);
    }
  }, [
    audioSelected?.audioFileId,
    audioSelectedDownloaded,
    convertAudio,
    importedAudio,
    isImportSelected,
  ]);

  const handleAudioMetaData = useCallback(
    (value: string | null) => {
      const selectedMeta = audioMetas.find(
        (meta) => meta.audioFileId === value,
      );
      if (!selectedMeta) {
        setAudioSelected(null);
        setAudioSelectedDownloaded(false);
        return;
      }

      setAudioSelected(selectedMeta);
    },
    [audioMetas],
  );

  const handleDownloadAudio = useCallback(async () => {
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
  }, [audioSelected?.audioFileId, downloadAudio]);

  const handleReConversion = useCallback(async () => {
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

      const reAppliedValues = getAppliedSliderValues(
        reConversionResult.conversionPlan.targetBPM,
        reConversionResult.conversionPlan.pitchShiftSemitones,
        reConversionResult.conversionPlan.gainDb,
      );

      setSliderValues(reAppliedValues);
      setLastAppliedSliderValues(reAppliedValues);
      setConvertedAudioUri(reConversionResult.convertedAudioUri);
    } finally {
      setIsLoading(false);
    }
  }, [
    audioSelected?.audioFileId,
    audioSelectedDownloaded,
    importedAudio,
    importedTempoBpm,
    isImportSelected,
    reConvertAudio,
    sliderValues.bpm,
    sliderValues.gainDb,
    sliderValues.pitchShiftSemitones,
  ]);

  const handleShareConvertedAudio = useCallback(async () => {
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
      const resolvedUrl = resolveAudioUri(convertedAudioUri);
      if (!resolvedUrl) {
        Alert.alert("No converted audio available to share");
        return;
      }

      const sharedAudioDir = new Directory(Paths.cache, "shared-audio");
      if (!sharedAudioDir.exists) {
        sharedAudioDir.create({ idempotent: true, intermediates: true });
      }

      for (const cachedFile of sharedAudioDir.list()) {
        cachedFile.delete();
      }

      const fileExtension = resolvedUrl?.toLowerCase().includes(".wav")
        ? "wav"
        : "m4a";
      const destinationFile = new File(
        sharedAudioDir,
        `sound-dna-converted.${fileExtension}`,
      );

      const shareUri =
        /^[a-z]+:\/\//i.test(resolvedUrl) && !resolvedUrl.startsWith("file://")
          ? (
              await File.downloadFileAsync(resolvedUrl, destinationFile, {
                idempotent: true,
              })
            ).uri
          : resolvedUrl;

      await Sharing.shareAsync(shareUri, {
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
  }, [convertedAudioUri, resolveAudioUri]);

  const handlePlaySource = useCallback(
    (uri: string) => {
      setPlaybackUri(uri);
      setIsDNASoundPlaying(true);
      setIsImportedPlaying(false);
      setIsConvertedPlaying(false);
    },
    [setPlaybackUri],
  );

  const handlePlayImported = useCallback(
    (uri: string) => {
      setPlaybackUri(uri);
      setIsImportedPlaying(true);
      setIsDNASoundPlaying(false);
      setIsConvertedPlaying(false);
    },
    [setPlaybackUri],
  );

  const handlePlayConverted = useCallback(
    (uri: string) => {
      setPlaybackUri(uri);
      setIsConvertedPlaying(true);
      setIsImportedPlaying(false);
      setIsDNASoundPlaying(false);
    },
    [setPlaybackUri],
  );

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

  useEffect(() => {
    Animated.timing(adjustmentsAnim, {
      toValue: showAdjustments ? 1 : 0,
      duration: showAdjustments ? 240 : 140,
      useNativeDriver: true,
    }).start();
  }, [adjustmentsAnim, showAdjustments]);

  const primaryActionTitle = isLoading
    ? lastAppliedSliderValues
      ? "Re-Applying DNA..."
      : "Converting..."
    : lastAppliedSliderValues
      ? "Re-Apply DNA"
      : "Apply DNA";

  const handlePrimaryAction = lastAppliedSliderValues
    ? handleReConversion
    : handleConversion;

  return {
    adjustmentsAnim,
    audioMetas,
    audioSelected,
    audioSelectedDownloaded,
    convertedAudioUri,
    downloadedAudioUri,
    handleAudioMetaData,
    handleDownloadAudio,
    handlePickAudio,
    handlePlayConverted,
    handlePlayImported,
    handlePlaySource,
    handlePrimaryAction,
    handleShareConvertedAudio,
    importedAudio,
    isConvertedPlaying,
    isDNASoundPlaying,
    isImportSelected,
    isImportedPlaying,
    isLoading,
    isSharing,
    outputStatus,
    primaryActionTitle,
    setSliderValues,
    showAdjustments,
    sliderValues,
    sourceStatus,
    stopAllPlayback,
    targetStatus,
    hasChangesSinceLastApply,
    lastAppliedSliderValues,
    refreshAudioMetas: getAudios,
  };
}
