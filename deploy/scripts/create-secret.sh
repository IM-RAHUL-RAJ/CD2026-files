#!/usr/bin/env bash
# Create or update the Secret `app-secrets` from deploy/.env. It gets one key
# for each name under `secrets` in config/application.yaml, so passwords and
# keys never reach git. Run it again after changing a value, then restart
# the pods.
#
#   deploy/scripts/create-secret.sh
set -euo pipefail
. "$(dirname "$0")/pipeline-env.sh"
[ -f "$DEPLOY/.env" ] || { echo "deploy/.env is missing; it holds the secret values" >&2; exit 1; }

args=()
for name in $SECRET_NAMES; do
  # The line as typed, without running it through the shell.
  value="$(grep -m1 "^${name}=" "$DEPLOY/.env" | cut -d= -f2- || true)"
  [ -n "$value" ] || { echo "$name is empty in deploy/.env" >&2; exit 1; }
  args+=(--from-literal="$name=$value")
done

kubectl -n "$NS" create secret generic app-secrets "${args[@]}" --dry-run=client -o yaml |
  kubectl apply -f -
