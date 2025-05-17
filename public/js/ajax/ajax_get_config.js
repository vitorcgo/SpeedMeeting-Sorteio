// public/js/ajax/ajax_get_config.js
const ConfigManager = {
    async buscarConfig() {
        try {
            const response = await fetch('/src/api/get_config.php');
            if (!response.ok) throw new Error('Erro ao buscar configurações');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async buscarConfigPalestra(palestraId) {
        try {
            const response = await fetch(`/src/api/get_config.php?palestra_id=${palestraId}`);
            if (!response.ok) throw new Error('Erro ao buscar configurações da palestra');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};