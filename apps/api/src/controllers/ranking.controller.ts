import type { Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as rankingService from '../services/ranking.service.js';
import { requireParam } from '../utils/params.js';

export async function general(_req: AuthenticatedRequest, res: Response) {
  res.json(await rankingService.getGeneralRanking());
}

export async function arena(_req: AuthenticatedRequest, res: Response) {
  res.json(await rankingService.getArenaRanking());
}

export async function contributors(_req: AuthenticatedRequest, res: Response) {
  res.json(await rankingService.getContributorRanking());
}

export async function category(req: AuthenticatedRequest, res: Response) {
  const users = await prisma.user.findMany({
    where: { quizResults: { some: { answers: { some: { question: { categoryId: requireParam(req, 'categoryId') } } } } } },
    orderBy: [{ xp: 'desc' }],
    take: 10,
    select: { id: true, name: true, xp: true, activeTitle: true },
  });
  res.json(users);
}

export async function mine(req: AuthenticatedRequest, res: Response) {
  const higher = await prisma.user.count({
    where: { xp: { gt: (await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } })).xp } },
  });
  res.json({ position: higher + 1 });
}
