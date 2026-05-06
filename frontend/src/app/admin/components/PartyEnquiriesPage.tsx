'use client';
import React, { useState, useMemo } from 'react';
import { useGetPartyEnquiriesQuery, useUpdatePartyEnquiryMutation } from '@/services/partyEnquiriesApi';
import { useToast } from '@/context/toast';
import type { PartyEnquiry, UpdatePartyEnquiryDto, EnquiryStatus } from '@/types';

// MUI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';

// MUI Icons
import CelebrationIcon from '@mui/icons-material/Celebration';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const S          = '#E8621A';
const SD         = '#C44D0D';
const SP         = '#FEF0E6';
const GOLD       = '#C9920A';
const GOLD_PALE  = '#FFF9E6';
const GREEN      = '#1B7A4A';
const GREEN_PALE = '#E6F5EC';
const RED        = '#B91C1C';
const RED_PALE   = '#FEE2E2';

const MEAL_META = {
  Breakfast: { icon: <FreeBreakfastIcon sx={{ fontSize: 20 }} />, bg: '#FFFBEE', border: '#F5D78E', subBg: '#F9F3D0' },
  Lunch:     { icon: <WbSunnyIcon     sx={{ fontSize: 20 }} />, bg: '#F0F8FF', border: '#C0D8F0', subBg: '#D8EDF8' },
  Dinner:    { icon: <NightlightIcon  sx={{ fontSize: 20 }} />, bg: '#F5F0FF', border: '#C8B8F0', subBg: '#E2D8F8' },
} as const;

type MealKey = 'Breakfast' | 'Lunch' | 'Dinner';

const TH_SX = {
  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase' as const, color: SD,
  bgcolor: SP, py: 1.5, px: 1,
  borderBottom: '1.5px solid rgba(232,98,26,0.15)',
  whiteSpace: 'nowrap' as const,
};

const TD_SX = {
  fontSize: '0.83rem', color: '#3B1F0A',
  py: 1.25, px: 1,
  borderBottom: '1px solid #F2E8D8',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysToGo(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ev = new Date(dateStr + 'T12:00:00'); ev.setHours(0, 0, 0, 0);
  return Math.round((ev.getTime() - today.getTime()) / 86400000);
}

function countdownColor(d: number) {
  return d < 0 ? '#9A7A5A' : d <= 3 ? RED : d <= 7 ? '#C05500' : GREEN;
}

function countdownLabel(d: number) {
  if (d < 0) return `${Math.abs(d)} days ago`;
  if (d === 0) return 'Today!';
  if (d === 1) return 'Tomorrow';
  return `in ${d} days`;
}

function DateChip({ dateStr }: { dateStr: string }) {
  const d = daysToGo(dateStr);
  const label = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : d < 0 ? `${Math.abs(d)}d ago` : `in ${d}d`;
  const color = countdownColor(d);
  const parts = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const display = `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, whiteSpace: 'nowrap' }}>
      <Typography sx={{ fontSize: '0.8rem', color: '#3B1F0A' }}>{display}</Typography>
      <Box component="span" sx={{
        fontSize: '0.68rem', fontWeight: 700,
        color, bgcolor: `${color}18`, border: `1px solid ${color}44`,
        borderRadius: '10px', px: 0.9, py: 0.25,
      }}>
        {label}
      </Box>
    </Box>
  );
}

function StatusPill({ s }: { s: string }) {
  const map: Record<string, { color: string; bg: string; text: string }> = {
    accepted: { color: GREEN, bg: GREEN_PALE, text: 'Accepted' },
    declined: { color: RED,   bg: RED_PALE,   text: 'Declined' },
    pending:  { color: GOLD,  bg: GOLD_PALE,  text: 'Pending' },
    paid:     { color: GREEN, bg: GREEN_PALE, text: 'Paid' },
    unpaid:   { color: '#9A7A5A', bg: '#F5ECD8', text: 'Unpaid' },
  };
  const c = map[s] ?? { color: '#9A7A5A', bg: '#F5ECD8', text: s };
  return (
    <Box component="span" sx={{
      display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      color: c.color, bgcolor: c.bg, px: 1.25, py: 0.5, borderRadius: '50px',
    }}>
      {c.text}
    </Box>
  );
}

function MealSummary({ meals }: { meals: { Breakfast: number; Lunch: number; Dinner: number } }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
      {meals.Breakfast > 0 && (
        <Tooltip title={`Breakfast: ${meals.Breakfast}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: '0.72rem', color: '#5A3A1A', bgcolor: SP, px: 0.75, py: 0.2, borderRadius: '4px' }}>
            <FreeBreakfastIcon sx={{ fontSize: 12 }} />{meals.Breakfast}
          </Box>
        </Tooltip>
      )}
      {meals.Lunch > 0 && (
        <Tooltip title={`Lunch: ${meals.Lunch}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: '0.72rem', color: '#5A3A1A', bgcolor: GOLD_PALE, px: 0.75, py: 0.2, borderRadius: '4px' }}>
            <WbSunnyIcon sx={{ fontSize: 12 }} />{meals.Lunch}
          </Box>
        </Tooltip>
      )}
      {meals.Dinner > 0 && (
        <Tooltip title={`Dinner: ${meals.Dinner}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: '0.72rem', color: '#5A3A1A', bgcolor: '#F0E8F8', px: 0.75, py: 0.2, borderRadius: '4px' }}>
            <NightlightIcon sx={{ fontSize: 12 }} />{meals.Dinner}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}

