import type { LibraryReleasesResponse } from 'backend/downloads/types';
import type { HookQueryOptions } from 'frontend/types/reactQuery';
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
