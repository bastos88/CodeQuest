import type { PrismaClient } from '@prisma/client';

export const achievementSeeds = [
  ['FIRST_QUIZ', 'Primeiro passo', 'Complete seu primeiro quiz.', 'progress', 25, 'rocket'],
  ['QUIZ_MASTER_10', 'Ritmo de estudo', 'Complete 10 quizzes.', 'progress', 100, 'medal'],
  ['QUIZ_MASTER_50', 'Mestre dos quizzes', 'Complete 50 quizzes.', 'progress', 250, 'trophy'],
  ['PERFECT_QUIZ', 'Precisão perfeita', 'Finalize um quiz sem erros.', 'performance', 50, 'sparkles'],
  ['STREAK_3', 'Em movimento', 'Mantenha uma sequência de 3 dias.', 'streak', 30, 'flame'],
  ['STREAK_7', 'Semana consistente', 'Mantenha uma sequência de 7 dias.', 'streak', 75, 'flame'],
  ['STREAK_30', 'Disciplina de ferro', 'Mantenha uma sequência de 30 dias.', 'streak', 300, 'flame'],
  ['FRONTEND_MASTER', 'Mestre Front-End', 'Alcance 80% de domínio em Front-End.', 'mastery', 150, 'code'],
  ['BACKEND_MASTER', 'Mestre Back-End', 'Alcance 80% de domínio em Back-End.', 'mastery', 150, 'terminal'],
  ['DATABASE_MASTER', 'Mestre de Dados', 'Alcance 80% de domínio em bancos de dados.', 'mastery', 150, 'database'],
  ['CONTRIBUTOR', 'Contribuidor', 'Tenha uma pergunta aprovada pela comunidade.', 'community', 75, 'git-branch'],
  ['ARENA_FIRST_WIN', 'Primeira vitória', 'Conquiste sua primeira vitória na Arena.', 'arena', 50, 'swords'],
] as const;

export const dailyMissionSeeds = [
  ['COMPLETE_1_QUIZ', 'Completar um quiz', 'Conclua um quiz hoje.', 1, 25],
  ['ANSWER_10_QUESTIONS', 'Responder 10 perguntas', 'Responda 10 perguntas hoje.', 10, 30],
  ['GET_8_CORRECT', 'Acertar 8 perguntas', 'Acerte 8 perguntas hoje.', 8, 35],
] as const;

export async function seedGamification(prisma: PrismaClient) {
  const achievementKeys = achievementSeeds.map(([key]) => key);
  await prisma.achievement.updateMany({ where: { key: { notIn: achievementKeys } }, data: { isActive: false } });
  for (const [key, name, description, category, xpBonus, iconKey] of achievementSeeds) {
    await prisma.achievement.upsert({
      where: { key },
      update: { name, description, category, xpBonus, iconKey, isActive: true },
      create: { key, name, description, category, xpBonus, iconKey },
    });
  }

  const missionKeys = dailyMissionSeeds.map(([key]) => key);
  await prisma.mission.updateMany({ where: { key: { notIn: missionKeys } }, data: { isActive: false } });
  for (const [key, title, description, target, xpReward] of dailyMissionSeeds) {
    await prisma.mission.upsert({
      where: { key },
      update: { type: 'DAILY', title, description, target, xpReward, isActive: true },
      create: { key, type: 'DAILY', title, description, target, xpReward },
    });
  }
}
