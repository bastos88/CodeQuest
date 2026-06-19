import type { CookieOptions, Request, Response } from 'express';
import crypto from 'node:crypto';
import { passport, type OAuthUser } from '../config/passport.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as authService from '../services/auth.service.js';
import {
  ACCESS_TOKEN_COOKIE,
  authCookieOptions,
  baseCookieOptions,
  clearAuthCookies,
  getRefreshToken,
  OAUTH_STATE_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from '../utils/auth-cookies.js';
import { HttpError } from '../utils/http.js';

export async function register(req: Request, res: Response) {
  const session = await authService.register(req.body);
  setAuthCookies(res, session);
  res.status(201).json(session);
}

export async function login(req: Request, res: Response) {
  const session = await authService.login(req.body);
  setAuthCookies(res, session);
  res.json(session);
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = getRefreshToken(req);
  if (!refreshToken) throw new HttpError(400, 'Missing refresh token');
  const session = await authService.refresh(refreshToken);
  setAuthCookies(res, session);
  res.json(session);
}

export async function logout(req: Request, res: Response) {
  const refreshToken = getRefreshToken(req);
  if (refreshToken) await authService.logout(refreshToken);
  clearAuthCookies(res);
  res.status(204).send();
}

export async function me(req: AuthenticatedRequest, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, xp: true, rating: true, activeTitle: true },
  });
  res.json({ user });
}

export function debugCookies(req: Request, res: Response) {
  if (env.NODE_ENV === 'production') {
    throw new HttpError(404, 'Not found');
  }

  res.json({
    cookieKeys: Object.keys(req.cookies ?? {}),
    hasAccessToken: Boolean(req.cookies?.[ACCESS_TOKEN_COOKIE]),
    hasRefreshToken: Boolean(req.cookies?.[REFRESH_TOKEN_COOKIE]),
  });
}

export async function oauthStart(req: Request, res: Response) {
  const provider = parseProvider(req.params.provider?.toString());
  ensureProviderConfigured(provider);
  const state = crypto.randomBytes(24).toString('hex');

  res.cookie(OAUTH_STATE_COOKIE, state, oauthCookieOptions());

  passport.authenticate(provider, {
    session: false,
    state,
    scope:
      provider === 'google'
        ? ['openid', 'email', 'profile']
        : ['read:user', 'user:email'],
  })(req, res);
}

export async function oauthCallback(req: Request, res: Response) {
  const provider = parseProvider(req.params.provider?.toString());
  const state = req.query.state?.toString();
  const expectedState = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined;

  res.clearCookie(OAUTH_STATE_COOKIE, baseCookieOptions());

  if (!state || !expectedState || state !== expectedState) {
    console.error('OAuth state validation failed', {
      provider,
      hasState: Boolean(state),
      hasExpectedState: Boolean(expectedState),
    });
    res.redirect(`${env.WEB_ORIGIN}/login?error=oauth_failed`);
    return;
  }

  await authenticateOAuth(req, res, provider);
}

function parseProvider(provider: string | undefined) {
  if (provider === 'github' || provider === 'google') return provider;
  throw new HttpError(404, 'Provedor OAuth nao suportado.');
}

function ensureProviderConfigured(provider: 'github' | 'google') {
  if (
    provider === 'github' &&
    (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET)
  ) {
    throw new HttpError(503, 'GitHub OAuth nao configurado.');
  }

  if (
    provider === 'google' &&
    (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)
  ) {
    throw new HttpError(503, 'Google OAuth nao configurado.');
  }
}

function oauthCookieOptions(): CookieOptions {
  return authCookieOptions(10 * 60 * 1000);
}

async function authenticateOAuth(
  req: Request,
  res: Response,
  provider: 'github' | 'google',
) {
  await new Promise<void>((resolve) => {
    passport.authenticate(
      provider,
      { session: false },
      async (error: unknown, user?: OAuthUser) => {
        if (error || !user) {
          console.error('OAuth provider authentication failed', {
            provider,
            error: error instanceof Error ? error.message : String(error),
            hasUser: Boolean(user),
          });
          res.redirect(`${env.WEB_ORIGIN}/login?error=oauth_failed`);
          resolve();
          return;
        }

        try {
          if (env.NODE_ENV !== 'production') {
            console.log('[OAUTH DEBUG] callback reached');
            console.log('[OAUTH DEBUG] user id:', user.id);
            console.log('[OAUTH DEBUG] setting cookies');
          }

          const session = await authService.createTokenPair(user);
          setAuthCookies(res, session);
          res.redirect(`${env.WEB_ORIGIN}/oauth/callback`);
        } catch (sessionError) {
          console.error('OAuth session creation failed', {
            provider,
            userId: user.id,
            error:
              sessionError instanceof Error
                ? sessionError.message
                : String(sessionError),
          });
          res.redirect(`${env.WEB_ORIGIN}/login?error=oauth_failed`);
        }

        resolve();
      },
    )(req, res);
  });
}
