import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  questionSchema,
  questionUpdateSchema,
  registerSchema,
} from './schemas.js';

const validQuestion = {
  categoryId: '11111111-1111-4111-8111-111111111111',
  difficulty: 'EASY' as const,
  prompt: 'Qual alternativa está correta?',
  alternatives: [
    { text: 'A', isCorrect: true },
    { text: 'B', isCorrect: false },
    { text: 'C', isCorrect: false },
    { text: 'D', isCorrect: false },
  ],
};

describe('identity schemas', () => {
  it('normalizes email addresses before authentication', () => {
    expect(
      registerSchema.parse({
        name: ' Code User ',
        email: ' USER@Example.COM ',
        password: 'Password123!',
      }),
    ).toMatchObject({ name: 'Code User', email: 'user@example.com' });

    expect(
      loginSchema.parse({
        email: ' USER@Example.COM ',
        password: 'Password123!',
      }).email,
    ).toBe('user@example.com');
  });
});

describe('question schemas', () => {
  it('accepts exactly one correct alternative', () => {
    expect(questionSchema.parse(validQuestion)).toMatchObject(validQuestion);
  });

  it('rejects zero or multiple correct alternatives on create and update', () => {
    const noneCorrect = validQuestion.alternatives.map((item) => ({
      ...item,
      isCorrect: false,
    }));
    const twoCorrect = validQuestion.alternatives.map((item, index) => ({
      ...item,
      isCorrect: index < 2,
    }));

    expect(() =>
      questionSchema.parse({ ...validQuestion, alternatives: noneCorrect }),
    ).toThrow();
    expect(() =>
      questionUpdateSchema.parse({ alternatives: twoCorrect }),
    ).toThrow();
  });
});
