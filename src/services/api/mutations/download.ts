import type { TrackSearchResult } from 'features/downloader/types';
import type { HookMutationOptions } from 'types/reactQuery';
import type { RequestConfig } from '..';
import { useMutation } from '@tanstack/react-query';
import { api } from '..';

export const useDownloadRelease = ({
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<unknown, TrackSearchResult, unknown>;
} = {}) => useMutation({
  mutationFn: (releaseId: string) =>
    api.get<TrackSearchResult>(`releases/${releaseId}`),
  ...options,
});
