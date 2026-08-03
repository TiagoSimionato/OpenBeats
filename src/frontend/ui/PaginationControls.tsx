import type { ChangeEvent, ComponentProps } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { Button } from './Button';

type PaginationControlsProps = ComponentProps<'div'> & {
  pages: number;
};

export const PaginationControls = ({ className, pages, ...rest }: PaginationControlsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const page = Number(params.get('page') ?? 1);
  const perPage = Number(params.get('perPage') ?? 18);

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

  useEffect(() => {
    if (page > pages && pages > 0) {
      handlePageChange(pages);
    }
  }, [page, pages, handlePageChange]);

  return (
    <div className={`flex justify-end gap-4 ${className}`} {...rest}>
      <p>Items per page:</p>
      <select onChange={handlePerPageChange} value={perPage}>
        <option value={18}>18</option>
        <option value={36}>36</option>
        <option value={72}>72</option>
      </select>
      <p>
        {page * perPage}
        {' '}
        of
        {` ${pages * perPage}`}
      </p>
      {page > 1 && (
        <Button onClick={() => handlePageChange(page - 1)} size="xs" variant="tertiary">
          Prev
        </Button>
      )}
      {page < pages && (
        <Button onClick={() => handlePageChange(page + 1)} size="xs" variant="tertiary">
          Next
        </Button>
      )}
    </div>
  );
};
