#!/bin/sh
set -eu
n=0
until node src/config/wait-for-db.js; do
  n=$((n + 1))
  if [ "$n" -ge 20 ]; then
    echo "PostgreSQL did not become ready after 20 attempts" >&2
    exit 1
  fi
  sleep 2
done
npm run db:deploy
npm run db:seed
exec npm start
