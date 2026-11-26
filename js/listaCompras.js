// ─── LISTA DE COMPRAS DO MÊS (aba em Comprado x Utilizado) ──────────────────
// Pedido 11-26: depois de gerar as Folhas de Separação do mês, montar a lista
// de compras: soma o que as folhas pedem, desconta o estoque atual do Sistema
// Separação e mostra a diferença a comprar.
//
// Necessário = soma de sep.itens[cat][nome] (sempre em unidade solta — copo
// também, a folha grava convertido) das folhas com data no mês. Bebida marcada
// "Cliente" na folha não entra (não vamos levar).
// Comprar = necessário + estoque mínimo (opcional) − estoque atual.
// Item de caixa fechada (Cadastro de Insumos → tamanhoEmbalagem) mostra também
// em caixas, arredondando pra cima.
// Linhas = itens do Cadastro de Insumos (mesmo índice da tela, _cuCanon);
// nome fora do cadastro vai pra caixa à parte, nunca vira linha.
// Nada é gravado, a não ser as categorias que ela tira da lista
// (D.compraUso.listaCatsFora).

var _lcMes = null;            // 'AAAA-MM'
var _lcComPassadas = false;   // incluir festas do mês que já passaram
var _lcComMinimo = true;      // somar estoque mínimo
var _lcSoComprar = true;      // mostrar só o que falta comprar
var _lcFolhasFora = {};       // id da folha -> true (tirada da conta, não salva)
var _lcUltima = null;         // última lista calculada (imprimir / copiar)

function _lcHoje() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function _lcTamCaixa(ins) {
  var m = ins ? (parseFloat(ins.tamanhoEmbalagem) || 0) : 0;
  return m > 1 ? m : 0;
}
function _lcQtdTxt(un, ins) {
  var m = _lcTamCaixa(ins);
  var n = Math.ceil(un - 1e-9);
  if (!m) return _cuNum(n);
  var cx = Math.ceil(n / m - 1e-9);
  return cx + ' cx <span style="font-size:10px;color:var(--text3)">(faltam ' + _cuNum(n) + ' un)</span>';
}
// Quantidade em un, com o equivalente em caixas quando o item é de caixa.
function _lcQtdPlano(un, ins) {
  var n = Math.round(Number(un) || 0);
  var m = _lcTamCaixa(ins);
  if (!m || n <= 0) return _cuNum(n);
  var cx = Math.floor(n / m), sol = n - cx * m;
  return _cuNum(n) + ' <span style="font-size:10px;color:var(--text3)">(' + cx + ' cx' + (sol ? ' + ' + sol : '') + ')</span>';
}
function _lcQtdTxtSimples(un, ins) {
  var m = _lcTamCaixa(ins);
  var n = Math.ceil(un - 1e-9);
  if (!m) return _cuNum(n) + ' ' + (_cuUn({ ins: ins }) || 'un').toLowerCase();
  return Math.ceil(n / m - 1e-9) + ' cx de ' + m + ' (faltam ' + _cuNum(n) + ' un)';
}

// Folhas do mês (respeitando "incluir passadas") e eventos do mês sem folha.
function _lcFolhasDoMes(anoMes) {
  var hoje = _lcHoje();
  var folhas = (D.separacoes || []).filter(function(s) {
    var d = s.data || '';
    if (d.slice(0, 7) !== anoMes) return false;
    if (!_lcComPassadas && d < hoje) return false;
    return true;
  }).sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); });
  var comFolha = {};
  (D.separacoes || []).forEach(function(s) { if (s.producaoId) comFolha[s.producaoId] = 1; });
  var semFolha = (D.producoes || []).filter(function(p) {
    var d = p.data || '';
    if (d.slice(0, 7) !== anoMes || comFolha[p.id]) return false;
    if (p.status && /cancel/i.test(p.status)) return false;
    if (!_lcComPassadas && d < hoje) return false;
    return true;
  }).sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); });
  return { folhas: folhas, semFolha: semFolha };
}

// Soma das folhas. Devolve { linhas: {chave: {...}}, semCad: {...}, nCliente }
function _lcSomar(folhas) {
  var linhas = {}, nCliente = 0;
  folhas.forEach(function(s) {
    if (_lcFolhasFora[s.id]) return;
    var itens = s.itens || {}, forn = s.fornecedores || {};
    Object.keys(itens).forEach(function(cat) {
      Object.keys(itens[cat] || {}).forEach(function(nome) {
        var q = parseFloat(itens[cat][nome]) || 0;
        var f = String(((forn[cat] || {})[nome]) || '').toLowerCase();
        if (f === 'cliente') { nCliente++; return; }
        if (q <= 0) return;
        var k = _cuCanon(nome);
        if (!k) return;
        if (!linhas[k]) linhas[k] = { k: k, nomeFolha: nome, cat: cat, total: 0, festas: [], consignado: false };
        var l = linhas[k];
        l.total += q;
        l.festas.push({ evento: s.evento || s.cliente || '—', data: s.data || '', qtd: q, forn: f, conv: s.convidados });
        if (f === 'consignado') l.consignado = true;
      });
    });
  });
  return { linhas: linhas, nCliente: nCliente };
}

