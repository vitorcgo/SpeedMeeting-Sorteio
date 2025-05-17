// PalestraManager.js
const PalestraManager = {
    async criarPalestra(formData) {
        try {
            const response = await fetch('/src/api/lectures/cadastrar_palestra.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.data;
        } catch (error) {
            console.error('Erro ao criar palestra:', error);
            throw error;
        }
    },

    async listarPalestras() {
        try {
            const response = await fetch('/src/api/lectures/listar_palestras.php');
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.palestras || [];
        } catch (error) {
            console.error('Erro ao listar palestras:', error);
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
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data;
        } catch (error) {
            console.error('Erro ao deletar palestra:', error);
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
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data;
        } catch (error) {
            console.error('Erro ao resetar palestra:', error);
            throw error;
        }
    },

    async processarExcel(formData) {
        try {
            const response = await fetch('/src/api/processar_excel.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.data;
        } catch (error) {
            console.error('Erro ao processar Excel:', error);
            throw error;
        }
    }
};