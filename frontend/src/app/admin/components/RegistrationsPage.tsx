'use client';
import { useState, useMemo } from 'react';
import { useGetRegistrationsQuery } from '@/services/registrationsApi';
import { CLR, pill } from './shared';

// MUI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';

const SAFFRON      = '#E8621A';
const SAFFRON_DARK = '#C44D0D';
const SAFFRON_PALE = '#FEF0E6';
const GOLD         = '#C9920A';
const GOLD_PALE    = '#FFF9E6';

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

type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
const ALL_MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];

function mealMuiIcon(meal: MealType) {
  if (meal === 'Breakfast') return <FreeBreakfastIcon sx={{ fontSize: 14 }} />;
  if (meal === 'Lunch')     return <WbSunnyIcon       sx={{ fontSize: 14 }} />;
  return                           <NightlightIcon    sx={{ fontSize: 14 }} />;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toYMD(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

interface CalendarValue {
  mode: 'single' | 'range';
  single: string;
  from: string;
  to: string;
}

// ── Calendar Modal ─────────────────────────────────────────────────────────────
function CalendarModal({
  open,
  initial,
  onApply,
  onClose,
}: {
  open: boolean;
  initial: CalendarValue;
  onApply: (val: CalendarValue) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [mode,      setMode]      = useState<'single' | 'range'>(initial.mode);
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [single,    setSingle]    = useState(initial.single);
  const [from,      setFrom]      = useState(initial.from);
  const [to,        setTo]        = useState(initial.to);

  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

  const cells = useMemo(() => {
    const arr: (number | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [viewYear, viewMonth, daysInMonth, firstWeekday]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function clickDay(d: number) {
    const key = toYMD(viewYear, viewMonth, d);
    if (mode === 'single') {
      setSingle(key);
    } else {
      if (!from || (from && to)) {
        // start fresh range
        setFrom(key); setTo('');
      } else {
        // second click — set end (swap if needed)
        if (key < from) { setTo(from); setFrom(key); }
        else             { setTo(key); }
      }
    }
  }

  function handleClear() {
    setSingle(''); setFrom(''); setTo('');
  }

  function handleApply() {
    onApply({ mode, single, from, to });
  }

  const todayKey = toYMD(today.getFullYear(), today.getMonth(), today.getDate());

  function dayStyle(d: number) {
    const key    = toYMD(viewYear, viewMonth, d);
    const isToday = key === todayKey;

    if (mode === 'single') {
      const isSel = key === single;
      return { isSel, inRange: false, isStart: false, isEnd: false, isToday };
    }
    const isStart = key === from;
    const isEnd   = key === to;
    const inRange = from && to ? key > from && key < to : false;
    const isSel   = isStart || isEnd;
    return { isSel, inRange, isStart, isEnd, isToday };
  }

  const hasSelection = mode === 'single' ? !!single : !!from;

  const selectionLabel = mode === 'single' && single
    ? new Date(single + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : from && to
    ? `${new Date(from + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → ${new Date(to + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : from
    ? `${new Date(from + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} → pick end date`
    : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '18px', overflow: 'hidden' } } }}
    >
      {/* Header */}
      <DialogTitle sx={{
        background: `linear-gradient(135deg, #3B1F0A, #5A3A1A)`,
        color: '#fff', py: 2, px: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon sx={{ fontSize: 20 }} />
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', fontWeight: 700 }}>
            Filter by Date
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>

        {/* Mode toggle */}
        <Box sx={{ px: 3, pt: 2.5, pb: 1.5, borderBottom: '1px solid #F2E8D8' }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => { if (v) { setMode(v); handleClear(); } }}
            size="small"
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                border: '1.5px solid #E8D8C0', textTransform: 'none',
                fontSize: '0.82rem', fontWeight: 600, color: '#9A7A5A',
                '&.Mui-selected': { bgcolor: SAFFRON_PALE, color: SAFFRON_DARK, borderColor: SAFFRON },
              },
            }}
          >
            <ToggleButton value="single">Single Date</ToggleButton>
            <ToggleButton value="range">Date Range</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Month navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5 }}>
          <IconButton size="small" onClick={prevMonth} sx={{ color: SAFFRON_DARK, '&:hover': { bgcolor: SAFFRON_PALE } }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#3B1F0A' }}>
            {MONTHS[viewMonth]} {viewYear}
          </Typography>
          <IconButton size="small" onClick={nextMonth} sx={{ color: SAFFRON_DARK, '&:hover': { bgcolor: SAFFRON_PALE } }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Weekday headers */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', px: 1.5, mb: 0.5 }}>
          {DAYS.map(d => (
            <Typography key={d} sx={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#9A7A5A', letterSpacing: '0.06em', py: 0.5 }}>
              {d}
            </Typography>
          ))}
        </Box>

        {/* Day grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', px: 1.5, pb: 1 }}>
          {cells.map((d, i) => {
            if (d === null) return <Box key={`e-${i}`} />;
            const { isSel, inRange, isStart, isEnd, isToday } = dayStyle(d);
            return (
              <Box
                key={`${viewYear}-${viewMonth}-${d}`}
                onClick={() => clickDay(d)}
                sx={{
                  textAlign: 'center', py: 0.875, cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: isSel ? 700 : isToday ? 600 : 400,
                  bgcolor: isSel ? SAFFRON : inRange ? `${SAFFRON}22` : 'transparent',
                  color: isSel ? '#fff' : isToday ? SAFFRON_DARK : '#3B1F0A',
                  border: isToday && !isSel ? `1.5px solid ${SAFFRON}` : '1.5px solid transparent',
                  borderRadius: isStart ? '8px 0 0 8px' : isEnd ? '0 8px 8px 0' : inRange ? '0' : '8px',
                  transition: 'all 0.12s',
                  '&:hover': { bgcolor: isSel ? SAFFRON_DARK : SAFFRON_PALE, borderRadius: '8px' },
                  mx: inRange || isStart || isEnd ? 0 : 0.25,
                  my: 0.25,
                }}
              >
                {d}
              </Box>
            );
          })}
        </Box>

        {/* Selection label */}
        {selectionLabel && (
          <Box sx={{ px: 2.5, pb: 2, pt: 1, borderTop: '1px solid #F2E8D8' }}>
            <Chip
              label={selectionLabel}
              size="small"
              sx={{ bgcolor: SAFFRON_PALE, color: SAFFRON_DARK, fontWeight: 600, fontSize: '0.75rem' }}
            />
            {mode === 'range' && from && !to && (
              <Typography sx={{ fontSize: '0.7rem', color: '#9A7A5A', mt: 0.75 }}>
                Click another date to set the end of the range
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F2E8D8', gap: 1 }}>
        <Button size="small" onClick={handleClear} sx={{ color: '#9A7A5A', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
          Clear
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button size="small" onClick={onClose} variant="outlined"
          sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', borderColor: '#E8D8C0', color: '#9A7A5A', borderRadius: '8px' }}>
          Cancel
        </Button>
        <Button size="small" onClick={handleApply} variant="contained"
          disabled={!hasSelection}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', bgcolor: SAFFRON, borderRadius: '8px', '&:hover': { bgcolor: SAFFRON_DARK }, '&.Mui-disabled': { opacity: 0.45 } }}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const EMPTY_CAL: CalendarValue = { mode: 'single', single: '', from: '', to: '' };

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RegistrationsPage() {
  const [search,    setSearch]    = useState('');
  const [filterLoc, setFilterLoc] = useState('');
  const [calOpen,   setCalOpen]   = useState(false);
  const [calValue,  setCalValue]  = useState<CalendarValue>(EMPTY_CAL);

  const hasDateFilter = calValue.mode === 'single' ? !!calValue.single : !!calValue.from;

  const { data, isLoading } = useGetRegistrationsQuery({
    search:   search || undefined,
    location: filterLoc || undefined,
    ...(calValue.mode === 'single' && calValue.single
      ? { date: calValue.single }
      : calValue.mode === 'range' && calValue.from
      ? { dateFrom: calValue.from, dateTo: calValue.to || undefined }
      : {}),
  });

  const bookings     = data?.data ?? [];
  const totalCoupons = data?.meta.totalCoupons ?? 0;
  const totalCount   = data?.meta.count ?? 0;
  const hasFilters   = !!(search || filterLoc || hasDateFilter);

  function clearAll() {
    setSearch(''); setFilterLoc(''); setCalValue(EMPTY_CAL);
  }

  return (
    <Box>
      {/* ── PAGE HEADER ── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <ListAltIcon sx={{ color: SAFFRON_DARK, fontSize: 28 }} />
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.9rem', fontWeight: 700, color: SAFFRON_DARK }}>
            Registrations
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.85rem', color: '#9A7A5A' }}>
          {totalCount} confirmed registration{totalCount !== 1 ? 's' : ''} · {totalCoupons} coupons total
        </Typography>
      </Box>

      {/* ── MAIN CARD ── */}
      <Card elevation={0} sx={{ border: '1.5px solid #FEF0E6', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(232,98,26,0.07)' }}>

        {/* ── FILTERS BAR ── */}
        <Box sx={{ display: 'flex', gap: 1.5, px: 3, py: 2, bgcolor: '#FBF6EE', borderBottom: '1.5px solid #F2E8D8', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Search */}
          <TextField
            size="small"
            placeholder="Search name or mobile…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#9A7A5A' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              minWidth: 220,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px', bgcolor: '#fff', fontSize: '0.83rem',
                '& fieldset': { borderColor: '#E8D8C0' },
                '&:hover fieldset': { borderColor: SAFFRON },
                '&.Mui-focused fieldset': { borderColor: SAFFRON },
              },
            }}
          />

          {/* Location */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ fontSize: '0.83rem', color: '#9A7A5A' }}>Location</InputLabel>
            <Select
              label="Location"
              value={filterLoc}
              onChange={e => setFilterLoc(e.target.value)}
              sx={{ borderRadius: '8px', bgcolor: '#fff', fontSize: '0.83rem', '& fieldset': { borderColor: '#E8D8C0' } }}
            >
              <MenuItem value="">All Locations</MenuItem>
              <MenuItem value="Thiruvanmiyur">Thiruvanmiyur</MenuItem>
              <MenuItem value="NLBR">NLBR</MenuItem>
            </Select>
          </FormControl>

          {/* Calendar button */}
          <Button
            size="small"
            variant={hasDateFilter ? 'contained' : 'outlined'}
            startIcon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
            onClick={() => setCalOpen(true)}
            sx={{
              textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
              borderRadius: '8px', px: 2,
              ...(hasDateFilter
                ? { bgcolor: SAFFRON, '&:hover': { bgcolor: SAFFRON_DARK } }
                : { borderColor: '#E8D8C0', color: '#9A7A5A', '&:hover': { bgcolor: SAFFRON_PALE, borderColor: SAFFRON } }
              ),
            }}
          >
            {hasDateFilter
              ? calValue.mode === 'single'
                ? new Date(calValue.single + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : calValue.to
                ? `${new Date(calValue.from + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → ${new Date(calValue.to + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                : `From ${new Date(calValue.from + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
              : 'Filter by Date'}
          </Button>

          {/* Clear all */}
          {hasFilters && (
            <Button
              size="small"
              startIcon={<FilterListOffIcon sx={{ fontSize: 16 }} />}
              onClick={clearAll}
              sx={{
                color: SAFFRON_DARK, fontSize: '0.78rem', textTransform: 'none', fontWeight: 600,
                border: '1.5px solid rgba(232,98,26,0.3)', borderRadius: '50px', px: 2,
                '&:hover': { bgcolor: SAFFRON_PALE },
              }}
            >
              Clear all
            </Button>
          )}

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip
              label={isLoading ? 'Loading…' : `${totalCount} record${totalCount !== 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: SAFFRON_PALE, color: SAFFRON_DARK, fontWeight: 600, fontSize: '0.72rem', borderRadius: '50px' }}
            />
            <Chip
              label={`${totalCoupons} coupons`}
              size="small"
              sx={{ bgcolor: GOLD_PALE, color: GOLD, fontWeight: 600, fontSize: '0.72rem', borderRadius: '50px', border: `1px solid #E8C54A` }}
            />
          </Box>
        </Box>

        {/* ── TABLE ── */}
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: SAFFRON_PALE }}>
                {['Coupon ID', 'Booking ID', 'Name', 'Mobile', 'Location', 'Meals', 'Date', 'Qty', 'Approved At'].map(h => (
                  <TableCell key={h} sx={TH_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: SAFFRON }} />
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#9A7A5A', fontSize: '0.85rem' }}>
                    No registrations found.
                  </TableCell>
                </TableRow>
              ) : bookings.map(b => {
                const tot = b.meals.Breakfast + b.meals.Lunch + b.meals.Dinner;
                const activeMeals = ALL_MEALS.filter(m => b.meals[m] > 0);
                return (
                  <TableRow key={b.id} sx={{ '&:hover td': { bgcolor: '#FDFAF4' }, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={TD_SX}><span style={pill(GOLD, GOLD_PALE)}>{b.id}</span></TableCell>
                    <TableCell sx={TD_SX}><span style={pill('#5A3A1A', '#FDE8D8')}>{b.bookingId}</span></TableCell>
                    <TableCell sx={{ ...TD_SX, fontWeight: 600 }}>{b.name}</TableCell>
                    <TableCell sx={{ ...TD_SX, color: '#9A7A5A' }}>{b.mobile}</TableCell>
                    <TableCell sx={TD_SX}>
                      <span style={pill(
                        b.location === 'Thiruvanmiyur' ? CLR.saffronDark : CLR.brownMid,
                        b.location === 'Thiruvanmiyur' ? CLR.saffronPale : '#FDE8D8',
                      )}>{b.location}</span>
                    </TableCell>
                    <TableCell sx={TD_SX}>
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
                    <TableCell sx={{ ...TD_SX, color: '#9A7A5A', whiteSpace: 'nowrap' }}>
                      {new Date(b.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.83rem', color: '#3B1F0A' }}>{tot}</Typography>
                        {tot >= 10 && (
                          <Box component="span" sx={{ fontSize: '0.6rem', fontWeight: 700, color: SAFFRON_DARK, bgcolor: SAFFRON_PALE, px: 0.75, py: 0.2, borderRadius: '4px', letterSpacing: '0.04em' }}>
                            BULK
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, color: '#9A7A5A', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                      {b.updatedAt ? new Date(b.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>

        {/* ── FOOTER ── */}
        <Box sx={{ px: 3, py: 1.25, borderTop: '1px solid #F2E8D8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#9A7A5A' }}>
            {totalCount} registration{totalCount !== 1 ? 's' : ''}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#9A7A5A' }}>
            {totalCoupons} coupons
          </Typography>
        </Box>
      </Card>

      {/* Calendar modal */}
      <CalendarModal
        open={calOpen}
        initial={calValue}
        onApply={(val) => { setCalValue(val); setCalOpen(false); }}
        onClose={() => setCalOpen(false)}
      />
    </Box>
  );
}
