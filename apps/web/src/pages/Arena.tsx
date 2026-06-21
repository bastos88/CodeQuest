import { Swords, Timer, TrendingUp, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function Arena() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">competitive.rating</p>
            <h2 className="mt-3 section-title">Arena competitiva</h2>
            <p className="mt-3 text-base text-textSecondary">
              Rating sobe ou desce apenas em modos competitivos. XP continua
              representando progressão acumulada.
            </p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-primary/12 text-primary">
            <Swords size={28} />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ArenaRule
            label="Resposta correta"
            value="+12 rating"
            tone="success"
          />
          <ArenaRule label="Resposta errada" value="-5 rating" tone="danger" />
          <ArenaRule label="Vitória" value="+50 rating" tone="warning" />
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6">
          <div>
            <Badge tone="warning">Em breve</Badge>
            <h3 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-textPrimary">
              Modo competitivo em validação
            </h3>
            <p className="mt-3 text-textSecondary">
              A Arena ficará disponível quando o matchmaking e a validação
              server-side das partidas estiverem concluídos.
            </p>
          </div>
          <Button className="mt-6" disabled>
            <Swords className="h-4 w-4" aria-hidden="true" />
            Arena indisponível
          </Button>
        </div>
      </Card>

      <aside className="space-y-6">
        <MetricCard
          icon={TrendingUp}
          label="Rating atual"
          value="—"
          tone="success"
        />
        <MetricCard icon={Timer} label="Tempo médio" value="—" tone="warning" />
        <MetricCard icon={Zap} label="Win streak" value="—" tone="primary" />
      </aside>
    </div>
  );
}
function ArenaRule({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'success' | 'danger' | 'warning';
}) {
  const toneClass = {
    success: 'text-success bg-success/10',
    danger: 'text-danger bg-danger/10',
    warning: 'text-warning bg-warning/10',
  };

  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
      <p
        className={`mb-3 inline-flex rounded-full px-2.5 py-1 font-mono text-xs ${toneClass[tone]}`}
      >
        {value}
      </p>
      <p className="text-sm text-textSecondary">{label}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'primary';
}) {
  const tones = {
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/12 text-warning',
    primary: 'bg-primary/12 text-primary',
  };

  return (
    <Card className="p-6">
      <div
        className={`mb-5 grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}
      >
        <Icon size={19} />
      </div>
      <p className="font-mono text-3xl font-extrabold text-textPrimary">
        {value}
      </p>
      <p className="mt-2 text-sm text-textSecondary">{label}</p>
    </Card>
  );
}
