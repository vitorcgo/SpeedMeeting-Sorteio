<?php
// src/api/importar_excel.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../utils/ExcelProcessor.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

try {
    $palestraId = filter_input(INPUT_POST, 'palestraId', FILTER_VALIDATE_INT);
    
    if (!$palestraId || !isset($_FILES['arquivo_excel'])) {
        throw new Exception('Dados inválidos');
    }
    
    $excelProcessor = new ExcelProcessor();
    $participantes = $excelProcessor->processExcel($_FILES['arquivo_excel'], $palestraId);
    
    echo json_encode([
        'success' => true,
        'total' => count($participantes),
        'participantes' => $participantes
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}