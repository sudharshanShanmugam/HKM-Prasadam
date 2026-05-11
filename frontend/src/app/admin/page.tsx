'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SlotManagementPage from './SlotManagementPage';

import DashboardPage from './components/DashboardPage';
import RegistrationsPage from './components/RegistrationsPage';
import PartyEnquiriesPage from './components/PartyEnquiriesPage';
import InternalOrdersPage from './components/InternalOrdersPage';
import SettingsPage from './components/SettingsPage';
import PaymentsPage from './components/PaymentsPage';
import AdminUsersPage from './components/AdminUsersPage';

// MUI
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CelebrationIcon from '@mui/icons-material/Celebration';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LogoutIcon from '@mui/icons-material/Logout';
import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = 'dashboard' | 'registrations' | 'slots' | 'party' | 'internal' | 'settings' | 'payments' | 'users';

const SIDEBAR_W = 260;
const SIDEBAR_BG = '#D86A32';

type Role = 'superadmin' | 'admin' | 'kitchen_manager' | 'accounts_manager' | 'gita_counter' | 'prasadam_hall';

const ALL_ROLES: Role[] = ['superadmin', 'admin', 'kitchen_manager', 'accounts_manager', 'gita_counter', 'prasadam_hall'];

// Pages each role is allowed to see
const ROLE_PAGES: Record<Role, Page[]> = {
  superadmin:       ['dashboard', 'registrations', 'payments', 'settings', 'slots', 'party', 'internal', 'users'],
  admin:            ['dashboard', 'registrations', 'payments', 'settings', 'slots', 'party', 'internal'],
  accounts_manager: ['payments'],
  kitchen_manager:  ['internal'],
  gita_counter:     ['registrations'],
  prasadam_hall:    ['registrations', 'internal'],
};

function getRole(): Role {
  if (typeof window === 'undefined') return 'superadmin';
  // Prefer stored role (set on login)
  const stored = localStorage.getItem('hkm_admin_role');
  if (stored && ['superadmin', 'admin', 'accounts'].includes(stored)) return stored as Role;
  // Fall back to decoding the JWT payload
  try {
    const token = localStorage.getItem('hkm_admin_token') ?? '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    const r = payload?.role;
    if (r && ALL_ROLES.includes(r as Role)) return r as Role;
  } catch { /* ignore */ }
  // Legacy sessions pre-date roles — treat as superadmin
  return 'superadmin';
}

