import {
  XP_RULES,
  calculateAccuracy,
  getXPProgressToNextLevel,
} from '@codequest/shared';
import { MissionStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';
import { getSkillAggregates } from './skill-metrics.service.js';

type Transaction = Prisma.TransactionClient;

type AchievementContext = {
  perfectQuiz?: boolean;
  contributionApproved?: boolean;
  arenaWin?: boolean;
};

type UserMetrics = {
  quizzesCompleted: number;
  streakDays: number;
  mastery: Record<'frontend' | 'backend' | 'database', number>;
};

const MASTERY_CATEGORIES = {
  frontend: new Set([
    'html',
    'css',
    'javascript',
    'typescript',
    'react',
    'frontend',
  ]),
  backend: new Set([
    'node',
    'nodejs',
    'apis-rest',
    'api-rest',
    'backend',
    'security',
    'architecture',
  ]),
  database: new Set([
    'sql',
    'database',
    'databases',
    'postgresql',
    'postgres',
    'mongodb',
  ]),
} as const;

async function lockUserGamification(tx: Transaction, userId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
}

function utcDayStart(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

function utcDayEnd(value: Date) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate() + 1,
    ) - 1,
  );
}

function calculateStreak(
  lastActivityAt: Date | null,
  currentStreak: number,
  now: Date,
) {
  if (!lastActivityAt) return { streak: 1, activityDayChanged: true };
  const differenceInDays = Math.round(
    (utcDayStart(now).getTime() - utcDayStart(lastActivityAt).getTime()) /
      86_400_000,
  );
  if (differenceInDays <= 0)
    return { streak: Math.max(1, currentStreak), activityDayChanged: false };
  if (differenceInDays === 1)
    return { streak: Math.max(1, currentStreak) + 1, activityDayChanged: true };
  return { streak: 1, activityDayChanged: true };
}

function levelPayload(totalXP: number) {
  return { currentXP: totalXP, ...getXPProgressToNextLevel(totalXP) };
}

function publicAchievement(achievement: {
  key: string;
  name: string;
  description: string;
  category: string;
  xpBonus: number;
  iconKey: string | null;
}) {
  return {
    code: achievement.key,
    name: achievement.name,
    description: achievement.description,
    category: achievement.category,
    xpReward: achievement.xpBonus,
    iconKey: achievement.iconKey,
  };
}

async function masteryMetrics(tx: Transaction, userId: string) {
  const aggregates = await getSkillAggregates(tx, userId);
  const totals = {
    frontend: { answered: 0, correct: 0 },
    backend: { answered: 0, correct: 0 },
    database: { answered: 0, correct: 0 },
  };
  for (const aggregate of aggregates) {
    const slug = aggregate.slug.toLowerCase();
    for (const [group, slugs] of Object.entries(MASTERY_CATEGORIES)) {
      if (slugs.has(slug)) {
        const total = totals[group as keyof typeof totals];
        total.answered += aggregate.answered;
        total.correct += aggregate.correct;
      }
    }
  }
  return Object.fromEntries(
    Object.entries(totals).map(([key, value]) => {
      const accuracy = calculateAccuracy(value.correct, value.answered);
      return [
        key,
        Math.min(
          100,
          Math.round(accuracy * 0.75 + Math.min(value.answered, 40) * 0.5),
        ),
      ];
    }),
  ) as UserMetrics['mastery'];
}

function achievementProgress(
  code: string,
  metrics: UserMetrics,
  context: AchievementContext = {},
) {
  const progress = (current: number, target: number) => ({
    current: Math.min(current, target),
    target,
  });
  switch (code) {
    case 'FIRST_QUIZ':
      return progress(metrics.quizzesCompleted, 1);
    case 'QUIZ_MASTER_10':
      return progress(metrics.quizzesCompleted, 10);
    case 'QUIZ_MASTER_50':
      return progress(metrics.quizzesCompleted, 50);
    case 'PERFECT_QUIZ':
      return progress(context.perfectQuiz ? 1 : 0, 1);
    case 'STREAK_3':
      return progress(metrics.streakDays, 3);
    case 'STREAK_7':
      return progress(metrics.streakDays, 7);
    case 'STREAK_30':
      return progress(metrics.streakDays, 30);
    case 'FRONTEND_MASTER':
      return progress(metrics.mastery.frontend, 80);
    case 'BACKEND_MASTER':
      return progress(metrics.mastery.backend, 80);
    case 'DATABASE_MASTER':
      return progress(metrics.mastery.database, 80);
    case 'CONTRIBUTOR':
      return progress(context.contributionApproved ? 1 : 0, 1);
    case 'ARENA_FIRST_WIN':
      return progress(context.arenaWin ? 1 : 0, 1);
    default:
      return progress(0, 1);
  }
}

