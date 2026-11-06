import type { ComponentProps } from 'react';
import { usePaginationControls } from 'frontend/hooks/usePaginationControls';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from './Button';

type PaginationControlsProps = ComponentProps<'div'> & {
  pages: number;
};

export const PaginationControls = ({ className, pages, ...rest }: PaginationControlsProps) => {
  const params = useSearchParams();

  const { handlePageChange, handlePerPageChange } = usePaginationControls();

  const page = Number(params.get('page') ?? 1);
  const perPage = Number(params.get('perPage') ?? 18);

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
