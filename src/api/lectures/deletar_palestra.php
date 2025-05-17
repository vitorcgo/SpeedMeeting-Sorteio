<?php
// src/api/deletar_palestra.php
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
    
    $pdo->beginTransaction();
    
    // Delete related records first
    $stmt = $pdo->prepare("DELETE FROM sorteados WHERE palestra_id = :palestra_id");
    $stmt->execute(['palestra_id' => $palestraId]);
    
    $stmt = $pdo->prepare("DELETE FROM participantes WHERE palestra_id = :palestra_id");
    $stmt->execute(['palestra_id' => $palestraId]);
    
    $stmt = $pdo->prepare("DELETE FROM palestra_empresa WHERE palestra_id = :palestra_id");
    $stmt->execute(['palestra_id' => $palestraId]);
    
    // Finally delete the lecture
    $stmt = $pdo->prepare("DELETE FROM palestras WHERE id = :palestra_id");
    $stmt->execute(['palestra_id' => $palestraId]);
    
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}