async function unlockEligibleAchievements(
  tx: Transaction,
  userId: string,
  metrics: UserMetrics,
  context: AchievementContext,
  now: Date,
) {
  const [achievements, unlocked] = await Promise.all([
    tx.achievement.findMany({ where: { isActive: true } }),
    tx.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
  ]);
  const unlockedIds = new Set(unlocked.map((item) => item.achievementId));
  const newAchievements = [];
  let xpReward = 0;
  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;
    const progress = achievementProgress(achievement.key, metrics, context);
    if (progress.current < progress.target) continue;
    await tx.userAchievement.create({
      data: { userId, achievementId: achievement.id, unlockedAt: now },
    });
    await tx.gamificationEvent.create({
      data: {
        userId,
        type:
          achievement.category === 'mastery'
            ? 'CATEGORY_MASTERY'
            : 'ACHIEVEMENT_UNLOCKED',
        xpChange: achievement.xpBonus,
        sourceKey: `achievement:${userId}:${achievement.id}`,
        metadata: { achievementCode: achievement.key },
        createdAt: now,
      },
    });
    xpReward += achievement.xpBonus;
    newAchievements.push({
      ...publicAchievement(achievement),
      unlockedAt: now.toISOString(),
    });
  }
  return { newAchievements, xpReward };
}

async function ensureDailyMissions(tx: Transaction, userId: string, now: Date) {
  const expiresAt = utcDayEnd(now);
  const missions = await tx.mission.findMany({
    where: { type: 'DAILY', isActive: true },
    orderBy: { key: 'asc' },
  });
  for (const mission of missions) {
    await tx.userMission.upsert({
      where: {
        userId_missionId_expiresAt: {
          userId,
          missionId: mission.id,
          expiresAt,
        },
      },
      update: {},
      create: { userId, missionId: mission.id, expiresAt },
    });
  }
  return { missions, expiresAt };
}

async function advanceDailyMissions(
  tx: Transaction,
  userId: string,
  now: Date,
  increments: { quizzes: number; answers: number; correct: number },
) {
  const { missions, expiresAt } = await ensureDailyMissions(tx, userId, now);
  let xpReward = 0;
  const completed = [];
  for (const mission of missions) {
    const userMission = await tx.userMission.findUniqueOrThrow({
      where: {
        userId_missionId_expiresAt: {
          userId,
          missionId: mission.id,
          expiresAt,
        },
      },
    });
    if (userMission.status === MissionStatus.COMPLETED) continue;
    const increment =
      mission.key === 'COMPLETE_1_QUIZ'
        ? increments.quizzes
        : mission.key === 'ANSWER_10_QUESTIONS'
          ? increments.answers
          : mission.key === 'GET_8_CORRECT'
            ? increments.correct
            : 0;
    if (increment <= 0) continue;
    const progress = Math.min(mission.target, userMission.progress + increment);
    const didComplete = progress >= mission.target;
    await tx.userMission.update({
      where: { id: userMission.id },
      data: {
        progress,
        ...(didComplete ? { status: 'COMPLETED', completedAt: now } : {}),
      },
    });
    if (didComplete) {
      xpReward += mission.xpReward;
      completed.push({
        code: mission.key,
        title: mission.title,
        xpReward: mission.xpReward,
      });
      await tx.gamificationEvent.create({
        data: {
          userId,
          type: 'DAILY_MISSION_COMPLETED',
          xpChange: mission.xpReward,
          sourceKey: `mission:${userMission.id}:completed`,
          metadata: { missionCode: mission.key },
          createdAt: now,
        },
      });
    }
  }
  return { completed, xpReward };
}

