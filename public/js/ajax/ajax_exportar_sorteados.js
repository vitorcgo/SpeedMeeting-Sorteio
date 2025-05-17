// public/js/ajax/ajax_exportar_sorteados.js
const ExportarSorteadosManager = {
    async exportar(palestraId, formato = 'xlsx') {
        try {
            const url = new URL('/src/api/exportar_sorteados.php', window.location.origin);
            url.searchParams.append('palestra_id', palestraId);
            url.searchParams.append('formato', formato);

            window.location.href = url.toString();
        } catch (error) {
            console.error('Erro ao exportar sorteados:', error);
            throw error;
        }
    },

    async exportarHistorico(palestraId) {
        try {
            const url = new URL('/src/api/exportar_historico_sorteios.php', window.location.origin);
            url.searchParams.append('palestra_id', palestraId);

            window.location.href = url.toString();
        } catch (error) {
            console.error('Erro ao exportar histórico:', error);
            throw error;
        }
    }
};