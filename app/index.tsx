import { Alert, View, Text } from "react-native";
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
import { useAudios } from "@/hooks/useAudios";
import { AudioDraft } from "@/types";

export default function Index() {
  // Enable audio recording and playback
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // Set the audio module to active so it can record and play audio
  const recorderState = useAudioRecorderState(audioRecorder);
  const [currentAudioPlaying, setCurrentAudioPlaying] = useState<string | null>(
    null,
  ); // State to hold the URI of the recorded audio
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const [latestRecordedUri, setLatestRecordedUri] = useState<string | null>(
    null,
  );
  const { audioDrafts, setAudioDrafts } = useAudios(); // Use the custom hook to get audio data and loading state
  // create audio player for all recorded audio files using the useAudioPlayer hook from expo-audio and set the URI of the audio player to the recorded audio file
  const player = useAudioPlayer(playbackUri);
  // When the playbackUri state changes (i.e., when a new audio file is selected for playback), the useEffect hook will be triggered. Inside the useEffect, we check if there is a valid playbackUri. If there is, we seek the audio player to the beginning of the audio file (seekTo(0)) and then start playing the audio (play()). This ensures that whenever a new audio file is selected for playback, it will start playing from the beginning.
  useEffect(() => {
    if (!playbackUri) {
      return;
    }

    player.seekTo(0);
    player.play();
  }, [playbackUri, player]);

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
        const storedUri = audioFile.uri;
        setLatestRecordedUri(storedUri);

        setAudioDrafts((prevDrafts) => [
          ...prevDrafts,
          {
            id: audioFile.name,
            label: `recording-${prevDrafts.length + 1}`, // Set a label for the audio draft, you can customize this as needed
            localUri: storedUri,
            timestamp: Date.now(),
            status: "draft",
            duration: recorderState.durationMillis ?? 0,
          },
        ]); // Add the URI of the recorded audio to the in-memory drafts state for later submission
        //list files in the audioRecordings directory for debugging purposes
      } catch (error) {
        console.error("Error handling audio file:", error);
      }
    }
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

    if (!latestRecordedUri) {
      Alert.alert("No audio available", "Record audio before uploading.");
      return;
    }

    // Create a FormData object to hold the audio file data for submission
    const formData = new FormData();
    // Append the recorded audio file to the form data with the appropriate fields
    formData.append("audio", {
      uri: latestRecordedUri, // Set the URI of the recorded audio file
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
  const handleAudioPlayback = (audio: AudioDraft) => {
    if (currentAudioPlaying === audio.id) {
      player.pause();
      setCurrentAudioPlaying(null);
      return;
    }

    if (audio) {
      console.log(`Playing audio from URI: ${audio.localUri}`); // Log the audio URI for debugging purposes
      setCurrentAudioPlaying(audio.id); // Set the currentAudioPlaying state to the ID of the audio draft that is being played
      setPlaybackUri(audio.localUri);
    }
  };

  return (
    <View
      style={{
        padding: 20,
        marginTop: 50,
        borderColor: "black",
        borderWidth: 1,
        display: "flex",
        justifyContent: "flex-start",
        height: "95%",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Sound DNA</Text>

      <View style={{ borderWidth: 1, borderColor: "black", marginTop: 50 }}>
        <View style={{ backgroundColor: "lightgray", padding: 10 }}>
          <OffCanvas
            audioDrafts={audioDrafts}
            setAudioDrafts={setAudioDrafts}
            currentSound={currentAudioPlaying} // Pass the currentAudioPlaying state to the ListAudio component to determine which audio draft is currently playing
            playAudio={(audio) => handleAudioPlayback(audio)}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: "auto",
        }}
      >
        <CustomButton
          width="45%"
          title={recorderState.isRecording ? "Stop Recording" : "Record"}
          onPress={recorderState.isRecording ? stopRecording : startRecording}
        />

        <CustomButton
          width="45%"
          title="Upload"
          onPress={handleAudioSubmission}
        />
      </View>
    </View>
  );
}
