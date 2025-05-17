// public/js/ajax/ajax_listar_palestras.js
const ListarPalestrasManager = {
    async listar() {
        try {
            const response = await fetch('/src/api/listar_palestras.php');
            if (!response.ok) throw new Error('Erro ao listar palestras');
            const data = await response.json();
            return data.palestras || [];
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async buscarPalestra(palestraId) {
        try {
            const response = await fetch(`/src/api/buscar_palestra.php?id=${palestraId}`);
            if (!response.ok) throw new Error('Erro ao buscar palestra');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};