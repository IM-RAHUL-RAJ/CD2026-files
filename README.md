# CD2026-files

Ready-made deployment files for the capstone trading platform: Dockerfiles,
docker-compose, Kubernetes files, pipeline scripts and a Jenkinsfile. Nothing
in them names a project. Copy the `deploy/` folder into your repository, fill
in one file, and follow `GUIDE.html`.

They fit a project made of four applications (a frontend, an auth service, a
trade API and an executor) with Postgres and Kafka.

## Use it

```bash
git clone git@github.com:IM-RAHUL-RAJ/CD2026-files.git
cp -r CD2026-files/deploy <your-project>/deploy
cd <your-project>

sudo dnf install -y python3-pyyaml
vi deploy/config/application.yaml      # folders, ports, the settings your code reads
python3 deploy/config/apply.py         # writes deploy/.env
vi deploy/.env                         # type the passwords and keys at the top

cd deploy
docker-compose up -d --build
docker-compose ps
```

`deploy/config/examples/team5.yaml` is a complete, working example.

## What is in `deploy/`

| Path | What it is |
|---|---|
| `config/application.yaml` | The one file you edit: folders, ports, addresses, the settings your code reads, the names of your secrets |
| `config/apply.py` | Writes that file into `.env` (docker-compose) or `k8s/` (Kubernetes) |
| `docker/java.Dockerfile` | Any Maven project that produces one runnable jar |
| `docker/node.Dockerfile` | Any npm project with a build step, such as NestJS |
| `docker/angular.Dockerfile` | Any npm-built single-page app, served by nginx |
| `docker/python.Dockerfile` | Any `pip install -r requirements.txt` project |
| `docker/postgres-init.sh` | Loads your SQL into an empty database |
| `docker-compose.yml` | Postgres, Kafka, Mailpit and the four applications on one machine |
| `k8s-templates/` | The Kubernetes files before your values are filled in |
| `scripts/bootstrap.sh` | One-time cluster preparation: ECR repositories, disk add-on, load balancer controller, namespace, Secret |
| `scripts/load-schema.sh` | Creates the database on RDS and loads your SQL |
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
and prefer its values. The two edits are at the top of
`deploy/docker/angular.Dockerfile`.

## What has been run

The `docker` phase was run end to end on 7 October 2026 against
`Neueda-Learning/chennai-capstone-SE6-team5`. The Kubernetes files and the
pipeline scripts are adapted from the ones that deployed `ETP-testing` to
EKS; in this generic form they render and pass a dry run, but they have not
yet been applied to a cluster.
