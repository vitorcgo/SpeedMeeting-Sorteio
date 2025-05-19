<?php
require 'conexao.php';
header('Content-Type: application/json');

$id = intval($_GET['id'] ?? $_GET['palestra'] ?? 0);

if (!$id) {
    echo json_encode(['participantes' => [], 'logos' => []]);
    exit;
}

// PARTICIPANTES da palestra
$sql = "SELECT nome, empresa FROM participantes WHERE palestra_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$participantes = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// SORTEADOS anteriores
$sqlSorteados = "SELECT nome, empresa FROM sorteios WHERE palestra_id = ?";
$stmt2 = $conn->prepare($sqlSorteados);
$stmt2->bind_param("i", $id);
$stmt2->execute();
$sorteados = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

// FILTRA os não sorteados
$naoSorteados = array_filter($participantes, function($p) use ($sorteados) {
    foreach ($sorteados as $s) {
        if ($p['nome'] === $s['nome'] && $p['empresa'] === $s['empresa']) {
            return false;
        }
    }
    return true;
});

// Retorna dados
echo json_encode([
    'participantes' => array_values($naoSorteados),
    'logos' => [] // deixe vazio ou preencha depois
]);
