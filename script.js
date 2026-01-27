let despesas = [];
let historico = [];
let valeRecargas = [];
let valeCompras = [];
let valeHistorico = [];
let comprasFuturas = [];
let mesAtualData = new Date();

// Esperar Firebase carregar
setTimeout(inicializar, 1000);

function inicializar() {
    if (!window.db) {
        console.error('Firebase não carregado, tentando novamente...');
        setTimeout(inicializar, 1000);
        return;
    }
    
    carregarDados();
    setupListeners();
}

async function carregarDados() {
    try {
        const docRef = window.firestore.doc(window.db, 'dados', 'principal');
        const docSnap = await window.firestore.getDoc(docRef);
        
        if (docSnap.exists()) {
            const dados = docSnap.data();
            
            if (dados.mesAtualData) {
                mesAtualData = new Date(dados.mesAtualData);
            }
            
            if (dados.salario) {
                document.getElementById('salario').value = dados.salario;
            }
            if (dados.despesas) {
                despesas = dados.despesas;
                renderizarDespesas();
            }
            if (dados.historico) {
                historico = dados.historico;
                renderizarHistorico();
            }
            if (dados.valeRecargas) {
                valeRecargas = dados.valeRecargas;
            }
            if (dados.valeCompras) {
                valeCompras = dados.valeCompras;
                renderizarCompras();
            }
            if (dados.valeHistorico) {
                valeHistorico = dados.valeHistorico;
                renderizarValeHistorico();
            }
            if (dados.comprasFuturas) {
                comprasFuturas = dados.comprasFuturas;
                renderizarComprasFuturas();
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados do Firebase. Verifique a conexão.');
    }
    
    atualizarResumo();
    atualizarValeResumo();
    atualizarFuturasResumo();
    atualizarMesAtual();
    atualizarValeMesAtual();
}

function setupListeners() {
    const docRef = window.firestore.doc(window.db, 'dados', 'principal');
    window.firestore.onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const dados = doc.data();
            
            if (JSON.stringify(dados.despesas) !== JSON.stringify(despesas)) {
                despesas = dados.despesas || [];
                renderizarDespesas();
                atualizarResumo();
            }
            
            if (JSON.stringify(dados.valeCompras) !== JSON.stringify(valeCompras)) {
                valeCompras = dados.valeCompras || [];
                renderizarCompras();
                atualizarValeResumo();
            }
            
            if (JSON.stringify(dados.comprasFuturas) !== JSON.stringify(comprasFuturas)) {
                comprasFuturas = dados.comprasFuturas || [];
                renderizarComprasFuturas();
                atualizarFuturasResumo();
            }
            
            if (JSON.stringify(dados.historico) !== JSON.stringify(historico)) {
                historico = dados.historico || [];
                renderizarHistorico();
            }
            
            if (JSON.stringify(dados.valeHistorico) !== JSON.stringify(valeHistorico)) {
                valeHistorico = dados.valeHistorico || [];
                renderizarValeHistorico();
            }
            
            if (dados.mesAtualData) {
                const novaData = new Date(dados.mesAtualData);
                if (novaData.getTime() !== mesAtualData.getTime()) {
                    mesAtualData = novaData;
                    atualizarMesAtual();
                    atualizarValeMesAtual();
                }
            }
        }
    });
}

async function salvarDados() {
    try {
        const docRef = window.firestore.doc(window.db, 'dados', 'principal');
        await window.firestore.setDoc(docRef, {
            salario: document.getElementById('salario').value,
            despesas: despesas,
            historico: historico,
            valeRecargas: valeRecargas,
            valeCompras: valeCompras,
            valeHistorico: valeHistorico,
            comprasFuturas: comprasFuturas,
            mesAtualData: mesAtualData.toISOString(),
            ultimaAtualizacao: new Date().toISOString()
        });
        console.log('Dados salvos com sucesso! Mês atual:', mesAtualData);
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        alert('Erro ao salvar dados. Tente novamente.');
    }
}

function atualizarMesAtual() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesAtual = meses[mesAtualData.getMonth()];
    const anoAtual = mesAtualData.getFullYear();
    document.getElementById('mes-atual-nome').textContent = `${mesAtual} de ${anoAtual}`;
    console.log('Mês atualizado para:', mesAtual, anoAtual);
}

