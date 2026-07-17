import { releasesRepository } from 'backend/repositories/releases.repository';
import { LibraryListing } from './components/LibraryList';

export const LibraryPage = async () => {
  const libraryReleases = await releasesRepository.listLibraryReleases();

  return <LibraryListing defaultReleases={libraryReleases} />;
};
