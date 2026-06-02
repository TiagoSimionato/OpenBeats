'use client';

import type { ScanDownloadedReleasesResponse } from 'backend/downloads/types';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Spinner } from 'frontend/ui/Spinner';
import { useState } from 'react';
import { useRescanDownloadedReleases } from 'services/api/mutations/scanDownloads';
import { useDownloadedReleases } from 'services/api/queries/downloads';
import { useMBQueryRelease } from 'services/mbApi';
import { DownloadQueuePopup } from './components/DownloadQueuePopup';
import { ReleaseCard } from './components/ReleaseCard';

export const ReleaseSearch = () => {
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();
  const rescanDownloads = useRescanDownloadedReleases({
    options: {
      onSuccess: async (_data: ScanDownloadedReleasesResponse) => {
        await queryClient.invalidateQueries({ queryKey: ['downloads'] });
      },
    },
  });

  const { data, error, isFetching, isLoading } = useMBQueryRelease({
    options: {
      enabled: query.trim().length > 0,
    },
    query,
  });

  const releases = data?.releases ?? [];
  const { data: downloadsData } = useDownloadedReleases();
  const downloadedReleaseIds = new Set(downloadsData?.downloadedReleases.map(download => download.releaseId) ?? []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(inputValue.trim());
  };

  const handleRescanLibrary = () => {
    if (rescanDownloads.isPending) {
      return;
    }

    void rescanDownloads.mutateAsync();
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">LostBeats</h1>

      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          className="w-full rounded border border-zinc-300 px-3 py-2"
          onChange={event => setInputValue(event.target.value)}
          placeholder="Search for album, release or singles"
          value={inputValue}
        />
        <button
          className="rounded bg-black px-4 py-2 font-medium text-white"
          type="submit"
        >
          Search
        </button>
        <button
          className="rounded border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50"
          disabled={rescanDownloads.isPending}
          onClick={handleRescanLibrary}
          type="button"
        >
          {rescanDownloads.isPending
            ? (
                <span className="flex items-center gap-2">
                  <Spinner color="text-zinc-800" size="xs" />
                  Scanning
                </span>
              )
            : 'Scan library'}
        </button>
      </form>

      {isLoading || isFetching
        ? (
            <div className="flex justify-center items-center gap-3">
              <Spinner color="text-primary" size="lg" />
            </div>
          )
        : null}

      {error ? <p className="text-red-600">Failed to load releases.</p> : null}

      {!isLoading && !error
        ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">
                Found
                {' '}
                {data?.count ?? releases.length}
                {' '}
                results for "
                {query}
                ".
              </p>
              <ul className="space-y-2">
                {releases.map(release => (
                  <ReleaseCard
                    isDownloaded={downloadedReleaseIds.has(release.id)}
                    key={release.id}
                    release={release}
                  />
                ))}
              </ul>
            </div>
          )
        : null}

      <DownloadQueuePopup />
    </main>
  );
};
