export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.1.136:3000";
const API_ENDPOINTS = {
  UPLOAD_AUDIO: `${BASE_URL}/api/submit-audio`,
  GET_AUDIO_METADATA: `${BASE_URL}/api/get-audio`,
  DOWNLOAD_AUDIO: `${BASE_URL}/api/stream-audio`, // This endpoint is not currently used in the app, but can be used to download audio files if needed
};
export default API_ENDPOINTS;
