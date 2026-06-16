import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function index(_req: Request, res: Response) {
  res.json(
    await prisma.category.findMany({
      select: { id: true, name: true, slug: true, description: true },
      orderBy: { name: 'asc' },
    }),
  );
}
