import type { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env.js';

export const ACCESS_TOKEN_COOKIE = 'codequest.access_token';
export const REFRESH_TOKEN_COOKIE = 'codequest.refresh_token';
export const OAUTH_STATE_COOKIE = 'codequest.oauth_state';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

export function baseCookieOptions(): CookieOptions {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

export function authCookieOptions(maxAge: number): CookieOptions {
  return { ...baseCookieOptions(), maxAge };
}

export function setAuthCookies(
  res: Response,
  session: { accessToken: string; refreshToken: string },
) {
  res.cookie(
    ACCESS_TOKEN_COOKIE,
    session.accessToken,
    authCookieOptions(ACCESS_TOKEN_MAX_AGE),
  );
  res.cookie(
    REFRESH_TOKEN_COOKIE,
    session.refreshToken,
    authCookieOptions(REFRESH_TOKEN_MAX_AGE),
  );
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseCookieOptions());
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseCookieOptions());
}

export function getRefreshToken(req: Request) {
  return req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
}
