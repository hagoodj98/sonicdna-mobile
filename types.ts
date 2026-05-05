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
