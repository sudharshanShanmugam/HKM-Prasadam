'use client';

import { useState } from 'react';
import { useCreateInternalOrderMutation, useGetInternalOrdersQuery } from '@/services/internalOrdersApi';
import type { Department, MealType, CreateInternalOrderDto, InternalOrder } from '@/types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import InventoryIcon from '@mui/icons-material/Inventory';

// ─── Colours (matching project theme) ────────────────────────────────────────
const S          = '#E8621A';
const SD         = '#C44D0D';
const SP         = '#FEF0E6';
const GOLD       = '#C9920A';
const CREAM      = '#FBF6EE';
const BROWN      = '#3B1F0A';
const TXT_MID    = '#5A3A1A';
const TXT_LIGHT  = '#9A7A5A';
const BORDER     = '#E8D8C0';
const GREEN      = '#1B7A4A';
const GREEN_PALE = '#E6F5EC';
const ERR        = '#C0392B';

const DEPTS: Department[] = [
  'Temple Administration', 'Deity Department', 'Kitchen / Prasadam',
  'Education / Gurukul', 'Guest House', 'Security',
  'Accounts', 'Outreach / Sankirtan', 'IT / Media', 'Others',
];

const MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', bgcolor: '#fff', fontSize: '0.9rem',
    '& fieldset': { borderColor: BORDER },
    '&:hover fieldset': { borderColor: S },
    '&.Mui-focused fieldset': { borderColor: S, borderWidth: '2px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: SD },
};

const FIELD_ERR_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', bgcolor: '#fff', fontSize: '0.9rem',
    '& fieldset': { borderColor: ERR },
    '&:hover fieldset': { borderColor: ERR },
    '&.Mui-focused fieldset': { borderColor: ERR, borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { color: ERR },
  '& .MuiInputLabel-root.Mui-focused': { color: ERR },
};

const ERR_SX = { fontSize: '0.72rem', color: ERR, mt: 0.4, ml: 0.25 };

type Errors = {
  name: string; mobile: string; date: string;
  dept: string; meal: string; count: string; location: string;
};

function MealChip({ meal }: { meal: MealType }) {
  const cfg = {
    Breakfast: { icon: <FreeBreakfastIcon sx={{ fontSize: 14 }} />, color: S },
    Lunch:     { icon: <WbSunnyIcon       sx={{ fontSize: 14 }} />, color: GOLD },
    Dinner:    { icon: <NightlightIcon    sx={{ fontSize: 14 }} />, color: '#7C3AED' },
  }[meal];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
      <Typography sx={{ fontSize: '0.83rem', color: BROWN }}>{meal}</Typography>
    </Box>
  );
}

function StatusPill({ o }: { o: InternalOrder }) {
  if (o.delivered) return <Chip label="Delivered" size="small" sx={{ bgcolor: '#E8D5FF', color: '#4B0082', fontWeight: 700, fontSize: '0.68rem', borderRadius: '50px', border: '1px solid #6F42C155' }} />;
  if (o.accepted)  return <Chip label="Accepted"  size="small" sx={{ bgcolor: GREEN_PALE, color: GREEN,  fontWeight: 700, fontSize: '0.68rem', borderRadius: '50px', border: '1px solid #28A74555' }} />;
  return                  <Chip label="Pending"   size="small" sx={{ bgcolor: '#FFF3CD', color: '#856404', fontWeight: 700, fontSize: '0.68rem', borderRadius: '50px', border: '1px solid #FFC10755' }} />;
}

