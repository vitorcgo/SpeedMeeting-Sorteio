// public/js/empresa_modal.js
document.addEventListener('DOMContentLoaded', function() {
    // File upload preview
    window.atualizarNomeArquivoLogo = function(event) {
        const fileName = event.target.files[0]?.name || 'Clique para escolher a logo';
        document.getElementById('nome-arquivo-logo').textContent = fileName;
    };

    // Upload logo
    window.uploadLogo = async function(event) {
        event.preventDefault();
        
        const formData = new FormData();
        formData.append('nome_empresa', document.getElementById('nome-empresa').value);
        formData.append('logo', document.getElementById('arquivo-logo').files[0]);

        try {
            await EmpresaManager.uploadLogo(currentPalestraId, formData);
            await carregarLogos();
            document.getElementById('form-logo').reset();
            document.getElementById('nome-arquivo-logo').textContent = 'Clique para escolher a logo';
        } catch (error) {
            alert(error.message);
        }
    };

    // Load logos
    async function carregarLogos() {
        try {
            const logos = await EmpresaManager.listarLogos(currentPalestraId);
            const container = document.getElementById('lista-logos');
            
            container.innerHTML = logos.map(logo => `
                <div class="logo-item" data-empresa-id="${logo.id}">
                    <div class="logo-preview">
                        <img src="${logo.url_logo}" alt="${logo.nome}">
                    </div>
                    <div class="logo-info">
                        <span class="logo-nome">${logo.nome}</span>
                        <button class="botao-acao" onclick="deletarLogo(${logo.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="logo-drag-handle">
                        <i class="fas fa-grip-vertical"></i>
                    </div>
                </div>
            `).join('');

            initializeSortable();
        } catch (error) {
            console.error('Erro ao carregar logos:', error);
        }
    }

    // Delete logo
    window.deletarLogo = function(empresaId) {
        if (!confirm('Tem certeza que deseja deletar esta logo?')) return;

        EmpresaManager.deletarLogo(currentPalestraId, empresaId)
            .then(() => carregarLogos())
            .catch(error => alert(error.message));
    };

    // Initialize Sortable
    function initializeSortable() {
        const container = document.getElementById('lista-logos');
        if (!container) return;

        new Sortable(container, {
            animation: 150,
            handle: '.logo-drag-handle',
            onEnd: function() {
                const ordem = Array.from(container.children).map(item => 
                    parseInt(item.dataset.empresaId)
                );
                EmpresaManager.atualizarOrdem(currentPalestraId, ordem)
                    .catch(error => console.error('Erro ao atualizar ordem:', error));
            }
        });
    }

    // Modal functions
    window.abrirModalEmpresas = function() {
        document.getElementById('modal-empresa').style.display = 'block';
        carregarLogos();
    };

    window.fecharModalEmpresas = function() {
        document.getElementById('modal-empresa').style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('modal-empresa');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});