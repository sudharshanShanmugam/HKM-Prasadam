'use client';

import { useState } from 'react';
import { useGetSlotMapQuery } from '@/services/slotDatesApi';
import PaymentPage from './PaymentPage';
import { useGetMealMenusQuery } from '@/services/mealMenusApi';
import { useCreatePrasadamBookingMutation, useGetPrasadamBookingsQuery } from '@/services/prasadamBookingsApi';
import { useCreatePartyEnquiryMutation, useGetPartyEnquiriesQuery } from '@/services/partyEnquiriesApi';
import type { MealType, CreatePrasadamBookingDto, CreatePartyEnquiryDto } from '@/types';

// MUI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { QRCodeSVG } from 'qrcode.react';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PrintIcon from '@mui/icons-material/Print';
import type { PrasadamBooking } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────
const S  = '#E8621A';
const SD = '#C44D0D';
const SP = '#FEF0E6';
const GOLD      = '#C9920A';
const GOLD_PALE = '#FFF9E6';
const CREAM     = '#FBF6EE';
const BROWN     = '#3B1F0A';
const BROWN_MID = '#6B3A1F';
const TXT_MID   = '#5A3A1A';
const TXT_LIGHT = '#9A7A5A';
const BORDER    = '#E8D8C0';
const GREEN     = '#2D7A3A';
const GREEN_PALE = '#EBF7ED';
const RED       = '#C0392B';
const RED_PALE  = '#FDECEA';

const HEADER_H = 68;
const PRICE: Record<MealType, number> = { Breakfast: 20, Lunch: 40, Dinner: 35 };

type View = 'landing' | 'register' | 'payment' | 'success' | 'bookings' | 'birthday' | 'bdy-success';
type BkTab = 'coupons' | 'birthday';

function mealIcon(m: MealType) {
  if (m === 'Breakfast') return <FreeBreakfastIcon sx={{ fontSize: 15, color: S }} />;
  if (m === 'Lunch')     return <WbSunnyIcon       sx={{ fontSize: 15, color: GOLD }} />;
  return                        <NightlightIcon    sx={{ fontSize: 15, color: '#7C3AED' }} />;
}

