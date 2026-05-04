'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: '🙏 Book Prasadam' },
  { href: '/internal', label: '🏛 Internal Order' },
  { href: '/admin', label: '⚙️ Admin' },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav style={{
      background: '#c0392b', padding: '0 16px',
      display: 'flex', gap: 4, alignItems: 'center',
    }}>
      {links.map(l => (
        <Link key={l.href} href={l.href} style={{
          padding: '12px 14px', color: '#fff', textDecoration: 'none',
          fontSize: 13, fontWeight: 600,
          borderBottom: pathname === l.href ? '3px solid #fff' : '3px solid transparent',
          opacity: pathname === l.href ? 1 : 0.75,
        }}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
