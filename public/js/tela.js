// public/js/tela.js
document.addEventListener('DOMContentLoaded', function() {
    // Global state
    let participantesDisponiveis = [];
    let palestraId = null;
    let sorteioEmProgresso = false;

    // DOM Elements
    const video = document.getElementById('video-apresentacao');
    const conteudoSorteado = document.getElementById('conteudo-sorteado');
    const numeroSorteio = document.getElementById('numero-sorteio');
    const nomeSorteado = document.getElementById('nome-sorteado');
    const empresaSorteada = document.getElementById('empresa-sorteada');
    const botaoIniciarSorteio = document.getElementById('botao-iniciar-sorteio');
    const botaoSorteioContainer = document.getElementById('botao-sorteio-container');

    // Initialize logo slider
    async function atualizarLogoSlider() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const palestraId = urlParams.get('palestra_id');
            
            if (!palestraId) return;
            
            const data = await PalestraManager.listarPalestras();
            const palestra = data.find(p => p.id === palestraId);
            
            if (!palestra || !palestra.empresas || !palestra.empresas.length) return;
            
            const logoTrack = document.getElementById('logo-track');
            const logos = palestra.empresas.map(empresa => `
                <div class="logo-slide">
                    <img src="${empresa.logo_url}" alt="${empresa.nome}">
                </div>
            `).join('');
            
            // Duplicate logos for infinite effect
            logoTrack.innerHTML = logos + logos;
        } catch (error) {
            console.error('Erro ao carregar logos:', error);
        }
    }

    // Initialize
    atualizarLogoSlider();
    // Update logos every 5 minutes
    setInterval(atualizarLogoSlider, 5 * 60 * 1000);

    // Event handler for messages from index.html (control panel)
    window.addEventListener('message', function(event) {
        // Check if message contains initialization data
        if (event.data && event.data.tipo === 'inicializar') {
            participantesDisponiveis = event.data.participantesDisponiveis;
            palestraId = event.data.palestraId;
            
            // Show drawing button
            botaoSorteioContainer.classList.add('visivel');
        }
    });

    // Drawing button click event
    botaoIniciarSorteio.addEventListener('click', function() {
        if (sorteioEmProgresso || participantesDisponiveis.length === 0) return;
        
        // Indicate drawing in progress
        sorteioEmProgresso = true;
        
        // Disable button and show loading
        botaoIniciarSorteio.disabled = true;
        botaoIniciarSorteio.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sorteando...</span>';
        
        // Start video
        video.play();
        
        // Hide button during playback
        botaoSorteioContainer.classList.remove('visivel');
        
        // After 5 seconds, perform drawing
        setTimeout(realizarSorteio, 5000);
    });

    // Function to perform drawing
    async function realizarSorteio() {
        try {
            // Random drawing
            const indiceAleatorio = Math.floor(Math.random() * participantesDisponiveis.length);
            const participanteSorteado = participantesDisponiveis[indiceAleatorio];
            
            // Remove drawn participant from available list
            participantesDisponiveis.splice(indiceAleatorio, 1);
            
            // Register drawing in the database
            const sorteado = await SorteioManager.realizarSorteio(palestraId);
            
            // Create drawing record
            const horario = new Date().toLocaleTimeString();
            const ordem = document.querySelector('#numero-sorteio').textContent || 1;
            const novoSorteado = {
                nome: sorteado.nome,
                empresa: sorteado.empresa,
                horario,
                ordem: parseInt(ordem)
            };

            // Display drawn participant data
            numeroSorteio.textContent = novoSorteado.ordem;
            nomeSorteado.textContent = novoSorteado.nome;
            empresaSorteada.textContent = novoSorteado.empresa;
            conteudoSorteado.classList.remove('escondido');
            
            // Launch confetti
            lancarConfetes();
            
            // Send message back to main window
            window.opener.postMessage({
                tipo: 'sorteioRealizado',
                sorteado: novoSorteado,
                palestraId: palestraId
            }, '*');
            
            // Reset drawing state
            sorteioEmProgresso = false;
            
            // If there are still available participants, show button again after video
            if (participantesDisponiveis.length > 0) {
                video.addEventListener('ended', function videoTerminou() {
                    // Reset drawing button
                    botaoIniciarSorteio.disabled = false;
                    botaoIniciarSorteio.innerHTML = '<i class="fas fa-random"></i><span>Iniciar Sorteio</span>';
                    botaoSorteioContainer.classList.add('visivel');
                    
                    // Remove this event to avoid accumulation
                    video.removeEventListener('ended', videoTerminou);
                });
            }
        } catch (error) {
            console.error('Erro ao realizar sorteio:', error);
            alert('Erro ao realizar sorteio. Por favor, tente novamente.');
            
            // Reset state on error
            sorteioEmProgresso = false;
            botaoIniciarSorteio.disabled = false;
            botaoIniciarSorteio.innerHTML = '<i class="fas fa-random"></i><span>Iniciar Sorteio</span>';
            botaoSorteioContainer.classList.add('visivel');
        }
    }

    // Function to launch confetti
    function lancarConfetes() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD400', '#7B1FA2', '#4CAF50', '#FF5252', '#2196F3']
        });
    }
});