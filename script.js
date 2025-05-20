import { cadastrarPalestra, listarPalestras, listarAdministradores, cadastrarAdministrador } from './ajax.js';

async function iniciarSorteioFrontEnd(palestraId) {
    const resposta = await fetch(`php/obter_participantes_sorteio.php?id=${palestraId}`);
    const dados = await resposta.json();

    const todos = dados.participantes;
    const sorteadosIds = dados.sorteados;

    const disponiveis = todos.filter(p => !sorteadosIds.includes(parseInt(p.id)));

    if (disponiveis.length === 0) {
        Swal.fire({
            title: 'Aviso',
            text: 'Todos os participantes já foram sorteados.',
            icon: 'info',
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#3085d6',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
        return;
    }

    const sorteado = disponiveis[Math.floor(Math.random() * disponiveis.length)];

    document.getElementById('nome-sorteado').textContent = sorteado.nome;
    document.getElementById('empresa-sorteada').textContent = sorteado.empresa;
    document.getElementById('resultado-sorteio').classList.remove('escondido');

    await fetch('php/registrar_sorteio.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palestra_id: palestraId, participante_id: sorteado.id })
    });

    carregarPalestraAtiva(palestraId);
}

async function carregarPalestraAtiva(id) {
    try {
        // Adiciona efeito de loading com GSAP
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-overlay';
        loadingElement.innerHTML = '<div class="spinner-circle"></div>';
        document.body.appendChild(loadingElement);

        gsap.fromTo(loadingElement,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
        );

        const resposta = await fetch(`php/obter_palestra.php?id=${id}`);
        const dados = await resposta.json();

        // Animação do título da palestra
        const tituloPalestra = document.getElementById('titulo-palestra-ativa');
        tituloPalestra.textContent = dados.titulo;
        gsap.fromTo(tituloPalestra,
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'back.out' }
        );

        document.getElementById('data-palestra-ativa').textContent = dados.data;

        const lista = document.getElementById('lista-participantes');
        const totalParticipantes = document.getElementById('total-participantes');
        const totalEmpresas = document.getElementById('total-empresas');
        lista.innerHTML = '';
        const empresas = new Set();

        // Cria um Set com os IDs dos sorteados
        const idsSorteados = new Set(dados.sorteados.map(s => s.participante_id));

        // Renderiza participantes com animação sequencial
        dados.participantes.forEach((p, index) => {
            empresas.add(p.empresa);

            const div = document.createElement('div');
            div.classList.add('item-participante');
            div.setAttribute('data-nome', p.nome.toLowerCase());
            div.setAttribute('data-empresa', p.empresa.toLowerCase());

            const infoDiv = document.createElement('div');
            infoDiv.innerHTML = `
                <div class="nome">${p.nome}</div>
                <div class="empresa">${p.empresa}</div>
            `;

            const statusDiv = document.createElement('div');
            statusDiv.classList.add('status');

            // Verifica corretamente se o participante foi sorteado
            const foiSorteado = idsSorteados.has(p.id);

            if (foiSorteado) {
                statusDiv.textContent = 'Sorteado';
                statusDiv.classList.add('sorteado');
            } else {
                statusDiv.textContent = 'Não sorteado';
            }

            div.appendChild(infoDiv);
            div.appendChild(statusDiv);
            lista.appendChild(div);

            // Animação de fade in para cada item
            gsap.fromTo(div,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.3, delay: index * 0.02 }
            );
        });

        totalParticipantes.textContent = dados.participantes.length;
        totalEmpresas.textContent = empresas.size;

        // Inicializa a busca após carregar os participantes
        inicializarBuscaParticipantes();

        // Remove o loading
        gsap.to(loadingElement, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => loadingElement.remove()
        });

        const listaSorteados = document.getElementById('lista-sorteados');
        const totalSorteados = document.getElementById('total-sorteados');
        listaSorteados.innerHTML = '';
        totalSorteados.textContent = dados.sorteados.length;

        dados.sorteados.forEach((s) => {
            const div = document.createElement('div');
            div.classList.add('item-sorteado');
            div.innerHTML = `
                <div class="ordem">${s.ordem}</div>
                <div class="nome">${s.nome}</div>
                <div class="empresa">${s.empresa}</div>
                <div class="horario">${s.horario}</div>
            `;
            listaSorteados.appendChild(div);
        });

        // 🟨 Adicione aqui:
        if (dados.sorteados.length > 0) {
            const ultimo = dados.sorteados[dados.sorteados.length - 1];
            document.getElementById('numero-sorteio').textContent = ultimo.ordem;
            document.getElementById('nome-sorteado').textContent = ultimo.nome;
            document.getElementById('empresa-sorteada').textContent = ultimo.empresa;
            document.getElementById('horario-sorteio').textContent = ultimo.horario;
            document.getElementById('resultado-sorteio').classList.remove('escondido');
        } else {
            document.getElementById('resultado-sorteio').classList.add('escondido');
        }

    } catch (erro) {
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar palestra ativa: ' + erro.message,
            icon: 'error',
            confirmButtonText: 'Fechar',
            confirmButtonColor: '#d33'
        });
    }

    document.getElementById('btn-exportar-participantes')?.addEventListener('click', () => {
        baixarArquivoExcel(`php/exportar_participantes.php?palestra=${id}`, 'participantes.xlsx');
    });

    document.getElementById('btn-exportar-sorteados')?.addEventListener('click', () => {
        baixarArquivoExcel(`php/exportar_sorteados.php?palestra=${id}`, 'sorteados.xlsx');
    });

    const btnSortear = document.getElementById('btn-sortear');
    if (btnSortear) {
        btnSortear.onclick = () => {
            sessionStorage.setItem('palestraAtivaId', id);
            window.open(`tela.html?palestra=${id}`, '_blank');
        };
    }

    document.getElementById('btn-resetar-palestra')?.addEventListener('click', async () => {
        // Substituir confirm com SweetAlert2
        const result = await Swal.fire({
            title: 'Confirmação',
            text: 'Tem certeza que deseja resetar os sorteios desta palestra?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, resetar!',
            cancelButtonText: 'Cancelar',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });

        if (!result.isConfirmed) return;

        try {
            // Mostrar loading durante a operação
            Swal.fire({
                title: 'Processando...',
                text: 'Aguarde enquanto os sorteios são resetados.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            const resposta = await fetch('php/resetar_palestra.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ palestra_id: id })
            });

            const resultado = await resposta.json();
            if (resultado.sucesso) {
                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Sorteios resetados com sucesso.',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                });
                carregarPalestraAtiva(id);
            } else {
                Swal.fire({
                    title: 'Erro!',
                    text: 'Erro: ' + resultado.erro,
                    icon: 'error',
                    confirmButtonText: 'Fechar'
                });
            }
        } catch (erro) {
            Swal.fire({
                title: 'Erro!',
                text: 'Erro ao resetar: ' + erro.message,
                icon: 'error',
                confirmButtonText: 'Fechar'
            });
        }
    });

}



