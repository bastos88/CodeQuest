import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { seedGamification } from './gamification-seed-data.js';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const prisma = new PrismaClient();

seedGamification(prisma)
  .then(() => console.log('Gamification seed completed.'))
  .finally(() => prisma.$disconnect());
