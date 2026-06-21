import { Router } from 'express';
import * as controller from '../controllers/report.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { z } from 'zod';

const createReportSchema = z
  .object({
    questionId: z.string().uuid(),
    reason: z.string().trim().min(10).max(1000),
  })
  .strict();
const updateReportSchema = z
  .object({ status: z.enum(['OPEN', 'TRIAGED', 'RESOLVED', 'DISMISSED']) })
  .strict();
const reportParams = z.object({ id: z.string().uuid() });

export const reportRoutes = Router();

reportRoutes.post(
  '/reports',
  requireAuth,
  validateBody(createReportSchema),
  asyncHandler(controller.create),
);
reportRoutes.get(
  '/admin/reports',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(controller.adminIndex),
);
reportRoutes.patch(
  '/admin/reports/:id',
  requireAuth,
  requireRole('ADMIN'),
  validateParams(reportParams),
  validateBody(updateReportSchema),
  asyncHandler(controller.update),
);
