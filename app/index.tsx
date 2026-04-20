import { Alert, Button, View } from "react-native";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  useAudioRecorderState,
  setAudioModeAsync,
  useAudioPlayer,
} from "expo-audio";
import { useEffect, useState } from "react";
import API_ENDPOINTS from "../config/api";
import OffCanvas from "../components/ListAudio";

export default function Index() {
  // Enable audio recording and playback
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // Set the audio module to active so it can record and play audio
  const recorderState = useAudioRecorderState(audioRecorder);
  const [audioURI, setAudioURI] = useState<string | null>(null); // State to hold the URI of the recorded audio

  const player = useAudioPlayer(
    audioURI, // Set the URI of the audio player to the recorded audio file
  );
  const startRecording = async () => {
    await audioRecorder.prepareToRecordAsync(); // Prepare the audio recorder to start recording
    await audioRecorder.record(); // Start recording audio
  };
  const stopRecording = async () => {
    await audioRecorder.stop(); // Stop recording audio
    const audioURI = audioRecorder.uri; // Get the URI of the recorded audio file
    setAudioURI(audioURI); // Update the state with the URI of the recorded audio
  };

  useEffect(() => {
    const requestPermissions = async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync(); // Request permission to access the microphone
      if (!status.granted) {
        Alert.alert(
          "Permission to access the microphone is required to use this app.",
        ); // Alert the user if permission is not granted
      }
      setAudioModeAsync({
        playsInSilentMode: true, // Allow audio to play even when the device is in silent mode
        shouldPlayInBackground: true, // Allow audio to play in the background
        allowsRecording: true, // Allow recording audio
        interruptionMode: "doNotMix", // Do not mix audio with other apps
      }); // Set the audio module to active so it can record and play audio
    };
    // Request permissions when the component mounts
    requestPermissions();
  }, []);
  const handleAudioSubmission = async () => {
    if (recorderState.isRecording) {
      await stopRecording(); // Stop recording if it's currently recording
    }
    // Create a FormData object to hold the audio file data for submission
    const formData = new FormData();
    // Append the recorded audio file to the form data with the appropriate fields
    formData.append("audio", {
      uri: audioURI, // Set the URI of the recorded audio file
      name: "recording.m4a", // Set a name for the audio file
      type: "audio/m4a", // Set the MIME type of the audio file
    } as any); // Append the recorded audio file to the form data

    // Here you can implement the logic to submit the audio file to your backend or process it as needed
    const response = await fetch(API_ENDPOINTS.SUBMIT_AUDIO, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data", // Set the content type to multipart/form-data for file upload because we are sending a file in the request body
      },
      body: formData, // Send the form data containing the audio file in the request body
    });

    alert(`Audio submitted successfully! Server response: ${response.status}`); // Alert the user that the audio was submitted successfully and show the server response status
  };
  const handleReplayAudio = async () => {
    if (audioURI) {
      console.log(`Playing audio from URI: ${audioURI}`); // Log the audio URI for debugging purposes
      player.seekTo(0);
      player.play(); // Play the recorded audio
    }
  };

  return (
    <View>
      <OffCanvas />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          title={
            recorderState.isRecording ? "Stop Recording" : "Start Recording"
          }
          onPress={recorderState.isRecording ? stopRecording : startRecording}
        />
        <Button title="replay" onPress={handleReplayAudio} />
        <Button title="Submit Audio" onPress={handleAudioSubmission} />
      </View>
    </View>
  );
}
