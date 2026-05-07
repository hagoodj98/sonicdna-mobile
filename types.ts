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
