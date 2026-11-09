# 11 · Hospedagem (spike da Fase 0)

## Decisão
**Servidor Node com o adaptador `expo-server/adapter/express`**, não o EAS Hosting.

## Evidências
- **EAS Hosting** (`eas deploy`): `GET /api/health` funciona (200). Qualquer rota que usa Prisma falha na inicialização:
  `PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "debian-openssl-1.1.x"`.
  O runtime é de workers (Cloudflare), sem acesso ao engine nativo do Prisma; `binaryTargets` não resolve. O Prisma 6 não oferece driver adapter para MongoDB, então não há caminho sem o engine.
- **Node (`server.js`)**: o build (`bun run build:server`) serve `/api/health` e a rota de spike. Prisma Client carregou o engine, `resend` importou e a conexão com o Atlas foi estabelecida. Create e count via Prisma no Atlas M0 funcionaram (~2 s na primeira chamada, incluindo conexão). Atenção: a `DATABASE_URL` precisa conter o nome do banco (`.../vezzo?...`), senão o Atlas responde `empty database name not allowed`.

## Como rodar
- Local: `bun run build:server && node --env-file=.env server.js` (porta `PORT`, padrão 3000).
- Produção: `Dockerfile` (Node 22 + openssl, build com Bun). Hosts sugeridos: Railway, Fly.io ou Render. Variáveis secretas ficam no host; `EXPO_PUBLIC_API_URL` e o `origin` do plugin `expo-router` apontam para a URL pública.
- O EAS Hosting segue útil para o web export estático/preview de `/api/health`, mas não para rotas com banco.

## Limpeza
A rota e o modelo de spike foram removidos; `prisma/schema.prisma` mantém só generator e datasource até a Fase 1.
