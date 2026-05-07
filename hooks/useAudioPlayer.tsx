import { useEffect, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

export const useAudioPlayerControl = (initialPlaybackUri: string | null) => {
  // State to hold the ID of the currently playing sound
  const [playbackUri, setPlaybackUri] = useState<string | null>(
    initialPlaybackUri,
  );
  const player = useAudioPlayer(playbackUri);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (!playbackUri) {
      player.pause();
      return;
    }

    try {
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  }, [playbackUri, player]);

  return {
    player,
    setPlaybackUri,
    status,
    playbackUri,
  };
};
