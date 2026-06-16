import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpenCheck, Bot, Crown, Flame, LayoutDashboard, LogOut, Medal, ShieldCheck, Swords, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/quiz', label: 'Quiz', icon: BookOpenCheck },
    { to: '/arena', label: 'Arena', icon: Swords },
    { to: '/ranking', label: 'Ranking', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: Medal },
    { to: '/contribute', label: 'Contribute', icon: Bot },
    { to: '/admin', label: 'Admin', icon: ShieldCheck, roles: ['ADMIN', 'REVIEWER'] },
];
export function PageShell() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const pageLabel = location.pathname.slice(1) || 'dashboard';
    const visibleNavItems = navItems.filter((item) => !('roles' in item) || item.roles.includes((user?.role ?? 'USER')));
    return (_jsxs("div", { className: "min-h-screen bg-background text-textPrimary", children: [_jsxs("aside", { className: "fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/6 bg-[linear-gradient(180deg,rgba(10,11,15,0.98),rgba(15,16,23,0.94))] px-5 py-6 backdrop-blur-xl xl:block", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(108,99,255,0.18),transparent_15rem)]" }), _jsx("div", { className: "relative mb-8 px-2", children: _jsx(BrandLogo, { imageClassName: "h-10 w-36" }) }), _jsxs("div", { className: "relative mb-6 rounded-3xl border border-white/8 bg-white/[0.03] p-4 shadow-glass", children: [_jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.18em] text-textMuted", children: "Perfil ativo" }), _jsx("p", { className: "mt-3 text-lg font-bold text-textPrimary", children: user?.name ?? 'Dev trainee' }), _jsx("p", { className: "mt-1 text-sm text-textSecondary", children: user?.role ?? 'USER' }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsxs(Badge, { tone: "warning", children: [user?.xp ?? 640, " XP"] }), _jsxs(Badge, { tone: "info", children: [user?.rating ?? 1020, " rating"] })] })] }), _jsx("nav", { className: "relative space-y-1.5", children: visibleNavItems.map((item) => (_jsxs(NavLink, { to: item.to, className: ({ isActive }) => `flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition duration-150 ease-premium ${isActive
                                ? 'border border-primary/20 bg-[linear-gradient(180deg,rgba(108,99,255,0.18),rgba(168,85,247,0.12))] text-textPrimary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                                : 'border border-transparent text-textSecondary hover:-translate-y-0.5 hover:border-white/6 hover:bg-white/[0.04] hover:text-textPrimary'}`, children: [_jsx(item.icon, { size: 17 }), item.label] }, item.to))) }), _jsxs("div", { className: "relative mt-8 rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(20,21,28,0.88),rgba(16,18,25,0.8))] p-4", children: [_jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.18em] text-textMuted", children: "Miss\u00E3o do dia" }), _jsx("p", { className: "mt-3 text-sm font-semibold text-textPrimary", children: "Responder 10 perguntas de React sem perder a sequ\u00EAncia." })] })] }), _jsx("header", { className: "sticky top-0 z-10 border-b border-white/6 bg-[rgba(10,11,15,0.72)] backdrop-blur-xl xl:ml-72", children: _jsxs("div", { className: "page-shell flex h-20 items-center justify-between py-0", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.22em] text-textMuted", children: pageLabel }), _jsx("h1", { className: "mt-2 text-2xl font-extrabold tracking-[-0.03em] text-textPrimary", children: "CodeQuest" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "hidden items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-textSecondary sm:flex", children: [_jsx(Flame, { size: 16, className: "text-warning" }), _jsxs("span", { children: [user?.xp ?? 640, " XP"] })] }), _jsxs("div", { className: "hidden items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-textSecondary sm:flex", children: [_jsx(Crown, { size: 16, className: "text-primary" }), _jsxs("span", { children: [user?.rating ?? 1020, " rating"] })] }), _jsx(Button, { variant: "ghost", onClick: logout, "aria-label": "Sair", className: "h-11 w-11 rounded-2xl px-0", children: _jsx(LogOut, { size: 17 }) })] })] }) }), _jsx("main", { className: "xl:ml-72", children: _jsx("div", { className: "page-shell", children: _jsx(Outlet, {}) }) })] }));
}
