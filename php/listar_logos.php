<?php
require 'conexao.php';

$palestraId = isset($_GET['palestra']) ? intval($_GET['palestra']) : null;

// Lista todas as logos disponíveis
$logosQuery = $conn->query("SELECT id, nome_empresa AS nome, caminho_arquivo AS imagem FROM logos");
$logos = $logosQuery->fetch_all(MYSQLI_ASSOC);

if ($palestraId) {
    // Se tiver ID da palestra, retorna também as aplicadas
    $selecionadasQuery = $conn->prepare("SELECT logo_id FROM logo_palestra WHERE palestra_id = ?");
    $selecionadasQuery->bind_param("i", $palestraId);
    $selecionadasQuery->execute();
    $selecionadasResult = $selecionadasQuery->get_result()->fetch_all(MYSQLI_ASSOC);
    $idsSelecionadas = array_map('strval', array_column($selecionadasResult, 'logo_id'));

    echo json_encode([
        'logos' => $logos,
        'selecionadas' => $idsSelecionadas
    ]);
} else {
    // Caso contrário, apenas a galeria
    echo json_encode([
        'logos' => $logos
    ]);
}
