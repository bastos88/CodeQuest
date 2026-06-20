import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Code2,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileSettingsCard } from '../components/dashboard/ProfileSettingsCard';
import { AchievementCard } from '../components/gamification/AchievementCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  getProfile,
  getProfileSkills,
  profileQueryKeys,
  type SkillProgress,
} from '../lib/profile';
import { getPublicRanking, rankingQueryKeys } from '../lib/ranking';
import {
  gamificationQueryKeys,
  getAchievements,
  getDailyMissions,
  getGamificationSummary,
} from '../lib/gamification';

export function Dashboard() {
  const navigate = useNavigate();
  const profileQuery = useQuery({
    queryKey: profileQueryKeys.me,
    queryFn: getProfile,
    retry: false,
  });
  const skillsQuery = useQuery({
    queryKey: profileQueryKeys.skills,
    queryFn: getProfileSkills,
    retry: false,
  });
  const rankingQuery = useQuery({
    queryKey: rankingQueryKeys.public(10),
    queryFn: () => getPublicRanking(10),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
  });
  const gamificationQuery = useQuery({
    queryKey: gamificationQueryKeys.summary,
    queryFn: getGamificationSummary,
    retry: false,
  });
  const achievementsQuery = useQuery({
    queryKey: gamificationQueryKeys.achievements,
    queryFn: getAchievements,
    retry: false,
  });
  const missionsQuery = useQuery({
    queryKey: gamificationQueryKeys.dailyMissions,
    queryFn: getDailyMissions,
    retry: false,
  });

  if (profileQuery.isLoading) {
    return <Card className="p-6 text-sm text-textSecondary">Carregando seu Dashboard...</Card>;
  }

  if (!profileQuery.data) {
    return (
      <Card className="border-danger/20 bg-danger/5 p-6 text-sm text-red-200">
        Não foi possível carregar os dados do seu perfil.
      </Card>
    );
  }

  const profile = profileQuery.data;
  const skills = skillsQuery.data ?? [];
  const bestCategory = skills[0]?.category ?? 'Comece um quiz';
  const gamification = gamificationQuery.data;
  const achievements = achievementsQuery.data ?? [];
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(108,99,255,0.16),transparent_18rem)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="section-kicker">student.progression</p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-textPrimary">
                Olá, {profile.name}
              </h2>
              <p className="mt-3 max-w-2xl text-base text-textSecondary">{profile.activeTitle}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone="warning">{profile.xp} XP total</Badge>
                <Badge tone="info">{profile.rating} rating</Badge>
                <Badge tone="success">{gamification?.streak.current ?? profile.stats.streakDays} dias de sequência</Badge>
              </div>
            </div>

            <div className="w-full max-w-md rounded-[1.25rem] border border-white/8 bg-white/[0.035] p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-textPrimary">Nível {profile.level.level}</span>
                <span className="font-mono text-textSecondary">{profile.xp} XP</span>
              </div>
              <ProgressBar value={profile.level.percentage} />
              <p className="mt-3 text-sm text-textSecondary">
                {Math.max(0, profile.level.nextLevelXP - profile.xp)} XP até o próximo nível
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Trophy} label="Quizzes concluídos" value={profile.stats.quizzesCompleted} tone="warning" />
        <StatTile icon={Target} label="Precisão média" value={`${profile.stats.accuracy}%`} tone="info" />
        <StatTile icon={Sparkles} label="Sequência atual" value={`${profile.stats.streakDays} dias`} tone="success" />
        <StatTile icon={Code2} label="Melhor categoria" value={bestCategory} tone="primary" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="flex flex-col p-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Nova sessão de quiz</h3>
            <p className="mt-2 text-sm leading-6 text-textSecondary">
              Escolha categorias, dificuldade e quantidade de perguntas na configuração do desafio.
            </p>
          </div>
          <Button className="mt-6 w-full justify-between" onClick={() => navigate('/quiz')}>
            Iniciar sessão <ArrowRight size={17} />
          </Button>
        </Card>

        <SkillMapCard skills={skills} isLoading={skillsQuery.isLoading} isError={skillsQuery.isError} />
      </div>

      <RankingCard
        players={rankingQuery.data ?? []}
        isLoading={rankingQuery.isLoading}
        isError={rankingQuery.isError}
      />

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Missões diárias</h3>
            <p className="mt-2 text-sm text-textSecondary">Progresso válido até ao fim do dia UTC.</p>
          </div>
          <Badge tone="info">Hoje</Badge>
        </div>
        {missionsQuery.isLoading ? <EmptyState>Carregando missões...</EmptyState> : null}
        {missionsQuery.isError ? <EmptyState>Não foi possível carregar as missões diárias.</EmptyState> : null}
        {missionsQuery.data ? (
          <div className="grid gap-4 md:grid-cols-3">
            {missionsQuery.data.missions.map((mission) => (
              <div key={mission.code} className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-textPrimary">{mission.title}</p>
                    <p className="mt-1 text-xs leading-5 text-textMuted">{mission.description}</p>
                  </div>
                  <Badge tone={mission.completed ? 'success' : 'warning'}>+{mission.xpReward} XP</Badge>
                </div>
                <ProgressBar className="mt-4" value={(mission.progress / mission.target) * 100} />
                <p className="mt-2 font-mono text-xs text-textSecondary">
                  {mission.completed ? 'Concluída' : `${mission.progress}/${mission.target}`}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <ProfileSettingsCard />

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Medalhas e marcos</h3>
            <p className="mt-2 text-sm text-textSecondary">Marcos desbloqueados e próximos objetivos.</p>
          </div>
          <Badge tone="success">{unlockedAchievements}/{achievements.length} desbloqueadas</Badge>
        </div>

        {achievementsQuery.isLoading ? <EmptyState>Carregando conquistas...</EmptyState> : null}
        {achievementsQuery.isError ? <EmptyState>Não foi possível carregar as conquistas.</EmptyState> : null}
        {achievements.length ? (
          <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.code} achievement={achievement} />
            ))}
          </div>
        ) : !achievementsQuery.isLoading && !achievementsQuery.isError ? (
          <EmptyState>Complete quizzes para começar a desbloquear conquistas.</EmptyState>
        ) : null}
      </Card>
    </div>
  );
}

