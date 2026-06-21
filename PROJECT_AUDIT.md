# CodeQuest — Auditoria Técnica

Auditoria executada em 20/06/2026 sobre o commit `226dd50`, branch `main`.

## Resumo Executivo

- Estado atual: frontend e API estão publicados e respondendo, o build TypeScript passa e a suíte atual possui 25 testes. A base funcional cobre autenticação, quiz, ranking, perfil, contribuição, revisão, gamificação e recuperação de senha.
- Prontidão: **não está pronto para produção sem ressalvas**, apesar de estar online. Existem bloqueadores de segurança, integridade e reprodutibilidade do banco.
- Principais riscos: cadeia de migrations inválida; Arena confiando em pontuação enviada pelo cliente; defaults de JWT conhecidos aceitos em produção; concorrência em streak/missões; vinculação OAuth por e-mail sem garantia forte de verificação; validação incompleta em rotas mutáveis.
- Pontos fortes: TypeScript estrito; separação razoável entre rotas/controllers/services; cookies HTTP-only; hash de refresh/reset tokens; reset token de uso único; autorização server-side de admin/reviewer; transações no quiz; idempotência por `QuizResult.gamificationAppliedAt`; respostas públicas com seleção explícita de campos; bom acabamento visual inicial.
- Limite da auditoria: o preflight de segurança não disponibilizou workers/subagentes. A revisão foi feita pelo agente principal e não deve ser interpretada como uma varredura multiagente exaustiva.

## Arquitetura Atual

### Estrutura de pastas

```text
apps/api                  Express, Prisma, autenticação e regras de negócio
  prisma                  schema, migrations e seeds
  src/config              env, Passport e Prisma Client
  src/controllers         adaptação HTTP
  src/middleware          autenticação, erro e validação de body
  src/routes              composição dos endpoints
  src/services            auth, quiz, gamificação, perfil, ranking, arena e perguntas
  tests                   testes unitários/integração parcial
apps/web                  React + Vite + React Query + Halo Dark
  src/components          layout, UI, dashboard, home e gamificação
  src/context             sessão/autenticação
  src/lib                 clientes de API e contratos locais
  src/pages               páginas e fluxos
packages/shared           schemas Zod e fórmulas compartilhadas
backend-map               snapshot documental antigo; pode divergir do código atual
```

### Backend

- `app.ts` configura Helmet, CORS, compressão, cookies, Passport, JSON e rate limit de autenticação.
- Controllers em geral são finos, mas `admin.controller.ts`, `public.controller.ts`, `report.controller.ts` e `ranking.controller.ts` contêm consultas e regras que deveriam estar em services.
- Services concentram a maior parte das regras. `gamification.service.ts` (460 linhas) e `auth.service.ts` (404 linhas) já acumulam responsabilidades demais.
- Não foram identificados imports circulares evidentes. Há acoplamento forte de services ao singleton global do Prisma, o que torna testes mais trabalhosos.

### Rotas da API

| Prefixo | Rotas principais | Proteção |
|---|---|---|
| `/auth` | register, login, refresh, logout, me, OAuth, forgot/reset password | limitador global; `me` autenticado |
| `/public` | stats, ranking | pública |
| `/categories` | listagem | pública |
| `/gamification` | resumo, achievements, daily missions, events | usuário autenticado |
| `/quizzes` | start, submit, history, result | usuário autenticado |
| `/questions` | listar, consultar, criar, editar, arquivar, restaurar, excluir | autenticado; mutações elevadas por role |
| `/reviews` | pendentes, aprovar, rejeitar | reviewer/admin |
| `/admin` | dashboard, questions, stats, activity | admin |
| `/profile` | perfil, senha, skills, achievements, missions | usuário autenticado |
| `/ranking` | geral, arena, contribuidores, posição e categoria | usuário autenticado |
| `/arena` | start, submit, history, leaderboard | usuário autenticado |
| `/reports`, `/admin/reports` | criar e administrar denúncias | autenticado/admin |

### Serviços existentes

- `auth.service.ts`: cadastro, login, refresh rotation, logout, OAuth, forgot/reset password.
- `quiz.service.ts`: seleção aleatória, sessão, submissão, resultado e histórico.
- `gamification.service.ts`: XP, streak, achievements, missions, mastery e eventos.
- `profile.service.ts`: perfil, senha, skills e missões legadas.
- `question.service.ts`: CRUD, archive/restore, review e gamificação por contribuição.
- `ranking.service.ts`: rankings geral, arena e contribuidores.
- `arena.service.ts`: protótipo de Arena baseado em resultado informado pelo cliente.
- `email.service.ts`: envio de reset via Resend e fallback local fora de produção.

