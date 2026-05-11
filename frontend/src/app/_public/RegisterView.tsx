'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { MealType } from '@/types';
import {
  S, SD, SP, GOLD, CREAM, BROWN, TXT_MID, TXT_LIGHT, BORDER,
  HEADER_H, PRICE, FIELD_SX, mealIcon,
} from './constants';
import type { View } from './constants';

const ERR_SX = { fontSize: '0.72rem', color: '#C0392B', mt: 0.5, ml: 0.25 };

interface Errors {
  name: string; mobile: string; loc: string; date: string; coupons: string;
}

interface RegisterViewProps {
  slotMap: Record<string, MealType[]>;
  menuMap: Record<string, Record<MealType, string>>;
  regName: string; setRegName: (v: string) => void;
  regMobile: string; setRegMobile: (v: string) => void;
  regEmail: string; setRegEmail: (v: string) => void;
  regLoc: 'Thiruvanmiyur' | 'NLBR' | ''; setRegLoc: (v: 'Thiruvanmiyur' | 'NLBR' | '') => void;
  regDate: string; setRegDate: (v: string) => void;
  regMeals: Record<MealType, number>; setRegMeals: (v: Record<MealType, number>) => void;
  proceedToPayment: () => void;
  setMenuModal: (v: { meal: MealType; text: string } | null) => void;
  onGoTo: (v: View) => void;
}