function atualizarValeMesAtual() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesAtual = meses[mesAtualData.getMonth()];
    const anoAtual = mesAtualData.getFullYear();
    document.getElementById('vale-mes-atual').textContent = `${mesAtual} de ${anoAtual}`;
}

function mudarAba(aba) {
    const abas = document.querySelectorAll('.aba-conteudo');
    const botoes = document.querySelectorAll('.tab-btn');
    
    abas.forEach(a => a.classList.remove('active'));
    botoes.forEach(b => b.classList.remove('active'));
    
    if (aba === 'despesas') {
        document.getElementById('aba-despesas').classList.add('active');
        botoes[0].classList.add('active');
    } else if (aba === 'vale') {
        document.getElementById('aba-vale').classList.add('active');
        botoes[1].classList.add('active');
    } else if (aba === 'futuras') {
        document.getElementById('aba-futuras').classList.add('active');
        botoes[2].classList.add('active');
    }
}

// FUNÇÕES DE NAVEGAÇÃO DE MÊS
function voltarMes() {
    console.log('Voltando mês...');
    mesAtualData = new Date(mesAtualData);
    mesAtualData.setMonth(mesAtualData.getMonth() - 1);
    atualizarMesAtual();
    atualizarValeMesAtual();
    salvarDados();
    console.log('Voltou para:', mesAtualData);
}

function avancarMes() {
    console.log('Avançando mês...');
    mesAtualData = new Date(mesAtualData);
    mesAtualData.setMonth(mesAtualData.getMonth() + 1);
    atualizarMesAtual();
    atualizarValeMesAtual();
    salvarDados();
    console.log('Avançou para:', mesAtualData);
}

function irParaMesAtual() {
    console.log('Indo para mês atual...');
    mesAtualData = new Date();
    atualizarMesAtual();
    atualizarValeMesAtual();
    salvarDados();
    alert('Voltou para o mês atual!');
}

document.getElementById('salario').addEventListener('input', function() {
    atualizarResumo();
    salvarDados();
});

function adicionarDespesa() {
    const nome = document.getElementById('nome-despesa').value.trim();
    const valor = parseFloat(document.getElementById('valor-despesa').value);
    const meses = parseInt(document.getElementById('meses-despesa').value) || 1;
    const fixa = document.getElementById('despesa-fixa').checked;

    if (!nome || isNaN(valor) || valor <= 0) {
        alert('Por favor, preencha o nome e o valor da despesa corretamente.');
        return;
    }

    despesas.push({ nome, valor, meses, fixa });
    
    document.getElementById('nome-despesa').value = '';
    document.getElementById('valor-despesa').value = '';
    document.getElementById('meses-despesa').value = '';
    document.getElementById('despesa-fixa').checked = false;

    renderizarDespesas();
    atualizarResumo();
    salvarDados();
}

function removerDespesa(index) {
    despesas.splice(index, 1);
    renderizarDespesas();
    atualizarResumo();
    salvarDados();
}

function renderizarDespesas() {
    const lista = document.getElementById('lista-despesas');
    
    if (despesas.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhuma despesa adicionada</p>';
        return;
    }

    lista.innerHTML = despesas.map((despesa, index) => {
        let infoExtra = '';
        
        if (despesa.fixa) {
            infoExtra = 'Despesa fixa - repete todos os meses';
        } else if (despesa.meses > 1) {
            infoExtra = `Faltam ${despesa.meses} parcela(s)`;
        } else if (despesa.meses === 1) {
            infoExtra = 'Última parcela';
        } else {
            infoExtra = 'Pagamento único';
        }
        
        return `
            <div class="despesa-item">
                <div class="despesa-info">
                    <div class="despesa-nome">
                        ${despesa.nome}
                        ${despesa.fixa ? '<span class="badge-fixa">FIXA</span>' : ''}
                    </div>
                    <div class="despesa-valor">R$ ${despesa.valor.toFixed(2)}</div>
                    <div class="despesa-info-extra">${infoExtra}</div>
                </div>
                <button class="btn-remover" onclick="removerDespesa(${index})">Remover</button>
            </div>
        `;
    }).join('');
}

