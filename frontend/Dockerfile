# Сборка приложения
FROM node:lts-alpine3.22 AS builder

RUN corepack enable && corepack prepare yarn@4.10.3

WORKDIR /app

#COPY .yarn ./.yarn
COPY package.json yarn.lock .yarnrc.yml  ./

RUN yarn install --immutable

COPY . .

# ENV NEXT_PUBLIC_API_URL=/api

RUN yarn build

# Запуск приложения
FROM node:lts-alpine3.22 AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
