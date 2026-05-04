'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/services/authApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('hkm_admin_token')) {
      router.replace('/admin');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await login({ email, password });
    if ('data' in res && res.data) {
      localStorage.setItem('hkm_admin_token', res.data.token);
      router.replace('/admin');
    } else if ('error' in res) {
      const err = res.error as { status?: number };
      if (err.status === 'FETCH_ERROR' as unknown || err.status === undefined) {
        setError('Cannot reach server. Make sure the backend is running on port 5000.');
      } else {
        setError('Invalid email or password');
      }
    }
  }

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <div style={{ background: '#fffdf8', border: '1px solid #f0e6d3', borderRadius: 12, padding: 32 }}>
        <h1 style={{ color: '#c0392b', marginBottom: 4, fontSize: 22 }}>⚙️ Admin Login</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>HKM Prasadam Management</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password *"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && (
            <p style={{ color: '#c0392b', fontSize: 13, margin: 0 }}>⚠️ {error}</p>
          )}
          <button type="submit" disabled={isLoading}
            style={{ ...btnStyle, opacity: isLoading ? 0.6 : 1 }}>
            {isLoading ? 'Logging in…' : '🔐 Login'}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #e0d8cc',
  borderRadius: 8, fontSize: 14, fontFamily: 'Inter, sans-serif',
  outline: 'none', boxSizing: 'border-box',
};
const btnStyle: React.CSSProperties = {
  padding: 12, background: '#c0392b', color: '#fff', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14,
  fontFamily: 'Inter, sans-serif',
};
