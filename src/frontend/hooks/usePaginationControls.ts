import type { ChangeEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export const usePaginationControls = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const handlePerPageChange = (event: ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
    const searchParams = new URLSearchParams(params);

    if (event.target.value !== '18') {
      searchParams.set('perPage', event.target.value);
    }
    if (event.target.value === '18') {
      searchParams.delete('perPage');
    }

    router.push(`${pathname}?${searchParams.toString()}`, { scroll: false });
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      const searchParams = new URLSearchParams(params);

      if (newPage !== 1) {
        searchParams.set('page', `${newPage}`);
      }
      if (newPage === 1) {
        searchParams.delete('page');
      }

      router.push(`${pathname}?${searchParams.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return { handlePageChange, handlePerPageChange };
};
