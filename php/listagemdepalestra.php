<?php
include 'conexao.php';

header('Content-Type: application/json');

// Consulta para buscar todas as palestras
$sql = "SELECT titulo, data, participantes, empresas, sorteados FROM palestras ORDER BY data DESC";
$result = $conn->query($sql);

$palestras = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $palestras[] = $row;
    }
}

echo json_encode($palestras);
$conn->close();
?>