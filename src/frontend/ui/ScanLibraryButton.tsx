'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useScanLibrary } from 'frontend/services/api/mutations/scanLibrary';
import { LIBRARY_QUERY_KEY } from 'frontend/services/api/queries/library';
import { Button } from './Button';

export const ScanLibraryButton = () => {
  const queryClient = useQueryClient();
  const scanLibrary = useScanLibrary({
    options: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      },
    },
  });

  const handleRescanLibrary = () => {
    if (scanLibrary.isPending) {
      return;
    }

    scanLibrary.mutateAsync();
  };

  return (
    <Button
      className="ml-auto min-w-32 transition-colors"
      isLoading={scanLibrary.isPending}
      onClick={handleRescanLibrary}
      variant="secondary"
    >
      Scan library
    </Button>
  );
};
