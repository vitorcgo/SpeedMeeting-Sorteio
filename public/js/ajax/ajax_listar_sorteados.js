// public/js/ajax/ajax_listar_sorteados.js
const ListarSorteadosManager = {
    async listar(palestraId) {
        try {
            const response = await fetch(`/src/api/listar_sorteados.php?palestra_id=${palestraId}`);
            if (!response.ok) throw new Error('Erro ao listar sorteados');
            const data = await response.json();
            return data.sorteados || [];
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async buscarSorteado(palestraId, sorteadoId) {
        try {
            const response = await fetch(`/src/api/buscar_sorteado.php?palestra_id=${palestraId}&sorteado_id=${sorteadoId}`);
            if (!response.ok) throw new Error('Erro ao buscar sorteado');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};