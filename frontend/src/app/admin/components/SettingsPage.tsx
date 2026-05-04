'use client';
import React, { useState, useEffect } from 'react';
import { CLR, Btn, inputSt, ALL_MEALS, mealIcon } from './shared';
import type { MealType } from '@/types';

const DEFAULT_RATES: Record<MealType, number> = { Breakfast: 20, Lunch: 40, Dinner: 35 };
const DEFAULT_LIMITS: Record<string, Record<MealType, number>> = {
  Thiruvanmiyur: { Breakfast: 100, Lunch: 100, Dinner: 100 },
  NLBR: { Breakfast: 80, Lunch: 80, Dinner: 80 },
};
const DEFAULT_WINDOW = { openDays: 7, openTime: '06:00', closeDays: 2, closeTime: '21:00', autoOpen: true, autoClose: true };

const LOCATIONS = ['Thiruvanmiyur', 'NLBR'] as const;
type Location = typeof LOCATIONS[number];

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  border: `1.5px solid ${CLR.saffronPale}`,
  borderRadius: 14,
  padding: 28,
  marginBottom: 24,
  boxShadow: '0 2px 12px rgba(232,98,26,0.07)',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 6,
  flexWrap: 'wrap' as const,
  gap: 12,
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: 18,
  fontWeight: 700,
  color: CLR.saffronDark,
  margin: 0,
};

const descStyle: React.CSSProperties = {
  fontSize: 13,
  color: CLR.textLight,
  marginBottom: 20,
};

