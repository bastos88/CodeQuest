export const profile = {
  name: 'Leo Student',
  title: 'Arquiteto Front-End',
  level: 7,
  xp: 2840,
  nextLevel: 3600,
  ranking: 8,
  accuracy: 82,
  quizzes: 42,
  streak: 6,
  bestCategory: 'React',
};

export const skills = [
  { category: 'React', mastery: 82, color: 'bg-primary' },
  { category: 'TypeScript', mastery: 67, color: 'bg-info' },
  { category: 'SQL', mastery: 41, color: 'bg-warning' },
  { category: 'Node.js', mastery: 58, color: 'bg-success' },
  { category: 'APIs REST', mastery: 73, color: 'bg-primary' },
];

export const missions = [
  { title: 'Responder 10 perguntas', type: 'Diária', progress: 7, target: 10, xp: 80 },
  { title: 'Completar 1 quiz médio', type: 'Diária', progress: 1, target: 1, xp: 60 },
  { title: 'Vencer 1 desafio na Arena', type: 'Semanal', progress: 0, target: 1, xp: 220 },
];

export const ranking = [
  ['Maya', 'Lenda da Arena', 9120],
  ['Rafael', 'Mestre do TypeScript', 8140],
  ['Clara', 'Especialista em React', 7980],
  ['Leo', 'Arquiteto Front-End', 2840],
] as const;

export const achievements = [
  ['Primeiro quiz', 'Desbloqueada', 'success'],
  ['React II', '82/100 acertos', 'primary'],
  ['Top 10 Ranking', 'Desbloqueada', 'warning'],
  ['Mestre da Arena', 'Bloqueada', 'muted'],
] as const;
