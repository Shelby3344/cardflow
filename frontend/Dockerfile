# Dockerfile para Frontend Next.js
FROM node:20-alpine AS base

# Instalar dependências apenas quando necessário
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Reconstruir o código-fonte apenas quando necessário
FROM base AS builder
WORKDIR /app

# Aceitar variáveis de ambiente de build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_VOICE_API_URL

# Definir as variáveis de ambiente para o build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_VOICE_API_URL=$NEXT_PUBLIC_VOICE_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js coleta telemetria completamente anônima sobre uso geral.
# Saiba mais aqui: https://nextjs.org/telemetry
# Descomente a linha abaixo para desabilitar a telemetria durante a build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Imagem de produção, copiar todos os arquivos e executar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Definir permissões corretas para cache prerender
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Aproveitar automaticamente as saídas de rastreamento para reduzir o tamanho da imagem
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js é criado pelo next build a partir da saída autônoma
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
