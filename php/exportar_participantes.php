<?php
require 'vendor/autoload.php';
require 'conexao.php'; // deve configurar corretamente $conn

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Captura ID da palestra
$palestraId = $_GET['palestra'] ?? 0;

$stmt = $conn->prepare("SELECT nome, empresa FROM participantes WHERE palestra_id = ?");
$stmt->bind_param("i", $palestraId);
$stmt->execute();
$result = $stmt->get_result();

// Cria planilha
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Participantes');

// Cabeçalhos
$sheet->setCellValue('A1', 'Nome');
$sheet->setCellValue('B1', 'Empresa');

// Preenche dados
$row = 2;
while ($r = $result->fetch_assoc()) {
    $sheet->setCellValue("A$row", $r['nome']);
    $sheet->setCellValue("B$row", $r['empresa']);
    $row++;
}

// Ajusta largura das colunas
foreach (range('A', 'B') as $col) {
    $sheet->getColumnDimension($col)->setAutoSize(true);
}

// Cabeçalhos corretos para Excel
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="participantes.xlsx"');
header('Cache-Control: max-age=0');
header('Expires: 0');
header('Pragma: public');

// Salva e envia
$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
