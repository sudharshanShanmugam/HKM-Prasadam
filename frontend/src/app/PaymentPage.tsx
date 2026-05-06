'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { MealType } from '@/types';

// MUI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';

// ── constants ──────────────────────────────────────────────────────────────
const S    = '#E8621A';
const SD   = '#C44D0D';
const SP   = '#FEF0E6';
const GOLD = '#C9920A';
const GP   = '#FFF9E6';
const BR   = '#3B1F0A';
const BR2  = '#5A3A1A';
const MID  = '#9A7A5A';
const UPI_ID = 'hkmchennai@ybl';

function mealIcon(m: MealType) {
  if (m === 'Breakfast') return <FreeBreakfastIcon sx={{ fontSize: 14 }} />;
  if (m === 'Lunch')     return <WbSunnyIcon       sx={{ fontSize: 14 }} />;
  return                        <NightlightIcon    sx={{ fontSize: 14 }} />;
}

// ── props ──────────────────────────────────────────────────────────────────
interface PaymentPageProps {
  regName: string;
  regDate: string;
  regLoc: string;
  regMeals: Record<MealType, number>;
  totalAmount: number;
  payProof: File | null;
  setPayProof: (f: File | null) => void;
  onConfirm: () => void;
  onBack: () => void;
  bookingLoading: boolean;
  successId: string;
  onNewRegistration: () => void;
  onBackToHome: () => void;
}

// ── sub-components ─────────────────────────────────────────────────────────

