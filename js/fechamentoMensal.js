// ─── FECHAMENTO MENSAL ───────────────────────────────────────────────────────
// Relatório consolidado por mês, em regime de COMPETÊNCIA (data de vencimento,
// não data de pagamento) — reúne numa tela só o que hoje está espalhado em
// Financeiro, Fechamentos, Despesas e Quebras. Feito pra ser impresso e
// anexado na pasta física do evento/mês, então todo valor que existir tem que
// aparecer em algum lugar (nada some silenciosamente por falta de data).
//
// Estrutura (ver memória fechamento_mensal_module para o histórico completo):
//  - Receita (Contrato 20%+80%)   = D.financeiro sem isFechamento
//  - Fechamento                   = D.fechamentos (acerto pós-evento: produto/quebras/extra)
//  - Receita Total                = Receita + Fechamento, com Recebido/Pendente
//  - Inadimplência                = parcelas/fechamentos vencidos DENTRO do mês, ainda não pagos
//  - Despesas                     = D.despesas, por categoria (D.categoriasDespesas)
//  - Quebras (perda registrada)   = D.quebras — custo real, NÃO é a mesma coisa
//                                    que "quebras" dentro do Fechamento (que é
//                                    cobrada do cliente, não é perda)
//  - Lucro                        = Receita Total − Despesas − Quebras (perda registrada)

let _fmViewMode = 'sintetico';

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
  var bSint = document.getElementById('fm-tab-sint');
  var bAnal = document.getElementById('fm-tab-anal');
  if (bSint) bSint.classList.toggle('active', v === 'sintetico');
  if (bAnal) bAnal.classList.toggle('active', v === 'analitico');
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

// Data de competência de um fechamento: usa o vencimento cadastrado (aba
// Fechamentos) e só cai pra data do evento se não tiver vencimento definido.
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

function rFechamentoMensal() {
  var cont = document.getElementById('fm-body');
  if (!cont) return;
  var anoMes = _fmAnoMes();
  var hoje = new Date().toISOString().slice(0, 10);

  // ── Receita (Contrato 20%+80%) — competência: vencimento efetivo no mês ──
  var contratoRecs = (D.financeiro || []).filter(function(f) { return !f.isFechamento; })
    .filter(function(f) { return _fmDataNoMes(_finVencimentoEfetivo(f), anoMes); });
  var semDataContrato = (D.financeiro || []).filter(function(f) { return !f.isFechamento && !_finVencimentoEfetivo(f) && !f.vencimento && !f.data; }).length;

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
  var recebidoTotal = recebidoContrato + fechamentoRecebido;
  var pendenteTotal = pendenteContrato + fechamentoPendente;

  // ── Inadimplência: só o que venceu DENTRO do mês selecionado e já passou da data ──
  var inadimplencia = [];
  contratoRecs.forEach(function(f) {
    if (f.status === 'pago') return;
    var venc = _finVencimentoEfetivo(f);
    if (venc && venc < hoje) {
      var desc = f.descricao || '';
      var tipo = desc.indexOf('20%') >= 0 ? 'Parcela 20%' : desc.indexOf('80%') >= 0 ? 'Parcela 80%' : (desc || 'Parcela');
      inadimplencia.push({ nome: f.evento || f.contrato || 'Sem nome', tipo: tipo, valor: f.valorNum || 0, vencimento: venc });
    }
  });
  fechamentosDoMes.forEach(function(fch) {
    if (_fmFechamentoPago(fch)) return;
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
  despesasDoMes.forEach(function(d) {
    var cat = d.categoria || 'Outros';
    despesaPorCategoria[cat] = (despesaPorCategoria[cat] || 0) + (d.valor || 0);
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

  function cardResumo(titulo, valor, cor, sub) {
    return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;flex:1;min-width:180px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">' + titulo + '</div>' +
      '<div style="font-size:22px;font-weight:800;font-family:var(--mono);color:' + cor + '">' + fR(valor) + '</div>' +
      (sub ? '<div style="font-size:11px;color:var(--text3);margin-top:4px">' + sub + '</div>' : '') +
    '</div>';
  }

  function blocoBreakdown(titulo, obj, cor) {
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

  function blocoClientes(titulo, mapa) {
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
      cardResumo('Receita (Contrato 20%+80%)', receitaContrato, 'var(--green)') +
      cardResumo('Fechamento (acerto pós-evento)', fechamentoTotal, 'var(--green)', 'produto ' + fR(fechamentoPorTipo.produto) + ' · quebras ' + fR(fechamentoPorTipo.quebras) + ' · extra ' + fR(fechamentoPorTipo.extra)) +
      cardResumo('Receita Total', receitaTotal, 'var(--green)', 'recebido ' + fR(recebidoTotal) + ' · pendente ' + fR(pendenteTotal)) +
    '</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      cardResumo('Despesas', despesaTotal, 'var(--red)') +
      cardResumo('Quebras (perda registrada)', totalQuebras, 'var(--amber)') +
      cardResumo('Lucro do Mês', lucro, lucro >= 0 ? 'var(--green)' : 'var(--red)', 'Receita Total − Despesas − Quebras (perda registrada)') +
    '</div>';

  var html = htmlTopo + avisoSemData + htmlInadimplencia;

  if (_fmViewMode === 'analitico') {
    html += blocoClientes('👤 Receita (Contrato) por Cliente', clientesContrato) +
      blocoClientes('🧾 Fechamento por Cliente', clientesFechamento) +
      blocoBreakdown('💸 Despesas por Categoria', despesaPorCategoria, '#F74F6B') +
      blocoBreakdown('📉 Quebras por Produto (perda registrada)', quebraPorProduto, '#F7A84F');
  }

  html += htmlEventos;

  cont.innerHTML = html;
}
