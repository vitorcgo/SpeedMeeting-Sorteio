// public/js/ajax/ajax_palestras.js
const PalestraManager = {
    async listarPalestras() {
        try {
            const response = await fetch('/src/api/lectures/listar_palestras.php');
            if (!response.ok) throw new Error('Erro ao listar palestras');
            const data = await response.json();
            return data.palestras || [];
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async criarPalestra(formData) {
        try {
            const response = await fetch('/src/api/lectures/cadastrar_palestra.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao criar palestra');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async deletarPalestra(palestraId) {
        try {
            const formData = new FormData();
            formData.append('palestra_id', palestraId);

            const response = await fetch('/src/api/lectures/deletar_palestra.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao deletar palestra');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async resetarPalestra(palestraId) {
        try {
            const formData = new FormData();
            formData.append('palestra_id', palestraId);

            const response = await fetch('/src/api/lectures/resetar_palestra.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao resetar palestra');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};