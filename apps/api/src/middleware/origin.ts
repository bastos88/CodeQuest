import type { NextFunction, Request, Response } from 'express';
import { allowedWebOrigins } from '../config/env.js';
import { HttpError } from '../utils/http.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function verifyRequestOrigin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const origin = req.header('origin');
  if (origin && !allowedWebOrigins.includes(origin)) {
    next(new HttpError(403, 'Origin not allowed'));
    return;
  }

  next();
}
