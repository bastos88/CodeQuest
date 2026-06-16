import { Router } from 'express';
import * as controller from '../controllers/category.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';

export const categoryRoutes = Router();

categoryRoutes.use(requireAuth);
categoryRoutes.get('/', asyncHandler(controller.index));
