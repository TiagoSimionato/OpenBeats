import type { ReleaseResponse } from 'common/types/requests/mbApi';
import type { HookQueryOptions } from 'tsm-utils';
import { useQuery } from '@tanstack/react-query';
import { mbApi } from 'common/api/mbApi';

const MUSICBRAINZ_QUERY_QUEY = [
  'musicbrainz',
];

const MUSICBRAINZ_RELEASE_QUERY_QUEY = [
  ...MUSICBRAINZ_QUERY_QUEY,
  'release',
];

export const useMBGetRelease = <Response = ReleaseResponse, TError = Error>({
  options,
  releaseId,
}: {
  options?: HookQueryOptions<Response, TError>;
  releaseId: string;
}) =>
  useQuery<Response, TError>({
    queryFn: () =>
      mbApi.get<Response>(`release/${releaseId}`, {
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
