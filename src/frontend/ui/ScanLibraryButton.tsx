'use client';

import { useScanLibrary } from 'frontend/services/api/mutations/scanLibrary';
import { Button } from './Button';

export const ScanLibraryButton = () => {
  const { isPending, mutateAsync: scanLibrary } = useScanLibrary();

  return (
    <Button
      className="min-w-32 transition-colors"
      isLoading={isPending}
      onClick={() => scanLibrary()}
      variant="secondary"
    >
      Scan library
    </Button>
  );
};
