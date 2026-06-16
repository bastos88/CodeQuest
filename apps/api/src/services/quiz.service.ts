import { calculateAccuracy, calculateQuizXP, getLevelFromXP, type QuizSetupDifficulty, type QuizStartInput, type QuizSubmitInput } from '@codequest/shared';
import type { Difficulty } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function mapSetupDifficultyToDatabase(difficulty: QuizSetupDifficulty): Difficulty {
  if (difficulty === 'BEGINNER') return 'EASY';
  if (difficulty === 'INTERMEDIATE') return 'MEDIUM';
  return 'HARD';
}

export async function startQuiz(userId: string, input: QuizStartInput) {
  const databaseDifficulty = mapSetupDifficultyToDatabase(input.difficulty);
  const questions = await prisma.question.findMany({
    where: {
      status: 'APPROVED',
      isActive: true,
      archivedAt: null,
      categoryId: { in: input.categoryIds },
      difficulty: databaseDifficulty,
    },
    take: input.questionCount * 4,
    include: { alternatives: true, category: true },
  });

  const selected = shuffle(questions).slice(0, input.questionCount);
  if (selected.length < input.questionCount) {
    throw new HttpError(400, 'Não existem perguntas suficientes para esta combinação de filtros.');
  }

  const session = await prisma.quizSession.create({
    data: {
      userId,
      difficulty: databaseDifficulty,
      questionIds: selected.map((question) => question.id),
      ...(input.categoryIds.length === 1 ? { categoryId: input.categoryIds[0] ?? null } : { categoryId: null }),
    },
  });

  return {
    quizSessionId: session.id,
    questions: selected.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      difficulty: question.difficulty,
      category: question.category.name,
      alternatives: shuffle(question.alternatives).map((alternative) => ({
        id: alternative.id,
        text: alternative.text,
      })),
    })),
  };
}

export async function submitQuiz(userId: string, input: QuizSubmitInput) {
  const session = await prisma.quizSession.findUnique({ where: { id: input.quizSessionId } });
  if (!session || session.userId !== userId) throw new HttpError(404, 'Quiz session not found');
  if (session.submittedAt) throw new HttpError(409, 'Quiz already submitted');

  const questionIds = input.answers.map((answer) => answer.questionId);
  const unauthorizedQuestion = questionIds.find((questionId) => !session.questionIds.includes(questionId));
  if (unauthorizedQuestion) throw new HttpError(400, 'Answer contains a question outside this session');

  const questions = await prisma.question.findMany({
    where: { id: { in: session.questionIds } },
    include: { alternatives: true },
  });

  const answerRows = input.answers.map((answer) => {
    const question = questions.find((item) => item.id === answer.questionId);
    if (!question) throw new HttpError(400, 'Invalid question');
    const selected = question.alternatives.find((alternative) => alternative.id === answer.alternativeId);
    if (!selected) throw new HttpError(400, 'Invalid alternative');
    return {
      questionId: question.id,
      selectedOptionId: selected.id,
      isCorrect: selected.isCorrect,
      timeSpentSeconds: answer.timeSpentSeconds,
      difficulty: question.difficulty,
    };
  });

  const correctCount = answerRows.filter((answer) => answer.isCorrect).length;
  const xpEarned = calculateQuizXP(answerRows);
  const durationSeconds = answerRows.reduce((total, answer) => total + answer.timeSpentSeconds, 0);

  const result = await prisma.$transaction(async (tx) => {
    await tx.quizSession.update({ where: { id: session.id }, data: { submittedAt: new Date() } });
    const created = await tx.quizResult.create({
      data: {
        userId,
        sessionId: session.id,
        totalQuestions: session.questionIds.length,
        correctCount,
        accuracy: calculateAccuracy(correctCount, session.questionIds.length),
        xpEarned,
        durationSeconds,
        answers: {
          createMany: {
            data: answerRows.map((answer) => ({
              questionId: answer.questionId,
              selectedOptionId: answer.selectedOptionId,
              isCorrect: answer.isCorrect,
              timeSpentSeconds: answer.timeSpentSeconds,
            })),
          },
        },
      },
      include: { answers: true },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpEarned },
        quizzesCompleted: { increment: 1 },
        correctAnswers: { increment: correctCount },
        totalAnswers: { increment: session.questionIds.length },
      },
    });
    await tx.question.updateMany({ where: { id: { in: session.questionIds } }, data: { usedCount: { increment: 1 } } });
    return created;
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } });
  await unlockAchievements(userId);

  return {
    ...result,
    level: getLevelFromXP(user.xp),
    answers: result.answers.map((answer) => ({
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      isCorrect: answer.isCorrect,
    })),
  };
}

export async function getQuizHistory(userId: string) {
  return prisma.quizResult.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function getQuizResult(userId: string, id: string) {
  return prisma.quizResult.findFirstOrThrow({
    where: { id, userId },
    include: {
      answers: {
        include: {
          question: {
            select: {
              id: true,
              prompt: true,
              difficulty: true,
              category: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

async function unlockAchievements(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const achievements = await prisma.achievement.findMany();
  const unlockedKeys = new Set(
    (
      await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      })
    ).map((item) => item.achievement.key),
  );

  const shouldUnlock = achievements.filter((achievement) => {
    if (unlockedKeys.has(achievement.key)) return false;
    if (achievement.key === 'first_quiz') return user.quizzesCompleted >= 1;
    if (achievement.key === 'ten_quizzes') return user.quizzesCompleted >= 10;
    if (achievement.key === 'hundred_correct') return user.correctAnswers >= 100;
    return false;
  });

  for (const achievement of shouldUnlock) {
    await prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } });
    if (achievement.xpBonus > 0) {
      await prisma.user.update({ where: { id: userId }, data: { xp: { increment: achievement.xpBonus } } });
    }
  }
}
