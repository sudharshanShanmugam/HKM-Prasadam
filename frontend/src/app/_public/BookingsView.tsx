'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import type { PrasadamBooking, PartyEnquiry } from '@/types';
import {
  S, SD, SP, GOLD, GOLD_PALE, CREAM, BROWN, TXT_MID, TXT_LIGHT, BORDER,
  GREEN, GREEN_PALE, RED, RED_PALE, HEADER_H, FIELD_SX, fmtDate,
} from './constants';
import type { View, BkTab } from './constants';

interface BookingsViewProps {
  bkInput: string; setBkInput: (v: string) => void;
  bkMobile: string | null; setBkMobile: (v: string | null) => void;
  bkTab: BkTab; setBkTab: (v: BkTab) => void;
  myBookings: PrasadamBooking[];
  myEnquiries: PartyEnquiry[];
  setCouponBooking: (b: PrasadamBooking | null) => void;
  onGoTo: (v: View) => void;
}

function statusColor(s: string) {
  if (s === 'approved' || s === 'accepted') return { dot: GREEN, bg: GREEN_PALE, text: GREEN };
  if (s === 'declined') return { dot: RED, bg: RED_PALE, text: RED };
  return { dot: GOLD, bg: GOLD_PALE, text: GOLD };
}

export default function BookingsView({
  bkInput, setBkInput,
  bkMobile, setBkMobile,
  bkTab, setBkTab,
  myBookings, myEnquiries,
  setCouponBooking,
  onGoTo,
}: BookingsViewProps) {
  return (
    <Box sx={{ minHeight: '100vh', pt: `${HEADER_H}px`, background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)' }}>
      <Box sx={{ maxWidth: 720, mx: 'auto', px: 2.5, py: 4 }}>
        {/* Header */}
        <Box sx={{ position: 'relative', textAlign: 'center', mb: 3.5 }}>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, color: BROWN, mb: 0.5 }}>
            📋 My Bookings
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: TXT_LIGHT }}>
            Enter your mobile number to view your booking history
          </Typography>
        </Box>

        {!bkMobile ? (
          <Box sx={{ bgcolor: '#fff', borderRadius: '20px', p: { xs: 3, md: 5 }, boxShadow: '0 4px 24px rgba(60,20,0,0.08)', border: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.5rem', lineHeight: 1 }}>📱</Typography>
            <Box>
              <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: BROWN }}>Find Your Bookings</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#888', mt: 0.5 }}>We&apos;ll look up all bookings linked to your mobile number</Typography>
            </Box>
            <Box sx={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <TextField
                fullWidth size="small" type="tel" slotProps={{ htmlInput: { maxLength: 10 } }}
                placeholder="Enter 10-digit mobile number"
                value={bkInput} onChange={e => setBkInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') { if (/^\d{10}$/.test(bkInput)) setBkMobile(bkInput); else alert('Enter a valid 10-digit mobile'); } }}
                sx={{ ...FIELD_SX, '& input': { textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.08em' } }}
              />
              <Button
                startIcon={<SearchIcon sx={{ fontSize: '18px !important' }} />}
                onClick={() => { if (/^\d{10}$/.test(bkInput)) setBkMobile(bkInput); else alert('Enter a valid 10-digit mobile'); }}
                sx={{
                  py: 1.75, borderRadius: '10px',
                  background: `linear-gradient(135deg, ${S}, ${GOLD})`,
                  color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(232,98,26,0.3)', textTransform: 'none',
                  '&:hover': { opacity: 0.92, transform: 'translateY(-1px)' },
                }}
              >
                Find My Bookings
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75, flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontSize: '0.82rem', color: TXT_MID }}>
                Showing bookings for <strong>{bkMobile}</strong>
              </Typography>
              <Button size="small" onClick={() => { setBkMobile(null); setBkInput(''); }} sx={{
                borderRadius: '8px', border: `1.5px solid ${BORDER}`, color: TXT_MID,
                fontSize: '0.75rem', textTransform: 'none', px: 1.75, py: 0.75,
                '&:hover': { bgcolor: CREAM },
              }}>
                ← Search Again
              </Button>
            </Box>

            <Box sx={{ bgcolor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(60,20,0,0.08)', border: `1px solid ${BORDER}` }}>
              {/* Card header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: { xs: '16px 16px', sm: '20px 24px' }, borderBottom: `1px solid ${BORDER}`, flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: BROWN }}>
                  Booking History
                </Typography>
                <Button onClick={() => onGoTo('register')} sx={{
                  bgcolor: S, color: '#fff', borderRadius: '8px', fontSize: '0.8rem',
                  fontWeight: 600, textTransform: 'none', px: 2.5, py: 1.125,
                  '&:hover': { bgcolor: SD },
                }}>
                  + New Booking
                </Button>
              </Box>

              {/* Tabs */}
              <Box sx={{ display: 'flex', borderBottom: `1px solid ${BORDER}` }}>
                {[{ key: 'coupons', label: '🎟 Prasadam Coupons' }, { key: 'party', label: 'Party Enquiries' }].map(t => (
                  <Button key={t.key} onClick={() => setBkTab(t.key as BkTab)} sx={{
                    flex: 1, py: 1.625, borderRadius: 0, textTransform: 'none', fontSize: '0.85rem',
                    fontWeight: bkTab === t.key ? 700 : 500,
                    color: bkTab === t.key ? SD : TXT_LIGHT,
                    borderBottom: bkTab === t.key ? `2px solid ${S}` : '2px solid transparent',
                    '&:hover': { bgcolor: SP },
                  }}>
                    {t.label}
                  </Button>
                ))}
              </Box>

              {/* Tab content */}
              <Box sx={{ p: 0 }}>
                {bkTab === 'coupons' && (
                  myBookings.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '2rem', mb: 1 }}>🎟</Typography>
                      <Typography sx={{ fontSize: '0.88rem', color: TXT_LIGHT }}>No prasadam bookings found.</Typography>
                    </Box>
                  ) : myBookings.map(b => {
                    const sc = statusColor(b.status);
                    return (
                      <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 3 }, py: 2, borderBottom: `1px solid ${BORDER}`, '&:last-child': { borderBottom: 0 }, '&:hover': { bgcolor: '#FDFAF4' } }}>
                        <Box sx={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, color: SD, bgcolor: SP, px: 1.25, py: 0.4, borderRadius: '50px', flexShrink: 0 }}>{b.id}</Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: BROWN }}>{b.name}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: TXT_LIGHT }}>{fmtDate(b.date)} · {b.location}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: sc.bg, px: 1.25, py: 0.5, borderRadius: '50px' }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: sc.text }}>{b.status}</Typography>
                        </Box>
                        {b.status === 'approved' && (
                          <IconButton
                            size="small"
                            onClick={() => setCouponBooking(b)}
                            sx={{ color: SD, bgcolor: SP, border: `1px solid ${BORDER}`, borderRadius: '8px', flexShrink: 0, '&:hover': { bgcolor: '#FEE8D4' } }}
                          >
                            <ConfirmationNumberIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        )}
                      </Box>
                    );
                  })
                )}
                {bkTab === 'party' && (
                  myEnquiries.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.88rem', color: TXT_LIGHT }}>No party enquiries found.</Typography>
                    </Box>
                  ) : myEnquiries.map(e => {
                    const sc = statusColor(e.status);
                    return (
                      <Box key={e.id} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 3 }, py: 2, borderBottom: `1px solid ${BORDER}`, '&:last-child': { borderBottom: 0 }, '&:hover': { bgcolor: '#FDFAF4' } }}>
                        <Box sx={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, color: GOLD, bgcolor: GOLD_PALE, px: 1.25, py: 0.4, borderRadius: '50px', flexShrink: 0 }}>{e.id}</Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: BROWN }}>{e.name}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: TXT_LIGHT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {fmtDate(e.eventDate)} · {e.address.slice(0, 40)}{e.address.length > 40 ? '…' : ''}
                          </Typography>
                          {e.confirmedMenu && <Typography sx={{ fontSize: '0.74rem', color: GREEN, mt: 0.25 }}>✅ {e.confirmedMenu}{e.confirmedPrice ? ` — ₹${e.confirmedPrice}` : ''}</Typography>}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: sc.bg, px: 1.25, py: 0.5, borderRadius: '50px' }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: sc.text }}>{e.status}</Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
