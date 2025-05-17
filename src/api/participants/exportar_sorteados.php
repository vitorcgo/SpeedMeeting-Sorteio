<?php
// src/api/exportar_sorteados.php
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="sorteados.xlsx"');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../utils/ExcelGenerator.php';

try {
    $palestraId = filter_input(INPUT_GET, 'palestraId', FILTER_VALIDATE_INT);
    
    if (!$palestraId) {
        throw new Exception('ID da palestra inválido');
    }
    
    $pdo = Conexao::getInstance();
    $stmt = $pdo->prepare("
        SELECT p.nome, p.empresa, s.data_sorteio 
        FROM sorteados s
        JOIN participantes p ON s.participante_id = p.id
        WHERE s.palestra_id = :palestra_id
        ORDER BY s.data_sorteio
    ");
    $stmt->execute(['palestra_id' => $palestraId]);
    $sorteados = $stmt->fetchAll();
    
    $excelGenerator = new ExcelGenerator();
    $excelGenerator->generateSorteadosExcel($sorteados);
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}