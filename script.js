let despesas = [];
let historico = [];
let valeRecargas = [];
let valeCompras = [];
let valeHistorico = [];
let comprasFuturas = [];
let mesAtualData = new Date(); // Data para Despesas Mensais
let valeMesAtualData = new Date(); // Data para Vale Alimentação

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
            if (dados.valeMesAtualData) {
                valeMesAtualData = new Date(dados.valeMesAtualData);
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
                }
            }

            if (dados.valeMesAtualData) {
                const novaDataVale = new Date(dados.valeMesAtualData);
                if (novaDataVale.getTime() !== valeMesAtualData.getTime()) {
                    valeMesAtualData = novaDataVale;
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
            valeMesAtualData: valeMesAtualData.toISOString(),
            ultimaAtualizacao: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

function atualizarMesAtual() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesAtual = meses[mesAtualData.getMonth()];
    const anoAtual = mesAtualData.getFullYear();
    document.getElementById('mes-atual-nome').textContent = `${mesAtual} de ${anoAtual}`;
}

function atualizarValeMesAtual() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesAtual = meses[valeMesAtualData.getMonth()];
    const anoAtual = valeMesAtualData.getFullYear();
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

// NAVEGAÇÃO DESPESAS
function voltarMes() {
    mesAtualData = new Date(mesAtualData);
    mesAtualData.setMonth(mesAtualData.getMonth() - 1);
    atualizarMesAtual();
    salvarDados();
}

function avancarMes() {
    mesAtualData = new Date(mesAtualData);
    mesAtualData.setMonth(mesAtualData.getMonth() + 1);
    atualizarMesAtual();
    salvarDados();
}

// NAVEGAÇÃO VALE
function voltarMesVale() {
    valeMesAtualData = new Date(valeMesAtualData);
    valeMesAtualData.setMonth(valeMesAtualData.getMonth() - 1);
    atualizarValeMesAtual();
    salvarDados();
}

function avancarMesVale() {
    valeMesAtualData = new Date(valeMesAtualData);
    valeMesAtualData.setMonth(valeMesAtualData.getMonth() + 1);
    atualizarValeMesAtual();
    salvarDados();
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
        if (despesa.fixa) infoExtra = 'Despesa fixa - repete todos os meses';
        else if (despesa.meses > 1) infoExtra = `Faltam ${despesa.meses} parcela(s)`;
        else if (despesa.meses === 1) infoExtra = 'Unica parcela';
        else infoExtra = 'Pagamento único';
        
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
    const salario = parseFloat(document.getElementById('salario').value) || 0;
    if (salario === 0 && despesas.length === 0) {
        alert('Adicione pelo menos o salário ou alguma despesa antes de fechar o mês.');
        return;
    }

    const confirmar = confirm('Deseja fechar o mês atual e salvar no histórico? Os dados atuais serão zerados.');
    if (!confirmar) return;

    const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0);
    const saldo = salario - totalDespesas;
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const mesHistorico = {
        mes: `${meses[mesAtualData.getMonth()]} de ${mesAtualData.getFullYear()}`,
        data: mesAtualData.toISOString(),
        salario: salario,
        despesas: [...despesas],
        totalDespesas: totalDespesas,
        saldo: saldo
    };

    historico.unshift(mesHistorico);

    const despesasProximoMes = [];
    despesas.forEach(despesa => {
        if (despesa.fixa) despesasProximoMes.push({ ...despesa });
        else if (despesa.meses > 1) despesasProximoMes.push({ ...despesa, meses: despesa.meses - 1 });
    });

    despesas = despesasProximoMes;
    document.getElementById('salario').value = '';
    
    mesAtualData.setMonth(mesAtualData.getMonth() + 1);
    
    atualizarMesAtual();
    renderizarDespesas();
    atualizarResumo();
    renderizarHistorico();
    salvarDados();

    alert('Mês de despesas fechado com sucesso!');
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
                    <button class="btn-remover" style="background:#667eea;" onclick="reabrirHistorico(${index})">🔄 Reabrir</button>
                    <button class="btn-remover" onclick="excluirHistorico(${index})">🗑️ Excluir</button>
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
    const confirmar = confirm(`Reabrir ${mes.mes}? O mês atual em edição será substituído.`);
    if (!confirmar) return;

    document.getElementById('salario').value = mes.salario.toFixed(2);
    despesas = mes.despesas.map(d => ({ ...d }));

    const partes = mes.mes.split(' de ');
    if (partes.length === 2) {
        const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const idxMes = mesesNomes.indexOf(partes[0]);
        if (idxMes !== -1) mesAtualData = new Date(parseInt(partes[1]), idxMes, 1);
    }

    historico.splice(index, 1);
    renderizarDespesas();
    atualizarResumo();
    renderizarHistorico();
    atualizarMesAtual();
    salvarDados();
}

function excluirHistorico(index) {
    if (confirm('Excluir permanentemente este histórico?')) {
        historico.splice(index, 1);
        renderizarHistorico();
        salvarDados();
    }
}

