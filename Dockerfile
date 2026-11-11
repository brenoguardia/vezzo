# Servidor Expo (API Routes) em Node. Prisma/MongoDB exigem runtime Node (engine nativo).
FROM node:22-bookworm-slim AS build
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=oven/bun:1.4.4 /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY package.json bun.lock ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile
COPY . .
# Variáveis EXPO_PUBLIC_* são gravadas no bundle durante o export (o .env fica fora da imagem pelo .dockerignore).
# No Dokploy, defina-as em Environment → Build-time Arguments.
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_SENTRY_DSN
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL \
    EXPO_PUBLIC_SENTRY_DSN=$EXPO_PUBLIC_SENTRY_DSN
RUN test -n "$EXPO_PUBLIC_API_URL" || (echo "ERRO: defina o build arg EXPO_PUBLIC_API_URL (URL pública da API)" && exit 1)
RUN bun x expo export --platform web

FROM node:22-bookworm-slim
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./server.js
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
