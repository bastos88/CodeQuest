import { Prisma } from '@prisma/client';

type RawQueryClient = {
  $queryRaw<T>(query: Prisma.Sql): Promise<T>;
};

export type SkillAggregate = {
  categoryId: string;
  category: string;
  slug: string;
  answered: number;
  correct: number;
  lastPlayedAt: Date;
};

export async function getSkillAggregates(
  client: RawQueryClient,
  userId: string,
): Promise<SkillAggregate[]> {
  const rows = await client.$queryRaw<
    Array<{
      categoryId: string;
      category: string;
      slug: string;
      answered: bigint;
      correct: bigint;
      lastPlayedAt: Date;
    }>
  >(Prisma.sql`
    SELECT
      c."id" AS "categoryId",
      c."name" AS "category",
      c."slug" AS "slug",
      COUNT(*)::bigint AS "answered",
      SUM(CASE WHEN qa."isCorrect" THEN 1 ELSE 0 END)::bigint AS "correct",
      MAX(qr."createdAt") AS "lastPlayedAt"
    FROM "QuizAnswer" qa
    INNER JOIN "QuizResult" qr ON qr."id" = qa."quizResultId"
    INNER JOIN "Question" q ON q."id" = qa."questionId"
    INNER JOIN "Category" c ON c."id" = q."categoryId"
    WHERE qr."userId" = ${userId}
    GROUP BY c."id", c."name", c."slug"
  `);

  return rows.map((row) => ({
    ...row,
    answered: Number(row.answered),
    correct: Number(row.correct),
  }));
}
