import type { StartDownloadResponse } from 'common/types/requests/releases';
import type { HookMutationOptions, RequestConfig } from 'tsm-utils';
import { useMutation } from '@tanstack/react-query';
import { api } from '..';

export const useDownloadRelease = <Resquest extends string, Response = StartDownloadResponse, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<Resquest, Response, Error>;
} = {}) => useMutation<Response, Error, Request>({
  mutationFn: (releaseId: string) => api.post<Response>(`releases/${releaseId}`, {}, configs),
  ...options,
});
