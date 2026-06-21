import { api } from './api';

export type RankingPlayer = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  xp: number;
  level: number;
  accuracy: number;
  quizzesCompleted: number;
  position: number;
};

export const rankingQueryKeys = {
  public: (limit: number) => ['public-ranking', limit] as const,
};

export async function getPublicRanking(limit = 10): Promise<RankingPlayer[]> {
  const { data } = await api.get<RankingPlayer[]>(
    `/public/ranking?limit=${limit}`,
  );

  return data;
}
