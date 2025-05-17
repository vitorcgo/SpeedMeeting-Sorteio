<?php
// src/api/sortear.php
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
    
    // Get available participants
    $stmt = $pdo->prepare("
        SELECT p.* FROM participantes p
        LEFT JOIN sorteados s ON p.id = s.participante_id AND s.palestra_id = :palestra_id
        WHERE s.id IS NULL AND p.palestra_id = :palestra_id
    ");
    $stmt->execute(['palestra_id' => $palestraId]);
    $participantes = $stmt->fetchAll();
    
    if (empty($participantes)) {
        throw new Exception('Não há mais participantes disponíveis');
    }
    
    // Random selection
    $sorteado = $participantes[array_rand($participantes)];
    
    // Register draw
    $stmt = $pdo->prepare("
        INSERT INTO sorteados (palestra_id, participante_id, data_sorteio)
        VALUES (:palestra_id, :participante_id, NOW())
    ");
    $stmt->execute([
        'palestra_id' => $palestraId,
        'participante_id' => $sorteado['id']
    ]);
    
    echo json_encode([
        'success' => true,
        'sorteado' => [
            'nome' => $sorteado['nome'],
            'empresa' => $sorteado['empresa'],
            'ordem' => count($participantes)
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}