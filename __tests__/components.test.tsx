import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import Header from "@/components/Header";
import Card from "@/components/ui/Card";
import SoundCharacteristics from "@/components/SoundCharacteristics";
import Dashboard from "@/app/dashboard";
import * as DocumentPicker from "expo-document-picker";

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

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

    expect(screen.getByText("DNA Source")).toBeTruthy();
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
    } as unknown as Awaited<ReturnType<typeof DocumentPicker.getDocumentAsync>>);

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
      expect(screen.getByText("Ready to transform")).toBeTruthy();
    });
  });
});
