import { obterDadosDaPalestra, registrarSorteio } from './tela_ajax.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Inicialização da tela de apresentação

    const video = document.getElementById('video-apresentacao');
    const conteudoSorteado = document.getElementById('conteudo-sorteado');
    const numeroSorteio = document.getElementById('numero-sorteio');
    const nomeSorteado = document.getElementById('nome-sorteado');
    const empresaSorteada = document.getElementById('empresa-sorteada');
    const botaoIniciarSorteio = document.getElementById('botao-iniciar-sorteio');
    const botaoSorteioContainer = document.getElementById('botao-sorteio-container');
    const slideshowLogos = document.getElementById('slideshow-logos');
    const videoOverlay = document.getElementById('video-overlay');
    const videoTransicao = document.getElementById('video-transicao');


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
        Swal.fire({
            title: 'Erro!',
            text: 'ID da palestra não informado na URL',
            icon: 'error',
            confirmButtonColor: 'var(--cor-perigo)',
            confirmButtonText: 'OK',
            showClass: {
                popup: 'animate__animated animate__fadeIn'
            }
        });
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

        // Esconde interface anterior
        conteudoSorteado.classList.add('escondido');
        nomeSorteado.textContent = '';
        empresaSorteada.textContent = '';
        document.querySelector('.container-apresentacao').style.display = 'none';
        slideshowLogos.style.display = 'none';

        // 🔽 1. FAZ o sorteio antes
        let resultado;
        try {
            resultado = await registrarSorteio(palestraId, participantesSorteados);
            if (!resultado?.sucesso) {
                throw new Error(resultado?.mensagem || 'Erro ao realizar sorteio');
            }
        } catch (erro) {
            Swal.fire({
                title: 'Erro!',
                text: erro.message,
                icon: 'error',
                confirmButtonColor: 'var(--cor-perigo)',
                confirmButtonText: 'OK'
            });
            sorteioEmProgresso = false;
            return;
        }

        const sorteado = resultado.participante;
        const ordem = parseInt(numeroSorteio.textContent) + 1;
        participantesSorteados.push(sorteado.id);

        // 🔽 2. Mostra o vídeo de transição
        videoOverlay.classList.remove('escondido');
        videoTransicao.currentTime = 0;
        videoTransicao.play();

        // 🔽 3. Após 5s, mostra sorteado
        setTimeout(() => {
            videoOverlay.classList.add('escondido');
            document.querySelector('.container-apresentacao').style.display = '';
            slideshowLogos.style.display = '';

            // Atualiza os dados sorteados
            numeroSorteio.textContent = ordem;
            nomeSorteado.textContent = sorteado.nome;
            empresaSorteada.textContent = sorteado.empresa;
            conteudoSorteado.classList.remove('escondido');
            document.getElementById('area-sorteado').classList.remove('escondido');

            // 🔽 Notifica o admin
            const chaveUnica = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem('sorteioAtualizado', chaveUnica);

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD400', '#7B1FA2', '#4CAF50', '#FF5252', '#2196F3']
            });

            setTimeout(() => {
                botaoIniciarSorteio.disabled = false;
                botaoIniciarSorteio.innerHTML = '<i class="fas fa-random"></i><span>Iniciar Sorteio</span>';
                botaoSorteioContainer.classList.add('visivel');
            }, 5000);

            sorteioEmProgresso = false;
        }, 5000);
    });

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