export async function applyQuizGamification(
  tx: Transaction,
  input: { userId: string; quizResultId: string; now?: Date },
) {
  const now = input.now ?? new Date();
  await lockUserGamification(tx, input.userId);
  const guarded = await tx.quizResult.updateMany({
    where: {
      id: input.quizResultId,
      userId: input.userId,
      gamificationAppliedAt: null,
    },
    data: { gamificationAppliedAt: now },
  });
  if (guarded.count !== 1)
    throw new HttpError(409, 'Gamification already applied to this quiz');

  const [result, user] = await Promise.all([
    tx.quizResult.findUniqueOrThrow({
      where: { id: input.quizResultId },
      include: {
        session: { select: { difficulty: true } },
        answers: { include: { question: { select: { categoryId: true } } } },
      },
    }),
    tx.user.findUniqueOrThrow({ where: { id: input.userId } }),
  ]);
  const categoryIds = [
    ...new Set(result.answers.map((answer) => answer.question.categoryId)),
  ];
  const previouslyPlayed = await tx.quizAnswer.findMany({
    where: {
      quizResult: { userId: input.userId, id: { not: result.id } },
      question: { categoryId: { in: categoryIds } },
    },
    select: { question: { select: { categoryId: true } } },
    distinct: ['questionId'],
  });
  const previousCategoryIds = new Set(
    previouslyPlayed.map((answer) => answer.question.categoryId),
  );
  const firstCategoryCount = categoryIds.filter(
    (id) => !previousCategoryIds.has(id),
  ).length;
  const baseXP =
    XP_RULES.quizCompleted + result.correctCount * XP_RULES.correctAnswer;
  const hardBonus =
    result.session.difficulty === 'HARD' ? XP_RULES.hardQuizBonus : 0;
  const firstCategoryBonus = firstCategoryCount * XP_RULES.firstCategory;
  const perfectBonus = result.accuracy === 100 ? XP_RULES.perfectQuiz : 0;
  const streak = calculateStreak(user.lastActivityAt, user.streakDays, now);
  const streakBonus = streak.activityDayChanged
    ? Math.min(
        streak.streak * XP_RULES.streakPerDay,
        XP_RULES.maximumStreakBonus,
      )
    : 0;
  const quizXP =
    baseXP + hardBonus + firstCategoryBonus + perfectBonus + streakBonus;

  await tx.user.update({
    where: { id: input.userId },
    data: {
      xp: { increment: quizXP },
      quizzesCompleted: { increment: 1 },
      correctAnswers: { increment: result.correctCount },
      totalAnswers: { increment: result.totalQuestions },
      streakDays: streak.streak,
      longestStreak: Math.max(user.longestStreak, streak.streak),
      lastActivityAt: now,
    },
  });
  await tx.gamificationEvent.create({
    data: {
      userId: input.userId,
      type: 'QUIZ_COMPLETED',
      xpChange: baseXP + hardBonus + firstCategoryBonus,
      sourceKey: `quiz:${result.id}:completed`,
      metadata: {
        quizResultId: result.id,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        hardBonus,
        firstCategoryCount,
      },
      createdAt: now,
    },
  });
  if (perfectBonus > 0) {
    await tx.gamificationEvent.create({
      data: {
        userId: input.userId,
        type: 'QUIZ_PERFECT',
        xpChange: perfectBonus,
        sourceKey: `quiz:${result.id}:perfect`,
        metadata: { quizResultId: result.id },
        createdAt: now,
      },
    });
  }
  if (streakBonus > 0) {
    await tx.gamificationEvent.create({
      data: {
        userId: input.userId,
        type: 'STREAK_BONUS',
        xpChange: streakBonus,
        sourceKey: `streak:${input.userId}:${utcDayStart(now).toISOString().slice(0, 10)}`,
        metadata: { streakDays: streak.streak },
        createdAt: now,
      },
    });
  }

  const missions = await advanceDailyMissions(tx, input.userId, now, {
    quizzes: 1,
    answers: result.totalQuestions,
    correct: result.correctCount,
  });
  const metrics: UserMetrics = {
    quizzesCompleted: user.quizzesCompleted + 1,
    streakDays: streak.streak,
    mastery: await masteryMetrics(tx, input.userId),
  };
  const achievements = await unlockEligibleAchievements(
    tx,
    input.userId,
    metrics,
    { perfectQuiz: result.accuracy === 100 },
    now,
  );
  const xpGained = quizXP + missions.xpReward + achievements.xpReward;
  if (missions.xpReward + achievements.xpReward > 0) {
    await tx.user.update({
      where: { id: input.userId },
      data: { xp: { increment: missions.xpReward + achievements.xpReward } },
    });
  }
  const totalXP = user.xp + xpGained;
  await tx.quizResult.update({
    where: { id: result.id },
    data: { xpEarned: xpGained },
  });
  return {
    xpGained,
    totalXP,
    level: levelPayload(totalXP),
    streak: {
      current: streak.streak,
      longest: Math.max(user.longestStreak, streak.streak),
    },
    newAchievements: achievements.newAchievements,
    completedMissions: missions.completed,
  };
}

