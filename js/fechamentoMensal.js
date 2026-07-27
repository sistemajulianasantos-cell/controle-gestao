// ─── FECHAMENTO MENSAL ───────────────────────────────────────────────────────
// Relatório consolidado por mês, em regime de COMPETÊNCIA (data do evento/
// lançamento, não data de pagamento) — reúne numa tela só o que hoje está
// espalhado em Financeiro, Fechamentos, Despesas e Quebras. Feito pra ser
// impresso e anexado na pasta física do evento/mês, então todo valor que
// existir tem que aparecer em algum lugar (nada some silenciosamente por
// falta de data).
//
// Estrutura (ver memória fechamento_mensal_module para o histórico completo):
//  - Receitas                     = Receita de Contratos (D.financeiro sem isFechamento,
//                                    mês do EVENTO — f.data, não vencimento da parcela;
//                                    ver comentário em rFechamentoMensal)
//                                    + Receita de Fechamentos (D.fechamentos, com
//                                    sub-itens Quebras cobradas do cliente/Insumos/
//                                    Serviços adicionais) → Total Receitas
//  - Inadimplência                = parcelas/fechamentos vencidos DENTRO do mês, ainda não pagos
//  - Despesas                     = D.despesas, por categoria (D.categoriasDespesas) → Total Despesas
//  - Quebras (perda registrada)   = D.quebras — prejuízo real, NÃO cobrado de
//                                    ninguém, portanto NÃO entra em Receitas nem
//                                    Despesas (fica só informativa); é diferente
//                                    das "Quebras" dentro do Fechamento (essas
//                                    são cobradas do cliente, contam como Receita)
//  - Resultado do Mês             = Total Receitas − Total Despesas − Quebras (perda registrada)
//  - Analítico                    = Sintético + quebra por Cliente (Contrato e
//                                    Fechamento), com conferência: soma de todos
//                                    os clientes tem que bater com Total Receitas
//  - Aba Produtos                 = análise de consumo/quebra por produto (D.festas + D.quebras),
//                                    com gráficos (Chart.js) — não é financeiro, é operacional

let _fmViewMode = 'sintetico';
let _fmChartInstances = [];
let _fmDetailSeq = 0;

function initFechamentoMensal() {
  var hoje = new Date();
  var mesEl = document.getElementById('fm-mes');
  var anoEl = document.getElementById('fm-ano');
  if (mesEl && !mesEl.value) mesEl.value = String(hoje.getMonth() + 1).padStart(2, '0');
  if (anoEl && !anoEl.value) anoEl.value = String(hoje.getFullYear());
  rFechamentoMensal();
}

function fmSetView(v) {
  _fmViewMode = v;
  var btns = { sintetico: 'fm-tab-sint', analitico: 'fm-tab-anal', produtos: 'fm-tab-prod' };
  Object.keys(btns).forEach(function(k) {
    var el = document.getElementById(btns[k]);
    if (el) el.classList.toggle('active', k === v);
  });
  rFechamentoMensal();
}

function _fmAnoMes() {
  var mes = document.getElementById('fm-mes')?.value || String(new Date().getMonth() + 1).padStart(2, '0');
  var ano = document.getElementById('fm-ano')?.value || String(new Date().getFullYear());
  return ano + '-' + mes;
}

// Compara ano-mês tolerando formatos diferentes (mês sem zero à esquerda,
// data com hora embutida etc.) — não confia em .startsWith() puro, porque
// lançamentos antigos/importados nem sempre têm a data no mesmo formato
// exato que os campos <input type="date"> geram.
function _fmDataNoMes(dataStr, anoMes) {
  if (!dataStr) return false;
  var partes = String(dataStr).split(/[-T/]/);
  if (partes.length < 2) return false;
  var ano = partes[0].trim();
  var mes = partes[1].trim().padStart(2, '0');
  if (ano.length !== 4) return false; // formato inesperado (ex: DD/MM/AAAA) — não arrisca interpretar errado
  return (ano + '-' + mes) === anoMes;
}

// Data usada só pra decidir ATRASO (Inadimplência) de um fechamento — aqui sim
// o vencimento do acerto manda, porque é isso que define se está em atraso.
function _fmVencimentoFechamento(fch) {
  return fch.vencimento || fch.dataEvento || '';
}

function _fmFechamentoPago(fch) {
  if (fch.financeiroId) {
    var fin = (D.financeiro || []).find(function(x) { return x.id === fch.financeiroId; });
    if (fin) return fin.status === 'pago';
  }
  return fch.status === 'pago';
}

// Classifica um item de fechamento em produto / quebras (cobrada do cliente,
// diferente de D.quebras que é perda) / extra — reaproveita _fchNormTipo
// (fechamento.js) pra não duplicar a lista de tipos antigos x novos.
function _fmClassificarItem(tipo) {
  var norm = (typeof _fchNormTipo === 'function') ? _fchNormTipo(tipo) : (tipo || 'produto');
  if (norm === 'produto') return 'produto';
  if (norm === 'peca') return 'quebras';
  return 'extra';
}

