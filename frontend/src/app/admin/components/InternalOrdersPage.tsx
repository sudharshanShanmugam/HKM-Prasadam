'use client';
import React, { useState, useMemo } from 'react';
import { useGetInternalOrdersQuery, useToggleAcceptMutation, useToggleDeliverMutation } from '@/services/internalOrdersApi';
import type { InternalOrder, Department, MealType } from '@/types';

// MUI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// MUI Icons
import InventoryIcon from '@mui/icons-material/Inventory';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import UndoIcon from '@mui/icons-material/Undo';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

// ─── Colours ──────────────────────────────────────────────────────────────────
const S          = '#E8621A';
const SD         = '#C44D0D';
const SP         = '#FEF0E6';
const GOLD       = '#C9920A';
const GOLD_PALE  = '#FFF9E6';
const GREEN      = '#1B7A4A';
const GREEN_PALE = '#E6F5EC';
const BLUE       = '#1565C0';
const BLUE_PALE  = '#E3F0FF';
const BROWN      = '#3B1F0A';
const TXT_MID    = '#5A3A1A';
const TXT_LIGHT  = '#9A7A5A';
const BORDER     = '#F2E8D8';

const TH_SX = {
  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase' as const, color: SD,
  bgcolor: SP, py: 1.5, px: 2,
  borderBottom: '1.5px solid rgba(232,98,26,0.15)',
  whiteSpace: 'nowrap' as const,
};

const TD_SX = {
  fontSize: '0.83rem', color: BROWN,
  py: 1.5, px: 2,
  borderBottom: `1px solid ${BORDER}`,
  verticalAlign: 'middle' as const,
};

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '9px', bgcolor: '#fff', fontSize: '0.82rem',
    '& fieldset': { borderColor: '#E8D8C0' },
    '&:hover fieldset': { borderColor: S },
    '&.Mui-focused fieldset': { borderColor: S },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: SD },
};

