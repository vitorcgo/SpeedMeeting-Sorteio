import { obterDadosDaPalestra, registrarSorteio } from './tela_ajax.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Tela de apresentação carregada');

    const video = document.getElementById('video-apresentacao');
    const conteudoSorteado = document.getElementById('conteudo-sorteado');
    const numeroSorteio = document.getElementById('numero-sorteio');
    const nomeSorteado = document.getElementById('nome-sorteado');
    const empresaSorteada = document.getElementById('empresa-sorteada');
    const botaoIniciarSorteio = document.getElementById('botao-iniciar-sorteio');
    const botaoSorteioContainer = document.getElementById('botao-sorteio-container');
    const slideshowLogos = document.getElementById('slideshow-logos');

    let sorteioEmProgresso = false;
    let slideshowInterval = null;
    let participantesSorteados = []; // Array para rastrear participantes já sorteados

    // ✅ ID da palestra
    function obterIdPalestraDaURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || params.get('palestra'); // <- inverter a ordem
    }


    const palestraId = obterIdPalestraDaURL();
    if (!palestraId) {
        alert('ID da palestra não informado na URL');
        return;
    }
    
    // Carregar dados da palestra, incluindo logos
    async function carregarDadosPalestra() {
        try {
            // Obter dados da palestra via AJAX
            const resposta = await fetch(`php/obter_palestra.php?id=${palestraId}`);
            const dados = await resposta.json();
            
            // Guardar os participantes já sorteados
            participantesSorteados = dados.sorteados.map(s => s.participante_id);
            
            // Inicializar o slider com as logos
            iniciarSlideshowLogos(dados.logos);
            
            return dados;
        } catch (erro) {
            console.error('Erro ao carregar dados da palestra:', erro);
        }
    }
    
    // Carregar dados imediatamente
    carregarDadosPalestra();

    // ✅ Botão de sorteio
    botaoIniciarSorteio.addEventListener('click', async () => {
        if (sorteioEmProgresso) return;

        sorteioEmProgresso = true;
        botaoIniciarSorteio.disabled = true;
        botaoIniciarSorteio.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sorteando...</span>';
        video.play();
        botaoSorteioContainer.classList.remove('visivel');
        
        // Reset do sorteio anterior
        conteudoSorteado.classList.add('escondido');
        nomeSorteado.textContent = '';
        empresaSorteada.textContent = '';

        setTimeout(realizarSorteio, 5000);
    });

    async function realizarSorteio() {
        try {
            // Passar a lista de IDs já sorteados para excluir do próximo sorteio
            const resultado = await registrarSorteio(palestraId, participantesSorteados);

            if (!resultado?.sucesso) {
                throw new Error(resultado?.mensagem || 'Erro ao realizar sorteio');
            }

            const sorteado = resultado.participante;
            const ordem = parseInt(numeroSorteio.textContent) + 1;
            
            // Adicionar o ID do sorteado à lista para não ser sorteado novamente
            participantesSorteados.push(sorteado.id);

            numeroSorteio.textContent = ordem;
            nomeSorteado.textContent = sorteado.nome;
            empresaSorteada.textContent = sorteado.empresa;
            conteudoSorteado.classList.remove('escondido');

            localStorage.setItem('sorteioAtualizado', Date.now());

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD400', '#7B1FA2', '#4CAF50', '#FF5252', '#2196F3']
            });

            video.addEventListener('ended', function handler() {
                botaoIniciarSorteio.disabled = false;
                botaoIniciarSorteio.innerHTML = '<i class="fas fa-random"></i><span>Iniciar Sorteio</span>';
                botaoSorteioContainer.classList.add('visivel');
                video.removeEventListener('ended', handler);
            });

        } catch (erro) {
            alert('Erro ao sortear: ' + erro.message);
            console.error(erro);
        } finally {
            sorteioEmProgresso = false;
        }
    }

    // ✅ Slideshow das logos da palestra
    function iniciarSlideshowLogos(logos) {
        if (slideshowInterval) clearInterval(slideshowInterval);
        slideshowLogos.innerHTML = '';

        if (!logos || logos.length === 0) {
            slideshowLogos.classList.add('escondido');
            return;
        }

        const container = document.createElement('div');
        container.className = 'carrossel-container';
        slideshowLogos.appendChild(container);

        function criarConjuntoLogos() {
            logos.forEach((logo, index) => {
                const div = document.createElement('div');
                div.className = 'carrossel-item';
                const img = document.createElement('img');
                img.src = `upload/${logo.imagem}`;
                img.alt = logo.nome;
                img.id = `logo-slide-${index}`;
                div.appendChild(img);
                container.appendChild(div);
            });
        }

        criarConjuntoLogos();
        if (logos.length < 10) {
            const vezes = Math.min(5, Math.ceil(20 / logos.length));
            for (let i = 0; i < vezes; i++) criarConjuntoLogos();
        }

        slideshowLogos.classList.remove('escondido');
        container.style.animation = 'rolar-carrossel 60s linear infinite';
    }

    function pararSlideshowLogos() {
        if (slideshowInterval) clearInterval(slideshowInterval);
        slideshowLogos.classList.add('escondido');
        slideshowLogos.innerHTML = '';
    }

    // ✅ Galeria de logos (somente se existir)
    async function carregarGaleriaLogos() {
        const container = document.getElementById('galeria-logos');
        const contador = document.getElementById('total-logos');
        if (!container || !contador) return;

        try {
            const resposta = await fetch('php/listar_logos.php');
            const dados = await resposta.json();

            container.innerHTML = '';
            dados.logos.forEach(logo => {
                const div = document.createElement('div');
                div.className = 'item-logo-galeria';

                const img = document.createElement('img');
                img.src = `upload/${logo.imagem}`;
                img.alt = logo.nome;

                const nome = document.createElement('span');
                nome.textContent = logo.nome;

                div.appendChild(img);
                div.appendChild(nome);
                container.appendChild(div);
            });

            contador.textContent = dados.logos.length;

        } catch (erro) {
            console.error('Erro ao carregar galeria:', erro);
        }
    }

});
