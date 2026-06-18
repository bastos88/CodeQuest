import {
  calculateAccuracy,
  calculateQuizXP,
  getLevelFromXP,
  type QuizSetupDifficulty,
  type QuizStartInput,
  type QuizSubmitInput,
} from '@codequest/shared';
import { Prisma, QuestionStatus, type Difficulty } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index]!;
    copy[index] = copy[randomIndex]!;
    copy[randomIndex] = current;
  }

  return copy;
}

function mapSetupDifficultyToDatabase(
  difficulty: QuizSetupDifficulty,
): Difficulty {
  if (difficulty === 'BEGINNER') return 'EASY';
  if (difficulty === 'INTERMEDIATE') return 'MEDIUM';
  return 'HARD';
}

export async function startQuiz(userId: string, input: QuizStartInput) {
  const databaseDifficulty = mapSetupDifficultyToDatabase(input.difficulty);
  const categoryIds = [...new Set(input.categoryIds)];

  const existingCategories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });

  if (existingCategories.length !== categoryIds.length) {
    throw new HttpError(422, 'Categoria inválida.');
  }

  const randomQuestionIds = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "Question"
    WHERE "categoryId" IN (${Prisma.join(categoryIds)})
      AND "difficulty" = ${databaseDifficulty}::"Difficulty"
      AND "status" = ${QuestionStatus.APPROVED}::"QuestionStatus"
      AND "isActive" = true
      AND "archivedAt" IS NULL
    ORDER BY RANDOM()
    LIMIT ${input.questionCount}
  `;
  const selectedIds = randomQuestionIds.map((question) => question.id);

  if (selectedIds.length === 0) {
    throw new HttpError(
      400,
      'Nenhuma pergunta encontrada para essa categoria e dificuldade.',
    );
  }

  if (selectedIds.length < input.questionCount) {
    throw new HttpError(400, 'Não há perguntas suficientes para essa seleção.');
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: selectedIds } },
    include: {
      alternatives: { select: { id: true, text: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  const orderMap = new Map(selectedIds.map((id, index) => [id, index]));
  const selected = questions.sort(
    (left, right) =>
      (orderMap.get(left.id) ?? 0) - (orderMap.get(right.id) ?? 0),
  );

  const session = await prisma.quizSession.create({
    data: {
      userId,
      difficulty: databaseDifficulty,
      questionIds: selected.map((question) => question.id),
      ...(categoryIds.length === 1
        ? { categoryId: categoryIds[0] ?? null }
        : { categoryId: null }),
    },
  });

  return {
    quizSessionId: session.id,
    questions: selected.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      difficulty: question.difficulty,
      category: question.category.name,
      alternatives: shuffleArray(question.alternatives).map((alternative) => ({
        id: alternative.id,
        text: alternative.text,
      })),
    })),
  };
}

export async function submitQuiz(userId: string, input: QuizSubmitInput) {
  const session = await prisma.quizSession.findUnique({
    where: { id: input.quizSessionId },
  });
  if (!session || session.userId !== userId)
    throw new HttpError(404, 'Quiz session not found');
  if (session.submittedAt) throw new HttpError(409, 'Quiz already submitted');

  const questionIds = input.answers.map((answer) => answer.questionId);
  const unauthorizedQuestion = questionIds.find(
    (questionId) => !session.questionIds.includes(questionId),
  );
  if (unauthorizedQuestion)
    throw new HttpError(400, 'Answer contains a question outside this session');

  const questions = await prisma.question.findMany({
    where: { id: { in: session.questionIds } },
    include: { alternatives: true },
  });

  const answerRows = input.answers.map((answer) => {
    const question = questions.find((item) => item.id === answer.questionId);
    if (!question) throw new HttpError(400, 'Invalid question');
    const selected = question.alternatives.find(
      (alternative) => alternative.id === answer.alternativeId,
    );
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
  const durationSeconds = answerRows.reduce(
    (total, answer) => total + answer.timeSpentSeconds,
    0,
  );

  const result = await prisma.$transaction(async (tx) => {
    await tx.quizSession.update({
      where: { id: session.id },
      data: { submittedAt: new Date() },
    });
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
    await tx.question.updateMany({
      where: { id: { in: session.questionIds } },
      data: { usedCount: { increment: 1 } },
    });
    return created;
  });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { xp: true },
  });
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
    if (achievement.key === 'hundred_correct')
      return user.correctAnswers >= 100;
    return false;
  });

  for (const achievement of shouldUnlock) {
    await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
    if (achievement.xpBonus > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: achievement.xpBonus } },
      });
    }
  }
}
