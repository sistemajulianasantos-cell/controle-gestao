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
// Estoque atual = coleção "estoque" do Sistema Separação, ao vivo (onSnapshot,
// só leitura — window.escutarEstoqueSeparacao em index.html). Variantes do
// mesmo produto (ex.: APEROL CONSIGNADO / APEROL ROMERO) são somadas.
// Listas sempre ordenadas por movimentação (comprado + utilizado), maior primeiro.

var _cuView = 'mes';
var _cuEstoqueManual = {}; // estoque digitado na tela quando não conectado (não salva)

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
function _cuTem(obj, k) { return Object.prototype.hasOwnProperty.call(obj, k); }

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
function _cuMesDe(dataStr) {
  if (!dataStr) return null;
  var p = String(dataStr).split(/[-T/]/);
  if (p.length < 2 || p[0].trim().length !== 4) return null;
  return p[0].trim() + '-' + p[1].trim().padStart(2, '0');
}
function _cuNoMes(dataStr, anoMes) { return _cuMesDe(dataStr) === anoMes; }

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

// ─── ESTOQUE AO VIVO (Sistema Separação) ────────────────────────────────────
var _cuEstoque = null;        // null = não conectado; senão chave normalizada → { qtd, unidade }
var _cuEstoqueItens = 0;
var _cuEstoqueHora = '';
var _cuEstoqueUnsub = null;

function _cuChaveSep(nome) {
  return typeof _normalizarChaveEstoqueSep === 'function' ? _normalizarChaveEstoqueSep(nome) : _cuChave(nome);
}

var _cuEstoqueFalhou = false;   // deu erro: só tenta de novo depois de um login novo
var _cuEstoqueEsperando = false;

// forcar = true vem do login (estoqueSeparacao.js): libera nova tentativa após erro.
function _cuIniciarEstoqueAoVivo(forcar) {
  if (forcar) _cuEstoqueFalhou = false;
  if (_cuEstoqueUnsub || _cuEstoqueFalhou || typeof window.escutarEstoqueSeparacao !== 'function') return;
  var conectar = function(logado) {
    _cuEstoqueEsperando = false;
    if (!logado || _cuEstoqueUnsub || _cuEstoqueFalhou) return;
    _cuEstoqueUnsub = window.escutarEstoqueSeparacao(function(lista) {
      if (!lista) { // erro / sessão caiu
        if (_cuEstoqueUnsub) { try { _cuEstoqueUnsub(); } catch (e) {} }
        _cuEstoqueUnsub = null;
        _cuEstoque = null;
        _cuEstoqueFalhou = true;
        _cuRenderSeVisivel();
        return;
      }
      var mapa = {};
      lista.forEach(function(it) {
        var k = _cuChaveSep(it.nomeKey || it.nome);
        if (!k) return;
        if (!mapa[k]) mapa[k] = { qtd: 0, unidade: it.unidade || '' };
        mapa[k].qtd += Number(it.qtd) || 0;
        if (!mapa[k].unidade && it.unidade) mapa[k].unidade = it.unidade;
      });
      _cuEstoque = mapa;
      _cuEstoqueItens = lista.length;
      _cuEstoqueHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      _cuRenderSeVisivel();
    });
  };
  if (typeof window.separacaoLogado === 'function' && window.separacaoLogado()) conectar(true);
  else if (window.separacaoAuthReady && !_cuEstoqueEsperando) {
    _cuEstoqueEsperando = true;
    window.separacaoAuthReady.then(conectar);
  }
}

// Estoque do produto: { qtd, unidade } ou null (não conectado / não achado).
function _cuEstoqueDe(info) {
  if (!_cuEstoque) return null;
  var cand = [info.nome].concat((info.prod && info.prod.aliases) || []);
  for (var i = 0; i < cand.length; i++) {
    var k = _cuChaveSep(cand[i]);
    if (k && _cuEstoque[k]) return _cuEstoque[k];
  }
  return null;
}

