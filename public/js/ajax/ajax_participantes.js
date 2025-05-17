// public/js/ajax/ajax_participantes.js
const ParticipanteManager = {
    async listarParticipantes(palestraId, termo = '') {
        try {
            const url = new URL('/src/api/listar_participantes.php', window.location.origin);
            url.searchParams.append('palestra_id', palestraId);
            if (termo) url.searchParams.append('termo', termo);

            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro ao listar participantes');
            const data = await response.json();
            return data.participantes || [];
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    },

    async exportarParticipantes(palestraId) {
        try {
            window.location.href = `/src/api/exportar_participantes.php?palestra_id=${palestraId}`;
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};