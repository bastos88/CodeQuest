export const XP_RULES = {
  quizCompleted: 25,
  correctAnswer: 10,
  mediumBonus: 4,
  hardBonus: 8,
  perfectQuiz: 50,
  dailyStreak: 20,
  submittedQuestion: 5,
  approvedQuestion: 40,
} as const;

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

export function getXPForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.floor(level));
  return (normalizedLevel - 1) ** 2 * 100;
}

export function getXPProgressToNextLevel(xp: number) {
  const level = getLevelFromXP(xp);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const earnedInLevel = Math.max(0, xp - currentLevelXP);
  const requiredForNext = nextLevelXP - currentLevelXP;
  return {
    level,
    currentLevelXP,
    nextLevelXP,
    earnedInLevel,
    requiredForNext,
    percentage: Math.min(100, Math.round((earnedInLevel / requiredForNext) * 100)),
  };
}

export function calculateQuestionXP(difficulty: Difficulty, isCorrect: boolean): number {
  if (!isCorrect) return 0;
  const difficultyBonus = difficulty === 'HARD' ? XP_RULES.hardBonus : difficulty === 'MEDIUM' ? XP_RULES.mediumBonus : 0;
  return XP_RULES.correctAnswer + difficultyBonus;
}

export function calculateQuizXP(answers: Array<{ difficulty: Difficulty; isCorrect: boolean }>): number {
  const questionXP = answers.reduce((total, answer) => total + calculateQuestionXP(answer.difficulty, answer.isCorrect), 0);
  const perfectBonus = answers.length > 0 && answers.every((answer) => answer.isCorrect) ? XP_RULES.perfectQuiz : 0;
  return XP_RULES.quizCompleted + questionXP + perfectBonus;
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}
