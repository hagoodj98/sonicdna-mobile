import { useCallback, useEffect, useState } from "react";
import API_ENDPOINTS, { BASE_URL } from "../config/api";
import { Directory, File, Paths } from "expo-file-system";
import {
  AudioDraft,
  AudioUploadFileType,
  SoundProfile,
  PickerDocfileType,
  ReconvertRequestValues,
  ConvertAudioResponse,
} from "../types";
export const useAudios = () => {
  const [audioMetas, setAudioMetas] = useState<SoundProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [audioDrafts, setAudioDrafts] = useState<AudioDraft[]>([]); //in memory drafts of audio files that haven't been submitted yet
  const [audioRecordingDraftsDir, setAudioRecordingDraftsDir] =
    useState<Directory | null>(null);

  const resolveAudioUri = useCallback((uri: string | null | undefined) => {
    if (!uri) {
      return null;
    }

    if (/^[a-z]+:\/\//i.test(uri)) {
      return uri;
    }

    return `${BASE_URL}${uri.startsWith("/") ? uri : `/${uri}`}`;
  }, []);

  const getAudios = useCallback(async () => {
    setLoading(true);
    // Fetch audio elements from the API
    const response = await fetch(`${API_ENDPOINTS.GET_AUDIO_METADATA}`);

    const audioElements: { audioFiles: SoundProfile[] } = await response.json();
    console.log(audioElements.audioFiles);

    setAudioMetas(audioElements.audioFiles);
    setLoading(false);
  }, []);

  const addAudio = useCallback((audio: SoundProfile) => {
    setAudioMetas((prevAudioMetas) => [...prevAudioMetas, audio]);
  }, []);

  const removeAudio = useCallback((audio: SoundProfile) => {
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
  const downloadAudio = useCallback(async (audioFileId: string) => {
    try {
      if (!audioFileId) {
        return null;
      }

      const downloadsDir = new Directory(Paths.cache, "downloads");
      if (!downloadsDir.exists) {
        downloadsDir.create({ intermediates: true, idempotent: true });
      }

      // Keep the downloads cache lightweight by removing previous files before each new download.
      const cachedFiles = downloadsDir.list();
      for (const cachedFile of cachedFiles) {
        cachedFile.delete();
      }

      const sourceUrl = `${API_ENDPOINTS.DOWNLOAD_AUDIO}/${audioFileId}`;
      const fileName = `${audioFileId}.m4a`;
      const destinationFile = new File(downloadsDir, fileName);

      const downloadedFile = await File.downloadFileAsync(
        sourceUrl,
        destinationFile,
        { idempotent: true },
      );

      return downloadedFile.uri; // Return the local file URI of the downloaded audio file
    } catch (error) {
      console.error("Error downloading audio:", error);
      return null;
    }
  }, []);
  const convertAudio = useCallback(
    async (
      audioFileId: string,
      file: PickerDocfileType,
    ): Promise<ConvertAudioResponse | null> => {
      try {
        if (!audioFileId) {
          return null;
        }

        const sourceUrl = `${API_ENDPOINTS.CONVERT_AUDIO}/${audioFileId}`;

        const formData = new FormData();
        formData.append("audio", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
        } as AudioUploadFileType);

        const response = await fetch(sourceUrl, {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to convert audio: ${response.statusText}`);
        }

        const result = (await response.json()) as ConvertAudioResponse;
        result.convertedAudioUri = resolveAudioUri(result.convertedAudioUri);
        console.log("Audio converted successfully:", result);
        return result;
      } catch (error) {
        console.error("Error converting audio:", error);
        return null;
      }
    },
    [resolveAudioUri],
  );
  const reConvertAudio = useCallback(
    async (
      audioFileId: string,
      file: PickerDocfileType,
      sliderValues: ReconvertRequestValues,
    ): Promise<ConvertAudioResponse | null> => {
      try {
        if (!audioFileId) {
          return null;
        }

        const sourceUrl =
          `${API_ENDPOINTS.RECONVERT_AUDIO}/${audioFileId}` +
          `?targetBPM=${encodeURIComponent(sliderValues.targetBPM)}` +
          `&pitchShiftSemitones=${encodeURIComponent(sliderValues.pitchShiftSemitones)}` +
          `&gainDb=${encodeURIComponent(sliderValues.gainDb)}` +
          (sliderValues.importedTempoBpm !== undefined
            ? `&importedTempoBpm=${encodeURIComponent(sliderValues.importedTempoBpm)}`
            : ``);

        const formData = new FormData();
        formData.append("audio", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
        } as AudioUploadFileType);

        const response = await fetch(sourceUrl, {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to re-convert audio: ${response.statusText}`);
        }

        const result = (await response.json()) as ConvertAudioResponse;
        result.convertedAudioUri = resolveAudioUri(result.convertedAudioUri);
        console.log("Audio re-converted successfully:", result);
        return result;
      } catch (error) {
        console.error("Error re-converting audio:", error);
        return null;
      }
    },
    [resolveAudioUri],
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
    resolveAudioUri,
    removeAudio,
    getAudios,
    uploadAudio,
    setAudioMetas,
    convertAudio,
    reConvertAudio,
    downloadAudio,
    audioRecordingDraftsDir,
    loading,
    audioDrafts,
    setAudioDrafts,
  };
};
