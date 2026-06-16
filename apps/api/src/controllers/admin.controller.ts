import type { Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export async function dashboard(_req: AuthenticatedRequest, res: Response) {
  const [users, questions, pending, reports, quizzes] = await Promise.all([
    prisma.user.count(),
    prisma.question.count(),
    prisma.question.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.report.count({ where: { status: 'OPEN' } }),
    prisma.quizResult.count(),
  ]);
  res.json({ users, questions, pending, reports, quizzes });
}

export async function questions(_req: AuthenticatedRequest, res: Response) {
  res.json(
    await prisma.question.findMany({
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true } },
        alternatives: { select: { id: true, text: true, isCorrect: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { reviewer: { select: { id: true, name: true, role: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  );
}

export async function stats(_req: AuthenticatedRequest, res: Response) {
  const [averageAccuracy, byStatus] = await Promise.all([
    prisma.quizResult.aggregate({ _avg: { accuracy: true, xpEarned: true } }),
    prisma.question.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  res.json({
    averages: averageAccuracy._avg,
    statusCounts: byStatus.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.status] = item._count._all;
      return accumulator;
    }, {}),
  });
}

export async function activity(_req: AuthenticatedRequest, res: Response) {
  res.json(await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }));
}