function _cuEstoqueCelula(info) {
  var e = _cuEstoqueDe(info);
  if (!_cuEstoque) return '<span style="color:var(--text3)">—</span>';
  if (!e) return '<span style="font-size:10px;color:var(--text3)" title="Nome não encontrado no estoque do Sistema Separação">não achado</span>';
  var unProd = info.prod && info.prod.unidade;
  var aviso = e.unidade && unProd && _cuChave(e.unidade) !== _cuChave(unProd)
    ? ' <span style="font-size:10px;color:var(--amber)">' + _cuEsc(e.unidade) + '</span>' : '';
  return _cuNum(e.qtd) + aviso;
}

// Atualização ao vivo: redesenha só se a tela estiver aberta e ninguém estiver
// digitando num campo dela (senão espera sair do campo).
function _cuRenderSeVisivel() {
  var pg = document.getElementById('page-compra-uso');
  if (!pg || !pg.classList.contains('active')) return;
  var ativo = document.activeElement;
  var body = document.getElementById('cu-body');
  if (ativo && body && body.contains(ativo) && ativo.tagName === 'INPUT' && ativo.id !== 'cu-busca') {
    if (!ativo._cuEsperaBlur) {
      ativo._cuEsperaBlur = true;
      ativo.addEventListener('blur', function() { setTimeout(rCompraUso, 0); }, { once: true });
    }
    return;
  }
  rCompraUso();
}

function _cuStatusEstoque() {
  if (_cuEstoque) {
    return '<span style="color:var(--green)">Estoque ao vivo do Sistema Separação</span> (' + _cuEstoqueItens + ' itens, atualizado ' + _cuEstoqueHora + ').';
  }
  return (_cuEstoqueFalhou ? '<span style="color:var(--amber)">Não consegui ler o estoque do Sistema Separação — conecte de novo.</span> ' : 'Estoque não conectado. ') + '<button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2);margin-left:4px" onclick="abrirLoginEstoqueSeparacao()">Conectar estoque do Sistema Separação</button>';
}

// ─── CONTROLES ──────────────────────────────────────────────────────────────
function _cuMesAtualSelecionado(prefixo) {
  var m = document.getElementById(prefixo + '-mes');
  var a = document.getElementById(prefixo + '-ano');
  if (m && m.value === 'todos') return 'todos';
  return (a && a.value) + '-' + (m && m.value);
}

function _cuOpcoesMesAno(prefixo, anoMes, onchange, comTodos) {
  var todos = anoMes === 'todos';
  var p = todos ? [String(new Date().getFullYear()), ''] : anoMes.split('-');
  var anoSel = parseInt(p[0], 10);
  var anos = [];
  for (var a = 2025; a <= Math.max(anoSel, new Date().getFullYear() + 1); a++) anos.push(a);
  return '<div><label class="lbl">Mês</label><select id="' + prefixo + '-mes" class="inp" style="width:150px" onchange="' + onchange + '">' +
    (comTodos ? '<option value="todos"' + (todos ? ' selected' : '') + '>Todos os meses</option>' : '') +
    _CU_MESES.map(function(n, i) {
      var v = String(i + 1).padStart(2, '0');
      return '<option value="' + v + '"' + (v === p[1] ? ' selected' : '') + '>' + n + '</option>';
    }).join('') + '</select></div>' +
    (todos ? '' :
    '<div><label class="lbl">Ano</label><select id="' + prefixo + '-ano" class="inp" style="width:90px" onchange="' + onchange + '">' +
    anos.map(function(a) { return '<option value="' + a + '"' + (a === anoSel ? ' selected' : '') + '>' + a + '</option>'; }).join('') +
    '</select></div>');
}

function _cuCard(titulo, valor, sub, cor) {
  return '<div class="sec" style="flex:1;min-width:150px;margin:0;padding:12px 14px">' +
    '<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">' + titulo + '</div>' +
    '<div style="font-size:22px;font-weight:700;font-family:var(--mono);color:' + (cor || 'var(--text)') + ';margin-top:4px">' + valor + '</div>' +
    (sub ? '<div style="font-size:11px;color:var(--text3);margin-top:2px">' + sub + '</div>' : '') +
  '</div>';
}