// ── Helpers de renderização (compartilhados entre Sintético/Analítico/Produtos) ──
function _fmCardResumo(titulo, valor, cor, sub) {
  return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;flex:1;min-width:180px">' +
    '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">' + titulo + '</div>' +
    '<div style="font-size:22px;font-weight:800;font-family:var(--mono);color:' + cor + '">' + fR(valor) + '</div>' +
    (sub ? '<div style="font-size:11px;color:var(--text3);margin-top:4px">' + sub + '</div>' : '') +
  '</div>';
}

function _fmBlocoBreakdown(titulo, obj, cor) {
  var entradas = Object.entries(obj).filter(function(e) { return e[1] !== 0; }).sort(function(a, b) { return b[1] - a[1]; });
  if (!entradas.length) return '<div class="sec" style="margin-bottom:14px"><div class="sec-head"><span class="sec-title">' + titulo + '</span></div><div style="padding:14px 16px;color:var(--text3);font-size:12px">Nada registrado neste mês.</div></div>';
  var total = entradas.reduce(function(s, e) { return s + e[1]; }, 0);
  return '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">' + titulo + '</span></div>' +
    '<div style="padding:10px 16px">' +
    entradas.map(function(e) {
      var pct = total > 0 ? Math.round(e[1] / total * 100) : 0;
      return '<div style="margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">' +
          '<span style="color:var(--text)">' + e[0] + '</span>' +
          '<span style="font-family:var(--mono);color:var(--text3)">' + fR(e[1]) + ' · ' + pct + '%</span>' +
        '</div>' +
        '<div style="height:4px;background:var(--bg3);border-radius:2px"><div style="width:' + pct + '%;height:4px;background:' + cor + ';border-radius:2px"></div></div>' +
      '</div>';
    }).join('') +
    '</div></div>';
}

// Uma linha de valor dentro de uma seção Receitas/Despesas — `indent` marca os
// sub-itens (ex: Quebras/Insumos/Serviços dentro de Receita de Fechamentos).
function _fmLinhaResumo(label, valor, sub, indent) {
  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0' + (indent ? ' 0 16px' : '') + ';border-bottom:1px solid var(--border);font-size:' + (indent ? '11px' : '12px') + '">' +
    '<span style="color:' + (indent ? 'var(--text3)' : 'var(--text)') + '">' + label + '</span>' +
    '<span style="display:flex;gap:8px;align-items:center">' +
      (sub ? '<span style="color:var(--text3);font-size:11px">' + sub + '</span>' : '') +
      '<span style="font-family:var(--mono);font-weight:700">' + fR(valor) + '</span>' +
    '</span></div>';
}

function _fmLinhaTotal(label, valor, cor) {
  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;font-size:13px;font-weight:800">' +
    '<span>' + label + '</span><span style="font-family:var(--mono);color:' + cor + '">' + fR(valor) + '</span>' +
  '</div>';
}

function _fmToggleRow(id) {
  var det = document.getElementById(id);
  var icon = document.getElementById(id + '-ic');
  if (!det) return;
  var open = det.style.display !== 'none';
  det.style.display = open ? 'none' : 'block';
  if (icon) icon.textContent = open ? '▸' : '▾';
}

// Lista compacta de itens dentro de uma linha expandida (contratos de uma
// categoria de receita, lançamentos de uma categoria de despesa etc.).
function _fmDetailLista(itens) {
  if (!itens.length) return '<div style="padding:6px 0 10px 20px;color:var(--text3);font-size:11px">Nenhum item.</div>';
  return '<div style="padding:2px 0 8px 20px">' +
    itens.map(function(it) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px dashed var(--border);font-size:11px">' +
        '<span style="color:var(--text2)">' + it.label + (it.sub ? ' <span style="color:var(--text3)">— ' + it.sub + '</span>' : '') + '</span>' +
        '<span style="display:flex;gap:6px;align-items:center">' + (it.tag || '') + '<span style="font-family:var(--mono)">' + fR(it.valor) + '</span></span>' +
      '</div>';
    }).join('') +
  '</div>';
}

// Igual _fmLinhaResumo, mas clicável — expande uma lista de itens abaixo
// (ex: "Receita de Contratos" → cada contrato/parcela que compõe o total).
function _fmLinhaExpansivel(label, valor, sub, itens) {
  var id = 'fm-det-' + (_fmDetailSeq++);
  return '<div onclick="_fmToggleRow(\'' + id + '\')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px">' +
    '<span style="color:var(--text);display:flex;align-items:center;gap:6px">' +
      '<span id="' + id + '-ic" style="font-size:9px;color:var(--text3);display:inline-block;width:8px">▸</span>' + label +
    '</span>' +
    '<span style="display:flex;gap:8px;align-items:center">' +
      (sub ? '<span style="color:var(--text3);font-size:11px">' + sub + '</span>' : '') +
      '<span style="font-family:var(--mono);font-weight:700">' + fR(valor) + '</span>' +
    '</span></div>' +
    '<div id="' + id + '" style="display:none">' + _fmDetailLista(itens) + '</div>';
}

function _fmTagStatus(pago) {
  return pago ? '<span class="tag tag-green">Recebido</span>' : '<span class="tag tag-yellow">Pendente</span>';
}

