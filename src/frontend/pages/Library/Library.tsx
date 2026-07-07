import { releasesRepository } from 'backend/repositories/releases.repository';
import { ReleaseCard } from './components/ReleaseCard';

export const LibraryPage = async () => {
  const libraryReleases = await releasesRepository.listDownloadedReleases();

  return (
    <div className="flex flex-wrap">
      {libraryReleases.map(release => (
        <ReleaseCard key={release.id} release={release} />
      ))}
    </div>
  );
};
