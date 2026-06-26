import type { StartDownloadResponse } from 'common/types/requests/releases';
import type { HookMutationOptions } from 'frontend/services/types';
import type { RequestConfig } from 'tsm-utils';
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
