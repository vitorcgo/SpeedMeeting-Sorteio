// public/js/ajax/ajax_exportar_participantes.js
const ExportarParticipantesManager = {
    async exportar(palestraId, formato = 'xlsx') {
        try {
            const url = new URL('/src/api/exportar_participantes.php', window.location.origin);
            url.searchParams.append('palestra_id', palestraId);
            url.searchParams.append('formato', formato);

            window.location.href = url.toString();
        } catch (error) {
            console.error('Erro ao exportar participantes:', error);
            throw error;
        }
    },

    async exportarTemplate() {
        try {
            window.location.href = '/src/api/exportar_template.php';
        } catch (error) {
            console.error('Erro ao exportar template:', error);
            throw error;
        }
    }
};