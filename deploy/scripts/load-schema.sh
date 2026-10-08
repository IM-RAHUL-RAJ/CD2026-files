#!/usr/bin/env bash
# Create the database on RDS (or any Postgres) and load the project's SQL
# into it: the files under `sql` in config/project.yaml, in order.
# Run once, against an empty database. psql comes from the Postgres image,
# so nothing is installed on the machine.
#
#   deploy/scripts/load-schema.sh <database host>
#
# The password is read from deploy/.env. The connection is encrypted, as RDS
# requires; for a Postgres without encryption, run it with PGSSLMODE=disable.
set -euo pipefail
. "$(dirname "$0")/pipeline-env.sh"
HOST="${1:?usage: load-schema.sh <database host>}"
PASSWORD="$(grep -m1 "^${DB_PASSWORD_ENV}=" "$DEPLOY/.env" | cut -d= -f2- || true)"
[ -n "$PASSWORD" ] || { echo "$DB_PASSWORD_ENV is empty in deploy/.env" >&2; exit 1; }

psql_run() {
  docker run --rm -i -e PGPASSWORD="$PASSWORD" -e PGHOST="$HOST" \
    -e PGPORT="${PGPORT:-5432}" -e PGSSLMODE="${PGSSLMODE:-require}" \
    -e POSTGRES_USER="$DB_USER" -e POSTGRES_DB="$DB_NAME" -e SQL_PATHS="$DB_SQL" \
    -v "$PROJECT_DIR":/project:ro -v "$DEPLOY/docker/postgres-init.sh":/load.sh:ro \
    postgres:16-alpine "$@"
}

if [ "$(psql_run psql -U "$DB_USER" -d postgres -Atc "select 1 from pg_database where datname='$DB_NAME'")" != 1 ]; then
  psql_run psql -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\""
fi
psql_run sh /load.sh
psql_run psql -U "$DB_USER" -d "$DB_NAME" -c \
  "select table_schema, count(*) as tables from information_schema.tables where table_schema not in ('pg_catalog','information_schema') group by 1 order by 1"
