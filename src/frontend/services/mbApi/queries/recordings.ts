import type { QueryReleaseResponse, RecordingsResponse } from 'common/types/requests/mbApi';
import type { HookQueryOptions } from 'tsm-utils';
import { useQuery } from '@tanstack/react-query';
import { mbApi } from 'common/api/mbApi';

const MUSICBRAINZ_QUERY_QUEY = [
  'musicbrainz',
];
const MUSICBRAINZ_RELEASES_QUERY_QUEY = [
  ...MUSICBRAINZ_QUERY_QUEY,
  'releases',
];

export const useMBQueryRelease = <Response = QueryReleaseResponse, TError = Error>({
  options,
  query,
}: {
  options?: HookQueryOptions<Response, TError>;
  query: string;
}) =>
  useQuery<Response, TError>({
    queryFn: () =>
      mbApi.get<Response>(`release`, {
        params: {
          query,
        },
      }),
    queryKey: [
      ...MUSICBRAINZ_RELEASES_QUERY_QUEY,
      query,
    ],
    ...options,
  });

export const useMBGetRecording = <Response = RecordingsResponse, TError = Error>({
  options,
  recordingId,
}: {
  options?: HookQueryOptions<Response, TError>;
  recordingId: string;
}) =>
  useQuery<Response, TError>({
    queryFn: () =>
      mbApi.get<Response>(`recording/${recordingId}`, {
        params: {
          inc: 'media+releases+artist-credits+release-groups',
        },
      }),
    queryKey: [
      '',
    ],
    ...options,
  });
