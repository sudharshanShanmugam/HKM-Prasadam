'use client';
import React from 'react';
import type { MealType } from '@/types';

// ─── Constants ─────────────────────────────────────────────────────────────────
export const ALL_MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
export const mealIcon = (m: MealType) => m === 'Breakfast' ? '🌅' : m === 'Lunch' ? '☀️' : '🌙';
export const SIDEBAR_W = 260;

// CLR kept as reference for dynamic/inline uses (e.g. StatusPill, StatCard color prop)
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
  sidebar: '#D86A32',
  sidebarHover: 'rgba(255,255,255,0.14)',
  sidebarActive: 'rgba(255,255,255,0.22)',
};

// ─── Shared style helpers (kept for backward compat, Tailwind preferred in components) ──
export const card: React.CSSProperties = {
  background: '#fff',
  border: '1.5px solid #F2E8D8',
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
  border: '1.5px solid #E8D8C0', borderRadius: 8,
  fontSize: 13, outline: 'none', background: '#FBF6EE',
  fontFamily: 'Inter, sans-serif', color: '#3B1F0A',
};

// ─── StatusPill ────────────────────────────────────────────────────────────────
export function StatusPill({ s }: { s: string }) {
  const map: Record<string, [string, string]> = {
    approved:     [CLR.green,    CLR.greenPale],
    accepted:     [CLR.green,    CLR.greenPale],
    delivered:    [CLR.green,    CLR.greenPale],
    paid:         [CLR.green,    CLR.greenPale],
    declined:     [CLR.red,      CLR.redPale],
    pending:      [CLR.gold,     CLR.goldPale],
    review:       [CLR.gold,     CLR.goldPale],
    active:       [CLR.green,    CLR.greenPale],
    stopped:      [CLR.red,      CLR.redPale],
    'in-transit': ['#6B3A1F',   '#FFF0E0'],
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
  const variantClasses: Record<string, string> = {
    primary: 'bg-saffron text-white border-none shadow-[0_3px_14px_rgba(232,98,26,0.35)] hover:bg-saffron-dark',
    ghost:   'bg-white text-saffron-dark border-[1.5px] border-[rgba(232,98,26,0.25)] hover:bg-saffron-pale hover:border-saffron',
    danger:  'bg-white text-hkm-red border-[1.5px] border-[#f5c6c2] hover:bg-red-pale',
    success: 'bg-white text-hkm-green border-[1.5px] border-[#b2dfbc] hover:bg-green-pale',
    outline: 'bg-transparent text-saffron border-[1.5px] border-saffron hover:bg-saffron-pale',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={[
        'inline-flex items-center gap-1.5 rounded-[50px] transition-all duration-[180ms]',
        'font-[family-name:var(--font-inter)] font-semibold',
        sm ? 'px-[14px] py-[5px] text-[0.75rem]' : 'px-[18px] py-[9px] text-[0.82rem]',
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        variantClasses[variant],
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
export function SectionCard({ title, action, children }: {
  title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border-[1.5px] border-saffron-pale rounded-[14px] overflow-hidden mb-6 shadow-[0_2px_12px_rgba(232,98,26,0.07)]">
      <div className="px-6 py-[18px] flex items-center gap-3 flex-wrap border-b-[1.5px] border-saffron-pale bg-gradient-to-r from-white to-[#FFF8F2]">
        <span className="font-[family-name:var(--font-cormorant)] text-[1.05rem] text-saffron-dark mr-auto">
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
    <div className="bg-white border-[1.5px] border-saffron-pale rounded-[16px] px-6 pt-[24px] pb-[20px] relative overflow-hidden shadow-[0_4px_18px_rgba(232,98,26,0.09)] transition-all duration-[180ms] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(232,98,26,0.14)]">
      {/* gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron to-gold" />
      <div className="absolute top-[18px] right-[18px] text-[1.7rem] w-[44px] h-[44px] bg-saffron-pale rounded-[12px] flex items-center justify-center opacity-85">
        {icon}
      </div>
      <div className="text-[0.71rem] font-semibold tracking-[0.1em] uppercase text-text-light mb-[10px]">
        {label}
      </div>
      <div
        className="font-[family-name:var(--font-cormorant)] text-[2.4rem] font-bold leading-none"
        style={{ color: color ?? CLR.saffronDark }}
      >
        {value}
      </div>
      <div className="text-[0.72rem] text-text-light mt-1.5">{sub}</div>
    </div>
  );
}

// ─── Table helpers ─────────────────────────────────────────────────────────────
export const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-saffron-dark px-4 py-3 text-left bg-saffron-pale whitespace-nowrap border-b-[1.5px] border-[rgba(232,98,26,0.15)]">
    {children}
  </th>
);

export const Td = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <td
    className="text-[0.83rem] px-4 py-3 text-brown border-b border-border-light align-middle"
    style={style}
  >
    {children}
  </td>
);

export function EmptyRow({ cols, msg = 'No data yet.' }: { cols: number; msg?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="text-center py-9 px-[14px] text-text-light text-[13px]">
        {msg}
      </td>
    </tr>
  );
}

export function LoadingRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="text-center py-9 px-[14px] text-text-light text-[13px]">
        Loading…
      </td>
    </tr>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 480 }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: number;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(30,15,0,0.5)] flex items-center justify-center z-[600] p-4 backdrop-blur-[3px]"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[14px] w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(30,15,0,0.22)]"
        style={{ maxWidth: width }}
      >
        <div className="flex justify-between items-center px-6 py-[18px] border-b border-border-light bg-gradient-to-br from-saffron-dark to-saffron">
          <span className="font-[family-name:var(--font-cormorant)] text-[18px] font-bold text-white">
            {title}
          </span>
          <button
            onClick={onClose}
            className="bg-[rgba(255,255,255,0.15)] border-none text-white w-7 h-7 rounded-full cursor-pointer flex items-center justify-center text-[14px]"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── DetailGrid ───────────────────────────────────────────────────────────────
export function DetailGrid({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="grid gap-x-5 gap-y-2.5 mb-5" style={{ gridTemplateColumns: 'auto 1fr' }}>
      {rows.map(([k, v], i) => (
        <React.Fragment key={i}>
          <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-light pt-0.5">
            {k}
          </span>
          <span className="text-[13px] text-brown">{v}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
