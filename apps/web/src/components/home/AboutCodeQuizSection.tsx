import { BarChart3, Braces, Trophy, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';

import { neonButtonClassName } from '@/components/ui/NeonButton';

type AboutCodeQuizSectionProps = {
  isAuthenticated: boolean;
};

const valueIndicators = [
  { label: 'Categorias técnicas', icon: Braces },
  { label: 'XP e achievements', icon: Trophy },
  { label: 'Evolução por habilidades', icon: BarChart3 },
];

const contentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
  },
};

export function AboutCodeQuizSection({
  isAuthenticated,
}: AboutCodeQuizSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const initialState = shouldReduceMotion ? false : 'hidden';

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <section
        id="sobre-codequiz"
        aria-labelledby="about-codequiz-title"
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#14151C] shadow-[0_30px_100px_rgba(0,0,0,0.32)]"
      >
        <div className="grid lg:min-h-[480px] lg:grid-cols-[0.42fr_0.58fr]">
          <motion.div
            initial={initialState}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0, scale: 1.035 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.42,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
            className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] lg:min-h-0"
          >
            <img
              src="/images/about-codequiz.jpg"
              alt="Desenvolvedor praticando programação em um notebook"
              className="absolute inset-0 h-full w-full object-cover object-[50%_58%] lg:object-[48%_54%]"
              loading="lazy"
              decoding="async"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#14151C] via-transparent to-transparent lg:hidden"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-[#14151C] lg:block"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
            />
          </motion.div>

          <div className="relative flex items-center bg-[radial-gradient(circle_at_top_right,rgba(91,107,255,0.12),transparent_42%),linear-gradient(145deg,rgba(30,32,41,0.98),rgba(12,13,18,0.98))]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl"
            />

            <motion.div
              initial={initialState}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={contentVariants}
              className="relative z-10 w-full px-6 py-10 sm:px-10 sm:py-12 lg:px-12 xl:px-16"
            >
              <motion.p
                variants={itemVariants}
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9f8fff]"
              >
                Sobre a plataforma
              </motion.p>

              <motion.h2
                id="about-codequiz-title"
                variants={itemVariants}
                className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl"
              >
                CodeQuiz
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="mt-4 max-w-xl text-xl font-semibold leading-snug tracking-[-0.02em] text-[#c8c2ff] sm:text-2xl"
              >
                Transforme prática em progresso mensurável.
              </motion.p>

              <motion.p
                variants={itemVariants}
                className="mt-5 max-w-2xl text-sm leading-7 text-textSecondary sm:text-[15px]"
              >
                Quizzes técnicos para estudantes e desenvolvedores que querem
                identificar lacunas, construir consistência e evoluir por
                categoria — do primeiro fundamento ao domínio avançado.
              </motion.p>

              <motion.div
                variants={contentVariants}
                className="mt-7 grid gap-3 sm:grid-cols-3"
              >
                {valueIndicators.map((indicator) => {
                  const Icon = indicator.icon;

                  return (
                    <motion.div
                      key={indicator.label}
                      variants={itemVariants}
                      className="flex items-center gap-2.5 text-sm text-zinc-300"
                    >
                      <Icon
                        className="h-4 w-4 shrink-0 text-indigo-300"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <span>{indicator.label}</span>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to={isAuthenticated ? '/quiz' : '/login'}
                  className={neonButtonClassName()}
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    Explorar quizzes
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
                <a
                  href="#dashboard"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-5 text-sm font-semibold text-textPrimary transition-[background-color,border-color,transform] duration-200 ease-out hover:border-white/25 hover:bg-white/[0.07] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14151C]"
                >
                  Como funciona
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
