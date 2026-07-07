'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    href: '/',
    label: 'Library',
  },
  {
    href: '/search',
    label: 'Search',
  },
];

export const Nav = () => {
  const pathname = usePathname();

  return (
    <nav>
      <ul className="flex gap-5">
        {menuItems.map(({ href, label }) => (
          <li className={`${pathname === href ? 'text-primary' : ''}`} key={label}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
