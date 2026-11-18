#!/usr/bin/env bash
# Deploys SouqFeed on the VPS: backup, pull main, build, migrate, restart, health check.
# Run on the server:  bash /srv/docker/souqfeed/deploy.sh
#
# It only touches this folder's compose project (souqfeed-*). Other projects on
# the server (zeronix-*, zxsaas-*, caddy) are not part of it.
#
# Seeds are NOT run here (they are explicit, see docs/deployment.md).
set -euo pipefail

APP_DIR="/srv/docker/souqfeed"
APP_IMAGE="souqfeed-app"
ROLLBACK_IMAGE="souqfeed-app:rollback"
BACKUP_DIR="/srv/docker/backups/souqfeed-postgres"

cd "$APP_DIR"

echo "==> Saving current app image as rollback"
CURRENT_IMAGE_ID="$(sudo docker inspect souqfeed-app --format '{{.Image}}' 2>/dev/null || true)"
if [ -n "$CURRENT_IMAGE_ID" ]; then
    sudo docker tag "$CURRENT_IMAGE_ID" "$ROLLBACK_IMAGE"
    echo "Rollback image saved: $ROLLBACK_IMAGE"
else
    echo "No running app image found; skipping rollback tag"
fi

echo "==> Backing up the database"
PGUSER_NAME="$(grep '^POSTGRES_USER=' .env | cut -d= -f2- | tr -d '"')"
PGDB_NAME="$(grep '^POSTGRES_DB=' .env | cut -d= -f2- | tr -d '"')"
BACKUP_FILE="$BACKUP_DIR/souqfeed_predeploy_$(date +%Y-%m-%d_%H-%M-%S).dump"
sudo docker exec souqfeed-postgres pg_dump -U "$PGUSER_NAME" -d "$PGDB_NAME" -Fc | sudo tee "$BACKUP_FILE" > /dev/null
echo "Backup written: $BACKUP_FILE"

echo "==> Pulling latest code"
git pull --ff-only origin main

# "--profile tools" matters: without it compose skips the migrate service, its
# image goes stale, and the migration step below applies nothing without error.
echo "==> Building images (app, worker and the migrator)"
sudo docker compose --profile tools build

echo "==> Running database migrations"
sudo docker compose --profile tools run --rm migrate

echo "==> Starting updated stack"
sudo docker compose up -d

echo "==> Waiting for app health"
for i in {1..30}; do
    STATUS="$(sudo docker inspect --format='{{.State.Health.Status}}' souqfeed-app 2>/dev/null || true)"

    if [ "$STATUS" = "healthy" ]; then
        echo "Deployment complete: souqfeed-app is healthy"
        exit 0
    fi

    sleep 2
done

echo "Deployment failed: souqfeed-app did not become healthy"
echo "Previous app image is available as: $ROLLBACK_IMAGE"
sudo docker compose ps
exit 1
