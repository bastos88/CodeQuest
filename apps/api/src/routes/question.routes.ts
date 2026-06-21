import { Router } from 'express';
import { questionSchema, questionUpdateSchema } from '@codequest/shared';
import * as controller from '../controllers/question.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { z } from 'zod';
import { asyncHandler } from '../utils/async-handler.js';

export const questionRoutes = Router();
const idParams = z.object({ id: z.string().uuid() });

questionRoutes.use(requireAuth);
questionRoutes.get('/', asyncHandler(controller.index));
questionRoutes.get(
  '/:id',
  validateParams(idParams),
  asyncHandler(controller.show),
);
questionRoutes.post(
  '/',
  validateBody(questionSchema),
  asyncHandler(controller.create),
);
questionRoutes.patch(
  '/:id',
  validateParams(idParams),
  requireRole('ADMIN', 'REVIEWER'),
  validateBody(questionUpdateSchema),
  asyncHandler(controller.update),
);
questionRoutes.delete(
  '/:id',
  validateParams(idParams),
  requireRole('ADMIN'),
  asyncHandler(controller.destroy),
);
questionRoutes.post(
  '/:id/archive',
  validateParams(idParams),
  requireRole('ADMIN', 'REVIEWER'),
  asyncHandler(controller.archive),
);
questionRoutes.post(
  '/:id/restore',
  validateParams(idParams),
  requireRole('ADMIN'),
  asyncHandler(controller.restore),
);
