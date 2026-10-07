# ==============================================================================
# GENERIC TEMPLATE: Angular (or any npm-built single-page app), compiled to
# static files and served by nginx on port 80. Nothing here names a project:
# point it at any folder with package.json, package-lock.json and a build script.
#
# Settings, all as --build-arg:
#   RUNTIME_VERSION  Node major version used for the build       (default 22)
#   BUILD_SCRIPT     npm script that builds the app              (default build)
#   DIST_DIR         folder holding index.html after the build
#                                                  (default dist/*/browser)
#
# The API addresses are NOT compiled in. When the container starts it writes
# them into /app-config.js from two environment variables:
#   AUTH_URL     address the browser uses for the auth service
#   BACKEND_URL  address the browser uses for the trade API
# Left empty, the page calls the address it was loaded from, which is what a
# single load balancer with path routing needs. So one image runs everywhere.
#
# The app has to read that file. Two small changes, once per project:
#   1. in src/index.html, inside <head>:   <script src="app-config.js"></script>
#   2. where the API base addresses are defined, prefer the run-time value:
#        const runtime = (globalThis as any).__APP_CONFIG__ ?? {};
#        export const authBaseUrl  = runtime.authBaseUrl  ?? 'http://localhost:3000';
#        export const tradeBaseUrl = runtime.tradeBaseUrl ?? 'http://localhost:8081';
#
#   docker build -f deploy/docker/angular.Dockerfile -t my-frontend path/to/app
#   docker run -p 4200:80 -e AUTH_URL=http://<ip>:3000 -e BACKEND_URL=http://<ip>:8081 my-frontend
# ==============================================================================

ARG RUNTIME_VERSION=22

# ---------- Stage 1: build the static files ----------------------------------
FROM node:${RUNTIME_VERSION}-alpine AS build
WORKDIR /app

# package*.json before the source: this layer is reused until the
# dependencies change. --ignore-scripts because a project's own postinstall
# script may need source files that are not copied yet. If the lock file has
# fallen behind package.json, npm ci refuses and npm install is used instead.
COPY package*.json ./
RUN npm ci --no-fund --no-audit --ignore-scripts || npm install --no-fund --no-audit --ignore-scripts

COPY . .
ARG BUILD_SCRIPT=build
RUN npm run ${BUILD_SCRIPT}

# Collect the output in one fixed place, whatever the project is called.
ARG DIST_DIR=dist/*/browser
RUN mkdir /site && cp -r ${DIST_DIR}/. /site/ && test -f /site/index.html

# ---------- Stage 2: nginx serving the files ---------------------------------
FROM nginx:1.27-alpine AS runtime

COPY --from=build /site /usr/share/nginx/html

COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # Unknown paths are routes inside the app, so they get the page.
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Rewritten on every container start, so it must never come from a cache.
  location = /app-config.js {
    add_header Cache-Control "no-store";
  }

  # The page names the hashed script files of the current build.
  location = /index.html {
    add_header Cache-Control "no-cache";
  }
}
NGINX

# nginx runs every script in /docker-entrypoint.d before it starts serving.
COPY --chmod=755 <<'SCRIPT' /docker-entrypoint.d/40-app-config.sh
#!/bin/sh
set -eu
AUTH_URL="${AUTH_URL:-}"
BACKEND_URL="${BACKEND_URL:-}"
cat > /usr/share/nginx/html/app-config.js <<CONFIG
window.__APP_CONFIG__ = {
  authBaseUrl: "${AUTH_URL%/}",
  tradeBaseUrl: "${BACKEND_URL%/}"
};
CONFIG
echo "app-config.js: auth='${AUTH_URL%/}' trade='${BACKEND_URL%/}' (empty = same address as the page)"
SCRIPT

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=5 \
    CMD wget -qO- http://localhost/ >/dev/null || exit 1