### Middlewares

- `requireAuth`: aceita cookie ou Bearer, verifica JWT e recarrega role no banco.
- `requireRole`: aplica autorização de reviewer/admin.
- `validateBody`: valida apenas body com Zod; não há equivalentes para params/query.
- `errorMiddleware`: trata Zod/HttpError, mas converte erros Prisma esperados em 500.

### Banco

Entidades principais: `User`, `RefreshToken`, `PasswordResetToken`, `Category`, `Question`, `Alternative`, `QuizSession`, `QuizResult`, `QuizAnswer`, `Review`, `Report`, `Achievement`, `UserAchievement`, `GamificationEvent`, `Title`, `UserTitle`, `SkillTrack`, `SkillTrackCategory`, `Mission`, `UserMission`, `ArenaMatch`, `ActivityLog` e `Season`.

Há dados derivados persistidos em `User` (`xp`, contadores, streak e rating). Essa escolha é válida para leitura rápida, mas exige invariantes transacionais e testes de concorrência que hoje estão incompletos.

### Autenticação

1. Cadastro/login geram access token de 15 minutos e refresh token de 30 dias.
2. Ambos são gravados em cookies HTTP-only; refresh tokens são persistidos apenas como hash.
3. O refresh revoga o token anterior e cria outro.
4. O middleware consulta o usuário em cada requisição protegida, mantendo role atualizada.
5. OAuth usa Passport, state em cookie e depois cria o mesmo par de tokens.
6. O frontend guarda apenas o usuário no `localStorage`, embora ainda mantenha limpeza de chaves antigas de tokens.

### Fluxo de quiz

1. O cliente envia categorias, dificuldade e quantidade.
2. A API valida categorias, usa `ORDER BY RANDOM()` e cria `QuizSession`.
3. O cliente envia exatamente uma resposta por pergunta.
4. A API verifica ownership, alternativas e duplicidade de pergunta.
5. Em transação, cria `QuizResult`/`QuizAnswer`, incrementa uso e aplica gamificação.
6. `sessionId` único impede dois resultados persistidos para a mesma sessão, mas concorrência retorna erro Prisma/500 em vez de conflito controlado.

### Fluxo de ranking

- Ranking público usa XP real e retorna no máximo 10 usuários.
- Rankings autenticados geral/arena/contribuidores também retornam 10.
- Ranking por categoria apenas filtra quem já respondeu naquela categoria, mas ordena pelo XP global; não representa desempenho real da categoria.

### Fluxo de gamificação

- A aplicação por resultado usa guarda atômica em `gamificationAppliedAt`.
- XP combina conclusão, acertos, dificuldade, primeira categoria, perfeito, streak, missão e achievement.
- Achievements têm unicidade por usuário/achievement.
- Daily missions usam chave composta por usuário, missão e fim do dia UTC.
- Mastery e skills são derivados de respostas reais.
- Concorrência entre resultados diferentes do mesmo usuário ainda pode duplicar bônus diários ou causar conflito de achievement.

### Recuperação de senha

- `POST /auth/forgot-password` normaliza o e-mail e usa resposta neutra contra enumeração.
- O token aleatório é enviado por e-mail, mas somente SHA-256 é persistido.
- Tokens anteriores do usuário são removidos; expiração é configurável.
- `POST /auth/reset-password` consome atomicamente o token, troca a senha e remove refresh sessions.
- Em desenvolvimento sem Resend, o link é impresso no log. Em produção sem `RESEND_API_KEY`/`EMAIL_FROM`, o envio falha, é registrado e a resposta permanece neutra.
- O envio real depende de `EMAIL_FROM` em domínio verificado no Resend. Não foi possível verificar as variáveis do Railway nem o domínio externo nesta auditoria.

### Contribuições e revisão

- Usuário cria pergunta pendente; admin cria diretamente aprovada.
- Reviewer/admin aprova ou rejeita com checklist/reason.
- Aprovação gera XP para o autor e evento.
- Rejeitar uma pergunta já aprovada e aprová-la novamente pode premiar XP outra vez.

### Frontend

