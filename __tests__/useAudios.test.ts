import { renderHook, act } from "@testing-library/react-native";

// jest.mock is hoisted above variable declarations, so the factory must be
// entirely self-contained (no references to outer variables).
jest.mock("expo-file-system", () => ({
  Directory: jest.fn().mockImplementation(() => ({
    exists: true,
    list: jest.fn().mockReturnValue([]),
    create: jest.fn(),
  })),
  File: jest.fn().mockImplementation(() => ({ uri: "file:///mock" })),
  Paths: { cache: "/mock/cache" },
}));

// Module under test
import { useAudios } from "@/hooks/useAudios";

// Attach the fetch mock after the module is imported so it intercepts all calls.
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Default: silently handle the background getAudios fetch that fires on mount.
beforeEach(() => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ audioFiles: [] }),
  });
});

afterEach(() => {
  mockFetch.mockClear();
});

const MOCK_CONVERT_RESPONSE = {
  message: "Audio conversion complete. DSP effects applied and file processed.",
  convertedAudioUri: "/api/stream-temp-audio/converted-2026.wav",
  conversionPlan: {
    targetBPM: 120,
    importedTempoBpm: 100,
    pitchShiftSemitones: 0,
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

const MOCK_RECONVERT_RESPONSE = {
  message: "Audio re-conversion complete.",
  convertedAudioUri: "/api/stream-temp-audio/reconverted-2026.wav",
  conversionPlan: {
    targetBPM: 130,
    pitchShiftSemitones: 2,
    gainDb: -1,
    tempoRatio: 1.3,
    minTempoBpm: 60,
    maxTempoBpm: 180,
    minPitchShiftSemitones: -12,
    maxPitchShiftSemitones: 12,
    minGainDb: -12,
    maxGainDb: 12,
  },
};

const FAKE_FILE = {
  uri: "file:///imported.m4a",
  name: "imported.m4a",
  mimeType: "audio/m4a",
  size: 512,
};

describe("useAudios — resolveAudioUri", () => {
  it("returns null for null input", () => {
    const { result } = renderHook(() => useAudios());
    expect(result.current.resolveAudioUri(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    const { result } = renderHook(() => useAudios());
    expect(result.current.resolveAudioUri(undefined)).toBeNull();
  });

  it("passes through a full URL unchanged", () => {
    const { result } = renderHook(() => useAudios());
    const url = "http://192.168.1.136:3000/api/stream-temp-audio/file.wav";
    expect(result.current.resolveAudioUri(url)).toBe(url);
  });

  it("prepends BASE_URL to a relative path starting with /", () => {
    const { result } = renderHook(() => useAudios());
    const resolved = result.current.resolveAudioUri(
      "/api/stream-temp-audio/file.wav",
    );
    expect(resolved).toMatch(
      /^http:\/\/.+\/api\/stream-temp-audio\/file\.wav$/,
    );
  });

  it("prepends BASE_URL with a slash to a relative path not starting with /", () => {
    const { result } = renderHook(() => useAudios());
    const resolved = result.current.resolveAudioUri("api/stream-temp-audio/file.wav");
    expect(resolved).toMatch(/^http:\/\/.+\/api\/stream-temp-audio\/file\.wav$/);
  });
});

describe("useAudios — convertAudio", () => {
  it("returns null when audioFileId is empty", async () => {
    const { result } = renderHook(() => useAudios());

    let response;
    await act(async () => {
      response = await result.current.convertAudio("", FAKE_FILE);
    });

    expect(response).toBeNull();
    expect(
      mockFetch.mock.calls.some(([url]) =>
        String(url).includes("/api/convert-audio/"),
      ),
    ).toBe(false);
  });

  it("POSTs to the convert-audio endpoint with a FormData body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => MOCK_CONVERT_RESPONSE,
    });

    const { result } = renderHook(() => useAudios());
    let response: typeof MOCK_CONVERT_RESPONSE | null = null;

    await act(async () => {
      response = await result.current.convertAudio("42", FAKE_FILE);
    });

    const convertCall = mockFetch.mock.calls.find(([url]) =>
      String(url).includes("/api/convert-audio/42"),
    );
    expect(convertCall).toBeDefined();
    const [url, options] = convertCall!;
    expect(url).toMatch(/\/api\/convert-audio\/42$/);
    expect(options.method).toBe("POST");
    expect(response).not.toBeNull();
  });

  it("resolves the convertedAudioUri to a full URL", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ...MOCK_CONVERT_RESPONSE }),
    });

    const { result } = renderHook(() => useAudios());
    let response: typeof MOCK_CONVERT_RESPONSE | null = null;

    await act(async () => {
      response = await result.current.convertAudio("42", FAKE_FILE);
    });

    expect(response?.convertedAudioUri).toMatch(/^http:\/\//);
  });

  it("returns null when the server responds with a non-ok status", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audioFiles: [] }),
      })
      .mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      });

    const { result } = renderHook(() => useAudios());
    let response;

    await act(async () => {
      response = await result.current.convertAudio("42", FAKE_FILE);
    });

    expect(response).toBeNull();
  });

  it("returns null when fetch throws a network error", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audioFiles: [] }),
      })
      .mockRejectedValueOnce(new TypeError("Network request failed"));

    const { result } = renderHook(() => useAudios());
    let response;

    await act(async () => {
      response = await result.current.convertAudio("42", FAKE_FILE);
    });

    expect(response).toBeNull();
  });
});

