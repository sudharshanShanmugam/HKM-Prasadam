'use client';

import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import type { MealType } from '@/types';

// ─── Colours ──────────────────────────────────────────────────────────────────
export const S          = '#E8621A';
export const SD         = '#C44D0D';
export const SP         = '#FEF0E6';
export const GOLD       = '#C9920A';
export const GOLD_PALE  = '#FFF9E6';
export const CREAM      = '#FBF6EE';
export const BROWN      = '#3B1F0A';
export const BROWN_MID  = '#6B3A1F';
export const TXT_MID    = '#5A3A1A';
export const TXT_LIGHT  = '#9A7A5A';
export const BORDER     = '#E8D8C0';
export const GREEN      = '#2D7A3A';
export const GREEN_PALE = '#EBF7ED';
export const RED        = '#C0392B';
export const RED_PALE   = '#FDECEA';

// ─── Layout ───────────────────────────────────────────────────────────────────
export const HEADER_H = 68;
export const PRICE: Record<MealType, number> = { Breakfast: 20, Lunch: 40, Dinner: 35 };

// ─── Types ────────────────────────────────────────────────────────────────────
export type View  = 'landing' | 'register' | 'payment' | 'success' | 'bookings' | 'party' | 'party-success';
export type BkTab = 'coupons' | 'party';

// ─── Shared field styles ──────────────────────────────────────────────────────
export const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '9px', fontSize: '0.88rem', bgcolor: '#FDFAF6',
    '& fieldset': { borderColor: BORDER },
    '&:hover fieldset': { borderColor: S },
    '&.Mui-focused fieldset': { borderColor: S },
  },
  '& .MuiInputLabel-root': { fontSize: '0.83rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: SD },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function mealIcon(m: MealType) {
  if (m === 'Breakfast') return <FreeBreakfastIcon sx={{ fontSize: 15, color: S }} />;
  if (m === 'Lunch')     return <WbSunnyIcon       sx={{ fontSize: 15, color: GOLD }} />;
  return                        <NightlightIcon    sx={{ fontSize: 15, color: '#7C3AED' }} />;
}

export function fmtDate(d: string) {
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return d;
  }
}
