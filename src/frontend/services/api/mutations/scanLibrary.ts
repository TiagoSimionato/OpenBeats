import type { HookMutationOptions, RequestConfig } from 'tsm-utils';
import { useMutation } from '@tanstack/react-query';
import { api } from '..';

export const useScanLibrary = <Resquest = void, Response = null, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<Resquest, Response, Error>;
} = {}) => useMutation<Response, Error, Resquest>({
  mutationFn: () => api.post<Response>('library/scan', {}, configs),
  ...options,
});

export const useSyncCovers = <Resquest = void, Response = void, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<Resquest, Response, Error>;
} = {}) => useMutation<Response, Error, Resquest>({
  mutationFn: () => api.post<Response>('covers/sync', {}, configs),
  ...options,
});
