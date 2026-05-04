import { useCallback, useEffect, useState } from "react";
import API_ENDPOINTS from "../config/api";
import { Directory, Paths } from "expo-file-system";
import { AudioDraft, AudioElement } from "../types";

export const useAudios = () => {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [audioDrafts, setAudioDrafts] = useState<AudioDraft[]>([]); //in memory drafts of audio files that haven't been submitted yet
  const getAudios = useCallback(async () => {
    setLoading(true);
    // Fetch audio elements from the API
    const response = await fetch(`${API_ENDPOINTS.GET_AUDIO}`);

    const audioElements: AudioElement = await response.json();
    console.log(audioElements.audioFiles);

    setAudioFiles(audioElements.audioFiles);
    setLoading(false);
  }, []);

  const addAudio = useCallback((audio: string) => {
    setAudioFiles((prevAudioFiles) => [...prevAudioFiles, audio]);
  }, []);

  const removeAudio = useCallback((audio: string) => {
    setAudioFiles((prevAudioFiles) =>
      prevAudioFiles.filter((a) => a !== audio),
    );
  }, []);

  useEffect(() => {
    const loadAudioDrafts = async () => {
      const audioRecordingsDir = new Directory(Paths.cache, "audioRecordings");
      const dirExists = audioRecordingsDir.exists;
      if (!dirExists) {
        await audioRecordingsDir.create(); // Create a directory for audio recordings if it doesn't exist
      }
      const files = await audioRecordingsDir.list(); // Read the contents of the audioRecordings directory

      const audioFiles = files.filter((file) => file.name.endsWith(".m4a")); // Filter the files to only include audio files with the .m4a extension
      setAudioDrafts(
        audioFiles.map((file) => ({
          id: file.name,
          localUri: file.uri,
          label: file.name,
          timestamp: Date.now(),
          status: "draft",
          duration: 0, // You can update this with the actual duration if available
          isPlaying: false, // Initialize the isPlaying property to false
        })),
      ); // Update the in-memory drafts state with the URIs of the audio files in the audioRecordings directory
    };
    loadAudioDrafts();
  }, []);
  useEffect(() => {
    const loadAudios = async () => {
      await getAudios();
    };
    loadAudios();
  }, [getAudios]);

  return {
    audioFiles,
    addAudio,
    removeAudio,
    getAudios,
    loading,
    audioDrafts,
    setAudioDrafts,
  };
};
