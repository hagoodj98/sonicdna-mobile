import { Alert, View, Text } from "react-native";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  useAudioRecorderState,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import React, { use, useEffect, useState } from "react";
import API_ENDPOINTS from "../config/api";
import OffCanvas from "../components/ListAudio";
import CustomButton from "../components/ui/CustomButton";
import { File } from "expo-file-system";
import { useAudios } from "@/hooks/useAudios";
import { AudioDraft, AudioUploadFileType } from "@/types";
import ModalCustom from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { IconButton } from "react-native-paper";

export default function Index() {
  // Enable audio recording and playback
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // Set the audio module to active so it can record and play audio
  const recorderState = useAudioRecorderState(audioRecorder);
  const [currentAudioPlaying, setCurrentAudioPlaying] = useState<string | null>(
    null,
  ); // State to hold the URI of the recorded audio
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const { audioDrafts, setAudioDrafts, audioRecordingDraftsDir } = useAudios(); // Use the custom hook to get audio data and loading state
  const [uriToUpload, setUriToUpload] = useState<string | null>(null); // State to hold the URI of the audio file that is being uploaded
  const [isUploadAudioFilePlaying, setIsUploadAudioFilePlaying] =
    useState(false); // State to track if the audio file that is being uploaded is currently playing
  const [titleAudioFile, setTitleAudioFile] = useState(""); // State to hold the input value
  // create audio player for all recorded audio files using the useAudioPlayer hook from expo-audio and set the URI of the audio player to the recorded audio file

  const player = useAudioPlayer(playbackUri);
  const status = useAudioPlayerStatus(player);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the visibility of the off-canvas component

  // Start playback whenever a new URI is selected.
  useEffect(() => {
    if (!playbackUri) {
      return;
    }
    player.seekTo(0);
    player.play();
  }, [playbackUri, player]);

  useEffect(() => {
    // Reset the currentAudioPlaying state to null when playback finishes to update the UI and allow the user to play the audio draft again if they want to after it finishes playing
    if (status.didJustFinish) {
      setCurrentAudioPlaying(null); // Reset the currentAudioPlaying state to null when playback finishes
      setIsUploadAudioFilePlaying(false); // Reset the state to indicate that the audio file being uploaded is not playing when playback finishes
      setPlaybackUri(null); // Reset the playback URI to null when playback finishes to stop the audio player and reset it for the next time an audio draft is played or an audio file is uploaded and played in the modal for confirmation before submission
    }
  }, [status.didJustFinish]);

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

        const renameAudioFile = `recording-${Date.now()}.m4a`; // Generate a unique name using a timestamp to avoid collisions with existing files
        audioFile.rename(renameAudioFile); // Rename the recorded audio file before moving it

        if (audioRecordingDraftsDir) {
          // Move the recorded audio file to the audioRecordings directory for better organization and to ensure it is stored in a consistent location for later retrieval and submission
          audioFile.move(audioRecordingDraftsDir);
        }
        setAudioDrafts((prevDrafts) => [
          ...prevDrafts,
          {
            id: audioFile.name,
            label: audioFile.name, // Set a label for the audio draft, you can customize this as needed
            localUri: audioFile.uri,
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
  const handleAudioUpload = async (audio: AudioDraft) => {
    if (recorderState.isRecording) {
      await stopRecording(); // Stop recording if it's currently recording
    }
    if (!audio) {
      Alert.alert("No audio available", "Record audio before uploading.");
      return;
    }
    setIsModalOpen(true);
    setUriToUpload(audio.localUri); // Set the URI of the audio file that is being uploaded to the local URI of the selected audio draft so it can be used for submission when the user confirms the upload in the modal
  };
  const handleAudioPlayback = (audio?: AudioDraft, uriToUpload?: string) => {
    if (currentAudioPlaying === audio?.id) {
      player.pause();
      setCurrentAudioPlaying(null);
      //
      setPlaybackUri(null);
      return;
    }

    if (audio) {
      console.log(`Playing audio from URI: ${audio.localUri}`); // Log the audio URI for debugging purposes
      setCurrentAudioPlaying(audio.id); // Set the currentAudioPlaying state to the ID of the audio draft that is being played
      setPlaybackUri(audio.localUri);
    }
    if (uriToUpload) {
      if (isUploadAudioFilePlaying) {
        player.pause();
        setIsUploadAudioFilePlaying(false);
        return;
      }

      setPlaybackUri(uriToUpload); // Set the playback URI to the local URI of the audio draft that is being uploaded so it can be played back in the modal for confirmation before submission
      setIsUploadAudioFilePlaying(true); // Set the state to indicate that the audio file being uploaded is currently playing
    }
  };
  const handleAudioSubmission = async () => {
    // Implement the logic to upload the audio draft to the server here
    // You can use the localUri of the audio draft to access the file and upload it using your preferred method (e.g., fetch, axios, etc.)
    const formData = new FormData();
    // Append the recorded audio file to the form data with the appropriate fields
    formData.append("audio", {
      uri: uriToUpload, // Set the URI of the recorded audio file
      name: titleAudioFile, // Set a name for the audio file
      type: "audio/m4a", // Set the MIME type of the audio file
    } as AudioUploadFileType); // Append the recorded audio file to the form data

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
  useEffect(() => {
    if (!isModalOpen) {
      setIsUploadAudioFilePlaying(false); // Reset the state to indicate that the audio file being uploaded is not playing when the modal is closed
      setUriToUpload(null); // Reset the URI of the audio file that is being uploaded when the modal is closed
      setTitleAudioFile(""); // Reset the input value for the audio file name when the modal is closed
    }
  }, [isModalOpen]);

  return (
    <View>
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
              uploadAudio={(audio) => {
                handleAudioUpload(audio);
              }} // Pass the handleAudioSubmission function to the ListAudio component to allow uploading of audio drafts when the upload button is pressed
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
          {!isModalOpen && (
            <CustomButton
              width="45%"
              title={recorderState.isRecording ? "Stop Recording" : "Record"}
              onPress={
                recorderState.isRecording ? stopRecording : startRecording
              }
            />
          )}
        </View>
      </View>
      {isModalOpen && (
        <ModalCustom
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <Input
            value={titleAudioFile}
            onChangeText={setTitleAudioFile}
            style={{ marginBottom: 20 }}
          />
          {uriToUpload && (
            <>
              <Text style={{ marginBottom: 20 }}>
                Ready to upload: {uriToUpload.split("/").pop()}
              </Text>
              <IconButton
                icon={isUploadAudioFilePlaying ? "pause" : "play"} // Change the icon based on the isPlaying state of the audio draft
                size={20}
                onPress={() => {
                  handleAudioPlayback(undefined, uriToUpload); // Call the function to play the selected audio draft when the play button is pressed in the modal for confirmation before submission
                }}
              />
            </>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <CustomButton
              title="Upload"
              width="45%"
              onPress={handleAudioSubmission}
            />
            <CustomButton
              title="Cancel"
              onPress={() => setIsModalOpen(false)}
              width="45%"
              variant="secondary"
            />
          </View>
        </ModalCustom>
      )}
    </View>
  );
}
