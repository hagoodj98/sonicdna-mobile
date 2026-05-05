import {
  Alert,
  View,
  Text,
  ScrollView,
  StatusBar,
  Pressable,
} from "react-native";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  useAudioRecorderState,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import React, { useEffect, useState } from "react";
import OffCanvas from "../components/ListAudio";
import CustomButton from "../components/ui/CustomButton";
import { File } from "expo-file-system";
import { useAudios } from "@/hooks/useAudios";
import { AudioDraft } from "@/types";
import ModalCustom from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { IconButton } from "react-native-paper";
import Header from "@/components/Header";

export default function Index() {
  // Enable audio recording and playback
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // Set the audio module to active so it can record and play audio
  const recorderState = useAudioRecorderState(audioRecorder);
  const [currentAudioPlaying, setCurrentAudioPlaying] = useState<string | null>(
    null,
  ); // State to hold the URI of the recorded audio
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const { audioDrafts, uploadAudio, setAudioDrafts, audioRecordingDraftsDir } =
    useAudios(); // Use the custom hook to get audio data and loading state
  const [uriToUpload, setUriToUpload] = useState<string | null>(null); // State to hold the URI of the audio file that is being uploaded
  const [isUploadAudioFilePlaying, setIsUploadAudioFilePlaying] =
    useState(false); // State to track if the audio file that is being uploaded is currently playing
  const [titleAudioFile, setTitleAudioFile] = useState(""); // State to hold the input value
  // create audio player for all recorded audio files using the useAudioPlayer hook from expo-audio and set the URI of the audio player to the recorded audio file

  const player = useAudioPlayer(playbackUri);
  const status = useAudioPlayerStatus(player);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the visibility of the off-canvas component
  const [isFormSubmitting, setIsFormSubmitting] = useState(false); // State to track if the form is currently being submitted to disable the upload button and prevent multiple submissions
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
  const handleAudioUploadModal = async (audio: AudioDraft) => {
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
        setPlaybackUri(null);
        return;
      }
      // Set the playback URI to the local URI of the audio draft that is being uploaded so it can be played back in the modal for confirmation before submission
      setPlaybackUri(uriToUpload);
      // Set the state to indicate that the audio file being uploaded is currently playing so that the play button in the modal can be updated to a pause button while it is playing and allow the user to pause it if they want to while previewing the audio before submission
      setIsUploadAudioFilePlaying(true);
    }
  };
  const handleAudioSubmission = async () => {
    setIsFormSubmitting(true); // Set the form submitting state to true to disable the upload button and prevent multiple submissions while the audio file is being uploaded
    if (uriToUpload && titleAudioFile) {
      const audioDraft = audioDrafts.find(
        (draft) => draft.localUri === uriToUpload,
      );
      if (audioDraft) {
        await uploadAudio(uriToUpload, titleAudioFile, audioDraft);
      }
    } else {
      Alert.alert(
        "Missing information",
        "Please provide both the audio file and a name before uploading.",
      ); // Alert the user if either the audio URI or the title is missing
      setIsFormSubmitting(false); // Set the form submitting state back to false after the upload is complete to re-enable the upload button for future submissions
      setIsModalOpen(false); // Close the modal after submission
    }
  };
  useEffect(() => {
    if (!isModalOpen) {
      setIsUploadAudioFilePlaying(false); // Reset the state to indicate that the audio file being uploaded is not playing when the modal is closed
      setUriToUpload(null); // Reset the URI of the audio file that is being uploaded when the modal is closed
      setTitleAudioFile(""); // Reset the input value for the audio file name when the modal is closed
    }
  }, [isModalOpen]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F1A" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F1A" />

      <Header title="Sound DNA API" />

      {/* Recording list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <OffCanvas
          audioDrafts={audioDrafts}
          setAudioDrafts={setAudioDrafts}
          currentSound={currentAudioPlaying}
          uploadAudio={(audio) => {
            handleAudioUploadModal(audio);
          }}
          playAudio={(audio) => handleAudioPlayback(audio)}
        />
      </ScrollView>

      {/* Bottom action bar */}
      {!isModalOpen && (
        <View
          style={{
            alignItems: "center",
            paddingBottom: 36,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: "#1E2739",
            gap: 8,
          }}
        >
          <Pressable
            onPress={recorderState.isRecording ? stopRecording : startRecording}
            style={({ pressed }) => ({
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: recorderState.isRecording
                ? "#7A1F1F"
                : "#3D2D8A",
              borderWidth: 3,
              borderColor: recorderState.isRecording ? "#E05252" : "#9B6BFF",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.75 : 1,
              shadowColor: recorderState.isRecording ? "#E05252" : "#9B6BFF",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 8,
            })}
          >
            <View
              style={{
                width: recorderState.isRecording ? 28 : 20,
                height: recorderState.isRecording ? 28 : 20,
                borderRadius: recorderState.isRecording ? 4 : 10,
                backgroundColor: recorderState.isRecording
                  ? "#E05252"
                  : "#FFFFFF",
              }}
            />
          </Pressable>
          <Text
            style={{
              color: recorderState.isRecording ? "#E05252" : "#8892A4",
              fontSize: 12,
              fontWeight: "600",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {recorderState.isRecording ? "Stop" : "Record"}
          </Text>
        </View>
      )}

      {isModalOpen && (
        <ModalCustom
          visible={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setPlaybackUri(null);
          }}
        >
          {/* Modal heading */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#FFFFFF",
              marginBottom: 4,
              alignSelf: "flex-start",
            }}
          >
            Save Recording
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#8892A4",
              marginBottom: 20,
              alignSelf: "flex-start",
            }}
          >
            Give your recording a name before uploading.
          </Text>

          {/* Audio preview row */}
          {uriToUpload && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#0B0F1A",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#252D42",
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginBottom: 20,
                width: "100%",
                gap: 10,
              }}
            >
              <IconButton
                icon={isUploadAudioFilePlaying ? "pause-circle" : "play-circle"}
                iconColor="#4DD9FF"
                size={32}
                onPress={() => {
                  handleAudioPlayback(undefined, uriToUpload);
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "500" }}
                  numberOfLines={1}
                >
                  {uriToUpload.split("/").pop()}
                </Text>
                <Text style={{ color: "#8892A4", fontSize: 12, marginTop: 2 }}>
                  {isUploadAudioFilePlaying ? "Playing…" : "Tap to preview"}
                </Text>
              </View>
            </View>
          )}

          {/* Name input */}
          <Text
            style={{
              color: "#8892A4",
              fontSize: 12,
              alignSelf: "flex-start",
              marginBottom: 4,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Recording name
          </Text>
          <Input
            value={titleAudioFile}
            readOnly={isFormSubmitting}
            onChangeText={setTitleAudioFile}
            style={{ marginBottom: 20, width: "100%" }}
          />

          {/* Action buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              width: "100%",
              marginTop: 8,
            }}
          >
            <CustomButton
              title={isFormSubmitting ? "Uploading…" : "Upload"}
              width="48%"
              onPress={handleAudioSubmission}
              disabled={isFormSubmitting}
            />
            <CustomButton
              title="Cancel"
              onPress={() => {
                setIsModalOpen(false);
                setPlaybackUri(null);
              }}
              width="48%"
              variant="secondary"
              disabled={isFormSubmitting}
            />
          </View>
        </ModalCustom>
      )}
    </View>
  );
}