// Preço para estimar o valor da compra: custo de reposição do Cadastro de
// Insumos; sem ele, o último custo lançado na Entrada de NF. O preço vale pela
// unidade de compra do insumo — se ela é caixa/fardo/pacote e o item tem
// "Qtd por embalagem", o valor é por caixa.
var _lcUltNF = null;
function _lcUltimoCustoNF(k) {
  if (!_lcUltNF) {
    _lcUltNF = {};
    (D.entradas || []).forEach(function(e) {
      var c = Number(e.custo) || 0;
      if (c <= 0) return;
      var kk = _cuCanon(e.prod);
      var d = String(e.data || '');
      if (kk && (!_lcUltNF[kk] || d >= _lcUltNF[kk].data)) _lcUltNF[kk] = { data: d, custo: c };
    });
    setTimeout(function() { _lcUltNF = null; }, 0);
  }
  return _lcUltNF[k] || null;
}
function _lcPreco(k, ins) {
  var porCx = !!(_lcTamCaixa(ins) && /^(CX|CAIXA|FD|FARDO|PCT|PACOTE)/i.test(String((ins && ins.unidadeCompra) || '')));
  var v = ins ? Number(ins.custoReposicao) || 0 : 0;
  if (v > 0) return { valor: v, porCx: porCx, fonte: 'custo de reposição do Cadastro de Insumos' };
  var nf = _lcUltimoCustoNF(k);
  if (nf) return { valor: nf.custo, porCx: porCx, fonte: 'último custo na Entrada de NF (' + (fd(nf.data) || nf.data) + ')' };
  return { valor: 0, porCx: porCx, fonte: '' };
}
var _lcModo = 'sintetico';    // 'sintetico' | 'analitico'

// ─── RECEITA DO MIX (Fichas Técnicas do Sistema Separação) ──────────────────
// Pedido 11-26: mix é produzido, não comprado. A receita fica na Ficha Técnica
// de produção do Sistema Separação (rendimento + insumos por receita). Aqui o
// que falta do mix (precisa − estoque) vira necessidade dos insumos dele, na
// proporção da ficha. Ex.: MIX AURORA rende 1 garrafa com 0,5 de xarope de
// tangerina + 0,5 de maracujá → 16 garrafas a produzir = 8 + 8 de xarope.
// Só leitura; lido ao abrir a tela (e pelo botão Atualizar receitas).
var _lcFichas = null;          // null = não carregado; [] = carregado
var _lcFichasHora = '';
var _lcFichasCarregando = false;
function _lcCarregarFichas(forcar) {
  if (_lcFichasCarregando || (_lcFichas && !forcar)) return;
  if (typeof window.buscarFichasTecnicasSeparacao !== 'function' || !_cuEstoque) return;
  _lcFichasCarregando = true;
  window.buscarFichasTecnicasSeparacao().then(function(lista) {
    _lcFichasCarregando = false;
    if (!lista) return;
    _lcFichas = lista;
    _lcFichasHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    _cuRenderSeVisivel();
  }, function() { _lcFichasCarregando = false; });
}
function lcAtualizarReceitas() { _lcCarregarFichas(true); }
// chave do produto (mesma do Cadastro de Insumos) → ficha
function _lcMapaFichas() {
  var m = {};
  (_lcFichas || []).forEach(function(f) {
    var rend = Number(f.rendimento) || 0;
    if (!f.nome || rend <= 0 || !(f.ingredientes || []).length) return;
    var k = _cuCanon(f.nome);
    if (k && !m[k]) m[k] = f;
  });
  return m;
}