function _cuBusca() { return ((document.getElementById('cu-busca') || {}).value || ''); }
function _cuCampoBusca(busca) {
  return '<input id="cu-busca" class="inp" style="width:200px;margin-left:auto" placeholder="Buscar produto" value="' + _cuEsc(busca) + '" oninput="_cuRebuscar()">';
}

// ─── ENTRADA DA TELA ─────────────────────────────────────────────────────────
function rCompraUso() {
  _cuDados();
  _cuIniciarEstoqueAoVivo();
  var cont = document.getElementById('cu-body');
  if (!cont) return;
  document.getElementById('cu-tab-mes').classList.toggle('active', _cuView === 'mes');
  document.getElementById('cu-tab-sug').classList.toggle('active', _cuView === 'sug');
  if (_cuView === 'sug') _cuRenderSugestao(cont);
  else if (_cuMesSel === 'todos') _cuRenderTodos(cont);
  else _cuRenderMes(cont);
}
function cuSetView(v) { _cuView = v; rCompraUso(); }

// Busca re-renderiza mantendo o foco no campo.
function _cuRebuscar() {
  var el = document.getElementById('cu-busca');
  var pos = el ? el.selectionStart : 0;
  rCompraUso();
  var novo = document.getElementById('cu-busca');
  if (novo) { novo.focus(); try { novo.setSelectionRange(pos, pos); } catch (e) {} }
}

// ─── ABA 1: COMPRADO x UTILIZADO DO MÊS ─────────────────────────────────────
var _cuMesSel = null;
var _CU_ONCHANGE_MES = '_cuMesSel=_cuMesAtualSelecionado(\'cu-m\');rCompraUso()';

function _cuRenderMes(cont) {
  if (!_cuMesSel) _cuMesSel = _cuSomaMes(_cuAnoMes(new Date()), -1); // padrão: mês passado (já fechado)
  var anoMes = _cuMesSel;
  var busca = _cuBusca();
  var todos = !!(document.getElementById('cu-todos') || {}).checked;

  var ev = _cuEventosMes(anoMes);
  var comprado = _cuCompradoMes(anoMes);
  var utilizado = _cuUtilizadoMes(anoMes);
  var mapa = _cuMapaProdutos();

  var chaves = Array.from(new Set(Object.keys(todos ? mapa : {})
    .concat(Object.keys(comprado), Object.keys(utilizado))));
  var b = busca.trim().toUpperCase();
  if (b) chaves = chaves.filter(function(k) { return k.indexOf(b) >= 0; });
  var mov = function(k) { return (comprado[k] || 0) + (utilizado[k] || 0); };
  chaves.sort(function(x, y) { return mov(y) - mov(x) || x.localeCompare(y, 'pt-BR'); });

  var preenchidos = Object.keys(utilizado).length;
  var comprados = Object.keys(comprado).length;

  var html =
    '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px">' +
      _cuOpcoesMesAno('cu-m', anoMes, _CU_ONCHANGE_MES, true) +
    '</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      _cuCard('Eventos no mês', ev.qtd, fN(ev.convidados) + ' convidados', 'var(--blue)') +
      _cuCard('Produtos comprados', comprados, 'pela Entrada de NF') +
      _cuCard('Utilizado preenchido', preenchidos + ' de ' + Math.max(comprados, preenchidos), 'produtos com uso informado', preenchidos < comprados ? 'var(--amber)' : 'var(--green)') +
    '</div>' +
    '<div class="sec">' +
      '<div class="sec-head" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
        '<span class="sec-title">Comprado x Utilizado — ' + _CU_MESES[parseInt(anoMes.split('-')[1], 10) - 1] + ' ' + anoMes.split('-')[0] + '</span>' +
        _cuCampoBusca(busca) +
        '<label style="font-size:12px;color:var(--text2);display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" id="cu-todos"' + (todos ? ' checked' : '') + ' onchange="rCompraUso()"> Mostrar todos os produtos</label>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--text3);padding:8px 16px 0">Comprado vem da Entrada de NF do mês. Preencha o Utilizado — salva sozinho ao sair do campo. Uso por evento = utilizado ÷ eventos do mês. Ordenado pela maior movimentação. ' + _cuStatusEstoque() + '</div>';

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
      '<th style="text-align:right;padding:8px 10px">Uso por evento</th>' +
      '<th style="text-align:right;padding:8px 12px">Estoque atual</th>' +
    '</tr></thead><tbody>' +
    chaves.map(function(k) {
      var info = mapa[k] || { nome: k, prod: null };
      var c = comprado[k] || 0;
      var temUso = _cuTem(utilizado, k);
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
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + porEv + '</td>' +
        '<td style="padding:6px 12px;text-align:right;font-family:var(--mono)">' + _cuEstoqueCelula(info) + '</td>' +
      '</tr>';
    }).join('') +
    '</tbody></table></div></div>';

  cont.innerHTML = html;
}

