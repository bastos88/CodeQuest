import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle, CheckCircle2, Send, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { api } from '../lib/api';
const initialFormState = {
    categoryId: '',
    difficulty: 'MEDIUM',
    prompt: '',
    explanation: '',
    alternatives: ['', '', '', ''],
    correctIndex: 0,
};
export function Contribute() {
    const [form, setForm] = useState(initialFormState);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [submittedTitle, setSubmittedTitle] = useState(null);
    const categoriesQuery = useQuery({
        queryKey: ['question-contribute-categories'],
        queryFn: async () => (await api.get('/categories')).data,
    });
    const submitMutation = useMutation({
        mutationFn: async (payload) => (await api.post('/questions', payload)).data,
        onSuccess: () => {
            setSubmittedTitle(form.prompt);
            setForm(initialFormState);
            setSuccessModalOpen(true);
        },
    });
    const submitError = submitMutation.isError ? getErrorMessage(submitMutation.error) : null;
    function updateAlternative(index, value) {
        setForm((current) => ({
            ...current,
            alternatives: current.alternatives.map((alternative, alternativeIndex) => (alternativeIndex === index ? value : alternative)),
        }));
    }
    function handleSubmit(event) {
        event.preventDefault();
        submitMutation.mutate({
            categoryId: form.categoryId,
            difficulty: form.difficulty,
            prompt: form.prompt.trim(),
            explanation: form.explanation.trim() || undefined,
            alternatives: form.alternatives.map((text, index) => ({
                text: text.trim(),
                isCorrect: index === form.correctIndex,
            })),
        });
    }
    return (_jsxs("div", { className: "grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]", children: [_jsxs(Card, { className: "p-7", children: [_jsx("p", { className: "section-kicker", children: "question.pipeline" }), _jsx("h2", { className: "mt-3 section-title", children: "Enviar pergunta" }), _jsxs("p", { className: "mt-3 max-w-2xl text-base text-textSecondary", children: ["A pergunta entra como ", _jsx("span", { className: "font-mono text-primary", children: "PENDING_REVIEW" }), " e s\u00F3 aparece no quiz ap\u00F3s aprova\u00E7\u00E3o com checklist editorial."] }), submitError ? (_jsxs("div", { className: "mt-5 flex items-start gap-3 rounded-[1.25rem] border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-textSecondary", children: [_jsx(AlertTriangle, { size: 18, className: "mt-0.5 shrink-0 text-danger" }), _jsx("span", { children: submitError })] })) : null, _jsxs("form", { className: "mt-8 grid gap-4", onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Categoria" }), _jsxs("select", { value: form.categoryId, onChange: (event) => setForm((current) => ({ ...current, categoryId: event.target.value })), required: true, className: "field hover:border-white/12 focus:border-primary", children: [_jsx("option", { value: "", children: "Selecione uma categoria" }), (categoriesQuery.data ?? []).map((category) => (_jsx("option", { value: category.id, children: category.name }, category.id)))] })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Dificuldade" }), _jsxs("select", { value: form.difficulty, onChange: (event) => setForm((current) => ({ ...current, difficulty: event.target.value })), className: "field hover:border-white/12 focus:border-primary", children: [_jsx("option", { value: "EASY", children: "F\u00E1cil" }), _jsx("option", { value: "MEDIUM", children: "M\u00E9dio" }), _jsx("option", { value: "HARD", children: "Dif\u00EDcil" })] })] })] }), _jsx("textarea", { className: "field-area", placeholder: "Enunciado", value: form.prompt, onChange: (event) => setForm((current) => ({ ...current, prompt: event.target.value })), required: true, minLength: 12 }), _jsxs("div", { className: "grid gap-3", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Alternativas" }), _jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: form.alternatives.map((alternative, index) => (_jsxs("label", { className: "grid gap-2 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("span", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: ["Alternativa ", index + 1] }), _jsxs("span", { className: "flex items-center gap-2 text-xs text-textSecondary", children: [_jsx("input", { type: "radio", name: "correctAlternative", checked: form.correctIndex === index, onChange: () => setForm((current) => ({ ...current, correctIndex: index })), className: "h-4 w-4" }), "correta"] })] }), _jsx(Input, { placeholder: `Alternativa ${index + 1}`, value: alternative, onChange: (event) => updateAlternative(index, event.target.value), required: true })] }, index))) })] }), _jsx("textarea", { className: "field-area", placeholder: "Explica\u00E7\u00E3o da resposta correta", value: form.explanation, onChange: (event) => setForm((current) => ({ ...current, explanation: event.target.value })) }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Badge, { tone: "info", children: "C\u00F3digo opcional" }), _jsx(Badge, { children: "Explica\u00E7\u00E3o" }), _jsx(Badge, { tone: "warning", children: "Review manual" })] }), _jsxs(Button, { type: "submit", className: "mt-2 w-full sm:w-auto", loading: submitMutation.isPending, loadingText: "Enviando...", children: [_jsx(Send, { size: 17 }), "Enviar para revis\u00E3o"] })] })] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "mb-5 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold tracking-[-0.03em] text-textPrimary", children: "Minhas perguntas" }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: "Acompanhe o status editorial e a aprova\u00E7\u00E3o final." })] }), _jsx(Badge, { tone: "info", children: "Queue" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(QuestionStatus, { title: "Quando usar useMemo?", status: "PENDING_REVIEW", tone: "warning" }), _jsx(QuestionStatus, { title: "Transa\u00E7\u00F5es SQL", status: "APPROVED", tone: "success" }), submittedTitle ? _jsx(QuestionStatus, { title: submittedTitle, status: "PENDING_REVIEW", tone: "warning" }) : null] })] }), successModalOpen ? (_jsx("div", { className: "fixed inset-0 z-40 grid place-items-center bg-[rgba(4,5,10,0.72)] px-4 backdrop-blur-sm", children: _jsxs(Card, { className: "w-full max-w-lg p-6", role: "dialog", "aria-modal": "true", "aria-labelledby": "question-success-title", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-success/12 text-success", children: _jsx(CheckCircle2, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { id: "question-success-title", className: "text-2xl font-bold tracking-[-0.03em] text-textPrimary", children: "Pergunta enviada" }), _jsx("p", { className: "mt-2 text-sm leading-6 text-textSecondary", children: "Pergunta enviada com sucesso. Ela ser\u00E1 analisada pela equipe de revis\u00E3o antes de entrar no banco oficial de perguntas." })] })] }), _jsx(Button, { variant: "ghost", className: "h-10 w-10 rounded-2xl px-0", onClick: () => setSuccessModalOpen(false), "aria-label": "Fechar modal", children: _jsx(X, { size: 16 }) })] }), _jsx("div", { className: "mt-6 flex justify-end", children: _jsx(Button, { onClick: () => setSuccessModalOpen(false), children: "Fechar" }) })] }) })) : null] }));
}
function QuestionStatus({ title, status, tone, }) {
    return (_jsxs("div", { className: "rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4", children: [_jsx("p", { className: "text-sm font-semibold text-textPrimary", children: title }), _jsx("p", { className: `mt-2 font-mono text-[11px] uppercase tracking-[0.18em] ${tone === 'success' ? 'text-success' : 'text-warning'}`, children: status })] }));
}
function getErrorMessage(error) {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? 'Erro de conexão com a API.';
    }
    return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}
