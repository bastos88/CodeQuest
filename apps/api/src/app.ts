import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { passport } from './config/passport.js';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.js';
import { adminRoutes } from './routes/admin.routes.js';
import { arenaRoutes } from './routes/arena.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import { profileRoutes } from './routes/profile.routes.js';
import { questionRoutes } from './routes/question.routes.js';
import { quizRoutes } from './routes/quiz.routes.js';
import { rankingRoutes } from './routes/ranking.routes.js';
import { reportRoutes } from './routes/report.routes.js';
import { reviewRoutes } from './routes/review.routes.js';
import { publicRoutes } from './routes/public.routes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 25, standardHeaders: true, legacyHeaders: false });

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authLimiter, authRoutes);
app.use('/public', publicRoutes);
app.use('/categories', categoryRoutes);
app.use('/quizzes', quizRoutes);
app.use('/questions', questionRoutes);
app.use('/reviews', reviewRoutes);
app.use('/admin', adminRoutes);
app.use('/profile', profileRoutes);
app.use('/ranking', rankingRoutes);
app.use('/arena', arenaRoutes);
app.use(reportRoutes);
app.use(errorMiddleware);
