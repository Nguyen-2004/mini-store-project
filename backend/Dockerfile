# syntax=docker/dockerfile:1
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --include=optional --libc=musl
COPY prisma ./prisma
COPY prisma.config.js ./
RUN npm run db:generate
COPY src ./src
COPY scripts ./scripts
COPY --chown=node:node docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1
CMD ["./docker-entrypoint.sh"]
