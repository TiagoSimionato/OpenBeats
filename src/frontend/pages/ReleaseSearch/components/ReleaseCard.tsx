'use client';

import type { QueryRelease } from 'common/types/requests/mbApi';
import { useDownloadQueueContext } from 'frontend/contexts/DownloadQueue';
import { useMBGetRelease } from 'frontend/services/mbApi/queries/releases';
import { Spinner } from 'frontend/ui/Spinner';
import { useState } from 'react';
import { CoverPreview } from './CoverPreview';

type ReleaseCardProps = {
  isDownloaded?: boolean;
  release: QueryRelease;
};

const getArtistsLabel = (release: QueryRelease) => {
  const artistCredit = release['artist-credit'] ?? [];

  if (artistCredit.length === 0) {
    return 'Unknown artist';
  }

  return artistCredit
    .map(credit => `${credit.name ?? credit.artist?.name ?? 'Unknown'}${credit.joinphrase ?? ''}`)
    .join('');
};

export const ReleaseCard = ({ isDownloaded = false, release }: ReleaseCardProps) => {
  const { enqueueRelease, queue } = useDownloadQueueContext();

  const queueItem = queue.find(item => item.releaseId === String(release.id));
  const isDownloading = queueItem?.status === 'running';
  const isQueued = queueItem?.stage === 'queued' && queueItem?.status === 'running';

  const handleDownload = () => {
    enqueueRelease(release);
  };

  const [isOpen, setIsOpen] = useState(false);
  const { data: fullRelease, isLoading: isReleaseLoading } = useMBGetRelease({
    options: { enabled: isOpen },
    releaseId: String(release.id),
  });

  const toggleOpen = () => setIsOpen(v => !v);

  return (
    <li className="rounded border border-zinc-200 p-3" key={release.id}>
      <div className="flex items-start gap-3">
        <CoverPreview releaseId={release.id} title={release.title} />
        <div className="flex-1">
          <p className="flex items-center gap-2 font-medium">
            {release.title ?? 'Untitled release'}
            {isDownloaded
              ? (
                  <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                    Downloaded
                  </span>
                )
              : null}
          </p>
          <p className="text-sm text-zinc-700">{getArtistsLabel(release)}</p>
          <p className="text-sm text-zinc-600">
            {release.date ?? 'Unknown date'}
            {release.country ? ` • ${release.country}` : ''}
            {release['release-group']?.['primary-type']
              ? ` • ${release['release-group']['primary-type']}`
              : ''}
            {release.status ? ` • ${release.status}` : ''}
            {release['track-count'] ? ` • ${release['track-count']} tracks` : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2">
          <button
            className="rounded bg-zinc-900 px-3 py-1 text-white disabled:opacity-50"
            disabled={isDownloading || isDownloaded}
            onClick={handleDownload}
            type="button"
          >
            {isDownloaded && 'Downloaded'}
            {!isDownloaded && isQueued && 'Queued'}
            {!isDownloaded && isDownloading && !isQueued && (
              <span className="flex items-center gap-2">
                <Spinner color="text-white" size="xs" />
                <span>
                  {queueItem ? `${queueItem.processedTracks}/${queueItem.totalTracks}` : 'Starting'}
                </span>
              </span>
            )}
            {!isDownloaded && !isDownloading && 'Download'}
          </button>
          <button
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            onClick={toggleOpen}
            type="button"
          >
            {isOpen ? 'Hide tracks' : 'Show tracks'}
          </button>
          {isDownloading && queueItem
            ? (
                <p className="max-w-40 text-xs text-zinc-500">{queueItem.message ?? 'Working...'}</p>
              )
            : null}
        </div>
      </div>

      {isOpen
        ? (
            <div className="mt-3">
              {isReleaseLoading
                ? (
                    <div className="flex items-center justify-center gap-3">
                      <Spinner size="md" />
                    </div>
                  )
                : (
                    <ol className="space-y-1 text-sm">
                      {fullRelease?.media
                        ?.flatMap(m => m.tracks ?? [])
                        .map(t => (
                          <li
                            className="flex items-start gap-3"
                            key={t.id ?? `${t.position ?? t.number}-${t.title}`}
                          >
                            <span className="w-8 text-right text-xs text-zinc-600">
                              {t.position ?? t.number ?? ''}
                              .
                            </span>
                            <div>
                              <div className="font-medium">{t.title ?? t.recording?.title}</div>
                              <div className="text-xs text-zinc-600">
                                {(t['artist-credit'] ?? t.recording?.['artist-credit'] ?? [])
                                  .map(c => c.name ?? c.artist?.name ?? '')
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                            </div>
                          </li>
                        ))}
                    </ol>
                  )}
            </div>
          )
        : null}
    </li>
  );
};
