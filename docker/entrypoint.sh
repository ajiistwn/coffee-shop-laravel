#!/usr/bin/env sh
set -eu

APP_DIR="/var/www/html"
cd "$APP_DIR"

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
fi

mkdir -p storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache

if [ "${WAIT_FOR_DB:-true}" = "true" ]; then
  echo "Menunggu koneksi database..."
  php -r '
  $host = getenv("DB_HOST") ?: "mysql";
  $port = getenv("DB_PORT") ?: "3306";
  $db = getenv("DB_DATABASE") ?: "";
  $user = getenv("DB_USERNAME") ?: "";
  $pass = getenv("DB_PASSWORD") ?: "";
  $maxRetries = 30;
  $connected = false;

  for ($i = 1; $i <= $maxRetries; $i++) {
      try {
          new PDO("mysql:host={$host};port={$port};dbname={$db}", $user, $pass, [
              PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
          ]);
          $connected = true;
          break;
      } catch (Throwable $e) {
          fwrite(STDOUT, "DB belum siap, retry {$i}/{$maxRetries}\n");
          sleep(2);
      }
  }

  if (!$connected) {
      fwrite(STDERR, "Gagal konek ke DB setelah {$maxRetries} percobaan.\n");
      exit(1);
  }
  '
fi

php artisan storage:link || true

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force
fi

exec "$@"
