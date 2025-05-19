-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 19/05/2025 às 05:36
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
(1, 'oI', '682a02dfb1232_Masconte SpeedMeeting.png'),
(2, 'Olá', '682a096499f92_Logo KeyUP-sobre.png'),
(3, 'Ke', '682a096be3ff0_3333.png'),
(4, 'oI', '682a114d38825_Masconte SpeedMeeting.png');

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
(17, 21, 1),
(20, 22, 2),
(21, 22, 3);

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
(21, 'Speed', '2025-02-28'),
(22, 'Teste4324', '2003-10-20');

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
(53, 21, 'Ricardo Alves', 'Startup Lab'),
(54, 21, 'Patricia Mendonça', 'Inova Capital'),
(55, 21, 'Eduardo Silva', 'Tech Ventures'),
(56, 21, 'Bianca Martins', 'Growth Hacking'),
(57, 21, 'Thiago Ferreira', 'IoT Brasil'),
(58, 22, 'Ricardo Alves', 'Startup Lab'),
(59, 22, 'Patricia Mendonça', 'Inova Capital'),
(60, 22, 'Eduardo Silva', 'Tech Ventures'),
(61, 22, 'Bianca Martins', 'Growth Hacking'),
(62, 22, 'Thiago Ferreira', 'IoT Brasil');

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

--
-- Despejando dados para a tabela `sorteios`
--

INSERT INTO `sorteios` (`id`, `palestra_id`, `nome`, `empresa`, `horario`, `ordem`, `participante_id`) VALUES
(17, 22, 'Eduardo Silva', 'Tech Ventures', '00:35:29', 1, 60);

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
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `logos`
--
ALTER TABLE `logos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `logo_palestra`
--
ALTER TABLE `logo_palestra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de tabela `palestras`
--
ALTER TABLE `palestras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de tabela `participantes`
--
ALTER TABLE `participantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT de tabela `sorteios`
--
ALTER TABLE `sorteios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

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
