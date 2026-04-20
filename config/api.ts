export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.1.136:3000";
const API_ENDPOINTS = {
  SUBMIT_AUDIO: `${BASE_URL}/api/submit-audio`,
  GET_AUDIO: `${BASE_URL}/api/get-audio`,
};
export default API_ENDPOINTS;
