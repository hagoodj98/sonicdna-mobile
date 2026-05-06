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
      return;
    }

    player.seekTo(0);
    player.play();
  }, [playbackUri, player]);

  return {
    player,
    setPlaybackUri,
    status,
    playbackUri,
  };
};
