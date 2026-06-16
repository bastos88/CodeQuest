import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Swords, Timer, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
export function Arena() {
    const [started, setStarted] = useState(false);
    return (_jsxs("div", { className: "grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]", children: [_jsxs(Card, { className: "p-7", children: [_jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between", children: [_jsxs("div", { className: "max-w-2xl", children: [_jsx("p", { className: "section-kicker", children: "competitive.rating" }), _jsx("h2", { className: "mt-3 section-title", children: "Arena competitiva" }), _jsx("p", { className: "mt-3 text-base text-textSecondary", children: "Rating sobe ou desce apenas em modos competitivos. XP continua representando progress\u00E3o acumulada." })] }), _jsx("div", { className: "grid h-14 w-14 place-items-center rounded-[1.25rem] bg-primary/12 text-primary", children: _jsx(Swords, { size: 28 }) })] }), _jsxs("div", { className: "mt-8 grid gap-4 md:grid-cols-3", children: [_jsx(ArenaRule, { label: "Resposta correta", value: "+12 rating", tone: "success" }), _jsx(ArenaRule, { label: "Resposta errada", value: "-5 rating", tone: "danger" }), _jsx(ArenaRule, { label: "Vit\u00F3ria", value: "+50 rating", tone: "warning" })] }), _jsxs("div", { className: "mt-8 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6", children: [started ? (_jsxs("div", { children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx(Badge, { tone: "warning", children: "Matchmaking" }), _jsx("span", { className: "font-mono text-sm text-textSecondary", children: "00:24" })] }), _jsx("h3", { className: "text-2xl font-bold tracking-[-0.03em] text-textPrimary", children: "Desafio React m\u00E9dio" }), _jsx("p", { className: "mt-3 text-textSecondary", children: "Sess\u00E3o competitiva criada. A API registra tempo de resposta e impede submiss\u00E3o duplicada." }), _jsxs("div", { className: "mt-6 grid gap-3 sm:grid-cols-2", children: [_jsx(MiniArenaMetric, { label: "Risco", value: "alto" }), _jsx(MiniArenaMetric, { label: "Mapa", value: "hooks-core" })] })] })) : (_jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold tracking-[-0.03em] text-textPrimary", children: "Pronto para entrar?" }), _jsx("p", { className: "mt-3 text-textSecondary", children: "Ao iniciar, sua pontua\u00E7\u00E3o ranqueada poder\u00E1 subir ou cair conforme desempenho." })] })), _jsx(Button, { className: "mt-6", onClick: () => setStarted(true), children: started ? 'Responder rodada' : 'Iniciar Arena' })] })] }), _jsxs("aside", { className: "space-y-6", children: [_jsx(MetricCard, { icon: TrendingUp, label: "Rating atual", value: "1,020", tone: "success" }), _jsx(MetricCard, { icon: Timer, label: "Tempo m\u00E9dio", value: "18s", tone: "warning" }), _jsx(MetricCard, { icon: Zap, label: "Win streak", value: "6", tone: "primary" })] })] }));
}
function ArenaRule({ label, value, tone, }) {
    const toneClass = {
        success: 'text-success bg-success/10',
        danger: 'text-danger bg-danger/10',
        warning: 'text-warning bg-warning/10',
    };
    return (_jsxs("div", { className: "rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4", children: [_jsx("p", { className: `mb-3 inline-flex rounded-full px-2.5 py-1 font-mono text-xs ${toneClass[tone]}`, children: value }), _jsx("p", { className: "text-sm text-textSecondary", children: label })] }));
}
function MetricCard({ icon: Icon, label, value, tone, }) {
    const tones = {
        success: 'bg-success/12 text-success',
        warning: 'bg-warning/12 text-warning',
        primary: 'bg-primary/12 text-primary',
    };
    return (_jsxs(Card, { className: "p-6", children: [_jsx("div", { className: `mb-5 grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`, children: _jsx(Icon, { size: 19 }) }), _jsx("p", { className: "font-mono text-3xl font-extrabold text-textPrimary", children: value }), _jsx("p", { className: "mt-2 text-sm text-textSecondary", children: label })] }));
}
function MiniArenaMetric({ label, value }) {
    return (_jsxs("div", { className: "rounded-[1rem] border border-white/8 bg-background/60 px-4 py-3", children: [_jsx("div", { className: "font-mono text-[11px] uppercase tracking-[0.18em] text-textMuted", children: label }), _jsx("div", { className: "mt-2 text-sm font-semibold text-textPrimary", children: value })] }));
}
