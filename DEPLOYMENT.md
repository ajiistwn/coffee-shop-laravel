# Deployment Docker (Laravel 12 + React + MySQL)

Dokumen ini untuk deploy aplikasi langsung dari source yang sama (tanpa memindahkan struktur folder) menggunakan Docker Compose.

## Yang sudah diotomatisasi

- Install dependency PHP (`composer install --no-dev`) saat build image.
- Install dependency Node (`npm ci`) dan build frontend (`npm run build`) saat build image.
- Jalankan aplikasi dengan `php artisan serve` di container app.
- Jalankan scheduler dengan `php artisan schedule:work` di container app.
- Buat `storage:link` otomatis saat container start.
- Menunggu MySQL siap lalu menjalankan `php artisan migrate --force`.

## Prasyarat VPS

- Docker Engine dan Docker Compose plugin aktif.
- Port lokal untuk app tidak bentrok (default `8082` dari `.env.example`).
- Domain sudah diarahkan ke VPS, dan Nginx host tersedia di VPS.

## 1) Siapkan environment aplikasi

Di root project (folder yang sama dengan `artisan`), buat/copy `.env`:

- `cp .env.example .env`

Wajib diisi:

- `APP_KEY` (jalankan sekali: `php artisan key:generate` jika belum ada)
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_ROOT_PASSWORD`
- `APP_LOCAL_PORT` (contoh: `8082`)

Catatan:

- `docker-compose.yml` otomatis memaksa koneksi app ke MySQL container (`DB_HOST=mysql`).
- App dipublish ke `127.0.0.1:${APP_LOCAL_PORT}` agar aman dan siap diproxy oleh Nginx VPS.

## 2) Build dan jalankan container

Jalankan dari root project:

- `docker compose up -d --build`

Cek status:

- `docker compose ps`
- `docker compose logs -f app`

## 3) Perintah maintenance yang sering dipakai

- Stop service: `docker compose down`
- Restart app saja: `docker compose restart app`
- Rebuild penuh: `docker compose up -d --build --force-recreate`
- Lihat log MySQL: `docker compose logs -f mysql`

## 4) Reverse proxy Nginx VPS ke domain

Contoh server block Nginx di host VPS:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Sesuaikan `8082` dengan nilai `APP_LOCAL_PORT` pada `.env`.

Setelah ubah config:

- `sudo nginx -t`
- `sudo systemctl reload nginx`

## 5) Catatan penting

- Jangan ubah struktur folder project: semua file deployment berada di dalam root project yang sama.
- Data MySQL disimpan di Docker volume `mysql-data` agar tetap aman saat container app di-rebuild.
- Jika ingin menonaktifkan migrate otomatis saat startup, set `RUN_MIGRATIONS=false` di `.env`.