// Seção "Receitas" hierárquica: Receita de Contratos + Receita de Fechamentos
// (com sub-itens Quebras cobradas/Insumos/Serviços adicionais) + Total Receitas.
function _fmSecReceitas(receitaContrato, recebidoContrato, pendenteContrato, clientesContrato, fechamentoTotal, fechamentoRecebido, fechamentoPendente, fechamentosDoMes, fechamentoPorTipo, receitaTotal) {
  // Um item por cliente com o valor TOTAL do contrato (20%+80% somados) — ela
  // pediu explicitamente pra não quebrar em Sinal/Restante aqui, só nome e total.
  var itensContrato = Object.values(clientesContrato).filter(function(c) { return c.valor > 0.01; }).map(function(c) {
    var tag = c.pendente <= 0.01
      ? '<span class="tag tag-green">Recebido</span>'
      : c.recebido > 0.01
        ? '<span class="tag tag-yellow">Parcial — falta ' + fR(c.pendente) + '</span>'
        : '<span class="tag tag-yellow">Pendente</span>';
    return { label: c.nome, valor: c.valor, tag: tag };
  }).sort(function(a, b) { return b.valor - a.valor; });

  var itensFechamento = fechamentosDoMes.filter(function(fch) { return (fch.totalExtras || 0) > 0.01; }).map(function(fch) {
    return { label: fch.eventoNome || fch.clienteNome || 'Sem nome', sub: fd(fch.dataEvento || fch.vencimento), valor: fch.totalExtras || 0, tag: _fmTagStatus(_fmFechamentoPago(fch)) };
  }).sort(function(a, b) { return b.valor - a.valor; });

  return '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">💰 Receitas</span></div>' +
    '<div style="padding:2px 16px">' +
      _fmLinhaExpansivel('Receita de Contratos', receitaContrato, 'recebido ' + fR(recebidoContrato) + ' · pendente ' + fR(pendenteContrato), itensContrato) +
      _fmLinhaExpansivel('Receita de Fechamentos', fechamentoTotal, 'recebido ' + fR(fechamentoRecebido) + ' · pendente ' + fR(fechamentoPendente), itensFechamento) +
      _fmLinhaResumo('Quebras (cobradas do cliente)', fechamentoPorTipo.quebras, '', true) +
      _fmLinhaResumo('Insumos', fechamentoPorTipo.produto, '', true) +
      _fmLinhaResumo('Serviços adicionais', fechamentoPorTipo.extra, '', true) +
      _fmLinhaTotal('Total Receitas', receitaTotal, 'var(--green)') +
    '</div></div>';
}

// Seção "Despesas" por categoria + Total Despesas. Cada categoria expande
// pra mostrar os lançamentos individuais que compõem o valor.
function _fmSecDespesas(despesaPorCategoria, despesaItensPorCategoria, despesaTotal) {
  var entradas = Object.entries(despesaPorCategoria).filter(function(e) { return e[1] !== 0; }).sort(function(a, b) { return b[1] - a[1]; });
  return '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">💸 Despesas</span></div>' +
    '<div style="padding:2px 16px">' +
      (entradas.length ? entradas.map(function(e) {
        var itens = (despesaItensPorCategoria[e[0]] || []).map(function(d) {
          return { label: d.descricao || d.fornecedor || 'Despesa', sub: fd(d.data || d.dataVencimento), valor: d.valor || 0 };
        }).sort(function(a, b) { return b.valor - a.valor; });
        return _fmLinhaExpansivel(e[0], e[1], '', itens);
      }).join('') : '<div style="padding:10px 0;color:var(--text3);font-size:12px">Nada registrado neste mês.</div>') +
      _fmLinhaTotal('Total Despesas', despesaTotal, 'var(--red)') +
    '</div></div>';
}

// Analítico: soma de todos os clientes tem que bater com o Total Receitas do
// Sintético — serve de conferência/auditoria (ela pediu isso explicitamente).
function _fmSecTotalGeralClientes(clientesContrato, clientesFechamento, receitaTotal) {
  var soma = Object.values(clientesContrato).reduce(function(s, c) { return s + c.valor; }, 0) +
    Object.values(clientesFechamento).reduce(function(s, c) { return s + c.valor; }, 0);
  var bate = Math.abs(soma - receitaTotal) < 0.01;
  return '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">✅ Total Geral (todos os clientes)</span></div>' +
    '<div style="padding:10px 16px;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:800">' +
      '<span>Soma de todos os clientes</span>' +
      '<span style="display:flex;gap:8px;align-items:center">' +
        '<span style="font-family:var(--mono)">' + fR(soma) + '</span>' +
        (bate ? '<span class="tag tag-green">Bate com o Sintético</span>' : '<span class="tag tag-red">Diverge do Sintético (' + fR(receitaTotal) + ')</span>') +
      '</span>' +
    '</div></div>';
}

