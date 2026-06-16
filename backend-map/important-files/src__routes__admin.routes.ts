import { Router } from 'express';
import * as controller from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireRole('ADMIN'));
adminRoutes.get('/dashboard', asyncHandler(controller.dashboard));
adminRoutes.get('/questions', asyncHandler(controller.questions));
adminRoutes.get('/stats', asyncHandler(controller.stats));
adminRoutes.get('/activity', asyncHandler(controller.activity));
