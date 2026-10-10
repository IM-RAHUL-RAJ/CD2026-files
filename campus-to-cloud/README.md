# From Campus to Cloud

A visual, interactive AWS + DevOps training deck. It follows Rahul, a final-year student, from a crashing college fest app to an enterprise job shipping to 2 million users.

**Open `index.html` in a browser** (internet needed for the 3D scenes and fonts).

## Controls
| Key | Action |
|---|---|
| → / Space / PageDown | next step or slide |
| ← / PageUp | previous |
| N | speaker notes |
| O | overview, jump to any slide |
| F | fullscreen |
| B | turn step-by-step builds on/off |

## What's inside (250 slides)
- **Act 1 · Campus to cloud:** cloud computing, virtualization, AWS overview, market ranking, global infrastructure in 3D, undersea cables
- **Act 2 · Foundations:** IAM, VPC and security groups, EC2, EBS, AMI, ELB and ASG, S3, RDS, DynamoDB, CloudFront, CloudFormation, Lambda, SNS, SQS
- **Act 3 · Ship it:** Docker, ECR, ECS, Kubernetes, EKS, Helm, code quality and security, secrets, Jenkins, CI/CD, environments, deployment strategies
- **Act 4 · Run it:** incidents, observability, CloudWatch, Prometheus, Grafana, Splunk, Datadog

Every topic follows: struggle question → picture → concept → compare → behind the scenes → production → before/after performance → WOW answer. Includes 6 hands-on activities.

## Editing
Slide sources live in `src/`. After editing, rebuild `index.html`:

```bash
python3 build.py
```
