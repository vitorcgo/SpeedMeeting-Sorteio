// public/js/ajax/ajax_empresas.js
const EmpresaManager = {
    async listarEmpresas() {
        try {
            const response = await fetch('/src/api/companies/listar_empresas.php');
            if (!response.ok) throw new Error('Erro ao listar empresas');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async cadastrarEmpresa(formData) {
        try {
            const response = await fetch('/src/api/companies/cadastrar_empresa.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao cadastrar empresa');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async atribuirEmpresa(palestraId, empresaId) {
        try {
            const formData = new FormData();
            formData.append('palestra_id', palestraId);
            formData.append('empresa_id', empresaId);

            const response = await fetch('/src/api/companies/atribuir_empresa.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao atribuir empresa');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async removerEmpresa(empresaId) {
        try {
            const formData = new FormData();
            formData.append('empresa_id', empresaId);

            const response = await fetch('/src/api/companies/remover_empresa.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao remover empresa');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async atualizarLogo(empresaId, arquivo) {
        try {
            const formData = new FormData();
            formData.append('empresa_id', empresaId);
            formData.append('arquivo_logo', arquivo);

            const response = await fetch('/src/api/companies/atualizar_logo.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao atualizar logo');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async listarEmpresasPalestra(palestraId) {
        try {
            const response = await fetch(`/src/api/companies/listar_empresas_palestra.php?palestra_id=${palestraId}`);
            if (!response.ok) throw new Error('Erro ao listar empresas da palestra');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};