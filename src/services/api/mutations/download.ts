import type { StartDownloadResponse } from 'backend/downloader/types';
import type { HookMutationOptions } from 'types/reactQuery';
import type { RequestConfig } from '..';
import { useMutation } from '@tanstack/react-query';
import { api } from '..';

export const useDownloadRelease = ({
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<string, StartDownloadResponse, unknown>;
} = {}) => useMutation({
  mutationFn: (releaseId: string) =>
    api.post<StartDownloadResponse>(`releases/${releaseId}`),
  ...options,
});
