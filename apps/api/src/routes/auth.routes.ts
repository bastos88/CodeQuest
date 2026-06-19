import { Router } from 'express';
import { loginSchema, registerSchema } from '@codequest/shared';
import * as controller from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';

export const authRoutes = Router();

authRoutes.post('/register', validateBody(registerSchema), asyncHandler(controller.register));
authRoutes.post('/login', validateBody(loginSchema), asyncHandler(controller.login));
authRoutes.post('/refresh', asyncHandler(controller.refresh));
authRoutes.post('/logout', asyncHandler(controller.logout));
authRoutes.get('/debug-cookies', controller.debugCookies);
authRoutes.get('/me', requireAuth, asyncHandler(controller.me));
authRoutes.get('/:provider(github|google)', asyncHandler(controller.oauthStart));
authRoutes.get('/:provider(github|google)/callback', asyncHandler(controller.oauthCallback));
