'use client';

import React from 'react';
import { calculatePricing, formatINR } from '@/lib/pricing';
import { Tag, Sparkles, CheckCircle2, Info } from 'lucide-react';

interface PricingBreakdownCardProps {
  price: number;
  brokeragePercentage?: number;
  brokerageDiscount?: number;
}

export default function PricingBreakdownCard({
  price,
  brokeragePercentage = 0,
  brokerageDiscount = 0,
}: PricingBreakdownCardProps) {
  const breakdown = calculatePricing(price, brokeragePercentage, brokerageDiscount);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-5 sm:p-6 space-y-5">
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Monthly Rent / Base Price
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
            {formatINR(breakdown.basePrice)}
            <span className="text-sm font-normal text-slate-500"> /month</span>
          </div>
        </div>

        {breakdown.brokeragePercentage === 0 ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            0% Brokerage
          </span>
        ) : breakdown.brokerageDiscount > 0 ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Tag className="w-3.5 h-3.5" />
            {breakdown.brokerageDiscount}% Off Brokerage
          </span>
        ) : null}
      </div>

      {/* Dynamic Breakdown Table */}
      <div className="space-y-3 text-sm">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Transparent Cost Breakdown
        </h4>

        {/* 1. Base Price */}
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Base Property Rent
          </span>
          <span className="font-semibold text-slate-900">
            {formatINR(breakdown.basePrice)}
          </span>
        </div>

        {/* 2. Brokerage Percentage */}
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            Brokerage Charge ({breakdown.brokeragePercentage}%)
          </span>
          <span className="font-medium text-slate-700">
            {formatINR(breakdown.rawBrokerage)}
          </span>
        </div>

        {/* 3. Discount (if any) */}
        {breakdown.brokerageDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/70 px-3 py-2 rounded-lg border border-emerald-100">
            <span className="font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Special Brokerage Discount ({breakdown.brokerageDiscount}%)
            </span>
            <span className="font-bold">
              - {formatINR(breakdown.discountAmount)}
            </span>
          </div>
        )}

        {/* 4. Net Brokerage Payable */}
        <div className="flex items-center justify-between text-slate-700 pt-1">
          <span className="font-medium">Net Brokerage Payable</span>
          <span className="font-semibold text-slate-900">
            {formatINR(breakdown.finalBrokerage)}
          </span>
        </div>
      </div>

      {/* Total Estimated Cost Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-medium text-emerald-100 block">
              Total Estimated Move-In Cost
            </span>
            <span className="text-[11px] text-emerald-200">
              (First Month Rent + Net Brokerage)
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black tracking-tight">
              {formatINR(breakdown.totalEstimatedCost)}
            </span>
          </div>
        </div>

        {breakdown.savings > 0 && (
          <div className="mt-2.5 pt-2 border-t border-emerald-500/40 text-xs text-emerald-100 flex items-center justify-between font-medium">
            <span>🎉 Total Brokerage Savings</span>
            <span className="font-bold text-white bg-emerald-500/50 px-2 py-0.5 rounded">
              {formatINR(breakdown.savings)}
            </span>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 leading-relaxed text-center">
        * No hidden platform fee. Brokerage terms are agreed directly between tenant & listing owner.
      </div>
    </div>
  );
}
