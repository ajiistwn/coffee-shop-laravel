# Deploy Lokal di VPS (Tanpa GitHub Actions)

Dokumen ini untuk deploy langsung dari VPS tanpa `gh`, tanpa API GitHub, dan tanpa trigger workflow.

## Prasyarat

- Docker dan Docker Compose plugin sudah terpasang di VPS.
- Repository sudah di-clone di VPS.
- File env aplikasi tersedia (contoh: `.env` di root project).
- `DB_ROOT_PASSWORD` tersedia di env file atau di environment shell.

## Sekali setup

1. Masuk ke folder project:
   - `cd ~/apps/coffee-shop-laravel`
2. Buat script jadi executable:
   - `chmod +x scripts/deploy-vps.sh`

## Deploy harian (1 command)

Setelah `git pull`, jalankan:

- `./scripts/deploy-vps.sh`

Atau langsung satu baris:

- `git pull origin main && ./scripts/deploy-vps.sh`

## Variabel yang dipakai script

Script membaca env dari `.env` (atau path pada `APP_ENV_FILE_PATH`) dan environment shell.

### Wajib

- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_ROOT_PASSWORD`

### Opsional (dengan default)

- `APP_ENV_FILE_PATH` (default `.env`)
- `APP_IMAGE_NAME` (default `coffee-shop-laravel-app`)
- `APP_IMAGE_TAG` (default git short SHA terbaru)
- `APP_CONTAINER_NAME` (default `coffee-shop-laravel`)
- `APP_LOCAL_PORT` (default `8080`)
- `APP_DOCKER_NETWORK` (default `coffee-shop-network`)
- `MYSQL_IMAGE` (default `mysql:8.4`)
- `MYSQL_CONTAINER_NAME` (default `coffee-shop-mysql`)
- `MYSQL_VOLUME_NAME` (default `coffee-shop-mysql-data`)
- `MYSQL_DATABASE` (fallback ke `DB_DATABASE`)
- `MYSQL_USER` (fallback ke `DB_USERNAME`)
- `MYSQL_PASSWORD` (fallback ke `DB_PASSWORD`)
- `MYSQL_ROOT_PASSWORD` (fallback ke `DB_ROOT_PASSWORD`)

## Yang dilakukan script deploy

1. Build image aplikasi dari source terbaru.
2. Membuat Docker network jika belum ada.
3. Menjalankan MySQL container (atau start jika sudah ada).
4. Menjalankan ulang container aplikasi dengan image terbaru.
5. Menjalankan `php artisan migrate --force`.
6. Membersihkan dangling image.

## Catatan akses aplikasi

- Container aplikasi bind ke `127.0.0.1:<APP_LOCAL_PORT>:80`.
- Service tidak terbuka langsung ke internet.
- Akses publik tetap lewat Nginx reverse proxy di VPS.
