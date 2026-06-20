import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';
import { applyArenaGamification } from './gamification.service.js';

export async function startArena(userId: string) {
  return prisma.arenaMatch.create({
    data: {
      playerAId: userId,
    },
  });
}

export async function submitArena(userId: string, matchId: string, correctCount: number) {
  const match = await prisma.arenaMatch.findUniqueOrThrow({ where: { id: matchId } });
  if (match.playerAId !== userId && match.playerBId !== userId) {
    throw new HttpError(403, 'Arena match does not belong to this user');
  }
  if (match.completedAt) throw new HttpError(409, 'Arena match already completed');
  const won = correctCount >= 7;
  const ratingDelta = won ? 50 : -20;
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { rating: { increment: ratingDelta } } });
    const updated = await tx.arenaMatch.update({
      where: { id: match.id },
      data: {
        winnerId: won ? userId : null,
        ratingDeltaA: ratingDelta,
        correctA: correctCount,
        completedAt: new Date(),
      },
    });
    await applyArenaGamification(tx, userId, match.id, won);
    return updated;
  });
}
