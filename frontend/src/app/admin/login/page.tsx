'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/services/authApi';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import IconButton from '@mui/material/IconButton';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const S  = '#E8621A';
const SD = '#C44D0D';
const SP = '#FEF0E6';

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', bgcolor: '#fff', fontSize: '0.9rem',
    '& fieldset': { borderColor: '#E8D8C0' },
    '&:hover fieldset': { borderColor: S },
    '&.Mui-focused fieldset': { borderColor: S, borderWidth: '2px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: SD },
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState('');

  useEffect(() => {
    if (localStorage.getItem('hkm_admin_token')) router.replace('/admin');
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await login({ email, password });
    if ('data' in res && res.data) {
      localStorage.setItem('hkm_admin_token', res.data.token);
      localStorage.setItem('hkm_admin_role',  res.data.role ?? 'admin');
      localStorage.setItem('hkm_admin_name',  res.data.name ?? '');
      router.replace('/admin');
    } else if ('error' in res) {
      const err = res.error as { status?: number };
      if (err.status === 'FETCH_ERROR' as unknown || err.status === undefined) {
        setError('Cannot reach server. Make sure the backend is running on port 5000.');
      } else {
        setError('Invalid email or password.');
      }
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FEF0E6 0%, #fff 50%, #FFF8F0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      px: 2,
    }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>

        {/* Logo card */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{
            bgcolor: '#fff', borderRadius: '16px',
            px: 3, py: 2,
            boxShadow: '0 4px 20px rgba(232,98,26,0.15)',
            border: '1.5px solid #FEE0CC',
          }}>
            <Box
              component="img"
              src="/iskcon-logo.png"
              alt="ISKCON Thiruvanmiyur Chennai"
              sx={{ height: 56, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </Box>
        </Box>

        {/* Login card */}
        <Card elevation={0} sx={{
          border: '1.5px solid #FEE0CC',
          borderRadius: '18px',
          boxShadow: '0 8px 40px rgba(232,98,26,0.12)',
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <Box sx={{
            background: `linear-gradient(135deg, ${S}, ${SD})`,
            px: 3.5, py: 3, textAlign: 'center',
          }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: '14px',
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 1.5,
            }}>
              <LockIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Typography sx={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.6rem', fontWeight: 700, color: '#fff', lineHeight: 1.2,
            }}>
              Admin Login
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', mt: 0.5 }}>
              HKM Prasadam Management System
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ px: 3.5, py: 3.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ fontSize: 18, color: '#C0A080' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={FIELD_SX}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ fontSize: 18, color: '#C0A080' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPass(v => !v)}
                        edge="end"
                        size="small"
                        sx={{ color: '#C0A080', '&:hover': { color: SD } }}
                      >
                        {showPass
                          ? <VisibilityOffIcon sx={{ fontSize: 18 }} />
                          : <VisibilityIcon   sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={FIELD_SX}
            />

            {error && (
              <Box sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1,
                bgcolor: '#FEF2F2', border: '1.5px solid #FCA5A5',
                borderRadius: '10px', px: 1.75, py: 1.25,
              }}>
                <WarningAmberIcon sx={{ fontSize: 17, color: '#B91C1C', mt: 0.15, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#B91C1C', lineHeight: 1.4 }}>
                  {error}
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading
                ? <CircularProgress size={16} color="inherit" />
                : <LoginIcon sx={{ fontSize: '18px !important' }} />
              }
              sx={{
                mt: 0.5,
                bgcolor: S, color: '#fff',
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 700, fontSize: '0.95rem',
                py: 1.35,
                boxShadow: '0 4px 18px rgba(232,98,26,0.4)',
                '&:hover': { bgcolor: SD, boxShadow: '0 6px 22px rgba(232,98,26,0.5)', transform: 'translateY(-1px)' },
                '&:disabled': { bgcolor: '#F4A06A', color: '#fff', boxShadow: 'none' },
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>
        </Card>

        <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: '#C0A080', mt: 2.5 }}>
          HKM Chennai · Thiruvanmiyur &amp; NLBR
        </Typography>
      </Box>
    </Box>
  );
}
