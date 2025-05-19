<?php
header('Content-Type: application/json');
require_once 'conexao.php';

// Consulta todas as palestras
$sql = "SELECT p.id, p.titulo, p.data,
           COUNT(DISTINCT pa.id) AS total_participantes,
           COUNT(DISTINCT pa.empresa) AS total_empresas,
           COUNT(DISTINCT s.id) AS total_sorteados
        FROM palestras p
        LEFT JOIN participantes pa ON pa.palestra_id = p.id
        LEFT JOIN sorteios s ON s.palestra_id = p.id
        GROUP BY p.id, p.titulo, p.data
        ORDER BY p.data ASC";

$result = $conn->query($sql);
$palestras = [];

if ($result && $result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    // Converte data de 'YYYY-MM-DD' para 'DD/MM/YYYY'
    $data_original = $row['data'];
    $data_formatada = date('d/m/Y', strtotime($data_original));
    $row['data'] = $data_formatada;

    $palestras[] = $row;
}
}

echo json_encode($palestras);
?>
