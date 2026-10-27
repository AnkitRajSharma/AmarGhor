'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Heart,
  PlusCircle,
  Menu,
  X,
  User,
  LogOut,
  Building,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* App Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="relative w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-1.5 shadow-xs group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/house.png"
              alt="AmarGhor Logo"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight flex items-center">
              Amar<span className="text-emerald-600">Ghor</span>
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
              Smart Homes & PG
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <Link
            href="/"
            className={`hover:text-emerald-600 transition-colors ${
              pathname === '/' ? 'text-emerald-600 font-bold' : ''
            }`}
          >
            Explore Listings
          </Link>

          <Link
            href="/?propertyType=PG"
            className="hover:text-emerald-600 transition-colors flex items-center gap-1.5"
          >
            <span>PG & Co-Living</span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
              Hot
            </span>
          </Link>

          {user?.role === 'seller' && (
            <Link
              href="/dashboard"
              className={`hover:text-emerald-600 transition-colors flex items-center gap-1.5 ${
                pathname === '/dashboard' ? 'text-emerald-600 font-bold' : ''
              }`}
            >
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Owner Dashboard</span>
            </Link>
          )}

          <Link
            href="/wishlist"
            className={`hover:text-emerald-600 transition-colors flex items-center gap-1.5 relative ${
              pathname === '/wishlist' ? 'text-emerald-600 font-bold' : ''
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
              }`}
            />
            <span>Saved</span>
            {wishlistCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="hidden md:flex items-center gap-3.5">
          {/* Post Property CTA */}
          <Link
            href={user ? '/property/new' : '/auth/login?redirect=/property/new'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Property</span>
          </Link>

          {/* User Profile or Login */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left text-xs">
                  <span className="font-bold text-slate-800 block truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block capitalize">
                    {user.role === 'seller' ? 'Owner / Broker' : 'Buyer'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs font-medium"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-slate-400 truncate">{user.email}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      {user.role === 'seller' ? 'Broker / Owner' : 'Verified Buyer'}
                    </span>
                  </div>

                  {user.role === 'seller' && (
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <Building className="w-4 h-4 text-slate-500" />
                      My Property Listings
                    </Link>
                  )}

                  <Link
                    href="/wishlist"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    <Heart className="w-4 h-4 text-slate-500" />
                    Saved Properties ({wishlistCount})
                  </Link>

                  <button
                    type="button"
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/wishlist"
            className="p-2 text-slate-600 hover:text-emerald-600 relative"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-emerald-600"
          >
            Explore Listings
          </Link>

          <Link
            href="/?propertyType=PG"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-emerald-600"
          >
            PG & Co-Living
          </Link>

          {user?.role === 'seller' && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 hover:text-emerald-600"
            >
              Owner Dashboard
            </Link>
          )}

          <Link
            href="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-slate-800 hover:text-emerald-600"
          >
            <span>Saved Wishlist</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
              {wishlistCount}
            </span>
          </Link>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              href={user ? '/property/new' : '/auth/login?redirect=/property/new'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Post Property
            </Link>

            {user ? (
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="w-full py-2.5 text-center text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
