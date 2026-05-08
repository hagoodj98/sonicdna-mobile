import Header from "@/components/Header";
import LabAdjustmentsSection from "../components/lab/LabAdjustmentsSection";
import LabHero from "../components/lab/LabHero";
import SourceAudioPanel from "../components/lab/SourceAudioPanel";
import TargetAudioPanel from "../components/lab/TargetAudioPanel";
import { View, ScrollView, useWindowDimensions } from "react-native";
import React from "react";
import CustomButton from "@/components/ui/CustomButton";
import Picker from "@/components/ui/Picker";
import { sliderRanges, useLabScreen } from "../hooks/useLabScreen";
import { labPageStyles } from "@/styles/styles";

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 900;
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
  } = useLabScreen();

  return (
    <View style={labPageStyles.screen}>
      <Header title="Sound DNA API" />

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
            onPlaySource={handlePlaySource}
          />

          <TargetAudioPanel
            importedAudio={importedAudio}
            isImportedPlaying={isImportedPlaying}
            isLoading={isLoading}
            isWideLayout={isWideLayout}
            onPickAudio={handlePickAudio}
            onStopPlayback={stopAllPlayback}
            onPlayImported={handlePlayImported}
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
            onPlayConverted={handlePlayConverted}
          />
        ) : null}

        {isImportSelected && audioSelectedDownloaded ? (
          <CustomButton
            title={primaryActionTitle}
            onPress={handlePrimaryAction}
            disabled={isLoading || !hasChangesSinceLastApply}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
