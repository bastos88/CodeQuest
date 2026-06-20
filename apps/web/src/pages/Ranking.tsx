import { useQuery } from '@tanstack/react-query';
import {
  Award,
  Crown,
  Medal,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { api } from '../lib/api';

type RankingPlayer = {
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
  iconClass: string;
  label: string;
};

function formatXP(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function getPlayerName(player: RankingPlayer) {
  return player.name?.trim() || 'Jogador';
}

function getRankStyle(position: number): RankStyle {
  if (position === 1) {
    return {
      Icon: Crown,
      badgeClass: 'border-warning/25 bg-warning/10 text-warning',
      cardClass:
        'border-primary/20 bg-[linear-gradient(180deg,rgba(108,99,255,0.14),rgba(20,21,28,0.92))]',
      iconClass: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
      label: 'Líder',
    };
  }

  if (position === 2) {
    return {
      Icon: Medal,
      badgeClass: 'border-info/25 bg-info/10 text-info',
      cardClass: '',
      iconClass: 'border-indigo-400/20 bg-indigo-500/10 text-indigo-300',
      label: 'Top 2',
    };
  }

  if (position === 3) {
    return {
      Icon: Medal,
      badgeClass: 'border-info/25 bg-info/10 text-info',
      cardClass: '',
      iconClass: 'border-violet-400/20 bg-violet-500/10 text-violet-300',
      label: 'Top 3',
    };
  }

  return {
    Icon: Award,
    badgeClass: 'border-white/10 bg-white/[0.05] text-textSecondary',
    cardClass: '',
    iconClass: 'border-white/10 bg-white/[0.04] text-slate-400',
    label: 'Competidor',
  };
}

export function Ranking() {
  const rankingQuery = useQuery({
    queryKey: ['ranking-page', 10],
    queryFn: async () => {
      const { data } = await api.get<RankingPlayer[]>('/public/ranking', {
        params: { limit: 10 },
      });

      return data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const ranking = rankingQuery.data ?? [];
  const podium = ranking.slice(0, 3);

  return (
    <div className="page-shell">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex max-w-2xl items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
              <Trophy className="h-6 w-6" aria-hidden="true" />
            </div>

            <div>
              <p className="section-kicker">leaderboard.system</p>

              <h2 className="mt-3 section-title">Ranking Top 10</h2>

              <p className="mt-3 text-base text-textSecondary">
                Ordenação geral por XP, precisão, consistência e quizzes
                concluídos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-warning/25 bg-warning/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
              Geral
            </span>

            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
              Arena
            </span>

            <span className="inline-flex items-center rounded-full border border-info/25 bg-info/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-info">
              Contribuidores
            </span>
          </div>
        </div>

        {rankingQuery.isLoading ? (
          <RankingState message="Carregando ranking..." />
        ) : rankingQuery.isError ? (
          <RankingState message="Não foi possível carregar o ranking." tone="danger" />
        ) : ranking.length === 0 ? (
          <RankingState message="Nenhum jogador no ranking ainda." />
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              {podium.map((player) => (
                <PodiumCard key={player.id} player={player} />
              ))}
            </div>

            <div className="surface-panel overflow-hidden rounded-3xl text-textPrimary transition duration-150 ease-premium hover:-translate-y-0.5 hover:border-white/10 hover:shadow-glass">
              <div className="grid grid-cols-[78px_minmax(0,1fr)_140px] border-b border-white/6 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-textMuted">
                <span>Rank</span>
                <span>Usuário</span>
                <span className="text-right">XP</span>
              </div>

              {ranking.map((player) => (
                <RankingRow key={player.id} player={player} />
              ))}
            </div>
          </>
        )}

        <div className="surface-panel rounded-3xl p-6 text-textPrimary transition duration-150 ease-premium hover:-translate-y-0.5 hover:border-white/10 hover:shadow-glass">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <h3 className="text-lg font-bold tracking-[-0.03em] text-textPrimary">
                Ranking da temporada
              </h3>

              <p className="mt-2 text-sm text-textSecondary">
                Temporada Junho 2026 com medalhas próprias, bônus de
                consistência e vitrine pública de performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ player }: { player: RankingPlayer }) {
  const rank = getRankStyle(player.position);
  const { Icon } = rank;
  const name = getPlayerName(player);

  return (
    <div
      className={[
        'surface-panel rounded-3xl p-6 text-textPrimary transition duration-150 ease-premium hover:-translate-y-0.5 hover:border-white/10 hover:shadow-glass',
        rank.cardClass,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={[
            'inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]',
            rank.badgeClass,
          ].join(' ')}
        >
          #{String(player.position).padStart(2, '0')}
        </span>

        <span className="inline-flex items-center gap-1.5 font-mono text-sm text-textSecondary">
          <Zap className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
          {formatXP(player.xp)} XP
        </span>
      </div>

      <div className="mt-6">
        <div
          className={[
            'grid h-10 w-10 shrink-0 place-items-center rounded-2xl border',
            rank.iconClass,
          ].join(' ')}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <h3 className="mt-6 truncate text-2xl font-extrabold tracking-[-0.04em] text-textPrimary">
        {name}
      </h3>

      <p className="mt-2 flex items-center gap-1.5 text-sm text-textSecondary">
        <Target className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
        Nível {player.level} · {player.accuracy}% acerto
      </p>
    </div>
  );
}

function RankingRow({ player }: { player: RankingPlayer }) {
  const rank = getRankStyle(player.position);
  const { Icon } = rank;
  const name = getPlayerName(player);

  return (
    <div className="grid grid-cols-[78px_minmax(0,1fr)_140px] items-center border-b border-white/6 px-5 py-4 last:border-b-0 hover:bg-white/[0.03]">
      <span className="flex items-center gap-2 font-mono text-sm text-textSecondary">
        {player.position <= 3 ? (
          <Trophy
            className={[
              'h-4 w-4',
              player.position === 1
                ? 'text-warning'
                : player.position === 2
                  ? 'text-info'
                  : 'text-accent',
            ].join(' ')}
            aria-hidden="true"
          />
        ) : null}
        {player.position}
      </span>

      <div className="flex min-w-0 items-center gap-3">
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt={`Avatar de ${name}`}
            className="h-10 w-10 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
            loading="lazy"
          />
        ) : (
          <div
            className={[
              'grid h-10 w-10 shrink-0 place-items-center rounded-2xl border',
              rank.iconClass,
            ].join(' ')}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-textPrimary">
            {name}
          </p>

          <p className="truncate text-sm text-textMuted">
            Nível {player.level} · {player.quizzesCompleted} quizzes ·{' '}
            {player.accuracy}% acerto
          </p>
        </div>
      </div>

      <span className="inline-flex items-center justify-end gap-1.5 text-right font-mono text-sm text-textPrimary">
        <Zap className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
        {formatXP(player.xp)}
      </span>
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
        'surface-panel rounded-3xl p-6 text-sm',
        tone === 'danger' ? 'text-red-300' : 'text-textSecondary',
      ].join(' ')}
    >
      {message}
    </div>
  );
}