function BookingSummaryRow({ regName, regDate, regLoc, regMeals, totalAmount }: {
  regName: string; regDate: string; regLoc: string;
  regMeals: Record<MealType, number>; totalAmount: number;
}) {
  const fmtDate = (d: string) => {
    try { return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };
  return (
    <Box sx={{ px: 3, py: 2.5, bgcolor: SP, borderBottom: `1.5px solid rgba(232,98,26,0.15)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Box>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: SD, mb: 0.5 }}>
          Booking Summary
        </Typography>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: BR, lineHeight: 1.2 }}>{regName}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.75rem', color: MID }}>{fmtDate(regDate)}</Typography>
          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#C0B090' }} />
          <Typography sx={{ fontSize: '0.75rem', color: MID }}>{regLoc}</Typography>
          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#C0B090' }} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(m => (regMeals[m] ?? 0) > 0 ? (
              <Box key={m} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, color: SD, fontSize: '0.72rem', fontWeight: 600 }}>
                {mealIcon(m)} {regMeals[m]}
              </Box>
            ) : null)}
          </Box>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: MID, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</Typography>
        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, color: S, lineHeight: 1 }}>
          ₹{totalAmount}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function PaymentPage({
  regName, regDate, regLoc, regMeals, totalAmount,
  payProof, setPayProof,
  onConfirm, onBack, bookingLoading,
  successId, onNewRegistration, onBackToHome,
}: PaymentPageProps) {
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=HKM%20Chennai&am=${totalAmount}&cu=INR&tn=Prasadam%20Coupon`;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging,   setDragging]   = useState(false);
  const [snack,      setSnack]      = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!payProof) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(payProof);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [payProof]);

  function handleFile(file: File | null) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setSnack('File too large. Max 10 MB.'); return; }
    setPayProof(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }

  const BG = 'radial-gradient(ellipse at 20% 50%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)';

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (successId) {
    return (
      <Box sx={{ minHeight: '100vh', background: BG, pt: '72px', pb: 8 }}>
        <Box sx={{ maxWidth: 480, mx: 'auto', px: 2, mt: 5, textAlign: 'center' }}>

          <Box sx={{
            width: 96, height: 96, borderRadius: '50%', mx: 'auto', mb: 3,
            background: 'linear-gradient(135deg, #d4edda, #b8e4c4)',
            border: '3px solid #b2dfbc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.6rem', lineHeight: 1,
            animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            '@keyframes popIn': { from: { transform: 'scale(0)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
          }}>
          </Box>

          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.1rem', fontWeight: 700, color: BR, mb: 1 }}>
            Payment Submitted!
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: BR2, lineHeight: 1.75, mb: 3.5 }}>
            Your screenshot has been received. Our team will verify your UPI payment and confirm your booking shortly.
          </Typography>

          <Box sx={{ bgcolor: '#fff', border: '1.5px solid #E8D8C0', borderRadius: '14px', px: 4, py: 2.5, mb: 3, display: 'inline-block' }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MID, mb: 0.5 }}>
              Booking Reference
            </Typography>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: S, letterSpacing: '0.08em', fontFamily: 'monospace' }}>
              {successId}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3.5 }}>
            <Chip
              icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: GOLD, animation: 'pulse 1.5s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } }, ml: '8px !important' }} />}
              label="Payment Approval Pending"
              sx={{ bgcolor: GP, color: GOLD, fontWeight: 700, fontSize: '0.8rem', border: `1.5px solid #E8C54A`, px: 0.5, height: 36 }}
            />
          </Box>

          {previewUrl && (
            <Box
              component="button"
              onClick={() => window.open(previewUrl, '_blank')}
              sx={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 2,
                bgcolor: '#fff', border: '1.5px solid #E8D8C0',
                borderRadius: '12px', px: 2.5, py: 1.75, mb: 3,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.18s',
                '&:hover': { borderColor: S, bgcolor: SP },
              }}
            >
              <Box component="img" src={previewUrl} alt="" sx={{ width: 52, height: 52, borderRadius: '8px', objectFit: 'cover', border: '1px solid #E8D8C0', flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: BR }}>View Payment Screenshot</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: MID, mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {payProof?.name}
                </Typography>
              </Box>
              <OpenInNewIcon sx={{ color: S, fontSize: 18, flexShrink: 0 }} />
            </Box>
          )}

          <Box sx={{ bgcolor: '#fff', border: '1px solid #E8D8C0', borderRadius: '14px', px: 3, py: 2.5, textAlign: 'left', mb: 4 }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MID, mb: 1.5 }}>
              What happens next?
            </Typography>
            {[
              'Admin verifies your UPI screenshot',
              'Your booking is confirmed in the system',
              'Prasadam coupon shared to your email',
            ].map((text, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: i < 2 ? 1.25 : 0 }}>
                <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: SP, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: '1px' }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: SD }}>{i + 1}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.82rem', color: BR2, lineHeight: 1.6 }}>{text}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={onNewRegistration}
              sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 700, bgcolor: S, boxShadow: '0 4px 14px rgba(232,98,26,0.35)', px: 3.5, '&:hover': { bgcolor: SD } }}
            >
              New Registration
            </Button>
            <Button
              variant="outlined"
              onClick={onBackToHome}
              sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 700, borderColor: '#E8D8C0', color: BR2, px: 3.5, '&:hover': { bgcolor: SP, borderColor: S } }}
            >
              ← Back to Home
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // ── PAYMENT FLOW ──────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
      `}</style>
      <Box sx={{ minHeight: '100vh', background: BG, pt: '80px', pb: 8 }}>
        <Box sx={{ maxWidth: 540, mx: 'auto', px: 2 }}>

          {/* Back button row */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={onBack} size="small" sx={{ bgcolor: '#fff', border: '1.5px solid #E8D8C0', mr: 1.5, '&:hover': { bgcolor: SP, borderColor: S } }}>
              <ArrowBackIcon sx={{ fontSize: 18, color: BR2 }} />
            </IconButton>
            <Typography sx={{ fontSize: '0.82rem', color: MID, fontWeight: 600 }}>Back to Registration</Typography>
          </Box>

          {/* Single card */}
          <Box sx={{ bgcolor: '#fff', border: '1.5px solid #E8D8C0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(59,31,10,0.1)', animation: 'fadeUp 0.3s ease' }}>

            {/* Header */}
            <Box sx={{ background: `linear-gradient(135deg, ${BR}, ${BR2})`, px: 3.5, py: 2.5 }}>
              <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, color: '#fff', mb: 0.25 }}>
                💳 Complete Payment
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
                Scan the QR code, pay, then upload your screenshot below
              </Typography>
            </Box>

            {/* Booking summary */}
            <BookingSummaryRow regName={regName} regDate={regDate} regLoc={regLoc} regMeals={regMeals} totalAmount={totalAmount} />

            {/* ── QR Section ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, pt: 4, pb: 3.5 }}>

              {/* QR with frame */}
              <Box sx={{
                position: 'relative', mb: 3,
                '&::before': {
                  content: '""', position: 'absolute', inset: -8,
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${S}22, ${GOLD}22)`,
                  zIndex: 0,
                },
              }}>
                <Box sx={{
                  position: 'relative', zIndex: 1,
                  bgcolor: '#fff', borderRadius: '16px',
                  border: `3px solid ${BR}`,
                  p: '10px',
                  boxShadow: '0 6px 28px rgba(59,31,10,0.18)',
                }}>
                  <QRCodeSVG value={upiLink} size={200} fgColor={BR} />
                </Box>
              </Box>

              {/* Amount badge */}
              <Box sx={{
                bgcolor: SP, border: `2px solid ${S}`,
                borderRadius: '50px', px: 3, py: 1,
                display: 'flex', alignItems: 'center', gap: 1,
              }}>
                <Typography sx={{ fontSize: '0.78rem', color: MID, fontWeight: 600 }}>Pay exactly</Typography>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 700, color: S, lineHeight: 1 }}>
                  ₹{totalAmount}
                </Typography>
              </Box>
            </Box>

            {/* Divider */}
            <Divider sx={{ mx: 3 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: MID, textTransform: 'uppercase', letterSpacing: '0.08em', px: 1 }}>
                Then upload your payment screenshot
              </Typography>
            </Divider>

            {/* ── Upload Section ── */}
            <Box sx={{ px: 3.5, pt: 3, pb: 3 }}>

              {/* Drop zone */}
              <Box
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                sx={{
                  position: 'relative', borderRadius: '14px', mb: 3,
                  border: `2px dashed ${dragging ? S : payProof ? S : '#D4C4B0'}`,
                  bgcolor: dragging ? SP : payProof ? `${SP}99` : '#FDFAF6',
                  cursor: 'pointer', overflow: 'hidden',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: S, bgcolor: SP },
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files?.[0] ?? null)}
                />

                {payProof && previewUrl ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, gap: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Box component="img" src={previewUrl} alt="Proof preview" sx={{
                        maxHeight: 200, maxWidth: '100%', borderRadius: '10px',
                        border: `2px solid ${S}`, boxShadow: '0 4px 16px rgba(232,98,26,0.2)',
                        objectFit: 'contain', display: 'block',
                      }} />
                      <Box sx={{
                        position: 'absolute', top: 8, right: 8,
                        bgcolor: '#2D7A3A', borderRadius: '50%', width: 24, height: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckIcon sx={{ fontSize: 14, color: '#fff' }} />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#2D7A3A' }}>
                        Screenshot selected ✓
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: MID, mt: 0.25 }}>
                        {payProof.name} · {(payProof.size / 1024).toFixed(0)} KB
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: S, mt: 0.5, fontWeight: 600 }}>
                        Tap to change image
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, px: 3 }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: '14px',
                      bgcolor: SP, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5,
                      animation: dragging ? 'shimmer 0.8s infinite' : 'none',
                    }}>
                      <CloudUploadIcon sx={{ fontSize: 28, color: S }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: BR2, mb: 0.5 }}>
                      {dragging ? 'Drop it here!' : 'Tap to upload or drag & drop'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.73rem', color: MID }}>
                      JPG, PNG, WEBP · Max 10 MB
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Confirm button */}
              <Button
                fullWidth
                variant="contained"
                onClick={onConfirm}
                disabled={!payProof || bookingLoading}
                sx={{
                  borderRadius: '12px', textTransform: 'none',
                  fontWeight: 700, fontSize: '0.95rem', py: 1.75,
                  bgcolor: payProof ? '#2D7A3A' : '#C0B090',
                  boxShadow: payProof ? '0 4px 18px rgba(45,122,58,0.38)' : 'none',
                  '&:hover': { bgcolor: payProof ? '#235E2D' : '#C0B090' },
                  '&.Mui-disabled': { bgcolor: '#D4C8B8', color: '#8A7A6A' },
                  transition: 'all 0.25s',
                }}
                startIcon={bookingLoading ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
              >
                {bookingLoading ? 'Submitting…' : 'Confirm Payment Submission'}
              </Button>

            </Box>

            {/* Bottom note */}
            <Box sx={{ bgcolor: GP, borderTop: '1px solid #F0E4A0', px: 3, py: 1.5 }}>
              <Typography sx={{ fontSize: '0.73rem', color: '#7A5E00', textAlign: 'center' }}>
                📋 Your booking slot is held for <strong>30 minutes</strong>. Complete payment and upload proof within this time.
              </Typography>
            </Box>

          </Box>
        </Box>
      </Box>

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack('')}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
