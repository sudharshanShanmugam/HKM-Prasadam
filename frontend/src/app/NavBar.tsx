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
    <nav className="bg-[#c0392b] px-4 flex items-center gap-1">
      {/* Logo */}
      <div className="bg-white rounded-lg px-2 py-1 mr-3 my-1.5 flex items-center">
        <img
          src="/iskcon-logo.png"
          alt="ISKCON Thiruvanmiyur Chennai"
          className="h-8 w-auto object-contain block"
        />
      </div>

      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className={[
            'px-[14px] py-3 text-white no-underline text-[13px] font-semibold',
            pathname === l.href
              ? 'border-b-[3px] border-white opacity-100'
              : 'border-b-[3px] border-transparent opacity-75',
          ].join(' ')}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
