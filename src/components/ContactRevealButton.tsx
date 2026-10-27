'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Unlock, MessageSquare, Copy, Check, UserCheck } from 'lucide-react';

interface ContactRevealButtonProps {
  propertyId: string;
  initialPhone?: string;
  contactName?: string;
  isInitiallyMasked?: boolean;
}

export default function ContactRevealButton({
  propertyId,
  initialPhone = '+91 98XXX XXXXX',
  contactName = 'Property Owner',
  isInitiallyMasked = true,
}: ContactRevealButtonProps) {
  const [isRevealed, setIsRevealed] = useState(!isInitiallyMasked);
  const [loading, setLoading] = useState(false);
  const [revealedData, setRevealedData] = useState<{
    phone: string;
    whatsappUrl?: string;
    telUrl?: string;
    name?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReveal = async () => {
    if (isRevealed) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/properties/${propertyId}/reveal-contact`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.revealedContact) {
        setRevealedData(data.revealedContact);
        setIsRevealed(true);
      } else {
        // Fallback
        setIsRevealed(true);
      }
    } catch (err) {
      console.error('Failed to reveal contact:', err);
      setIsRevealed(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayPhone = revealedData?.phone || initialPhone;
  const displayName = revealedData?.name || contactName;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            Owner / Broker Details
          </span>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            {displayName}
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </h4>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="masked"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Masked display */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>{initialPhone}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Hidden for privacy
              </span>
            </div>

            {/* Prominent Call Button */}
            <button
              type="button"
              onClick={handleReveal}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Phone className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>Reveal Contact & Call Owner</span>
                  <Unlock className="w-4 h-4 ml-1 opacity-70" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Direct connection with verified seller. No middleman charges.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-3"
          >
            {/* Revealed phone number */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span className="text-base font-extrabold text-emerald-950 tracking-wide font-mono">
                  {displayPhone}
                </span>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(displayPhone)}
                title="Copy phone number"
                className="p-1.5 rounded-lg hover:bg-emerald-200/50 text-emerald-800 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Copy className="w-4 h-4 text-emerald-700" />
                )}
              </button>
            </div>

            {/* Quick Action Buttons: Call Now & WhatsApp */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={revealedData?.telUrl || `tel:${displayPhone}`}
                className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Now
              </a>

              <a
                href={
                  revealedData?.whatsappUrl ||
                  `https://wa.me/91${displayPhone.replace(/\D/g, '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>

            {copied && (
              <p className="text-xs text-emerald-700 font-medium text-center animate-fade-in">
                ✓ Phone number copied to clipboard!
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