function fmtDate(d: string) {
  try { return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '9px', fontSize: '0.88rem', bgcolor: '#FDFAF6',
    '& fieldset': { borderColor: BORDER },
    '&:hover fieldset': { borderColor: S },
    '&.Mui-focused fieldset': { borderColor: S },
  },
  '& .MuiInputLabel-root': { fontSize: '0.83rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: SD },
};

// ─── Public Page ──────────────────────────────────────────────────────────────
export default function PublicPage() {
  const { data: slotMap = {} } = useGetSlotMapQuery();
  const { data: menuMap = {} } = useGetMealMenusQuery();
  const [createBooking, { isLoading: bookingLoading }] = useCreatePrasadamBookingMutation();
  const [createEnquiry, { isLoading: enquiryLoading }] = useCreatePartyEnquiryMutation();

  const [view, setView]           = useState<View>('landing');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Registration form
  const [regName,   setRegName]   = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail,  setRegEmail]  = useState('');
  const [regLoc,    setRegLoc]    = useState<'Thiruvanmiyur' | 'NLBR' | ''>('');
  const [regDate,   setRegDate]   = useState('');
  const [regMeals,  setRegMeals]  = useState<Record<MealType, number>>({ Breakfast: 0, Lunch: 0, Dinner: 0 });
  const [menuModal, setMenuModal] = useState<{ meal: MealType; text: string } | null>(null);
  const [successId, setSuccessId] = useState('');
  const [payProof,  setPayProof]  = useState<File | null>(null);

  const availDates    = Object.keys(slotMap).sort();
  const selectedMeals = regDate ? (slotMap[regDate] ?? []) : [];
  const totalCoupons  = Object.values(regMeals).reduce((a, b) => a + b, 0);
  const totalAmount   = (Object.entries(regMeals) as [MealType, number][]).reduce((s, [m, q]) => s + PRICE[m] * q, 0);

  function proceedToPayment() {
    if (!regName || !regMobile || !regLoc || !regDate) { alert('Please fill all required fields'); return; }
    if (!/^\d{10}$/.test(regMobile)) { alert('Enter a valid 10-digit mobile'); return; }
    if (totalCoupons < 1) { alert('Select at least 1 coupon'); return; }
    setPayProof(null); goTo('payment');
  }

  async function confirmPayment() {
    if (!payProof) { alert('Please upload your payment screenshot'); return; }
    const paymentProof = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(payProof);
    });
    const dto: CreatePrasadamBookingDto = { name: regName, mobile: regMobile, email: regEmail, location: regLoc as 'Thiruvanmiyur' | 'NLBR', date: regDate, meals: regMeals, total: totalAmount, paymentProof };
    const res = await createBooking(dto);
    if ('data' in res && res.data) { setSuccessId(res.data.id); goTo('success'); }
  }

  // My bookings
  const [bkInput,  setBkInput]  = useState('');
  const [bkMobile, setBkMobile] = useState<string | null>(null);
  const [bkTab,    setBkTab]    = useState<BkTab>('coupons');
  const [couponBooking, setCouponBooking] = useState<PrasadamBooking | null>(null);
  const { data: myBookings  = [] } = useGetPrasadamBookingsQuery({ mobile: bkMobile ?? '' }, { skip: !bkMobile });
  const { data: myEnquiries = [] } = useGetPartyEnquiriesQuery({ mobile: bkMobile ?? '' }, { skip: !bkMobile });

  // Birthday form
  const [bdyName,    setBdyName]    = useState('');
  const [bdyMobile,  setBdyMobile]  = useState('');
  const [bdyEmail,   setBdyEmail]   = useState('');
  const [bdyDate,    setBdyDate]    = useState('');
  const [bdyAddress, setBdyAddress] = useState('');
  const [bdyMeals,   setBdyMeals]   = useState<Record<MealType, number>>({ Breakfast: 0, Lunch: 0, Dinner: 0 });
  const [bdyMenu,    setBdyMenu]    = useState('');
  const [bdyPrice,   setBdyPrice]   = useState('');
  const [bdySuccessId, setBdySuccessId] = useState('');

  async function submitBdy() {
    if (!bdyName || !bdyMobile || !bdyDate || !bdyAddress) { alert('Please fill all required fields'); return; }
    if (!/^\d{10}$/.test(bdyMobile)) { alert('Enter a valid 10-digit mobile'); return; }
    const dto: CreatePartyEnquiryDto = { name: bdyName, mobile: bdyMobile, email: bdyEmail, eventDate: bdyDate, address: bdyAddress, meals: bdyMeals, preferredMenu: bdyMenu, preferredPrice: bdyPrice ? Number(bdyPrice) : undefined };
    const res = await createEnquiry(dto);
    if ('data' in res && res.data) { setBdySuccessId(res.data.id); goTo('bdy-success'); }
  }

  function goTo(v: View) {
    setView(v); setMobileOpen(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }

  const minBdyDate = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); })();

  // ── NAV ITEMS ──
  const navItems = [
    { label: 'Home',             action: () => goTo('landing') },
    { label: 'Donate',           action: () => { goTo('landing'); setTimeout(() => document.getElementById('seva-section')?.scrollIntoView({ behavior: 'smooth' }), 50); } },
    { label: 'About',            action: () => { goTo('landing'); setTimeout(() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' }), 50); } },
    { label: 'Prasadam Coupons', action: () => goTo('register') },
    { label: 'My Bookings',      action: () => goTo('bookings') },
    { label: 'Party Booking', action: () => goTo('birthday') },
  ];

  // ── HEADER ──
  const header = (
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
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }} onClick={() => goTo('landing')}>
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
  );

  // ── MOBILE DRAWER ──
  const mobileDrawer = (
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
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LANDING PAGE
  // ─────────────────────────────────────────────────────────────────────────────
  const landingView = (
    <Box>
      {/* ── HERO ── */}
      <Box component="section" sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pt: `${HEADER_H + 60}px`, pb: 10, px: 5,
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.55) 0%, transparent 60%)',
          pointerEvents: 'none',
        },
      }}>
        <Box sx={{ maxWidth: 660, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* ISKCON Logo */}
          <Box component="img" src="/iskcon-logo.png" alt="ISKCON Thiruvanmiyur Chennai" sx={{ height: 90, display: 'block', mx: 'auto', mb: 4.5, objectFit: 'contain' }} />

          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: { xs: '2.6rem', md: '4rem' }, fontWeight: 700, color: BROWN, lineHeight: 1.05, mb: 1.25 }}>
            Prasadam Seva
          </Typography>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: S, mb: 2.25, letterSpacing: '0.01em' }}>
            Serve with Devotion
          </Typography>
          <Typography sx={{ fontSize: '0.97rem', color: '#888', lineHeight: 1.75, maxWidth: 480, mx: 'auto', mb: 4.5 }}>
            Offer prasadam and receive Krishna&apos;s blessings. Every meal served is an act of love and devotion.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.75, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button onClick={() => goTo('register')} sx={{
              px: 4.25, py: 1.75, borderRadius: '50px', border: 'none',
              bgcolor: S, color: '#fff', fontSize: '0.95rem', fontWeight: 700,
              boxShadow: '0 6px 20px rgba(232,98,26,0.35)',
              textTransform: 'none',
              '&:hover': { bgcolor: SD, transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(232,98,26,0.45)' },
              transition: 'all 0.2s',
            }}>
              🙏 Donate Now
            </Button>
            <Button onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })} sx={{
              px: 4.25, py: 1.75, borderRadius: '50px',
              bgcolor: '#fff', color: BROWN, fontSize: '0.95rem', fontWeight: 600,
              border: '1.5px solid rgba(0,0,0,0.1)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
              textTransform: 'none',
              '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
              transition: 'all 0.2s',
            }}>
              Learn More
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── WAYS TO SERVE ── */}
      <Box component="section" sx={{ py: 11, px: { xs: 2.5, md: 5 }, bgcolor: '#FDFAF4' }}>
        <Box sx={{ textAlign: 'center', mb: 6.5 }}>
          <Box component="span" sx={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: S, bgcolor: SP, px: 1.75, py: 0.5, borderRadius: '50px', mb: 1.75 }}>
            How to Participate
          </Box>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', color: BROWN, mb: 1.25 }}>
            Ways to Serve
          </Typography>
          <Typography sx={{ fontSize: '0.92rem', color: TXT_LIGHT, lineHeight: 1.7, maxWidth: 520, mx: 'auto' }}>
            Choose how you&apos;d like to contribute towards Krishna&apos;s prasadam seva
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.75, maxWidth: 1100, mx: 'auto' }}>
          {[
            { icon: '🍛', title: 'Annadanam Seva',    desc: 'Sponsor daily prasadam for devotees and guests visiting the temple.',                              bg: SP },
            { icon: '', title: 'Festival Seva',      desc: 'Contribute towards grand festival prasadam during Janmashtami, Gaura Purnima & more.',           bg: GOLD_PALE },
            { icon: '🌿', title: 'Daily Seva',         desc: 'Support the daily operations of the temple kitchen serving hundreds every day.',                  bg: GREEN_PALE },
            { icon: '🤝', title: 'Community Feeding',  desc: 'Help us serve free meals to the underprivileged through our food distribution programs.',         bg: RED_PALE },
          ].map(c => (
            <Card key={c.title} elevation={0} sx={{
              bgcolor: '#fff', border: `1px solid ${BORDER}`, borderRadius: '18px',
              p: 0, overflow: 'hidden', transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
              boxShadow: '0 2px 12px rgba(60,20,0,0.05)',
              position: 'relative',
              '&::before': {
                content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: `linear-gradient(to right, ${S}, ${GOLD})`,
                transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s ease',
              },
              '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 40px rgba(232,98,26,0.13)', borderColor: S },
              '&:hover::before': { transform: 'scaleX(1)' },
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{
                  width: 62, height: 62, borderRadius: '16px', bgcolor: c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.7rem', mb: 2.5,
                  boxShadow: '0 4px 14px rgba(60,20,0,0.08)',
                }}>
                  {c.icon}
                </Box>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: BROWN, mb: 1.25 }}>
                  {c.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: TXT_LIGHT, lineHeight: 1.65 }}>
                  {c.desc}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* ── SEVA QUOTE ── */}
      <Box component="section" id="seva-section" sx={{
        py: 11, px: 5, textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)',
        '&::before': {
          content: '"✦  ॐ  ✦"', position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
          fontSize: '0.75rem', letterSpacing: '0.3em', color: 'rgba(180,90,20,0.2)',
        },
      }}>
        <Box sx={{ maxWidth: 680, mx: 'auto', position: 'relative' }}>
          <Box component="span" sx={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: S, mb: 3 }}>
            Start Your Seva
          </Box>
          <Box sx={{ width: 48, height: 2, background: `linear-gradient(to right, ${S}, ${GOLD})`, borderRadius: 1, mx: 'auto', mb: 3.5 }} />
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.65rem', fontStyle: 'italic', color: BROWN, lineHeight: 1.65, maxWidth: 560, mx: 'auto', mb: 2 }}>
            &ldquo;If one offers Me with love and devotion a leaf, a flower, a fruit, or water, I will accept it.&rdquo;
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: TXT_LIGHT, letterSpacing: '0.06em', mb: 4 }}>
            — Bhagavad Gita 9.26
          </Typography>
          <Button onClick={() => goTo('register')} sx={{
            px: 5, py: 1.75, borderRadius: '50px', border: 'none',
            bgcolor: S, color: '#fff', fontSize: '0.95rem', fontWeight: 700,
            boxShadow: '0 6px 20px rgba(232,98,26,0.3)', textTransform: 'none',
            '&:hover': { bgcolor: SD, transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(232,98,26,0.4)' },
            transition: 'all 0.2s',
          }}>
            🙏 Book Prasadam Coupon
          </Button>
        </Box>
      </Box>

      {/* ── ABOUT ── */}
      <Box component="section" id="about-section" sx={{ py: 11, px: { xs: 2.5, md: 5 }, bgcolor: CREAM }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 4.5, md: 8 }, alignItems: 'center' }}>
          <Box>
            <Box component="span" sx={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: S, bgcolor: SP, px: 1.75, py: 0.5, borderRadius: '50px', mb: 1.75 }}>
              About Us
            </Box>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: BROWN, mb: 2.25 }}>
              About HKM Chennai
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: TXT_MID, lineHeight: 1.8, mb: 2 }}>
              Hare Krishna Movement Chennai is dedicated to propagating the teachings of Lord Sri Krishna as presented in the Bhagavad Gita and Srimad Bhagavatam.
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', color: TXT_MID, lineHeight: 1.8, mb: 4 }}>
              Through our Annadanam program, we serve nutritious and delicious prasadam to devotees, visitors, and the underprivileged.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.75 }}>
              {[['500+', 'Meals Daily'], ['2', 'HKM Centres'], ['365', 'Days a Year']].map(([n, l]) => (
                <Box key={l} sx={{
                  textAlign: 'center', bgcolor: '#fff', border: `1px solid ${BORDER}`,
                  borderRadius: '14px', py: 2.25, px: 1.5, position: 'relative', overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(60,20,0,0.05)',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(to right, ${S}, ${GOLD})` },
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(232,98,26,0.12)' },
                }}>
                  <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 700, color: S }}>
                    {n}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: TXT_LIGHT, mt: 0.5, fontWeight: 500 }}>
                    {l}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{
            background: `linear-gradient(135deg, ${SP} 0%, ${GOLD_PALE} 100%)`,
            border: `1.5px solid rgba(232,98,26,0.18)`,
            borderRadius: '24px', overflow: 'hidden',
            aspectRatio: '4/3',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, px: 4,
            boxShadow: '0 8px 32px rgba(232,98,26,0.1)',
            position: 'relative',
            '&::before': {
              content: '""', position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.5) 0%, transparent 60%)',
              pointerEvents: 'none',
            },
          }}>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: BROWN_MID, textAlign: 'center', lineHeight: 1.6 }}>
              Hare Krishna Hare Krishna<br />
              Krishna Krishna Hare Hare<br />
              Hare Rama Hare Rama<br />
              Rama Rama Hare Hare
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── FOOTER ── */}
      <Box component="footer" sx={{ bgcolor: BROWN, pt: 6.5, pb: 3.5, px: { xs: 2.5, md: 5 }, borderTop: `4px solid ${S}` }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr' }, gap: { xs: 4, md: 6 }, pb: 4.5, borderBottom: '1px solid rgba(255,255,255,0.08)', mb: 3 }}>
          <Box>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: '#fff', mb: 1 }}>
              Hare Krishna Movement Chennai
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', maxWidth: 280, mb: 2.5 }}>
              Spreading the message of Bhagavad Gita and Srimad Bhagavatam.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                [<EmailIcon sx={{ fontSize: 14 }} />, 'krishnamrita@hkmchennai.org'],
                [<PhoneIcon sx={{ fontSize: 14 }} />, '7418420108'],
                [<LocationOnIcon sx={{ fontSize: 14 }} />, 'Hare Krishna Movement Chennai'],
              ].map(([icon, text], i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.125, fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
                  {icon}<Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', mb: 1.75 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.125 }}>
              {[['Home', () => goTo('landing')], ['Donate', () => goTo('register')], ['Prasadam Coupons', () => goTo('register')]].map(([label, action]) => (
                <Button key={String(label)} onClick={action as () => void} sx={{
                  p: 0, justifyContent: 'flex-start', minWidth: 0,
                  fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)',
                  textTransform: 'none', textAlign: 'left',
                  '&:hover': { color: '#F0C842', bgcolor: 'transparent' },
                }}>
                  {String(label)}
                </Button>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', mb: 1.75 }}>
              Our Centres
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.125, mb: 3 }}>
              {['HKM Thiruvanmiyur', 'HKM NLBR'].map(c => (
                <Typography key={c} sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>{c}</Typography>
              ))}
            </Box>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', mb: 1.75 }}>
              Admin
            </Typography>
            <Button onClick={() => window.location.href = '/admin'} sx={{
              p: 0, justifyContent: 'flex-start', minWidth: 0,
              fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)',
              textTransform: 'none',
              '&:hover': { color: '#F0C842', bgcolor: 'transparent' },
            }}>
              🔐 Admin Panel
            </Button>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
            © 2026 Hare Krishna Movement Chennai. All rights reserved.
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
            Hare Krishna
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // REGISTER VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  const registerView = (
    <Box sx={{
      minHeight: '100vh', pt: `${HEADER_H}px`,
      background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)',
    }}>
      {/* Page header */}
      <Box sx={{ textAlign: 'center', pt: 4.5, pb: 1, px: 5 }}>
        <Box component="img" src="/iskcon-logo.png" alt="ISKCON Thiruvanmiyur Chennai" sx={{ height: 64, display: 'block', mx: 'auto', mb: 2.75, objectFit: 'contain' }} />
        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', fontWeight: 700, color: BROWN, mb: 1 }}>
          Prasadam Coupon Booking
        </Typography>
        <Typography sx={{ fontSize: '0.88rem', color: '#888' }}>
          Fill in your details to reserve your sacred meal coupon
        </Typography>
      </Box>

      {/* Form card */}
      <Box sx={{ maxWidth: 680, mx: 'auto', px: 2.5, pt: 3.5, pb: 6 }}>
        <Box sx={{
          bgcolor: '#fff', borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(60,20,0,0.1)',
          p: { xs: '22px 18px', sm: '32px 36px' },
          border: '1px solid rgba(232,98,26,0.12)',
          position: 'relative',
          '&::before': {
            content: '""', position: 'absolute', top: 0, left: 0, right: 0,
            height: '4px', borderRadius: '20px 20px 0 0',
            background: `linear-gradient(to right, ${S}, ${GOLD})`,
          },
        }}>
          {/* Step 1 */}
          <Box sx={{ mb: 1 }}>
            <Box component="span" sx={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', bgcolor: SP, color: SD, px: 1.5, py: 0.4, borderRadius: '50px' }}>
              Step 1 — Personal Details
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <TextField fullWidth size="small" label="Full Name *"
              placeholder="e.g. Radhakrishna Das" value={regName} onChange={e => setRegName(e.target.value)} sx={FIELD_SX} />
            <TextField fullWidth size="small" label="Mobile Number *"
              placeholder="10-digit mobile" slotProps={{ htmlInput: { maxLength: 10 } }}
              value={regMobile} onChange={e => setRegMobile(e.target.value.replace(/\D/g, ''))} sx={FIELD_SX} />
          </Box>
          <TextField fullWidth size="small" label="Email Address"
            placeholder="e.g. devotee@example.com" type="email"
            value={regEmail} onChange={e => setRegEmail(e.target.value)} sx={{ mb: 2, ...FIELD_SX }} />

          <Divider sx={{ borderColor: BORDER, my: 2.5 }} />

          {/* Step 2 */}
          <Box sx={{ mb: 1 }}>
            <Box component="span" sx={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', bgcolor: SP, color: SD, px: 1.5, py: 0.4, borderRadius: '50px' }}>
              Step 2 — Location
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            {(['Thiruvanmiyur', 'NLBR'] as const).map(loc => (
              <Box
                key={loc}
                onClick={() => setRegLoc(loc)}
                sx={{
                  flex: 1, py: 1.5, px: 2, borderRadius: '10px', cursor: 'pointer',
                  border: `1.5px solid ${regLoc === loc ? S : BORDER}`,
                  bgcolor: regLoc === loc ? SP : '#fff',
                  textAlign: 'center', transition: 'all 0.18s',
                  '&:hover': { borderColor: S, bgcolor: SP },
                }}
              >
                <Typography sx={{ fontSize: '0.85rem', fontWeight: regLoc === loc ? 700 : 500, color: regLoc === loc ? SD : TXT_MID }}>
                  📍 HKM {loc}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor: BORDER, my: 2.5 }} />

          {/* Step 3 */}
          <Box sx={{ mb: 1 }}>
            <Box component="span" sx={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', bgcolor: SP, color: SD, px: 1.5, py: 0.4, borderRadius: '50px' }}>
              Step 3 — Date
            </Box>
          </Box>
          <FormControl fullWidth size="small" sx={{ mb: 2, ...FIELD_SX }}>
            <InputLabel sx={{ fontSize: '0.83rem' }}>Event Date *</InputLabel>
            <Select label="Event Date *" value={regDate}
              onChange={e => { setRegDate(e.target.value); setRegMeals({ Breakfast: 0, Lunch: 0, Dinner: 0 }); }}
              sx={{ borderRadius: '9px', fontSize: '0.88rem', bgcolor: '#FDFAF6', '& fieldset': { borderColor: BORDER } }}>
              <MenuItem value=""><em>— Select an available date —</em></MenuItem>
              {availDates.map(d => (
                <MenuItem key={d} value={d}>
                  {new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Step 4 — only when date selected */}
          {regDate && (
            <>
              <Divider sx={{ borderColor: BORDER, my: 2.5 }} />
              <Box sx={{ mb: 1 }}>
                <Box component="span" sx={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', bgcolor: SP, color: SD, px: 1.5, py: 0.4, borderRadius: '50px' }}>
                  Step 4 — Coupons per Meal
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 0.75 }}>
                {selectedMeals.map(meal => (
                  <Box key={meal} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {mealIcon(meal)}
                        <Typography sx={{ fontSize: '0.85rem', color: TXT_MID }}>{meal}</Typography>
                      </Box>
                      <Button
                        size="small"
                        disabled={!menuMap[regDate]?.[meal]}
                        onClick={() => setMenuModal({ meal, text: menuMap[regDate]?.[meal] ?? '' })}
                        sx={{
                          fontSize: '0.68rem', fontWeight: 700, color: SD, bgcolor: '#fff8ee',
                          border: '1px solid #f5d78e', borderRadius: '5px', px: 0.875, py: 0.25,
                          textTransform: 'none', minWidth: 0, lineHeight: 1.4,
                          opacity: menuMap[regDate]?.[meal] ? 1 : 0.45,
                        }}
                      >
                        🍽 Menu
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => setRegMeals(m => ({ ...m, [meal]: Math.max(0, m[meal] - 1) }))}
                        sx={{ border: `1.5px solid ${BORDER}`, borderRadius: '7px', width: 32, height: 32, '&:hover': { bgcolor: SP, borderColor: S } }}>
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography sx={{ width: 32, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: BROWN }}>
                        {regMeals[meal]}
                      </Typography>
                      <IconButton size="small" onClick={() => setRegMeals(m => ({ ...m, [meal]: m[meal] + 1 }))}
                        sx={{ border: `1.5px solid ${BORDER}`, borderRadius: '7px', width: 32, height: 32, '&:hover': { bgcolor: SP, borderColor: S } }}>
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
              {totalCoupons >= 10 && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', fontSize: '0.8rem', color: '#7a5e00' }}>
                  ⚠️ Bulk request (≥10 coupons). Admin review may be required.
                </Box>
              )}
            </>
          )}

          {/* Price box */}
          <Box sx={{ mt: 3, bgcolor: CREAM, border: `1.5px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
            <Box sx={{ p: '14px 18px', display: 'flex', flexDirection: 'column', gap: 0.75, borderBottom: `1px solid ${BORDER}` }}>
              {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(m => {
                const q = regMeals[m];
                return (
                  <Box key={m} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {mealIcon(m)}
                      <Typography sx={{ fontSize: '0.82rem', color: TXT_MID }}>{m}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.82rem', color: q > 0 ? BROWN : TXT_LIGHT, fontWeight: q > 0 ? 600 : 400 }}>
                      {q > 0 ? `${q} × ₹${PRICE[m]}/- = ₹${q * PRICE[m]}/-` : '—'}
                    </Typography>
                  </Box>
                );
              })}
              <Divider sx={{ borderColor: BORDER, my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: BROWN }}>Total Amount</Typography>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: totalAmount > 0 ? S : TXT_LIGHT }}>
                  {totalAmount > 0 ? `₹${totalAmount}/-` : '—'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: '12px 18px', borderBottom: `1px solid ${BORDER}` }}>
              <Typography sx={{ fontSize: '0.78rem', color: TXT_MID, mb: 0.5 }}>
                🕖 Prasadam Timing: <strong>6:30 PM to 9:00 PM</strong>
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#9A7A5A' }}>
                ⚠️ Note: The coupons are not valid on Festival days.
              </Typography>
            </Box>
            <Box sx={{ p: '16px 18px', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: TXT_LIGHT }}>
                By continuing, you are agreeing to our{' '}
                <Box component="a" href="#" sx={{ color: S, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms of Use</Box>
                {' '}and{' '}
                <Box component="a" href="#" sx={{ color: S, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy Policy</Box>
              </Typography>
              <Button onClick={proceedToPayment} sx={{
                width: '100%', py: 1.75, borderRadius: '10px', border: 'none',
                background: `linear-gradient(135deg, ${S}, ${GOLD})`,
                color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(232,98,26,0.3)', textTransform: 'none',
                '&:hover': { opacity: 0.92, transform: 'translateY(-1px)' },
                transition: 'all 0.2s',
              }}>
                💳 Proceed to Payment
              </Button>
              <Button onClick={() => goTo('landing')} sx={{
                width: '100%', py: 1.25, borderRadius: '10px', border: `1.5px solid ${BORDER}`,
                bgcolor: 'transparent', color: TXT_MID, fontSize: '0.84rem', fontWeight: 500,
                textTransform: 'none',
                '&:hover': { bgcolor: CREAM },
                transition: 'all 0.18s',
              }}>
                ← Back to Home
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // MY BOOKINGS VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  const statusColor = (s: string) => {
    if (s === 'approved' || s === 'accepted') return { dot: GREEN, bg: GREEN_PALE, text: GREEN };
    if (s === 'declined') return { dot: RED, bg: RED_PALE, text: RED };
    return { dot: GOLD, bg: GOLD_PALE, text: GOLD };
  };

  const bookingsView = (
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
          <Box sx={{ bgcolor: '#fff', borderRadius: '20px', p: 5, boxShadow: '0 4px 24px rgba(60,20,0,0.08)', border: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, textAlign: 'center' }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: BROWN }}>
                  Booking History
                </Typography>
                <Button onClick={() => goTo('register')} sx={{
                  bgcolor: S, color: '#fff', borderRadius: '8px', fontSize: '0.8rem',
                  fontWeight: 600, textTransform: 'none', px: 2.5, py: 1.125,
                  '&:hover': { bgcolor: SD },
                }}>
                  + New Booking
                </Button>
              </Box>

              {/* Tabs */}
              <Box sx={{ display: 'flex', borderBottom: `1px solid ${BORDER}` }}>
                {[{ key: 'coupons', label: '🎟 Prasadam Coupons' }, { key: 'birthday', label: 'Party Enquiries' }].map(t => (
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
                      <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, borderBottom: `1px solid ${BORDER}`, '&:last-child': { borderBottom: 0 }, '&:hover': { bgcolor: '#FDFAF4' } }}>
                        <Box sx={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, color: SD, bgcolor: SP, px: 1.25, py: 0.4, borderRadius: '50px', flexShrink: 0 }}>{b.id}</Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: BROWN }}>{b.name}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: TXT_LIGHT }}>{fmtDate(b.date)} · {b.location}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: sc.bg, px: 1.25, py: 0.5, borderRadius: '50px' }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: sc.text }}>{b.status}</Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => setCouponBooking(b)}
                          sx={{ color: SD, bgcolor: SP, border: `1px solid ${BORDER}`, borderRadius: '8px', flexShrink: 0, '&:hover': { bgcolor: '#FEE8D4' } }}
                        >
                          <ConfirmationNumberIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    );
                  })
                )}
                {bkTab === 'birthday' && (
                  myEnquiries.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.88rem', color: TXT_LIGHT }}>No party enquiries found.</Typography>
                    </Box>
                  ) : myEnquiries.map(e => {
                    const sc = statusColor(e.status);
                    return (
                      <Box key={e.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, borderBottom: `1px solid ${BORDER}`, '&:last-child': { borderBottom: 0 }, '&:hover': { bgcolor: '#FDFAF4' } }}>
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

  // ─────────────────────────────────────────────────────────────────────────────
  // BIRTHDAY / PARTY VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  const birthdayView = (
    <Box sx={{ minHeight: '100vh', pt: `${HEADER_H}px`, background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)' }}>
      <Box sx={{ maxWidth: 680, mx: 'auto', px: 2.5, py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, color: BROWN, mb: 0.5 }}>
            Party Booking
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: TXT_LIGHT }}>
            Order prasadam for your special day — delivered to your door
          </Typography>
        </Box>

        <Box sx={{ bgcolor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(60,20,0,0.1)', border: `1px solid rgba(232,98,26,0.12)`, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(to right, ${S}, ${GOLD})` } }}>
          <Box sx={{ p: '24px 28px', borderBottom: `1px solid ${BORDER}`, bgcolor: '#FDFAF4' }}>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 700, color: BROWN, mb: 0.4 }}>
              🏠 Door Delivery Enquiry
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: TXT_LIGHT }}>
              Admin will confirm your booking within 24–48 hours
            </Typography>
          </Box>

          <Box sx={{ p: '24px 28px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Info banner */}
            <Box sx={{ bgcolor: SP, border: `1px solid rgba(232,98,26,0.25)`, borderRadius: '10px', p: '12px 16px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.82rem', color: SD }}>
                ⏰ Bookings must be placed <strong>at least 7 days</strong> before the event date.
              </Typography>
            </Box>

            {/* Personal Details */}
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TXT_MID, mb: 1.5, pb: 0.75, borderBottom: `1px solid ${BORDER}` }}>
                Personal Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField fullWidth size="small" label="Full Name *"
                  placeholder="Your full name" value={bdyName} onChange={e => setBdyName(e.target.value)} sx={FIELD_SX} />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField fullWidth size="small" label="Mobile *"
                    placeholder="10-digit number" slotProps={{ htmlInput: { maxLength: 10 } }}
                    value={bdyMobile} onChange={e => setBdyMobile(e.target.value.replace(/\D/g, ''))} sx={FIELD_SX} />
                  <TextField fullWidth size="small" label="Email"
                    placeholder="Optional" type="email"
                    value={bdyEmail} onChange={e => setBdyEmail(e.target.value)} sx={FIELD_SX} />
                </Box>
              </Box>
            </Box>

            {/* Event Details */}
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TXT_MID, mb: 1.5, pb: 0.75, borderBottom: `1px solid ${BORDER}` }}>
                Event Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <TextField size="small" label="Event Date *"
                    type="date" slotProps={{ htmlInput: { min: minBdyDate }, inputLabel: { shrink: true } }}
                    value={bdyDate} onChange={e => setBdyDate(e.target.value)} sx={{ maxWidth: 200, ...FIELD_SX }} />
                  <Typography sx={{ fontSize: '0.7rem', color: TXT_LIGHT, mt: 0.5 }}>Minimum 7 days from today</Typography>
                </Box>
                <TextField fullWidth size="small" label="Delivery Address *"
                  placeholder="Full delivery address including landmark" multiline rows={3}
                  value={bdyAddress} onChange={e => setBdyAddress(e.target.value)} sx={FIELD_SX} />

                {/* Plate counts */}
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: TXT_MID, mb: 1 }}>
                    Plate Count per Meal <span style={{ color: S }}>*</span>
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(m => (
                      <Box key={m} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {mealIcon(m)}
                          <Typography sx={{ fontSize: '0.85rem', color: TXT_MID }}>{m}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <IconButton size="small" onClick={() => setBdyMeals(p => ({ ...p, [m]: Math.max(0, p[m] - 5) }))}
                            sx={{ border: `1.5px solid ${BORDER}`, borderRadius: '7px', width: 32, height: 32, '&:hover': { bgcolor: SP, borderColor: S } }}>
                            <RemoveIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                          <Typography sx={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: BROWN }}>{bdyMeals[m]}</Typography>
                          <IconButton size="small" onClick={() => setBdyMeals(p => ({ ...p, [m]: p[m] + 5 }))}
                            sx={{ border: `1.5px solid ${BORDER}`, borderRadius: '7px', width: 32, height: 32, '&:hover': { bgcolor: SP, borderColor: S } }}>
                            <AddIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: TXT_LIGHT, mt: 0.75 }}>Minimum 10 total plates across all meals</Typography>
                </Box>
              </Box>
            </Box>

            {/* Preferences */}
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TXT_MID, mb: 1.5, pb: 0.75, borderBottom: `1px solid ${BORDER}` }}>
                Preferences (Optional)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField fullWidth size="small" label="Preferred Menu" multiline rows={3}
                  placeholder="e.g. Puri Bhaji, Rice Dal Sabzi, Halwa…"
                  value={bdyMenu} onChange={e => setBdyMenu(e.target.value)} sx={FIELD_SX} />
                <TextField fullWidth size="small" label="Preferred Price" type="number"
                  placeholder="e.g. 5000"
                  slotProps={{ htmlInput: { min: 0 }, input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                  value={bdyPrice} onChange={e => setBdyPrice(e.target.value)} sx={FIELD_SX} />
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button onClick={submitBdy} disabled={enquiryLoading} sx={{
                width: '100%', py: 1.75, borderRadius: '10px',
                background: `linear-gradient(135deg, ${S}, ${GOLD})`,
                color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(232,98,26,0.3)', textTransform: 'none',
                '&:hover': { opacity: 0.92, transform: 'translateY(-1px)' },
                '&.Mui-disabled': { opacity: 0.6 },
                transition: 'all 0.2s',
              }}>
                {enquiryLoading ? 'Submitting…' : '🎂 Submit Enquiry'}
              </Button>
              <Button onClick={() => goTo('landing')} sx={{
                width: '100%', py: 1.25, borderRadius: '10px', border: `1.5px solid ${BORDER}`,
                bgcolor: 'transparent', color: TXT_MID, fontSize: '0.84rem', fontWeight: 500,
                textTransform: 'none', '&:hover': { bgcolor: CREAM }, transition: 'all 0.18s',
              }}>
                ← Back to Home
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // BIRTHDAY SUCCESS VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  const bdySuccessView = (
    <Box sx={{ minHeight: '100vh', pt: `${HEADER_H}px`, background: 'radial-gradient(ellipse at 30% 60%, #FFCBA8 0%, #FFD9BC 30%, #FFE8D4 60%, #FFF3EC 100%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <Box sx={{ maxWidth: 500, width: '100%', px: 2.5, py: 6, textAlign: 'center' }}>
        <Box sx={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ebf7ed, #d4edda)',
          border: '3px solid #b2dfbc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', mx: 'auto', mb: 3.5,
        }}>
        </Box>
        <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: BROWN, mb: 1.5 }}>
          Enquiry Submitted!
        </Typography>
        <Box sx={{ display: 'inline-block', bgcolor: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: '12px', px: 3.5, py: 1.75, mb: 3 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TXT_LIGHT, mb: 0.625 }}>Enquiry ID</Typography>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: S, letterSpacing: '0.06em' }}>{bdySuccessId}</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.88rem', color: TXT_MID, lineHeight: 1.75, mb: 3.5 }}>
          Your party prasadam enquiry has been received.<br />
          Our admin team will <strong>contact you within 24–48 hours</strong> to confirm details.
        </Typography>
        <Box sx={{ bgcolor: SP, borderRadius: '10px', p: '14px 16px', fontSize: '0.78rem', color: SD, textAlign: 'left', mb: 2.5 }}>
          <Typography sx={{ fontSize: '0.78rem', color: SD, fontWeight: 700, mb: 1 }}>What happens next?</Typography>
          {['Admin reviews your enquiry', 'You receive a confirmation call / message', 'Payment details shared upon acceptance', 'Prasadam delivered on your event date 🎂'].map((s, i) => (
            <Typography key={i} sx={{ fontSize: '0.78rem', color: SD, mb: 0.5 }}>{i + 1}. {s}</Typography>
          ))}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button onClick={() => { setBkMobile(bdyMobile); setBkInput(bdyMobile); goTo('bookings'); }} sx={{
            width: '100%', py: 1.75, borderRadius: '10px',
            background: `linear-gradient(135deg, ${S}, ${GOLD})`,
            color: '#fff', fontSize: '0.95rem', fontWeight: 700,
            boxShadow: '0 4px 16px rgba(232,98,26,0.3)', textTransform: 'none',
            '&:hover': { opacity: 0.92 },
          }}>
            📋 View My Enquiries
          </Button>
          <Button onClick={() => goTo('landing')} sx={{
            width: '100%', py: 1.25, borderRadius: '10px', border: `1.5px solid ${BORDER}`,
            bgcolor: 'transparent', color: TXT_MID, fontSize: '0.84rem', fontWeight: 500,
            textTransform: 'none', '&:hover': { bgcolor: CREAM },
          }}>
            ← Back to Home
          </Button>
        </Box>
      </Box>
    </Box>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // COUPON MODAL derived values
  // ─────────────────────────────────────────────────────────────────────────────
  const couponActiveMeals = couponBooking
    ? (['Breakfast', 'Lunch', 'Dinner'] as MealType[]).filter(m => couponBooking.meals[m] > 0)
    : [];
  const couponTotalQty  = couponActiveMeals.reduce((s, m) => s + (couponBooking?.meals[m] ?? 0), 0);
  const couponIsPending  = couponBooking?.status === 'pending';
  const couponIsDeclined = couponBooking?.status === 'declined';
  const couponLongDate   = couponBooking
    ? new Date(couponBooking.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ fontFamily: 'Inter, sans-serif', bgcolor: CREAM, color: '#1E0F00' }}>
      {header}
      {mobileDrawer}

      {view === 'landing'     && landingView}
      {view === 'register'    && registerView}
      {(view === 'payment' || view === 'success') && (
        <PaymentPage
          regName={regName} regDate={regDate} regLoc={regLoc}
          regMeals={regMeals} totalAmount={totalAmount}
          payProof={payProof} setPayProof={setPayProof}
          onConfirm={confirmPayment} onBack={() => goTo('register')}
          bookingLoading={bookingLoading} successId={successId}
          onNewRegistration={() => { setSuccessId(''); setRegName(''); setRegMobile(''); setRegEmail(''); setRegLoc(''); setRegDate(''); setRegMeals({ Breakfast: 0, Lunch: 0, Dinner: 0 }); setPayProof(null); goTo('register'); }}
          onBackToHome={() => goTo('landing')}
        />
      )}
      {view === 'bookings'    && bookingsView}
      {view === 'birthday'    && birthdayView}
      {view === 'bdy-success' && bdySuccessView}

      {/* ── COUPON MODAL ── */}
      {couponBooking && (
        <Dialog open onClose={() => setCouponBooking(null)} maxWidth="xs" fullWidth
          slotProps={{ paper: { sx: { borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(60,20,0,0.28)' } } }}>
          {/* Header */}
          <Box sx={{ background: 'linear-gradient(160deg, #3B1F0A 0%, #6B3A1F 45%, #C44D0D 100%)', px: 3, pt: 3.5, pb: 3, textAlign: 'center', position: 'relative' }}>
            <IconButton size="small" onClick={() => setCouponBooking(null)} sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.75 }}>
              <Box sx={{ bgcolor: '#fff', borderRadius: '10px', px: 1.5, py: 0.875 }}>
                <Box component="img" src="/iskcon-logo.png" alt="ISKCON Chennai" sx={{ height: 44, width: 'auto', objectFit: 'contain', display: 'block' }} />
              </Box>
            </Box>
            <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, mb: 0.5 }}>
              Prasadam Coupon
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>{couponBooking.date}</Typography>
          </Box>

          {/* Status bar — only shown for pending or declined */}
          {(couponIsPending || couponIsDeclined) && (
            <Box sx={{ textAlign: 'center', py: 1.25, bgcolor: couponIsPending ? '#FFF8E1' : RED_PALE, borderBottom: `1px dashed ${BORDER}` }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: couponIsPending ? '#b45309' : RED }}>
                {couponIsPending ? '⏳ Pending Admin Approval' : '❌ Booking Declined'}
              </Typography>
            </Box>
          )}

          <DialogContent sx={{ px: 0, py: 0, bgcolor: '#FDFAF6' }}>
            {[
              { label: 'Pilgrim Name', value: couponBooking.name },
              { label: 'Location',    value: `HKM ${couponBooking.location}` },
              { label: 'Meal Type',   value: (
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {couponActiveMeals.map(m => (
                    <Box key={m} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
                      {mealIcon(m)}
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: BROWN }}>{m} ×{couponBooking.meals[m]}</Typography>
                    </Box>
                  ))}
                </Box>
              )},
              { label: 'Event Date',  value: couponLongDate },
              { label: 'Quantity',    value: `${couponTotalQty} person${couponTotalQty !== 1 ? 's' : ''}` },
              { label: 'Amount Paid', value: <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: S }}>₹{couponBooking.total}/-</Typography> },
            ].map(({ label, value }, i, arr) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 1.5, borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TXT_LIGHT }}>{label}</Typography>
                {typeof value === 'string'
                  ? <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: BROWN }}>{value}</Typography>
                  : value}
              </Box>
            ))}

            {/* QR + coupon number */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2.25, bgcolor: CREAM, borderTop: `1.5px dashed ${BORDER}`, mt: 0.5 }}>
              <Box sx={{ bgcolor: '#fff', p: 1, borderRadius: '8px', border: `1px solid ${BORDER}`, flexShrink: 0 }}>
                <QRCodeSVG value={couponBooking.id} size={72} fgColor={BROWN} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 700, color: S, lineHeight: 1.1 }}>{couponBooking.id}</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: TXT_LIGHT, mt: 0.25 }}>Show this at the prasadam counter</Typography>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 2.5, py: 2, gap: 1.25, borderTop: `1px solid ${BORDER}`, bgcolor: '#fff' }}>
            <Button onClick={() => setCouponBooking(null)} sx={{ flex: 1, py: 1.25, borderRadius: '12px', border: `1.5px solid ${BORDER}`, color: TXT_MID, textTransform: 'none', fontWeight: 600, fontSize: '0.88rem', '&:hover': { bgcolor: CREAM } }}>
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              startIcon={<PrintIcon sx={{ fontSize: '16px !important' }} />}
              sx={{ flex: 1, py: 1.25, borderRadius: '12px', bgcolor: S, color: '#fff', textTransform: 'none', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 4px 14px rgba(232,98,26,0.35)', '&:hover': { bgcolor: SD } }}
            >
              Print
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Menu Modal */}
      {menuModal && (
        <Dialog open onClose={() => setMenuModal(null)} maxWidth="xs" fullWidth
          slotProps={{ paper: { sx: { borderRadius: '16px', border: `1.5px solid ${BORDER}` } } }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, pt: 2.5, px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {mealIcon(menuModal.meal)}
              <Typography sx={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 700, color: BROWN }}>
                {menuModal.meal} Menu
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setMenuModal(null)} sx={{ color: TXT_LIGHT }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider sx={{ borderColor: BORDER }} />
          <DialogContent sx={{ px: 3, py: 2.5 }}>
            {menuModal.text
              ? menuModal.text.split('\n').filter(Boolean).map((line, i) => (
                  <Typography key={i} sx={{ fontSize: '0.88rem', color: TXT_MID, py: 0.375 }}>• {line}</Typography>
                ))
              : <Typography sx={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', py: 1.25 }}>No menu added for this meal yet.</Typography>
            }
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}
