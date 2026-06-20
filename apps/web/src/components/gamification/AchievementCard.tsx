import { Check, LockKeyhole, Sparkles } from 'lucide-react';
import type { GamificationAchievement } from '../../lib/gamification';
import { AchievementIcon } from './AchievementIcon';

type AchievementVisualCategory =
  | 'QUIZ'
  | 'ACCURACY'
  | 'STREAK'
  | 'CATEGORY'
  | 'CONTRIBUTION'
  | 'ARENA'
  | 'PROGRESSION';

const achievementVisualMap: Record<
  AchievementVisualCategory,
  { card: string; icon: string; progress: string }
> = {
  QUIZ: {
    card: 'border-indigo-400/20 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_45%),linear-gradient(145deg,rgba(30,32,41,0.96),rgba(14,15,21,0.98))]',
    icon: 'border-indigo-400/20 bg-indigo-500/15 text-indigo-300',
    progress: 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.38)]',
  },
  ACCURACY: {
    card: 'border-emerald-400/20 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_45%),linear-gradient(145deg,rgba(30,32,41,0.96),rgba(14,15,21,0.98))]',
    icon: 'border-emerald-400/20 bg-emerald-500/15 text-emerald-300',
    progress: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.35)]',
  },
  STREAK: {
    card: 'border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_45%),linear-gradient(145deg,rgba(30,32,41,0.96),rgba(14,15,21,0.98))]',
    icon: 'border-orange-400/20 bg-orange-500/15 text-orange-300',
    progress: 'bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.35)]',
  },
  CATEGORY: {
    card: 'border-cyan-400/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_45%),linear-gradient(145deg,rgba(30,32,41,0.96),rgba(14,15,21,0.98))]',
    icon: 'border-cyan-400/20 bg-cyan-500/15 text-cyan-300',
    progress: 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.35)]',
  },
  CONTRIBUTION: {
    card: 'border-violet-400/20 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.16),transparent_45%),linear-gradient(145deg,rgba(30,32,41,0.96),rgba(14,15,21,0.98))]',
    icon: 'border-violet-400/20 bg-violet-500/15 text-violet-300',
    progress: 'bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.35)]',
  },
  ARENA: {
    card: 'border-rose-400/20 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.16),transparent_45%),linear-gradient(145deg,rgba(30,32,41,0.96),rgba(14,15,21,0.98))]',
    icon: 'border-rose-400/20 bg-rose-500/15 text-rose-300',
    progress: 'bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.35)]',
  },
  PROGRESSION: {
    card: 'border-amber-400/20 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_45%),linear-gradient(145deg,rgba(30,32,41,0.96),rgba(14,15,21,0.98))]',
    icon: 'border-amber-400/20 bg-amber-500/15 text-amber-300',
    progress: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]',
  },
};

const lockedStyle =
  'border-white/10 bg-[linear-gradient(145deg,rgba(24,25,33,0.96),rgba(13,14,20,0.98))] opacity-80';

function getVisualCategory(achievement: GamificationAchievement): AchievementVisualCategory {
  switch (achievement.category.toUpperCase()) {
    case 'PERFORMANCE':
    case 'ACCURACY':
      return 'ACCURACY';
    case 'STREAK':
      return 'STREAK';
    case 'MASTERY':
    case 'CATEGORY':
      return 'CATEGORY';
    case 'COMMUNITY':
    case 'CONTRIBUTION':
      return 'CONTRIBUTION';
    case 'ARENA':
      return 'ARENA';
    case 'PROGRESSION':
      return 'PROGRESSION';
    default:
      return achievement.code.includes('QUIZ') ? 'QUIZ' : 'PROGRESSION';
  }
}

export function AchievementCard({ achievement }: { achievement: GamificationAchievement }) {
  const visual = achievementVisualMap[getVisualCategory(achievement)];
  const progressPercentage = Math.min(
    100,
    Math.max(0, (achievement.progress.current / Math.max(1, achievement.progress.target)) * 100),
  );
  const recentlyUnlocked = achievement.unlocked && achievement.unlockedAt
    ? Date.now() - Date.parse(achievement.unlockedAt) <= 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <article
      aria-label={`${achievement.name}: ${achievement.unlocked ? 'desbloqueada' : 'bloqueada'}`}
      className={`flex h-full min-h-[260px] flex-col rounded-[1.35rem] border p-5 transition-all duration-300 ease-premium ${
        achievement.unlocked
          ? `${visual.card} hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_45px_rgba(0,0,0,0.25)]`
          : lockedStyle
      } ${recentlyUnlocked ? 'shadow-[0_0_34px_rgba(108,99,255,0.14)] ring-1 ring-white/[0.04]' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid h-11 w-11 place-items-center rounded-2xl border ${
            achievement.unlocked
              ? visual.icon
              : 'border-white/10 bg-white/[0.05] text-textMuted'
          }`}
        >
          <AchievementIcon iconKey={achievement.iconKey} size={19} />
        </div>

        <span
          className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] ${
            achievement.unlocked
              ? 'border-white/10 bg-white/[0.06] text-textPrimary'
              : 'border-white/8 bg-black/10 text-textMuted'
          }`}
        >
          {recentlyUnlocked ? <Sparkles size={12} /> : achievement.unlocked ? <Check size={12} /> : <LockKeyhole size={12} />}
          {recentlyUnlocked ? 'Nova' : achievement.unlocked ? 'Concluída' : 'Bloqueada'}
        </span>
      </div>

      <div className="mt-5">
        <h4 className="min-h-[44px] text-base font-bold leading-[1.35] tracking-[-0.02em] text-textPrimary">
          {achievement.name}
        </h4>
        <p className="mt-2 min-h-[48px] line-clamp-2 text-sm leading-6 text-textSecondary">
          {achievement.description}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <div
          className="h-2.5 overflow-hidden rounded-full border border-white/10 bg-white/[0.06]"
          role="progressbar"
          aria-label={`Progresso de ${achievement.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercentage)}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${achievement.unlocked ? visual.progress : 'bg-slate-500'}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 font-mono text-xs">
          <span className={achievement.unlocked ? 'text-textSecondary' : 'text-textMuted'}>
            {achievement.unlocked
              ? 'Desbloqueada'
              : `${achievement.progress.current}/${achievement.progress.target}`}
          </span>
          <span className={achievement.unlocked ? 'font-semibold text-textPrimary' : 'text-textSecondary'}>
            +{achievement.xpReward} XP
          </span>
        </div>
      </div>
    </article>
  );
}
