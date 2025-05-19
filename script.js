import { cadastrarPalestra, listarPalestras } from './ajax.js';

async function iniciarSorteioFrontEnd(palestraId) {
    const resposta = await fetch(`php/obter_participantes_sorteio.php?id=${palestraId}`);
    const dados = await resposta.json();

    const todos = dados.participantes;
    const sorteadosIds = dados.sorteados;

    const disponiveis = todos.filter(p => !sorteadosIds.includes(parseInt(p.id)));

    if (disponiveis.length === 0) {
        alert('Todos os participantes já foram sorteados.');
        return;
    }

    const sorteado = disponiveis[Math.floor(Math.random() * disponiveis.length)];

    document.getElementById('nome-sorteado').textContent = sorteado.nome;
    document.getElementById('empresa-sorteada').textContent = sorteado.empresa;
    document.getElementById('resultado-sorteio').classList.remove('escondido');

    await fetch('php/registrar_sorteio.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palestra_id: palestraId, participante_id: sorteado.id })
    });

    carregarPalestraAtiva(palestraId);
}

async function carregarPalestraAtiva(id) {
    try {
        const resposta = await fetch(`php/obter_palestra.php?id=${id}`);
        const dados = await resposta.json();

        document.getElementById('titulo-palestra-ativa').textContent = dados.titulo;
        document.getElementById('data-palestra-ativa').textContent = dados.data;

        const lista = document.getElementById('lista-participantes');
        const totalParticipantes = document.getElementById('total-participantes');
        const totalEmpresas = document.getElementById('total-empresas');
        lista.innerHTML = '';
        const empresas = new Set();

        // ✅ Cria um Set com os IDs dos sorteados
        const idsSorteados = new Set(dados.sorteados.map(s => s.participante_id));

        dados.participantes.forEach(p => {
            empresas.add(p.empresa);

            const div = document.createElement('div');
            div.classList.add('item-participante');

            const infoDiv = document.createElement('div');
            infoDiv.innerHTML = `
                <div class="nome">${p.nome}</div>
                <div class="empresa">${p.empresa}</div>
            `;

            const statusDiv = document.createElement('div');
            statusDiv.classList.add('status');

            // ✅ Verifica corretamente se o participante foi sorteado
            const foiSorteado = idsSorteados.has(p.id);

            if (foiSorteado) {
                statusDiv.textContent = 'Sorteado';
                statusDiv.classList.add('sorteado');
            } else {
                statusDiv.textContent = 'Não sorteado';
            }

            div.appendChild(infoDiv);
            div.appendChild(statusDiv);
            lista.appendChild(div);
        });

        totalParticipantes.textContent = dados.participantes.length;
        totalEmpresas.textContent = empresas.size;

        const listaSorteados = document.getElementById('lista-sorteados');
        const totalSorteados = document.getElementById('total-sorteados');
        listaSorteados.innerHTML = '';
        totalSorteados.textContent = dados.sorteados.length;

        dados.sorteados.forEach((s) => {
            const div = document.createElement('div');
            div.classList.add('item-sorteado');
            div.innerHTML = `
                <div class="ordem">${s.ordem}</div>
                <div class="nome">${s.nome}</div>
                <div class="empresa">${s.empresa}</div>
                <div class="horario">${s.horario}</div>
            `;
            listaSorteados.appendChild(div);
        });

        // 🟨 Adicione aqui:
        if (dados.sorteados.length > 0) {
            const ultimo = dados.sorteados[dados.sorteados.length - 1];
            document.getElementById('numero-sorteio').textContent = ultimo.ordem;
            document.getElementById('nome-sorteado').textContent = ultimo.nome;
            document.getElementById('empresa-sorteada').textContent = ultimo.empresa;
            document.getElementById('horario-sorteio').textContent = ultimo.horario;
            document.getElementById('resultado-sorteio').classList.remove('escondido');
        } else {
            document.getElementById('resultado-sorteio').classList.add('escondido');
        }

    } catch (erro) {
        alert('Erro ao carregar palestra ativa: ' + erro.message);
    }

    document.getElementById('btn-exportar-participantes')?.addEventListener('click', () => {
        baixarArquivoExcel(`php/exportar_participantes.php?palestra=${id}`, 'participantes.xlsx');
    });

    document.getElementById('btn-exportar-sorteados')?.addEventListener('click', () => {
        baixarArquivoExcel(`php/exportar_sorteados.php?palestra=${id}`, 'sorteados.xlsx');
    });

    const btnSortear = document.getElementById('btn-sortear');
    if (btnSortear) {
        btnSortear.onclick = () => {
            sessionStorage.setItem('palestraAtivaId', id);
            window.open(`tela.html?palestra=${id}`, '_blank');
        };
    }

    document.getElementById('btn-resetar-palestra')?.addEventListener('click', async () => {
    if (!confirm('Tem certeza que deseja resetar os sorteios desta palestra?')) return;

    try {
        const resposta = await fetch('php/resetar_palestra.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ palestra_id: id })
        });

        const resultado = await resposta.json();
        if (resultado.sucesso) {
            alert('Sorteios resetados com sucesso.');
            carregarPalestraAtiva(id);
        } else {
            alert('Erro: ' + resultado.erro);
        }
    } catch (erro) {
        alert('Erro ao resetar: ' + erro.message);
    }
});

}



