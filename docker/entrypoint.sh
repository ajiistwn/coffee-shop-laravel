#!/usr/bin/env sh
set -eu

APP_DIR="/var/www/html"
cd "$APP_DIR"

mkdir -p storage bootstrap/cache
rm -f bootstrap/cache/*.php

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
  echo "Menjalankan migrasi database..."
  php artisan migrate --force
fi

if [ "${RUN_SEEDERS:-true}" = "true" ]; then
  echo "Memeriksa status database seeder..."
  php <<'PHP'
<?php

$host = getenv('DB_HOST') ?: 'mysql';
$port = getenv('DB_PORT') ?: '3306';
$db = getenv('DB_DATABASE') ?: '';
$user = getenv('DB_USERNAME') ?: '';
$pass = getenv('DB_PASSWORD') ?: '';

$pdo = new PDO("mysql:host={$host};port={$port};dbname={$db}", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$pdo->exec("CREATE TABLE IF NOT EXISTS docker_seeders (name VARCHAR(190) PRIMARY KEY, seeded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$seedMarkerCount = (int) $pdo
    ->query("SELECT COUNT(*) FROM docker_seeders WHERE name = 'DatabaseSeeder';")
    ->fetchColumn();

try {
    $existingUserCount = (int) $pdo->query('SELECT COUNT(*) FROM users;')->fetchColumn();
} catch (Throwable $e) {
    $existingUserCount = 0;
}

if ($seedMarkerCount === 0 && $existingUserCount === 0) {
    fwrite(STDOUT, "Menjalankan database seeder...\n");
    passthru('php artisan db:seed --force', $exitCode);

    if ($exitCode !== 0) {
        exit($exitCode);
    }

    $pdo->exec("INSERT INTO docker_seeders (name) VALUES ('DatabaseSeeder') ON DUPLICATE KEY UPDATE seeded_at = CURRENT_TIMESTAMP;");
    exit(0);
}

fwrite(STDOUT, "Database seeder dilewati karena data awal sudah ada.\n");
$pdo->exec("INSERT INTO docker_seeders (name) VALUES ('DatabaseSeeder') ON DUPLICATE KEY UPDATE seeded_at = seeded_at;");
PHP
fi

exec "$@"
