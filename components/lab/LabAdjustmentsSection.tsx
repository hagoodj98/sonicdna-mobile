import React from "react";
import { Animated, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import Waveform from "@/components/ui/Waveform";
import IconCustomButton from "@/components/ui/IconButton";
import { SliderValues } from "@/types";
import { labPageStyles } from "@/styles/styles";

type LabAdjustmentsSectionProps = {
  adjustmentsAnim: Animated.Value;
  convertedAudioUri: string | null;
  isConvertedPlaying: boolean;
  isLoading: boolean;
  isSharing: boolean;
  sliderValues: SliderValues;
  sliderRanges: {
    bpm: { min: number; max: number };
    gainDb: { min: number; max: number };
    pitchShiftSemitones: { min: number; max: number };
  };
  onSliderValuesChange: React.Dispatch<React.SetStateAction<SliderValues>>;
  onShareConvertedAudio: () => void;
  onStopPlayback: () => void;
  onPlayConverted: (uri: string) => void;
};

export default function LabAdjustmentsSection({
  adjustmentsAnim,
  convertedAudioUri,
  isConvertedPlaying,
  isLoading,
  isSharing,
  sliderValues,
  sliderRanges,
  onSliderValuesChange,
  onShareConvertedAudio,
  onStopPlayback,
  onPlayConverted,
}: LabAdjustmentsSectionProps) {
  return (
    <Animated.View
      style={[
        labPageStyles.adjustSection,
        {
          opacity: adjustmentsAnim,
          transform: [
            {
              translateY: adjustmentsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={labPageStyles.sectionTitle}>Adjustment Controls</Text>

      <Text style={labPageStyles.sliderLabel}>Pitch Shift (semitones)</Text>
      <Text style={labPageStyles.sliderValue}>
        {sliderValues.pitchShiftSemitones.toFixed(1)} st
      </Text>
      <Slider
        minimumValue={sliderRanges.pitchShiftSemitones.min}
        maximumValue={sliderRanges.pitchShiftSemitones.max}
        value={sliderValues.pitchShiftSemitones}
        onValueChange={(value) =>
          onSliderValuesChange((prev) => ({
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

      <Text style={labPageStyles.sliderLabel}>Target BPM</Text>
      <Text style={labPageStyles.sliderValue}>
        {Math.round(sliderValues.bpm)} bpm
      </Text>
      <Slider
        minimumValue={sliderRanges.bpm.min}
        maximumValue={sliderRanges.bpm.max}
        value={sliderValues.bpm}
        onValueChange={(value) =>
          onSliderValuesChange((prev) => ({
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

      <Text style={labPageStyles.sliderLabel}>Gain (dB)</Text>
      <Text style={labPageStyles.sliderValue}>
        {sliderValues.gainDb.toFixed(1)} dB
      </Text>
      <Slider
        minimumValue={sliderRanges.gainDb.min}
        maximumValue={sliderRanges.gainDb.max}
        value={sliderValues.gainDb}
        onValueChange={(value) =>
          onSliderValuesChange((prev) => ({
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
        <View style={labPageStyles.convertedWrap}>
          <Text style={labPageStyles.convertedTitle}>Converted Audio</Text>
          <View style={labPageStyles.convertedActionsRow}>
            <View style={labPageStyles.convertedPlayCluster}>
              <Waveform active={isConvertedPlaying} />
              <IconCustomButton
                icon={isConvertedPlaying ? "pause" : "play"}
                iconColor="#4DD9FF"
                size={34}
                disabled={isLoading}
                onPress={() => {
                  if (isConvertedPlaying) {
                    onStopPlayback();
                    return;
                  }

                  onPlayConverted(convertedAudioUri);
                }}
              />
            </View>

            <IconCustomButton
              icon={isSharing ? "loading" : "share-variant"}
              iconColor="#4DD9FF"
              size={24}
              disabled={isLoading}
              onPress={isSharing ? undefined : onShareConvertedAudio}
            />
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
}
