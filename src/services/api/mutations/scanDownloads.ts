import type { ScanDownloadedReleasesResponse } from 'backend/downloads/types';
import type { HookMutationOptions } from 'frontend/types/reactQuery';
import type { RequestConfig } from '..';
import { useMutation } from '@tanstack/react-query';
import { api } from '..';

export const useRescanDownloadedReleases = ({
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<void, ScanDownloadedReleasesResponse, unknown>;
} = {}) => useMutation({
  mutationFn: () => api.post<ScanDownloadedReleasesResponse>('downloads/scan'),
  ...options,
});
