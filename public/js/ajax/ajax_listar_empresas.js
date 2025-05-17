// public/js/ajax/ajax_listar_empresas.js
const ListarEmpresasManager = {
    async listarTodas() {
        try {
            const response = await fetch('/src/api/listar_empresas.php');
            if (!response.ok) throw new Error('Erro ao listar empresas');
            const data = await response.json();
            return data.empresas || [];
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async listarPorPalestra(palestraId) {
        try {
            const response = await fetch(`/src/api/listar_empresas_palestra.php?palestra_id=${palestraId}`);
            if (!response.ok) throw new Error('Erro ao listar empresas da palestra');
            const data = await response.json();
            return data.empresas || [];
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async buscarLogos(palestraId) {
        try {
            const response = await fetch(`/src/api/listar_logos.php?palestra_id=${palestraId}`);
            if (!response.ok) throw new Error('Erro ao buscar logos');
            const data = await response.json();
            return data.logos || [];
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};