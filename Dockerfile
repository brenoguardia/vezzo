# Servidor Expo (API Routes) em Node. Prisma/MongoDB exigem runtime Node (engine nativo).
FROM node:22-bookworm-slim AS build
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=oven/bun:1.4.4 /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY package.json bun.lock ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile
COPY . .
RUN bunx expo export --platform web

FROM node:22-bookworm-slim
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./server.js
EXPOSE 3000
CMD ["node", "server.js"]