function atualizarResumo() {
    const salario = parseFloat(document.getElementById('salario').value) || 0;
    const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0);
    const saldo = salario - totalDespesas;

    document.getElementById('resumo-salario').textContent = `R$ ${salario.toFixed(2)}`;
    document.getElementById('resumo-despesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;
    document.getElementById('resumo-saldo').textContent = `R$ ${saldo.toFixed(2)}`;
}

function fecharMes() {
    console.log('=== INICIANDO FECHAMENTO DO MÊS ===');
    console.log('Mês ANTES de fechar:', mesAtualData);
    
    const salario = parseFloat(document.getElementById('salario').value) || 0;
    
    if (salario === 0 && despesas.length === 0) {
        alert('Adicione pelo menos o salário ou alguma despesa antes de fechar o mês.');
        return;
    }

    const confirmar = confirm('Deseja fechar o mês atual e salvar no histórico? Os dados atuais serão zerados.');
    if (!confirmar) {
        console.log('Usuário cancelou');
        return;
    }

    const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0);
    const saldo = salario - totalDespesas;

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    console.log('Mês sendo salvo no histórico:', meses[mesAtualData.getMonth()], mesAtualData.getFullYear());
    
    const mesHistorico = {
        mes: `${meses[mesAtualData.getMonth()]} de ${mesAtualData.getFullYear()}`,
        data: mesAtualData.toISOString(),
        salario: salario,
        despesas: [...despesas],
        totalDespesas: totalDespesas,
        saldo: saldo
    };

    historico.unshift(mesHistorico);

    // Processar despesas para o próximo mês
    const despesasProximoMes = [];
    
    despesas.forEach(despesa => {
        if (despesa.fixa) {
            despesasProximoMes.push({ ...despesa });
        } else if (despesa.meses > 1) {
            despesasProximoMes.push({
                ...despesa,
                meses: despesa.meses - 1
            });
        }
    });

    despesas = despesasProximoMes;
    document.getElementById('salario').value = '';
    
    // AVANÇAR O MÊS
    console.log('Avançando mês...');
    const mesAntes = mesAtualData.getMonth();
    const anoAntes = mesAtualData.getFullYear();
    
    mesAtualData.setMonth(mesAtualData.getMonth() + 1);
    
    const mesDepois = mesAtualData.getMonth();
    const anoDepois = mesAtualData.getFullYear();
    
    console.log('Mês ANTES:', meses[mesAntes], anoAntes);
    console.log('Mês DEPOIS:', meses[mesDepois], anoDepois);
    console.log('mesAtualData após setMonth:', mesAtualData);
    
    atualizarMesAtual();
    atualizarValeMesAtual();
    renderizarDespesas();
    atualizarResumo();
    renderizarHistorico();
    
    console.log('Salvando dados no Firebase...');
    salvarDados();

    const mensagemFixas = despesasProximoMes.length > 0 
        ? `\n\n${despesasProximoMes.length} despesa(s) foram automaticamente transferidas para o próximo mês.`
        : '';

    alert('Mês fechado e salvo no histórico com sucesso!' + mensagemFixas);
    console.log('=== FECHAMENTO CONCLUÍDO ===');
}

