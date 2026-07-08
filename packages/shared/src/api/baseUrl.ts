import { Platform } from "react-native";

/**
 * Resolves the mock-api base URL for the current runtime.
 *
 * - `EXPO_PUBLIC_API_URL` always wins (set it when testing on a physical
 *   device via Expo Go / tunnel, since "localhost" means the phone itself).
 * - The Android emulator cannot reach the host machine's localhost; it must
 *   use the special alias 10.0.2.2.
 * - iOS simulator and web can use localhost directly.
 */
export function getDefaultBaseUrl(): string {
  const override = process.env.EXPO_PUBLIC_API_URL;
  if (override) return override;
  if (Platform.OS === "android") return "http://10.0.2.2:4000";
  return "http://localhost:4000";
}
