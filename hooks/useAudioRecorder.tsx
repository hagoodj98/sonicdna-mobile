import {
  useAudioRecorder,
  RecordingPresets,
  useAudioRecorderState,
} from "expo-audio";
import { useAudios } from "./useAudios";
import { File } from "expo-file-system";

export const useAudioRecorderHook = () => {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // Set the audio module to active so it can record and play audio
  const recorderState = useAudioRecorderState(audioRecorder);

  const { audioRecordingDraftsDir } = useAudios(); // Use the custom hook to get audio data and loading state

  const startRecording = async () => {
    await audioRecorder.prepareToRecordAsync(); // Prepare the audio recorder to start recording
    await audioRecorder.record(); // Start recording audio
  };
  const stopRecording = async () => {
    await audioRecorder.stop(); // Stop recording audio
    const audioURI = audioRecorder.uri; // Get the URI of the recorded audio file
    //send audio file via expo-file-system
    console.log("hello");

    if (audioURI) {
      try {
        const audioFile = new File(audioURI); // Create a File object from the recorded audio URI
        const renameAudioFile = `recording-${Date.now()}.m4a`; // Generate a unique name using a timestamp to avoid collisions with existing files
        audioFile.rename(renameAudioFile); // Rename the recorded audio file before moving it

        if (audioRecordingDraftsDir) {
          // Move the recorded audio file to the audioRecordings directory for better organization and to ensure it is stored in a consistent location for later retrieval and submission
          audioFile.move(audioRecordingDraftsDir);
        }
        return audioFile; // Return the new name of the audio file for use in the UI or for uploading
      } catch (error) {
        console.error("Error handling audio file:", error);
      }
    }
  };

  return { recorderState, startRecording, stopRecording };
};
