<?php
// src/api/atualizar_logo.php
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
    
    if (!isset($_FILES['arquivo_logo'])) {
        throw new Exception('Arquivo de logo não enviado');
    }
    
    $arquivo = $_FILES['arquivo_logo'];
    $ext = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
    $permitidos = ['jpg', 'jpeg', 'png'];
    
    if (!in_array($ext, $permitidos)) {
        throw new Exception('Formato de arquivo inválido. Use JPG ou PNG');
    }
    
    $pdo = Conexao::getInstance();
    
    // Buscar logo atual
    $stmt = $pdo->prepare("SELECT logo_url FROM empresas WHERE id = ?");
    $stmt->execute([$empresaId]);
    $empresa = $stmt->fetch();
    
    if (!$empresa) {
        throw new Exception('Empresa não encontrada');
    }
    
    // Remover logo antiga se existir
    if ($empresa['logo_url']) {
        $caminhoAntigo = __DIR__ . '/../../public' . $empresa['logo_url'];
        if (file_exists($caminhoAntigo)) {
            unlink($caminhoAntigo);
        }
    }
    
    // Salvar nova logo
    $uploadDir = __DIR__ . '/../../uploads/logos/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $nomeArquivo = uniqid() . '.' . $ext;
    $caminhoArquivo = $uploadDir . $nomeArquivo;
    
    if (!move_uploaded_file($arquivo['tmp_name'], $caminhoArquivo)) {
        throw new Exception('Erro ao salvar arquivo');
    }
    
    $logoUrl = '/uploads/logos/' . $nomeArquivo;
    
    // Atualizar URL da logo
    $stmt = $pdo->prepare("UPDATE empresas SET logo_url = ? WHERE id = ?");
    $stmt->execute([$logoUrl, $empresaId]);
    
    echo json_encode([
        'success' => true,
        'logo_url' => $logoUrl
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}