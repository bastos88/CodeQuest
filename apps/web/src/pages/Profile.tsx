import { Award, Star } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { achievements, missions, profile, skills } from '../lib/mockData';

export function Profile() {
  const xpProgress = Math.round((profile.xp / profile.nextLevel) * 100);

  return (
    <div className="space-y-6">
      <Card className="p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-[1.5rem] bg-[linear-gradient(135deg,#6c63ff,#a855f7)] text-2xl font-black text-white shadow-[0_16px_36px_rgba(108,99,255,0.3)]">
              LS
            </div>
            <div>
              <p className="section-kicker">dev.profile</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-textPrimary">{profile.name}</h2>
              <p className="mt-2 text-textSecondary">{profile.title}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="warning">{profile.xp} XP</Badge>
                <Badge tone="info">#{profile.ranking}</Badge>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-3 flex justify-between text-sm">
              <span className="font-semibold text-textPrimary">Level {profile.level}</span>
              <span className="font-mono text-textSecondary">{profile.xp} XP</span>
            </div>
            <ProgressBar value={xpProgress} />
            <p className="mt-3 text-sm text-textSecondary">{profile.nextLevel - profile.xp} XP restantes para o próximo nível</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ['Quizzes', profile.quizzes],
          ['Precisão', `${profile.accuracy}%`],
          ['Sequência', `${profile.streak} dias`],
          ['Melhor categoria', profile.bestCategory],
          ['Ranking', `#${profile.ranking}`],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="font-mono text-3xl font-extrabold text-textPrimary">{value}</p>
            <p className="mt-2 text-sm text-textSecondary">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Mapa de habilidades</h3>
              <p className="mt-2 text-sm text-textSecondary">Distribuição por categoria com leitura rápida de domínio.</p>
            </div>
            <Badge>Mastery</Badge>
          </div>
          <div className="space-y-4">{skills.map((skill) => <SkillRow key={skill.category} category={skill.category} mastery={skill.mastery} />)}</div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Missões ativas</h3>
              <p className="mt-2 text-sm text-textSecondary">Pequenos marcos para manter cadência diária.</p>
            </div>
            <Badge tone="success">Daily</Badge>
          </div>
          <div className="space-y-3">
            {missions.map((mission) => (
              <div key={mission.title} className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-textPrimary">{mission.title}</span>
                  <span className="font-mono text-xs text-success">+{mission.xp}</span>
                </div>
                <ProgressBar value={(mission.progress / mission.target) * 100} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em] text-textPrimary">Medalhas e títulos</h3>
            <p className="mt-2 text-sm text-textSecondary">Reconhecimento visual para evolução consistente.</p>
          </div>
          <Badge tone="info">Collection</Badge>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {achievements.map(([name, status]) => (
            <div key={name} className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-primary/12 text-primary">
                <Award size={18} />
              </div>
              <p className="font-semibold text-textPrimary">{name}</p>
              <p className="mt-2 text-sm text-textSecondary">{status}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SkillRow({ category, mastery }: { category: string; mastery: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-semibold text-textPrimary">
          <Star size={15} className="text-warning" />
          {category}
        </span>
        <span className="font-mono text-textSecondary">{mastery}%</span>
      </div>
      <ProgressBar value={mastery} />
    </div>
  );
}