describe("useAudios — reConvertAudio", () => {
  it("returns null when audioFileId is empty", async () => {
    const { result } = renderHook(() => useAudios());
    let response;

    await act(async () => {
      response = await result.current.reConvertAudio("", FAKE_FILE, {
        targetBPM: 120,
        pitchShiftSemitones: 0,
        gainDb: 0,
      });
    });

    expect(response).toBeNull();
    expect(
      mockFetch.mock.calls.some(([url]) =>
        String(url).includes("/api/reconvert-audio/"),
      ),
    ).toBe(false);
  });

  it("encodes targetBPM, pitchShiftSemitones, and gainDb as query params", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => MOCK_RECONVERT_RESPONSE,
    });

    const { result } = renderHook(() => useAudios());

    await act(async () => {
      await result.current.reConvertAudio("7", FAKE_FILE, {
        targetBPM: 130,
        pitchShiftSemitones: 2,
        gainDb: -1,
      });
    });

    const reconvertCall = mockFetch.mock.calls.find(([url]) =>
      String(url).includes("/api/reconvert-audio/7"),
    );
    expect(reconvertCall).toBeDefined();
    const [url] = reconvertCall!;
    expect(url).toContain("targetBPM=130");
    expect(url).toContain("pitchShiftSemitones=2");
    expect(url).toContain("gainDb=-1");
  });

  it("appends importedTempoBpm to the URL when provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => MOCK_RECONVERT_RESPONSE,
    });

    const { result } = renderHook(() => useAudios());

    await act(async () => {
      await result.current.reConvertAudio("7", FAKE_FILE, {
        targetBPM: 130,
        pitchShiftSemitones: 0,
        gainDb: 0,
        importedTempoBpm: 100,
      });
    });

    const reconvertCall = mockFetch.mock.calls.find(([url]) =>
      String(url).includes("/api/reconvert-audio/7"),
    );
    expect(reconvertCall).toBeDefined();
    const [url] = reconvertCall!;
    expect(url).toContain("importedTempoBpm=100");
  });

  it("does not append importedTempoBpm when it is undefined", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => MOCK_RECONVERT_RESPONSE,
    });

    const { result } = renderHook(() => useAudios());

    await act(async () => {
      await result.current.reConvertAudio("7", FAKE_FILE, {
        targetBPM: 130,
        pitchShiftSemitones: 0,
        gainDb: 0,
      });
    });

    const reconvertCall = mockFetch.mock.calls.find(([url]) =>
      String(url).includes("/api/reconvert-audio/7"),
    );
    expect(reconvertCall).toBeDefined();
    const [url] = reconvertCall!;
    expect(url).not.toContain("importedTempoBpm");
  });

  it("resolves the convertedAudioUri to a full URL", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ...MOCK_RECONVERT_RESPONSE }),
    });

    const { result } = renderHook(() => useAudios());
    let response: typeof MOCK_RECONVERT_RESPONSE | null = null;

    await act(async () => {
      response = await result.current.reConvertAudio("7", FAKE_FILE, {
        targetBPM: 130,
        pitchShiftSemitones: 0,
        gainDb: 0,
        importedTempoBpm: 100,
      });
    });

    expect(response?.convertedAudioUri).toMatch(/^http:\/\//);
  });

  it("returns null on network failure", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audioFiles: [] }),
      })
      .mockRejectedValueOnce(new TypeError("Network request failed"));

    const { result } = renderHook(() => useAudios());
    let response;

    await act(async () => {
      response = await result.current.reConvertAudio("7", FAKE_FILE, {
        targetBPM: 130,
        pitchShiftSemitones: 0,
        gainDb: 0,
      });
    });

    expect(response).toBeNull();
  });
});
