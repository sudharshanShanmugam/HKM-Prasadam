'use client';
import React, { useState } from 'react';
import { useGetMealMenuByDateQuery, useSaveMealMenuMutation } from '@/services/mealMenusApi';
import { ALL_MEALS, mealIcon, CLR, SectionCard, Btn, inputSt } from './shared';
import type { MealMenuMap } from '@/types';

function MenuEditor() {
  const [date, setDate] = useState('');
  const [fetchDate, setFetchDate] = useState('');
  const { data: existingMenu } = useGetMealMenuByDateQuery(fetchDate, { skip: !fetchDate });
  const [saveMenu, { isLoading: saving }] = useSaveMealMenuMutation();
  const [menuText, setMenuText] = useState<MealMenuMap>({ Breakfast: '', Lunch: '', Dinner: '' });
  const load = () => { if (!date) return; setFetchDate(date); if (existingMenu) setMenuText(existingMenu.meals); };
  const save = async () => { if (!date) return; await saveMenu({ date, meals: menuText }); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={{ ...inputSt, flex: 1 }} type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Btn variant="ghost" onClick={load}>Load</Btn>
      </div>
      {ALL_MEALS.map(m => (
        <div key={m}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: CLR.textMid, marginBottom: 6 }}>{mealIcon(m)} {m}</label>
          <textarea
            style={{ ...inputSt, minHeight: 60, resize: 'vertical' }}
            value={menuText[m]}
            onChange={e => setMenuText(p => ({ ...p, [m]: e.target.value }))}
            placeholder={`${m} menu description`}
          />
        </div>
      ))}
      <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : '💾 Save Menus'}</Btn>
    </div>
  );
}

export default function MenusPage() {
  return (
    <div style={{ maxWidth: 560 }}>
      <SectionCard title="Meal Menu Editor">
        <div style={{ padding: 22 }}>
          <MenuEditor />
        </div>
      </SectionCard>
    </div>
  );
}