function _fmBlocoClientes(titulo, mapa) {
  var linhas = Object.values(mapa).sort(function(a, b) { return b.valor - a.valor; });
  if (!linhas.length) return '<div class="sec" style="margin-bottom:14px"><div class="sec-head"><span class="sec-title">' + titulo + '</span></div><div style="padding:14px 16px;color:var(--text3);font-size:12px">Nada registrado neste mês.</div></div>';
  return '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">' + titulo + '</span></div>' +
    '<div style="padding:8px 16px">' +
    linhas.map(function(l) {
      var statusTag = l.pendente <= 0.01
        ? '<span class="tag tag-green">Recebido</span>'
        : l.recebido > 0.01
          ? '<span class="tag tag-yellow">Parcial — falta ' + fR(l.pendente) + '</span>'
          : '<span class="tag tag-yellow">Pendente</span>';
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px">' +
        '<span style="color:var(--text)">' + l.nome + '</span>' +
        '<span style="display:flex;gap:8px;align-items:center"><span style="font-family:var(--mono);font-weight:700">' + fR(l.valor) + '</span>' + statusTag + '</span>' +
      '</div>';
    }).join('') +
    '</div></div>';
}

function rFechamentoMensal() {
  var cont = document.getElementById('fm-body');
  if (!cont) return;
  _fmDestroyCharts();
  _fmDetailSeq = 0;
  var anoMes = _fmAnoMes();

  if (_fmViewMode === 'produtos') { _fmRenderProdutos(cont, anoMes); return; }

  var hoje = new Date().toISOString().slice(0, 10);

  // ── Receita (Contrato 20%+80%) — competência: mês do EVENTO (f.data), não do
  // vencimento da parcela. A parcela de 20% vence na assinatura (podendo ser
  // meses antes do evento) e a de 80% perto do evento — usar vencimento aqui
  // faria as duas parcelas do MESMO contrato caírem em meses diferentes, e o
  // total do mês nunca bateria com o valor do contrato na tela Contratos. Ela
  // não segue regime de caixa: o pagamento ser 20/80 é irrelevante pra decidir
  // o mês, só a data do evento importa (mesmo critério já usado em Fechamento
  // e Despesas). O vencimento continua valendo só pra decidir atraso (Inadimplência).
  var contratoRecs = (D.financeiro || []).filter(function(f) { return !f.isFechamento; })
    .filter(function(f) { return _fmDataNoMes(f.data || f.vencimento, anoMes); });
  var semDataContrato = (D.financeiro || []).filter(function(f) { return !f.isFechamento && !f.data && !f.vencimento; }).length;

  var receitaContrato = contratoRecs.reduce(function(s, f) { return s + (f.valorNum || 0); }, 0);
  var recebidoContrato = contratoRecs.filter(function(f) { return f.status === 'pago'; }).reduce(function(s, f) { return s + (f.valorNum || 0); }, 0);
  var pendenteContrato = receitaContrato - recebidoContrato;

  var clientesContrato = {};
  contratoRecs.forEach(function(f) {
    var nome = f.evento || f.contrato || 'Sem nome';
    if (!clientesContrato[nome]) clientesContrato[nome] = { nome: nome, valor: 0, recebido: 0, pendente: 0 };
    clientesContrato[nome].valor += (f.valorNum || 0);
    if (f.status === 'pago') clientesContrato[nome].recebido += (f.valorNum || 0);
    else clientesContrato[nome].pendente += (f.valorNum || 0);
  });

  // ── Fechamento (acerto pós-evento) — competência: mês do EVENTO, não do vencimento do acerto.
  // O acerto costuma vencer alguns dias depois do evento (às vezes no mês seguinte, em
  // eventos no fim do mês) — usar o vencimento aqui faria o fechamento "sumir" do mês em
  // que o evento realmente aconteceu. O vencimento continua sendo usado só pra decidir
  // se está em atraso (Inadimplência), não pra decidir de qual mês é o fechamento.
  var fechamentosDoMes = (D.fechamentos || []).filter(function(fch) { return _fmDataNoMes(fch.dataEvento || fch.vencimento, anoMes); });
  var semDataFechamento = (D.fechamentos || []).filter(function(fch) { return !fch.dataEvento && !fch.vencimento; }).length;

  var fechamentoTotal = 0, fechamentoRecebido = 0;
  var fechamentoPorTipo = { produto: 0, quebras: 0, extra: 0 };
  var clientesFechamento = {};
  fechamentosDoMes.forEach(function(fch) {
    var valor = fch.totalExtras || 0;
    fechamentoTotal += valor;
    var pago = _fmFechamentoPago(fch);
    if (pago) fechamentoRecebido += valor;

    (fch.itens || []).forEach(function(it) {
      fechamentoPorTipo[_fmClassificarItem(it.tipo)] += (it.valor || 0);
    });

    var nome = fch.eventoNome || fch.clienteNome || 'Sem nome';
    if (!clientesFechamento[nome]) clientesFechamento[nome] = { nome: nome, valor: 0, recebido: 0, pendente: 0 };
    clientesFechamento[nome].valor += valor;
    if (pago) clientesFechamento[nome].recebido += valor;
    else clientesFechamento[nome].pendente += valor;
  });
  var fechamentoPendente = fechamentoTotal - fechamentoRecebido;

  // ── Receita Total ──
  var receitaTotal = receitaContrato + fechamentoTotal;

  // ── Inadimplência: só o que venceu DENTRO do mês selecionado, já passou da
  // data e ainda tem valor real em aberto (fechamento de R$0 não é inadimplência) ──
  var inadimplencia = [];
  contratoRecs.forEach(function(f) {
    if (f.status === 'pago' || !(f.valorNum > 0.01)) return;
    var venc = _finVencimentoEfetivo(f);
    if (venc && venc < hoje) {
      var desc = f.descricao || '';
      var tipo = desc.indexOf('20%') >= 0 ? 'Parcela 20%' : desc.indexOf('80%') >= 0 ? 'Parcela 80%' : (desc || 'Parcela');
      inadimplencia.push({ nome: f.evento || f.contrato || 'Sem nome', tipo: tipo, valor: f.valorNum || 0, vencimento: venc });
    }
  });
  fechamentosDoMes.forEach(function(fch) {
    if (_fmFechamentoPago(fch) || !((fch.totalExtras || 0) > 0.01)) return;
    var venc = _fmVencimentoFechamento(fch);
    if (venc && venc < hoje) {
      inadimplencia.push({ nome: fch.eventoNome || fch.clienteNome || 'Sem nome', tipo: 'Fechamento', valor: fch.totalExtras || 0, vencimento: venc });
    }
  });
  inadimplencia.sort(function(a, b) { return a.vencimento.localeCompare(b.vencimento); });
  var totalInadimplencia = inadimplencia.reduce(function(s, i) { return s + i.valor; }, 0);

  // ── Despesas — competência: data do lançamento no mês, por categoria.
  // Em despesas.js, "data" é o campo canônico usado em todas as outras telas
  // (lista, KPI, agrupamento) — "dataVencimento" é só uma anotação opcional pra
  // marcar atraso, pode ficar num mês diferente do "data" (ex: prazo de
  // pagamento maior). Usar "data" primeiro evita que a despesa aparente ter
  // sumido do mês em que ela realmente foi lançada.
  var despesasDoMes = (D.despesas || []).filter(function(d) { return _fmDataNoMes(d.data || d.dataVencimento, anoMes); });
  var semDataDespesa = (D.despesas || []).filter(function(d) { return !d.data && !d.dataVencimento; }).length;
  var despesaTotal = despesasDoMes.reduce(function(s, d) { return s + (d.valor || 0); }, 0);
  var despesaPorCategoria = {};
  var despesaItensPorCategoria = {};
  despesasDoMes.forEach(function(d) {
    var cat = d.categoria || 'Outros';
    despesaPorCategoria[cat] = (despesaPorCategoria[cat] || 0) + (d.valor || 0);
    if (!despesaItensPorCategoria[cat]) despesaItensPorCategoria[cat] = [];
    despesaItensPorCategoria[cat].push(d);
  });

  // ── Quebras (perda registrada, D.quebras) — custo real, não cobrado de ninguém ──
  var quebrasDoMes = (D.quebras || []).filter(function(q) { return _fmDataNoMes(q.data, anoMes); });
  var semDataQuebra = (D.quebras || []).filter(function(q) { return !q.data; }).length;
  var totalQuebras = quebrasDoMes.reduce(function(s, q) { return s + Number(q.qtd || 0) * Number(q.custo || 0); }, 0);
  var quebraPorProduto = {};
  quebrasDoMes.forEach(function(q) {
    var nome = q.prod || 'Outros';
    quebraPorProduto[nome] = (quebraPorProduto[nome] || 0) + Number(q.qtd || 0) * Number(q.custo || 0);
  });

  // ── Lucro ──
  var lucro = receitaTotal - despesaTotal - totalQuebras;

  // ── Eventos do mês (contexto) ──
  var eventosDoMes = (D.contratos || []).filter(function(c) { return _fmDataNoMes(c.data, anoMes); })
    .sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); });

  var htmlInadimplencia = '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">⚠️ Inadimplência do mês (' + inadimplencia.length + ') — ' + fR(totalInadimplencia) + '</span></div>' +
    (inadimplencia.length ? '<div style="padding:8px 16px">' + inadimplencia.map(function(i) {
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px">' +
        '<span style="color:var(--text)">' + i.nome + ' <span style="color:var(--text3)">— ' + i.tipo + '</span></span>' +
        '<span style="display:flex;gap:8px;align-items:center"><span style="color:var(--text3);font-size:11px">venc. ' + fd(i.vencimento) + '</span><span style="font-family:var(--mono);font-weight:700;color:var(--red)">' + fR(i.valor) + '</span></span>' +
      '</div>';
    }).join('') + '</div>' : '<div style="padding:14px 16px;color:var(--text3);font-size:12px">Nenhuma pendência vencida neste mês. 🎉</div>');

  var htmlEventos = '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">📅 Eventos do mês (' + eventosDoMes.length + ')</span></div>' +
    (eventosDoMes.length ? '<div style="padding:8px 16px">' + eventosDoMes.map(function(c) {
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px">' +
        '<span style="color:var(--text)">' + fd(c.data) + ' — ' + (c.nomeEvento || c.nome || 'Sem nome') + '</span>' +
        '<span style="color:var(--text3)">' + (c.convidados ? c.convidados + ' convidados' : '') + '</span>' +
      '</div>';
    }).join('') + '</div>' : '<div style="padding:14px 16px;color:var(--text3);font-size:12px">Nenhum evento neste mês.</div>');

  var semData = semDataContrato + semDataFechamento + semDataDespesa + semDataQuebra;
  var avisoSemData = semData
    ? '<div style="font-size:11px;color:var(--amber);margin-bottom:14px">⚠️ ' + semData + ' lançamento(s) sem nenhuma data cadastrada (nem vencimento, nem data do evento) — não entraram em nenhum mês deste relatório. Confira os cadastros antigos/importados.</div>'
    : '';

  var htmlTopo =
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      _fmCardResumo('Resultado do Mês', lucro, lucro >= 0 ? 'var(--green)' : 'var(--red)', 'Total Receitas − Total Despesas − Quebras (perda registrada)') +
      _fmCardResumo('Quebras (perda registrada)', totalQuebras, 'var(--amber)', 'prejuízo real, não cobrado do cliente — já descontado do Resultado acima') +
    '</div>' +
    _fmSecReceitas(receitaContrato, recebidoContrato, pendenteContrato, clientesContrato, fechamentoTotal, fechamentoRecebido, fechamentoPendente, fechamentosDoMes, fechamentoPorTipo, receitaTotal) +
    _fmSecDespesas(despesaPorCategoria, despesaItensPorCategoria, despesaTotal);

  var html = htmlTopo + avisoSemData + htmlInadimplencia;

  if (_fmViewMode === 'analitico') {
    html += _fmBlocoClientes('👤 Receita (Contrato) por Cliente', clientesContrato) +
      _fmBlocoClientes('🧾 Fechamento por Cliente', clientesFechamento) +
      _fmSecTotalGeralClientes(clientesContrato, clientesFechamento, receitaTotal) +
      _fmBlocoBreakdown('📉 Quebras por Produto (perda registrada)', quebraPorProduto, '#F7A84F');
  }

  html += htmlEventos;

  cont.innerHTML = html;
}

