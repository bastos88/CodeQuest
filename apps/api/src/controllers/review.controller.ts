import type { Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as questionService from '../services/question.service.js';
import { requireParam } from '../utils/params.js';

export async function pending(_req: AuthenticatedRequest, res: Response) {
  res.json(
    await prisma.question.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true } },
        alternatives: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  );
}

export async function approve(req: AuthenticatedRequest, res: Response) {
  res.json(await questionService.approveQuestion(requireParam(req, 'questionId'), req.user.id, req.body));
}

export async function reject(req: AuthenticatedRequest, res: Response) {
  res.json(await questionService.rejectQuestion(requireParam(req, 'questionId'), req.user.id, req.body));
}
