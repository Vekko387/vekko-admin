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
corepack pnpm test
corepack pnpm build
```

## Autenticação

O Firebase autentica a identidade, enquanto a API consulta o usuário e suas
roles no PostgreSQL por `GET /api/v1/auth/me`. Contas de cliente ou parceiro não
acessam este painel. A análise de solicitações de parceria permanece restrita a
`ADMIN` e `SUPER_ADMIN`, com autorização definitiva aplicada pela API.

Configure em `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

O frontend não contém credenciais administrativas do Firebase nem permite
atribuição de roles.
