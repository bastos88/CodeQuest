import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
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
