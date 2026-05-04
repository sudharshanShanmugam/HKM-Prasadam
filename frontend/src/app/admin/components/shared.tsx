'use client';
import React from 'react';
import type { MealType } from '@/types';

// ─── Constants ─────────────────────────────────────────────────────────────────
export const ALL_MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
export const mealIcon = (m: MealType) => m === 'Breakfast' ? '🌅' : m === 'Lunch' ? '☀️' : '🌙';
export const SIDEBAR_W = 240;

export const CLR = {
  saffron: '#E8621A',
  saffronDark: '#C44D0D',
  saffronPale: '#FEF0E6',
  gold: '#C9920A',
  goldPale: '#FFF9E6',
  cream: '#FBF6EE',
  brown: '#3B1F0A',
  brownMid: '#6B3A1F',
  textMid: '#5A3A1A',
  textLight: '#9A7A5A',
  border: '#E8D8C0',
  borderLight: '#F2E8D8',
  green: '#2D7A3A',
  greenPale: '#EBF7ED',
  redPale: '#FDECEA',
  red: '#C0392B',
  sidebar: '#1a1a2e',
  sidebarHover: 'rgba(255,255,255,0.07)',
  sidebarActive: 'rgba(232,98,26,0.18)',
};

// ─── Shared inline style helpers ───────────────────────────────────────────────
export const card: React.CSSProperties = {
  background: '#fff',
  border: `1.5px solid ${CLR.borderLight}`,
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(60,20,0,0.06)',
};

export const pill = (color: string, bg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center',
  padding: '3px 10px', borderRadius: 50,
  fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
  color, background: bg,
});

export const inputSt: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: `1.5px solid ${CLR.border}`, borderRadius: 8,
  fontSize: 13, outline: 'none', background: CLR.cream,
  fontFamily: 'Inter, sans-serif', color: CLR.brown,
};

// ─── StatusPill ────────────────────────────────────────────────────────────────
export function StatusPill({ s }: { s: string }) {
  const map: Record<string, [string, string]> = {
    approved:  [CLR.green,     CLR.greenPale],
    accepted:  [CLR.green,     CLR.greenPale],
    delivered: [CLR.green,     CLR.greenPale],
    paid:      [CLR.green,     CLR.greenPale],
    declined:  [CLR.red,       CLR.redPale],
    pending:   [CLR.gold,      CLR.goldPale],
    review:    [CLR.gold,      CLR.goldPale],
    active:    [CLR.green,     CLR.greenPale],
    stopped:   [CLR.red,       CLR.redPale],
    'in-transit': ['#6B3A1F', '#FFF0E0'],
  };
  const [color, bg] = map[s] ?? [CLR.textMid, CLR.cream];
  const labels: Record<string, string> = { 'in-transit': 'In Transit' };
  return <span style={pill(color, bg)}>{labels[s] ?? s}</span>;
}

// ─── Btn ───────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', sm, disabled, style }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'success' | 'outline';
  sm?: boolean; disabled?: boolean; style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'Inter, sans-serif', fontWeight: 600, transition: 'all 0.18s',
    padding: sm ? '6px 14px' : '9px 18px',
    fontSize: sm ? 12 : 13,
    opacity: disabled ? 0.6 : 1,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: CLR.saffron, color: '#fff', boxShadow: '0 2px 10px rgba(232,98,26,0.3)' },
    ghost:   { background: '#fff', color: CLR.saffronDark, border: `1.5px solid ${CLR.border}` },
    danger:  { background: '#fff', color: CLR.red, border: '1.5px solid #f5c6c2' },
    success: { background: '#fff', color: CLR.green, border: '1.5px solid #b2dfbc' },
    outline: { background: 'transparent', color: CLR.saffron, border: `1.5px solid ${CLR.saffron}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
export function SectionCard({ title, action, children }: {
  title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ ...card, marginBottom: 24 }}>
      <div style={{
        padding: '16px 22px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: `1px solid ${CLR.borderLight}`,
        background: `linear-gradient(to right, #fff, ${CLR.cream})`,
      }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 700, color: CLR.saffronDark }}>
          {title}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub: string; color?: string;
}) {
  return (
    <div style={{
      ...card, padding: '22px 24px', position: 'relative', overflow: 'hidden',
      borderTop: `4px solid ${CLR.saffron}`,
    }}>
      <div style={{ position: 'absolute', top: 18, right: 18, fontSize: 22, width: 42, height: 42, background: CLR.saffronPale, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}>
        {icon}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: CLR.textLight, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 700, lineHeight: 1, color: color ?? CLR.saffronDark, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: CLR.textLight }}>{sub}</div>
    </div>
  );
}

// ─── Table helpers ─────────────────────────────────────────────────────────────
export const Th = ({ children }: { children: React.ReactNode }) => (
  <th style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: CLR.saffronDark, padding: '11px 14px', textAlign: 'left', background: CLR.saffronPale, whiteSpace: 'nowrap' }}>
    {children}
  </th>
);

export const Td = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <td style={{ fontSize: 13, padding: '11px 14px', color: CLR.brown, borderBottom: `1px solid ${CLR.borderLight}`, verticalAlign: 'middle', ...style }}>
    {children}
  </td>
);

export function EmptyRow({ cols, msg = 'No data yet.' }: { cols: number; msg?: string }) {
  return (
    <tr><td colSpan={cols} style={{ textAlign: 'center', padding: 36, color: CLR.textLight, fontSize: 13 }}>{msg}</td></tr>
  );
}

export function LoadingRow({ cols }: { cols: number }) {
  return (
    <tr><td colSpan={cols} style={{ textAlign: 'center', padding: 36, color: CLR.textLight, fontSize: 13 }}>Loading…</td></tr>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 480 }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: number;
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(30,15,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, padding: 16, backdropFilter: 'blur(3px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(30,15,0,0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: `1px solid ${CLR.borderLight}`, background: `linear-gradient(135deg, ${CLR.saffronDark}, ${CLR.saffron})` }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: 50, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── DetailGrid ───────────────────────────────────────────────────────────────
export function DetailGrid({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', marginBottom: 20 }}>
      {rows.map(([k, v], i) => (
        <React.Fragment key={i}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: CLR.textLight, paddingTop: 2 }}>{k}</span>
          <span style={{ fontSize: 13, color: CLR.brown }}>{v}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
