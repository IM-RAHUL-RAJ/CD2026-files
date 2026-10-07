# Shared settings for the scripts in this folder. Sourced, not run.
# The values come from deploy/build.env, which config/apply.py writes from
# config/application.yaml.
DEPLOY="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$DEPLOY/build.env" ] || { echo "deploy/build.env is missing. Run: python3 deploy/config/apply.py" >&2; exit 1; }
set -a
. "$DEPLOY/build.env"
set +a
PROJECT_DIR="$(cd "$DEPLOY/$PROJECT_ROOT" && pwd)"
export AWS_REGION

# role -> the name of its image, container and Kubernetes objects
ROLES=(FRONTEND AUTH ORDER EXECUTOR)
name_of() {
  case "$1" in
    FRONTEND) echo frontend ;;
    AUTH)     echo auth-service ;;
    ORDER)    echo order-service ;;
    EXECUTOR) echo executor-service ;;
  esac
}
# value_of AUTH PORT -> the value of AUTH_PORT
value_of() { local key="$1_$2"; echo "${!key}"; }

registry() {
  echo "$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com"
}
