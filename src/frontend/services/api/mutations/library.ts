import type { StartDownloadResponse } from 'common/types/requests/releases';
import type { HookMutationOptions, RequestConfig } from 'tsm-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '..';
import { LIBRARY_QUERY_KEY } from '../queries/library';

export const useAddRelease = <Response = StartDownloadResponse, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<string, Response, Error>;
} = {}) => useMutation<Response, Error, string>({
  mutationFn: (releaseId: string) => api.post<Response>(`releases/${releaseId}`, {}, configs),
  ...options,
});

type DeleteTrackParameters = { releaseId: string; trackId: string };

export const useDeleteLibraryTrack = <Response = null, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<DeleteTrackParameters, Response, Error>;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation<Response, Error, DeleteTrackParameters>({
    mutationFn: ({ releaseId, trackId }) => api.delete<Response>(`releases/${releaseId}/tracks/${trackId}`, {}, configs),
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

  return useMutation<Response, Error, string>({
    mutationFn: (releaseId: string) => api.delete<Response>(`releases/${releaseId}`, {}, configs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
    },
    ...options,
  });
};
