'use client';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/toast';
import {
  useGetSettingsQuery,
  usePatchMealRatesMutation,
  usePatchSlotLimitsMutation,
  usePatchBookingWindowMutation,
} from '@/services/settingsApi';
import { ALL_MEALS } from './shared';
import type { MealType } from '@/types';

// MUI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';

// MUI Icons
import SettingsIcon from '@mui/icons-material/Settings';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';

const SAFFRON      = '#E8621A';
const SAFFRON_DARK = '#C44D0D';
const SAFFRON_PALE = '#FEF0E6';
const GREEN        = '#2D7A3A';
const RED          = '#C0392B';

const LOCATIONS = ['Thiruvanmiyur', 'NLBR'] as const;

const MEAL_CONFIG: Record<MealType, { icon: React.ReactNode; bg: string; border: string }> = {
  Breakfast: { icon: <FreeBreakfastIcon sx={{ fontSize: 18 }} />, bg: '#FFF8F0', border: '#FFD9B3' },
  Lunch:     { icon: <WbSunnyIcon       sx={{ fontSize: 18 }} />, bg: '#FFFBF0', border: '#FFE8A0' },
  Dinner:    { icon: <NightlightIcon    sx={{ fontSize: 18 }} />, bg: '#F2F0FF', border: '#C9C0FF' },
};

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '9px', bgcolor: '#fff', fontSize: '0.88rem',
    '& fieldset': { borderColor: '#E8D8C0' },
    '&:hover fieldset': { borderColor: SAFFRON },
    '&.Mui-focused fieldset': { borderColor: SAFFRON },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: SAFFRON },
};

