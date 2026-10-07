#!/usr/bin/env bash
# One-time preparation of the cluster for this project. Safe to run again:
# every step checks before it creates.
#
#   deploy/scripts/bootstrap.sh
#
# Not done here, because they involve the network or are done once per
# database (see GUIDE.html): the VPC peering to RDS, and loading the schema
# (scripts/load-schema.sh).
set -euo pipefail
. "$(dirname "$0")/pipeline-env.sh"
HERE="$(dirname "$0")"

echo "==> ECR repositories"
for role in "${ROLES[@]}"; do
  repo="${IMAGE_PREFIX}-$(name_of "$role")"
  aws ecr describe-repositories --region "$AWS_REGION" --repository-names "$repo" >/dev/null 2>&1 ||
    aws ecr create-repository --region "$AWS_REGION" --repository-name "$repo" >/dev/null
done

echo "==> Disk add-on (EBS CSI)"
if ! aws eks describe-addon --cluster-name "$CLUSTER" --addon-name aws-ebs-csi-driver --region "$AWS_REGION" >/dev/null 2>&1; then
  NODEGROUP="$(aws eks list-nodegroups --cluster-name "$CLUSTER" --region "$AWS_REGION" --query 'nodegroups[0]' --output text)"
  NODE_ROLE="$(aws eks describe-nodegroup --cluster-name "$CLUSTER" --nodegroup-name "$NODEGROUP" --region "$AWS_REGION" \
    --query 'nodegroup.nodeRole' --output text | awk -F/ '{print $NF}')"
  aws iam attach-role-policy --role-name "$NODE_ROLE" --policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy
  aws eks create-addon --cluster-name "$CLUSTER" --addon-name aws-ebs-csi-driver --region "$AWS_REGION" >/dev/null
  aws eks wait addon-active --cluster-name "$CLUSTER" --addon-name aws-ebs-csi-driver --region "$AWS_REGION"
fi

"$HERE/install-lb-controller.sh"

echo "==> Namespace and Secret"
kubectl apply -f "$DEPLOY/k8s/namespace.yaml"
"$HERE/create-secret.sh"
echo "Cluster is ready. Next: deploy/scripts/build-push.sh <tag> && deploy/scripts/deploy.sh <tag>"
