<?php
include 'conexao.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id'])) {
    $stmt = $conn->prepare("UPDATE palestras SET titulo=?, data=?, participantes=?, empresas=?, sorteados=? WHERE id=?");
    $stmt->bind_param(
        "ssiiii",
        $data['titulo'],
        $data['data'],
        $data['participantes'],
        $data['empresas'],
        $data['sorteados'],
        $data['id']
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Dados incompletos']);
}

$conn->close();
?>
