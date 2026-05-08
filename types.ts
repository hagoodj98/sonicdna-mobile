import { useAudioPlayer } from "expo-audio";

export type AudioElement = {
  audioFiles: string[];
};
export type AudioDraft = {
  label?: string;
  id: string;
  localUri: string;
  timestamp: number;
  status: string;
  duration: number;
  isPlaying?: boolean;
};
export type AudioUploadFileType = Blob & {
  uri: string;
  name: string;
  type: string;
};

export type AudioPlayerContextType = {
  currentSound: string | null;
  setCurrentSound: (soundId: string | null) => void;
  player: ReturnType<typeof useAudioPlayer>;
  setPlaybackUri: (uri: string | null) => void;
};
export type SoundProfile = {
  audioFileId: string;
  tempoBpm: number;
  estimatedPitchHz: number;
  energy?: number;
  audioName: string;
  energyLevel?: string;
  tempoLabel?: string;
  tone?: string;
  mood?: string;
};
export type PickerDocfileType = {
  name: string;
  uri: string;
  mimeType: string;
  size: number;
};

export type ConversionPlan = {
  tempoRatio: number;
  pitchShiftSemitones: number;
  gainDb: number;
  targetBPM: number;
  minTempoBpm: number;
  maxTempoBpm: number;
  minPitchShiftSemitones: number;
  maxPitchShiftSemitones: number;
  minGainDb: number;
  maxGainDb: number;
};

export type SliderRange = Pick<
  ConversionPlan,
  "tempoRatio" | "pitchShiftSemitones" | "gainDb"
>;
export type ConvertAudioResponse = {
  message: string;
  convertedAudioUri: string | null;
  conversionPlan: ConversionPlan;
};
