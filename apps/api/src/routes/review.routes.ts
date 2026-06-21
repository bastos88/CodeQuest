import { Router } from 'express';
import { approveReviewSchema, rejectReviewSchema } from '@codequest/shared';
import * as controller from '../controllers/review.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
import { z } from 'zod';

export const reviewRoutes = Router();

reviewRoutes.use(requireAuth, requireRole('ADMIN', 'REVIEWER'));
reviewRoutes.get('/pending', asyncHandler(controller.pending));
const questionParams = z.object({ questionId: z.string().uuid() });
reviewRoutes.post(
  '/:questionId/approve',
  validateParams(questionParams),
  validateBody(approveReviewSchema),
  asyncHandler(controller.approve),
);
reviewRoutes.post(
  '/:questionId/reject',
  validateParams(questionParams),
  validateBody(rejectReviewSchema),
  asyncHandler(controller.reject),
);