function _lcCalcular() {
  if (!_lcMes) _lcMes = _cuAnoMes(new Date());
  var per = _lcFolhasDoMes(_lcMes);
  var soma = _lcSomar(per.folhas);
  var base = soma.linhas;
  var mapa = _cuMapaProdutos();
  var conectado = !!_cuEstoque;
  var fichas = _lcMapaFichas();

  var estDe = function(k, info) {
    if (conectado) { var e = _cuEstoqueDe(info); return e ? e.qtd : null; }
    return _cuTem(_cuEstoqueManual, k) ? _cuEstoqueManual[k] : null;
  };
  var minDe = function(info) { return _lcComMinimo && info.ins ? (Number(info.ins.estoqueMinimo) || 0) : 0; };

  // Ordem: um mix só é calculado depois de todo mix que o usa como insumo
  // (mix dentro de mix). Ciclo na receita é ignorado.
  var pais = {};
  Object.keys(fichas).forEach(function(mk) {
    (fichas[mk].ingredientes || []).forEach(function(ing) {
      var ik = _cuCanon(ing.nome || ing.nomeKey);
      if (ik) (pais[ik] = pais[ik] || []).push(mk);
    });
  });
  var produzir = {}, feito = {}, visitando = {};
  var processar = function(mk) {
    if (feito[mk] || visitando[mk]) return;
    visitando[mk] = true;
    (pais[mk] || []).forEach(processar);
    visitando[mk] = false;
    feito[mk] = true;
    var l = base[mk];
    if (!l || !(l.total > 0) || _cuSemCadastro(mk)) return;
    var info = _cuInfo(mapa, mk);
    var qtd = Math.max(0, Math.ceil(l.total + minDe(info) - (Number(estDe(mk, info)) || 0) - 1e-9));
    produzir[mk] = qtd;
    if (!qtd) return;
    var f = fichas[mk];
    var fator = qtd / Number(f.rendimento);
    (f.ingredientes || []).forEach(function(ing) {
      var ik = _cuCanon(ing.nome || ing.nomeKey);
      var q = (Number(ing.qtd) || 0) * fator;
      if (!ik || q <= 0) return;
      if (!base[ik]) base[ik] = { k: ik, nomeFolha: ing.nome, cat: '', total: 0, festas: [], consignado: false };
      base[ik].total += q;
      base[ik].festas.push({ evento: 'Para produzir ' + qtd + ' ' + (f.unidadeRendimento || 'un') + ' de ' + _cuInfo(mapa, mk).nome, data: '', qtd: q, forn: 'producao' });
    });
  };
  Object.keys(fichas).forEach(processar);

  var semCad = {}, linhas = [];
  Object.keys(base).forEach(function(k) {
    var l = base[k];
    if (_cuSemCadastro(k)) { semCad[k] = { c: 0, u: l.total }; return; }
    var info = _cuInfo(mapa, k);
    var cat = _cuCatDe(info);
    var est = estDe(k, info);
    var minimo = minDe(info);
    var falta = Math.max(0, Math.ceil(l.total + minimo - (Number(est) || 0) - 1e-9));
    var ehMix = !!fichas[k];
    var pr = _lcPreco(k, info.ins);
    var qtdCobrada = pr.porCx ? Math.ceil(falta / _lcTamCaixa(info.ins) - 1e-9) : falta;
    linhas.push({ k: k, info: info, cat: cat, total: l.total, festas: l.festas, consignado: l.consignado,
      est: est, minimo: minimo, ficha: ehMix ? fichas[k] : null,
      produzir: ehMix ? falta : 0, comprar: ehMix ? 0 : falta,
      preco: pr, valor: (!ehMix && pr.valor) ? qtdCobrada * pr.valor : 0 });
  });
  return { per: per, linhas: linhas, semCad: semCad, nCliente: soma.nCliente, conectado: conectado,
    nFichas: Object.keys(fichas).length };
}

