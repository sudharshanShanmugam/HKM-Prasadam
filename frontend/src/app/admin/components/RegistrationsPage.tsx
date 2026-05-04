'use client';
import React, { useState, useMemo } from 'react';
import { useGetPrasadamBookingsQuery } from '@/services/prasadamBookingsApi';
import { ALL_MEALS, mealIcon, CLR, pill, SectionCard, StatusPill, Btn, Th, Td, EmptyRow, LoadingRow, inputSt } from './shared';
import type { MealType } from '@/types';

export default function RegistrationsPage() {
  const { data: bookings = [], isLoading: bLoad } = useGetPrasadamBookingsQuery({});
  const [search, setSearch] = useState('');
  const [filterLoc, setFilterLoc] = useState('');
  const [filterMeal, setFilterMeal] = useState('');

  const filteredBookings = useMemo(() =>
    bookings.filter(b => {
      if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.mobile.includes(search)) return false;
      if (filterLoc && b.location !== filterLoc) return false;
      if (filterMeal && !b.meals[filterMeal as MealType]) return false;
      return true;
    }), [bookings, search, filterLoc, filterMeal]);

  return (
    <SectionCard title="All Registrations"
      action={<span style={{ fontSize: 12, color: CLR.textLight }}>{filteredBookings.length} record{filteredBookings.length !== 1 ? 's' : ''}</span>}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 18px', background: CLR.cream, borderBottom: `1px solid ${CLR.borderLight}`, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...inputSt, width: 220 }}
          placeholder="🔍  Search name or mobile…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...inputSt, width: 'auto' }} value={filterLoc} onChange={e => setFilterLoc(e.target.value)}>
          <option value="">All Locations</option>
          <option>Thiruvanmiyur</option>
          <option>NLBR</option>
        </select>
        <select style={{ ...inputSt, width: 'auto' }} value={filterMeal} onChange={e => setFilterMeal(e.target.value)}>
          <option value="">All Meals</option>
          {ALL_MEALS.map(m => <option key={m}>{m}</option>)}
        </select>
        {(search || filterLoc || filterMeal) && (
          <Btn sm variant="ghost" onClick={() => { setSearch(''); setFilterLoc(''); setFilterMeal(''); }}>✕ Clear</Btn>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <Th>Coupon ID</Th><Th>Name</Th><Th>Mobile</Th>
            <Th>Location</Th><Th>Date</Th>
            <Th>🌅</Th><Th>☀️</Th><Th>🌙</Th><Th>Total</Th><Th>Status</Th>
          </tr></thead>
          <tbody>
            {bLoad ? <LoadingRow cols={10} /> :
              filteredBookings.length === 0 ? <EmptyRow cols={10} msg="No registrations found." /> :
                filteredBookings.map(b => {
                  const tot = b.meals.Breakfast + b.meals.Lunch + b.meals.Dinner;
                  return (
                    <tr key={b.id}>
                      <Td><span style={pill(CLR.gold, CLR.goldPale)}>{b.id}</span></Td>
                      <Td style={{ fontWeight: 500 }}>{b.name}</Td>
                      <Td style={{ color: CLR.textMid }}>{b.mobile}</Td>
                      <Td><span style={pill(b.location === 'Thiruvanmiyur' ? CLR.saffronDark : CLR.brownMid, b.location === 'Thiruvanmiyur' ? CLR.saffronPale : '#FDE8D8')}>{b.location}</span></Td>
                      <Td style={{ color: CLR.textLight }}>{b.date}</Td>
                      <Td style={{ textAlign: 'center' }}>{b.meals.Breakfast || '—'}</Td>
                      <Td style={{ textAlign: 'center' }}>{b.meals.Lunch || '—'}</Td>
                      <Td style={{ textAlign: 'center' }}>{b.meals.Dinner || '—'}</Td>
                      <Td>
                        <span style={{ fontWeight: 700 }}>{tot}</span>
                        {tot >= 10 && <span style={{ ...pill(CLR.saffronDark, CLR.saffronPale), marginLeft: 6, fontSize: 9 }}>BULK</span>}
                      </Td>
                      <Td><StatusPill s={b.status} /></Td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
