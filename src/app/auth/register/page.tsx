'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserCheck, Building, AlertCircle } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';
  const redirect = searchParams.get('redirect') || '/';

  const { signup } = useAuth();

  const [role, setRole] = useState<'buyer' | 'seller'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signup({
        name,
        email,
        password,
        role,
        phone,
        agencyName: role === 'seller' ? agencyName : undefined,
      });

      if (result.success) {
        router.push(role === 'seller' ? '/dashboard' : redirect);
        router.refresh();
      } else {
        setError(result.message || 'Failed to create account');
      }
    } catch {
      setError('An unexpected error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto p-2">
            <Image
              src="/house.png"
              alt="AmarGhor"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Join Amar<span className="text-emerald-600">Ghor</span>
          </h2>
          <p className="text-xs text-slate-500">
            Create an account to discover homes or list your rental properties
          </p>
        </div>

        {/* Dual Role Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            I want to use AmarGhor as:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                role === 'buyer'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <UserCheck
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  role === 'buyer' ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">
                  Buyer / Tenant
                </span>
                <span className="block text-[11px] text-slate-500 leading-tight mt-0.5">
                  Browse, save wishlist & contact owners
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                role === 'seller'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <Building
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  role === 'seller' ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">
                  Broker / Owner
                </span>
                <span className="block text-[11px] text-slate-500 leading-tight mt-0.5">
                  List PGs & flats, manage leads & brokerage
                </span>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sen"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password (Min 6 chars) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          {/* Role specific inputs */}
          {role === 'seller' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Agency / Business Name (Optional)
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. Prime Realty / Direct Landlord"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98301 23456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 transition"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              `Create ${role === 'seller' ? 'Owner / Broker' : 'Buyer'} Account`
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link
            href={`/auth/login${redirect ? `?redirect=${redirect}` : ''}`}
            className="font-bold text-emerald-600 hover:text-emerald-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
