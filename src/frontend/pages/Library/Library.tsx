import { releasesRepository } from 'backend/repositories/releases.repository';
import { NoReleasesFound } from './components/NoReleasesFound';
import { ReleaseCard } from './components/ReleaseCard';

export const LibraryPage = async () => {
  const libraryReleases = await releasesRepository.listDownloadedReleases();

  if (libraryReleases.length === 0)
    return <NoReleasesFound />;

  return (
    <div className="flex flex-wrap">
      {libraryReleases.map(release => (
        <ReleaseCard key={release.id} release={release} />
      ))}
    </div>
  );
};
