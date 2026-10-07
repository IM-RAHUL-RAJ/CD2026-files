#!/usr/bin/env bash
# Build the four images, push them to ECR under one tag, then remove the
# local copies so the build machine's disk does not fill up.
#
#   deploy/scripts/build-push.sh <tag>
set -euo pipefail
. "$(dirname "$0")/pipeline-env.sh"
TAG="${1:?usage: build-push.sh <tag>}"
REGISTRY="$(registry)"

aws ecr get-login-password --region "$AWS_REGION" |
  docker login --username AWS --password-stdin "$REGISTRY"

for role in "${ROLES[@]}"; do
  name="$(name_of "$role")"
  ref="${REGISTRY}/${IMAGE_PREFIX}-${name}:${TAG}"
  echo "==> ${IMAGE_PREFIX}-${name}"
  docker build \
    -f "$DEPLOY/docker/$(value_of "$role" TYPE).Dockerfile" \
    --build-arg RUNTIME_VERSION="$(value_of "$role" VERSION)" \
    --build-arg APP_PORT="$(value_of "$role" LISTEN)" \
    --build-arg HEALTH_PATH="$(value_of "$role" HEALTH)" \
    -t "$ref" "$PROJECT_DIR/$(value_of "$role" PATH)"
  docker push "$ref"
  # The image is safe in ECR; the cluster pulls it from there.
  docker rmi "$ref" >/dev/null
done

# Leftover layers from this and earlier builds. The build cache is kept (up
# to 4 GB) so the next build does not download every dependency again.
docker image prune -f >/dev/null
docker builder prune -f --keep-storage 4GB >/dev/null
docker system df
