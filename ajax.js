export async function listarPalestras() {
    try {
        const resposta = await fetch('php/listar_palestras.php');
        if (!resposta.ok) {
            throw new Error('Erro ao buscar palestras');
        }
        const dados = await resposta.json();
        return dados;
    } catch (erro) {
        // Erro na requisição de palestras
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
        // Erro ao cadastrar palestra no sistema
        throw erro;
    }
}

export async function listarAdministradores() {
    try {
        const resposta = await fetch('php/listar_administradores.php');
        if (!resposta.ok) {
            throw new Error('Erro ao buscar administradores');
        }
        const dados = await resposta.json();
        return dados;
    } catch (erro) {
        // Erro na requisição de administradores
        return [];
    }
}

export async function cadastrarAdministrador(formElement) {
    const formData = new FormData(formElement);

    try {
        const resposta = await fetch('php/cadastrar_administrador.php', {
            method: 'POST',
            body: formData
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || 'Erro ao cadastrar administrador');
        }

        const resultado = await resposta.json();
        return resultado;
    } catch (erro) {
        // Erro ao cadastrar administrador no sistema
        throw erro;
    }
}

