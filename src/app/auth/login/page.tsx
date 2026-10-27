'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogIn, AlertCircle, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoSeller = () => {
    setEmail('seller@amarghor.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Logo & Heading */}
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
            Welcome to Amar<span className="text-emerald-600">Ghor</span>
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access your listings, saved homes, and contact reveals
          </p>
        </div>

        {/* Demo Account Quick Fill Button */}
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between">
          <div>
            <span className="font-bold text-emerald-900 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Quick Demo Access
            </span>
            <span className="text-[11px] text-emerald-700">
              Demo Broker / Owner Account
            </span>
          </div>
          <button
            type="button"
            onClick={fillDemoSeller}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition"
          >
            Auto Fill
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@amarghor.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don&apos;t have an account?{' '}
          <Link
            href={`/auth/register${redirect ? `?redirect=${redirect}` : ''}`}
            className="font-bold text-emerald-600 hover:text-emerald-700"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
