import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock3, Sparkles, Trophy } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../lib/api';
import { difficultyCopy } from '../lib/quiz';
import { clearQuizSession, readQuizSession } from '../lib/quizSession';
export function Quiz() {
    const navigate = useNavigate();
    const session = useMemo(() => readQuizSession(), []);
    const startedAtRef = useRef(Date.now());
    const [index, setIndex] = useState(0);
    const [selectedAlternativeId, setSelectedAlternativeId] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    useEffect(() => {
        if (!session) {
            navigate('/quiz', {
                replace: true,
                state: { notice: 'Configure seu desafio antes de começar.' },
            });
        }
    }, [navigate, session]);
    useEffect(() => {
        if (session && session.questions.length === 0) {
            clearQuizSession();
            navigate('/quiz', {
                replace: true,
                state: { notice: 'Configure seu desafio antes de começar.' },
            });
        }
    }, [navigate, session]);
    const submitMutation = useMutation({
        mutationFn: async (pendingAnswers) => {
            if (!session)
                throw new Error('Sessão não encontrada.');
            return (await api.post('/quizzes/submit', {
                quizSessionId: session.quizSessionId,
                answers: pendingAnswers,
            })).data;
        },
        onSuccess: (data) => {
            clearQuizSession();
            setResult(data);
        },
    });
    if (!session)
        return null;
    const question = session.questions[index];
    const currentDifficulty = difficultyCopy[session.setup.difficulty];
    const isLastQuestion = index === session.questions.length - 1;
    const progress = session.questions.length > 0 ? (index / session.questions.length) * 100 : 0;
    if (!question && !result)
        return null;
    if (result) {
        return (_jsxs(Card, { className: "mx-auto max-w-4xl overflow-hidden p-8", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(43,224,140,0.16),transparent_20rem)]" }), _jsxs("div", { className: "relative text-center", children: [_jsx("div", { className: "mx-auto grid h-16 w-16 place-items-center rounded-[1.5rem] bg-success/12 text-success", children: _jsx(CheckCircle2, { size: 34 }) }), _jsx("h2", { className: "mt-5 text-4xl font-extrabold tracking-[-0.05em] text-textPrimary", children: "Desafio conclu\u00EDdo" }), _jsx("p", { className: "mt-3 text-base text-textSecondary", children: "Resultado consolidado no backend, sem revelar respostas corretas durante a sess\u00E3o." }), _jsxs("div", { className: "mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [_jsx(ResultMetric, { label: "Precis\u00E3o", value: `${result.accuracy}%`, icon: Trophy }), _jsx(ResultMetric, { label: "Acertos", value: `${result.correctCount}/${result.totalQuestions}`, icon: Sparkles }), _jsx(ResultMetric, { label: "XP ganho", value: `+${result.xpEarned}`, icon: CheckCircle2 }), _jsx(ResultMetric, { label: "Novo n\u00EDvel", value: `Lv ${result.level}`, icon: Clock3 })] }), _jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center", children: [_jsx(Button, { variant: "secondary", onClick: () => {
                                        navigate('/quiz');
                                    }, children: "Configurar novo desafio" }), _jsx(Button, { onClick: () => {
                                        navigate('/dashboard');
                                    }, children: "Voltar ao dashboard" })] })] })] }));
    }
    return (_jsxs("div", { className: "mx-auto max-w-5xl space-y-6", children: [_jsxs(Card, { className: "overflow-hidden p-6", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(108,99,255,0.16),transparent_18rem)]" }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "section-kicker", children: "quiz.session" }), _jsxs("h2", { className: "mt-3 text-3xl font-extrabold tracking-[-0.04em] text-textPrimary", children: ["Pergunta ", index + 1, " de ", session.questions.length] }), _jsx("p", { className: "mt-2 max-w-2xl text-sm text-textSecondary", children: "Desafio em andamento com corre\u00E7\u00E3o apenas na submiss\u00E3o final." })] }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-3 lg:min-w-[360px]", children: [_jsx(SessionBadge, { label: "Dificuldade", value: currentDifficulty.label }), _jsx(SessionBadge, { label: "Categorias", value: `${session.setup.categoryIds.length} selecionada${session.setup.categoryIds.length > 1 ? 's' : ''}` }), _jsx(SessionBadge, { label: "Progresso", value: `${answers.length}/${session.questions.length}` })] })] }), _jsx("div", { className: "mt-6", children: _jsx(ProgressBar, { value: progress }) })] })] }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]", children: [_jsx("section", { className: "space-y-6", children: _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "mb-5 flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "section-kicker", children: question?.category }), _jsx("h3", { className: "mt-3 text-3xl font-bold leading-tight tracking-[-0.04em] text-textPrimary", children: question?.prompt })] }), _jsxs("div", { className: "rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-right", children: [_jsxs("div", { className: "font-mono text-sm text-textSecondary", children: [index + 1, "/", session.questions.length] }), _jsx("div", { className: "mt-1 text-xs uppercase tracking-[0.18em] text-textMuted", children: "quest\u00E3o" })] })] }), _jsx("div", { className: "grid gap-3", children: question?.alternatives.map((alternative) => {
                                        const selected = selectedAlternativeId === alternative.id;
                                        return (_jsxs("button", { type: "button", onClick: () => setSelectedAlternativeId(alternative.id), className: `flex min-h-16 items-center justify-between gap-4 rounded-[1.25rem] border px-5 py-4 text-left transition duration-150 ease-premium ${selected
                                                ? 'border-primary/35 bg-primary/10 text-textPrimary shadow-[0_0_0_1px_rgba(108,99,255,0.14)]'
                                                : 'border-white/8 bg-white/[0.025] text-textSecondary hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.04] hover:text-textPrimary'}`, children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Circle, { className: `h-5 w-5 shrink-0 ${selected ? 'text-primary' : 'text-textMuted'}` }), _jsx("span", { className: "text-base font-semibold", children: alternative.text })] }), selected ? _jsx(CheckCircle2, { size: 18, className: "text-primary" }) : null] }, alternative.id));
                                    }) }), _jsx("div", { className: "mt-4 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-textSecondary", children: "Sua resposta fica registrada, mas a valida\u00E7\u00E3o acontece somente ap\u00F3s a submiss\u00E3o final." }), submitMutation.isError ? (_jsxs("div", { className: "mt-4 flex items-start gap-3 rounded-[1rem] border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-textSecondary", children: [_jsx(AlertTriangle, { size: 18, className: "mt-0.5 shrink-0 text-danger" }), _jsx("span", { children: getSubmitErrorMessage(submitMutation.error) })] })) : null, _jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between", children: [_jsxs(Button, { variant: "ghost", onClick: () => {
                                                clearQuizSession();
                                                navigate('/quiz');
                                            }, children: [_jsx(ArrowLeft, { size: 16 }), "Reconfigurar"] }), _jsxs(Button, { className: "sm:min-w-56", loading: submitMutation.isPending, disabled: !selectedAlternativeId, onClick: () => {
                                                if (!question || !selectedAlternativeId)
                                                    return;
                                                const nextAnswers = [
                                                    ...answers,
                                                    {
                                                        questionId: question.id,
                                                        alternativeId: selectedAlternativeId,
                                                        timeSpentSeconds: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
                                                    },
                                                ];
                                                if (isLastQuestion) {
                                                    submitMutation.mutate(nextAnswers);
                                                    setAnswers(nextAnswers);
                                                    return;
                                                }
                                                setAnswers(nextAnswers);
                                                setSelectedAlternativeId(null);
                                                setIndex((current) => current + 1);
                                                startedAtRef.current = Date.now();
                                            }, children: [isLastQuestion ? 'Finalizar desafio' : 'Próxima pergunta', !submitMutation.isPending ? _jsx(ArrowRight, { size: 16 }) : null] })] })] }) }), _jsxs("aside", { className: "space-y-6", children: [_jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "section-kicker", children: "Sess\u00E3o" }), _jsx("h3", { className: "mt-3 text-2xl font-bold tracking-[-0.03em] text-textPrimary", children: "Leitura r\u00E1pida" }), _jsxs("div", { className: "mt-5 space-y-3", children: [_jsx(SidebarRow, { label: "Quest\u00F5es totais", value: `${session.questions.length}` }), _jsx(SidebarRow, { label: "Respondidas", value: `${answers.length}` }), _jsx(SidebarRow, { label: "Restantes", value: `${session.questions.length - answers.length}` }), _jsx(SidebarRow, { label: "Categoria atual", value: question?.category ?? '-' })] })] }), _jsxs(Card, { className: "p-6", children: [_jsx("p", { className: "section-kicker", children: "Anti-cheat" }), _jsx("h3", { className: "mt-3 text-xl font-bold tracking-[-0.03em] text-textPrimary", children: "Corre\u00E7\u00E3o protegida" }), _jsx("p", { className: "mt-3 text-sm leading-6 text-textSecondary", children: "Nenhuma resposta correta \u00E9 enviada antes da submiss\u00E3o. O frontend s\u00F3 registra escolhas e tempos de resposta." })] })] })] })] }));
}
function SessionBadge({ label, value }) {
    return (_jsxs("div", { className: "rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-textMuted", children: label }), _jsx("p", { className: "mt-2 text-sm font-semibold text-textPrimary", children: value })] }));
}
function SidebarRow({ label, value }) {
    return (_jsxs("div", { className: "flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3", children: [_jsx("span", { className: "text-sm text-textSecondary", children: label }), _jsx("span", { className: "font-mono text-sm font-semibold text-textPrimary", children: value })] }));
}
function ResultMetric({ label, value, icon: Icon, }) {
    return (_jsxs("div", { className: "rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 text-left", children: [_jsx("div", { className: "mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-success/10 text-success", children: _jsx(Icon, { size: 18 }) }), _jsx("p", { className: "font-mono text-3xl font-extrabold text-textPrimary", children: value }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: label })] }));
}
function getSubmitErrorMessage(error) {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (message)
            return message;
    }
    if (error instanceof Error)
        return error.message;
    return 'Não foi possível finalizar o desafio. Tente novamente.';
}
