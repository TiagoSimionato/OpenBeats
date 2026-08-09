import { releasesRepository } from 'backend/repositories/releases.repository';
import { buildPagination } from 'backend/utils';
import { LibraryListing } from './components/LibraryList';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const LibraryPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;

  const query = Array.isArray(params.query) ? params.query.join('') : params.query;
  const pagination = await buildPagination(params);

  const libraryReleases = await releasesRepository.listLibraryReleasesPaged(pagination, query);

  return (
    <LibraryListing defaultPages={libraryReleases.pages} defaultReleases={libraryReleases.data} />
  );
};