export default function RegisterView({
  slotMap, menuMap,
  regName, setRegName,
  regMobile, setRegMobile,
  regEmail, setRegEmail,
  regLoc, setRegLoc,
  regDate, setRegDate,
  regMeals, setRegMeals,
  proceedToPayment,
  setMenuModal,
  onGoTo,
}: RegisterViewProps) {
  const availDates    = Object.keys(slotMap).sort();
  const selectedMeals = regDate ? (slotMap[regDate] ?? []) : [];
  const totalCoupons  = Object.values(regMeals).reduce((a, b) => a + b, 0);
  const totalAmount   = (Object.entries(regMeals) as [MealType, number][]).reduce((s, [m, q]) => s + PRICE[m] * q, 0);

  const [errors, setErrors] = useState<Errors>({ name: '', mobile: '', loc: '', date: '', coupons: '' });

  function clearErr(field: keyof Errors) {
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  }

  function validate(): boolean {
    const e: Errors = { name: '', mobile: '', loc: '', date: '', coupons: '' };
    if (!regName.trim())              e.name    = 'Full name is required';
    if (!regMobile)                   e.mobile  = 'Mobile number is required';
    else if (!/^\d{10}$/.test(regMobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (!regLoc)                      e.loc     = 'Please select a location';
    if (!regDate)                     e.date    = 'Please select an event date';
    if (regDate && totalCoupons < 1)  e.coupons = 'Select at least 1 coupon to proceed';
    setErrors(e);
    return !Object.values(e).some(Boolean);
  }

  function handleProceed() {
    if (validate()) proceedToPayment();
  }

  return (
    <Box sx={{
      minHeight: '100vh', pt: `${HEADER_H}px`,
      background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)',
    }}>
      {/* Page header */}
      <Box sx={{ textAlign: 'center', pt: 4.5, pb: 1, px: { xs: 2.5, md: 5 } }}>
        <Box component="img" src="/iskcon-logo.png" alt="ISKCON Thiruvanmiyur Chennai" sx={{ height: 64, display: 'block', mx: 'auto', mb: 2.75, objectFit: 'contain' }} />
        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 700, color: BROWN, mb: 1 }}>
          Prasadam Coupon Booking
        </Typography>
        <Typography sx={{ fontSize: '0.88rem', color: '#888' }}>
          Fill in your details to reserve your sacred meal coupon
        </Typography>
      </Box>

      {/* Form card */}
      <Box sx={{ maxWidth: 680, mx: 'auto', px: 2.5, pt: 3.5, pb: 6 }}>
        <Box sx={{
          bgcolor: '#fff', borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(60,20,0,0.1)',
          p: { xs: '22px 18px', sm: '32px 36px' },
          border: '1px solid rgba(232,98,26,0.12)',
          position: 'relative',
          '&::before': {
            content: '""', position: 'absolute', top: 0, left: 0, right: 0,
            height: '4px', borderRadius: '20px 20px 0 0',
            background: `linear-gradient(to right, ${S}, ${GOLD})`,
          },
        }}>

          {/* Step 1 */}
          <Box sx={{ mb: 1 }}>
            <Box component="span" sx={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', bgcolor: SP, color: SD, px: 1.5, py: 0.4, borderRadius: '50px' }}>
              Step 1 — Personal Details
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
            {/* Name */}
            <Box>
              <TextField fullWidth size="small" label="Full Name *"
                placeholder="e.g. Radhakrishna Das" value={regName}
                error={!!errors.name}
                onChange={e => { setRegName(e.target.value); clearErr('name'); }}
                sx={FIELD_SX} />
              {errors.name && <Typography sx={ERR_SX}>{errors.name}</Typography>}
            </Box>

            {/* Mobile */}
            <Box>
              <TextField fullWidth size="small" label="Mobile Number *"
                placeholder="10-digit mobile" slotProps={{ htmlInput: { maxLength: 10 } }}
                value={regMobile} error={!!errors.mobile}
                onChange={e => { setRegMobile(e.target.value.replace(/\D/g, '')); clearErr('mobile'); }}
                sx={FIELD_SX} />
              {errors.mobile && <Typography sx={ERR_SX}>{errors.mobile}</Typography>}
            </Box>
          </Box>

          <TextField fullWidth size="small" label="Email Address"
            placeholder="e.g. devotee@example.com" type="email"
            value={regEmail} onChange={e => setRegEmail(e.target.value)}
            sx={{ mb: 2, ...FIELD_SX }} />

          <Divider sx={{ borderColor: BORDER, my: 2.5 }} />

          {/* Step 2 */}
          <Box sx={{ mb: 1 }}>
            <Box component="span" sx={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', bgcolor: SP, color: SD, px: 1.5, py: 0.4, borderRadius: '50px' }}>
              Step 2 — Location
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mb: errors.loc ? 0.5 : 2 }}>
            {(['Thiruvanmiyur', 'NLBR'] as const).map(loc => {
              const active = regLoc === loc;
              return (
                <Box
                  key={loc}
                  onClick={() => { setRegLoc(loc); clearErr('loc'); }}
                  sx={{
                    flex: 1,
                    py: 0.75,
                    px: { xs: 1, sm: 1.5 },
                    borderRadius: '10px', cursor: 'pointer',
                    border: `1.5px solid ${errors.loc ? '#C0392B' : active ? S : BORDER}`,
                    bgcolor: active ? SP : '#fff',
                    transition: 'all 0.18s',
                    display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0.75,
                    '&:hover': { borderColor: S, bgcolor: SP },
                  }}
                >
                  <Typography sx={{ fontSize: '0.95rem', lineHeight: 1 }}>📍</Typography>
                  <Typography sx={{
                    fontSize: { xs: '0.78rem', sm: '0.85rem' },
                    fontWeight: active ? 700 : 500,
                    color: active ? SD : TXT_MID,
                    whiteSpace: 'nowrap',
                  }}>
                    <Box component="span" sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: active ? SD : TXT_LIGHT, mr: 0.4 }}>HKM</Box>
                    {loc}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          {errors.loc && <Typography sx={{ ...ERR_SX, mb: 1.5 }}>{errors.loc}</Typography>}

          <Divider sx={{ borderColor: BORDER, my: 2.5 }} />

          {/* Step 3 */}
          <Box sx={{ mb: 1 }}>
            <Box component="span" sx={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', bgcolor: SP, color: SD, px: 1.5, py: 0.4, borderRadius: '50px' }}>
              Step 3 — Date
            </Box>
          </Box>

          <FormControl fullWidth size="small" error={!!errors.date} sx={{ mb: errors.date ? 0.5 : 2, ...FIELD_SX }}>
            <InputLabel sx={{ fontSize: '0.83rem' }}>Event Date *</InputLabel>
            <Select label="Event Date *" value={regDate}
              onChange={e => { setRegDate(e.target.value); setRegMeals({ Breakfast: 0, Lunch: 0, Dinner: 0 }); clearErr('date'); clearErr('coupons'); }}
              sx={{ borderRadius: '9px', fontSize: '0.88rem', bgcolor: '#FDFAF6', '& fieldset': { borderColor: BORDER } }}>
              <MenuItem value=""><em>— Select an available date —</em></MenuItem>
              {availDates.map(d => (
                <MenuItem key={d} value={d}>
                  {new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {errors.date && <Typography sx={{ ...ERR_SX, mb: 1.5 }}>{errors.date}</Typography>}

          {/* Step 4 — only when date selected */}
          {regDate && (
            <>
              <Divider sx={{ borderColor: BORDER, my: 2.5 }} />
              <Box sx={{ mb: 1 }}>
                <Box component="span" sx={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', bgcolor: SP, color: SD, px: 1.5, py: 0.4, borderRadius: '50px' }}>
                  Step 4 — Coupons per Meal
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 0.75 }}>
                {selectedMeals.map(meal => (
                  <Box key={meal} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {mealIcon(meal)}
                        <Typography sx={{ fontSize: '0.85rem', color: TXT_MID }}>{meal}</Typography>
                      </Box>
                      <Button
                        size="small"
                        disabled={!menuMap[regDate]?.[meal]}
                        onClick={() => setMenuModal({ meal, text: menuMap[regDate]?.[meal] ?? '' })}
                        sx={{
                          fontSize: '0.68rem', fontWeight: 700, color: SD, bgcolor: '#fff8ee',
                          border: '1px solid #f5d78e', borderRadius: '5px', px: 0.875, py: 0.25,
                          textTransform: 'none', minWidth: 0, lineHeight: 1.4,
                          opacity: menuMap[regDate]?.[meal] ? 1 : 0.45,
                        }}
                      >
                        🍽 Menu
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton size="small"
                        onClick={() => { setRegMeals({ ...regMeals, [meal]: Math.max(0, regMeals[meal] - 1) }); clearErr('coupons'); }}
                        sx={{ border: `1.5px solid ${BORDER}`, borderRadius: '7px', width: 32, height: 32, '&:hover': { bgcolor: SP, borderColor: S } }}>
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography sx={{ width: 32, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: BROWN }}>
                        {regMeals[meal]}
                      </Typography>
                      <IconButton size="small"
                        onClick={() => { setRegMeals({ ...regMeals, [meal]: regMeals[meal] + 1 }); clearErr('coupons'); }}
                        sx={{ border: `1.5px solid ${BORDER}`, borderRadius: '7px', width: 32, height: 32, '&:hover': { bgcolor: SP, borderColor: S } }}>
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
              {errors.coupons && <Typography sx={{ ...ERR_SX, mt: 1 }}>{errors.coupons}</Typography>}
              {totalCoupons >= 10 && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', fontSize: '0.8rem', color: '#7a5e00' }}>
                  ⚠️ Bulk request (≥10 coupons). Admin review may be required.
                </Box>
              )}
            </>
          )}

          {/* Price box */}
          <Box sx={{ mt: 3, bgcolor: CREAM, border: `1.5px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
            <Box sx={{ p: '14px 18px', display: 'flex', flexDirection: 'column', gap: 0.75, borderBottom: `1px solid ${BORDER}` }}>
              {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(m => {
                const q = regMeals[m];
                return (
                  <Box key={m} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {mealIcon(m)}
                      <Typography sx={{ fontSize: '0.82rem', color: TXT_MID }}>{m}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.82rem', color: q > 0 ? BROWN : TXT_LIGHT, fontWeight: q > 0 ? 600 : 400 }}>
                      {q > 0 ? `${q} × ₹${PRICE[m]}/- = ₹${q * PRICE[m]}/-` : '—'}
                    </Typography>
                  </Box>
                );
              })}
              <Divider sx={{ borderColor: BORDER, my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: BROWN }}>Total Amount</Typography>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: totalAmount > 0 ? S : TXT_LIGHT }}>
                  {totalAmount > 0 ? `₹${totalAmount}/-` : '—'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: '12px 18px', borderBottom: `1px solid ${BORDER}` }}>
              <Typography sx={{ fontSize: '0.78rem', color: TXT_MID, mb: 0.5 }}>
                🕖 Prasadam Timing: <strong>6:30 PM to 9:00 PM</strong>
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#9A7A5A' }}>
                ⚠️ Note: The coupons are not valid on Festival days.
              </Typography>
            </Box>
            <Box sx={{ p: '16px 18px', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: TXT_LIGHT }}>
                By continuing, you are agreeing to our{' '}
                <Box component="a" href="#" sx={{ color: S, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms of Use</Box>
                {' '}and{' '}
                <Box component="a" href="#" sx={{ color: S, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy Policy</Box>
              </Typography>
              <Button onClick={handleProceed} sx={{
                width: '100%', py: 1.75, borderRadius: '10px', border: 'none',
                background: `linear-gradient(135deg, ${S}, ${GOLD})`,
                color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(232,98,26,0.3)', textTransform: 'none',
                '&:hover': { opacity: 0.92, transform: 'translateY(-1px)' },
                transition: 'all 0.2s',
              }}>
                💳 Proceed to Payment
              </Button>
              <Button onClick={() => onGoTo('landing')} sx={{
                width: '100%', py: 1.25, borderRadius: '10px', border: `1.5px solid ${BORDER}`,
                bgcolor: 'transparent', color: TXT_MID, fontSize: '0.84rem', fontWeight: 500,
                textTransform: 'none',
                '&:hover': { bgcolor: CREAM },
                transition: 'all 0.18s',
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