function _lcRender(cont) {
  _lcCarregarFichas();
  var r = _lcCalcular();
  var fora = _cuCatsFora();
  var busca = _cuBusca();
  var mapa = _cuMapaProdutos();
  var ordemCat = _cuOrdemCategorias();

  var bk = _cuFiltraBusca(r.linhas.map(function(l) { return l.k; }), mapa, busca);
  var visiveis = r.linhas.filter(function(l) {
    if (fora[l.cat]) return false;
    if (bk.indexOf(l.k) < 0) return false;
    if (_lcSoComprar && l.comprar <= 0 && l.produzir <= 0) return false;
    return true;
  });
  visiveis.sort(function(a, b) { return ordemCat(a.cat, b.cat) || a.info.nome.localeCompare(b.info.nome, 'pt-BR'); });
  _lcUltima = { mes: _lcMes, modo: _lcModo, linhas: visiveis.filter(function(l) { return l.comprar > 0; }),
    produzir: visiveis.filter(function(l) { return l.produzir > 0; }), folhas: r.per.folhas.filter(function(s) { return !_lcFolhasFora[s.id]; }) };

  var aComprar = _lcUltima.linhas;
  var nComprar = aComprar.length;
  var valorTotal = aComprar.reduce(function(s, l) { return s + l.valor; }, 0);
  var semPreco = aComprar.filter(function(l) { return !l.preco.valor; }).length;
  var nFolhasConta = _lcUltima.folhas.length;
  var semEstoque = r.conectado ? visiveis.filter(function(l) { return l.est == null; }).length : 0;

  var p = _lcMes.split('-');
  var nomeMes = _CU_MESES[parseInt(p[1], 10) - 1] + ' ' + p[0];
  var anoAtual = new Date().getFullYear();

  var html = '<div class="sec" style="padding:12px 14px">' +
    '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">' +
      _cuOpcoesMesAno('cu-lc', _lcMes, '_lcMes=_cuMesAtualSelecionado(\'cu-lc\');rCompraUso()', false, [String(anoAtual), String(anoAtual + 1)]) +
      '<label style="font-size:12px;display:flex;gap:5px;align-items:center"><input type="checkbox"' + (_lcComPassadas ? ' checked' : '') + ' onchange="_lcComPassadas=this.checked;rCompraUso()">Incluir festas que já passaram</label>' +
      '<label style="font-size:12px;display:flex;gap:5px;align-items:center"><input type="checkbox"' + (_lcComMinimo ? ' checked' : '') + ' onchange="_lcComMinimo=this.checked;rCompraUso()">Somar estoque mínimo</label>' +
      '<label style="font-size:12px;display:flex;gap:5px;align-items:center"><input type="checkbox"' + (_lcSoComprar ? ' checked' : '') + ' onchange="_lcSoComprar=this.checked;rCompraUso()">Só o que falta comprar</label>' +
      _cuCampoBusca(busca) +
    '</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-top:8px">' + _cuStatusEstoque() + '</div>' +
    (r.conectado ? '<div style="font-size:11px;color:var(--text3);margin-top:4px">' +
      (_lcFichas ? 'Receitas de mix (Fichas Técnicas do Sistema Separação): ' + r.nFichas + ' com rendimento e insumos' + (_lcFichasHora ? ', lidas às ' + _lcFichasHora : '') + '. Mix que falta vira os insumos da receita.' : 'Lendo as receitas de mix do Sistema Separação...') +
      ' <button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2);margin-left:4px" onclick="lcAtualizarReceitas()">Atualizar receitas</button></div>' : '') +
    '<div style="font-size:11px;color:var(--text3);margin-top:4px">Necessário = soma das Folhas de Separação do mês' + (_lcComPassadas ? '' : ' (de hoje em diante — as que já passaram já saíram do estoque)') + '. Comprar = necessário' + (_lcComMinimo ? ' + estoque mínimo' : '') + ' − estoque atual. Bebida marcada Cliente na folha não entra. Valor estimado = custo de reposição do Cadastro de Insumos (sem ele, último custo da Entrada de NF).</div>' +
  '</div>';

  html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">' +
    _cuCard('Folhas na conta', nFolhasConta, nomeMes) +
    _cuCard('Eventos sem folha', r.per.semFolha.length, r.per.semFolha.length ? 'gere a folha para entrar na lista' : 'todos com folha', r.per.semFolha.length ? 'var(--amber)' : 'var(--green)') +
    _cuCard('Itens a comprar', nComprar, '', nComprar ? 'var(--red)' : 'var(--green)') +
    (_lcUltima.produzir.length ? _cuCard('Mix a produzir', _lcUltima.produzir.length, 'insumos já somados na compra', 'var(--amber)') : '') +
    _cuCard('Valor estimado', fR(valorTotal), semPreco ? semPreco + ' item(ns) sem preço' : 'todos com preço', semPreco ? 'var(--amber)' : '') +
  '</div>';

  if (r.per.semFolha.length) {
    html += '<div class="sec" style="padding:10px 14px;border-left:3px solid var(--amber)">' +
      '<div style="font-size:12px;font-weight:600;color:var(--amber);margin-bottom:4px">Eventos do mês ainda sem Folha de Separação (não entram na lista)</div>' +
      '<div style="font-size:12px;color:var(--text2)">' + r.per.semFolha.map(function(p) {
        return _cuEsc((fd(p.data) || '') + ' ' + (p.evento || p.cliente || '—'));
      }).join(' · ') + '</div></div>';
  }

  // Folhas (dá pra tirar uma da conta)
  html += '<details class="sec" style="padding:10px 14px"' + (r.per.folhas.length && r.per.folhas.length <= 6 ? ' open' : '') + '>' +
    '<summary style="cursor:pointer;font-size:12px;font-weight:600">Folhas do mês (' + nFolhasConta + ' de ' + r.per.folhas.length + ' na conta)</summary>' +
    (r.per.folhas.length ? '<div style="display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:8px">' + r.per.folhas.map(function(s) {
      return '<label style="font-size:12px;display:flex;gap:5px;align-items:center"><input type="checkbox"' + (_lcFolhasFora[s.id] ? '' : ' checked') +
        ' onchange="_lcFolhaToggle(\'' + _cuJs(s.id) + '\',this.checked)">' + _cuEsc((fd(s.data) || '') + ' ' + (s.evento || '—')) +
        ' <span style="color:var(--text3)">' + (s.convidados || '—') + ' conv.</span></label>';
    }).join('') + '</div>' : '<div style="font-size:12px;color:var(--text3);margin-top:6px">Nenhuma folha gerada para ' + nomeMes + '.</div>') +
  '</details>';

  // Cabeçalho da lista + Sintético / Analítico
  var btnModo = function(m, txt) {
    return '<button class="sort-btn' + (_lcModo === m ? ' active' : '') + '" onclick="_lcModo=\'' + m + '\';rCompraUso()">' + txt + '</button>';
  };
  html += '<div class="sec" style="padding:0;overflow-x:auto">' +
    '<div style="display:flex;gap:8px;padding:10px 14px;align-items:center;flex-wrap:wrap">' +
      '<span class="sec-title" style="font-size:13px">Lista de compras — ' + nomeMes + '</span>' +
      btnModo('sintetico', 'Sintético') + btnModo('analitico', 'Analítico') +
      (semEstoque ? '<span style="font-size:11px;color:var(--amber)">' + semEstoque + ' item(ns) não achados no estoque (contam como 0)</span>' : '') +
      '<div style="margin-left:auto;display:flex;gap:6px">' +
        '<button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2)" onclick="lcCopiar()">Copiar lista</button>' +
        '<button class="btn-sm" style="background:var(--blue)" onclick="lcImprimir()">Imprimir lista</button>' +
      '</div>' +
    '</div>';

  if (!visiveis.length) {
    html += '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">' +
      (r.linhas.length ? (_lcSoComprar ? 'O estoque cobre tudo o que as folhas pedem.' : 'Nada com esse filtro.') : 'Nenhum item nas folhas deste período.') + '</div>';
  } else if (_lcModo === 'sintetico') {
    html += _lcHtmlSintetico(visiveis, valorTotal);
  } else {
    html += _lcHtmlAnalitico(visiveis, r.conectado);
  }
  html += '</div>';

  if (r.nCliente) html += '<div style="font-size:11px;color:var(--text3);margin:6px 2px">' + r.nCliente + ' bebida(s) marcada(s) como Cliente nas folhas — fora da lista.</div>';
  html += _cuCaixaSemCadastro(r.semCad, 'folha');
  cont.innerHTML = html;
}