// VALE ALIMENTAÇÃO
function adicionarRecarga() {
    const valor = parseFloat(document.getElementById('vale-recarga').value);
    if (isNaN(valor) || valor <= 0) return;

    valeRecargas.push({ valor, data: new Date().toISOString(), dataFormatada: new Date().toLocaleDateString('pt-BR') });
    document.getElementById('vale-recarga').value = '';
    atualizarValeResumo();
    salvarDados();
}

function adicionarCompra() {
    const nome = document.getElementById('nome-compra').value.trim();
    const valor = parseFloat(document.getElementById('valor-compra').value);
    const dataInput = document.getElementById('data-compra').value;

    if (!nome || isNaN(valor) || valor <= 0) return;

    const data = dataInput ? new Date(dataInput + 'T12:00:00') : new Date();
    valeCompras.push({ nome, valor, data: data.toISOString(), dataFormatada: data.toLocaleDateString('pt-BR') });
    
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
    document.getElementById('vale-total-recarga').textContent = `R$ ${totalRecarga.toFixed(2)}`;
    document.getElementById('vale-total-gasto').textContent = `R$ ${totalGasto.toFixed(2)}`;
    document.getElementById('vale-saldo').textContent = `R$ ${(totalRecarga - totalGasto).toFixed(2)}`;
}

function fecharMesVale() {
    const totalRecarga = valeRecargas.reduce((total, r) => total + r.valor, 0);
    const totalGasto = valeCompras.reduce((total, c) => total + c.valor, 0);
    
    if (totalRecarga === 0 && valeCompras.length === 0) {
        alert('Adicione dados antes de fechar o mês do vale.');
        return;
    }

    if (!confirm('Fechar o mês do vale alimentação?')) return;

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    valeHistorico.unshift({
        mes: `${meses[valeMesAtualData.getMonth()]} de ${valeMesAtualData.getFullYear()}`,
        data: valeMesAtualData.toISOString(),
        totalRecarga, totalGasto, saldo: totalRecarga - totalGasto,
        compras: [...valeCompras]
    });

    valeRecargas = [];
    valeCompras = [];
    valeMesAtualData.setMonth(valeMesAtualData.getMonth() + 1);
    
    atualizarValeMesAtual();
    renderizarCompras();
    atualizarValeResumo();
    renderizarValeHistorico();
    salvarDados();
    alert('Mês do vale fechado com sucesso!');
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
                    <button class="btn-remover" style="background:#667eea;" onclick="reabrirValeHistorico(${index})">🔄 Reabrir</button>
                    <button class="btn-remover" onclick="excluirValeHistorico(${index})">🗑️ Excluir</button>
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
                <h4>Compras:</h4>
                ${mes.compras.map(c => `<div class="historico-despesa-item"><span>${c.nome}</span><span style="color: #ff6b6b;">R$ ${c.valor.toFixed(2)}</span></div>`).join('')}
            </div>
        </div>
    `).join('');
}

function reabrirValeHistorico(index) {
    const mes = valeHistorico[index];
    if (!confirm(`Reabrir vale de ${mes.mes}?`)) return;

    valeRecargas = [];
    valeCompras = mes.compras.map(c => ({ ...c }));

    const partes = mes.mes.split(' de ');
    if (partes.length === 2) {
        const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const idxMes = mesesNomes.indexOf(partes[0]);
        if (idxMes !== -1) valeMesAtualData = new Date(parseInt(partes[1]), idxMes, 1);
    }

    valeHistorico.splice(index, 1);
    renderizarCompras();
    atualizarValeResumo();
    renderizarValeHistorico();
    atualizarValeMesAtual();
    salvarDados();
}

function excluirValeHistorico(index) {
    if (confirm('Excluir este histórico de vale?')) {
        valeHistorico.splice(index, 1);
        renderizarValeHistorico();
        salvarDados();
    }
}

// COMPRAS FUTURAS
function adicionarCompraFutura() {
    const nome = document.getElementById('nome-futura').value.trim();
    const valor = parseFloat(document.getElementById('valor-futura').value);
    const dataInput = document.getElementById('data-futura').value;
    const prioridade = document.getElementById('prioridade-futura').value;

    if (!nome || isNaN(valor) || !dataInput) return;

    const data = new Date(dataInput + 'T12:00:00');
    comprasFuturas.push({ nome, valor, prioridade, data: data.toISOString(), dataFormatada: data.toLocaleDateString('pt-BR') });
    comprasFuturas.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    document.getElementById('nome-futura').value = '';
    document.getElementById('valor-futura').value = '';
    document.getElementById('data-futura').value = '';
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

    lista.innerHTML = comprasFuturas.map((c, index) => `
        <div class="despesa-item">
            <div class="despesa-info">
                <div class="despesa-nome">${c.nome} <span class="prioridade-badge prioridade-${c.prioridade}">${c.prioridade}</span></div>
                <div class="despesa-valor">R$ ${c.valor.toFixed(2)}</div>
                <div class="despesa-info-extra">📅 ${c.dataFormatada}</div>
            </div>
            <button class="btn-remover" onclick="removerCompraFutura(${index})">Remover</button>
        </div>
    `).join('');
}

function atualizarFuturasResumo() {
    const total = comprasFuturas.reduce((sum, c) => sum + c.valor, 0);
    document.getElementById('total-futuras').textContent = `R$ ${total.toFixed(2)}`;
}

