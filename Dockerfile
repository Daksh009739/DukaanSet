FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG DUKAANSET_GIT_SHA
ARG DUKAANSET_GIT_BRANCH
ARG DUKAANSET_ENV=staging
ARG NEXT_PUBLIC_SITE_URL
ENV DUKAANSET_GIT_SHA=$DUKAANSET_GIT_SHA DUKAANSET_GIT_BRANCH=$DUKAANSET_GIT_BRANCH DUKAANSET_ENV=$DUKAANSET_ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run typecheck && npm test && npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/scripts ./scripts
COPY --from=build --chown=node:node /app/package.json /app/next.config.ts /app/.dukaanset-build.json ./
USER node
EXPOSE 3000
CMD ["node", "scripts/start-backend.mjs"]
