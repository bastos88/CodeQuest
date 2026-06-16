export const adminQueryKeys = {
    adminDashboard: ['adminDashboard'],
    adminQuestions: ['adminQuestions'],
    adminStats: ['adminStats'],
    pendingReviews: ['pendingReviews'],
    quizQuestions: ['quizQuestions'],
    quizSetupCategories: ['quiz-setup-categories'],
};
export const difficultyLabel = {
    EASY: 'Fácil',
    MEDIUM: 'Média',
    HARD: 'Difícil',
};
export const statusLabel = {
    PENDING_REVIEW: 'Pendente',
    APPROVED: 'Aprovada',
    REJECTED: 'Rejeitada',
    ARCHIVED: 'Arquivada',
};
export function getStatusTone(status) {
    if (status === 'APPROVED')
        return 'success';
    if (status === 'REJECTED')
        return 'danger';
    if (status === 'ARCHIVED')
        return 'info';
    return 'warning';
}
