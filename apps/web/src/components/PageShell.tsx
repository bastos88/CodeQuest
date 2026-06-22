import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpenCheck,
  Bot,
  Crown,
  Flame,
  LayoutDashboard,
  LogOut,
  Medal,
  ShieldCheck,
  Swords,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quiz', label: 'Quiz', icon: BookOpenCheck },
  { to: '/arena', label: 'Arena', icon: Swords },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
  { to: '/profile', label: 'Perfil', icon: Medal },
  { to: '/contribute', label: 'Contribuir', icon: Bot },
  {
    to: '/admin',
    label: 'Admin',
    icon: ShieldCheck,
    roles: ['ADMIN', 'REVIEWER'] as const,
  },
];

export function PageShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const pageLabel = location.pathname.slice(1) || 'dashboard';
  const visibleNavItems = navItems.filter(
    (item) =>
      !('roles' in item) ||
      item.roles.includes((user?.role ?? 'USER') as 'ADMIN' | 'REVIEWER'),
  );

  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/6 bg-[linear-gradient(180deg,rgba(10,11,15,0.98),rgba(15,16,23,0.94))] px-5 py-6 backdrop-blur-xl xl:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(108,99,255,0.18),transparent_15rem)]" />
        <div className="relative mb-8 px-2">
          <BrandLogo />
        </div>
        <div className="relative mb-6 rounded-3xl border border-white/8 bg-white/[0.03] p-4 shadow-glass">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-textMuted">
            Perfil ativo
          </p>
          <div className="mt-3 flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-sm font-bold text-primary">
                {getInitials(user?.name ?? 'CodeQuest')}
              </span>
            )}
            <p className="min-w-0 truncate text-lg font-bold text-textPrimary">
              {user?.name ?? 'Dev trainee'}
            </p>
          </div>
          <p className="mt-2 text-sm text-textSecondary">
            {user?.role ?? 'USER'}
          </p>
          <div className="mt-4 flex gap-2">
            <Badge tone="warning">{user?.xp ?? 0} XP</Badge>
            <Badge tone="info">{user?.rating ?? 0} rating</Badge>
          </div>
        </div>
        <nav className="relative space-y-1.5">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition duration-150 ease-premium ${
                  isActive
                    ? 'border border-primary/20 bg-[linear-gradient(180deg,rgba(108,99,255,0.18),rgba(168,85,247,0.12))] text-textPrimary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'border border-transparent text-textSecondary hover:-translate-y-0.5 hover:border-white/6 hover:bg-white/[0.04] hover:text-textPrimary'
                }`
              }
            >
              <item.icon size={17} /> {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-10 border-b border-white/6 bg-[rgba(10,11,15,0.72)] backdrop-blur-xl xl:ml-72">
        <div className="page-shell flex h-20 items-center justify-between py-0">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-textMuted">
              {pageLabel}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-textPrimary">
              CodeQuest
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-textSecondary sm:flex">
              <Flame size={16} className="text-warning" />
              <span>{user?.xp ?? 0} XP</span>
            </div>
            <div className="hidden items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-textSecondary sm:flex">
              <Crown size={16} className="text-primary" />
              <span>{user?.rating ?? 0} rating</span>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              aria-label="Sair"
              className="h-11 w-11 rounded-2xl px-0"
            >
              <LogOut size={17} />
            </Button>
          </div>
        </div>
      </header>
      <main className="xl:ml-72">
        <div className="page-shell">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
