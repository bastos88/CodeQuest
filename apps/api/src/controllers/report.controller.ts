import type { Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireParam } from '../utils/params.js';

export async function create(req: AuthenticatedRequest, res: Response) {
  res.status(201).json(
    await prisma.report.create({
      data: {
        userId: req.user.id,
        questionId: req.body.questionId,
        reason: req.body.reason,
      },
    }),
  );
}

export async function adminIndex(_req: AuthenticatedRequest, res: Response) {
  res.json(
    await prisma.report.findMany({
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        question: {
          select: { id: true, prompt: true, status: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  );
}

export async function update(req: AuthenticatedRequest, res: Response) {
  res.json(
    await prisma.report.update({
      where: { id: requireParam(req, 'id') },
      data: { status: req.body.status },
    }),
  );
}
