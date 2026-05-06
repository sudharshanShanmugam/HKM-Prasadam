'use client';
import React, { useState } from 'react';
import {
  useGetPaymentsQuery,
  useApprovePaymentMutation,
  useDeclinePaymentMutation,
  useFlagMismatchMutation,
} from '@/services/paymentsApi';
import { StatusPill, pill } from './shared';
import type { MealType, PrasadamBooking, BookingStatus } from '@/types';

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
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';

// MUI Icons
import PaymentIcon from '@mui/icons-material/Payment';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassBottom';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import ImageIcon from '@mui/icons-material/Image';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

const SAFFRON      = '#E8621A';
const SAFFRON_DARK = '#C44D0D';
const SAFFRON_PALE = '#FEF0E6';
const GOLD         = '#C9920A';
const GOLD_PALE    = '#FFF9E6';
const GREEN        = '#2D7A3A';
const GREEN_PALE   = '#EBF7ED';
const RED          = '#C0392B';
const RED_PALE     = '#FDECEA';
const AMBER        = '#B45309';
const AMBER_PALE   = '#FFFBEB';

function fmtDate(d: string) {
  try {
    const dt = new Date(d.includes('T') ? d : d + 'T12:00:00');
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return d; }
}

function MealBadge({ meal, count }: { meal: MealType; count: number }) {
  const icon = meal === 'Breakfast'
    ? <FreeBreakfastIcon sx={{ fontSize: 14 }} />
    : meal === 'Lunch'
    ? <WbSunnyIcon sx={{ fontSize: 14 }} />
    : <NightlightIcon sx={{ fontSize: 14 }} />;
  const color  = meal === 'Breakfast' ? '#92400E' : meal === 'Lunch' ? '#78350F' : '#4C1D95';
  const bgcolor = meal === 'Breakfast' ? '#FEF3C7' : meal === 'Lunch' ? '#FFF9E6' : '#EDE9FE';
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, bgcolor, color, px: 0.875, py: 0.3, borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
      {icon} {count}
    </Box>
  );
}

const TH_SX = {
  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: SAFFRON_DARK,
  bgcolor: SAFFRON_PALE, py: 1.5, px: 2,
  borderBottom: '1.5px solid rgba(232,98,26,0.15)',
  whiteSpace: 'nowrap',
} as const;

const TD_SX = {
  fontSize: '0.83rem', color: '#3B1F0A',
  py: 1.5, px: 2,
  borderBottom: '1px solid #F2E8D8',
} as const;

