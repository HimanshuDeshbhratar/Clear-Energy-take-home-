import { ApiClient, getDefaultBaseUrl } from "@clear-energy/shared";

/** Hardcoded stand-in for a logged-in driver session — auth is out of scope. */
export const DRIVER_ID = "d-101";

export const apiClient = new ApiClient({
  baseUrl: getDefaultBaseUrl(),
  defaultHeaders: { "X-Driver-Id": DRIVER_ID },
});
