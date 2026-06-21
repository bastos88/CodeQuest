import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http.js';
import { Prisma } from '@prisma/client';

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof ZodError) {
    res
      .status(422)
      .json({ message: 'Validation failed', issues: error.flatten() });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Resource already exists' });
      return;
    }
    if (error.code === 'P2003') {
      res.status(422).json({ message: 'Invalid related resource' });
      return;
    }
  }

  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
};