- `main.tsx` registra todas as rotas com imports estáticos.
- `AuthContext` gerencia sessão e refresh indireto via interceptor Axios.
- React Query é usado em Home, Dashboard, Ranking, Admin e dados de gamificação.
- Dashboard usa dados reais de perfil, skills, ranking, gamificação, achievements e missões.
- Quiz usa sessão real da API e `sessionStorage` apenas para sobreviver à navegação/reload.
- Arena é totalmente local/mockada e não chama a API.
- Arquivos excessivos: `AuthPages.tsx` (1371 linhas) e `Admin.tsx` (1355 linhas).

### Infraestrutura

- Frontend: Vercel, build Vite e rewrite SPA.
- API: Railway, `prisma migrate deploy` antes de `node dist/server.js`.
- Produção observada: frontend e `/health` retornaram HTTP 200; CORS da API retorna o domínio principal da Vercel.
- Vercel contém variáveis de backend (`JWT_*`, OAuth secrets/callbacks) que não pertencem ao projeto frontend. Sem prefixo `VITE_` elas não entram no bundle, mas ampliam o risco operacional.

### Dependências críticas

- Runtime: Express, Prisma, jsonwebtoken, bcryptjs, Passport, Resend, React, React Router, React Query, Axios, Zod.
- `npm audit`: 5 avisos totais, incluindo Vitest crítico e Vite alto. Os avisos conhecidos são principalmente de servidores de desenvolvimento/teste, não do artefato estático servido pela Vercel, mas precisam de atualização compatível e validação de breaking changes.

### Duplicação e acoplamentos perigosos

- Tipos de usuário e respostas são repetidos entre backend/frontend em vez de compartilhados.
- Endpoints antigos de achievements/missions coexistem com `/gamification`, criando duas fontes de contrato.
- Ranking público e autenticado têm implementações distintas.
- `packages/shared/src/index.js` é artefato gerado rastreado ao lado de `index.ts`.
- `apps/web/tsconfig.tsbuildinfo` continua rastreado apesar do `.gitignore`.

## Problemas Críticos

| Severidade | Arquivo/módulo | Impacto | Como corrigir |
|---|---|---|---|
| P0 | `prisma/migrations/20260618120000...` e `schema.prisma` | A migration cria índice sobre `Question.isActive`, mas nenhuma migration anterior cria a coluna. `reviewedById` e `reviewedAt` também não aparecem na cadeia. Um shadow database limpo falha com P3006. Novos ambientes e recuperação de desastre não são reproduzíveis. | Criar uma baseline/migration corretiva validada em banco vazio e em cópia do banco atual; nunca editar migration já aplicada sem plano de reconciliação. |
| P0 | `arena.controller.ts:11`, `arena.service.ts:13-33` | Qualquer usuário autenticado informa `correctCount`; `>=7` concede +50 rating e achievement. Duas submissões concorrentes podem passar pela leitura de `completedAt` e duplicar rating/eventos. | Desativar as mutações até existir partida server-authoritative, respostas/tempo validados e update condicional atômico. |
| P0 | `config/env.ts:31-32` | Segredos JWT conhecidos são defaults válidos inclusive em produção. Uma variável ausente pode iniciar a API com chaves previsíveis. | Tornar JWT obrigatório e forte quando `NODE_ENV=production`; falhar no boot. |
| P1 alto | `gamification.service.ts:156-217,220-325` | Resultados concorrentes do mesmo usuário podem conceder streak/daily mission mais de uma vez ou gerar conflitos de achievement. A guarda é por quiz, não por usuário/dia/missão. | Adotar idempotency keys/eventos únicos, updates condicionais e/ou lock transacional por usuário. Criar testes concorrentes. |
| P1 alto | `auth.service.ts:281-380`, `passport.ts` | OAuth vincula automaticamente uma conta existente por e-mail. GitHub não valida explicitamente `verified`; Google aceita estado `undefined`. Isso pode vincular identidade indevida e ainda sobrescreve o único par provider/providerId. | Exigir e-mail verificado, normalizado e fluxo explícito de account linking; modelar múltiplas identidades OAuth por usuário. |
| P1 alto | `question.service.ts:136-184` | Rejeitar uma pergunta aprovada e aprová-la novamente premia XP de contribuição novamente. | Registrar concessão idempotente com chave única por pergunta/tipo ou premiar apenas a primeira transição válida. |

## Problemas Importantes

