// ParticipanteManager.js
const ParticipanteManager = {
    async listarParticipantes(palestraId, termo = '') {
        try {
            const url = new URL('/src/api/participants/listar_participantes.php', window.location.origin);
            url.searchParams.append('palestra_id', palestraId);
            if (termo) url.searchParams.append('termo', termo);

            const response = await fetch(url);
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.participantes || [];
        } catch (error) {
            console.error('Erro ao listar participantes:', error);
            throw error;
        }
    },

    async exportarParticipantes(palestraId) {
        try {
            const url = new URL('/src/api/participants/exportar_participantes.php', window.location.origin);
            url.searchParams.append('palestra_id', palestraId);
            window.location.href = url.toString();
        } catch (error) {
            console.error('Erro ao exportar participantes:', error);
            throw error;
        }
    },

    async buscarParticipante(palestraId, participanteId) {
        try {
            const url = new URL('/src/api/participants/buscar_participante.php', window.location.origin);
            url.searchParams.append('palestra_id', palestraId);
            url.searchParams.append('participante_id', participanteId);

            const response = await fetch(url);
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.participante;
        } catch (error) {
            console.error('Erro ao buscar participante:', error);
            throw error;
        }
    },

    async verificarDuplicados(palestraId) {
        try {
            const response = await fetch(`/src/api/participants/verificar_duplicados.php?palestra_id=${palestraId}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.duplicados || [];
        } catch (error) {
            console.error('Erro ao verificar duplicados:', error);
            throw error;
        }
    }
};