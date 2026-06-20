import { Router } from 'express';
import * as controller from '../controllers/gamification.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';

export const gamificationRoutes = Router();

gamificationRoutes.use(requireAuth);
gamificationRoutes.get('/', asyncHandler(controller.summary));
gamificationRoutes.get('/achievements', asyncHandler(controller.achievements));
gamificationRoutes.get('/daily-missions', asyncHandler(controller.dailyMissions));
gamificationRoutes.get('/events', asyncHandler(controller.events));
