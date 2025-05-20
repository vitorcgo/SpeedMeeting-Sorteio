-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 20/05/2025 às 07:49
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `palestra_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `logos`
--

CREATE TABLE `logos` (
  `id` int(11) NOT NULL,
  `nome_empresa` varchar(255) NOT NULL,
  `caminho_arquivo` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `logos`
--

INSERT INTO `logos` (`id`, `nome_empresa`, `caminho_arquivo`) VALUES
(5, 'Patrocinio CSF', '682c0268bd349_Credenciamento.png'),
(6, 'Key UP', '682c050b02d9d_KeyUP.png');

-- --------------------------------------------------------

--
-- Estrutura para tabela `logo_palestra`
--

CREATE TABLE `logo_palestra` (
  `id` int(11) NOT NULL,
  `palestra_id` int(11) NOT NULL,
  `logo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `logo_palestra`
--

INSERT INTO `logo_palestra` (`id`, `palestra_id`, `logo_id`) VALUES
(30, 26, 5),
(31, 30, 5);

-- --------------------------------------------------------

--
-- Estrutura para tabela `palestras`
--

CREATE TABLE `palestras` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `data` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `palestras`
--

INSERT INTO `palestras` (`id`, `titulo`, `data`) VALUES
(26, 'Google', '2025-05-16'),
(30, 'Disrupta', '2025-05-20');

-- --------------------------------------------------------

--
-- Estrutura para tabela `participantes`
--

CREATE TABLE `participantes` (
  `id` int(11) NOT NULL,
  `palestra_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `empresa` varchar(255) DEFAULT 'Sem empresa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `participantes`
--

INSERT INTO `participantes` (`id`, `palestra_id`, `nome`, `empresa`) VALUES
(68, 26, 'Ricardo Alves', 'Startup Lab'),
(76, 26, 'Patricia Mendonça', 'Inova Capital'),
(81, 26, 'Eduardo Silva', 'Tech Ventures'),
(88, 26, 'Bianca Martins', 'Growth Hacking'),
(92, 26, 'Thiago Ferreira', 'IoT Brasil'),
(98, 30, 'Ricardo Alves', 'Startup Lab'),
(99, 30, 'Patricia Mendonça', 'Inova Capital'),
(100, 30, 'Eduardo Silva', 'Tech Ventures'),
(101, 30, 'Bianca Martins', 'Growth Hacking'),
(102, 30, 'Thiago Ferreira', 'IoT Brasil'),
(103, 30, 'Ana Julia', 'Pop Mart'),
(104, 30, 'Vitor Gomes', 'Santander'),
(105, 30, 'Daiana Lopes', 'Google'),
(106, 30, 'Juliana Carvalho', 'Investiment'),
(107, 30, 'Diego Nogueira', 'Londres');

-- --------------------------------------------------------

--
-- Estrutura para tabela `sorteios`
--

CREATE TABLE `sorteios` (
  `id` int(11) NOT NULL,
  `palestra_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `empresa` varchar(255) DEFAULT NULL,
  `horario` time DEFAULT NULL,
  `ordem` int(11) DEFAULT NULL,
  `participante_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `usuario`, `senha`, `criado_em`) VALUES
(5, 'vitor', '$2y$10$2io9oM8izY5ydt0kntQ3S.jfhsnFvOu9nfMEu3n6YDm6nQ.FrBYp2', '2025-05-20 05:47:59'),
(6, 'Daiana', '$2y$10$g8yDyd9Tmg46469K6dH.VOxHCTlQsMmQ5j3dqn6xDdhPG/ZKlCa3e', '2025-05-20 05:49:38');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `logos`
--
ALTER TABLE `logos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `logo_palestra`
--
ALTER TABLE `logo_palestra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `palestra_id` (`palestra_id`),
  ADD KEY `logo_id` (`logo_id`);

--
-- Índices de tabela `palestras`
--
ALTER TABLE `palestras`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `participantes`
--
ALTER TABLE `participantes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `palestra_id` (`palestra_id`);

--
-- Índices de tabela `sorteios`
--
ALTER TABLE `sorteios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `palestra_id` (`palestra_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario` (`usuario`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `logos`
--
ALTER TABLE `logos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `logo_palestra`
--
ALTER TABLE `logo_palestra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de tabela `palestras`
--
ALTER TABLE `palestras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de tabela `participantes`
--
ALTER TABLE `participantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT de tabela `sorteios`
--
ALTER TABLE `sorteios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `logo_palestra`
--
ALTER TABLE `logo_palestra`
  ADD CONSTRAINT `logo_palestra_ibfk_1` FOREIGN KEY (`palestra_id`) REFERENCES `palestras` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `logo_palestra_ibfk_2` FOREIGN KEY (`logo_id`) REFERENCES `logos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `participantes`
--
ALTER TABLE `participantes`
  ADD CONSTRAINT `participantes_ibfk_1` FOREIGN KEY (`palestra_id`) REFERENCES `palestras` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `sorteios`
--
ALTER TABLE `sorteios`
  ADD CONSTRAINT `sorteios_ibfk_1` FOREIGN KEY (`palestra_id`) REFERENCES `palestras` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
