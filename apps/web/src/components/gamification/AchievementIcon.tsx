import {
  Code2,
  Database,
  Flame,
  GitBranch,
  Medal,
  Rocket,
  Sparkles,
  Swords,
  Terminal,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  code: Code2,
  database: Database,
  flame: Flame,
  'git-branch': GitBranch,
  medal: Medal,
  rocket: Rocket,
  sparkles: Sparkles,
  swords: Swords,
  terminal: Terminal,
  trophy: Trophy,
};

export function AchievementIcon({ iconKey, size = 18 }: { iconKey: string | null; size?: number }) {
  const Icon = (iconKey && icons[iconKey]) || Trophy;
  return <Icon size={size} aria-hidden="true" />;
}
