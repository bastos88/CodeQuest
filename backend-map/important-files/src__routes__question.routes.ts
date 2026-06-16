import { Router } from 'express';
import { questionSchema } from '@codequest/shared';
import * as controller from '../controllers/question.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';

export const questionRoutes = Router();

questionRoutes.use(requireAuth);
questionRoutes.get('/', asyncHandler(controller.index));
questionRoutes.get('/:id', asyncHandler(controller.show));
questionRoutes.post('/', validateBody(questionSchema), asyncHandler(controller.create));
questionRoutes.patch('/:id', requireRole('ADMIN', 'REVIEWER'), asyncHandler(controller.update));
questionRoutes.delete('/:id', requireRole('ADMIN'), asyncHandler(controller.destroy));
questionRoutes.post('/:id/archive', requireRole('ADMIN', 'REVIEWER'), asyncHandler(controller.archive));
questionRoutes.post('/:id/restore', requireRole('ADMIN'), asyncHandler(controller.restore));
