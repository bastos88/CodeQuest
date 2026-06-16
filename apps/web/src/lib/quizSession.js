const QUIZ_SESSION_STORAGE_KEY = 'codequest.quiz-session';
export function readQuizSession() {
    const raw = sessionStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        sessionStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);
        return null;
    }
}
export function writeQuizSession(payload) {
    sessionStorage.setItem(QUIZ_SESSION_STORAGE_KEY, JSON.stringify(payload));
}
export function clearQuizSession() {
    sessionStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);
}
