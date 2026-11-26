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
function _lcCatsFora() {
  var d = _cuDados();
  if (!d.listaCatsFora || typeof d.listaCatsFora !== 'object') d.listaCatsFora = {};
  return d.listaCatsFora;
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
        l.festas.push({ evento: s.evento || s.cliente || '—', data: s.data || '', qtd: q, forn: f });
        if (f === 'consignado') l.consignado = true;
      });
    });
  });
  return { linhas: linhas, nCliente: nCliente };
}

function _lcCalcular() {
  if (!_lcMes) _lcMes = _cuAnoMes(new Date());
  var per = _lcFolhasDoMes(_lcMes);
  var soma = _lcSomar(per.folhas);
  var mapa = _cuMapaProdutos();
  var conectado = !!_cuEstoque;
  var semCad = {}, linhas = [];
  Object.keys(soma.linhas).forEach(function(k) {
    var l = soma.linhas[k];
    if (_cuSemCadastro(k)) { semCad[k] = { c: 0, u: l.total }; return; }
    var info = _cuInfo(mapa, k);
    var cat = (info.ins && info.ins.categoria) || l.cat || 'Sem categoria';
    var est = null;
    if (conectado) { var e = _cuEstoqueDe(info); if (e) est = e.qtd; }
    else if (_cuTem(_cuEstoqueManual, k)) est = _cuEstoqueManual[k];
    var minimo = _lcComMinimo && info.ins ? (Number(info.ins.estoqueMinimo) || 0) : 0;
    var falta = Math.max(0, Math.ceil(l.total + minimo - (Number(est) || 0) - 1e-9));
    linhas.push({ k: k, info: info, cat: cat, total: l.total, festas: l.festas, consignado: l.consignado,
      est: est, minimo: minimo, comprar: falta });
  });
  return { per: per, linhas: linhas, semCad: semCad, nCliente: soma.nCliente, conectado: conectado };
}