function fmtDate(d: string) {
  try { return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

type View = 'book' | 'mybk';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InternalPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [view,    setView]    = useState<View>('book');
  const [toast,   setToast]   = useState('');

  // Form state
  const [name,     setName]     = useState('');
  const [mobile,   setMobile]   = useState('');
  const [date,     setDate]     = useState(today);
  const [dept,     setDept]     = useState('');
  const [meal,     setMeal]     = useState('');
  const [count,    setCount]    = useState('');
  const [location, setLocation] = useState('');

  // Inline errors
  const emptyErrors: Errors = { name: '', mobile: '', date: '', dept: '', meal: '', count: '', location: '' };
  const [errors, setErrors] = useState<Errors>(emptyErrors);

  const clearErr = (field: keyof Errors) => setErrors(prev => ({ ...prev, [field]: '' }));

  const [createOrder, { isLoading }] = useCreateInternalOrderMutation();

  // My bookings
  const [bkInput,      setBkInput]      = useState('');
  const [activeMobile, setActiveMobile] = useState<string | null>(null);
  const [lookupErr,    setLookupErr]    = useState('');
  const { data: myOrders = [], isFetching } = useGetInternalOrdersQuery(
    { mobile: activeMobile ?? '' },
    { skip: !activeMobile }
  );

  function validate(): boolean {
    const e: Errors = { ...emptyErrors };
    if (!name.trim())                      e.name     = 'Name is required';
    if (!mobile)                           e.mobile   = 'Mobile number is required';
    else if (!/^\d{10}$/.test(mobile))     e.mobile   = 'Enter a valid 10-digit mobile number';
    if (!date)                             e.date     = 'Date is required';
    if (!dept)                             e.dept     = 'Please select a department';
    if (!meal)                             e.meal     = 'Please select a meal type';
    if (!count || parseInt(count) < 1)     e.count    = 'Enter a count of at least 1';
    if (!location.trim())                  e.location = 'Delivery location is required';
    setErrors(e);
    return !Object.values(e).some(Boolean);
  }

  async function submitInternal() {
    if (!validate()) return;
    const dto: CreateInternalOrderDto = {
      name, mobile, date,
      dept: dept as Department,
      meal: meal as MealType,
      count: parseInt(count),
      location,
    };
    const res = await createOrder(dto);
    if ('data' in res && res.data) {
      setName(''); setMobile(''); setDate(today); setDept('');
      setMeal(''); setCount(''); setLocation('');
      setErrors(emptyErrors);
      setToast('Request submitted successfully!');
    }
  }

  function resetForm() {
    setName(''); setMobile(''); setDate(today); setDept('');
    setMeal(''); setCount(''); setLocation('');
    setErrors(emptyErrors);
  }

  function lookupOrders() {
    if (!/^\d{10}$/.test(bkInput)) { setLookupErr('Enter a valid 10-digit mobile number.'); return; }
    setLookupErr('');
    setActiveMobile(bkInput);
  }

  function resetLookup() {
    setActiveMobile(null); setBkInput(''); setLookupErr('');
  }

  // ─── HEADER ──────────────────────────────────────────────────────────────────
  const header = (
    <Box sx={{
      background: 'linear-gradient(135deg, #8e1a0e 0%, #c0392b 60%, #e07b2a 100%)',
      px: { xs: 2, sm: 2.5 }, py: { xs: 1.5, sm: 2 }, color: '#fff',
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Brand — centered */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '1rem', sm: '1.2rem' }, fontWeight: 700, letterSpacing: '0.03em' }}>
          🕉 Hare Krishna Movement
        </Typography>
        <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.72rem' }, opacity: 0.75, mt: 0.2 }}>
          Internal Prasadam Booking — Staff Only
        </Typography>
      </Box>

      {/* Toggle button — only shown on booking form view */}
      {view !== 'mybk' && <Button
        onClick={() => setView('mybk')}
        sx={{
          position: 'absolute', right: { xs: 12, sm: 20 },
          bgcolor: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.45)',
          color: '#fff', borderRadius: '8px',
          minWidth: { xs: 36, sm: 'auto' },
          px: { xs: 0, sm: 1.5 }, py: 0.75,
          fontSize: { xs: '0.72rem', sm: '0.78rem' },
          fontWeight: 700, textTransform: 'none', whiteSpace: 'nowrap',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
        }}
      >
        <InventoryIcon sx={{ fontSize: '16px' }} />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.75 }}>
          My Bookings
        </Box>
      </Button>}
    </Box>
  );

  // ─── BOOKING FORM ─────────────────────────────────────────────────────────────
  const bookingForm = (
    <Box>
      {/* Info strip */}
      <Box sx={{ bgcolor: SP, border: `1px solid #f5d78e`, borderRadius: '10px', p: '10px 14px', mb: 2.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Typography sx={{ fontSize: '0.8rem', color: SD }}>
          ℹ️ This form is for internal departments only. Orders will be reviewed and confirmed by the admin.
        </Typography>
      </Box>

      <Box sx={{ bgcolor: '#fff', borderRadius: '14px', boxShadow: '0 2px 16px rgba(160,100,30,0.1)', p: { xs: '20px 18px', sm: '24px 24px' } }}>
        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 700, color: BROWN, mb: 2.5, pb: 1.5, borderBottom: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 1 }}>
          🏛 Internal Prasadam Request
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Name */}
          <Box>
            <TextField fullWidth size="small" label="Name *" placeholder="Your full name"
              value={name}
              onChange={e => { setName(e.target.value); clearErr('name'); }}
              sx={errors.name ? FIELD_ERR_SX : FIELD_SX}
            />
            {errors.name && <Typography sx={ERR_SX}>{errors.name}</Typography>}
          </Box>

          {/* Mobile */}
          <Box>
            <TextField fullWidth size="small" label="Mobile Number *" placeholder="10-digit mobile number"
              slotProps={{ htmlInput: { maxLength: 10 } }}
              value={mobile}
              onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); clearErr('mobile'); }}
              sx={errors.mobile ? FIELD_ERR_SX : FIELD_SX}
            />
            {errors.mobile && <Typography sx={ERR_SX}>{errors.mobile}</Typography>}
          </Box>

          {/* Date */}
          <Box>
            <TextField fullWidth size="small" label="Date Required *" type="date"
              slotProps={{ htmlInput: { min: today }, inputLabel: { shrink: true } }}
              value={date}
              onChange={e => { setDate(e.target.value); clearErr('date'); }}
              sx={errors.date ? FIELD_ERR_SX : FIELD_SX}
            />
            {errors.date && <Typography sx={ERR_SX}>{errors.date}</Typography>}
          </Box>

          {/* Department */}
          <Box>
            <FormControl fullWidth size="small" sx={errors.dept ? FIELD_ERR_SX : FIELD_SX}>
              <InputLabel sx={errors.dept ? { color: ERR } : {}}>Department *</InputLabel>
              <Select label="Department *" value={dept}
                onChange={e => { setDept(e.target.value); clearErr('dept'); }}
                sx={{ borderRadius: '10px', fontSize: '0.9rem' }}>
                <MenuItem value=""><em>— Select Department —</em></MenuItem>
                {DEPTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            {errors.dept && <Typography sx={ERR_SX}>{errors.dept}</Typography>}
          </Box>

          {/* Meal */}
          <Box>
            <FormControl fullWidth size="small" sx={errors.meal ? FIELD_ERR_SX : FIELD_SX}>
              <InputLabel sx={errors.meal ? { color: ERR } : {}}>Meal Type *</InputLabel>
              <Select label="Meal Type *" value={meal}
                onChange={e => { setMeal(e.target.value); clearErr('meal'); }}
                sx={{ borderRadius: '10px', fontSize: '0.9rem' }}>
                <MenuItem value=""><em>— Select Meal —</em></MenuItem>
                {MEALS.map(m => (
                  <MenuItem key={m} value={m}>
                    <MealChip meal={m} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.meal && <Typography sx={ERR_SX}>{errors.meal}</Typography>}
          </Box>

          {/* Count */}
          <Box>
            <TextField fullWidth size="small" label="Count Needed *" type="number"
              placeholder="Number of plates" slotProps={{ htmlInput: { min: 1 } }}
              value={count}
              onChange={e => { setCount(e.target.value); clearErr('count'); }}
              sx={errors.count ? FIELD_ERR_SX : FIELD_SX}
            />
            {errors.count && <Typography sx={ERR_SX}>{errors.count}</Typography>}
          </Box>

          {/* Location */}
          <Box>
            <TextField fullWidth size="small" label="Delivery Location *" multiline rows={3}
              placeholder="Room / hall / building name for delivery"
              value={location}
              onChange={e => { setLocation(e.target.value); clearErr('location'); }}
              sx={errors.location ? FIELD_ERR_SX : FIELD_SX}
            />
            {errors.location && <Typography sx={ERR_SX}>{errors.location}</Typography>}
          </Box>

          <Button
            fullWidth
            onClick={submitInternal}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{
              py: 1.5, borderRadius: '10px', border: 'none',
              background: `linear-gradient(135deg, #c0392b, #e07b2a)`,
              color: '#fff', fontSize: '0.95rem', fontWeight: 700,
              boxShadow: '0 4px 16px rgba(192,57,43,0.3)', textTransform: 'none',
              '&:hover': { opacity: 0.92 },
              '&:disabled': { opacity: 0.6 },
            }}
          >
            {isLoading ? 'Submitting…' : '📋 Submit Request'}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  // ─── MY BOOKINGS ─────────────────────────────────────────────────────────────
  const myBookingsView = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <IconButton size="small" onClick={() => setView('book')}
          sx={{ border: `1.5px solid ${BORDER}`, borderRadius: '8px', color: TXT_MID, '&:hover': { bgcolor: SP } }}>
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 700, color: BROWN }}>
          📦 My Bookings
        </Typography>
      </Box>

      {!activeMobile ? (
        <Box sx={{ bgcolor: '#fff', borderRadius: '14px', boxShadow: '0 2px 16px rgba(160,100,30,0.1)', p: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: '2.2rem', lineHeight: 1 }}>📱</Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, color: BROWN }}>
              Find Your Orders
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#888', mt: 0.5 }}>
              Enter your mobile number to view all requests
            </Typography>
          </Box>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <TextField fullWidth size="small" label="Mobile Number" placeholder="10-digit mobile number"
              slotProps={{ htmlInput: { maxLength: 10 } }}
              value={bkInput} onChange={e => setBkInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') lookupOrders(); }}
              sx={{ ...FIELD_SX, '& input': { textAlign: 'center', fontSize: '1rem', letterSpacing: '0.08em' } }} />
            {lookupErr && <Typography sx={{ fontSize: '0.78rem', color: ERR, textAlign: 'center' }}>{lookupErr}</Typography>}
            <Button fullWidth onClick={lookupOrders}
              startIcon={<SearchIcon />}
              sx={{
                py: 1.4, borderRadius: '10px',
                background: `linear-gradient(135deg, #c0392b, #e07b2a)`,
                color: '#fff', fontWeight: 700, textTransform: 'none',
                '&:hover': { opacity: 0.9 },
              }}>
              Find My Orders
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontSize: '0.82rem', color: TXT_MID }}>
              Showing orders for <strong>{activeMobile}</strong>
            </Typography>
            <Button size="small" onClick={resetLookup}
              sx={{ border: `1.5px solid ${BORDER}`, borderRadius: '8px', px: 1.5, py: 0.5, fontSize: '0.78rem', color: TXT_MID, textTransform: 'none', '&:hover': { bgcolor: SP } }}>
              ← Change Number
            </Button>
          </Box>

          {isFetching ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <CircularProgress size={28} sx={{ color: S }} />
            </Box>
          ) : myOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>📦</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: '#aaa', mb: 2 }}>No orders found for this number.</Typography>
              <Button onClick={() => setView('book')} sx={{
                background: `linear-gradient(135deg, #c0392b, #e07b2a)`,
                color: '#fff', fontWeight: 700, textTransform: 'none',
                borderRadius: '10px', px: 2.5, py: 1,
              }}>
                + New Booking
              </Button>
            </Box>
          ) : myOrders.map(o => (
            <Box key={o.id} sx={{ bgcolor: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(160,100,30,0.08)', p: 2, mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Box component="span" sx={{ fontSize: '0.72rem', fontWeight: 700, color: SD, bgcolor: SP, border: `1px solid #f5d78e`, borderRadius: '50px', px: 1.5, py: 0.4 }}>
                  {o.id}
                </Box>
                <StatusPill o={o} />
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.92rem', color: BROWN, mb: 0.5 }}>{o.name}</Typography>
              <Divider sx={{ borderColor: BORDER, my: 0.75 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, fontSize: '0.8rem', color: TXT_MID }}>
                <Typography sx={{ fontSize: '0.8rem', color: TXT_MID }}>📅 {fmtDate(o.date)}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: TXT_MID }}>🏛 {o.dept}</Typography>
                {o.meal && <MealChip meal={o.meal} />}
                <Typography sx={{ fontSize: '0.8rem', color: TXT_MID }}>🍽 {o.count} plates</Typography>
              </Box>
              {o.location && (
                <Typography sx={{ fontSize: '0.78rem', color: TXT_MID, mt: 0.75 }}>📍 {o.location}</Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: CREAM, fontFamily: 'Inter, sans-serif' }}>
      {header}

      <Box sx={{ maxWidth: 480, mx: 'auto', px: 2, pt: 3, pb: 6 }}>
        {view === 'book' && bookingForm}
        {view === 'mybk' && myBookingsView}
      </Box>

      <Snackbar
        open={!!toast}
        message={toast}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{ content: { sx: { borderRadius: '20px', bgcolor: '#1B7A4A', fontSize: '0.85rem', fontWeight: 600 } } }}
      />
    </Box>
  );
}
