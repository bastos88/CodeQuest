import type { Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireParam } from '../utils/params.js';

export async function create(req: AuthenticatedRequest, res: Response) {
  res.status(201).json(
    await prisma.report.create({
      data: {
        userId: req.user.id,
        questionId: String(req.body.questionId),
        reason: String(req.body.reason),
      },
    }),
  );
}

export async function adminIndex(_req: AuthenticatedRequest, res: Response) {
  res.json(await prisma.report.findMany({ include: { question: true, user: true }, orderBy: { createdAt: 'desc' } }));
}

export async function update(req: AuthenticatedRequest, res: Response) {
  res.json(
    await prisma.report.update({
      where: { id: requireParam(req, 'id') },
      data: { status: String(req.body.status ?? 'TRIAGED') as 'OPEN' | 'TRIAGED' | 'RESOLVED' | 'DISMISSED' },
    }),
  );
}
