import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema, registerSchema } from '@codequest/shared';
import { useAuth } from '../context/AuthContext';
import TechMarqueeSection from '../components/TechMarqueeSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { HomeSection } from '../components/ui/HomeSection';
import { Input } from '../components/ui/Input';
import { SectionDivider } from '../components/ui/SectionDivider';
import SocialButtons, { DiscordIcon, GithubIcon } from '../components/ui/SocialButtons';
function getErrorMessage(error) {
    return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}
const steps = [
    {
        index: '01',
        title: 'Escolha uma categoria',
        description: 'Selecione a trilha que faz sentido para sua entrevista, revisão ou rotina de estudo.',
    },
    {
        index: '02',
        title: 'Defina a dificuldade',
        description: 'Ajuste o nível para iniciantes, intermediário ou avançado sem sair do fluxo.',
    },
    {
        index: '03',
        title: 'Responda ao quiz',
        description: 'Resolva perguntas objetivas, código e conceitos com feedback direto.',
    },
    {
        index: '04',
        title: 'Analise seu desempenho',
        description: 'Veja acertos, erros, tempo, categorias fortes e pontos que pedem revisão.',
    },
];
const features = [
    {
        title: 'Quiz inteligente',
        subtitle: '40 perguntas',
        description: 'Sessões guiadas por categoria, dificuldade, quantidade de perguntas e foco técnico.',
        accent: true,
    },
    {
        title: 'Arena',
        subtitle: 'PvP sprint',
        description: 'Desafios competitivos para treinar sob pressão.',
        accent: false,
    },
    {
        title: 'Ranking',
        subtitle: 'Top 100',
        description: 'Evolução visível com Elo, posições e consistência.',
        accent: false,
    },
    {
        title: 'Contribuições',
        subtitle: 'Review flow',
        description: 'Crie perguntas e peça à comunidade para refinar melhor.',
        accent: false,
    },
];
const contributionFlow = [
    { status: 'Draft', tone: 'text-textSecondary', description: 'Crie e refine antes do envio.' },
    { status: 'Pending Review', tone: 'text-warning', description: 'Aguarde curadoria e feedback.' },
    { status: 'Approved', tone: 'text-success', description: 'A pergunta entra no sistema.' },
    { status: 'Rejected', tone: 'text-danger', description: 'Revise pontos indicados.' },
];
const metrics = [
    { label: 'Perguntas', value: '223', note: 'curadas', tone: 'text-success' },
    { label: 'Categorias', value: '34', note: 'ativas', tone: 'text-primary' },
    { label: 'Usuários', value: '5', note: 'ativos', tone: 'text-success' },
    { label: 'Quizzes', value: '82k', note: 'realizados', tone: 'text-success' },
    { label: 'XP distribuído', value: '4.8M', note: 'pontos', tone: 'text-warning' },
    { label: 'Contribuições', value: '2.4k', note: 'aprovadas', tone: 'text-success' },
];
function MarqueeSurface({ children, className = '', ...props }) {
    return (_jsx("div", { className: [
            'rounded-2xl border border-white/10 bg-[#14151C]/50',
            '[background:radial-gradient(circle_at_16%_50%,rgba(108,99,255,0.12),transparent_18rem),rgba(20,21,28,0.5)]',
            className,
        ].join(' '), ...props, children: children }));
}
export function Home() {
    return (_jsxs("div", { className: "min-h-screen bg-background text-textPrimary", children: [_jsxs("div", { className: "relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(91,107,255,0.2),transparent_26rem),radial-gradient(circle_at_80%_10%,rgba(125,92,255,0.14),transparent_30rem)]" }), _jsx("header", { className: "relative border-b border-white/6", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [_jsx("span", { className: "grid h-5 w-5 place-items-center rounded bg-primary text-[10px] font-black text-white", children: "P" }), _jsx("span", { className: "text-sm font-semibold tracking-tight", children: "QuizPro" })] }), _jsxs("nav", { className: "hidden items-center gap-6 text-[11px] font-medium text-textSecondary lg:flex", children: [_jsx("a", { href: "#dashboard", className: "transition hover:text-textPrimary", children: "Dashboard" }), _jsx("a", { href: "#quiz", className: "transition hover:text-textPrimary", children: "Quiz" }), _jsx("a", { href: "#arena", className: "transition hover:text-textPrimary", children: "Arena" }), _jsx("a", { href: "#contribuir", className: "transition hover:text-textPrimary", children: "Contribuir" }), _jsx("a", { href: "#metricas", className: "transition hover:text-textPrimary", children: "Mais" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/login", className: "hidden text-xs font-semibold text-textPrimary sm:inline-flex", children: "Entrar" }), _jsx(Link, { to: "/register", className: "inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-white shadow-[0_0_26px_rgba(91,107,255,0.45)] transition hover:bg-primaryHover", children: "Come\u00E7ar agora" })] })] }) }), _jsx("section", { className: "relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16", children: _jsxs("div", { className: "grid items-center gap-12 lg:grid-cols-[1.02fr_1fr]", children: [_jsxs("div", { children: [_jsx("div", { className: "inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-primary", children: "Plataforma para entrevistas t\u00E9cnicas" }), _jsxs("h1", { className: "mt-8 max-w-xl text-5xl font-extrabold leading-[0.94] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.4rem]", children: ["Aprenda.", _jsx("br", {}), "Compita.", _jsx("br", {}), _jsx("span", { className: "text-[#9c8cff]", children: "Evolua." })] }), _jsx("p", { className: "mt-6 max-w-lg text-sm leading-7 text-textSecondary sm:text-base", children: "Pratique com quizzes inteligentes, participe da Arena, suba no Ranking e evolua atrav\u00E9s de XP, revis\u00E3o e comunidade." }), _jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [_jsx(Link, { to: "/register", className: "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_0_34px_rgba(91,107,255,0.45)] transition hover:bg-primaryHover", children: "Come\u00E7ar agora" }), _jsx("a", { href: "#funcionalidades", className: "inline-flex h-11 items-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-textPrimary transition hover:border-white/20 hover:bg-white/[0.08]", children: "Explorar perguntas" })] }), _jsx(SectionDivider, { variant: "default", className: "mt-10" }), _jsx("div", { className: "grid gap-3 pt-6 sm:grid-cols-4", children: [
                                                { value: '12k+', label: 'perguntas' },
                                                { value: '48h', label: 'competições' },
                                                { value: '180+', label: 'desafios' },
                                                { value: '18k+', label: 'usuários' },
                                            ].map((item) => (_jsxs(MarqueeSurface, { className: "px-4 py-4", children: [_jsx("div", { className: "text-lg font-bold text-white", children: item.value }), _jsx("div", { className: "mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-textMuted", children: item.label })] }, item.label))) })] }), _jsxs("div", { className: "relative mx-auto w-full max-w-xl lg:max-w-none", children: [_jsx("div", { "aria-hidden": "true", className: "absolute -left-4 top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" }), _jsx("div", { "aria-hidden": "true", className: "absolute right-6 top-4 h-32 w-32 rounded-full bg-[#8e6dff]/20 blur-3xl" }), _jsxs(MarqueeSurface, { className: "relative rounded-[2rem] border-primary/40 p-3 shadow-[0_0_0_1px_rgba(116,94,255,0.08),0_30px_120px_rgba(31,20,84,0.55)]", children: [_jsx("div", { "aria-hidden": "true", className: "absolute inset-6 rounded-[1.5rem] border border-primary/25" }), _jsx("div", { className: "relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-[radial-gradient(circle_at_50%_0%,rgba(91,107,255,0.16),transparent_16rem),linear-gradient(180deg,#141625_0%,#0d0f18_100%)]", children: _jsx("img", { src: "/images/quiz-hero.png", alt: "Interface gamificada do quiz mostrando progresso, XP, perguntas e ranking", className: "block aspect-[4/3] w-full max-w-full rounded-[1.35rem] object-cover", loading: "eager", decoding: "async" }) })] })] })] }) })] }), _jsx(TechMarqueeSection, {}), _jsx(HomeSection, { id: "dashboard", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8", children: [_jsx(SectionHeading, { eyebrow: "Como funciona", title: "Um fluxo simples para estudar todos os dias", description: "Da escolha do tema at\u00E9 a an\u00E1lise de desempenho, cada etapa foi desenhada para tirar atrito da pr\u00E1tica." }), _jsx("div", { className: "mt-12 grid gap-4 lg:grid-cols-4", children: steps.map((step) => (_jsxs(MarqueeSurface, { className: "p-6", children: [_jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.22em] text-[#a38dff]", children: step.index }), _jsx("h3", { className: "mt-6 text-lg font-semibold text-white", children: step.title }), _jsx("p", { className: "mt-3 text-sm leading-6 text-textSecondary", children: step.description })] }, step.index))) })] }) }), _jsx(HomeSection, { id: "funcionalidades", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8", children: [_jsx(SectionHeading, { eyebrow: "Funcionalidades", title: "Tudo que transforma estudo em progresso", description: "Escolha um recurso para ver como ele ajuda a praticar, competir ou contribuir." }), _jsxs("div", { className: "mt-12 grid gap-4 lg:grid-cols-[1.08fr_1.25fr]", children: [_jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: features.map((feature) => (_jsxs(MarqueeSurface, { className: [
                                            'min-h-[190px] p-5 transition hover:-translate-y-0.5',
                                            feature.accent
                                                ? 'bg-[linear-gradient(180deg,rgba(80,50,168,0.3),rgba(34,25,59,0.52))] shadow-[inset_0_0_0_1px_rgba(126,99,255,0.18)]'
                                                : '',
                                        ].join(' '), children: [_jsx("div", { className: "text-[11px] font-semibold text-[#9f8fff]", children: feature.title }), _jsx("div", { className: "mt-1 text-xs font-medium text-textSecondary", children: feature.subtitle }), _jsx("p", { className: "mt-6 max-w-[18rem] text-sm leading-6 text-textSecondary", children: feature.description })] }, feature.title))) }), _jsxs(MarqueeSurface, { className: "p-7", children: [_jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.22em] text-[#9f8fff]", children: "Quiz inteligente" }), _jsx("h3", { className: "mt-4 max-w-lg text-2xl font-bold text-white", children: "Monte simula\u00E7\u00F5es r\u00E1pidas ou completas, receba feedback visual e transforme respostas em hist\u00F3rico mensur\u00E1vel." }), _jsx("p", { className: "mt-5 max-w-xl text-sm leading-7 text-textSecondary", children: "O mesmo design system conecta p\u00E1ginas, cards, tabelas e feedback para manter a experi\u00EAncia previs\u00EDvel e profissional." }), _jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: ['Filtros claros', 'Feedback direto', 'Sessões flexíveis'].map((chip) => (_jsx("span", { className: "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-textSecondary", children: chip }, chip))) }), _jsxs("div", { className: "mt-10 grid gap-4 sm:grid-cols-2", children: [_jsx(MetricPanel, { label: "Perguntas", value: "223", note: "aprovadas" }), _jsx(MetricPanel, { label: "Categorias", value: "34", note: "ativas" })] })] })] })] }) }), _jsx(HomeSection, { id: "arena", dividerVariant: "strong", children: _jsxs("div", { className: "mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.82fr_1fr] lg:px-8", children: [_jsx("div", { className: "flex flex-col justify-center", children: _jsx(SectionHeading, { eyebrow: "Arena e competi\u00E7\u00E3o", title: "Treine sob press\u00E3o e veja sua evolu\u00E7\u00E3o p\u00FAblica", description: "Desafios, rankings por categoria, sequ\u00EAncia de vit\u00F3rias e XP d\u00E3o ritmo ao aprendizado." }) }), _jsxs(MarqueeSurface, { className: "rounded-[1.75rem] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(ScoreBox, { label: "Voc\u00EA", value: "8" }), _jsx(ScoreBox, { label: "Rival", value: "6" })] }), _jsx("div", { className: "mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4", children: _jsx("div", { className: "flex h-24 items-end gap-3", children: [72, 54, 86, 63, 76].map((height, index) => (_jsx("div", { className: "flex-1 rounded-t-md bg-[linear-gradient(180deg,#6985ff,#5b6bff)]", style: { height: `${height}%` }, children: _jsxs("div", { className: "sr-only", children: ["Barra ", index + 1] }) }, height))) }) }), _jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-4", children: [_jsx(MetricPanel, { label: "Desafios", value: "100+", note: "ativos", compact: true }), _jsx(MetricPanel, { label: "Ranking global", value: "10k+", note: "online", compact: true }), _jsx(MetricPanel, { label: "Sequ\u00EAncia", value: "14", note: "vit\u00F3rias", compact: true }), _jsx(MetricPanel, { label: "XP", value: "120", note: "por race", compact: true })] })] })] }) }), _jsx(HomeSection, { id: "contribuir", children: _jsx("div", { className: "mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8", children: _jsxs("div", { className: "grid gap-10 lg:grid-cols-[0.82fr_1fr]", children: [_jsx("div", { children: _jsx(SectionHeading, { eyebrow: "Base colaborativa", title: "A comunidade ajuda o banco de perguntas a crescer", description: "Crie, envie para revis\u00E3o, receba aprova\u00E7\u00E3o e publique perguntas \u00FAteis para outros devs." }) }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: contributionFlow.map((item) => (_jsxs(MarqueeSurface, { className: "p-5", children: [_jsx("div", { className: `text-[11px] font-bold ${item.tone}`, children: item.status }), _jsx("p", { className: "mt-5 text-sm leading-6 text-textSecondary", children: item.description })] }, item.status))) })] }) }) }), _jsx(HomeSection, { id: "metricas", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8", children: [_jsx(SectionHeading, { eyebrow: "Estat\u00EDsticas", title: "M\u00E9tricas de produto que refor\u00E7am progresso", description: "" }), _jsx("div", { className: "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: metrics.map((metric) => (_jsxs(MarqueeSurface, { className: "p-5", children: [_jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.18em] text-textMuted", children: metric.label }), _jsx("div", { className: "mt-3 text-4xl font-bold text-white", children: metric.value }), _jsx("div", { className: `mt-1 text-xs font-semibold ${metric.tone}`, children: metric.note })] }, metric.label))) })] }) }), _jsx(HomeSection, { dividerVariant: "fade", children: _jsx(TestimonialsSection, {}) }), _jsx(HomeSection, { className: "bg-[radial-gradient(circle_at_30%_30%,rgba(41,133,91,0.18),transparent_24rem)]", children: _jsxs("div", { className: "mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8", children: [_jsxs("div", { className: "flex flex-col justify-center", children: [_jsxs("div", { className: "inline-flex w-fit items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-success", children: [_jsx(Users, { className: "h-3 w-3" }), "Junte-se \u00E0 comunidade de devs em evolu\u00E7\u00E3o"] }), _jsx(SectionHeading, { eyebrow: "Contato", title: "Quer transformar estudo t\u00E9cnico em progresso real?", description: "Envie uma mensagem para sugerir trilhas, parcerias, melhorias ou turmas de treino para sua equipe." })] }), _jsx(MarqueeSurface, { className: "rounded-[1.75rem] p-6", children: _jsxs("form", { className: "space-y-4", children: [_jsx(Field, { id: "contact-name", label: "Nome", children: _jsx(Input, { id: "contact-name", placeholder: "Eden Johnson" }) }), _jsx(Field, { id: "contact-email", label: "Email", children: _jsx(Input, { id: "contact-email", placeholder: "eden@example.com" }) }), _jsx(Field, { id: "contact-message", label: "Mensagem", children: _jsx("textarea", { id: "contact-message", className: "min-h-[120px] w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-primary", placeholder: "Escreva sua mensagem..." }) }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 pt-2", children: [_jsxs("p", { className: "text-[11px] text-textMuted", children: ["Ao enviar, voc\u00EA concorda com nossos ", _jsx("span", { className: "text-textPrimary", children: "Termos" }), " e ", _jsx("span", { className: "text-textPrimary", children: "Privacidade" }), "."] }), _jsx("button", { type: "button", className: "inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(91,107,255,0.42)] transition hover:bg-primaryHover", children: "Enviar" })] })] }) })] }) }), _jsx(HomeSection, { dividerVariant: "strong", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8", children: [_jsx(MarqueeSurface, { className: "rounded-[1.75rem] border-primary/20 px-8 py-10 shadow-[0_24px_80px_rgba(71,48,140,0.34)]", children: _jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.24em] text-[#b2a3ff]", children: "Comece agora" }), _jsx("h2", { className: "mt-3 max-w-xl text-4xl font-extrabold tracking-[-0.04em] text-white", children: "Pronto para evoluir como desenvolvedor?" }), _jsx("p", { className: "mt-3 text-sm leading-7 text-textSecondary", children: "Comece agora e transforme estudo em progresso mensur\u00E1vel." })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(Link, { to: "/register", className: "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(91,107,255,0.42)] transition hover:bg-primaryHover", children: "Come\u00E7ar agora" }), _jsx("a", { href: "#dashboard", className: "inline-flex h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.08]", children: "Explorar plataforma" })] })] }) }), _jsxs("footer", { className: "mt-16 pt-10", children: [_jsx(SectionDivider, { variant: "default", className: "mb-10" }), _jsxs("div", { className: "grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "grid h-5 w-5 place-items-center rounded bg-primary text-[10px] font-black text-white", children: "P" }), _jsx("span", { className: "text-sm font-semibold", children: "QuizPro" })] }), _jsx("p", { className: "mt-4 max-w-sm text-sm leading-6 text-textSecondary", children: "Treino inteligente para devs praticarem entrevistas, revisarem conceitos e acompanharem evolu\u00E7\u00E3o real." }), _jsx(SocialButtons, { className: "mt-6" })] }), _jsx(FooterColumn, { title: "Plataforma", links: ['Quiz', 'Arena', 'Ranking', 'Contribuir'] }), _jsx(FooterColumn, { title: "Empresa", links: ['Sobre', 'Termos', 'Privacidade', 'Github'] })] }), _jsx(SectionDivider, { variant: "default", className: "mt-10" }), _jsxs("div", { className: "flex flex-col gap-4 pt-6 text-xs text-textMuted sm:flex-row sm:items-center sm:justify-between", children: [_jsx("span", { children: "\u00A9 2026 QuizPro. Todos os direitos reservados." }), _jsxs("div", { className: "flex gap-4", children: [_jsx("span", { children: "Privacidade" }), _jsx("span", { children: "Termos" }), _jsx("span", { children: "Cookies" })] })] })] })] }) })] }));
}
export function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [socialMessage, setSocialMessage] = useState(null);
    const redirectTo = typeof location.state === 'object' && location.state && 'redirectTo' in location.state
        ? String(location.state.redirectTo)
        : '/dashboard';
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: 'student@codequest.dev', password: 'User12345!' },
    });
    const githubAuthUrl = import.meta.env.VITE_AUTH_GITHUB_URL;
    const socialProviders = [
        {
            type: 'github',
            label: 'Continuar com GitHub',
            icon: _jsx(GithubIcon, {}),
            ...(githubAuthUrl
                ? { href: githubAuthUrl }
                : { onClick: () => setSocialMessage('Login com GitHub ainda nao esta configurado.') }),
        },
        {
            type: 'discord',
            label: 'Continuar com Discord',
            icon: _jsx(DiscordIcon, {}),
            onClick: () => setSocialMessage('Login com Discord ainda nao esta configurado.'),
        },
    ];
    return (_jsx(AuthCard, { eyebrow: "Halo Dark Auth", title: "Login", subtitle: "Acesse sua conta para continuar treinando, revisar quest\u00F5es e acompanhar seu progresso.", footer: _jsxs("p", { className: "text-sm text-textSecondary", children: ["N\u00E3o tem conta?", ' ', _jsx(Link, { to: "/register", className: "font-semibold text-textPrimary hover:text-primary", children: "Criar conta" })] }), children: _jsxs("form", { className: "space-y-4", onSubmit: form.handleSubmit(async (values) => {
                try {
                    setSocialMessage(null);
                    await login(values.email, values.password);
                    navigate(redirectTo, { replace: true });
                }
                catch (error) {
                    form.setError('root', { message: getErrorMessage(error) });
                }
            }), children: [_jsx(Field, { id: "email", label: "Email", error: form.formState.errors.email?.message, children: _jsx(Input, { id: "email", type: "email", placeholder: "voce@exemplo.com", "aria-invalid": form.formState.errors.email ? 'true' : 'false', "aria-describedby": form.formState.errors.email ? 'email-error' : undefined, ...form.register('email') }) }), _jsx(Field, { id: "password", label: "Senha", error: form.formState.errors.password?.message, children: _jsx(Input, { id: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", "aria-invalid": form.formState.errors.password ? 'true' : 'false', "aria-describedby": form.formState.errors.password ? 'password-error' : undefined, ...form.register('password') }) }), _jsx("div", { className: "flex justify-end", children: _jsx(Link, { to: "/forgot-password", className: "text-sm font-medium text-textSecondary hover:text-textPrimary", children: "Esqueci minha senha" }) }), form.formState.errors.root?.message ? (_jsx(InlineError, { message: form.formState.errors.root.message })) : null, socialMessage ? _jsx(InlineError, { tone: "info", message: socialMessage }) : null, _jsx(Button, { className: "w-full", type: "submit", loading: form.formState.isSubmitting, loadingText: "Entrando...", children: "Entrar" }), _jsx(Divider, { label: "Login com redes sociais" }), _jsx(SocialButtons, { buttons: socialProviders, className: "justify-center" })] }) }));
}
export function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [socialMessage, setSocialMessage] = useState(null);
    const form = useForm({ resolver: zodResolver(registerSchema) });
    const githubAuthUrl = import.meta.env.VITE_AUTH_GITHUB_URL;
    const socialProviders = [
        {
            type: 'github',
            label: 'Criar conta com GitHub',
            icon: _jsx(GithubIcon, {}),
            ...(githubAuthUrl
                ? { href: githubAuthUrl }
                : { onClick: () => setSocialMessage('Cadastro com GitHub ainda nao esta configurado.') }),
        },
        {
            type: 'discord',
            label: 'Criar conta com Discord',
            icon: _jsx(DiscordIcon, {}),
            onClick: () => setSocialMessage('Cadastro com Discord ainda nao esta configurado.'),
        },
    ];
    return (_jsx(AuthCard, { eyebrow: "Halo Dark Auth", title: "Criar conta", subtitle: "Abra sua conta para acessar quizzes, ranking, arena e fluxo de contribui\u00E7\u00F5es.", footer: _jsxs("p", { className: "text-sm text-textSecondary", children: ["J\u00E1 tem conta?", ' ', _jsx(Link, { to: "/login", className: "font-semibold text-textPrimary hover:text-primary", children: "Entrar" })] }), children: _jsxs("form", { className: "space-y-4", onSubmit: form.handleSubmit(async (values) => {
                try {
                    await register(values.name, values.email, values.password);
                    navigate('/dashboard');
                }
                catch (error) {
                    form.setError('root', { message: getErrorMessage(error) });
                }
            }), children: [_jsx(Field, { id: "name", label: "Nome", error: form.formState.errors.name?.message, children: _jsx(Input, { id: "name", placeholder: "Seu nome", "aria-invalid": form.formState.errors.name ? 'true' : 'false', ...form.register('name') }) }), _jsx(Field, { id: "register-email", label: "Email", error: form.formState.errors.email?.message, children: _jsx(Input, { id: "register-email", type: "email", placeholder: "voce@exemplo.com", "aria-invalid": form.formState.errors.email ? 'true' : 'false', ...form.register('email') }) }), _jsx(Field, { id: "register-password", label: "Senha", error: form.formState.errors.password?.message, children: _jsx(Input, { id: "register-password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", "aria-invalid": form.formState.errors.password ? 'true' : 'false', ...form.register('password') }) }), form.formState.errors.root?.message ? (_jsx(InlineError, { message: form.formState.errors.root.message })) : null, socialMessage ? _jsx(InlineError, { tone: "info", message: socialMessage }) : null, _jsx(Button, { className: "w-full", type: "submit", loading: form.formState.isSubmitting, loadingText: "Criando conta...", children: "Criar conta" }), _jsx(Divider, { label: "Cadastro com redes sociais" }), _jsx(SocialButtons, { buttons: socialProviders, className: "justify-center" })] }) }));
}
export function ForgotPassword() {
    return (_jsx(AuthCard, { eyebrow: "Password Recovery", title: "Recupera\u00E7\u00E3o de senha", subtitle: "O fluxo de reset ainda n\u00E3o foi configurado no backend. Quando o endpoint existir, esta rota pode receber o formul\u00E1rio real.", footer: _jsxs(Link, { to: "/login", className: "inline-flex items-center gap-2 text-sm font-medium text-textSecondary hover:text-textPrimary", children: [_jsx(ArrowLeft, { size: 16 }), "Voltar para login"] }), children: _jsx(InlineError, { tone: "info", message: "O endpoint de recupera\u00E7\u00E3o ainda n\u00E3o est\u00E1 dispon\u00EDvel neste ambiente." }) }));
}
function AuthCard({ eyebrow, title, subtitle, footer, children, }) {
    return (_jsxs("div", { className: "relative grid min-h-screen place-items-center overflow-hidden bg-[#0A0B0F] px-4 py-8 text-[#F2F4F8]", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,107,255,0.22),transparent_24rem),radial-gradient(circle_at_bottom,rgba(30,32,41,0.7),transparent_28rem)]" }), _jsx("div", { className: "absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px]" }), _jsxs(Card, { className: "relative w-full max-w-[420px] border-[#2A2D38] bg-[rgba(20,21,28,0.9)] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.42)] sm:p-8", children: [_jsxs("div", { className: "mb-8 flex items-center justify-between gap-4", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [_jsx("span", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-[#5B6BFF] text-sm font-black text-white shadow-[0_0_24px_rgba(91,107,255,0.42)]", children: "CQ" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold tracking-tight text-[#F2F4F8]", children: "CodeQuest" }), _jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.18em] text-[#5C6170]", children: eyebrow })] })] }), _jsx(BadgeChip, { children: "Halo Dark" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-extrabold tracking-[-0.04em] text-[#F2F4F8]", children: title }), _jsx("p", { className: "mt-3 text-sm leading-6 text-[#9AA0AE]", children: subtitle })] }), children, footer ? _jsx("div", { className: "mt-6 border-t border-white/8 pt-5", children: footer }) : null] })] }));
}
function SectionHeading({ eyebrow, title, description, centered = false, }) {
    return (_jsxs("div", { className: centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl', children: [_jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.26em] text-[#7f86a2]", children: eyebrow }), _jsx("h2", { className: "mt-4 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-[2.6rem]", children: title }), description ? _jsx("p", { className: "mt-4 text-sm leading-7 text-textSecondary", children: description }) : null] }));
}
function MetricPanel({ label, value, note, compact = false, }) {
    return (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/[0.03] p-4", children: [_jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.2em] text-textMuted", children: label }), _jsx("div", { className: compact ? 'mt-3 text-3xl font-bold text-white' : 'mt-4 text-[3rem] font-bold leading-none text-white', children: value }), _jsx("div", { className: "mt-1 text-xs font-semibold text-success", children: note })] }));
}
function ScoreBox({ label, value }) {
    return (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-background/70 p-4", children: [_jsx("div", { className: "text-xs text-textSecondary", children: label }), _jsx("div", { className: "mt-2 text-5xl font-black leading-none text-white", children: value })] }));
}
function Field({ id, label, error, children, }) {
    return (_jsxs("label", { htmlFor: id, className: "block", children: [_jsx("div", { className: "mb-2 text-xs font-semibold text-textPrimary", children: label }), children, error ? (_jsx("p", { id: `${id}-error`, className: "mt-2 text-sm text-danger", children: error })) : null] }));
}
function Divider({ label }) {
    return (_jsxs("div", { className: "flex items-center gap-3 py-2", children: [_jsx("div", { className: "h-px flex-1 bg-white/8" }), _jsx("span", { className: "text-xs uppercase tracking-[0.18em] text-textMuted", children: label }), _jsx("div", { className: "h-px flex-1 bg-white/8" })] }));
}
function InlineError({ message, tone = 'danger' }) {
    const toneClass = tone === 'danger' ? 'border-danger/25 bg-danger/10 text-danger' : 'border-primary/25 bg-primary/10 text-[#B9C3FF]';
    return (_jsxs("div", { className: `flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${toneClass}`, children: [_jsx(AlertCircle, { size: 16, className: "mt-0.5 shrink-0" }), _jsx("span", { children: message })] }));
}
function BadgeChip({ children }) {
    return (_jsx("span", { className: "inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9AA0AE]", children: children }));
}
function FooterColumn({ title, links }) {
    return (_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-white", children: title }), _jsx("div", { className: "mt-4 space-y-3 text-sm text-textSecondary", children: links.map((link) => (_jsx("div", { children: link }, link))) })] }));
}
