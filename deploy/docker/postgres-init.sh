#!/bin/sh
# Load the project's SQL into an empty database, in the order listed in
# config/application.yaml (database.sql). A folder means all its *.sql files
# in name order.
#
# Used in two places:
#   docker-compose  mounted into the Postgres container, which runs it once,
#                   the first time it starts with an empty data volume
#   RDS             run by scripts/load-schema.sh
#
# Reads: SQL_PATHS (space separated, relative to /project), POSTGRES_USER,
# POSTGRES_DB. Connection settings come from the usual PG* variables.
load_sql() {
  for path in $SQL_PATHS; do
    if [ -d "/project/$path" ]; then
      files=$(ls -1 "/project/$path"/*.sql 2>/dev/null | sort)
    elif [ -f "/project/$path" ]; then
      files="/project/$path"
    else
      echo "SQL path not found in the project: $path" >&2
      return 1
    fi
    for f in $files; do
      echo "== $f"
      psql -v ON_ERROR_STOP=1 -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$f" || return 1
    done
  done
  echo "== SQL loaded"
}
load_sql
