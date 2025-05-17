<?php
// /data/chats/x7rpud/workspace/uploads/project/src/php/tela.php

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration (same as index.php)
define('DB_HOST', 'localhost');
define('DB_NAME', 'palestra_db');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Get palestra information if ID is provided
$palestraId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$palestraInfo = null;

if ($palestraId) {
    try {
        $stmt = $pdo->prepare("
            SELECT p.*, e.nome as empresa_nome, e.logo_path 
            FROM palestras p
            LEFT JOIN palestra_empresa pe ON p.id = pe.palestra_id
            LEFT JOIN empresas e ON pe.empresa_id = e.id
            WHERE p.id = :id
        ");
        $stmt->execute(['id' => $palestraId]);
        $palestraInfo = $stmt->fetch();
    } catch (PDOException $e) {
        die("Error fetching palestra info: " . $e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speed Meeting | Apresentação</title>
    <link rel="stylesheet" href="../css/tela.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
</head>
<body>
    <div class="container-apresentacao">
        <!-- Área do Vídeo -->
        <div class="area-video">
            <video id="video-apresentacao">
                <source src="../assets/upload/sorteio-speed-coutdown.mp4" type="video/mp4">
                Seu navegador não suporta a tag de vídeo.
            </video>
            
            <!-- Botão de Sorteio -->
            <div id="botao-sorteio-container">
                <button id="botao-iniciar-sorteio" class="botao-sorteio">
                    <i class="fas fa-random"></i>
                    <span>Iniciar Sorteio</span>
                </button>
            </div>
        </div>
        
        <!-- Área do Sorteado -->
        <div class="area-sorteado" id="area-sorteado">
            <div class="cabecalho-sorteado">
                <div class="logo-sorteado">
                    <div id="logos-container" data-palestra-id="<?php echo htmlspecialchars($palestraId); ?>" data-apresentacao="true">
                        <div class="logo-slide">
                            <h2>Speed Meeting</h2>
                            <span>Rodada de Negócios</span>
                        </div>
                    </div>
                </div>
                <div class="titulo-sorteado">
                    <?php echo $palestraInfo ? htmlspecialchars($palestraInfo['titulo']) : 'Sorteado'; ?>
                </div>
            </div>
            <div class="conteudo-sorteado escondido" id="conteudo-sorteado">
                <div class="contador">Sorteado #<span id="numero-sorteio">1</span></div>
                <div class="nome-sorteado" id="nome-sorteado">Nome do Participante</div>
                <div class="empresa-sorteada" id="empresa-sorteada">Empresa do Participante</div>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const video = document.getElementById('video-apresentacao');
            const conteudoSorteado = document.getElementById('conteudo-sorteado');
            const numeroSorteio = document.getElementById('numero-sorteio');
            const nomeSorteado = document.getElementById('nome-sorteado');
            const empresaSorteada = document.getElementById('empresa-sorteada');
            const botaoIniciarSorteio = document.getElementById('botao-iniciar-sorteio');
            const botaoSorteioContainer = document.getElementById('botao-sorteio-container');
            
            let sorteioEmProgresso = false;
            const palestraId = <?php echo $palestraId ?: 'null'; ?>;
            
            if (!palestraId) {
                console.error('ID da palestra não fornecido');
                return;
            }
            
            // Mostrar o botão de sorteio inicialmente
            botaoSorteioContainer.classList.add('visivel');
            
            // Evento de clique no botão de sorteio
            botaoIniciarSorteio.addEventListener('click', async function() {
                if (sorteioEmProgresso) return;
                
                sorteioEmProgresso = true;
                botaoIniciarSorteio.disabled = true;
                botaoIniciarSorteio.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sorteando...</span>';
                botaoSorteioContainer.classList.remove('visivel');
                
                video.play();
                
                try {
                    const response = await fetch('index.php?api=sortear', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `palestraId=${palestraId}`
                    });
                    
                    const data = await response.json();
                    
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    
                    setTimeout(function() {
                        numeroSorteio.textContent = data.sorteado.ordem;
                        nomeSorteado.textContent = data.sorteado.nome;
                        empresaSorteada.textContent = data.sorteado.empresa;
                        conteudoSorteado.classList.remove('escondido');
                        
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#FFD400', '#7B1FA2', '#4CAF50', '#FF5252', '#2196F3']
                        });
                        
                        // Reset for next draw
                        sorteioEmProgresso = false;
                        botaoIniciarSorteio.disabled = false;
                        botaoIniciarSorteio.innerHTML = '<i class="fas fa-random"></i><span>Iniciar Sorteio</span>';
                        
                        // Show button after video ends
                        video.addEventListener('ended', function videoTerminou() {
                            botaoSorteioContainer.classList.add('visivel');
                            video.removeEventListener('ended', videoTerminou);
                        });
                    }, 5000);
                    
                } catch (error) {
                    console.error('Erro no sorteio:', error);
                    alert('Erro ao realizar o sorteio: ' + error.message);
                    
                    sorteioEmProgresso = false;
                    botaoIniciarSorteio.disabled = false;
                    botaoIniciarSorteio.innerHTML = '<i class="fas fa-random"></i><span>Iniciar Sorteio</span>';
                    botaoSorteioContainer.classList.add('visivel');
                }
            });
        });
    </script>
</body>
</html>