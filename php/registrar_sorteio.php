<?php
require 'conexao.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$palestraId = intval($data['palestra_id'] ?? 0);
$idsExcluidos = $data['ids_excluidos'] ?? [];

if (!$palestraId) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'ID da palestra ausente']);
    exit;
}

// Buscar todos os participantes da palestra (incluindo ID)
$stmt = $conn->prepare("
    SELECT p.id, p.nome, p.empresa
    FROM participantes p
    WHERE p.palestra_id = ?
");
$stmt->bind_param("i", $palestraId);
$stmt->execute();
$participantes = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Buscar IDs já sorteados
$stmt2 = $conn->prepare("
    SELECT participante_id
    FROM sorteios
    WHERE palestra_id = ? AND participante_id IS NOT NULL
");
$stmt2->bind_param("i", $palestraId);
$stmt2->execute();
$sorteados = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
$idsSorteados = array_column($sorteados, 'participante_id');

// Mesclar IDs já sorteados com IDs a excluir manualmente
$todosIdsExcluidos = array_merge($idsSorteados, $idsExcluidos);

// Filtrar disponíveis
$participantesDisponiveis = array_filter($participantes, function ($p) use ($todosIdsExcluidos) {
    return !in_array($p['id'], $todosIdsExcluidos);
});

if (count($participantesDisponiveis) === 0) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Todos os participantes já foram sorteados.']);
    exit;
}

// Sortear
$sorteado = $participantesDisponiveis[array_rand($participantesDisponiveis)];
$participanteId = $sorteado['id'];

// Determinar ordem
$stmt3 = $conn->prepare("SELECT COUNT(*) AS total FROM sorteios WHERE palestra_id = ?");
$stmt3->bind_param("i", $palestraId);
$stmt3->execute();
$total = $stmt3->get_result()->fetch_assoc()['total'] ?? 0;
$ordem = $total + 1;

// Inserir sorteio com participante_id
$insert = $conn->prepare("
    INSERT INTO sorteios (participante_id, nome, empresa, horario, ordem, palestra_id)
    VALUES (?, ?, ?, CURRENT_TIME, ?, ?)
");
$insert->bind_param("issii", $participanteId, $sorteado['nome'], $sorteado['empresa'], $ordem, $palestraId);
$insert->execute();

// Retornar
echo json_encode([
    'sucesso' => true,
    'participante' => [
        'id' => $participanteId,
        'nome' => $sorteado['nome'],
        'empresa' => $sorteado['empresa'],
        'ordem' => $ordem
    ]
]);
