<?php
// src/utils/ExcelGenerator.php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExcelGenerator {
    public function generateParticipantesExcel($participantes) {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set headers
        $sheet->setCellValue('A1', 'Nome');
        $sheet->setCellValue('B1', 'Empresa');
        
        // Set data
        $row = 2;
        foreach ($participantes as $participante) {
            $sheet->setCellValue('A' . $row, $participante['nome']);
            $sheet->setCellValue('B' . $row, $participante['empresa']);
            $row++;
        }
        
        // Auto-size columns
        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setAutoSize(true);
        
        // Apply style to header
        $sheet->getStyle('A1:B1')->getFont()->setBold(true);
        
        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
    }
    
    public function generateSorteadosExcel($sorteados) {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set headers
        $sheet->setCellValue('A1', 'Nome');
        $sheet->setCellValue('B1', 'Empresa');
        $sheet->setCellValue('C1', 'Data/Hora do Sorteio');
        
        // Set data
        $row = 2;
        foreach ($sorteados as $sorteado) {
            $sheet->setCellValue('A' . $row, $sorteado['nome']);
            $sheet->setCellValue('B' . $row, $sorteado['empresa']);
            $sheet->setCellValue('C' . $row, date('d/m/Y H:i:s', strtotime($sorteado['data_sorteio'])));
            $row++;
        }
        
        // Auto-size columns
        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setAutoSize(true);
        $sheet->getColumnDimension('C')->setAutoSize(true);
        
        // Apply style to header
        $sheet->getStyle('A1:C1')->getFont()->setBold(true);
        
        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
    }
}