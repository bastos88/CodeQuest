import { Router } from 'express';
import * as controller from '../controllers/ranking.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';

export const rankingRoutes = Router();

rankingRoutes.use(requireAuth);
rankingRoutes.get('/', asyncHandler(controller.general));
rankingRoutes.get('/arena', asyncHandler(controller.arena));
rankingRoutes.get('/contributors', asyncHandler(controller.contributors));
rankingRoutes.get('/me', asyncHandler(controller.mine));
rankingRoutes.get('/category/:categoryId', asyncHandler(controller.category));