function SkillMapCard({ skills, isLoading, isError }: { skills: SkillProgress[]; isLoading: boolean; isError: boolean }) {
  const navigate = useNavigate();
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Mapa de habilidades</h3>
          <p className="mt-2 text-sm text-textSecondary">Domínio calculado pela precisão e pelo volume de prática.</p>
        </div>
        <Badge>Dados reais</Badge>
      </div>

      {isLoading ? <EmptyState>Carregando habilidades...</EmptyState> : null}
      {isError ? <EmptyState>Não foi possível carregar seu mapa de habilidades.</EmptyState> : null}
      {!isLoading && !isError && skills.length === 0 ? (
        <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-5">
          <p className="text-sm leading-6 text-textSecondary">
            Você ainda não possui dados de habilidade. Complete um quiz para começar a mapear sua evolução.
          </p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/quiz')}>
            Começar um quiz
          </Button>
        </div>
      ) : null}
      {!isLoading && !isError && skills.length ? (
        <div className="space-y-5">
          {skills.map((skill) => (
            <div key={skill.categoryId}>
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="font-semibold text-textPrimary">{skill.category}</p>
                  <p className="mt-1 text-xs text-textMuted">
                    {skill.accuracy}% de precisão · {skill.correct}/{skill.answered} respostas corretas
                    {skill.lastPlayedAt ? ` · ${formatLastPlayed(skill.lastPlayedAt)}` : ''}
                  </p>
                </div>
                <span className="font-mono text-sm text-textSecondary">{skill.mastery}%</span>
              </div>
              <ProgressBar value={skill.mastery} />
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function RankingCard({ players, isLoading, isError }: { players: Awaited<ReturnType<typeof getPublicRanking>>; isLoading: boolean; isError: boolean }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Top 10</h3>
          <p className="mt-2 text-sm text-textSecondary">Ranking geral atualizado com o progresso dos jogadores.</p>
        </div>
        <Badge tone="warning">Geral</Badge>
      </div>
      {isLoading ? <EmptyState>Carregando ranking...</EmptyState> : null}
      {isError ? <EmptyState>Não foi possível carregar o ranking.</EmptyState> : null}
      {!isLoading && !isError && players.length === 0 ? <EmptyState>Nenhum jogador no ranking ainda.</EmptyState> : null}
      {!isLoading && !isError && players.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {players.map((player, index) => (
            <div key={player.id} className="flex items-center gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[0.05] font-mono text-xs text-textSecondary">
                #{player.position ?? index + 1}
              </span>
              <Avatar name={player.name} avatarUrl={player.avatarUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-textPrimary">{player.name}</p>
                <p className="truncate text-xs text-textMuted">Nível {player.level} · {player.quizzesCompleted} quizzes · {player.accuracy}% acerto</p>
              </div>
              <span className="font-mono text-xs text-textSecondary">{player.xp} XP</span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null | undefined }) {
  if (avatarUrl) return <img src={avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-2xl object-cover" />;
  return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/12 text-xs font-bold text-primary">{name.slice(0, 2).toUpperCase()}</span>;
}

function EmptyState({ children }: { children: string }) {
  return <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-textSecondary">{children}</div>;
}

function StatTile({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: string | number; tone: 'primary' | 'info' | 'warning' | 'success' }) {
  const toneClasses = {
    primary: 'bg-primary/12 text-primary',
    info: 'bg-info/12 text-info',
    warning: 'bg-warning/12 text-warning',
    success: 'bg-success/12 text-success',
  };
  return (
    <Card className="p-5">
      <div className={`mb-5 grid h-11 w-11 place-items-center rounded-2xl ${toneClasses[tone]}`}><Icon size={18} /></div>
      <p className="font-mono text-3xl font-extrabold text-textPrimary">{value}</p>
      <p className="mt-2 text-sm text-textSecondary">{label}</p>
    </Card>
  );
}

function formatLastPlayed(value: string) {
  return `último estudo ${new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short' }).format(new Date(value))}`;
}
