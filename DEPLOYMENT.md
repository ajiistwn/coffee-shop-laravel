# Docker CI/CD ke VPS

Pipeline ada di `.github/workflows/docker-deploy.yml` dengan alur:

1. Menjalankan test.
2. Build dan push image Docker ke GHCR.
3. SSH ke VPS, pull image terbaru, lalu jalankan container pada port localhost VPS.

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

## Perilaku deploy

- Container dipublish ke `127.0.0.1:<APP_LOCAL_PORT>:80`.
- Karena bind ke `127.0.0.1`, service tidak terbuka langsung ke public internet.
- Routing domain dilakukan oleh Nginx VPS (vhost di `sites-available`) dan tidak dikelola dari repo ini.

## Trigger pipeline

- Otomatis saat `push` ke branch `main`.
- Bisa dijalankan manual melalui `workflow_dispatch`.
