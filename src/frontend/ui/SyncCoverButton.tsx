'use client';

import type { ScanLibraryReleasesResponse } from 'common/types/requests/library';
import { useQueryClient } from '@tanstack/react-query';
import { useSyncCovers } from 'frontend/services/api/mutations/scanLibrary';
import { LIBRARY_QUERY_KEY } from 'frontend/services/api/queries/library';
import { Button } from './Button';

export const SyncCoversButton = () => {
  const queryClient = useQueryClient();
  const syncCovers = useSyncCovers({
    options: {
      onSuccess: async (_data: ScanLibraryReleasesResponse) => {
        await queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      },
    },
  });

  const handleSyncCovers = () => {
    if (syncCovers.isPending) {
      return;
    }

    syncCovers.mutateAsync();
  };

  return (
    <Button
      className="min-w-32 transition-colors"
      isLoading={syncCovers.isPending}
      onClick={handleSyncCovers}
      variant="secondary"
    >
      Sync Covers
    </Button>
  );
};
