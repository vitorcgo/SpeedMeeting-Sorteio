<?php
require 'conexao.php';

header('Content-Type: application/json');

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'erro' => 'ID da palestra não fornecido']);
    exit;
}

$id = intval($_GET['id']);

// Primeiro, busca os participantes dessa palestra
$stmt = $conn->prepare("SELECT id FROM participantes WHERE palestra_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

$participantes = [];
while ($row = $result->fetch_assoc()) {
    $participantes[] = $row['id'];
}
$stmt->close();

// Remove sorteios desses participantes
if (!empty($participantes)) {
    $ids = implode(',', array_fill(0, count($participantes), '?'));
    $types = str_repeat('i', count($participantes));

    $stmtSorteios = $conn->prepare("DELETE FROM sorteios WHERE participante_id IN ($ids)");
    $stmtSorteios->bind_param($types, ...$participantes);
    $stmtSorteios->execute();
    $stmtSorteios->close();
}

// Agora remove os participantes
$stmtParticipantes = $conn->prepare("DELETE FROM participantes WHERE palestra_id = ?");
$stmtParticipantes->bind_param("i", $id);
$stmtParticipantes->execute();
$stmtParticipantes->close();

// Por fim, remove a palestra
$stmtPalestra = $conn->prepare("DELETE FROM palestras WHERE id = ?");
$stmtPalestra->bind_param("i", $id);
$sucesso = $stmtPalestra->execute();
$stmtPalestra->close();

echo json_encode(['sucesso' => $sucesso]);
?>
