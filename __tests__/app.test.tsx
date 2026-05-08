import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import * as ExpoAudio from "expo-audio";
import Index from "../app/index";
import { useAudios } from "@/hooks/useAudios";

const mockPlayer = {
  pause: jest.fn(),
  play: jest.fn(),
  seekTo: jest.fn(),
};

const mockPlayerStatus = {
  didJustFinish: false,
};

jest.mock("@/hooks/useAudios", () => ({
  useAudios: jest.fn(),
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

jest.mock("@/components/ui/Modal", () => {
  const React = require("react");
  const { View } = require("react-native");

  return ({
    children,
    visible,
  }: {
    children: React.ReactNode;
    visible: boolean;
  }) => (visible ? <View>{children}</View> : null);
});

jest.mock("../components/ListAudio", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  return ({
    currentSound,
    playAudio,
    uploadAudio,
  }: {
    currentSound?: string | null;
    playAudio: (audio: {
      id: string;
      localUri: string;
      label: string;
      timestamp: number;
      status: string;
      duration: number;
    }) => void;
    uploadAudio: (audio: {
      id: string;
      localUri: string;
      label: string;
      timestamp: number;
      status: string;
      duration: number;
    }) => void;
  }) => {
    const audio = {
      duration: 0,
      id: "draft-1",
      label: "draft-1.m4a",
      localUri: "file:///draft-1.m4a",
      status: "draft",
      timestamp: 1,
    };

    return (
      <View>
        <Text testID="current-sound">{currentSound ?? "none"}</Text>
        <Pressable onPress={() => playAudio(audio)}>
          <Text>Play Draft</Text>
        </Pressable>
        <Pressable onPress={() => uploadAudio(audio)}>
          <Text>Open Upload Modal</Text>
        </Pressable>
      </View>
    );
  };
});

jest.mock("expo-audio", () => ({
  __esModule: true,
  AudioModule: {
    requestRecordingPermissionsAsync: jest
      .fn()
      .mockResolvedValue({ granted: true }),
  },
  RecordingPresets: {
    HIGH_QUALITY: "HIGH_QUALITY",
  },
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  useAudioPlayer: jest.fn(() => mockPlayer),
  useAudioPlayerStatus: jest.fn(() => mockPlayerStatus),
  useAudioRecorder: jest.fn(() => ({
    prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
    record: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    uri: "file:///recording.m4a",
  })),
  useAudioRecorderState: jest.fn(() => ({
    durationMillis: 1000,
    isRecording: false,
  })),
}));

describe("Index screen audio behavior", () => {
  const uploadAudioMock = jest.fn().mockResolvedValue(undefined);
  const requestPermissionsMock = jest.mocked(
    ExpoAudio.AudioModule.requestRecordingPermissionsAsync,
  );
  const setAudioModeMock = jest.mocked(ExpoAudio.setAudioModeAsync);
  const useAudiosMock = jest.mocked(useAudios);

  beforeEach(() => {
    mockPlayer.play.mockClear();
    mockPlayer.pause.mockClear();
    mockPlayer.seekTo.mockClear();
    mockPlayerStatus.didJustFinish = false;

    requestPermissionsMock.mockClear();
    setAudioModeMock.mockClear();
    uploadAudioMock.mockClear();

    useAudiosMock.mockReturnValue({
      addAudio: jest.fn(),
      audioDrafts: [
        {
          duration: 0,
          id: "draft-1",
          label: "draft-1.m4a",
          localUri: "file:///draft-1.m4a",
          status: "draft",
          timestamp: 1,
        },
      ],
      audioFiles: [],
      audioRecordingDraftsDir: null,
      getAudios: jest.fn(),
      loading: false,
      removeAudio: jest.fn(),
      setAudioDrafts: jest.fn(),
      uploadAudio: uploadAudioMock,
    });
  });

  it("requests mic permission and configures audio mode on mount", async () => {
    render(<Index />);

    await waitFor(() => {
      expect(requestPermissionsMock).toHaveBeenCalledTimes(1);
      expect(setAudioModeMock).toHaveBeenCalledWith({
        allowsRecording: true,
        interruptionMode: "doNotMix",
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });
    });
  });

  it("plays selected draft audio and pauses when toggled", async () => {
    render(<Index />);

    fireEvent.press(screen.getByText("Play Draft"));

    await waitFor(() => {
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
      expect(mockPlayer.play).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("current-sound").props.children).toBe(
        "draft-1",
      );
    });

    mockPlayer.pause.mockClear();

    fireEvent.press(screen.getByText("Play Draft"));

    await waitFor(() => {
      expect(mockPlayer.pause).toHaveBeenCalled();
      expect(screen.getByTestId("current-sound").props.children).toBe("none");
    });
  });

  it("plays uploaded audio preview in modal", async () => {
    render(<Index />);

    fireEvent.press(screen.getByText("Open Upload Modal"));
    expect(screen.getByText("Save Recording")).toBeTruthy();

    fireEvent.press(screen.getByText("play-circle"));

    await waitFor(() => {
      expect(mockPlayer.play).toHaveBeenCalledTimes(1);
    });
  });

  it("resets current playback state when audio finishes", async () => {
    const { rerender } = render(<Index />);

    fireEvent.press(screen.getByText("Play Draft"));
    await waitFor(() => {
      expect(screen.getByTestId("current-sound").props.children).toBe(
        "draft-1",
      );
    });

    mockPlayerStatus.didJustFinish = true;
    rerender(<Index />);

    await waitFor(() => {
      expect(screen.getByTestId("current-sound").props.children).toBe("none");
    });
  });
});
