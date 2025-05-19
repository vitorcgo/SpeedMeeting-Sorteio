<?php
require 'conexao.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$palestraId = $data['palestra_id'] ?? null;

if (!$palestraId) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID da palestra não informado']);
    exit;
}

// Deleta os sorteios relacionados
$stmt = $conn->prepare("DELETE FROM sorteios WHERE palestra_id = ?");
$stmt->bind_param("i", $palestraId);

if ($stmt->execute()) {
    echo json_encode(['sucesso' => true]);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao resetar sorteios']);
}
?>
