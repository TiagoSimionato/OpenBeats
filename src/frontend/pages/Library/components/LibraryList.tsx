'use client';

import type { LibraryReleaseData } from 'common/types/requests/library';
import { useGetLibrary } from 'frontend/services/api/queries/library';
import { NoReleasesFound } from './NoReleasesFound';
import { ReleaseCard } from './ReleaseCard';

type LibraryListingProps = {
  defaultReleases: LibraryReleaseData[];
};

export const LibraryListing = ({ defaultReleases }: LibraryListingProps) => {
  const { data: libraryReleases } = useGetLibrary();

  const releases = libraryReleases?.libraryReleases ?? defaultReleases;

  if (releases.length === 0)
    return <NoReleasesFound />;

  return (
    <div
      className="flex flex-wrap sm:grid"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
    >
      {releases.map(release => (
        <ReleaseCard key={release.id} release={release} />
      ))}
    </div>
  );
};
