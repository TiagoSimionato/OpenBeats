import { CUSTOM_HEADERS } from 'configs/constants';
import { headers } from 'next/headers';
import Link from 'next/link';

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

export const Nav = async () => {
  const headerList = await headers();
  const pathname = headerList.get(CUSTOM_HEADERS.PATH_NAME);

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
