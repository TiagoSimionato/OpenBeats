import type { QueryRelease } from 'services/mbApi/types';
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

export const ReleaseCard = ({ release }: ReleaseCardProps) => (
  <li
    className="flex gap-3 rounded border border-zinc-200 p-3"
    key={release.id}
  >
    <CoverPreview releaseId={release.id} title={release.title} />
    <div>
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
  </li>
);
