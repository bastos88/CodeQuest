import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ACCESS_TOKEN_COOKIE } from '../utils/auth-cookies.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { HttpError } from '../utils/http.js';

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    role: 'USER' | 'REVIEWER' | 'ADMIN';
  };
};

function authDebug(message: string, payload?: unknown) {
  if (env.NODE_ENV !== 'production') {
    if (payload === undefined) console.log(message);
    else console.log(message, payload);
  }
}

function extractBearerToken(authorization?: string) {
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice('Bearer '.length);
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorization =
    req.headers.authorization ||
    req.header('Authorization') ||
    req.header('authorization');

  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as
    | string
    | undefined;

  authDebug('[AUTH DEBUG] cookie keys:', Object.keys(req.cookies ?? {}));
  authDebug('[AUTH DEBUG] has access cookie:', Boolean(cookieToken));
  authDebug(
    '[AUTH DEBUG] has authorization header:',
    Boolean(req.headers.authorization),
  );

  const bearerToken = extractBearerToken(
    typeof authorization === 'string' ? authorization : undefined,
  );
  const token = cookieToken ?? bearerToken;

  if (!token) {
    authDebug('[AUTH DEBUG] failure:', { reason: 'missing_token' });
    next(new HttpError(401, 'Missing access token'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });

    if (!user) {
      authDebug('[AUTH DEBUG] failure:', { reason: 'user_not_found' });
      next(new HttpError(401, 'Invalid access token'));
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      authDebug('[AUTH DEBUG] failure:', { reason: 'invalid_token' });
      next(new HttpError(401, 'Invalid access token'));
      return;
    }

    next(error);
  }
}

export function requireRole(...roles: Array<'REVIEWER' | 'ADMIN'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      throw new HttpError(401, 'Missing authenticated user');
    }

    if (!roles.includes(user.role as 'REVIEWER' | 'ADMIN')) {
      throw new HttpError(403, 'Forbidden');
    }

    next();
  };
}
