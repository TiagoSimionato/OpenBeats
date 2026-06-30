import type { CoverResponse } from 'common/types/requests/caaApi';
import type { HookQueryOptions } from 'tsm-utils';
import { useQuery } from '@tanstack/react-query';
import { caaApi } from 'common/api/caaApi';

export const useCover = <Response = CoverResponse, TError = Error>({
  options,
  releaseId,
}: {
  options?: HookQueryOptions<Response, TError>;
  releaseId: string;
}) =>
  useQuery<Response, TError>({
    queryFn: () => caaApi.get<Response>(`release/${releaseId}`),
    queryKey: [
      'caa',
      releaseId,
    ],
    ...options,
  });
