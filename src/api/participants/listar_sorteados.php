<?php
// src/api/listar_sorteados.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/conexao.php';

try {
    $palestraId = filter_input(INPUT_GET, 'palestraId', FILTER_VALIDATE_INT);
    
    if (!$palestraId) {
        throw new Exception('ID da palestra inválido');
    }
    
    $pdo = Conexao::getInstance();
    $stmt = $pdo->prepare("
        SELECT s.*, p.nome, p.empresa 
        FROM sorteados s
        JOIN participantes p ON s.participante_id = p.id
        WHERE s.palestra_id = :palestra_id
        ORDER BY s.data_sorteio DESC
    ");
    $stmt->execute(['palestra_id' => $palestraId]);
    
    echo json_encode(['success' => true, 'sorteados' => $stmt->fetchAll()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}