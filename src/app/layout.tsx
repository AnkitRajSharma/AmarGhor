import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://amarghor.onrender.com'),
  title: 'AmarGhor - Smart PG, Flat & Rental Real Estate Platform',
  description:
    'Find and list verified PGs, 1BHK, 2BHK flats, and houses across India. Transparent pricing breakdown, real-time brokerage calculation, and direct owner contacts.',
  icons: {
    icon: '/house.png',
    apple: '/house.png',
  },
  keywords: [
    'AmarGhor',
    'PG in Bangalore',
    'Flat for rent Kolkata',
    'PG for rent',
    '1BHK Flat',
    '2BHK Flat',
    'Zero Brokerage',
    'Co-living space',
  ],
  openGraph: {
    title: 'AmarGhor - Transparent Real Estate & PG Platform',
    description: 'Find verified PGs, flats, and houses with dynamic pricing and zero hidden brokerage.',
    images: [{ url: '/house.png' }],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/house.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