export default function SettingsPage() {
  const [rates, setRates] = useState<Record<MealType, number>>(DEFAULT_RATES);
  const [limits, setLimits] = useState<Record<string, Record<MealType, number>>>(DEFAULT_LIMITS);
  const [window_, setWindow] = useState(DEFAULT_WINDOW);
  const [savedRates, setSavedRates] = useState(false);
  const [savedLimits, setSavedLimits] = useState(false);
  const [savedWindow, setSavedWindow] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const r = localStorage.getItem('hkm_default_rates');
    if (r) setRates(JSON.parse(r));
    const l = localStorage.getItem('hkm_slot_limits');
    if (l) setLimits(JSON.parse(l));
    const w = localStorage.getItem('hkm_booking_window');
    if (w) setWindow(JSON.parse(w));
  }, []);

  function saveRates() {
    localStorage.setItem('hkm_default_rates', JSON.stringify(rates));
    setSavedRates(true);
    setTimeout(() => setSavedRates(false), 2000);
  }

  function saveLimits() {
    localStorage.setItem('hkm_slot_limits', JSON.stringify(limits));
    setSavedLimits(true);
    setTimeout(() => setSavedLimits(false), 2000);
  }

  function saveWindow() {
    localStorage.setItem('hkm_booking_window', JSON.stringify(window_));
    setSavedWindow(true);
    setTimeout(() => setSavedWindow(false), 2000);
  }

  const mealCardColors: Record<MealType, { bg: string; border: string; icon: string }> = {
    Breakfast: { bg: '#FFF8F0', border: '#FFD9B3', icon: '🌅' },
    Lunch:     { bg: '#FFFBF0', border: '#FFE8A0', icon: '☀️' },
    Dinner:    { bg: '#F2F0FF', border: '#C9C0FF', icon: '🌙' },
  };

  const locColors: Record<Location, { bg: string; color: string }> = {
    Thiruvanmiyur: { bg: CLR.saffronPale, color: CLR.saffronDark },
    NLBR:          { bg: CLR.redPale,     color: CLR.red },
  };

  return (
    <div style={{ width: '100%' }}>

      {/* ── Section 1: Global Default Meal Rates ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>💰 Global Default Meal Rates</h2>
          <Btn onClick={saveRates} variant={savedRates ? 'success' : 'primary'}>
            {savedRates ? '✓ Saved!' : '💾 Save Rates'}
          </Btn>
        </div>
        <p style={descStyle}>Set the default price (₹) per plate for each meal type. These are used when creating new slot dates without a custom override.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {ALL_MEALS.map(meal => {
            const { bg, border, icon } = mealCardColors[meal];
            return (
              <div key={meal} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 10, padding: '18px 16px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: CLR.textMid, marginBottom: 10 }}>
                  {icon} {meal}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${border}`, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                  <span style={{ padding: '9px 10px', fontSize: 14, fontWeight: 700, color: CLR.saffronDark, background: CLR.saffronPale, borderRight: `1px solid ${border}`, flexShrink: 0 }}>₹</span>
                  <input
                    type="number"
                    min={0}
                    value={rates[meal]}
                    onChange={e => setRates(r => ({ ...r, [meal]: Number(e.target.value) }))}
                    style={{ ...inputSt, border: 'none', borderRadius: 0, background: 'transparent', flex: 1, width: 'auto' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Global Default Slot Limits ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>🎟️ Global Default Slot Limits</h2>
          <Btn onClick={saveLimits} variant={savedLimits ? 'success' : 'primary'}>
            {savedLimits ? '✓ Saved!' : '💾 Save Limits'}
          </Btn>
        </div>
        <p style={descStyle}>Set the maximum number of coupons available per meal per location. These defaults apply when a new slot date is created.</p>

        <div style={{ border: `1.5px solid ${CLR.borderLight}`, borderRadius: 10, overflow: 'hidden' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px repeat(3, 1fr)', background: CLR.saffronPale, padding: '10px 16px', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: CLR.textLight }}>Location</div>
            {ALL_MEALS.map(meal => (
              <div key={meal} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: CLR.saffronDark, textAlign: 'center' }}>
                {mealIcon(meal)} {meal}
              </div>
            ))}
          </div>

          {/* Rows */}
          {LOCATIONS.map((loc, idx) => {
            const { bg, color } = locColors[loc];
            return (
              <div key={loc} style={{ display: 'grid', gridTemplateColumns: '180px repeat(3, 1fr)', padding: '14px 16px', gap: 12, borderTop: idx > 0 ? `1px solid ${CLR.borderLight}` : undefined, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 50, background: bg, color }}>{loc}</span>
                </div>
                {ALL_MEALS.map(meal => (
                  <input
                    key={meal}
                    type="number"
                    min={0}
                    value={limits[loc]?.[meal] ?? 0}
                    onChange={e => setLimits(l => ({
                      ...l,
                      [loc]: { ...l[loc], [meal]: Number(e.target.value) },
                    }))}
                    style={{ ...inputSt, textAlign: 'center', width: '100%' }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Booking Window Automation ── */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>⏰ Booking Window Automation</h2>
          <Btn onClick={saveWindow} variant={savedWindow ? 'success' : 'primary'}>
            {savedWindow ? '✓ Saved!' : '💾 Save Window'}
          </Btn>
        </div>
        <p style={descStyle}>Configure when the booking window opens and closes automatically relative to the event date.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>

          {/* Auto-Open Rule */}
          <div style={{ border: `1.5px solid ${CLR.borderLight}`, borderRadius: 12, padding: 20, background: '#FAFFFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🟢</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: CLR.brown }}>Auto-Open Rule</span>
              </div>
              {/* Toggle */}
              <div
                onClick={() => setWindow(w => ({ ...w, autoOpen: !w.autoOpen }))}
                style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s', background: window_.autoOpen ? CLR.saffron : CLR.border, position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: window_.autoOpen ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: CLR.textLight, marginBottom: 14 }}>
              <span style={{ fontWeight: 600, color: window_.autoOpen ? CLR.green : CLR.textLight }}>
                {window_.autoOpen ? 'Active' : 'Inactive'}
              </span>
              {' — '}Opens {window_.openDays} day{window_.openDays !== 1 ? 's' : ''} prior at {window_.openTime}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: CLR.textMid, marginBottom: 5 }}>Days Before Event</label>
                <input
                  type="number"
                  min={1}
                  value={window_.openDays}
                  onChange={e => setWindow(w => ({ ...w, openDays: Number(e.target.value) }))}
                  style={inputSt}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: CLR.textMid, marginBottom: 5 }}>Open Time</label>
                <input
                  type="time"
                  value={window_.openTime}
                  onChange={e => setWindow(w => ({ ...w, openTime: e.target.value }))}
                  style={inputSt}
                />
              </div>
            </div>
          </div>

          {/* Auto-Close Rule */}
          <div style={{ border: `1.5px solid ${CLR.borderLight}`, borderRadius: 12, padding: 20, background: '#FFF8F8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🔴</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: CLR.brown }}>Auto-Close Rule</span>
              </div>
              {/* Toggle */}
              <div
                onClick={() => setWindow(w => ({ ...w, autoClose: !w.autoClose }))}
                style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s', background: window_.autoClose ? CLR.saffron : CLR.border, position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: window_.autoClose ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: CLR.textLight, marginBottom: 14 }}>
              <span style={{ fontWeight: 600, color: window_.autoClose ? CLR.red : CLR.textLight }}>
                {window_.autoClose ? 'Active' : 'Inactive'}
              </span>
              {' — '}Closes {window_.closeDays} day{window_.closeDays !== 1 ? 's' : ''} prior at {window_.closeTime}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: CLR.textMid, marginBottom: 5 }}>Days Before Event</label>
                <input
                  type="number"
                  min={0}
                  value={window_.closeDays}
                  onChange={e => setWindow(w => ({ ...w, closeDays: Number(e.target.value) }))}
                  style={inputSt}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: CLR.textMid, marginBottom: 5 }}>Close Time</label>
                <input
                  type="time"
                  value={window_.closeTime}
                  onChange={e => setWindow(w => ({ ...w, closeTime: e.target.value }))}
                  style={inputSt}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
