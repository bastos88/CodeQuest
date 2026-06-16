import { describe, expect, it } from 'vitest';
import { calculateQuizXP, getLevelFromXP } from '@codequest/shared';

describe('XP and level business rules', () => {
  it('keeps XP non-negative for wrong answers', () => {
    expect(calculateQuizXP([{ difficulty: 'EASY', isCorrect: false }])).toBe(25);
  });

  it('matches the documented level formula', () => {
    expect(getLevelFromXP(8100)).toBe(10);
  });
});
