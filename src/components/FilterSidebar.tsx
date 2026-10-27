'use client';

import React from 'react';
import PriceRangeSlider from './PriceRangeSlider';
import { Filter, RotateCcw, Building2, MapPin } from 'lucide-react';

interface FilterSidebarProps {
  propertyType: string;
  setPropertyType: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  priceRange: [number, number];
  setPriceRange: (val: [number, number]) => void;
  furnishing: string;
  setFurnishing: (val: string) => void;
  onReset: () => void;
}

const PROPERTY_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'PG', label: 'PG / Co-Living' },
  { id: '1BHK', label: '1 BHK' },
  { id: '2BHK', label: '2 BHK' },
  { id: '3BHK', label: '3 BHK' },
  { id: 'House', label: 'Independent House' },
  { id: 'Room', label: 'Single Room' },
];

const CITIES = [
  'All Cities',
  'Kolkata',
  'Bangalore',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
];

export default function FilterSidebar({
  propertyType,
  setPropertyType,
  city,
  setCity,
  priceRange,
  setPriceRange,
  furnishing,
  setFurnishing,
  onReset,
}: FilterSidebarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 font-medium transition"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Property Type Radio Pills */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          Property Type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setPropertyType(type.id)}
              className={`text-xs px-2.5 py-2 rounded-xl text-left font-medium transition-all ${
                propertyType === type.id || (!propertyType && type.id === 'all')
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* City Dropdown */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          Location / City
        </label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
        >
          {CITIES.map((c) => (
            <option key={c} value={c === 'All Cities' ? '' : c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Dual-Thumb Price Range Slider */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Price Range (Monthly Rent)
        </label>
        <PriceRangeSlider
          min={2000}
          max={100000}
          step={1000}
          value={priceRange}
          onChange={setPriceRange}
        />
      </div>

      {/* Furnishing Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Furnishing
        </label>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'Furnished', 'Semi-Furnished', 'Unfurnished'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFurnishing(f === 'all' ? '' : f)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                (furnishing === f || (!furnishing && f === 'all'))
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'Any' : f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
