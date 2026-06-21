import { api } from './api';

export type LevelProgress = {
  currentXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  earnedInLevel: number;
  requiredForNext: number;
  percentage: number;
};

export type GamificationSummary = {
  totalXP: number;
  level: LevelProgress;
  streak: { current: number; longest: number };
  stats: {
    quizzesCompleted: number;
    correctAnswers: number;
    totalAnswers: number;
    accuracy: number;
  };
};

export type GamificationAchievement = {
  code: string;
  name: string;
  description: string;
  category: string;
  xpReward: number;
  iconKey: string | null;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: { current: number; target: number };
};

export type DailyMissionsResponse = {
  date: string;
  expiresAt: string;
  missions: Array<{
    code: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    xpReward: number;
    completed: boolean;
    completedAt: string | null;
  }>;
};

export const gamificationQueryKeys = {
  summary: ['gamification'] as const,
  achievements: ['gamification-achievements'] as const,
  dailyMissions: ['gamification-daily-missions'] as const,
  events: ['gamification-events'] as const,
};

export async function getGamificationSummary() {
  return (await api.get<GamificationSummary>('/gamification')).data;
}

export async function getAchievements() {
  return (
    await api.get<GamificationAchievement[]>('/gamification/achievements')
  ).data;
}

export async function getDailyMissions() {
  return (await api.get<DailyMissionsResponse>('/gamification/daily-missions'))
    .data;
}
