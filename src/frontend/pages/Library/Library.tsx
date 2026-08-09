import { releasesRepository } from 'backend/repositories/releases.repository';
import { ReleasesFilters } from 'backend/requests/releases';
import { buildDTO, buildPagination } from 'backend/utils';
import { LibraryListing } from './components/LibraryList';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const LibraryPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;

  const pagination = await buildPagination(params);
  const filters = await buildDTO(ReleasesFilters, params, false);

  const libraryReleases = await releasesRepository.listLibraryReleasesPaged(pagination, filters);

  return (
    <LibraryListing defaultPages={libraryReleases.pages} defaultReleases={libraryReleases.data} />
  );
};
