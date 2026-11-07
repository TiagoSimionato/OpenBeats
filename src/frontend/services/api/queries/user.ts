import type { HookQueryOptions } from 'tsm-utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '..';

export const USERS_ME_QUERY_KEY = ['users', 'me'];

export const useGetUsersMe = <Response = null, TError = Error>({
  options,
}: {
  options?: HookQueryOptions<Response, TError>;
} = {}) => useQuery<Response, TError>({
  queryFn: () => api.get<Response>(`users/me`),
  queryKey: USERS_ME_QUERY_KEY,
  ...options,
});
