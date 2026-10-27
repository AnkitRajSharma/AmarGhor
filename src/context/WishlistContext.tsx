'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (propertyId: string) => boolean;
  toggleWishlist: (propertyId: string) => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('amarghor_wishlist');
      if (saved) {
        setWishlistIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading wishlist from localStorage', e);
    }
  }, []);

  // Save to localStorage when wishlistIds changes
  useEffect(() => {
    try {
      localStorage.setItem('amarghor_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error('Error saving wishlist to localStorage', e);
    }
  }, [wishlistIds]);

  const isInWishlist = (propertyId: string) => {
    return wishlistIds.includes(propertyId);
  };

  const toggleWishlist = async (propertyId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });

    // If logged in, sync to server
    if (user) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId }),
        });
      } catch (err) {
        console.error('Failed to sync wishlist with server', err);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        count: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
