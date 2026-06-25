import type { LibraryReleasesResponse } from 'common/types/requests/library';
import type { HookQueryOptions } from 'frontend/services/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '..';

export const LIBRARY_QUERY_KEY = ['library'];

export const useGetLibrary = ({
  options,
}: {
  options?: HookQueryOptions<LibraryReleasesResponse>;
} = {}) => useQuery({
  queryFn: () => api.get<LibraryReleasesResponse>('library'),
  queryKey: LIBRARY_QUERY_KEY,
  ...options,
});
