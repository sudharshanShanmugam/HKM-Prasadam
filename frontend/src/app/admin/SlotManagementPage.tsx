'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/context/toast';
import { z } from 'zod';
import {
  useGetSlotManagementSlotsQuery,
  useGetMonthlySummaryQuery,
  useUpsertSlotManagementMutation,
  useDeleteSlotManagementMutation,
} from '@/services/slotManagementApi';
import { useGetSettingsQuery } from '@/services/settingsApi';
import { useGetMealMenuByDateQuery, useSaveMealMenuMutation } from '@/services/mealMenusApi';
import type { MealType, SlotDate, MealMenuMap } from '@/types';

// MUI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// MUI Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BlockIcon from '@mui/icons-material/Block';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircle';
import LinearProgress from '@mui/material/LinearProgress';

// ─── constants ────────────────────────────────────────────────────────────────
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const ALL_MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
const LOCS = ['Thiruvanmiyur', 'NLBR'] as const;

const pad    = (n: number) => String(n).padStart(2, '0');
const toStr  = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

const S = '#E8621A'; const SD = '#C44D0D'; const SP = '#FEF0E6';
const GOLD = '#C9920A'; const GP = '#FFF9E6';
const GREEN = '#2D7A3A'; const GRP = '#EBF7ED';
const RED = '#C0392B'; const RP = '#FDECEA';

