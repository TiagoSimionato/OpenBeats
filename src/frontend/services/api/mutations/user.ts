import type { ChangePasswordRequest } from 'backend/requests/changePassword.dto';
import type { HookMutationOptions, RequestConfig } from 'tsm-utils';
import { useMutation } from '@tanstack/react-query';
import { api } from '..';

export const useChangePassword = <Resquest extends ChangePasswordRequest, Response = void, Error = unknown>({
  configs,
  options,
}: {
  configs?: RequestConfig;
  options?: HookMutationOptions<Resquest, Response, Error>;
} = {}) => useMutation<Response, Error, Resquest>({
  mutationFn: changePasswordRequest => api.post<Response>('users/me/changePassword', changePasswordRequest, configs),
  ...options,
});
