import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { passport } from './config/passport.js';
import { allowedWebOrigins, env } from './config/env.js';
import { errorMiddleware } from './middleware/error.js';
import { verifyRequestOrigin } from './middleware/origin.js';
import { adminRoutes } from './routes/admin.routes.js';
import { arenaRoutes } from './routes/arena.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import { gamificationRoutes } from './routes/gamification.routes.js';
import { profileRoutes } from './routes/profile.routes.js';
import { questionRoutes } from './routes/question.routes.js';
import { quizRoutes } from './routes/quiz.routes.js';
import { rankingRoutes } from './routes/ranking.routes.js';
import { reportRoutes } from './routes/report.routes.js';
import { reviewRoutes } from './routes/review.routes.js';
import { publicRoutes } from './routes/public.routes.js';

export const app = express();

if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedWebOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.json({ limit: '1mb' }));
app.use(verifyRequestOrigin);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/public', publicRoutes);
app.use('/categories', categoryRoutes);
app.use('/gamification', gamificationRoutes);
app.use('/quizzes', quizRoutes);
app.use('/questions', questionRoutes);
app.use('/reviews', reviewRoutes);
app.use('/admin', adminRoutes);
app.use('/profile', profileRoutes);
app.use('/ranking', rankingRoutes);
app.use('/arena', arenaRoutes);
app.use(reportRoutes);
app.use(errorMiddleware);
