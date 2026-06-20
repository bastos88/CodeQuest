import type { ApproveReviewInput, QuestionInput, RejectReviewInput } from '@codequest/shared';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';
import { applyContributionGamification } from './gamification.service.js';

export async function listQuestions(includeUnapproved: boolean) {
  return prisma.question.findMany({
    ...(includeUnapproved ? {} : { where: { status: 'APPROVED', isActive: true, archivedAt: null } }),
    include: { category: true, alternatives: { select: { id: true, text: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createQuestion(userId: string, input: QuestionInput, status: 'PENDING_REVIEW' | 'APPROVED') {
  return prisma.question.create({
    data: {
      categoryId: input.categoryId,
      authorId: userId,
      prompt: input.prompt,
      ...(input.explanation !== undefined ? { explanation: input.explanation } : {}),
      difficulty: input.difficulty,
      status,
      isActive: status === 'APPROVED',
      reviewedById: status === 'APPROVED' ? userId : null,
      reviewedAt: status === 'APPROVED' ? new Date() : null,
      alternatives: { create: input.alternatives },
    },
    include: { alternatives: true, category: true },
  });
}

export async function updateQuestion(id: string, input: Partial<QuestionInput>) {
  return prisma.question.update({
    where: { id },
    data: {
      ...(input.categoryId ? { category: { connect: { id: input.categoryId } } } : {}),
      ...(input.prompt ? { prompt: input.prompt } : {}),
      ...(input.explanation !== undefined ? { explanation: input.explanation } : {}),
      ...(input.difficulty ? { difficulty: input.difficulty } : {}),
      ...(input.alternatives
        ? {
            alternatives: {
              deleteMany: {},
              create: input.alternatives,
            },
          }
        : {}),
    },
    include: { alternatives: true },
  });
}

export async function deleteQuestion(id: string, actorId: string) {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) throw new HttpError(404, 'Question not found');

  const answerCount = await prisma.quizAnswer.count({ where: { questionId: id } });
  if (answerCount > 0) {
    throw new HttpError(409, 'Question already has quiz history; archive it instead');
  }

  await prisma.$transaction(async (tx) => {
    await tx.report.deleteMany({ where: { questionId: id } });
    await tx.review.deleteMany({ where: { questionId: id } });
    await tx.alternative.deleteMany({ where: { questionId: id } });
    await tx.activityLog.create({
      data: {
        userId: actorId,
        action: 'question.deleted',
        metadata: { questionId: id, status: question.status },
      },
    });
    await tx.question.delete({ where: { id } });
  });
}

export async function archiveQuestion(id: string, actorId: string) {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) throw new HttpError(404, 'Question not found');
  if (question.status === 'ARCHIVED') throw new HttpError(409, 'Question already archived');

  return prisma.$transaction(async (tx) => {
    const archived = await tx.question.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        isActive: false,
        archivedAt: new Date(),
        reviewedById: actorId,
        reviewedAt: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: actorId,
        action: 'question.archived',
        metadata: { questionId: id, previousStatus: question.status },
      },
    });

    return archived;
  });
}

export async function restoreQuestion(id: string, actorId: string) {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) throw new HttpError(404, 'Question not found');
  if (question.status !== 'ARCHIVED') throw new HttpError(409, 'Only archived questions can be restored');

  return prisma.$transaction(async (tx) => {
    const restored = await tx.question.update({
      where: { id },
      data: {
        status: 'APPROVED',
        isActive: true,
        archivedAt: null,
        reviewedById: actorId,
        reviewedAt: new Date(),
      },
      include: { category: true, alternatives: true },
    });

    await tx.activityLog.create({
      data: {
        userId: actorId,
        action: 'question.restored',
        metadata: { questionId: id },
      },
    });

    return restored;
  });
}

export async function approveQuestion(
  questionId: string,
  reviewerId: string,
  input: ApproveReviewInput,
) {
  const { checklist, notes } = input;
  if (!Object.values(checklist).every(Boolean)) throw new HttpError(422, 'Approval checklist must be complete');

  return prisma.$transaction(async (tx) => {
    const existing = await tx.question.findUnique({ where: { id: questionId } });
    if (!existing) throw new HttpError(404, 'Question not found');
    if (existing.status === 'APPROVED' && existing.isActive) throw new HttpError(409, 'Question already approved');
    if (existing.status === 'ARCHIVED') throw new HttpError(409, 'Archived questions cannot be approved');

    const question = await tx.question.update({
      where: { id: questionId },
      data: {
        status: 'APPROVED',
        isActive: true,
        rejectionReason: null,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        archivedAt: null,
      },
    });

    await tx.review.create({
      data: {
        questionId,
        reviewerId,
        decision: 'APPROVED',
        checklist,
        reason: notes ?? null,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: reviewerId,
        action: 'question.approved',
        metadata: { questionId, checklist, notes: notes ?? null },
      },
    });

    if (question.authorId) {
      await applyContributionGamification(tx, question.authorId, question.id);
    }
    return question;
  });
}

export async function rejectQuestion(
  questionId: string,
  reviewerId: string,
  input: RejectReviewInput,
) {
  const { rejectionReason, notes } = input;
  if (!rejectionReason.trim()) throw new HttpError(422, 'Rejection reason is required');

  return prisma.$transaction(async (tx) => {
    const existing = await tx.question.findUnique({ where: { id: questionId } });
    if (!existing) throw new HttpError(404, 'Question not found');
    if (existing.status === 'REJECTED') throw new HttpError(409, 'Question already rejected');
    if (existing.status === 'ARCHIVED') throw new HttpError(409, 'Archived questions cannot be rejected');

    const question = await tx.question.update({
      where: { id: questionId },
      data: {
        status: 'REJECTED',
        isActive: false,
        rejectionReason,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
    });

    await tx.review.create({
      data: {
        questionId,
        reviewerId,
        decision: 'REJECTED',
        reason: rejectionReason,
        ...(notes ? { checklist: { notes } } : {}),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: reviewerId,
        action: 'question.rejected',
        metadata: { questionId, rejectionReason, notes: notes ?? null },
      },
    });

    return question;
  });
}
