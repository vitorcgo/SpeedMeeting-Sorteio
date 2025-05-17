// public/js/ajax/ajax_atualizar_config.js
const AtualizarConfigManager = {
    async atualizar(configs) {
        try {
            const formData = new FormData();
            Object.entries(configs).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await fetch('/src/api/atualizar_config.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao atualizar configurações');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async atualizarConfigPalestra(palestraId, configs) {
        try {
            const formData = new FormData();
            formData.append('palestra_id', palestraId);
            Object.entries(configs).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await fetch('/src/api/atualizar_config.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao atualizar configurações da palestra');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};