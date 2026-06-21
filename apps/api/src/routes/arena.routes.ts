import { Router } from 'express';
import * as controller from '../controllers/arena.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';

export const arenaRoutes = Router();

arenaRoutes.use(requireAuth);
arenaRoutes.post('/start', asyncHandler(controller.start));
arenaRoutes.post('/submit', asyncHandler(controller.submit));
arenaRoutes.get('/history', asyncHandler(controller.history));
arenaRoutes.get(
  '/leaderboard',
  asyncHandler(async (_req, res) => {
    res.redirect(307, '/ranking/arena');
  }),
);