function _lcCorComprar(l) { return l.comprar > 0 ? 'var(--red)' : (l.produzir > 0 ? 'var(--amber)' : 'var(--green)'); }
function _lcTxtComprar(l) {
  if (l.comprar > 0) return _lcQtdTxt(l.comprar, l.info.ins);
  if (l.produzir > 0) return 'produzir ' + _cuNum(l.produzir) + ' <span style="font-size:10px;color:var(--text3)">(receita)</span>';
  return 'ok';
}
function _lcValorTxt(l) {
  if (l.comprar <= 0) return '—';
  if (!l.preco.valor) return '<span style="font-size:10px;color:var(--amber)">sem preço</span>';
  return fR(l.valor);
}

// SINTÉTICO: resumo por categoria + uma linha por item (o que comprar e quanto custa).
function _lcHtmlSintetico(linhas, valorTotal) {
  var porCat = {}, ordem = [];
  linhas.forEach(function(l) {
    if (!porCat[l.cat]) { porCat[l.cat] = { itens: [], comprar: 0, valor: 0, semPreco: 0 }; ordem.push(l.cat); }
    var c = porCat[l.cat];
    c.itens.push(l);
    if (l.comprar > 0) { c.comprar++; c.valor += l.valor; if (!l.preco.valor) c.semPreco++; }
  });
  var html = '<table class="tbl" style="width:100%;font-size:12px;margin-bottom:6px"><thead><tr>' +
    '<th style="text-align:left">Categoria</th><th style="text-align:right">Itens a comprar</th><th style="text-align:right">Valor estimado</th><th style="text-align:right">% do total</th></tr></thead><tbody>' +
    ordem.map(function(cat) {
      var c = porCat[cat];
      return '<tr><td>' + _cuEsc(cat) + '</td><td style="text-align:right;font-family:var(--mono)">' + c.comprar + '</td>' +
        '<td style="text-align:right;font-family:var(--mono)">' + fR(c.valor) + (c.semPreco ? ' <span style="font-size:10px;color:var(--amber)">+' + c.semPreco + ' sem preço</span>' : '') + '</td>' +
        '<td style="text-align:right;font-family:var(--mono);color:var(--text3)">' + (valorTotal ? Math.round(c.valor / valorTotal * 100) + '%' : '—') + '</td></tr>';
    }).join('') +
    '<tr style="font-weight:700"><td>Total</td><td style="text-align:right;font-family:var(--mono)">' +
      ordem.reduce(function(s, cat) { return s + porCat[cat].comprar; }, 0) + '</td><td style="text-align:right;font-family:var(--mono)">' + fR(valorTotal) + '</td><td></td></tr>' +
    '</tbody></table>';

  html += '<table class="tbl" style="width:100%;font-size:12px"><thead><tr>' +
    '<th style="text-align:left">Item</th><th style="text-align:right">Precisa</th><th style="text-align:right">Tem em estoque</th><th style="text-align:right">Falta comprar</th><th style="text-align:right">Valor estimado</th></tr></thead><tbody>';
  ordem.forEach(function(cat) {
    html += '<tr><td colspan="5" style="background:var(--bg3);font-weight:600;font-size:11px;text-transform:uppercase;color:var(--text2)">' + _cuEsc(cat) + '</td></tr>';
    porCat[cat].itens.forEach(function(l) {
      html += '<tr><td>' + _cuEsc(l.info.nome) + (l.consignado ? ' <span style="font-size:10px;color:var(--purple)">consignado</span>' : '') + '</td>' +
        '<td style="text-align:right;font-family:var(--mono)" title="' + (l.minimo ? 'Folhas: ' + _cuDec(l.total) + ' + mínimo ' + _cuDec(l.minimo) : 'Soma das folhas') + '">' + _lcQtdPlano(l.total + l.minimo, l.info.ins) + '</td>' +
        '<td style="text-align:right;font-family:var(--mono)">' + (l.est != null ? _lcQtdPlano(l.est, l.info.ins) : '<span style="font-size:10px;color:var(--amber)">não achado</span>') + '</td>' +
        '<td style="text-align:right;font-family:var(--mono);font-weight:700;color:' + _lcCorComprar(l) + '">' + _lcTxtComprar(l) + '</td>' +
        '<td style="text-align:right;font-family:var(--mono)">' + _lcValorTxt(l) + '</td></tr>';
    });
  });
  return html + '</tbody></table>';
}

