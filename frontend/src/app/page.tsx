'use client';

import { useState } from 'react';
import { useGetSlotMapQuery } from '@/services/slotDatesApi';
import { useGetMealMenusQuery } from '@/services/mealMenusApi';
import { useCreatePrasadamBookingMutation, useGetPrasadamBookingsQuery } from '@/services/prasadamBookingsApi';
import { useCreatePartyEnquiryMutation, useGetPartyEnquiriesQuery } from '@/services/partyEnquiriesApi';
import type { MealType, CreatePrasadamBookingDto, CreatePartyEnquiryDto } from '@/types';

type View = 'landing' | 'register' | 'payment' | 'success' | 'bookings' | 'birthday' | 'bdy-success';
type BkTab = 'coupons' | 'birthday';

const PRICE_PER_MEAL: Record<MealType, number> = { Breakfast: 20, Lunch: 40, Dinner: 35 };

export default function PublicPage() {
  const { data: slotMap = {} } = useGetSlotMapQuery();
  const { data: menuMap = {} } = useGetMealMenusQuery();
  const [createBooking, { isLoading: bookingLoading }] = useCreatePrasadamBookingMutation();
  const [createEnquiry, { isLoading: enquiryLoading }] = useCreatePartyEnquiryMutation();

  const [view, setView] = useState<View>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Registration form ──
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regLoc, setRegLoc] = useState<'Thiruvanmiyur' | 'NLBR' | ''>('');
  const [regDate, setRegDate] = useState('');
  const [regMeals, setRegMeals] = useState<Record<MealType, number>>({ Breakfast: 0, Lunch: 0, Dinner: 0 });
  const [menuModal, setMenuModal] = useState<{ meal: MealType; text: string } | null>(null);
  const [successId, setSuccessId] = useState('');

  const availDates = Object.keys(slotMap).sort();
  const selectedMeals: MealType[] = regDate ? (slotMap[regDate] ?? []) : [];
  const totalCoupons = Object.values(regMeals).reduce((a, b) => a + b, 0);
  const totalAmount = (Object.entries(regMeals) as [MealType, number][]).reduce((sum, [m, q]) => sum + (PRICE_PER_MEAL[m] ?? 0) * q, 0);

  async function submitReg() {
    if (!regName || !regMobile || !regLoc || !regDate) { alert('Please fill all required fields'); return; }
    if (!/^\d{10}$/.test(regMobile)) { alert('Enter a valid 10-digit mobile'); return; }
    if (totalCoupons < 1) { alert('Select at least 1 coupon'); return; }
    const dto: CreatePrasadamBookingDto = { name: regName, mobile: regMobile, email: regEmail, location: regLoc, date: regDate, meals: regMeals, total: totalAmount };
    const res = await createBooking(dto);
    if ('data' in res && res.data) { setSuccessId(res.data.id); goTo('success'); }
  }

  // ── My bookings ──
  const [bkInput, setBkInput] = useState('');
  const [bkMobile, setBkMobile] = useState<string | null>(null);
  const [bkTab, setBkTab] = useState<BkTab>('coupons');
  const { data: myBookings = [] } = useGetPrasadamBookingsQuery({ mobile: bkMobile ?? '' }, { skip: !bkMobile });
  const { data: myEnquiries = [] } = useGetPartyEnquiriesQuery({ mobile: bkMobile ?? '' }, { skip: !bkMobile });

  // ── Birthday/party form ──
  const [bdyName, setBdyName] = useState('');
  const [bdyMobile, setBdyMobile] = useState('');
  const [bdyEmail, setBdyEmail] = useState('');
  const [bdyDate, setBdyDate] = useState('');
  const [bdyAddress, setBdyAddress] = useState('');
  const [bdyMeals, setBdyMeals] = useState<Record<MealType, number>>({ Breakfast: 0, Lunch: 0, Dinner: 0 });
  const [bdyMenu, setBdyMenu] = useState('');
  const [bdyPrice, setBdyPrice] = useState('');
  const [bdySuccessId, setBdySuccessId] = useState('');

  async function submitBdy() {
    if (!bdyName || !bdyMobile || !bdyDate || !bdyAddress) { alert('Please fill all required fields'); return; }
    if (!/^\d{10}$/.test(bdyMobile)) { alert('Enter a valid 10-digit mobile'); return; }
    const dto: CreatePartyEnquiryDto = { name: bdyName, mobile: bdyMobile, email: bdyEmail, eventDate: bdyDate, address: bdyAddress, meals: bdyMeals, preferredMenu: bdyMenu, preferredPrice: bdyPrice ? Number(bdyPrice) : undefined };
    const res = await createEnquiry(dto);
    if ('data' in res && res.data) { setBdySuccessId(res.data.id); goTo('bdy-success'); }
  }

  function goTo(v: View) { setView(v); setMobileMenuOpen(false); if (typeof window !== 'undefined') window.scrollTo({ top: 0 }); }

  function fmtDate(d: string) {
    try { return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }

  function mealIcon(m: MealType) { return m === 'Breakfast' ? '🌅' : m === 'Lunch' ? '☀️' : '🌙'; }

  function statusBadge(s: string) {
    if (s === 'approved' || s === 'accepted') return 'approved';
    if (s === 'declined') return 'declined';
    return 'pending';
  }

  const minBdyDate = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); })();

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--saffron:#E8621A;--saffron-light:#F4893A;--saffron-pale:#FEF0E6;--saffron-dark:#C44D0D;--gold:#C9920A;--gold-light:#F0C842;--gold-pale:#FFF9E6;--maroon:#7B1D1D;--cream:#FBF6EE;--ivory:#FDFAF4;--brown-dark:#3B1F0A;--brown-mid:#6B3A1F;--text-dark:#1E0F00;--text-mid:#5A3A1A;--text-light:#9A7A5A;--border:#E8D8C0;--border-light:#F2E8D8;--white:#fff;--green:#2D7A3A;--green-pale:#EBF7ED;--red-pale:#FDECEA;--red:#C0392B}
        html{font-size:15px;scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;background:var(--cream);color:var(--text-dark)}
        h1,h2,h3,h4,h5{font-family:'Cormorant Garamond',serif;line-height:1.2}
        button{cursor:pointer;font-family:'Inter',sans-serif}
        input,select,textarea{font-family:'Inter',sans-serif}
        .site-header{position:fixed;top:0;left:0;right:0;z-index:200;background:linear-gradient(135deg,var(--saffron) 0%,#F07A20 40%,var(--gold) 100%);border-bottom:1px solid rgba(255,255,255,0.15);box-shadow:0 4px 20px rgba(232,98,26,0.35);height:68px;display:flex;align-items:center;padding:0 40px;gap:24px}
        .header-logo{display:flex;align-items:center;gap:12px;text-decoration:none;cursor:pointer}
        .header-lotus{width:38px;height:38px;background:rgba(255,255,255,0.22);border:1.5px solid rgba(255,255,255,0.4);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;flex-shrink:0}
        .header-brand-name{font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:700;color:#fff;line-height:1.2}
        .header-brand-sub{font-size:0.6rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.85);margin-top:1px}
        .header-nav{display:flex;align-items:center;gap:4px;margin-left:auto}
        .nav-link{padding:7px 14px;border-radius:8px;font-size:0.82rem;font-weight:500;color:rgba(255,255,255,0.88);background:none;border:none;transition:all 0.18s;cursor:pointer}
        .nav-link:hover,.nav-link.active{color:#fff;background:rgba(255,255,255,0.22);border:1px solid rgba(255,255,255,0.4);font-weight:600}
        .btn-admin{margin-left:8px;padding:8px 18px;border-radius:8px;font-size:0.82rem;font-weight:700;background:var(--brown-dark);color:#fff;border:none;box-shadow:0 3px 12px rgba(30,10,0,0.35);transition:all 0.18s}
        .btn-admin:hover{background:var(--maroon)}
        .hamburger-pub{display:none;background:none;border:none;padding:6px;cursor:pointer;flex-direction:column;gap:4px;margin-left:auto}
        .hamburger-pub span{display:block;width:20px;height:2px;background:#fff;border-radius:2px}
        @media(max-width:820px){.site-header{padding:0 20px}.header-nav{display:none}.header-nav.open{display:flex;flex-direction:column;position:fixed;top:68px;left:0;right:0;background:var(--brown-dark);padding:16px;gap:6px;border-bottom:1px solid rgba(255,255,255,0.1);z-index:199}.hamburger-pub{display:flex}}
        .hero{min-height:100vh;background:radial-gradient(ellipse at 30% 60%,#FFCBA8 0%,#FFD9BC 30%,#FFE8D4 60%,#FFF3EC 100%);display:flex;align-items:center;justify-content:center;padding:120px 40px 80px;position:relative;overflow:hidden}
        .hero-content{max-width:660px;text-align:center;position:relative;z-index:1}
        .hero-logo-box{display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:10px;padding:12px 20px;box-shadow:0 4px 24px rgba(60,20,0,0.12);margin-bottom:36px;gap:14px}
        .hero-logo-emblem{width:52px;height:52px;background:#C9920A;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .hero-logo-text{text-align:left}
        .hero-logo-srila{font-size:0.62rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#555;margin-bottom:1px}
        .hero-logo-iskcon{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:700;color:#1a2a6c;line-height:1;letter-spacing:0.04em}
        .hero-logo-location{font-size:0.62rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#C9920A;margin-top:2px}
        .hero-title{font-size:4rem;font-weight:700;color:var(--brown-dark);line-height:1.05;margin-bottom:10px}
        .hero-subtitle{font-size:1.25rem;font-weight:700;color:var(--saffron);margin-bottom:18px;letter-spacing:0.01em}
        .hero-desc{font-size:0.97rem;color:#888;line-height:1.75;max-width:480px;margin:0 auto 36px}
        .hero-actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
        .btn-hero-primary{padding:14px 34px;border-radius:50px;border:none;background:var(--saffron);color:#fff;font-size:0.95rem;font-weight:700;box-shadow:0 6px 20px rgba(232,98,26,0.35);transition:all 0.2s}
        .btn-hero-primary:hover{background:var(--saffron-dark);transform:translateY(-2px)}
        .btn-hero-ghost{padding:14px 34px;border-radius:50px;background:#fff;color:var(--text-dark);font-size:0.95rem;font-weight:600;border:1.5px solid rgba(0,0,0,0.1);box-shadow:0 3px 12px rgba(0,0,0,0.08);transition:all 0.2s}
        .btn-hero-ghost:hover{box-shadow:0 6px 20px rgba(0,0,0,0.12);transform:translateY(-2px)}
        section{padding:88px 40px}
        .section-tag{display:inline-block;font-size:0.65rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--saffron);background:var(--saffron-pale);padding:4px 14px;border-radius:50px;margin-bottom:14px}
        .section-title{font-size:2.5rem;color:var(--brown-dark);margin-bottom:10px}
        .section-sub{font-size:0.92rem;color:var(--text-light);line-height:1.7;max-width:520px}
        .serve-section{background:var(--ivory)}
        .serve-header{text-align:center;margin-bottom:52px}
        .serve-header .section-sub{margin:0 auto}
        .serve-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;max-width:1100px;margin:0 auto}
        .serve-card{background:var(--white);border:1px solid var(--border);border-radius:18px;padding:32px 26px;transition:all 0.25s;position:relative;overflow:hidden;box-shadow:0 2px 12px rgba(60,20,0,0.05)}
        .serve-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(to right,var(--saffron),var(--gold));transform:scaleX(0);transform-origin:left;transition:transform 0.3s ease}
        .serve-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(232,98,26,0.13);border-color:var(--saffron)}
        .serve-card:hover::before{transform:scaleX(1)}
        .serve-icon{width:62px;height:62px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:1.7rem;margin-bottom:20px;box-shadow:0 4px 14px rgba(60,20,0,0.08)}
        .serve-icon.s1{background:var(--saffron-pale)}.serve-icon.s2{background:var(--gold-pale)}.serve-icon.s3{background:var(--green-pale)}.serve-icon.s4{background:#fdeaea}
        .serve-card h4{font-size:1.15rem;color:var(--brown-dark);margin-bottom:10px}
        .serve-card p{font-size:0.8rem;color:var(--text-light);line-height:1.65}
        @media(max-width:900px){.serve-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:560px){.serve-grid{grid-template-columns:1fr}}
        .seva-section{background:radial-gradient(ellipse at 30% 60%,#FFCBA8 0%,#FFD9BC 30%,#FFE8D4 60%,#FFF3EC 100%);text-align:center;position:relative;overflow:hidden}
        .seva-inner{max-width:680px;margin:0 auto;position:relative}
        .seva-lotus{font-size:2.6rem;margin-bottom:8px}
        .seva-quote{font-family:'Cormorant Garamond',serif;font-size:1.65rem;font-style:italic;font-weight:400;color:var(--brown-dark);line-height:1.65;max-width:560px;margin:0 auto 16px}
        .seva-attribution{font-size:0.82rem;color:var(--text-light);letter-spacing:0.06em;margin-bottom:32px}
        .seva-divider{width:48px;height:2px;background:linear-gradient(to right,var(--saffron),var(--gold));border-radius:2px;margin:0 auto 28px}
        .btn-seva{padding:14px 40px;border-radius:50px;border:none;background:var(--saffron);color:#fff;font-size:0.95rem;font-weight:700;box-shadow:0 6px 20px rgba(232,98,26,0.3);transition:all 0.2s}
        .btn-seva:hover{background:var(--saffron-dark);transform:translateY(-2px)}
        .about-section{background:var(--cream)}
        .about-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
        .about-text h2{font-size:2.4rem;color:var(--brown-dark);margin-bottom:18px}
        .about-text p{font-size:0.88rem;color:var(--text-mid);line-height:1.8;margin-bottom:16px}
        .about-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:32px}
        .about-stat{text-align:center;background:var(--white);border:1px solid var(--border);border-radius:14px;padding:18px 12px;position:relative;overflow:hidden;box-shadow:0 2px 10px rgba(60,20,0,0.05)}
        .about-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(to right,var(--saffron),var(--gold))}
        .about-stat-num{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:700;color:var(--saffron)}
        .about-stat-label{font-size:0.7rem;color:var(--text-light);margin-top:4px;font-weight:500}
        .about-visual{background:linear-gradient(135deg,var(--saffron-pale) 0%,var(--gold-pale) 100%);border:1.5px solid rgba(232,98,26,0.18);border-radius:24px;aspect-ratio:4/3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;box-shadow:0 8px 32px rgba(232,98,26,0.1)}
        .about-visual-lotus{font-size:5rem}
        .about-visual-text{font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:var(--brown-mid);text-align:center;line-height:1.6}
        @media(max-width:820px){.about-inner{grid-template-columns:1fr;gap:36px} section{padding:60px 20px} .hero{padding:100px 20px 70px} .site-header{padding:0 20px}}
        .site-footer{background:var(--brown-dark);color:rgba(255,255,255,0.6);padding:52px 40px 28px;border-top:4px solid transparent;border-image:linear-gradient(to right,var(--saffron),var(--gold)) 1}
        .footer-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:48px;padding-bottom:36px;border-bottom:1px solid rgba(255,255,255,0.08)}
        .footer-brand-name{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:8px}
        .footer-brand-sub{font-size:0.75rem;line-height:1.7;color:rgba(255,255,255,0.5);max-width:280px}
        .footer-contact{margin-top:20px;display:flex;flex-direction:column;gap:8px}
        .footer-contact-item{display:flex;align-items:center;gap:9px;font-size:0.78rem;color:rgba(255,255,255,0.55)}
        .footer-col-title{font-size:0.65rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:14px}
        .footer-links{display:flex;flex-direction:column;gap:9px}
        .footer-links button{background:none;border:none;padding:0;font-size:0.82rem;color:rgba(255,255,255,0.55);text-align:left;cursor:pointer;transition:color 0.18s}
        .footer-links button:hover{color:var(--gold-light)}
        .footer-bottom{max-width:1100px;margin:24px auto 0;font-size:0.72rem;color:rgba(255,255,255,0.25);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
        @media(max-width:820px){.footer-inner{grid-template-columns:1fr 1fr}}
        @media(max-width:540px){.footer-inner{grid-template-columns:1fr} .hero-title{font-size:2.6rem}}
        /* ── Registration view ── */
        #view-register{min-height:100vh;background:radial-gradient(ellipse at 30% 60%,#FFCBA8 0%,#FFD9BC 30%,#FFE8D4 60%,#FFF3EC 100%);padding-top:68px}
        .reg-page-header{background:transparent;padding:36px 40px 8px;text-align:center}
        .reg-logo-box{display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:10px;padding:10px 18px;gap:12px;box-shadow:0 4px 20px rgba(60,20,0,0.1);margin-bottom:22px}
        .reg-page-header h2{font-size:2.4rem;color:var(--brown-dark);margin-bottom:8px;font-weight:700}
        .reg-page-header p{font-size:0.88rem;color:#888}
        .reg-page-body{max-width:680px;margin:0 auto;padding:28px 20px 48px}
        .reg-form-card{background:#fff;border-radius:20px;box-shadow:0 10px 40px rgba(60,20,0,0.1);padding:32px 36px;border:1px solid rgba(232,98,26,0.12);position:relative}
        .reg-form-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;border-radius:20px 20px 0 0;background:linear-gradient(to right,var(--saffron),var(--gold))}
        @media(max-width:600px){.reg-form-card{padding:22px 18px}}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .form-group{margin-bottom:20px}
        .form-label{display:block;font-size:0.72rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-mid);margin-bottom:7px}
        .form-label .req{color:var(--saffron)}
        .form-input,.form-select{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:9px;font-size:0.88rem;color:var(--text-dark);background:var(--cream);outline:none;transition:all 0.2s}
        .form-input:focus,.form-select:focus{border-color:var(--saffron);background:#fff;box-shadow:0 0 0 3px rgba(232,98,26,0.1)}
        .form-input::placeholder{color:var(--text-light)}
        .pill-group{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
        .pill-opt label{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:50px;font-size:0.82rem;font-weight:500;border:1.5px solid var(--border);color:var(--text-mid);background:var(--cream);cursor:pointer;transition:all 0.18s;user-select:none}
        .pill-opt input[type=radio]:checked+label{background:linear-gradient(135deg,var(--saffron),var(--gold));border-color:transparent;color:#fff;box-shadow:0 2px 10px rgba(232,98,26,0.3)}
        .pill-opt input[type=radio]{position:absolute;opacity:0;width:0;height:0}
        .qty-stepper{display:flex;align-items:center;border:1.5px solid var(--border);border-radius:9px;overflow:hidden;width:fit-content}
        .qty-btn{background:var(--cream);border:none;width:38px;height:40px;font-size:1.1rem;font-weight:600;color:var(--text-mid);cursor:pointer;transition:background 0.15s}
        .qty-btn:hover{background:var(--border)}
        .qty-input{width:60px;height:40px;border:none;border-left:1.5px solid var(--border);border-right:1.5px solid var(--border);text-align:center;font-size:0.95rem;font-weight:600;color:var(--text-dark);background:#fff;outline:none}
        .step-tag{font-size:0.62rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--saffron)}
        .hr-step{border:none;border-top:1px solid var(--border-light);margin:8px 0 20px}
        .bulk-warning{display:none;background:var(--saffron-pale);border:1px solid rgba(232,98,26,0.25);border-radius:8px;padding:10px 14px;font-size:0.78rem;color:var(--saffron-dark);margin-top:8px}
        .bulk-warning.show{display:block}
        .price-box{border:1.5px solid var(--border);border-radius:12px;overflow:hidden;margin-top:24px}
        .price-rows{background:var(--cream);padding:14px 18px}
        .price-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-light);font-size:0.82rem}
        .price-row:last-child{border-bottom:none;padding-bottom:4px}
        .price-row-key{color:var(--text-mid);font-weight:500}
        .price-row-val{font-weight:700;color:var(--text-dark)}
        .price-row.total .price-row-key{font-weight:700;color:var(--brown-dark);font-size:0.88rem}
        .price-row.total .price-row-val{color:var(--saffron);font-size:1.08rem}
        .price-timing{background:var(--gold-pale);border-top:1px solid #f0d870;padding:10px 18px;display:flex;flex-direction:column;gap:5px}
        .price-timing-row{display:flex;align-items:center;gap:7px;font-size:0.78rem;color:var(--brown-mid);font-weight:600}
        .price-note{font-size:0.74rem;color:var(--maroon);font-weight:500}
        .price-terms{background:#fff;border-top:1px solid var(--border-light);padding:14px 18px}
        .terms-text{font-size:0.72rem;color:var(--text-light);line-height:1.6;text-align:center;margin-bottom:14px}
        .terms-text a{color:var(--saffron);font-weight:600}
        .btn-full{width:100%;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg,var(--saffron),var(--gold));color:#fff;font-size:0.95rem;font-weight:700;box-shadow:0 4px 16px rgba(232,98,26,0.3);transition:all 0.2s;cursor:pointer}
        .btn-full:hover{opacity:0.92;transform:translateY(-1px)}
        .btn-full:disabled{opacity:.6;cursor:not-allowed}
        .btn-back{width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--border);background:transparent;color:var(--text-mid);font-size:0.84rem;font-weight:500;margin-top:10px;transition:all 0.18s;cursor:pointer}
        .btn-back:hover{background:var(--cream)}
        /* ── Success view ── */
        #view-success{min-height:100vh;background:radial-gradient(ellipse at 30% 60%,#FFCBA8 0%,#FFD9BC 30%,#FFE8D4 60%,#FFF3EC 100%);padding-top:68px}
        .success-wrap{max-width:480px;width:100%;text-align:center;padding:48px 24px;margin:0 auto;display:flex;flex-direction:column;align-items:center}
        .success-icon-circle{width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#ebf7ed,#d4edda);border:3px solid #b2dfbc;display:flex;align-items:center;justify-content:center;font-size:3rem;margin:0 auto 28px}
        .success-title{font-size:2.2rem;color:var(--brown-dark);margin-bottom:12px}
        .success-body{font-size:0.88rem;color:var(--text-mid);line-height:1.75;margin-bottom:28px}
        .success-ref{display:inline-block;background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:14px 28px;margin-bottom:24px}
        .success-ref-label{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-light);margin-bottom:5px}
        .success-ref-val{font-size:1.1rem;font-weight:700;color:var(--saffron);letter-spacing:0.06em}
        .status-pill-gold{display:inline-flex;align-items:center;gap:9px;background:var(--gold-pale);border:1.5px solid #f0d870;border-radius:50px;padding:8px 22px;font-size:0.82rem;font-weight:600;color:var(--gold);margin-bottom:32px}
        .pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--gold);animation:pulse 1.5s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .next-steps{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:20px 24px;text-align:left;margin-bottom:32px;width:100%}
        .next-steps-title{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--text-light);margin-bottom:14px}
        .next-step-item{display:flex;align-items:flex-start;gap:12px;font-size:0.82rem;color:var(--text-mid);margin-bottom:10px;line-height:1.5}
        .step-num{color:var(--saffron);font-weight:700;flex-shrink:0}
        .success-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        /* ── My bookings view ── */
        #view-bookings{min-height:100vh;background:radial-gradient(ellipse at 30% 60%,#FFCBA8 0%,#FFD9BC 30%,#FFE8D4 60%,#FFF3EC 100%);padding-top:68px}
        .bookings-wrap{max-width:760px;margin:0 auto;padding:36px 20px 56px}
        .bookings-page-header{text-align:center;margin-bottom:28px}
        .bookings-page-header h2{font-size:2.2rem;color:var(--brown-dark);margin-bottom:6px}
        .bookings-page-header p{font-size:0.88rem;color:#888}
        .bookings-card{background:#fff;border-radius:18px;box-shadow:0 8px 36px rgba(60,20,0,0.09);border:1px solid rgba(232,210,190,0.5);overflow:hidden}
        .bookings-card-header{padding:18px 24px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
        .bookings-card-header h3{font-size:1.05rem;color:var(--brown-dark)}
        .bk-tabs{display:flex;border-bottom:2px solid var(--border-light);padding:0 24px}
        .bk-tab-btn{padding:12px 16px;font-size:0.82rem;font-weight:600;border:none;background:none;cursor:pointer;color:var(--text-light);border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.15s;font-family:'Inter',sans-serif}
        .bk-tab-btn.active{color:var(--saffron-dark);border-bottom-color:var(--saffron)}
        .bk-empty{padding:52px 24px;text-align:center;color:var(--text-light);font-size:0.88rem}
        .bk-empty-icon{font-size:2.8rem;margin-bottom:12px}
        .bk-item{display:flex;align-items:center;gap:16px;padding:16px 24px;border-bottom:1px solid var(--border-light);transition:background 0.15s}
        .bk-item:last-child{border-bottom:none}
        .bk-item:hover{background:#FDFAF6}
        .bk-id{font-size:0.72rem;font-weight:700;color:var(--saffron);letter-spacing:0.05em;flex-shrink:0;width:96px}
        .bk-info{flex:1;min-width:0}
        .bk-name{font-size:0.9rem;font-weight:600;color:var(--brown-dark)}
        .bk-meta{font-size:0.74rem;color:var(--text-light);margin-top:3px}
        .bk-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 13px;border-radius:50px;font-size:0.7rem;font-weight:700;letter-spacing:0.04em}
        .bk-badge.pending{background:#FFF9E6;color:#C9920A;border:1px solid #f0d870}
        .bk-badge.approved{background:#EBF7ED;color:#2D7A3A;border:1px solid #b2dfbc}
        .bk-badge.declined{background:#FDECEA;color:#C0392B;border:1px solid #f5c6c2}
        .bk-badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
        /* ── Birthday view ── */
        #view-birthday,#view-bdy-success{min-height:100vh;background:radial-gradient(ellipse at 70% 40%,#FFD9BC 0%,#FFE8D4 40%,#FFF3EC 100%);padding-top:68px}
        .bdy-wrap{max-width:560px;margin:0 auto;padding:36px 20px 56px}
        .bdy-header{text-align:center;margin-bottom:28px}
        .bdy-header h2{font-size:2rem;color:var(--brown-dark);margin-bottom:6px;font-family:'Cormorant Garamond',serif}
        .bdy-header p{font-size:0.88rem;color:#888}
        .bdy-card{background:#fff;border-radius:18px;box-shadow:0 8px 36px rgba(60,20,0,0.09);border:1px solid rgba(232,210,190,0.5);overflow:hidden}
        .bdy-card-header{padding:18px 24px 14px;border-bottom:1px solid var(--border-light);background:linear-gradient(135deg,#7b1d1d,#c0392b)}
        .bdy-card-header h3{font-size:1.05rem;color:#fff}
        .bdy-card-header p{font-size:0.75rem;color:rgba(255,255,255,0.7);margin-top:3px}
        .bdy-card-body{padding:24px;display:flex;flex-direction:column;gap:16px}
        .bdy-info-banner{background:#fff8e1;border:1px solid #ffe082;border-radius:10px;padding:12px 16px;font-size:0.78rem;color:#7b5800;display:flex;gap:10px;align-items:flex-start;line-height:1.5}
        .bdy-section-head{font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-light);margin-bottom:10px}
        .bdy-portions-row{display:flex;align-items:center;border:1.5px solid var(--border);border-radius:9px;overflow:hidden;width:fit-content}
        .bdy-portions-btn{background:var(--cream);border:none;width:40px;height:42px;font-size:1.2rem;font-weight:600;color:var(--text-mid);cursor:pointer;transition:background 0.15s}
        .bdy-portions-btn:hover{background:var(--border)}
        .bdy-portions-val{width:56px;text-align:center;font-size:0.95rem;font-weight:700;color:var(--brown-dark);border:none;border-left:1.5px solid var(--border);border-right:1.5px solid var(--border);height:42px;outline:none;background:#fff}
        .bdy-success-card{background:#fff;padding:40px 28px;text-align:center}
        .bdy-success-icon{font-size:3rem;margin-bottom:14px}
        .bdy-success-id{font-size:1.5rem;font-weight:700;color:#c0392b;font-family:'Cormorant Garamond',serif;margin:10px 0}
        .bdy-success-msg{font-size:0.85rem;color:var(--text-mid);line-height:1.6;margin-bottom:24px}
        /* ── Menu modal ── */
        .meal-menu-overlay{display:none;position:fixed;inset:0;background:rgba(30,15,0,0.55);z-index:600;align-items:center;justify-content:center;backdrop-filter:blur(4px);padding:20px}
        .meal-menu-overlay.show{display:flex}
        .meal-menu-modal{background:#fff;border-radius:18px;max-width:420px;width:100%;overflow:hidden;box-shadow:0 24px 64px rgba(30,15,0,0.3)}
        .meal-menu-modal-header{background:linear-gradient(135deg,var(--brown-dark),var(--saffron));padding:22px 28px;display:flex;align-items:center;justify-content:space-between}
        .meal-menu-modal-header h3{font-size:1.1rem;color:#fff}
        .meal-menu-modal-close{background:rgba(255,255,255,0.18);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .meal-menu-modal-body{padding:22px 28px;font-size:0.88rem;color:var(--text-dark);line-height:1.8}
        .lookup-card-bk{padding:28px 24px;display:flex;flex-direction:column;align-items:center;gap:16px}
        @media(max-width:600px){.form-row{grid-template-columns:1fr}}
      `}</style>

      {/* ── Sticky Header ── */}
      <header className="site-header">
        <div className="header-logo" onClick={() => goTo('landing')}>
          <div className="header-lotus">🪷</div>
          <div>
            <div className="header-brand-name">HKM Chennai</div>
            <div className="header-brand-sub">Prasadam Seva</div>
          </div>
        </div>
        <nav className={`header-nav${mobileMenuOpen ? ' open' : ''}`}>
          <button className="nav-link" onClick={() => goTo('landing')}>Home</button>
          <button className="nav-link" onClick={() => { goTo('landing'); setTimeout(() => document.getElementById('seva-section')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Donate</button>
          <button className="nav-link" onClick={() => { goTo('landing'); setTimeout(() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>About</button>
          <button className={`nav-link${view === 'register' ? ' active' : ''}`} onClick={() => goTo('register')}>Prasadam Coupons</button>
          <button className={`nav-link${view === 'bookings' ? ' active' : ''}`} onClick={() => goTo('bookings')}>My Bookings</button>
          <button className={`nav-link${view === 'birthday' ? ' active' : ''}`} onClick={() => goTo('birthday')}>🎉 Party Booking</button>
          <button className="btn-admin" onClick={() => window.location.href = '/admin'}>🔐 Admin</button>
        </nav>
        <button className="hamburger-pub" onClick={() => setMobileMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </header>

      {/* ── Landing ── */}
      {view === 'landing' && (
        <div>
          <section className="hero" id="hero-section" style={{ paddingTop: 120 }}>
            <div className="hero-content">
              <div className="hero-logo-box">
                <div className="hero-logo-emblem">
                  <svg viewBox="0 0 36 36" fill="none" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6 C18 6, 11 13, 11 20 C11 24.4 14.1 27 18 27 C21.9 27 25 24.4 25 20 C25 13 18 6 18 6Z" fill="white" opacity="0.9"/>
                    <path d="M18 10 C18 10, 13.5 15.5 13.5 20 C13.5 22.8 15.5 24.5 18 24.5 C20.5 24.5 22.5 22.8 22.5 20 C22.5 15.5 18 10 18 10Z" fill="#C9920A"/>
                    <path d="M18 14 L18 24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="hero-logo-text">
                  <div className="hero-logo-srila">Srila Prabhupada&apos;s</div>
                  <div className="hero-logo-iskcon">ISKCON</div>
                  <div className="hero-logo-location">Thiruvanmiyur – Chennai</div>
                </div>
              </div>
              <h1 className="hero-title">Prasadam Seva</h1>
              <div className="hero-subtitle">Serve with Devotion</div>
              <p className="hero-desc">Offer prasadam and receive Krishna&apos;s blessings. Every meal served is an act of love and devotion.</p>
              <div className="hero-actions">
                <button className="btn-hero-primary" onClick={() => goTo('register')}>🙏 Donate Now</button>
                <button className="btn-hero-ghost" onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}>Learn More</button>
              </div>
            </div>
          </section>

          <section className="serve-section" id="serve-section">
            <div className="serve-header">
              <div className="section-tag">How to Participate</div>
              <h2 className="section-title">Ways to Serve</h2>
              <p className="section-sub">Choose how you&apos;d like to contribute towards Krishna&apos;s prasadam seva</p>
            </div>
            <div className="serve-grid">
              {[
                { icon: '🍛', cls: 's1', title: 'Annadanam Seva', desc: 'Sponsor daily prasadam for devotees and guests visiting the temple.' },
                { icon: '🎉', cls: 's2', title: 'Festival Seva', desc: 'Contribute towards grand festival prasadam during Janmashtami, Gaura Purnima & more.' },
                { icon: '🌿', cls: 's3', title: 'Daily Seva', desc: 'Support the daily operations of the temple kitchen serving hundreds every day.' },
                { icon: '🤝', cls: 's4', title: 'Community Feeding', desc: 'Help us serve free meals to the underprivileged through our food distribution programs.' },
              ].map(c => (
                <div key={c.title} className="serve-card">
                  <div className={`serve-icon ${c.cls}`}>{c.icon}</div>
                  <h4>{c.title}</h4>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="seva-section" id="seva-section">
            <div className="seva-inner">
              <div className="seva-lotus">🪷</div>
              <span className="section-tag">Start Your Seva</span>
              <div className="seva-divider" />
              <p className="seva-quote">&ldquo;If one offers Me with love and devotion a leaf, a flower, a fruit, or water, I will accept it.&rdquo;</p>
              <div className="seva-attribution">— Bhagavad Gita 9.26</div>
              <button className="btn-seva" onClick={() => goTo('register')}>🙏 Book Prasadam Coupon</button>
            </div>
          </section>

          <section className="about-section" id="about-section">
            <div className="about-inner">
              <div className="about-text">
                <div className="section-tag">About Us</div>
                <h2>About HKM Chennai</h2>
                <p>Hare Krishna Movement Chennai is dedicated to propagating the teachings of Lord Sri Krishna as presented in the Bhagavad Gita and Srimad Bhagavatam.</p>
                <p>Through our Annadanam program, we serve nutritious and delicious prasadam to devotees, visitors, and the underprivileged.</p>
                <div className="about-stats">
                  {[['500+', 'Meals Daily'], ['2', 'HKM Centres'], ['365', 'Days a Year']].map(([n, l]) => (
                    <div key={l} className="about-stat">
                      <div className="about-stat-num">{n}</div>
                      <div className="about-stat-label">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="about-visual">
                <div className="about-visual-lotus">🪷</div>
                <div className="about-visual-text">Hare Krishna Hare Krishna<br />Krishna Krishna Hare Hare<br />Hare Rama Hare Rama<br />Rama Rama Hare Hare</div>
              </div>
            </div>
          </section>

          <footer className="site-footer" id="footer-section">
            <div className="footer-inner">
              <div>
                <div className="footer-brand-name">Hare Krishna Movement Chennai</div>
                <div className="footer-brand-sub">Spreading the message of Bhagavad Gita and Srimad Bhagavatam.</div>
                <div className="footer-contact">
                  <div className="footer-contact-item">📧 krishnamrita@hkmchennai.org</div>
                  <div className="footer-contact-item">📞 7418420108</div>
                  <div className="footer-contact-item">📍 Hare Krishna Movement Chennai</div>
                </div>
              </div>
              <div>
                <div className="footer-col-title">Quick Links</div>
                <div className="footer-links">
                  <button onClick={() => goTo('landing')}>Home</button>
                  <button onClick={() => goTo('register')}>Donate</button>
                  <button onClick={() => goTo('register')}>Prasadam Coupons</button>
                </div>
              </div>
              <div>
                <div className="footer-col-title">Our Centres</div>
                <div className="footer-links">
                  <button>HKM Thiruvanmiyur</button>
                  <button>HKM NLBR</button>
                </div>
                <div style={{ marginTop: 24 }}>
                  <div className="footer-col-title">Admin</div>
                  <div className="footer-links">
                    <button onClick={() => window.location.href = '/admin'}>🔐 Admin Panel</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© 2026 Hare Krishna Movement Chennai. All rights reserved.</span>
              <span>Hare Krishna 🪷</span>
            </div>
          </footer>
        </div>
      )}

      {/* ── Registration ── */}
      {view === 'register' && (
        <div id="view-register">
          <div className="reg-page-header">
            <div className="reg-logo-box">
              <div style={{ width: 36, height: 36, background: '#C9920A', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.2rem' }}>🪷</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888' }}>Srila Prabhupada&apos;s</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', fontWeight: 700, color: '#1a2a6c', lineHeight: 1 }}>ISKCON</div>
                <div style={{ fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C9920A', marginTop: 1 }}>Thiruvanmiyur – Chennai</div>
              </div>
            </div>
            <h2>Prasadam Coupon Booking</h2>
            <p>Fill in your details to reserve your sacred meal coupon</p>
          </div>
          <div className="reg-page-body">
            <div className="reg-form-card">
              <div style={{ marginBottom: 8 }}><span className="step-tag">Step 1 — Personal Details</span></div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Full Name <span className="req">*</span></label>
                  <input className="form-input" type="text" placeholder="e.g. Radhakrishna Das" value={regName} onChange={e => setRegName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number <span className="req">*</span></label>
                  <input className="form-input" type="tel" placeholder="10-digit mobile" maxLength={10} value={regMobile} onChange={e => setRegMobile(e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(for digital coupon delivery)</span></label>
                <input className="form-input" type="email" placeholder="e.g. devotee@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              </div>

              <hr className="hr-step" />
              <div style={{ marginBottom: 8 }}><span className="step-tag">Step 2 — Location</span></div>
              <div className="form-group">
                <label className="form-label">HKM Centre <span className="req">*</span></label>
                <div className="pill-group">
                  {(['Thiruvanmiyur', 'NLBR'] as const).map(loc => (
                    <div key={loc} className="pill-opt">
                      <input type="radio" name="r-location" id={`r-loc-${loc}`} value={loc} checked={regLoc === loc} onChange={() => setRegLoc(loc)} />
                      <label htmlFor={`r-loc-${loc}`}>📍 HKM {loc}</label>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="hr-step" />
              <div style={{ marginBottom: 8 }}><span className="step-tag">Step 3 — Date</span></div>
              <div className="form-group">
                <label className="form-label">Event Date <span className="req">*</span></label>
                <select className="form-input" value={regDate} onChange={e => { setRegDate(e.target.value); setRegMeals({ Breakfast: 0, Lunch: 0, Dinner: 0 }); }}>
                  <option value="">— Select an available date —</option>
                  {availDates.map(d => {
                    const label = new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
                    return <option key={d} value={d}>{label}</option>;
                  })}
                </select>
              </div>

              {regDate && (
                <>
                  <hr className="hr-step" />
                  <div style={{ marginBottom: 8 }}><span className="step-tag">Step 4 — Coupons per Meal</span></div>
                  <div className="form-group">
                    <label className="form-label">Coupons per Meal <span className="req">*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                      {selectedMeals.map(meal => (
                        <div key={meal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>{mealIcon(meal)} {meal}</span>
                            <button
                              onClick={() => {
                                const txt = menuMap[regDate]?.[meal];
                                setMenuModal({ meal, text: txt ?? '' });
                              }}
                              style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--saffron-dark)', background: '#fff8ee', border: '1px solid #f5d78e', borderRadius: 5, padding: '2px 7px', cursor: 'pointer', opacity: menuMap[regDate]?.[meal] ? 1 : 0.45 }}>
                              🍽 Menu
                            </button>
                          </div>
                          <div className="qty-stepper">
                            <button className="qty-btn" onClick={() => setRegMeals(m => ({ ...m, [meal]: Math.max(0, m[meal] - 1) }))}>−</button>
                            <input className="qty-input" type="number" value={regMeals[meal]} readOnly />
                            <button className="qty-btn" onClick={() => setRegMeals(m => ({ ...m, [meal]: m[meal] + 1 }))}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`bulk-warning${totalCoupons >= 10 ? ' show' : ''}`}>
                      ⚠️ Bulk request (≥10 coupons). Admin review may be required.
                    </div>
                  </div>
                </>
              )}

              <div className="price-box">
                <div className="price-rows">
                  {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(m => {
                    const q = regMeals[m]; const r = PRICE_PER_MEAL[m];
                    return (
                      <div key={m} className="price-row">
                        <span className="price-row-key">{mealIcon(m)} {m}</span>
                        <span className="price-row-val">{q > 0 ? `${q} × ₹${r}/- = ₹${q * r}/-` : '—'}</span>
                      </div>
                    );
                  })}
                  <div className="price-row total">
                    <span className="price-row-key">Total Amount</span>
                    <span className="price-row-val">{totalAmount > 0 ? `₹${totalAmount}/-` : '—'}</span>
                  </div>
                </div>
                <div className="price-timing">
                  <div className="price-timing-row">🕖 Prasadam Timing: <strong>6:30 PM to 9:00 PM</strong></div>
                  <div className="price-note">⚠️ Note: The coupons are not valid on Festival days.</div>
                </div>
                <div className="price-terms">
                  <p className="terms-text">By continuing, you are agreeing to our <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a></p>
                  <button className="btn-full" onClick={submitReg} disabled={bookingLoading}>{bookingLoading ? 'Submitting…' : '🛒 BUY NOW'}</button>
                  <button className="btn-back" onClick={() => goTo('landing')}>← Back to Home</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {view === 'success' && (
        <div id="view-success">
          <div className="success-wrap">
            <div className="success-icon-circle">⏳</div>
            <h2 className="success-title">Booking Submitted!</h2>
            <p className="success-body">Your booking is under review. Our admin team will approve it shortly.<br /><br />You will receive a <strong>confirmation</strong> once the payment is verified.</p>
            <div className="success-ref">
              <div className="success-ref-label">Booking Reference</div>
              <div className="success-ref-val">{successId}</div>
            </div>
            <br />
            <div className="status-pill-gold">
              <span className="pulse-dot" />
              Payment Approval Pending
            </div>
            <div className="next-steps">
              <div className="next-steps-title">What happens next?</div>
              <div className="next-step-item"><span className="step-num">1.</span> Admin verifies your booking details</div>
              <div className="next-step-item"><span className="step-num">2.</span> Your booking is confirmed in our system</div>
              <div className="next-step-item"><span className="step-num">3.</span> Digital prasadam coupon is sent to your email</div>
            </div>
            <div className="success-actions">
              <button className="btn-full" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => { setSuccessId(''); setRegName(''); setRegMobile(''); setRegEmail(''); setRegLoc(''); setRegDate(''); setRegMeals({ Breakfast: 0, Lunch: 0, Dinner: 0 }); goTo('register'); }}>🪷 New Booking</button>
              <button className="btn-back" style={{ width: 'auto', padding: '12px 28px', marginTop: 0 }} onClick={() => goTo('landing')}>← Back to Home</button>
            </div>
          </div>
        </div>
      )}

      {/* ── My Bookings ── */}
      {view === 'bookings' && (
        <div id="view-bookings">
          <div className="bookings-wrap">
            <div className="bookings-page-header" style={{ position: 'relative' }}>
              <h2>📋 My Bookings</h2>
              <p>Enter your mobile number to view your booking history</p>
              <div onClick={() => setBkInput('9845012345')} style={{ position: 'absolute', top: 0, right: 0, background: '#fff7e6', border: '1.5px dashed var(--saffron-dark)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--saffron-dark)', letterSpacing: '.05em' }}>DEMO</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brown-dark)', letterSpacing: '.04em' }}>9845012345</div>
              </div>
            </div>

            {!bkMobile ? (
              <div className="bookings-card">
                <div className="lookup-card-bk">
                  <div style={{ fontSize: '2.5rem' }}>📱</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--brown-dark)' }}>Find Your Bookings</div>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>We&apos;ll look up all bookings linked to your mobile number</div>
                  </div>
                  <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="form-input" type="tel" maxLength={10} placeholder="Enter 10-digit mobile number"
                      style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.08em' }}
                      value={bkInput} onChange={e => setBkInput(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={e => { if (e.key === 'Enter') { if (/^\d{10}$/.test(bkInput)) setBkMobile(bkInput); else alert('Enter a valid 10-digit mobile'); } }} />
                    <button className="btn-full" onClick={() => { if (/^\d{10}$/.test(bkInput)) setBkMobile(bkInput); else alert('Enter a valid 10-digit mobile'); }}>
                      🔍 Find My Bookings
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>Showing bookings for <strong>{bkMobile}</strong></div>
                  <button onClick={() => { setBkMobile(null); setBkInput(''); }} style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: '0.75rem', color: 'var(--text-mid)', cursor: 'pointer' }}>← Search Again</button>
                </div>
                <div className="bookings-card">
                  <div className="bookings-card-header">
                    <h3>Booking History</h3>
                    <button className="btn-full" style={{ width: 'auto', padding: '9px 20px', fontSize: '0.8rem', borderRadius: 8 }} onClick={() => goTo('register')}>+ New Booking</button>
                  </div>
                  <div className="bk-tabs">
                    <button className={`bk-tab-btn${bkTab === 'coupons' ? ' active' : ''}`} onClick={() => setBkTab('coupons')}>🎟 Prasadam Coupons</button>
                    <button className={`bk-tab-btn${bkTab === 'birthday' ? ' active' : ''}`} onClick={() => setBkTab('birthday')}>🎉 Party Enquiries</button>
                  </div>
                  {bkTab === 'coupons' && (
                    <div>
                      {myBookings.length === 0 ? (
                        <div className="bk-empty"><div className="bk-empty-icon">🎟</div><p>No prasadam bookings found.</p></div>
                      ) : myBookings.map(b => (
                        <div key={b.id} className="bk-item">
                          <div className="bk-id">{b.id}</div>
                          <div className="bk-info">
                            <div className="bk-name">{b.name}</div>
                            <div className="bk-meta">{fmtDate(b.date)} · {b.location}</div>
                          </div>
                          <div className="bk-status">
                            <div className={`bk-badge ${statusBadge(b.status)}`}>
                              <span className="bk-badge-dot" />
                              {b.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {bkTab === 'birthday' && (
                    <div>
                      {myEnquiries.length === 0 ? (
                        <div className="bk-empty"><div className="bk-empty-icon">🎉</div><p>No party enquiries found.</p></div>
                      ) : myEnquiries.map(e => (
                        <div key={e.id} className="bk-item">
                          <div className="bk-id">{e.id}</div>
                          <div className="bk-info">
                            <div className="bk-name">{e.name}</div>
                            <div className="bk-meta">{fmtDate(e.eventDate)} · {e.address.slice(0, 40)}{e.address.length > 40 ? '…' : ''}</div>
                            {e.confirmedMenu && <div style={{ fontSize: '0.74rem', color: 'var(--green)', marginTop: 2 }}>✅ {e.confirmedMenu}{e.confirmedPrice ? ` — ₹${e.confirmedPrice}` : ''}</div>}
                          </div>
                          <div className="bk-status">
                            <div className={`bk-badge ${statusBadge(e.status)}`}>
                              <span className="bk-badge-dot" />
                              {e.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Birthday/Party ── */}
      {view === 'birthday' && (
        <div id="view-birthday">
          <div className="bdy-wrap">
            <div className="bdy-header">
              <h2>🎉 Party Booking</h2>
              <p>Order prasadam for your special day — delivered to your door</p>
            </div>
            <div className="bdy-card">
              <div className="bdy-card-header">
                <h3>🏠 Door Delivery Enquiry</h3>
                <p>Admin will confirm your booking within 24–48 hours</p>
              </div>
              <div className="bdy-card-body">
                <div className="bdy-info-banner">
                  ⏰ <span>Bookings must be placed <strong>at least 7 days</strong> before the event date.</span>
                </div>
                <div>
                  <div className="bdy-section-head">Personal Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input className="form-input" type="text" placeholder="Your full name" value={bdyName} onChange={e => setBdyName(e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Mobile <span className="req">*</span></label>
                        <input className="form-input" type="tel" maxLength={10} placeholder="10-digit number" value={bdyMobile} onChange={e => setBdyMobile(e.target.value.replace(/\D/g, ''))} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="Optional" value={bdyEmail} onChange={e => setBdyEmail(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bdy-section-head">Event Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Event Date <span className="req">*</span></label>
                      <input className="form-input" type="date" min={minBdyDate} style={{ maxWidth: 200 }} value={bdyDate} onChange={e => setBdyDate(e.target.value)} />
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: 4 }}>Minimum 7 days from today</div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Delivery Address <span className="req">*</span></label>
                      <textarea className="form-input" rows={3} placeholder="Full delivery address including landmark" style={{ resize: 'vertical' }} value={bdyAddress} onChange={e => setBdyAddress(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Plate Count per Meal <span className="req">*</span></label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                        {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(m => (
                          <div key={m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>{mealIcon(m)} {m}</span>
                            <div className="bdy-portions-row">
                              <button className="bdy-portions-btn" onClick={() => setBdyMeals(prev => ({ ...prev, [m]: Math.max(0, prev[m] - 5) }))}>−</button>
                              <input className="bdy-portions-val" type="number" value={bdyMeals[m]} readOnly />
                              <button className="bdy-portions-btn" onClick={() => setBdyMeals(prev => ({ ...prev, [m]: prev[m] + 5 }))}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: 6 }}>Minimum 10 total plates across all meals</div>
                    </div>
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Preferred Menu</label>
                  <textarea className="form-input" rows={3} placeholder="e.g. Puri Bhaji, Rice Dal Sabzi, Halwa…" style={{ resize: 'vertical' }} value={bdyMenu} onChange={e => setBdyMenu(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Preferred Price</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
                    <span style={{ padding: '0 10px', fontSize: '0.9rem', color: 'var(--text-light)', borderRight: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', background: '#fafafa', alignSelf: 'stretch' }}>₹</span>
                    <input className="form-input" type="number" min="0" placeholder="e.g. 5000" style={{ border: 'none', borderRadius: 0, flex: 1, margin: 0 }} value={bdyPrice} onChange={e => setBdyPrice(e.target.value)} />
                  </div>
                </div>
                <button className="btn-full" onClick={submitBdy} disabled={enquiryLoading}>{enquiryLoading ? 'Submitting…' : '🎂 Submit Enquiry'}</button>
                <button className="btn-back" onClick={() => goTo('landing')}>← Back to Home</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Birthday success ── */}
      {view === 'bdy-success' && (
        <div id="view-bdy-success">
          <div className="bdy-wrap">
            <div className="bdy-card">
              <div className="bdy-success-card">
                <div className="bdy-success-icon">🎉</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-dark)' }}>Enquiry Submitted!</div>
                <div className="bdy-success-id">{bdySuccessId}</div>
                <div className="bdy-success-msg">
                  Your party prasadam enquiry has been received.<br />
                  Our admin team will <strong>contact you within 24–48 hours</strong> to confirm details.
                </div>
                <div style={{ background: 'var(--saffron-pale)', borderRadius: 10, padding: '14px 16px', fontSize: '0.78rem', color: 'var(--saffron-dark)', textAlign: 'left', marginBottom: 20 }}>
                  <strong>What happens next?</strong><br /><br />
                  1. Admin reviews your enquiry<br />
                  2. You receive a confirmation call / message<br />
                  3. Payment details shared upon acceptance<br />
                  4. Prasadam delivered on your event date 🎂
                </div>
                <button className="btn-full" style={{ marginBottom: 10 }} onClick={() => { setBkMobile(bdyMobile); setBkInput(bdyMobile); goTo('bookings'); }}>📋 View My Enquiries</button>
                <button className="btn-back" onClick={() => goTo('landing')}>← Back to Home</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Menu Modal ── */}
      {menuModal && (
        <div className="meal-menu-overlay show" onClick={() => setMenuModal(null)}>
          <div className="meal-menu-modal" onClick={e => e.stopPropagation()}>
            <div className="meal-menu-modal-header">
              <h3>{mealIcon(menuModal.meal)} {menuModal.meal} Menu</h3>
              <button className="meal-menu-modal-close" onClick={() => setMenuModal(null)}>✕</button>
            </div>
            <div className="meal-menu-modal-body">
              {menuModal.text
                ? menuModal.text.split('\n').filter(Boolean).map((line, i) => <div key={i} style={{ padding: '3px 0' }}>• {line}</div>)
                : <div style={{ color: '#aaa', fontSize: '.85rem', textAlign: 'center', padding: '10px 0' }}>No menu added for this meal yet.</div>
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
}
