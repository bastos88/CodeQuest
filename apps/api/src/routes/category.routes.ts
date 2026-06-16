import { Router } from 'express';
import * as controller from '../controllers/category.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

export const categoryRoutes = Router();

categoryRoutes.get('/', asyncHandler(controller.index));
