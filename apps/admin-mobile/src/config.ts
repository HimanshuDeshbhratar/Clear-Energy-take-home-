import { ApiClient, getDefaultBaseUrl } from "@clear-energy/shared";

/** Hardcoded stand-in for a logged-in admin session — auth is out of scope. */
export const ADMIN_ID = "a-201";

export const apiClient = new ApiClient({
  baseUrl: getDefaultBaseUrl(),
  defaultHeaders: { "X-Admin-Id": ADMIN_ID },
});
