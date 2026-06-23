import type { DownloadedReleasesResponse } from 'backend/downloads/types';
import type { HookQueryOptions } from 'frontend/types/reactQuery';
import { useQuery } from '@tanstack/react-query';
import { api } from '..';

export const useDownloadedReleases = ({
  options,
}: {
  options?: HookQueryOptions<DownloadedReleasesResponse>;
} = {}) => useQuery({
  queryFn: () => api.get<DownloadedReleasesResponse>('downloads'),
  queryKey: ['downloads'],
  ...options,
});
