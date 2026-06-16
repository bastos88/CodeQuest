import type { Request } from 'express';
import { HttpError } from './http.js';

export function requireParam(req: Request, key: string): string {
  const value = req.params[key];
  if (!value) throw new HttpError(400, `Missing route param: ${key}`);
  if (Array.isArray(value)) throw new HttpError(400, `Route param must be a single value: ${key}`);
  return value;
}
