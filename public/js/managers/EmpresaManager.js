// public/js/managers/EmpresaManager.js
const EmpresaManager = {
    async uploadLogo(palestraId, formData) {
        try {
            formData.append('palestra_id', palestraId);
            const response = await fetch('/src/api/companies/atualizar_logo.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.empresa;
        } catch (error) {
            console.error('Erro ao fazer upload da logo:', error);
            throw error;
        }
    },

    async listarLogos(palestraId) {
        try {
            const response = await fetch(`/src/api/companies/listar_empresas_palestra.php?palestra_id=${palestraId}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.empresas || [];
        } catch (error) {
            console.error('Erro ao listar logos:', error);
            throw error;
        }
    },

    async deletarLogo(palestraId, empresaId) {
        try {
            const formData = new FormData();
            formData.append('palestra_id', palestraId);
            formData.append('empresa_id', empresaId);

            const response = await fetch('/src/api/companies/remover_empresa.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data;
        } catch (error) {
            console.error('Erro ao deletar logo:', error);
            throw error;
        }
    },

    async atualizarOrdem(palestraId, ordem) {
        try {
            const response = await fetch('/src/api/companies/atribuir_empresa.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    palestra_id: palestraId,
                    ordem: ordem
                })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data;
        } catch (error) {
            console.error('Erro ao atualizar ordem das logos:', error);
            throw error;
        }
    }
};