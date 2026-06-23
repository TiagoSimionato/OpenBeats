'use client';

import type { ScanDownloadedReleasesResponse } from 'backend/downloads/types';
import { useQueryClient } from '@tanstack/react-query';
import { useRescanDownloadedReleases } from 'frontend/services';
import { Spinner } from './Spinner';

export const ScanLibraryButton = () => {
  const queryClient = useQueryClient();
  const rescanDownloads = useRescanDownloadedReleases({
    options: {
      onSuccess: async (_data: ScanDownloadedReleasesResponse) => {
        await queryClient.invalidateQueries({ queryKey: ['downloads'] });
      },
    },
  });

  const handleRescanLibrary = () => {
    if (rescanDownloads.isPending) {
      return;
    }

    rescanDownloads.mutateAsync();
  };

  return (
    <button
      className="rounded ml-auto border min-w-32 border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50"
      disabled={rescanDownloads.isPending}
      onClick={handleRescanLibrary}
      type="button"
    >
      {rescanDownloads.isPending
        ? (
            <span className="flex items-center grow justify-center gap-2">
              <Spinner color="text-zinc-800" size="lg" />
            </span>
          )
        : 'Scan library'}
    </button>
  );
};
