// mobile/src/config.ts
import Constants from "expo-constants";

// En Expo SDK 49+ las variables EXPO_PUBLIC_ están disponibles como process.env
// Constants.expoConfig.extra es el fallback para versiones anteriores
const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  "http://192.168.1.183:3001/api"; // fallback hardcodeado si todo lo demás falla

export const config = {
  apiUrl,
} as const;
