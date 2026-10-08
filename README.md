# CD2026-files

Ready-made deployment files for the capstone trading platform: Dockerfiles,
docker-compose, Kubernetes files, pipeline scripts and a Jenkinsfile. Nothing
in them names a project. Copy the `deploy/` folder into your repository, fill
in one file, and follow `GUIDE.html`.

They fit a project made of four applications (a frontend, an auth service, a
trade API and an executor) with Postgres and Kafka.

## Use it

Open `GUIDE.html` in a browser and follow it from step 1. It goes from
writing the config file, to an EC2 machine, to copying each file, to
`docker-compose`, to the database on RDS. Every file is printed in it.

`deploy/config/examples/team5/` holds a complete, working pair of config files.

## What is in `deploy/`

| Path | What it is |
|---|---|
| `config/application.yaml` | Addresses and ports, in the shape shared in class. Changed for each machine |
| `config/project.yaml` | Written once: your folders, the settings your code reads, the names of your secrets |
| `config/apply.py` | Writes those two files into `.env` (docker-compose) or `k8s/` (Kubernetes) |
| `docker/java.Dockerfile` | Any Maven project that produces one runnable jar |
| `docker/node.Dockerfile` | Any npm project with a build step, such as NestJS |
| `docker/angular.Dockerfile` | Any npm-built single-page app, served by nginx |
| `docker/python.Dockerfile` | Any `pip install -r requirements.txt` project |
| `docker/postgres-init.sh` | Loads your SQL into an empty database |
| `docker-compose.yml` | Postgres, Kafka, Mailpit and the four applications on one machine. Postgres is left out once `database.host` is an RDS endpoint |
| `k8s-templates/` | The Kubernetes files before your values are filled in |
| `scripts/bootstrap.sh` | One-time cluster preparation: ECR repositories, disk add-on, load balancer controller, namespace, Secret |
| `scripts/create-secret.sh` | Makes the Kubernetes Secret from `.env` |
| `scripts/test.sh`, `build-push.sh`, `deploy.sh`, `smoke-test.sh` | The four pipeline steps; each also runs by hand |
| `Jenkinsfile` | The pipeline. In the Jenkins job, set Script Path to `deploy/Jenkinsfile` |

`apply.py` also creates `deploy/build.env` and, for the `eks` phase,
`deploy/k8s/`. Commit both. `deploy/.env` holds your secrets and is ignored
by git.

## One change in an Angular frontend

An Angular build is static files, so the image cannot read a setting later
the way a server can. The image writes the API addresses into
`/app-config.js` when its container starts; your app has to load that file
and prefer its values. The edits are in `GUIDE.html`, step 5, file 3.

## Other files here

`ETP-history.html` is the full record of the first project deployed this
way, including the EKS and Jenkins stages. `update-guide-files.py` copies
the current files into `GUIDE.html`; run it after changing any file in
`deploy/`.

## What has been run

The `docker` phase was run end to end on 8 October 2026 against
`Neueda-Learning/chennai-capstone-SE6-team5`, first with the Postgres
container and then switched to a separate Postgres that accepts only
encrypted connections, standing in for RDS. It has not yet been run against
a real RDS instance. The Kubernetes files and the
pipeline scripts are adapted from the ones that deployed `ETP-testing` to
EKS; in this generic form they render and pass a dry run, but they have not
yet been applied to a cluster.