function MealIcon({ meal, size = 16 }: { meal: MealType; size?: number }) {
  if (meal === 'Breakfast') return <FreeBreakfastIcon sx={{ fontSize: size }} />;
  if (meal === 'Lunch')     return <WbSunnyIcon       sx={{ fontSize: size }} />;
  return                           <NightlightIcon    sx={{ fontSize: size }} />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SlotManagementPage({ onNav }: { onNav?: (p: string) => void }) {
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [dayLabel,   setDayLabel]   = useState('');
  const [editMeals,  setEditMeals]  = useState<MealType[]>([...ALL_MEALS]);
  const [stopped,    setStopped]    = useState(false);
  const [prices,     setPrices]     = useState<Record<MealType, string>>({ Breakfast: '', Lunch: '', Dinner: '' });
  const [removed,    setRemoved]    = useState<MealType[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [saveError,  setSaveError]  = useState('');
  const [showAll,    setShowAll]    = useState(false);
  const PREVIEW = 4;

  // Per-date menus (populated from API when selectedDate changes)
  const emptyMenus = (): Record<MealType, string> => ({ Breakfast: '', Lunch: '', Dinner: '' });
  const [menus,     setMenus]     = useState<Record<MealType, string>>(emptyMenus());

  // Menu dialog state
  const [menuMeal,   setMenuMeal]   = useState<MealType | null>(null);
  const [menuText,   setMenuText]   = useState('');
  const [menuSaving, setMenuSaving] = useState(false);

  // Summary day modal
  const [summaryDate,    setSummaryDate]    = useState<string | null>(null);
  const [togglingStop,   setTogglingStop]   = useState(false);
  const [togglingMeal,   setTogglingMeal]   = useState<MealType | null>(null);

  type LimitMap = Record<string, Record<MealType, string>>;
  const emptyLimits = (): LimitMap => ({
    Thiruvanmiyur: { Breakfast: '', Lunch: '', Dinner: '' },
    NLBR:          { Breakfast: '', Lunch: '', Dinner: '' },
  });
  const [limits, setLimits] = useState<LimitMap>(emptyLimits());

  const currentMonthStr = `${calYear}-${pad(calMonth + 1)}`;

  const { data: slots          = [] } = useGetSlotManagementSlotsQuery();
  const { data: monthlySummary = {} } = useGetMonthlySummaryQuery(currentMonthStr);
  const { data: settingsData        } = useGetSettingsQuery();
  const { data: menuData            } = useGetMealMenuByDateQuery(selectedDate ?? '', { skip: !selectedDate });

  // Sync local menus ONLY when the API response is for the currently selected date.
  // This prevents stale cached data for the previous date from leaking in.
  useEffect(() => {
    if (menuData?.date === selectedDate && menuData.meals) {
      setMenus({ Breakfast: menuData.meals.Breakfast ?? '', Lunch: menuData.meals.Lunch ?? '', Dinner: menuData.meals.Dinner ?? '' });
    }
  }, [menuData, selectedDate]);

  const [upsert]    = useUpsertSlotManagementMutation();
  const [del]       = useDeleteSlotManagementMutation();
  const [saveMenu]  = useSaveMealMenuMutation();
  const { showToast } = useToast();

  const slotMap = useMemo(() => {
    const m: Record<string, SlotDate> = {};
    slots.forEach(s => { m[s.date] = s; });
    return m;
  }, [slots]);

  const bookingMap = useMemo(() => {
    const m: Record<string, Record<MealType, number>> = {};
    Object.entries(monthlySummary).forEach(([date, data]) => {
      m[date] = { Breakfast: data.Breakfast, Lunch: data.Lunch, Dinner: data.Dinner };
    });
    return m;
  }, [monthlySummary]);

  const calDays = useMemo(() => {
    const firstDow = new Date(calYear, calMonth, 1).getDay();
    const total    = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }, [calYear, calMonth]);

  const shiftMonth = (dir: -1 | 1) => {
    setCalMonth(m => {
      const nm = m + dir;
      if (nm < 0)  { setCalYear(y => y - 1); return 11; }
      if (nm > 11) { setCalYear(y => y + 1); return 0;  }
      return nm;
    });
  };

  const todayStr = toStr(now.getFullYear(), now.getMonth(), now.getDate());

  const selectDay = (d: number) => {
    const ds = toStr(calYear, calMonth, d);
    setSelectedDate(ds); setSaved(false);
    const fr: Record<MealType, number> = settingsData
      ? { ...settingsData.defaultMealRates }
      : { Breakfast: 20, Lunch: 40, Dinner: 35 };
    const fl: Record<string, Record<MealType, number>> = settingsData
      ? {
          Thiruvanmiyur: { ...settingsData.defaultSlotLimits.Thiruvanmiyur },
          NLBR:          { ...settingsData.defaultSlotLimits.NLBR },
        }
      : {
          Thiruvanmiyur: { Breakfast: 100, Lunch: 100, Dinner: 100 },
          NLBR:          { Breakfast: 80,  Lunch: 80,  Dinner: 80  },
        };
    const slot = slotMap[ds];
    if (slot) {
      setDayLabel(slot.festivalName ?? '');
      setEditMeals(slot.meals.length > 0 ? slot.meals : [...ALL_MEALS]);
      setStopped(slot.stopped ?? false);
      setPrices({
        Breakfast: String(slot.priceOverrides?.Breakfast ?? fr.Breakfast),
        Lunch:     String(slot.priceOverrides?.Lunch     ?? fr.Lunch),
        Dinner:    String(slot.priceOverrides?.Dinner    ?? fr.Dinner),
      });
      setLimits({
        Thiruvanmiyur: {
          Breakfast: String(slot.slotLimits?.Thiruvanmiyur?.Breakfast ?? fl.Thiruvanmiyur.Breakfast),
          Lunch:     String(slot.slotLimits?.Thiruvanmiyur?.Lunch     ?? fl.Thiruvanmiyur.Lunch),
          Dinner:    String(slot.slotLimits?.Thiruvanmiyur?.Dinner    ?? fl.Thiruvanmiyur.Dinner),
        },
        NLBR: {
          Breakfast: String(slot.slotLimits?.NLBR?.Breakfast ?? fl.NLBR.Breakfast),
          Lunch:     String(slot.slotLimits?.NLBR?.Lunch     ?? fl.NLBR.Lunch),
          Dinner:    String(slot.slotLimits?.NLBR?.Dinner    ?? fl.NLBR.Dinner),
        },
      });
      setRemoved(ALL_MEALS.filter(m => slot.mealStatus?.[m]?.removed));
    } else {
      setDayLabel(''); setEditMeals([...ALL_MEALS]); setStopped(false);
      setPrices({ Breakfast: String(fr.Breakfast), Lunch: String(fr.Lunch), Dinner: String(fr.Dinner) });
      setLimits({
        Thiruvanmiyur: { Breakfast: String(fl.Thiruvanmiyur.Breakfast), Lunch: String(fl.Thiruvanmiyur.Lunch), Dinner: String(fl.Thiruvanmiyur.Dinner) },
        NLBR:          { Breakfast: String(fl.NLBR.Breakfast),          Lunch: String(fl.NLBR.Lunch),          Dinner: String(fl.NLBR.Dinner) },
      });
      setRemoved([]);
    }
    // Always clear menus immediately — useEffect will fill them in once the
    // API response for the new date arrives (and only if the date matches).
    setMenus(emptyMenus());
  };

  const toggleRemove = (m: MealType) => {
    setRemoved(prev => {
      const next = prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m];
      if (next.length < ALL_MEALS.length) setSaveError('');
      return next;
    });
  };

  const slotSchema = z.object({
    removed: z.array(z.string()).refine(
      r => r.length < ALL_MEALS.length,
      { message: 'At least one meal must be available.' }
    ),
    prices: z.record(
      z.string(),
      z.string().refine(v => v === '' || (!isNaN(Number(v)) && Number(v) >= 0), {
        message: 'Price must be a positive number.',
      })
    ),
  });

  const saveDay = async () => {
    if (!selectedDate) return;
    const result = slotSchema.safeParse({ removed, prices });
    if (!result.success) {
      setSaveError(result.error.issues[0]?.message ?? 'Validation failed.');
      return;
    }
    setSaveError('');
    setSaving(true);
    const priceOverrides: Partial<Record<MealType, number>> = {};
    ALL_MEALS.forEach(m => { if (prices[m] !== '') priceOverrides[m] = Number(prices[m]); });
    const mealStatus: Record<string, { stopped: boolean; removed: boolean }> = {};
    ALL_MEALS.forEach(m => { mealStatus[m] = { stopped: false, removed: removed.includes(m) }; });
    const slotLimits: SlotDate['slotLimits'] = {};
    LOCS.forEach(loc => {
      slotLimits[loc] = {} as Record<MealType, number>;
      ALL_MEALS.forEach(m => {
        if (limits[loc][m] !== '') (slotLimits[loc] as Record<MealType, number>)[m] = Number(limits[loc][m]);
      });
    });
    await upsert({ date: selectedDate, data: { meals: editMeals, stopped, isFestival: !!dayLabel, festivalName: dayLabel || undefined, priceOverrides, slotLimits, mealStatus: mealStatus as SlotDate['mealStatus'] } });
    setSaving(false); setSaved(true);
    showToast(`Slot saved for ${selectedDate}`, 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  async function toggleStop(ds: string) {
    const slot = slotMap[ds];
    const nowStopped = slot?.stopped ?? false;
    setTogglingStop(true);
    await upsert({
      date: ds,
      data: {
        meals:         slot?.meals         ?? [...ALL_MEALS],
        stopped:       !nowStopped,
        isFestival:    slot?.isFestival    ?? false,
        festivalName:  slot?.festivalName,
        priceOverrides: slot?.priceOverrides ?? {},
        slotLimits:    slot?.slotLimits    ?? {},
        mealStatus:    (slot?.mealStatus   ?? {}) as SlotDate['mealStatus'],
      },
    });
    setTogglingStop(false);
  }

  async function toggleMealStop(ds: string, meal: MealType) {
    const slot = slotMap[ds];
    const cur  = slot?.mealStatus ?? {};
    const isRemoved = cur[meal]?.removed ?? false;
    setTogglingMeal(meal);
    await upsert({
      date: ds,
      data: {
        meals:         slot?.meals         ?? [...ALL_MEALS],
        stopped:       slot?.stopped       ?? false,
        isFestival:    slot?.isFestival    ?? false,
        festivalName:  slot?.festivalName,
        priceOverrides: slot?.priceOverrides ?? {},
        slotLimits:    slot?.slotLimits    ?? {},
        mealStatus: {
          ...cur,
          [meal]: { stopped: false, removed: !isRemoved },
        } as SlotDate['mealStatus'],
      },
    });
    setTogglingMeal(null);
  }

  function openMenuDialog(meal: MealType) {
    setMenuMeal(meal);
    setMenuText(menus[meal]);
    setMenuSaving(false);
  }

  async function handleSaveMenu() {
    if (!selectedDate || !menuMeal) return;
    setMenuSaving(true);
    const updated: MealMenuMap = { ...menus, [menuMeal]: menuText };
    await saveMenu({ date: selectedDate, meals: updated });
    setMenus(updated);
    setMenuSaving(false);
    setMenuMeal(null);
  }

  const clearDay = async () => {
    if (!selectedDate || !slotMap[selectedDate]) return;
    if (confirm(`Remove all configuration for ${selectedDate}?`)) {
      await del(selectedDate);
      setSelectedDate(null);
    }
  };

  const monthLabel = `${MONTHS[calMonth]} ${calYear}`;
  const fmtDate = (ds: string) => new Date(ds + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* PAGE HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <CalendarMonthIcon sx={{ color: SD, fontSize: 28 }} />
        <Box>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color: SD, lineHeight: 1.15 }}>
            Slot Management
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#9A7A5A' }}>
            Configure slot dates, meal rates and booking limits
          </Typography>
        </Box>
      </Box>

      {/* ── TWO COLUMN LAYOUT ── */}
      <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>

        {/* LEFT */}
        <Grid size={{ xs: 12, md: 8 }}>

          {/* CALENDAR CARD */}
          <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 14px rgba(232,98,26,0.08)', mb: 3 }}>

            {/* Month nav header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.25, background: `linear-gradient(135deg, ${SD}, ${S}, #F4893A)` }}>
              <IconButton onClick={() => shiftMonth(-1)} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' } }}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                {monthLabel}
              </Typography>
              <IconButton onClick={() => shiftMonth(1)} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' } }}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Day-of-week labels */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', px: 2, pt: 2, pb: 0.5 }}>
              {DAYS.map(d => (
                <Typography key={d} sx={{ textAlign: 'center', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A7A5A', py: 0.5 }}>
                  {d}
                </Typography>
              ))}
            </Box>

            {/* Calendar grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', px: 2, pb: 2 }}>
              {calDays.map((d, i) => {
                if (d === null) return <Box key={`e${i}`} />;
                const ds        = toStr(calYear, calMonth, d);
                const slot      = slotMap[ds];
                const bk        = bookingMap[ds];
                const isSun     = new Date(ds + 'T00:00:00').getDay() === 0;
                const hasPrice  = slot && Object.values(slot.priceOverrides ?? {}).some(v => v != null);
                const hasBk     = bk && (bk.Breakfast + bk.Lunch + bk.Dinner) > 0;
                const isToday   = ds === todayStr;
                const isSel     = ds === selectedDate;
                const isStopped = slot?.stopped;

                let bg = '#FBF6EE'; let border = 'transparent'; let color = '#3B1F0A'; let bw = '1.5px';
                if (isSun)     { color = '#7B1D1D'; }
                if (isToday)   { bg = GP; border = GOLD; }
                if (slot && !hasPrice) { border = S; }
                if (hasPrice)  { border = S; bw = '2px'; }
                if (isStopped) { bg = '#FFF4F4'; border = RED; color = RED; }
                if (isSel)     { bg = `linear-gradient(135deg, ${S}, ${GOLD})`; border = 'transparent'; color = '#fff'; }

                return (
                  <Box
                    key={ds}
                    onClick={() => selectDay(d)}
                    sx={{
                      aspectRatio: '1', borderRadius: '8px',
                      border: `${bw} solid ${border}`,
                      background: bg, color,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', position: 'relative',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: S, bgcolor: isSel ? undefined : SP },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: isSel || isToday ? 700 : 500, color: 'inherit', lineHeight: 1, textDecoration: isStopped && !isSel ? 'line-through' : 'none' }}>
                      {d}
                    </Typography>
                    {(slot || hasBk) && (
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isSel ? 'rgba(255,255,255,0.8)' : S, mt: 0.4, flexShrink: 0 }} />
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', gap: 2.5, px: 2.5, py: 1.5, bgcolor: SP, borderTop: `1px solid rgba(232,98,26,0.12)`, flexWrap: 'wrap' }}>
              {[
                { bg: GP, border: GOLD, label: 'Today' },
                { bg: `linear-gradient(135deg,${S},${GOLD})`, label: 'Selected' },
                { bg: SP, border: S, label: 'Slot Configured' },
                { bg: SP, border: S, bw: '2px', label: 'Custom Price' },
                { bg: '#FFF4F4', border: RED, label: 'Stopped' },
              ].map(({ bg, border, bw, label }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '3px', background: bg, border: border ? `${bw ?? '1.5px'} solid ${border}` : 'none', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#5A3A1A' }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* CONFIGURED SLOTS LIST */}
          <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 14px rgba(232,98,26,0.08)' }}>
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1.5px solid #FEF0E6', background: `linear-gradient(to right, ${SP}, ${GP})`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon sx={{ color: SD, fontSize: 18 }} />
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: SD, fontWeight: 600 }}>Configured Slots</Typography>
              </Box>
              <Chip label={`${slots.length} slot${slots.length !== 1 ? 's' : ''}`} size="small" sx={{ bgcolor: SP, color: SD, fontWeight: 600, fontSize: '0.72rem', borderRadius: '50px' }} />
            </Box>

            {slots.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center', color: '#9A7A5A', fontSize: '0.82rem' }}>
                No slots configured yet. Click a date on the calendar above.
              </Box>
            ) : (() => {
              const sorted  = [...slots].sort((a, b) => a.date.localeCompare(b.date));
              const visible = showAll ? sorted : sorted.slice(0, PREVIEW);
              return (
                <>
                  {visible.map((s, idx) => {
                    const hasCustom = Object.values(s.priceOverrides ?? {}).some(v => v != null);
                    return (
                      <Box
                        key={s.date}
                        onClick={() => { const d = new Date(s.date + 'T00:00:00'); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); selectDay(d.getDate()); }}
                        sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.5, borderTop: idx > 0 ? '1px solid #F2E8D8' : 'none', cursor: 'pointer', transition: 'bg 0.15s', '&:hover': { bgcolor: SP } }}
                      >
                        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 700, color: SD, minWidth: 100 }}>{s.date}</Typography>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#3B1F0A', flex: 1 }}>
                          {s.isFestival && s.festivalName ? s.festivalName : s.meals.join(' · ')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          {hasCustom && ALL_MEALS.map(m => s.priceOverrides?.[m] != null
                            ? <Chip key={m} label={`₹${s.priceOverrides[m]}`} size="small" icon={<MealIcon meal={m} size={12} />} sx={{ bgcolor: SP, color: SD, fontWeight: 600, fontSize: '0.68rem', height: 22, borderRadius: '50px' }} />
                            : null
                          )}
                          <Chip label={s.stopped ? 'Stopped' : 'Active'} size="small" sx={{ bgcolor: s.stopped ? RP : GRP, color: s.stopped ? RED : GREEN, fontWeight: 700, fontSize: '0.65rem', height: 22, borderRadius: '50px' }} />
                        </Box>
                      </Box>
                    );
                  })}
                  {sorted.length > PREVIEW && (
                    <Button
                      fullWidth size="small"
                      onClick={() => setShowAll(v => !v)}
                      sx={{ py: 1.25, borderTop: '1px solid #F2E8D8', borderRadius: 0, color: SD, bgcolor: SP, textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, '&:hover': { bgcolor: '#FEE8D4' } }}
                    >
                      {showAll ? '▲ Show less' : `▼ Show ${sorted.length - PREVIEW} more`}
                    </Button>
                  )}
                </>
              );
            })()}
          </Card>
        </Grid>

        {/* RIGHT — RATE EDITOR */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 14px rgba(232,98,26,0.08)', position: 'sticky', top: 76 }}>

            {/* Panel header */}
            <Box sx={{ px: 2.5, py: 2.25, background: `linear-gradient(135deg, ${SD}, ${S})` }}>
              <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, color: '#fff', mb: 0.25 }}>
                Slot Rate Editor
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.72)' }}>
                {selectedDate ? fmtDate(selectedDate) : 'Select a date on the calendar to edit'}
              </Typography>
            </Box>

            {!selectedDate ? (
              <Box sx={{ py: 6, textAlign: 'center', color: '#9A7A5A' }}>
                <CalendarMonthIcon sx={{ fontSize: 40, color: '#D8C0A8', mb: 1.5 }} />
                <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
                  Click any date on the calendar<br />to configure rates and limits.
                </Typography>
              </Box>
            ) : (
              <>
                <CardContent sx={{ px: 2.5, py: 2.5 }}>

                  {/* Date pill */}
                  <Box sx={{ textAlign: 'center', background: `linear-gradient(135deg, ${SD}, ${S})`, borderRadius: '50px', py: 1.25, mb: 2.5, boxShadow: '0 3px 12px rgba(232,98,26,0.28)' }}>
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Typography>
                  </Box>

                  {/* Occasion label */}
                  <TextField
                    fullWidth size="small" label="Day Label / Occasion"
                    placeholder="e.g. Janmashtami, Ekadashi…"
                    value={dayLabel}
                    onChange={e => setDayLabel(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '9px', fontSize: '0.85rem',
                        '& fieldset': { borderColor: '#E8D8C0' },
                        '&:hover fieldset': { borderColor: S },
                        '&.Mui-focused fieldset': { borderColor: S },
                      },
                      '& .MuiInputLabel-root': { fontSize: '0.83rem', color: '#9A7A5A' },
                      '& .MuiInputLabel-root.Mui-focused': { color: SD },
                    }}
                  />

                  {/* Meal Rates */}
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5A3A1A', mb: 1, mt: 1.5 }}>
                    Meal Rates for This Day
                  </Typography>

                  {ALL_MEALS.map((m, idx) => {
                    const isRm = removed.includes(m);
                    return (
                      <Box key={m} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, borderBottom: idx < ALL_MEALS.length - 1 ? '1px solid #F2E8D8' : 'none', opacity: isRm ? 0.45 : 1 }}>
                        <Box sx={{ color: SD, flexShrink: 0 }}><MealIcon meal={m} size={18} /></Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#5A3A1A', flex: 1 }}>
                          {m}
                        </Typography>
                        <TextField
                          size="small" type="number"
                          placeholder="0"
                          value={prices[m]}
                          onChange={e => setPrices(p => ({ ...p, [m]: e.target.value }))}
                          disabled={isRm}
                          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: SD }}>₹</Typography></InputAdornment> } }}
                          sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.88rem', bgcolor: prices[m] ? SP : '#FBF6EE', '& fieldset': { borderColor: prices[m] ? S : '#E8D8C0' }, '&:hover fieldset': { borderColor: S } } }}
                        />
                        <Tooltip title={menus[m] ? 'Edit menu' : 'Add menu'}>
                          <Button
                            size="small"
                            disabled={isRm}
                            onClick={() => openMenuDialog(m)}
                            startIcon={<MenuBookIcon sx={{ fontSize: '14px !important' }} />}
                            sx={{
                              minWidth: 0, px: 1.25, py: 0.5, fontSize: '0.7rem', fontWeight: 700,
                              borderRadius: '8px', textTransform: 'none',
                              border: `1.5px solid ${menus[m] ? GOLD : '#E8D8C0'}`,
                              color: menus[m] ? GOLD : '#9A7A5A',
                              bgcolor: menus[m] ? GP : 'transparent',
                              '&:hover': { bgcolor: GP, borderColor: GOLD, color: GOLD },
                              '&.Mui-disabled': { opacity: 0.4 },
                            }}
                          >
                            {menus[m] ? 'Menu' : 'Menu'}
                          </Button>
                        </Tooltip>
                        <Tooltip title={isRm ? 'Restore meal' : 'Mark unavailable'}>
                          <IconButton size="small" onClick={() => toggleRemove(m)} sx={{ border: `1.5px solid ${isRm ? '#b2dfbc' : '#E8D8C0'}`, borderRadius: '8px', color: isRm ? GREEN : '#9A7A5A', '&:hover': { bgcolor: isRm ? GRP : RP, borderColor: isRm ? GREEN : RED, color: isRm ? GREEN : RED }, width: 28, height: 28 }}>
                            {isRm ? <AddIcon sx={{ fontSize: 14 }} /> : <CloseIcon sx={{ fontSize: 14 }} />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    );
                  })}

                  <Typography sx={{ fontSize: '0.72rem', color: '#9A7A5A', mt: 1, lineHeight: 1.6 }}>
                    Leave price blank to use global default rates.
                  </Typography>

                  {/* Slot Limits */}
                  <Divider sx={{ my: 2, borderColor: '#F2E8D8' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <ConfirmationNumberIcon sx={{ fontSize: 16, color: SD }} />
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5A3A1A' }}>
                      Slot Limits for This Date
                    </Typography>
                  </Box>

                  {/* Limits grid header */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 1, mb: 0.75 }}>
                    <Box />
                    {LOCS.map(loc => (
                      <Typography key={loc} sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9A7A5A', textAlign: 'center' }}>{loc}</Typography>
                    ))}
                  </Box>

                  {ALL_MEALS.filter(m => !removed.includes(m)).map((m, idx, arr) => (
                    <Box key={m} sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 1, alignItems: 'center', py: 0.875, borderBottom: idx < arr.length - 1 ? '1px solid #F2E8D8' : 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#5A3A1A' }}>
                        <MealIcon meal={m} size={13} />
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 500 }}>{m}</Typography>
                      </Box>
                      {LOCS.map(loc => (
                        <TextField
                          key={loc} size="small" type="number"
                          value={limits[loc][m]}
                          onChange={e => setLimits(prev => ({ ...prev, [loc]: { ...prev[loc], [m]: e.target.value } }))}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '7px', fontSize: '0.85rem', '& input': { textAlign: 'center', py: 0.75 }, '& fieldset': { borderColor: '#E8D8C0' }, '&:hover fieldset': { borderColor: S }, '&.Mui-focused fieldset': { borderColor: S } } }}
                        />
                      ))}
                    </Box>
                  ))}

                  <Typography sx={{ fontSize: '0.72rem', color: '#9A7A5A', mt: 1, lineHeight: 1.6 }}>
                    Leave blank for global defaults.{' '}
                    <Box component="span" onClick={() => onNav?.('settings')} sx={{ color: SD, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                      Edit in Default Settings ↗
                    </Box>
                  </Typography>
                </CardContent>

                {/* Action footer */}
                {saveError && (
                  <Box sx={{ mx: 2.5, mb: 1.5, mt: 1, px: 1.5, py: 0.875, bgcolor: RP, border: `1px solid #f5c6c2`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <BlockIcon sx={{ fontSize: 14, color: RED, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.75rem', color: RED, fontWeight: 600 }}>{saveError}</Typography>
                  </Box>
                )}
                <Box sx={{ px: 2.5, py: 2, borderTop: '1.5px solid #FEF0E6', bgcolor: SP, display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth variant="contained"
                    startIcon={saving ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : saved ? <CheckIcon sx={{ fontSize: 16 }} /> : <SaveIcon sx={{ fontSize: 16 }} />}
                    disabled={saving}
                    onClick={saveDay}
                    sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', bgcolor: saved ? GREEN : S, boxShadow: 'none', '&:hover': { bgcolor: saved ? GREEN : SD }, '&:disabled': { bgcolor: '#C0B090', color: '#fff' } }}
                  >
                    {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Rates & Limits'}
                  </Button>
                  {slotMap[selectedDate] && (
                    <Tooltip title="Delete this slot configuration">
                      <IconButton onClick={clearDay} sx={{ border: '1.5px solid #f5c6c2', color: RED, borderRadius: '50px', px: 1.5, '&:hover': { bgcolor: RP } }}>
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* ── BOOKING SUMMARY CALENDAR ── */}
      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', mt: 4, boxShadow: '0 2px 14px rgba(232,98,26,0.08)' }}>

        {/* Summary header */}
        <Box sx={{ px: 3, py: 2.25, background: `linear-gradient(135deg, ${SD}, ${S})`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Monthly Booking Summary</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', mt: 0.25 }}>Total coupons booked per meal per date</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Meal legend */}
            {([
              { label: 'Breakfast', bg: SP,         color: SD,        icon: <FreeBreakfastIcon sx={{ fontSize: '12px !important', ml: '6px !important' }} /> },
              { label: 'Lunch',     bg: '#FFF8E1',  color: '#e65100', icon: <WbSunnyIcon       sx={{ fontSize: '12px !important', ml: '6px !important' }} /> },
              { label: 'Dinner',    bg: '#EDE7F6',  color: '#512da8', icon: <NightlightIcon    sx={{ fontSize: '12px !important', ml: '6px !important' }} /> },
            ] as const).map(({ label, bg, color, icon }) => (
              <Chip key={label} icon={icon} label={label} size="small" sx={{ bgcolor: bg, color, fontWeight: 700, fontSize: '0.65rem', height: 22, borderRadius: '50px', '& .MuiChip-icon': { color } }} />
            ))}
            {/* Month nav */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '8px', px: 1.5, py: 0.5 }}>
              <IconButton size="small" onClick={() => shiftMonth(-1)} sx={{ color: '#fff', p: 0.25, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><ChevronLeftIcon /></IconButton>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', minWidth: 110, textAlign: 'center' }}>{monthLabel}</Typography>
              <IconButton size="small" onClick={() => shiftMonth(1)}  sx={{ color: '#fff', p: 0.25, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}><ChevronRightIcon /></IconButton>
            </Box>
          </Box>
        </Box>

        {/* Day-of-week header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', bgcolor: '#FBF6EE', borderBottom: '1px solid #F2E8D8' }}>
          {DAYS.map(d => (
            <Typography key={d} sx={{ textAlign: 'center', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A7A5A', py: 1 }}>{d}</Typography>
          ))}
        </Box>

        {/* Summary grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', bgcolor: '#F2E8D8' }}>
          {calDays.map((d, i) => {
            if (d === null) return <Box key={`be${i}`} sx={{ bgcolor: '#FBF6EE', minHeight: 76 }} />;
            const ds         = toStr(calYear, calMonth, d);
            const bk         = bookingMap[ds];
            const slot       = slotMap[ds];
            const hasBk       = bk && (bk.Breakfast + bk.Lunch + bk.Dinner) > 0;
            const allStopped  = slot?.stopped ?? false;
            const isRegistered = !!slot;
            const isToday     = ds === todayStr;
            const showCell    = hasBk || isRegistered;

            return (
              <Box
                key={ds}
                onClick={() => setSummaryDate(ds)}
                sx={{
                  bgcolor: showCell && allStopped ? '#fff4f4' : isToday ? GP : '#fff',
                  minHeight: 76, p: '8px 7px', cursor: 'pointer',
                  borderLeft: showCell
                    ? allStopped ? `3px solid ${RED}` : hasBk ? `3px solid ${S}` : `3px solid rgba(232,98,26,0.25)`
                    : '3px solid transparent',
                  transition: 'bg 0.15s',
                  '&:hover': { bgcolor: SP },
                }}
              >
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isToday ? SD : allStopped && showCell ? RED : '#3B1F0A', textDecoration: allStopped && showCell ? 'line-through' : 'none', mb: 0.75 }}>
                  {d}
                </Typography>
                {showCell && allStopped ? (
                  <Chip label="⛔ Stopped" size="small" sx={{ bgcolor: RP, color: RED, fontWeight: 700, fontSize: '0.55rem', height: 18, borderRadius: '3px' }} />
                ) : hasBk ? (
                  <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap' }}>
                    {bk?.Breakfast ? (
                      <Chip icon={<FreeBreakfastIcon sx={{ fontSize: '11px !important', ml: '5px !important' }} />} label={bk.Breakfast} size="small" sx={{ bgcolor: SP, color: SD, fontWeight: 700, fontSize: '0.6rem', height: 20, borderRadius: '4px', opacity: slot?.mealStatus?.Breakfast?.removed ? 0.5 : 1, textDecoration: slot?.mealStatus?.Breakfast?.removed ? 'line-through' : 'none', '& .MuiChip-icon': { color: SD } }} />
                    ) : null}
                    {bk?.Lunch ? (
                      <Chip icon={<WbSunnyIcon sx={{ fontSize: '11px !important', ml: '5px !important' }} />} label={bk.Lunch} size="small" sx={{ bgcolor: '#FFF8E1', color: '#e65100', fontWeight: 700, fontSize: '0.6rem', height: 20, borderRadius: '4px', opacity: slot?.mealStatus?.Lunch?.removed ? 0.5 : 1, '& .MuiChip-icon': { color: '#e65100' } }} />
                    ) : null}
                    {bk?.Dinner ? (
                      <Chip icon={<NightlightIcon sx={{ fontSize: '11px !important', ml: '5px !important' }} />} label={bk.Dinner} size="small" sx={{ bgcolor: '#EDE7F6', color: '#512da8', fontWeight: 700, fontSize: '0.6rem', height: 20, borderRadius: '4px', opacity: slot?.mealStatus?.Dinner?.removed ? 0.5 : 1, '& .MuiChip-icon': { color: '#512da8' } }} />
                    ) : null}
                  </Box>
                ) : isRegistered ? (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(232,98,26,0.35)', mt: 0.5 }} />
                ) : null}
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* ── SUMMARY DAY MODAL ── */}
      {(() => {
        if (!summaryDate) return null;
        const sd   = summaryDate;
        const bk   = bookingMap[sd];
        const slot = slotMap[sd];
        const isStopped = slot?.stopped ?? false;
        const dateLabel = new Date(sd + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        const mealConfig: { meal: MealType; icon: React.ReactNode; color: string; bg: string }[] = [
          { meal: 'Breakfast', icon: <FreeBreakfastIcon sx={{ fontSize: 15 }} />, color: '#92400E', bg: '#FEF3C7' },
          { meal: 'Lunch',     icon: <WbSunnyIcon       sx={{ fontSize: 15 }} />, color: '#78350F', bg: '#FFF9E6' },
          { meal: 'Dinner',    icon: <NightlightIcon    sx={{ fontSize: 15 }} />, color: '#4C1D95', bg: '#EDE9FE' },
        ];

        return (
          <Dialog open onClose={() => setSummaryDate(null)} maxWidth="sm" fullWidth
            slotProps={{ paper: { sx: { borderRadius: '18px', overflow: 'hidden' } } }}>

            {/* Dialog header */}
            <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F2E8D8', bgcolor: '#fff' }}>
              <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', fontWeight: 700, color: SD }}>
                {dateLabel}
              </Typography>
              <IconButton size="small" onClick={() => setSummaryDate(null)} sx={{ color: '#9A7A5A', '&:hover': { color: '#3B1F0A' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* ── 3 MEAL CARDS ── */}
            <DialogContent sx={{ p: 2.5, bgcolor: '#FBF6EE' }}>

              {/* ── STATUS BAR — only when meals are configured ── */}
              {(slot?.meals?.filter(m => !slot?.mealStatus?.[m]?.removed).length ?? 0) > 0 && <Box sx={{
                bgcolor: '#fff',
                border: `1.5px solid ${isStopped ? '#fecaca' : '#F2E8D8'}`,
                borderRadius: '12px',
                p: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 2, mb: 2,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* Mini calendar widget */}
                  <Box sx={{ width: 40, borderRadius: '8px', overflow: 'hidden', border: '1.5px solid #E8D8C0', flexShrink: 0 }}>
                    <Box sx={{ bgcolor: isStopped ? RED : SD, py: '3px', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {MONTHS[new Date(sd + 'T00:00:00').getMonth()].slice(0, 3)}
                      </Typography>
                    </Box>
                    <Box sx={{ bgcolor: '#fff', py: '5px', textAlign: 'center' }}>
                      <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 700, color: '#3B1F0A', lineHeight: 1 }}>
                        {new Date(sd + 'T00:00:00').getDate()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: isStopped ? RED : '#1A1A1A' }}>
                      {isStopped ? 'Bookings stopped' : 'Bookings open'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#9A7A5A', mt: 0.2 }}>
                      {isStopped ? 'All meals are paused for this date' : 'Use per-meal buttons below to stop individual meals'}
                    </Typography>
                    {slot?.isFestival && slot.festivalName && (
                      <Typography sx={{ fontSize: '0.68rem', color: SD, mt: 0.25, fontWeight: 600 }}>{slot.festivalName}</Typography>
                    )}
                  </Box>
                </Box>
                <Button
                  variant="outlined" size="small"
                  disabled={togglingStop}
                  onClick={() => toggleStop(sd)}
                  sx={{
                    borderRadius: '50px', textTransform: 'none', fontWeight: 700, fontSize: '0.78rem',
                    flexShrink: 0, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px',
                    color: isStopped ? GREEN : RED,
                    borderColor: isStopped ? '#b2dfbc' : '#fecaca',
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: isStopped ? GRP : RP, borderColor: isStopped ? GREEN : RED },
                    '&.Mui-disabled': { opacity: 0.5 },
                  }}
                >
                  {togglingStop
                    ? <><CircularProgress size={13} color="inherit" />{isStopped ? 'Resuming…' : 'Stopping…'}</>
                    : isStopped
                    ? <><PlayCircleOutlineIcon sx={{ fontSize: 16 }} />Resume Entire Date</>
                    : <><Box component="span" sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: RED, display: 'inline-block', flexShrink: 0 }} />Stop Entire Date</>}
                </Button>
              </Box>}
              {(() => {
                const activeMealConfig = mealConfig.filter(({ meal }) =>
                  slot?.meals?.includes(meal) && !slot?.mealStatus?.[meal]?.removed
                );
                if (activeMealConfig.length === 0) {
                  return (
                    <Box sx={{ textAlign: 'center', py: 4, color: '#9A7A5A' }}>
                      <Typography sx={{ fontSize: '1.5rem', mb: 0.75 }}>🎟</Typography>
                      <Typography sx={{ fontSize: '0.82rem' }}>No meals configured or booked for this date</Typography>
                    </Box>
                  );
                }
                const maxW = activeMealConfig.length === 1 ? 220 : activeMealConfig.length === 2 ? 460 : '100%';
                const cols = activeMealConfig.length === 1 ? '1fr' : activeMealConfig.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)';
                return (
              <Box sx={{ display: 'grid', gridTemplateColumns: cols, gap: 1.5, maxWidth: maxW, mx: 'auto' }}>
                {activeMealConfig.map(({ meal, icon, color, bg }) => {
                  const count      = bk?.[meal] ?? 0;
                  const limTV      = slot?.slotLimits?.Thiruvanmiyur?.[meal] ?? 0;
                  const limNL      = slot?.slotLimits?.NLBR?.[meal] ?? 0;
                  const totalLimit = limTV + limNL;
                  const pct        = totalLimit > 0 ? Math.min(Math.round((count / totalLimit) * 100), 100) : null;
                  const isRemoved  = slot?.mealStatus?.[meal]?.removed ?? false;
                  const barColor   = pct != null && pct >= 90 ? RED : pct != null && pct >= 75 ? '#e67e22' : color;

                  return (
                    <Box key={meal} sx={{
                      bgcolor: '#fff',
                      border: `1.5px solid ${isRemoved ? RED : '#F2E8D8'}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      opacity: isStopped ? 0.6 : 1,
                      transition: 'opacity 0.2s',
                    }}>
                      {/* Card header */}
                      <Box sx={{ px: 1.5, py: 1, bgcolor: bg, display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Box sx={{ color }}>{icon}</Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color }}>{meal}</Typography>
                      </Box>

                      {/* Count */}
                      <Box sx={{ px: 1.5, pt: 1.25, pb: 0.75, textAlign: 'center' }}>
                        <Typography sx={{
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: '1.6rem', fontWeight: 700, lineHeight: 1,
                          color: isRemoved ? '#C0B090' : '#3B1F0A',
                          textDecoration: isRemoved ? 'line-through' : 'none',
                        }}>
                          {count}
                          {totalLimit > 0 && (
                            <Box component="span" sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#9A7A5A' }}>
                              /{totalLimit}
                            </Box>
                          )}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#9A7A5A', mt: 0.25 }}>coupons</Typography>

                        {/* Fill bar */}
                        {pct !== null && (
                          <LinearProgress variant="determinate" value={pct}
                            sx={{ mt: 0.875, height: 5, borderRadius: '50px', bgcolor: '#F2E8D8',
                              '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: '50px' } }} />
                        )}
                        {pct !== null && (
                          <Typography sx={{ fontSize: '0.6rem', color: barColor, mt: 0.4, fontWeight: 600 }}>{pct}%</Typography>
                        )}
                      </Box>

                      {/* Per-meal stop button */}
                      <Box sx={{ px: 1, pb: 1 }}>
                        <Button
                          fullWidth size="small"
                          disabled={isStopped || togglingMeal === meal}
                          onClick={() => toggleMealStop(sd, meal)}
                          sx={{
                            borderRadius: '7px', textTransform: 'none', fontWeight: 700,
                            fontSize: '0.62rem', py: 0.5,
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            bgcolor: isRemoved ? GRP : RP,
                            color:   isRemoved ? GREEN : RED,
                            border: `1px solid ${isRemoved ? '#b2dfbc' : '#f5c6c2'}`,
                            '&:hover': { bgcolor: isRemoved ? '#c8e6c9' : '#fcdede' },
                            '&.Mui-disabled': { opacity: 0.4 },
                          }}
                        >
                          {togglingMeal === meal
                            ? <><CircularProgress size={11} color="inherit" /> …</>
                            : isRemoved
                            ? <><PlayCircleOutlineIcon sx={{ fontSize: 13 }} /> Resume</>
                            : <><BlockIcon sx={{ fontSize: 13 }} /> Stop</>}
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
                ); // end activeMealConfig.length > 0 branch
              })()} {/* end IIFE */}

              {/* Total row — only when there are bookings */}
              {bk && (bk.Breakfast + bk.Lunch + bk.Dinner) > 0 && (
                <Box sx={{ mt: 1.5, px: 2, py: 1.25, bgcolor: '#fff', borderRadius: '10px', border: '1px solid #F2E8D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#9A7A5A' }}>Total coupons booked</Typography>
                  <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: SD }}>
                    {(bk.Breakfast ?? 0) + (bk.Lunch ?? 0) + (bk.Dinner ?? 0)}
                  </Typography>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #F2E8D8', justifyContent: 'flex-end' }}>
              <Button size="small" onClick={() => setSummaryDate(null)}
                sx={{ color: '#9A7A5A', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        );
      })()}

      {/* ── MENU DIALOG ── */}
      <Dialog
        open={!!menuMeal}
        onClose={() => setMenuMeal(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', overflow: 'hidden' } } }}
      >
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${SD}, ${S})`, color: '#fff', py: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBookIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              {menuMeal} Menu — {selectedDate}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setMenuMeal(null)} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#9A7A5A', mb: 1.25 }}>
            Enter the menu items for this meal (one item per line). This will be visible to users on the booking page.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            size="small"
            placeholder={`e.g.\nPuri Bhaji\nRice Dal\nPayasam`}
            value={menuText}
            onChange={e => setMenuText(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px', fontSize: '0.85rem',
                '& fieldset': { borderColor: '#E8D8C0' },
                '&:hover fieldset': { borderColor: S },
                '&.Mui-focused fieldset': { borderColor: S },
              },
            }}
          />
          {menuText && (
            <Box sx={{ mt: 1.5, p: 1.25, bgcolor: SP, borderRadius: '8px', border: `1px solid rgba(232,98,26,0.15)` }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: SD, mb: 0.5 }}>Preview</Typography>
              {menuText.split('\n').filter(Boolean).map((line, i) => (
                <Typography key={i} sx={{ fontSize: '0.8rem', color: '#5A3A1A' }}>• {line}</Typography>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F2E8D8', gap: 1 }}>
          <Button size="small" onClick={() => setMenuMeal(null)} sx={{ color: '#9A7A5A', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={menuSaving}
            startIcon={menuSaving ? <CircularProgress size={13} sx={{ color: '#fff' }} /> : <CheckIcon sx={{ fontSize: 16 }} />}
            onClick={handleSaveMenu}
            sx={{ bgcolor: S, borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', '&:hover': { bgcolor: SD } }}
          >
            {menuSaving ? 'Saving…' : 'Save Menu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
