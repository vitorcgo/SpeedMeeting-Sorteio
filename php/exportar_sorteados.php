<?php
ob_start(); // Evita qualquer saída antes do arquivo ser gerado

require __DIR__ . '/vendor/autoload.php'; // Ajuste o caminho se necessário
require 'conexao.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Pega o ID da palestra via GET
$palestraId = isset($_GET['palestra']) ? intval($_GET['palestra']) : 0;

// Prepara a consulta correta com base na estrutura da tabela 'sorteios'
$stmt = $conn->prepare("
    SELECT s.nome, s.empresa, s.horario 
    FROM sorteios s
    WHERE s.palestra_id = ?
    ORDER BY s.ordem
");

$stmt->bind_param("i", $palestraId);
$stmt->execute();
$result = $stmt->get_result();

// Cria a planilha
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Sorteados');

// Cabeçalhos
$sheet->setCellValue('A1', 'Nome');
$sheet->setCellValue('B1', 'Empresa');
$sheet->setCellValue('C1', 'Horário do Sorteio');

// Preenche os dados
$row = 2;
while ($r = $result->fetch_assoc()) {
    $sheet->setCellValue("A$row", $r['nome']);
    $sheet->setCellValue("B$row", $r['empresa']);
    $sheet->setCellValue("C$row", $r['horario']); // formato TIME (ex: 09:22:51)
    $row++;
}

// Ajusta tamanho automático das colunas
foreach (range('A', 'C') as $col) {
    $sheet->getColumnDimension($col)->setAutoSize(true);
}

// Cabeçalhos HTTP para download
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="sorteados.xlsx"');
header('Cache-Control: max-age=0');

// Gera e envia o arquivo
$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
ob_end_flush();
exit;
