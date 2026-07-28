'use client';

import type { QueryRelease } from 'common/types/requests/mbApi';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useAddRelease } from 'frontend/services/api/mutations/library';
import { useGetLibraryRelease } from 'frontend/services/api/queries/library';
import { useMBGetRelease } from 'frontend/services/mbApi/queries/releases';
import { Button } from 'frontend/ui/Button';
import { Chip } from 'frontend/ui/Chip';
import { Spinner } from 'frontend/ui/Spinner';
import { useState } from 'react';
import { CoverPreview } from './CoverPreview';

type libraryStatus = 'added' | 'missing' | 'parcial';

type releaseStatus = 'processing' | 'queued' | libraryStatus;

type ReleaseCardProps = {
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

const renderChip = (status: releaseStatus) => {
  switch (status) {
    case 'added':
      return <Chip>Downloaded</Chip>;
    case 'parcial':
      return <Chip variant="secondary">Partially downloaded</Chip>;
    default:
      return null;
  }
};

const renderButtonLabel = (status: releaseStatus) => {
  switch (status) {
    case 'added':
      return 'Downloaded';
    case 'missing':
      return 'Add to Library';
    case 'parcial':
      return 'Try again';
    case 'processing':
      return '';
    case 'queued':
      return 'Queued';
    default:
      return '';
  }
};

export const ReleaseSearchCard = ({ release }: ReleaseCardProps) => {
  const { data: libraryData } = useGetLibraryRelease({ releaseId: release.id });
  const { mutateAsync: addRelease } = useAddRelease();
  const libraryRelease = libraryData?.libraryRelease;
  const isDownloaded = libraryRelease && libraryRelease.tracks.length === libraryRelease.trackCount;
  const isPartiallyAdded = !isDownloaded && !!libraryRelease;

  const { enqueueJob, queue } = useQueueContext();

  const queueItem = queue.find(item => item.id === String(release.id));
  const isDownloading = queueItem?.status === 'running';
  const isQueued = queueItem?.stage === 'queued' && queueItem?.status === 'running';

  const status: releaseStatus = isQueued
    ? 'queued'
    : isDownloading
      ? 'processing'
      : isDownloaded
        ? 'added'
        : isPartiallyAdded
          ? 'parcial'
          : 'missing';

  const handleDownload = () => {
    enqueueJob({
      id: release.id,
      onStart: () => addRelease(release.id),
      title: release.title ?? '',
      totalTracks: release['track-count'] ?? 0,
    });
  };

  const [isOpen, setIsOpen] = useState(false);
  const { data: fullRelease, isLoading: isReleaseLoading } = useMBGetRelease({
    options: { enabled: isOpen },
    releaseId: String(release.id),
  });

  const toggleOpen = () => setIsOpen(v => !v);

  return (
    <li className="rounded border border-zinc-200 p-3" key={release.id}>
      <div className="flex flex-wrap items-center gap-3">
        <CoverPreview releaseId={release.id} title={release.title} />
        <div className="flex-1">
          <p className="flex items-center gap-2 font-medium">
            {release.title ?? 'Untitled release'}
            {renderChip(status)}
          </p>
          <p className="text-sm text-zinc-700">{getArtistsLabel(release)}</p>
          <p className="text-lighter text-sm">
            {release.date ?? 'Unknown date'}
            {release.country ? ` • ${release.country}` : ''}
            {release['release-group']?.['primary-type']
              ? ` • ${release['release-group']['primary-type']}`
              : ''}
            {release.status ? ` • ${release.status}` : ''}
            {release['track-count'] ? ` • ${release['track-count']} tracks` : ''}
          </p>
        </div>
        <div className="flex min-w-32 shrink-0 basis-full flex-col items-stretch gap-2 sm:basis-auto">
          <Button
            className="bg-zinc-900 text-sm font-normal disabled:opacity-50"
            disabled={isDownloading || isDownloaded}
            onClick={handleDownload}
            size="sm"
          >
            {renderButtonLabel(status)}
            {!isDownloaded && isDownloading && !isQueued && (
              <span className="flex grow items-center justify-center gap-2">
                <Spinner color="text-white" size="xs" />
                <span>
                  {queueItem ? `${queueItem.processedTracks}/${queueItem.totalTracks}` : 'Starting'}
                </span>
              </span>
            )}
          </Button>
          <Button
            className="text-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            onClick={toggleOpen}
            size="sm"
            variant="secondary"
          >
            {isOpen ? 'Hide tracks' : 'Show tracks'}
          </Button>
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
                            <span className="text-lighter w-8 text-right text-xs">
                              {t.position ?? t.number ?? ''}
                              .
                            </span>
                            <div>
                              <div className="font-medium">{t.title ?? t.recording?.title}</div>
                              <div className="text-lighter text-xs">
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
