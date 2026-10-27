'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import PropertyListingForm from '@/components/PropertyListingForm';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function NewPropertyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, prompt user to login
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">List Your Property on AmarGhor</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please log in or create a Broker/Owner account to list your PG, flat, or house.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/auth/login?redirect=/property/new"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              Log In to Continue
            </Link>
            <Link
              href="/auth/register?role=seller&redirect=/property/new"
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Create Owner Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>

        <div className="mb-8">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            Owner & Broker Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Create New Property Listing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fill in the details below. Our automatic pricing calculator will transparently calculate brokerage and upfront estimates for buyers.
          </p>
        </div>

        {/* Listing Form */}
        <PropertyListingForm />
      </div>
    </div>
  );
}