// ANALÍTICO: cada item com a conta inteira e quanto cada festa pede.
function _lcHtmlAnalitico(linhas, conectado) {
  var nCol = _lcComMinimo ? 7 : 6;
  var html = '<table class="tbl" style="width:100%;font-size:12px"><thead><tr>' +
    '<th style="text-align:left">Item / festa</th><th style="text-align:right">Necessário</th><th style="text-align:right">Estoque</th>' +
    (_lcComMinimo ? '<th style="text-align:right">Mínimo</th>' : '') +
    '<th style="text-align:right">Comprar</th><th style="text-align:right">Preço</th><th style="text-align:right">Valor estimado</th></tr></thead><tbody>';
  var catAtual = null;
  linhas.forEach(function(l) {
    if (l.cat !== catAtual) {
      catAtual = l.cat;
      html += '<tr><td colspan="' + nCol + '" style="background:var(--bg3);font-weight:600;font-size:11px;text-transform:uppercase;color:var(--text2)">' + _cuEsc(l.cat) + '</td></tr>';
    }
    var estTxt;
    if (l.est != null) estTxt = _cuNum(l.est);
    else if (conectado) estTxt = '<span style="font-size:10px;color:var(--amber)" title="Nome e apelidos do insumo não encontrados no estoque do Sistema Separação">não achado</span>';
    else estTxt = '<input class="inp" type="number" min="0" style="width:70px;text-align:right;padding:2px 4px" value="' + (_cuTem(_cuEstoqueManual, l.k) ? _cuEstoqueManual[l.k] : '') + '" placeholder="0" onchange="cuEstoqueManual(\'' + _cuJs(l.k) + '\',this.value)">';
    var precoTxt = l.preco.valor
      ? '<span title="' + _cuEsc(l.preco.fonte) + '">' + fR(l.preco.valor) + (l.preco.porCx ? '/cx' : '') + '</span>'
      : '<span style="font-size:10px;color:var(--amber)">sem preço</span>';
    html += '<tr style="border-top:2px solid var(--border2)">' +
      '<td style="font-weight:600">' + _cuEsc(l.info.nome) + (l.consignado ? ' <span style="font-size:10px;color:var(--purple)">consignado</span>' : '') + '</td>' +
      '<td style="text-align:right;font-family:var(--mono);font-weight:600">' + _cuNum(Math.ceil(l.total - 1e-9)) + '</td>' +
      '<td style="text-align:right;font-family:var(--mono)">' + estTxt + '</td>' +
      (_lcComMinimo ? '<td style="text-align:right;font-family:var(--mono);color:var(--text3)">' + (l.minimo ? _cuNum(l.minimo) : '—') + '</td>' : '') +
      '<td style="text-align:right;font-family:var(--mono);font-weight:700;color:' + _lcCorComprar(l) + '">' + _lcTxtComprar(l) + '</td>' +
      '<td style="text-align:right;font-family:var(--mono);color:var(--text3)">' + precoTxt + '</td>' +
      '<td style="text-align:right;font-family:var(--mono)">' + _lcValorTxt(l) + '</td>' +
    '</tr>';
    l.festas.slice().sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); }).forEach(function(f) {
      html += '<tr style="color:var(--text3);font-size:11px">' +
        '<td style="padding-left:22px">' + _cuEsc((fd(f.data) || '') + ' ' + f.evento) + (f.forn === 'consignado' ? ' (consignado)' : '') + '</td>' +
        '<td style="text-align:right;font-family:var(--mono)">' + _cuDec(f.qtd) + '</td>' +
        '<td colspan="' + (nCol - 2) + '"></td></tr>';
    });
  });
  return html + '</tbody></table>';
}

function _lcFolhaToggle(id, dentro) {
  if (dentro) delete _lcFolhasFora[id]; else _lcFolhasFora[id] = true;
  rCompraUso();
}

function lcDetalhe(k) {
  var r = _lcCalcular();
  var l = r.linhas.find(function(x) { return x.k === k; });
  if (!l) return;
  var txt = l.info.nome + '\n\n' + l.festas.map(function(f) {
    return (fd(f.data) || '') + '  ' + f.evento + ': ' + _cuDec(f.qtd) + (f.forn === 'consignado' ? ' (consignado)' : '');
  }).join('\n') + '\n\nTotal: ' + _cuDec(l.total) +
    '\nEstoque: ' + (l.est != null ? _cuDec(l.est) : 'não achado (0)') +
    (_lcComMinimo ? '\nMínimo: ' + _cuDec(l.minimo) : '') +
    (l.ficha ? '\nProduzir: ' + _cuNum(l.produzir) + ' (receita: rende ' + _cuDec(l.ficha.rendimento) + ' ' + (l.ficha.unidadeRendimento || '') + ' com ' +
      (l.ficha.ingredientes || []).map(function(i) { return _cuDec(i.qtd) + ' ' + (i.unidade || '') + ' ' + i.nome; }).join(' + ') + ')'
      : '\nComprar: ' + (l.comprar > 0 ? _lcQtdTxtSimples(l.comprar, l.info.ins) : 'nada'));
  sisDialogo(txt, function() {}, { ok: 'Fechar' });
}

