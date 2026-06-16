import type { QuizSessionPayload } from './quiz';

const QUIZ_SESSION_STORAGE_KEY = 'codequest.quiz-session';

export function readQuizSession(): QuizSessionPayload | null {
  const raw = sessionStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as QuizSessionPayload;
  } catch {
    sessionStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);
    return null;
  }
}

export function writeQuizSession(payload: QuizSessionPayload) {
  sessionStorage.setItem(QUIZ_SESSION_STORAGE_KEY, JSON.stringify(payload));
}

export function clearQuizSession() {
  sessionStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);
}
