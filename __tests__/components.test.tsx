import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Pressable, StyleSheet, Text } from "react-native";
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import Dashboard from "@/app/screens/LabScreen";
import SourceAudioPanel from "@/components/lab/SourceAudioPanel";
import * as DocumentPicker from "expo-document-picker";

const mockUseAudios = jest.fn();
const mockUseAudioPlayerControl = jest.fn();

jest.mock("expo-audio", () => ({
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

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
  const { Pressable, Text } = require("react-native");

  return ({ getValue }: { getValue: (value: string | null) => void }) => (
    <Pressable onPress={() => getValue("source-1")} testID="mock-picker">
      <Text>Select Source</Text>
    </Pressable>
  );
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
  const convertAudioMock = jest.fn();
  const reConvertAudioMock = jest.fn();
  const downloadAudioMock = jest.fn();

  const readyConversionResponse = {
    message:
      "Audio conversion complete. DSP effects applied and file processed.",
    convertedAudioUri:
      "http://192.168.1.136:3000/api/stream-temp-audio/converted.wav",
    conversionPlan: {
      targetBPM: 120,
      importedTempoBpm: 100,
      pitchShiftSemitones: 1,
      gainDb: 0,
      tempoRatio: 1.2,
      minTempoBpm: 60,
      maxTempoBpm: 180,
      minPitchShiftSemitones: -12,
      maxPitchShiftSemitones: 12,
      minGainDb: -12,
      maxGainDb: 12,
    },
  };

  beforeEach(() => {
    getDocumentAsyncMock.mockReset();
    convertAudioMock.mockReset();
    reConvertAudioMock.mockReset();
    downloadAudioMock.mockReset();

    convertAudioMock.mockResolvedValue(null);
    reConvertAudioMock.mockResolvedValue(null);
    downloadAudioMock.mockResolvedValue(null);

    mockUseAudios.mockReturnValue({
      audioMetas: [
        {
          audioFileId: "source-1",
          audioName: "DNA Source",
          tempoBpm: 120,
          estimatedPitchHz: 440,
          energyLevel: "High",
          tempoLabel: "Fast",
          tone: "Bright",
          mood: "Upbeat",
        },
      ],
      convertAudio: convertAudioMock,
      reConvertAudio: reConvertAudioMock,
      downloadAudio: downloadAudioMock,
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

  it("renders source panel metadata labels", () => {
    render(
      <SourceAudioPanel
        audioSelected={null}
        audioSelectedDownloaded={false}
        downloadedAudioUri={null}
        isDNASoundPlaying={false}
        isLoading={false}
        isWideLayout={false}
        onDownload={jest.fn()}
        onStopPlayback={jest.fn()}
        onPlaySource={jest.fn()}
      />,
    );

    expect(screen.getByText("Audio Name: -")).toBeTruthy();
    expect(screen.getByText("BPM: -")).toBeTruthy();
    expect(screen.getByText("Energy Level: -")).toBeTruthy();
    expect(screen.getByText("Tone: -")).toBeTruthy();
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

  it("turns source, target, and output status pills green when each becomes ready", async () => {
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

    downloadAudioMock.mockResolvedValue("file:///downloaded-source.m4a");
    convertAudioMock.mockResolvedValue(readyConversionResponse);

    render(<Dashboard />);

    fireEvent.press(screen.getByTestId("mock-picker"));
    fireEvent.press(screen.getByText("download"));

    await waitFor(() => {
      expect(screen.getByText("Ready")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Import Audio"));

    await waitFor(() => {
      expect(getDocumentAsyncMock).toHaveBeenCalled();
      expect(screen.getByText("Audio Selected")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Apply DNA"));

    await waitFor(() => {
      const sourceStyle = StyleSheet.flatten(
        screen.getByTestId("status-pill-source").props.style,
      );
      const targetStyle = StyleSheet.flatten(
        screen.getByTestId("status-pill-target").props.style,
      );
      const outputStyle = StyleSheet.flatten(
        screen.getByTestId("status-pill-output").props.style,
      );

      expect(sourceStyle.backgroundColor).toBe("#279430");
      expect(targetStyle.backgroundColor).toBe("#279430");
      expect(outputStyle.backgroundColor).toBe("#279430");
    });
  });
});
