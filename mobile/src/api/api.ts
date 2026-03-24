// mobile/src/api/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { config, TOKEN_KEY } from "../config";

const api = axios.create({
  baseURL: config.apiUrl,
});

api.interceptors.request.use(async (requestConfig) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

export default api;
