<?php
// src/api/listar_empresas.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/conexao.php';

try {
    $pdo = Conexao::getInstance();
    
    $stmt = $pdo->prepare("
        SELECT id, nome, logo_url 
        FROM empresas 
        ORDER BY nome ASC
    ");
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'empresas' => $stmt->fetchAll()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}