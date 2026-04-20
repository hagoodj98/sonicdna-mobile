import { useCallback, useEffect, useState } from "react";
import API_ENDPOINTS from "../config/api";

type AudioElement = {
  audioFiles: string[];
};

export const useAudios = () => {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
    const loadAudios = async () => {
      await getAudios();
    };
    loadAudios();
  }, [getAudios]);

  return { audioFiles, addAudio, removeAudio, getAudios, loading };
};
