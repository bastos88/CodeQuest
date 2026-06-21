import { api } from './api';

export type AuthMessageResponse = { message: string };

export async function forgotPassword(
  email: string,
): Promise<AuthMessageResponse> {
  return (
    await api.post<AuthMessageResponse>(
      '/auth/forgot-password',
      { email },
      { skipAuthRefresh: true, skipAuthExpiredHandler: true },
    )
  ).data;
}

export async function resetPassword(payload: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AuthMessageResponse> {
  return (
    await api.post<AuthMessageResponse>('/auth/reset-password', payload, {
      skipAuthRefresh: true,
      skipAuthExpiredHandler: true,
    })
  ).data;
}
