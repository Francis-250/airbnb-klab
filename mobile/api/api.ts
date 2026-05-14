import axios from "axios";
import Constants from "expo-constants";

const envBaseUrl = process.env.EXPO_PUBLIC_API_URL;

function getDevBaseUrl() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri;
  const host = hostUri?.split(":")[0];

  if (!host) {
    return undefined;
  }

  return `http://${host}:4000/api`;
}

export const api = axios.create({
  baseURL:
    (__DEV__ && getDevBaseUrl()) || envBaseUrl || "http://localhost:4000/api",
  withCredentials: true,
});
