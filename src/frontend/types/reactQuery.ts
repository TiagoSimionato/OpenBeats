import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

export type HookMutationOptions<
  Request,
  Response,
  TError,
  Context = unknown,
> = Omit<UseMutationOptions<Response, TError, Request, Context>, 'mutationFn'>;

export type HookQueryOptions<Response, TError = Error> = Omit<
  UseQueryOptions<unknown, TError, Response>,
  'queryFn' | 'queryKey'
>;
