FROM php:8.3-cli-alpine AS app

WORKDIR /var/www/html

RUN apk add --no-cache \
    bash \
    git \
    icu-dev \
    libzip-dev \
    mysql-client \
    nodejs \
    npm \
    oniguruma-dev \
    supervisor \
    unzip \
    && docker-php-ext-install \
    bcmath \
    intl \
    mbstring \
    pcntl \
    pdo_mysql \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/app-entrypoint

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && cp .env.example .env \
    && php artisan key:generate --force \
    && composer dump-autoload --optimize \
    && php artisan wayfinder:generate --with-form \
    && npm run build \
    && rm -f .env \
    && rm -rf node_modules \
    && chmod +x /usr/local/bin/app-entrypoint \
    && mkdir -p /var/log/supervisor \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8000

ENTRYPOINT ["app-entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
