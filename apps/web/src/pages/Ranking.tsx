import {
  Award,
  Crown,
  Medal,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { IconBadge } from '../components/ui/IconBadge';
import { ranking } from '../lib/mockData';

export function Ranking() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex max-w-2xl items-start gap-4">
          <IconBadge icon={Trophy} variant="amber" size="lg" />
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
          <Badge tone="warning">Geral</Badge>
          <Badge>Arena</Badge>
          <Badge tone="info">Contribuidores</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RankingHero
          rank="01"
          name={ranking[0]?.[0] ?? 'Player One'}
          title={ranking[0]?.[1] ?? 'Senior Developer'}
          xp={ranking[0]?.[2] ?? 0}
        />
        <RankingHero
          rank="02"
          name={ranking[1]?.[0] ?? 'Player Two'}
          title={ranking[1]?.[1] ?? 'Frontend Lead'}
          xp={ranking[1]?.[2] ?? 0}
          subtle
        />
        <RankingHero
          rank="03"
          name={ranking[2]?.[0] ?? 'Player Three'}
          title={ranking[2]?.[1] ?? 'Platform Engineer'}
          xp={ranking[2]?.[2] ?? 0}
          subtle
        />
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[78px_minmax(0,1fr)_140px] border-b border-white/6 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-textMuted">
          <span>Rank</span>
          <span>Usuário</span>
          <span className="text-right">XP</span>
        </div>
        {ranking.map(([name, title, xp], index) => (
          <div
            key={name}
            className="grid grid-cols-[78px_minmax(0,1fr)_140px] items-center border-b border-white/6 px-5 py-4 last:border-b-0 hover:bg-white/[0.03]"
          >
            <span className="flex items-center gap-2 font-mono text-sm text-textSecondary">
              {index < 3 ? (
                <Trophy
                  size={16}
                  className={
                    index === 0
                      ? 'text-warning'
                      : index === 1
                        ? 'text-info'
                        : 'text-accent'
                  }
                />
              ) : null}
              {index + 1}
            </span>
            <div className="flex min-w-0 items-center gap-3">
              <IconBadge
                icon={index === 0 ? Crown : index < 3 ? Medal : Award}
                variant={
                  index === 0
                    ? 'amber'
                    : index === 1
                      ? 'indigo'
                      : index === 2
                        ? 'violet'
                        : 'slate'
                }
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-textPrimary">
                  {name}
                </p>
                <p className="truncate text-sm text-textMuted">{title}</p>
              </div>
            </div>
            <span className="inline-flex items-center justify-end gap-1.5 text-right font-mono text-sm text-textPrimary">
              <Zap size={14} className="text-indigo-300" aria-hidden="true" />
              {xp.toLocaleString('pt-BR')}
            </span>
          </div>
        ))}
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <IconBadge icon={TrendingUp} variant="indigo" size="md" />
          <div>
            <h3 className="text-lg font-bold tracking-[-0.03em] text-textPrimary">
              Ranking da temporada
            </h3>
            <p className="mt-2 text-sm text-textSecondary">
              Temporada Junho 2026 com medalhas próprias, bônus de consistência
              e vitrine pública de performance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function RankingHero({
  rank,
  name,
  title,
  xp,
  subtle = false,
}: {
  rank: string;
  name: string;
  title: string;
  xp: number;
  subtle?: boolean;
}) {
  return (
    <Card
      className={
        subtle
          ? 'p-6'
          : 'border-primary/20 bg-[linear-gradient(180deg,rgba(108,99,255,0.14),rgba(20,21,28,0.92))] p-6'
      }
    >
      <div className="flex items-start justify-between gap-3">
        <Badge tone={subtle ? 'info' : 'warning'}>#{rank}</Badge>
        <span className="inline-flex items-center gap-1.5 font-mono text-sm text-textSecondary">
          <Zap size={14} className="text-indigo-300" aria-hidden="true" />
          {xp.toLocaleString('pt-BR')} XP
        </span>
      </div>
      <div className="mt-6">
        <IconBadge
          icon={subtle ? Medal : Crown}
          variant={subtle ? 'indigo' : 'amber'}
          size="md"
        />
      </div>
      <h3 className="mt-6 text-2xl font-extrabold tracking-[-0.04em] text-textPrimary">
        {name}
      </h3>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-textSecondary">
        <Target size={14} className="text-emerald-300" aria-hidden="true" />
        {title}
      </p>
    </Card>
  );
}
