# Angular (or any npm-built single-page app), served by nginx on port 80.
# The app needs two small edits to read its API addresses when the container
# starts. Explained in GUIDE.html, step 5.

ARG RUNTIME_VERSION=22

# Stage 1: build the static files
FROM node:${RUNTIME_VERSION}-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-fund --no-audit --ignore-scripts || npm install --no-fund --no-audit --ignore-scripts

COPY . .
ARG BUILD_SCRIPT=build
RUN npm run ${BUILD_SCRIPT}

ARG DIST_DIR=dist/*/browser
RUN mkdir /site && cp -r ${DIST_DIR}/. /site/ && test -f /site/index.html

# Stage 2: nginx serves the files
FROM nginx:1.27-alpine AS runtime

COPY --from=build /site /usr/share/nginx/html

COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location = /app-config.js {
    add_header Cache-Control "no-store";
  }

  location = /index.html {
    add_header Cache-Control "no-cache";
  }
}
NGINX

# Runs when the container starts: writes the API addresses into app-config.js.
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
