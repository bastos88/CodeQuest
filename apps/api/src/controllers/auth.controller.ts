import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as authService from '../services/auth.service.js';
import { HttpError } from '../utils/http.js';

export async function register(req: Request, res: Response) {
  res.status(201).json(await authService.register(req.body));
}

export async function login(req: Request, res: Response) {
  res.json(await authService.login(req.body));
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.body.refreshToken as string | undefined;
  if (!refreshToken) throw new HttpError(400, 'Missing refresh token');
  res.json(await authService.refresh(refreshToken));
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.body.refreshToken as string | undefined;
  if (refreshToken) await authService.logout(refreshToken);
  res.status(204).send();
}

export async function me(req: AuthenticatedRequest, res: Response) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, xp: true, rating: true, activeTitle: true },
  });
  res.json(user);
}

export async function oauthStart(req: Request, res: Response) {
  const provider = parseProvider(req.params.provider?.toString());
  const state = crypto.randomBytes(24).toString('hex');
  const authorizationUrl = authService.getOAuthAuthorizationUrl(provider, state);

  res.cookie('codequest.oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.WEB_ORIGIN.startsWith('https://'),
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(authorizationUrl);
}

export async function oauthCallback(req: Request, res: Response) {
  const provider = parseProvider(req.params.provider?.toString());
  const code = req.query.code?.toString();
  const state = req.query.state?.toString();
  const expectedState = req.cookies?.['codequest.oauth_state'] as string | undefined;

  res.clearCookie('codequest.oauth_state');

  if (!code || !state || !expectedState || state !== expectedState) {
    res.redirect(`${env.WEB_ORIGIN}/oauth/callback#error=invalid_state`);
    return;
  }

  try {
    const session = await authService.completeOAuth(provider, code);
    const params = new URLSearchParams({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    res.redirect(`${env.WEB_ORIGIN}/oauth/callback#${params.toString()}`);
  } catch {
    res.redirect(`${env.WEB_ORIGIN}/oauth/callback#error=oauth_failed`);
  }
}

function parseProvider(provider: string | undefined) {
  if (provider === 'github' || provider === 'google') return provider;
  throw new HttpError(404, 'Provedor OAuth nao suportado.');
}
