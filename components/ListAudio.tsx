import React from "react";
import { View, Text } from "react-native";
import IconButton from "./ui/IconButton";
import { AudioDraft } from "@/types";
import { File } from "expo-file-system";

type ListAudioProps = {
  playAudio: (audio: AudioDraft) => void;
  currentSound?: string | null;
  audioStatus?: any; // Optional prop to pass the audio playback status directly
  audioDrafts?: AudioDraft[]; // Optional prop to pass audio drafts directly
  setAudioDrafts?: React.Dispatch<React.SetStateAction<AudioDraft[]>>; // Optional prop to pass the setAudioDrafts function directly
  uploadAudio: (audio: AudioDraft) => void; // Optional prop to pass the uploadAudio function directly
};

const ListAudio = ({
  playAudio,
  currentSound,
  uploadAudio,
  audioStatus,
  audioDrafts,
  setAudioDrafts: propSetAudioDrafts,
}: ListAudioProps) => {
  const setDrafts = propSetAudioDrafts; // Use the prop if provided, otherwise use the hook's state
  const handlePlayAudio = (audio: AudioDraft) => {
    playAudio(audio);
  };
  const handleUploadAudio = (audio: AudioDraft) => {
    uploadAudio(audio);
  };

  return (
    <View style={{ gap: 12 }}>
      {audioDrafts?.map((audio) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#161C2D",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#252D42",
            paddingVertical: 10,
            paddingHorizontal: 16,
            minHeight: 64,
          }}
          key={audio.id}
        >
          <Text
            style={{
              flex: 1,
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: "500",
            }}
            numberOfLines={1}
          >
            {audio.label}
          </Text>
          <IconButton
            icon={currentSound === audio.id ? "pause" : "play"}
            iconColor="#4DD9FF"
            size={26}
            onPress={() => {
              handlePlayAudio(audio);
            }}
          />
          <IconButton
            icon="upload"
            iconColor="#9B6BFF"
            size={26}
            onPress={() => {
              handleUploadAudio(audio);
            }}
          />
          <IconButton
            icon="delete"
            iconColor="#E05252"
            size={26}
            onPress={() => {
              const fileToDelete = new File(audio.localUri);
              fileToDelete.delete();
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
