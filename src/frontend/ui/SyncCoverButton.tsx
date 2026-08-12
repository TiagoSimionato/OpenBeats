'use client';

import { useSyncCovers } from 'frontend/services/api/mutations/scanLibrary';
import { Button } from './Button';

export const SyncCoversButton = () => {
  const { isPending, mutateAsync: syncCovers } = useSyncCovers();

  return (
    <Button
      className="min-w-34 transition-colors"
      isLoading={isPending}
      onClick={() => syncCovers()}
      variant="secondary"
    >
      Sync covers
    </Button>
  );
};
