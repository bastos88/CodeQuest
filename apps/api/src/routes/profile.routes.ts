import { Router } from 'express';
import * as controller from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';

const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(30).optional(),
    avatarUrl: z.string().url().nullable().optional(),
  })
  .strict();

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .strict();

export const profileRoutes = Router();

profileRoutes.use(requireAuth);
profileRoutes.get('/me', asyncHandler(controller.me));
profileRoutes.patch('/me', validateBody(updateProfileSchema), asyncHandler(controller.updateMe));
profileRoutes.patch(
  '/me/password',
  validateBody(updatePasswordSchema),
  asyncHandler(controller.updatePassword),
);
profileRoutes.get('/me/skills', asyncHandler(controller.skills));
profileRoutes.get('/me/achievements', asyncHandler(controller.achievements));
profileRoutes.get('/me/missions', asyncHandler(controller.missions));
