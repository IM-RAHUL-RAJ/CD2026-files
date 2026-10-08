#!/bin/sh
# Loads the project's SQL (`sql` in project.yaml) into an empty
# database, in order. A folder means all its *.sql files in name order.
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
