/**
 * Domain types shared by all three apps.
 *
 * These mirror the schemas in `openapi.yaml`. They are the single source of
 * truth: if the API grows a field, add it here once and every app picks it
 * up through the TypeScript compiler (not by hand-editing three copies).
 */

/** Order status as returned by GET /orders (Customer App). */
export type OrderStatus =
  | "placed"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderSku {
  code: string;
  name: string;
  qty?: number;
}

/** A row from GET /orders?customerId={id}. */
export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  address: string;
  /** Integer paise. ₹1,180.00 === 118000. Always format with formatPaise(). */
  amountPaise: number;
  sku: OrderSku;
  status: OrderStatus;
  placedAt: string;
  /** ISO 8601 timestamp, or null when there is no estimate. */
  eta: string | null;
}

/** Trip stop status as returned by GET /trips (Driver App). */
export type TripStopStatus = "pending" | "active" | "done" | "skipped";

/** A row from GET /trips?driverId={id}. */
export interface TripStop {
  seq: number;
  orderId: string;
  driverId?: string;
  customerName: string;
  sku: string;
  address: string;
  distanceKm: number;
  status: TripStopStatus;
  etaMin: number | null;
}

/** Pending-action category as returned by GET /pending-actions (Admin Mobile). */
export type PendingActionCategory =
  | "mi_empty"
  | "mi_full"
  | "cash"
  | "prior_delivery"
  | "unassigned"
  | "verification"
  | "branch_assign"
  | "kyc";

export type PendingActionPriority = "low" | "med" | "high" | "breached";

export type PendingActionType =
  | "approve"
  | "route"
  | "decide"
  | "assign"
  | "remind"
  | "review";

/** A row from GET /pending-actions?adminId={id}. */
export interface PendingAction {
  id: string;
  adminId?: string;
  category: PendingActionCategory;
  summary: string;
  priority: PendingActionPriority;
  ageMinutes: number;
  slaMinutes: number;
  action: PendingActionType;
}
