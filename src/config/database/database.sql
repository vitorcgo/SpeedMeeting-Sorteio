-- src/config/sql/database.sql

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS palestra_db;
USE palestra_db;

-- Create palestras table
CREATE TABLE IF NOT EXISTS palestras (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    data_hora DATETIME NOT NULL,
    descricao TEXT,
    local VARCHAR(255),
    status ENUM('agendada', 'em_andamento', 'finalizada') DEFAULT 'agendada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create empresas table
CREATE TABLE IF NOT EXISTS empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    logo VARCHAR(255),  -- Changed from LONGBLOB to store file path
    ordem INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_empresa_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create palestra_empresas table (relationship table)
CREATE TABLE IF NOT EXISTS palestra_empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    palestra_id INT NOT NULL,
    empresa_id INT NOT NULL,
    ordem INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (palestra_id) REFERENCES palestras(id) ON DELETE CASCADE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_palestra_empresa (palestra_id, empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create participantes table
CREATE TABLE IF NOT EXISTS participantes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    palestra_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    empresa VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (palestra_id) REFERENCES palestras(id) ON DELETE CASCADE,
    INDEX idx_palestra_id (palestra_id),
    INDEX idx_participantes_empresa (empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sorteados table
CREATE TABLE IF NOT EXISTS sorteados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    palestra_id INT NOT NULL,
    participante_id INT NOT NULL,
    data_sorteio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ordem INT,
    FOREIGN KEY (palestra_id) REFERENCES palestras(id) ON DELETE CASCADE,
    FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participante_palestra (participante_id, palestra_id),
    INDEX idx_palestra_sorteio (palestra_id, data_sorteio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create table for system configuration
CREATE TABLE IF NOT EXISTS configuracoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chave VARCHAR(50) NOT NULL,
    valor TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_config_chave (chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default configuration values
INSERT INTO configuracoes (chave, valor) VALUES
('tempo_entre_sorteios', '30'),
('modo_sorteio', 'aleatorio'),
('max_sorteios_por_palestra', '0')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- Add indexes for better performance
CREATE INDEX idx_palestras_data ON palestras(data_hora);
CREATE INDEX idx_sorteados_data ON sorteados(data_sorteio);