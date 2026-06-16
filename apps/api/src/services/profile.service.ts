import { calculateAccuracy, getXPProgressToNextLevel } from '@codequest/shared';
import { prisma } from '../config/prisma.js';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      activeTitle: true,
      achievements: { include: { achievement: true } },
      titles: { include: { title: true } },
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    activeTitle: user.activeTitle?.name ?? 'Iniciante Promissor',
    xp: user.xp,
    rating: user.rating,
    level: getXPProgressToNextLevel(user.xp),
    stats: {
      quizzesCompleted: user.quizzesCompleted,
      accuracy: calculateAccuracy(user.correctAnswers, user.totalAnswers),
      streakDays: user.streakDays,
      correctAnswers: user.correctAnswers,
    },
    achievements: user.achievements.map((item) => item.achievement),
    titles: user.titles.map((item) => item.title),
  };
}

export async function getSkillMap(userId: string) {
  const answers = await prisma.quizAnswer.findMany({
    where: { quizResult: { userId } },
    include: { question: { include: { category: true } } },
  });

  const grouped = new Map<string, { correct: number; total: number; hard: number }>();
  for (const answer of answers) {
    const key = answer.question.category.name;
    const current = grouped.get(key) ?? { correct: 0, total: 0, hard: 0 };
    current.total += 1;
    current.correct += answer.isCorrect ? 1 : 0;
    current.hard += answer.question.difficulty === 'HARD' ? 1 : 0;
    grouped.set(key, current);
  }

  return [...grouped.entries()].map(([category, value]) => ({
    category,
    mastery: Math.min(100, Math.round(calculateAccuracy(value.correct, value.total) * 0.75 + Math.min(value.total, 40) * 0.5 + value.hard)),
    answered: value.total,
  }));
}

export async function getMissions(userId: string) {
  return prisma.userMission.findMany({
    where: { userId },
    include: { mission: true },
    orderBy: { expiresAt: 'asc' },
  });
}
