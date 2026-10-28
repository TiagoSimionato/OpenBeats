import type { FailedTracksAmountResponse, FailedTracksResponse } from 'common/types/requests/failedTracks';
import type { HookQueryOptions } from 'tsm-utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '..';

export const FAILED_TRACKS_QUERY_KEY = ['failed_tracks'];
export const FAILED_TRACKS_AMOUNT_QUERY_KEY = [...FAILED_TRACKS_QUERY_KEY, 'amount'];

export const useGetFailedTracks = <Response = FailedTracksResponse, TError = Error>({
  options,
}: {
  options?: HookQueryOptions<Response, TError>;
} = {}) => useQuery<Response, TError>({
  queryFn: () => api.get<Response>(`library/failedTracks`),
  queryKey: FAILED_TRACKS_QUERY_KEY,
  ...options,
});

export const useGetFailedTracksAmount = <Response = FailedTracksAmountResponse, TError = Error>({
  options,
}: {
  options?: HookQueryOptions<Response, TError>;
} = {}) => useQuery<Response, TError>({
  queryFn: () => api.get<Response>(`library/failedTracks/amount`),
  queryKey: FAILED_TRACKS_AMOUNT_QUERY_KEY,
  ...options,
});
