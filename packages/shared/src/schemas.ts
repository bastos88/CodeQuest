import { z } from 'zod';

export const quizSetupDifficultySchema = z.enum([
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
]);

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(120),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(120),
  })
  .strict();

export const quizStartSchema = z
  .object({
    categoryIds: z.array(z.string().uuid()).min(1).max(20),
    difficulty: quizSetupDifficultySchema,
    questionCount: z
      .number()
      .int()
      .min(1, 'Quantidade de perguntas inválida. Escolha entre 1 e 30.')
      .max(30, 'Quantidade de perguntas inválida. Escolha entre 1 e 30.'),
  })
  .strict();

export const quizSubmitSchema = z
  .object({
    quizSessionId: z.string().uuid(),
    answers: z
      .array(
        z
          .object({
            questionId: z.string().uuid(),
            alternativeId: z.string().uuid(),
            timeSpentSeconds: z.number().int().min(1).max(900),
          })
          .strict(),
      )
      .min(1)
      .max(30),
  })
  .strict();

const questionFields = {
  categoryId: z.string().uuid(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  prompt: z.string().trim().min(12).max(1200),
  explanation: z.string().trim().max(2000).optional(),
  alternatives: z
    .array(
      z
        .object({
          text: z.string().trim().min(1).max(500),
          isCorrect: z.boolean(),
        })
        .strict(),
    )
    .length(4),
} as const;

function requireExactlyOneCorrectAlternative(
  alternatives: Array<{ isCorrect: boolean }> | undefined,
  context: z.RefinementCtx,
) {
  if (
    alternatives &&
    alternatives.filter((item) => item.isCorrect).length !== 1
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['alternatives'],
      message: 'A pergunta deve possuir exatamente uma alternativa correta.',
    });
  }
}

export const questionSchema = z
  .object(questionFields)
  .strict()
  .superRefine((value, context) =>
    requireExactlyOneCorrectAlternative(value.alternatives, context),
  );

export const questionUpdateSchema = z
  .object({
    categoryId: questionFields.categoryId.optional(),
    difficulty: questionFields.difficulty.optional(),
    prompt: questionFields.prompt.optional(),
    explanation: questionFields.explanation,
    alternatives: questionFields.alternatives.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  })
  .superRefine((value, context) =>
    requireExactlyOneCorrectAlternative(value.alternatives, context),
  );

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
export type QuestionUpdateInput = z.infer<typeof questionUpdateSchema>;
export type RejectReviewInput = z.infer<typeof rejectReviewSchema>;
export type ApproveReviewInput = z.infer<typeof approveReviewSchema>;