| Severidade | Impacto | Sugestão de correção |
|---|---|---|
| Alta | `questionSchema` exige quatro alternativas, mas não exatamente uma correta. Admin pode publicar pergunta inválida diretamente. | Refinement Zod e validação no service; teste zero/duas corretas. |
| Alta | `updatePassword` não revoga refresh tokens; sessões roubadas continuam renováveis após troca de senha. | Revogar todas as refresh sessions na mesma transação da troca. |
| Alta | Rotas de reports/arena e update de perguntas não validam body/params. Cast de status pode virar 500; strings sem limite podem ser persistidas. | Schemas estritos para body, params e query; mapear erros Prisma para 404/409/422. |
| Alta | `admin/reports` usa `include: { user: true }`, retornando scalars sensíveis como `passwordHash`, providerId e contadores desnecessários ao admin. | Usar `select` mínimo e DTO explícito. |
| Alta | Registro/login não fazem `trim().toLowerCase()`; unique do PostgreSQL é case-sensitive. Contas duplicadas e inconsistência com OAuth são possíveis. | Normalizar antes da persistência e criar índice único case-insensitive/CITEXT após deduplicação. |
| Alta | A Arena do frontend é mock, mas é apresentada como funcional e afirma que a API impede duplicidade. | Marcar “em breve” e remover chamadas/rotas de risco até a implementação real. |
| Média-alta | Rate limiter único cobre todo `/auth`; em proxy/NAT pode bloquear `me`, refresh e OAuth junto com tentativas de login. `trust proxy` não está explícito. | Configurar proxy do Railway e separar limiters por ação sensível. |
| Média-alta | Cookies cross-site usam `SameSite=None`; não há proteção CSRF explícita. Logout e endpoints POST sem body são especialmente simples de disparar. | CSRF token/origin checks em mutações e cookies com escopo/path mínimo. |
| Média | API retorna access/refresh token no JSON mesmo usando cookies HTTP-only e aceita refresh no body/Bearer legado. | Retornar somente usuário/estado e remover transportes legados após migração. |
| Média | `WEB_ORIGINS` é documentado no `.env.example`, mas não existe no schema nem no CORS; previews/LAN falham. | Parsear allowlist e validar `Origin` dinamicamente. |
| Média | `findUniqueOrThrow`/P2025 e outras exceções Prisma viram 500, gerando status inconsistentes. | Camada de tradução de erros ou buscas explícitas. |
| Média | Frontend não define CSP, `frame-ancestors`, `X-Content-Type-Options` ou `Referrer-Policy` no Vercel. | Adicionar headers em `vercel.json`, compatíveis com Formspree/API/imagens. |
| Média | Segredos de backend estão cadastrados no projeto Vercel do frontend. | Remover após confirmar que Railway possui os valores corretos e rotacionar se necessário. |
| Média | Página `/admin` não tem role guard no cliente; a API bloqueia, mas acesso direto gera UX quebrada. | ProtectedRoute com roles e página 403. |
| Média | Mobile Home esconde navegação e “Entrar”, sem menu substituto. | Menu acessível ou link de login visível. |

## Melhorias Recomendadas

### Arquitetura

- Extrair DTOs/contracts para `packages/shared` sem acoplar Prisma ao frontend.
- Dividir `AuthPages.tsx`, `Admin.tsx`, `auth.service.ts` e `gamification.service.ts` por responsabilidade.
- Mover consultas dos controllers para services/repositories.
- Unificar endpoints legados de profile achievements/missions com `/gamification`.
- Criar serviço transacional de ledger de XP em vez de atualizar `User.xp` em vários fluxos.
- Adotar observabilidade estruturada com request ID, nível e redaction; não registrar token/reset URL em produção.

### Segurança

- Corrigir Arena, JWT defaults, OAuth linking, revogação de sessão e exposição em reports.
- Validar todos os inputs e limitar tamanho/paginação.
- Definir algoritmo, issuer e audience nos JWTs.
- Implementar detecção de replay/família de refresh tokens.
- Aplicar CSRF/origin validation e security headers no frontend.
- Remover secrets do provedor errado e documentar rotação.

### UX/UI

- Resultado visual: Home e Login renderizaram corretamente em 1440×900 e 390×844, sem overlay nem erros/warnings de console.
- O Halo Dark tem boa consistência de cor, spacing, cards, foco e labels nos fluxos públicos observados.
- Adicionar navegação mobile, estado “em breve” para Arena e mensagens de retry nos estados de erro.
- Revisar foco preso/Escape/restauração de foco nos modais do Admin.
- Tornar claims da Home consistentes com funcionalidades reais (`Top 100` vs API limitada a 10; Arena/PvP ainda não implementada; Firebase listado sem uso no projeto).
- Informar claramente falha operacional do e-mail sem revelar existência de conta; hoje o usuário sempre recebe a mensagem neutra, mesmo quando Resend falha.

