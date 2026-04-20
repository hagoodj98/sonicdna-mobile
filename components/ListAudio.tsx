import React from "react";
import { View, Text } from "react-native";
import { useAudios } from "@/hooks/useAudios";

const ListAudio = () => {
  const { audioFiles, loading } = useAudios(); // Use the custom hook to get audio data and loading state

  return (
    <View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        audioFiles.map((audio, index) => <Text key={index}>{audio}</Text>)
      )}
    </View>
  );
};

export default ListAudio;
