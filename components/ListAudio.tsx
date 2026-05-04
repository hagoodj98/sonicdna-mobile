import React from "react";
import { View, Text } from "react-native";
import IconButton from "./ui/IconButton";
import { AudioDraft } from "@/types";
import { File } from "expo-file-system";

type ListAudioProps = {
  playAudio: (audio: AudioDraft) => void;
  currentSound?: string | null;
  audioDrafts?: AudioDraft[]; // Optional prop to pass audio drafts directly
  setAudioDrafts?: React.Dispatch<React.SetStateAction<AudioDraft[]>>; // Optional prop to pass the setAudioDrafts function directly
  uploadAudio: (audio: AudioDraft) => void; // Optional prop to pass the uploadAudio function directly
};

const ListAudio = ({
  playAudio,
  currentSound,
  uploadAudio,
  audioDrafts: propAudioDrafts,
  setAudioDrafts: propSetAudioDrafts,
}: ListAudioProps) => {
  const drafts = propAudioDrafts; // Use the prop if provided, otherwise use the hook's state
  const setDrafts = propSetAudioDrafts; // Use the prop if provided, otherwise use the hook's state
  const handlePlayAudio = (audio: AudioDraft) => {
    playAudio(audio);
  };
  const handleUploadAudio = (audio: AudioDraft) => {
    uploadAudio(audio);
  };

  return (
    <View>
      {drafts?.map((audio) => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          key={audio.id}
        >
          <Text>{audio.label}</Text>
          <IconButton
            icon={currentSound === audio.id ? "pause" : "play"} // Change the icon based on the isPlaying state of the audio draft
            size={20}
            onPress={() => {
              handlePlayAudio(audio); // Call the function to play the selected audio draft when the play/pause button is pressed
            }}
          />
          <IconButton
            icon="upload"
            size={20}
            onPress={() => {
              // Implement the logic to upload the audio draft to the server here
              // You can use the localUri of the audio draft to access the file and upload it using your preferred method (e.g., fetch, axios, etc.)
              handleUploadAudio(audio); // Call the function to upload the selected audio draft
            }}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => {
              //remove audio draft from in-memory state and delete the file from the audioRecordings directory

              const fileToDelete = new File(audio.localUri);
              fileToDelete.delete(); // Delete the audio file from the audioRecordings directory
              // Update the in-memory drafts state to remove the deleted audio draft
              setDrafts?.((prevDrafts) =>
                prevDrafts.filter((draft) => draft.id !== audio.id),
              );
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default ListAudio;