function _lcTextoLista() {
  var u = _lcUltima;
  if (!u) return '';
  var p = u.mes.split('-');
  var linhas = ['LISTA DE COMPRAS - ' + _CU_MESES[parseInt(p[1], 10) - 1].toUpperCase() + ' ' + p[0], ''];
  var cat = null;
  u.linhas.forEach(function(l) {
    if (l.cat !== cat) { if (cat !== null) linhas.push(''); cat = l.cat; linhas.push(String(cat).toUpperCase()); }
    linhas.push('- ' + l.info.nome + ': comprar ' + _lcQtdTxtSimples(l.comprar, l.info.ins) + ' (precisa ' + _cuNum(Math.ceil(l.total + l.minimo - 1e-9)) + ', tem ' + (l.est != null ? _cuNum(l.est) : '0') + ')' + (l.consignado ? ' (consignado)' : ''));
  });
  if (u.produzir.length) {
    linhas.push('', 'MIX A PRODUZIR (insumos já estão na lista acima)');
    u.produzir.forEach(function(l) { linhas.push('- ' + l.info.nome + ': produzir ' + _cuNum(l.produzir)); });
  }
  return linhas.join('\n');
}

function lcCopiar() {
  if (!_lcUltima || (!_lcUltima.linhas.length && !_lcUltima.produzir.length)) { alert('Nada a comprar na lista.'); return; }
  var txt = _lcTextoLista();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(function() { alert('Lista copiada — cole onde quiser.'); },
      function() { sisDialogo('Não consegui copiar. Copie o texto abaixo:', function() {}, { campo: '', valor: txt, ok: 'Fechar' }); });
  } else {
    sisDialogo('Copie o texto abaixo:', function() {}, { campo: '', valor: txt, ok: 'Fechar' });
  }
}

// ─── IMPRESSÃO (11-26: mesmo visual da Lista de Produção do Sistema Separação) ──
var _LC_MESES_ABR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
function _lcDataCurta(d) {
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || ''));
  return m ? m[3] + ' ' + _LC_MESES_ABR[parseInt(m[2], 10) - 1] : '';
}
// "05 Dez — YPO Capítulo · 150 convidados" (data pode faltar: linha de receita do mix)
function _lcTxtFesta(f) {
  var dt = _lcDataCurta(f.data);
  var conv = Number(f.conv) > 0 ? ' · ' + Number(f.conv) + ' convidado' + (Number(f.conv) === 1 ? '' : 's') : '';
  return (dt ? dt + ' — ' : '') + f.evento + (f.forn === 'consignado' ? ' (consignado)' : '') + conv;
}
// Linhas de "quanto cada festa pede" (impressão do analítico).
function _lcLinhasFestasImpressao(l, nCol) {
  return l.festas.slice().sort(function(a, b) { return (a.data || '9999').localeCompare(b.data || '9999'); }).map(function(f) {
    return '<tr class="festa"><td></td><td>' + _cuEsc(_lcTxtFesta(f)) + '</td>' +
      '<td class="n">' + _cuDec(f.qtd) + '</td><td colspan="' + (nCol - 3) + '"></td></tr>';
  }).join('');
}

