<?php
// src/api/cadastrar_empresa.php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/conexao.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    $nome = filter_input(INPUT_POST, 'nome', FILTER_SANITIZE_STRING);
    if (!$nome) {
        throw new Exception('Nome da empresa é obrigatório');
    }
    
    // Processar upload da logo
    if (!isset($_FILES['arquivo_logo'])) {
        throw new Exception('Arquivo de logo não enviado');
    }
    
    $arquivo = $_FILES['arquivo_logo'];
    $ext = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
    $permitidos = ['jpg', 'jpeg', 'png'];
    
    if (!in_array($ext, $permitidos)) {
        throw new Exception('Formato de arquivo inválido. Use JPG ou PNG');
    }
    
    // Criar diretório se não existir
    $uploadDir = __DIR__ . '/../../uploads/logos/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Gerar nome único para o arquivo
    $nomeArquivo = uniqid() . '.' . $ext;
    $caminhoArquivo = $uploadDir . $nomeArquivo;
    
    if (!move_uploaded_file($arquivo['tmp_name'], $caminhoArquivo)) {
        throw new Exception('Erro ao salvar arquivo');
    }
    
    $pdo = Conexao::getInstance();
    $stmt = $pdo->prepare("
        INSERT INTO empresas (nome, logo_url) 
        VALUES (:nome, :logo_url)
    ");
    
    $logoUrl = '/uploads/logos/' . $nomeArquivo;
    $stmt->execute([
        'nome' => $nome,
        'logo_url' => $logoUrl
    ]);
    
    echo json_encode([
        'success' => true,
        'id' => $pdo->lastInsertId(),
        'logo_url' => $logoUrl
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}