function renderizarHistorico() {
    const lista = document.getElementById('historico-lista');
    
    if (historico.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhum mês fechado ainda</p>';
        return;
    }

    lista.innerHTML = historico.map((mes, index) => `
        <div class="historico-item">
            <div class="historico-header">
                <div class="historico-mes">${mes.mes}</div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-remover" style="background:#667eea;" onclick="reabrirHistorico(${index})">
                        🔄 Reabrir
                    </button>
                    <button class="btn-excluir-historico" onclick="excluirHistorico(${index})">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
            <div class="historico-resumo">
                <div class="historico-resumo-item">
                    <div class="historico-resumo-label">Salário</div>
                    <div class="historico-resumo-valor" style="color: #64ffda;">R$ ${mes.salario.toFixed(2)}</div>
                </div>
                <div class="historico-resumo-item">
                    <div class="historico-resumo-label">Despesas</div>
                    <div class="historico-resumo-valor" style="color: #ff6b6b;">R$ ${mes.totalDespesas.toFixed(2)}</div>
                </div>
                <div class="historico-resumo-item">
                    <div class="historico-resumo-label">Saldo</div>
                    <div class="historico-resumo-valor" style="color: ${mes.saldo >= 0 ? '#64ffda' : '#ff6b6b'};">R$ ${mes.saldo.toFixed(2)}</div>
                </div>
            </div>
            <div class="historico-despesas">
                <h4>Despesas do mês:</h4>
                ${mes.despesas.map(despesa => `
                    <div class="historico-despesa-item">
                        <span>${despesa.nome}</span>
                        <span style="color: #ff6b6b;">R$ ${despesa.valor.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function reabrirHistorico(index) {
    const mes = historico[index];

    const confirmar = confirm(
        `Reabrir ${mes.mes}? O mês atual em edição será substituído pelo conteúdo deste fechamento.`
    );
    if (!confirmar) return;

    document.getElementById('salario').value = mes.salario.toFixed(2);
    despesas = mes.despesas.map(d => ({ ...d }));

    // Extrair o mês e ano do histórico
    const partes = mes.mes.split(' de ');
    if (partes.length === 2) {
        const nomeMes = partes[0];
        const ano = parseInt(partes[1], 10);
        const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const idxMes = mesesNomes.indexOf(nomeMes);
        if (idxMes !== -1 && !isNaN(ano)) {
            mesAtualData = new Date(ano, idxMes, 1);
        }
    }

    // Remover do histórico
    historico.splice(index, 1);

    renderizarDespesas();
    atualizarResumo();
    renderizarHistorico();
    atualizarMesAtual();
    atualizarValeMesAtual();
    salvarDados();

    alert(`Mês ${mes.mes} reaberto para edição.`);
}

// NOVA FUNÇÃO: Excluir Histórico de Despesas
function excluirHistorico(index) {
    const mes = historico[index];
    
    const confirmar = confirm(
        `Tem certeza que deseja excluir permanentemente o histórico de ${mes.mes}? Esta ação não pode ser desfeita.`
    );
    
    if (!confirmar) return;
    
    historico.splice(index, 1);
    renderizarHistorico();
    salvarDados();
    
    alert(`Histórico de ${mes.mes} excluído com sucesso!`);
}

// FUNÇÕES VALE ALIMENTAÇÃO
function adicionarRecarga() {
    const valor = parseFloat(document.getElementById('vale-recarga').value);

    if (isNaN(valor) || valor <= 0) {
        alert('Por favor, insira um valor válido para a recarga.');
        return;
    }

    const data = new Date();
    valeRecargas.push({ 
        valor, 
        data: data.toISOString(),
        dataFormatada: data.toLocaleDateString('pt-BR')
    });
    
    document.getElementById('vale-recarga').value = '';
    atualizarValeResumo();
    salvarDados();
    alert('Recarga adicionada com sucesso!');
}

function adicionarCompra() {
    const nome = document.getElementById('nome-compra').value.trim();
    const valor = parseFloat(document.getElementById('valor-compra').value);
    const dataInput = document.getElementById('data-compra').value;

    if (!nome || isNaN(valor) || valor <= 0) {
        alert('Por favor, preencha o nome e o valor da compra corretamente.');
        return;
    }

    const data = dataInput ? new Date(dataInput + 'T12:00:00') : new Date();
    
    valeCompras.push({ 
        nome, 
        valor,
        data: data.toISOString(),
        dataFormatada: data.toLocaleDateString('pt-BR')
    });
    
    document.getElementById('nome-compra').value = '';
    document.getElementById('valor-compra').value = '';
    document.getElementById('data-compra').value = '';

    renderizarCompras();
    atualizarValeResumo();
    salvarDados();
}

function removerCompra(index) {
    valeCompras.splice(index, 1);
    renderizarCompras();
    atualizarValeResumo();
    salvarDados();
}

function renderizarCompras() {
    const lista = document.getElementById('lista-compras');
    
    if (valeCompras.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhuma compra adicionada</p>';
        return;
    }

    lista.innerHTML = valeCompras.map((compra, index) => `
        <div class="despesa-item">
            <div class="despesa-info">
                <div class="despesa-nome">${compra.nome}</div>
                <div class="despesa-valor">R$ ${compra.valor.toFixed(2)}</div>
                <div class="despesa-info-extra">${compra.dataFormatada}</div>
            </div>
            <button class="btn-remover" onclick="removerCompra(${index})">Remover</button>
        </div>
    `).join('');
}

function atualizarValeResumo() {
    const totalRecarga = valeRecargas.reduce((total, r) => total + r.valor, 0);
    const totalGasto = valeCompras.reduce((total, c) => total + c.valor, 0);
    const saldo = totalRecarga - totalGasto;

    document.getElementById('vale-total-recarga').textContent = `R$ ${totalRecarga.toFixed(2)}`;
    document.getElementById('vale-total-gasto').textContent = `R$ ${totalGasto.toFixed(2)}`;
    document.getElementById('vale-saldo').textContent = `R$ ${saldo.toFixed(2)}`;
}

function renderizarValeHistorico() {
    const lista = document.getElementById('vale-historico-lista');
    
    if (valeHistorico.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhum histórico ainda</p>';
        return;
    }

    lista.innerHTML = valeHistorico.map((mes, index) => `
        <div class="historico-item">
            <div class="historico-header">
                <div class="historico-mes">${mes.mes}</div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-remover" style="background:#667eea;" onclick="reabrirValeHistorico(${index})">
                        🔄 Reabrir
                    </button>
                    <button class="btn-excluir-historico" onclick="excluirValeHistorico(${index})">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
            <div class="historico-resumo">
                <div class="historico-resumo-item">
                    <div class="historico-resumo-label">Recarregado</div>
                    <div class="historico-resumo-valor" style="color: #64ffda;">R$ ${mes.totalRecarga.toFixed(2)}</div>
                </div>
                <div class="historico-resumo-item">
                    <div class="historico-resumo-label">Gasto</div>
                    <div class="historico-resumo-valor" style="color: #ff6b6b;">R$ ${mes.totalGasto.toFixed(2)}</div>
                </div>
                <div class="historico-resumo-item">
                    <div class="historico-resumo-label">Saldo</div>
                    <div class="historico-resumo-valor" style="color: ${mes.saldo >= 0 ? '#64ffda' : '#ff6b6b'};">R$ ${mes.saldo.toFixed(2)}</div>
                </div>
            </div>
            <div class="historico-despesas">
                <h4>Compras do mês:</h4>
                ${mes.compras.map(compra => `
                    <div class="historico-despesa-item">
                        <span>${compra.nome} - ${compra.dataFormatada}</span>
                        <span style="color: #ff6b6b;">R$ ${compra.valor.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function reabrirValeHistorico(index) {
    const mes = valeHistorico[index];

    const confirmar = confirm(
        `Reabrir ${mes.mes} do vale alimentação? O mês atual em edição será substituído pelo conteúdo deste fechamento.`
    );
    if (!confirmar) return;

    valeRecargas = [];
    valeCompras = mes.compras.map(c => ({ ...c }));

    // Extrair o mês e ano do histórico
    const partes = mes.mes.split(' de ');
    if (partes.length === 2) {
        const nomeMes = partes[0];
        const ano = parseInt(partes[1], 10);
        const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const idxMes = mesesNomes.indexOf(nomeMes);
        if (idxMes !== -1 && !isNaN(ano)) {
            mesAtualData = new Date(ano, idxMes, 1);
        }
    }

    // Remover do histórico
    valeHistorico.splice(index, 1);

    renderizarCompras();
    atualizarValeResumo();
    renderizarValeHistorico();
    atualizarMesAtual();
    atualizarValeMesAtual();
    salvarDados();

    alert(`Mês do vale ${mes.mes} reaberto para edição.`);
}

// NOVA FUNÇÃO: Excluir Histórico do Vale
function excluirValeHistorico(index) {
    const mes = valeHistorico[index];
    
    const confirmar = confirm(
        `Tem certeza que deseja excluir permanentemente o histórico de ${mes.mes} do vale alimentação? Esta ação não pode ser desfeita.`
    );
    
    if (!confirmar) return;
    
    valeHistorico.splice(index, 1);
    renderizarValeHistorico();
    salvarDados();
    
    alert(`Histórico de vale alimentação de ${mes.mes} excluído com sucesso!`);
}

function fecharMesVale() {
    const totalRecarga = valeRecargas.reduce((total, r) => total + r.valor, 0);
    const totalGasto = valeCompras.reduce((total, c) => total + c.valor, 0);
    
    if (totalRecarga === 0 && valeCompras.length === 0) {
        alert('Adicione pelo menos uma recarga ou compra antes de fechar o mês.');
        return;
    }

    const confirmar = confirm('Deseja fechar o mês do vale alimentação e salvar no histórico? Os dados atuais serão zerados.');
    if (!confirmar) return;

    const saldo = totalRecarga - totalGasto;

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const mesHistorico = {
        mes: `${meses[mesAtualData.getMonth()]} de ${mesAtualData.getFullYear()}`,
        data: mesAtualData.toISOString(),
        totalRecarga: totalRecarga,
        totalGasto: totalGasto,
        saldo: saldo,
        compras: [...valeCompras]
    };

    valeHistorico.unshift(mesHistorico);

    valeRecargas = [];
    valeCompras = [];
    document.getElementById('vale-recarga').value = '';
    
    // AVANÇAR O MÊS
    mesAtualData.setMonth(mesAtualData.getMonth() + 1);
    console.log('Novo mês (vale):', mesAtualData);
    
    atualizarMesAtual();
    atualizarValeMesAtual();
    renderizarCompras();
    atualizarValeResumo();
    renderizarValeHistorico();
    salvarDados();

    alert('Mês do vale alimentação fechado e salvo no histórico com sucesso!');
}

// FUNÇÕES COMPRAS FUTURAS
function adicionarCompraFutura() {
    const nome = document.getElementById('nome-futura').value.trim();
    const valor = parseFloat(document.getElementById('valor-futura').value);
    const dataInput = document.getElementById('data-futura').value;
    const prioridade = document.getElementById('prioridade-futura').value;

    if (!nome || isNaN(valor) || valor <= 0 || !dataInput) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const data = new Date(dataInput + 'T12:00:00');
    
    comprasFuturas.push({ 
        nome, 
        valor,
        prioridade,
        data: data.toISOString(),
        dataFormatada: data.toLocaleDateString('pt-BR')
    });
    
    comprasFuturas.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    document.getElementById('nome-futura').value = '';
    document.getElementById('valor-futura').value = '';
    document.getElementById('data-futura').value = '';
    document.getElementById('prioridade-futura').value = 'baixa';

    renderizarComprasFuturas();
    atualizarFuturasResumo();
    salvarDados();
}

function removerCompraFutura(index) {
    comprasFuturas.splice(index, 1);
    renderizarComprasFuturas();
    atualizarFuturasResumo();
    salvarDados();
}

function renderizarComprasFuturas() {
    const lista = document.getElementById('lista-futuras');
    
    if (comprasFuturas.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhuma compra futura planejada</p>';
        return;
    }

    lista.innerHTML = comprasFuturas.map((compra, index) => {
        const prioridadeClass = `prioridade-${compra.prioridade}`;
        const prioridadeTexto = compra.prioridade.charAt(0).toUpperCase() + compra.prioridade.slice(1);
        
        return `
            <div class="despesa-item">
                <div class="despesa-info">
                    <div class="despesa-nome">
                        ${compra.nome}
                        <span class="prioridade-badge ${prioridadeClass}">${prioridadeTexto}</span>
                    </div>
                    <div class="despesa-valor">R$ ${compra.valor.toFixed(2)}</div>
                    <div class="despesa-info-extra">📅 ${compra.dataFormatada}</div>
                </div>
                <button class="btn-remover" onclick="removerCompraFutura(${index})">Remover</button>
            </div>
        `;
    }).join('');
}

function atualizarFuturasResumo() {
    const total = comprasFuturas.reduce((sum, c) => sum + c.valor, 0);
    document.getElementById('total-futuras').textContent = `R$ ${total.toFixed(2)}`;
}
