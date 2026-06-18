import { useQuery } from '@tanstack/react-query';
import {
  Award,
  BarChart3,
  ChevronRight,
  Crown,
  Flame,
  Medal,
  Sparkles,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

type HomeRankingPlayer = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  accuracy: number;
  quizzesCompleted: number;
  position: number;
};

type RankStyle = {
  Icon: LucideIcon;
  badgeClass: string;
  cardClass: string;
  avatarClass: string;
  metricClass: string;
  label: string;
};

function formatXP(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function getInitial(name: string | null) {
  return name?.trim().charAt(0).toUpperCase() || '?';
}

function getRankStyle(position: number): RankStyle {
  if (position === 1) {
    return {
      Icon: Crown,
      badgeClass:
        'border-amber-400/30 bg-amber-500/15 text-amber-200 shadow-amber-500/10',
      cardClass:
        'border-amber-400/25 bg-amber-500/[0.07] shadow-[0_18px_50px_rgba(245,158,11,0.1)]',
      avatarClass: 'from-amber-300 to-orange-500',
      metricClass: 'border-amber-400/20 bg-amber-500/10 text-amber-100',
      label: 'Líder',
    };
  }

  if (position === 2) {
    return {
      Icon: Medal,
      badgeClass:
        'border-indigo-400/30 bg-indigo-500/15 text-indigo-200 shadow-indigo-500/10',
      cardClass:
        'border-indigo-400/20 bg-indigo-500/[0.05] shadow-[0_16px_42px_rgba(99,102,241,0.08)]',
      avatarClass: 'from-indigo-300 to-blue-500',
      metricClass: 'border-indigo-400/20 bg-indigo-500/10 text-indigo-100',
      label: 'Top 2',
    };
  }

  if (position === 3) {
    return {
      Icon: Award,
      badgeClass:
        'border-violet-400/30 bg-violet-500/15 text-violet-200 shadow-violet-500/10',
      cardClass:
        'border-violet-400/20 bg-violet-500/[0.05] shadow-[0_16px_42px_rgba(124,58,237,0.08)]',
      avatarClass: 'from-violet-300 to-fuchsia-500',
      metricClass: 'border-violet-400/20 bg-violet-500/10 text-violet-100',
      label: 'Top 3',
    };
  }

  return {
    Icon: Sparkles,
    badgeClass:
      'border-cyan-400/20 bg-cyan-500/10 text-cyan-200 shadow-cyan-500/10',
    cardClass: 'border-white/10 bg-white/[0.03] hover:border-cyan-400/25',
    avatarClass: 'from-cyan-300 to-[#5B6BFF]',
    metricClass: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100',
    label: 'Elite',
  };
}

export function HomeRankingSection() {
  const rankingQuery = useQuery({
    queryKey: ['home-ranking-preview'],
    queryFn: async () => {
      const { data } = await api.get<HomeRankingPlayer[]>('/public/ranking', {
        params: { limit: 5 },
      });
      return data.slice(0, 5);
    },
    staleTime: 60_000,
    retry: 1,
  });

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_18%_0%,rgba(91,107,255,0.22),transparent_25rem),radial-gradient(circle_at_90%_18%,rgba(124,58,237,0.18),transparent_22rem),linear-gradient(135deg,#14151C_0%,#101119_52%,#0A0B0F_100%)] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.38)] sm:p-6 lg:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-200">
            <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
            Ranking
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
            Ranking do Quiz
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-textSecondary">
            Os jogadores que mais evoluíram no CodeQuest.
          </p>
        </div>
        <Link
          to="/ranking"
          className="group/link inline-flex h-11 w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-indigo-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75"
        >
          Ver ranking completo
          <ChevronRight
            className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="relative mt-8">
        {rankingQuery.isLoading ? (
          <RankingSkeleton />
        ) : rankingQuery.isError ? (
          <RankingState
            message="Não foi possível carregar o ranking agora."
            tone="danger"
          />
        ) : !rankingQuery.data || rankingQuery.data.length === 0 ? (
          <RankingEmptyState />
        ) : (
          <ol className="grid gap-3">
            {rankingQuery.data.map((player) => (
              <RankingPreviewItem key={player.id} player={player} />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function RankingSkeleton() {
  return (
    <div className="space-y-3" aria-label="Carregando ranking">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="h-[86px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

function RankingState({
  message,
  tone = 'default',
}: {
  message: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <div
      className={[
        'rounded-2xl border px-5 py-6 text-sm',
        tone === 'danger'
          ? 'border-red-400/20 bg-red-500/10 text-red-200'
          : 'border-white/10 bg-white/[0.03] text-textSecondary',
      ].join(' ')}
    >
      {message}
    </div>
  );
}

function RankingEmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
      <Trophy className="mx-auto h-8 w-8 text-indigo-300" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-white">
        O ranking ainda está sendo formado
      </h3>
      <p className="mt-1 text-sm text-textSecondary">
        Complete quizzes para aparecer entre os melhores jogadores.
      </p>
    </div>
  );
}

function RankingPreviewItem({ player }: { player: HomeRankingPlayer }) {
  const name = player.name?.trim() || 'Jogador';
  const rank = getRankStyle(player.position);
  const { Icon } = rank;

  return (
    <li
      className={[
        'group grid gap-4 rounded-2xl border px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center',
        rank.cardClass,
      ].join(' ')}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={[
            'inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-2xl border px-2 font-mono text-sm font-extrabold shadow-lg',
            rank.badgeClass,
          ].join(' ')}
        >
          <Icon
            className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          />
          {player.position}º
        </div>

        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt={`Avatar de ${name}`}
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/10"
            loading="lazy"
          />
        ) : (
          <div
            className={[
              'grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-extrabold text-white ring-2 ring-white/10',
              rank.avatarClass,
            ].join(' ')}
          >
            {getInitial(name)}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="truncate text-base font-bold text-white">{name}</p>
          <span
            className={[
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
              rank.badgeClass,
            ].join(' ')}
          >
            <Flame className="h-3 w-3" aria-hidden="true" />
            {rank.label}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-textSecondary">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
            {formatXP(player.xp)} XP
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles
              className="h-3.5 w-3.5 text-orange-300"
              aria-hidden="true"
            />
            Nível {player.level}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BarChart3
              className="h-3.5 w-3.5 text-cyan-300"
              aria-hidden="true"
            />
            {player.quizzesCompleted} quizzes
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <span
          className={[
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-bold',
            rank.metricClass,
          ].join(' ')}
        >
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          {formatXP(player.xp)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-200">
          <Target className="h-3.5 w-3.5" aria-hidden="true" />
          {player.accuracy}% acerto
        </span>
      </div>
    </li>
  );
}
