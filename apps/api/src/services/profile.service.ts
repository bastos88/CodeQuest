import { calculateAccuracy, getXPProgressToNextLevel } from '@codequest/shared';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';

export type UpdateProfileInput = {
  name?: string;
  avatarUrl?: string | null;
};

export type UpdatePasswordInput = {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
};

function normalizeName(name: string) {
  const normalized = name.trim();
  if (normalized.length < 2 || normalized.length > 30) {
    throw new HttpError(422, 'O nome deve ter entre 2 e 30 caracteres.');
  }
  return normalized;
}

function normalizeAvatarUrl(avatarUrl: string | null) {
  if (avatarUrl === null) return null;

  const normalized = avatarUrl.trim();
  if (!normalized) return null;

  try {
    const url = new URL(normalized);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
    return url.toString();
  } catch {
    throw new HttpError(422, 'Informe uma URL de avatar válida.');
  }
}

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
    select: {
      isCorrect: true,
      quizResult: { select: { createdAt: true } },
      question: {
        select: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  const grouped = new Map<
    string,
    {
      categoryId: string;
      category: string;
      slug: string;
      answered: number;
      correct: number;
      lastPlayedAt: Date;
    }
  >();

  for (const answer of answers) {
    const { category } = answer.question;
    const current = grouped.get(category.id) ?? {
      categoryId: category.id,
      category: category.name,
      slug: category.slug,
      answered: 0,
      correct: 0,
      lastPlayedAt: answer.quizResult.createdAt,
    };
    current.answered += 1;
    current.correct += answer.isCorrect ? 1 : 0;
    if (answer.quizResult.createdAt > current.lastPlayedAt) {
      current.lastPlayedAt = answer.quizResult.createdAt;
    }
    grouped.set(category.id, current);
  }

  return [...grouped.values()]
    .map((value) => {
      const accuracy = calculateAccuracy(value.correct, value.answered);
      const volumeBonus = Math.min(value.answered, 40) * 0.5;
      return {
        ...value,
        accuracy,
        mastery: Math.min(100, Math.round(accuracy * 0.75 + volumeBonus)),
        lastPlayedAt: value.lastPlayedAt.toISOString(),
      };
    })
    .sort(
      (left, right) =>
        right.mastery - left.mastery ||
        Date.parse(right.lastPlayedAt) - Date.parse(left.lastPlayedAt),
    );
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const data: { name?: string; avatarUrl?: string | null } = {};

  if (input.name !== undefined) data.name = normalizeName(input.name);
  if (input.avatarUrl !== undefined) {
    data.avatarUrl = normalizeAvatarUrl(input.avatarUrl);
  }
  if (Object.keys(data).length === 0) {
    throw new HttpError(422, 'Informe ao menos um campo para atualizar.');
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      xp: true,
      rating: true,
    },
  });
}

export async function updatePassword(userId: string, input: UpdatePasswordInput) {
  if (input.newPassword.length < 8) {
    throw new HttpError(422, 'A nova senha deve ter no mínimo 8 caracteres.');
  }
  if (input.newPassword !== input.confirmPassword) {
    throw new HttpError(422, 'A confirmação da senha não confere.');
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (user.passwordHash) {
    if (!input.currentPassword) {
      throw new HttpError(422, 'Informe a senha atual.');
    }
    const currentPasswordMatches = await bcrypt.compare(
      input.currentPassword,
      user.passwordHash,
    );
    if (!currentPasswordMatches) {
      throw new HttpError(401, 'A senha atual está incorreta.');
    }
    if (await bcrypt.compare(input.newPassword, user.passwordHash)) {
      throw new HttpError(422, 'A nova senha deve ser diferente da senha atual.');
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(input.newPassword, 12) },
  });

  return { message: 'Senha alterada com sucesso.' };
}

export async function getMissions(userId: string) {
  return prisma.userMission.findMany({
    where: { userId },
    include: { mission: true },
    orderBy: { expiresAt: 'asc' },
  });
}
