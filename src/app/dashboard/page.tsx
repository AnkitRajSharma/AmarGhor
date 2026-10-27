'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/pricing';
import {
  Building,
  PlusCircle,
  Eye,
  PhoneCall,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    rentedListings: 0,
    totalViews: 0,
    totalContactReveals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties/user');
      const data = await res.json();
      if (res.ok) {
        setProperties(data.properties || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyProperties();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property listing?')) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p._id !== id));
        setStats((prev) => ({
          ...prev,
          totalListings: prev.totalListings - 1,
        }));
      } else {
        alert('Failed to delete property listing');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'available' ? 'rented' : 'available';
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: nextStatus } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Building className="w-10 h-10 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Owner Dashboard</h2>
          <p className="text-xs text-slate-500">
            Please log in to manage your property listings and see real-time lead analytics.
          </p>
          <Link
            href="/auth/login?redirect=/dashboard"
            className="block w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              Seller & Broker Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your listings, track tenant phone reveals, and control availability.
            </p>
          </div>

          <Link
            href="/property/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Listing</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Listings
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
              {stats.totalListings}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              {stats.activeListings} Active on platform
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              Listing Views
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
              {stats.totalViews}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Total impressions
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              Contact Reveals
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">
              {stats.totalContactReveals}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              Interested tenant leads
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Rented / Sold
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-800 block">
              {stats.rentedListings}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Completed deals
            </span>
          </div>
        </div>

        {/* Listings Table / Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Your Properties</h3>
            <span className="text-xs font-medium text-slate-500">
              {properties.length} Listings
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading properties...
            </div>
          ) : properties.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                You haven&apos;t posted any properties yet
              </p>
              <p className="text-xs text-slate-400">
                Post your PG, Flat, or House in just 2 minutes.
              </p>
              <Link
                href="/property/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                Create First Listing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {properties.map((prop) => {
                const coverImage =
                  prop.images && prop.images.length > 0
                    ? prop.images[0]
                    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={prop._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image
                          src={coverImage}
                          alt={prop.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {prop.propertyType}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              prop.status === 'available'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                          {prop.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {prop.location?.address}, {prop.location?.city}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Pricing & Lead Stats */}
                    <div className="flex items-center gap-6 text-xs text-slate-600 shrink-0">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Base Price</span>
                        <span className="font-bold text-slate-900">
                          {formatINR(prop.price)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">Brokerage</span>
                        <span className="font-semibold text-slate-700">
                          {prop.brokeragePercentage || 0}%
                          {prop.brokerageDiscount > 0 && (
                            <span className="text-rose-600 ml-1">
                              (-{prop.brokerageDiscount}%)
                            </span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 text-emerald-600" /> Leads
                        </span>
                        <span className="font-bold text-emerald-700">
                          {prop.contactRevealsCount || 0}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(prop._id, prop.status)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${
                          prop.status === 'available'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {prop.status === 'available' ? 'Mark Rented' : 'Mark Available'}
                      </button>

                      <Link
                        href={`/property/${prop._id}`}
                        target="_blank"
                        className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        disabled={deletingId === prop._id}
                        onClick={() => handleDelete(prop._id)}
                        className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition disabled:opacity-50"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
