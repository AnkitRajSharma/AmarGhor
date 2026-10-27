import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-1.5">
                <Image
                  src="/house.png"
                  alt="AmarGhor"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Amar<span className="text-emerald-500">Ghor</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              India&apos;s most transparent PG, Flat, and Rental marketplace. Dynamic brokerage calculator, 100% verified owners, and zero hidden costs.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Owner & Broker Network</span>
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              Explore Top Cities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/?city=Kolkata" className="hover:text-emerald-400 transition">
                  Rent in Kolkata (Salt Lake, New Town)
                </Link>
              </li>
              <li>
                <Link href="/?city=Bangalore" className="hover:text-emerald-400 transition">
                  Rent in Bangalore (Koramangala, HSR)
                </Link>
              </li>
              <li>
                <Link href="/?city=Mumbai" className="hover:text-emerald-400 transition">
                  Rent in Mumbai (Andheri, Bandra)
                </Link>
              </li>
              <li>
                <Link href="/?city=Delhi NCR" className="hover:text-emerald-400 transition">
                  Rent in Delhi NCR (Gurgaon, Noida)
                </Link>
              </li>
              <li>
                <Link href="/?city=Hyderabad" className="hover:text-emerald-400 transition">
                  Rent in Hyderabad (Hitec City, Madhapur)
                </Link>
              </li>
              <li>
                <Link href="/?city=Pune" className="hover:text-emerald-400 transition">
                  Rent in Pune (Hinjewadi, Wakad)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Listing Types
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/?propertyType=PG" className="hover:text-emerald-400 transition">
                  Student & Executive PGs
                </Link>
              </li>
              <li>
                <Link href="/?propertyType=1BHK" className="hover:text-emerald-400 transition">
                  Compact 1 BHK Flats
                </Link>
              </li>
              <li>
                <Link href="/?propertyType=2BHK" className="hover:text-emerald-400 transition">
                  Family 2 BHK Apartments
                </Link>
              </li>
              <li>
                <Link href="/?propertyType=House" className="hover:text-emerald-400 transition">
                  Independent Villas & Houses
                </Link>
              </li>
              <li>
                <Link href="/?propertyType=Room" className="hover:text-emerald-400 transition">
                  Single Rooms with Attached Bath
                </Link>
              </li>
            </ul>
          </div>

          {/* Owners & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              For Property Owners
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              List your PG, Flat, or House with real-time brokerage transparency and reach thousands of verified tenants daily.
            </p>
            <Link
              href="/property/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              Post Free Listing
            </Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AmarGhor Real Estate. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for high performance with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>smooth 120 FPS transitions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
