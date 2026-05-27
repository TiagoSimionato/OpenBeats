'use client';

import type { QueryRelease } from 'services/mbApi/types';
import { useState } from 'react';
import { useDownloadRelease } from 'services/api/mutations/download';
import { CoverPreview } from './CoverPreview';

type ReleaseCardProps = {
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

export const ReleaseCard = ({ release }: ReleaseCardProps) => {
  const download = useDownloadRelease();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    await download.mutateAsync(String(release.id));

    setIsDownloading(false);
  };

  return (
    <li
      className="flex items-start gap-3 rounded border border-zinc-200 p-3"
      key={release.id}
    >
      <CoverPreview releaseId={release.id} title={release.title} />
      <div className="flex-1">
        <p className="font-medium">
          {release.title ?? 'Untitled release'}
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
      <div className="flex shrink-0 items-start">
        <button
          className="rounded bg-zinc-900 px-3 py-1 text-white disabled:opacity-50"
          disabled={isDownloading}
          onClick={handleDownload}
          type="button"
        >
          {isDownloading ? 'Downloading...' : 'Download'}
        </button>
      </div>
    </li>
  );
};
