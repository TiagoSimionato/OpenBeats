import type { ScanLibraryReleasesResponse } from 'common/types/requests/library';
import type { HookMutationOptions } from 'frontend/services/types';
import type { RequestConfig } from '..';
import { useMutation } from '@tanstack/react-query';
import { api } from '..';

export const useScanLibrary = ({
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<void, ScanLibraryReleasesResponse, unknown>;
} = {}) => useMutation({
  mutationFn: () => api.post<ScanLibraryReleasesResponse>('library/scan'),
  ...options,
});
