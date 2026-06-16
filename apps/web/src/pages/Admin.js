import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Archive, Check, FileEdit, FileWarning, Gauge, RotateCcw, ShieldAlert, ShieldCheck, Trash2, X } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useApproveQuestionMutation, useArchiveQuestionMutation, useDeleteQuestionMutation, useRejectQuestionMutation, useRestoreQuestionMutation, useUpdateQuestionMutation, } from '../hooks/useAdminQuestionMutations';
import { adminQueryKeys, difficultyLabel, getStatusTone, statusLabel, } from '../lib/admin';
import { api } from '../lib/api';
const emptyApproveChecklist = () => ({
    clearStatement: false,
    onlyOneCorrect: false,
    plausibleAlternatives: false,
    noTechnicalError: false,
    correctCategory: false,
    correctDifficulty: false,
    usefulExplanation: false,
});
const checklistLabels = [
    { key: 'clearStatement', label: 'Enunciado claro' },
    { key: 'onlyOneCorrect', label: 'Apenas uma correta' },
    { key: 'plausibleAlternatives', label: 'Alternativas plausíveis' },
    { key: 'noTechnicalError', label: 'Sem erro técnico' },
    { key: 'correctCategory', label: 'Categoria correta' },
    { key: 'correctDifficulty', label: 'Dificuldade correta' },
    { key: 'usefulExplanation', label: 'Explicação útil' },
];
export function Admin() {
    const { user } = useAuth();
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const [approveChecklist, setApproveChecklist] = useState(emptyApproveChecklist);
    const [approveNotes, setApproveNotes] = useState('');
    const [rejectState, setRejectState] = useState(null);
    const [confirmState, setConfirmState] = useState(null);
    const [editState, setEditState] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const canModerate = user?.role === 'ADMIN' || user?.role === 'REVIEWER';
    const isAdmin = user?.role === 'ADMIN';
    const pendingReviewsQuery = useQuery({
        queryKey: adminQueryKeys.pendingReviews,
        queryFn: async () => (await api.get('/reviews/pending')).data,
        enabled: canModerate,
    });
    const adminDashboardQuery = useQuery({
        queryKey: adminQueryKeys.adminDashboard,
        queryFn: async () => (await api.get('/admin/dashboard')).data,
        enabled: isAdmin,
    });
    const adminQuestionsQuery = useQuery({
        queryKey: adminQueryKeys.adminQuestions,
        queryFn: async () => (await api.get('/admin/questions')).data,
        enabled: isAdmin,
    });
    const adminStatsQuery = useQuery({
        queryKey: adminQueryKeys.adminStats,
        queryFn: async () => (await api.get('/admin/stats')).data,
        enabled: isAdmin,
    });
    const approveMutation = useApproveQuestionMutation();
    const rejectMutation = useRejectQuestionMutation();
    const archiveMutation = useArchiveQuestionMutation();
    const deleteMutation = useDeleteQuestionMutation();
    const restoreMutation = useRestoreQuestionMutation();
    const updateMutation = useUpdateQuestionMutation();
    const pendingReviews = pendingReviewsQuery.data ?? [];
    const adminQuestions = adminQuestionsQuery.data ?? [];
    const selectedQuestion = pendingReviews.find((question) => question.id === selectedQuestionId) ?? pendingReviews[0] ?? null;
    useEffect(() => {
        if (!selectedQuestionId && pendingReviews.length > 0) {
            const firstQuestion = pendingReviews[0];
            if (firstQuestion)
                setSelectedQuestionId(firstQuestion.id);
            return;
        }
        if (selectedQuestionId && !pendingReviews.some((question) => question.id === selectedQuestionId)) {
            setSelectedQuestionId(pendingReviews[0]?.id ?? null);
        }
    }, [pendingReviews, selectedQuestionId]);
    useEffect(() => {
        setApproveChecklist(emptyApproveChecklist());
        setApproveNotes('');
        setActionError(null);
    }, [selectedQuestion?.id]);
    const categoryOptions = useMemo(() => {
        const grouped = new Map();
        for (const question of adminQuestions) {
            grouped.set(question.category.id, { id: question.category.id, name: question.category.name });
        }
        return [...grouped.values()].sort((left, right) => left.name.localeCompare(right.name));
    }, [adminQuestions]);
    if (!canModerate) {
        return (_jsx(Card, { className: "p-8", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "grid h-12 w-12 place-items-center rounded-2xl bg-danger/12 text-danger", children: _jsx(ShieldAlert, { size: 22 }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold tracking-[-0.03em] text-textPrimary", children: "Acesso restrito" }), _jsxs("p", { className: "mt-2 text-sm text-textSecondary", children: ["Esta \u00E1rea exige perfil ", _jsx("span", { className: "text-textPrimary", children: "ADMIN" }), " ou ", _jsx("span", { className: "text-textPrimary", children: "REVIEWER" }), "."] })] })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [isAdmin ? (_jsxs("section", { className: "grid gap-4 md:grid-cols-4", children: [_jsx(AdminMetric, { label: "Usu\u00E1rios", value: String(adminDashboardQuery.data?.users ?? 0), icon: Gauge, tone: "info", loading: adminDashboardQuery.isLoading }), _jsx(AdminMetric, { label: "Perguntas", value: String(adminDashboardQuery.data?.questions ?? 0), icon: FileWarning, tone: "primary", loading: adminDashboardQuery.isLoading }), _jsx(AdminMetric, { label: "Pendentes", value: String(adminDashboardQuery.data?.pending ?? pendingReviews.length), icon: Archive, tone: "warning", loading: adminDashboardQuery.isLoading && pendingReviews.length === 0 }), _jsx(AdminMetric, { label: "Reports", value: String(adminDashboardQuery.data?.reports ?? 0), icon: Trash2, tone: "danger", loading: adminDashboardQuery.isLoading })] })) : null, actionError ? (_jsx(Card, { className: "border-danger/20 p-4", children: _jsx("p", { className: "text-sm text-danger", children: actionError }) })) : null, actionMessage ? (_jsx(Card, { className: "border-success/20 p-4", children: _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx("p", { className: "text-sm text-success", children: actionMessage }), _jsx(Button, { variant: "ghost", className: "h-8 w-8 rounded-xl px-0", onClick: () => setActionMessage(null), "aria-label": "Fechar mensagem", children: _jsx(X, { size: 14 }) })] }) })) : null, _jsxs("div", { className: "grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]", children: [_jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "flex flex-col gap-4 border-b border-white/6 px-6 py-5 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "section-kicker", children: "review.console" }), _jsx("h2", { className: "mt-3 text-2xl font-extrabold tracking-[-0.04em] text-textPrimary", children: "Admin review" }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: "Aprova\u00E7\u00E3o exige checklist completo. Rejei\u00E7\u00E3o exige motivo. Arquivamento remove a pergunta do quiz sem apagar o hist\u00F3rico." })] }), _jsxs(Badge, { tone: "warning", children: [pendingReviews.length, " pendente(s)"] })] }), pendingReviewsQuery.isLoading ? (_jsx("div", { className: "space-y-3 px-6 py-6", children: Array.from({ length: 3 }, (_, index) => (_jsx("div", { className: "h-24 animate-pulse rounded-[1.5rem] border border-white/6 bg-white/[0.03]" }, index))) })) : pendingReviewsQuery.isError ? (_jsx(InlineState, { title: "N\u00E3o foi poss\u00EDvel carregar a fila de revis\u00E3o.", description: getErrorMessage(pendingReviewsQuery.error), tone: "danger" })) : pendingReviews.length === 0 ? (_jsx(EmptyReviewState, {})) : (_jsxs("div", { className: "grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]", children: [_jsx("div", { className: "border-r border-white/6", children: pendingReviews.map((question) => {
                                            const active = question.id === selectedQuestion?.id;
                                            return (_jsxs("button", { type: "button", onClick: () => setSelectedQuestionId(question.id), className: `w-full border-b border-white/6 px-5 py-4 text-left transition ${active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`, children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx(Badge, { tone: "warning", children: difficultyLabel[question.difficulty] }), _jsx("span", { className: "text-xs text-textMuted", children: question.category.name })] }), _jsx("p", { className: "mt-3 line-clamp-2 text-sm font-semibold text-textPrimary", children: question.prompt }), _jsxs("p", { className: "mt-2 text-xs text-textSecondary", children: [question.author?.name ?? 'Autor desconhecido', " \u00B7 ", question.alternatives.length, " alternativas"] })] }, question.id));
                                        }) }), selectedQuestion ? (_jsxs("div", { className: "space-y-6 px-6 py-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx(Badge, { tone: "warning", children: "Pendente" }), _jsx(Badge, { tone: "info", children: selectedQuestion.category.name }), _jsx(Badge, { tone: "default", children: difficultyLabel[selectedQuestion.difficulty] })] }), _jsx("h3", { className: "mt-4 text-2xl font-bold tracking-[-0.03em] text-textPrimary", children: selectedQuestion.prompt }), _jsxs("p", { className: "mt-3 text-sm text-textSecondary", children: ["Autor: ", selectedQuestion.author?.name ?? 'Sem autor', " \u00B7 ", selectedQuestion.author?.email ?? 'sem email'] }), selectedQuestion.explanation ? (_jsxs("div", { className: "mt-4 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-textMuted", children: "Explica\u00E7\u00E3o" }), _jsx("p", { className: "mt-2 text-sm leading-6 text-textSecondary", children: selectedQuestion.explanation })] })) : null] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-textPrimary", children: "Alternativas" }), _jsx("div", { className: "mt-3 grid gap-3", children: selectedQuestion.alternatives.map((alternative, index) => (_jsx("div", { className: "rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3", children: _jsxs("p", { className: "text-sm text-textPrimary", children: [_jsxs("span", { className: "mr-2 font-mono text-textMuted", children: [String.fromCharCode(65 + index), "."] }), alternative.text] }) }, alternative.id))) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-textPrimary", children: "Checklist obrigat\u00F3rio" }), _jsx("div", { className: "mt-3 grid gap-3 sm:grid-cols-2", children: checklistLabels.map((item) => (_jsxs("label", { className: "flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-textSecondary", children: [_jsx("input", { type: "checkbox", checked: approveChecklist[item.key], onChange: (event) => setApproveChecklist((current) => ({
                                                                        ...current,
                                                                        [item.key]: event.target.checked,
                                                                    })), className: "h-4 w-4 rounded border-border bg-transparent" }), _jsx("span", { children: item.label })] }, item.key))) }), _jsxs("label", { className: "mt-4 block", children: [_jsx("span", { className: "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Notas de aprova\u00E7\u00E3o" }), _jsx("textarea", { value: approveNotes, onChange: (event) => setApproveNotes(event.target.value), rows: 4, className: "field-area", placeholder: "Notas internas opcionais para hist\u00F3rico de revis\u00E3o." })] })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs(Button, { loading: approveMutation.isPending && approveMutation.variables?.questionId === selectedQuestion.id, loadingText: "Aprovando...", onClick: async () => {
                                                            try {
                                                                setActionError(null);
                                                                setActionMessage(null);
                                                                await approveMutation.mutateAsync({
                                                                    questionId: selectedQuestion.id,
                                                                    payload: { checklist: approveChecklist, notes: approveNotes.trim() || undefined },
                                                                });
                                                                setActionMessage('Pergunta aprovada com sucesso.');
                                                            }
                                                            catch (error) {
                                                                setActionError(getErrorMessage(error));
                                                            }
                                                        }, children: [_jsx(Check, { size: 16 }), "Aprovar"] }), _jsxs(Button, { variant: "secondary", onClick: () => setRejectState({ question: selectedQuestion, reason: '', notes: '' }), children: [_jsx(X, { size: 16 }), "Rejeitar"] }), _jsxs(Button, { variant: "ghost", onClick: () => setConfirmState({
                                                            question: selectedQuestion,
                                                            action: 'archive',
                                                            message: 'Esta pergunta será removida do quiz, mas permanecerá no histórico.',
                                                        }), children: [_jsx(Archive, { size: 16 }), "Arquivar"] })] })] })) : null] }))] }), _jsxs("div", { className: "space-y-6", children: [_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-success/12 text-success", children: _jsx(ShieldCheck, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold tracking-[-0.03em] text-textPrimary", children: "Regras do fluxo" }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: "Aprova\u00E7\u00E3o ativa a pergunta no quiz. Rejei\u00E7\u00E3o exige motivo. Arquivamento retira do quiz sem apagar hist\u00F3rico." })] })] }) }), isAdmin ? (_jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "section-kicker", children: "status.summary" }), _jsx("h3", { className: "mt-3 text-xl font-bold tracking-[-0.03em] text-textPrimary", children: "Distribui\u00E7\u00E3o atual" }), _jsx("div", { className: "mt-5 grid gap-3", children: ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'].map((status) => (_jsxs("div", { className: "flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3", children: [_jsx("span", { className: "text-sm text-textSecondary", children: statusLabel[status] }), _jsx("span", { className: "font-mono text-sm font-semibold text-textPrimary", children: adminStatsQuery.data?.statusCounts[status] ?? 0 })] }, status))) })] })) : (_jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "section-kicker", children: "role.scope" }), _jsx("h3", { className: "mt-3 text-xl font-bold tracking-[-0.03em] text-textPrimary", children: "Perfil reviewer" }), _jsx("p", { className: "mt-3 text-sm leading-6 text-textSecondary", children: "Voc\u00EA pode aprovar, rejeitar e arquivar perguntas. Dashboard completo e exclus\u00E3o definitiva continuam restritos ao perfil ADMIN." })] }))] })] }), isAdmin ? (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 border-b border-white/6 px-6 py-5", children: [_jsxs("div", { children: [_jsx("p", { className: "section-kicker", children: "admin.questions" }), _jsx("h2", { className: "mt-3 text-2xl font-extrabold tracking-[-0.04em] text-textPrimary", children: "Banco de perguntas" }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: "A\u00E7\u00F5es administrativas atualizam status, contadores e dashboard sem refresh manual." })] }), _jsxs(Badge, { tone: "info", children: [adminQuestions.length, " total"] })] }), adminQuestionsQuery.isLoading ? (_jsx("div", { className: "space-y-3 px-6 py-6", children: Array.from({ length: 4 }, (_, index) => (_jsx("div", { className: "h-16 animate-pulse rounded-[1rem] border border-white/6 bg-white/[0.03]" }, index))) })) : adminQuestionsQuery.isError ? (_jsx(InlineState, { title: "N\u00E3o foi poss\u00EDvel carregar as perguntas administrativas.", description: getErrorMessage(adminQuestionsQuery.error), tone: "danger" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full border-separate border-spacing-0", children: [_jsx("thead", { children: _jsx("tr", { className: "text-left", children: ['Pergunta', 'Categoria', 'Dificuldade', 'Status', 'Uso', 'Ações'].map((heading) => (_jsx("th", { className: "border-b border-white/6 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-textMuted", children: heading }, heading))) }) }), _jsx("tbody", { children: adminQuestions.map((question) => (_jsxs("tr", { className: "glass-table-row align-top", children: [_jsxs("td", { className: "px-6 py-4", children: [_jsx("p", { className: "max-w-[420px] text-sm font-semibold text-textPrimary", children: question.prompt }), _jsxs("p", { className: "mt-2 text-xs text-textSecondary", children: [question.author?.name ?? 'Sem autor', " \u00B7 \u00FAltima revis\u00E3o", ' ', question.reviewedAt ? new Date(question.reviewedAt).toLocaleDateString('pt-BR') : 'pendente'] }), question.rejectionReason ? (_jsxs("p", { className: "mt-2 text-xs text-danger", children: ["Motivo: ", question.rejectionReason] })) : null] }), _jsx("td", { className: "px-6 py-4 text-sm text-textSecondary", children: question.category.name }), _jsx("td", { className: "px-6 py-4 text-sm text-textSecondary", children: difficultyLabel[question.difficulty] }), _jsx("td", { className: "px-6 py-4", children: _jsx(Badge, { tone: getStatusTone(question.status), children: statusLabel[question.status] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-textSecondary", children: question.usedCount }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [question.status !== 'APPROVED' && question.status !== 'ARCHIVED' ? (_jsx(Button, { variant: "secondary", className: "h-9 rounded-xl px-3 text-xs", loading: approveMutation.isPending && approveMutation.variables?.questionId === question.id, loadingText: "Aprovando...", onClick: async () => {
                                                                try {
                                                                    setActionError(null);
                                                                    setActionMessage(null);
                                                                    await approveMutation.mutateAsync({
                                                                        questionId: question.id,
                                                                        payload: {
                                                                            checklist: {
                                                                                clearStatement: true,
                                                                                onlyOneCorrect: true,
                                                                                plausibleAlternatives: true,
                                                                                noTechnicalError: true,
                                                                                correctCategory: true,
                                                                                correctDifficulty: true,
                                                                                usefulExplanation: true,
                                                                            },
                                                                        },
                                                                    });
                                                                    setActionMessage('Pergunta aprovada com sucesso.');
                                                                }
                                                                catch (error) {
                                                                    setActionError(getErrorMessage(error));
                                                                }
                                                            }, children: "Aprovar" })) : null, question.status !== 'REJECTED' && question.status !== 'ARCHIVED' ? (_jsx(Button, { variant: "secondary", className: "h-9 rounded-xl px-3 text-xs", onClick: () => setRejectState({ question, reason: '', notes: '' }), children: "Rejeitar" })) : null, question.status !== 'ARCHIVED' ? (_jsx(Button, { variant: "ghost", className: "h-9 rounded-xl px-3 text-xs", onClick: () => setConfirmState({
                                                                question,
                                                                action: 'archive',
                                                                message: 'Esta pergunta será removida do quiz, mas permanecerá no histórico.',
                                                            }), children: "Arquivar" })) : (_jsxs(Button, { variant: "secondary", className: "h-9 rounded-xl px-3 text-xs", onClick: () => setConfirmState({
                                                                question,
                                                                action: 'restore',
                                                                message: 'Esta pergunta voltará para o banco ativo de perguntas aprovadas.',
                                                            }), children: [_jsx(RotateCcw, { size: 14 }), "Restaurar"] })), _jsxs(Button, { variant: "ghost", className: "h-9 rounded-xl px-3 text-xs", onClick: () => setEditState({
                                                                questionId: question.id,
                                                                prompt: question.prompt,
                                                                explanation: question.explanation ?? '',
                                                                difficulty: question.difficulty,
                                                                categoryId: question.category.id,
                                                            }), children: [_jsx(FileEdit, { size: 14 }), "Editar"] }), _jsxs(Button, { variant: "danger", className: "h-9 rounded-xl px-3 text-xs", onClick: () => setConfirmState({
                                                                question,
                                                                action: 'delete',
                                                                message: 'Tem certeza que deseja excluir esta pergunta? Essa ação não pode ser desfeita.',
                                                            }), children: [_jsx(Trash2, { size: 14 }), "Excluir"] })] }) })] }, question.id))) })] }) }))] })) : null, rejectState ? (_jsxs(ModalShell, { title: "Rejeitar pergunta", description: "Explique o motivo da rejei\u00E7\u00E3o. O envio fica bloqueado enquanto o motivo estiver vazio.", onClose: () => setRejectState(null), children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Motivo da rejei\u00E7\u00E3o" }), _jsx("textarea", { value: rejectState.reason, onChange: (event) => setRejectState((current) => (current ? { ...current, reason: event.target.value } : current)), rows: 5, className: "field-area", placeholder: "Explique por que a pergunta n\u00E3o pode ser aprovada." })] }), _jsxs("label", { className: "mt-4 block", children: [_jsx("span", { className: "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Notas internas" }), _jsx("textarea", { value: rejectState.notes, onChange: (event) => setRejectState((current) => (current ? { ...current, notes: event.target.value } : current)), rows: 3, className: "field-area", placeholder: "Notas opcionais para o hist\u00F3rico da revis\u00E3o." })] }), _jsxs("div", { className: "mt-6 flex flex-wrap justify-end gap-3", children: [_jsx(Button, { variant: "ghost", onClick: () => setRejectState(null), children: "Cancelar" }), _jsx(Button, { variant: "danger", loading: rejectMutation.isPending, loadingText: "Rejeitando...", disabled: !rejectState.reason.trim(), onClick: async () => {
                                    try {
                                        setActionError(null);
                                        setActionMessage(null);
                                        await rejectMutation.mutateAsync({
                                            questionId: rejectState.question.id,
                                            payload: {
                                                rejectionReason: rejectState.reason.trim(),
                                                notes: rejectState.notes.trim() || undefined,
                                            },
                                        });
                                        setRejectState(null);
                                        setActionMessage('Pergunta rejeitada com sucesso.');
                                    }
                                    catch (error) {
                                        setActionError(getErrorMessage(error));
                                    }
                                }, children: "Confirmar rejei\u00E7\u00E3o" })] })] })) : null, confirmState ? (_jsx(ModalShell, { title: confirmState.action === 'delete'
                    ? 'Excluir pergunta'
                    : confirmState.action === 'restore'
                        ? 'Restaurar pergunta'
                        : 'Arquivar pergunta', description: confirmState.message, onClose: () => setConfirmState(null), children: _jsxs("div", { className: "mt-6 flex flex-wrap justify-end gap-3", children: [_jsx(Button, { variant: "ghost", onClick: () => setConfirmState(null), children: "Cancelar" }), _jsx(Button, { variant: confirmState.action === 'delete' ? 'danger' : 'secondary', loading: (confirmState.action === 'delete' && deleteMutation.isPending) ||
                                (confirmState.action === 'archive' && archiveMutation.isPending) ||
                                (confirmState.action === 'restore' && restoreMutation.isPending), loadingText: confirmState.action === 'delete'
                                ? 'Excluindo...'
                                : confirmState.action === 'restore'
                                    ? 'Restaurando...'
                                    : 'Arquivando...', onClick: async () => {
                                try {
                                    setActionError(null);
                                    setActionMessage(null);
                                    if (confirmState.action === 'delete') {
                                        await deleteMutation.mutateAsync(confirmState.question.id);
                                        setActionMessage('Pergunta excluída com sucesso.');
                                    }
                                    else if (confirmState.action === 'restore') {
                                        await restoreMutation.mutateAsync(confirmState.question.id);
                                        setActionMessage('Pergunta restaurada com sucesso.');
                                    }
                                    else {
                                        await archiveMutation.mutateAsync(confirmState.question.id);
                                        setActionMessage('Pergunta arquivada com sucesso.');
                                    }
                                    setConfirmState(null);
                                }
                                catch (error) {
                                    const message = getErrorMessage(error);
                                    setActionError(message);
                                    if (axios.isAxiosError(error) &&
                                        error.response?.status === 409 &&
                                        confirmState.question.status !== 'ARCHIVED') {
                                        setConfirmState({
                                            question: confirmState.question,
                                            action: 'archive',
                                            message: 'Esta pergunta já foi usada. Ela não pode ser excluída e deve ser arquivada.',
                                        });
                                        return;
                                    }
                                    setConfirmState(null);
                                }
                            }, children: confirmState.action === 'delete'
                                ? 'Excluir definitivamente'
                                : confirmState.action === 'restore'
                                    ? 'Restaurar'
                                    : 'Arquivar' })] }) })) : null, editState ? (_jsxs(ModalShell, { title: "Editar pergunta", description: "Ajuste prompt, explica\u00E7\u00E3o, dificuldade e categoria. A atualiza\u00E7\u00E3o invalida as listas automaticamente.", onClose: () => setEditState(null), children: [_jsxs("div", { className: "grid gap-4", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Prompt" }), _jsx("textarea", { value: editState.prompt, onChange: (event) => setEditState((current) => (current ? { ...current, prompt: event.target.value } : current)), rows: 5, className: "field-area" })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Explica\u00E7\u00E3o" }), _jsx("textarea", { value: editState.explanation, onChange: (event) => setEditState((current) => (current ? { ...current, explanation: event.target.value } : current)), rows: 4, className: "field-area" })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Dificuldade" }), _jsxs("select", { value: editState.difficulty, onChange: (event) => setEditState((current) => (current ? { ...current, difficulty: event.target.value } : current)), className: "field", children: [_jsx("option", { value: "EASY", children: "F\u00E1cil" }), _jsx("option", { value: "MEDIUM", children: "M\u00E9dia" }), _jsx("option", { value: "HARD", children: "Dif\u00EDcil" })] })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-textMuted", children: "Categoria" }), _jsx("select", { value: editState.categoryId, onChange: (event) => setEditState((current) => (current ? { ...current, categoryId: event.target.value } : current)), className: "field", children: categoryOptions.map((category) => (_jsx("option", { value: category.id, children: category.name }, category.id))) })] })] })] }), _jsxs("div", { className: "mt-6 flex flex-wrap justify-end gap-3", children: [_jsx(Button, { variant: "ghost", onClick: () => setEditState(null), children: "Cancelar" }), _jsx(Button, { loading: updateMutation.isPending, loadingText: "Salvando...", disabled: !editState.prompt.trim(), onClick: async () => {
                                    try {
                                        setActionError(null);
                                        setActionMessage(null);
                                        await updateMutation.mutateAsync({
                                            questionId: editState.questionId,
                                            payload: {
                                                prompt: editState.prompt.trim(),
                                                difficulty: editState.difficulty,
                                                categoryId: editState.categoryId,
                                                ...(editState.explanation.trim() ? { explanation: editState.explanation.trim() } : {}),
                                            },
                                        });
                                        setEditState(null);
                                        setActionMessage('Pergunta atualizada com sucesso.');
                                    }
                                    catch (error) {
                                        setActionError(getErrorMessage(error));
                                    }
                                }, children: "Salvar altera\u00E7\u00F5es" })] })] })) : null] }));
}
function AdminMetric({ label, value, icon: Icon, tone, loading, }) {
    const tones = {
        primary: 'bg-primary/12 text-primary',
        info: 'bg-info/12 text-info',
        warning: 'bg-warning/12 text-warning',
        danger: 'bg-danger/12 text-danger',
    };
    return (_jsxs(Card, { className: "p-5", children: [_jsx("div", { className: `mb-5 grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`, children: _jsx(Icon, { size: 18 }) }), _jsx("p", { className: "font-mono text-3xl font-extrabold text-textPrimary", children: loading ? '...' : value }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: label })] }));
}
function InlineState({ title, description, tone }) {
    const toneClasses = tone === 'danger' ? 'border-danger/25 bg-danger/10' : 'border-warning/25 bg-warning/10';
    return (_jsxs("div", { className: `rounded-[1.5rem] border px-5 py-4 ${toneClasses}`, children: [_jsx("p", { className: "font-semibold text-textPrimary", children: title }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: description })] }));
}
function EmptyReviewState() {
    return (_jsxs("div", { className: "px-6 py-12 text-center", children: [_jsx("div", { className: "mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/12 text-success", children: _jsx(Check, { size: 24 }) }), _jsx("h3", { className: "mt-5 text-xl font-bold text-textPrimary", children: "Nenhuma pergunta pendente" }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: "Quando usu\u00E1rios enviarem novas perguntas, elas aparecer\u00E3o aqui." })] }));
}
function ModalShell({ title, description, children, onClose, }) {
    const titleId = `modal-${title.toLowerCase().replace(/\s+/g, '-')}`;
    return (_jsx("div", { className: "fixed inset-0 z-40 grid place-items-center bg-[rgba(4,5,10,0.72)] px-4 backdrop-blur-sm", children: _jsxs(Card, { className: "w-full max-w-2xl p-6", role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h3", { id: titleId, className: "text-2xl font-bold tracking-[-0.03em] text-textPrimary", children: title }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: description })] }), _jsx(Button, { variant: "ghost", className: "h-10 w-10 rounded-2xl px-0", onClick: onClose, "aria-label": "Fechar modal", children: _jsx(X, { size: 16 }) })] }), _jsx("div", { className: "mt-6", children: children })] }) }));
}
function getErrorMessage(error) {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? 'Erro de conexão com a API.';
    }
    return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}