// ─── ABA PRODUTOS ─────────────────────────────────────────────────────────────
// Não é financeiro — é operacional: o que mais saiu (consumo real registrado
// em D.festas, eventos encerrados), o que mais quebrou (D.quebras, perda real)
// e a relação entre os dois por produto. Usa Chart.js pros gráficos.

function _fmDestroyCharts() {
  _fmChartInstances.forEach(function(c) { try { c.destroy(); } catch (e) {} });
  _fmChartInstances = [];
}

// Lê a cor de verdade por trás de uma variável CSS (--green, --red etc.) pro
// tema atual (claro/escuro) — Chart.js não entende "var(--x)" em canvas.
function _fmCssVar(nome, fallback) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(nome);
  return (v && v.trim()) || fallback;
}

var _FM_MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
function _fmLabelMes(anoMes) {
  var partes = anoMes.split('-');
  return _FM_MESES_ABREV[parseInt(partes[1], 10) - 1] + '/' + partes[0].slice(2);
}

// Gera os últimos N ano-mês terminando no mês selecionado (incluso).
function _fmUltimosMeses(anoMes, n) {
  var partes = anoMes.split('-');
  var ano = parseInt(partes[0], 10), mes = parseInt(partes[1], 10);
  var lista = [];
  for (var i = n - 1; i >= 0; i--) {
    var d = new Date(ano, mes - 1 - i, 1);
    lista.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }
  return lista;
}

