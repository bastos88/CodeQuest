import { Router } from 'express';
import * as controller from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';

export const profileRoutes = Router();

profileRoutes.use(requireAuth);
profileRoutes.get('/me', asyncHandler(controller.me));
profileRoutes.get('/me/skills', asyncHandler(controller.skills));
profileRoutes.get('/me/achievements', asyncHandler(controller.achievements));
profileRoutes.get('/me/missions', asyncHandler(controller.missions));
