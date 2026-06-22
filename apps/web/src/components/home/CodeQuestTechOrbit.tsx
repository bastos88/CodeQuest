import type { ComponentType } from 'react';
import {
  SiCplusplus,
  SiDotnet,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiNodedotjs,
  SiOpenjdk,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRust,
  SiTypescript,
  SiGithub,
  SiDocker,
  SiAngular,
} from 'react-icons/si';
import { OrbitingCircles } from '../ui/orbiting-circles';

type TechIcon = {
  name: string;
  icon: ComponentType<{ className?: string }>;
  className: string;
};

const outerTechIcons: TechIcon[] = [
  { name: 'TypeScript', icon: SiTypescript, className: 'text-[#3178C6]' },
  { name: 'JavaScript', icon: SiJavascript, className: 'text-[#F7DF1E]' },
  { name: 'React', icon: SiReact, className: 'text-[#61DAFB]' },
  { name: 'Node.js', icon: SiNodedotjs, className: 'text-[#5FA04E]' },
  { name: 'Angular', icon: SiAngular, className: 'text-[#5FA04E]' },
];

const innerTechIcons: TechIcon[] = [
  { name: 'HTML5', icon: SiHtml5, className: 'text-[#E34F26]' },
  { name: 'Python', icon: SiPython, className: 'text-[#FFD43B]' },
  { name: 'Java', icon: SiOpenjdk, className: 'text-[#EA2D2E]' },
  { name: 'PostgreSQL', icon: SiPostgresql, className: 'text-[#4169E1]' },
  { name: 'Docker', icon: SiDocker, className: 'text-[#4169E1]' },
];

const extendedTechIcons: TechIcon[] = [
  { name: 'C++', icon: SiCplusplus, className: 'text-[#659AD2]' },
  { name: 'C#', icon: SiDotnet, className: 'text-[#9B4F96]' },
  { name: 'Go', icon: SiGo, className: 'text-[#00ADD8]' },
  { name: 'Rust', icon: SiRust, className: 'text-[#F2E2C4]' },
  { name: 'GitHub', icon: SiGithub, className: 'text-[#F2E2C4]' },
];

const allTechIcons = [...outerTechIcons, ...innerTechIcons];

function TechBadge({
  icon: Icon,
  name,
  className,
  compact = false,
}: TechIcon & { compact?: boolean }) {
  return (
    <div
      title={name}
      aria-label={name}
      role="img"
      className={`flex items-center justify-center rounded-full border border-white/10 bg-[#14151C]/95 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-[transform,border-color] duration-200 ease-out hover:scale-105 hover:border-white/25 ${
        compact ? 'size-9' : 'size-11'
      }`}
    >
      <Icon className={`${compact ? 'size-4' : 'size-5'} ${className}`} />
    </div>
  );
}

function CodeQuestLogo() {
  return (
    <div className="relative z-10 size-[170px] max-w-[52vw] sm:size-[205px] lg:size-[215px]">
      <img
        src="/images/codequest-hero.png"
        alt="Logo CodeQuest com cérebro e símbolo de código"
        className="absolute left-1/2 top-1/2 w-[155%] max-w-none -translate-x-1/2 -translate-y-[43%] object-cover mix-blend-screen"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export function CodeQuestTechOrbit() {
  return (
    <div className="relative flex h-[400px] w-full items-center justify-center overflow-hidden sm:h-[500px] lg:h-[520px]">
      <div
        aria-hidden="true"
        className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(91,107,255,0.18),rgba(30,64,175,0.06)_42%,transparent_70%)]"
      />

      <CodeQuestLogo />

      <div className="contents sm:hidden">
        <OrbitingCircles radius={150} iconSize={34} duration={32} speed={0.9}>
          {allTechIcons.map((tech) => (
            <TechBadge key={tech.name} {...tech} compact />
          ))}
        </OrbitingCircles>

        <OrbitingCircles
          radius={110}
          iconSize={32}
          duration={26}
          speed={1.2}
          reverse
        >
          {extendedTechIcons.map((tech) => (
            <TechBadge key={tech.name} {...tech} compact />
          ))}
        </OrbitingCircles>
      </div>

      <div className="hidden sm:contents">
        <OrbitingCircles
          radius={225}
          iconSize={44}
          duration={40}
          speed={0.7}
          reverse
        >
          {extendedTechIcons.map((tech) => (
            <TechBadge key={tech.name} {...tech} />
          ))}
        </OrbitingCircles>

        <OrbitingCircles radius={175} iconSize={44} duration={34} speed={0.85}>
          {outerTechIcons.map((tech) => (
            <TechBadge key={tech.name} {...tech} />
          ))}
        </OrbitingCircles>

        <OrbitingCircles
          radius={125}
          iconSize={38}
          duration={26}
          speed={1.3}
          reverse
        >
          {innerTechIcons.map((tech) => (
            <TechBadge key={tech.name} {...tech} compact />
          ))}
        </OrbitingCircles>
      </div>
    </div>
  );
}
