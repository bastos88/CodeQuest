import { Router } from 'express';
import * as controller from '../controllers/gamification.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';
import { validateQuery } from '../middleware/validate.js';
import { z } from 'zod';

export const gamificationRoutes = Router();

gamificationRoutes.use(requireAuth);
gamificationRoutes.get('/', asyncHandler(controller.summary));
gamificationRoutes.get('/achievements', asyncHandler(controller.achievements));
gamificationRoutes.get(
  '/daily-missions',
  asyncHandler(controller.dailyMissions),
);
gamificationRoutes.get(
  '/events',
  validateQuery(
    z.object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
    }),
  ),
  asyncHandler(controller.events),
);
