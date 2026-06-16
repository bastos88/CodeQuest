import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/tokens.js';
import { HttpError } from '../utils/http.js';

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    role: 'USER' | 'REVIEWER' | 'ADMIN';
  };
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization =
    req.headers.authorization ||
    req.header('Authorization') ||
    req.header('authorization');

  console.log('AUTH HEADER:', authorization);

  const token =
    typeof authorization === 'string' && authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;

  console.log('TOKEN EXISTS:', Boolean(token));

  if (!token) {
    throw new HttpError(401, 'Missing access token');
  }

  try {
    const payload = verifyAccessToken(token);

    console.log('JWT PAYLOAD:', payload);

    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.error('JWT ERROR:', error);

    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      throw new HttpError(401, 'Invalid access token');
    }

    throw error;
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