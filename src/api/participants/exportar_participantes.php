<?php
// src/api/exportar_participantes.php
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="participantes.xlsx"');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../utils/ExcelGenerator.php';

try {
    $palestraId = filter_input(INPUT_GET, 'palestraId', FILTER_VALIDATE_INT);
    
    if (!$palestraId) {
        throw new Exception('ID da palestra inválido');
    }
    
    $pdo = Conexao::getInstance();
    $stmt = $pdo->prepare("SELECT nome, empresa FROM participantes WHERE palestra_id = :palestra_id ORDER BY nome");
    $stmt->execute(['palestra_id' => $palestraId]);
    $participantes = $stmt->fetchAll();
    
    $excelGenerator = new ExcelGenerator();
    $excelGenerator->generateParticipantesExcel($participantes);
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}