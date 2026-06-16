import { prisma } from '../config/prisma.js';

const userSelect = {
  id: true,
  name: true,
  xp: true,
  rating: true,
  quizzesCompleted: true,
  correctAnswers: true,
  totalAnswers: true,
  activeTitle: { select: { name: true } },
} as const;

export async function getGeneralRanking() {
  return prisma.user.findMany({
    orderBy: [{ xp: 'desc' }, { quizzesCompleted: 'desc' }, { correctAnswers: 'desc' }],
    take: 10,
    select: userSelect,
  });
}

export async function getArenaRanking() {
  return prisma.user.findMany({
    orderBy: [{ rating: 'desc' }, { correctAnswers: 'desc' }],
    take: 10,
    select: userSelect,
  });
}

export async function getContributorRanking() {
  return prisma.user.findMany({
    orderBy: [{ submittedQuestions: { _count: 'desc' } }, { xp: 'desc' }],
    take: 10,
    select: { ...userSelect, _count: { select: { submittedQuestions: true } } },
  });
}
