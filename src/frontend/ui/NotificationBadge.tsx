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
      <Link {...props} className={`relative ${className}`} href={ROUTES.FAILED_TRACKS}>
        <BellIcon />
        <span className="absolute bottom-2/5 left-full text-sm">{data?.amount}</span>
      </Link>
    )
  );
};
