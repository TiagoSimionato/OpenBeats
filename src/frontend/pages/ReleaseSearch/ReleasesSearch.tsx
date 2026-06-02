'use client';

import type { FormEvent } from 'react';
import type { DownloadQueueUpdate } from './components/ReleaseCard';
import { Spinner } from 'frontend/ui/Spinner';
import { useCallback, useState } from 'react';
import { useDownloadedReleases } from 'services/api/queries/downloads';
import { useMBQueryRelease } from 'services/mbApi';
import { DownloadQueuePopup } from './components/DownloadQueuePopup';
import { ReleaseCard } from './components/ReleaseCard';

export const ReleaseSearch = () => {
  const [inputValue, setInputValue] = useState('');
  const [queue, setQueue] = useState<Record<string, DownloadQueueUpdate>>({});
  const [query, setQuery] = useState('');

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

  const onQueueUpdate = useCallback((update: DownloadQueueUpdate) => {
    setQueue(prev => ({
      ...prev,
      [update.releaseId]: update,
    }));

    if (update.status === 'completed' || update.status === 'failed') {
      setTimeout(() => {
        setQueue((current) => {
          const existing = current[update.releaseId];

          if (!existing || existing.status === 'running') {
            return current;
          }

          const next = { ...current };
          delete next[update.releaseId];

          return next;
        });
      }, 4000);
    }
  }, []);

  const queueItems = Object.values(queue);

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
                    onQueueUpdate={onQueueUpdate}
                    release={release}
                  />
                ))}
              </ul>
            </div>
          )
        : null}

      <DownloadQueuePopup items={queueItems} />
    </main>
  );
};
