import type { TrackRequestParams } from 'common/types/requests/library';
import type { JobResponse } from 'common/types/requests/releases';
import type { HookMutationOptions, RequestConfig } from 'tsm-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ROUTES } from 'configs/routes';
import { useRouter } from 'next/navigation';
import { api } from '..';
import { LIBRARY_QUERY_KEY } from '../queries/library';

export const useAddRelease = <Response = JobResponse, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<string, Response, Error>;
} = {}) => useMutation<Response, Error, string>({
  mutationFn: (releaseId: string) => api.post<Response>(`releases/${releaseId}`, {}, configs),
  ...options,
});

export const useAddTrack = <Response = JobResponse, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<TrackRequestParams, Response, Error>;
} = {}) => useMutation<Response, Error, TrackRequestParams>({
  mutationFn: ({ releaseId, trackId }) => api.post<Response>(`releases/${releaseId}/tracks/${trackId}`, {}, configs),
  ...options,
});

export const useAddCustomTrack = <Response = JobResponse, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<TrackRequestParams, Response, Error>;
} = {}) => useMutation<Response, Error, TrackRequestParams>({
  mutationFn: ({ releaseId, trackId, url }) => api.post<Response>(`releases/${releaseId}/tracks`, { trackId, url }, configs),
  ...options,
});

export const useDeleteLibraryTrack = <Response = null, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<TrackRequestParams, Response, Error>;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation<Response, Error, TrackRequestParams>({
    mutationFn: ({ releaseId, trackId }) => api.delete<Response>(`library/releases/${releaseId}/tracks/${trackId}`, {}, configs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
    },
    ...options,
  });
};

export const useDeleteLibraryRelease = <Response = null, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<string, Response, Error>;
} = {}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<Response, Error, string>({
    mutationFn: (releaseId: string) => api.delete<Response>(`library/releases/${releaseId}`, {}, configs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      router.push(ROUTES.HOME);
    },
    ...options,
  });
};
