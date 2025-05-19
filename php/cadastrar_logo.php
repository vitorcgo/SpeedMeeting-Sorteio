<?php
require 'conexao.php';

header('Content-Type: application/json');

// Verifica se veio nome e arquivo
if (empty($_POST['nome']) || empty($_FILES['arquivo']['name'])) {
    echo json_encode(['sucesso' => false, 'erro' => 'Nome ou arquivo ausente']);
    exit;
}

$nomeEmpresa = $_POST['nome'];
$arquivo = $_FILES['arquivo'];

// Verifica se houve erro no upload
if ($arquivo['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['sucesso' => false, 'erro' => 'Erro no upload do arquivo']);
    exit;
}

// Move o arquivo para a pasta de upload
$nomeFinal = uniqid() . '_' . basename($arquivo['name']);
$caminho = '../upload/' . $nomeFinal;

if (!move_uploaded_file($arquivo['tmp_name'], $caminho)) {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha ao mover o arquivo']);
    exit;
}

// Salva no banco de dados
$stmt = $conn->prepare("INSERT INTO logos (nome_empresa, caminho_arquivo) VALUES (?, ?)");
$stmt->bind_param("ss", $nomeEmpresa, $nomeFinal);
$stmt->execute();

echo json_encode(['sucesso' => true]);
