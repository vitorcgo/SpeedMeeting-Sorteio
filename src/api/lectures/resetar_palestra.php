<?php
// src/api/resetar_palestra.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/conexao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

try {
    $pdo = Conexao::getInstance();
    $data = json_decode(file_get_contents('php://input'), true);
    $palestraId = filter_var($data['palestraId'] ?? null, FILTER_VALIDATE_INT);
    
    if (!$palestraId) {
        throw new Exception('ID da palestra inválido');
    }
    
    $stmt = $pdo->prepare("DELETE FROM sorteados WHERE palestra_id = :palestra_id");
    $stmt->execute(['palestra_id' => $palestraId]);
    
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}