### Performance

- Bundle Vite atual: aproximadamente 734 kB minificado / 222 kB gzip; todas as páginas são importadas no entrypoint.
- Usar `React.lazy`/route-level splitting para Admin, Dashboard, Quiz, Arena e páginas institucionais.
- `quiz-hero.png` tem 2,4 MB; converter para WebP/AVIF e gerar tamanhos responsivos.
- Existem duas cópias idênticas do logo (cerca de 184 kB cada).
- `ORDER BY RANDOM()` degrada com banco grande; usar estratégia de amostragem/indexação.
- `masteryMetrics` e `getSkillMap` carregam todo o histórico de respostas; agregar no PostgreSQL ou materializar progresso.
- Dashboard dispara seis queries; algumas recalculam os mesmos dados. Considerar endpoint agregado e `staleTime` coerente.
- Adicionar paginação a perguntas comuns, reports, reviews e históricos administrativos.

### Banco

- Reparar e testar migrations em banco vazio antes de qualquer release adicional.
- Adicionar FKs ausentes para `QuizSession.userId/categoryId` e `ArenaMatch.winnerId`, conforme semântica desejada.
- Avaliar relação/FK para `QuizAnswer.selectedOptionId` ou documentar snapshot histórico.
- Adicionar índices orientados às queries: refresh token por usuário/expiração; quiz result por usuário/data; answers por result/question; reports por status/data; reviews por question/data; arena por players/data; activity por usuário/data.
- Criar constraints/invariantes para contadores não negativos e consistência do resultado.
- Definir política de retenção para refresh/reset tokens, sessions, events e activity logs.

### Qualidade de código

- Remover `tsconfig.tsbuildinfo` e `packages/shared/src/index.js` do índice Git.
- Remover snapshots antigos de `backend-map` ou automatizar sua regeneração para evitar documentação divergente.
- Padronizar mensagens/status em português ou inglês, não ambos.
- Criar formatter/check de CI; atualmente não há script `format:check`.
- Atualizar Vite/Vitest em branch dedicada por envolver versões major sugeridas pelo audit.

## Funcionalidades Faltantes

### MVP

- Desativação ou implementação segura da Arena.
- Migrations reproduzíveis e rotina de backup/restore testada.
- Recuperação de senha verificada ponta a ponta com domínio Resend real.
- Normalização de e-mail e linking OAuth seguro.
- Validação completa das rotas e tradução de erros Prisma.
- Revogação de sessões após mudança de senha.
- Idempotência concorrente de XP/streak/missions/contribuições.
- Paginação mínima em reports/reviews/perguntas.
- Navegação mobile e role guard do Admin.
- Remoção de claims/mocks apresentados como dados reais.

### Pós-MVP

- Histórico detalhado e filtros de quizzes.
- Busca/filtros avançados de perguntas e reports.
- Analytics por categoria e recomendações de revisão.
- Notificações de aprovação/rejeição e achievements.
- Exportação/eliminação de dados pessoais.
- Painel de sessões e “sair de todos os dispositivos”.
- Missões semanais e achievements adicionais com ledger idempotente.

### Futuro

- Arena multiplayer server-authoritative, matchmaking e tempo real.
- Leaderboards sazonais ligados a `Season`.
- Squads/desafios semanais apenas após anti-cheat e ledger confiável.
- PWA/push notifications após estratégia de cache e privacidade.
- Recomendações adaptativas/IA somente com telemetria e consentimento definidos.

## Achievements e Mecânicas Pendentes

- Existentes: primeiro quiz, 10/50 quizzes, quiz perfeito, streak 3/7/30, mastery frontend/backend/database, contributor e primeira vitória na Arena.
- Prioridade alta: corrigir idempotência e concorrência antes de adicionar achievements.
- Próximos de valor real: primeira contribuição aprovada (idempotente), consistência semanal, melhoria de domínio por categoria e diversidade de categorias.
- Evitar badges puramente volumétricas antes de calibrar qualidade e antifraude.
- A API já retorna código, recompensa, ícone, progresso e timestamps suficientes para animações básicas; eventos devem ganhar identificador/idempotency key e payload versionado.

