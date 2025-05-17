<?php
// /data/chats/x7rpud/workspace/uploads/project/src/index.php

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'palestra_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('UPLOAD_DIR', __DIR__ . '/../uploads/');

// Load required files
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/conexao.php';

// Handle API endpoints based on URL path
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

// Remove base path if exists
$basePath = '/src/api/';
$endpoint = str_replace($basePath, '', $path);

// Route API requests to appropriate handlers
if (strpos($path, '/src/api/') === 0) {
    $endpointFile = __DIR__ . '/api/' . $endpoint . '.php';
    
    if (file_exists($endpointFile)) {
        require $endpointFile;
    } else {
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint não encontrado']);
    }
    exit;
}

// For non-API requests, return 404
http_response_code(404);
echo 'Not Found';