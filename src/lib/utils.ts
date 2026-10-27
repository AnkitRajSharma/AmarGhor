import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function maskPhoneNumber(phone: string): string {
  if (!phone) return 'Hidden';
  const clean = phone.trim();
  if (clean.length < 6) return 'XXXX-XXXX';
  // Keep first 3 chars, mask middle, show last 2 chars
  return clean.substring(0, 3) + ' ••••• ' + clean.substring(clean.length - 2);
}
