# vekko-admin

Painel interno da equipe VEKKO, construído com Next.js, TypeScript, Tailwind
CSS e shadcn/ui.

## Desenvolvimento

```powershell
corepack pnpm install
Copy-Item .env.example .env.local
corepack pnpm dev -- --port 3001
```

## Qualidade

```powershell
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

A autenticação e os módulos operacionais serão implementados nas fases
seguintes. Não existem credenciais locais ou regras de negócio no frontend.
