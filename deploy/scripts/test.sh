#!/usr/bin/env bash
# Run the unit tests of every service, except those listed under
# kubernetes.skip_tests in config/project.yaml. Each runs in a throwaway Maven or Node container,
# so the machine needs neither Java nor Node installed.
#
#   deploy/scripts/test.sh
set -euo pipefail
. "$(dirname "$0")/pipeline-env.sh"
mkdir -p "$HOME/.m2"

for role in "${ROLES[@]}"; do
  [ "$(value_of "$role" TEST)" = true ] || continue
  dir="$PROJECT_DIR/$(value_of "$role" PATH)"
  version="$(value_of "$role" VERSION)"
  echo "==> tests: $(name_of "$role")"
  case "$(value_of "$role" TYPE)" in
    java)
      docker run --rm -u "$(id -u):$(id -g)" \
        -v "$dir":/app -w /app \
        -v "$HOME/.m2":/var/maven/.m2 -e MAVEN_CONFIG=/var/maven/.m2 \
        "maven:3.9.9-eclipse-temurin-${version}" mvn -B -q -Duser.home=/var/maven test
      ;;
    node|angular)
      # Tested on a copy inside the container, so no node_modules folder is
      # left behind in the workspace.
      docker run --rm -e HOME=/tmp -e npm_config_cache=/tmp/.npm \
        -v "$dir":/src:ro "node:${version}-alpine" sh -c \
        "cp -r /src /tmp/app && cd /tmp/app && rm -rf node_modules && (npm ci --no-audit --no-fund || npm install --no-audit --no-fund) && npm test"
      ;;
    *)
      echo "no test command for type $(value_of "$role" TYPE); skipped"
      ;;
  esac
done
