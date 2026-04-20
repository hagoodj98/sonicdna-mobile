import React from "react";
import { render, screen } from "@testing-library/react-native";
import ListAudio from "../components/ListAudio";
import { useAudios } from "@/hooks/useAudios";

jest.mock("@/hooks/useAudios", () => ({
  useAudios: jest.fn(),
}));

describe("ListAudio", () => {
  const useAudiosMock = jest.mocked(useAudios);

  beforeEach(() => {
    useAudiosMock.mockReset();
  });

  it("renders all audio files returned by the hook", () => {
    const audioFiles = ["kick.wav", "snare.wav", "hat.wav"];

    useAudiosMock.mockReturnValue({
      audioFiles,
      addAudio: jest.fn(),
      removeAudio: jest.fn(),
      getAudios: jest.fn(),
      loading: false,
    });

    render(<ListAudio />);

    audioFiles.forEach((audioFile) => {
      expect(screen.getByText(audioFile)).toBeTruthy();
    });
  });
});
