#!/usr/bin/env bash
# Prove the deployed application answers through the load balancer. The
# checks are the `smoke` list in config/application.yaml: a path and the
# status it must return. A path that needs a login should expect 401, which
# proves both the route and the login check.
set -euo pipefail
. "$(dirname "$0")/pipeline-env.sh"
HOST="$(kubectl -n "$NS" get ingress app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')"
[ -n "$HOST" ] || { echo "Ingress has no address" >&2; exit 1; }
BASE="http://$HOST"

check() {  # path, expected status
  local code=""
  for _ in $(seq 1 30); do
    code="$(curl -s -o /dev/null -m 10 -w '%{http_code}' "$BASE$1" || true)"
    [ "$code" = "$2" ] && { echo "ok    $1 -> $code"; return; }
    sleep 10
  done
  echo "FAIL  $1 -> $code (wanted $2)" >&2
  return 1
}

for entry in ${SMOKE:-/=200}; do
  check "${entry%%=*}" "${entry##*=}"
done
echo "Smoke test passed: $BASE"
