<?php
require 'conexao.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$palestraId = intval($data['palestra_id'] ?? 0);
$idsLogos = $data['logo_ids'] ?? [];

if (!$palestraId || !is_array($idsLogos)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'erro' => 'Dados inválidos']);
    exit;
}

// Limpa as logos anteriores da palestra
$conn->query("DELETE FROM logo_palestra WHERE palestra_id = $palestraId");

// Insere as novas
$stmt = $conn->prepare("INSERT INTO logo_palestra (palestra_id, logo_id) VALUES (?, ?)");
foreach ($idsLogos as $logoId) {
    $stmt->bind_param("ii", $palestraId, $logoId);
    $stmt->execute();
}

echo json_encode(['sucesso' => true]);
