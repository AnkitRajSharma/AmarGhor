'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Percent,
  PhoneCall,
  X,
  Sparkles,
} from 'lucide-react';
import PropertyCard, { PropertyCardData } from '@/components/PropertyCard';
import FilterSidebar from '@/components/FilterSidebar';

function HomeContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('propertyType') || '';
  const initialCity = searchParams.get('city') || '';

  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState(initialType);
  const [city, setCity] = useState(initialCity);
  const [priceRange, setPriceRange] = useState<[number, number]>([2000, 100000]);
  const [furnishing, setFurnishing] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync with searchParams if url changes
  useEffect(() => {
    if (initialType) setPropertyType(initialType);
    if (initialCity) setCity(initialCity);
  }, [initialType, initialCity]);

  // Fetch properties function
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.set('search', searchTerm);
      if (propertyType && propertyType !== 'all') query.set('propertyType', propertyType);
      if (city && city !== 'all') query.set('city', city);
      if (priceRange[0] > 2000) query.set('minPrice', priceRange[0].toString());
      if (priceRange[1] < 100000) query.set('maxPrice', priceRange[1].toString());
      if (furnishing && furnishing !== 'all') query.set('furnishing', furnishing);
      if (sort) query.set('sort', sort);
      query.set('page', page.toString());
      query.set('limit', '6');

      const res = await fetch(`/api/properties?${query.toString()}`);
      const data = await res.json();

      if (res.ok) {
        // If empty on first load and no filters, try seeding demo properties
        if (
          data.properties.length === 0 &&
          page === 1 &&
          !searchTerm &&
          !propertyType &&
          !city
        ) {
          const seedRes = await fetch('/api/seed');
          if (seedRes.ok) {
            // Re-fetch after seeding
            const retryRes = await fetch(`/api/properties?page=1&limit=6`);
            const retryData = await retryRes.json();
            setProperties(retryData.properties || []);
            setTotalPages(retryData.pagination?.totalPages || 1);
            setTotalCount(retryData.pagination?.total || 0);
            return;
          }
        }

        setProperties(data.properties || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, propertyType, city, priceRange, furnishing, sort, page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setPropertyType('all');
    setCity('');
    setPriceRange([2000, 100000]);
    setFurnishing('');
    setSort('newest');
    setPage(1);
  };

  const quickTypes = [
    { id: 'all', label: 'All Listings' },
    { id: 'PG', label: 'PG / Co-Living' },
    { id: '1BHK', label: '1 BHK' },
    { id: '2BHK', label: '2 BHK' },
    { id: 'House', label: 'Villas & Houses' },
    { id: 'Room', label: 'Private Rooms' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-12 pb-20 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Smart Living with 100% Brokerage Transparency</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight"
          >
            Find Your Dream Home or PG on{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              AmarGhor
            </span>
          </motion.h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Direct owner contacts, real-time brokerage cost calculations, and verified listings across India&apos;s leading tech cities.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mt-6">
            <div className="flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2 pl-3 flex-1 text-slate-800">
                <Search className="w-5 h-5 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by area, landmark, society, or city (e.g. Salt Lake, Koramangala)..."
                  className="w-full text-xs sm:text-sm font-medium outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => fetchProperties()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {quickTypes.map((t) => {
              const active =
                propertyType === t.id || (!propertyType && t.id === 'all');
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setPropertyType(t.id);
                    setPage(1);
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-all duration-150 font-medium ${
                    active
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm scale-105'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Highlights Strip */}
      <div className="bg-white border-b border-slate-200/80 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Verified Properties</h4>
              <p className="text-[11px] text-slate-500">Inspected photos & valid owners</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Dynamic Brokerage Breakdown</h4>
              <p className="text-[11px] text-slate-500">Know your exact move-in cost upfront</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Direct Owner Connection</h4>
              <p className="text-[11px] text-slate-500">Instant Call & WhatsApp reveals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header bar: Results count & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Available Properties & PG
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {properties.length} of {totalCount} verified listings
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filter Properties</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400 hidden sm:inline">
                Sort by:
              </span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 shadow-xs"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="brokerage_asc">Lowest Brokerage First</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterSidebar
                propertyType={propertyType}
                setPropertyType={(val) => {
                  setPropertyType(val);
                  setPage(1);
                }}
                city={city}
                setCity={(val) => {
                  setCity(val);
                  setPage(1);
                }}
                priceRange={priceRange}
                setPriceRange={(val) => {
                  setPriceRange(val);
                  setPage(1);
                }}
                furnishing={furnishing}
                setFurnishing={(val) => {
                  setFurnishing(val);
                  setPage(1);
                }}
                onReset={handleResetFilters}
              />
            </div>
          </div>

          {/* Property Cards Grid */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 animate-pulse"
                  >
                    <div className="aspect-[16/10] bg-slate-200 rounded-xl" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-14 bg-slate-100 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  🏠
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No properties matched your criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try widening your price range, clearing filters, or searching for another city.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => {
                        setPage(pNum);
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition shadow-xs ${
                        page === pNum
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Filter Properties</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <FilterSidebar
              propertyType={propertyType}
              setPropertyType={(val) => {
                setPropertyType(val);
                setPage(1);
              }}
              city={city}
              setCity={(val) => {
                setCity(val);
                setPage(1);
              }}
              priceRange={priceRange}
              setPriceRange={(val) => {
                setPriceRange(val);
                setPage(1);
              }}
              furnishing={furnishing}
              setFurnishing={(val) => {
                setFurnishing(val);
                setPage(1);
              }}
              onReset={handleResetFilters}
            />

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-500">Loading AmarGhor...</div>}>
      <HomeContent />
    </Suspense>
  );
}
