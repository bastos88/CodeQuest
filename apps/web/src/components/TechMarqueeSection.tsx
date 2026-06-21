import ScrollBaseAnimation from './ScrollBaseAnimation';
import { SectionDivider } from './ui/SectionDivider';

const technologies =
  'HTML • CSS • JavaScript • TypeScript • React • Node.js • PostgreSQL • TailwindCSS • Git • APIs REST • Vite';

export default function TechMarqueeSection() {
  return (
    <section
      className="
        relative overflow-hidden bg-[#14151C]/50
        [background:radial-gradient(circle_at_16%_50%,rgba(108,99,255,0.12),transparent_18rem),rgba(20,21,28,0.5)]
      "
      aria-label="Tecnologias praticadas na plataforma"
    >
      <SectionDivider variant="glow" />
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <div
          className="
            relative overflow-hidden px-0 py-2
            [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]
          "
        >
          <ScrollBaseAnimation baseVelocity={2} scrollDependent>
            {technologies}
          </ScrollBaseAnimation>
        </div>
      </div>
      <SectionDivider variant="default" />
    </section>
  );
}
