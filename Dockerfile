FROM node:24-alpine AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max_old_space_size=8192"
RUN apk add --no-cache git && npm install --global corepack@latest && corepack enable

WORKDIR /app

ARG RAILWAY_GIT_COMMIT_SHA=self-hosted
ARG WEB_API_KEY=""
ARG WEB_OAUTH_CLIENT_ID=""
ARG WEB_OAUTH_CLIENT_SECRET=""
ARG DIM_API_KEY=""
ARG DIM_API_HOST=http://localhost:3000
ARG ANALYTICS_PROPERTY=""
ARG SENTRY_DSN=""
ARG DESTINY_ICONS_SHA=394ed051455e938f72ddd600d42cf87600ec7172

ENV VERSION="$RAILWAY_GIT_COMMIT_SHA"
ENV WEB_API_KEY="$WEB_API_KEY"
ENV WEB_OAUTH_CLIENT_ID="$WEB_OAUTH_CLIENT_ID"
ENV WEB_OAUTH_CLIENT_SECRET="$WEB_OAUTH_CLIENT_SECRET"
ENV DIM_API_KEY="$DIM_API_KEY"
ENV DIM_API_HOST="$DIM_API_HOST"
ENV ANALYTICS_PROPERTY="$ANALYTICS_PROPERTY"
ENV SENTRY_DSN="$SENTRY_DSN"
ENV HUSKY=0

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .
RUN rm -rf destiny-icons \
  && git init destiny-icons \
  && git -C destiny-icons remote add origin https://github.com/justrealmilk/destiny-icons.git \
  && git -C destiny-icons fetch --depth=1 origin "$DESTINY_ICONS_SHA" \
  && git -C destiny-icons checkout --detach FETCH_HEAD
RUN pnpm build:release

FROM caddy:2-alpine

COPY --from=build /app/dist/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
RUN rm /srv/Caddyfile

EXPOSE 8080
