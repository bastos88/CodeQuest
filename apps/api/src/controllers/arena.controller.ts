import type { Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as arenaService from '../services/arena.service.js';

export async function start(req: AuthenticatedRequest, res: Response) {
  res.status(201).json(await arenaService.startArena(req.user.id));
}

export async function submit(req: AuthenticatedRequest, res: Response) {
  res.json(await arenaService.submitArena(req.user.id, String(req.body.matchId), Number(req.body.correctCount)));
}

export async function history(req: AuthenticatedRequest, res: Response) {
  res.json(
    await prisma.arenaMatch.findMany({
      where: { OR: [{ playerAId: req.user.id }, { playerBId: req.user.id }] },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  );
}
