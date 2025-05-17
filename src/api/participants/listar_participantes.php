<?php
// src/api/listar_participantes.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/conexao.php';

try {
    $palestraId = filter_input(INPUT_GET, 'palestraId', FILTER_VALIDATE_INT);
    $filtro = filter_input(INPUT_GET, 'filtro', FILTER_SANITIZE_STRING);
    
    if (!$palestraId) {
        throw new Exception('ID da palestra inválido');
    }
    
    $pdo = Conexao::getInstance();
    $sql = "SELECT * FROM participantes WHERE palestra_id = :palestra_id";
    $params = ['palestra_id' => $palestraId];
    
    if ($filtro) {
        $sql .= " AND (nome LIKE :filtro OR empresa LIKE :filtro)";
        $params['filtro'] = "%{$filtro}%";
    }
    
    $sql .= " ORDER BY nome ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode(['success' => true, 'participantes' => $stmt->fetchAll()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}