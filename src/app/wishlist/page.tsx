'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import PropertyCard, { PropertyCardData } from '@/components/PropertyCard';

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProperties = async () => {
      if (wishlistIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/wishlist?ids=${wishlistIds.join(',')}`);
        const data = await res.json();
        if (res.ok) {
          setProperties(data.wishlist || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProperties();
  }, [wishlistIds]);

  return (
    <div className="min-h-screen bg-slate-50/70 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
            Saved Homes
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Your Wishlist ({wishlistIds.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Properties you have marked with a heart to compare or review later.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-[16/10] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore apartments, PGs, and villas and tap the heart icon to save listings here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              Browse Properties
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
