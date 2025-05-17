// public/js/ajax/ajax_resetar_palestra.js
const ResetarPalestraManager = {
    async resetar(palestraId) {
        try {
            const formData = new FormData();
            formData.append('palestra_id', palestraId);

            const response = await fetch('/src/api/resetar_palestra.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Erro ao resetar palestra');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async confirmarReset(palestraId) {
        return new Promise((resolve, reject) => {
            if (confirm('Tem certeza que deseja resetar todos os sorteios desta palestra?')) {
                this.resetar(palestraId)
                    .then(resolve)
                    .catch(reject);
            } else {
                resolve(false);
            }
        });
    }
};