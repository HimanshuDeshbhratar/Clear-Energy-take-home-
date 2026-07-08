import { describe, expect, it } from "vitest";
import { formatPaise } from "./formatPrice";

describe("formatPaise", () => {
  it("formats a mid-size amount with Indian digit grouping", () => {
    // 12,345,600 paise = ₹123,456.00 -> "₹1,23,456" in the Indian numbering system
    expect(formatPaise(12_345_600)).toBe("₹1,23,456");
  });

  it("formats a small amount", () => {
    expect(formatPaise(52_200)).toBe("₹522");
  });

  it("formats zero", () => {
    expect(formatPaise(0)).toBe("₹0");
  });

  it("keeps fractional paise as decimals when the amount is not a whole rupee", () => {
    expect(formatPaise(50)).toBe("₹0.50");
  });

  it("formats a large crore-range amount with Indian digit grouping", () => {
    // 10,000,000 rupees = 1,00,00,000 -> 1 crore
    expect(formatPaise(1_000_000_000)).toBe("₹1,00,00,000");
  });

  it("throws for non-finite input rather than silently returning garbage", () => {
    expect(() => formatPaise(NaN)).toThrow(TypeError);
    expect(() => formatPaise(Infinity)).toThrow(TypeError);
  });
});
