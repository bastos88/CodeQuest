import { Router } from 'express';
import * as controller from '../controllers/report.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';

export const reportRoutes = Router();

reportRoutes.post('/reports', requireAuth, asyncHandler(controller.create));
reportRoutes.get('/admin/reports', requireAuth, requireRole('ADMIN'), asyncHandler(controller.adminIndex));
reportRoutes.patch('/admin/reports/:id', requireAuth, requireRole('ADMIN'), asyncHandler(controller.update));
