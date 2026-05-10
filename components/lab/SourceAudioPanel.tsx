import React from "react";
import { Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Waveform from "@/components/ui/Waveform";
import IconCustomButton from "@/components/ui/IconButton";
import { SoundProfile } from "@/types";
import { labPageStyles } from "@/styles/styles";

type SourceAudioPanelProps = {
  audioSelected: SoundProfile | null;
  audioSelectedDownloaded: boolean;
  downloadedAudioUri: string | null;
  isDNASoundPlaying: boolean;
  isLoading: boolean;
  isWideLayout: boolean;
  onDownload: () => void;
  onStopPlayback: () => void;
  onPlaySource: (uri: string) => void;
};

export default function SourceAudioPanel({
  audioSelected,
  audioSelectedDownloaded,
  downloadedAudioUri,
  isDNASoundPlaying,
  isLoading,
  isWideLayout,
  onDownload,
  onStopPlayback,
  onPlaySource,
}: SourceAudioPanelProps) {
  return (
    <View
      style={[
        labPageStyles.panel,
        isWideLayout ? labPageStyles.panelWide : null,
      ]}
    >
      <View style={labPageStyles.panelHeaderRow}>
        <Text style={labPageStyles.panelTitle}>Source DNA</Text>
        {audioSelectedDownloaded ? (
          <View style={labPageStyles.playbackCluster}>
            <Waveform active={isDNASoundPlaying} />
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
                  onStopPlayback();
                  return;
                }

                onPlaySource(downloadedAudioUri);
              }}
            />
          </View>
        ) : audioSelected ? (
          isLoading ? (
            <ActivityIndicator
              animating={true}
              color="#FF7A3D"
              size="small"
              hidesWhenStopped={true}
            />
          ) : (
            <IconCustomButton
              icon="download"
              iconColor="#FF7A3D"
              size={24}
              onPress={onDownload}
            />
          )
        ) : null}
      </View>

      <View style={labPageStyles.metaGrid}>
        <Text style={labPageStyles.metaRow}>
          Audio Name: {audioSelected?.audioName || "-"}
        </Text>
        <Text style={labPageStyles.metaRow}>
          BPM: {audioSelected?.tempoBpm || "-"}
        </Text>
        <Text style={labPageStyles.metaRow}>
          Energy Level: {audioSelected?.energyLevel || "-"}
        </Text>
        <Text style={labPageStyles.metaRow}>
          Tone: {audioSelected?.tone || "-"}
        </Text>
        <Text style={labPageStyles.metaRow}>
          Mood: {audioSelected?.mood || "-"}
        </Text>
      </View>
    </View>
  );
}
