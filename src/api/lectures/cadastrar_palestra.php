<?php
// src/api/cadastrar_palestra.php
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
    $pdo->beginTransaction();
    
    $titulo = filter_input(INPUT_POST, 'titulo', FILTER_SANITIZE_STRING);
    $data = filter_input(INPUT_POST, 'data', FILTER_SANITIZE_STRING);
    
    if (!$titulo || !$data) {
        throw new Exception('Dados inválidos');
    }
    
    // Insert palestra
    $stmt = $pdo->prepare("INSERT INTO palestras (titulo, data) VALUES (:titulo, :data)");
    $stmt->execute(['titulo' => $titulo, 'data' => $data]);
    $palestraId = $pdo->lastInsertId();
    
    // Handle Excel file upload
    if (isset($_FILES['arquivo_excel'])) {
        require_once __DIR__ . '/../utils/ExcelProcessor.php';
        $excelProcessor = new ExcelProcessor();
        $participantes = $excelProcessor->processExcel($_FILES['arquivo_excel'], $palestraId);
    }
    
    $pdo->commit();
    echo json_encode([
        'success' => true,
        'palestra' => [
            'id' => $palestraId,
            'titulo' => $titulo,
            'data' => $data,
            'total_participantes' => count($participantes ?? [])
        ]
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}