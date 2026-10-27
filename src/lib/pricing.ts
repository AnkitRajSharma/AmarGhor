export interface PricingBreakdown {
  basePrice: number;
  brokeragePercentage: number;
  brokerageDiscount: number;
  rawBrokerage: number;
  discountAmount: number;
  finalBrokerage: number;
  totalEstimatedCost: number;
  savings: number;
}

/**
 * Calculates dynamic pricing breakdown including base price,
 * raw brokerage, applied discounts, and total move-in / purchase estimate.
 */
export function calculatePricing(
  basePrice: number = 0,
  brokeragePercentage: number = 0,
  brokerageDiscount: number = 0
): PricingBreakdown {
  const safeBasePrice = Math.max(0, Number(basePrice) || 0);
  const safeBrokeragePct = Math.min(100, Math.max(0, Number(brokeragePercentage) || 0));
  const safeDiscountPct = Math.min(100, Math.max(0, Number(brokerageDiscount) || 0));

  const rawBrokerage = Math.round(safeBasePrice * (safeBrokeragePct / 100));
  const discountAmount = Math.round(rawBrokerage * (safeDiscountPct / 100));
  const finalBrokerage = Math.max(0, rawBrokerage - discountAmount);
  const totalEstimatedCost = safeBasePrice + finalBrokerage;

  return {
    basePrice: safeBasePrice,
    brokeragePercentage: safeBrokeragePct,
    brokerageDiscount: safeDiscountPct,
    rawBrokerage,
    discountAmount,
    finalBrokerage,
    totalEstimatedCost,
    savings: discountAmount,
  };
}

/**
 * Formats a number to Indian currency format (e.g. ₹15,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}
