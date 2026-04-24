import { Alert, Button, View, Text } from "react-native";
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
import CustomButton from "../components/ui/CustomButton";
import { Directory, File, Paths } from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  // Enable audio recording and playback
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // Set the audio module to active so it can record and play audio
  const recorderState = useAudioRecorderState(audioRecorder);
  const [audioURI, setAudioURI] = useState<string | null>(null); // State to hold the URI of the recorded audio
  const [audioDrafts, setAudioDrafts] = useState<string[]>([]); //in memory drafts of audio files that haven't been submitted yet

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
    //send audio file via expo-file-system

    if (audioURI) {
      try {
        const audioFile = new File(audioURI); // Create a File object from the recorded audio URI

        //store metadata in async storage
        /*
        let audioMetadata = {
          id: `${Date.now()}`, // Generate a unique ID for the audio file using the current timestamp
          localUri: audioURI, // Store the URI of the recorded audio file
          timestamp: Date.now(), // Store the timestamp of when the audio was recorded
          status: "recorded", // Store the status of the audio file (e.g., "recorded", "submitted", etc.)
          duration: recorderState.durationMillis, // Store the duration of the recorded audio in milliseconds
        };
      

        await AsyncStorage.setItem(
          "lastAudioURI",
          JSON.stringify(audioMetadata),
        ); // Store the URI and timestamp of the recorded audio in AsyncStorage for later retrieval
  */
        const audioRecordingsDir = new Directory(
          Paths.cache,
          "audioRecordings",
        );

        audioFile.move(audioRecordingsDir); // Move the file to a new directory for better organization
        setAudioDrafts((prevDrafts) => [...prevDrafts, audioURI]); // Add the URI of the recorded audio to the in-memory drafts state for later submission
        //list files in the audioRecordings directory for debugging purposes
      } catch (error) {
        console.error("Error handling audio file:", error);
      }
    }

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
    const loadAudios = async () => {
      const audioRecordingsDir = new Directory(Paths.cache, "audioRecordings");
      const dirExists = audioRecordingsDir.exists;
      if (!dirExists) {
        await audioRecordingsDir.create(); // Create a directory for audio recordings if it doesn't exist
      }
      const files = await audioRecordingsDir.list(); // Read the contents of the audioRecordings directory
      const audioFiles = files.filter((file) => file.name.endsWith(".m4a")); // Filter the files to only include audio files with the .m4a extension
      setAudioDrafts(audioFiles.map((file) => file.uri)); // Update the in-memory drafts state with the URIs of the audio files in the audioRecordings directory
    };

    // Request permissions when the component mounts
    requestPermissions();
    loadAudios(); // Load existing audio files from the audioRecordings directory when the component mounts
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
    <View
      style={{
        justifyContent: "space-between",
        flex: 1,
        padding: 20,
        marginTop: 50,
      }}
    >
      <Text>Sound DNA</Text>
      {audioDrafts.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Audio Drafts:
          </Text>
          {audioDrafts.map((draftURI, index) => (
            <Text key={index}>{draftURI}</Text> // Display the URIs of the audio drafts for debugging purposes
          ))}
        </View>
      )}
      <View style={{ borderWidth: 1, borderColor: "black" }}>
        <View style={{ backgroundColor: "lightgray", padding: 10 }}>
          <OffCanvas />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: 20,
        }}
      >
        <CustomButton
          title={recorderState.isRecording ? "Stop Recording" : "Record"}
          onPress={recorderState.isRecording ? stopRecording : startRecording}
        />
        <CustomButton title="replay" onPress={handleReplayAudio} />
        <CustomButton title="Submit Audio" onPress={handleAudioSubmission} />
      </View>
    </View>
  );
}
