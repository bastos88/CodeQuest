import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as gamificationService from '../services/gamification.service.js';

export async function summary(req: AuthenticatedRequest, res: Response) {
  res.json(await gamificationService.getGamificationSummary(req.user.id));
}

export async function achievements(req: AuthenticatedRequest, res: Response) {
  res.json(await gamificationService.getAchievements(req.user.id));
}

export async function dailyMissions(req: AuthenticatedRequest, res: Response) {
  res.json(await gamificationService.getDailyMissions(req.user.id));
}

export async function events(req: AuthenticatedRequest, res: Response) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  res.json(
    await gamificationService.getGamificationEvents(req.user.id, page, limit),
  );
}
