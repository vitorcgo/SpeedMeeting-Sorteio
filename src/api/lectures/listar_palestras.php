<?php
// src/api/listar_palestras.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/conexao.php';

try {
    $pdo = Conexao::getInstance();
    
    $stmt = $pdo->prepare("
        SELECT p.*, 
            (SELECT COUNT(*) FROM participantes WHERE palestra_id = p.id) as total_participantes,
            (SELECT COUNT(*) FROM sorteados WHERE palestra_id = p.id) as total_sorteados,
            (SELECT COUNT(DISTINCT empresa_id) FROM palestra_empresa WHERE palestra_id = p.id) as total_empresas
        FROM palestras p 
        ORDER BY p.data DESC
    ");
    $stmt->execute();
    $palestras = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'palestras' => $palestras]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao listar palestras: ' . $e->getMessage()]);
}