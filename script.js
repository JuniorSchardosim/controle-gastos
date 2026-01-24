let despesas = [];
let historico = [];
let valeRecargas = [];
let valeCompras = [];
let valeHistorico = [];

function carregarDados() {
    const salarioSalvo = localStorage.getItem('salario');
    const despesasSalvas = localStorage.getItem('despesas');
    const historicoSalvo = localStorage.getItem('historico');
    const valeRecargasSalvas = localStorage.getItem('valeRecargas');
    const valeComprasSalvas = localStorage.getItem('valeCompras');
    const valeHistoricoSalvo = localStorage.getItem('valeHistorico');

    if (salarioSalvo) {
        document.getElementById('salario').value = salarioSalvo;
    }

    if (despesasSalvas) {
        despesas = JSON.parse(despesasSalvas);
        renderizarDespesas();
    }

    if (historicoSalvo) {
        historico = JSON.parse(historicoSalvo);
        renderizarHistorico();
    }

    if (valeRecargasSalvas) {
        valeRecargas = JSON.parse(valeRecargasSalvas);
    }

    if (valeComprasSalvas) {
        valeCompras = JSON.parse(valeComprasSalvas);
        renderizarCompras();
    }

    if (valeHistoricoSalvo) {
        valeHistorico = JSON.parse(valeHistoricoSalvo);
        renderizarValeHistorico();
    }

    atualizarResumo();
    atualizarValeResumo();
    atualizarMesAtual();
    atualizarValeMesAtual();
}

function salvarDados() {
    localStorage.setItem('salario', document.getElementById('salario').value);
    localStorage.setItem('despesas', JSON.stringify(despesas));
    localStorage.setItem('historico', JSON.stringify(historico));
    localStorage.setItem('valeRecargas', JSON.stringify(valeRecargas));
    localStorage.setItem('valeCompras', JSON.stringify(valeCompras));
    localStorage.setItem('valeHistorico', JSON.stringify(valeHistorico));
}

function atualizarMesAtual() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const data = new Date();
    const mesAtual = meses[data.getMonth()];
    const anoAtual = data.getFullYear();
    document.getElementById('mes-atual-nome').textContent = `${mesAtual} de ${anoAtual}`;
}

function atualizarValeMesAtual() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const data = new Date();
    const mesAtual = meses[data.getMonth()];
    const anoAtual = data.getFullYear();
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
    } else {
        document.getElementById('aba-vale').classList.add('active');
        botoes[1].classList.add('active');
    }
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

    lista.innerHTML = despesas.map((despesa, index) => `
        <div class="despesa-item">
            <div class="despesa-info">
                <div class="despesa-nome">
                    ${despesa.nome}
                    ${despesa.fixa ? '<span class="badge-fixa">FIXA</span>' : ''}
                </div>
                <div class="despesa-valor">R$ ${despesa.valor.toFixed(2)}</div>
                <div class="despesa-info-extra">
                    ${despesa.meses > 1 ? `Parcelado em ${despesa.meses}x` : 'Pagamento único'}
                </div>
            </div>
            <button class="btn-remover" onclick="removerDespesa(${index})">Remover</button>
        </div>
    `).join('');
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

    const data = new Date();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const mesHistorico = {
        mes: `${meses[data.getMonth()]} de ${data.getFullYear()}`,
        data: data.toISOString(),
        salario: salario,
        despesas: [...despesas],
        totalDespesas: totalDespesas,
        saldo: saldo
    };

    historico.unshift(mesHistorico);

    despesas = [];
    document.getElementById('salario').value = '';
    renderizarDespesas();
    atualizarResumo();
    renderizarHistorico();
    salvarDados();

    alert('Mês fechado e salvo no histórico com sucesso!');
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
                <button class="btn-excluir-historico" onclick="excluirHistorico(${index})">Excluir</button>
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

function excluirHistorico(index) {
    const confirmar = confirm('Deseja realmente excluir este mês do histórico?');
    if (!confirmar) return;

    historico.splice(index, 1);
    renderizarHistorico();
    salvarDados();
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
                <button class="btn-excluir-historico" onclick="excluirValeHistorico(${index})">Excluir</button>
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

function excluirValeHistorico(index) {
    const confirmar = confirm('Deseja realmente excluir este mês do histórico?');
    if (!confirmar) return;

    valeHistorico.splice(index, 1);
    renderizarValeHistorico();
    salvarDados();
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

    const data = new Date();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const mesHistorico = {
        mes: `${meses[data.getMonth()]} de ${data.getFullYear()}`,
        data: data.toISOString(),
        totalRecarga: totalRecarga,
        totalGasto: totalGasto,
        saldo: saldo,
        compras: [...valeCompras]
    };

    valeHistorico.unshift(mesHistorico);

    valeRecargas = [];
    valeCompras = [];
    document.getElementById('vale-recarga').value = '';
    renderizarCompras();
    atualizarValeResumo();
    renderizarValeHistorico();
    salvarDados();

    alert('Mês do vale alimentação fechado e salvo no histórico com sucesso!');
}

carregarDados();