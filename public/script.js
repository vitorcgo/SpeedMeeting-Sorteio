// public/script.js
document.addEventListener('DOMContentLoaded', function() {
    // Global state
    let currentPalestraId = null;
    let participantesWindow = null;

    // DOM Elements
    const menuLinks = {
        palestras: document.getElementById('link-palestras'),
        painelAtivo: document.getElementById('link-painel-ativo')
    };
    
    const sections = {
        palestras: document.getElementById('secao-palestras'),
        novaPalestra: document.getElementById('secao-nova-palestra'),
        palestraAtiva: document.getElementById('secao-palestra-ativa')
    };
    
    const buttons = {
        novaPalestra: document.getElementById('btn-nova-palestra'),
        novaPalestraVazio: document.getElementById('btn-nova-palestra-vazio'),
        voltarPalestras: document.getElementById('btn-voltar-palestras'),
        voltarLista: document.getElementById('btn-voltar-lista'),
        sortear: document.getElementById('btn-sortear'),
        exportarParticipantes: document.getElementById('btn-exportar-participantes'),
        exportarSorteados: document.getElementById('btn-exportar-sorteados'),
        resetarPalestra: document.getElementById('btn-resetar-palestra')
    };

    // Modal Elements
    const modal = document.getElementById('modal-confirmacao');
    const modalTitle = document.getElementById('modal-titulo');
    const modalMessage = document.getElementById('modal-mensagem');
    const modalConfirm = document.getElementById('modal-confirmar');
    const modalCancel = document.getElementById('modal-cancelar');
    const closeModal = document.querySelector('.fechar-modal');

    // UI State Management
    function showSection(sectionId) {
        Object.values(sections).forEach(section => {
            section.classList.add('escondido');
        });
        sections[sectionId].classList.remove('escondido');
    }

    function updateMenuState(activeLink) {
        Object.values(menuLinks).forEach(link => {
            link.classList.remove('ativo');
        });
        activeLink.classList.add('ativo');
    }

    // Event Listeners - Navigation
    menuLinks.palestras.addEventListener('click', function(e) {
        e.preventDefault();
        updateMenuState(this);
        showSection('palestras');
        loadPalestras();
    });

    menuLinks.painelAtivo.addEventListener('click', function(e) {
        e.preventDefault();
        if (!currentPalestraId) {
            alert('Selecione uma palestra primeiro!');
            return;
        }
        updateMenuState(this);
        showSection('palestraAtiva');
        loadPalestraAtiva(currentPalestraId);
    });

    // Event Listeners - Palestra Management
    buttons.novaPalestra.addEventListener('click', () => showSection('novaPalestra'));
    buttons.novaPalestraVazio.addEventListener('click', () => showSection('novaPalestra'));
    buttons.voltarPalestras.addEventListener('click', () => showSection('palestras'));
    buttons.voltarLista.addEventListener('click', () => showSection('palestras'));

    // File Upload Preview
    document.getElementById('arquivo-excel').addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name || 'Arraste ou clique para escolher o arquivo';
        document.getElementById('nome-arquivo').textContent = fileName;
    });

    // Form Submission - Nova Palestra
    document.getElementById('form-nova-palestra').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('titulo', document.getElementById('titulo-palestra').value);
        formData.append('data', document.getElementById('data-palestra').value);
        formData.append('arquivo_excel', document.getElementById('arquivo-excel').files[0]);

        try {
            const palestra = await PalestraManager.criarPalestra(formData);
            showSection('palestras');
            loadPalestras();
            this.reset();
            document.getElementById('nome-arquivo').textContent = 'Arraste ou clique para escolher o arquivo';
        } catch (error) {
            alert(error.message);
        }
    });

    // Drawing Functionality
    buttons.sortear.addEventListener('click', async function() {
        if (!currentPalestraId) return;
        
        try {
            this.disabled = true;
            const sorteado = await SorteioManager.realizarSorteio(currentPalestraId);
            displaySorteado(sorteado);
            await loadSorteados();
        } catch (error) {
            alert(error.message);
        } finally {
            this.disabled = false;
        }
    });

    // Export Functionality
    buttons.exportarParticipantes.addEventListener('click', () => {
        if (!currentPalestraId) return;
        ParticipanteManager.exportarParticipantes(currentPalestraId);
    });

    buttons.exportarSorteados.addEventListener('click', () => {
        if (!currentPalestraId) return;
        SorteioManager.exportarSorteados(currentPalestraId);
    });

    // Reset Functionality
    buttons.resetarPalestra.addEventListener('click', () => {
        if (!currentPalestraId) return;
        
        showModal(
            'Resetar Palestra',
            'Tem certeza que deseja resetar todos os sorteios desta palestra?',
            async () => {
                try {
                    await PalestraManager.resetarPalestra(currentPalestraId);
                    await loadSorteados();
                    alert('Palestra resetada com sucesso!');
                } catch (error) {
                    alert(error.message);
                }
            }
        );
    });

    // Modal Functionality
    function showModal(title, message, onConfirm) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'block';
        
        modalConfirm.onclick = () => {
            onConfirm();
            modal.style.display = 'none';
        };
    }

    modalCancel.onclick = () => modal.style.display = 'none';
    closeModal.onclick = () => modal.style.display = 'none';
    
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Data Loading Functions
    async function loadPalestras() {
        try {
            const palestras = await PalestraManager.listarPalestras();
            const tbody = document.getElementById('lista-palestras');
            const mensagemVazio = document.getElementById('mensagem-sem-palestras');
            
            tbody.innerHTML = '';
            
            if (palestras.length === 0) {
                mensagemVazio.style.display = 'flex';
                return;
            }
            
            mensagemVazio.style.display = 'none';
            
            palestras.forEach(palestra => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${palestra.titulo}</td>
                    <td>${new Date(palestra.data).toLocaleDateString()}</td>
                    <td>${palestra.total_participantes}</td>
                    <td>${palestra.total_empresas}</td>
                    <td>${palestra.total_sorteados}</td>
                    <td>
                        <button class="botao-acao" onclick="ativarPalestra(${palestra.id}, '${palestra.titulo}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="botao-acao" onclick="deletarPalestra(${palestra.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            alert(error.message);
        }
    }

    async function loadPalestraAtiva(palestraId) {
        try {
            const [participantes, sorteados] = await Promise.all([
                ParticipanteManager.listarParticipantes(palestraId),
                SorteioManager.listarSorteados(palestraId)
            ]);
            
            updatePalestraAtivaUI(participantes, sorteados);
        } catch (error) {
            alert(error.message);
        }
    }

    function updatePalestraAtivaUI(participantes, sorteados) {
        document.getElementById('total-participantes').textContent = participantes.length;
        document.getElementById('total-sorteados').textContent = sorteados.length;
        
        const listaParticipantes = document.getElementById('lista-participantes');
        const listaSorteados = document.getElementById('lista-sorteados');
        
        listaParticipantes.innerHTML = participantes.map(p => `
            <div class="participante-item">
                <div class="participante-nome">${p.nome}</div>
                <div class="participante-empresa">${p.empresa}</div>
            </div>
        `).join('');
        
        listaSorteados.innerHTML = sorteados.map(s => `
            <div class="sorteado-item">
                <div class="sorteado-nome">${s.nome}</div>
                <div class="sorteado-empresa">${s.empresa}</div>
                <div class="sorteado-horario">${new Date(s.data_sorteio).toLocaleTimeString()}</div>
            </div>
        `).join('');
    }

    // Global Functions
    window.ativarPalestra = function(palestraId, titulo) {
        currentPalestraId = palestraId;
        document.getElementById('titulo-palestra-ativa').textContent = titulo;
        menuLinks.painelAtivo.click();
    };

    window.deletarPalestra = function(palestraId) {
        showModal(
            'Deletar Palestra',
            'Tem certeza que deseja deletar esta palestra? Esta ação não pode ser desfeita.',
            async () => {
                try {
                    await PalestraManager.deletarPalestra(palestraId);
                    if (currentPalestraId === palestraId) {
                        currentPalestraId = null;
                        showSection('palestras');
                    }
                    loadPalestras();
                } catch (error) {
                    alert(error.message);
                }
            }
        );
    };

    // Search Functionality
    document.getElementById('pesquisa-participante').addEventListener('input', debounce(async function() {
        if (!currentPalestraId) return;
        
        try {
            const participantes = await ParticipanteManager.listarParticipantes(
                currentPalestraId,
                this.value
            );
            const listaParticipantes = document.getElementById('lista-participantes');
            
            listaParticipantes.innerHTML = participantes.map(p => `
                <div class="participante-item">
                    <div class="participante-nome">${p.nome}</div>
                    <div class="participante-empresa">${p.empresa}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error(error);
        }
    }, 300));

    // Utility Functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initial Load
    loadPalestras();
});