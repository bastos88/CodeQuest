import { api } from './api';

export type Achievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  tier: string | null;
  xpBonus: number;
};

export type ProfileResponse = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  activeTitle: string;
  xp: number;
  rating: number;
  level: {
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
    percentage: number;
  };
  stats: {
    quizzesCompleted: number;
    accuracy: number;
    streakDays: number;
    correctAnswers: number;
  };
  achievements: Achievement[];
};

export type SkillProgress = {
  categoryId: string;
  category: string;
  slug: string;
  answered: number;
  correct: number;
  accuracy: number;
  mastery: number;
  lastPlayedAt: string | null;
};

export const profileQueryKeys = {
  me: ['profile'] as const,
  skills: ['profile-skills'] as const,
};

export async function getProfile(): Promise<ProfileResponse> {
  return (await api.get<ProfileResponse>('/profile/me')).data;
}

export async function getProfileSkills(): Promise<SkillProgress[]> {
  return (await api.get<SkillProgress[]>('/profile/me/skills')).data;
}

export async function updateProfile(input: {
  name: string;
  avatarUrl: string | null;
}) {
  return (await api.patch('/profile/me', input)).data;
}

export async function updatePassword(input: {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> {
  return (await api.patch<{ message: string }>('/profile/me/password', input))
    .data;
}
