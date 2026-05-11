'use client';

import { useState } from 'react';
import { useGetSlotMapQuery } from '@/services/slotDatesApi';
import { useGetMealMenusQuery } from '@/services/mealMenusApi';
import { useCreatePrasadamBookingMutation, useGetPrasadamBookingsQuery } from '@/services/prasadamBookingsApi';
import { useCreatePartyEnquiryMutation, useGetPartyEnquiriesQuery } from '@/services/partyEnquiriesApi';
import type { MealType, CreatePrasadamBookingDto, CreatePartyEnquiryDto, PrasadamBooking } from '@/types';
import Box from '@mui/material/Box';

import { CREAM, PRICE } from './_public/constants';
import type { View, BkTab } from './_public/constants';
import HeaderBar from './_public/HeaderBar';
import LandingView from './_public/LandingView';
import RegisterView from './_public/RegisterView';
import BookingsView from './_public/BookingsView';
import PartyView from './_public/PartyView';
import PartySuccessView from './_public/PartySuccessView';
import CouponModal from './_public/CouponModal';
import MenuModal from './_public/MenuModal';
import PaymentPage from './PaymentPage';

// ─── Public Page ──────────────────────────────────────────────────────────────
export default function PublicPage() {
  const { data: slotMap = {} } = useGetSlotMapQuery();
  const { data: menuMap = {} } = useGetMealMenusQuery();
  const [createBooking, { isLoading: bookingLoading }] = useCreatePrasadamBookingMutation();
  const [createEnquiry, { isLoading: enquiryLoading }] = useCreatePartyEnquiryMutation();

  const [view, setView]             = useState<View>('landing');
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

  const totalAmount = (Object.entries(regMeals) as [MealType, number][]).reduce((s, [m, q]) => s + PRICE[m] * q, 0);

  function proceedToPayment() {
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
    if ('data' in res && res.data) {
      setSuccessId(res.data.id);
      setRegName(''); setRegMobile(''); setRegEmail(''); setRegLoc(''); setRegDate('');
      setRegMeals({ Breakfast: 0, Lunch: 0, Dinner: 0 }); setPayProof(null);
      goTo('success');
    }
  }

  // My bookings
  const [bkInput,  setBkInput]  = useState('');
  const [bkMobile, setBkMobile] = useState<string | null>(null);
  const [bkTab,    setBkTab]    = useState<BkTab>('coupons');
  const [couponBooking, setCouponBooking] = useState<PrasadamBooking | null>(null);
  const { data: myBookings  = [] } = useGetPrasadamBookingsQuery({ mobile: bkMobile ?? '' }, { skip: !bkMobile });
  const { data: myEnquiries = [] } = useGetPartyEnquiriesQuery({ mobile: bkMobile ?? '' }, { skip: !bkMobile });

  // Party form
  const [ptyName,      setPtyName]      = useState('');
  const [ptyMobile,    setPtyMobile]    = useState('');
  const [ptyEmail,     setPtyEmail]     = useState('');
  const [ptyDate,      setPtyDate]      = useState('');
  const [ptyAddress,   setPtyAddress]   = useState('');
  const [ptyMeals,     setPtyMeals]     = useState<Record<MealType, number>>({ Breakfast: 0, Lunch: 0, Dinner: 0 });
  const [ptyMenu,      setPtyMenu]      = useState('');
  const [ptyPrice,     setPtyPrice]     = useState('');
  const [ptySuccessId, setPtySuccessId] = useState('');

  async function submitParty() {
    if (!ptyName || !ptyMobile || !ptyDate || !ptyAddress) { alert('Please fill all required fields'); return; }
    if (!/^\d{10}$/.test(ptyMobile)) { alert('Enter a valid 10-digit mobile'); return; }
    const dto: CreatePartyEnquiryDto = { name: ptyName, mobile: ptyMobile, email: ptyEmail, eventDate: ptyDate, address: ptyAddress, meals: ptyMeals, preferredMenu: ptyMenu, preferredPrice: ptyPrice ? Number(ptyPrice) : undefined };
    const res = await createEnquiry(dto);
    if ('data' in res && res.data) {
      setPtySuccessId(res.data.id);
      setPtyName(''); setPtyMobile(''); setPtyEmail(''); setPtyDate(''); setPtyAddress('');
      setPtyMeals({ Breakfast: 0, Lunch: 0, Dinner: 0 }); setPtyMenu(''); setPtyPrice('');
      goTo('party-success');
    }
  }

  function goTo(v: View) {
    setView(v); setMobileOpen(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }

  // ── NAV ITEMS ──
  const navItems = [
    { label: 'Home',             action: () => goTo('landing') },
    { label: 'Donate',           action: () => { goTo('landing'); setTimeout(() => document.getElementById('seva-section')?.scrollIntoView({ behavior: 'smooth' }), 50); } },
    { label: 'About',            action: () => { goTo('landing'); setTimeout(() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' }), 50); } },
    { label: 'Prasadam Coupons', action: () => goTo('register') },
    { label: 'My Bookings',      action: () => goTo('bookings') },
    { label: 'Party Booking',    action: () => goTo('party') },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ fontFamily: 'Inter, sans-serif', bgcolor: CREAM, color: '#1E0F00' }}>
      <HeaderBar navItems={navItems} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {view === 'landing' && (
        <LandingView onGoTo={goTo} />
      )}

      {view === 'register' && (
        <RegisterView
          slotMap={slotMap}
          menuMap={menuMap}
          regName={regName} setRegName={setRegName}
          regMobile={regMobile} setRegMobile={setRegMobile}
          regEmail={regEmail} setRegEmail={setRegEmail}
          regLoc={regLoc} setRegLoc={setRegLoc}
          regDate={regDate} setRegDate={setRegDate}
          regMeals={regMeals} setRegMeals={setRegMeals}
          proceedToPayment={proceedToPayment}
          setMenuModal={setMenuModal}
          onGoTo={goTo}
        />
      )}

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

      {view === 'bookings' && (
        <BookingsView
          bkInput={bkInput} setBkInput={setBkInput}
          bkMobile={bkMobile} setBkMobile={setBkMobile}
          bkTab={bkTab} setBkTab={setBkTab}
          myBookings={myBookings}
          myEnquiries={myEnquiries}
          setCouponBooking={setCouponBooking}
          onGoTo={goTo}
        />
      )}

      {view === 'party' && (
        <PartyView
          ptyName={ptyName} setPtyName={setPtyName}
          ptyMobile={ptyMobile} setPtyMobile={setPtyMobile}
          ptyEmail={ptyEmail} setPtyEmail={setPtyEmail}
          ptyDate={ptyDate} setPtyDate={setPtyDate}
          ptyAddress={ptyAddress} setPtyAddress={setPtyAddress}
          ptyMeals={ptyMeals} setPtyMeals={setPtyMeals}
          ptyMenu={ptyMenu} setPtyMenu={setPtyMenu}
          ptyPrice={ptyPrice} setPtyPrice={setPtyPrice}
          enquiryLoading={enquiryLoading}
          submitParty={submitParty}
          onGoTo={goTo}
        />
      )}

      {view === 'party-success' && (
        <PartySuccessView
          ptySuccessId={ptySuccessId}
          ptyMobile={ptyMobile}
          setBkMobile={setBkMobile}
          setBkInput={setBkInput}
          onGoTo={goTo}
        />
      )}

      {/* ── COUPON TICKET MODAL ── */}
      {couponBooking && (
        <CouponModal couponBooking={couponBooking} onClose={() => setCouponBooking(null)} />
      )}

      {/* ── MENU MODAL ── */}
      {menuModal && (
        <MenuModal menuModal={menuModal} onClose={() => setMenuModal(null)} />
      )}
    </Box>
  );
}