function _lcRender(cont) {
  var r = _lcCalcular();
  var fora = _lcCatsFora();
  var busca = _cuBusca();
  var mapa = _cuMapaProdutos();

  // Categorias presentes (para os filtros), na ordem do Cadastro de Categorias.
  var ordemCat = {};
  (D.categorias || []).forEach(function(c, i) { var n = typeof c === 'string' ? c : (c && c.nome); if (n) ordemCat[_cuNorm(n)] = (c && c.ordem != null) ? Number(c.ordem) : i; });
  var cats = {};
  r.linhas.forEach(function(l) { cats[l.cat] = (cats[l.cat] || 0) + 1; });
  var listaCats = Object.keys(cats).sort(function(a, b) {
    var oa = _cuTem(ordemCat, _cuNorm(a)) ? ordemCat[_cuNorm(a)] : 9999;
    var ob = _cuTem(ordemCat, _cuNorm(b)) ? ordemCat[_cuNorm(b)] : 9999;
    return oa - ob || a.localeCompare(b, 'pt-BR');
  });

  var bk = _cuFiltraBusca(r.linhas.map(function(l) { return l.k; }), mapa, busca);
  var visiveis = r.linhas.filter(function(l) {
    if (fora[l.cat]) return false;
    if (bk.indexOf(l.k) < 0) return false;
    if (_lcSoComprar && l.comprar <= 0) return false;
    return true;
  });
  visiveis.sort(function(a, b) {
    var oa = listaCats.indexOf(a.cat), ob = listaCats.indexOf(b.cat);
    return oa - ob || a.info.nome.localeCompare(b.info.nome, 'pt-BR');
  });
  _lcUltima = { mes: _lcMes, linhas: visiveis.filter(function(l) { return l.comprar > 0; }), folhas: r.per.folhas.filter(function(s) { return !_lcFolhasFora[s.id]; }) };

  var nComprar = r.linhas.filter(function(l) { return !fora[l.cat] && l.comprar > 0; }).length;
  var nFolhasConta = _lcUltima.folhas.length;
  var semEstoque = r.conectado ? r.linhas.filter(function(l) { return !fora[l.cat] && l.est == null; }).length : 0;

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
    '<div style="font-size:11px;color:var(--text3);margin-top:4px">Necessário = soma das Folhas de Separação do mês' + (_lcComPassadas ? '' : ' (de hoje em diante — as que já passaram já saíram do estoque)') + '. Comprar = necessário' + (_lcComMinimo ? ' + estoque mínimo' : '') + ' − estoque atual. Bebida marcada Cliente na folha não entra.</div>' +
  '</div>';

  html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">' +
    _cuCard('Folhas na conta', nFolhasConta, nomeMes) +
    _cuCard('Eventos sem folha', r.per.semFolha.length, r.per.semFolha.length ? 'gere a folha para entrar na lista' : 'todos com folha', r.per.semFolha.length ? 'var(--amber)' : 'var(--green)') +
    _cuCard('Itens a comprar', nComprar, '', nComprar ? 'var(--red)' : 'var(--green)') +
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

  // Categorias
  if (listaCats.length) {
    html += '<div class="sec" style="padding:10px 14px"><div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;margin-bottom:6px">Categorias na lista</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px 16px">' + listaCats.map(function(c) {
        return '<label style="font-size:12px;display:flex;gap:5px;align-items:center"><input type="checkbox"' + (fora[c] ? '' : ' checked') +
          ' onchange="_lcCatToggle(\'' + _cuJs(c) + '\',this.checked)">' + _cuEsc(c) + ' <span style="color:var(--text3)">(' + cats[c] + ')</span></label>';
      }).join('') + '</div></div>';
  }

  // Tabela
  html += '<div class="sec" style="padding:0;overflow-x:auto">' +
    '<div style="display:flex;gap:8px;padding:10px 14px;align-items:center">' +
      '<span class="sec-title" style="font-size:13px">Lista de compras — ' + nomeMes + '</span>' +
      (semEstoque ? '<span style="font-size:11px;color:var(--amber)">' + semEstoque + ' item(ns) não achados no estoque (contam como 0)</span>' : '') +
      '<div style="margin-left:auto;display:flex;gap:6px">' +
        '<button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2)" onclick="lcCopiar()">Copiar lista</button>' +
        '<button class="btn-sm" style="background:var(--blue)" onclick="lcImprimir()">Imprimir lista</button>' +
      '</div>' +
    '</div>';
  if (!visiveis.length) {
    html += '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">' +
      (r.linhas.length ? (_lcSoComprar ? 'O estoque cobre tudo o que as folhas pedem.' : 'Nada com esse filtro.') : 'Nenhum item nas folhas deste período.') + '</div>';
  } else {
    html += '<table class="tbl" style="width:100%;font-size:12px"><thead><tr>' +
      '<th style="text-align:left">Item</th><th style="text-align:right">Necessário</th><th style="text-align:right">Estoque</th>' +
      (_lcComMinimo ? '<th style="text-align:right">Mínimo</th>' : '') +
      '<th style="text-align:right">Comprar</th></tr></thead><tbody>';
    var catAtual = null;
    visiveis.forEach(function(l) {
      if (l.cat !== catAtual) {
        catAtual = l.cat;
        html += '<tr><td colspan="' + (_lcComMinimo ? 5 : 4) + '" style="background:var(--bg3);font-weight:600;font-size:11px;text-transform:uppercase;color:var(--text2)">' + _cuEsc(l.cat) + '</td></tr>';
      }
      var estTxt;
      if (l.est != null) estTxt = _cuNum(l.est);
      else if (r.conectado) estTxt = '<span style="font-size:10px;color:var(--amber)" title="Nome e apelidos do insumo não encontrados no estoque do Sistema Separação">não achado</span>';
      else estTxt = '<input class="inp" type="number" min="0" style="width:70px;text-align:right;padding:2px 4px" value="' + (_cuTem(_cuEstoqueManual, l.k) ? _cuEstoqueManual[l.k] : '') + '" placeholder="0" onchange="cuEstoqueManual(\'' + _cuJs(l.k) + '\',this.value)">';
      html += '<tr>' +
        '<td>' + _cuEsc(l.info.nome) + (l.consignado ? ' <span style="font-size:10px;color:var(--purple)">consignado</span>' : '') + '</td>' +
        '<td style="text-align:right;font-family:var(--mono);cursor:pointer;text-decoration:underline dotted" title="Ver por festa" onclick="lcDetalhe(\'' + _cuJs(l.k) + '\')">' + _cuNum(Math.ceil(l.total - 1e-9)) + '</td>' +
        '<td style="text-align:right;font-family:var(--mono)">' + estTxt + '</td>' +
        (_lcComMinimo ? '<td style="text-align:right;font-family:var(--mono);color:var(--text3)">' + (l.minimo ? _cuNum(l.minimo) : '—') + '</td>' : '') +
        '<td style="text-align:right;font-family:var(--mono);font-weight:700;color:' + (l.comprar > 0 ? 'var(--red)' : 'var(--green)') + '">' + (l.comprar > 0 ? _lcQtdTxt(l.comprar, l.info.ins) : 'ok') + '</td>' +
      '</tr>';
    });
    html += '</tbody></table>';
  }
  html += '</div>';

  if (r.nCliente) html += '<div style="font-size:11px;color:var(--text3);margin:6px 2px">' + r.nCliente + ' bebida(s) marcada(s) como Cliente nas folhas — fora da lista.</div>';
  html += _cuCaixaSemCadastro(r.semCad, 'folha');
  cont.innerHTML = html;
}

