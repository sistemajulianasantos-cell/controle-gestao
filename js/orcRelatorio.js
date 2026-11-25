// ─── RELATÓRIO FINANCEIRO DO ORÇAMENTO (aba "Relatório", pedido 11-25) ──────
// Só consulta: explica de onde vem cada valor (custo real sem bebidas →
// margens → taxas = Pacote Essencial; + bebidas alcoólicas = Pacote Completo)
// e o resultado de cada pacote. Os números saem de _orcCalcResumo (o mesmo
// cálculo da Calculadora), então os dois sempre batem. Nada aqui grava.

function _relEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function _relNum(n) {
  var v = Math.round((Number(n) || 0) * 100) / 100;
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}
function _relR(n) {
  return 'R$ ' + (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function _relPct(n) { return _relNum(n) + '%'; }

// Mesmo teste de bebida alcoólica do _orcCalcResumo (pela categoria gravada
// no insumo) — senão a soma do relatório não bateria com a Calculadora.
function _relEhBebidaAlc(i) {
  return typeof _sepNormNome === 'function'
    ? _sepNormNome(i.cat) === _sepNormNome('BEBIDAS ALCOÓLICAS')
    : i.cat === 'BEBIDAS ALCOÓLICAS';
}

var _REL_CARGOS = {
  bt: { nome: 'Bartender', param: 'bartender' },
  bb: { nome: 'Bar Back', param: 'barback' },
  hb: { nome: 'Head Bartender', param: 'head' },
  cd: { nome: 'Coordenador', param: 'coord' },
  cp: { nome: 'Copeiro', param: 'copeiro' },
};

// Texto "de onde veio" de um item da Calculadora (equipe, logística, fatores, manuais).
function _relOrigemItem(item, ctx) {
  var p = ctx.p, partes = [];
  var id = String(item.id || '');
  if (!item.auto) return 'Item incluído à mão neste orçamento';
  var k = id.slice(5);
  if (_REL_CARGOS[k]) {
    var regra = (typeof getOrcEquipeRegra === 'function' ? getOrcEquipeRegra() : {})[k] || {};
    if (item.manualQtd || p[_REL_CARGOS[k].param] != null) {
      partes.push('Quantidade escolhida no orçamento');
    } else if (regra.acima > 0 && ctx.pax <= regra.acima) {
      partes.push('Regra de equipe: só entra acima de ' + regra.acima + ' convidados');
    } else if (regra.aCada > 0) {
      partes.push('Regra de equipe: 1 a cada ' + regra.aCada + ' convidados, mínimo ' + (regra.min || 0) +
        ' — ' + ctx.pax + ' ÷ ' + regra.aCada + ' = ' + _relNum(ctx.pax / regra.aCada) + ' → ' + _relNum(item.qtd));
    } else {
      partes.push('Regra de equipe: ' + (regra.min || 0) + ' fixo(s)' + (regra.acima > 0 ? ' acima de ' + regra.acima + ' convidados' : ''));
    }
    partes.push(item.manualPreco ? 'preço ajustado à mão' : 'preço do Cadastro de Cargos (' + ctx.localLabel + ')' + (ctx.anoTab ? ', tabela ' + ctx.anoTab : ''));
    return partes.join(' · ');
  }
  if (k === 'bonus-head') {
    var fator = Math.max(1, ctx.pax / 100);
    return 'Bônus fixo ' + _relR(item.total / fator) + ' × ' + _relNum(fator) + ' (' + ctx.pax + ' ÷ 100, mínimo 1)' +
      ' — Regras de Pagamento da Equipe' + (ctx.anoTab ? ', tabela ' + ctx.anoTab : '');
  }
  if (k === 'ca' || k === 'rf' || k === 'la' || (typeof getOrcItensLocaisExtras === 'function' && getOrcItensLocaisExtras().some(function(x) { return x.id === k; }))) {
    var porColab = (k === 'rf' || k === 'la') ||
      (typeof getOrcItensLocaisExtras === 'function' && getOrcItensLocaisExtras().some(function(x) { return x.id === k && x.tipo !== 'evento'; }));
    return (porColab ? ctx.colab + ' colaboradores × valor' : 'Valor por evento') + ' da tabela do local "' + ctx.localLabel + '"' +
      (ctx.anoTab ? ', tabela ' + ctx.anoTab : '') + ' (Preços, Equipe e Taxas)' + (item.manualPreco || item.manualQtd ? ' · ajustado à mão' : '');
  }
  var f = typeof buscarOrcFatorPorId === 'function' ? buscarOrcFatorPorId(k) : null;
  if (f) {
    var opc = '';
    if (!f.unicoValor && typeof _orcFatorOpcoes === 'function') {
      var chave = f.opcoesFonte === 'tiposEvento' ? (p.tipoEvento || 'outros')
        : (p[_orcFatorParamKey(f.id)] || f.chavePadrao || ((_orcFatorOpcoes(f)[0] || {}).chave));
      var o = _orcFatorOpcoes(f).find(function(x) { return x.chave === chave; });
      if (o) opc = ', opção "' + o.label + '"';
    }
    return (f.tipoValor === 'porConvidado' ? ctx.pax + ' convidados × valor por convidado' : 'Valor fixo por evento') +
      ' — Preços do Orçamento → ' + f.nome.replace(/\s*\([^)]*\)\s*$/, '') + opc + (item.manualPreco || item.manualQtd ? ' · ajustado à mão' : '');
  }
  return 'Cálculo automático' + (item.manualPreco || item.manualQtd ? ' · ajustado à mão' : '');
}

// Texto "de onde veio" de um insumo (quantidade e preço).
function _relOrigemInsumo(ins) {
  var q;
  if (ins.fonteQtd === 'estimativa') q = 'quantidade da Estimativa (consumo real)';
  else if (ins.manualQtd || ins.fonteQtd === 'manual') q = 'quantidade ajustada à mão';
  else if (ins.autoGlobal) q = 'quantidade da Regra do Orçamento';
  else if (ins.coqueteis && ins.coqueteis.length) q = 'quantidade do Cardápio (' + ins.coqueteis.join(', ') + ')';
  else q = 'quantidade incluída no orçamento';
  var pr = ins.manualPreco ? 'preço ajustado à mão'
    : (ins.viaRevenda ? 'preço de revenda da temporada' : 'preço do Cadastro de Insumos');
  return q + ' · ' + pr;
}

function _relQtdInsumo(ins) {
  var q = Number(ins.qtdGarrafas) || 0;
  var unid = typeof _orcGetUnit === 'function' ? _orcGetUnit(ins.nome) : '';
  if (unid === 'sem cadastro') unid = '';
  var emb = typeof _orcEmbCopo === 'function' ? _orcEmbCopo(ins) : 1;
  var txt = _relNum(q) + (unid ? ' ' + unid : '');
  if (emb > 1) txt += ' (' + Math.ceil(q / emb) + ' cx de ' + emb + ')';
  return txt;
}

// ─── Blocos de HTML ─────────────────────────────────────────────────────────

var _REL_CSS = '' +
  '.rel{font-size:12px;color:var(--text);max-width:980px}' +
  '.rel-box{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-bottom:14px}' +
  '.rel-tit{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;display:flex;justify-content:space-between;gap:10px}' +
  '.rel-tit span:last-child{font-family:var(--mono);color:var(--text);font-size:13px}' +
  '.rel-sub{font-size:11px;font-weight:700;color:var(--text2);margin:12px 0 4px;display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:3px}' +
  '.rel-sub span:last-child{font-family:var(--mono)}' +
  '.rel table{width:100%;border-collapse:collapse}' +
  '.rel td{padding:4px 6px;vertical-align:top;border-bottom:1px dashed var(--border)}' +
  '.rel td.n{font-family:var(--mono);text-align:right;white-space:nowrap}' +
  '.rel .orig{font-size:10px;color:var(--text3);margin-top:1px}' +
  '.rel .conta td{border-bottom:none;padding:3px 6px}' +
  '.rel .conta tr.tot td{border-top:1px solid var(--border2);font-weight:700}' +
  '.rel-pac{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:12px 16px;border-radius:var(--radius);margin-bottom:14px;border:2px solid}' +
  '.rel-pac b{font-family:var(--mono);font-size:20px}' +
  '.rel-pac small{display:block;font-size:11px;color:var(--text3);font-family:var(--mono);text-align:right}' +
  '.rel-nota{font-size:11px;color:var(--text3);margin-top:6px}';

function _relLinhaItem(nome, conta, total, origem) {
  return '<tr><td>' + _relEsc(nome) + (origem ? '<div class="orig">' + _relEsc(origem) + '</div>' : '') + '</td>' +
    '<td class="n" style="color:var(--text2)">' + _relEsc(conta) + '</td>' +
    '<td class="n" style="width:110px">' + _relR(total) + '</td></tr>';
}
function _relConta(linhas) {
  return '<table class="conta">' + linhas.map(function(l) {
    return '<tr' + (l.tot ? ' class="tot"' : '') + '><td>' + _relEsc(l.txt) + (l.det ? '<div class="orig">' + _relEsc(l.det) + '</div>' : '') + '</td>' +
      '<td class="n" style="width:130px">' + (l.val == null ? '' : _relR(l.val)) + '</td></tr>';
  }).join('') + '</table>';
}

function _relMontarHtml(orc) {
  var r = _orcCalcResumo(orc);
  var p = orc.calcParams || {};
  var pax = r.pax || 0;
  var localKey = typeof _migrarLocalOrcamento === 'function' ? _migrarLocalOrcamento(p) : (p.local || '');
  var localLabel = typeof _propostaLocalLabel === 'function' ? _propostaLocalLabel(p) : localKey;
  var anoTab = typeof _orcAnoTabela === 'function' ? _orcAnoTabela(orc) : null;
  var ctx = { p: p, pax: pax, colab: r.colab, localLabel: localLabel, anoTab: anoTab };

  var semValor = function(i) { return typeof _orcInsumoSemValor === 'function' && _orcInsumoSemValor(i); };
  var insCusto   = (r.insumos || []).filter(function(i) { return !i.viaRevenda && !semValor(i); });
  var insRevenda = (r.insumos || []).filter(function(i) { return i.viaRevenda && !semValor(i); });
  var insConsulta = (r.insumos || []).filter(semValor);
  var insCustoSemAlc = insCusto.filter(function(i) { return !_relEhBebidaAlc(i); });
  var insCustoAlc    = insCusto.filter(_relEhBebidaAlc);
  var revSemAlc = insRevenda.filter(function(i) { return !_relEhBebidaAlc(i); });
  var revAlc    = insRevenda.filter(_relEhBebidaAlc);
  var soma = function(l) { return l.reduce(function(s, i) { return s + (i.total || 0); }, 0); };
  var catDe = function(i) { return typeof _orcCatDoInsumo === 'function' ? _orcCatDoInsumo(i) : (i.cat || 'OUTROS'); };
  var linhasInsumos = function(lista) {
    var porCat = {};
    lista.forEach(function(i) { var c = catDe(i); (porCat[c] = porCat[c] || []).push(i); });
    var cats = Object.keys(porCat);
    if (typeof _orcOrdenarCats === 'function') { try { cats = _orcOrdenarCats(cats); } catch (e) { cats.sort(); } } else cats.sort();
    return cats.map(function(c) {
      var itens = porCat[c].slice().sort(function(a, b) { return String(a.nome).localeCompare(String(b.nome), 'pt-BR'); });
      return '<div class="rel-sub"><span>' + _relEsc(c) + '</span><span>' + _relR(soma(itens)) + '</span></div><table>' +
        itens.map(function(i) {
          return _relLinhaItem(i.nome, _relQtdInsumo(i) + ' × ' + _relR(i.custoGarrafa), i.total, _relOrigemInsumo(i));
        }).join('') + '</table>';
    }).join('');
  };

  // ── Cabeçalho
  var numero = typeof _propostaNumeroEfetivo === 'function' ? _propostaNumeroEfetivo(orc) : (orc.numeroProposta || '');
  var tipo = typeof _propostaTipoEvento === 'function' ? _propostaTipoEvento(orc) : (p.tipoEvento || '');
  var dataEvt = (typeof dataValidaISO !== 'function' || dataValidaISO(orc.dataEvento)) && orc.dataEvento
    ? orc.dataEvento : (typeof _orcInfo === 'function' ? _orcInfo(orc, 'dataEvento') : '');
  var cab = '<div class="rel-box">' +
    '<div style="font-size:15px;font-weight:700">Relatório financeiro — ' + _relEsc([numero, orc.nomeCliente].filter(Boolean).join(' · ')) + '</div>' +
    '<div style="font-size:12px;color:var(--text2);margin-top:4px">' + _relEsc([
      dataEvt ? 'Evento: ' + fd(dataEvt) : 'Evento sem data',
      pax + ' convidados',
      r.colab + ' colaboradores',
      'Local de preço: ' + localLabel,
      tipo ? 'Tipo: ' + tipo : '',
      anoTab ? 'Tabela de preços ' + anoTab : '',
    ].filter(Boolean).join(' · ')) + '</div>' +
    '<div class="rel-nota">Somente consulta — para alterar qualquer valor, use a aba Calculadora. Os números são os mesmos de lá.</div>' +
    '</div>';

  // ── 1. Custo real sem bebidas alcoólicas
  var secoes = typeof _orcSecoesCalc === 'function' ? _orcSecoesCalc() : [];
  var itensPorSecao = {};
  (r.itens || []).forEach(function(i) {
    var s = typeof _orcSecaoDoItem === 'function' ? _orcSecaoDoItem(i) : i.secao;
    (itensPorSecao[s] = itensPorSecao[s] || []).push(i);
  });
  var idsSecoes = secoes.map(function(s) { return s.id; });
  Object.keys(itensPorSecao).forEach(function(s) { if (idsSecoes.indexOf(s) === -1) { secoes.push({ id: s, label: s }); idsSecoes.push(s); } });
  var blocoItens = secoes.map(function(sec) {
    var itens = itensPorSecao[sec.id];
    if (!itens || !itens.length) return '';
    var rotulo = String(sec.label || sec.id).replace(/^[^\wÀ-ú]+\s*/, '');
    return '<div class="rel-sub"><span>' + _relEsc(rotulo.toUpperCase()) + '</span><span>' + _relR(soma(itens)) + '</span></div><table>' +
      itens.map(function(i) {
        return _relLinhaItem(i.nome, _relNum(i.qtd) + ' × ' + _relR(i.preco), i.total, _relOrigemItem(i, ctx));
      }).join('') + '</table>';
  }).join('');
  var notaConsulta = insConsulta.length
    ? '<div class="rel-nota">' + insConsulta.length + ' item(ns) de consulta (Material, Descartáveis etc.) não somam aqui — já são cobrados pelos itens por convidado acima.</div>'
    : '';
  var sec1 = '<div class="rel-box"><div class="rel-tit"><span>1. Custo real (sem bebidas alcoólicas)</span><span>' + _relR(r.custoPresenteEssencial) + '</span></div>' +
    blocoItens + (insCustoSemAlc.length ? linhasInsumos(insCustoSemAlc) : '') + notaConsulta + '</div>';

  // ── 2. Margens
  var revSemAlcTotal = soma(revSemAlc);
  var segEss = r.custoEstEssencial - r.custoPresenteEssencial;
  var lucEss = r.valorBaseEssencial - r.custoEstEssencial - revSemAlcTotal;
  var sec2 = '<div class="rel-box"><div class="rel-tit"><span>2. Margens</span><span></span></div>' +
    _relConta([
      { txt: 'Custo real', val: r.custoPresenteEssencial },
      { txt: '+ Margem de segurança', det: _relPct(r.margSeg) + ' × ' + _relR(r.custoPresenteEssencial), val: segEss },
      { txt: '= Custo estimado', val: r.custoEstEssencial, tot: true },
      { txt: '+ Margem de lucro', det: _relPct(r.margLuc) + ' × ' + _relR(r.custoEstEssencial), val: lucEss },
    ].concat(revSemAlc.length ? [{ txt: '+ Itens de revenda', det: 'já com preço de venda, sem margem', val: revSemAlcTotal }] : [])
     .concat([{ txt: '= Valor com margens', val: r.valorBaseEssencial, tot: true }])) +
    (revSemAlc.length ? '<div style="margin-top:8px">' + linhasInsumos(revSemAlc) + '</div>' : '') +
    '</div>';

  // ── 3. Taxas e adicionais (Essencial)
  var a = r.adicEssencial, adic = typeof _orcGetAdic === 'function' ? _orcGetAdic(orc) : null;
  var linhasTx = [];
  if (a.cerimonia > 0) linhasTx.push({ txt: '+ Cerimônia no local', det: _relR(adic.cerimonia.valor) + ' × ' + r.colab + ' colaboradores', val: a.cerimonia });
  if (a.horaExtra > 0) linhasTx.push({ txt: '+ Hora extra', det: _relNum(adic.horaExtra.horas) + ' h × (' + _relR(adic.horaExtra.valorColab) + ' × ' + r.colab + ' colaboradores + ' + _relPct(adic.horaExtra.pct) + ' × ' + _relR(a.base) + ')', val: a.horaExtra });
  if (a.imposto > 0) linhasTx.push({ txt: '+ Imposto / NF', det: _relPct(adic.imposto.pct) + ' × ' + _relR(a.subtotal) + ' (valor com margens + cerimônia + hora extra)', val: a.imposto });
  if (a.comissao > 0) linhasTx.push({ txt: '+ Comissão', det: _relPct(adic.comissao.pct) + ' × ' + _relR(a.subtotal) + ' (valor com margens + cerimônia + hora extra)', val: a.comissao });
  var sec3 = '<div class="rel-box"><div class="rel-tit"><span>3. Taxas e adicionais</span><span></span></div>' +
    (linhasTx.length ? _relConta([{ txt: 'Valor com margens', val: r.valorBaseEssencial }].concat(linhasTx))
      : '<div class="rel-nota">Nenhuma taxa ou adicional marcado neste orçamento.</div>') +
    '<div class="rel-nota">Percentuais e valores vêm de Preços, Equipe e Taxas; o orçamento só escolhe o que inclui.</div></div>';

  var pacote = function(nome, sub, valor, cor) {
    return '<div class="rel-pac" style="border-color:' + cor + '"><div><div style="font-weight:700;color:' + cor + '">' + nome + '</div>' +
      '<div style="font-size:11px;color:var(--text3)">' + sub + '</div></div>' +
      '<div><b style="color:' + cor + '">' + _relR(valor) + '</b>' + (pax > 0 ? '<small>' + _relR(valor) + ' ÷ ' + pax + ' = ' + _relR(valor / pax) + ' por pessoa</small>' : '') + '</div></div>';
  };
  var pacEss = pacote('PACOTE ESSENCIAL', 'custo real + margens + taxas (sem bebidas alcoólicas)', r.valorTotalEssencial, 'var(--blue)');

  // ── 4. Bebidas alcoólicas
  var difBeb = r.valorTotal - r.valorTotalEssencial;
  var sec4 = '';
  if (difBeb > 0.005 || insCustoAlc.length || revAlc.length) {
    var c = r.custoBebidasAlc, ac = r.adicCompleto;
    var segB = c * r.margSeg / 100, lucB = c * (1 + r.margSeg / 100) * r.margLuc / 100;
    var lb = [{ txt: 'Custo das bebidas', val: c }];
    if (c > 0) {
      lb.push({ txt: '+ Margem de segurança', det: _relPct(r.margSeg) + ' × ' + _relR(c), val: segB });
      lb.push({ txt: '+ Margem de lucro', det: _relPct(r.margLuc) + ' × ' + _relR(c + segB), val: lucB });
    }
    if (revAlc.length) lb.push({ txt: '+ Bebidas de revenda', det: 'já com preço de venda, sem margem', val: soma(revAlc) });
    if (ac.horaExtra - a.horaExtra > 0.005) lb.push({ txt: '+ Hora extra sobre as bebidas', det: _relPct(adic.horaExtra.pct) + ' por hora sobre o valor delas', val: ac.horaExtra - a.horaExtra });
    if (ac.imposto - a.imposto > 0.005) lb.push({ txt: '+ Imposto / NF sobre as bebidas', det: _relPct(adic.imposto.pct), val: ac.imposto - a.imposto });
    if (ac.comissao - a.comissao > 0.005) lb.push({ txt: '+ Comissão sobre as bebidas', det: _relPct(adic.comissao.pct), val: ac.comissao - a.comissao });
    lb.push({ txt: '= Total bebidas', val: difBeb, tot: true });
    sec4 = '<div class="rel-box"><div class="rel-tit"><span>4. Bebidas alcoólicas (só no Pacote Completo)</span><span>' + _relR(difBeb) + '</span></div>' +
      linhasInsumos(insCustoAlc.concat(revAlc)) + '<div style="margin-top:10px">' + _relConta(lb) + '</div></div>';
  }
  var pacComp = pacote('PACOTE COMPLETO', 'Pacote Essencial + bebidas alcoólicas', r.valorTotal, 'var(--green)');

  // ── 5. Resultado
  var linhaRes = function(nome, venda, custo) {
    var sobra = venda - custo;
    return '<tr><td>' + nome + '</td><td class="n">' + _relR(venda) + '</td><td class="n">' + _relR(custo) + '</td>' +
      '<td class="n" style="font-weight:700">' + _relR(sobra) + '</td><td class="n">' + (venda > 0 ? Math.round(sobra / venda * 100) + '%' : '—') + '</td></tr>';
  };
  var sec5 = '<div class="rel-box"><div class="rel-tit"><span>5. Resultado</span><span></span></div>' +
    '<table><tr style="font-size:10px;color:var(--text3);text-transform:uppercase"><td></td><td class="n">Cliente paga</td><td class="n">Custo real</td><td class="n">Sobra</td><td class="n">% sobre venda</td></tr>' +
    linhaRes('Pacote Essencial', r.valorTotalEssencial, r.custoPresenteEssencial) +
    linhaRes('Pacote Completo', r.valorTotal, r.custoPresente) + '</table>' +
    '<div class="rel-nota">A sobra inclui margem de segurança, margem de lucro, revenda e as taxas (cerimônia, hora extra, imposto e comissão, que em parte são repassadas).</div></div>';

  return '<style>' + _REL_CSS + '</style><div class="rel">' + cab + sec1 + sec2 + sec3 + pacEss + sec4 + pacComp + sec5 + '</div>';
}

function rOrcRelatorio(orc) {
  var el = document.getElementById('orc-det-content');
  if (!el || !orc) return;
  var html;
  try { html = _relMontarHtml(orc); }
  catch (e) {
    console.error(e);
    el.innerHTML = '<div class="rel-box" style="color:var(--red)">Não consegui montar o relatório: ' + _relEsc(e.message) + '</div>';
    return;
  }
  el.innerHTML = '<div style="display:flex;justify-content:flex-end;margin-bottom:10px">' +
    '<button class="btn-sm" onclick="orcRelatorioImprimir()" style="background:var(--bg2)">Imprimir / PDF</button></div>' + html;
}

// Abre o relatório numa janela própria (fundo branco) e chama a impressão —
// dali dá pra salvar em PDF.
function orcRelatorioImprimir() {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcAtualId; });
  if (!orc) return;
  var w = window.open('', '_blank');
  if (!w) { alert2('O navegador bloqueou a janela de impressão — libere pop-ups para este site.', 'error'); return; }
  var vars = ':root{--bg2:#fff;--bg3:#f5f5f5;--border:#ddd;--border2:#bbb;--text:#111;--text2:#444;--text3:#777;' +
    '--blue:#B4532A;--green:#2F6B3A;--red:#B91C1C;--radius:6px;--mono:Consolas,monospace}' +
    'body{font-family:Arial,sans-serif;margin:16px;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.rel-box,.rel-pac{break-inside:avoid}';
  var titulo = nomeArquivoPadrao(typeof _propostaNumeroEfetivo === 'function' ? _propostaNumeroEfetivo(orc) : '', 'RELATÓRIO ' + (orc.nomeCliente || ''), orc.dataEvento, '');
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + _relEsc(titulo) + '</title><style>' + vars + '</style></head><body>' +
    _relMontarHtml(orc) + '</body></html>');
  w.document.close();
  w.focus();
  setTimeout(function() { w.print(); }, 300);
}
