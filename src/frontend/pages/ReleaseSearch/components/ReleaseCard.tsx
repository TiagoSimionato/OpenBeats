'use client';

import type { DownloadJobProgress } from 'backend/downloader/types';
import type { QueryRelease } from 'services/mbApi/types';
import { useQueryClient } from '@tanstack/react-query';
import { Spinner } from 'frontend/ui/Spinner';
import { useEffect, useState } from 'react';
import { useDownloadRelease } from 'services/api/mutations/download';
import { useMBGetRelease } from 'services/mbApi/queries/releases';
import { CoverPreview } from './CoverPreview';

export type DownloadQueueUpdate = {
  message?: string;
  processedTracks: number;
  releaseId: string;
  stage: DownloadJobProgress['stage'];
  status: DownloadJobProgress['status'];
  title: string;
  totalTracks: number;
};

type ReleaseCardProps = {
  isDownloaded?: boolean;
  onQueueUpdate?: (update: DownloadQueueUpdate) => void;
  release: QueryRelease;
};

const getArtistsLabel = (release: QueryRelease) => {
  const artistCredit = release['artist-credit'] ?? [];

  if (artistCredit.length === 0) {
    return 'Unknown artist';
  }

  return artistCredit
    .map(
      credit =>
        `${credit.name ?? credit.artist?.name ?? 'Unknown'}${credit.joinphrase ?? ''}`,
    )
    .join('');
};

export const ReleaseCard = ({ isDownloaded = false, onQueueUpdate, release }: ReleaseCardProps) => {
  const download = useDownloadRelease();
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);
  const [jobId, setJobId] = useState('');
  const [progress, setProgress] = useState<DownloadJobProgress | null>(null);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setProgress(null);
      onQueueUpdate?.({
        processedTracks: 0,
        releaseId: release.id,
        stage: 'queued',
        status: 'running',
        title: release.title ?? 'Untitled release',
        totalTracks: 0,
      });
      const { jobId: nextJobId } = await download.mutateAsync(String(release.id));
      setJobId(nextJobId);
    }
    catch {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const eventSource = new EventSource(`/api/releases/jobs/${jobId}`);

    eventSource.onmessage = (event) => {
      const nextProgress = JSON.parse(event.data) as DownloadJobProgress;
      setProgress(nextProgress);
      onQueueUpdate?.({
        message: nextProgress.message,
        processedTracks: nextProgress.processedTracks,
        releaseId: release.id,
        stage: nextProgress.stage,
        status: nextProgress.status,
        title: release.title ?? 'Untitled release',
        totalTracks: nextProgress.totalTracks,
      });

      if (nextProgress.status === 'completed' || nextProgress.status === 'failed') {
        setIsDownloading(false);
        void queryClient.invalidateQueries({ queryKey: ['downloads'] });
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setIsDownloading(false);
      onQueueUpdate?.({
        message: 'Connection lost while tracking progress',
        processedTracks: progress?.processedTracks ?? 0,
        releaseId: release.id,
        stage: 'failed',
        status: 'failed',
        title: release.title ?? 'Untitled release',
        totalTracks: progress?.totalTracks ?? 0,
      });
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId, onQueueUpdate, progress?.processedTracks, progress?.totalTracks, queryClient, release.id, release.title]);

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
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Downloaded
                  </span>
                )
              : null}
          </p>
          <p className="text-sm text-zinc-700">
            {getArtistsLabel(release)}
          </p>
          <p className="text-sm text-zinc-600">
            {release.date ?? 'Unknown date'}
            {release.country ? ` • ${release.country}` : ''}
            {release['release-group']?.['primary-type'] ? ` • ${release['release-group']['primary-type']}` : ''}
            {release.status ? ` • ${release.status}` : ''}
            {release['track-count']
              ? ` • ${release['track-count']} tracks`
              : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-start flex-col gap-2">
          <button
            className="rounded bg-zinc-900 px-3 py-1 text-white disabled:opacity-50"
            disabled={isDownloading || isDownloaded}
            onClick={handleDownload}
            type="button"
          >
            {isDownloaded && 'Downloaded'}
            {!isDownloaded && isDownloading
              && (
                <span className="flex items-center gap-2">
                  <Spinner color="text-white" size="xs" />
                  <span>
                    {progress
                      ? `${progress.processedTracks}/${progress.totalTracks}`
                      : 'Starting'}
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
          {isDownloading && progress
            ? (
                <p className="max-w-40 text-xs text-zinc-500">
                  {progress.message ?? 'Working...'}
                </p>
              )
            : null}
        </div>
      </div>

      {isOpen
        ? (
            <div className="mt-3">
              {isReleaseLoading
                ? (
                    <div className="flex justify-center items-center gap-3">
                      <Spinner size="md" />
                    </div>
                  )
                : (
                    <ol className="space-y-1 text-sm">
                      {fullRelease?.media?.flatMap(m => m.tracks ?? []).map(t => (
                        <li className="flex items-start gap-3" key={t.id ?? `${t.position ?? t.number}-${t.title}`}>
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