function _lcFolhaToggle(id, dentro) {
  if (dentro) delete _lcFolhasFora[id]; else _lcFolhasFora[id] = true;
  rCompraUso();
}
function _lcCatToggle(cat, dentro) {
  var fora = _lcCatsFora();
  if (dentro) delete fora[cat]; else fora[cat] = true;
  sv('compraUso');
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
    '\nComprar: ' + (l.comprar > 0 ? _lcQtdTxtSimples(l.comprar, l.info.ins) : 'nada');
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
    linhas.push('- ' + l.info.nome + ': ' + _lcQtdTxtSimples(l.comprar, l.info.ins) + (l.consignado ? ' (consignado)' : ''));
  });
  return linhas.join('\n');
}

function lcCopiar() {
  if (!_lcUltima || !_lcUltima.linhas.length) { alert('Nada a comprar na lista.'); return; }
  var txt = _lcTextoLista();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(function() { alert('Lista copiada — cole onde quiser.'); },
      function() { sisDialogo('Não consegui copiar. Copie o texto abaixo:', function() {}, { campo: '', valor: txt, ok: 'Fechar' }); });
  } else {
    sisDialogo('Copie o texto abaixo:', function() {}, { campo: '', valor: txt, ok: 'Fechar' });
  }
}

function lcImprimir() {
  var u = _lcUltima;
  if (!u || !u.linhas.length) { alert('Nada a comprar na lista.'); return; }
  var p = u.mes.split('-');
  var titulo = 'Lista de compras - ' + _CU_MESES[parseInt(p[1], 10) - 1] + ' ' + p[0];
  var corpo = '', cat = null;
  u.linhas.forEach(function(l) {
    if (l.cat !== cat) { cat = l.cat; corpo += '<tr><td colspan="4" class="cat">' + _cuEsc(cat) + '</td></tr>'; }
    corpo += '<tr><td class="ck"></td><td>' + _cuEsc(l.info.nome) + (l.consignado ? ' <i>(consignado)</i>' : '') + '</td>' +
      '<td class="n">' + _lcQtdTxtSimples(l.comprar, l.info.ins) + '</td><td class="obs"></td></tr>';
  });
  var w = window.open('', '_blank');
  if (!w) { alert('O navegador bloqueou a janela de impressão. Libere pop-ups para este site.'); return; }
  w.document.write('<html><head><meta charset="utf-8"><title>' + _cuEsc(titulo) + '</title><style>' +
    'body{font-family:Arial,sans-serif;font-size:12px;margin:24px;color:#222}h1{font-size:18px;margin:0 0 4px}' +
    '.sub{color:#666;font-size:11px;margin-bottom:14px}table{width:100%;border-collapse:collapse}' +
    'td,th{border-bottom:1px solid #ccc;padding:5px 6px;text-align:left}th{font-size:11px;color:#555}' +
    '.cat{background:#eee;font-weight:bold;text-transform:uppercase;font-size:11px}.n{text-align:right;white-space:nowrap;font-weight:bold}' +
    '.ck{width:14px}.ck:before{content:"";display:inline-block;width:11px;height:11px;border:1px solid #555}.obs{width:30%}' +
    '</style></head><body><h1>' + _cuEsc(titulo) + '</h1>' +
    '<div class="sub">Gerada em ' + new Date().toLocaleString('pt-BR') + ' · ' + u.folhas.length + ' folha(s): ' +
      _cuEsc(u.folhas.map(function(s) { return (fd(s.data) || '') + ' ' + (s.evento || ''); }).join(', ')) + '</div>' +
    '<table><thead><tr><th></th><th>Item</th><th style="text-align:right">Comprar</th><th>Obs.</th></tr></thead><tbody>' + corpo + '</tbody></table>' +
    '<script>window.onload=function(){window.print()}<\/script></body></html>');
  w.document.close();
}
