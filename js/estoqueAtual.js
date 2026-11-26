// ─── ESTOQUE ATUAL (menu Estoque) ───────────────────────────────────────────
// Pedido 11-26: mostrar aqui o estoque do Sistema Separação, ao vivo. Usa a
// mesma conexão da tela de compras (_cuIniciarEstoqueAoVivo em compraUso.js,
// onSnapshot só leitura). Linhas = itens do Cadastro de Insumos casados pelo
// nome + apelidos (_cuEstoqueDe); variantes de fornecimento somadas.
// O que existe no estoque de lá e não casa com nenhum insumo vai numa caixa
// à parte (nunca vira linha). Nada é gravado.

var _eaFiltro = { busca: '', cat: '', situacao: '', todos: false };

function _eaRenderSeVisivel() {
  var pg = document.getElementById('page-estoque-atual');
  if (!pg || !pg.classList.contains('active')) return;
  rEstoqueAtual();
}

function _eaTamCaixa(ins) {
  var m = ins ? (parseFloat(ins.tamanhoEmbalagem) || 0) : 0;
  return m > 1 ? m : 0;
}
function _eaQtdTxt(q, ins) {
  var m = _eaTamCaixa(ins);
  var n = Math.round(Number(q) || 0);
  if (!m || n <= 0) return _cuNum(n);
  var cx = Math.floor(n / m), sol = n - cx * m;
  return _cuNum(n) + ' <span style="font-size:10px;color:var(--text3)">(' + cx + ' cx' + (sol ? ' + ' + sol + ' un' : '') + ')</span>';
}
function _eaData(d) {
  if (!d) return '—';
  return d.toLocaleDateString('pt-BR');
}

function _eaLinhas() {
  var mapa = _cuMapaProdutos();
  var usados = {};
  var linhas = [];
  Object.keys(mapa).forEach(function(id) {
    var info = mapa[id];
    var e = _cuEstoqueDe(info);
    if (e) {
      [info.ins.nome].concat(info.ins.aliases || []).forEach(function(n) { var k = _cuChaveSep(n); if (k && _cuEstoque[k]) usados[k] = 1; });
    }
    var minimo = Number(info.ins.estoqueMinimo) || 0;
    var qtd = e ? e.qtd : null;
    var sit = qtd == null ? 'sem' : (qtd <= 0 ? 'zerado' : (minimo > 0 && qtd < minimo ? 'abaixo' : 'ok'));
    linhas.push({ id: id, info: info, cat: info.ins.categoria || 'Sem categoria', qtd: qtd, minimo: minimo, sit: sit,
      unidade: (e && e.unidade) || '', variantes: e ? (e.variantes || []) : [], contagem: e ? e.contagem : null });
  });
  var fora = [];
  Object.keys(_cuEstoque || {}).forEach(function(k) {
    if (usados[k]) return;
    var e = _cuEstoque[k];
    fora.push({ nome: (e.variantes && e.variantes[0] && e.variantes[0].nome) || k, qtd: e.qtd, unidade: e.unidade });
  });
  fora.sort(function(a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });
  return { linhas: linhas, fora: fora };
}