function SectionCard({ icon, title, description, onSave, saving, saved, hasChanges, children }: {
  icon: React.ReactNode; title: string; description: string;
  onSave: () => void; saving: boolean; saved: boolean; hasChanges: boolean; children: React.ReactNode;
}) {
  const showBtn = hasChanges || saving || saved;
  return (
    <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', mb: 3, boxShadow: '0 2px 12px rgba(232,98,26,0.07)', overflow: 'visible' }}>
      <Box sx={{ px: 3.5, pt: 3, pb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: SAFFRON_PALE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: SAFFRON_DARK, flexShrink: 0 }}>
            {icon}
          </Box>
          <Box>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: SAFFRON_DARK, lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#9A7A5A', mt: 0.25 }}>{description}</Typography>
          </Box>
        </Box>
        {showBtn && (
          <Button
            variant="contained"
            size="small"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : saved ? <CheckIcon sx={{ fontSize: 16 }} /> : <SaveIcon sx={{ fontSize: 16 }} />}
            onClick={onSave}
            sx={{
              borderRadius: '50px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
              bgcolor: saved ? GREEN : SAFFRON,
              boxShadow: saved ? '0 2px 8px rgba(45,122,58,0.3)' : '0 3px 14px rgba(232,98,26,0.35)',
              '&:hover': { bgcolor: saved ? GREEN : SAFFRON_DARK },
              px: 2.5, transition: 'all 0.2s',
            }}
          >
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
          </Button>
        )}
      </Box>
      <Divider sx={{ borderColor: '#F2E8D8' }} />
      <CardContent sx={{ px: 3.5, py: 3 }}>
        {children}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [patchMealRates]    = usePatchMealRatesMutation();
  const [patchSlotLimits]   = usePatchSlotLimitsMutation();
  const [patchBookingWindow] = usePatchBookingWindowMutation();
  const { showToast } = useToast();

  // local state held as strings so the user can clear and retype freely
  const [rates,  setRates]  = useState<Record<MealType, string>>({ Breakfast: '20', Lunch: '40', Dinner: '35' });
  const [limits, setLimits] = useState<Record<string, Record<MealType, string>>>({
    Thiruvanmiyur: { Breakfast: '100', Lunch: '100', Dinner: '100' },
    NLBR:          { Breakfast: '80',  Lunch: '80',  Dinner: '80'  },
  });
  const [autoOpen,   setAutoOpen]   = useState(true);
  const [autoClose,  setAutoClose]  = useState(true);
  const [openDays,   setOpenDays]   = useState('7');
  const [closeDays,  setCloseDays]  = useState('2');

  const [savingRates,  setSavingRates]  = useState(false);
  const [savingLimits, setSavingLimits] = useState(false);
  const [savingWindow, setSavingWindow] = useState(false);
  const [savedRates,   setSavedRates]   = useState(false);
  const [savedLimits,  setSavedLimits]  = useState(false);
  const [savedWindow,  setSavedWindow]  = useState(false);

  useEffect(() => {
    if (!settings) return;
    setRates({
      Breakfast: String(settings.defaultMealRates.Breakfast),
      Lunch:     String(settings.defaultMealRates.Lunch),
      Dinner:    String(settings.defaultMealRates.Dinner),
    });
    setLimits({
      Thiruvanmiyur: {
        Breakfast: String(settings.defaultSlotLimits.Thiruvanmiyur.Breakfast),
        Lunch:     String(settings.defaultSlotLimits.Thiruvanmiyur.Lunch),
        Dinner:    String(settings.defaultSlotLimits.Thiruvanmiyur.Dinner),
      },
      NLBR: {
        Breakfast: String(settings.defaultSlotLimits.NLBR.Breakfast),
        Lunch:     String(settings.defaultSlotLimits.NLBR.Lunch),
        Dinner:    String(settings.defaultSlotLimits.NLBR.Dinner),
      },
    });
    setAutoOpen(settings.bookingWindowOpen);
    setAutoClose(settings.bookingWindowClose);
    setOpenDays(String(settings.bookingOpenDays));
    setCloseDays(String(settings.bookingCloseDays));
  }, [settings]);

  async function saveRates() {
    setSavingRates(true);
    await patchMealRates({
      Breakfast: Number(rates.Breakfast) || 0,
      Lunch:     Number(rates.Lunch)     || 0,
      Dinner:    Number(rates.Dinner)    || 0,
    });
    setSavingRates(false); setSavedRates(true);
    showToast('Meal rates saved successfully', 'success');
    setTimeout(() => setSavedRates(false), 2000);
  }

  async function saveLimits() {
    setSavingLimits(true);
    await patchSlotLimits({
      Thiruvanmiyur: {
        Breakfast: Number(limits.Thiruvanmiyur.Breakfast) || 0,
        Lunch:     Number(limits.Thiruvanmiyur.Lunch)     || 0,
        Dinner:    Number(limits.Thiruvanmiyur.Dinner)    || 0,
      },
      NLBR: {
        Breakfast: Number(limits.NLBR.Breakfast) || 0,
        Lunch:     Number(limits.NLBR.Lunch)     || 0,
        Dinner:    Number(limits.NLBR.Dinner)    || 0,
      },
    });
    setSavingLimits(false); setSavedLimits(true);
    showToast('Slot limits saved successfully', 'success');
    setTimeout(() => setSavedLimits(false), 2000);
  }

  async function saveWindow() {
    setSavingWindow(true);
    await patchBookingWindow({
      bookingWindowOpen:  autoOpen,
      bookingWindowClose: autoClose,
      bookingOpenDays:    Number(openDays)  || 0,
      bookingCloseDays:   Number(closeDays) || 0,
    });
    setSavingWindow(false); setSavedWindow(true);
    showToast('Booking window settings saved', 'success');
    setTimeout(() => setSavedWindow(false), 2000);
  }

  const hasRatesChanged = !settings ? false : (
    rates.Breakfast !== String(settings.defaultMealRates.Breakfast) ||
    rates.Lunch     !== String(settings.defaultMealRates.Lunch)     ||
    rates.Dinner    !== String(settings.defaultMealRates.Dinner)
  );

  const hasLimitsChanged = !settings ? false : LOCATIONS.some(loc =>
    ALL_MEALS.some(meal => limits[loc]?.[meal] !== String(settings.defaultSlotLimits[loc][meal]))
  );

  const hasWindowChanged = !settings ? false : (
    autoOpen  !== settings.bookingWindowOpen   ||
    autoClose !== settings.bookingWindowClose  ||
    openDays  !== String(settings.bookingOpenDays)  ||
    closeDays !== String(settings.bookingCloseDays)
  );

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={40} sx={{ mb: 3 }} />
        {[0, 1, 2].map(i => <Skeleton key={i} variant="rounded" height={200} sx={{ mb: 3 }} />)}
      </Box>
    );
  }

  return (
    <Box>

      {/* ── PAGE HEADER ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
        <SettingsIcon sx={{ color: SAFFRON_DARK, fontSize: 28 }} />
        <Box>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color: SAFFRON_DARK, lineHeight: 1.15 }}>
            Default Settings
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#9A7A5A' }}>
            Configure global defaults for rates, limits and booking windows
          </Typography>
        </Box>
      </Box>

      {/* ── SECTION 1: Meal Rates ── */}
      <SectionCard
        icon={<CurrencyRupeeIcon />}
        title="Global Default Meal Rates"
        description="Default price (₹) per plate — used when creating new slot dates without a custom override"
        onSave={saveRates}
        saving={savingRates}
        saved={savedRates}
        hasChanges={hasRatesChanged}
      >
        <Grid container spacing={2.5}>
          {ALL_MEALS.map(meal => {
            const { icon, bg, border } = MEAL_CONFIG[meal];
            return (
              <Grid key={meal} size={4}>
                <Box sx={{ bgcolor: bg, border: `1.5px solid ${border}`, borderRadius: '10px', p: 2.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: '#5A3A1A' }}>
                    {icon}
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5A3A1A' }}>
                      {meal}
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={rates[meal]}
                    onChange={e => setRates(r => ({ ...r, [meal]: e.target.value }))}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography sx={{ fontWeight: 700, color: SAFFRON_DARK, fontSize: '0.9rem' }}>₹</Typography>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      ...FIELD_SX,
                      '& .MuiOutlinedInput-root': {
                        ...FIELD_SX['& .MuiOutlinedInput-root'],
                        bgcolor: '#fff',
                        '& fieldset': { borderColor: border },
                      },
                    }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </SectionCard>

      {/* ── SECTION 2: Slot Limits ── */}
      <SectionCard
        icon={<ConfirmationNumberIcon />}
        title="Global Default Slot Limits"
        description="Maximum coupons per meal per location — applied when a new slot date is created"
        onSave={saveLimits}
        saving={savingLimits}
        saved={savedLimits}
        hasChanges={hasLimitsChanged}
      >
        {/* Table header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '160px repeat(3, 1fr)', gap: 2, bgcolor: SAFFRON_PALE, borderRadius: '8px', px: 2, py: 1.25, mb: 1 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A7A5A' }}>Location</Typography>
          {ALL_MEALS.map(meal => (
            <Box key={meal} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: SAFFRON_DARK }}>
              {MEAL_CONFIG[meal].icon}
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: SAFFRON_DARK }}>{meal}</Typography>
            </Box>
          ))}
        </Box>

        {/* Rows */}
        {LOCATIONS.map((loc, idx) => (
          <Box
            key={loc}
            sx={{
              display: 'grid', gridTemplateColumns: '160px repeat(3, 1fr)', gap: 2,
              px: 2, py: 1.75, alignItems: 'center',
              borderTop: idx > 0 ? '1px solid #F2E8D8' : 'none',
            }}
          >
            <Chip
              label={loc}
              size="small"
              sx={{
                bgcolor: loc === 'Thiruvanmiyur' ? SAFFRON_PALE : '#FDECEA',
                color:   loc === 'Thiruvanmiyur' ? SAFFRON_DARK : RED,
                fontWeight: 700, fontSize: '0.72rem', borderRadius: '50px', width: 'fit-content',
              }}
            />
            {ALL_MEALS.map(meal => (
              <TextField
                key={meal}
                size="small"
                type="number"
                value={limits[loc]?.[meal] ?? ''}
                onChange={e => setLimits(l => ({ ...l, [loc]: { ...l[loc], [meal]: e.target.value } }))}
                sx={{ ...FIELD_SX, '& input': { textAlign: 'center' } }}
              />
            ))}
          </Box>
        ))}
      </SectionCard>

      {/* ── SECTION 3: Booking Window ── */}
      <SectionCard
        icon={<AccessTimeIcon />}
        title="Booking Window Automation"
        description="Configure when the booking window opens and closes automatically relative to the event date"
        onSave={saveWindow}
        saving={savingWindow}
        saved={savedWindow}
        hasChanges={hasWindowChanged}
      >
        <Grid container spacing={2.5}>

          {/* Auto-Open */}
          <Grid size={6}>
            <Box sx={{ border: '1.5px solid #C8F0D0', borderRadius: '12px', p: 2.5, bgcolor: '#FAFFFC', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockOpenIcon sx={{ color: GREEN, fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3B1F0A' }}>Auto-Open Rule</Typography>
                </Box>
                <Switch
                  checked={autoOpen}
                  onChange={e => setAutoOpen(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: SAFFRON },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: SAFFRON },
                  }}
                />
              </Box>

              <Alert severity={autoOpen ? 'success' : 'info'} icon={false} sx={{ mb: 2, py: 0.5, fontSize: '0.78rem', borderRadius: '8px' }}>
                <strong>{autoOpen ? 'Active' : 'Inactive'}</strong>
                {' — '}Opens {openDays} day{openDays !== '1' ? 's' : ''} before the event
              </Alert>

              <TextField
                fullWidth size="small" type="number" label="Days Before Event"
                value={openDays}
                onChange={e => setOpenDays(e.target.value)}
                slotProps={{ htmlInput: { min: 1 } }}
                sx={FIELD_SX}
              />
            </Box>
          </Grid>

          {/* Auto-Close */}
          <Grid size={6}>
            <Box sx={{ border: '1.5px solid #FFCDD2', borderRadius: '12px', p: 2.5, bgcolor: '#FFF8F8', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockIcon sx={{ color: RED, fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3B1F0A' }}>Auto-Close Rule</Typography>
                </Box>
                <Switch
                  checked={autoClose}
                  onChange={e => setAutoClose(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: RED },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: RED },
                  }}
                />
              </Box>

              <Alert severity={autoClose ? 'error' : 'info'} icon={false} sx={{ mb: 2, py: 0.5, fontSize: '0.78rem', borderRadius: '8px' }}>
                <strong>{autoClose ? 'Active' : 'Inactive'}</strong>
                {' — '}Closes {closeDays} day{closeDays !== '1' ? 's' : ''} before the event
              </Alert>

              <TextField
                fullWidth size="small" type="number" label="Days Before Event"
                value={closeDays}
                onChange={e => setCloseDays(e.target.value)}
                slotProps={{ htmlInput: { min: 0 } }}
                sx={FIELD_SX}
              />
            </Box>
          </Grid>

        </Grid>
      </SectionCard>

    </Box>
  );
}
