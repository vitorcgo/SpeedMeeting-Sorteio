<?php
require_once 'config/conexao.php';

header('Content-Type: application/json');

// Test database connection
$result = Conexao::testConnection();

// Output connection status
echo json_encode($result, JSON_PRETTY_PRINT);
