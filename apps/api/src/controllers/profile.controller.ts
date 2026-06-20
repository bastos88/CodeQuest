import type { Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as profileService from '../services/profile.service.js';

export async function me(req: AuthenticatedRequest, res: Response) {
  res.json(await profileService.getProfile(req.user.id));
}

export async function skills(req: AuthenticatedRequest, res: Response) {
  res.json(await profileService.getSkillMap(req.user.id));
}

export async function updateMe(req: AuthenticatedRequest, res: Response) {
  res.json(await profileService.updateProfile(req.user.id, req.body));
}

export async function updatePassword(req: AuthenticatedRequest, res: Response) {
  res.json(await profileService.updatePassword(req.user.id, req.body));
}

export async function achievements(req: AuthenticatedRequest, res: Response) {
  res.json(await prisma.achievement.findMany({ include: { users: { where: { userId: req.user.id } } } }));
}

export async function missions(req: AuthenticatedRequest, res: Response) {
  res.json(await profileService.getMissions(req.user.id));
}