function mostrarSecao(secao) {
    const secaoPalestras = document.getElementById('secao-palestras');
    const secaoNovaPalestra = document.getElementById('secao-nova-palestra');
    const secaoPalestraAtiva = document.getElementById('secao-palestra-ativa');
    const secaoGerenciamentoLogos = document.getElementById('secao-gerenciamento-logos');
    const secaoAdministradores = document.getElementById('secao-administradores');
    const secaoNovoAdministrador = document.getElementById('secao-novo-administrador');

    [secaoPalestras, secaoNovaPalestra, secaoPalestraAtiva, secaoGerenciamentoLogos, secaoAdministradores, secaoNovoAdministrador].forEach(s => {
        if (s) s.classList.add('escondido');
    });

    secao.classList.remove('escondido');
}


async function carregarPalestras() {
    const lista = document.getElementById('lista-palestras');
    const mensagemVazia = document.getElementById('mensagem-sem-palestras');
    const palestras = await listarPalestras();

    lista.innerHTML = '';
    if (palestras.length === 0) {
        mensagemVazia.style.display = 'block';
        return;
    }

    mensagemVazia.style.display = 'none';

    palestras.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.titulo}</td>
            <td>${p.data}</td>
            <td>${p.total_participantes}</td>
            <td>${p.total_empresas}</td>
            <td>${p.total_sorteados}</td>
            <td>
                <button class="botao-secundario btn-ver" data-id="${p.id}">Ver</button>
                <a href="php/exportar_palestra.php?id=${p.id}" class="botao-secundario">Exportar</a>
                <button class="botao-perigo btn-excluir" data-id="${p.id}">Excluir</button>
            </td>
        `;
        lista.appendChild(tr);
    });

    document.querySelectorAll('.btn-ver').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            sessionStorage.setItem('palestraAtivaId', id);
            mostrarSecao(document.getElementById('secao-palestra-ativa'));
            carregarPalestraAtiva(id);
        });
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;

            const result = await Swal.fire({
                title: 'Confirmação',
                text: 'Tem certeza que deseja excluir esta palestra?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                }
            });

            if (result.isConfirmed) {
                // Mostrar loading durante a exclusão
                Swal.fire({
                    title: 'Excluindo...',
                    text: 'Aguarde enquanto a palestra é excluída.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                try {
                    const response = await fetch(`php/excluir_palestra.php?id=${id}`, { method: 'DELETE' });
                    const result = await response.json();

                    if (result && result.sucesso) {
                        Swal.fire({
                            title: 'Excluído!',
                            text: 'A palestra foi excluída com sucesso.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                    } else {
                        throw new Error(result.erro || 'Erro ao excluir palestra');
                    }

                    carregarPalestras();
                } catch (error) {
                    Swal.fire({
                        title: 'Erro!',
                        text: 'Erro ao excluir a palestra: ' + error.message,
                        icon: 'error',
                        confirmButtonText: 'Fechar'
                    });
                }
            }
        });
    });
}

// Adiciona uma pequena animação de preloader
function adicionarPreloader() {
    const preloader = document.createElement('div');
    preloader.id = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-conteudo">
            <div class="spinner"></div>
            <p>Carregando...</p>
        </div>
    `;
    document.body.appendChild(preloader);

    // Animação com GSAP
    gsap.to('#preloader', {
        opacity: 0,
        duration: 0.7,
        delay: 0.5,
        onComplete: () => {
            preloader.remove();
        }
    });
}

