import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';
import '@/models/User';
import { maskPhoneNumber } from '@/lib/utils';
import ImageGallery from '@/components/ImageGallery';
import PricingBreakdownCard from '@/components/PricingBreakdownCard';
import ContactRevealButton from '@/components/ContactRevealButton';
import {
  MapPin,
  Bed,
  Bath,
  Home,
  ShieldCheck,
  CheckCircle,
  Eye,
  ChevronRight,
  Share2,
} from 'lucide-react';
import type { Metadata } from 'next';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  try {
    await connectToDatabase();
    const property = await Property.findById(params.id).lean();

    if (!property) {
      return {
        title: 'Property Not Found | AmarGhor',
      };
    }

    return {
      title: `${property.title} | AmarGhor`,
      description: property.description.substring(0, 160),
      openGraph: {
        title: `${property.title} - Rent in ${property.location.city}`,
        description: property.description.substring(0, 160),
        images: property.images?.length ? [{ url: property.images[0] }] : [],
      },
    };
  } catch {
    return {
      title: 'Property Details | AmarGhor',
    };
  }
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  await connectToDatabase();

  let property: any = null;
  try {
    // Increment view count
    property = await Property.findByIdAndUpdate(
      params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .populate('owner', 'name agencyName email')
      .lean();
  } catch (err) {
    console.error('Error fetching property detail:', err);
  }

  if (!property) {
    notFound();
  }

  const maskedPhone = maskPhoneNumber(property.ownerContact?.phone || '');

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto">
          <Link href="/" className="hover:text-emerald-600 transition flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={`/?propertyType=${property.propertyType}`}
            className="hover:text-emerald-600 transition"
          >
            {property.propertyType}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
            {property.title}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Title & Top Badges Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                {property.propertyType}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-800">
                For {property.listingType}
              </span>
              {property.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Property
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {property.location.address}, {property.location.city}
                {property.location.state ? `, ${property.location.state}` : ''}
                {property.location.pincode ? ` - ${property.location.pincode}` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 shadow-xs">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>{property.viewsCount || 1} views</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Images, Specs, Description, Amenities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <ImageGallery images={property.images} title={property.title} />

            {/* Quick Specs Strip */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Furnishing
                </span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">
                  {property.furnishing || 'Semi-Furnished'}
                </span>
              </div>

              {property.propertyType === 'PG' ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Occupancy
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-1 block">
                    {property.roomSharing || 'Private'}
                  </span>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-emerald-600" />
                      Bedrooms
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">
                      {property.bedrooms || 1} BHK
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-emerald-600" />
                      Bathrooms
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">
                      {property.baths || 1} Baths
                    </span>
                  </div>
                </>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Status
                </span>
                <span className="text-sm font-bold text-emerald-700 mt-1 block capitalize">
                  {property.status || 'Available'}
                </span>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
              <h3 className="text-lg font-bold text-slate-900">
                About this Property
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Amenities & Facilities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Neighborhood */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
              <h3 className="text-lg font-bold text-slate-900">
                Neighborhood & Address
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">{property.location.address}</p>
                    <p className="text-slate-500">
                      City: {property.location.city}
                      {property.location.landmark && ` • Landmark: ${property.location.landmark}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Sticky Dynamic Pricing Breakdown & Reveal Contact */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Dynamic Cost Calculator Card */}
              <PricingBreakdownCard
                price={property.price}
                brokeragePercentage={property.brokeragePercentage}
                brokerageDiscount={property.brokerageDiscount}
              />

              {/* Reveal Contact Button Card */}
              <ContactRevealButton
                propertyId={property._id.toString()}
                initialPhone={maskedPhone}
                contactName={property.ownerContact?.name || property.owner?.name || 'Owner'}
                isInitiallyMasked={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