function PaymentCell({ eq }: { eq: PartyEnquiry }) {
  if (eq.status !== 'accepted') {
    return <Typography sx={{ fontSize: '0.78rem', color: '#CCC' }}>—</Typography>;
  }
  const mp = eq.mealPrices;
  const computed = (mp.Breakfast * eq.meals.Breakfast) + (mp.Lunch * eq.meals.Lunch) + (mp.Dinner * eq.meals.Dinner);
  return (
    <Box sx={{ textAlign: 'center' }}>
      {computed > 0
        ? <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#3B1F0A' }}>₹{computed.toLocaleString('en-IN')}</Typography>
        : <Typography sx={{ fontSize: '0.75rem', color: '#BBB' }}>Not set</Typography>
      }
      <Box sx={{ mt: 0.5 }}><StatusPill s={eq.paid ? 'paid' : 'unpaid'} /></Box>
    </Box>
  );
}

function MenuCell({ eq }: { eq: PartyEnquiry }) {
  if (eq.confirmedMenu || eq.confirmedPrice) {
    return (
      <Box>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: GREEN, mb: 0.25 }}>Confirmed</Typography>
        {eq.confirmedMenu && (
          <Typography sx={{ fontSize: '0.8rem', color: '#3B1F0A' }} title={eq.confirmedMenu}>
            {eq.confirmedMenu.length > 28 ? eq.confirmedMenu.slice(0, 28) + '…' : eq.confirmedMenu}
          </Typography>
        )}
        {eq.confirmedPrice && (
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: S }}>₹{eq.confirmedPrice}/-</Typography>
        )}
      </Box>
    );
  }
  if (eq.preferredMenu || eq.preferredPrice) {
    return (
      <Typography sx={{ fontSize: '0.78rem', color: '#9A7A5A' }}>
        {eq.preferredMenu ? (eq.preferredMenu.length > 22 ? eq.preferredMenu.slice(0, 22) + '…' : eq.preferredMenu) : ''}
        {eq.preferredMenu && eq.preferredPrice ? ' · ' : ''}
        {eq.preferredPrice ? `₹${eq.preferredPrice}` : ''}
      </Typography>
    );
  }
  return <Typography sx={{ fontSize: '0.78rem', color: '#CCC' }}>—</Typography>;
}

function rowBg(status: EnquiryStatus) {
  if (status === 'pending') return '#FFFDF0';
  if (status === 'accepted') return '#F4FDF6';
  return '#FDF8F8';
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', color: '#AAA', textTransform: 'uppercase', mb: 0.75 }}>
      {children}
    </Typography>
  );
}

