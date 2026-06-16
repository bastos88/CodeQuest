# CodeQuest

Plataforma full-stack de quizzes para estudantes de programação com React, TypeScript, Node.js, Express, PostgreSQL, Prisma, JWT, refresh token rotacionado, Zod e Tailwind CSS.

## Estrutura

```txt
apps/
  api/    Express + Prisma + PostgreSQL
  web/    React + Vite + Tailwind
packages/
  shared/ Zod schemas e regras de gamificação
```

## Requisitos

- Node.js 22+
- Docker
- PostgreSQL local ou via `docker-compose`

## Instalação

```bash
npm install
cp apps/api/.env.example apps/api/.env
docker compose up -d postgres
npm run db:migrate
npm run db:seed
```

Credenciais do seed:

- Admin: `admin@codequest.dev` / `Admin12345!`
- Estudante: `student@codequest.dev` / `User12345!`

## Rodar

```bash
npm run dev --workspace @codequest/api
npm run dev --workspace @codequest/web
```

Web: `http://localhost:5173`

API: `http://localhost:3333`

## Testes

```bash
npm test
```

## Fluxo do usuário

1. Criar conta ou entrar.
2. Escolher categoria, dificuldade e quantidade de perguntas.
3. Responder quiz sem receber a resposta correta antes da submissão final.
4. Receber resultado, XP, nível e progresso.
5. Acompanhar perfil, mapa de habilidades, missões, medalhas e ranking.
6. Enviar perguntas para revisão.
7. Participar da Arena, onde rating pode subir ou descer.

## Fluxo admin

1. Criar, editar, arquivar e excluir perguntas nunca usadas.
2. Revisar perguntas pendentes.
3. Aprovar com checklist obrigatório.
4. Rejeitar com motivo obrigatório.
5. Acompanhar dashboard, estatísticas, reports e atividade.

## Segurança

- Senhas com bcrypt.
- JWT access token curto.
- Refresh token persistido e rotacionado.
- Helmet, CORS configurado e rate limit em auth.
- Validação com Zod.
- XP e validação de respostas calculados apenas na API.
- `QuizSession` impede submissão duplicada e valida se perguntas pertencem à sessão.
- Front-end não recebe `isCorrect` nem resposta correta em `/quizzes/start`.

## Gamificação

- XP representa progressão pessoal e nunca diminui.
- Rating representa competição e muda apenas na Arena.
- Precisão representa desempenho.
- Medalhas representam conquistas.
- Títulos representam identidade visual no perfil e ranking.

Fórmula de nível:

```ts
level = floor(sqrt(xp / 100)) + 1
```

Helpers em `packages/shared/src/gamification.ts`:

- `getLevelFromXP`
- `getXPForLevel`
- `getXPProgressToNextLevel`
- `calculateQuizXP`

## Endpoints principais

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /quizzes/start`
- `POST /quizzes/submit`
- `GET /quizzes/history`
- `GET /questions`
- `POST /questions`
- `GET /reviews/pending`
- `POST /reviews/:questionId/approve`
- `POST /reviews/:questionId/reject`
- `GET /profile/me`
- `GET /ranking`
- `POST /arena/start`
- `POST /reports`
- `GET /admin/dashboard`

## Design

O front-end usa Halo Dark Design System:

- `background #0A0B0F`
- `surface #14151C`
- `elevated #1E2029`
- `border #2A2D38`
- `primary #5B6BFF`
- `success #2BE08C`
- `warning #F5D547`
- `info #3DD7E5`
- `danger #FF3A5C`

Componentes base: Button, Card, Input, Badge e ProgressBar, com páginas de Dashboard, Quiz, Arena, Ranking, Profile, Contribute e Admin.
