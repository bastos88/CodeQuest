import type { Response } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as rankingService from '../services/ranking.service.js';
import { requireParam } from '../utils/params.js';
import { Prisma } from '@prisma/client';
import { calculateAccuracy } from '@codequest/shared';

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
  const categoryId = requireParam(req, 'categoryId');
  const users = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      xp: number;
      title: string | null;
      correct: bigint;
      answered: bigint;
    }>
  >(Prisma.sql`
    SELECT
      u."id",
      u."name",
      u."xp",
      t."name" AS "title",
      SUM(CASE WHEN qa."isCorrect" THEN 1 ELSE 0 END)::bigint AS "correct",
      COUNT(*)::bigint AS "answered"
    FROM "User" u
    INNER JOIN "QuizResult" qr ON qr."userId" = u."id"
    INNER JOIN "QuizAnswer" qa ON qa."quizResultId" = qr."id"
    INNER JOIN "Question" q ON q."id" = qa."questionId"
    LEFT JOIN "Title" t ON t."id" = u."activeTitleId"
    WHERE q."categoryId" = ${categoryId}
    GROUP BY u."id", u."name", u."xp", t."name"
    ORDER BY
      SUM(CASE WHEN qa."isCorrect" THEN 1 ELSE 0 END) DESC,
      (SUM(CASE WHEN qa."isCorrect" THEN 1 ELSE 0 END)::decimal / COUNT(*)) DESC,
      COUNT(*) DESC
    LIMIT 10
  `);

  res.json(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      xp: user.xp,
      activeTitle: user.title ? { name: user.title } : null,
      categoryCorrect: Number(user.correct),
      categoryAnswered: Number(user.answered),
      categoryAccuracy: calculateAccuracy(
        Number(user.correct),
        Number(user.answered),
      ),
    })),
  );
}

export async function mine(req: AuthenticatedRequest, res: Response) {
  const higher = await prisma.user.count({
    where: {
      xp: {
        gt: (
          await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } })
        ).xp,
      },
    },
  });
  res.json({ position: higher + 1 });
}
