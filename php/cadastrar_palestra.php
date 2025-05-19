<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);


require 'conexao.php';
require __DIR__ . '/vendor/autoload.php'; // correto com vendor dentro da mesma pasta


use PhpOffice\PhpSpreadsheet\IOFactory;


header('Content-Type: application/json');

// Verifica se os dados foram enviados corretamente
if (!isset($_POST['titulo'], $_POST['data']) || !isset($_FILES['arquivo'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados incompletos']);
    exit;
}

$titulo = $_POST['titulo'];
$data = $_POST['data'];
$arquivo = $_FILES['arquivo']['tmp_name'];

if (!file_exists($arquivo)) {
    http_response_code(400);
    echo json_encode(['erro' => 'Arquivo não enviado']);
    exit;
}

// Inserir a palestra
$stmt = $conn->prepare("INSERT INTO palestras (titulo, data) VALUES (?, ?)");
$stmt->bind_param("ss", $titulo, $data);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao inserir palestra']);
    exit;
}

$palestra_id = $stmt->insert_id;

// Ler o Excel
try {
    $spreadsheet = IOFactory::load($arquivo);
    $sheet = $spreadsheet->getActiveSheet();
    $linhas = $sheet->toArray();

    $insert_stmt = $conn->prepare("INSERT INTO participantes (palestra_id, nome, empresa) VALUES (?, ?, ?)");

    foreach ($linhas as $i => $linha) {
        if ($i === 0) continue; // pular cabeçalho
        $nome = trim($linha[0]);
        $empresa = trim($linha[1]);

        if ($nome !== '') {
            $insert_stmt->bind_param("iss", $palestra_id, $nome, $empresa);
            $insert_stmt->execute();
        }
    }

    echo json_encode(['sucesso' => true, 'palestra_id' => $palestra_id]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao ler o arquivo: ' . $e->getMessage()]);
}
?>