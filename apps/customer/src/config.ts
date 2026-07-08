import { ApiClient, getDefaultBaseUrl } from "@clear-energy/shared";

/**
 * Auth is out of scope for this take-home (see README) — a real customer id
 * is hardcoded here, standing in for what would otherwise come from a
 * logged-in session.
 */
export const CUSTOMER_ID = "c-001";

export const apiClient = new ApiClient({
  baseUrl: getDefaultBaseUrl(),
  defaultHeaders: { "X-Customer-Id": CUSTOMER_ID },
});
