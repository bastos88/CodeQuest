import {
  calculateQuizXP,
  type Difficulty,
  type QuizSetupDifficulty,
} from '@codequest/shared';

export type QuizSetupState = {
  categoryIds: string[];
  difficulty: QuizSetupDifficulty | null;
  questionCount: number | null;
};

export type QuizSessionQuestion = {
  id: string;
  prompt: string;
  difficulty: Difficulty;
  category: string;
  alternatives: Array<{
    id: string;
    text: string;
  }>;
};

export type QuizSessionPayload = {
  quizSessionId: string;
  setup: {
    categoryIds: string[];
    difficulty: QuizSetupDifficulty;
    questionCount: number;
  };
  questions: QuizSessionQuestion[];
  createdAt: string;
};

export type QuizCategoryOption = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export const difficultyCopy: Record<
  QuizSetupDifficulty,
  {
    label: string;
    description: string;
    badge: string;
    apiDifficulty: Difficulty;
  }
> = {
  BEGINNER: {
    label: 'Iniciante',
    description: 'Conceitos básicos e fundamentos.',
    badge: 'Base sólida',
    apiDifficulty: 'EASY',
  },
  INTERMEDIATE: {
    label: 'Intermediário',
    description: 'Situações reais e aplicação prática.',
    badge: 'Contexto real',
    apiDifficulty: 'MEDIUM',
  },
  ADVANCED: {
    label: 'Avançado',
    description: 'Entrevistas técnicas e cenários complexos.',
    badge: 'Alta pressão',
    apiDifficulty: 'HARD',
  },
};

export const questionCountOptions = [
  { value: 5, label: '5 perguntas', estimate: '~3 min' },
  { value: 10, label: '10 perguntas', estimate: '~6 min' },
  { value: 15, label: '15 perguntas', estimate: '~10 min' },
  { value: 20, label: '20 perguntas', estimate: '~15 min' },
] as const;

export function estimateQuizMinutes(questionCount: number | null): string {
  if (!questionCount) return '-';
  return questionCount <= 5
    ? '~3 minutos'
    : questionCount <= 10
      ? '~6 minutos'
      : questionCount <= 15
        ? '~10 minutos'
        : '~15 minutos';
}

export function estimatePotentialXP(
  difficulty: QuizSetupDifficulty | null,
  questionCount: number | null,
): number {
  if (!difficulty || !questionCount) return 0;
  return calculateQuizXP(
    Array.from({ length: questionCount }, () => ({
      difficulty: difficultyCopy[difficulty].apiDifficulty,
      isCorrect: true,
    })),
  );
}

export function buildCategoryDescription(name: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes('react'))
    return 'Componentes, fluxo, estado e composição.';
  if (normalized.includes('typescript'))
    return 'Tipagem segura, unions e domínio explícito.';
  if (normalized.includes('javascript'))
    return 'Linguagem, runtime e padrões de uso.';
  if (normalized.includes('sql'))
    return 'Consultas, modelagem e performance de dados.';
  if (normalized.includes('node'))
    return 'Back-end, APIs e arquitetura de serviços.';
  if (normalized.includes('api'))
    return 'Contratos, HTTP e integração entre sistemas.';
  if (normalized.includes('css'))
    return 'Layout, responsividade e acabamento visual.';
  if (normalized.includes('html'))
    return 'Semântica, estrutura e acessibilidade.';
  return 'Trilha selecionável para compor o desafio.';
}
