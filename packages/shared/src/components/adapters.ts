import type { Order, PendingAction, PendingActionCategory, TripStop } from "../types";
import { formatPaise } from "../utils/formatPrice";
import { colors, type Tone } from "./tokens";

/**
 * The unified visual model <OrderCard /> renders. All three domain types
 * (Order, TripStop, PendingAction) get mapped down to this one shape by the
 * adapters below — that's what lets a single component serve three screens
 * without leaking per-app concerns into its props.
 */
export interface OrderCardModel {
  key: string;
  /** Small mono/eyebrow label, e.g. an order id or SKU code. */
  eyebrow: string;
  /** Primary line — product, or customer + item. */
  title: string;
  /** Secondary line — address, status, or extra detail. */
  subtitle: string;
  /** Status/priority tone driving the eyebrow + accent colour. */
  tone: Tone;
  /** Right-aligned meta text (date / distance / age). Omit if `rightChip` is set. */
  meta?: string;
  /** Right-aligned action chip label (e.g. "Open", "Approve", "Assign"). */
  rightChip?: { label: string; tone: Tone };
  /** Draws a highlighted border around the card (driver's active stop). */
  highlighted?: boolean;
  /** Small leading badge content, e.g. a stop's sequence number or a check. */
  leadingBadge?: { content: string; tone: Tone };
  /** Warning line shown under the meta text (admin SLA breach). */
  warning?: string;
}

const ORDER_STATUS_TONE: Record<Order["status"], Tone> = {
  placed: "neutral",
  assigned: "info",
  out_for_delivery: "positive",
  delivered: "neutral",
  cancelled: "danger",
  returned: "danger",
};

const ORDER_STATUS_LABEL: Record<Order["status"], string> = {
  placed: "Placed",
  assigned: "Assigned",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled · Refund processed",
  returned: "Returned",
};

function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const isFuture = date.getTime() > now.getTime();
  if (isFuture) {
    const hoursAway = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursAway < 30) return "Tomorrow";
  }
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** customer-view: shows customer's order with product + status + amount. */
export function orderToCardModel(order: Order): OrderCardModel {
  return {
    key: order.id,
    eyebrow: order.id,
    title: order.sku.name,
    subtitle: `${ORDER_STATUS_LABEL[order.status]} · ${formatPaise(order.amountPaise)}`,
    tone: ORDER_STATUS_TONE[order.status],
    meta: formatOrderDate(order.eta ?? order.placedAt),
  };
}

const TRIP_STOP_TONE: Record<TripStop["status"], Tone> = {
  done: "positive",
  active: "info",
  pending: "neutral",
  skipped: "danger",
};

/** driver-view: shows address + ETA for a stop on today's route. */
export function tripStopToCardModel(stop: TripStop): OrderCardModel {
  const isDone = stop.status === "done";
  const isActive = stop.status === "active";

  return {
    key: `${stop.seq}-${stop.orderId}`,
    eyebrow: stop.orderId,
    title: `${stop.customerName} · ${stop.sku}`,
    subtitle: `${stop.address}${
      stop.etaMin != null && !isDone ? ` · ETA ${stop.etaMin} min` : ""
    }`,
    tone: TRIP_STOP_TONE[stop.status],
    highlighted: isActive,
    leadingBadge: isDone
      ? { content: "check", tone: "positive" }
      : { content: String(stop.seq), tone: isActive ? "info" : "neutral" },
    rightChip: isActive ? { label: "Open", tone: "info" } : undefined,
  };
}

const CATEGORY_TONE: Record<PendingActionCategory, Tone> = {
  cash: "positive",
  mi_empty: "warning",
  mi_full: "warning",
  unassigned: "accent",
  kyc: "danger",
  prior_delivery: "info",
  verification: "info",
  branch_assign: "accent",
};

const CATEGORY_LABEL: Record<PendingActionCategory, string> = {
  cash: "Cash",
  mi_empty: "MI Empty",
  mi_full: "MI Full",
  unassigned: "Unassigned order",
  kyc: "KYC",
  prior_delivery: "Prior delivery",
  verification: "Verification",
  branch_assign: "Branch assign",
};

const ACTION_LABEL: Record<PendingAction["action"], string> = {
  approve: "Approve",
  route: "Route",
  decide: "Decide",
  assign: "Assign",
  remind: "Remind",
  review: "Review",
};

function formatAge(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
}

/** admin-view: shows category + summary + an action chip, with SLA breach warning. */
export function pendingActionToCardModel(action: PendingAction): OrderCardModel {
  const isBreached = action.ageMinutes > action.slaMinutes;
  const tone = isBreached ? "danger" : CATEGORY_TONE[action.category];

  return {
    key: action.id,
    eyebrow: `${CATEGORY_LABEL[action.category]} · ${action.id}`,
    title: action.summary,
    subtitle: `Priority: ${action.priority}`,
    tone,
    meta: formatAge(action.ageMinutes),
    warning: isBreached ? "SLA breached" : undefined,
    rightChip: { label: ACTION_LABEL[action.action], tone },
  };
}

export const cardBrandColor = colors.brand;
