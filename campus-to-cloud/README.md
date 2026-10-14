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
| H | hide or unhide the current slide (hidden slides are skipped; manage them in the overview, remembered in your browser) |

## What's inside (169 slides)
- **Act 1 · Campus to cloud:** cloud computing, virtualization, AWS overview, market ranking, global infrastructure in 3D, undersea cables
- **Act 2 · Foundations:** IAM, VPC and security groups, security group vs IAM role, EC2, EBS, AMI, ELB and ASG, RDS (private subnets, read replicas, Multi-AZ, failure recovery), S3, CloudFront, CloudFormation, Lambda, SNS, SQS
- **Act 3 · Ship it:** Docker (3D: VMs vs containers, image layers, docker exec use cases, Compose network region; Spring Boot Dockerfile line by line, image tags, volumes, our trading project: Dockerfiles per service, .env → compose → container, Kafka topics, Postgres, start-up order, debug activity + EC2 lab), ECR (layer sharing, tags vs digests, GitHub vs ECR), ECS, Kubernetes, EKS, Helm, code quality and security, secrets, Jenkins, CI/CD, environments, deployment strategies
- **Act 4 · Run it:** incidents, observability, CloudWatch, Prometheus, Grafana, Splunk, Datadog

Every topic is three things: a **picture** of the concept, a **behind the scenes** look at how AWS builds it, and an **example** from Rahul's job. Includes hands-on activities (least privilege, the five network gates, VPC peering, SG-or-role vote, ticket-drop simulator, canary release, incident drill).

## Editing
Slide sources live in `src/`. After editing, rebuild `index.html`:

```bash
python3 build.py
```