function lcImprimir() {
  var u = _lcUltima;
  if (!u || (!u.linhas.length && !u.produzir.length)) { alert('Nada a comprar na lista.'); return; }
  var p = u.mes.split('-');
  var analitico = u.modo === 'analitico';
  var nomeMes = _CU_MESES[parseInt(p[1], 10) - 1] + ' ' + p[0];
  var titulo = 'Lista de Compras — ' + (analitico ? 'Analítico' : 'Sintético');
  var logo = new URL('icons/folha-logo-topo.png', location.href).href;
  var valorTotal = u.linhas.reduce(function(s, l) { return s + l.valor; }, 0);

  // Agrupa por categoria, na ordem da tela.
  var grupos = [], porCat = {};
  u.linhas.forEach(function(l) {
    if (!porCat[l.cat]) { porCat[l.cat] = []; grupos.push(l.cat); }
    porCat[l.cat].push(l);
  });
  var corpo = '';
  grupos.forEach(function(cat) {
    var itens = porCat[cat];
    corpo += '<tr><td colspan="6" class="grupo">' + _cuEsc(cat) + ' <span>(' + itens.length + ' ' + (itens.length === 1 ? 'item' : 'itens') + ')</span></td></tr>';
    itens.forEach(function(l) {
      corpo += '<tr class="item"><td class="ck"></td><td>' + _cuEsc(l.info.nome) + (l.consignado ? ' <i>(consignado)</i>' : '') + '</td>' +
        '<td class="n leve">' + _cuNum(Math.ceil(l.total + l.minimo - 1e-9)) + '</td>' +
        '<td class="n leve">' + (l.est != null ? _cuNum(l.est) : '0') + '</td>' +
        '<td class="n"><b class="falta">' + _lcQtdTxtSimples(l.comprar, l.info.ins) + '</b></td>' +
        '<td class="n leve">' + (l.preco.valor ? fR(l.valor) : '—') + '</td></tr>';
      if (analitico) corpo += _lcLinhasFestasImpressao(l, 6);
    });
  });

  var blocoProd = '';
  if (u.produzir.length) {
    blocoProd = '<h2>Mix a produzir</h2><div class="nota">Os insumos destes mix já estão somados na lista acima, pela receita (Ficha Técnica do Sistema Separação).</div>' +
      '<table><thead><tr><th></th><th>Mix</th><th class="n">Precisa</th><th class="n">Estoque</th><th class="n">Produzir</th></tr></thead><tbody>' +
      u.produzir.map(function(l) {
        return '<tr class="item"><td class="ck"></td><td>' + _cuEsc(l.info.nome) + '</td><td class="n leve">' + _cuNum(Math.ceil(l.total + l.minimo - 1e-9)) + '</td>' +
          '<td class="n leve">' + (l.est != null ? _cuNum(l.est) : '0') + '</td><td class="n"><b class="falta">Produzir ' + _cuNum(l.produzir) + '</b></td></tr>' +
          (analitico ? _lcLinhasFestasImpressao(l, 5) : '');
      }).join('') + '</tbody></table>';
  }

  var festasTxt = u.folhas.map(function(s) {
    return _lcDataCurta(s.data) + ' — ' + (s.evento || '—') + (Number(s.convidados) > 0 ? ' (' + Number(s.convidados) + ' conv.)' : '');
  }).join(' · ');

  var w = window.open('', '_blank');
  if (!w) { alert('O navegador bloqueou a janela de impressão. Libere pop-ups para este site.'); return; }
  w.document.write('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>' + _cuEsc(titulo + ' — ' + nomeMes) + '</title><style>' +
    '@page{size:A4;margin:12mm}' +
    'body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#222;margin:0}' +
    '.topo{display:flex;align-items:center;gap:14px;margin-bottom:10px}.topo img{width:90px}' +
    'h1{font-size:16px;margin:0;color:#2b3b2a}.sub{color:#555;font-size:11px;margin-top:2px}' +
    'h2{font-size:14px;margin:18px 0 2px;color:#2b3b2a}.nota{color:#666;font-size:10px;margin-bottom:6px}' +
    'table{width:100%;border-collapse:collapse}' +
    'th{text-align:left;font-size:10px;color:#555;border-bottom:1.5px solid #333;padding:4px}' +
    'td{padding:4px;border-bottom:1px solid #ddd;vertical-align:top}' +
    '.grupo{background:#e9e4da;font-weight:bold;text-transform:uppercase;font-size:11px;border-bottom:1px solid #999}' +
    '.grupo span{font-weight:normal;text-transform:none;color:#666}' +
    'tr.item td{font-weight:bold}tr.item td.leve{font-weight:normal}' +
    'tr.festa td{color:#555;font-size:10px;border-bottom:1px dotted #ddd;padding-top:2px;padding-bottom:2px}' +
    'tr.festa td:nth-child(2){padding-left:16px}' +
    '.n{text-align:right;white-space:nowrap}.falta{color:#a33}' +
    '.ck{width:14px}tr.item .ck:before{content:"";display:inline-block;width:10px;height:10px;border:1px solid #555}' +
    'tr{page-break-inside:avoid}' +
    '.total td{font-weight:bold;border-top:1.5px solid #333;border-bottom:none}' +
    '.rodape{margin-top:12px;font-size:10px;color:#777;line-height:1.5}' +
    '</style></head><body>' +
    '<div class="topo"><img src="' + logo + '" alt=""><div><h1>' + _cuEsc(titulo) + '</h1>' +
      '<div class="sub">' + _cuEsc(nomeMes) + ' · ' + u.folhas.length + ' festa' + (u.folhas.length === 1 ? '' : 's') +
      ' · ' + u.linhas.length + ' ' + (u.linhas.length === 1 ? 'item' : 'itens') + ' a comprar · impresso em ' + new Date().toLocaleString('pt-BR') + '</div></div></div>' +
    '<table><thead><tr><th></th><th>Item</th><th class="n">Precisa</th><th class="n">Estoque</th><th class="n">Comprar</th><th class="n">Valor estimado</th></tr></thead><tbody>' +
      corpo +
      '<tr class="total"><td></td><td>Total estimado</td><td></td><td></td><td></td><td class="n">' + fR(valorTotal) + '</td></tr>' +
    '</tbody></table>' + blocoProd +
    '<div class="rodape"><b>Festas na conta:</b> ' + _cuEsc(festasTxt) + '</div>' +
    '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>');
  w.document.close();
}
