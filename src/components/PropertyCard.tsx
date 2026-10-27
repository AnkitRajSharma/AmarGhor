'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Bed, Bath, ShieldCheck, Tag, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { calculatePricing, formatINR } from '@/lib/pricing';

export interface PropertyCardData {
  _id: string;
  title: string;
  description: string;
  propertyType: string;
  listingType?: string;
  location: {
    address: string;
    city: string;
    state?: string;
  };
  price: number;
  brokeragePercentage?: number;
  brokerageDiscount?: number;
  images: string[];
  amenities?: string[];
  furnishing?: string;
  bedrooms?: number;
  baths?: number;
  roomSharing?: string;
  isVerified?: boolean;
}

interface PropertyCardProps {
  property: PropertyCardData;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isSaved = isInWishlist(property._id);

  const pricing = calculatePricing(
    property.price,
    property.brokeragePercentage || 0,
    property.brokerageDiscount || 0
  );

  const mainImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden will-change-transform"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={mainImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/95 text-white shadow-md backdrop-blur-xs">
              {property.propertyType}
            </span>
            {property.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-white/90 text-emerald-800 shadow-sm backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(property._id);
            }}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            className="pointer-events-auto p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-rose-500 shadow-md backdrop-blur-xs transition-all duration-200 transform active:scale-90"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
              }`}
            />
          </button>
        </div>

        {/* Bottom Image Overlay Details */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-medium drop-shadow-md">
            {property.propertyType === 'PG' ? (
              <span className="bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                {property.roomSharing || 'Co-living'}
              </span>
            ) : (
              <>
                {property.bedrooms ? (
                  <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                    <Bed className="w-3.5 h-3.5" />
                    {property.bedrooms} BHK
                  </span>
                ) : null}
                {property.baths ? (
                  <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                    <Bath className="w-3.5 h-3.5" />
                    {property.baths} Bath
                  </span>
                ) : null}
              </>
            )}
            {property.furnishing && (
              <span className="bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                {property.furnishing}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Location */}
        <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mb-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">
            {property.location.address}, {property.location.city}
          </span>
        </div>

        {/* Title */}
        <Link href={`/property/${property._id}`} className="block group-hover:text-emerald-700 transition-colors">
          <h3 className="font-semibold text-slate-900 text-base line-clamp-1 leading-snug">
            {property.title}
          </h3>
        </Link>

        {/* Amenities Mini-pills */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[11px] font-medium text-slate-400">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Dynamic Pricing Display Box */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Base Rent</span>
              <span className="text-lg font-bold text-slate-900">
                {formatINR(pricing.basePrice)}
                <span className="text-xs font-normal text-slate-500"> /mo</span>
              </span>
            </div>

            {/* Brokerage calculation badge */}
            <div className="text-right">
              {pricing.brokeragePercentage === 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Tag className="w-3 h-3" />
                  0% Zero Brokerage
                </span>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-medium text-slate-500">
                    Brokerage ({pricing.brokeragePercentage}%)
                  </span>
                  <div className="flex items-center gap-1 text-xs">
                    {pricing.brokerageDiscount > 0 && (
                      <span className="text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded text-[10px]">
                        -{pricing.brokerageDiscount}% OFF
                      </span>
                    )}
                    <span className="font-semibold text-slate-800">
                      {formatINR(pricing.finalBrokerage)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total Estimated Cost Highlight */}
          <div className="mt-2 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-xl p-2.5 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-emerald-900 block">
                Total Initial Outlay
              </span>
              <span className="text-[10px] text-emerald-700">
                (Base Price + Brokerage)
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-emerald-700">
                {formatINR(pricing.totalEstimatedCost)}
              </span>
            </div>
          </div>
        </div>

        {/* View Details Action */}
        <Link
          href={`/property/${property._id}`}
          className="mt-3.5 inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold tracking-wide transition-all duration-200 active:scale-[0.99] shadow-xs"
        >
          View Details & Price Breakdown
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
