'use client';

import { ROUTES } from 'configs/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    href: ROUTES.HOME,
    label: 'Library',
  },
  {
    href: ROUTES.SEARCH,
    label: 'Search',
  },
];

export const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className="basis-full md:basis-auto">
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
