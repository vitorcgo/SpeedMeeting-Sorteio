// public/js/ajax/ajax_listar_participantes.js
const ListarParticipantesManager = {
    async listar(palestraId, termo = '') {
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

    async buscarParticipante(palestraId, participanteId) {
        try {
            const response = await fetch(`/src/api/buscar_participante.php?palestra_id=${palestraId}&participante_id=${participanteId}`);
            if (!response.ok) throw new Error('Erro ao buscar participante');
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }
};