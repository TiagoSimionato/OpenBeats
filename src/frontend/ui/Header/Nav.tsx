'use client';

import { ROUTES } from 'configs/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    highlight: '/release',
    href: ROUTES.HOME,
    label: 'Library',
  },
  {
    href: ROUTES.SEARCH,
    label: 'Search',
  },
  {
    href: ROUTES.SETTINGS,
    label: 'Settings',
  },
];

export const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className="basis-full md:basis-auto">
      <ul className="flex justify-center gap-5">
        {menuItems.map(({ highlight, href, label }) => {
          const shouldHighlight
            = pathname === ROUTES.HOME
              ? href === ROUTES.HOME
              : pathname.startsWith(highlight ?? href);

          return (
            <li className={`${shouldHighlight ? 'text-primary' : ''}`} key={label}>
              <Link href={href}>{label}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
