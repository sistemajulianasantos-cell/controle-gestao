// ─── COMPRADO x UTILIZADO / SUGESTÃO DE COMPRA ──────────────────────────────
// Pedido 11-02: comparar, mês a mês, o que entrou (Entrada de NF, D.entradas)
// com o que foi utilizado (preenchido à mão aqui), levando em conta quantos
// eventos teve no mês (D.contratos não cancelados) — um mês de 125 eventos
// não serve de base direto para um mês de 35. A aba Sugestão trabalha por
// evento: uso por evento dos meses-base × eventos previstos + mínimo − estoque.
//
// Dados: D.compraUso = { meses: { 'AAAA-MM': { 'PRODUTO': qtd } }, baseMeses: 3 }
// Mínimo de estoque = campo "minimo" que já existe no Cadastro de Produtos
// (D.produtos) — editar aqui é o mesmo que editar lá.

var _cuView = 'mes';
var _cuEstoqueManual = {}; // estoque digitado na tela (não salva)

var _CU_MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
var _CU_MESES_ABREV = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function _cuEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}
function _cuJs(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
function _cuNum(n) {
  var v = Math.round(Number(n || 0) * 100) / 100;
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}
function _cuChave(nome) { return String(nome || '').trim().toUpperCase(); }

function _cuDados() {
  if (!D.compraUso || typeof D.compraUso !== 'object') D.compraUso = {};
  if (!D.compraUso.meses) D.compraUso.meses = {};
  if (!D.compraUso.baseMeses) D.compraUso.baseMeses = 3;
  return D.compraUso;
}

function _cuAnoMes(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
function _cuSomaMes(anoMes, n) {
  var p = anoMes.split('-');
  return _cuAnoMes(new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1 + n, 1));
}
function _cuLabel(anoMes) {
  var p = anoMes.split('-');
  return _CU_MESES_ABREV[parseInt(p[1], 10) - 1] + '/' + p[0].slice(2);
}
function _cuNoMes(dataStr, anoMes) {
  if (!dataStr) return false;
  var p = String(dataStr).split(/[-T/]/);
  if (p.length < 2 || p[0].trim().length !== 4) return false;
  return (p[0].trim() + '-' + p[1].trim().padStart(2, '0')) === anoMes;
}

// Eventos do mês = contratos não cancelados com data no mês.
function _cuEventosMes(anoMes) {
  var lista = (D.contratos || []).filter(function(c) {
    return c.status !== 'cancelado' && _cuNoMes(c.data, anoMes);
  });
  var conv = lista.reduce(function(s, c) { return s + (Number(c.convidados) || 0); }, 0);
  return { qtd: lista.length, convidados: conv };
}

// Comprado no mês por produto (chave = nome em maiúsculas).
function _cuCompradoMes(anoMes) {
  var r = {};
  (D.entradas || []).forEach(function(e) {
    if (!_cuNoMes(e.data, anoMes)) return;
    var k = _cuChave(e.prod);
    if (!k) return;
    r[k] = (r[k] || 0) + (Number(e.qtd) || 0);
  });
  return r;
}

function _cuUtilizadoMes(anoMes) {
  var m = _cuDados().meses[anoMes] || {};
  var r = {};
  Object.keys(m).forEach(function(k) { r[_cuChave(k)] = Number(m[k]) || 0; });
  return r;
}

// Nome de exibição + produto do cadastro, por chave.
function _cuMapaProdutos() {
  var mapa = {};
  (D.produtos || []).forEach(function(p) {
    var k = _cuChave(p.nome);
    if (k) mapa[k] = { nome: p.nome, prod: p };
  });
  (D.entradas || []).forEach(function(e) {
    var k = _cuChave(e.prod);
    if (k && !mapa[k]) mapa[k] = { nome: e.prod, prod: null };
  });
  return mapa;
}

function _cuMesAtualSelecionado(prefixo) {
  var m = document.getElementById(prefixo + '-mes');
  var a = document.getElementById(prefixo + '-ano');
  return (a && a.value) + '-' + (m && m.value);
}

function _cuOpcoesMesAno(prefixo, anoMes, onchange) {
  var p = anoMes.split('-');
  var anoSel = parseInt(p[0], 10);
  var anos = [];
  for (var a = 2025; a <= Math.max(anoSel, new Date().getFullYear() + 1); a++) anos.push(a);
  return '<div><label class="lbl">Mês</label><select id="' + prefixo + '-mes" class="inp" style="width:120px" onchange="' + onchange + '">' +
    _CU_MESES.map(function(n, i) {
      var v = String(i + 1).padStart(2, '0');
      return '<option value="' + v + '"' + (v === p[1] ? ' selected' : '') + '>' + n + '</option>';
    }).join('') + '</select></div>' +
    '<div><label class="lbl">Ano</label><select id="' + prefixo + '-ano" class="inp" style="width:90px" onchange="' + onchange + '">' +
    anos.map(function(a) { return '<option value="' + a + '"' + (a === anoSel ? ' selected' : '') + '>' + a + '</option>'; }).join('') +
    '</select></div>';
}

function _cuCard(titulo, valor, sub, cor) {
  return '<div class="sec" style="flex:1;min-width:150px;margin:0;padding:12px 14px">' +
    '<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">' + titulo + '</div>' +
    '<div style="font-size:22px;font-weight:700;font-family:var(--mono);color:' + (cor || 'var(--text)') + ';margin-top:4px">' + valor + '</div>' +
    (sub ? '<div style="font-size:11px;color:var(--text3);margin-top:2px">' + sub + '</div>' : '') +
  '</div>';
}

// ─── ENTRADA DA TELA ─────────────────────────────────────────────────────────
function rCompraUso() {
  _cuDados();
  var cont = document.getElementById('cu-body');
  if (!cont) return;
  document.getElementById('cu-tab-mes').classList.toggle('active', _cuView === 'mes');
  document.getElementById('cu-tab-sug').classList.toggle('active', _cuView === 'sug');
  if (_cuView === 'sug') _cuRenderSugestao(cont);
  else _cuRenderMes(cont);
}
function cuSetView(v) {
  _cuView = v;
  rCompraUso();
  // Já logado no Sistema Separação (sessão salva)? Puxa o estoque uma vez.
  if (v === 'sug' && !_estoqueSeparacaoCache && typeof window.separacaoLogado === 'function' && window.separacaoLogado()) {
    cuRecarregarEstoque();
  }
}

// ─── ABA 1: COMPRADO x UTILIZADO DO MÊS ─────────────────────────────────────
var _cuMesSel = null;
function _cuRenderMes(cont) {
  if (!_cuMesSel) _cuMesSel = _cuSomaMes(_cuAnoMes(new Date()), -1); // padrão: mês passado (já fechado)
  var anoMes = _cuMesSel;
  var busca = (document.getElementById('cu-busca') || {}).value || '';
  var todos = !!(document.getElementById('cu-todos') || {}).checked;

  var ev = _cuEventosMes(anoMes);
  var comprado = _cuCompradoMes(anoMes);
  var utilizado = _cuUtilizadoMes(anoMes);
  var mapa = _cuMapaProdutos();

  var chaves = Object.keys(todos ? mapa : {})
    .concat(Object.keys(comprado), Object.keys(utilizado));
  chaves = Array.from(new Set(chaves));
  var b = busca.trim().toUpperCase();
  if (b) chaves = chaves.filter(function(k) { return k.indexOf(b) >= 0; });
  chaves.sort(function(x, y) { return x.localeCompare(y, 'pt-BR'); });

  var preenchidos = Object.keys(utilizado).length;
  var comprados = Object.keys(comprado).length;

  var html =
    '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px">' +
      _cuOpcoesMesAno('cu-m', anoMes, '_cuMesSel=_cuMesAtualSelecionado(\'cu-m\');rCompraUso()') +
    '</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      _cuCard('Eventos no mês', ev.qtd, fN(ev.convidados) + ' convidados', 'var(--blue)') +
      _cuCard('Produtos comprados', comprados, 'pela Entrada de NF') +
      _cuCard('Utilizado preenchido', preenchidos + ' de ' + Math.max(comprados, preenchidos), 'produtos com uso informado', preenchidos < comprados ? 'var(--amber)' : 'var(--green)') +
    '</div>' +
    '<div class="sec">' +
      '<div class="sec-head" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
        '<span class="sec-title">Comprado x Utilizado — ' + _CU_MESES[parseInt(anoMes.split('-')[1], 10) - 1] + ' ' + anoMes.split('-')[0] + '</span>' +
        '<input id="cu-busca" class="inp" style="width:200px;margin-left:auto" placeholder="Buscar produto" value="' + _cuEsc(busca) + '" oninput="_cuRebuscar()">' +
        '<label style="font-size:12px;color:var(--text2);display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" id="cu-todos"' + (todos ? ' checked' : '') + ' onchange="rCompraUso()"> Mostrar todos os produtos</label>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--text3);padding:8px 16px 0">Comprado vem da Entrada de NF do mês. Preencha o Utilizado — salva sozinho ao sair do campo. Uso por evento = utilizado ÷ eventos do mês.</div>';

  if (!chaves.length) {
    html += '<div style="padding:16px;font-size:12px;color:var(--text3)">Nenhuma compra lançada neste mês' + (b ? ' com esse nome' : '') + '. Marque "Mostrar todos os produtos" para preencher o utilizado de um produto que não foi comprado no mês.</div></div>';
    cont.innerHTML = html;
    return;
  }

  html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
    '<thead><tr style="border-bottom:1px solid var(--border);color:var(--text3);font-size:10px;text-transform:uppercase">' +
      '<th style="text-align:left;padding:8px 12px">Produto</th>' +
      '<th style="text-align:left;padding:8px 6px">Un</th>' +
      '<th style="text-align:right;padding:8px 10px">Comprado</th>' +
      '<th style="text-align:right;padding:8px 10px">Utilizado</th>' +
      '<th style="text-align:right;padding:8px 10px">Diferença</th>' +
      '<th style="text-align:right;padding:8px 12px">Uso por evento</th>' +
    '</tr></thead><tbody>' +
    chaves.map(function(k) {
      var info = mapa[k] || { nome: k, prod: null };
      var c = comprado[k] || 0;
      var temUso = Object.prototype.hasOwnProperty.call(utilizado, k);
      var u = temUso ? utilizado[k] : null;
      var dif = temUso ? c - u : null;
      var difTxt = dif == null ? '<span style="color:var(--text3)">—</span>'
        : dif > 0 ? '<span style="color:var(--green)">sobrou ' + _cuNum(dif) + '</span>'
        : dif < 0 ? '<span style="color:var(--amber)">usou ' + _cuNum(-dif) + ' do estoque</span>'
        : '<span style="color:var(--text3)">igual</span>';
      var porEv = temUso && ev.qtd ? _cuNum(u / ev.qtd) : '—';
      return '<tr style="border-bottom:1px solid var(--border)">' +
        '<td style="padding:6px 12px;color:var(--text)">' + _cuEsc(info.nome) + '</td>' +
        '<td style="padding:6px 6px;color:var(--text3)">' + _cuEsc((info.prod && info.prod.unidade) || '') + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + (c ? _cuNum(c) : '<span style="color:var(--text3)">0</span>') + '</td>' +
        '<td style="padding:4px 10px;text-align:right"><input class="inp" type="number" min="0" step="any" style="width:90px;text-align:right" value="' + (temUso ? u : '') + '" placeholder="—" onchange="cuSalvarUtilizado(\'' + anoMes + '\',\'' + _cuJs(info.nome) + '\',this.value)"></td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + difTxt + '</td>' +
        '<td style="padding:6px 12px;text-align:right;font-family:var(--mono)">' + porEv + '</td>' +
      '</tr>';
    }).join('') +
    '</tbody></table></div></div>';

  cont.innerHTML = html;
}

// Busca re-renderiza mantendo o foco no campo.
function _cuRebuscar() {
  var el = document.getElementById('cu-busca');
  var pos = el ? el.selectionStart : 0;
  rCompraUso();
  var novo = document.getElementById('cu-busca');
  if (novo) { novo.focus(); try { novo.setSelectionRange(pos, pos); } catch (e) {} }
}

function cuSalvarUtilizado(anoMes, nome, valor) {
  var dados = _cuDados();
  if (!dados.meses[anoMes]) dados.meses[anoMes] = {};
  var mes = dados.meses[anoMes];
  // Remove variações de caixa do mesmo nome antes de gravar
  Object.keys(mes).forEach(function(k) { if (_cuChave(k) === _cuChave(nome)) delete mes[k]; });
  var v = String(valor).trim();
  if (v !== '') {
    var n = Number(v.replace(',', '.'));
    if (isNaN(n) || n < 0) { alert2('Quantidade inválida', 'error'); return; }
    mes[nome] = n;
  }
  if (!Object.keys(mes).length) delete dados.meses[anoMes];
  sv('compraUso');
  rCompraUso();
}

// ─── ABA 2: SUGESTÃO DE COMPRA ──────────────────────────────────────────────
var _cuAlvo = null;
var _cuEventosPrevistos = null; // null = usa o que está na agenda

function _cuRenderSugestao(cont) {
  var dados = _cuDados();
  if (!_cuAlvo) _cuAlvo = _cuSomaMes(_cuAnoMes(new Date()), 1); // padrão: próximo mês
  var alvo = _cuAlvo;
  var nBase = Math.max(1, Math.min(12, parseInt(dados.baseMeses, 10) || 3));
  var busca = (document.getElementById('cu-busca') || {}).value || '';
  var soAbaixo = !!(document.getElementById('cu-abaixo') || {}).checked;

  var evAgenda = _cuEventosMes(alvo).qtd;
  var evPrev = _cuEventosPrevistos != null ? _cuEventosPrevistos : evAgenda;

  // Meses-base: os N meses imediatamente antes do mês a comprar.
  var base = [];
  for (var i = nBase; i >= 1; i--) {
    var am = _cuSomaMes(alvo, -i);
    base.push({ anoMes: am, ev: _cuEventosMes(am).qtd, comprado: _cuCompradoMes(am), utilizado: _cuUtilizadoMes(am) });
  }
  var totalEvBase = base.reduce(function(s, m) { return s + m.ev; }, 0);

  var mapa = _cuMapaProdutos();
  var chaves = {};
  base.forEach(function(m) {
    Object.keys(m.comprado).forEach(function(k) { chaves[k] = 1; });
    Object.keys(m.utilizado).forEach(function(k) { chaves[k] = 1; });
  });
  (D.produtos || []).forEach(function(p) { if (p.minimo > 0) chaves[_cuChave(p.nome)] = 1; });

  var estoqueConectado = typeof _estoqueSeparacaoParaInsumo === 'function' && _estoqueSeparacaoCache;

  var linhas = Object.keys(chaves).map(function(k) {
    var info = mapa[k] || { nome: k, prod: null };
    var somaComp = 0, somaUso = 0, evComUso = 0, mesesComUso = 0;
    base.forEach(function(m) {
      somaComp += m.comprado[k] || 0;
      if (Object.prototype.hasOwnProperty.call(m.utilizado, k)) {
        somaUso += m.utilizado[k];
        evComUso += m.ev;
        mesesComUso++;
      }
    });
    var mediaCompra = somaComp / nBase;
    // Uso por evento: só meses com utilizado preenchido; sem nenhum, usa a compra.
    var porEvento = null, fonte = '';
    if (mesesComUso && evComUso) { porEvento = somaUso / evComUso; fonte = 'uso'; }
    else if (totalEvBase) { porEvento = somaComp / totalEvBase; fonte = 'compra'; }
    var previsto = porEvento != null ? porEvento * evPrev : mediaCompra;
    var minimo = info.prod ? (Number(info.prod.minimo) || 0) : 0;

    var est = null, estUn = '';
    if (Object.prototype.hasOwnProperty.call(_cuEstoqueManual, k)) est = _cuEstoqueManual[k];
    else if (estoqueConectado) {
      var it = _estoqueSeparacaoParaInsumo({ nome: info.nome, aliases: (info.prod && info.prod.aliases) || [] });
      if (it && it.qtd != null) { est = Number(it.qtd) || 0; estUn = it.unidade || ''; }
    }
    var sugestao = Math.max(0, Math.ceil(previsto + minimo - (est || 0)));
    var abaixo = est != null && minimo > 0 && est < minimo;
    return { k: k, info: info, mediaCompra: mediaCompra, porEvento: porEvento, fonte: fonte, mesesComUso: mesesComUso,
      previsto: previsto, minimo: minimo, est: est, estUn: estUn, sugestao: sugestao, abaixo: abaixo };
  });

  var b = busca.trim().toUpperCase();
  if (b) linhas = linhas.filter(function(l) { return l.k.indexOf(b) >= 0; });
  if (soAbaixo) linhas = linhas.filter(function(l) { return l.abaixo; });
  linhas.sort(function(x, y) {
    if (x.abaixo !== y.abaixo) return x.abaixo ? -1 : 1;
    return x.k.localeCompare(y.k, 'pt-BR');
  });
  var qtdAbaixo = linhas.filter(function(l) { return l.abaixo; }).length;

  var nomeAlvo = _CU_MESES[parseInt(alvo.split('-')[1], 10) - 1] + ' ' + alvo.split('-')[0];
  var proporcao = totalEvBase ? (evPrev / (totalEvBase / nBase)) : null;

  var html =
    '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px">' +
      '<div style="font-size:12px;color:var(--text2);padding-bottom:9px">Comprar para</div>' +
      _cuOpcoesMesAno('cu-s', alvo, '_cuAlvo=_cuMesAtualSelecionado(\'cu-s\');_cuEventosPrevistos=null;rCompraUso()') +
      '<div><label class="lbl">Eventos previstos</label><input id="cu-evprev" class="inp" type="number" min="0" style="width:100px" value="' + evPrev + '" onchange="_cuEventosPrevistos=Math.max(0,parseInt(this.value,10)||0);rCompraUso()"></div>' +
      '<div><label class="lbl">Base: últimos meses</label><input class="inp" type="number" min="1" max="12" style="width:90px" value="' + nBase + '" onchange="cuSalvarBase(this.value)"></div>' +
      (_cuEventosPrevistos != null && _cuEventosPrevistos !== evAgenda
        ? '<button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2)" onclick="_cuEventosPrevistos=null;rCompraUso()">Voltar para os ' + evAgenda + ' da agenda</button>'
        : '<div style="font-size:11px;color:var(--text3);padding-bottom:9px">' + evAgenda + ' evento(s) na agenda de ' + nomeAlvo + '</div>') +
    '</div>' +
    '<div class="sec" style="margin-bottom:14px">' +
      '<div class="sec-head"><span class="sec-title">Meses usados como base</span></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;padding:12px 16px">' +
        base.map(function(m) {
          var preench = Object.keys(m.utilizado).length;
          return '<div style="border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;min-width:120px">' +
            '<div style="font-size:11px;color:var(--text3)">' + _cuLabel(m.anoMes) + '</div>' +
            '<div style="font-size:16px;font-weight:700;font-family:var(--mono)">' + m.ev + ' eventos</div>' +
            '<div style="font-size:11px;color:' + (preench ? 'var(--text3)' : 'var(--amber)') + '">' + (preench ? preench + ' com utilizado' : 'utilizado não preenchido') + '</div>' +
          '</div>';
        }).join('') +
        '<div style="border:1px solid var(--blue);border-radius:var(--radius);padding:8px 12px;min-width:140px">' +
          '<div style="font-size:11px;color:var(--text3)">' + _cuLabel(alvo) + ' (a comprar)</div>' +
          '<div style="font-size:16px;font-weight:700;font-family:var(--mono);color:var(--blue)">' + evPrev + ' eventos</div>' +
          '<div style="font-size:11px;color:var(--text3)">' + (proporcao != null ? _cuNum(proporcao * 100) + '% da média da base' : 'base sem eventos') + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--text3);padding:0 16px 12px;line-height:1.5">' +
        'Uso por evento = utilizado ÷ eventos, só dos meses com utilizado preenchido (sem preenchimento, usa o comprado ÷ eventos — marcado "pela compra"). ' +
        'Previsto = uso por evento × eventos previstos. Sugestão = previsto + mínimo − estoque atual, arredondado para cima.' +
      '</div>' +
    '</div>';

  html += '<div class="sec">' +
    '<div class="sec-head" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
      '<span class="sec-title">Sugestão de compra — ' + nomeAlvo + '</span>' +
      (qtdAbaixo ? '<span style="font-size:11px;font-weight:600;color:var(--red)">' + qtdAbaixo + ' abaixo do mínimo</span>' : '') +
      '<input id="cu-busca" class="inp" style="width:200px;margin-left:auto" placeholder="Buscar produto" value="' + _cuEsc(busca) + '" oninput="_cuRebuscar()">' +
      '<label style="font-size:12px;color:var(--text2);display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" id="cu-abaixo"' + (soAbaixo ? ' checked' : '') + ' onchange="rCompraUso()"> Só abaixo do mínimo</label>' +
    '</div>' +
    '<div style="font-size:11px;padding:8px 16px 0;color:var(--text3)">' +
      (estoqueConectado
        ? 'Estoque atual vem do Sistema Separação (' + _estoqueSeparacaoCache.length + ' itens). Pode corrigir digitando — o valor digitado vale só nesta tela. <button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2);margin-left:6px" onclick="cuRecarregarEstoque()">Atualizar estoque</button>'
        : 'Estoque não conectado: digite o estoque atual ou <button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2);margin-left:4px" onclick="abrirLoginEstoqueSeparacao()">Conectar estoque do Sistema Separação</button>. Sem estoque, a sugestão considera estoque zero.') +
      ' O mínimo é o mesmo do Cadastro de Produtos.' +
    '</div>';

  if (!linhas.length) {
    html += '<div style="padding:16px;font-size:12px;color:var(--text3)">' +
      (soAbaixo ? 'Nenhum produto abaixo do mínimo.' : 'Nenhuma compra ou uso nos meses-base' + (b ? ' com esse nome' : '') + ', e nenhum produto com mínimo cadastrado.') +
      '</div></div>';
    cont.innerHTML = html;
    return;
  }

  html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
    '<thead><tr style="border-bottom:1px solid var(--border);color:var(--text3);font-size:10px;text-transform:uppercase">' +
      '<th style="text-align:left;padding:8px 12px">Produto</th>' +
      '<th style="text-align:left;padding:8px 6px">Un</th>' +
      '<th style="text-align:right;padding:8px 10px">Média compra/mês</th>' +
      '<th style="text-align:right;padding:8px 10px">Uso por evento</th>' +
      '<th style="text-align:right;padding:8px 10px">Previsto (' + evPrev + ' ev.)</th>' +
      '<th style="text-align:right;padding:8px 10px">Mínimo</th>' +
      '<th style="text-align:right;padding:8px 10px">Estoque atual</th>' +
      '<th style="text-align:right;padding:8px 12px">Comprar</th>' +
    '</tr></thead><tbody>' +
    linhas.map(function(l) {
      var porEvTxt = l.porEvento == null ? '<span style="color:var(--text3)">—</span>'
        : _cuNum(l.porEvento) + (l.fonte === 'compra' ? ' <span style="font-size:10px;color:var(--amber)">pela compra</span>' : '');
      var minCampo = l.info.prod
        ? '<input class="inp" type="number" min="0" step="any" style="width:80px;text-align:right" value="' + (l.minimo || '') + '" placeholder="0" onchange="cuSalvarMinimo(\'' + _cuJs(l.info.prod.id) + '\',this.value)">'
        : '<span style="font-size:10px;color:var(--text3)" title="Produto não está no Cadastro de Produtos">sem cadastro</span>';
      var estCampo = '<input class="inp" type="number" min="0" step="any" style="width:80px;text-align:right;' + (l.abaixo ? 'border-color:var(--red);color:var(--red)' : '') + '" value="' + (l.est != null ? l.est : '') + '" placeholder="—" onchange="cuEstoqueManual(\'' + _cuJs(l.k) + '\',this.value)">' +
        (l.estUn && l.info.prod && l.info.prod.unidade && _cuChave(l.estUn) !== _cuChave(l.info.prod.unidade) ? '<div style="font-size:10px;color:var(--amber)">em ' + _cuEsc(l.estUn) + '</div>' : '');
      return '<tr style="border-bottom:1px solid var(--border);' + (l.abaixo ? 'background:rgba(240,90,90,.06)' : '') + '">' +
        '<td style="padding:6px 12px;color:var(--text)">' + _cuEsc(l.info.nome) + (l.abaixo ? ' <span style="font-size:10px;font-weight:600;color:var(--red)">ABAIXO DO MÍNIMO</span>' : '') + '</td>' +
        '<td style="padding:6px 6px;color:var(--text3)">' + _cuEsc((l.info.prod && l.info.prod.unidade) || '') + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + _cuNum(l.mediaCompra) + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + porEvTxt + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + _cuNum(l.previsto) + '</td>' +
        '<td style="padding:4px 10px;text-align:right">' + minCampo + '</td>' +
        '<td style="padding:4px 10px;text-align:right">' + estCampo + '</td>' +
        '<td style="padding:6px 12px;text-align:right;font-family:var(--mono);font-weight:700;color:' + (l.sugestao > 0 ? 'var(--green)' : 'var(--text3)') + '">' + fN(l.sugestao) + '</td>' +
      '</tr>';
    }).join('') +
    '</tbody></table></div></div>';

  cont.innerHTML = html;
}

function cuSalvarBase(v) {
  _cuDados().baseMeses = Math.max(1, Math.min(12, parseInt(v, 10) || 3));
  sv('compraUso');
  rCompraUso();
}

function cuSalvarMinimo(prodId, v) {
  var p = (D.produtos || []).find(function(x) { return x.id === prodId; });
  if (!p) return;
  var n = Number(String(v).replace(',', '.')) || 0;
  if (n < 0) n = 0;
  p.minimo = n;
  sv('produtos');
  rCompraUso();
}

function cuEstoqueManual(chave, v) {
  var s = String(v).trim();
  if (s === '') delete _cuEstoqueManual[chave];
  else _cuEstoqueManual[chave] = Math.max(0, Number(s.replace(',', '.')) || 0);
  rCompraUso();
}

async function cuRecarregarEstoque() {
  _cuEstoqueManual = {};
  if (typeof _carregarEstoqueSeparacao === 'function') await _carregarEstoqueSeparacao();
  rCompraUso();
}
