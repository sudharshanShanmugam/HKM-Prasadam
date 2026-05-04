'use client';

import { useState, useMemo } from 'react';
import {
  useGetSlotDatesAdminQuery,
  useUpsertSlotDateMutation,
  useDeleteSlotDateMutation,
} from '@/services/slotDatesApi';
import { useGetPrasadamBookingsQuery } from '@/services/prasadamBookingsApi';
import type { MealType, SlotDate } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const ALL_MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
const mealIcon = (m: MealType) => m === 'Breakfast' ? '🌅' : m === 'Lunch' ? '☀️' : '🌙';
const pad = (n: number) => String(n).padStart(2, '0');
const toStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export default function SlotManagementPage() {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // price-editor state
  const [dayLabel, setDayLabel] = useState('');
  const [editMeals, setEditMeals] = useState<MealType[]>([...ALL_MEALS]);
  const [stopped, setStopped] = useState(false);
  const [prices, setPrices] = useState<Record<MealType, string>>({ Breakfast: '', Lunch: '', Dinner: '' });
  const [removed, setRemoved] = useState<MealType[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: slots = [] } = useGetSlotDatesAdminQuery();
  const { data: bookings = [] } = useGetPrasadamBookingsQuery({});
  const [upsert] = useUpsertSlotDateMutation();
  const [del] = useDeleteSlotDateMutation();

  const slotMap = useMemo(() => {
    const m: Record<string, SlotDate> = {};
    slots.forEach(s => { m[s.date] = s; });
    return m;
  }, [slots]);

  const bookingMap = useMemo(() => {
    const m: Record<string, Record<MealType, number>> = {};
    bookings.forEach(b => {
      if (!m[b.date]) m[b.date] = { Breakfast: 0, Lunch: 0, Dinner: 0 };
      ALL_MEALS.forEach(meal => { m[b.date][meal] = (m[b.date][meal] ?? 0) + (b.meals[meal] ?? 0); });
    });
    return m;
  }, [bookings]);

  const calDays = useMemo(() => {
    const firstDow = new Date(calYear, calMonth, 1).getDay();
    const total = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }, [calYear, calMonth]);

  const shiftMonth = (dir: -1 | 1) => {
    setCalMonth(m => {
      const nm = m + dir;
      if (nm < 0) { setCalYear(y => y - 1); return 11; }
      if (nm > 11) { setCalYear(y => y + 1); return 0; }
      return nm;
    });
  };

  const todayStr = toStr(now.getFullYear(), now.getMonth(), now.getDate());

  const selectDay = (d: number) => {
    const ds = toStr(calYear, calMonth, d);
    setSelectedDate(ds);
    setSaved(false);
    const slot = slotMap[ds];
    if (slot) {
      setDayLabel(slot.festivalName ?? '');
      setEditMeals(slot.meals.length > 0 ? slot.meals : [...ALL_MEALS]);
      setStopped(slot.stopped ?? false);
      setPrices({
        Breakfast: slot.priceOverrides?.Breakfast != null ? String(slot.priceOverrides.Breakfast) : '',
        Lunch:     slot.priceOverrides?.Lunch     != null ? String(slot.priceOverrides.Lunch)     : '',
        Dinner:    slot.priceOverrides?.Dinner    != null ? String(slot.priceOverrides.Dinner)    : '',
      });
      const removedMls: MealType[] = [];
      ALL_MEALS.forEach(m => {
        if (slot.mealStatus?.[m]?.removed) removedMls.push(m);
      });
      setRemoved(removedMls);
    } else {
      setDayLabel('');
      setEditMeals([...ALL_MEALS]);
      setStopped(false);
      setPrices({ Breakfast: '', Lunch: '', Dinner: '' });
      setRemoved([]);
    }
  };

  const toggleRemove = (m: MealType) => {
    setRemoved(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const saveDay = async () => {
    if (!selectedDate) return;
    setSaving(true);
    const priceOverrides: Partial<Record<MealType, number>> = {};
    ALL_MEALS.forEach(m => {
      if (prices[m] !== '') priceOverrides[m] = Number(prices[m]);
    });
    const mealStatus: Record<string, { stopped: boolean; removed: boolean }> = {};
    ALL_MEALS.forEach(m => {
      mealStatus[m] = { stopped: false, removed: removed.includes(m) };
    });
    await upsert({
      date: selectedDate,
      data: {
        meals: editMeals,
        stopped,
        isFestival: !!dayLabel,
        festivalName: dayLabel || undefined,
        priceOverrides,
        mealStatus: mealStatus as SlotDate['mealStatus'],
      },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearDay = async () => {
    if (!selectedDate || !slotMap[selectedDate]) return;
    if (confirm(`Remove all configuration for ${selectedDate}?`)) {
      await del(selectedDate);
      setSelectedDate(null);
    }
  };

  const specialDays = slots
    .filter(s => s.priceOverrides && Object.values(s.priceOverrides).some(v => v != null))
    .sort((a, b) => a.date.localeCompare(b.date));

  const monthLabel = `${MONTHS[calMonth]} ${calYear}`;

  // format date nicely for label pill
  const fmtDate = (ds: string) => {
    const d = new Date(ds + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <>
      <style>{`
        .sm-pricing-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
        @media(max-width:900px){ .sm-pricing-layout{ grid-template-columns:1fr; } .sm-price-panel{position:static!important;} }

        /* ── Calendar card ── */
        .sm-cal-card { background:#fff; border:1.5px solid #FEF0E6; border-radius:14px; overflow:hidden; box-shadow:0 2px 14px rgba(232,98,26,0.08); }
        .sm-cal-nav { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; background:linear-gradient(135deg,#C44D0D 0%,#E8621A 60%,#F4893A 100%); }
        .sm-cal-nav h3 { font-family:'Cormorant Garamond',serif; font-size:1.25rem; color:#fff; text-shadow:0 1px 4px rgba(0,0,0,0.15); margin:0; }
        .sm-cal-nav-btn { background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); color:#fff; width:32px; height:32px; border-radius:50px; font-size:1.05rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s; }
        .sm-cal-nav-btn:hover { background:rgba(255,255,255,0.35); transform:scale(1.05); }
        .sm-cal-grid { padding:16px 20px 20px; }
        .sm-cal-dow-row { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-bottom:8px; }
        .sm-cal-dow { text-align:center; font-size:0.62rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#9A7A5A; padding:4px 0; }
        .sm-cal-days-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }
        .sm-cal-day { aspect-ratio:1; border-radius:8px; border:1.5px solid transparent; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:all 0.15s; font-size:0.85rem; font-weight:500; color:#1E0F00; background:#FBF6EE; position:relative; gap:2px; font-family:'Inter',sans-serif; }
        .sm-cal-day:hover { border-color:#E8621A; background:#FEF0E6; }
        .sm-cal-day.empty { background:transparent; border-color:transparent; cursor:default; pointer-events:none; }
        .sm-cal-day.today { border-color:#C9920A; background:#FFF9E6; font-weight:700; }
        .sm-cal-day.selected { background:linear-gradient(135deg,#E8621A,#C9920A); color:#fff; border-color:transparent; }
        .sm-cal-day.selected:hover { background:linear-gradient(135deg,#C44D0D,#B07800); }
        .sm-cal-day.has-slot { border-color:#E8621A; }
        .sm-cal-day.has-slot::after { content:'●'; font-size:0.38rem; font-weight:700; color:#E8621A; position:absolute; bottom:4px; right:5px; }
        .sm-cal-day.has-slot.selected::after { color:rgba(255,255,255,0.8); }
        .sm-cal-day.has-price-override { border-color:#E8621A; border-width:2px; }
        .sm-cal-day.has-price-override::before { content:'₹'; font-size:0.45rem; font-weight:700; color:#E8621A; position:absolute; bottom:3px; left:4px; }
        .sm-cal-day.has-price-override.selected::before { color:rgba(255,255,255,0.8); }
        .sm-cal-day.sunday { color:#7B1D1D; }
        .sm-cal-day.sunday.selected { color:#fff; }
        .sm-cal-day.stopped-day { background:#FFF4F4; border-color:#C0392B; }
        .sm-cal-day.stopped-day .sm-cal-day-num { text-decoration:line-through; color:#C0392B; }
        .sm-cal-day-num { font-size:0.85rem; line-height:1; }
        .sm-cal-day-dot { width:4px; height:4px; border-radius:50%; background:#E8621A; flex-shrink:0; }
        .sm-cal-day.selected .sm-cal-day-dot { background:rgba(255,255,255,0.75); }

        .sm-cal-legend { display:flex; gap:16px; padding:12px 20px; border-top:1.5px solid rgba(232,98,26,0.1); flex-wrap:wrap; background:#FEF0E6; }
        .sm-cal-legend-item { display:flex; align-items:center; gap:6px; font-size:0.72rem; color:#5A3A1A; font-family:'Inter',sans-serif; }
        .sm-cal-legend-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }

        /* ── Price panel ── */
        .sm-price-panel { background:#fff; border:1.5px solid #FEF0E6; border-radius:14px; overflow:hidden; position:sticky; top:76px; box-shadow:0 2px 14px rgba(232,98,26,0.08); }
        .sm-price-panel-header { padding:18px 20px; background:linear-gradient(135deg,#C44D0D 0%,#E8621A 100%); }
        .sm-price-panel-header h4 { font-family:'Cormorant Garamond',serif; font-size:1.1rem; color:#fff; margin:0 0 2px; }
        .sm-price-panel-header p { font-size:0.75rem; color:rgba(255,255,255,0.72); margin:0; }
        .sm-price-panel-empty { padding:40px 24px; text-align:center; color:#9A7A5A; font-size:0.82rem; line-height:1.6; font-family:'Inter',sans-serif; }
        .sm-price-panel-empty .sm-empty-icon { font-size:2.4rem; margin-bottom:10px; }
        .sm-price-panel-body { padding:20px; }

        .sm-price-day-label { background:linear-gradient(135deg,#C44D0D,#E8621A); color:#fff; border-radius:50px; padding:10px 18px; font-family:'Cormorant Garamond',serif; font-size:1.05rem; font-weight:600; text-align:center; margin-bottom:16px; box-shadow:0 3px 12px rgba(232,98,26,0.28); }
        .sm-special-label-row { margin-bottom:16px; }
        .sm-special-label-row label { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#5A3A1A; display:block; margin-bottom:6px; font-family:'Inter',sans-serif; }
        .sm-special-label-row input { width:100%; padding:9px 12px; border:1.5px solid #E8D8C0; border-radius:8px; font-size:0.85rem; color:#1E0F00; outline:none; background:#FBF6EE; font-family:'Inter',sans-serif; transition:all 0.2s; }
        .sm-special-label-row input:focus { border-color:#E8621A; background:#fff; box-shadow:0 0 0 2px rgba(232,98,26,0.1); }

        .sm-meal-price-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #F2E8D8; transition:opacity 0.2s; }
        .sm-meal-price-row:last-child { border-bottom:none; }
        .sm-meal-price-row.removed { opacity:0.38; }
        .sm-meal-price-row.removed .sm-price-input { pointer-events:none; }
        .sm-meal-price-icon { font-size:1rem; width:22px; text-align:center; flex-shrink:0; }
        .sm-meal-price-name { font-size:0.82rem; font-weight:500; color:#5A3A1A; flex:1; font-family:'Inter',sans-serif; }
        .sm-meal-price-row.removed .sm-meal-price-name::after { content:' — not available'; font-size:0.68rem; color:#C0392B; font-weight:400; }
        .sm-price-input-wrap { position:relative; }
        .sm-price-input-wrap::before { content:'₹'; position:absolute; left:9px; top:50%; transform:translateY(-50%); font-size:0.8rem; color:#9A7A5A; pointer-events:none; }
        .sm-price-input { width:80px; padding:7px 8px 7px 20px; border:1.5px solid #E8D8C0; border-radius:7px; font-size:0.88rem; font-weight:600; color:#1E0F00; text-align:right; outline:none; background:#FBF6EE; font-family:'Inter',sans-serif; transition:all 0.2s; }
        .sm-price-input:focus { border-color:#E8621A; background:#fff; box-shadow:0 0 0 2px rgba(232,98,26,0.1); }
        .sm-price-input.changed { border-color:#E8621A; background:#FEF0E6; }

        .sm-meal-remove-btn { flex-shrink:0; width:24px; height:24px; border-radius:50%; border:1.5px solid #E8D8C0; background:#FBF6EE; color:#9A7A5A; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; line-height:1; font-family:'Inter',sans-serif; }
        .sm-meal-remove-btn:hover { border-color:#C0392B; color:#C0392B; background:#FDECEA; }
        .sm-meal-remove-btn.is-removed { border-color:#2D7A3A; color:#2D7A3A; background:#EBF7ED; }
        .sm-meal-remove-btn.is-removed:hover { background:#c8e6c9; }

        .sm-limit-section-head { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#5A3A1A; margin:16px 0 6px; display:flex; align-items:center; gap:6px; font-family:'Inter',sans-serif; }
        .sm-limit-section-head::after { content:''; flex:1; height:1px; background:#E8D8C0; }
        .sm-limit-loc-row { display:grid; grid-template-columns:90px 1fr 1fr; gap:8px; align-items:center; padding:7px 0; border-bottom:1px solid #F2E8D8; }
        .sm-limit-loc-row:last-child { border-bottom:none; }
        .sm-limit-loc-label { font-size:0.72rem; font-weight:600; color:#5A3A1A; font-family:'Inter',sans-serif; }
        .sm-limit-col-head { font-size:0.6rem; font-weight:700; color:#9A7A5A; text-align:center; letter-spacing:0.06em; text-transform:uppercase; font-family:'Inter',sans-serif; }
        .sm-limit-loc-input { width:100%; padding:6px 8px; border:1.5px solid #E8D8C0; border-radius:7px; font-size:0.85rem; font-weight:600; text-align:center; color:#1E0F00; outline:none; background:#FBF6EE; font-family:'Inter',sans-serif; }
        .sm-limit-loc-input:focus { border-color:#E8621A; background:#fff; }

        .sm-price-panel-footer { padding:16px 20px; border-top:1.5px solid #FEF0E6; display:flex; gap:8px; background:#FEF0E6; }
        .sm-btn-primary { background:#E8621A; color:#fff; border:none; padding:9px 18px; border-radius:8px; font-size:0.82rem; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:7px; font-family:'Inter',sans-serif; box-shadow:0 2px 10px rgba(232,98,26,0.3); transition:all 0.18s; flex:1; justify-content:center; }
        .sm-btn-primary:hover { background:#C44D0D; }
        .sm-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
        .sm-btn-danger { background:#fff; color:#C0392B; border:1.5px solid #f5c6c2; padding:9px 14px; border-radius:8px; font-size:0.82rem; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.18s; }
        .sm-btn-danger:hover { background:#FDECEA; }
        .sm-btn-ghost { background:#fff; color:#C44D0D; border:1.5px solid #E8D8C0; padding:9px 18px; border-radius:8px; font-size:0.82rem; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.18s; }
        .sm-btn-ghost:hover { background:#FEF0E6; }

        /* ── Special days list ── */
        .sm-special-section { background:#fff; border:1.5px solid #FEF0E6; border-radius:14px; margin-top:24px; overflow:hidden; box-shadow:0 2px 14px rgba(232,98,26,0.08); }
        .sm-special-header { padding:14px 20px; border-bottom:1.5px solid #FEF0E6; background:linear-gradient(to right,#FEF0E6,#FFF9E6); display:flex; align-items:center; justify-content:space-between; }
        .sm-special-header h3 { font-family:'Cormorant Garamond',serif; font-size:1rem; color:#C44D0D; margin:0; }
        .sm-special-day-row { display:flex; align-items:center; gap:14px; padding:12px 20px; border-bottom:1px solid rgba(232,98,26,0.08); transition:background 0.15s; cursor:pointer; }
        .sm-special-day-row:last-child { border-bottom:none; }
        .sm-special-day-row:hover { background:#FEF0E6; }
        .sm-special-day-date { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:700; color:#C44D0D; min-width:110px; }
        .sm-special-day-name { font-size:0.82rem; font-weight:600; color:#1E0F00; flex:1; font-family:'Inter',sans-serif; }
        .sm-special-day-prices { display:flex; gap:6px; flex-wrap:wrap; }
        .sm-price-chip { font-size:0.68rem; font-weight:600; padding:3px 8px; border-radius:50px; background:#FEF0E6; color:#C44D0D; font-family:'Inter',sans-serif; }
        .sm-status-badge { font-size:0.65rem; font-weight:700; padding:3px 8px; border-radius:50px; font-family:'Inter',sans-serif; }
        .sm-stopped-badge { background:#FDECEA; color:#C0392B; }
        .sm-active-badge { background:#EBF7ED; color:#2D7A3A; }

        /* ── Booking summary calendar ── */
        .sm-booking-section { background:#fff; border:1.5px solid #FEF0E6; border-radius:14px; overflow:hidden; margin-top:28px; box-shadow:0 2px 14px rgba(232,98,26,0.08); }
        .sm-booking-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:16px 22px; background:linear-gradient(135deg,#C44D0D,#E8621A); }
        .sm-booking-header h3 { font-family:'Cormorant Garamond',serif; font-size:1.1rem; color:#fff; margin:0; }
        .sm-booking-header p { font-size:0.72rem; color:rgba(255,255,255,0.72); margin:2px 0 0; }
        .sm-bk-dow-row { display:grid; grid-template-columns:repeat(7,1fr); background:#FBF6EE; border-bottom:1px solid #F2E8D8; }
        .sm-bk-cal-dow { text-align:center; font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#9A7A5A; padding:8px 4px; font-family:'Inter',sans-serif; }
        .sm-bk-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:1px; background:#F2E8D8; }
        .sm-bk-day { background:#fff; padding:8px 7px; min-height:76px; cursor:pointer; transition:background 0.15s; position:relative; }
        .sm-bk-day:hover { background:#FEF0E6; }
        .sm-bk-day.empty { background:#FBF6EE; cursor:default; }
        .sm-bk-day.bk-today { background:#FFF9E6; }
        .sm-bk-day.has-bookings { border-left:3px solid #E8621A; }
        .sm-bk-day.is-slot { border-top:3px solid #E8621A; }
        .sm-bk-day-num { font-size:0.78rem; font-weight:700; color:#1E0F00; margin-bottom:5px; font-family:'Inter',sans-serif; }
        .sm-bk-day.bk-today .sm-bk-day-num { color:#C44D0D; }
        .sm-bk-meal-row { display:flex; gap:3px; flex-wrap:wrap; }
        .sm-bk-chip { font-size:0.6rem; font-weight:700; padding:2px 5px; border-radius:4px; white-space:nowrap; display:inline-flex; align-items:center; gap:2px; font-family:'Inter',sans-serif; }
        .sm-bk-chip.bfast  { background:#FEF0E6; color:#C44D0D; }
        .sm-bk-chip.lunch  { background:#FFF8E1; color:#e65100; }
        .sm-bk-chip.dinner { background:#EDE7F6; color:#512da8; }
        .sm-bk-chip.slot-open   { background:#EBF7ED; color:#2D7A3A; }
        .sm-bk-chip.slot-closed { background:#FDECEA; color:#C0392B; }

        /* stopped toggle */
        .sm-toggle-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #F2E8D8; }
        .sm-toggle-sw { width:40px; height:22px; border-radius:50px; position:relative; cursor:pointer; transition:background 0.2s; border:none; flex-shrink:0; }
        .sm-toggle-sw.on { background:#E8621A; }
        .sm-toggle-sw.off { background:#E8D8C0; }
        .sm-toggle-sw::after { content:''; position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.2); transition:left 0.2s; }
        .sm-toggle-sw.on::after { left:21px; }
        .sm-toggle-label { font-size:0.82rem; font-weight:500; color:#5A3A1A; font-family:'Inter',sans-serif; flex:1; }

        /* meals checkboxes */
        .sm-meals-row { display:flex; gap:12px; padding:10px 0; border-bottom:1px solid #F2E8D8; flex-wrap:wrap; }
        .sm-meal-cb { display:flex; align-items:center; gap:5px; font-size:0.82rem; color:#5A3A1A; cursor:pointer; font-family:'Inter',sans-serif; }
      `}</style>

      <div className="sm-pricing-layout">

        {/* ── LEFT: Calendar + Special days ── */}
        <div>
          <div className="sm-cal-card">
            {/* Month nav */}
            <div className="sm-cal-nav">
              <button className="sm-cal-nav-btn" onClick={() => shiftMonth(-1)}>←</button>
              <h3>{monthLabel}</h3>
              <button className="sm-cal-nav-btn" onClick={() => shiftMonth(1)}>→</button>
            </div>

            {/* Days grid */}
            <div className="sm-cal-grid">
              <div className="sm-cal-dow-row">
                {DAYS.map(d => <div key={d} className="sm-cal-dow">{d}</div>)}
              </div>
              <div className="sm-cal-days-grid">
                {calDays.map((d, i) => {
                  if (d === null) return <div key={`e${i}`} className="sm-cal-day empty" />;
                  const ds = toStr(calYear, calMonth, d);
                  const slot = slotMap[ds];
                  const bk = bookingMap[ds];
                  const isSunday = new Date(ds + 'T00:00:00').getDay() === 0;
                  const hasPrice = slot && Object.values(slot.priceOverrides ?? {}).some(v => v != null);
                  const hasBk = bk && (bk.Breakfast + bk.Lunch + bk.Dinner) > 0;
                  let cls = 'sm-cal-day';
                  if (isSunday) cls += ' sunday';
                  if (ds === todayStr) cls += ' today';
                  if (ds === selectedDate) cls += ' selected';
                  if (slot && !hasPrice) cls += ' has-slot';
                  if (hasPrice) cls += ' has-price-override';
                  if (slot?.stopped) cls += ' stopped-day';
                  return (
                    <div key={ds} className={cls} onClick={() => selectDay(d)}>
                      <span className="sm-cal-day-num">{d}</span>
                      {(slot || hasBk) && <span className="sm-cal-day-dot" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="sm-cal-legend">
              {[
                { dot: { background: '#FFF9E6', border: '1.5px solid #C9920A' }, label: 'Today' },
                { dot: { background: 'linear-gradient(135deg,#E8621A,#C9920A)' }, label: 'Selected' },
                { dot: { background: '#FEF0E6', border: '1.5px solid #E8621A' }, label: 'Slot Configured' },
                { dot: { background: '#FEF0E6', border: '2px solid #E8621A' }, label: 'Custom Price' },
                { dot: { background: '#FFF4F4', border: '1.5px solid #C0392B' }, label: 'Stopped' },
              ].map(({ dot, label }) => (
                <div key={label} className="sm-cal-legend-item">
                  <div className="sm-cal-legend-dot" style={dot as React.CSSProperties} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Special days list */}
          <div className="sm-special-section">
            <div className="sm-special-header">
              <h3>📅 Configured Slots</h3>
              <span style={{ fontSize: '0.75rem', color: '#9A7A5A', fontFamily: 'Inter, sans-serif' }}>
                {slots.length} slot{slots.length !== 1 ? 's' : ''}
              </span>
            </div>
            {slots.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#9A7A5A', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif' }}>
                No slots configured yet. Click a date on the calendar above.
              </div>
            ) : (
              slots.sort((a, b) => a.date.localeCompare(b.date)).map(s => {
                const hasCustom = Object.values(s.priceOverrides ?? {}).some(v => v != null);
                return (
                  <div key={s.date} className="sm-special-day-row"
                    onClick={() => {
                      const d = new Date(s.date + 'T00:00:00');
                      setCalYear(d.getFullYear());
                      setCalMonth(d.getMonth());
                      selectDay(d.getDate());
                    }}>
                    <div className="sm-special-day-date">{s.date}</div>
                    <div className="sm-special-day-name">
                      {s.isFestival && s.festivalName ? `🎉 ${s.festivalName}` : s.meals.join(' · ')}
                    </div>
                    <div className="sm-special-day-prices">
                      {hasCustom && ALL_MEALS.map(m =>
                        s.priceOverrides?.[m] != null
                          ? <span key={m} className="sm-price-chip">{mealIcon(m)} ₹{s.priceOverrides[m]}</span>
                          : null
                      )}
                      <span className={`sm-status-badge ${s.stopped ? 'sm-stopped-badge' : 'sm-active-badge'}`}>
                        {s.stopped ? 'Stopped' : 'Active'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Price editor panel ── */}
        <div className="sm-price-panel">
          <div className="sm-price-panel-header">
            <h4>💰 Slot Rate Editor</h4>
            <p>{selectedDate ? fmtDate(selectedDate) : 'Select a date on the calendar to edit'}</p>
          </div>

          {!selectedDate ? (
            <div className="sm-price-panel-empty">
              <div className="sm-empty-icon">📅</div>
              <div>Click any date on the calendar<br />to configure a slot or set custom rates.</div>
            </div>
          ) : (
            <>
              <div className="sm-price-panel-body">
                {/* Date pill */}
                <div className="sm-price-day-label">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>

                {/* Occasion label */}
                <div className="sm-special-label-row">
                  <label>Day Label / Occasion</label>
                  <input
                    value={dayLabel}
                    onChange={e => setDayLabel(e.target.value)}
                    placeholder="e.g. Janmashtami, Ekadashi…"
                  />
                </div>

                {/* Meals active toggle */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5A3A1A', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
                    Active Meals
                  </div>
                  <div className="sm-meals-row">
                    {ALL_MEALS.map(m => (
                      <label key={m} className="sm-meal-cb">
                        <input type="checkbox"
                          checked={editMeals.includes(m)}
                          onChange={e => setEditMeals(p => e.target.checked ? [...p, m] : p.filter(x => x !== m))} />
                        {mealIcon(m)} {m}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stop slot toggle */}
                <div className="sm-toggle-row">
                  <button className={`sm-toggle-sw ${stopped ? 'on' : 'off'}`} onClick={() => setStopped(s => !s)} />
                  <span className="sm-toggle-label">Bookings stopped for this date</span>
                </div>

                {/* Meal rates */}
                <div style={{ marginTop: 16, marginBottom: 4 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5A3A1A', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
                    Custom Meal Rates for This Day
                  </div>
                  {ALL_MEALS.map(m => {
                    const isRemoved = removed.includes(m);
                    const isChanged = prices[m] !== '';
                    return (
                      <div key={m} className={`sm-meal-price-row${isRemoved ? ' removed' : ''}`}>
                        <span className="sm-meal-price-icon">{mealIcon(m)}</span>
                        <span className="sm-meal-price-name">{m}</span>
                        <div className="sm-price-input-wrap">
                          <input
                            className={`sm-price-input${isChanged ? ' changed' : ''}`}
                            type="number" min="0"
                            placeholder="0"
                            value={prices[m]}
                            onChange={e => setPrices(p => ({ ...p, [m]: e.target.value }))}
                            disabled={isRemoved}
                          />
                        </div>
                        <button
                          className={`sm-meal-remove-btn${isRemoved ? ' is-removed' : ''}`}
                          title={isRemoved ? 'Restore this meal' : 'Mark meal unavailable for this date'}
                          onClick={() => toggleRemove(m)}>
                          {isRemoved ? '+' : '✕'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <p style={{ fontSize: '0.72rem', color: '#9A7A5A', marginTop: 8, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                  Leave price blank to use global default rates.
                </p>
              </div>

              <div className="sm-price-panel-footer">
                <button className="sm-btn-primary" onClick={saveDay} disabled={saving}>
                  {saving ? 'Saving…' : saved ? '✓ Saved!' : '💾 Save Slot & Rates'}
                </button>
                {slotMap[selectedDate] && (
                  <button className="sm-btn-danger" onClick={clearDay} title="Delete this slot">🗑️</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Booking Summary Calendar ── */}
      <div className="sm-booking-section">
        <div className="sm-booking-header">
          <div>
            <h3>Monthly Booking Summary</h3>
            <p>Total coupons booked per meal for each date</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="sm-bk-chip bfast">🌅 Breakfast</span>
              <span className="sm-bk-chip lunch">☀️ Lunch</span>
              <span className="sm-bk-chip dinner">🌙 Dinner</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 10px' }}>
              <button className="sm-cal-nav-btn" onClick={() => shiftMonth(-1)}>←</button>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', minWidth: 110, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{monthLabel}</span>
              <button className="sm-cal-nav-btn" onClick={() => shiftMonth(1)}>→</button>
            </div>
          </div>
        </div>
        <div className="sm-bk-dow-row">
          {DAYS.map(d => <div key={d} className="sm-bk-cal-dow">{d}</div>)}
        </div>
        <div className="sm-bk-cal-grid">
          {calDays.map((d, i) => {
            if (d === null) return <div key={`be${i}`} className="sm-bk-day empty" />;
            const ds = toStr(calYear, calMonth, d);
            const bk = bookingMap[ds];
            const slot = slotMap[ds];
            const hasBk = bk && (bk.Breakfast + bk.Lunch + bk.Dinner) > 0;
            let cls = 'sm-bk-day';
            if (ds === todayStr) cls += ' bk-today';
            if (hasBk) cls += ' has-bookings';
            if (slot) cls += ' is-slot';
            return (
              <div key={ds} className={cls} onClick={() => selectDay(d)}>
                <div className="sm-bk-day-num">{d}</div>
                <div className="sm-bk-meal-row">
                  {bk?.Breakfast ? <span className="sm-bk-chip bfast">🌅{bk.Breakfast}</span> : null}
                  {bk?.Lunch    ? <span className="sm-bk-chip lunch">☀️{bk.Lunch}</span>    : null}
                  {bk?.Dinner   ? <span className="sm-bk-chip dinner">🌙{bk.Dinner}</span>  : null}
                  {slot && !hasBk && (
                    <span className={`sm-bk-chip ${slot.stopped ? 'slot-closed' : 'slot-open'}`}>
                      {slot.stopped ? '🔴 closed' : '🟢 open'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
