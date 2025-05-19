<?php
require 'conexao.php';
require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

if (!isset($_GET['id'])) {
    http_response_code(400);
    exit("ID da palestra não fornecido.");
}

$id = intval($_GET['id']);

// Buscar título da palestra
$palestra = $conn->prepare("SELECT titulo FROM palestras WHERE id = ?");
$palestra->bind_param("i", $id);
$palestra->execute();
$resultado = $palestra->get_result();

if ($resultado->num_rows === 0) {
    exit("Palestra não encontrada.");
}

$tituloPalestra = $resultado->fetch_assoc()['titulo'];

// Buscar participantes
$stmt = $conn->prepare("SELECT nome, empresa FROM participantes WHERE palestra_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();

// Criar planilha
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle("Participantes");

$sheet->setCellValue('A1', 'Nome');
$sheet->setCellValue('B1', 'Empresa');

$linha = 2;
while ($row = $res->fetch_assoc()) {
    $sheet->setCellValue("A$linha", $row['nome']);
    $sheet->setCellValue("B$linha", $row['empresa']);
    $linha++;
}

// Enviar download
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header("Content-Disposition: attachment; filename=\"Participantes_{$tituloPalestra}.xlsx\"");
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
