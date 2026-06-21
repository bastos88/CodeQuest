import { Router } from 'express';
import { quizStartSchema, quizSubmitSchema } from '@codequest/shared';
import * as controller from '../controllers/quiz.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
import { z } from 'zod';

export const quizRoutes = Router();

quizRoutes.use(requireAuth);
quizRoutes.post(
  '/start',
  validateBody(quizStartSchema),
  asyncHandler(controller.start),
);
quizRoutes.post(
  '/submit',
  validateBody(quizSubmitSchema),
  asyncHandler(controller.submit),
);
quizRoutes.get('/history', asyncHandler(controller.history));
quizRoutes.get(
  '/results/:id',
  validateParams(z.object({ id: z.string().uuid() })),
  asyncHandler(controller.result),
);
