'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { QRCodeSVG } from 'qrcode.react';
import type { MealType, PrasadamBooking } from '@/types';
import {
  S, SD, SP, BROWN, TXT_MID, TXT_LIGHT, BORDER, CREAM,
  RED, RED_PALE, mealIcon,
} from './constants';

interface CouponModalProps {
  couponBooking: PrasadamBooking;
  onClose: () => void;
}

export default function CouponModal({ couponBooking, onClose }: CouponModalProps) {
  const couponActiveMeals = (['Breakfast', 'Lunch', 'Dinner'] as MealType[]).filter(m => couponBooking.meals[m] > 0);
  const couponTotalQty    = couponActiveMeals.reduce((s, m) => s + couponBooking.meals[m], 0);
  const couponIsPending   = couponBooking.status === 'pending';
  const couponIsDeclined  = couponBooking.status === 'declined';
  const couponLongDate    = new Date(couponBooking.date + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{
        paper:    { sx: { borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(30,10,0,0.5)', m: { xs: 1.5, sm: 2 } } },
        backdrop: { sx: { bgcolor: 'rgba(20,8,2,0.72)' } },
      }}>

      {/* ── TICKET HEADER ── */}
      <Box sx={{ background: 'linear-gradient(150deg, #3B1F0A 0%, #7B3A10 50%, #C44D0D 100%)', px: { xs: 2.5, sm: 3 }, pt: 2.5, pb: 3, textAlign: 'center', position: 'relative' }}>
        <IconButton size="small" onClick={onClose}
          sx={{ position: 'absolute', top: 10, right: 10, color: 'rgba(255,255,255,0.55)', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.18)' } }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>

        {/* Logo */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '10px', px: 1.5, py: 0.75 }}>
            <Box component="img" src="/iskcon-logo.png" alt="ISKCON" sx={{ height: { xs: 36, sm: 42 }, width: 'auto', objectFit: 'contain', display: 'block' }} />
          </Box>
        </Box>

        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1.5rem', sm: '1.75rem' }, fontWeight: 700, color: '#fff', lineHeight: 1.1, mb: 1.25 }}>
          Prasadam Coupon
        </Typography>

        {/* Date + Location pills */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '50px', px: 1.25, py: 0.35 }}>
            <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.72rem' }, color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>{couponLongDate}</Typography>
          </Box>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '50px', px: 1.25, py: 0.35 }}>
            <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.72rem' }, color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>📍 HKM {couponBooking.location}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── TEAR LINE ── */}
      <Box sx={{ borderTop: '2px dashed rgba(180,130,70,0.35)' }} />

      {/* ── STATUS BADGE (pending / declined only) ── */}
      {(couponIsPending || couponIsDeclined) && (
        <Box sx={{ textAlign: 'center', py: 1, bgcolor: couponIsPending ? '#FFF8E1' : RED_PALE, borderBottom: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: couponIsPending ? '#b45309' : RED }}>
            {couponIsPending ? '⏳ Pending Admin Approval' : '❌ Booking Declined'}
          </Typography>
        </Box>
      )}

      {/* ── TICKET BODY ── */}
      <DialogContent sx={{ px: 0, py: 0, bgcolor: '#FDFAF4' }}>

        {/* Detail rows */}
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 1.5, pb: 0.5 }}>
          {[
            { label: 'Pilgrim Name', value: couponBooking.name },
            { label: 'Location',    value: `HKM ${couponBooking.location}` },
            { label: 'Meals', value: (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {couponActiveMeals.map(m => (
                  <Box key={m} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, px: 0.75, py: 0.25, borderRadius: '6px',
                    bgcolor: m === 'Breakfast' ? '#FEF3C7' : m === 'Lunch' ? '#FFF9E6' : '#EDE9FE',
                    color: m === 'Breakfast' ? '#92400E' : m === 'Lunch' ? '#78350F' : '#4C1D95',
                  }}>
                    {mealIcon(m)}
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{m} ×{couponBooking.meals[m]}</Typography>
                  </Box>
                ))}
              </Box>
            )},
            { label: 'Persons',     value: `${couponTotalQty} person${couponTotalQty !== 1 ? 's' : ''}` },
            { label: 'Amount Paid', value: (
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: S }}>₹{couponBooking.total}/-</Typography>
            )},
          ].map(({ label, value }, i, arr) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, py: 1.25, borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT_LIGHT, flexShrink: 0 }}>{label}</Typography>
              {typeof value === 'string'
                ? <Typography sx={{ fontSize: { xs: '0.82rem', sm: '0.88rem' }, fontWeight: 600, color: BROWN, textAlign: 'right' }}>{value}</Typography>
                : value}
            </Box>
          ))}
        </Box>

        {/* ── QR SECTION ── */}
        <Box sx={{ mx: { xs: 2, sm: 2.5 }, mt: 1.5, mb: 2, borderRadius: '14px', bgcolor: CREAM, border: `1.5px dashed ${BORDER}`, p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ bgcolor: '#fff', p: { xs: 0.75, sm: 1 }, borderRadius: '10px', border: `1.5px solid ${BORDER}`, flexShrink: 0, boxShadow: '0 2px 8px rgba(60,20,0,0.08)' }}>
            <QRCodeSVG value={couponBooking.id} size={80} fgColor={BROWN} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TXT_LIGHT, mb: 0.4 }}>Coupon ID</Typography>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1.2rem', sm: '1.4rem' }, fontWeight: 700, color: S, lineHeight: 1, wordBreak: 'break-all' }}>{couponBooking.id}</Typography>
            <Typography sx={{ fontSize: '0.68rem', color: TXT_LIGHT, mt: 0.5, lineHeight: 1.4 }}>Scan or show this ID at the prasadam counter</Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* ── ACTIONS ── */}
      <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2, display: 'flex', gap: 1.25, borderTop: `1px solid ${BORDER}`, bgcolor: '#fff' }}>
        <Button onClick={onClose} fullWidth sx={{ py: 1.25, borderRadius: '12px', border: `1.5px solid ${BORDER}`, color: TXT_MID, textTransform: 'none', fontWeight: 600, fontSize: '0.88rem', '&:hover': { bgcolor: CREAM } }}>
          Close
        </Button>
        <Button onClick={() => window.print()} fullWidth startIcon={<DownloadIcon sx={{ fontSize: '16px !important' }} />}
          sx={{ py: 1.25, borderRadius: '12px', bgcolor: S, color: '#fff', textTransform: 'none', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 4px 14px rgba(232,98,26,0.3)', '&:hover': { bgcolor: SD } }}>
          Save
        </Button>
      </Box>
    </Dialog>
  );
}
