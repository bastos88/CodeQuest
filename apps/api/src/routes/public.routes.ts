import { Router } from 'express';
import * as controller from '../controllers/public.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

export const publicRoutes = Router();

publicRoutes.get('/stats', asyncHandler(controller.stats));
publicRoutes.get('/ranking', asyncHandler(controller.ranking));