// ─── ABA 1 / TODOS OS MESES: tabela produto × mês ───────────────────────────
function _cuMesesComDados() {
  var meses = {};
  (D.entradas || []).forEach(function(e) { var m = _cuMesDe(e.data); if (m) meses[m] = 1; });
  Object.keys(_cuDados().meses).forEach(function(m) { meses[m] = 1; });
  var lista = Object.keys(meses).sort();
  if (!lista.length) return [];
  // Sequência contínua do primeiro mês com dado até o último (mês sem compra aparece zerado).
  var r = [], m = lista[0], fim = lista[lista.length - 1];
  while (m <= fim && r.length < 120) { r.push(m); m = _cuSomaMes(m, 1); }
  return r;
}

function _cuRenderTodos(cont) {
  var busca = _cuBusca();
  var meses = _cuMesesComDados();
  var mapa = _cuMapaProdutos();
  var porMes = meses.map(function(m) {
    return { anoMes: m, ev: _cuEventosMes(m).qtd, comprado: _cuCompradoMes(m), utilizado: _cuUtilizadoMes(m) };
  });

  var tot = {};
  porMes.forEach(function(pm) {
    Object.keys(pm.comprado).forEach(function(k) {
      if (!tot[k]) tot[k] = { c: 0, u: 0, evUso: 0, mesesUso: 0 };
      tot[k].c += pm.comprado[k];
    });
    Object.keys(pm.utilizado).forEach(function(k) {
      if (!tot[k]) tot[k] = { c: 0, u: 0, evUso: 0, mesesUso: 0 };
      tot[k].u += pm.utilizado[k];
      tot[k].evUso += pm.ev;
      tot[k].mesesUso++;
    });
  });
  var chaves = Object.keys(tot);
  var b = busca.trim().toUpperCase();
  if (b) chaves = chaves.filter(function(k) { return k.indexOf(b) >= 0; });
  chaves.sort(function(x, y) { return (tot[y].c + tot[y].u) - (tot[x].c + tot[x].u) || x.localeCompare(y, 'pt-BR'); });

  var totalEv = porMes.reduce(function(s, pm) { return s + pm.ev; }, 0);
  var html =
    '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px">' +
      _cuOpcoesMesAno('cu-m', 'todos', _CU_ONCHANGE_MES, true) +
    '</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      _cuCard('Meses', meses.length, meses.length ? _cuLabel(meses[0]) + ' a ' + _cuLabel(meses[meses.length - 1]) : '') +
      _cuCard('Eventos no período', fN(totalEv), meses.length ? 'média ' + _cuNum(totalEv / meses.length) + ' por mês' : '', 'var(--blue)') +
      _cuCard('Produtos movimentados', Object.keys(tot).length, 'comprados ou com uso') +
    '</div>' +
    '<div class="sec">' +
      '<div class="sec-head" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
        '<span class="sec-title">Comprado x Utilizado — todos os meses</span>' +
        _cuCampoBusca(busca) +
      '</div>' +
      '<div style="font-size:11px;color:var(--text3);padding:8px 16px 0">Em cada mês: C = comprado, U = utilizado (em vermelho quando usou mais do que comprou). Embaixo do mês, quantos eventos ele teve. Ordenado pela maior movimentação no período. Para preencher o utilizado, escolha o mês acima. ' + _cuStatusEstoque() + '</div>';

  if (!chaves.length) {
    html += '<div style="padding:16px;font-size:12px;color:var(--text3)">Nenhuma compra ou uso registrado' + (b ? ' com esse nome' : '') + '.</div></div>';
    cont.innerHTML = html;
    return;
  }

  var stickyTh = 'position:sticky;left:0;background:var(--bg2);z-index:2;';
  var stickyTd = 'position:sticky;left:0;background:var(--bg2);z-index:1;';
  var th = 'padding:6px 8px;text-align:right;white-space:nowrap';
  var sep = 'border-left:1px solid var(--border);';

  html += '<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:12px;min-width:100%">' +
    '<thead>' +
      '<tr style="color:var(--text3);font-size:10px;text-transform:uppercase">' +
        '<th rowspan="2" style="' + stickyTh + 'text-align:left;padding:8px 12px;min-width:180px;border-bottom:1px solid var(--border)">Produto</th>' +
        porMes.map(function(pm) {
          return '<th colspan="2" style="' + sep + 'padding:6px 8px;text-align:center;white-space:nowrap">' + _cuLabel(pm.anoMes) +
            '<div style="font-weight:400;text-transform:none;color:var(--blue)">' + pm.ev + ' ev.</div></th>';
        }).join('') +
        '<th colspan="2" style="' + sep + 'padding:6px 8px;text-align:center">Total</th>' +
        '<th rowspan="2" style="' + sep + th + ';border-bottom:1px solid var(--border)">Média<br>compra/mês</th>' +
        '<th rowspan="2" style="' + th + ';border-bottom:1px solid var(--border)">Uso por<br>evento</th>' +
        '<th rowspan="2" style="' + th + ';border-bottom:1px solid var(--border)">Estoque<br>atual</th>' +
      '</tr>' +
      '<tr style="color:var(--text3);font-size:10px;border-bottom:1px solid var(--border)">' +
        porMes.map(function() { return '<th style="' + sep + th + '">C</th><th style="' + th + '">U</th>'; }).join('') +
        '<th style="' + sep + th + '">C</th><th style="' + th + '">U</th>' +
      '</tr>' +
    '</thead><tbody>' +
    chaves.map(function(k) {
      var info = mapa[k] || { nome: k, prod: null };
      var t = tot[k];
      var celulas = porMes.map(function(pm) {
        var c = pm.comprado[k] || 0;
        var temU = _cuTem(pm.utilizado, k);
        var u = temU ? pm.utilizado[k] : null;
        return '<td style="' + sep + 'padding:5px 8px;text-align:right;font-family:var(--mono);' + (c ? '' : 'color:var(--text3)') + '">' + (c ? _cuNum(c) : '·') + '</td>' +
          '<td style="padding:5px 8px;text-align:right;font-family:var(--mono);' + (!temU ? 'color:var(--text3)' : u > c ? 'color:var(--red)' : '') + '">' + (temU ? _cuNum(u) : '·') + '</td>';
      }).join('');
      var porEv = t.mesesUso && t.evUso ? _cuNum(t.u / t.evUso) : '—';
      return '<tr style="border-bottom:1px solid var(--border)">' +
        '<td style="' + stickyTd + 'padding:5px 12px;color:var(--text);white-space:nowrap">' + _cuEsc(info.nome) + '</td>' +
        celulas +
        '<td style="' + sep + 'padding:5px 8px;text-align:right;font-family:var(--mono);font-weight:700">' + _cuNum(t.c) + '</td>' +
        '<td style="padding:5px 8px;text-align:right;font-family:var(--mono);font-weight:700">' + (t.mesesUso ? _cuNum(t.u) : '—') + '</td>' +
        '<td style="' + sep + 'padding:5px 8px;text-align:right;font-family:var(--mono)">' + _cuNum(t.c / meses.length) + '</td>' +
        '<td style="padding:5px 8px;text-align:right;font-family:var(--mono)">' + porEv + '</td>' +
        '<td style="padding:5px 12px;text-align:right;font-family:var(--mono)">' + _cuEstoqueCelula(info) + '</td>' +
      '</tr>';
    }).join('') +
    '</tbody></table></div></div>';

  cont.innerHTML = html;
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
  var busca = _cuBusca();
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

  var conectado = !!_cuEstoque;

  var linhas = Object.keys(chaves).map(function(k) {
    var info = mapa[k] || { nome: k, prod: null };
    var somaComp = 0, somaUso = 0, evComUso = 0, mesesComUso = 0;
    base.forEach(function(m) {
      somaComp += m.comprado[k] || 0;
      if (_cuTem(m.utilizado, k)) {
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

    var est = null;
    if (conectado) { var e = _cuEstoqueDe(info); if (e) est = e.qtd; }
    else if (_cuTem(_cuEstoqueManual, k)) est = _cuEstoqueManual[k];
    var sugestao = Math.max(0, Math.ceil(previsto + minimo - (est || 0)));
    var abaixo = est != null && minimo > 0 && est < minimo;
    return { k: k, info: info, mediaCompra: mediaCompra, porEvento: porEvento, fonte: fonte,
      previsto: previsto, minimo: minimo, est: est, sugestao: sugestao, abaixo: abaixo,
      mov: somaComp + somaUso };
  });

  var b = busca.trim().toUpperCase();
  if (b) linhas = linhas.filter(function(l) { return l.k.indexOf(b) >= 0; });
  if (soAbaixo) linhas = linhas.filter(function(l) { return l.abaixo; });
  linhas.sort(function(x, y) { return y.mov - x.mov || x.k.localeCompare(y.k, 'pt-BR'); });
  var qtdAbaixo = linhas.filter(function(l) { return l.abaixo; }).length;

  var nomeAlvo = _CU_MESES[parseInt(alvo.split('-')[1], 10) - 1] + ' ' + alvo.split('-')[0];
  var proporcao = totalEvBase ? (evPrev / (totalEvBase / nBase)) : null;

  var html =
    '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px">' +
      '<div style="font-size:12px;color:var(--text2);padding-bottom:9px">Comprar para</div>' +
      _cuOpcoesMesAno('cu-s', alvo, '_cuAlvo=_cuMesAtualSelecionado(\'cu-s\');_cuEventosPrevistos=null;rCompraUso()', false) +
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
      _cuCampoBusca(busca) +
      '<label style="font-size:12px;color:var(--text2);display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" id="cu-abaixo"' + (soAbaixo ? ' checked' : '') + ' onchange="rCompraUso()"> Só abaixo do mínimo</label>' +
    '</div>' +
    '<div style="font-size:11px;padding:8px 16px 0;color:var(--text3)">' + _cuStatusEstoque() +
      (conectado ? '' : ' Enquanto não conecta, dá para digitar o estoque (não fica salvo); vazio conta como zero.') +
      ' O mínimo é o mesmo do Cadastro de Produtos. Ordenado pela maior movimentação nos meses-base.' +
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
      var estCampo = conectado
        ? '<span style="font-family:var(--mono);' + (l.abaixo ? 'color:var(--red);font-weight:700' : '') + '">' + _cuEstoqueCelula(l.info) + '</span>'
        : '<input class="inp" type="number" min="0" step="any" style="width:80px;text-align:right;' + (l.abaixo ? 'border-color:var(--red);color:var(--red)' : '') + '" value="' + (l.est != null ? l.est : '') + '" placeholder="—" onchange="cuEstoqueManual(\'' + _cuJs(l.k) + '\',this.value)">';
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
