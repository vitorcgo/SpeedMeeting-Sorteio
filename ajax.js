export async function listarPalestras() {
    try {
        const resposta = await fetch('php/listar_palestras.php');
        if (!resposta.ok) {
            throw new Error('Erro ao buscar palestras');
        }
        const dados = await resposta.json();
        return dados;
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        return [];
    }
}

export async function cadastrarPalestra(formElement) {
    const formData = new FormData(formElement);

    try {
        const resposta = await fetch('php/cadastrar_palestra.php', {
            method: 'POST',
            body: formData
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || 'Erro ao cadastrar palestra');
        }

        const resultado = await resposta.json();
        return resultado;
    } catch (erro) {
        console.error('Erro ao cadastrar palestra:', erro);
        throw erro;
    }
}

