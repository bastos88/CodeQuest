import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, CheckCircle2, Layers3, Orbit, Sparkles, Target, TimerReset } from 'lucide-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { api } from '../lib/api';
import { buildCategoryDescription, difficultyCopy, estimatePotentialXP, estimateQuizMinutes, questionCountOptions, } from '../lib/quiz';
import { writeQuizSession } from '../lib/quizSession';
const categoryPriority = [
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'React Hooks',
    'Context API',
    'Node.js',
    'SQL',
    'APIs REST',
    'Git/GitHub',
    'Accessibility',
    'Performance',
    'DevOps',
    'C#',
    'Python',
];
const difficultyOptions = Object.entries(difficultyCopy).map(([value, copy]) => ({ value, ...copy }));
const initialState = {
    categoryIds: [],
    difficulty: null,
    questionCount: null,
};
export function QuizSetupPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [setup, setSetup] = useState(initialState);
    const [setupValidation, setSetupValidation] = useState(null);
    const categoriesQuery = useQuery({
        queryKey: ['quiz-setup-categories'],
        queryFn: async () => (await api.get('/categories')).data,
        select: (response) => response
            .map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description ?? buildCategoryDescription(category.name),
        }))
            .sort((left, right) => {
            const leftIndex = categoryPriority.indexOf(left.name);
            const rightIndex = categoryPriority.indexOf(right.name);
            if (leftIndex === -1 && rightIndex === -1)
                return left.name.localeCompare(right.name);
            if (leftIndex === -1)
                return 1;
            if (rightIndex === -1)
                return -1;
            return leftIndex - rightIndex;
        }),
        retry: false,
    });
    const startMutation = useMutation({
        mutationFn: async (state) => {
            if (!state.difficulty || !state.questionCount || state.categoryIds.length === 0) {
                throw new Error('Selecione categorias, dificuldade e quantidade antes de iniciar.');
            }
            const { data } = await api.post('/quizzes/start', {
                categoryIds: state.categoryIds,
                difficulty: state.difficulty,
                questionCount: state.questionCount,
            });
            return data;
        },
        onSuccess: (data) => {
            if (!setup.difficulty || !setup.questionCount)
                return;
            const sessionPayload = {
                quizSessionId: data.quizSessionId,
                setup: {
                    categoryIds: setup.categoryIds,
                    difficulty: setup.difficulty,
                    questionCount: setup.questionCount,
                },
                questions: data.questions,
                createdAt: new Date().toISOString(),
            };
            writeQuizSession(sessionPayload);
            navigate('/quiz/session');
        },
    });
    const categories = categoriesQuery.data ?? [];
    const selectedCategories = useMemo(() => categories.filter((category) => setup.categoryIds.includes(category.id)), [categories, setup.categoryIds]);
    const summary = {
        categories: selectedCategories.length > 0 ? selectedCategories.map((category) => category.name).join(' + ') : 'Selecione uma ou mais categorias',
        difficulty: setup.difficulty ? difficultyCopy[setup.difficulty].label : 'Selecione a dificuldade',
        questionCount: setup.questionCount ? `${setup.questionCount} perguntas` : 'Escolha a quantidade',
        estimate: estimateQuizMinutes(setup.questionCount),
        xp: estimatePotentialXP(setup.difficulty, setup.questionCount),
    };
    const canStart = setup.categoryIds.length > 0 && setup.difficulty !== null && setup.questionCount !== null;
    const notice = typeof location.state === 'object' && location.state && 'notice' in location.state ? String(location.state.notice) : null;
    return (_jsxs("div", { className: "grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]", children: [_jsxs("section", { className: "space-y-6", children: [_jsxs(Card, { className: "overflow-hidden p-7", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(108,99,255,0.2),transparent_18rem)]" }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx(Badge, { tone: "info", children: "quiz.setup" }), _jsx(Badge, { tone: "success", children: "Pr\u00E9-configura\u00E7\u00E3o" })] }), _jsx("h2", { className: "mt-5 text-4xl font-extrabold tracking-[-0.05em] text-textPrimary", children: "Prepare seu desafio" }), _jsx("p", { className: "mt-3 max-w-3xl text-base text-textSecondary", children: "Escolha categorias, dificuldade e quantidade de perguntas antes de iniciar sua simula\u00E7\u00E3o." }), notice ? (_jsxs("div", { className: "mt-5 flex items-start gap-3 rounded-[1.25rem] border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-textSecondary", children: [_jsx(AlertTriangle, { size: 18, className: "mt-0.5 shrink-0 text-warning" }), _jsx("span", { children: notice })] })) : null] })] }), _jsxs(Card, { className: "p-6", children: [_jsx(SectionHeading, { eyebrow: "Se\u00E7\u00E3o 1", title: "Categorias", description: "Combine trilhas para montar um desafio mais amplo ou mantenha foco em um \u00FAnico tema." }), categoriesQuery.isLoading ? (_jsx("div", { className: "h-12 animate-pulse rounded-2xl border border-white/6 bg-white/[0.03]" })) : categoriesQuery.isError ? (_jsx(InlineState, { title: "N\u00E3o foi poss\u00EDvel carregar as categorias.", description: "Recarregue a p\u00E1gina ou verifique a conex\u00E3o com a API antes de iniciar o desafio.", tone: "danger" })) : categories.length === 0 ? (_jsx(InlineState, { title: "Nenhuma categoria dispon\u00EDvel.", description: "Cadastre perguntas aprovadas primeiro para liberar combina\u00E7\u00F5es v\u00E1lidas no setup.", tone: "warning" })) : (_jsxs("div", { className: "grid gap-3", children: [_jsx("label", { htmlFor: "quiz-category", className: "text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Categoria" }), _jsxs("select", { id: "quiz-category", value: setup.categoryIds[0] ?? '', "aria-invalid": setupValidation !== null && setup.categoryIds.length === 0, onChange: (event) => {
                                            setSetupValidation(null);
                                            setSetup((current) => ({
                                                ...current,
                                                categoryIds: event.target.value ? [event.target.value] : [],
                                            }));
                                        }, className: "w-full rounded-2xl border border-white/10 bg-[#14151C] px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger/5", children: [_jsx("option", { value: "", children: "Selecione uma categoria" }), categories.map((category) => (_jsx("option", { value: category.id, children: category.name }, category.id)))] }), setupValidation && setup.categoryIds.length === 0 ? _jsx("p", { className: "text-sm text-danger", children: setupValidation }) : null, selectedCategories[0] ? (_jsxs("div", { className: "rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3", children: [_jsx("p", { className: "text-sm font-semibold text-textPrimary", children: selectedCategories[0].name }), _jsx("p", { className: "mt-1 text-sm text-textSecondary", children: selectedCategories[0].description })] })) : null] }))] }), _jsxs(Card, { className: "p-6", children: [_jsx(SectionHeading, { eyebrow: "Se\u00E7\u00E3o 2", title: "Dificuldade", description: "Ajuste o n\u00EDvel do desafio conforme o objetivo de estudo ou ritmo de revis\u00E3o." }), _jsx("div", { className: "grid gap-3 lg:grid-cols-3", children: difficultyOptions.map((option) => (_jsx(SelectableCard, { selected: setup.difficulty === option.value, onClick: () => setSetup((current) => ({ ...current, difficulty: option.value })), title: option.label, description: option.description, meta: option.badge }, option.value))) })] }), _jsxs(Card, { className: "p-6", children: [_jsx(SectionHeading, { eyebrow: "Se\u00E7\u00E3o 3", title: "Quantidade de perguntas", description: "Escolha a dura\u00E7\u00E3o da simula\u00E7\u00E3o sem cair em um formul\u00E1rio gen\u00E9rico." }), _jsx("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: questionCountOptions.map((option) => (_jsx(SelectableCard, { selected: setup.questionCount === option.value, onClick: () => setSetup((current) => ({ ...current, questionCount: option.value })), title: option.label, description: `Tempo estimado ${option.estimate}`, meta: "Ritmo sugerido" }, option.value))) })] })] }), _jsx("aside", { className: "space-y-6", children: _jsxs(Card, { className: "sticky top-28 p-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "section-kicker", children: "Resumo" }), _jsx("h3", { className: "mt-3 text-2xl font-bold tracking-[-0.03em] text-textPrimary", children: "Configura\u00E7\u00E3o atual" })] }), _jsx("div", { className: "grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary", children: _jsx(Layers3, { size: 20 }) })] }), _jsxs("div", { className: "mt-6 space-y-3", children: [_jsx(SummaryRow, { icon: Orbit, label: "Categoria(s)", value: summary.categories }), _jsx(SummaryRow, { icon: Sparkles, label: "Dificuldade", value: summary.difficulty }), _jsx(SummaryRow, { icon: Target, label: "Quantidade", value: summary.questionCount }), _jsx(SummaryRow, { icon: TimerReset, label: "Tempo estimado", value: summary.estimate })] }), _jsxs("div", { className: "mt-6 rounded-[1.5rem] border border-success/20 bg-success/10 p-4", children: [_jsx("p", { className: "text-sm font-semibold text-textPrimary", children: "XP potencial" }), _jsxs("p", { className: "mt-2 font-mono text-3xl font-extrabold text-success", children: ["+", summary.xp] }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: "Proje\u00E7\u00E3o baseada em acerto m\u00E1ximo para a configura\u00E7\u00E3o selecionada." })] }), _jsxs("div", { className: "mt-6 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4", children: [_jsx("p", { className: "text-sm font-semibold text-textPrimary", children: "Antes de iniciar" }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm text-textSecondary", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx(CheckCircle2, { size: 16, className: "mt-0.5 shrink-0 text-success" }), "A sele\u00E7\u00E3o \u00E9 validada antes de criar a sess\u00E3o."] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(CheckCircle2, { size: 16, className: "mt-0.5 shrink-0 text-success" }), "As respostas corretas continuam protegidas no backend."] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(CheckCircle2, { size: 16, className: "mt-0.5 shrink-0 text-success" }), "Se faltarem perguntas, voc\u00EA recebe orienta\u00E7\u00E3o para ajustar os filtros."] })] })] }), startMutation.isError ? (_jsx("div", { className: "mt-6 rounded-[1.25rem] border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-textSecondary", children: getStartErrorMessage(startMutation.error) })) : null, _jsxs(Button, { className: "mt-6 h-14 w-full justify-between rounded-[1.25rem] px-5 text-base", disabled: categories.length === 0, loading: startMutation.isPending, onClick: () => {
                                if (!canStart) {
                                    setSetupValidation('Selecione uma categoria, dificuldade e quantidade antes de iniciar.');
                                    return;
                                }
                                setSetupValidation(null);
                                startMutation.mutate(setup);
                            }, children: [_jsx("span", { children: "Iniciar Desafio" }), _jsx(ArrowRight, { size: 18 })] })] }) })] }));
}
function SectionHeading({ eyebrow, title, description }) {
    return (_jsxs("div", { className: "mb-5", children: [_jsx("p", { className: "section-kicker", children: eyebrow }), _jsx("h3", { className: "mt-3 text-2xl font-bold tracking-[-0.03em] text-textPrimary", children: title }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: description })] }));
}
function SelectableCard({ title, description, meta, selected, onClick, }) {
    return (_jsxs("button", { type: "button", onClick: onClick, className: `group rounded-[1.5rem] border p-4 text-left transition duration-150 ease-premium ${selected
            ? 'border-primary/30 bg-[linear-gradient(180deg,rgba(108,99,255,0.18),rgba(168,85,247,0.08))] shadow-[0_0_0_1px_rgba(108,99,255,0.18),0_20px_40px_rgba(10,11,15,0.22)]'
            : 'border-white/8 bg-white/[0.025] hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.04]'}`, children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-base font-semibold text-textPrimary", children: title }), _jsx("p", { className: "mt-2 text-sm leading-6 text-textSecondary", children: description })] }), _jsx("span", { className: `mt-1 h-3.5 w-3.5 rounded-full border ${selected ? 'border-primary bg-primary shadow-[0_0_18px_rgba(108,99,255,0.55)]' : 'border-white/18 bg-transparent'}` })] }), _jsxs("div", { className: "mt-4 flex items-center justify-between", children: [_jsx("span", { className: "font-mono text-[11px] uppercase tracking-[0.18em] text-textMuted", children: meta }), selected ? _jsx(Badge, { tone: "info", children: "Selected" }) : null] })] }));
}
function SummaryRow({ icon: Icon, label, value, }) {
    return (_jsxs("div", { className: "flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3", children: [_jsx("div", { className: "mt-0.5 grid h-9 w-9 place-items-center rounded-2xl bg-white/[0.05] text-textSecondary", children: _jsx(Icon, { size: 16 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-textMuted", children: label }), _jsx("p", { className: "mt-1 text-sm font-semibold text-textPrimary", children: value })] })] }));
}
function InlineState({ title, description, tone, }) {
    const toneClasses = tone === 'danger'
        ? 'border-danger/25 bg-danger/10 text-danger'
        : 'border-warning/25 bg-warning/10 text-warning';
    return (_jsxs("div", { className: `rounded-[1.5rem] border px-5 py-4 ${toneClasses}`, children: [_jsx("p", { className: "font-semibold", children: title }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: description })] }));
}
function getStartErrorMessage(error) {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (message)
            return message;
    }
    if (error instanceof Error)
        return error.message;
    return 'Não foi possível iniciar a sessão. Tente novamente.';
}
