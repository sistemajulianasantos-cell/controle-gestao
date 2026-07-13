// ─── FECHAMENTO MENSAL ───────────────────────────────────────────────────────
// Relatório consolidado por mês: Receita recebida, Despesa paga, Quebras e o
// resultado líquido do período — tudo em regime de caixa (data real em que o
// dinheiro entrou/saiu), não a data do evento/vencimento. Reúne numa tela só
// o que hoje está espalhado em Financeiro, Despesas e Quebras.

function initFechamentoMensal() {
  var hoje = new Date();
  var mesEl = document.getElementById('fm-mes');
  var anoEl = document.getElementById('fm-ano');
  if (mesEl && !mesEl.value) mesEl.value = String(hoje.getMonth() + 1).padStart(2, '0');
  if (anoEl && !anoEl.value) anoEl.value = String(hoje.getFullYear());
  rFechamentoMensal();
}

function _fmAnoMes() {
  var mes = document.getElementById('fm-mes')?.value || String(new Date().getMonth() + 1).padStart(2, '0');
  var ano = document.getElementById('fm-ano')?.value || String(new Date().getFullYear());
  return ano + '-' + mes;
}

function rFechamentoMensal() {
  var cont = document.getElementById('fm-body');
  if (!cont) return;
  var anoMes = _fmAnoMes();

  // Receita recebida em caixa: parcelas pagas com data de pagamento no mês.
  var parcelasRecebidas = (D.financeiro || []).filter(function(f) {
    return f.status === 'pago' && f.dataPagamento && f.dataPagamento.startsWith(anoMes);
  });
  var receitaRecebida = parcelasRecebidas.reduce(function(s, f) { return s + (f.valorNum || 0); }, 0);

  // A receber (informativo, não entra no resultado): parcelas pendentes cujo
  // vencimento ou data do evento cai no mês.
  var aReceber = (D.financeiro || []).filter(function(f) {
    if (f.status === 'pago') return false;
    var ref = f.vencimento || f.data || '';
    return ref.startsWith(anoMes);
  }).reduce(function(s, f) { return s + (f.valorNum || 0); }, 0);

  // Despesa paga em caixa: lançamentos com data de pagamento no mês.
  var despesasPagas = (D.despesas || []).filter(function(d) {
    return d.dataPagamento && d.dataPagamento.startsWith(anoMes);
  });
  var despesaPaga = despesasPagas.reduce(function(s, d) { return s + (d.valor || 0); }, 0);

  // A pagar (informativo): lançamentos sem pagamento cuja data/vencimento cai no mês.
  var aPagar = (D.despesas || []).filter(function(d) {
    if (d.dataPagamento) return false;
    var ref = d.dataVencimento || d.data || '';
    return ref.startsWith(anoMes);
  }).reduce(function(s, d) { return s + (d.valor || 0); }, 0);

  // Quebras do mês: não têm conceito de "pago", a data do registro já é a
  // data real da perda.
  var quebrasDoMes = (D.quebras || []).filter(function(q) { return (q.data || '').startsWith(anoMes); });
  var totalQuebras = quebrasDoMes.reduce(function(s, q) { return s + Number(q.qtd || 0) * Number(q.custo || 0); }, 0);

  var resultado = receitaRecebida - despesaPaga - totalQuebras;

  // Breakdown de despesa por categoria.
  var despesaPorCategoria = {};
  despesasPagas.forEach(function(d) {
    var cat = d.categoria || 'Outros';
    despesaPorCategoria[cat] = (despesaPorCategoria[cat] || 0) + (d.valor || 0);
  });

  // Breakdown de quebras por produto.
  var quebraPorProduto = {};
  quebrasDoMes.forEach(function(q) {
    var nome = q.prod || 'Outros';
    quebraPorProduto[nome] = (quebraPorProduto[nome] || 0) + Number(q.qtd || 0) * Number(q.custo || 0);
  });

  // Eventos do mês (contexto): contratos com data do evento no mês.
  var eventosDoMes = (D.contratos || []).filter(function(c) { return (c.data || '').startsWith(anoMes); })
    .sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); });

  function cardResumo(titulo, valor, cor) {
    return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;flex:1;min-width:180px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">' + titulo + '</div>' +
      '<div style="font-size:22px;font-weight:800;font-family:var(--mono);color:' + cor + '">' + fR(valor) + '</div>' +
    '</div>';
  }

  function blocoBreakdown(titulo, obj, cor) {
    var entradas = Object.entries(obj).sort(function(a, b) { return b[1] - a[1]; });
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

  var htmlEventos = '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">📅 Eventos do mês (' + eventosDoMes.length + ')</span></div>' +
    (eventosDoMes.length ? '<div style="padding:8px 16px">' + eventosDoMes.map(function(c) {
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px">' +
        '<span style="color:var(--text)">' + fd(c.data) + ' — ' + (c.nomeEvento || c.nome || 'Sem nome') + '</span>' +
        '<span style="color:var(--text3)">' + (c.convidados ? c.convidados + ' convidados' : '') + '</span>' +
      '</div>';
    }).join('') + '</div>' : '<div style="padding:14px 16px;color:var(--text3);font-size:12px">Nenhum evento neste mês.</div>');

  cont.innerHTML =
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      cardResumo('Receita Recebida', receitaRecebida, 'var(--green)') +
      cardResumo('Despesa Paga', despesaPaga, 'var(--red)') +
      cardResumo('Quebras', totalQuebras, 'var(--amber)') +
      cardResumo('Resultado do Mês', resultado, resultado >= 0 ? 'var(--green)' : 'var(--red)') +
    '</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      cardResumo('A Receber (pendente)', aReceber, 'var(--text3)') +
      cardResumo('A Pagar (pendente)', aPagar, 'var(--text3)') +
    '</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:14px">Receita Recebida e Despesa Paga usam a data real de pagamento (regime de caixa) — só entra aqui o que já entrou ou saiu de verdade nesse mês. "A Receber"/"A Pagar" são só informativos, não entram no Resultado.</div>' +
    blocoBreakdown('💸 Despesas por Categoria', despesaPorCategoria, '#F74F6B') +
    blocoBreakdown('📉 Quebras por Produto', quebraPorProduto, '#F7A84F') +
    htmlEventos;
}
