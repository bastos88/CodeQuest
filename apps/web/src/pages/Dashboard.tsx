import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock3, Code2, ShieldCheck, Sparkles, Target, Trophy, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getXPProgressToNextLevel } from '@codequest/shared';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../lib/api';
import { achievements, missions, profile, ranking, skills } from '../lib/mockData';

type ProfileResponse = {
  name: string;
  activeTitle: string;
  xp: number;
  rating: number;
  level: ReturnType<typeof getXPProgressToNextLevel>;
  stats: { quizzesCompleted: number; accuracy: number; streakDays: number };
};

export function Dashboard() {
  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get<ProfileResponse>('/profile/me')).data,
    retry: false,
  });

  const current = data ?? {
    name: profile.name,
    activeTitle: profile.title,
    xp: profile.xp,
    rating: 1020,
    level: getXPProgressToNextLevel(profile.xp),
    stats: { quizzesCompleted: profile.quizzes, accuracy: profile.accuracy, streakDays: profile.streak },
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(108,99,255,0.16),transparent_18rem)]" />
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="section-kicker">student.progression</p>
                <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-textPrimary">Olá, {current.name}</h2>
                <p className="mt-3 max-w-2xl text-base text-textSecondary">{current.activeTitle}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone="warning">{current.xp} XP total</Badge>
                  <Badge tone="info">{current.rating} rating</Badge>
                  <Badge tone="success">{current.stats.streakDays} dias de sequência</Badge>
                </div>
              </div>

              <div className="w-full max-w-md rounded-[1.25rem] border border-white/8 bg-white/[0.035] p-5 shadow-soft">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-textPrimary">Level {current.level.level}</span>
                  <span className="font-mono text-textSecondary">{current.xp} XP</span>
                </div>
                <ProgressBar value={current.level.percentage} />
                <p className="mt-3 text-sm text-textSecondary">{current.level.nextLevelXP - current.xp} XP até o próximo nível</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatTile icon={Trophy} label="Quizzes concluídos" value={current.stats.quizzesCompleted} tone="warning" />
          <StatTile icon={Target} label="Precisão média" value={`${current.stats.accuracy}%`} tone="info" />
          <StatTile icon={Sparkles} label="Sequência atual" value={`${current.stats.streakDays} dias`} tone="success" />
          <StatTile icon={Code2} label="Melhor categoria" value={profile.bestCategory} tone="primary" />
        </div>

        <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Nova sessão de quiz</h3>
                <p className="mt-2 text-sm text-textSecondary">Escolha filtros rápidos e continue o treino sem sair do fluxo.</p>
              </div>
              <Badge tone="info">Study mode</Badge>
            </div>
            <div className="grid gap-3">
              <SelectPreview label="Categoria" value="React" />
              <SelectPreview label="Dificuldade" value="Médio" />
              <SelectPreview label="Perguntas" value="10" />
            </div>
            <Button className="mt-5 w-full justify-between">
              <Link to="/quiz" className="flex-1">Iniciar sessão</Link>
              <ArrowRight size={17} />
            </Button>
          </Card>

          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Mapa de habilidades</h3>
                <p className="mt-2 text-sm text-textSecondary">Leitura rápida das categorias mais fortes e mais frágeis.</p>
              </div>
              <Badge>Recência</Badge>
            </div>
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.category}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-textPrimary">{skill.category}</span>
                    <span className="font-mono text-textSecondary">{skill.mastery}%</span>
                  </div>
                  <ProgressBar value={skill.mastery} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Medalhas e marcos</h3>
              <p className="mt-2 text-sm text-textSecondary">Recompensas por consistência, acerto e contribuição.</p>
            </div>
            <Badge tone="success">Achievements</Badge>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {achievements.map(([name, status, tone]) => (
              <div key={name} className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                <div className={`mb-4 grid h-10 w-10 place-items-center rounded-2xl ${tone === 'muted' ? 'bg-white/[0.06] text-textMuted' : 'bg-primary/16 text-primary'}`}>
                  <CheckCircle2 size={18} />
                </div>
                <p className="text-sm font-semibold text-textPrimary">{name}</p>
                <p className="mt-2 text-sm text-textSecondary">{status}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <aside className="space-y-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Missões diárias</h3>
              <p className="mt-2 text-sm text-textSecondary">Metas curtas para manter tração contínua.</p>
            </div>
            <Clock3 size={18} className="text-textMuted" />
          </div>
          <div className="space-y-3">
            {missions.map((mission) => (
              <div key={mission.title} className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-textPrimary">{mission.title}</p>
                  <span className="font-mono text-xs text-success">+{mission.xp} XP</span>
                </div>
                <ProgressBar value={(mission.progress / mission.target) * 100} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Top 10</h3>
              <p className="mt-2 text-sm text-textSecondary">Visão rápida do ranking geral.</p>
            </div>
            <Badge tone="warning">Geral</Badge>
          </div>
          <div className="space-y-3">
            {ranking.map(([name, title, xp], index) => (
              <div key={name} className="flex items-center gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-3">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/[0.05] font-mono text-xs text-textSecondary">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-textPrimary">{name}</p>
                  <p className="truncate text-xs text-textMuted">{title}</p>
                </div>
                <span className="font-mono text-xs text-textSecondary">{xp}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-success/10 text-success">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-[-0.03em] text-textPrimary">Fila de revisão</h3>
              <p className="mt-2 text-sm text-textSecondary">12 perguntas aguardando checklist editorial e técnico.</p>
            </div>
          </div>
          <Button className="mt-5 w-full" variant="secondary">
            <Link to="/admin" className="flex-1">Abrir admin</Link>
          </Button>
        </Card>
      </aside>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  tone: 'primary' | 'info' | 'warning' | 'success';
}) {
  const toneClasses = {
    primary: 'bg-primary/12 text-primary',
    info: 'bg-info/12 text-info',
    warning: 'bg-warning/12 text-warning',
    success: 'bg-success/12 text-success',
  };

  return (
    <Card className="p-5">
      <div className={`mb-5 grid h-11 w-11 place-items-center rounded-2xl ${toneClasses[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="font-mono text-3xl font-extrabold text-textPrimary">{value}</p>
      <p className="mt-2 text-sm text-textSecondary">{label}</p>
    </Card>
  );
}

function SelectPreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-textSecondary">{label}</span>
      <span className="font-mono text-sm font-semibold text-textPrimary">{value}</span>
    </div>
  );
}
