import { ApiClient, type RequestOptions } from "./client";
import type { Order, PendingAction, TripStop } from "../types";

/**
 * Thin, typed wrappers around the three read endpoints in openapi.yaml.
 * Screens call these instead of touching `fetch` or the ApiClient directly.
 */

export function getOrders(
  client: ApiClient,
  customerId: string,
  options?: RequestOptions,
): Promise<Order[]> {
  return client.get<Order[]>("orders", {
    ...options,
    query: { customerId, ...options?.query },
  });
}

export function getTrips(
  client: ApiClient,
  driverId: string,
  options?: RequestOptions,
): Promise<TripStop[]> {
  return client.get<TripStop[]>("trips", {
    ...options,
    query: { driverId, ...options?.query },
  });
}

export function getPendingActions(
  client: ApiClient,
  adminId: string,
  options?: RequestOptions,
): Promise<PendingAction[]> {
  return client.get<PendingAction[]>("pending-actions", {
    ...options,
    query: { adminId, ...options?.query },
  });
}
