import type { RequestConfig } from 'common/api/createAPI';
import type { ScanLibraryReleasesResponse } from 'common/types/requests/library';
import type { HookMutationOptions } from 'frontend/services/types';
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
