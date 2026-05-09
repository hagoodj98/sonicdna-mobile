import {
  useAudioRecorder,
  RecordingPresets,
  useAudioRecorderState,
} from "expo-audio";
import { useAudios } from "./useAudios";
import { File } from "expo-file-system";
import { Alert } from "react-native";
import { MAX_AUDIO_FILE_SIZE_BYTES } from "@/utils/inputValidation";

const MAX_RECORDING_DURATION_MS = 20_000;

export const useAudioRecorderHook = () => {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // Set the audio module to active so it can record and play audio
  const recorderState = useAudioRecorderState(audioRecorder);

  const { audioRecordingDraftsDir } = useAudios(); // Use the custom hook to get audio data and loading state

  const startRecording = async () => {
    await audioRecorder.prepareToRecordAsync(); // Prepare the audio recorder to start recording
    await audioRecorder.record(); // Start recording audio
  };
  const stopRecording = async (ignoreRecording?: boolean) => {
    await audioRecorder.stop(); // Stop recording audio
    if (ignoreRecording) {
      Alert.alert("Recordings are limited to 20 seconds."); // Alert the user that the recording has been automatically stopped because it exceeded the duration limit of 20 seconds and provide an OK button to dismiss the alert
      return false; // Return false to indicate that the recording was ignored and should not be processed further
    }

    const audioURI = audioRecorder.uri; // Get the URI of the recorded audio file
    //send audio file via expo-file-system

    if (audioURI) {
      try {
        const audioFile = new File(audioURI); // Create a File object from the recorded audio URI
        const renameAudioFile = `recording-${Date.now()}.m4a`; // Generate a unique name using a timestamp to avoid collisions with existing files
        audioFile.rename(renameAudioFile); // Rename the recorded audio file before moving it

        if (audioRecordingDraftsDir) {
          // Move the recorded audio file to the audioRecordings directory for better organization and to ensure it is stored in a consistent location for later retrieval and submission
          audioFile.move(audioRecordingDraftsDir);
        }

        if (
          typeof audioFile.size === "number" &&
          audioFile.size > MAX_AUDIO_FILE_SIZE_BYTES
        ) {
          audioFile.delete();
          Alert.alert("Recording too large", "Please keep recordings under 1MB.");
          return false;
        }

        return audioFile; // Return the new name of the audio file for use in the UI or for uploading
      } catch (error) {
        console.error("Error handling audio file:", error);
      }
    }
  };

  return { recorderState, startRecording, stopRecording, MAX_RECORDING_DURATION_MS };
};