function StatCard({ icon, label, value, color, iconBg }: {
  icon: React.ReactNode; label: string; value: number; color: string; iconBg: string;
}) {
  return (
    <Card elevation={0} sx={{
      border: '1.5px solid #FEF0E6', borderRadius: '14px',
      boxShadow: '0 2px 10px rgba(232,98,26,0.07)',
      transition: 'transform 0.18s, box-shadow 0.18s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(232,98,26,0.12)' },
    }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '18px 20px !important' }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A7A5A' }}>
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

// ─── Proof Viewer Modal ────────────────────────────────────────────────────────
function ProofModal({
  booking, open, onClose,
}: {
  booking: PrasadamBooking | null;
  open: boolean;
  onClose: () => void;
}) {
  const [mismatchNote, setMismatchNote] = useState('');
  const [acting, setActing] = useState<'approve' | 'decline' | 'mismatch' | null>(null);

  const [approve]  = useApprovePaymentMutation();
  const [decline]  = useDeclinePaymentMutation();
  const [mismatch] = useFlagMismatchMutation();

  if (!booking) return null;

  const id       = booking.id;
  const hasProof = !!booking.paymentProof;
  const tot      = booking.meals.Breakfast + booking.meals.Lunch + booking.meals.Dinner;

  async function handleApprove() {
    setActing('approve');
    await approve(id);
    setActing(null); onClose();
  }

  async function handleDecline() {
    setActing('decline');
    await decline(id);
    setActing(null); onClose();
  }

  async function handleMismatch() {
    if (!mismatchNote.trim()) return;
    setActing('mismatch');
    await mismatch({ id, note: mismatchNote.trim() });
    setActing(null); onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px', overflow: 'hidden' } } }}
    >
      {/* Header */}
      <DialogTitle sx={{
        background: `linear-gradient(135deg, #3B1F0A, #5A3A1A)`,
        color: '#fff', py: 2, px: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
            Payment Proof — {booking.name}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', mt: 0.25 }}>
            {booking.id} · {fmtDate(booking.date)} · {booking.location}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Grid container sx={{ minHeight: 420 }}>

          {/* LEFT — proof image */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ bgcolor: '#F5F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, borderRight: '1px solid #F2E8D8', minHeight: 300 }}>
            {hasProof ? (
              <Box sx={{ width: '100%', maxHeight: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                  component="img"
                  src={booking.paymentProof}
                  alt="Payment proof"
                  sx={{
                    maxWidth: '100%', maxHeight: 420,
                    borderRadius: '10px',
                    border: '2px solid #E8D8C0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    objectFit: 'contain',
                    cursor: 'zoom-in',
                  }}
                  onClick={() => window.open(booking.paymentProof, '_blank')}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', color: '#9A7A5A' }}>
                <BrokenImageIcon sx={{ fontSize: 56, mb: 1.5, opacity: 0.4 }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>No proof uploaded</Typography>
                <Typography sx={{ fontSize: '0.75rem', mt: 0.5, opacity: 0.7 }}>Pilgrim did not submit a screenshot</Typography>
              </Box>
            )}
          </Grid>

          {/* RIGHT — booking info + actions */}
          <Grid size={{ xs: 12, md: 5 }}>

            {/* Booking details */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #F2E8D8' }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A7A5A', mb: 1.5 }}>
                Booking Details
              </Typography>

              {[
                { label: 'Pilgrim',  value: booking.name },
                { label: 'Mobile',   value: booking.mobile },
                { label: 'Amount',   value: `₹${booking.total}/-` },
                { label: 'Coupons', value: `${tot} total` },
                { label: 'Submitted', value: fmtDate(booking.submitted ?? booking.createdAt) },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#9A7A5A' }}>{label}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#3B1F0A' }}>{value}</Typography>
                </Box>
              ))}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px dashed #F2E8D8' }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#9A7A5A' }}>Current status</Typography>
                <StatusPill s={booking.status} />
              </Box>

              {booking.mismatchNote && (
                <Box sx={{ mt: 1.5, bgcolor: AMBER_PALE, border: `1px solid #FDE68A`, borderRadius: '8px', px: 1.5, py: 1 }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: AMBER, mb: 0.25 }}>⚠️ Mismatch Note</Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: '#92400E' }}>{booking.mismatchNote}</Typography>
                </Box>
              )}
            </Box>

            {/* Meal breakdown */}
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F2E8D8' }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A7A5A', mb: 1 }}>
                Meal Breakdown
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(m =>
                  (booking.meals[m] ?? 0) > 0
                    ? <MealBadge key={m} meal={m} count={booking.meals[m]} />
                    : null
                )}
              </Box>
            </Box>

            <Divider sx={{ borderColor: '#F2E8D8' }} />

            {/* Mismatch note field */}
            <Box sx={{ px: 3, pt: 2, pb: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9A7A5A', mb: 0.75 }}>
                Mismatch Note <Typography component="span" sx={{ fontSize: '0.68rem', fontWeight: 400 }}>(required for mismatch)</Typography>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                placeholder="e.g. Amount paid ₹50 but booking is ₹75…"
                value={mismatchNote}
                onChange={e => setMismatchNote(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.82rem', borderRadius: '8px',
                    '& fieldset': { borderColor: '#E8D8C0' },
                    '&:hover fieldset': { borderColor: AMBER },
                    '&.Mui-focused fieldset': { borderColor: AMBER },
                  },
                }}
              />
            </Box>

            {/* Action buttons */}
            <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>

              {booking.status !== 'approved' && (
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!!acting}
                  startIcon={acting === 'approve' ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}
                  onClick={handleApprove}
                  sx={{
                    bgcolor: GREEN, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.88rem',
                    boxShadow: '0 3px 10px rgba(45,122,58,0.3)',
                    '&:hover': { bgcolor: '#235E2D' },
                  }}
                >
                  {acting === 'approve' ? 'Approving…' : '✅ Approve Payment'}
                </Button>
              )}

              {booking.status !== 'declined' && (
                <Button
                  fullWidth
                  variant="outlined"
                  disabled={!!acting}
                  startIcon={acting === 'decline' ? <CircularProgress size={14} sx={{ color: RED }} /> : <CloseIcon />}
                  onClick={handleDecline}
                  sx={{
                    borderColor: RED, color: RED, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.88rem',
                    borderWidth: '1.5px',
                    '&:hover': { bgcolor: RED_PALE, borderColor: RED },
                  }}
                >
                  {acting === 'decline' ? 'Declining…' : '❌ Decline Payment'}
                </Button>
              )}

              <Button
                fullWidth
                variant="outlined"
                disabled={!mismatchNote.trim() || !!acting}
                startIcon={acting === 'mismatch' ? <CircularProgress size={14} sx={{ color: AMBER }} /> : <WarningAmberIcon />}
                onClick={handleMismatch}
                sx={{
                  borderColor: AMBER, color: AMBER, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.88rem',
                  borderWidth: '1.5px',
                  '&:hover': { bgcolor: AMBER_PALE, borderColor: AMBER },
                  '&.Mui-disabled': { opacity: 0.45 },
                }}
              >
                {acting === 'mismatch' ? 'Flagging…' : '⚠️ Flag Mismatch & Decline'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | ''>('');
  const [filterLoc, setFilterLoc]       = useState('');
  const [proofBooking, setProofBooking] = useState<PrasadamBooking | null>(null);

  const { data, isLoading } = useGetPaymentsQuery({
    search:   search       || undefined,
    status:   (filterStatus as BookingStatus) || undefined,
    location: filterLoc    || undefined,
  });

  const bookings = data?.data ?? [];
  const summary  = data?.summary ?? { total: 0, pending: 0, approved: 0, declined: 0 };
  const hasFilters = !!(search || filterStatus || filterLoc);

  return (
    <Box>

      {/* ── PAGE HEADER ── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <PaymentIcon sx={{ color: SAFFRON_DARK, fontSize: 28 }} />
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color: SAFFRON_DARK }}>
            Payments
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.85rem', color: '#9A7A5A' }}>
          Review payment proofs and approve / decline pilgrim submissions
        </Typography>
      </Box>

      {/* ── 4 STAT CARDS ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={3}><StatCard icon={<PaymentIcon />}            label="Total"    value={summary.total}    color={SAFFRON_DARK} iconBg={SAFFRON_PALE} /></Grid>
        <Grid size={3}><StatCard icon={<HourglassEmptyIcon />}     label="Pending"  value={summary.pending}  color={GOLD}         iconBg={GOLD_PALE}    /></Grid>
        <Grid size={3}><StatCard icon={<CheckCircleOutlineIcon />} label="Approved" value={summary.approved} color={GREEN}        iconBg={GREEN_PALE}   /></Grid>
        <Grid size={3}><StatCard icon={<CancelOutlinedIcon />}     label="Declined" value={summary.declined} color={RED}          iconBg={RED_PALE}     /></Grid>
      </Grid>

      {/* ── TABLE CARD ── */}
      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>

        {/* Filters bar */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1.5px solid #F2E8D8', background: 'linear-gradient(to right, #fff, #FFF8F2)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: SAFFRON_DARK, fontWeight: 600, mr: 'auto' }}>
            Payment Submissions
          </Typography>

          <TextField
            size="small"
            placeholder="Search name, ID or mobile…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#9A7A5A' }} /></InputAdornment> } }}
            sx={{ minWidth: 210, '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#fff', fontSize: '0.82rem', '& fieldset': { borderColor: '#E8D8C0' }, '&:hover fieldset': { borderColor: SAFFRON }, '&.Mui-focused fieldset': { borderColor: SAFFRON } } }}
          />

          <FormControl size="small" sx={{ minWidth: 135 }}>
            <InputLabel sx={{ fontSize: '0.82rem', color: '#9A7A5A' }}>Status</InputLabel>
            <Select label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value as BookingStatus | '')} sx={{ borderRadius: '8px', bgcolor: '#fff', fontSize: '0.82rem', '& fieldset': { borderColor: '#E8D8C0' } }}>
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="declined">Declined</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 145 }}>
            <InputLabel sx={{ fontSize: '0.82rem', color: '#9A7A5A' }}>Location</InputLabel>
            <Select label="Location" value={filterLoc} onChange={e => setFilterLoc(e.target.value)} sx={{ borderRadius: '8px', bgcolor: '#fff', fontSize: '0.82rem', '& fieldset': { borderColor: '#E8D8C0' } }}>
              <MenuItem value="">All Locations</MenuItem>
              <MenuItem value="Thiruvanmiyur">Thiruvanmiyur</MenuItem>
              <MenuItem value="NLBR">NLBR</MenuItem>
            </Select>
          </FormControl>

          {hasFilters && (
            <Button size="small" startIcon={<CloseIcon sx={{ fontSize: 14 }} />} onClick={() => { setSearch(''); setFilterStatus(''); setFilterLoc(''); }} sx={{ color: SAFFRON_DARK, fontSize: '0.78rem', textTransform: 'none', fontWeight: 600, border: `1.5px solid rgba(232,98,26,0.3)`, borderRadius: '50px', px: 2, '&:hover': { bgcolor: SAFFRON_PALE } }}>
              Clear
            </Button>
          )}
        </Box>

        {/* Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Booking ID', 'Pilgrim', 'Date · Location', 'Meals', 'Amount', 'Submitted', 'Proof', 'Status'].map(h => (
                  <TableCell key={h} sx={TH_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={28} sx={{ color: SAFFRON }} /></TableCell></TableRow>
              ) : bookings.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: '#9A7A5A', fontSize: '0.85rem' }}>No payment submissions found.</TableCell></TableRow>
              ) : bookings.map(b => (
                <TableRow key={b.id} sx={{ '&:hover td': { bgcolor: '#FDFAF4' }, '&:last-child td': { border: 0 } }}>

                  <TableCell sx={TD_SX}><span style={pill(GOLD, GOLD_PALE)}>{b.id}</span></TableCell>

                  <TableCell sx={{ ...TD_SX, fontWeight: 600 }}>
                    {b.name}
                    {b.mismatchNote && (
                      <Tooltip title={`Mismatch: ${b.mismatchNote}`}>
                        <WarningAmberIcon sx={{ fontSize: 13, color: AMBER, ml: 0.5, verticalAlign: 'middle' }} />
                      </Tooltip>
                    )}
                  </TableCell>

                  <TableCell sx={TD_SX}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#3B1F0A', fontWeight: 500 }}>{fmtDate(b.date)}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#9A7A5A', mt: 0.25 }}>{b.location}</Typography>
                  </TableCell>

                  <TableCell sx={TD_SX}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(m => (b.meals[m] ?? 0) > 0 ? <MealBadge key={m} meal={m} count={b.meals[m]} /> : null)}
                    </Box>
                  </TableCell>

                  <TableCell sx={TD_SX}>
                    <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 700, color: SAFFRON }}>₹{b.total}/-</Typography>
                  </TableCell>

                  <TableCell sx={{ ...TD_SX, color: '#9A7A5A', whiteSpace: 'nowrap' }}>{fmtDate(b.submitted ?? b.createdAt)}</TableCell>

                  {/* Proof icon */}
                  <TableCell sx={TD_SX}>
                    <Tooltip title={b.paymentProof ? 'View proof & take action' : 'No proof uploaded'}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => setProofBooking(b)}
                          sx={{
                            width: 34, height: 34, borderRadius: '8px',
                            border: b.paymentProof
                              ? `1.5px solid ${SAFFRON}`
                              : '1.5px solid #E8D8C0',
                            color: b.paymentProof ? SAFFRON : '#C0B090',
                            bgcolor: b.paymentProof ? SAFFRON_PALE : 'transparent',
                            '&:hover': { bgcolor: b.paymentProof ? '#FDDCC4' : '#F5F0EA' },
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>

                  <TableCell sx={TD_SX}><StatusPill s={b.status} /></TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 1.25, borderTop: '1px solid #F2E8D8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#9A7A5A' }}>
            {bookings.length} submission{bookings.length !== 1 ? 's' : ''}
          </Typography>
          {summary.pending > 0 && (
            <Chip label={`${summary.pending} pending review`} size="small" sx={{ bgcolor: GOLD_PALE, color: GOLD, fontWeight: 600, fontSize: '0.72rem', borderRadius: '50px' }} />
          )}
        </Box>

      </Card>

      {/* Proof viewer modal */}
      <ProofModal
        booking={proofBooking}
        open={!!proofBooking}
        onClose={() => setProofBooking(null)}
      />

    </Box>
  );
}
