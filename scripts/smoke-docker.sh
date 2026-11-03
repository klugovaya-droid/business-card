#!/usr/bin/env bash
set -euo pipefail

PORT="${APP_PORT:-3010}"

cleanup() {
  APP_PORT="$PORT" docker compose down -v --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

APP_PORT="$PORT" docker compose up --build -d

for _ in $(seq 1 90); do
  if curl -fsS "http://localhost:$PORT/health" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

response="$(curl -fsS -X POST "http://localhost:$PORT/graphql" \
  -H 'Content-Type: application/json' \
  --data '{"query":"{ profile { name skills { name } experience { company achievements { text } } projects { name } } }"}')"

node -e '
const payload = JSON.parse(process.argv[1]);
const profile = payload.data?.profile;
if (!profile?.name) throw new Error("profile is missing");
if (!profile.skills?.length) throw new Error("skills are missing");
if (!profile.experience?.length) throw new Error("experience is missing");
if (!profile.projects?.length) throw new Error("projects are missing");
if (!profile.experience.some((item) => item.achievements?.length)) throw new Error("achievements are missing");
console.log(`smoke ok: ${profile.name}`);
' "$response"
