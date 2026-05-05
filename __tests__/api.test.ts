describe("API endpoint config", () => {
  const originalBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  afterEach(() => {
    jest.resetModules();

    if (originalBaseUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
      return;
    }

    process.env.EXPO_PUBLIC_API_BASE_URL = originalBaseUrl;
  });

  it("uses the Expo public base URL when it is set", () => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_BASE_URL = "http://10.0.0.25:3000";

    const api = require("../config/api").default;

    expect(api.UPLOAD_AUDIO).toBe("http://10.0.0.25:3000/api/submit-audio");
  });

  it("falls back to the local default base URL when env is missing", () => {
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    const api = require("../config/api").default;

    expect(api.UPLOAD_AUDIO).toBe("http://192.168.1.136:3000/api/submit-audio");
  });
});
