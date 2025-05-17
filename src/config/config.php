<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'palestra_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Base paths
define('BASE_PATH', __DIR__ . '/../../');
define('PUBLIC_PATH', BASE_PATH . 'public/');

// Upload directories (relative to public for web access)
define('UPLOAD_DIR', PUBLIC_PATH . 'upload/');
define('EXCEL_UPLOAD_DIR', UPLOAD_DIR . 'excel/');
define('LOGO_UPLOAD_DIR', UPLOAD_DIR . 'logos/');
define('ASSETS_DIR', PUBLIC_PATH . 'assets/');

// Web accessible paths (for URLs)
define('WEB_ROOT', isset($_SERVER['HTTPS']) ? 'https://' : 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF'], 3));
define('UPLOAD_URL', WEB_ROOT . '/upload/');
define('EXCEL_URL', UPLOAD_URL . 'excel/');
define('LOGO_URL', UPLOAD_URL . 'logos/');
define('ASSETS_URL', WEB_ROOT . '/assets/');

// File upload configurations
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXCEL_TYPES', [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
]);
define('ALLOWED_IMAGE_TYPES', [
    'image/jpeg',
    'image/png',
    'image/gif'
]);

// Create upload directories if they don't exist
foreach ([UPLOAD_DIR, EXCEL_UPLOAD_DIR, LOGO_UPLOAD_DIR] as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0777, true);
    }
    // Ensure proper permissions
    chmod($dir, 0755);
}