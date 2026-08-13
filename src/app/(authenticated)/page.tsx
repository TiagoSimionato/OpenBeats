import { releasesRepository } from 'backend/repositories/releases.repository';
import { ReleasesFilters } from 'backend/requests/releases.dto';
import { buildDTO, buildPagination } from 'backend/utils';
import { LibraryPage } from 'frontend/pages/Library/Library';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const Page = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;

  const pagination = await buildPagination(params);
  const filters = await buildDTO(ReleasesFilters, params, false);

  const libraryReleases = await releasesRepository.listLibraryReleasesPaged(pagination, filters);

  return (
    <LibraryPage defaultPages={libraryReleases.pages} defaultReleases={libraryReleases.data} />
  );
};

export default Page;
