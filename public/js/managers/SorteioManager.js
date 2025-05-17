// SorteioManager.js
const SorteioManager = {
    async realizarSorteio(palestraId) {
        try {
            const formData = new FormData();
            formData.append('palestra_id', palestraId);

            const response = await fetch('/src/api/participants/sortear.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.sorteado;
        } catch (error) {
            console.error('Erro ao realizar sorteio:', error);
            throw error;
        }
    },

    async listarSorteados(palestraId) {
        try {
            const response = await fetch(`/src/api/participants/listar_sorteados.php?palestra_id=${palestraId}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.sorteados || [];
        } catch (error) {
            console.error('Erro ao listar sorteados:', error);
            throw error;
        }
    },

    async exportarSorteados(palestraId) {
        try {
            const url = new URL('/src/api/participants/exportar_sorteados.php', window.location.origin);
            url.searchParams.append('palestra_id', palestraId);
            window.location.href = url.toString();
        } catch (error) {
            console.error('Erro ao exportar sorteados:', error);
            throw error;
        }
    },

    async buscarSorteado(palestraId, sorteadoId) {
        try {
            const url = new URL('/src/api/participants/buscar_sorteado.php', window.location.origin);
            url.searchParams.append('palestra_id', palestraId);
            url.searchParams.append('sorteado_id', sorteadoId);

            const response = await fetch(url);
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return data.sorteado;
        } catch (error) {
            console.error('Erro ao buscar sorteado:', error);
            throw error;
        }
    },

    async verificarStatus(palestraId) {
        try {
            const response = await fetch(`/src/api/participants/verificar_status_sorteio.php?palestra_id=${palestraId}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            return {
                totalParticipantes: data.total_participantes,
                totalSorteados: data.total_sorteados,
                disponiveis: data.disponiveis || []
            };
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            throw error;
        }
    }
};