import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import * as ExpoAudio from "expo-audio";
import Index from "../app/index";
import API_ENDPOINTS from "../config/api";

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
  setIsAudioActiveAsync: jest.fn(),
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    seekTo: jest.fn(),
  })),
  useAudioRecorder: jest.fn(() => ({
    prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
    record: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    uri: "file:///recording.m4a",
  })),
  useAudioRecorderState: jest.fn(() => ({
    isRecording: false,
  })),
}));

const audioFilesResponse = {
  audioFiles: ["kick.wav", "snare.wav", "hat.wav"],
};

const grantedPermissionResponse: Awaited<
  ReturnType<typeof ExpoAudio.AudioModule.requestRecordingPermissionsAsync>
> = {
  canAskAgain: true,
  expires: "never",
  granted: true,
  status: "granted" as Awaited<
    ReturnType<typeof ExpoAudio.AudioModule.requestRecordingPermissionsAsync>
  >["status"],
};

describe("Index screen", () => {
  const fetchMock = jest.fn();
  const alertMock = jest.fn();
  const requestPermissionsMock = jest.mocked(
    ExpoAudio.AudioModule.requestRecordingPermissionsAsync,
  );
  const setAudioModeMock = jest.mocked(ExpoAudio.setAudioModeAsync);

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation((input: string | URL | Request) => {
      if (input === API_ENDPOINTS.GET_AUDIO) {
        return Promise.resolve({
          json: jest.fn().mockResolvedValue(audioFilesResponse),
        });
      }

      return Promise.resolve({ status: 200 });
    });
    alertMock.mockReset();
    requestPermissionsMock.mockClear();
    requestPermissionsMock.mockResolvedValue(grantedPermissionResponse);
    setAudioModeMock.mockClear();
    setAudioModeMock.mockResolvedValue(undefined);

    global.fetch = fetchMock as unknown as typeof fetch;
    global.alert = alertMock as typeof alert;
  });

  const renderIndex = async () => {
    render(<Index />);

    await waitFor(() => {
      expect(screen.getByText("kick.wav")).toBeTruthy();
    });
  };

  it("renders the current recording controls", async () => {
    await renderIndex();

    expect(screen.getByText("Start Recording")).toBeTruthy();
    expect(screen.getByText("replay")).toBeTruthy();
    expect(screen.getByText("Submit Audio")).toBeTruthy();
  });

  it("submits audio to the configured endpoint", async () => {
    await renderIndex();

    fireEvent.press(screen.getByText("Submit Audio"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        API_ENDPOINTS.SUBMIT_AUDIO,
        expect.objectContaining({
          body: expect.any(FormData),
          headers: {
            "Content-Type": "multipart/form-data",
          },
          method: "POST",
        }),
      );
    });

    expect(alertMock).toHaveBeenCalledWith(
      "Audio submitted successfully! Server response: 200",
    );
  });

  it("requests recording permissions on mount", async () => {
    await renderIndex();

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
});
