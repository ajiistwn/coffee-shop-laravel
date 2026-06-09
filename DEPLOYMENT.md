# Docker CI/CD ke VPS

Pipeline ada di `.github/workflows/docker-deploy.yml` dengan alur:

1. Menjalankan test.
2. Build dan push image Docker ke GHCR.
3. SSH ke VPS, pull image terbaru, lalu jalankan container MySQL + container aplikasi pada network Docker yang sama.

## GitHub Secrets yang wajib diisi

- `VPS_HOST`: IP/hostname VPS.
- `VPS_USER`: user SSH VPS.
- `VPS_SSH_KEY`: private key SSH untuk deploy.
- `VPS_PORT`: port SSH (opsional, default `22`).
- `GHCR_USERNAME`: username GitHub untuk pull image di VPS.
- `GHCR_TOKEN`: personal access token dengan minimal scope `read:packages`.
- `APP_ENV_FILE_PATH`: path file `.env` di VPS (contoh `/opt/coffee-shop-laravel/.env`).
- `APP_CONTAINER_NAME`: nama container (opsional, default `coffee-shop-laravel`).
- `APP_LOCAL_PORT`: port lokal VPS untuk container (opsional, default `8080`).
- `APP_DOCKER_NETWORK`: nama docker network app + mysql (opsional, default `coffee-shop-network`).
- `MYSQL_CONTAINER_NAME`: nama container MySQL (opsional, default `coffee-shop-mysql`).
- `MYSQL_VOLUME_NAME`: nama volume data MySQL (opsional, default `coffee-shop-mysql-data`).
- `MYSQL_ROOT_PASSWORD`: password root MySQL (wajib).
- `MYSQL_DATABASE`: nama database aplikasi (wajib).
- `MYSQL_USER`: user database aplikasi (wajib).
- `MYSQL_PASSWORD`: password user database aplikasi (wajib).

## Perilaku deploy

- Deploy membuat/menjalankan container MySQL `mysql:8.4` dengan volume persisten.
- Container aplikasi dan MySQL berada pada docker network yang sama.
- Container aplikasi dipublish ke `127.0.0.1:<APP_LOCAL_PORT>:80`.
- Karena bind ke `127.0.0.1`, service tidak terbuka langsung ke public internet.
- Routing domain dilakukan oleh Nginx VPS (vhost di `sites-available`) dan tidak dikelola dari repo ini.
- Setelah container app jalan, workflow akan menjalankan `php artisan migrate --force` otomatis.

## Konfigurasi `.env` di VPS

Pastikan `.env` aplikasi di VPS menggunakan database MySQL container:

- `DB_CONNECTION=mysql`
- `DB_HOST=coffee-shop-mysql` (atau samakan dengan `MYSQL_CONTAINER_NAME`)
- `DB_PORT=3306`
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` harus sama dengan secret MySQL.

## Trigger pipeline

- Workflow ini **hanya** dijalankan manual melalui `workflow_dispatch` (tidak auto saat `push`).
- Dari VPS, setelah `git pull`, trigger dengan satu command:
  - `gh workflow run docker-deploy.yml --ref main`
- Jika belum login GitHub CLI, lakukan sekali saja:
  - `gh auth login`
- Cek status run terbaru:
  - `gh run list --workflow docker-deploy.yml --limit 1`
