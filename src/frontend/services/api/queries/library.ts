import type { LibraryReleaseResponse, LibraryReleasesResponse } from 'common/types/requests/library';
import type { HookQueryOptions } from 'tsm-utils';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { api } from '..';

export const LIBRARY_QUERY_KEY = ['library'];

export const useGetLibrary = <Response = LibraryReleasesResponse, TError = Error>({
  options,
}: {
  options?: HookQueryOptions<Response, TError>;
} = {}) => {
  const params = useSearchParams().toString();

  return useQuery<Response, TError>({
    queryFn: () => api.get<Response>(`library/releases?${params}`),
    queryKey: [...LIBRARY_QUERY_KEY, params],
    ...options,
  });
};

export const useGetLibraryRelease = <Response = LibraryReleaseResponse, TError = Error>({
  options,
  releaseId,
}: {
  options?: HookQueryOptions<Response, TError>;
  releaseId: string;
}) => useQuery<Response, TError>({
  queryFn: () => api.get<Response>(`library/releases/${releaseId}`),
  queryKey: [...LIBRARY_QUERY_KEY, releaseId],
  ...options,
});
