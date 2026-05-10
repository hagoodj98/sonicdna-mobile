import Header from "@/components/Header";
import LabAdjustmentsSection from "@/components/lab/LabAdjustmentsSection";
import LabHero from "@/components/lab/LabHero";
import SourceAudioPanel from "@/components/lab/SourceAudioPanel";
import TargetAudioPanel from "@/components/lab/TargetAudioPanel";
import { View, ScrollView, useWindowDimensions } from "react-native";
import React, { useCallback, useEffect } from "react";
import { setAudioModeAsync } from "expo-audio";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";
import CustomButton from "@/components/ui/CustomButton";
import Picker from "@/components/ui/Picker";
import { sliderRanges, useLabScreen } from "@/hooks/useLabScreen";
import { labPageStyles } from "@/styles/styles";

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 900;

  const configurePlaybackMode = useCallback(async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      allowsRecording: false,
      interruptionMode: "doNotMix",
    });
  }, []);

  const {
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
    refreshAudioMetas,
  } = useLabScreen();

  // Configure playback mode on mount and when screen comes into focus
  useEffect(() => {
    configurePlaybackMode();
  }, [configurePlaybackMode]);

  useFocusEffect(
    useCallback(() => {
      refreshAudioMetas();
    }, [refreshAudioMetas]),
  );

  // Wrap playback handlers to ensure audio mode is set correctly
  const handlePlaySourceWithMode = useCallback(
    (uri: string) => {
      configurePlaybackMode();
      handlePlaySource(uri);
    },
    [configurePlaybackMode, handlePlaySource],
  );

  const handlePlayImportedWithMode = useCallback(
    (uri: string) => {
      configurePlaybackMode();
      handlePlayImported(uri);
    },
    [configurePlaybackMode, handlePlayImported],
  );

  const handlePlayConvertedWithMode = useCallback(
    (uri: string) => {
      configurePlaybackMode();
      handlePlayConverted(uri);
    },
    [configurePlaybackMode, handlePlayConverted],
  );

  return (
    <View style={labPageStyles.screen}>
      <Header title="SonicDNA" />

      <ScrollView
        contentContainerStyle={labPageStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LabHero
          sourceStatus={sourceStatus}
          targetStatus={targetStatus}
          outputStatus={outputStatus}
        />

        <View style={labPageStyles.pickerWrap}>
          <Picker audioMetas={audioMetas} getValue={handleAudioMetaData} />
        </View>

        <View
          style={[
            labPageStyles.panelGrid,
            isWideLayout ? labPageStyles.panelGridWide : null,
          ]}
        >
          <SourceAudioPanel
            audioSelected={audioSelected}
            audioSelectedDownloaded={audioSelectedDownloaded}
            downloadedAudioUri={downloadedAudioUri}
            isDNASoundPlaying={isDNASoundPlaying}
            isLoading={isLoading}
            isWideLayout={isWideLayout}
            onDownload={handleDownloadAudio}
            onStopPlayback={stopAllPlayback}
            onPlaySource={handlePlaySourceWithMode}
          />

          <TargetAudioPanel
            importedAudio={importedAudio}
            isImportedPlaying={isImportedPlaying}
            isLoading={isLoading}
            isWideLayout={isWideLayout}
            onPickAudio={handlePickAudio}
            onStopPlayback={stopAllPlayback}
            onPlayImported={handlePlayImportedWithMode}
          />
        </View>

        {showAdjustments ? (
          <LabAdjustmentsSection
            adjustmentsAnim={adjustmentsAnim}
            convertedAudioUri={convertedAudioUri}
            isConvertedPlaying={isConvertedPlaying}
            isLoading={isLoading}
            isSharing={isSharing}
            sliderValues={sliderValues}
            sliderRanges={sliderRanges}
            onSliderValuesChange={setSliderValues}
            onShareConvertedAudio={handleShareConvertedAudio}
            onStopPlayback={stopAllPlayback}
            onPlayConverted={handlePlayConvertedWithMode}
          />
        ) : null}

        {isImportSelected && audioSelectedDownloaded ? (
          isLoading ? (
            <ActivityIndicator
              animating={true}
              color="#FF7A3D"
              size="large"
              hidesWhenStopped={true}
            />
          ) : (
            <CustomButton
              title={primaryActionTitle}
              onPress={handlePrimaryAction}
              disabled={!hasChangesSinceLastApply}
            />
          )
        ) : null}
      </ScrollView>
    </View>
  );
}