const DEPTS: Department[] = [
  'Temple Administration', 'Deity Department', 'Kitchen / Prasadam',
  'Education / Gurukul', 'Guest House', 'Security',
  'Accounts', 'Outreach / Sankirtan', 'IT / Media', 'Others',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function MealIcon({ meal }: { meal: string }) {
  if (meal === 'Breakfast') return <FreeBreakfastIcon sx={{ fontSize: 14, color: S,        mr: 0.5, verticalAlign: 'middle' }} />;
  if (meal === 'Lunch')     return <WbSunnyIcon       sx={{ fontSize: 14, color: GOLD,     mr: 0.5, verticalAlign: 'middle' }} />;
  return                           <NightlightIcon    sx={{ fontSize: 14, color: '#7C3AED', mr: 0.5, verticalAlign: 'middle' }} />;
}

function StatusChip({ o }: { o: InternalOrder }) {
  if (o.delivered) return <Chip label="Delivered" size="small" sx={{ bgcolor: '#EDE7FF', color: '#4B0082', fontWeight: 700, fontSize: '0.67rem', borderRadius: '50px', border: '1px solid #B39DDB55', height: 22 }} />;
  if (o.accepted)  return <Chip label="Accepted"  size="small" sx={{ bgcolor: GREEN_PALE, color: GREEN,   fontWeight: 700, fontSize: '0.67rem', borderRadius: '50px', border: '1px solid #28A74555', height: 22 }} />;
  return                  <Chip label="Pending"   size="small" sx={{ bgcolor: GOLD_PALE,  color: GOLD,    fontWeight: 700, fontSize: '0.67rem', borderRadius: '50px', border: '1px solid #FFC10755', height: 22 }} />;
}

function fmtDate(d: string) {
  try { return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

// ─── Summary Card (matches PaymentsPage StatCard style) ──────────────────────
function StatCard({ icon, label, value, color, iconBg }: {
  icon: React.ReactNode; label: string; value: number;
  color: string; iconBg: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1.5px solid #FEF0E6',
        borderRadius: '14px',
        boxShadow: '0 2px 10px rgba(232,98,26,0.07)',
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '18px 20px !important' }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT_LIGHT }}>
            {label}
          </Typography>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color, lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Info Card ────────────────────────────────────────────────────────────────
function InfoCard({ icon, label, value, highlight = false, fullWidth = false }: {
  icon: React.ReactNode; label: string; value: React.ReactNode;
  highlight?: boolean; fullWidth?: boolean;
}) {
  return (
    <Box sx={{
      gridColumn: fullWidth ? '1 / -1' : undefined,
      bgcolor: fullWidth ? '#EEF2F7' : highlight ? '#FFF8E8' : '#F5F0EA',
      border: highlight ? '1.5px solid #F5D78E' : fullWidth ? '1.5px solid #D8E2EF' : 'none',
      borderRadius: '14px',
      p: '12px 16px',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.75 }}>
        <Box sx={{ fontSize: 13, color: TXT_LIGHT, display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT_LIGHT }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: BROWN, lineHeight: 1.3 }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Order Detail Modal ────────────────────────────────────────────────────────
function OrderModal({ order, onClose }: { order: InternalOrder; onClose: () => void }) {
  const [toggleAccept]                             = useToggleAcceptMutation();
  const [toggleDeliver, { isLoading: delivering }] = useToggleDeliverMutation();

  const statusLabel = order.delivered ? '🚚 Delivered' : order.accepted ? '✅ Accepted' : '⏳ Pending';
  const statusSx    = order.delivered
    ? { bgcolor: '#EDE7FF', color: '#4B0082', border: '1.5px solid #B39DDB' }
    : order.accepted
    ? { bgcolor: '#D4EDDA', color: '#155724', border: '1.5px solid #81C784' }
    : { bgcolor: '#FFF3CD', color: '#856404', border: '1.5px solid #FFD54F' };

  const fmtDateLong = (d: string) => {
    try { return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '20px', overflow: 'hidden', border: 'none', m: { xs: 1.5, sm: 2 } } } }}>

      {/* ── White header ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}` }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: BROWN, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          🏛 Order Details
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: TXT_LIGHT, '&:hover': { color: BROWN, bgcolor: '#F5F0EA' } }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5 }}>

        {/* ── Order ID + Status ── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT_LIGHT, mb: 0.4 }}>
              Order ID
            </Typography>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 700, color: BROWN, lineHeight: 1 }}>
              {order.id}
            </Typography>
          </Box>
          <Box component="span" sx={{
            fontSize: '0.8rem', fontWeight: 700, borderRadius: '50px',
            px: 1.75, py: 0.6, whiteSpace: 'nowrap', mt: 0.5,
            ...statusSx,
          }}>
            {statusLabel}
          </Box>
        </Box>

        {/* ── Info card grid ── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
          <InfoCard icon="👤" label="Name"   value={order.name}   />
          <InfoCard icon="📱" label="Mobile" value={order.mobile} />
          <InfoCard
            icon={<span style={{ fontSize: 13 }}>📅</span>}
            label="Date"
            value={fmtDateLong(order.date)}
          />
          <InfoCard icon="🏛" label="Department" value={order.dept} />
          <InfoCard
            icon={<MealIcon meal={order.meal} />}
            label="Meal Type"
            value={order.meal || 'Not specified'}
            highlight
          />
          <InfoCard icon="🍽" label="Plate Count" value={String(order.count)} highlight />
          <InfoCard
            icon="📍"
            label="Delivery Location"
            value={order.location || 'Not specified'}
            fullWidth
          />
        </Box>

        {/* ── Submitted ── */}
        {order.submitted && (
          <Typography sx={{ fontSize: '0.72rem', color: TXT_LIGHT, textAlign: 'right', mt: 1.5 }}>
            Submitted: {order.submitted}
          </Typography>
        )}

        {/* ── Action buttons ── */}
        {(!order.accepted || !order.delivered) && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2.5 }}>
            {!order.accepted && (
              <Button fullWidth variant="contained"
                startIcon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                onClick={() => { toggleAccept(order.id); onClose(); }}
                sx={{ borderRadius: '10px', textTransform: 'none', fontSize: '0.88rem', fontWeight: 700, py: 1.1, bgcolor: GREEN, color: '#fff', boxShadow: '0 3px 10px rgba(27,122,74,0.3)', '&:hover': { bgcolor: '#155A38' } }}
              >
                Accept Order
              </Button>
            )}
            {order.accepted && !order.delivered && (
              <Button fullWidth variant="contained"
                startIcon={<LocalShippingIcon sx={{ fontSize: '16px !important' }} />}
                disabled={delivering}
                onClick={() => toggleDeliver(order.id)}
                sx={{ borderRadius: '10px', textTransform: 'none', fontSize: '0.88rem', fontWeight: 700, py: 1.1, bgcolor: S, color: '#fff', boxShadow: '0 3px 10px rgba(232,98,26,0.3)', '&:hover': { bgcolor: SD } }}
              >
                Mark Delivered
              </Button>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type StatusFilter = 'all' | 'pending' | 'accepted' | 'delivered';

export default function InternalOrdersPage() {
  const { data: orders = [], isLoading } = useGetInternalOrdersQuery({});
  const [selectedOrder, setSelectedOrder] = useState<InternalOrder | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [mealFilter,   setMealFilter]   = useState<MealType | ''>('');
  const [deptFilter,   setDeptFilter]   = useState<Department | ''>('');
  const [dateFilter,   setDateFilter]   = useState('');
  const [search,       setSearch]       = useState('');

  // Summary counts
  const pending   = orders.filter(o => !o.accepted).length;
  const accepted  = orders.filter(o => o.accepted && !o.delivered).length;
  const delivered = orders.filter(o => o.delivered).length;

  // Filtered list
  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter === 'pending'   && (o.accepted || o.delivered))  return false;
      if (statusFilter === 'accepted'  && (!o.accepted || o.delivered)) return false;
      if (statusFilter === 'delivered' && !o.delivered)                  return false;
      if (mealFilter && o.meal !== mealFilter)                           return false;
      if (deptFilter && o.dept !== deptFilter)                           return false;
      if (dateFilter && o.date !== dateFilter)                           return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.name.toLowerCase().includes(q) && !o.mobile.includes(q) && !o.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, mealFilter, deptFilter, dateFilter, search]);

  const hasFilters = statusFilter !== 'all' || !!mealFilter || !!deptFilter || !!dateFilter || !!search;

  function clearFilters() {
    setStatusFilter('all'); setMealFilter(''); setDeptFilter(''); setDateFilter(''); setSearch('');
  }

  return (
    <Box>
      {/* PAGE HEADER */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25 }}>
            <InventoryIcon sx={{ color: SD, fontSize: 26 }} />
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color: SD }}>
              Internal Orders
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.82rem', color: TXT_LIGHT }}>
            {orders.length} total · {pending} pending · {accepted} in transit · {delivered} delivered
          </Typography>
        </Box>
        {hasFilters && (
          <Button size="small" onClick={clearFilters}
            sx={{ borderRadius: '50px', textTransform: 'none', fontSize: '0.78rem', color: SD, border: `1.5px solid rgba(232,98,26,0.3)`, px: 1.75, '&:hover': { bgcolor: SP } }}>
            Clear Filters
          </Button>
        )}
      </Box>

      {/* SUMMARY CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={3}>
          <StatCard icon={<InventoryIcon />}             label="Total Orders" value={orders.length} color={SD}      iconBg={SP}         />
        </Grid>
        <Grid size={3}>
          <StatCard icon={<HourglassEmptyIcon />}        label="Pending"      value={pending}       color={GOLD}    iconBg={GOLD_PALE}  />
        </Grid>
        <Grid size={3}>
          <StatCard icon={<TaskAltIcon />}               label="Accepted"     value={accepted}      color={GREEN}   iconBg={GREEN_PALE} />
        </Grid>
        <Grid size={3}>
          <StatCard icon={<LocalShippingOutlinedIcon />} label="Delivered"    value={delivered}     color="#4B0082" iconBg="#EDE7FF"    />
        </Grid>
      </Grid>

      {/* FILTERS ROW */}
      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '12px', p: '12px 16px', mb: 2, boxShadow: '0 1px 6px rgba(232,98,26,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <FilterListIcon sx={{ fontSize: 16, color: TXT_LIGHT }} />
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT_LIGHT }}>
            Filters
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search name, mobile, ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: TXT_LIGHT }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 200, flex: 2, ...FIELD_SX }}
          />

          {/* Meal filter */}
          <FormControl size="small" sx={{ minWidth: 130, flex: 1, ...FIELD_SX }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Meal</InputLabel>
            <Select label="Meal" value={mealFilter} onChange={e => setMealFilter(e.target.value as MealType | '')}>
              <MenuItem value=""><em>All Meals</em></MenuItem>
              {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(m => (
                <MenuItem key={m} value={m}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MealIcon meal={m} />{m}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Department filter */}
          <FormControl size="small" sx={{ minWidth: 180, flex: 2, ...FIELD_SX }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Department</InputLabel>
            <Select label="Department" value={deptFilter} onChange={e => setDeptFilter(e.target.value as Department | '')}>
              <MenuItem value=""><em>All Departments</em></MenuItem>
              {DEPTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>

          {/* Date filter */}
          <TextField
            size="small" type="date" label="Date"
            value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150, flex: 1, ...FIELD_SX }}
          />
        </Box>
      </Card>

      {/* TABLE CARD */}
      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...TH_SX, minWidth: 90  }}>ID</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 120 }}>Name</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 160 }}>Department</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 105 }}>Date</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 105 }}>Meal</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 60,  textAlign: 'center' as const }}>Plates</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 160 }}>Location</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 100 }}>Status</TableCell>
                <TableCell sx={{ ...TH_SX, minWidth: 80  }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: TXT_LIGHT, fontSize: '0.85rem' }}>
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ fontSize: '0.85rem', color: TXT_LIGHT }}>
                      {hasFilters ? 'No orders match the current filters.' : 'No internal orders yet.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filtered.map(o => (
                <TableRow key={o.id} sx={{ '&:hover td': { bgcolor: '#FDFAF4' }, '&:last-child td': { border: 0 } }}>
                  <TableCell sx={TD_SX}>
                    <Box component="span" sx={{ fontSize: '0.67rem', fontWeight: 700, color: SD, bgcolor: SP, px: 1.25, py: 0.4, borderRadius: '50px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                      {o.id}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.name}
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, fontSize: '0.76rem', color: TXT_MID, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.dept}
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, color: TXT_LIGHT, whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                    {fmtDate(o.date)}
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, whiteSpace: 'nowrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MealIcon meal={o.meal} />
                      <Typography sx={{ fontSize: '0.82rem', color: BROWN }}>{o.meal}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, fontWeight: 700, textAlign: 'center' as const }}>
                    {o.count}
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, fontSize: '0.78rem', color: TXT_MID, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.location}
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, whiteSpace: 'nowrap' }}>
                    <StatusChip o={o} />
                  </TableCell>
                  <TableCell sx={{ ...TD_SX, pr: 1.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => setSelectedOrder(o)}
                      sx={{
                        color: SD, bgcolor: SP, borderRadius: '8px', p: 0.7,
                        border: '1.5px solid rgba(232,98,26,0.2)',
                        '&:hover': { bgcolor: '#FEE0CC' },
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ px: 3, py: 1.25, borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FDFAF6' }}>
          <Typography sx={{ fontSize: '0.75rem', color: TXT_LIGHT }}>
            Showing {filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
          </Typography>
          {pending > 0 && (
            <Typography sx={{ fontSize: '0.75rem', color: GOLD, fontWeight: 600 }}>
              {pending} awaiting acceptance
            </Typography>
          )}
        </Box>
      </Card>

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </Box>
  );
}