// ─── Enquiry Modal ────────────────────────────────────────────────────────────
function EnquiryModal({ eq, onClose }: { eq: PartyEnquiry; onClose: () => void }) {
  const [updateEnquiry, { isLoading }] = useUpdatePartyEnquiryMutation();
  const { showToast } = useToast();

  const activeMeals = (['Breakfast', 'Lunch', 'Dinner'] as MealKey[]).filter(m => eq.meals[m] > 0);
  const totalPlates = eq.meals.Breakfast + eq.meals.Lunch + eq.meals.Dinner;

  const [portions, setPortions] = useState<Record<MealKey, number>>({
    Breakfast: eq.meals.Breakfast,
    Lunch:     eq.meals.Lunch,
    Dinner:    eq.meals.Dinner,
  });
  const [prices, setPrices] = useState<Record<MealKey, number>>({
    Breakfast: eq.mealPrices?.Breakfast ?? 0,
    Lunch:     eq.mealPrices?.Lunch     ?? 0,
    Dinner:    eq.mealPrices?.Dinner    ?? 0,
  });
  const [confirmedMenu,  setConfirmedMenu]  = useState(eq.confirmedMenu  ?? '');
  const [confirmedPrice, setConfirmedPrice] = useState<number | ''>(eq.confirmedPrice ?? '');
  const [paid, setPaid] = useState(eq.paid);
  const [saving, setSaving] = useState(false);

  const grandTotal = activeMeals.reduce((s, m) => s + (portions[m] * prices[m]), 0);

  const update = async (data: UpdatePartyEnquiryDto) => { await updateEnquiry({ id: eq.id, data }); };

  const handleSave = async (andAccept?: boolean) => {
    setSaving(true);
    const payload: UpdatePartyEnquiryDto = {
      mealPrices: { Breakfast: prices.Breakfast, Lunch: prices.Lunch, Dinner: prices.Dinner },
      meals:      { Breakfast: portions.Breakfast, Lunch: portions.Lunch, Dinner: portions.Dinner },
      confirmedMenu,
      confirmedPrice: confirmedPrice === '' ? undefined : Number(confirmedPrice),
      paid,
    };
    if (andAccept) payload.status = 'accepted';
    await update(payload);
    setSaving(false);
    showToast(andAccept ? `Enquiry ${eq.id} accepted` : `Enquiry ${eq.id} saved`, 'success');
    if (andAccept) onClose();
  };

  const d = daysToGo(eq.eventDate);
  const cColor = countdownColor(d);
  const cLabel = countdownLabel(d);
  const parts = eq.eventDate.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const eventDateDisplay = `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;

  const INPUT_SX = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px', fontSize: '0.85rem', bgcolor: '#fff',
      '& fieldset': { borderColor: '#C0DDD0' },
      '&:hover fieldset': { borderColor: '#1B7A4A' },
      '&.Mui-focused fieldset': { borderColor: '#1B7A4A' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1B7A4A' },
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.22)' } } }}>

      {/* ── HEADER: dark red gradient ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #c0392b, #8e1a0e)',
        px: '22px', py: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CelebrationIcon sx={{ color: '#fff', fontSize: 20 }} />
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', fontFamily: 'Inter, sans-serif' }}>
              Enquiry Details
            </Typography>
          </Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', mt: 0.3 }}>
            {eq.id}{eq.submitted ? ` · Submitted ${eq.submitted}` : ''}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{
          bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', width: 30, height: 30,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
        }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* ── BODY ── */}
      <Box sx={{ p: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '75vh' }}>

        {/* Customer + Status row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Box sx={{ bgcolor: '#FDF8F0', borderRadius: '8px', p: '12px' }}>
            <SectionLabel>Customer</SectionLabel>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A' }}>{eq.name}</Typography>
            <Typography sx={{ color: '#666', fontSize: '0.85rem', mt: 0.5 }}>📞 {eq.mobile}</Typography>
          </Box>
          <Box sx={{ bgcolor: '#FDF8F0', borderRadius: '8px', p: '12px' }}>
            <SectionLabel>Status</SectionLabel>
            <StatusPill s={eq.status} />
            {eq.paid && <Box component="span" sx={{ ml: 0.75 }}><StatusPill s="paid" /></Box>}
          </Box>
        </Box>

        {/* Event Details */}
        <Box sx={{ bgcolor: '#FFF8F0', border: '1px solid #F0D9B0', borderRadius: '8px', p: '14px' }}>
          <SectionLabel>Event Details</SectionLabel>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Box>
              <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Event Date</Typography>
              <Typography sx={{ fontWeight: 700, color: cColor, fontSize: '0.9rem', mt: 0.25 }}>
                {eventDateDisplay} <Box component="span" sx={{ fontSize: '0.78rem', fontWeight: 400 }}>({cLabel})</Box>
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Plates</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#1A1A1A', mt: 0.25 }}>{totalPlates}</Typography>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 0.5 }}>Meal Preference</Typography>
              <MealSummary meals={eq.meals} />
            </Box>
          </Box>
        </Box>

        {/* Delivery Address */}
        <Box sx={{ bgcolor: '#F8F4FF', border: '1px solid #D8C5F0', borderRadius: '8px', p: '14px' }}>
          <SectionLabel><Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}><LocationOnIcon sx={{ fontSize: 12 }} />Delivery Address</Box></SectionLabel>
          <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#333' }}>{eq.address}</Typography>
        </Box>

        {/* Preferred Menu & Price */}
        {(eq.preferredMenu || eq.preferredPrice) && (
          <Box sx={{ bgcolor: '#F0F8F0', border: '1px solid #B8DFC0', borderRadius: '8px', p: '14px' }}>
            <SectionLabel>🍽 Preferred Menu &amp; Price</SectionLabel>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {eq.preferredMenu && (
                <Box sx={{ flex: 1, minWidth: 140 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>Menu</Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.5, mt: 0.25 }}>{eq.preferredMenu}</Typography>
                </Box>
              )}
              {eq.preferredPrice && (
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>Budget</Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: S, mt: 0.25 }}>₹{eq.preferredPrice}/-</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Meal Pricing */}
        {activeMeals.length > 0 && (
          <Box sx={{ bgcolor: '#F8FFFE', border: '1.5px solid #B0DDD0', borderRadius: '10px', p: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SectionLabel>🧾 Meal Pricing</SectionLabel>

            {activeMeals.map(m => {
              const meta = MEAL_META[m];
              const sub  = portions[m] * prices[m];
              return (
                <Box key={m} sx={{
                  bgcolor: meta.bg, border: `1.5px solid ${meta.border}`,
                  borderRadius: '10px', p: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <Box sx={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0, color: '#5A3A1A' }}>
                    {meta.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#1A1A1A' }}>{m}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mt: 0.5 }}>
                      <Box
                        component="input"
                        type="number"
                        min={0}
                        value={portions[m]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPortions(p => ({ ...p, [m]: Math.max(0, parseInt(e.target.value) || 0) }))
                        }
                        style={{
                          width: 52, border: `1.5px solid ${meta.border}`, borderRadius: 6,
                          padding: '4px 6px', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif',
                          outline: 'none', textAlign: 'center', background: '#fff',
                        }}
                      />
                      <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>plates</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: '8px', overflow: 'hidden', bgcolor: '#fff' }}>
                      <Box sx={{ px: '9px', fontSize: '0.8rem', color: '#aaa', bgcolor: '#f9f9f9', borderRight: '1px solid #eee', alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>₹</Box>
                      <Box
                        component="input"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={prices[m] || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPrices(p => ({ ...p, [m]: parseInt(e.target.value) || 0 }))
                        }
                        style={{
                          width: 68, border: 'none', outline: 'none',
                          padding: '8px', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif',
                        }}
                      />
                      <Box sx={{ px: '7px', fontSize: '0.68rem', color: '#bbb', bgcolor: '#f9f9f9', borderLeft: '1px solid #eee', alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>/plate</Box>
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: S, minWidth: 55, textAlign: 'right' }}>
                      ₹{sub}
                    </Typography>
                  </Box>
                </Box>
              );
            })}

            {/* Grand Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px dashed #B0DDD0', pt: '10px' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#333' }}>Grand Total</Typography>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: S }}>₹{grandTotal}/-</Typography>
            </Box>

            {/* Confirmed Menu & Price */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1.5px dashed #B0DDD0', pt: '10px' }}>
              <SectionLabel>✅ Confirmed Menu &amp; Price</SectionLabel>
              <Box
                component="textarea"
                rows={2}
                placeholder="Enter confirmed menu items…"
                value={confirmedMenu}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConfirmedMenu(e.target.value)}
                style={{
                  width: '100%', border: '1.5px solid #C0DDD0', borderRadius: 8,
                  padding: '9px 11px', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif',
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                  background: '#fff',
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1.5px solid #C0DDD0', borderRadius: '8px', overflow: 'hidden', bgcolor: '#fff' }}>
                <Box sx={{ px: '10px', fontSize: '0.82rem', color: '#aaa', bgcolor: '#f4fdf8', borderRight: '1px solid #C0DDD0', alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>₹</Box>
                <Box
                  component="input"
                  type="number"
                  min={0}
                  placeholder="Confirmed price"
                  value={confirmedPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmedPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    padding: '9px 10px', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif',
                  }}
                />
              </Box>
            </Box>

            {/* Action buttons */}
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              bgcolor: paid ? GREEN_PALE : RED_PALE,
              border: `1.5px solid ${paid ? '#28a74544' : `${RED}44`}`,
              borderRadius: '10px', px: '14px', py: '10px', gap: '12px',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCardIcon sx={{ fontSize: 18, color: paid ? GREEN : RED }} />
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: paid ? GREEN : RED, opacity: 0.7 }}>
                    Payment Status
                  </Typography>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: paid ? GREEN : RED }}>
                    {paid ? 'Payment Received' : 'Payment Pending'}
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                onClick={() => setPaid(p => !p)}
                sx={paid
                  ? { borderRadius: '8px', textTransform: 'none', fontSize: '0.78rem', fontWeight: 700, border: `1.5px solid ${RED}55`, color: RED, bgcolor: '#fff', px: 2, '&:hover': { bgcolor: RED_PALE } }
                  : { borderRadius: '8px', textTransform: 'none', fontSize: '0.78rem', fontWeight: 700, border: `1.5px solid #28a74555`, color: GREEN, bgcolor: '#fff', px: 2, '&:hover': { bgcolor: GREEN_PALE } }
                }
              >
                {paid ? 'Mark as Unpaid' : 'Mark as Paid'}
              </Button>
            </Box>

            {eq.status === 'pending' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CheckCircleIcon sx={{ fontSize: '18px !important' }} />}
                  disabled={saving || isLoading}
                  onClick={() => handleSave(true)}
                  sx={{
                    bgcolor: GREEN, borderRadius: '10px', textTransform: 'none',
                    fontWeight: 700, fontSize: '0.88rem', py: 1.25,
                    boxShadow: '0 4px 14px rgba(27,122,74,0.35)',
                    '&:hover': { bgcolor: '#155A38', boxShadow: '0 6px 18px rgba(27,122,74,0.45)' },
                  }}
                >
                  Accept Order
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CancelIcon sx={{ fontSize: '18px !important' }} />}
                  disabled={isLoading}
                  onClick={() => { update({ status: 'declined' }); showToast(`Enquiry ${eq.id} declined`, 'error'); onClose(); }}
                  sx={{
                    borderRadius: '10px', textTransform: 'none',
                    fontWeight: 700, fontSize: '0.88rem', py: 1.25,
                    color: RED, borderColor: RED, borderWidth: '1.5px',
                    '&:hover': { bgcolor: RED_PALE, borderColor: RED, borderWidth: '1.5px' },
                  }}
                >
                  Decline
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ── FOOTER ── */}
      <DialogActions sx={{ px: '22px', py: '14px', borderTop: '1px solid #f0e6d3', justifyContent: 'flex-end' }}>
        <Button
          disabled={saving || isLoading}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: '16px !important' }} />}
          onClick={async () => { await handleSave(); onClose(); }}
          sx={{ bgcolor: S, color: '#fff', borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.9rem', px: 3, '&:hover': { bgcolor: SD } }}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PartyEnquiriesPage() {
  const { data: enquiries = [], isLoading: eLoad } = useGetPartyEnquiriesQuery({});
  const [updateEnquiry] = useUpdatePartyEnquiryMutation();
  const [selectedEnquiry, setSelectedEnquiry] = useState<PartyEnquiry | null>(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const total    = enquiries.length;
  const pending  = enquiries.filter(e => e.status === 'pending').length;
  const accepted = enquiries.filter(e => e.status === 'accepted').length;
  const declined = enquiries.filter(e => e.status === 'declined').length;

  const upcoming = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const in7   = new Date(today); in7.setDate(in7.getDate() + 7);
    return enquiries
      .filter(e => {
        if (e.status !== 'accepted') return false;
        const ev = new Date(e.eventDate + 'T12:00:00'); ev.setHours(0, 0, 0, 0);
        return ev >= today && ev <= in7;
      })
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [enquiries]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = enquiries.filter(e => {
      if (statusFilter && e.status !== statusFilter) return false;
      if (q && !(e.name.toLowerCase().includes(q) || e.mobile.includes(q) || e.id.toLowerCase().includes(q) || e.address.toLowerCase().includes(q))) return false;
      return true;
    });
    const order: Record<string, number> = { pending: 0, accepted: 1, declined: 2 };
    return list.sort((a, b) => {
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    });
  }, [enquiries, search, statusFilter]);

  const quickUpdate = (id: string, data: UpdatePartyEnquiryDto) => updateEnquiry({ id, data });

  const STAT_CARDS = [
    { icon: <ListAltIcon      sx={{ fontSize: 22, color: SD }}    />, iconBg: SP,         count: total,    label: 'Total' },
    { icon: <HourglassEmptyIcon sx={{ fontSize: 22, color: GOLD }} />, iconBg: GOLD_PALE, count: pending,  label: 'Pending' },
    { icon: <ThumbUpAltIcon   sx={{ fontSize: 22, color: GREEN }} />, iconBg: GREEN_PALE, count: accepted, label: 'Accepted' },
    { icon: <ThumbDownAltIcon sx={{ fontSize: 22, color: RED }}   />, iconBg: RED_PALE,   count: declined, label: 'Declined' },
  ];

  return (
    <Box>
      {/* PAGE HEADER */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <CelebrationIcon sx={{ color: SD, fontSize: 28 }} />
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color: SD }}>
            Party Enquiries
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.85rem', color: '#9A7A5A' }}>
          {total} total enquir{total !== 1 ? 'ies' : 'y'}
        </Typography>
      </Box>

      {/* STAT CARDS */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
        {STAT_CARDS.map(({ icon, iconBg, count, label }) => (
          <Card key={label} elevation={0} sx={{
            flex: '1 1 130px', minWidth: 130, border: '1.5px solid #FEF0E6',
            borderRadius: '14px', px: 2, py: 1.75,
            display: 'flex', alignItems: 'center', gap: 1.5,
            boxShadow: '0 2px 8px rgba(232,98,26,0.06)',
          }}>
            <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 700, color: '#3B1F0A', lineHeight: 1.1 }}>{count}</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#9A7A5A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* UPCOMING STRIP */}
      {upcoming.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ background: 'linear-gradient(135deg, #7B3FA0, #5B2A82)', borderRadius: '14px', p: '14px 18px', color: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
              <LocalShippingIcon sx={{ fontSize: 18, opacity: 0.85 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', opacity: 0.9 }}>
                Upcoming Deliveries — Next 7 Days
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              {upcoming.map(e => {
                const d = daysToGo(e.eventDate);
                const when = d === 0 ? 'TODAY' : d === 1 ? 'TOMORROW' : `in ${d} days`;
                const mealParts: string[] = [];
                if (e.meals.Breakfast > 0) mealParts.push(`B·${e.meals.Breakfast}`);
                if (e.meals.Lunch > 0)     mealParts.push(`L·${e.meals.Lunch}`);
                if (e.meals.Dinner > 0)    mealParts.push(`D·${e.meals.Dinner}`);
                return (
                  <Box key={e.id} sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '10px', px: 2, py: 1, minWidth: 180 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.83rem' }}>{e.name}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', opacity: 0.85, mt: 0.25 }}>{mealParts.join(' · ')} plates</Typography>
                    <Typography sx={{ fontSize: '0.72rem', opacity: 0.75, mt: 0.3 }}>
                      {e.eventDate} <strong>{when}</strong>
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

      {/* FILTER BAR */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small" placeholder="Search name, mobile, ID…"
          value={search} onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#9A7A5A' }} /></InputAdornment> } }}
          sx={{
            flex: '1 1 220px', minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px', fontSize: '0.83rem',
              '& fieldset': { borderColor: '#E8D8C0' },
              '&:hover fieldset': { borderColor: S },
              '&.Mui-focused fieldset': { borderColor: S },
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ fontSize: '0.83rem', '&.Mui-focused': { color: SD } }}>Status</InputLabel>
          <Select
            label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            sx={{
              borderRadius: '10px', fontSize: '0.83rem',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8D8C0' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: S },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: S },
            }}>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="declined">Declined</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* TABLE CARD */}
      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Enquiry ID', 'Customer', 'Event Date', 'Meals', 'Plates', 'Menu / Price', 'Status', 'Payment', 'Actions'].map(h => (
                  <TableCell key={h} sx={TH_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {eLoad ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={24} sx={{ color: S }} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#9A7A5A', fontSize: '0.85rem' }}>
                    {enquiries.length === 0 ? 'No party enquiries yet.' : 'No enquiries match your filters.'}
                  </TableCell>
                </TableRow>
              ) : filtered.map(e => {
                const totalPlates = e.meals.Breakfast + e.meals.Lunch + e.meals.Dinner;
                return (
                  <TableRow key={e.id} onClick={() => setSelectedEnquiry(e)}
                    sx={{ cursor: 'pointer', bgcolor: rowBg(e.status), '&:hover td': { filter: 'brightness(0.97)' }, '&:last-child td': { border: 0 } }}>

                    <TableCell sx={TD_SX}>
                      <Box component="span" sx={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, color: GOLD, bgcolor: GOLD_PALE, px: 1.25, py: 0.4, borderRadius: '50px' }}>
                        {e.id}
                      </Box>
                    </TableCell>

                    <TableCell sx={TD_SX}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.83rem', color: '#3B1F0A' }}>{e.name}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#9A7A5A', mt: 0.25 }}>📞 {e.mobile}</Typography>
                    </TableCell>

                    <TableCell sx={TD_SX}><DateChip dateStr={e.eventDate} /></TableCell>

                    <TableCell sx={TD_SX}><MealSummary meals={e.meals} /></TableCell>

                    <TableCell sx={{ ...TD_SX, textAlign: 'center', fontWeight: 700 }}>{totalPlates}</TableCell>

                    <TableCell sx={{ ...TD_SX, maxWidth: 180 }}><MenuCell eq={e} /></TableCell>

                    <TableCell sx={{ ...TD_SX, textAlign: 'center' }}><StatusPill s={e.status} /></TableCell>

                    <TableCell sx={{ ...TD_SX, textAlign: 'center' }}><PaymentCell eq={e} /></TableCell>

                    <TableCell sx={{ ...TD_SX, whiteSpace: 'nowrap', textAlign: 'center' }} onClick={ev => ev.stopPropagation()}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="View details">
                          <IconButton size="small" onClick={() => setSelectedEnquiry(e)}
                            sx={{ color: SD, bgcolor: SP, borderRadius: '8px', p: 0.6, '&:hover': { bgcolor: '#FEE0CC' } }}>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {e.status === 'pending' && (
                          <>
                            <Tooltip title="Accept">
                              <IconButton size="small" onClick={() => quickUpdate(e.id, { status: 'accepted' })}
                                sx={{ color: GREEN, bgcolor: GREEN_PALE, borderRadius: '8px', p: 0.6, '&:hover': { bgcolor: '#C3EDD4' } }}>
                                <CheckCircleIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Decline">
                              <IconButton size="small" onClick={() => quickUpdate(e.id, { status: 'declined' })}
                                sx={{ color: RED, bgcolor: RED_PALE, borderRadius: '8px', p: 0.6, '&:hover': { bgcolor: '#FECACA' } }}>
                                <CancelIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ px: 3, py: 1.25, borderTop: '1px solid #F2E8D8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#9A7A5A' }}>
            {filtered.length} of {total} enquir{total !== 1 ? 'ies' : 'y'}
          </Typography>
          {pending > 0 && (
            <Typography sx={{ fontSize: '0.75rem', color: GOLD, fontWeight: 600 }}>
              {pending} awaiting response
            </Typography>
          )}
        </Box>
      </Card>

      {selectedEnquiry && (
        <EnquiryModal eq={selectedEnquiry} onClose={() => setSelectedEnquiry(null)} />
      )}
    </Box>
  );
}
