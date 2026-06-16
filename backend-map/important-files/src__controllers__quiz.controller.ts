import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as quizService from '../services/quiz.service.js';
import { requireParam } from '../utils/params.js';

export async function start(req: AuthenticatedRequest, res: Response) {
  res.status(201).json(await quizService.startQuiz(req.user.id, req.body));
}

export async function submit(req: AuthenticatedRequest, res: Response) {
  res.status(201).json(await quizService.submitQuiz(req.user.id, req.body));
}

export async function history(req: AuthenticatedRequest, res: Response) {
  res.json(await quizService.getQuizHistory(req.user.id));
}

export async function result(req: AuthenticatedRequest, res: Response) {
  res.json(await quizService.getQuizResult(req.user.id, requireParam(req, 'id')));
}
