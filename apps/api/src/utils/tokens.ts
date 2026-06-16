import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type TokenUser = {
  sub: string;
  role: 'USER' | 'REVIEWER' | 'ADMIN';
};

export function signAccessToken(payload: TokenUser): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: TokenUser): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
    jwtid: crypto.randomUUID(),
  });
}

export function verifyAccessToken(token: string): TokenUser {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenUser;
}

export function verifyRefreshToken(token: string): TokenUser {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenUser;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