function _fmTotalQuebrasNoMes(anoMes) {
  return (D.quebras || []).filter(function(q) { return _fmDataNoMes(q.data, anoMes); })
    .reduce(function(s, q) { return s + Number(q.qtd || 0) * Number(q.custo || 0); }, 0);
}

function _fmRenderProdutos(cont, anoMes) {
  // Consumo real por produto: eventos encerrados (D.festas) com data no mês.
  var festasDoMes = (D.festas || []).filter(function(f) { return f.status === 'encerrada' && _fmDataNoMes(f.data, anoMes); });
  var consumoPorProduto = {};
  festasDoMes.forEach(function(f) {
    (f.itens || []).forEach(function(it) {
      var nome = it.prod || 'Outros';
      var qtd = Number(it.consumido != null ? it.consumido : (it.qtd || 0));
      var valor = Number(it.valor || 0);
      if (!consumoPorProduto[nome]) consumoPorProduto[nome] = { qtd: 0, valor: 0 };
      consumoPorProduto[nome].qtd += qtd;
      consumoPorProduto[nome].valor += valor;
    });
  });

  // Quebra (perda registrada) por produto no mês.
  var quebrasDoMes = (D.quebras || []).filter(function(q) { return _fmDataNoMes(q.data, anoMes); });
  var quebraPorProduto = {};
  quebrasDoMes.forEach(function(q) {
    var nome = q.prod || 'Outros';
    var qtd = Number(q.qtd || 0);
    var valor = qtd * Number(q.custo || 0);
    if (!quebraPorProduto[nome]) quebraPorProduto[nome] = { qtd: 0, valor: 0 };
    quebraPorProduto[nome].qtd += qtd;
    quebraPorProduto[nome].valor += valor;
  });

  var totalConsumoValor = Object.values(consumoPorProduto).reduce(function(s, p) { return s + p.valor; }, 0);
  var totalQuebraValor = Object.values(quebraPorProduto).reduce(function(s, p) { return s + p.valor; }, 0);
  var pctQuebraGeral = (totalConsumoValor + totalQuebraValor) > 0 ? (totalQuebraValor / (totalConsumoValor + totalQuebraValor) * 100) : 0;

  // Tabela combinada, uma linha por produto que teve consumo e/ou quebra.
  var nomesProdutos = Array.from(new Set(Object.keys(consumoPorProduto).concat(Object.keys(quebraPorProduto))));
  var resumoProdutos = nomesProdutos.map(function(nome) {
    var c = consumoPorProduto[nome] || { qtd: 0, valor: 0 };
    var q = quebraPorProduto[nome] || { qtd: 0, valor: 0 };
    var totalQtd = c.qtd + q.qtd;
    return { nome: nome, consumoQtd: c.qtd, consumoValor: c.valor, quebraQtd: q.qtd, quebraValor: q.valor, pctQuebra: totalQtd > 0 ? (q.qtd / totalQtd * 100) : 0 };
  });

  var topConsumo = resumoProdutos.slice().sort(function(a, b) { return b.consumoQtd - a.consumoQtd; }).filter(function(p) { return p.consumoQtd > 0; }).slice(0, 8);
  var topQuebra = resumoProdutos.slice().sort(function(a, b) { return b.quebraValor - a.quebraValor; }).filter(function(p) { return p.quebraValor > 0; }).slice(0, 8);
  var piorTaxaQuebra = resumoProdutos.slice().filter(function(p) { return p.consumoQtd + p.quebraQtd >= 1; }).sort(function(a, b) { return b.pctQuebra - a.pctQuebra; }).slice(0, 8);

  var mesesTrend = _fmUltimosMeses(anoMes, 6);
  var trendQuebra = mesesTrend.map(_fmTotalQuebrasNoMes);

  var semEventos = !festasDoMes.length && !quebrasDoMes.length;

  var htmlKpis = '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
    _fmCardResumo('Consumo Registrado (valor)', totalConsumoValor, 'var(--green)', festasDoMes.length + ' evento(s) encerrado(s) no mês') +
    _fmCardResumo('Quebra (perda registrada)', totalQuebraValor, 'var(--amber)') +
    _fmCardResumo('% de Quebra sobre o Movimentado', pctQuebraGeral, pctQuebraGeral > 5 ? 'var(--red)' : 'var(--green)', pctQuebraGeral.toFixed(1).replace('.', ',') + '%') +
  '</div>';

  var htmlAviso = semEventos
    ? '<div style="font-size:11px;color:var(--text3);margin-bottom:14px">Nenhum evento encerrado ou quebra registrada neste mês — confira o mês/ano selecionado.</div>'
    : '';

  var htmlGraficos = '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px">' +
    '<div class="sec" style="flex:1;min-width:320px"><div class="sec-head"><span class="sec-title">🥇 Top produtos mais consumidos (qtd)</span></div><div style="padding:14px"><canvas id="fm-chart-consumo" height="220"></canvas></div></div>' +
    '<div class="sec" style="flex:1;min-width:320px"><div class="sec-head"><span class="sec-title">💥 Quebra por produto (R$)</span></div><div style="padding:14px"><canvas id="fm-chart-quebra" height="220"></canvas></div></div>' +
  '</div>' +
  '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px">' +
    '<div class="sec" style="flex:1;min-width:280px"><div class="sec-head"><span class="sec-title">🍩 Distribuição da quebra por produto</span></div><div style="padding:14px"><canvas id="fm-chart-donut" height="220"></canvas></div></div>' +
    '<div class="sec" style="flex:2;min-width:320px"><div class="sec-head"><span class="sec-title">📈 Quebras nos últimos 6 meses (R$)</span></div><div style="padding:14px"><canvas id="fm-chart-trend" height="220"></canvas></div></div>' +
  '</div>';

  function linhaTabela(p) {
    return '<tr>' +
      '<td style="padding:6px 10px;font-size:12px">' + p.nome + '</td>' +
      '<td style="padding:6px 10px;font-size:12px;text-align:right;font-family:var(--mono)">' + p.consumoQtd.toLocaleString('pt-BR') + '</td>' +
      '<td style="padding:6px 10px;font-size:12px;text-align:right;font-family:var(--mono)">' + p.quebraQtd.toLocaleString('pt-BR') + '</td>' +
      '<td style="padding:6px 10px;font-size:12px;text-align:right;font-family:var(--mono);color:' + (p.pctQuebra > 5 ? 'var(--red)' : 'var(--text3)') + '">' + p.pctQuebra.toFixed(1).replace('.', ',') + '%</td>' +
      '<td style="padding:6px 10px;font-size:12px;text-align:right;font-family:var(--mono)">' + fR(p.quebraValor) + '</td>' +
    '</tr>';
  }

  var htmlTabela = '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">📋 Detalhe por Produto — pior taxa de quebra primeiro</span></div>' +
    (piorTaxaQuebra.length
      ? '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)">' +
        '<th style="padding:6px 10px;font-size:10px;text-align:left;color:var(--text3);text-transform:uppercase">Produto</th>' +
        '<th style="padding:6px 10px;font-size:10px;text-align:right;color:var(--text3);text-transform:uppercase">Consumido</th>' +
        '<th style="padding:6px 10px;font-size:10px;text-align:right;color:var(--text3);text-transform:uppercase">Quebrado</th>' +
        '<th style="padding:6px 10px;font-size:10px;text-align:right;color:var(--text3);text-transform:uppercase">% Quebra</th>' +
        '<th style="padding:6px 10px;font-size:10px;text-align:right;color:var(--text3);text-transform:uppercase">Valor Quebra</th>' +
        '</tr></thead><tbody>' + piorTaxaQuebra.map(linhaTabela).join('') + '</tbody></table></div>'
      : '<div style="padding:14px 16px;color:var(--text3);font-size:12px">Nada registrado neste mês.</div>') +
  '</div>';

  cont.innerHTML = htmlKpis + htmlAviso + htmlGraficos + htmlTabela;

  if (typeof Chart === 'undefined') {
    cont.innerHTML += '<div style="font-size:11px;color:var(--amber)">⚠️ Biblioteca de gráficos não carregou (verifique a conexão) — os números acima continuam corretos, só os gráficos ficam sem desenhar.</div>';
    return;
  }

  var corVerde = _fmCssVar('--green', '#3DDC84');
  var corAmber = _fmCssVar('--amber', '#F7C35A');
  var corVermelho = _fmCssVar('--red', '#F7625A');
  var corAzul = _fmCssVar('--blue', '#4F8EF7');
  var corTexto = _fmCssVar('--text3', '#8B91A8');
  var corGrid = _fmCssVar('--border', '#2A2F42');
  var paletaDonut = [corVerde, corAzul, corAmber, corVermelho, '#A78BFA', '#F472B6', '#22D3EE', '#94A3B8'];

  Chart.defaults.color = corTexto;
  Chart.defaults.borderColor = corGrid;
  Chart.defaults.font.size = 11;

  var ctxConsumo = document.getElementById('fm-chart-consumo');
  if (ctxConsumo) {
    _fmChartInstances.push(new Chart(ctxConsumo, {
      type: 'bar',
      data: {
        labels: topConsumo.map(function(p) { return p.nome; }),
        datasets: [{ label: 'Consumido (qtd)', data: topConsumo.map(function(p) { return p.consumoQtd; }), backgroundColor: corVerde, borderRadius: 4 }]
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, grid: { color: corGrid } }, y: { grid: { display: false } } }
      }
    }));
  }

  var ctxQuebra = document.getElementById('fm-chart-quebra');
  if (ctxQuebra) {
    _fmChartInstances.push(new Chart(ctxQuebra, {
      type: 'bar',
      data: {
        labels: topQuebra.map(function(p) { return p.nome; }),
        datasets: [{ label: 'Quebra (R$)', data: topQuebra.map(function(p) { return p.quebraValor; }), backgroundColor: corAmber, borderRadius: 4 }]
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { return fR(ctx.parsed.x); } } } },
        scales: { x: { beginAtZero: true, grid: { color: corGrid } }, y: { grid: { display: false } } }
      }
    }));
  }

  var ctxDonut = document.getElementById('fm-chart-donut');
  if (ctxDonut) {
    var topDonut = topQuebra.slice(0, 5);
    var restoDonut = quebrasDoMes.length ? Math.max(0, totalQuebraValor - topDonut.reduce(function(s, p) { return s + p.quebraValor; }, 0)) : 0;
    var labelsDonut = topDonut.map(function(p) { return p.nome; });
    var dataDonut = topDonut.map(function(p) { return p.quebraValor; });
    if (restoDonut > 0.01) { labelsDonut.push('Outros'); dataDonut.push(restoDonut); }
    _fmChartInstances.push(new Chart(ctxDonut, {
      type: 'doughnut',
      data: { labels: labelsDonut, datasets: [{ data: dataDonut, backgroundColor: paletaDonut }] },
      options: {
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8 } },
          tooltip: { callbacks: { label: function(ctx) { return ctx.label + ': ' + fR(ctx.parsed); } } }
        }
      }
    }));
  }

  var ctxTrend = document.getElementById('fm-chart-trend');
  if (ctxTrend) {
    _fmChartInstances.push(new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: mesesTrend.map(_fmLabelMes),
        datasets: [{ label: 'Quebras (R$)', data: trendQuebra, borderColor: corVermelho, backgroundColor: corVermelho, tension: 0.3, fill: false, pointRadius: 4 }]
      },
      options: {
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { return fR(ctx.parsed.y); } } } },
        scales: { y: { beginAtZero: true, grid: { color: corGrid } }, x: { grid: { display: false } } }
      }
    }));
  }
}
