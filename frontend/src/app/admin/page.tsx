'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetPrasadamBookingsQuery } from '@/services/prasadamBookingsApi';
import { useGetPartyEnquiriesQuery } from '@/services/partyEnquiriesApi';
import { useGetInternalOrdersQuery } from '@/services/internalOrdersApi';
import SlotManagementPage from './SlotManagementPage';
import { CLR, SIDEBAR_W, Btn } from './components/shared';
import DashboardPage from './components/DashboardPage';
import RegistrationsPage from './components/RegistrationsPage';
import MenusPage from './components/MenusPage';
import PartyEnquiriesPage from './components/PartyEnquiriesPage';
import InternalOrdersPage from './components/InternalOrdersPage';
import SettingsPage from './components/SettingsPage';

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = 'dashboard' | 'registrations' | 'slots' | 'menus' | 'birthday' | 'internal' | 'settings';

// ─── Admin Shell ──────────────────────────────────────────────────────────────
function AdminShell({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Minimal data just for sidebar badges
  const { data: bookings = [] }  = useGetPrasadamBookingsQuery({});
  const { data: enquiries = [] } = useGetPartyEnquiriesQuery({});
  const { data: orders = [] }    = useGetInternalOrdersQuery({});

  const pendingOrders    = orders.filter(o => !o.accepted).length;
  const pendingEnquiries = enquiries.filter(e => e.status === 'pending').length;

  const nav = (p: string) => { setPage(p as Page); setSidebarOpen(false); };

  const navItems: { page: Page; icon: string; label: string; badge?: number }[] = [
    { page: 'dashboard',     icon: '📊', label: 'Dashboard' },
    { page: 'registrations', icon: '📋', label: 'All Registrations', badge: bookings.length },
    { page: 'settings',      icon: '⚙️', label: 'Default Settings' },
    { page: 'slots',         icon: '📅', label: 'Slot Management' },
    { page: 'menus',         icon: '🍽',  label: 'Meal Menus' },
    { page: 'birthday',      icon: '🎉', label: 'Party Enquiries', badge: pendingEnquiries },
    { page: 'internal',      icon: '🏛',  label: 'Internal Orders',  badge: pendingOrders },
  ];

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F4F6F9' }}>

      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 299 }} />
      )}

      {/* ── SIDEBAR ── */}
      <nav style={{
        width: SIDEBAR_W, minHeight: '100vh', background: CLR.sidebar,
        position: 'fixed', left: 0, top: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', zIndex: 300,
        overflowY: 'auto',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      }}>
        {/* Brand */}
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, background: CLR.saffron, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              🪷
            </div>
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>HKM Prasadam</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: '12px 0', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '8px 18px 4px' }}>
            Menu
          </div>
          {navItems.map(({ page: p, icon, label, badge }) => {
            const active = page === p;
            return (
              <button key={p} onClick={() => nav(p)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 18px', border: 'none',
                background: active ? CLR.sidebarActive : 'transparent',
                color: active ? CLR.saffron : 'rgba(255,255,255,0.6)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: 'pointer', textAlign: 'left',
                borderLeft: `3px solid ${active ? CLR.saffron : 'transparent'}`,
                transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
              }}>
                <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge != null && badge > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: CLR.saffron, color: '#fff', padding: '2px 7px', borderRadius: 50 }}>{badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: 10, lineHeight: 1.5 }}>
            HKM Chennai<br />Thiruvanmiyur &amp; NLBR
          </div>
          <button onClick={() => window.location.href = '/'} style={{
            width: '100%', padding: '7px 0', marginBottom: 6,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: 12, borderRadius: 7,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}>
            ← Public Site
          </button>
          <button onClick={onLogout} style={{
            width: '100%', padding: '7px 0',
            background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.2)',
            color: '#e57373', fontSize: 12, borderRadius: 7,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}>
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={{ marginLeft: SIDEBAR_W, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* TOPBAR */}
        <div style={{
          height: 60, background: '#fff', borderBottom: `1px solid ${CLR.borderLight}`,
          display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14,
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 1px 8px rgba(60,20,0,0.06)',
        }}>
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(s => !s)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            ☰
          </button>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: CLR.saffronDark }}>
            {navItems.find(n => n.page === page)?.icon}{' '}
            {navItems.find(n => n.page === page)?.label ?? 'Admin'}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: CLR.saffronDark, background: CLR.saffronPale, border: `1px solid rgba(232,98,26,0.18)`, padding: '5px 12px', borderRadius: 50, fontWeight: 500 }}>
              📅 {today}
            </span>
            <Btn sm variant="primary" onClick={() => window.location.href = '/'}>🪷 Public Site</Btn>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {page === 'dashboard'     && <DashboardPage onNav={nav} />}
          {page === 'registrations' && <RegistrationsPage />}
          {page === 'slots'         && <SlotManagementPage />}
          {page === 'menus'         && <MenusPage />}
          {page === 'birthday'      && <PartyEnquiriesPage />}
          {page === 'internal'      && <InternalOrdersPage />}
          {page === 'settings'      && <SettingsPage />}
        </div>
      </div>
    </div>
  );
}

// ─── Page export (auth guard) ─────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('hkm_admin_token')) {
      router.replace('/admin/login');
    } else {
      setReady(true);
    }
  }, [router]);

  function logout() {
    localStorage.removeItem('hkm_admin_token');
    router.replace('/admin/login');
  }

  if (!ready) return null;
  return <AdminShell onLogout={logout} />;
}
