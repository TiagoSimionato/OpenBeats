import type { LibraryReleasesResponse } from 'common/types/requests/library';
import type { HookQueryOptions } from 'tsm-utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '..';

export const LIBRARY_QUERY_KEY = ['library'];

export const useGetLibrary = <Response = LibraryReleasesResponse, TError = Error>({
  options,
}: {
  options?: HookQueryOptions<Response, TError>;
} = {}) => useQuery<Response, TError>({
  queryFn: () => api.get<Response>('library'),
  queryKey: LIBRARY_QUERY_KEY,
  ...options,
});
