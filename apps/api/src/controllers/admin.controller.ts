import type { Response } from 'express';
import { Difficulty, Prisma, QuestionStatus } from '@prisma/client';
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

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSingleQueryValue(value: unknown) {
  if (Array.isArray(value))
    return typeof value[0] === 'string' ? value[0] : undefined;
  return typeof value === 'string' ? value : undefined;
}

function getSafePositiveInt(value: unknown, fallback: number, max?: number) {
  const parsed = Number(getSingleQueryValue(value));
  const safe = Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  return max ? Math.min(safe, max) : safe;
}

export async function questions(req: AuthenticatedRequest, res: Response) {
  const page = getSafePositiveInt(req.query.page, 1);
  const pageSize = getSafePositiveInt(req.query.pageSize, 20, 50);
  const status = getSingleQueryValue(req.query.status);
  const difficulty = getSingleQueryValue(req.query.difficulty);
  const category = getSingleQueryValue(req.query.category);
  const search = getSingleQueryValue(req.query.search)?.trim();

  const where: Prisma.QuestionWhereInput = {};

  if (
    status &&
    Object.values(QuestionStatus).includes(status as QuestionStatus)
  ) {
    where.status = status as QuestionStatus;
  }

  if (
    difficulty &&
    Object.values(Difficulty).includes(difficulty as Difficulty)
  ) {
    where.difficulty = difficulty as Difficulty;
  }

  if (category) {
    const categoryRecord = await prisma.category.findFirst({
      where: {
        OR: [
          ...(uuidPattern.test(category) ? [{ id: category }] : []),
          { slug: category },
        ],
      },
      select: { id: true },
    });
    if (!categoryRecord) {
      res.json({
        items: [],
        pagination: {
          page,
          pageSize,
          total: 0,
          totalPages: 1,
        },
      });
      return;
    }
    where.categoryId = categoryRecord.id;
  }

  if (search) {
    where.OR = [
      { prompt: { contains: search, mode: 'insensitive' } },
      { explanation: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, email: true } },
        alternatives: { select: { id: true, text: true, isCorrect: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            reviewer: { select: { id: true, name: true, role: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.question.count({ where }),
  ]);

  res.json({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
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
    statusCounts: byStatus.reduce<Record<string, number>>(
      (accumulator, item) => {
        accumulator[item.status] = item._count._all;
        return accumulator;
      },
      {},
    ),
  });
}

export async function activity(_req: AuthenticatedRequest, res: Response) {
  res.json(
    await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  );
}
