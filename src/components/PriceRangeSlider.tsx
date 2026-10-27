'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatINR } from '@/lib/pricing';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function PriceRangeSlider({
  min = 2000,
  max = 100000,
  step = 1000,
  value,
  onChange,
}: PriceRangeSliderProps) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (val: number) => Math.round(((val - min) / (max - min)) * 100),
    [min, max]
  );

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (rangeRef.current) {
      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (rangeRef.current) {
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(val);
    minValRef.current = val;
    onChange([val, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(val);
    maxValRef.current = val;
    onChange([minVal, val]);
  };

  const quickPresets: { label: string; range: [number, number] }[] = [
    { label: 'Under ₹10k', range: [min, 10000] },
    { label: '₹10k - ₹25k', range: [10000, 25000] },
    { label: '₹25k - ₹50k', range: [25000, 50000] },
    { label: '₹50k+', range: [50000, max] },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-1">
          <span className="text-slate-400">Min:</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {formatINR(minVal)}
          </span>
        </span>
        <span className="text-slate-400 font-normal">to</span>
        <span className="flex items-center gap-1">
          <span className="text-slate-400">Max:</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {maxVal >= max ? `${formatINR(max)}+` : formatINR(maxVal)}
          </span>
        </span>
      </div>

      {/* Dual thumb slider track */}
      <div className="relative py-3 flex items-center select-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className="thumb thumb--left pointer-events-none absolute h-0 w-full outline-none z-30"
          style={{ zIndex: minVal > max - 100 ? 5 : undefined }}
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className="thumb thumb--right pointer-events-none absolute h-0 w-full outline-none z-40"
          aria-label="Maximum price"
        />

        <div className="relative w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            ref={rangeRef}
            className="absolute h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm transition-all duration-75"
          />
        </div>
      </div>

      {/* Quick preset chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {quickPresets.map((preset) => {
          const isActive = minVal === preset.range[0] && maxVal === preset.range[1];
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setMinVal(preset.range[0]);
                setMaxVal(preset.range[1]);
                minValRef.current = preset.range[0];
                maxValRef.current = preset.range[1];
                onChange(preset.range);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 font-medium shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .thumb {
          -webkit-appearance: none;
          appearance: none;
        }
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: all;
          width: 20px;
          height: 20px;
          background-color: #ffffff;
          border-radius: 50%;
          border: 2.5px solid #10b981;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4);
        }
        .thumb::-webkit-slider-thumb:active {
          transform: scale(1.2);
          background-color: #ecfdf5;
        }
        .thumb::-moz-range-thumb {
          pointer-events: all;
          width: 20px;
          height: 20px;
          background-color: #ffffff;
          border-radius: 50%;
          border: 2.5px solid #10b981;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
