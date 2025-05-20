<?php
// Cabeçalhos para permitir requisição AJAX
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Conexão com banco de dados
require_once('conexao.php');

try {
    // Verifica se o ID foi enviado
    if (empty($_POST['id'])) {
        throw new Exception('ID do administrador não foi fornecido.');
    }

    $id = intval($_POST['id']); // segurança básica

    // Impede exclusão do próprio usuário "root" ou com ID 1 (opcional)
    if ($id === 5) {
        throw new Exception('Este administrador não pode ser excluído.');
    }

    // Verifica se o administrador existe
    $check = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
    $check->bind_param("i", $id);
    $check->execute();
    $check->store_result();

    if ($check->num_rows === 0) {
        throw new Exception('Administrador não encontrado.');
    }

    $check->close();

    // Executa a exclusão
    $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Administrador excluído com sucesso.']);
    } else {
        throw new Exception('Erro ao excluir administrador.');
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
}
?>
