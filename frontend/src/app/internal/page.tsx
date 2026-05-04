'use client';

import { useState, useEffect } from 'react';
import { useCreateInternalOrderMutation, useGetInternalOrdersQuery } from '@/services/internalOrdersApi';
import type { Department, MealType, CreateInternalOrderDto, InternalOrder } from '@/types';

type ViewName = 'book' | 'mybk';

export default function InternalPage() {
  const [view, setView] = useState<ViewName>('book');
  const [createOrder, { isLoading }] = useCreateInternalOrderMutation();

  // Form state
  const today = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [date, setDate] = useState(today);
  const [dept, setDept] = useState('');
  const [meal, setMeal] = useState('');
  const [count, setCount] = useState('');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState<InternalOrder | null>(null);

  // My bookings lookup
  const [bkMobile, setBkMobile] = useState('');
  const [activeMobile, setActiveMobile] = useState<string | null>(null);
  const [lookupErr, setLookupErr] = useState('');
  const { data: myOrders = [], isFetching } = useGetInternalOrdersQuery(
    { mobile: activeMobile ?? '' },
    { skip: !activeMobile }
  );

  const [toast, setToast] = useState('');
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function showToast(msg: string) { setToast(msg); }

  async function submitInternal() {
    if (!name) { showToast('Please enter your name ⚠️'); return; }
    if (!mobile || mobile.length !== 10) { showToast('Enter a valid 10-digit mobile ⚠️'); return; }
    if (!date) { showToast('Please select a date ⚠️'); return; }
    if (!dept) { showToast('Please select your department ⚠️'); return; }
    if (!meal) { showToast('Please select a meal type ⚠️'); return; }
    if (!count || parseInt(count) < 1) { showToast('Count must be at least 1 ⚠️'); return; }
    if (!location) { showToast('Please enter a delivery location ⚠️'); return; }
    const dto: CreateInternalOrderDto = { name, mobile, date, dept: dept as Department, meal: meal as MealType, count: parseInt(count), location };
    const res = await createOrder(dto);
    if ('data' in res && res.data) setSubmitted(res.data);
  }

  function resetForm() {
    setName(''); setMobile(''); setDate(today); setDept(''); setMeal('');
    setCount(''); setLocation(''); setSubmitted(null);
  }

  function lookupMyOrders() {
    if (!/^\d{10}$/.test(bkMobile)) { setLookupErr('Please enter a valid 10-digit mobile number.'); return; }
    setLookupErr('');
    setActiveMobile(bkMobile);
  }

  function resetLookup() {
    setActiveMobile(null); setBkMobile(''); setLookupErr('');
  }

  function mealLabel(m: string) {
    if (m === 'Breakfast') return '🌅 Breakfast';
    if (m === 'Lunch') return '☀️ Lunch';
    return '🌙 Dinner';
  }

  function statusInfo(o: InternalOrder): { cls: string; label: string } {
    if (o.delivered) return { cls: 's-delivered', label: '🚚 Delivered' };
    if (o.accepted)  return { cls: 's-accepted',  label: '✅ Accepted' };
    return { cls: 's-pending', label: '⏳ Pending' };
  }

  function fmtDate(d: string) {
    try { return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--saffron:#e07b2a;--saffron-dark:#c0621a;--brown-dark:#4a2c0a;--green:#1a7a5e;--red:#c0392b;--border:#e8d5b5;--bg:#fdf8f0;--text:#2d1a05;--text-mid:#6b4c2a;--text-light:#9a7a55}
        body{font-family:Inter,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
        .header{background:linear-gradient(135deg,#8e1a0e 0%,#c0392b 60%,#e07b2a 100%);padding:16px 20px;color:#fff;position:relative;text-align:center}
        .header-om{font-size:1.3rem;opacity:.85}
        .header h1{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700;letter-spacing:.03em}
        .header p{font-size:.72rem;opacity:.75;margin-top:2px}
        .mybk-btn{position:absolute;top:50%;right:16px;transform:translateY(-50%);background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.45);color:#fff;border-radius:8px;padding:7px 13px;font-size:.8rem;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;white-space:nowrap;transition:background .2s}
        .mybk-btn:hover{background:rgba(255,255,255,.28)}
        .container{max-width:480px;margin:0 auto;padding:24px 16px 40px}
        .card{background:#fff;border-radius:14px;box-shadow:0 2px 16px rgba(160,100,30,.1);padding:24px 20px}
        .card-title{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:700;color:var(--brown-dark);margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--border);display:flex;align-items:center;gap:8px}
        .form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
        .form-label{font-size:.82rem;font-weight:600;color:var(--text-mid)}
        .form-label .req{color:var(--saffron-dark);margin-left:2px}
        .form-input{border:1.5px solid var(--border);border-radius:10px;padding:10px 13px;font-size:.92rem;font-family:Inter,sans-serif;color:var(--text);outline:none;transition:border-color .2s;width:100%;background:#fff}
        .form-input:focus{border-color:var(--saffron)}
        select.form-input{cursor:pointer}
        .btn-submit{width:100%;padding:13px;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#c0392b,#e07b2a);color:#fff;font-size:1rem;font-weight:700;font-family:Inter,sans-serif;margin-top:8px;letter-spacing:.03em}
        .btn-submit:disabled{opacity:.6;cursor:not-allowed}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);background:#222;color:#fff;padding:10px 20px;border-radius:20px;font-size:.85rem;transition:transform .3s,opacity .3s;opacity:0;z-index:999;pointer-events:none}
        .toast.show{transform:translateX(-50%) translateY(0);opacity:1}
        .success-card{background:#fff;border-radius:14px;box-shadow:0 2px 16px rgba(160,100,30,.1);padding:36px 24px;text-align:center}
        .success-icon{font-size:3rem;margin-bottom:12px}
        .success-title{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:700;color:var(--green)}
        .success-id{font-size:.82rem;color:var(--text-light);margin-top:6px}
        .success-details{background:var(--bg);border-radius:10px;padding:14px 16px;margin:16px 0;text-align:left;font-size:.85rem;line-height:1.8}
        .success-details strong{color:var(--brown-dark)}
        .btn-outline{background:none;border:2px solid var(--saffron);color:var(--saffron-dark);border-radius:10px;padding:10px 24px;font-size:.9rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif}
        .info-strip{background:#fff8ee;border:1px solid #f5d78e;border-radius:10px;padding:10px 14px;margin-bottom:20px;font-size:.8rem;color:var(--saffron-dark);display:flex;gap:8px;align-items:flex-start}
        .page-header{display:flex;align-items:center;gap:10px;margin-bottom:18px}
        .back-btn{background:none;border:1.5px solid var(--border);border-radius:8px;padding:6px 12px;font-size:.78rem;color:var(--text-mid);cursor:pointer;font-family:Inter,sans-serif;white-space:nowrap}
        .lookup-card{background:#fff;border-radius:14px;box-shadow:0 2px 16px rgba(160,100,30,.1);padding:28px 20px;display:flex;flex-direction:column;align-items:center;gap:14px}
        .lookup-err{font-size:.78rem;color:var(--red);text-align:center;min-height:18px}
        .order-item{background:#fff;border-radius:12px;box-shadow:0 1px 8px rgba(160,100,30,.08);padding:16px;margin-bottom:12px}
        .order-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px;flex-wrap:wrap}
        .order-id{font-size:.72rem;font-weight:700;color:var(--saffron-dark);background:#fff8ee;border:1px solid #f5d78e;border-radius:20px;padding:2px 10px}
        .order-meta{font-size:.8rem;color:var(--text-mid);display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
        .status-pill{border-radius:20px;padding:3px 10px;font-size:.72rem;font-weight:700;white-space:nowrap}
        .s-pending{background:#fff3cd;color:#856404;border:1px solid #ffc10755}
        .s-accepted{background:#d4edda;color:#155724;border:1px solid #28a74555}
        .s-delivered{background:#e8d5ff;color:#4b0082;border:1px solid #6f42c155}
        .bk-empty{text-align:center;padding:32px 16px;color:#aaa}
        .bk-empty-icon{font-size:2.5rem;margin-bottom:10px}
        .demo-chip{background:#fff7e6;border:1.5px dashed var(--saffron-dark);border-radius:8px;padding:5px 10px;cursor:pointer;text-align:right}
      `}</style>

      <div className="header">
        <div className="header-om">🕉</div>
        <h1>Hare Krishna Movement</h1>
        <p>Internal Prasadam Booking — Staff Only</p>
        <button className="mybk-btn" onClick={() => setView('mybk')}>📦 My Bookings</button>
      </div>

      <div className="container">

        {/* ── Booking View ── */}
        {view === 'book' && (
          <div>
            <div className="info-strip">
              <span>ℹ️</span>
              <span>This form is for internal departments only. Orders will be reviewed and confirmed by the admin.</span>
            </div>

            {submitted ? (
              <div className="success-card">
                <div className="success-icon">✅</div>
                <div className="success-title">Request Submitted!</div>
                <div className="success-id">{submitted.id}</div>
                <div className="success-details">
                  <strong>Name:</strong> {submitted.name}<br />
                  <strong>Mobile:</strong> {submitted.mobile}<br />
                  <strong>Date:</strong> {fmtDate(submitted.date)}<br />
                  <strong>Department:</strong> {submitted.dept}<br />
                  <strong>Meal:</strong> {submitted.meal}<br />
                  <strong>Count:</strong> {submitted.count} plates<br />
                  <strong>Delivery Location:</strong> {submitted.location}
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-outline" onClick={resetForm}>+ New Request</button>
                  <button className="btn-outline" onClick={() => { setView('mybk'); }} style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>📦 My Bookings</button>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-title">🏛 Internal Prasadam Request</div>
                <div className="form-group">
                  <label className="form-label">Name <span className="req">*</span></label>
                  <input className="form-input" type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number <span className="req">*</span></label>
                  <input className="form-input" type="tel" maxLength={10} placeholder="10-digit mobile number" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date Required <span className="req">*</span></label>
                  <input className="form-input" type="date" value={date} min={today} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department <span className="req">*</span></label>
                  <select className="form-input" value={dept} onChange={e => setDept(e.target.value)}>
                    <option value="">— Select Department —</option>
                    {['Temple Administration','Deity Department','Kitchen / Prasadam','Education / Gurukul','Guest House','Security','Accounts','Outreach / Sankirtan','IT / Media','Others'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Meal Type <span className="req">*</span></label>
                  <select className="form-input" value={meal} onChange={e => setMeal(e.target.value)}>
                    <option value="">— Select Meal —</option>
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Count Needed <span className="req">*</span></label>
                  <input className="form-input" type="number" min="1" placeholder="Number of plates" value={count} onChange={e => setCount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Location <span className="req">*</span></label>
                  <textarea className="form-input" rows={3} placeholder="Room / hall / building name for delivery" style={{ resize: 'vertical', minHeight: 72 }} value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <button className="btn-submit" onClick={submitInternal} disabled={isLoading}>
                  {isLoading ? 'Submitting…' : '📋 Submit Request'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── My Bookings View ── */}
        {view === 'mybk' && (
          <div>
            <div className="page-header" style={{ position: 'relative' }}>
              <button className="back-btn" onClick={() => setView('book')}>← Back</button>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-dark)' }}>📦 My Bookings</div>
              <div className="demo-chip" style={{ position: 'absolute', top: 0, right: 0 }} onClick={() => setBkMobile('9845012345')}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--saffron-dark)', letterSpacing: '.05em' }}>DEMO</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brown-dark)', letterSpacing: '.04em' }}>9845012345</div>
              </div>
            </div>

            {!activeMobile ? (
              <div className="lookup-card">
                <div style={{ fontSize: '2.2rem' }}>📱</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.05rem', fontWeight: 700, color: 'var(--brown-dark)' }}>Find Your Orders</div>
                  <div style={{ fontSize: '.78rem', color: '#888', marginTop: 3 }}>Enter your mobile number to view all requests</div>
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input className="form-input" type="tel" maxLength={10} placeholder="10-digit mobile number"
                    style={{ textAlign: 'center', fontSize: '1.05rem', letterSpacing: '.08em' }}
                    value={bkMobile} onChange={e => setBkMobile(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => { if (e.key === 'Enter') lookupMyOrders(); }} />
                  <div className="lookup-err">{lookupErr}</div>
                  <button className="btn-submit" onClick={lookupMyOrders}>🔍 Find My Orders</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-mid)' }}>Showing orders for <strong>{activeMobile}</strong></div>
                  <button className="back-btn" onClick={resetLookup}>← Change Number</button>
                </div>
                {isFetching ? (
                  <p style={{ textAlign: 'center', color: '#aaa', fontSize: '.88rem' }}>Loading…</p>
                ) : myOrders.length === 0 ? (
                  <div className="bk-empty">
                    <div className="bk-empty-icon">📦</div>
                    <p style={{ fontSize: '.88rem' }}>No orders found for this number.</p>
                    <button className="btn-submit" style={{ width: 'auto', padding: '9px 20px', fontSize: '.85rem', marginTop: 14 }} onClick={() => setView('book')}>+ New Booking</button>
                  </div>
                ) : myOrders.map(o => {
                  const { cls, label } = statusInfo(o);
                  return (
                    <div key={o.id} className="order-item">
                      <div className="order-top">
                        <span className="order-id">{o.id}</span>
                        <span className={`status-pill ${cls}`}>{label}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '.92rem', marginBottom: 4 }}>{o.name}</div>
                      <div className="order-meta">
                        <span>📅 {fmtDate(o.date)}</span>
                        <span>🏛 {o.dept}</span>
                        {o.meal && <span>{mealLabel(o.meal)}</span>}
                        <span>🍽 {o.count} plates</span>
                      </div>
                      {o.location && <div style={{ fontSize: '.78rem', color: 'var(--text-mid)', marginTop: 4 }}>📍 {o.location}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </>
  );
}
