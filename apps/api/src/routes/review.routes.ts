import { Router } from 'express';
import { approveReviewSchema, rejectReviewSchema } from '@codequest/shared';
import * as controller from '../controllers/review.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';

export const reviewRoutes = Router();

reviewRoutes.use(requireAuth, requireRole('ADMIN', 'REVIEWER'));
reviewRoutes.get('/pending', asyncHandler(controller.pending));
reviewRoutes.post('/:questionId/approve', validateBody(approveReviewSchema), asyncHandler(controller.approve));
reviewRoutes.post('/:questionId/reject', validateBody(rejectReviewSchema), asyncHandler(controller.reject));
