import React from "react";
import { Pressable, Text, View } from "react-native";
import Waveform from "@/components/ui/Waveform";
import IconCustomButton from "@/components/ui/IconButton";
import { PickerDocfileType } from "@/types";
import { labPageStyles } from "@/styles/styles";

type TargetAudioPanelProps = {
  importedAudio: PickerDocfileType | null;
  isImportedPlaying: boolean;
  isLoading: boolean;
  isWideLayout: boolean;
  onPickAudio: () => void;
  onStopPlayback: () => void;
  onPlayImported: (uri: string) => void;
};

export default function TargetAudioPanel({
  importedAudio,
  isImportedPlaying,
  isLoading,
  isWideLayout,
  onPickAudio,
  onStopPlayback,
  onPlayImported,
}: TargetAudioPanelProps) {
  return (
    <View
      style={[
        labPageStyles.panel,
        isWideLayout ? labPageStyles.panelWide : null,
      ]}
    >
      <View style={labPageStyles.panelHeaderRow}>
        <Text style={labPageStyles.panelTitle}>Target Audio</Text>
        {importedAudio?.name ? (
          <View style={labPageStyles.playbackCluster}>
            <Waveform active={isImportedPlaying} />
            <IconCustomButton
              icon={isImportedPlaying ? "pause" : "play"}
              iconColor="#4DD9FF"
              size={24}
              disabled={isLoading}
              onPress={() => {
                if (!importedAudio.uri) {
                  return;
                }

                if (isImportedPlaying) {
                  onStopPlayback();
                  return;
                }

                onPlayImported(importedAudio.uri);
              }}
            />
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={onPickAudio}
        testID="target-audio-picker"
        disabled={isLoading}
        style={[
          labPageStyles.uploadZone,
          importedAudio?.name
            ? labPageStyles.uploadZoneFilled
            : labPageStyles.uploadZoneEmpty,
        ]}
      >
        <IconCustomButton
          icon="upload"
          iconColor="#FF7A3D"
          disabled={isLoading}
          size={importedAudio?.name ? 24 : 34}
        />

        <Text style={labPageStyles.uploadTitle}>
          {importedAudio?.name ? "Audio Selected" : "Import Audio"}
        </Text>

        {importedAudio?.name ? (
          <Text style={labPageStyles.uploadSubtitle} numberOfLines={2}>
            {importedAudio.name}
          </Text>
        ) : (
          <Text style={labPageStyles.uploadSubtitle}>
            Tap to choose a target track
          </Text>
        )}
      </Pressable>
    </View>
  );
}
