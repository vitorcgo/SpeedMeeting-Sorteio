// public/js/ajax/ajax_cadastrar_palestra.js
const CadastrarPalestraManager = {
    async cadastrar(formData) {
        try {
            const response = await fetch('/src/api/cadastrar_palestra.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao cadastrar palestra');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async processarExcel(formData) {
        try {
            const response = await fetch('/src/api/processar_excel.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao processar arquivo Excel');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};