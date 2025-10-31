# ============================================
# Multi-stage Build - Stage 1: Builder
# ============================================
FROM php:8.2-fpm AS builder

# Build arguments
ARG COMPOSER_FLAGS="--no-interaction --optimize-autoloader --no-dev --prefer-dist"

# Install system dependencies needed for build
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    opcache

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy dependency files first (for better layer caching)
COPY composer.json ./
COPY composer.lock* ./

# Install dependencies (only production dependencies)
RUN composer install ${COMPOSER_FLAGS} --no-scripts --no-autoloader

# Copy application code
COPY . .

# Generate optimized autoloader
RUN composer dump-autoload ${COMPOSER_FLAGS}

# ============================================
# Multi-stage Build - Stage 2: Production Runtime
# ============================================
FROM php:8.2-fpm

# Labels for metadata
LABEL maintainer="CardFlow Team"
LABEL version="1.0"
LABEL description="CardFlow Backend - Laravel 11 API"

# Arguments for non-root user
ARG user=www-data
ARG uid=82

# Install only runtime dependencies (minimal)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2 \
    libpq-dev \
    libzip-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (runtime only)
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    opcache

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Configure PHP for production
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=10000'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.save_comments=1'; \
    echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

RUN { \
    echo 'expose_php=Off'; \
    echo 'display_errors=Off'; \
    echo 'log_errors=On'; \
    echo 'memory_limit=256M'; \
    echo 'max_execution_time=60'; \
    echo 'upload_max_filesize=10M'; \
    echo 'post_max_size=10M'; \
    } > /usr/local/etc/php/conf.d/security.ini

# Configure PHP-FPM timeouts
RUN { \
    echo '[www]'; \
    echo 'request_terminate_timeout = 60'; \
    } > /usr/local/etc/php-fpm.d/zz-custom.conf

# Set working directory
WORKDIR /var/www

# Copy application files from builder stage
COPY --from=builder --chown=www-data:www-data /var/www /var/www

# Create necessary directories with proper permissions
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Switch to non-root user
USER www-data

# Expose PHP-FPM port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD php artisan | grep 'Laravel Framework' || exit 1

# Start PHP-FPM
CMD ["php-fpm"]
