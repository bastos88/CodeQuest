import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as questionService from '../services/question.service.js';
import { prisma } from '../config/prisma.js';
import { requireParam } from '../utils/params.js';

export async function index(req: AuthenticatedRequest, res: Response) {
  res.json(await questionService.listQuestions(req.user.role !== 'USER'));
}

export async function show(req: Request, res: Response) {
  const question = await prisma.question.findUniqueOrThrow({
    where: { id: requireParam(req, 'id') },
    include: {
      category: true,
      alternatives: { select: { id: true, text: true } },
    },
  });
  res.json(question);
}

export async function create(req: AuthenticatedRequest, res: Response) {
  const status = req.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING_REVIEW';
  res
    .status(201)
    .json(await questionService.createQuestion(req.user.id, req.body, status));
}

export async function update(req: Request, res: Response) {
  res.json(
    await questionService.updateQuestion(requireParam(req, 'id'), req.body),
  );
}

export async function destroy(req: AuthenticatedRequest, res: Response) {
  await questionService.deleteQuestion(requireParam(req, 'id'), req.user.id);
  res.status(204).send();
}

export async function archive(req: AuthenticatedRequest, res: Response) {
  res.json(
    await questionService.archiveQuestion(requireParam(req, 'id'), req.user.id),
  );
}

export async function restore(req: AuthenticatedRequest, res: Response) {
  res.json(
    await questionService.restoreQuestion(requireParam(req, 'id'), req.user.id),
  );
}
