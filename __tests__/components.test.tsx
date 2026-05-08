import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Text } from "react-native";
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import SoundCharacteristics from "@/components/SoundCharacteristics";
import Dashboard from "@/app/dashboard";
import * as DocumentPicker from "expo-document-picker";

const mockUseAudios = jest.fn();
const mockUseAudioPlayerControl = jest.fn();

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock("@/hooks/useAudios", () => ({
  useAudios: () => mockUseAudios(),
}));

jest.mock("@/hooks/useAudioPlayer", () => ({
  useAudioPlayerControl: () => mockUseAudioPlayerControl(),
}));

jest.mock("@/components/ui/Picker", () => {
  const React = require("react");
  const { View } = require("react-native");

  return () => <View />;
});

jest.mock("react-native-paper", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");

  return {
    IconButton: ({ icon, onPress }: { icon: string; onPress?: () => void }) => (
      <Pressable onPress={onPress}>
        <Text>{icon}</Text>
      </Pressable>
    ),
  };
});

describe("New UI components", () => {
  const getDocumentAsyncMock = jest.mocked(DocumentPicker.getDocumentAsync);

  beforeEach(() => {
    getDocumentAsyncMock.mockReset();
    mockUseAudios.mockReturnValue({
      audioMetas: [],
      convertAudio: jest.fn().mockResolvedValue(null),
      reConvertAudio: jest.fn().mockResolvedValue(null),
      downloadAudio: jest.fn().mockResolvedValue(null),
    });
    mockUseAudioPlayerControl.mockReturnValue({
      setPlaybackUri: jest.fn(),
      player: {
        pause: jest.fn(),
        play: jest.fn(),
        seekTo: jest.fn(),
      },
      status: {
        didJustFinish: false,
      },
    });
  });

  it("renders Header with provided title", () => {
    render(<Header title="DNA Lab" />);

    expect(screen.getByText("DNA Lab")).toBeTruthy();
  });

  it("renders Card children", () => {
    render(
      <Card>
        <Text>Card content</Text>
      </Card>,
    );

    expect(screen.getByText("Card content")).toBeTruthy();
  });

  it("renders SoundCharacteristics labels", () => {
    render(<SoundCharacteristics />);

    expect(screen.getByText("Audio Name ")).toBeTruthy();
    expect(screen.getByText("BPM: ")).toBeTruthy();
    expect(screen.getByText("Energy: ")).toBeTruthy();
    expect(screen.getByText("Tone: ")).toBeTruthy();
  });

  it("renders dashboard source and target columns", () => {
    render(<Dashboard />);

    expect(screen.getByText("Source DNA")).toBeTruthy();
    expect(screen.getByText("Target Audio")).toBeTruthy();
    expect(screen.getByText("Import Audio")).toBeTruthy();
  });

  it("updates dashboard target audio when a phone file is selected", async () => {
    getDocumentAsyncMock.mockResolvedValue({
      assets: [
        {
          mimeType: "audio/mpeg",
          name: "my-voice-note.mp3",
          size: 1234,
          uri: "file:///my-voice-note.mp3",
        },
      ],
      canceled: false,
    } as unknown as Awaited<
      ReturnType<typeof DocumentPicker.getDocumentAsync>
    >);

    render(<Dashboard />);

    fireEvent.press(screen.getByTestId("target-audio-picker"));

    await waitFor(() => {
      expect(getDocumentAsyncMock).toHaveBeenCalledWith({
        copyToCacheDirectory: true,
        multiple: false,
        type: "audio/*",
      });
      expect(screen.getByText("Audio Selected")).toBeTruthy();
      expect(screen.getByText("my-voice-note.mp3")).toBeTruthy();
      expect(screen.queryByText("Import Audio")).toBeNull();
    });
  });
});
