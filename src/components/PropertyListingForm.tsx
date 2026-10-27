'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle,
  Building2,
  Sparkles,
  Calculator,
  Eye,
} from 'lucide-react';
import { calculatePricing, formatINR } from '@/lib/pricing';

export interface PropertyFormData {
  title: string;
  description: string;
  propertyType: 'PG' | '1BHK' | '2BHK' | '3BHK' | 'Flat' | 'House' | 'Room';
  listingType: 'Rent' | 'Sale' | 'PG/Co-Living';
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  price: number;
  brokeragePercentage: number;
  brokerageDiscount: number;
  furnishing: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  bedrooms: number;
  baths: number;
  roomSharing: string;
  contactName: string;
  contactPhone: string;
  whatsapp: boolean;
  amenities: string[];
}

interface PropertyListingFormProps {
  initialData?: any;
  isEditing?: boolean;
}

const AVAILABLE_AMENITIES = [
  'WiFi',
  'AC',
  'Power Backup',
  'Lift',
  'Parking',
  'Gym',
  'Security',
  'Geyser',
  'RO Water',
  'Balcony',
  'Washing Machine',
  'Housekeeping',
  'Food Included',
  'Pet Friendly',
];

export default function PropertyListingForm({
  initialData,
  isEditing = false,
}: PropertyListingFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      propertyType: initialData?.propertyType || '2BHK',
      listingType: initialData?.listingType || 'Rent',
      address: initialData?.location?.address || '',
      city: initialData?.location?.city || '',
      state: initialData?.location?.state || '',
      pincode: initialData?.location?.pincode || '',
      landmark: initialData?.location?.landmark || '',
      price: initialData?.price || 15000,
      brokeragePercentage: initialData?.brokeragePercentage || 15,
      brokerageDiscount: initialData?.brokerageDiscount || 0,
      furnishing: initialData?.furnishing || 'Semi-Furnished',
      bedrooms: initialData?.bedrooms || 2,
      baths: initialData?.baths || 2,
      roomSharing: initialData?.roomSharing || 'Private',
      contactName: initialData?.ownerContact?.name || '',
      contactPhone: initialData?.ownerContact?.phone || '',
      whatsapp: initialData?.ownerContact?.whatsapp ?? true,
      amenities: initialData?.amenities || ['WiFi', 'Power Backup', 'Security'],
    },
  });

  // Watch values for real-time pricing calculation
  const watchPrice = watch('price', 15000);
  const watchBrokeragePct = watch('brokeragePercentage', 15);
  const watchDiscountPct = watch('brokerageDiscount', 0);
  const watchPropertyType = watch('propertyType', '2BHK');
  const selectedAmenities = watch('amenities') || [];

  const livePricing = calculatePricing(
    Number(watchPrice) || 0,
    Number(watchBrokeragePct) || 0,
    Number(watchDiscountPct) || 0
  );

  // Compress image client-side if needed so it strictly remains < 1MB
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // If already under 800KB, read directly
      if (file.size <= 800 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // If file > 1MB, compress using Canvas
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1600;

          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Canvas context unavailable'));
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with 0.8 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Strict limit: 1 MB
        // If file is > 1MB, compress it first
        const base64 = await compressImage(file);

        // Verify base64 size is strictly < 1MB
        const stringLength = base64.length - (base64.indexOf(',') + 1);
        const approxBytes = Math.ceil((stringLength * 3) / 4);

        if (approxBytes > 1024 * 1024) {
          throw new Error(
            `Image "${file.name}" is too large. Even after compression, it exceeds strictly allowed 1 MB limit.`
          );
        }

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64 }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || `Failed to upload ${file.name}`);
        }

        uploadedUrls.push(data.url);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Image upload failed. Please ensure file is < 1MB.');
    } finally {
      setUploading(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleAmenity = (amenity: string) => {
    const current = [...selectedAmenities];
    const index = current.indexOf(amenity);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(amenity);
    }
    setValue('amenities', current);
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (images.length === 0) {
      setUploadError('Please upload at least 1 image of the property.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      title: data.title,
      description: data.description,
      propertyType: data.propertyType,
      listingType: data.listingType,
      location: {
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        landmark: data.landmark,
      },
      price: Number(data.price),
      brokeragePercentage: Number(data.brokeragePercentage) || 0,
      brokerageDiscount: Number(data.brokerageDiscount) || 0,
      images,
      amenities: data.amenities,
      furnishing: data.furnishing,
      bedrooms: Number(data.bedrooms),
      baths: Number(data.baths),
      roomSharing: data.roomSharing,
      ownerContact: {
        name: data.contactName,
        phone: data.contactPhone,
        whatsapp: data.whatsapp,
      },
    };

    try {
      const endpoint = isEditing
        ? `/api/properties/${initialData._id}`
        : '/api/properties';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to save property listing');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {formError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* 1. Image Upload Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            Property Images
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload high quality photos of rooms, hall, kitchen, and exterior. Strictly under 1 MB per image.
          </p>
        </div>

        {uploadError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Image Previews */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
            >
              <Image
                src={url}
                alt={`Property photo ${idx + 1}`}
                fill
                sizes="250px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                  Cover Photo
                </span>
              )}
            </div>
          ))}

          {/* Upload Button Box */}
          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer transition-all p-3 text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600 text-xs font-medium">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Add Images</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Max 1 MB each</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 2. Basic Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          Basic Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Property Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Spacious 2BHK Furnished Flat in Salt Lake Sector 5"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition"
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Property Type *
            </label>
            <select
              {...register('propertyType', { required: true })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none bg-white transition"
            >
              <option value="PG">PG / Co-Living</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="Flat">Flat / Apartment</option>
              <option value="House">Independent House / Villa</option>
              <option value="Room">Single Room</option>
            </select>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Listing Category *
            </label>
            <select
              {...register('listingType')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none bg-white transition"
            >
              <option value="Rent">Rent</option>
              <option value="PG/Co-Living">PG / Co-Living</option>
              <option value="Sale">Sale</option>
            </select>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Furnishing Status
            </label>
            <select
              {...register('furnishing')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none bg-white transition"
            >
              <option value="Furnished">Fully Furnished</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>

          {/* Bedrooms & Baths or Sharing */}
          {watchPropertyType === 'PG' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Room Sharing Type
              </label>
              <select
                {...register('roomSharing')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none bg-white transition"
              >
                <option value="Single Private">Single Private Room</option>
                <option value="Double Sharing">Double Sharing</option>
                <option value="Triple Sharing">Triple Sharing</option>
                <option value="4+ Sharing">4+ Sharing</option>
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  {...register('bedrooms')}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  {...register('baths')}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm outline-none"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Description *
            </label>
            <textarea
              rows={4}
              placeholder="Highlight special features like sunlight, modular kitchen, society amenities, proximity to transit, food options..."
              {...register('description', { required: 'Description is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition"
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Location Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Location & Address</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Street Address *
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 4B, Greenwood Park, Sector 5"
              {...register('address', { required: 'Address is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm outline-none"
            />
            {errors.address && (
              <p className="text-xs text-rose-500 mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              City *
            </label>
            <input
              type="text"
              placeholder="e.g. Kolkata, Bangalore, Mumbai, Pune..."
              {...register('city', { required: 'City is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm outline-none"
            />
            {errors.city && (
              <p className="text-xs text-rose-500 mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Landmark / Area
            </label>
            <input
              type="text"
              placeholder="e.g. Near Metro Station / Tech Park"
              {...register('landmark')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Pricing & Brokerage with Dynamic Real-time Calculation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            Pricing & Brokerage Setup
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your monthly base rent, standard brokerage percentage, and any promotional discounts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Base Rent */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Base Rent / Price (₹) *
            </label>
            <input
              type="number"
              min="500"
              placeholder="15000"
              {...register('price', {
                required: 'Price is required',
                min: { value: 500, message: 'Price must be at least ₹500' },
              })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm font-semibold outline-none"
            />
            {errors.price && (
              <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>
            )}
          </div>

          {/* Brokerage Percentage */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Brokerage Percentage (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                placeholder="15"
                {...register('brokeragePercentage', {
                  min: { value: 0, message: 'Min 0%' },
                  max: { value: 100, message: 'Max 100%' },
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm font-semibold outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enter 0% for Direct Owner / No Brokerage
            </p>
          </div>

          {/* Brokerage Discount Percentage */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Brokerage Discount (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                placeholder="20"
                {...register('brokerageDiscount', {
                  min: { value: 0, message: 'Min 0%' },
                  max: { value: 100, message: 'Max 100%' },
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm font-semibold outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                % OFF
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Optional promotional discount to attract buyers
            </p>
          </div>
        </div>

        {/* Real-time Buyer Pricing Preview Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-emerald-600" />
            Live Preview (How buyers will see your listing):
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Base Rent</span>
              <span className="text-sm font-bold text-slate-900">
                {formatINR(livePricing.basePrice)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">
                Brokerage ({livePricing.brokeragePercentage}%)
              </span>
              <span className="text-sm font-bold text-slate-700">
                {formatINR(livePricing.rawBrokerage)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">
                Discount ({livePricing.brokerageDiscount}%)
              </span>
              <span className="text-sm font-bold text-emerald-600">
                - {formatINR(livePricing.discountAmount)}
              </span>
            </div>

            <div className="bg-emerald-600 text-white p-3 rounded-lg shadow-xs">
              <span className="text-emerald-100 block text-[11px]">
                Total Estimated Cost
              </span>
              <span className="text-base font-black">
                {formatINR(livePricing.totalEstimatedCost)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Amenities Selection */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Amenities & Facilities
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select all the amenities available in this property.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {AVAILABLE_AMENITIES.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`text-xs px-3.5 py-2 rounded-xl border font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Contact Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Seller / Contact Info</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your phone number will remain masked by default and only revealed when interested tenants click &quot;Reveal Contact&quot;.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Person Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Rajesh Kumar"
              {...register('contactName', { required: 'Contact name is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm outline-none"
            />
            {errors.contactName && (
              <p className="text-xs text-rose-500 mt-1">{errors.contactName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number (Call/WhatsApp) *
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 98301 23456"
              {...register('contactPhone', { required: 'Phone number is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 text-sm outline-none"
            />
            {errors.contactPhone && (
              <p className="text-xs text-rose-500 mt-1">{errors.contactPhone.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="whatsapp"
              {...register('whatsapp')}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="whatsapp" className="text-xs font-medium text-slate-700 cursor-pointer">
              Enable WhatsApp chat link for this phone number
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
        >
          {submitting
            ? 'Publishing Listing...'
            : isEditing
            ? 'Save Changes'
            : 'Publish Listing on AmarGhor'}
        </button>
      </div>
    </form>
  );
}
