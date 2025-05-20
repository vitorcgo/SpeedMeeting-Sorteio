<?php
header('Content-Type: application/json');

// Permitir CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
    exit;
}

// Conexão com banco de dados
require_once 'conexao.php';

// Obter dados da requisição
$dados = json_decode(file_get_contents('php://input'), true);

// Validar dados recebidos
if (!isset($dados['logo_id']) || empty($dados['logo_id'])) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'ID da logo não fornecido']);
    exit;
}

$logoId = intval($dados['logo_id']);

try {
    // Iniciar transação
    $conn->begin_transaction();

    // Buscar informações da logo antes de excluir
    $stmt = $conn->prepare("SELECT imagem FROM logos WHERE id = ?");
    $stmt->bind_param("i", $logoId);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        throw new Exception("Logo não encontrada");
    }

    $logo = $resultado->fetch_assoc();
    $nomeArquivo = $logo['imagem'];
    $caminhoArquivo = "../upload/" . $nomeArquivo;

    // Excluir entradas na tabela de relacionamento primeiro
    $stmt = $conn->prepare("DELETE FROM palestras_logos WHERE logo_id = ?");
    $stmt->bind_param("i", $logoId);
    $stmt->execute();

    // Excluir a logo do banco de dados
    $stmt = $conn->prepare("DELETE FROM logos WHERE id = ?");
    $stmt->bind_param("i", $logoId);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        throw new Exception("Erro ao excluir logo do banco de dados");
    }

    // Excluir arquivo físico se existir
    if (file_exists($caminhoArquivo) && !empty($nomeArquivo)) {
        if (!unlink($caminhoArquivo)) {
            // Registrar erro, mas não impedir a operação
            error_log("Não foi possível excluir o arquivo: $caminhoArquivo");
        }
    }

    // Confirmar transação
    $conn->commit();

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Logo excluída com sucesso'
    ]);

} catch (Exception $e) {
    // Reverter transação em caso de erro
    $conn->rollback();
    
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro ao excluir logo: ' . $e->getMessage()
    ]);
} finally {
    $conn->close();
}