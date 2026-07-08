/**
 * Formats an integer paise amount as an Indian-locale rupee string.
 *
 * 118000 paise -> "₹1,180"  (money in this API has no fractional paise in
 * practice, so we drop the decimals; see README for the rationale.)
 *
 * Uses Intl.NumberFormat("en-IN") so digit grouping follows the Indian
 * numbering system (lakh/crore commas), e.g. 12345600 paise -> "₹1,23,456".
 */
export function formatPaise(amountPaise: number): string {
  if (!Number.isFinite(amountPaise)) {
    throw new TypeError(`formatPaise: expected a finite number, got ${amountPaise}`);
  }

  const rupees = amountPaise / 100;
  const hasFraction = Math.round(rupees * 100) % 100 !== 0;
  const fractionDigits = hasFraction ? 2 : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(rupees);
}