## Testes e Lacunas

Cobertura existente: login do service, recuperação de senha, e-mail Resend, início de quiz, fórmulas básicas de XP/nível e ranking público.

Testes mínimos ausentes ou insuficientes:

- integração register/login/cookies/refresh rotation/logout;
- OAuth state, e-mail não verificado, linking e concorrência;
- autorização de admin/reviewer/usuário em todas as rotas;
- validação de body/query/params e tradução de Prisma errors;
- submissão completa de quiz, ownership, duplicidade e concorrência;
- XP real, achievement unlock, streak diário e daily missions em concorrência;
- aprovação/rejeição e XP idempotente de contribuição;
- Arena/anti-cheat — ou teste de endpoint desativado;
- frontend: nenhum teste automatizado de componentes, rotas ou e2e está presente;
- teste de migrations em PostgreSQL vazio no CI.

## Plano de Execução Priorizado

1. **Fechar Arena mutável** — impedir fraude imediata. Arquivos: arena routes/controller/service e página Arena. Risco baixo ao desativar; esforço 0,5 dia.
2. **Reparar migrations** — restaurar reprodutibilidade. Arquivos: migrations/schema/CI. Risco alto por histórico já aplicado; esforço 1–2 dias com clone do banco.
3. **Endurecer configuração de produção** — JWT obrigatório, proxy, CORS allowlist e secrets no provedor correto. Risco médio; esforço 0,5–1 dia.
4. **Corrigir invariantes de gamificação** — ledger/idempotência/locks. Arquivos: schema, migration, gamification/question/arena services. Risco alto; esforço 2–4 dias.
5. **Endurecer identidade** — normalização de e-mail, OAuth identities e revogação de sessões. Risco alto; esforço 2–3 dias.
6. **Completar validação/erros** — schemas de params/query/body e DTOs. Risco médio; esforço 1–2 dias.
7. **Eliminar exposição de dados** — reports selects, tokens em respostas e logs. Risco baixo; esforço 0,5 dia.
8. **Adicionar testes críticos e migration CI** — risco baixo; esforço 2–3 dias.
9. **Alinhar frontend ao produto real** — Arena em breve, role guard, mobile nav e estados de erro. Risco baixo; esforço 1–2 dias.
10. **Otimizar entrega** — lazy routes, imagens e agregações. Risco médio; esforço 1–3 dias.

## Checklist de Produção

- [x] `npm run build` passava no commit auditado; deve ser executado novamente após este relatório.
- [ ] migrations reproduzíveis/aplicadas — cadeia falha em shadow database limpo.
- [ ] seed executado quando necessário e idempotente em ambiente controlado.
- [ ] env vars do Railway conferidas — sem acesso verificável nesta auditoria.
- [x] `VITE_API_URL` existe na Vercel.
- [x] CORS funciona para o alias principal observado.
- [ ] CORS para aliases/previews e allowlist validado.
- [ ] OAuth callback URLs verificadas nos provedores e no Railway.
- [ ] Resend configurado no Railway e envio real testado.
- [ ] domínio de e-mail verificado no Resend.
- [x] ranking público usa dados reais.
- [ ] gamificação segura sob concorrência.
- [x] admin protegido no servidor.
- [ ] frontend responsivo em todos os fluxos autenticados; Home/Login públicos foram verificados.
- [ ] sem mocks em fluxos reais — Arena ainda é mock.
- [x] sem `console.log/table/debug` no frontend; existe `console.info` apenas em DEV.
- [x] `.env` não está rastreado.
- [ ] `tsconfig.tsbuildinfo` não rastreado — atualmente está rastreado.
- [ ] security headers do frontend configurados.
- [ ] dependências vulneráveis atualizadas e retestadas.

## Próximos 10 Passos Recomendados

1. Desativar imediatamente `/arena/start` e `/arena/submit` e marcar Arena como “em breve”.
2. Fazer snapshot/clone do banco e corrigir a cadeia de migrations com validação em banco vazio.
3. Tornar JWT secrets obrigatórios em produção e remover secrets do projeto Vercel frontend.
4. Revogar refresh tokens na troca de senha e reduzir os transportes de token a cookies HTTP-only.
5. Normalizar e-mails e redesenhar OAuth para identidades verificadas e múltiplos providers.
6. Implementar ledger/idempotência para XP, streak, missions, achievements e contribuição.
7. Adicionar schemas estritos a reports, Arena, update de perguntas, params e queries; corrigir status codes Prisma.
8. Criar testes de autorização, concorrência, quiz submit, gamificação e migrations em CI.
9. Corrigir navegação mobile, role guard do Admin e claims de funcionalidades não entregues.
10. Aplicar route splitting, otimizar imagens e agregar queries de mastery/skills.

