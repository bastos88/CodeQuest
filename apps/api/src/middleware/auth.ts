import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
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

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
  const token = cookieToken;

  if (!token) {
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
