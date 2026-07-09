import type { HookMutationOptions, RequestConfig } from 'tsm-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '..';
import { LIBRARY_QUERY_KEY } from '../queries/library';

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
    onSuccess: (_, { releaseId }) => {
      queryClient.invalidateQueries({ queryKey: [LIBRARY_QUERY_KEY, releaseId] });
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
    onSuccess: (_, releaseId) => {
      queryClient.invalidateQueries({ queryKey: [LIBRARY_QUERY_KEY, releaseId] });
    },
    ...options,
  });
};
