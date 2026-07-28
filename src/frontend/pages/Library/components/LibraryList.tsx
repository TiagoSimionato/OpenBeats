'use client';

import type { LibraryReleaseData } from 'common/types/requests/library';
import { useGetLibrary } from 'frontend/services/api/queries/library';
import { PaginationControls } from 'frontend/ui/PaginationControls';
import { NoReleasesFound } from './NoReleasesFound';
import { ReleaseCard } from './ReleaseCard';

type LibraryListingProps = {
  defaultPages: number;
  defaultReleases: LibraryReleaseData[];
};

export const LibraryListing = ({ defaultPages, defaultReleases }: LibraryListingProps) => {
  const { data: libraryData } = useGetLibrary();

  const releases = libraryData?.data ?? defaultReleases;

  return (
    <>
      {releases.length === 0 && <NoReleasesFound />}
      {releases.length > 0 && (
        <div
          className="flex flex-wrap sm:grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
        >
          {releases.map(release => (
            <ReleaseCard key={release.id} release={release} />
          ))}
        </div>
      )}
      <PaginationControls
        className={releases.length === 0 ? 'hidden' : ''}
        pages={libraryData?.pages ?? defaultPages}
      />
    </>
  );
};