## Correções Impeditivas Aplicadas Após o Diagnóstico

Estas alterações foram feitas somente depois da criação inicial deste relatório e permanecem sem commit:

- Arena bloqueada no service com HTTP 503; nenhum rating/XP pode ser concedido pelo protótipo baseado em pontuação do cliente.
- Página da Arena alterada para estado explícito “Em breve”, com ação desabilitada.
- Boot de produção agora falha quando `JWT_ACCESS_SECRET` ou `JWT_REFRESH_SECRET` estão ausentes/fracos, em vez de usar defaults conhecidos.
- Listagem administrativa de reports passou a selecionar apenas os campos necessários e não retorna `passwordHash`/providerId.
- Migration idempotente `20260618110000_add_question_lifecycle_fields` adicionada antes do índice dependente para reparar bancos limpos e reconciliar bancos que receberam as colunas fora do histórico.

Pendências intencionalmente não corrigidas nesta etapa: concorrência do ledger de gamificação, redesign de OAuth, normalização case-insensitive de e-mail e upgrade major de dependências. Esses itens exigem migration/modelagem e testes específicos para não introduzir regressões.

## Consolidação das Correções — 20/06/2026

Esta seção substitui o estado das pendências descrito acima. As correções continuam sem commit e sem deploy.

- Autenticação restrita a cookies HTTP-only; tokens não são mais retornados no JSON nem aceitos por Bearer token.
- CORS e validação de `Origin` usam allowlist; produção confia em apenas um proxy e exige secrets JWT fortes, issuer e audience.
- Rate limiting foi separado entre credenciais e renovação de sessão; replay de refresh token revoga as sessões ativas.
- E-mails são normalizados e têm unicidade case-insensitive; OAuth exige e-mail verificado e suporta identidades separadas por provider.
- Troca de senha revoga todas as sessões em uma única transação.
- Schemas estritos cobrem bodies, params e queries; erros conhecidos do Prisma viram respostas HTTP adequadas.
- Perguntas exigem exatamente uma alternativa correta; aprovação e rejeição validam o estado persistido.
- Quiz tem expiração de sessão e chaves estrangeiras para usuário, categoria e alternativa selecionada.
- XP, streaks, missões, achievements e contribuições têm `sourceKey` idempotente e lock transacional por usuário.
- Ranking por categoria usa desempenho na categoria; métricas de habilidade são agregadas no PostgreSQL.
- Arena permanece bloqueada com HTTP 503 até existir validação server-side das respostas.
- Rotas administrativas são protegidas também no frontend; estado local não persiste PII do usuário.
- Rotas foram divididas em chunks, imagens principais foram otimizadas e o bundle inicial caiu para 310,19 kB (102,40 kB gzip).
- Headers de segurança foram adicionados à configuração da Vercel e secrets exclusivos do backend foram removidos do projeto frontend.
- Vite/Vitest foram atualizados e `npm audit --omit=dev` reporta zero vulnerabilidades.

### Evidências finais

- `npm run validate`: build, lint, Prettier e 39 testes aprovados.
- Prisma Client 5.22.0 regenerado com engine completo.
- As 7 migrations foram aplicadas com sucesso em schema PostgreSQL vazio; `prisma migrate status` confirmou o banco atualizado e o schema de teste foi removido.
- Preflight somente leitura no banco atual: zero e-mails normalizados duplicados e zero órfãos nas novas relações.
- QA Playwright: Home desktop e Login mobile renderizados; bloqueio CORS também foi confirmado para origem fora da allowlist.

### Bloqueios externos restantes

- Railway não possui `RESEND_API_KEY` nem `EMAIL_FROM`. Recuperação de senha e e-mails transacionais só ficarão operacionais após configurar credenciais reais e domínio/remetente verificado no Resend.
- Os callbacks OAuth precisam de teste manual nos consoles Google/GitHub com contas reais; os secrets e URLs estão no backend, não no frontend.
- As migrations novas ainda precisam ser aplicadas no ambiente de produção durante a janela de release. Nenhum deploy foi executado nesta correção.
