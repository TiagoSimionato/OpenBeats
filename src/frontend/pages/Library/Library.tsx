import { releasesRepository } from 'backend/repositories/releases.repository';
import { buildPagination } from 'backend/utils';
import { LibraryListing } from './components/LibraryList';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const LibraryPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;
  const paginationParams = {
    page: Number(params.page ?? 1),
    perPage: Number(params.perPage ?? 18),
  };
  const pagination = await buildPagination(paginationParams);
  const libraryReleases = await releasesRepository.listLibraryReleasesPaged(pagination);

  return (
    <LibraryListing defaultPages={libraryReleases.pages} defaultReleases={libraryReleases.data} />
  );
};
