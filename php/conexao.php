<?php
$host = 'srv123.main-hosting.eu';      // ou outro que a Hostinger mostrar
$usuario = 'u123456789_user';          // substitua pelo seu
$senha = 'sua_senha_aqui';             // substitua pela senha correta
$banco = 'u123456789_db';              // nome do banco completo

$conexao = new mysqli($host, $usuario, $senha, $banco);

if ($conexao->connect_error) {
    die("Erro de conexão: " . $conexao->connect_error);
}

$conexao->set_charset("utf8mb4");
?>
