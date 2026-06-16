import { calculateQuizXP } from '@codequest/shared';
export const difficultyCopy = {
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
];
export function estimateQuizMinutes(questionCount) {
    if (!questionCount)
        return '-';
    return questionCount <= 5 ? '~3 minutos' : questionCount <= 10 ? '~6 minutos' : questionCount <= 15 ? '~10 minutos' : '~15 minutos';
}
export function estimatePotentialXP(difficulty, questionCount) {
    if (!difficulty || !questionCount)
        return 0;
    return calculateQuizXP(Array.from({ length: questionCount }, () => ({
        difficulty: difficultyCopy[difficulty].apiDifficulty,
        isCorrect: true,
    })));
}
export function buildCategoryDescription(name) {
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
