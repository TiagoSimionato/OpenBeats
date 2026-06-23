import type { ScanDownloadedReleasesResponse as LibraryReleasesResponse } from 'backend/downloads/types';
import type { HookMutationOptions } from 'frontend/types/reactQuery';
import type { RequestConfig } from '..';
import { useMutation } from '@tanstack/react-query';
import { api } from '..';

export const useScanLibrary = ({
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<void, LibraryReleasesResponse, unknown>;
} = {}) => useMutation({
  mutationFn: () => api.post<LibraryReleasesResponse>('library/scan'),
  ...options,
});
