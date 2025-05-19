<?php
// Configurações do banco de dados
$host = "localhost";
$usuario = "root";
$senha = "";
$banco = "palestra_db";

// Conectar ao banco de dados
$conn = new mysqli($host, $usuario, $senha, $banco);

// Verificar conexão
if ($conn->connect_error) {
    die("Erro ao conectar ao banco de dados: " . $conn->connect_error);
}

?>
