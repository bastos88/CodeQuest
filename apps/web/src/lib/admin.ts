export type QuestionStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type QuestionCategory = {
  id: string;
  name: string;
  slug?: string;
};

export type QuestionAuthor = {
  id: string;
  name: string;
  email: string;
};

export type QuestionReview = {
  id: string;
  decision: 'APPROVED' | 'REJECTED';
  reason: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    role: 'USER' | 'REVIEWER' | 'ADMIN';
  };
};

export type QuestionAlternative = {
  id: string;
  text: string;
  isCorrect?: boolean;
};

export type AdminQuestionRecord = {
  id: string;
  prompt: string;
  explanation: string | null;
  difficulty: Difficulty;
  status: QuestionStatus;
  isActive: boolean;
  rejectionReason: string | null;
  reviewedAt: string | null;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
  category: QuestionCategory;
  author: QuestionAuthor | null;
  alternatives: QuestionAlternative[];
  reviews: QuestionReview[];
};

export type AdminQuestionsResponse = {
  items: AdminQuestionRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type PendingReviewRecord = {
  id: string;
  prompt: string;
  explanation: string | null;
  difficulty: Difficulty;
  status: 'PENDING_REVIEW';
  createdAt: string;
  usedCount: number;
  category: QuestionCategory;
  author: QuestionAuthor | null;
  alternatives: QuestionAlternative[];
};

export type AdminDashboardMetrics = {
  users: number;
  questions: number;
  pending: number;
  reports: number;
  quizzes: number;
};

export type AdminStatsResponse = {
  averages: {
    accuracy: number | null;
    xpEarned: number | null;
  };
  statusCounts: Partial<Record<QuestionStatus, number>>;
};

export const adminQueryKeys = {
  adminDashboard: ['adminDashboard'] as const,
  adminQuestions: ['adminQuestions'] as const,
  adminStats: ['adminStats'] as const,
  pendingReviews: ['pendingReviews'] as const,
  quizQuestions: ['quizQuestions'] as const,
  quizSetupCategories: ['quiz-setup-categories'] as const,
};

export const difficultyLabel: Record<Difficulty, string> = {
  EASY: 'Fácil',
  MEDIUM: 'Média',
  HARD: 'Difícil',
};

export const statusLabel: Record<QuestionStatus, string> = {
  PENDING_REVIEW: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  ARCHIVED: 'Arquivada',
};

export function getStatusTone(
  status: QuestionStatus,
): 'info' | 'success' | 'warning' | 'danger' {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'danger';
  if (status === 'ARCHIVED') return 'info';
  return 'warning';
}
