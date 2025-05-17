<?php
// src/utils/ExcelProcessor.php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

class ExcelProcessor {
    private $allowedExtensions = ['xlsx', 'xls'];
    
    public function processExcel($file, $palestraId) {
        // Validate file
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedExtensions)) {
            throw new Exception('Formato de arquivo inválido. Use .xlsx ou .xls');
        }
        
        // Load Excel file
        $spreadsheet = IOFactory::load($file['tmp_name']);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();
        
        // Remove header if exists
        if (strtolower($rows[0][0]) === 'nome' || strtolower($rows[0][1]) === 'empresa') {
            array_shift($rows);
        }
        
        $participantes = [];
        $pdo = Conexao::getInstance();
        
        // Begin transaction
        $pdo->beginTransaction();
        
        try {
            $stmt = $pdo->prepare("
                INSERT INTO participantes (palestra_id, nome, empresa) 
                VALUES (:palestra_id, :nome, :empresa)
            ");
            
            foreach ($rows as $row) {
                if (empty($row[0]) || empty($row[1])) continue;
                
                $nome = trim($row[0]);
                $empresa = trim($row[1]);
                
                $stmt->execute([
                    'palestra_id' => $palestraId,
                    'nome' => $nome,
                    'empresa' => $empresa
                ]);
                
                $participantes[] = [
                    'id' => $pdo->lastInsertId(),
                    'nome' => $nome,
                    'empresa' => $empresa
                ];
            }
            
            $pdo->commit();
            return $participantes;
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw new Exception('Erro ao processar arquivo: ' . $e->getMessage());
        }
    }
}