<?php
// src/api/listar_empresas_palestra.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/conexao.php';

try {
    $palestraId = filter_input(INPUT_GET, 'palestra_id', FILTER_VALIDATE_INT);
    if (!$palestraId) {
        throw new Exception('ID da palestra inválido');
    }
    
    $pdo = Conexao::getInstance();
    
    $stmt = $pdo->prepare("
        SELECT e.id, e.nome, e.logo_url
        FROM empresas e
        INNER JOIN palestra_empresa pe ON e.id = pe.empresa_id
        WHERE pe.palestra_id = ?
        ORDER BY e.nome ASC
    ");
    
    $stmt->execute([$palestraId]);
    
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