function mostrarSecao(secao) {
    const secaoPalestras = document.getElementById('secao-palestras');
    const secaoNovaPalestra = document.getElementById('secao-nova-palestra');
    const secaoPalestraAtiva = document.getElementById('secao-palestra-ativa');
    const secaoGerenciamentoLogos = document.getElementById('secao-gerenciamento-logos'); // ✅ Adicionado

    [secaoPalestras, secaoNovaPalestra, secaoPalestraAtiva, secaoGerenciamentoLogos].forEach(s => {
        if (s) s.classList.add('escondido');
    });

    secao.classList.remove('escondido');
}


async function carregarPalestras() {
    const lista = document.getElementById('lista-palestras');
    const mensagemVazia = document.getElementById('mensagem-sem-palestras');
    const palestras = await listarPalestras();

    lista.innerHTML = '';
    if (palestras.length === 0) {
        mensagemVazia.style.display = 'block';
        return;
    }

    mensagemVazia.style.display = 'none';

    palestras.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.titulo}</td>
            <td>${p.data}</td>
            <td>${p.total_participantes}</td>
            <td>${p.total_empresas}</td>
            <td>${p.total_sorteados}</td>
            <td>
                <button class="botao-secundario btn-ver" data-id="${p.id}">Ver</button>
                <a href="php/exportar_palestra.php?id=${p.id}" class="botao-secundario">Exportar</a>
                <button class="botao-perigo btn-excluir" data-id="${p.id}">Excluir</button>
            </td>
        `;
        lista.appendChild(tr);
    });

    document.querySelectorAll('.btn-ver').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            sessionStorage.setItem('palestraAtivaId', id);
            mostrarSecao(document.getElementById('secao-palestra-ativa'));
            carregarPalestraAtiva(id);
        });
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (confirm('Tem certeza que deseja excluir esta palestra?')) {
                await fetch(`php/excluir_palestra.php?id=${id}`, { method: 'DELETE' });
                carregarPalestras();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarGaleriaLogos();
    const form = document.getElementById('form-nova-palestra');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await cadastrarPalestra(form);
                alert('Palestra cadastrada com sucesso!');
                mostrarSecao(document.getElementById('secao-palestras'));
                carregarPalestras();
            } catch (erro) {
                alert('Erro ao cadastrar palestra: ' + erro.message);
            }
        });
    }

    carregarPalestras();

    const secaoPalestras = document.getElementById('secao-palestras');
    const secaoNovaPalestra = document.getElementById('secao-nova-palestra');
    const secaoPalestraAtiva = document.getElementById('secao-palestra-ativa');
    

    const linkPalestras = document.getElementById('link-palestras');
    const linkPainelAtivo = document.getElementById('link-painel-ativo');

    const btnNovaPalestra = document.getElementById('btn-nova-palestra');
    const btnNovaPalestraVazio = document.getElementById('btn-nova-palestra-vazio');
    const btnVoltarPalestras = document.getElementById('btn-voltar-palestras');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnVoltarLista = document.getElementById('btn-voltar-lista');

    if (btnNovaPalestra) btnNovaPalestra.addEventListener('click', () => mostrarSecao(secaoNovaPalestra));
    if (btnNovaPalestraVazio) btnNovaPalestraVazio.addEventListener('click', () => mostrarSecao(secaoNovaPalestra));
    if (btnVoltarPalestras) btnVoltarPalestras.addEventListener('click', () => mostrarSecao(secaoPalestras));
    if (btnCancelar) btnCancelar.addEventListener('click', () => mostrarSecao(secaoPalestras));
    if (btnVoltarLista) btnVoltarLista.addEventListener('click', () => mostrarSecao(secaoPalestras));
    if (linkPalestras) linkPalestras.addEventListener('click', () => mostrarSecao(secaoPalestras));
    if (linkPainelAtivo) linkPainelAtivo.addEventListener('click', () => mostrarSecao(secaoPalestraAtiva));

    // ✅ Detecta sorteio feito em outra aba (tela.html) e recarrega painel automaticamente
    window.addEventListener('storage', (e) => {
        if (e.key === 'sorteioAtualizado') {
            const idAtual = sessionStorage.getItem('palestraAtivaId');
            if (idAtual) {
                carregarPalestraAtiva(idAtual);
            }
        }
    });

    mostrarSecao(secaoPalestras);
});

// Atualiza nome do arquivo Excel
const inputArquivo = document.getElementById('arquivo-excel');
const nomeArquivoSpan = document.getElementById('nome-arquivo');

if (inputArquivo && nomeArquivoSpan) {
    inputArquivo.addEventListener('change', () => {
        nomeArquivoSpan.textContent = inputArquivo.files.length > 0
            ? inputArquivo.files[0].name
            : "Arraste ou clique para escolher o arquivo";
    });
}

async function baixarArquivoExcel(url, nomeArquivo) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao gerar o arquivo.');

        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (erro) {
        alert('Erro ao exportar: ' + erro.message);
    }
}

async function carregarLogosParaPalestra(palestraId) {
    try {
        const resposta = await fetch(`php/listar_logos.php?palestra=${palestraId}`);
        const dados = await resposta.json();

        const lista = document.getElementById('lista-selecao-logos');
        lista.innerHTML = '';

        const selecionadas = new Set(dados.selecionadas || []); // <- importante!

        dados.logos.forEach(logo => {
            const div = document.createElement('div');
            div.classList.add('item-selecao-logo');

            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.classList.add('logo-checkbox');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = logo.id;
            input.checked = selecionadas.has(logo.id); // <- corretamente marcado
            checkboxWrapper.appendChild(input);

            const label = document.createElement('label');
            label.classList.add('logo-label');

            const miniatura = document.createElement('div');
            miniatura.classList.add('logo-mini');
            const img = document.createElement('img');
            img.src = `upload/${logo.imagem}`;
            img.alt = logo.nome;
            miniatura.appendChild(img);

            const span = document.createElement('span');
            span.textContent = logo.nome;

            label.appendChild(miniatura);
            label.appendChild(span);

            div.appendChild(checkboxWrapper);
            div.appendChild(label);
            lista.appendChild(div);
        });
    } catch (erro) {
        alert('Erro ao carregar logos: ' + erro.message);
    }
}


document.getElementById('btn-aplicar-logos')?.addEventListener('click', async () => {
    const palestraId = sessionStorage.getItem('palestraAtivaId');
    if (!palestraId) {
        alert('Palestra ativa não encontrada');
        return;
    }

    const selecionados = Array.from(document.querySelectorAll('.logo-checkbox input[type="checkbox"]:checked'))
        .map(el => parseInt(el.value));

    try {
        const resposta = await fetch('php/aplicar_logos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                palestra_id: parseInt(palestraId),
                logos: selecionados
            })
        });

        const resultado = await resposta.json();

        if (resultado.sucesso) {
            alert('Logos aplicadas com sucesso!');
            await carregarLogosParaPalestra(palestraId); // 🟨 Atualiza a seleção
        } else {
            throw new Error(resultado.erro || 'Erro desconhecido');
        }
    } catch (erro) {
        alert('Erro ao aplicar logos: ' + erro.message);
    }
});


document.getElementById('btn-gerenciar-logos')?.addEventListener('click', () => {
    const secaoLogos = document.getElementById('secao-gerenciamento-logos');
    const id = sessionStorage.getItem('palestraAtivaId');
    if (id) {
        mostrarSecao(secaoLogos);
        carregarLogosParaPalestra(id);
    } else {
        alert('Palestra não identificada.');
    }
});

document.getElementById('btn-voltar-palestra-logos')?.addEventListener('click', () => {
    mostrarSecao(document.getElementById('secao-palestra-ativa'));
});

const formLogo = document.getElementById('form-cadastro-logo');

if (formLogo) {
    formLogo.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formLogo);

        try {
            const resposta = await fetch('php/cadastrar_logo.php', {
                method: 'POST',
                body: formData
            });

            const resultado = await resposta.json();
            if (resultado.sucesso) {
                alert('Logo cadastrada com sucesso!');
                formLogo.reset();
                const palestraId = sessionStorage.getItem('palestraAtivaId');
                if (palestraId) {
                    carregarLogosParaPalestra(palestraId);
                }
            } else {
                alert('Erro: ' + resultado.erro);
            }
        } catch (erro) {
            alert('Erro ao cadastrar logo: ' + erro.message);
        }
    });

    const inputLogo = document.getElementById('imagem-logo');
    const spanNomeLogo = document.getElementById('nome-arquivo-logo');
    if (inputLogo && spanNomeLogo) {
        inputLogo.addEventListener('change', () => {
            spanNomeLogo.textContent = inputLogo.files.length > 0
                ? inputLogo.files[0].name
                : "Arraste ou clique para escolher a imagem";
        });
    }
}

const btnAplicarLogos = document.getElementById('btn-aplicar-logos');
if (btnAplicarLogos) {
    btnAplicarLogos.addEventListener('click', async () => {
        const palestraId = sessionStorage.getItem('palestraAtivaId');
        if (!palestraId) return;

        const checkboxes = document.querySelectorAll('.logo-checkbox input[type="checkbox"]');
        const selecionadas = Array.from(checkboxes)
            .filter(chk => chk.checked)
            .map(chk => parseInt(chk.value));

        try {
            const resposta = await fetch('php/aplicar_logos.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    palestra_id: palestraId,
                    logo_ids: selecionadas
                })
            });

            const resultado = await resposta.json();
            if (resultado.sucesso) {
                alert('Logos aplicadas com sucesso!');
            } else {
                alert('Erro ao aplicar logos: ' + resultado.erro);
            }
        } catch (erro) {
            alert('Erro ao aplicar logos: ' + erro.message);
        }
    });
}

function renderizarLogosParaSelecao(logos, logosAtuais = []) {
    const container = document.getElementById('lista-selecao-logos');
    container.innerHTML = '';
    logos.forEach(logo => {
        const item = document.createElement('div');
        item.className = 'item-selecao-logo';
        item.innerHTML = `
            <div class="logo-checkbox">
                <input type="checkbox" value="${logo.id}" ${logosAtuais.includes(logo.id) ? 'checked' : ''}>
            </div>
            <label class="logo-label">
                <div class="logo-mini"><img src="upload/${logo.imagem}" alt="${logo.nome}"></div>
                ${logo.nome}
            </label>
        `;
        container.appendChild(item);
    });

}

async function carregarGaleriaLogos() {
    try {
        const resposta = await fetch('php/listar_logos.php');
        const dados = await resposta.json();

        const container = document.getElementById('galeria-logos');
        const contador = document.getElementById('total-logos');
        if (!container || !contador) return;

        container.innerHTML = '';
        dados.logos.forEach(logo => {
            const div = document.createElement('div');
            div.className = 'item-logo-galeria';

            const img = document.createElement('img');
            img.src = `upload/${logo.imagem}`;
            img.alt = logo.nome;

            const nome = document.createElement('span');
            nome.textContent = logo.nome;
            
            // Adicionar botão de exclusão
            const btnExcluir = document.createElement('button');
            btnExcluir.className = 'btn-excluir-logo';
            btnExcluir.innerHTML = '<i class="fas fa-trash"></i>';
            btnExcluir.title = 'Excluir logo';
            btnExcluir.dataset.id = logo.id;
            btnExcluir.dataset.nome = logo.nome;
            
            // Adicionar evento de clique para excluir
            btnExcluir.addEventListener('click', async (e) => {
                const logoId = e.currentTarget.dataset.id;
                const logoNome = e.currentTarget.dataset.nome;
                if (confirm(`Tem certeza que deseja excluir a logo ${logoNome}?`)) {
                    try {
                        const resposta = await fetch('php/excluir_logo.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ logo_id: logoId })
                        });
                        
                        const resultado = await resposta.json();
                        if (resultado.sucesso) {
                            alert('Logo excluída com sucesso!');
                            // Recarregar a lista de logos
                            carregarGaleriaLogos();
                            // Recarregar a seleção de logos se estiver em uma palestra ativa
                            const palestraId = sessionStorage.getItem('palestraAtivaId');
                            if (palestraId) {
                                carregarLogosParaPalestra(palestraId);
                            }
                        } else {
                            alert('Erro ao excluir logo: ' + resultado.mensagem);
                        }
                    } catch (erro) {
                        console.error('Erro ao excluir logo:', erro);
                        alert('Erro ao excluir logo: ' + erro.message);
                    }
                }
            });

            div.appendChild(img);
            div.appendChild(nome);
            div.appendChild(btnExcluir);
            container.appendChild(div);
        });

        contador.textContent = dados.logos.length;
    } catch (erro) {
        console.error('Erro ao carregar galeria:', erro);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('galeria-logos')) {
        carregarGaleriaLogos();
    }
});


