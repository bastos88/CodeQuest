import { Router } from 'express';
import { loginSchema, registerSchema } from '@codequest/shared';
import * as controller from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordSchema = z
  .object({ email: z.string().trim().toLowerCase().email() })
  .strict();

const resetPasswordSchema = z
  .object({
    token: z.string().min(1).max(256),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .strict();

export const authRoutes = Router();

authRoutes.post(
  '/register',
  credentialLimiter,
  validateBody(registerSchema),
  asyncHandler(controller.register),
);
authRoutes.post(
  '/login',
  credentialLimiter,
  validateBody(loginSchema),
  asyncHandler(controller.login),
);
authRoutes.post('/refresh', refreshLimiter, asyncHandler(controller.refresh));
authRoutes.post('/logout', asyncHandler(controller.logout));
authRoutes.post(
  '/forgot-password',
  credentialLimiter,
  validateBody(forgotPasswordSchema),
  asyncHandler(controller.forgotPassword),
);
authRoutes.post(
  '/reset-password',
  credentialLimiter,
  validateBody(resetPasswordSchema),
  asyncHandler(controller.resetPassword),
);
authRoutes.get('/debug-cookies', controller.debugCookies);
authRoutes.get('/me', requireAuth, asyncHandler(controller.me));
authRoutes.get(
  '/:provider(github|google)',
  asyncHandler(controller.oauthStart),
);
authRoutes.get(
  '/:provider(github|google)/callback',
  asyncHandler(controller.oauthCallback),
);
