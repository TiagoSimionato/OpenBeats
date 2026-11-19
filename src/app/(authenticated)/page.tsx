import { listLibraryReleasesPaged } from 'backend/repositories/releases.repository';
import { ReleasesFilters } from 'backend/requests/releases.dto';
import { buildDTO, buildPagination } from 'backend/utils';
import { CUSTOM_HEADERS } from 'configs/constants';
import { LibraryPage } from 'frontend/pages/Library/Library';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const Page = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;
  const headersList = await headers();
  const pathname = headersList.get(CUSTOM_HEADERS.PATH_NAME) || '';

  const pagination = await buildPagination(params);
  const filters = await buildDTO(ReleasesFilters, params, false);

  const libraryReleases = await listLibraryReleasesPaged(pagination, filters);

  if (pagination.page > libraryReleases.pages) {
    if (pagination.perPage === 18)
      return redirect(pathname);
    return redirect(`${pathname}?perPage=${pagination.perPage}`);
  }

  return (
    <LibraryPage defaultPages={libraryReleases.pages} defaultReleases={libraryReleases.data} />
  );
};

export default Page;
