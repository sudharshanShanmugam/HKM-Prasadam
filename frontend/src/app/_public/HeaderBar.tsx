'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { HEADER_H, BROWN } from './constants';

interface HeaderBarProps {
  navItems: { label: string; action: () => void }[];
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export default function HeaderBar({ navItems, mobileOpen, setMobileOpen }: HeaderBarProps) {
  return (
    <>
      {/* Fixed top header */}
      <Box component="header" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: HEADER_H,
        background: 'linear-gradient(135deg, #E8621A 0%, #F07A20 40%, #C9920A 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 20px rgba(232,98,26,0.35)',
        display: 'flex', alignItems: 'center',
        px: { xs: 2.5, md: 5 }, gap: 3,
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navItems.find(n => n.label === 'Home')?.action()}>
          <Box sx={{ bgcolor: '#fff', borderRadius: '10px', px: 1.5, py: 0.75 }}>
            <Box
              component="img"
              src="/iskcon-logo.png"
              alt="ISKCON Thiruvanmiyur Chennai"
              sx={{ height: 36, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </Box>
        </Box>

        {/* Desktop nav */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, ml: 'auto' }}>
          {navItems.map(n => (
            <Button key={n.label} onClick={n.action} sx={{
              color: 'rgba(255,255,255,0.88)', fontSize: '0.82rem', fontWeight: 500,
              borderRadius: '8px', textTransform: 'none', px: 1.75, py: 0.875,
              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.18)' },
            }}>
              {n.label}
            </Button>
          ))}
          <Button onClick={() => window.location.href = '/admin'} sx={{
            ml: 1, bgcolor: BROWN, color: '#fff', fontSize: '0.82rem', fontWeight: 700,
            borderRadius: '8px', textTransform: 'none', px: 2.25, py: 1,
            boxShadow: '0 3px 12px rgba(30,10,0,0.35)',
            '&:hover': { bgcolor: '#7B1D1D', transform: 'translateY(-1px)', boxShadow: '0 5px 16px rgba(30,10,0,0.4)' },
            transition: 'all 0.18s',
          }}>
            🔐 Admin
          </Button>
        </Box>

        {/* Mobile hamburger */}
        <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' }, ml: 'auto', color: '#fff' }}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}
        slotProps={{ paper: { sx: { width: 280, bgcolor: BROWN, pt: 2 } } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, mb: 1 }}>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 2 }}>
          {navItems.map(n => (
            <Button key={n.label} onClick={n.action} sx={{
              color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', fontWeight: 500,
              justifyContent: 'flex-start', textTransform: 'none', borderRadius: '8px', py: 1.25,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' },
            }}>
              {n.label}
            </Button>
          ))}
          <Button onClick={() => window.location.href = '/admin'} sx={{
            mt: 1, bgcolor: 'rgba(255,255,255,0.1)', color: '#fff',
            justifyContent: 'flex-start', textTransform: 'none', borderRadius: '8px',
            fontSize: '0.88rem', fontWeight: 600, py: 1.25,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
          }}>
            🔐 Admin Panel
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
