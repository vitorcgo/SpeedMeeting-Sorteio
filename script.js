// Arquivo principal de JavaScript para o painel administrativo Speed Meeting - Rodada de Negócios
document.addEventListener('DOMContentLoaded', function() {
    console.log('Painel Administrativo Speed Meeting - Inicializado com sucesso');


    // Referências dos elementos DOM
    const secaoPalestras = document.getElementById('secao-palestras');
    const secaoNovaPalestra = document.getElementById('secao-nova-palestra');
    const secaoPalestraAtiva = document.getElementById('secao-palestra-ativa');
    const mensagemSemPalestras = document.getElementById('mensagem-sem-palestras');
    
    // Elementos de menu
    const linkPalestras = document.getElementById('link-palestras');
    const linkPainelAtivo = document.getElementById('link-painel-ativo');
    
    // Botões e formulários
    const btnNovaPalestra = document.getElementById('btn-nova-palestra');
    const btnNovaPalestraVazio = document.getElementById('btn-nova-palestra-vazio');
    const btnVoltarPalestras = document.getElementById('btn-voltar-palestras');
    const formNovaPalestra = document.getElementById('form-nova-palestra');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnVoltarLista = document.getElementById('btn-voltar-lista');
    const btnSortear = document.getElementById('btn-sortear');
    const btnResetarPalestra = document.getElementById('btn-resetar-palestra');
    const btnExportarParticipantes = document.getElementById('btn-exportar-participantes');
    const btnExportarSorteados = document.getElementById('btn-exportar-sorteados');
    
    // Campos de formulário
    const inputTituloPalestra = document.getElementById('titulo-palestra');
    const inputDataPalestra = document.getElementById('data-palestra');
    const inputArquivoExcel = document.getElementById('arquivo-excel');
    const inputNomeArquivo = document.getElementById('nome-arquivo');
    const inputPesquisaParticipante = document.getElementById('pesquisa-participante');
    
    // Elementos para exibição de dados
    const listaPalestras = document.getElementById('lista-palestras');
    const tituloPalestraAtiva = document.getElementById('titulo-palestra-ativa');
    const dataPalestraAtiva = document.getElementById('data-palestra-ativa');
    const listaParticipantes = document.getElementById('lista-participantes');
    const listaSorteados = document.getElementById('lista-sorteados');
    const totalParticipantes = document.getElementById('total-participantes');
    const totalEmpresas = document.getElementById('total-empresas');
    const totalSorteados = document.getElementById('total-sorteados');
    const resultadoSorteio = document.getElementById('resultado-sorteio');
    const numeroSorteio = document.getElementById('numero-sorteio');
    const nomeSorteado = document.getElementById('nome-sorteado');
    const empresaSorteada = document.getElementById('empresa-sorteada');
    const horarioSorteio = document.getElementById('horario-sorteio');
    
    // Modal de confirmação
    const modal = document.getElementById('modal-confirmacao');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalMensagem = document.getElementById('modal-mensagem');
    const btnModalCancelar = document.getElementById('modal-cancelar');
    const btnModalConfirmar = document.getElementById('modal-confirmar');
    const botoesFechaModal = document.querySelectorAll('.fechar-modal');
    
    // Estado da aplicação
    let palestrasState = {
        palestras: dadosPalestras,
        palestraAtiva: null,
        acaoConfirmacao: null
    };

    // *** FUNÇÕES DE RENDERIZAÇÃO ***

    // Exibir lista de palestras
    function renderizarListaPalestras() {
        if (palestrasState.palestras.length === 0) {
            secaoPalestras.classList.remove('escondido');
            listaPalestras.innerHTML = '';
            mensagemSemPalestras.classList.remove('escondido');
            return;
        }

        mensagemSemPalestras.classList.add('escondido');
        listaPalestras.innerHTML = '';

        palestrasState.palestras.forEach(palestra => {
            // Contar empresas únicas
            const empresasUnicas = new Set();
            palestra.participantes.forEach(p => empresasUnicas.add(p.empresa));

            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${palestra.titulo}</td>
                <td>${formatarData(palestra.data)}</td>
                <td>${palestra.participantes.length}</td>
                <td>${empresasUnicas.size}</td>
                <td>${palestra.sorteados.length}</td>
                <td>
                    <div class="acoes-tabela">
                        <button class="btn-ver" data-id="${palestra.id}" title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-exportar" data-id="${palestra.id}" title="Exportar dados">
                            <i class="fas fa-file-export"></i>
                        </button>
                        <button class="btn-excluir" data-id="${palestra.id}" title="Excluir palestra">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;

            // Adicionar eventos aos botões
            listaPalestras.appendChild(linha);

            // Botão Ver Detalhes
            linha.querySelector('.btn-ver').addEventListener('click', () => {
                abrirPalestraAtiva(palestra.id);
            });

            // Botão Exportar
            linha.querySelector('.btn-exportar').addEventListener('click', () => {
                exportarDadosPalestra(palestra.id);
            });

            // Botão Excluir
            linha.querySelector('.btn-excluir').addEventListener('click', () => {
                confirmarExclusaoPalestra(palestra.id);
            });
        });
    }

    // Renderizar painel da palestra ativa
    function renderizarPalestraAtiva() {
        const palestra = palestrasState.palestraAtiva;
        
        if (!palestra) {
            secaoPalestraAtiva.classList.add('escondido');
            return;
        }

        // Título e data
        tituloPalestraAtiva.textContent = palestra.titulo;
        dataPalestraAtiva.textContent = formatarData(palestra.data);
        
        // Contadores
        const empresasUnicas = new Set();
        palestra.participantes.forEach(p => empresasUnicas.add(p.empresa));
        
        totalParticipantes.textContent = palestra.participantes.length;
        totalEmpresas.textContent = empresasUnicas.size;
        totalSorteados.textContent = palestra.sorteados.length;
        
        // Lista de participantes
        renderizarListaParticipantes(palestra.participantes);
        
        // Lista de sorteados
        renderizarListaSorteados(palestra.sorteados);
        
        // Mostrar número do próximo sorteio
        numeroSorteio.textContent = palestra.sorteados.length + 1;
        
        // Se não há mais participantes para sortear, desabilitar botão de sorteio
        const participantesDisponiveis = palestra.participantes.filter(p => 
            !palestra.sorteados.some(s => s.nome === p.nome)
        );
        
        btnSortear.disabled = participantesDisponiveis.length === 0;
        
        if (participantesDisponiveis.length === 0) {
            btnSortear.innerHTML = '<i class="fas fa-check-circle"></i><span>Todos sorteados</span>';
            btnSortear.classList.add('desabilitado');
        } else {
            btnSortear.innerHTML = '<i class="fas fa-random"></i><span>Sortear Participante</span>';
            btnSortear.classList.remove('desabilitado');
        }
    }

    // Renderizar lista de participantes
    function renderizarListaParticipantes(participantes, filtro = '') {
        listaParticipantes.innerHTML = '';
        
        const palestraAtual = palestrasState.palestraAtiva;
        
        // Filtrar participantes se necessário
        const participantesFiltrados = filtro 
            ? participantes.filter(p => 
                p.nome.toLowerCase().includes(filtro.toLowerCase()) || 
                p.empresa.toLowerCase().includes(filtro.toLowerCase()))
            : participantes;
        
        if (participantesFiltrados.length === 0) {
            listaParticipantes.innerHTML = `
                <div class="mensagem-vazio" style="padding: 20px;">
                    <p>Nenhum participante encontrado</p>
                </div>
            `;
            return;
        }
        
        participantesFiltrados.forEach(participante => {
            const sorteado = palestraAtual.sorteados.some(s => s.nome === participante.nome);
            
            const itemParticipante = document.createElement('div');
            itemParticipante.classList.add('item-participante');
            
            itemParticipante.innerHTML = `
                <div class="info">
                    <div class="nome">${participante.nome}</div>
                    <div class="empresa">${participante.empresa}</div>
                </div>
                <span class="status ${sorteado ? 'sorteado' : ''}">
                    ${sorteado ? 'Sorteado' : 'Não sorteado'}
                </span>
            `;
            
            listaParticipantes.appendChild(itemParticipante);
        });
    }

    // Renderizar lista de sorteados
    function renderizarListaSorteados(sorteados) {
        listaSorteados.innerHTML = '';
        
        if (sorteados.length === 0) {
            listaSorteados.innerHTML = `
                <div class="mensagem-vazio" style="padding: 20px;">
                    <p>Nenhum participante sorteado ainda</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por ordem de sorteio
        const sorteadosOrdenados = [...sorteados].sort((a, b) => a.ordem - b.ordem);
        
        sorteadosOrdenados.forEach(sorteado => {
            const itemSorteado = document.createElement('div');
            itemSorteado.classList.add('item-sorteado');
            
            itemSorteado.innerHTML = `
                <div class="ordem">${sorteado.ordem}</div>
                <div class="nome">${sorteado.nome}</div>
                <div class="empresa">${sorteado.empresa}</div>
                <div class="horario">${sorteado.horario}</div>
            `;
            
            listaSorteados.appendChild(itemSorteado);
        });
    }

    // *** FUNÇÕES DE NAVEGAÇÃO ***

    // Navegar para a lista de palestras
    function navegarParaListaPalestras() {
        secaoPalestras.classList.remove('escondido');
        secaoNovaPalestra.classList.add('escondido');
        secaoPalestraAtiva.classList.add('escondido');
        
        linkPalestras.classList.add('ativo');
        linkPainelAtivo.classList.remove('ativo');
        
        renderizarListaPalestras();
    }

    // Navegar para o formulário de nova palestra
    function navegarParaNovaPalestra() {
        secaoPalestras.classList.add('escondido');
        secaoNovaPalestra.classList.remove('escondido');
        secaoPalestraAtiva.classList.add('escondido');
        
        // Resetar formulário
        formNovaPalestra.reset();
        inputNomeArquivo.textContent = 'Arraste ou clique para escolher o arquivo';
    }

    // Navegar para o painel da palestra ativa
    function navegarParaPalestraAtiva() {
        if (!palestrasState.palestraAtiva) {
            // Se não tem palestra ativa, voltar para lista
            navegarParaListaPalestras();
            return;
        }
        
        secaoPalestras.classList.add('escondido');
        secaoNovaPalestra.classList.add('escondido');
        secaoPalestraAtiva.classList.remove('escondido');
        
        linkPalestras.classList.remove('ativo');
        linkPainelAtivo.classList.add('ativo');
        
        // Esconder o resultado do sorteio se estiver visível
        resultadoSorteio.classList.add('escondido');
        
        renderizarPalestraAtiva();
    }

    // *** FUNÇÕES DE OPERAÇÕES CRUD ***

    // Abrir palestra ativa
    function abrirPalestraAtiva(id) {
        const palestra = palestrasState.palestras.find(p => p.id === id);
        
        if (palestra) {
            palestrasState.palestraAtiva = palestra;
            navegarParaPalestraAtiva();
        }
    }

    // Criar nova palestra
    function criarNovaPalestra(titulo, data, participantes) {
        // Gerar novo ID (em um sistema real seria gerado pelo backend)
        const maxId = palestrasState.palestras.length > 0 
            ? Math.max(...palestrasState.palestras.map(p => p.id))
            : 0;
            
        const novaPalestra = {
            id: maxId + 1,
            titulo,
            data,
            participantes,
            sorteados: []
        };
        
        // Adicionar ao estado
        palestrasState.palestras.push(novaPalestra);
        
        // Definir como palestra ativa
        palestrasState.palestraAtiva = novaPalestra;
        
        // Navegar para a palestra ativa
        navegarParaPalestraAtiva();
    }

    // Excluir palestra
    function excluirPalestra(id) {
        palestrasState.palestras = palestrasState.palestras.filter(p => p.id !== id);
        
        // Se a palestra ativa foi excluída, resetar
        if (palestrasState.palestraAtiva && palestrasState.palestraAtiva.id === id) {
            palestrasState.palestraAtiva = null;
        }
        
        navegarParaListaPalestras();
    }

    // Resetar palestra (limpar lista de sorteados)
    function resetarPalestra() {
        if (!palestrasState.palestraAtiva) return;
        
        // Encontrar e atualizar a palestra no estado
        const index = palestrasState.palestras.findIndex(p => p.id === palestrasState.palestraAtiva.id);
        
        if (index !== -1) {
            palestrasState.palestras[index].sorteados = [];
            palestrasState.palestraAtiva.sorteados = [];
            
            // Esconder o resultado do sorteio se estiver visível
            resultadoSorteio.classList.add('escondido');
            
            renderizarPalestraAtiva();
        }
    }

    // *** FUNÇÕES DE SORTEIO ***

    // Janela de apresentação
    let janelaApresentacao = null;

    // Abrir a tela de apresentação (sem realizar sorteio)
    function realizarSorteio() {
        const palestra = palestrasState.palestraAtiva;
        if (!palestra) return;
        
        // Encontrar participantes que ainda não foram sorteados
        const participantesDisponiveis = palestra.participantes.filter(p => 
            !palestra.sorteados.some(s => s.nome === p.nome)
        );
        
        if (participantesDisponiveis.length === 0) {
            alert('Todos os participantes já foram sorteados!');
            return;
        }
        
        // Abrir tela de apresentação se ainda não estiver aberta
        if (!janelaApresentacao || janelaApresentacao.closed) {
            janelaApresentacao = window.open('tela.html', 'TelaApresentacao', 'width=1200,height=800');
            // Se a janela não foi aberta (bloqueada por pop-up), alertar usuário
            if (!janelaApresentacao) {
                alert('Por favor, permita pop-ups para abrir a tela de apresentação.');
                return;
            }
            
            // Enviar lista de participantes disponíveis para a tela de apresentação
            setTimeout(() => {
                if (janelaApresentacao && !janelaApresentacao.closed) {
                    janelaApresentacao.postMessage({
                        tipo: 'inicializar',
                        participantesDisponiveis: participantesDisponiveis,
                        palestraId: palestra.id
                    }, '*');
                }
            }, 1000);
        } else {
            // Se a janela já estiver aberta, apenas enviar os participantes disponíveis
            janelaApresentacao.postMessage({
                tipo: 'inicializar',
                participantesDisponiveis: participantesDisponiveis,
                palestraId: palestra.id
            }, '*');
            janelaApresentacao.focus();
        }
    }
    
    // Processar o sorteio depois que a janela foi aberta
    function processarSorteio() {
        const palestra = palestrasState.palestraAtiva;
        if (!palestra) return;
        
        // Encontrar participantes que ainda não foram sorteados
        const participantesDisponiveis = palestra.participantes.filter(p => 
            !palestra.sorteados.some(s => s.nome === p.nome)
        );
        
        // Efeito de "carregando" no botão
        btnSortear.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sorteando...</span>';
        btnSortear.disabled = true;
        
        // Simular processamento para efeito visual
        setTimeout(() => {
            // Sortear aleatoriamente
            const indiceAleatorio = Math.floor(Math.random() * participantesDisponiveis.length);
            const participanteSorteado = participantesDisponiveis[indiceAleatorio];
            
            // Criar registro de sorteio
            const horario = new Date().toLocaleTimeString();
            const novoSorteado = {
                nome: participanteSorteado.nome,
                empresa: participanteSorteado.empresa,
                horario,
                ordem: palestra.sorteados.length + 1
            };
            
            // Adicionar à lista de sorteados
            palestra.sorteados.push(novoSorteado);
            
            // Atualizar elementos na tela
            numeroSorteio.textContent = novoSorteado.ordem;
            nomeSorteado.textContent = novoSorteado.nome;
            empresaSorteada.textContent = novoSorteado.empresa;
            horarioSorteio.textContent = novoSorteado.horario;
            
            // Mostrar resultado
            resultadoSorteio.classList.remove('escondido');
            
            // Atualizar listas
            renderizarPalestraAtiva();
            
            // Enviar dados para a tela de apresentação
            if (janelaApresentacao && !janelaApresentacao.closed) {
                janelaApresentacao.postMessage({
                    tipo: 'sorteio',
                    ordem: novoSorteado.ordem,
                    nome: novoSorteado.nome,
                    empresa: novoSorteado.empresa
                }, '*');
            }
            
            // Lançar confetes
            lancarConfetes();
            
        }, 1500); // Atraso para simular processamento
    }

    // Lançar confetes para o resultado do sorteio
    function lancarConfetes() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD400', '#7B1FA2', '#4CAF50', '#FF5252', '#2196F3']
        });
    }

    // *** FUNÇÕES DE EXPORTAÇÃO ***

    // Exportar dados de uma palestra
    function exportarDadosPalestra(id) {
        const palestra = palestrasState.palestras.find(p => p.id === id);
        if (!palestra) return;
        
        // Criar planilha com SheetJS
        const wb = XLSX.utils.book_new();
        
        // Aba de participantes
        const wsParticipantes = XLSX.utils.json_to_sheet(palestra.participantes);
        XLSX.utils.book_append_sheet(wb, wsParticipantes, "Participantes");
        
        // Aba de sorteados
        const wsSorteados = XLSX.utils.json_to_sheet(palestra.sorteados);
        XLSX.utils.book_append_sheet(wb, wsSorteados, "Sorteados");
        
        // Gerar arquivo e forçar download
        const nomeArquivo = `${palestra.titulo.replace(/\s+/g, '_')}_${palestra.data}.xlsx`;
        XLSX.writeFile(wb, nomeArquivo);
    }

    // Exportar apenas participantes da palestra ativa
    function exportarParticipantesPalestraAtiva() {
        if (!palestrasState.palestraAtiva) return;
        
        const participantes = palestrasState.palestraAtiva.participantes;
        
        // Criar planilha com SheetJS
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(participantes);
        XLSX.utils.book_append_sheet(wb, ws, "Participantes");
        
        // Gerar arquivo e forçar download
        const nomeArquivo = `participantes_${palestrasState.palestraAtiva.titulo.replace(/\s+/g, '_')}.xlsx`;
        XLSX.writeFile(wb, nomeArquivo);
    }

    // Exportar apenas sorteados da palestra ativa
    function exportarSorteadosPalestraAtiva() {
        if (!palestrasState.palestraAtiva) return;
        
        const sorteados = palestrasState.palestraAtiva.sorteados;
        
        if (sorteados.length === 0) {
            alert('Não há participantes sorteados para exportar');
            return;
        }
        
        // Criar planilha com SheetJS
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(sorteados);
        XLSX.utils.book_append_sheet(wb, ws, "Sorteados");
        
        // Gerar arquivo e forçar download
        const nomeArquivo = `sorteados_${palestrasState.palestraAtiva.titulo.replace(/\s+/g, '_')}.xlsx`;
        XLSX.writeFile(wb, nomeArquivo);
    }

    // *** FUNÇÕES UTILITÁRIAS ***

    // Formatação de data YYYY-MM-DD para DD/MM/YYYY
    function formatarData(dataString) {
        if (!dataString) return '';
        
        const parts = dataString.split('-');
        if (parts.length !== 3) return dataString;
        
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // Processamento de arquivo Excel
    function processarArquivoExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Pegar a primeira aba
                    const primeiraAba = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[primeiraAba];
                    
                    // Converter para JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    // Converter para o formato esperado
                    const participantes = jsonData.map(row => {
                        // Verificar se as colunas existem
                        const nome = row.Nome || row.nome || row.NOME || Object.values(row)[0] || 'Sem nome';
                        const empresa = row.Empresa || row.empresa || row.EMPRESA || Object.values(row)[1] || 'Sem empresa';
                        
                        return { nome, empresa };
                    });
                    
                    resolve(participantes);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Erro ao ler o arquivo'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    // *** FUNÇÕES DE MODAIS ***

    // Exibir modal de confirmação
    function exibirModal(titulo, mensagem, callback) {
        modalTitulo.textContent = titulo;
        modalMensagem.textContent = mensagem;
        
        modal.classList.add('visivel');
        
        // Armazenar callback para confirmar ação
        palestrasState.acaoConfirmacao = callback;
    }

    // Fechar modal
    function fecharModal() {
        modal.classList.remove('visivel');
        palestrasState.acaoConfirmacao = null;
    }

    // Confirmar exclusão de palestra
    function confirmarExclusaoPalestra(id) {
        const palestra = palestrasState.palestras.find(p => p.id === id);
        
        if (!palestra) return;
        
        exibirModal(
            'Excluir Palestra',
            `Tem certeza que deseja excluir a palestra "${palestra.titulo}"? Esta ação não poderá ser desfeita.`,
            () => excluirPalestra(id)
        );
    }

    // Confirmar resetar palestra
    function confirmarResetarPalestra() {
        if (!palestrasState.palestraAtiva) return;
        
        exibirModal(
            'Resetar Palestra',
            'Tem certeza que deseja limpar todos os sorteios desta palestra? Esta ação não poderá ser desfeita.',
            resetarPalestra
        );
    }

    // *** EVENT LISTENERS ***

    // Escutar mensagens da janela de apresentação
    window.addEventListener('message', (event) => {
        // Verificar se é uma mensagem de sorteio concluído
        if (event.data && event.data.tipo === 'sorteioRealizado') {
            const novoSorteado = event.data.sorteado;
            const palestra = palestrasState.palestras.find(p => p.id === event.data.palestraId);
            
            if (palestra && novoSorteado) {
                // Adicionar à lista de sorteados
                palestra.sorteados.push(novoSorteado);
                
                // Se for a palestra ativa, atualizar a interface
                if (palestrasState.palestraAtiva && palestrasState.palestraAtiva.id === palestra.id) {
                    palestrasState.palestraAtiva.sorteados = palestra.sorteados;
                    
                    // Atualizar elementos na tela
                    numeroSorteio.textContent = novoSorteado.ordem;
                    nomeSorteado.textContent = novoSorteado.nome;
                    empresaSorteada.textContent = novoSorteado.empresa;
                    horarioSorteio.textContent = novoSorteado.horario;
                    
                    // Mostrar resultado
                    resultadoSorteio.classList.remove('escondido');
                    
                    // Atualizar listas
                    renderizarPalestraAtiva();
                    
                    // Lançar confetes
                    lancarConfetes();
                }
            }
        }
    });

    // Navegação
    linkPalestras.addEventListener('click', (e) => {
        e.preventDefault();
        navegarParaListaPalestras();
    });

    linkPainelAtivo.addEventListener('click', (e) => {
        e.preventDefault();
        navegarParaPalestraAtiva();
    });

    // Botão Nova Palestra
    btnNovaPalestra.addEventListener('click', () => {
        navegarParaNovaPalestra();
    });

    btnNovaPalestraVazio.addEventListener('click', () => {
        navegarParaNovaPalestra();
    });

    // Botão Voltar para Palestras
    btnVoltarPalestras.addEventListener('click', () => {
        navegarParaListaPalestras();
    });

    // Botão Cancelar Formulário
    btnCancelar.addEventListener('click', () => {
        navegarParaListaPalestras();
    });

    // Botão Voltar para Lista de Palestras
    btnVoltarLista.addEventListener('click', () => {
        navegarParaListaPalestras();
    });

    // Botão Sortear Participante
    btnSortear.addEventListener('click', () => {
        realizarSorteio();
    });

    // Botão Resetar Palestra
    btnResetarPalestra.addEventListener('click', () => {
        confirmarResetarPalestra();
    });

    // Botão Exportar Participantes
    btnExportarParticipantes.addEventListener('click', () => {
        exportarParticipantesPalestraAtiva();
    });

    // Botão Exportar Sorteados
    btnExportarSorteados.addEventListener('click', () => {
        exportarSorteadosPalestraAtiva();
    });

    // Campo de arquivo Excel - atualizar label com o nome do arquivo
    inputArquivoExcel.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            inputNomeArquivo.textContent = e.target.files[0].name;
        } else {
            inputNomeArquivo.textContent = 'Arraste ou clique para escolher o arquivo';
        }
    });

    // Formulário de Nova Palestra - Submit
    formNovaPalestra.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const titulo = inputTituloPalestra.value.trim();
        const data = inputDataPalestra.value;
        const file = inputArquivoExcel.files[0];
        
        if (!titulo || !data || !file) {
            alert('Por favor, preencha todos os campos!');
            return;
        }
        
        try {
            const btnImportar = document.getElementById('btn-importar');
            btnImportar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            btnImportar.disabled = true;
            
            const participantes = await processarArquivoExcel(file);
            
            if (participantes.length === 0) {
                alert('O arquivo não contém participantes ou está em um formato inválido.');
                btnImportar.innerHTML = '<i class="fas fa-file-import"></i> Importar e Criar';
                btnImportar.disabled = false;
                return;
            }
            
            criarNovaPalestra(titulo, data, participantes);
            
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            alert('Ocorreu um erro ao processar o arquivo. Verifique se está no formato correto.');
            
            const btnImportar = document.getElementById('btn-importar');
            btnImportar.innerHTML = '<i class="fas fa-file-import"></i> Importar e Criar';
            btnImportar.disabled = false;
        }
    });

    // Campo de Pesquisa de Participantes
    inputPesquisaParticipante.addEventListener('input', (e) => {
        const termoPesquisa = e.target.value.trim();
        renderizarListaParticipantes(palestrasState.palestraAtiva.participantes, termoPesquisa);
    });

    // Modal de Confirmação - Botões
    btnModalCancelar.addEventListener('click', () => {
        fecharModal();
    });

    btnModalConfirmar.addEventListener('click', () => {
        if (palestrasState.acaoConfirmacao) {
            palestrasState.acaoConfirmacao();
        }
        fecharModal();
    });

    // Botões de fechar modal
    botoesFechaModal.forEach(btn => {
        btn.addEventListener('click', fecharModal);
    });

    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });

    // Inicializar a aplicação
    function inicializarAplicacao() {
        renderizarListaPalestras();
    }

    // Iniciar
    inicializarAplicacao();
});