// public/js/ajax/ajax_sorteio.js
const SorteioManager = {
    async realizarSorteio(palestraId) {
        try {
            const formData = new FormData();
            formData.append('palestra_id', palestraId);

            const response = await fetch('/src/api/sortear.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao realizar sorteio');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async listarSorteados(palestraId) {
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

    async exportarSorteados(palestraId) {
        try {
            window.location.href = `/src/api/exportar_sorteados.php?palestra_id=${palestraId}`;
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};