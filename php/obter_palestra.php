<?php
require 'conexao.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID não fornecido']);
    exit;
}

// ✅ Dados da palestra (título e data)
$stmt = $conn->prepare("SELECT titulo, data FROM palestras WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$palestra = $stmt->get_result()->fetch_assoc();

if (!$palestra) {
    http_response_code(404);
    echo json_encode(['erro' => 'Palestra não encontrada']);
    exit;
}

$palestra['data'] = date('d/m/Y', strtotime($palestra['data']));

// ✅ Participantes (agora com ID)
$stmt = $conn->prepare("SELECT id, nome, empresa FROM participantes WHERE palestra_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$participantes = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// ✅ Sorteados (com participante_id para comparação)
$stmt = $conn->prepare("SELECT participante_id, nome, empresa, horario, ordem FROM sorteios WHERE palestra_id = ? ORDER BY ordem ASC");
$stmt->bind_param("i", $id);
$stmt->execute();
$sorteados = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$logosQuery = $conn->prepare("
    SELECT l.nome_empresa AS nome, l.caminho_arquivo AS imagem
    FROM logos l
    INNER JOIN logo_palestra lp ON lp.logo_id = l.id
    WHERE lp.palestra_id = ?
");
$logosQuery->bind_param("i", $id);
$logosQuery->execute();
$logos = $logosQuery->get_result()->fetch_all(MYSQLI_ASSOC);

// ✅ Resposta final
echo json_encode([
    'titulo' => $palestra['titulo'],
    'data' => $palestra['data'],
    'participantes' => $participantes,
    'sorteados' => $sorteados,
    'logos' => $logos
]);
exit;
