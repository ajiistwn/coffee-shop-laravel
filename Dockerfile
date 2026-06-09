FROM composer:2 AS composer-builder
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader

FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    php-cli \
    php-mbstring \
    php-xml \
    php-sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
COPY --from=composer-builder /app/vendor ./vendor

# Laravel butuh .env + direktori storage agar php artisan bisa boot saat build
# APP_KEY dibuat langsung, DB_CONNECTION=sqlite agar tidak perlu MySQL saat build
RUN php -r "echo 'APP_KEY=base64:' . base64_encode(random_bytes(32)) . PHP_EOL;" > .env \
    && mkdir -p storage/logs \
               storage/framework/cache \
               storage/framework/sessions \
               storage/framework/views \
               bootstrap/cache \
    && APP_KEY=$(grep APP_KEY .env | cut -d= -f2-) \
       DB_CONNECTION=sqlite \
       npm run build

FROM php:8.4-apache
WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql gd zip bcmath \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

COPY . .
COPY --from=composer-builder /app/vendor ./vendor
COPY --from=frontend-builder /app/public/build ./public/build

RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

CMD ["apache2-foreground"]
