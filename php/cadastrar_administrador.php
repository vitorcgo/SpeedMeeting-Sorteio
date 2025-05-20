<?php
// Cabeçalhos para AJAX
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Conexão com o banco de dados
require_once('conexao.php');

try {
    // Verifica se os campos foram enviados
    if (empty($_POST['usuario']) || empty($_POST['senha'])) {
        throw new Exception('Os campos usuário e senha são obrigatórios.');
    }

    $usuario = trim($_POST['usuario']);
    $senha = trim($_POST['senha']);
    $senhaCriptografada = password_hash($senha, PASSWORD_DEFAULT);

    // Verifica se usuário já existe
    $sqlVerificar = "SELECT id FROM usuarios WHERE usuario = ?";
    $stmtVerificar = $conn->prepare($sqlVerificar);
    if (!$stmtVerificar) throw new Exception("Erro ao preparar verificação: " . $conn->error);

    $stmtVerificar->bind_param("s", $usuario);
    $stmtVerificar->execute();
    $stmtVerificar->store_result();

    if ($stmtVerificar->num_rows > 0) {
        throw new Exception('Este nome de usuário já está em uso.');
    }
    $stmtVerificar->close();

    // Inserir novo administrador
    $sql = "INSERT INTO usuarios (usuario, senha, criado_em) VALUES (?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception("Erro ao preparar inserção: " . $conn->error);

    $stmt->bind_param("ss", $usuario, $senhaCriptografada);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Administrador cadastrado com sucesso.']);
    } else {
        throw new Exception('Erro ao cadastrar administrador.');
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
}
?>
