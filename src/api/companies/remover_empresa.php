<?php
// src/api/remover_empresa.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/conexao.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    $empresaId = filter_input(INPUT_POST, 'empresa_id', FILTER_VALIDATE_INT);
    if (!$empresaId) {
        throw new Exception('ID da empresa inválido');
    }
    
    $pdo = Conexao::getInstance();
    
    // Buscar caminho da logo antes de deletar
    $stmt = $pdo->prepare("SELECT logo_url FROM empresas WHERE id = ?");
    $stmt->execute([$empresaId]);
    $empresa = $stmt->fetch();
    
    if ($empresa && $empresa['logo_url']) {
        $caminhoLogo = __DIR__ . '/../../public' . $empresa['logo_url'];
        if (file_exists($caminhoLogo)) {
            unlink($caminhoLogo);
        }
    }
    
    // Remover relações
    $stmt = $pdo->prepare("DELETE FROM palestra_empresa WHERE empresa_id = ?");
    $stmt->execute([$empresaId]);
    
    // Remover empresa
    $stmt = $pdo->prepare("DELETE FROM empresas WHERE id = ?");
    $stmt->execute([$empresaId]);
    
    echo json_encode([
        'success' => true
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}