// ─── Admin Shell ──────────────────────────────────────────────────────────────
function AdminShell({ onLogout }: { onLogout: () => void }) {
  const role = getRole();
  const allowed = ROLE_PAGES[role];

  const [page, setPage] = useState<Page>(allowed[0]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (p: Page) => { setPage(p); setMobileOpen(false); };

  const ALL_NAV: { page: Page; icon: React.ReactNode; label: string; badge?: number }[] = [
    { page: 'dashboard',     icon: <DashboardIcon fontSize="small" />,      label: 'Dashboard' },
    { page: 'registrations', icon: <ListAltIcon fontSize="small" />,        label: 'All Registrations' },
    { page: 'payments',      icon: <PaymentIcon fontSize="small" />,        label: 'Payments' },
    { page: 'settings',      icon: <SettingsIcon fontSize="small" />,       label: 'Default Settings' },
    { page: 'slots',         icon: <CalendarMonthIcon fontSize="small" />,  label: 'Slot Management' },
    { page: 'party',         icon: <CelebrationIcon fontSize="small" />,    label: 'Party Enquiries' },
    { page: 'internal',      icon: <AccountBalanceIcon fontSize="small" />, label: 'Internal Orders' },
    { page: 'users',         icon: <PeopleIcon fontSize="small" />,         label: 'Admin Users' },
  ];

  const navItems = ALL_NAV.filter(n => allowed.includes(n.page));

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const activeItem = navItems.find(n => n.page === page);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: SIDEBAR_BG }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ bgcolor: '#fff', borderRadius: '12px', px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            component="img"
            src="/iskcon-logo.png"
            alt="ISKCON Thiruvanmiyur Chennai"
            sx={{ width: '100%', maxWidth: 160, height: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </Box>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', px: 2.5, pt: 2.5, pb: 0.5 }}>
          Menu
        </Typography>
        <List dense disablePadding>
          {navItems.map(({ page: p, icon, label, badge }) => {
            const active = page === p;
            return (
              <ListItemButton
                key={p}
                onClick={() => nav(p)}
                sx={{
                  px: 2.5,
                  py: 1.25,
                  borderLeft: '3px solid',
                  borderLeftColor: active ? '#fff' : 'transparent',
                  bgcolor: active ? 'rgba(255,255,255,0.22)' : 'transparent',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.14)',
                    borderLeftColor: 'rgba(255,255,255,0.4)',
                  },
                  transition: 'all 0.15s',
                }}
              >
                <ListItemIcon sx={{ color: '#fff', minWidth: 34, opacity: active ? 1 : 0.75 }}>
                  {badge != null && badge > 0 ? (
                    <Badge
                      badgeContent={badge}
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: 'rgba(255,255,255,0.95)',
                          color: '#C44D0D',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          minWidth: 18,
                          height: 18,
                        },
                      }}
                    >
                      {icon}
                    </Badge>
                  ) : icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{
                    primary: {
                      style: {
                        fontSize: '0.85rem',
                        fontWeight: active ? 600 : 500,
                        color: '#fff',
                        opacity: active ? 1 : 0.78,
                        fontFamily: 'Inter, sans-serif',
                      },
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', mb: 2, lineHeight: 1.6 }}>
          HKM Chennai<br />Thiruvanmiyur &amp; NLBR
        </Typography>
        <Button
          fullWidth
          onClick={() => window.location.href = '/'}
          startIcon={<PublicIcon sx={{ fontSize: 14 }} />}
          sx={{
            mb: 1, py: 0.75, borderRadius: '50px', fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.35)' },
            textTransform: 'none', fontFamily: 'Inter, sans-serif',
          }}
        >
          Public Site
        </Button>
        <Button
          fullWidth
          onClick={() => window.open('/internal', '_blank')}
          startIcon={<AccountBalanceIcon sx={{ fontSize: 14 }} />}
          sx={{
            mb: 1, py: 0.75, borderRadius: '50px', fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.35)' },
            textTransform: 'none', fontFamily: 'Inter, sans-serif',
          }}
        >
          Internal Booking
        </Button>
        <Button
          fullWidth
          onClick={onLogout}
          startIcon={<LogoutIcon sx={{ fontSize: 14 }} />}
          sx={{
            py: 0.75, borderRadius: '50px', fontSize: '0.78rem',
            color: '#ffb3b3',
            border: '1px solid rgba(192,57,43,0.3)',
            bgcolor: 'rgba(192,57,43,0.2)',
            '&:hover': { bgcolor: 'rgba(192,57,43,0.35)' },
            textTransform: 'none', fontFamily: 'Inter, sans-serif',
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6F9' }}>

      {/* ── MUI DRAWER (desktop permanent) ── */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_W,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_W,
            boxSizing: 'border-box',
            bgcolor: SIDEBAR_BG,
            border: 'none',
            boxShadow: '4px 0 24px rgba(232,98,26,0.22)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ── MUI DRAWER (mobile temporary) ── */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_W,
            boxSizing: 'border-box',
            bgcolor: SIDEBAR_BG,
            border: 'none',
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>

      {/* ── MAIN ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>

        {/* MUI APPBAR TOPBAR */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#fff',
            borderBottom: '2px solid #FEF0E6',
            boxShadow: '0 2px 12px rgba(232,98,26,0.08)',
            zIndex: 100,
          }}
        >
          <Toolbar sx={{ gap: 2, minHeight: '64px !important', px: { xs: 2, md: 4 } }}>
            {/* Mobile hamburger */}
            <Button
              onClick={() => setMobileOpen(s => !s)}
              sx={{ display: { md: 'none' }, minWidth: 0, p: 1, color: '#C44D0D' }}
            >
              ☰
            </Button>

            <Typography sx={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.35rem', fontWeight: 700, color: '#C44D0D',
            }}>
              {activeItem?.label ?? 'Admin'}
            </Typography>

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                label={today}
                size="small"
                sx={{
                  bgcolor: '#FEF0E6',
                  color: '#C44D0D',
                  border: '1px solid rgba(232,98,26,0.2)',
                  fontWeight: 500,
                  fontSize: '0.78rem',
                  fontFamily: 'Inter, sans-serif',
                  borderRadius: '50px',
                  height: 32,
                }}
              />
            </Box>
          </Toolbar>
        </AppBar>

        {/* PAGE CONTENT */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3.5 }, overflow: 'auto' }}>
          {page === 'dashboard'     && <DashboardPage onNav={p => nav(p as Page)} />}
          {page === 'registrations' && <RegistrationsPage />}
          {page === 'slots'         && <SlotManagementPage onNav={p => nav(p as Page)} />}
          {page === 'party'      && <PartyEnquiriesPage />}
          {page === 'internal'      && <InternalOrdersPage />}
          {page === 'settings'      && <SettingsPage />}
          {page === 'payments'      && <PaymentsPage />}
          {page === 'users'         && <AdminUsersPage />}
        </Box>
      </Box>
    </Box>
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
    localStorage.removeItem('hkm_admin_role');
    localStorage.removeItem('hkm_admin_name');
    router.replace('/admin/login');
  }

  if (!ready) return null;
  return <AdminShell onLogout={logout} />;
}
