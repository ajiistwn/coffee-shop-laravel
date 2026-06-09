#!/usr/bin/env bash
set -euo pipefail

# Script deploy lokal di VPS tanpa GitHub Actions.
# Jalankan dari root repository setelah git pull.

APP_IMAGE_NAME="${APP_IMAGE_NAME:-coffee-shop-laravel-app}"
APP_IMAGE_TAG="${APP_IMAGE_TAG:-$(git rev-parse --short HEAD)}"
APP_CONTAINER_NAME="${APP_CONTAINER_NAME:-coffee-shop-laravel}"
APP_ENV_FILE_PATH="${APP_ENV_FILE_PATH:-.env}"
APP_LOCAL_PORT="${APP_LOCAL_PORT:-8080}"

DOCKER_NETWORK="${APP_DOCKER_NETWORK:-coffee-shop-network}"
MYSQL_IMAGE="${MYSQL_IMAGE:-mysql:8.4}"
MYSQL_CONTAINER_NAME="${MYSQL_CONTAINER_NAME:-coffee-shop-mysql}"
MYSQL_VOLUME_NAME="${MYSQL_VOLUME_NAME:-coffee-shop-mysql-data}"

if [ ! -f "$APP_ENV_FILE_PATH" ]; then
  echo "File env tidak ditemukan: $APP_ENV_FILE_PATH"
  exit 1
fi

# Muat variabel dari file .env agar DB_* bisa terbaca.
set -a
# shellcheck disable=SC1090
. "$APP_ENV_FILE_PATH"
set +a

MYSQL_DATABASE="${MYSQL_DATABASE:-${DB_DATABASE:-}}"
MYSQL_USER="${MYSQL_USER:-${DB_USERNAME:-}}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-${DB_PASSWORD:-}}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-${DB_ROOT_PASSWORD:-}}"

if [ -z "$MYSQL_DATABASE" ] || [ -z "$MYSQL_USER" ] || [ -z "$MYSQL_PASSWORD" ] || [ -z "$MYSQL_ROOT_PASSWORD" ]; then
  echo "MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, dan MYSQL_ROOT_PASSWORD wajib diset."
  echo "Pastikan ada di environment shell atau di file env (DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_ROOT_PASSWORD)."
  exit 1
fi

if ! docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
  docker network create "$DOCKER_NETWORK"
fi

# Jalankan MySQL lebih dulu sebelum build image agar tidak membuang waktu tunggu
if ! docker ps -a --format '{{.Names}}' | grep -Eq "^$MYSQL_CONTAINER_NAME$"; then
  echo "Membuat container MySQL baru: $MYSQL_CONTAINER_NAME"
  docker run -d \
    --name "$MYSQL_CONTAINER_NAME" \
    --restart unless-stopped \
    --network "$DOCKER_NETWORK" \
    -v "$MYSQL_VOLUME_NAME:/var/lib/mysql" \
    -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
    -e MYSQL_DATABASE="$MYSQL_DATABASE" \
    -e MYSQL_USER="$MYSQL_USER" \
    -e MYSQL_PASSWORD="$MYSQL_PASSWORD" \
    "$MYSQL_IMAGE" \
    --character-set-server=utf8mb4 \
    --collation-server=utf8mb4_unicode_ci
else
  if ! docker ps --format '{{.Names}}' | grep -Eq "^$MYSQL_CONTAINER_NAME$"; then
    echo "Menyalakan container MySQL: $MYSQL_CONTAINER_NAME"
    docker start "$MYSQL_CONTAINER_NAME"
  else
    echo "Container MySQL sudah berjalan: $MYSQL_CONTAINER_NAME"
  fi
fi

echo "Build image aplikasi: $APP_IMAGE_NAME:$APP_IMAGE_TAG"
docker build -t "$APP_IMAGE_NAME:$APP_IMAGE_TAG" .

# Tunggu MySQL ready — inisialisasi pertama kali bisa sampai 3 menit
MYSQL_TIMEOUT=90
echo "Menunggu MySQL ready (maks ${MYSQL_TIMEOUT} detik)..."
for i in $(seq 1 "$MYSQL_TIMEOUT"); do
  if docker exec "$MYSQL_CONTAINER_NAME" mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" --silent >/dev/null 2>&1; then
    echo "MySQL ready setelah ${i} detik."
    break
  fi
  if [ "$i" -eq "$MYSQL_TIMEOUT" ]; then
    echo "MySQL tidak ready setelah ${MYSQL_TIMEOUT} detik. Cek log: docker logs $MYSQL_CONTAINER_NAME"
    exit 1
  fi
  sleep 1
done

if docker ps -a --format '{{.Names}}' | grep -Eq "^$APP_CONTAINER_NAME$"; then
  docker rm -f "$APP_CONTAINER_NAME"
fi

echo "Menjalankan container aplikasi: $APP_CONTAINER_NAME"
docker run -d \
  --name "$APP_CONTAINER_NAME" \
  --restart unless-stopped \
  --network "$DOCKER_NETWORK" \
  --env-file "$APP_ENV_FILE_PATH" \
  -e DB_HOST="$MYSQL_CONTAINER_NAME" \
  -e DB_PORT="3306" \
  -p "127.0.0.1:$APP_LOCAL_PORT:80" \
  "$APP_IMAGE_NAME:$APP_IMAGE_TAG"

echo "Menjalankan migrasi database"
docker exec "$APP_CONTAINER_NAME" php artisan migrate --force

echo "Membersihkan dangling image"
docker image prune -f

echo "Deploy selesai."
