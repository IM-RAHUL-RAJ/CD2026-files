#!/usr/bin/env bash
# Roll the cluster to one image tag: deploy/k8s with the four images taken
# from ECR at <tag>, and the load balancer's address written into the
# settings that need it.
#
#   deploy/scripts/deploy.sh <tag>
#   RENDER_ONLY=1 deploy/scripts/deploy.sh <tag>     print what would be applied
set -euo pipefail
. "$(dirname "$0")/pipeline-env.sh"
TAG="${1:?usage: deploy.sh <tag>}"
REGISTRY="${REGISTRY:-$(registry)}"
[ -f "$DEPLOY/k8s/kustomization.yaml" ] || { echo "deploy/k8s is missing. Run: python3 deploy/config/apply.py eks" >&2; exit 1; }

lb_host() {
  kubectl -n "$NS" get ingress app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true
}

# Builds build/ from deploy/k8s: the address filled in, the images pinned.
render() {  # load balancer host, or "" when it does not exist yet
  rm -rf "$DEPLOY/build"; mkdir -p "$DEPLOY/build"
  cp -r "$DEPLOY/k8s" "$DEPLOY/build/base"
  [ -n "$1" ] && sed -i "s|LOAD_BALANCER_ADDRESS|$1|g" "$DEPLOY/build/base/configmap.yaml"
  {
    echo "apiVersion: kustomize.config.k8s.io/v1beta1"
    echo "kind: Kustomization"
    echo "resources:"
    echo "  - base"
    echo "images:"
    for role in "${ROLES[@]}"; do
      echo "  - name: ${IMAGE_PREFIX}-$(name_of "$role")"
      echo "    newName: ${REGISTRY}/${IMAGE_PREFIX}-$(name_of "$role")"
      echo "    newTag: \"${TAG}\""
    done
  } > "$DEPLOY/build/kustomization.yaml"
}

wait_for_rollout() {
  for role in "${ROLES[@]}"; do
    kubectl -n "$NS" rollout status "deployment/$(name_of "$role")" --timeout=10m
  done
}

HOST="${INGRESS_HOST-$(lb_host)}"
render "$HOST"
[ "${RENDER_ONLY:-}" = 1 ] && { kubectl kustomize "$DEPLOY/build"; exit 0; }

kubectl apply -k "$DEPLOY/build"
wait_for_rollout

# First deploy: the load balancer did not exist when the settings were
# written. Wait for its address, write it in, and restart the pods so they
# read it (a pod reads its settings only at start).
if [ -z "$HOST" ] && grep -q LOAD_BALANCER_ADDRESS "$DEPLOY/k8s/configmap.yaml"; then
  echo "==> Waiting for the load balancer address"
  for _ in $(seq 1 60); do
    HOST="$(lb_host)"; [ -n "$HOST" ] && break; sleep 5
  done
  [ -n "$HOST" ] || { echo "No address after 5 minutes. See: kubectl -n $NS describe ingress app" >&2; exit 1; }
  render "$HOST"
  kubectl apply -k "$DEPLOY/build"
  for role in "${ROLES[@]}"; do
    kubectl -n "$NS" rollout restart "deployment/$(name_of "$role")"
  done
  wait_for_rollout
fi

kubectl -n "$NS" get pods -o wide
echo
echo "Open:  http://$(lb_host)"
