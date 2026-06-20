import { describe, expect, it } from 'vitest';
import { calculateQuizXP, getLevelFromXP, getXPForLevel, getXPProgressToNextLevel } from './gamification';

describe('gamification helpers', () => {
  it('uses the progressive square-root level formula', () => {
    expect(getLevelFromXP(0)).toBe(1);
    expect(getLevelFromXP(100)).toBe(2);
    expect(getLevelFromXP(400)).toBe(3);
    expect(getXPForLevel(10)).toBe(8100);
  });

  it('reports progress to the next level', () => {
    expect(getXPProgressToNextLevel(250)).toMatchObject({ level: 2, percentage: 50 });
  });

  it('never subtracts XP for wrong study answers', () => {
    expect(calculateQuizXP([{ difficulty: 'HARD', isCorrect: false }])).toBe(45);
  });

  it('adds base, correct answer and perfect bonuses', () => {
    expect(calculateQuizXP([{ difficulty: 'EASY', isCorrect: true }])).toBe(80);
  });

  it('applies the hard bonus once per quiz', () => {
    expect(calculateQuizXP([
      { difficulty: 'HARD', isCorrect: true },
      { difficulty: 'HARD', isCorrect: true },
    ])).toBe(115);
  });
});
