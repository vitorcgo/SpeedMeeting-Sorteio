<?php
// src/api/atribuir_empresa.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/conexao.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    $palestraId = filter_input(INPUT_POST, 'palestra_id', FILTER_VALIDATE_INT);
    $empresaId = filter_input(INPUT_POST, 'empresa_id', FILTER_VALIDATE_INT);
    
    if (!$palestraId || !$empresaId) {
        throw new Exception('IDs inválidos');
    }
    
    $pdo = Conexao::getInstance();
    $stmt = $pdo->prepare("
        INSERT INTO palestra_empresa (palestra_id, empresa_id)
        VALUES (:palestra_id, :empresa_id)
        ON DUPLICATE KEY UPDATE palestra_id = palestra_id
    ");
    
    $stmt->execute([
        'palestra_id' => $palestraId,
        'empresa_id' => $empresaId
    ]);
    
    echo json_encode([
        'success' => true
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}