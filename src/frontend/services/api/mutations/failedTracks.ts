import type { HookMutationOptions, RequestConfig } from 'tsm-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '..';
import { FAILED_TRACKS_QUERY_KEY } from '../queries/failedTracks';

export const useDeleteFailedTrack = <Response = null, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<string, Response, Error>;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation<Response, Error, string>({
    mutationFn: (releaseId: string) => api.delete<Response>(`library/failedTracks/${releaseId}`, {}, configs),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FAILED_TRACKS_QUERY_KEY });
    },
    ...options,
  });
};
