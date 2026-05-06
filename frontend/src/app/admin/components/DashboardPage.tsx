'use client';
import React, { useState } from 'react';
import { useGetDashboardStatsQuery, useGetTodaySlotsQuery } from '@/services/dashboardApi';
import { useGetRegistrationsQuery } from '@/services/registrationsApi';
import { ALL_MEALS, CLR, pill } from './shared';
import type { MealType } from '@/types';

// MUI
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';

// MUI Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PaymentIcon from '@mui/icons-material/Payment';
import InventoryIcon from '@mui/icons-material/Inventory';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InsightsIcon from '@mui/icons-material/Insights';

const SAFFRON      = '#E8621A';
const SAFFRON_DARK = '#C44D0D';
const SAFFRON_PALE = '#FEF0E6';
const GOLD         = '#C9920A';
const GOLD_PALE    = '#FFF9E6';
const GREEN        = '#2D7A3A';
const RED          = '#C0392B';

function mealMuiIcon(meal: MealType) {
  if (meal === 'Breakfast') return <FreeBreakfastIcon sx={{ fontSize: 20 }} />;
  if (meal === 'Lunch')     return <WbSunnyIcon       sx={{ fontSize: 20 }} />;
  return                           <NightlightIcon    sx={{ fontSize: 20 }} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, iconBg, loading }: {
  icon: React.ReactNode; label: string; value: number | string;
  sub?: string; color?: string; iconBg?: string; loading?: boolean;
}) {
  return (
    <Card elevation={0} sx={{
      border: '1.5px solid #FEF0E6', borderRadius: '16px',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 4px 18px rgba(232,98,26,0.09)',
      transition: 'transform 0.18s, box-shadow 0.18s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 28px rgba(232,98,26,0.14)' },
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(to right, ${SAFFRON}, ${GOLD})` }} />
      <CardContent sx={{ pt: 3, pb: '20px !important', px: 3 }}>
        <Box sx={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '12px', bgcolor: iconBg ?? SAFFRON_PALE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color ?? SAFFRON_DARK }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: '0.71rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A7A5A', mb: 1.25 }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={60} height={48} />
        ) : (
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', fontWeight: 700, color: color ?? SAFFRON_DARK, lineHeight: 1 }}>
            {value}
          </Typography>
        )}
        {sub && <Typography sx={{ fontSize: '0.72rem', color: '#9A7A5A', mt: 0.75 }}>{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

// ─── Meal Fill Card ───────────────────────────────────────────────────────────
function MealFillCard({ meal, used, limit }: { meal: MealType; used: number; limit: number }) {
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const rem = limit - used;
  const barColor = pct >= 90 ? RED : pct >= 75 ? '#e67e22' : SAFFRON;

  return (
    <Card elevation={0} sx={{
      background: `linear-gradient(135deg, ${SAFFRON_PALE}, ${GOLD_PALE})`,
      border: '1px solid rgba(232,98,26,0.12)',
      borderRadius: '10px',
      '&:hover': { boxShadow: '0 4px 14px rgba(232,98,26,0.12)' },
    }}>
      <CardContent sx={{ p: '14px 16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#5A3A1A' }}>
            {mealMuiIcon(meal)}
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#5A3A1A' }}>{meal}</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#3B1F0A' }}>{used} / {limit}</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(pct, 100)}
          sx={{
            height: 8, borderRadius: '50px', bgcolor: '#E8D8C0',
            '& .MuiLinearProgress-bar': { background: `linear-gradient(to right, ${barColor}, ${pct >= 90 ? RED : GOLD})`, borderRadius: '50px' },
          }}
        />
        <Typography sx={{ fontSize: '0.68rem', color: pct >= 90 ? RED : '#9A7A5A', mt: 0.75, textAlign: 'right', fontWeight: pct >= 90 ? 600 : 400 }}>
          {pct}% — {rem <= 0 ? 'Full!' : `${rem} remaining`}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage({ onNav }: { onNav: (page: string) => void }) {
  const { data: stats,      isLoading: statsLoad } = useGetDashboardStatsQuery();
  const { data: todaySlots, isLoading: slotsLoad } = useGetTodaySlotsQuery();
  const { data: regsData,   isLoading: regsLoad  } = useGetRegistrationsQuery({});

  const [fillLoc, setFillLoc] = useState<'Thiruvanmiyur' | 'NLBR'>('Thiruvanmiyur');

  const recentBookings = regsData?.data.slice(0, 5) ?? [];

  const fillStats = ALL_MEALS.map(meal => {
    const used  = todaySlots?.bookings[fillLoc][meal] ?? 0;
    const limit = todaySlots?.slot?.slotLimits?.[fillLoc]?.[meal]
      ?? (fillLoc === 'Thiruvanmiyur' ? 100 : 80);
    return { meal, used, limit };
  });

  return (
    <Box>

      {/* ── HEADER ── */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, color: SAFFRON_DARK, lineHeight: 1.15 }}>
          Welcome back
        </Typography>
        <Typography sx={{ fontSize: '0.88rem', color: '#9A7A5A', mt: 0.5 }}>
          Here&apos;s what&apos;s happening with HKM Prasadam today.
        </Typography>
      </Box>

      {/* ── 4 STAT CARDS ── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={3}>
          <StatCard
            icon={<PeopleAltIcon />}
            label="Total Bookings"
            value={stats?.totalBookings ?? 0}
            sub={`↑ ${stats?.todayBookings ?? 0} new today`}
            loading={statsLoad}
          />
        </Grid>
        <Grid size={3}>
          <StatCard
            icon={<ConfirmationNumberIcon />}
            label="Coupons Issued"
            value={stats?.totalCoupons ?? 0}
            sub="across all meals"
            color={GOLD}
            iconBg={GOLD_PALE}
            loading={statsLoad}
          />
        </Grid>
        <Grid size={3}>
          <StatCard
            icon={<PaymentIcon />}
            label="Pending Payments"
            value={stats?.pendingPayments ?? 0}
            sub="awaiting approval"
            color={stats?.pendingPayments ? RED : GREEN}
            iconBg={stats?.pendingPayments ? '#FDECEA' : '#EBF7ED'}
            loading={statsLoad}
          />
        </Grid>
        <Grid size={3}>
          <StatCard
            icon={<InventoryIcon />}
            label="Pending Orders"
            value={stats?.pendingOrders ?? 0}
            sub="internal dept orders"
            color={stats?.pendingOrders ? '#7B1D1D' : GREEN}
            iconBg={stats?.pendingOrders ? '#FDE8D8' : '#EBF7ED'}
            loading={statsLoad}
          />
        </Grid>
      </Grid>

      {/* ── FILL RATE CARD ── */}
      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', mb: 3.5, boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: '1.5px solid #FEF0E6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, background: 'linear-gradient(to right, #fff, #FFF8F2)' }}>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: SAFFRON_DARK, fontWeight: 600 }}>
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <InsightsIcon sx={{ fontSize: 20, color: '#E8621A' }} />
              Live Fill Rate — Today&apos;s Slots
            </Box>
          </Typography>
          <Select
            size="small"
            value={fillLoc}
            onChange={e => setFillLoc(e.target.value as 'Thiruvanmiyur' | 'NLBR')}
            sx={{ fontSize: '0.82rem', borderRadius: '8px', bgcolor: '#FBF6EE', '.MuiOutlinedInput-notchedOutline': { borderColor: '#E8D8C0' } }}
          >
            <MenuItem value="Thiruvanmiyur">📍 Thiruvanmiyur</MenuItem>
            <MenuItem value="NLBR">📍 NLBR</MenuItem>
          </Select>
        </Box>
        <CardContent sx={{ p: '20px !important' }}>
          {slotsLoad ? (
            <Grid container spacing={2}>
              {[0, 1, 2].map(i => <Grid key={i} size={4}><Skeleton variant="rounded" height={90} /></Grid>)}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {fillStats.map(({ meal, used, limit }) => (
                <Grid key={meal} size={4}>
                  <MealFillCard meal={meal as MealType} used={used} limit={limit} />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* ── RECENT REGISTRATIONS TABLE ── */}
      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: '1.5px solid #FEF0E6', display: 'flex', alignItems: 'center', gap: 2, background: 'linear-gradient(to right, #fff, #FFF8F2)', flexWrap: 'wrap' }}>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: SAFFRON_DARK, fontWeight: 600, flex: 1 }}>
            Recent Registrations
          </Typography>
          {/* Meal icon legend */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {([
              { meal: 'Breakfast' as const, color: '#92400E', bg: '#FEF3C7' },
              { meal: 'Lunch'     as const, color: '#78350F', bg: '#FFF9E6' },
              { meal: 'Dinner'    as const, color: '#4C1D95', bg: '#EDE9FE' },
            ]).map(({ meal, color, bg }) => (
              <Box key={meal} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.35, borderRadius: '6px', bgcolor: bg }}>
                <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{mealMuiIcon(meal)}</Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color }}>{meal}</Typography>
              </Box>
            ))}
          </Box>
          <Button
            size="small"
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            onClick={() => onNav('registrations')}
            sx={{
              color: SAFFRON_DARK, fontSize: '0.78rem', textTransform: 'none', fontWeight: 600,
              border: '1.5px solid rgba(232,98,26,0.25)', borderRadius: '50px', px: 2,
              '&:hover': { bgcolor: SAFFRON_PALE },
            }}
          >
            View All
          </Button>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: SAFFRON_PALE }}>
                {['Coupon ID', 'Booking ID', 'Name', 'Mobile', 'Location', 'Meals', 'Date', 'Qty', 'Status'].map(h => (
                  <TableCell key={h} sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: SAFFRON_DARK, py: 1.5, px: 2, borderBottom: '1.5px solid rgba(232,98,26,0.15)', whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {regsLoad ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5, color: '#9A7A5A', fontSize: '0.85rem' }}>Loading…</TableCell>
                </TableRow>
              ) : recentBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5, color: '#9A7A5A', fontSize: '0.85rem' }}>No bookings yet.</TableCell>
                </TableRow>
              ) : recentBookings.map(b => {
                const tot = b.meals.Breakfast + b.meals.Lunch + b.meals.Dinner;
                const activeMeals = ALL_MEALS.filter(m => b.meals[m] > 0);
                return (
                  <TableRow key={b.id} sx={{ '&:hover td': { bgcolor: '#FDFAF4' }, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.83rem', borderBottom: '1px solid #F2E8D8' }}>
                      <span style={pill(CLR.gold, CLR.goldPale)}>{b.id}</span>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.83rem', borderBottom: '1px solid #F2E8D8' }}>
                      <span style={pill('#5A3A1A', '#FDE8D8')}>{b.bookingId}</span>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.83rem', fontWeight: 500, color: '#3B1F0A', borderBottom: '1px solid #F2E8D8' }}>
                      {b.name}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.83rem', color: '#9A7A5A', borderBottom: '1px solid #F2E8D8' }}>
                      {b.mobile.replace(/(\d{2})(\d{4})(\d{4})/, '$1XXXX$3')}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.83rem', borderBottom: '1px solid #F2E8D8' }}>
                      <span style={pill(
                        b.location === 'Thiruvanmiyur' ? CLR.saffronDark : '#7B1D1D',
                        b.location === 'Thiruvanmiyur' ? CLR.saffronPale : CLR.redPale,
                      )}>{b.location}</span>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, borderBottom: '1px solid #F2E8D8' }}>
                      {activeMeals.length === 0 ? '—' : (
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          {activeMeals.map(m => (
                            <Box key={m} sx={{
                              display: 'inline-flex', alignItems: 'center', gap: 0.4,
                              px: 0.875, py: 0.3, borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                              color: m === 'Breakfast' ? '#92400E' : m === 'Lunch' ? '#78350F' : '#4C1D95',
                              bgcolor: m === 'Breakfast' ? '#FEF3C7' : m === 'Lunch' ? '#FFF9E6' : '#EDE9FE',
                            }}>
                              {mealMuiIcon(m)}
                              {b.meals[m]}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.83rem', color: '#9A7A5A', whiteSpace: 'nowrap', borderBottom: '1px solid #F2E8D8' }}>
                      {new Date(b.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.83rem', borderBottom: '1px solid #F2E8D8' }}>
                      {tot}
                      {tot >= 10 && <Box component="span" sx={{ ml: 0.75, fontSize: '0.65rem', fontWeight: 700, color: SAFFRON, bgcolor: SAFFRON_PALE, px: 0.75, py: 0.25, borderRadius: '4px' }}>BULK</Box>}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 2, fontSize: '0.83rem', borderBottom: '1px solid #F2E8D8' }}>
                      <span style={{ background: '#E8F5E9', color: '#2D7A3A', fontWeight: 700, fontSize: '0.7rem', borderRadius: '50px', padding: '2px 10px', letterSpacing: '0.04em' }}>
                        Approved
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Card>

    </Box>
  );
}
