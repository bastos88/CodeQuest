import { z } from 'zod';

export const quizSetupDifficultySchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(120),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(120),
});

export const quizStartSchema = z.object({
  categoryIds: z.array(z.string().uuid()).min(1),
  difficulty: quizSetupDifficultySchema,
  questionCount: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
});

export const quizSubmitSchema = z.object({
  quizSessionId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      alternativeId: z.string().uuid(),
      timeSpentSeconds: z.number().int().min(1).max(900),
    }),
  ),
});

export const questionSchema = z.object({
  categoryId: z.string().uuid(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  prompt: z.string().min(12).max(1200),
  explanation: z.string().max(2000).optional(),
  alternatives: z.array(z.object({ text: z.string().min(1).max(500), isCorrect: z.boolean() })).length(4),
});

export const rejectReviewSchema = z.object({
  rejectionReason: z.string().min(10).max(1000),
  notes: z.string().max(1000).optional(),
});

export const approveReviewSchema = z.object({
  checklist: z.object({
    clearStatement: z.boolean(),
    onlyOneCorrect: z.boolean(),
    plausibleAlternatives: z.boolean(),
    noTechnicalError: z.boolean(),
    correctCategory: z.boolean(),
    correctDifficulty: z.boolean(),
    usefulExplanation: z.boolean(),
  }),
  notes: z.string().max(1000).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type QuizSetupDifficulty = z.infer<typeof quizSetupDifficultySchema>;
export type QuizStartInput = z.infer<typeof quizStartSchema>;
export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type RejectReviewInput = z.infer<typeof rejectReviewSchema>;
export type ApproveReviewInput = z.infer<typeof approveReviewSchema>;
