'use client';
import React, { useState, useMemo } from 'react';
import { useGetPrasadamBookingsQuery } from '@/services/prasadamBookingsApi';
import { ALL_MEALS, mealIcon, CLR, pill, StatCard, StatusPill, Btn, Th, Td, EmptyRow, LoadingRow } from './shared';
import type { MealType } from '@/types';

export default function DashboardPage({ onNav }: { onNav: (page: string) => void }) {
  const { data: bookings = [], isLoading: bLoad } = useGetPrasadamBookingsQuery({});

  const [fillLoc, setFillLoc] = useState<'Thiruvanmiyur' | 'NLBR'>('Thiruvanmiyur');
  const [fillDate, setFillDate] = useState(() => new Date().toISOString().slice(0, 10));

  const todayKey    = new Date().toISOString().slice(0, 10);
  const tomorrowKey = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();
  const SLOT_LIMITS: Record<string, number> = { Thiruvanmiyur: 100, NLBR: 80 };

  const totalCoupons = useMemo(() =>
    bookings.reduce((s, b) => s + b.meals.Breakfast + b.meals.Lunch + b.meals.Dinner, 0), [bookings]);
  const bulkCount = useMemo(() =>
    bookings.filter(b => (b.meals.Breakfast + b.meals.Lunch + b.meals.Dinner) >= 10).length, [bookings]);
  const todayCount = useMemo(() =>
    bookings.filter(b => b.date === todayKey).length, [bookings, todayKey]);

  const fillStats = useMemo(() => {
    const limit = SLOT_LIMITS[fillLoc] ?? 100;
    return ALL_MEALS.map(meal => {
      const used = bookings
        .filter(b => b.date === fillDate && b.location === fillLoc)
        .reduce((s, b) => s + (b.meals[meal] ?? 0), 0);
      return { meal, used, limit };
    });
  }, [bookings, fillDate, fillLoc]);

  return (
    <>
      {/* ── 3 Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}>
        <StatCard icon="📋" label="Total Registrations" value={bookings.length} sub={`↑ ${todayCount} today`} />
        <StatCard icon="🎟️" label="Coupons Issued"      value={totalCoupons}   sub="across all meals"         color={CLR.gold} />
        <StatCard icon="⚠️" label="Bulk Requests"       value={bulkCount}      sub="≥ 10 coupons pending review" color={bulkCount > 0 ? CLR.red : CLR.green} />
      </div>

      {/* ── Alert Banner ── */}
      {bulkCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg,#fff9ed,#fff3e0)', border: `1.5px solid ${CLR.gold}`, borderRadius: 12, padding: '14px 20px', marginBottom: 20 }}>
          <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🔔</span>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: CLR.brown }}>Bulk Order Alert</div>
            <div style={{ fontSize: '0.78rem', color: CLR.textMid, marginTop: 2 }}>
              {bulkCount} registration{bulkCount > 1 ? 's' : ''} with ≥ 10 coupons are awaiting admin approval.{' '}
              <button onClick={() => onNav('registrations')} style={{ background: 'none', border: 'none', color: CLR.saffron, fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.78rem' }}>View →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fill Rate ── */}
      <div style={{ background: '#fff', border: `1.5px solid ${CLR.saffronPale}`, borderRadius: 14, padding: '22px 24px', marginBottom: 28, boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: CLR.saffronDark, margin: 0 }}>📊 Live Fill Rate — Today&apos;s Slots</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={{ padding: '8px 12px', border: `1.5px solid ${CLR.border}`, borderRadius: 8, fontSize: '0.82rem', color: CLR.textMid, background: CLR.cream, outline: 'none', cursor: 'pointer' }}
              value={fillDate} onChange={e => setFillDate(e.target.value)}>
              <option value={todayKey}>Today ({new Date(todayKey + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})</option>
              <option value={tomorrowKey}>Tomorrow ({new Date(tomorrowKey + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})</option>
            </select>
            <select style={{ padding: '8px 12px', border: `1.5px solid ${CLR.border}`, borderRadius: 8, fontSize: '0.82rem', color: CLR.textMid, background: CLR.cream, outline: 'none', cursor: 'pointer' }}
              value={fillLoc} onChange={e => setFillLoc(e.target.value as 'Thiruvanmiyur' | 'NLBR')}>
              <option value="Thiruvanmiyur">📍 Thiruvanmiyur</option>
              <option value="NLBR">📍 NLBR</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {fillStats.map(({ meal, used, limit }) => {
            const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
            const rem = limit - used;
            const barColor = pct >= 90
              ? 'linear-gradient(to right,#e67e22,#c0392b)'
              : pct >= 75
              ? `linear-gradient(to right,${CLR.gold},#e67e22)`
              : `linear-gradient(to right,${CLR.saffron},${CLR.gold})`;
            return (
              <div key={meal} style={{ background: `linear-gradient(135deg,${CLR.saffronPale},${CLR.goldPale})`, borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(232,98,26,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: CLR.textMid }}>{mealIcon(meal as MealType)} {meal}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: CLR.brown }}>{used} / {limit}</span>
                </div>
                <div style={{ background: CLR.border, borderRadius: 50, height: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 50, background: barColor, width: `${Math.min(pct, 100)}%`, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: '0.68rem', color: CLR.textLight, marginTop: 5, textAlign: 'right' }}>
                  {pct >= 90
                    ? <span style={{ color: CLR.red, fontWeight: 600 }}>{pct}% — {rem <= 0 ? 'Full!' : `${rem} remaining`}</span>
                    : `${pct}% — ${rem} remaining`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent Registrations ── */}
      <div style={{ background: '#fff', border: `1.5px solid ${CLR.saffronPale}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1.5px solid ${CLR.saffronPale}`, display: 'flex', alignItems: 'center', background: 'linear-gradient(to right,#fff,#FFF8F2)' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: CLR.saffronDark, margin: 0, marginRight: 'auto' }}>Recent Registrations</h3>
          <Btn sm variant="ghost" onClick={() => onNav('registrations')}>View All →</Btn>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><Th>ID</Th><Th>Name</Th><Th>Mobile</Th><Th>Location</Th><Th>Meal</Th><Th>Date</Th><Th>Qty</Th><Th>Status</Th></tr></thead>
            <tbody>
              {bLoad ? <LoadingRow cols={8} /> : bookings.length === 0 ? <EmptyRow cols={8} msg="No bookings yet." /> :
                bookings.slice(0, 5).map(b => {
                  const tot = b.meals.Breakfast + b.meals.Lunch + b.meals.Dinner;
                  const mealParts = ALL_MEALS.filter(m => b.meals[m] > 0).map(m => `${mealIcon(m)}${b.meals[m]}`).join(' ');
                  return (
                    <tr key={b.id}>
                      <Td><span style={pill(CLR.gold, CLR.goldPale)}>{b.id}</span></Td>
                      <Td>{b.name}</Td>
                      <Td style={{ color: CLR.textLight }}>{b.mobile.replace(/(\d{2})(\d{4})(\d{4})/, '$1XXXX$3')}</Td>
                      <Td>
                        <span style={pill(b.location === 'Thiruvanmiyur' ? CLR.saffronDark : '#7B1D1D', b.location === 'Thiruvanmiyur' ? CLR.saffronPale : CLR.redPale)}>
                          {b.location}
                        </span>
                      </Td>
                      <Td>{mealParts || '—'}</Td>
                      <Td style={{ color: CLR.textLight, whiteSpace: 'nowrap' }}>
                        {new Date(b.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Td>
                      <Td>
                        {tot}
                        {tot >= 10 && <span style={{ marginLeft: 5, fontSize: 10, fontWeight: 700, color: CLR.saffron, background: CLR.saffronPale, padding: '2px 6px', borderRadius: 4 }}>BULK</span>}
                      </Td>
                      <Td><StatusPill s={tot >= 10 ? 'review' : b.status} /></Td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