// Implementa busca nos participantes
function inicializarBuscaParticipantes() {
    const campoPesquisa = document.getElementById('pesquisa-participante');
    if (campoPesquisa) {
        campoPesquisa.addEventListener('input', () => {
            const termo = campoPesquisa.value.toLowerCase();
            const participantes = document.querySelectorAll('.item-participante');

            participantes.forEach(p => {
                const nome = p.querySelector('.nome').textContent.toLowerCase();
                const empresa = p.querySelector('.empresa').textContent.toLowerCase();
                const status = p.querySelector('.status').textContent.toLowerCase();

                // Busca por nome, empresa ou status (sorteado/não sorteado)
                if (nome.includes(termo) || empresa.includes(termo) || status.includes(termo)) {
                    p.style.display = '';
                    // Destaca com animação
                    gsap.fromTo(p,
                        { backgroundColor: 'rgba(144, 202, 249, 0.2)' },
                        { backgroundColor: 'transparent', duration: 1.5 }
                    );
                } else {
                    p.style.display = 'none';
                }
            });
        });
    }
}

// Funções para administradores
async function carregarAdministradores() {
    try {
        // Adiciona efeito de loading com GSAP
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-overlay';
        loadingElement.innerHTML = '<div class="spinner-circle"></div>';
        const container = document.getElementById('secao-administradores');
        container.appendChild(loadingElement);

        gsap.fromTo(loadingElement,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
        );

        // Busca os administradores cadastrados
        const administradores = await listarAdministradores();

        const lista = document.getElementById('lista-administradores');
        const mensagemVazia = document.getElementById('mensagem-sem-administradores');
        lista.innerHTML = '';

        if (administradores.length === 0) {
            mensagemVazia.style.display = 'block';
        } else {
            mensagemVazia.style.display = 'none';

            administradores.forEach((admin, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${admin.usuario}</td>
                    <td>${admin.senha}</td>
                    <td>${admin.data_criacao}</td>
                    <td>
                        <button class="botao-perigo btn-excluir-admin" data-id="${admin.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </td>
                `;

                // Animar entrada das linhas
                tr.style.opacity = '0';
                tr.style.transform = 'translateY(10px)';
                lista.appendChild(tr);

                setTimeout(() => {
                    gsap.to(tr, {
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        delay: index * 0.05
                    });
                }, 100);
            });

            // Adicionar eventos aos botões de excluir
            document.querySelectorAll('.btn-excluir-admin').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;

                    Swal.fire({
                        title: 'Tem certeza?',
                        text: 'Você deseja excluir este administrador?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sim, excluir!',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                // 🔁 Envia a exclusão para o backend
                                const resposta = await fetch('php/excluir_administrador.php', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    body: `id=${encodeURIComponent(id)}`
                                });

                                const dados = await resposta.json();

                                if (dados.sucesso) {
                                    Swal.fire({
                                        title: 'Excluído!',
                                        text: dados.mensagem,
                                        icon: 'success',
                                        confirmButtonText: 'OK'
                                    });

                                    // 🔄 Recarrega a lista após exclusão
                                    carregarAdministradores();

                                } else {
                                    throw new Error(dados.erro || 'Erro ao excluir administrador.');
                                }

                            } catch (erro) {
                                Swal.fire({
                                    title: 'Erro!',
                                    text: erro.message,
                                    icon: 'error',
                                    confirmButtonText: 'Fechar'
                                });
                            }
                        }
                    });
                });
            });

        }

        // Remove o loading
        gsap.to(loadingElement, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => loadingElement.remove()
        });

    } catch (erro) {
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar administradores: ' + erro.message,
            icon: 'error',
            confirmButtonText: 'Fechar',
            confirmButtonColor: '#d33'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    adicionarPreloader();
    carregarGaleriaLogos();
    const form = document.getElementById('form-nova-palestra');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                // Mostrar loading durante o cadastro
                Swal.fire({
                    title: 'Processando...',
                    text: 'Cadastrando a palestra, aguarde...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                await cadastrarPalestra(form);

                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Palestra cadastrada com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'Ok',
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    }
                });
                mostrarSecao(document.getElementById('secao-palestras'));
                carregarPalestras();
            } catch (erro) {
                Swal.fire({
                    title: 'Erro!',
                    text: 'Erro ao cadastrar palestra: ' + erro.message,
                    icon: 'error',
                    confirmButtonText: 'Fechar'
                });
            }
        });
    }

    carregarPalestras();

    const secaoPalestras = document.getElementById('secao-palestras');
    const secaoNovaPalestra = document.getElementById('secao-nova-palestra');
    const secaoPalestraAtiva = document.getElementById('secao-palestra-ativa');
    const secaoAdministradores = document.getElementById('secao-administradores');
    const secaoNovoAdministrador = document.getElementById('secao-novo-administrador');


    const linkPalestras = document.getElementById('link-palestras');
    const linkPainelAtivo = document.getElementById('link-painel-ativo');
    const linkAdministradores = document.getElementById('link-administradores');

    const btnNovaPalestra = document.getElementById('btn-nova-palestra');
    const btnNovaPalestraVazio = document.getElementById('btn-nova-palestra-vazio');
    const btnVoltarPalestras = document.getElementById('btn-voltar-palestras');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnVoltarLista = document.getElementById('btn-voltar-lista');

    if (btnNovaPalestra) btnNovaPalestra.addEventListener('click', () => mostrarSecao(secaoNovaPalestra));
    if (btnNovaPalestraVazio) btnNovaPalestraVazio.addEventListener('click', () => mostrarSecao(secaoNovaPalestra));
    if (btnVoltarPalestras) btnVoltarPalestras.addEventListener('click', () => mostrarSecao(secaoPalestras));
    if (btnCancelar) btnCancelar.addEventListener('click', () => mostrarSecao(secaoPalestras));
    if (btnVoltarLista) btnVoltarLista.addEventListener('click', () => mostrarSecao(secaoPalestras));
    if (linkPalestras) linkPalestras.addEventListener('click', () => mostrarSecao(secaoPalestras));
    if (linkPainelAtivo) linkPainelAtivo.addEventListener('click', () => mostrarSecao(secaoPalestraAtiva));

    // Eventos para seção de administradores
    if (linkAdministradores) linkAdministradores.addEventListener('click', () => {
        // Remove classe "ativo" de todos os links
        document.querySelectorAll('.menu a').forEach(link => link.classList.remove('ativo'));
        // Adiciona classe "ativo" ao link clicado
        linkAdministradores.classList.add('ativo');
        // Mostra a seção e carrega os dados
        mostrarSecao(secaoAdministradores);
        carregarAdministradores();
    });

    // Botões de navegação para administradores
    const btnNovoAdministrador = document.getElementById('btn-novo-administrador');
    const btnNovoAdministradorVazio = document.getElementById('btn-novo-administrador-vazio');
    const btnVoltarAdministradores = document.getElementById('btn-voltar-administradores');
    const btnCancelarAdministrador = document.getElementById('btn-cancelar-administrador');

    if (btnNovoAdministrador) btnNovoAdministrador.addEventListener('click', () => mostrarSecao(secaoNovoAdministrador));
    if (btnNovoAdministradorVazio) btnNovoAdministradorVazio.addEventListener('click', () => mostrarSecao(secaoNovoAdministrador));
    if (btnVoltarAdministradores) btnVoltarAdministradores.addEventListener('click', () => mostrarSecao(secaoAdministradores));
    if (btnCancelarAdministrador) btnCancelarAdministrador.addEventListener('click', () => mostrarSecao(secaoAdministradores));

    // Form para cadastro de novo administrador
    const formNovoAdministrador = document.getElementById('form-novo-administrador');
    if (formNovoAdministrador) {
        formNovoAdministrador.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const resultado = await cadastrarAdministrador(formNovoAdministrador);

                if (resultado.sucesso) {
                    Swal.fire({
                        title: 'Sucesso!',
                        text: resultado.mensagem,
                        icon: 'success',
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#3085d6'
                    });

                    // Limpa o formulário
                    formNovoAdministrador.reset();

                    // Volta para a lista de administradores e atualiza
                    mostrarSecao(secaoAdministradores);
                    carregarAdministradores();
                } else {
                    throw new Error(resultado.erro);
                }
            } catch (erro) {
                Swal.fire({
                    title: 'Erro!',
                    text: 'Erro ao cadastrar administrador: ' + erro.message,
                    icon: 'error',
                    confirmButtonText: 'Fechar',
                    confirmButtonColor: '#d33'
                });
            }
        });
    }

    // Botão para novo administrador
    const btnNovoAdmin = document.getElementById('btn-novo-administrador');
    const btnNovoAdminVazio = document.getElementById('btn-novo-administrador-vazio');
    const btnVoltarAdmins = document.getElementById('btn-voltar-administradores');
    const btnCancelarAdmin = document.getElementById('btn-cancelar-administrador');

    if (btnNovoAdmin) btnNovoAdmin.addEventListener('click', () => mostrarSecao(secaoNovoAdministrador));
    if (btnNovoAdminVazio) btnNovoAdminVazio.addEventListener('click', () => mostrarSecao(secaoNovoAdministrador));
    if (btnVoltarAdmins) btnVoltarAdmins.addEventListener('click', () => mostrarSecao(secaoAdministradores));
    if (btnCancelarAdmin) btnCancelarAdmin.addEventListener('click', () => mostrarSecao(secaoAdministradores));

    // ✅ Detecta sorteio feito em outra aba (tela.html) e recarrega painel automaticamente
    window.addEventListener('storage', (e) => {
        if (e.key === 'sorteioAtualizado') {
            const idAtual = sessionStorage.getItem('palestraAtivaId');
            if (idAtual) {
                carregarPalestraAtiva(idAtual);
            }
        }
    });

    mostrarSecao(secaoPalestras);
});

// Atualiza nome do arquivo Excel
const inputArquivo = document.getElementById('arquivo-excel');
const nomeArquivoSpan = document.getElementById('nome-arquivo');

if (inputArquivo && nomeArquivoSpan) {
    inputArquivo.addEventListener('change', () => {
        nomeArquivoSpan.textContent = inputArquivo.files.length > 0
            ? inputArquivo.files[0].name
            : "Arraste ou clique para escolher o arquivo";
    });
}

async function baixarArquivoExcel(url, nomeArquivo) {
    try {
        // Mostrar loading durante o download
        Swal.fire({
            title: 'Exportando...',
            text: 'Gerando arquivo para download, aguarde...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao gerar o arquivo.');

        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomeArquivo;
        document.body.appendChild(link);

        // Fechar o loading
        Swal.close();

        // Pequena animação indicando sucesso
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        Toast.fire({
            icon: 'success',
            title: `Arquivo ${nomeArquivo} gerado com sucesso!`
        });

        // Iniciar o download
        link.click();
        link.remove();
    } catch (erro) {
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao exportar: ' + erro.message,
            icon: 'error',
            confirmButtonText: 'Fechar'
        });
    }
}

async function carregarLogosParaPalestra(palestraId) {
    try {
        // Mostrar loading durante o carregamento
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-mini';
        loadingElement.innerHTML = '<div class="spinner-mini"></div>';

        const logosList = document.getElementById('lista-selecao-logos');
        if (logosList) {
            logosList.innerHTML = '';
            logosList.appendChild(loadingElement);

            gsap.fromTo(loadingElement,
                { opacity: 0 },
                { opacity: 1, duration: 0.2 }
            );
        }

        const resposta = await fetch(`php/listar_logos.php?palestra=${palestraId}`);
        const dados = await resposta.json();

        const lista = document.getElementById('lista-selecao-logos');
        lista.innerHTML = '';

        const selecionadas = new Set(dados.selecionadas || []); // <- importante!

        // Animação para mostrar logos com efeito staggered
        dados.logos.forEach((logo, index) => {
            const div = document.createElement('div');
            div.classList.add('item-selecao-logo');
            div.style.opacity = '0';
            div.style.transform = 'translateY(10px)';

            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.classList.add('logo-checkbox');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = logo.id;
            input.checked = selecionadas.has(logo.id); // <- corretamente marcado

            // Animar checkbox quando marcado/desmarcado
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    gsap.fromTo(checkboxWrapper,
                        { scale: 1 },
                        { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 }
                    );
                }
            });

            checkboxWrapper.appendChild(input);

            const label = document.createElement('label');
            label.classList.add('logo-label');

            const miniatura = document.createElement('div');
            miniatura.classList.add('logo-mini');
            const img = document.createElement('img');
            img.src = `upload/${logo.imagem}`;
            img.alt = logo.nome;
            miniatura.appendChild(img);

            const span = document.createElement('span');
            span.textContent = logo.nome;

            label.appendChild(miniatura);
            label.appendChild(span);

            div.appendChild(checkboxWrapper);
            div.appendChild(label);
            lista.appendChild(div);

            // Animação para entrada
            setTimeout(() => {
                gsap.to(div, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'power1.out'
                });
            }, index * 50);
        });
    } catch (erro) {
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar logos: ' + erro.message,
            icon: 'error',
            confirmButtonText: 'Fechar'
        });
    }
}


document.getElementById('btn-aplicar-logos')?.addEventListener('click', async () => {
    const palestraId = sessionStorage.getItem('palestraAtivaId');
    if (!palestraId) {
        Swal.fire({
            title: 'Erro',
            text: 'Palestra ativa não encontrada',
            icon: 'error',
            confirmButtonText: 'Fechar'
        });
        return;
    }

    const selecionados = Array.from(document.querySelectorAll('.logo-checkbox input[type="checkbox"]:checked'))
        .map(el => parseInt(el.value));

    try {
        // Mostrar loading durante o processo
        Swal.fire({
            title: 'Aplicando logos...',
            text: 'Aguarde enquanto as logos são aplicadas à palestra.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const resposta = await fetch('php/aplicar_logos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                palestra_id: parseInt(palestraId),
                logos: selecionados
            })
        });

        const resultado = await resposta.json();

        if (resultado.sucesso) {
            // Animação de sucesso
            Swal.fire({
                title: 'Sucesso!',
                text: 'Logos aplicadas com sucesso!',
                icon: 'success',
                confirmButtonText: 'Ok',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });

            // Adiciona efeito de transição ao atualizar
            const lista = document.getElementById('lista-selecao-logos');
            if (lista) {
                gsap.to(lista, {
                    opacity: 0.5,
                    scale: 0.98,
                    duration: 0.2,
                    onComplete: async () => {
                        await carregarLogosParaPalestra(palestraId);
                        gsap.to(lista, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.3
                        });
                    }
                });
            } else {
                await carregarLogosParaPalestra(palestraId);
            }
        } else {
            throw new Error(resultado.erro || 'Erro desconhecido');
        }
    } catch (erro) {
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao aplicar logos: ' + erro.message,
            icon: 'error',
            confirmButtonText: 'Fechar'
        });
    }
});


document.getElementById('btn-gerenciar-logos')?.addEventListener('click', () => {
    const secaoLogos = document.getElementById('secao-gerenciamento-logos');
    const id = sessionStorage.getItem('palestraAtivaId');
    if (id) {
        mostrarSecao(secaoLogos);
        carregarLogosParaPalestra(id);
    } else {
        Swal.fire({
            title: 'Aviso',
            text: 'Palestra não identificada.',
            icon: 'warning',
            confirmButtonText: 'Fechar',
            confirmButtonColor: '#3085d6'
        });
    }
});

document.getElementById('btn-voltar-palestra-logos')?.addEventListener('click', () => {
    mostrarSecao(document.getElementById('secao-palestra-ativa'));
});

const formLogo = document.getElementById('form-cadastro-logo');

if (formLogo) {
    formLogo.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formLogo);

        try {
            // Mostrar loading durante o upload
            Swal.fire({
                title: 'Enviando logo...',
                text: 'Aguarde enquanto a imagem é processada',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const resposta = await fetch('php/cadastrar_logo.php', {
                method: 'POST',
                body: formData
            });

            const resultado = await resposta.json();
            if (resultado.sucesso) {
                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Logo cadastrada com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'Ok',
                    showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    }
                });
                formLogo.reset();

                // Resetar o texto do campo de arquivo
                const spanNomeLogo = document.getElementById('nome-arquivo-logo');
                if (spanNomeLogo) {
                    spanNomeLogo.textContent = "Arraste ou clique para escolher a imagem";

                    // Pequena animação no campo de upload
                    gsap.fromTo(spanNomeLogo,
                        { backgroundColor: 'rgba(144, 238, 144, 0.3)' },
                        { backgroundColor: 'transparent', duration: 1.5 }
                    );
                }

                const palestraId = sessionStorage.getItem('palestraAtivaId');
                if (palestraId) {
                    carregarLogosParaPalestra(palestraId);

                    // Atualizar galeria de logos com animação
                    setTimeout(() => {
                        carregarGaleriaLogos();
                    }, 500);
                }
            } else {
                Swal.fire({
                    title: 'Erro!',
                    text: 'Erro: ' + resultado.erro,
                    icon: 'error',
                    confirmButtonText: 'Fechar'
                });
            }
        } catch (erro) {
            Swal.fire({
                title: 'Erro!',
                text: 'Erro ao cadastrar logo: ' + erro.message,
                icon: 'error',
                confirmButtonText: 'Fechar'
            });
        }
    });

    const inputLogo = document.getElementById('imagem-logo');
    const spanNomeLogo = document.getElementById('nome-arquivo-logo');
    if (inputLogo && spanNomeLogo) {
        inputLogo.addEventListener('change', () => {
            spanNomeLogo.textContent = inputLogo.files.length > 0
                ? inputLogo.files[0].name
                : "Arraste ou clique para escolher a imagem";
        });
    }
}

const btnAplicarLogos = document.getElementById('btn-aplicar-logos');
if (btnAplicarLogos) {
    btnAplicarLogos.addEventListener('click', async () => {
        const palestraId = sessionStorage.getItem('palestraAtivaId');
        if (!palestraId) return;

        const checkboxes = document.querySelectorAll('.logo-checkbox input[type="checkbox"]');
        const selecionadas = Array.from(checkboxes)
            .filter(chk => chk.checked)
            .map(chk => parseInt(chk.value));

        try {
            const resposta = await fetch('php/aplicar_logos.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    palestra_id: palestraId,
                    logo_ids: selecionadas
                })
            });

            const resultado = await resposta.json();
            if (resultado.sucesso) {
                alert('Logos aplicadas com sucesso!');
            } else {
                alert('Erro ao aplicar logos: ' + resultado.erro);
            }
        } catch (erro) {
            alert('Erro ao aplicar logos: ' + erro.message);
        }
    });
}

function renderizarLogosParaSelecao(logos, logosAtuais = []) {
    const container = document.getElementById('lista-selecao-logos');
    container.innerHTML = '';
    logos.forEach(logo => {
        const item = document.createElement('div');
        item.className = 'item-selecao-logo';
        item.innerHTML = `
            <div class="logo-checkbox">
                <input type="checkbox" value="${logo.id}" ${logosAtuais.includes(logo.id) ? 'checked' : ''}>
            </div>
            <label class="logo-label">
                <div class="logo-mini"><img src="upload/${logo.imagem}" alt="${logo.nome}"></div>
                ${logo.nome}
            </label>
        `;
        container.appendChild(item);
    });

}

async function carregarGaleriaLogos() {
    try {
        const resposta = await fetch('php/listar_logos.php');
        const dados = await resposta.json();

        const container = document.getElementById('galeria-logos');
        const contador = document.getElementById('total-logos');
        if (!container || !contador) return;

        container.innerHTML = '';
        dados.logos.forEach(logo => {
            const div = document.createElement('div');
            div.className = 'item-logo-galeria';

            const img = document.createElement('img');
            img.src = `upload/${logo.imagem}`;
            img.alt = logo.nome;

            const nome = document.createElement('span');
            nome.textContent = logo.nome;

            // Adicionar botão de exclusão
            const btnExcluir = document.createElement('button');
            btnExcluir.className = 'btn-excluir-logo';
            btnExcluir.innerHTML = '<i class="fas fa-trash"></i>';
            btnExcluir.title = 'Excluir logo';
            btnExcluir.dataset.id = logo.id;
            btnExcluir.dataset.nome = logo.nome;

            // Adicionar evento de clique para excluir com animações
            btnExcluir.addEventListener('click', async (e) => {
                const logoId = e.currentTarget.dataset.id;
                const logoNome = e.currentTarget.dataset.nome;

                // Usar SweetAlert2 para confirmação de exclusão
                const result = await Swal.fire({
                    title: 'Confirmar exclusão',
                    text: `Tem certeza que deseja excluir a logo ${logoNome}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sim, excluir!',
                    cancelButtonText: 'Cancelar',
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    }
                });

                if (result.isConfirmed) {
                    try {
                        // Mostrar loading durante a exclusão
                        Swal.fire({
                            title: 'Excluindo...',
                            text: 'Processando sua solicitação',
                            allowOutsideClick: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        // Animar o elemento que será removido
                        const itemParent = e.currentTarget.parentElement;
                        if (itemParent) {
                            gsap.to(itemParent, {
                                opacity: 0.5,
                                scale: 0.95,
                                duration: 0.3
                            });
                        }

                        const resposta = await fetch('php/excluir_logo.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ logo_id: logoId })
                        });

                        const resultado = await resposta.json();
                        if (resultado.sucesso) {
                            Swal.fire({
                                title: 'Excluída!',
                                text: 'Logo excluída com sucesso!',
                                icon: 'success',
                                confirmButtonText: 'Ok'
                            });

                            // Recarregar a lista de logos com animação
                            const galeria = document.getElementById('galeria-logos');
                            if (galeria) {
                                gsap.to(galeria, {
                                    opacity: 0.5,
                                    scale: 0.98,
                                    duration: 0.3,
                                    onComplete: () => {
                                        carregarGaleriaLogos();
                                        gsap.to(galeria, {
                                            opacity: 1,
                                            scale: 1,
                                            duration: 0.4,
                                            delay: 0.1
                                        });
                                    }
                                });
                            } else {
                                carregarGaleriaLogos();
                            }

                            // Recarregar a seleção de logos se estiver em uma palestra ativa
                            const palestraId = sessionStorage.getItem('palestraAtivaId');
                            if (palestraId) {
                                carregarLogosParaPalestra(palestraId);
                            }
                        } else {
                            Swal.fire({
                                title: 'Erro!',
                                text: 'Erro ao excluir logo: ' + resultado.mensagem,
                                icon: 'error',
                                confirmButtonText: 'Fechar'
                            });
                        }
                    } catch (erro) {
                        Swal.fire({
                            title: 'Erro!',
                            text: 'Erro ao excluir logo: ' + erro.message,
                            icon: 'error',
                            confirmButtonText: 'Fechar'
                        });
                    }
                }
            });

            div.appendChild(img);
            div.appendChild(nome);
            div.appendChild(btnExcluir);
            container.appendChild(div);
        });

        contador.textContent = dados.logos.length;
    } catch (erro) {
        console.error('Erro ao carregar galeria:', erro);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('galeria-logos')) {
        carregarGaleriaLogos();
    }
});


