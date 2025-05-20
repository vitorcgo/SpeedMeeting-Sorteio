<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Conexão com o banco de dados
require_once('conexao.php');

// Consulta usando mysqli
$sql = "SELECT id, usuario, senha, DATE_FORMAT(criado_em, '%d/%m/%Y %H:%i:%s') as data_criacao FROM usuarios";
$resultado = $conn->query($sql);

$administradores = [];

if ($resultado && $resultado->num_rows > 0) {
    while ($linha = $resultado->fetch_assoc()) {
        $administradores[] = $linha;
    }
    echo json_encode($administradores);
} else {
    echo json_encode([]);
}

// Fecha conexão (opcional no fim do script)
$conn->close();
?>
