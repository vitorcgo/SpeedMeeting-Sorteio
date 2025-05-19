// tela_ajax.js

// Obtém participantes ainda não sorteados e logos da palestra
export async function obterDadosDaPalestra(palestraId) {
    const res = await fetch(`php/obter_participantes_tela.php?id=${palestraId}`);
    const dados = await res.json();
    return dados;
}

// Registra sorteio e retorna o sorteado
export async function registrarSorteio(palestraId, idsExcluidos = []) {
    const res = await fetch('php/registrar_sorteio.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            palestra_id: palestraId,
            ids_excluidos: idsExcluidos
        })
    });

    return await res.json();
}
