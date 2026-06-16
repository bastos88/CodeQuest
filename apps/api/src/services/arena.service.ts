import { prisma } from '../config/prisma.js';

export async function startArena(userId: string) {
  return prisma.arenaMatch.create({
    data: {
      playerAId: userId,
    },
  });
}

export async function submitArena(userId: string, matchId: string, correctCount: number) {
  const match = await prisma.arenaMatch.findUniqueOrThrow({ where: { id: matchId } });
  const won = correctCount >= 7;
  const ratingDelta = won ? 50 : -20;
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { rating: { increment: ratingDelta } } });
    return tx.arenaMatch.update({
      where: { id: match.id },
      data: {
        winnerId: won ? userId : null,
        ratingDeltaA: ratingDelta,
        correctA: correctCount,
        completedAt: new Date(),
      },
    });
  });
}
