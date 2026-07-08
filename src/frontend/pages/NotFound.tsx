'use client';

import { Icon } from 'frontend/ui/Icon';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const NotFoundPage = () => {
  const router = useRouter();

  return (
    <div className="flex grow flex-col items-center justify-center gap-4">
      <Icon className="w-24" name="search-off" />
      <p className="text-lg">This page could not be found.</p>
      <button
        className="text-primary flex cursor-pointer gap-1 font-bold"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon />
        {' '}
        Go back
      </button>
    </div>
  );
};
