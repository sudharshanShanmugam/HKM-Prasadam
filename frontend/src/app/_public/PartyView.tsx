'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { MealType } from '@/types';
import {
  S, SD, SP, GOLD, CREAM, BROWN, TXT_MID, TXT_LIGHT, BORDER,
  HEADER_H, FIELD_SX, mealIcon,
} from './constants';
import type { View } from './constants';

interface PartyViewProps {
  ptyName: string; setPtyName: (v: string) => void;
  ptyMobile: string; setPtyMobile: (v: string) => void;
  ptyEmail: string; setPtyEmail: (v: string) => void;
  ptyDate: string; setPtyDate: (v: string) => void;
  ptyAddress: string; setPtyAddress: (v: string) => void;
  ptyMeals: Record<MealType, number>; setPtyMeals: (fn: (prev: Record<MealType, number>) => Record<MealType, number>) => void;
  ptyMenu: string; setPtyMenu: (v: string) => void;
  ptyPrice: string; setPtyPrice: (v: string) => void;
  enquiryLoading: boolean;
  submitParty: () => void;
  onGoTo: (v: View) => void;
}

export default function PartyView({
  ptyName, setPtyName,
  ptyMobile, setPtyMobile,
  ptyEmail, setPtyEmail,
  ptyDate, setPtyDate,
  ptyAddress, setPtyAddress,
  ptyMeals, setPtyMeals,
  ptyMenu, setPtyMenu,
  ptyPrice, setPtyPrice,
  enquiryLoading,
  submitParty,
  onGoTo,
}: PartyViewProps) {
  const minPtyDate = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); })();

  return (
    <Box sx={{ minHeight: '100vh', pt: `${HEADER_H}px`, background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)' }}>
      <Box sx={{ maxWidth: 680, mx: 'auto', px: 2.5, py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, color: BROWN, mb: 0.5 }}>
            Party Booking
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: TXT_LIGHT }}>
            Order prasadam for your special day — delivered to your door
          </Typography>
        </Box>

        <Box sx={{ bgcolor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(60,20,0,0.1)', border: `1px solid rgba(232,98,26,0.12)`, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(to right, ${S}, ${GOLD})` } }}>
          <Box sx={{ p: { xs: '18px 18px', sm: '24px 28px' }, borderBottom: `1px solid ${BORDER}`, bgcolor: '#FDFAF4' }}>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 700, color: BROWN, mb: 0.4 }}>
              🏠 Door Delivery Enquiry
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: TXT_LIGHT }}>
              Admin will confirm your booking within 24–48 hours
            </Typography>
          </Box>

          <Box sx={{ p: { xs: '18px 18px', sm: '24px 28px' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Info banner */}
            <Box sx={{ bgcolor: SP, border: `1px solid rgba(232,98,26,0.25)`, borderRadius: '10px', p: '12px 16px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.82rem', color: SD }}>
                ⏰ Bookings must be placed <strong>at least 7 days</strong> before the event date.
              </Typography>
            </Box>

            {/* Personal Details */}
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TXT_MID, mb: 1.5, pb: 0.75, borderBottom: `1px solid ${BORDER}` }}>
                Personal Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField fullWidth size="small" label="Full Name *"
                  placeholder="Your full name" value={ptyName} onChange={e => setPtyName(e.target.value)} sx={FIELD_SX} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <TextField fullWidth size="small" label="Mobile *"
                    placeholder="10-digit number" slotProps={{ htmlInput: { maxLength: 10 } }}
                    value={ptyMobile} onChange={e => setPtyMobile(e.target.value.replace(/\D/g, ''))} sx={FIELD_SX} />
                  <TextField fullWidth size="small" label="Email"
                    placeholder="Optional" type="email"
                    value={ptyEmail} onChange={e => setPtyEmail(e.target.value)} sx={FIELD_SX} />
                </Box>
              </Box>
            </Box>

            {/* Event Details */}
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TXT_MID, mb: 1.5, pb: 0.75, borderBottom: `1px solid ${BORDER}` }}>
                Event Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <TextField size="small" label="Event Date *"
                    type="date" slotProps={{ htmlInput: { min: minPtyDate }, inputLabel: { shrink: true } }}
                    value={ptyDate} onChange={e => setPtyDate(e.target.value)} sx={{ maxWidth: { xs: '100%', sm: 200 }, ...FIELD_SX }} />
                  <Typography sx={{ fontSize: '0.7rem', color: TXT_LIGHT, mt: 0.5 }}>Minimum 7 days from today</Typography>
                </Box>
                <TextField fullWidth size="small" label="Delivery Address *"
                  placeholder="Full delivery address including landmark" multiline rows={3}
                  value={ptyAddress} onChange={e => setPtyAddress(e.target.value)} sx={FIELD_SX} />

                {/* Plate counts */}
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: TXT_MID, mb: 1 }}>
                    Plate Count per Meal <span style={{ color: S }}>*</span>
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(m => (
                      <Box key={m} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {mealIcon(m)}
                          <Typography sx={{ fontSize: '0.85rem', color: TXT_MID }}>{m}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <IconButton size="small" onClick={() => setPtyMeals(p => ({ ...p, [m]: Math.max(0, p[m] - 5) }))}
                            sx={{ border: `1.5px solid ${BORDER}`, borderRadius: '7px', width: 32, height: 32, '&:hover': { bgcolor: SP, borderColor: S } }}>
                            <RemoveIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                          <TextField
                            size="small"
                            type="number"
                            value={ptyMeals[m] === 0 ? '' : ptyMeals[m]}
                            placeholder="0"
                            onChange={e => {
                              const val = parseInt(e.target.value, 10);
                              setPtyMeals(p => ({ ...p, [m]: isNaN(val) || val < 0 ? 0 : val }));
                            }}
                            slotProps={{ htmlInput: { min: 0, style: { textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' } } }}
                            sx={{
                              width: 64,
                              ...FIELD_SX,
                              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none' },
                              '& input[type=number]': { MozAppearance: 'textfield' },
                            }}
                          />
                          <IconButton size="small" onClick={() => setPtyMeals(p => ({ ...p, [m]: p[m] + 5 }))}
                            sx={{ border: `1.5px solid ${BORDER}`, borderRadius: '7px', width: 32, height: 32, '&:hover': { bgcolor: SP, borderColor: S } }}>
                            <AddIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: TXT_LIGHT, mt: 0.75 }}>Minimum 10 total plates across all meals</Typography>
                </Box>
              </Box>
            </Box>

            {/* Preferences */}
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TXT_MID, mb: 1.5, pb: 0.75, borderBottom: `1px solid ${BORDER}` }}>
                Preferences (Optional)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField fullWidth size="small" label="Preferred Menu" multiline rows={3}
                  placeholder="e.g. Puri Bhaji, Rice Dal Sabzi, Halwa…"
                  value={ptyMenu} onChange={e => setPtyMenu(e.target.value)} sx={FIELD_SX} />
                <TextField fullWidth size="small" label="Preferred Price" type="number"
                  placeholder="e.g. 5000"
                  slotProps={{ htmlInput: { min: 0 }, input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  value={ptyPrice} onChange={e => setPtyPrice(e.target.value)} sx={FIELD_SX} />
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button onClick={submitParty} disabled={enquiryLoading} sx={{
                width: '100%', py: 1.75, borderRadius: '10px',
                background: `linear-gradient(135deg, ${S}, ${GOLD})`,
                color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(232,98,26,0.3)', textTransform: 'none',
                '&:hover': { opacity: 0.92, transform: 'translateY(-1px)' },
                '&.Mui-disabled': { opacity: 0.6 },
                transition: 'all 0.2s',
              }}>
                {enquiryLoading ? 'Submitting…' : '🎂 Submit Enquiry'}
              </Button>
              <Button onClick={() => onGoTo('landing')} sx={{
                width: '100%', py: 1.25, borderRadius: '10px', border: `1.5px solid ${BORDER}`,
                bgcolor: 'transparent', color: TXT_MID, fontSize: '0.84rem', fontWeight: 500,
                textTransform: 'none', '&:hover': { bgcolor: CREAM }, transition: 'all 0.18s',
              }}>
                ← Back to Home
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
