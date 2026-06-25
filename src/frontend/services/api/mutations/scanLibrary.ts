import type { ScanLibraryReleasesResponse } from 'backend/downloads/types';
import type { HookMutationOptions } from 'frontend/types/reactQuery';
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
