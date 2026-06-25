import type { CoverResponse } from 'common/types/requests/caaApi';
import type { HookQueryOptions } from 'frontend/services/types';
import { useQuery } from '@tanstack/react-query';
import { caaApi } from 'common/api/caaApi';

export const useCover = ({
  options,
  releaseId,
}: {
  options?: HookQueryOptions<CoverResponse>;
  releaseId: string;
}) =>
  useQuery({
    queryFn: () => caaApi.get<CoverResponse>(`release/${releaseId}`),
    queryKey: [
      'caa',
      releaseId,
    ],
    ...options,
  });
