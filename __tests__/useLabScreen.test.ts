import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { MAX_IMPORTED_AUDIO_FILE_SIZE_BYTES } from "@/utils/inputValidation";

import { useLabScreen } from "../hooks/useLabScreen";

const mockUseAudios = jest.fn();
const mockUseAudioPlayerControl = jest.fn();
const mockAnimatedTimingStart = jest.fn();

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock("@/hooks/useAudios", () => ({
  useAudios: () => mockUseAudios(),
}));

jest.mock("@/hooks/useAudioPlayer", () => ({
  useAudioPlayerControl: () => mockUseAudioPlayerControl(),
}));

describe("useLabScreen", () => {
  const getDocumentAsyncMock = jest.mocked(DocumentPicker.getDocumentAsync);
  const convertAudioMock = jest.fn();
  const reConvertAudioMock = jest.fn();
  const downloadAudioMock = jest.fn();
  const setPlaybackUriMock = jest.fn();
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  const playerStatus = { didJustFinish: false };

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

  const readyReconversionResponse = {
    message: "Audio re-conversion complete.",
    convertedAudioUri:
      "http://192.168.1.136:3000/api/stream-temp-audio/reconverted.wav",
    conversionPlan: {
      targetBPM: 121,
      pitchShiftSemitones: 1,
      gainDb: 0,
      tempoRatio: 1.21,
      minTempoBpm: 60,
      maxTempoBpm: 180,
      minPitchShiftSemitones: -12,
      maxPitchShiftSemitones: 12,
      minGainDb: -12,
      maxGainDb: 12,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    playerStatus.didJustFinish = false;
    getDocumentAsyncMock.mockReset();
    convertAudioMock.mockReset();
    reConvertAudioMock.mockReset();
    downloadAudioMock.mockReset();
    setPlaybackUriMock.mockReset();
    mockAnimatedTimingStart.mockReset();

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
      setPlaybackUri: setPlaybackUriMock,
      status: playerStatus,
    });

    jest.spyOn(require("react-native").Animated, "timing").mockReturnValue({
      start: mockAnimatedTimingStart,
    });
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("exposes the expected initial statuses and primary action", () => {
    const { result } = renderHook(() => useLabScreen());

    expect(result.current.sourceStatus).toBe("Missing");
    expect(result.current.targetStatus).toBe("Missing");
    expect(result.current.outputStatus).toBe("Waiting");
    expect(result.current.primaryActionTitle).toBe("Apply DNA");
    expect(result.current.showAdjustments).toBe(false);
    expect(result.current.hasChangesSinceLastApply).toBe(true);
  });

  it("updates statuses through source selection, import, conversion, and re-conversion", async () => {
    getDocumentAsyncMock.mockResolvedValue({
      assets: [
        {
          mimeType: "audio/mpeg",
          name: "target.mp3",
          size: 1234,
          uri: "file:///target.mp3",
        },
      ],
      canceled: false,
    } as unknown as Awaited<
      ReturnType<typeof DocumentPicker.getDocumentAsync>
    >);

    downloadAudioMock.mockResolvedValue("file:///downloaded-source.m4a");
    convertAudioMock.mockResolvedValue(readyConversionResponse);
    reConvertAudioMock.mockResolvedValue(readyReconversionResponse);

    const { result } = renderHook(() => useLabScreen());

    act(() => {
      result.current.handleAudioMetaData("source-1");
    });
    expect(result.current.sourceStatus).toBe("Selected");

    await act(async () => {
      await result.current.handleDownloadAudio();
    });
    expect(result.current.sourceStatus).toBe("Ready");

    await act(async () => {
      await result.current.handlePickAudio();
    });
    expect(result.current.targetStatus).toBe("Ready");

    await act(async () => {
      await result.current.handlePrimaryAction();
    });

    await waitFor(() => {
      expect(convertAudioMock).toHaveBeenCalledWith("source-1", {
        mimeType: "audio/mpeg",
        name: "target.mp3",
        size: 1234,
        uri: "file:///target.mp3",
      });
      expect(result.current.outputStatus).toBe("Ready");
      expect(result.current.primaryActionTitle).toBe("Re-Apply DNA");
      expect(result.current.showAdjustments).toBe(true);
      expect(result.current.sliderValues).toEqual({
        bpm: 120,
        pitchShiftSemitones: 1,
        gainDb: 0,
      });
      expect(result.current.hasChangesSinceLastApply).toBe(false);
    });

    act(() => {
      result.current.setSliderValues((prev) => ({
        ...prev,
        bpm: 121,
      }));
    });

    expect(result.current.hasChangesSinceLastApply).toBe(true);

    await act(async () => {
      await result.current.handlePrimaryAction();
    });

    expect(reConvertAudioMock).toHaveBeenCalledWith(
      "source-1",
      {
        mimeType: "audio/mpeg",
        name: "target.mp3",
        size: 1234,
        uri: "file:///target.mp3",
      },
      {
        targetBPM: 121,
        pitchShiftSemitones: 1,
        gainDb: 0,
        importedTempoBpm: 100,
      },
    );
    expect(result.current.outputStatus).toBe("Ready");
    expect(result.current.sliderValues.bpm).toBe(121);
  });

  it("blocks oversized imported files", async () => {
    getDocumentAsyncMock.mockResolvedValue({
      assets: [
        {
          mimeType: "audio/mpeg",
          name: "very-large-target.mp3",
          size: MAX_IMPORTED_AUDIO_FILE_SIZE_BYTES + 1,
          uri: "file:///very-large-target.mp3",
        },
      ],
      canceled: false,
    } as unknown as Awaited<
      ReturnType<typeof DocumentPicker.getDocumentAsync>
    >);

    const { result } = renderHook(() => useLabScreen());

    await act(async () => {
      await result.current.handlePickAudio();
    });

    expect(result.current.targetStatus).toBe("Missing");
    expect(result.current.importedAudio).toBeNull();
    expect(alertSpy).toHaveBeenCalledWith(
      "Invalid imported audio",
      "Imported file exceeds 10MB limit.",
    );
  });
});
