# ==============================================================================
# GENERIC TEMPLATE: Node.js service (npm) with a build step, such as NestJS
# or any TypeScript project. Nothing here names a project: point it at any
# folder with package.json, package-lock.json and src/.
#
# Settings, all as --build-arg (docker-compose and the pipeline pass them from
# config/application.yaml):
#   RUNTIME_VERSION  Node major version                          (default 22)
#   APP_PORT         port the app listens on                     (default 3000)
#   HEALTH_PATH      HTTP path that answers 200 when the app is up,
#                    or "" for no health check                   (default /)
#   NEEDS_BUILD      "true" runs `npm run build`; "false" for plain JavaScript
#   BUILD_OUTPUT     folder the build writes to                  (default dist)
#   START_CMD        command the container runs      (default "node dist/main.js")
#
#   docker build -f deploy/docker/node.Dockerfile --build-arg APP_PORT=3000 \
#                -t my-service path/to/service
# ==============================================================================

ARG RUNTIME_VERSION=22

# ---------- Stage 1: install everything and build ----------------------------
FROM node:${RUNTIME_VERSION}-alpine AS build
WORKDIR /app

# package*.json before the source: this layer is reused until the
# dependencies change.
# npm ci installs exactly what package-lock.json lists. If the lock file has
# fallen behind package.json it refuses, and npm install is used instead.
COPY package*.json ./
RUN npm ci --no-fund --no-audit || npm install --no-fund --no-audit

# Build settings (wildcards, so a missing file is not an error) and source.
COPY tsconfig*.json* nest-cli.json* ./
COPY src ./src

ARG NEEDS_BUILD=true
RUN if [ "$NEEDS_BUILD" = "true" ]; then npm run build; fi

# ---------- Stage 2: runtime, production dependencies only -------------------
FROM node:${RUNTIME_VERSION}-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --no-fund --no-audit || npm install --omit=dev --no-fund --no-audit

ARG BUILD_OUTPUT=dist
COPY --from=build /app/${BUILD_OUTPUT} ./${BUILD_OUTPUT}
RUN chown -R node:node /app

ARG APP_PORT=3000
# Most Node servers read PORT. docker-compose and Kubernetes set it too.
ENV APP_PORT=${APP_PORT} PORT=${APP_PORT}
EXPOSE ${APP_PORT}

USER node

ARG HEALTH_PATH=/
ENV HEALTH_PATH=${HEALTH_PATH}
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD [ -z "$HEALTH_PATH" ] || wget -qO- "http://localhost:${PORT}${HEALTH_PATH}" >/dev/null || exit 1

ARG START_CMD="node dist/main.js"
ENV START_CMD=${START_CMD}
ENTRYPOINT ["sh", "-c", "$START_CMD"]
