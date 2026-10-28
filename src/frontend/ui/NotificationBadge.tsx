'use client';

import type { LinkProps } from 'next/link';
import { ROUTES } from 'configs/routes';
import { useGetFailedTracksAmount } from 'frontend/services/api/queries/failedTracks';
import { BellIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NotificationBadgeProps = Omit<LinkProps, 'href'> & { className?: string };

export const NotificationBadge = ({ className, ...props }: NotificationBadgeProps) => {
  const { data } = useGetFailedTracksAmount();
  const pathname = usePathname();

  const isViewingAnotherPage = pathname !== ROUTES.FAILED_TRACKS;
  const areThereFailedTracks = (data?.amount ?? 0) > 0;

  const shouldRender = isViewingAnotherPage && areThereFailedTracks;

  return (
    shouldRender && (
      <Link
        {...props}
        className={`relative rounded-full [&>.underlay]:hover:bg-white/30 ${className}`}
        href={ROUTES.FAILED_TRACKS}
      >
        <span
          aria-hidden
          className="underlay absolute top-1/2 left-1/2 -translate-1/2 rounded-full p-6"
        />
        <BellIcon />
        <span className="absolute bottom-2/5 left-10/12 text-sm font-bold">{data?.amount}</span>
      </Link>
    )
  );
};