async function currentMetrics(
  tx: Transaction,
  userId: string,
): Promise<UserMetrics> {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  return {
    quizzesCompleted: user.quizzesCompleted,
    streakDays: user.streakDays,
    mastery: await masteryMetrics(tx, userId),
  };
}

export async function applyContributionGamification(
  tx: Transaction,
  userId: string,
  questionId: string,
) {
  const now = new Date();
  await lockUserGamification(tx, userId);
  const sourceKey = `contribution:${questionId}:approved`;
  const existingEvent = await tx.gamificationEvent.findUnique({
    where: { sourceKey },
    select: { id: true },
  });
  if (existingEvent) return;
  await tx.gamificationEvent.create({
    data: {
      userId,
      type: 'CONTRIBUTION_APPROVED',
      xpChange: XP_RULES.approvedQuestion,
      sourceKey,
      metadata: { questionId },
      createdAt: now,
    },
  });
  const unlocked = await unlockEligibleAchievements(
    tx,
    userId,
    await currentMetrics(tx, userId),
    { contributionApproved: true },
    now,
  );
  await tx.user.update({
    where: { id: userId },
    data: { xp: { increment: XP_RULES.approvedQuestion + unlocked.xpReward } },
  });
}

export async function applyArenaGamification(
  tx: Transaction,
  userId: string,
  matchId: string,
  won: boolean,
) {
  const now = new Date();
  await lockUserGamification(tx, userId);
  await tx.gamificationEvent.create({
    data: {
      userId,
      type: won ? 'ARENA_WIN' : 'ARENA_LOSS',
      xpChange: 0,
      sourceKey: `arena:${matchId}:${userId}`,
      metadata: { matchId },
      createdAt: now,
    },
  });
  if (!won) return;
  const unlocked = await unlockEligibleAchievements(
    tx,
    userId,
    await currentMetrics(tx, userId),
    { arenaWin: true },
    now,
  );
  if (unlocked.xpReward > 0) {
    await tx.user.update({
      where: { id: userId },
      data: { xp: { increment: unlocked.xpReward } },
    });
  }
}

export async function getGamificationSummary(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      xp: true,
      streakDays: true,
      longestStreak: true,
      quizzesCompleted: true,
      correctAnswers: true,
      totalAnswers: true,
    },
  });
  return {
    totalXP: user.xp,
    level: levelPayload(user.xp),
    streak: { current: user.streakDays, longest: user.longestStreak },
    stats: {
      quizzesCompleted: user.quizzesCompleted,
      correctAnswers: user.correctAnswers,
      totalAnswers: user.totalAnswers,
      accuracy: calculateAccuracy(user.correctAnswers, user.totalAnswers),
    },
  };
}

export async function getAchievements(userId: string) {
  return prisma.$transaction(async (tx) => {
    const [achievements, unlocked, metrics] = await Promise.all([
      tx.achievement.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
      tx.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, unlockedAt: true },
      }),
      currentMetrics(tx, userId),
    ]);
    const unlockedById = new Map(
      unlocked.map((item) => [item.achievementId, item.unlockedAt]),
    );
    return achievements.map((achievement) => {
      const unlockedAt = unlockedById.get(achievement.id);
      const progress = achievementProgress(achievement.key, metrics);
      return {
        ...publicAchievement(achievement),
        unlocked: Boolean(unlockedAt),
        unlockedAt: unlockedAt?.toISOString() ?? null,
        progress: unlockedAt
          ? { current: progress.target, target: progress.target }
          : progress,
      };
    });
  });
}

export async function getDailyMissions(userId: string) {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const { expiresAt } = await ensureDailyMissions(tx, userId, now);
    const missions = await tx.userMission.findMany({
      where: { userId, expiresAt },
      include: { mission: true },
      orderBy: { mission: { key: 'asc' } },
    });
    return {
      date: utcDayStart(now).toISOString().slice(0, 10),
      expiresAt: expiresAt.toISOString(),
      missions: missions.map((item) => ({
        code: item.mission.key,
        title: item.mission.title,
        description: item.mission.description,
        progress: item.progress,
        target: item.mission.target,
        xpReward: item.mission.xpReward,
        completed: item.status === 'COMPLETED',
        completedAt: item.completedAt?.toISOString() ?? null,
      })),
    };
  });
}

export async function getGamificationEvents(
  userId: string,
  page = 1,
  limit = 20,
) {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  const [items, total] = await prisma.$transaction([
    prisma.gamificationEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      select: {
        id: true,
        type: true,
        xpChange: true,
        metadata: true,
        createdAt: true,
      },
    }),
    prisma.gamificationEvent.count({ where: { userId } }),
  ]);
  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
}
