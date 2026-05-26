import type { HookQueryOptions } from 'types/reactQuery';
import type { ReleaseResponse } from '../types';
import { useQuery } from '@tanstack/react-query';
import { mbApi } from '../index';

const MUSICBRAINZ_QUERY_QUEY = [
  'musicbrainz',
];

const MUSICBRAINZ_RELEASE_QUERY_QUEY = [
  ...MUSICBRAINZ_QUERY_QUEY,
  'release',
];

export const useMBGetRelease = ({
  options,
  releaseId,
}: {
  options?: HookQueryOptions<ReleaseResponse>;
  releaseId: string;
}) =>
  useQuery({
    queryFn: () =>
      mbApi.get<ReleaseResponse>(`release/${releaseId}`, {
        params: {
          inc: 'media+recordings+artist-credits+release-groups+labels',
        },
      }),
    queryKey: [
      ...MUSICBRAINZ_RELEASE_QUERY_QUEY,
      releaseId,
    ],
    ...options,
  });
