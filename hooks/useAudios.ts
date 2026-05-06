import { useCallback, useEffect, useState } from "react";
import API_ENDPOINTS from "../config/api";
import { Directory, Paths } from "expo-file-system";
import {
  AudioDraft,
  AudioElement,
  AudioUploadFileType,
  SoundProfileMeta,
} from "../types";

export const useAudios = () => {
  const [audioMetas, setAudioMetas] = useState<SoundProfileMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [audioDrafts, setAudioDrafts] = useState<AudioDraft[]>([]); //in memory drafts of audio files that haven't been submitted yet
  const [audioRecordingDraftsDir, setAudioRecordingDraftsDir] =
    useState<Directory | null>(null);
  const getAudios = useCallback(async () => {
    setLoading(true);
    // Fetch audio elements from the API
    const response = await fetch(`${API_ENDPOINTS.GET_AUDIO}`);

    const audioElements: { audioFiles: SoundProfileMeta[] } =
      await response.json();
    console.log(audioElements.audioFiles);

    setAudioMetas(audioElements.audioFiles);
    setLoading(false);
  }, []);

  const addAudio = useCallback((audio: SoundProfileMeta) => {
    setAudioMetas((prevAudioMetas) => [...prevAudioMetas, audio]);
  }, []);

  const removeAudio = useCallback((audio: SoundProfileMeta) => {
    setAudioMetas((prevAudioMetas) =>
      prevAudioMetas.filter((a) => a !== audio),
    );
  }, []);
  const removeAudioDraft = useCallback(
    async (audioId: string) => {
      const files = await audioRecordingDraftsDir?.list();
      const audioFile = files?.find((file) => file.name === audioId);
      if (audioFile) {
        await audioFile.delete(); // Delete the audio file from the file system
      }
      setAudioDrafts(
        (prevAudioDrafts) =>
          prevAudioDrafts?.filter((draft) => draft.id !== audioId) || [],
      );
    },
    [audioRecordingDraftsDir],
  );
  const uploadAudio = useCallback(
    async (uriToUpload: string, titleAudioFile: string, audio: AudioDraft) => {
      try {
        const formData = new FormData();
        formData.append("audio", {
          uri: uriToUpload, // Set the URI of the recorded audio file
          name: titleAudioFile, // Set a name for the audio file
          type: "audio/m4a", // Set the MIME type of the audio file
        } as AudioUploadFileType); // Append the recorded audio file to the form data

        const response = await fetch(`${API_ENDPOINTS.UPLOAD_AUDIO}`, {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to upload audio: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Audio uploaded successfully:", result);
        removeAudioDraft(audio.id); // Remove the audio draft from the in-memory state after successful upload
      } catch (error) {
        console.error("Error uploading audio:", error);
      }
    },
    [removeAudioDraft],
  );
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
      setAudioRecordingDraftsDir(audioRecordingsDir);
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
    audioMetas,
    addAudio,
    removeAudio,
    getAudios,
    uploadAudio,
    audioRecordingDraftsDir,
    loading,
    audioDrafts,
    setAudioDrafts,
  };
};