function rEstoqueAtual() {
  var cont = document.getElementById('ea-body');
  if (!cont) return;
  _cuIdx = null;
  _cuIniciarEstoqueAoVivo();
  var f = _eaFiltro;

  var html = '<div class="sec" style="padding:12px 14px">' +
    '<div style="font-size:12px">' + _cuStatusEstoque() + '</div>';
  if (!_cuEstoque) {
    html += '<div style="font-size:12px;color:var(--text3);margin-top:8px">Entre uma vez com o usuário e senha do Sistema Separação. Depois disso o navegador guarda a conexão e o estoque aparece sozinho aqui e nas telas de compras.</div></div>';
    cont.innerHTML = html;
    return;
  }

  var r = _eaLinhas();
  var ordemCat = {};
  (D.categorias || []).forEach(function(c, i) { var n = typeof c === 'string' ? c : (c && c.nome); if (n) ordemCat[_cuNorm(n)] = (c && c.ordem != null) ? Number(c.ordem) : i; });
  var ordem = function(c) { return _cuTem(ordemCat, _cuNorm(c)) ? ordemCat[_cuNorm(c)] : 9999; };
  var cats = {};
  r.linhas.forEach(function(l) { if (l.qtd != null || f.todos) cats[l.cat] = 1; });
  var listaCats = Object.keys(cats).sort(function(a, b) { return ordem(a) - ordem(b) || a.localeCompare(b, 'pt-BR'); });

  var b = _cuNorm(f.busca);
  var vis = r.linhas.filter(function(l) {
    if (l.qtd == null && !f.todos && !(l.minimo > 0)) return false;
    if (f.cat && l.cat !== f.cat) return false;
    if (f.situacao === 'repor' && !(l.sit === 'abaixo' || l.sit === 'zerado')) return false;
    if (f.situacao === 'sem' && l.sit !== 'sem') return false;
    if (b && _cuNorm(l.info.nome).indexOf(b) < 0 && !(l.info.ins.aliases || []).some(function(a) { return _cuNorm(a).indexOf(b) >= 0; })) return false;
    return true;
  });
  vis.sort(function(x, y) { return ordem(x.cat) - ordem(y.cat) || x.cat.localeCompare(y.cat, 'pt-BR') || x.info.nome.localeCompare(y.info.nome, 'pt-BR'); });

  var nCom = r.linhas.filter(function(l) { return l.qtd != null; }).length;
  var nAbaixo = r.linhas.filter(function(l) { return l.sit === 'abaixo' || (l.sit === 'zerado' && l.minimo > 0); }).length;
  var nZerado = r.linhas.filter(function(l) { return l.sit === 'zerado'; }).length;
  var nSemMin = r.linhas.filter(function(l) { return l.sit === 'sem' && l.minimo > 0; }).length;

  html += '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-top:10px">' +
    '<div><label class="lbl">Buscar</label><input id="ea-busca" class="inp" style="width:200px" value="' + _cuEsc(f.busca) + '" oninput="_eaSet(\'busca\',this.value,true)"></div>' +
    '<div><label class="lbl">Categoria</label><select class="inp" style="width:180px" onchange="_eaSet(\'cat\',this.value)"><option value="">Todas</option>' +
      listaCats.map(function(c) { return '<option' + (c === f.cat ? ' selected' : '') + '>' + _cuEsc(c) + '</option>'; }).join('') + '</select></div>' +
    '<div><label class="lbl">Situação</label><select class="inp" style="width:180px" onchange="_eaSet(\'situacao\',this.value)">' +
      [['', 'Todas'], ['repor', 'Abaixo do mínimo / zerado'], ['sem', 'Não achado no estoque']].map(function(o) {
        return '<option value="' + o[0] + '"' + (o[0] === f.situacao ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>' +
    '<label style="font-size:12px;display:flex;gap:5px;align-items:center"><input type="checkbox"' + (f.todos ? ' checked' : '') + ' onchange="_eaSet(\'todos\',this.checked)">Mostrar todos os insumos do cadastro</label>' +
  '</div></div>';

  html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">' +
    _cuCard('Itens com estoque', nCom, 'do Cadastro de Insumos') +
    _cuCard('Abaixo do mínimo', nAbaixo, 'estoque mínimo do cadastro', nAbaixo ? 'var(--red)' : 'var(--green)') +
    _cuCard('Zerados', nZerado, '', nZerado ? 'var(--amber)' : 'var(--green)') +
    (nSemMin ? _cuCard('Com mínimo, não achados', nSemMin, 'nome diferente no estoque', 'var(--amber)') : '') +
  '</div>';

  html += '<div class="sec" style="padding:0;overflow-x:auto">';
  if (!vis.length) {
    html += '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">Nada com esse filtro.</div>';
  } else {
    html += '<table class="tbl" style="width:100%;font-size:12px"><thead><tr>' +
      '<th style="text-align:left">Item</th><th style="text-align:right">Estoque</th><th style="text-align:left">Unid.</th>' +
      '<th style="text-align:right">Mínimo</th><th style="text-align:left">Situação</th><th style="text-align:left">Última contagem</th></tr></thead><tbody>';
    var catAtual = null;
    vis.forEach(function(l) {
      if (l.cat !== catAtual) {
        catAtual = l.cat;
        html += '<tr><td colspan="6" style="background:var(--bg3);font-weight:600;font-size:11px;text-transform:uppercase;color:var(--text2)">' + _cuEsc(l.cat) + '</td></tr>';
      }
      var sitTxt = { ok: '<span style="color:var(--green)">ok</span>', abaixo: '<span style="color:var(--red);font-weight:600">abaixo do mínimo</span>',
        zerado: '<span style="color:var(--amber);font-weight:600">zerado</span>',
        sem: '<span style="color:var(--text3)" title="Nome e apelidos do insumo não encontrados no estoque do Sistema Separação">não achado</span>' }[l.sit];
      var tit = l.variantes.length > 1 ? ' title="' + _cuEsc(l.variantes.map(function(v) { return v.nome + ': ' + _cuDec(v.qtd); }).join(' | ')) + '"' : '';
      html += '<tr>' +
        '<td>' + _cuEsc(l.info.nome) + (l.variantes.length > 1 ? ' <span style="font-size:10px;color:var(--text3)">(' + l.variantes.length + ' variantes)</span>' : '') + '</td>' +
        '<td style="text-align:right;font-family:var(--mono);font-weight:600"' + tit + '>' + (l.qtd == null ? '—' : _eaQtdTxt(l.qtd, l.info.ins)) + '</td>' +
        '<td style="color:var(--text3)">' + _cuEsc(l.unidade || _cuUn(l.info) || '') + '</td>' +
        '<td style="text-align:right;font-family:var(--mono);color:var(--text3)">' + (l.minimo ? _cuNum(l.minimo) : '—') + '</td>' +
        '<td>' + sitTxt + '</td>' +
        '<td style="color:var(--text3)">' + _eaData(l.contagem) + '</td>' +
      '</tr>';
    });
    html += '</tbody></table>';
  }
  html += '</div>';

  if (r.fora.length) {
    html += '<details class="sec" style="margin-top:14px;padding:10px 14px;border-color:var(--amber)">' +
      '<summary style="cursor:pointer;font-size:12px;font-weight:600;color:var(--amber)">No estoque do Sistema Separação, mas fora do Cadastro de Insumos (' + r.fora.length + ')</summary>' +
      '<div style="font-size:11px;color:var(--text3);margin:6px 0;line-height:1.5">Estes nomes existem no estoque de lá e não batem com nenhum insumo daqui. Para juntar, abra o insumo certo em Cadastro → Insumos e coloque este nome como apelido (ou cadastre o item).</div>' +
      r.fora.map(function(x) {
        return '<div style="display:flex;justify-content:space-between;gap:10px;padding:4px 0;border-bottom:1px solid var(--border);font-size:12px"><span>' + _cuEsc(x.nome) + '</span>' +
          '<span style="font-family:var(--mono);color:var(--text3)">' + _cuNum(x.qtd) + ' ' + _cuEsc(x.unidade || '') + '</span></div>';
      }).join('') + '</details>';
  }
  cont.innerHTML = html;
}

function _eaSet(campo, valor, manterFoco) {
  _eaFiltro[campo] = valor;
  if (!manterFoco) { rEstoqueAtual(); return; }
  var el = document.getElementById('ea-busca');
  var pos = el ? el.selectionStart : 0;
  rEstoqueAtual();
  var novo = document.getElementById('ea-busca');
  if (novo) { novo.focus(); try { novo.setSelectionRange(pos, pos); } catch (e) {} }
}
