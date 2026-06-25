'use client';

import type { ScanLibraryReleasesResponse } from 'backend/downloads/types';
import { useQueryClient } from '@tanstack/react-query';
import { LIBRARY_QUERY_KEY, useScanLibrary } from 'frontend/services';
import { Spinner } from './Spinner';

export const ScanLibraryButton = () => {
  const queryClient = useQueryClient();
  const scanLibrary = useScanLibrary({
    options: {
      onSuccess: async (_data: ScanLibraryReleasesResponse) => {
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
    <button
      className="rounded ml-auto border min-w-32 border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50"
      disabled={scanLibrary.isPending}
      onClick={handleRescanLibrary}
      type="button"
    >
      {scanLibrary.isPending
        ? (
            <span className="flex items-center grow justify-center gap-2">
              <Spinner color="text-zinc-800" size="lg" />
            </span>
          )
        : 'Scan library'}
    </button>
  );
};
