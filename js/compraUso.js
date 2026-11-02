// ─── COMPRADO x UTILIZADO / SUGESTÃO DE COMPRA ──────────────────────────────
// Pedido 11-02: comparar, mês a mês, o que entrou (Entrada de NF, D.entradas)
// com o que foi utilizado, levando em conta quantos eventos teve no mês — um
// mês de 125 eventos não serve de base direto para um mês de 35. A aba
// Sugestão trabalha por evento: uso por evento × eventos previstos + mínimo − estoque.
//
// Utilizado = consumo lançado por evento na Estimativa de Bebidas (D.rcEventos,
// chave = nome do insumo do Cadastro de Insumos), somado pelo mês da data do
// evento. Compra (nome do Cadastro de Produtos) e consumo (nome de insumo) são
// casados pelo nome + apelidos do insumo (_cuCanon). Uso por evento divide
// pelos eventos LANÇADOS na Estimativa (não pelos contratos), senão mês com
// evento sem lançamento puxaria a média pra baixo.
//
// D.compraUso = { baseMeses: 3 } (o antigo `meses` digitado à mão não é mais usado).
// Itens, unidade e Estoque mínimo = Cadastro de Insumos (D.insumos) — ver _cuIndice.
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
function _cuNorm(nome) {
  return String(nome || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/\s+/g, ' ').trim();
}
function _cuTem(obj, k) { return Object.prototype.hasOwnProperty.call(obj, k); }

function _cuDados() {
  if (!D.compraUso || typeof D.compraUso !== 'object') D.compraUso = {};
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
// Aceita AAAA-MM-DD e DD/MM/AAAA (eventos antigos da Estimativa).
function _cuMesDe(dataStr) {
  var s = String(dataStr || '').trim();
  var m = /^(\d{4})-(\d{1,2})/.exec(s);
  if (m) return m[1] + '-' + m[2].padStart(2, '0');
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(s);
  if (m) return (m[3].length === 2 ? '20' + m[3] : m[3]) + '-' + m[2].padStart(2, '0');
  return null;
}
function _cuNoMes(dataStr, anoMes) { return _cuMesDe(dataStr) === anoMes; }

// ─── ITENS CADASTRADOS (regra: tudo sai do Cadastro de Insumos) ─────────────
// Toda linha da tela é um insumo do Cadastro de Insumos (fonte única): nome,
// unidade, estoque mínimo e vínculo com o estoque vêm de lá. Compra (nome do
// Cadastro de Produtos) e consumo da Estimativa são ligados ao insumo por:
//   1) vínculo explícito insumo.origemProdutoId → produto (nome/apelidos do produto);
//   2) nome ou apelido do insumo.
// Nome que não liga a nenhum insumo NÃO vira linha: chave '#NOME' e aparece
// na caixa "Nomes fora do Cadastro" para ela corrigir (apelido no cadastro).
var _cuIdx = null;
function _cuIndice() {
  if (_cuIdx) return _cuIdx;
  var porNome = {}, porId = {};
  var add = function(n, id) { var nn = _cuNorm(n); if (nn && !porNome[nn]) porNome[nn] = id; };
  (D.insumos || []).forEach(function(i) {
    if (!i.id) return;
    porId[i.id] = i;
    add(i.nome, i.id);
  });
  (D.insumos || []).forEach(function(i) { if (i.id) (i.aliases || []).forEach(function(a) { add(a, i.id); }); });
  (D.produtos || []).forEach(function(p) {
    var ins = (D.insumos || []).find(function(i) { return i.origemProdutoId && i.origemProdutoId === p.id; });
    var id = ins ? ins.id : porNome[_cuNorm(p.nome)];
    if (!id) return;
    [p.nome].concat(p.aliases || []).forEach(function(n) { add(n, id); });
  });
  _cuIdx = { porNome: porNome, porId: porId };
  return _cuIdx;
}
// Chave = id do insumo; fora do cadastro = '#' + nome normalizado.
function _cuCanon(nome) {
  var n = _cuNorm(nome);
  if (!n) return '';
  return _cuIndice().porNome[n] || ('#' + n);
}
function _cuSemCadastro(k) { return k.charAt(0) === '#'; }

function _cuMapaProdutos() {
  var idx = _cuIndice();
  var mapa = {};
  Object.keys(idx.porId).forEach(function(id) { mapa[id] = { nome: idx.porId[id].nome, ins: idx.porId[id] }; });
  return mapa;
}
function _cuInfo(mapa, k) { return mapa[k] || { nome: _cuSemCadastro(k) ? k.slice(1) : k, ins: null }; }
function _cuUn(info) { return (info.ins && info.ins.unidadeCompra) || ''; }

// Caixa com o que veio de nome não cadastrado (nada some calado).
// itens: { '#NOME': { c: comprado, u: utilizado } }
function _cuCaixaSemCadastro(itens) {
  var ks = Object.keys(itens);
  if (!ks.length) return '';
  ks.sort(function(a, b) { return (itens[b].c + itens[b].u) - (itens[a].c + itens[a].u); });
  return '<div class="sec" style="margin-top:14px;border-color:var(--amber)">' +
    '<div class="sec-head"><span class="sec-title" style="color:var(--amber)">Nomes fora do Cadastro de Insumos (' + ks.length + ')</span></div>' +
    '<div style="font-size:11px;color:var(--text3);padding:8px 16px 0;line-height:1.5">Estes nomes foram lançados na Entrada de NF ou na Estimativa de Bebidas, mas não batem com nenhum item do Cadastro de Insumos, então não entram na tabela. ' +
      'Para juntar, abra o insumo certo em Cadastro → Insumos e coloque este nome como apelido (ou cadastre o item).</div>' +
    '<div style="padding:8px 16px 12px">' + ks.map(function(k) {
      return '<div style="display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px">' +
        '<span>' + _cuEsc(k.slice(1)) + '</span>' +
        '<span style="font-family:var(--mono);color:var(--text3)">' +
          (itens[k].c ? 'comprado ' + _cuNum(itens[k].c) : '') + (itens[k].c && itens[k].u ? ' · ' : '') + (itens[k].u ? 'utilizado ' + _cuNum(itens[k].u) : '') +
        '</span></div>';
    }).join('') + '</div></div>';
}
// Separa as chaves fora do cadastro; devolve só as cadastradas.
function _cuSepararSemCadastro(chaves, comprado, uso, destino) {
  return chaves.filter(function(k) {
    if (!_cuSemCadastro(k)) return true;
    if (!destino[k]) destino[k] = { c: 0, u: 0 };
    destino[k].c += comprado[k] || 0;
    destino[k].u += uso[k] || 0;
    return false;
  });
}

// ─── DADOS POR MÊS ──────────────────────────────────────────────────────────
// Agenda = contratos não cancelados com data no mês.
function _cuEventosMes(anoMes) {
  var lista = (D.contratos || []).filter(function(c) {
    return c.status !== 'cancelado' && _cuNoMes(c.data, anoMes);
  });
  var conv = lista.reduce(function(s, c) { return s + (Number(c.convidados) || 0); }, 0);
  return { qtd: lista.length, convidados: conv };
}

function _cuCompradoMes(anoMes) {
  var r = {};
  (D.entradas || []).forEach(function(e) {
    if (!_cuNoMes(e.data, anoMes)) return;
    var k = _cuCanon(e.prod);
    if (!k) return;
    r[k] = (r[k] || 0) + (Number(e.qtd) || 0);
  });
  return r;
}

// Eventos lançados na Estimativa de Bebidas (mesma lista "manual" do Histórico).
function _cuEventosEstimativa() {
  var excl = D.rcEventosExcluidos || [];
  return (D.rcEventos || []).filter(function(e) { return excl.indexOf(e.id) < 0; });
}

// { uso: { chave: qtd }, eventos: nº de eventos lançados no mês }
function _cuUsoMes(anoMes) {
  var uso = {}, n = 0;
  _cuEventosEstimativa().forEach(function(e) {
    if (!_cuNoMes(e.data, anoMes)) return;
    n++;
    Object.keys(e.consumo || {}).forEach(function(nome) {
      var q = parseFloat(e.consumo[nome]) || 0;
      if (q <= 0) return;
      var k = _cuCanon(nome);
      uso[k] = (uso[k] || 0) + q;
    });
  });
  return { uso: uso, eventos: n };
}

// ─── UNIDADE QUEBRADA (quantidade com fração: 2,5 / 0,75) ───────────────────
function _cuEhQuebrado(q) { q = Number(q) || 0; return Math.abs(q - Math.round(q)) > 1e-9; }
// AAAA-MM-DD a partir de AAAA-MM-DD ou DD/MM/AAAA (eventos antigos).
function _cuIso(d) {
  var s = String(d || '').trim();
  var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(s);
  if (m) return (m[3].length === 2 ? '20' + m[3] : m[3]) + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  return s;
}
function _cuDataBr(d) { var i = _cuIso(d); var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(i); return m ? m[3] + '/' + m[2] + '/' + m[1] : i; }

// Lançamentos com fração nos meses dados: da Estimativa (por festa) e da Entrada de NF.
function _cuQuebrados(meses) {
  var noPeriodo = function(d) { return meses.indexOf(_cuMesDe(d)) >= 0; };
  var mapa = _cuMapaProdutos();
  var r = [];
  _cuEventosEstimativa().forEach(function(e) {
    if (!noPeriodo(e.data)) return;
    Object.keys(e.consumo || {}).forEach(function(nome) {
      var q = parseFloat(e.consumo[nome]) || 0;
      if (q > 0 && _cuEhQuebrado(q)) r.push({ origem: 'Estimativa', data: e.data, ref: e.cliente || '—', item: _cuInfo(mapa, _cuCanon(nome)).nome, qtd: q });
    });
  });
  (D.entradas || []).forEach(function(e) {
    if (!noPeriodo(e.data)) return;
    var q = Number(e.qtd) || 0;
    if (q > 0 && _cuEhQuebrado(q)) r.push({ origem: 'Entrada de NF', data: e.data, ref: e.nf ? 'NF ' + e.nf : (e.forn || '—'), item: _cuInfo(mapa, _cuCanon(e.prod)).nome, qtd: q });
  });
  r.sort(function(a, b) { return _cuIso(a.data).localeCompare(_cuIso(b.data)); });
  return r;
}

// Bloco recolhível com a lista (fechado por padrão; só aparece se houver algum).
function _cuBlocoQuebrados(meses) {
  var r = _cuQuebrados(meses);
  if (!r.length) return '';
  return '<details class="sec" style="margin-bottom:14px">' +
    '<summary style="cursor:pointer;padding:10px 16px;font-size:12px;font-weight:600;color:var(--amber)">' + r.length + ' lançamento(s) com unidade quebrada neste período — clique para ver</summary>' +
    '<div style="font-size:11px;color:var(--text3);padding:0 16px 6px">Quantidade com fração (ex.: 2,5 = duas unidades e meia). É daqui que vêm os números com vírgula no Comprado e no Utilizado. Para corrigir, edite a festa no Histórico da Estimativa de Bebidas ou o lançamento na Entrada de NF.</div>' +
    '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="border-bottom:1px solid var(--border);color:var(--text3);font-size:10px;text-transform:uppercase">' +
        '<th style="text-align:left;padding:6px 16px">Data</th><th style="text-align:left;padding:6px 8px">Origem</th>' +
        '<th style="text-align:left;padding:6px 8px">Festa / NF</th><th style="text-align:left;padding:6px 8px">Item</th>' +
        '<th style="text-align:right;padding:6px 16px">Qtd</th></tr></thead><tbody>' +
      r.map(function(x) {
        return '<tr style="border-bottom:1px solid var(--border)">' +
          '<td style="padding:5px 16px;font-family:var(--mono);white-space:nowrap">' + _cuEsc(_cuDataBr(x.data)) + '</td>' +
          '<td style="padding:5px 8px;color:var(--text3)">' + x.origem + '</td>' +
          '<td style="padding:5px 8px">' + _cuEsc(x.ref) + '</td>' +
          '<td style="padding:5px 8px">' + _cuEsc(x.item) + '</td>' +
          '<td style="padding:5px 16px;text-align:right;font-family:var(--mono);font-weight:700;color:var(--amber)">' + _cuNum(x.qtd) + '</td>' +
        '</tr>';
      }).join('') +
    '</tbody></table></div></details>';
}

// Clique no Utilizado: de quais festas veio o número.
function cuDetalheUtilizado(anoMes, chave) {
  var mapa = _cuMapaProdutos();
  var linhas = [], total = 0;
  _cuEventosEstimativa().forEach(function(e) {
    if (!_cuNoMes(e.data, anoMes)) return;
    var q = 0;
    Object.keys(e.consumo || {}).forEach(function(nome) {
      if (_cuCanon(nome) === chave) q += parseFloat(e.consumo[nome]) || 0;
    });
    if (q <= 0) return;
    total += q;
    linhas.push({ iso: _cuIso(e.data), data: _cuDataBr(e.data), cliente: e.cliente || '—', q: q });
  });
  linhas.sort(function(a, b) { return a.iso.localeCompare(b.iso); });
  var txt = _cuInfo(mapa, chave).nome + ' — ' + _cuLabel(anoMes) + '\nUtilizado ' + _cuNum(total) + ' em ' + linhas.length + ' festa(s):\n\n' +
    linhas.map(function(l) { return l.data + '  ·  ' + l.cliente + '  ·  ' + _cuNum(l.q) + (_cuEhQuebrado(l.q) ? '   (quebrado)' : ''); }).join('\n');
  if (typeof sisDialogo === 'function') sisDialogo(txt, function() {}, { ok: 'Fechar' });
  else alert(txt);
}

function _cuResumoMes(anoMes) {
  var u = _cuUsoMes(anoMes);
  return { anoMes: anoMes, agenda: _cuEventosMes(anoMes), lancados: u.eventos, uso: u.uso, comprado: _cuCompradoMes(anoMes) };
}

// ─── ESTOQUE AO VIVO (Sistema Separação) ────────────────────────────────────
var _cuEstoque = null;        // null = não conectado; senão chave normalizada → { qtd, unidade }
var _cuEstoqueItens = 0;
var _cuEstoqueHora = '';
var _cuEstoqueUnsub = null;
var _cuEstoqueFalhou = false;   // deu erro: só tenta de novo depois de um login novo
var _cuEstoqueEsperando = false;

function _cuChaveSep(nome) {
  return typeof _normalizarChaveEstoqueSep === 'function' ? _normalizarChaveEstoqueSep(nome) : _cuNorm(nome);
}

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

// Estoque do insumo: { qtd, unidade } ou null (não conectado / não achado).
// Mesmo casamento do Cadastro de Insumos (_estoqueSeparacaoParaInsumo): nome
// do insumo e cada apelido, na ordem.
function _cuEstoqueDe(info) {
  if (!_cuEstoque || !info.ins) return null;
  var cand = [info.ins.nome].concat(info.ins.aliases || []);
  for (var i = 0; i < cand.length; i++) {
    var k = _cuChaveSep(cand[i]);
    if (k && _cuEstoque[k]) return _cuEstoque[k];
  }
  return null;
}

function _cuEstoqueCelula(info) {
  if (!_cuEstoque) return '<span style="color:var(--text3)">—</span>';
  var e = _cuEstoqueDe(info);
  if (!e) return '<span style="font-size:10px;color:var(--text3)" title="Nome e apelidos do insumo não encontrados no estoque do Sistema Separação">não achado</span>';
  var un = _cuUn(info);
  var aviso = e.unidade && un && _cuNorm(e.unidade) !== _cuNorm(un)
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
// Seleção: 'AAAA-MM' (um mês) ou 'todos-AAAA' (todos os meses daquele ano).
function _cuMesAtualSelecionado(prefixo) {
  var m = document.getElementById(prefixo + '-mes');
  var a = document.getElementById(prefixo + '-ano');
  if (m && m.value === 'todos') return 'todos-' + (a && a.value);
  return (a && a.value) + '-' + (m && m.value);
}
function _cuEhTodos(sel) { return String(sel || '').indexOf('todos-') === 0; }

// Anos com compra (Entrada de NF) ou evento lançado na Estimativa.
function _cuAnosComDados() {
  var anos = {};
  (D.entradas || []).forEach(function(e) { var m = _cuMesDe(e.data); if (m) anos[m.slice(0, 4)] = 1; });
  _cuEventosEstimativa().forEach(function(e) { var m = _cuMesDe(e.data); if (m) anos[m.slice(0, 4)] = 1; });
  return Object.keys(anos);
}

// anosExtras: anos que entram na lista mesmo sem dado (ex.: ano que vem, na Sugestão).
function _cuOpcoesMesAno(prefixo, anoMes, onchange, comTodos, anosExtras) {
  var todos = _cuEhTodos(anoMes);
  var anoSel = todos ? anoMes.slice(6) : anoMes.split('-')[0];
  var mesSel = todos ? '' : anoMes.split('-')[1];
  var anos = {};
  _cuAnosComDados().concat(anosExtras || [], [anoSel]).forEach(function(a) { anos[a] = 1; });
  anos = Object.keys(anos).sort();
  return '<div><label class="lbl">Mês</label><select id="' + prefixo + '-mes" class="inp" style="width:150px" onchange="' + onchange + '">' +
    (comTodos ? '<option value="todos"' + (todos ? ' selected' : '') + '>Todos os meses</option>' : '') +
    _CU_MESES.map(function(n, i) {
      var v = String(i + 1).padStart(2, '0');
      return '<option value="' + v + '"' + (v === mesSel ? ' selected' : '') + '>' + n + '</option>';
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

// "lançados X de Y": em amarelo quando falta lançar evento da agenda.
function _cuCoberturaTxt(lancados, agenda) {
  var falta = agenda > lancados;
  return '<span style="color:' + (falta ? 'var(--amber)' : 'var(--text3)') + '">' + lancados + ' de ' + agenda + ' lançados</span>';
}

function _cuBusca() { return ((document.getElementById('cu-busca') || {}).value || ''); }
function _cuCampoBusca(busca) {
  return '<input id="cu-busca" class="inp" style="width:200px;margin-left:auto" placeholder="Buscar produto" value="' + _cuEsc(busca) + '" oninput="_cuRebuscar()">';
}
function _cuFiltraBusca(chaves, mapa, busca) {
  var b = _cuNorm(busca);
  if (!b) return chaves;
  return chaves.filter(function(k) { return k.indexOf(b) >= 0 || _cuNorm(_cuInfo(mapa, k).nome).indexOf(b) >= 0; });
}

// ─── ENTRADA DA TELA ─────────────────────────────────────────────────────────
function rCompraUso() {
  _cuDados();
  _cuIdx = null; // cadastros podem ter mudado
  _cuIniciarEstoqueAoVivo();
  var cont = document.getElementById('cu-body');
  if (!cont) return;
  document.getElementById('cu-tab-mes').classList.toggle('active', _cuView === 'mes');
  document.getElementById('cu-tab-sug').classList.toggle('active', _cuView === 'sug');
  if (_cuView === 'sug') _cuRenderSugestao(cont);
  else if (_cuEhTodos(_cuMesSel)) _cuRenderTodos(cont, _cuMesSel.slice(6));
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

var _CU_TXT_FONTE = 'Comprado vem da Entrada de NF; utilizado vem do consumo lançado por evento na Estimativa de Bebidas. ' +
  'Uso por evento = utilizado ÷ eventos lançados na Estimativa. Ordenado pela maior movimentação. ';

// ─── ABA 1: COMPRADO x UTILIZADO DO MÊS ─────────────────────────────────────
var _cuMesSel = null;
var _CU_ONCHANGE_MES = '_cuMesSel=_cuMesAtualSelecionado(\'cu-m\');rCompraUso()';

function _cuRenderMes(cont) {
  if (!_cuMesSel) _cuMesSel = _cuSomaMes(_cuAnoMes(new Date()), -1); // padrão: mês passado (já fechado)
  var anoMes = _cuMesSel;
  var busca = _cuBusca();
  var r = _cuResumoMes(anoMes);
  var mapa = _cuMapaProdutos();

  var semCad = {};
  var chaves = Array.from(new Set(Object.keys(r.comprado).concat(Object.keys(r.uso))));
  chaves = _cuSepararSemCadastro(chaves, r.comprado, r.uso, semCad);
  var nCadComprados = Object.keys(r.comprado).filter(function(k) { return !_cuSemCadastro(k); }).length;
  var nCadUsados = Object.keys(r.uso).filter(function(k) { return !_cuSemCadastro(k); }).length;
  chaves = _cuFiltraBusca(chaves, mapa, busca);
  var mov = function(k) { return (r.comprado[k] || 0) + (r.uso[k] || 0); };
  chaves.sort(function(x, y) { return mov(y) - mov(x) || _cuInfo(mapa, x).nome.localeCompare(_cuInfo(mapa, y).nome, 'pt-BR'); });

  var html =
    '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px">' +
      _cuOpcoesMesAno('cu-m', anoMes, _CU_ONCHANGE_MES, true) +
    '</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      _cuCard('Eventos na agenda', r.agenda.qtd, fN(r.agenda.convidados) + ' convidados', 'var(--blue)') +
      _cuCard('Lançados na Estimativa', r.lancados, _cuCoberturaTxt(r.lancados, r.agenda.qtd), r.lancados < r.agenda.qtd ? 'var(--amber)' : 'var(--green)') +
      _cuCard('Itens comprados', nCadComprados, 'pela Entrada de NF') +
      _cuCard('Itens utilizados', nCadUsados, 'nos eventos lançados') +
    '</div>' +
    _cuBlocoQuebrados([anoMes]) +
    '<div class="sec">' +
      '<div class="sec-head" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
        '<span class="sec-title">Comprado x Utilizado — ' + _CU_MESES[parseInt(anoMes.split('-')[1], 10) - 1] + ' ' + anoMes.split('-')[0] + '</span>' +
        _cuCampoBusca(busca) +
      '</div>' +
      '<div style="font-size:11px;color:var(--text3);padding:8px 16px 0;line-height:1.5">' + _CU_TXT_FONTE +
        (r.lancados < r.agenda.qtd ? '<span style="color:var(--amber)">Faltam ' + (r.agenda.qtd - r.lancados) + ' evento(s) da agenda para lançar na Estimativa — o utilizado do mês está incompleto. </span>' : '') +
        _cuStatusEstoque() + '</div>';

  if (!chaves.length) {
    html += '<div style="padding:16px;font-size:12px;color:var(--text3)">Nenhuma compra nem consumo de item cadastrado neste mês' + (busca.trim() ? ' com esse nome' : '') + '.</div></div>' +
      _cuCaixaSemCadastro(semCad);
    cont.innerHTML = html;
    return;
  }

  html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
    '<thead><tr style="border-bottom:1px solid var(--border);color:var(--text3);font-size:10px;text-transform:uppercase">' +
      '<th style="text-align:left;padding:8px 12px">Item</th>' +
      '<th style="text-align:left;padding:8px 6px">Un</th>' +
      '<th style="text-align:right;padding:8px 10px">Comprado</th>' +
      '<th style="text-align:right;padding:8px 10px">Utilizado</th>' +
      '<th style="text-align:right;padding:8px 10px">Diferença</th>' +
      '<th style="text-align:right;padding:8px 10px">Uso por evento</th>' +
      '<th style="text-align:right;padding:8px 12px">Estoque atual</th>' +
    '</tr></thead><tbody>' +
    chaves.map(function(k) {
      var info = _cuInfo(mapa, k);
      var c = r.comprado[k] || 0;
      var u = r.uso[k] || 0;
      var dif = c - u;
      var difTxt = !r.lancados ? '<span style="color:var(--text3)">—</span>'
        : dif > 0 ? '<span style="color:var(--green)">sobrou ' + _cuNum(dif) + '</span>'
        : dif < 0 ? '<span style="color:var(--amber)">usou ' + _cuNum(-dif) + ' do estoque</span>'
        : '<span style="color:var(--text3)">igual</span>';
      var porEv = r.lancados ? _cuNum(u / r.lancados) : '—';
      return '<tr style="border-bottom:1px solid var(--border)">' +
        '<td style="padding:6px 12px;color:var(--text)">' + _cuEsc(info.nome) + '</td>' +
        '<td style="padding:6px 6px;color:var(--text3)">' + _cuEsc(_cuUn(info)) + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + (c ? _cuNum(c) : '<span style="color:var(--text3)">0</span>') + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + (u
          ? '<span style="cursor:pointer;text-decoration:underline dotted;' + (_cuEhQuebrado(u) ? 'color:var(--amber)' : '') + '" title="Ver de quais festas veio" onclick="cuDetalheUtilizado(\'' + anoMes + '\',\'' + _cuJs(k) + '\')">' + _cuNum(u) + '</span>'
          : '<span style="color:var(--text3)">0</span>') + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + difTxt + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + porEv + '</td>' +
        '<td style="padding:6px 12px;text-align:right;font-family:var(--mono)">' + _cuEstoqueCelula(info) + '</td>' +
      '</tr>';
    }).join('') +
    '</tbody></table></div></div>' +
    _cuCaixaSemCadastro(semCad);

  cont.innerHTML = html;
}

// ─── ABA 1 / TODOS OS MESES: tabela produto × mês ───────────────────────────
// Só o ano escolhido; sequência contínua do primeiro mês com dado até o último
// (mês sem nada no meio aparece zerado).
function _cuMesesComDados(ano) {
  var meses = {};
  var doAno = function(m) { if (m && m.slice(0, 4) === ano) meses[m] = 1; };
  (D.entradas || []).forEach(function(e) { doAno(_cuMesDe(e.data)); });
  _cuEventosEstimativa().forEach(function(e) { doAno(_cuMesDe(e.data)); });
  var lista = Object.keys(meses).sort();
  if (!lista.length) return [];
  var r = [], m = lista[0], fim = lista[lista.length - 1];
  while (m <= fim && r.length < 120) { r.push(m); m = _cuSomaMes(m, 1); }
  return r;
}

function _cuRenderTodos(cont, ano) {
  var busca = _cuBusca();
  var meses = _cuMesesComDados(ano);
  var mapa = _cuMapaProdutos();
  var porMes = meses.map(_cuResumoMes);

  var tot = {};
  porMes.forEach(function(pm) {
    Object.keys(pm.comprado).forEach(function(k) { (tot[k] || (tot[k] = { c: 0, u: 0 })).c += pm.comprado[k]; });
    Object.keys(pm.uso).forEach(function(k) { (tot[k] || (tot[k] = { c: 0, u: 0 })).u += pm.uso[k]; });
  });
  var semCad = {};
  var cadastradas = Object.keys(tot).filter(function(k) {
    if (_cuSemCadastro(k)) { semCad[k] = tot[k]; return false; }
    return true;
  });
  var chaves = _cuFiltraBusca(cadastradas, mapa, busca);
  chaves.sort(function(x, y) { return (tot[y].c + tot[y].u) - (tot[x].c + tot[x].u) || _cuInfo(mapa, x).nome.localeCompare(_cuInfo(mapa, y).nome, 'pt-BR'); });

  var totalAgenda = porMes.reduce(function(s, pm) { return s + pm.agenda.qtd; }, 0);
  var totalLanc = porMes.reduce(function(s, pm) { return s + pm.lancados; }, 0);
  var html =
    '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px">' +
      _cuOpcoesMesAno('cu-m', 'todos-' + ano, _CU_ONCHANGE_MES, true) +
    '</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      _cuCard('Meses', meses.length, meses.length ? _cuLabel(meses[0]) + ' a ' + _cuLabel(meses[meses.length - 1]) : '') +
      _cuCard('Eventos na agenda', fN(totalAgenda), meses.length ? 'média ' + _cuNum(totalAgenda / meses.length) + ' por mês' : '', 'var(--blue)') +
      _cuCard('Lançados na Estimativa', fN(totalLanc), _cuCoberturaTxt(totalLanc, totalAgenda), totalLanc < totalAgenda ? 'var(--amber)' : 'var(--green)') +
      _cuCard('Itens movimentados', cadastradas.length, 'comprados ou utilizados') +
    '</div>' +
    _cuBlocoQuebrados(meses) +
    '<div class="sec">' +
      '<div class="sec-head" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
        '<span class="sec-title">Comprado x Utilizado — todos os meses de ' + ano + '</span>' +
        _cuCampoBusca(busca) +
      '</div>' +
      '<div style="font-size:11px;color:var(--text3);padding:8px 16px 0;line-height:1.5">' + _CU_TXT_FONTE +
        'Em cada mês: C = comprado, U = utilizado (em vermelho quando usou mais do que comprou). Embaixo do mês: eventos na agenda e quantos foram lançados na Estimativa. ' +
        _cuStatusEstoque() + '</div>';

  if (!chaves.length) {
    html += '<div style="padding:16px;font-size:12px;color:var(--text3)">Nenhuma compra nem consumo de item cadastrado' + (busca.trim() ? ' com esse nome' : '') + '.</div></div>' +
      _cuCaixaSemCadastro(semCad);
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
        '<th rowspan="2" style="' + stickyTh + 'text-align:left;padding:8px 12px;min-width:180px;border-bottom:1px solid var(--border)">Item</th>' +
        porMes.map(function(pm) {
          return '<th colspan="2" style="' + sep + 'padding:6px 8px;text-align:center;white-space:nowrap">' + _cuLabel(pm.anoMes) +
            '<div style="font-weight:400;text-transform:none;color:var(--blue)">' + pm.agenda.qtd + ' ev.</div>' +
            '<div style="font-weight:400;text-transform:none;color:' + (pm.lancados < pm.agenda.qtd ? 'var(--amber)' : 'var(--text3)') + '">' + pm.lancados + ' lanç.</div></th>';
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
      var info = _cuInfo(mapa, k);
      var t = tot[k];
      var celulas = porMes.map(function(pm) {
        var c = pm.comprado[k] || 0;
        var u = pm.uso[k] || 0;
        return '<td style="' + sep + 'padding:5px 8px;text-align:right;font-family:var(--mono);' + (c ? '' : 'color:var(--text3)') + '">' + (c ? _cuNum(c) : '·') + '</td>' +
          '<td style="padding:5px 8px;text-align:right;font-family:var(--mono);' + (!u ? 'color:var(--text3)' : u > c ? 'color:var(--red)' : '') + '">' + (u ? _cuNum(u) : '·') + '</td>';
      }).join('');
      return '<tr style="border-bottom:1px solid var(--border)">' +
        '<td style="' + stickyTd + 'padding:5px 12px;color:var(--text);white-space:nowrap">' + _cuEsc(info.nome) + '</td>' +
        celulas +
        '<td style="' + sep + 'padding:5px 8px;text-align:right;font-family:var(--mono);font-weight:700">' + _cuNum(t.c) + '</td>' +
        '<td style="padding:5px 8px;text-align:right;font-family:var(--mono);font-weight:700">' + _cuNum(t.u) + '</td>' +
        '<td style="' + sep + 'padding:5px 8px;text-align:right;font-family:var(--mono)">' + _cuNum(t.c / meses.length) + '</td>' +
        '<td style="padding:5px 8px;text-align:right;font-family:var(--mono)">' + (totalLanc ? _cuNum(t.u / totalLanc) : '—') + '</td>' +
        '<td style="padding:5px 12px;text-align:right;font-family:var(--mono)">' + _cuEstoqueCelula(info) + '</td>' +
      '</tr>';
    }).join('') +
    '</tbody></table></div></div>' +
    _cuCaixaSemCadastro(semCad);

  cont.innerHTML = html;
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
  for (var i = nBase; i >= 1; i--) base.push(_cuResumoMes(_cuSomaMes(alvo, -i)));
  var totalAgendaBase = base.reduce(function(s, m) { return s + m.agenda.qtd; }, 0);
  var totalLancBase = base.reduce(function(s, m) { return s + m.lancados; }, 0);

  var mapa = _cuMapaProdutos();
  var chaves = {};
  base.forEach(function(m) {
    Object.keys(m.comprado).forEach(function(k) { chaves[k] = 1; });
    Object.keys(m.uso).forEach(function(k) { chaves[k] = 1; });
  });
  (D.insumos || []).forEach(function(i) { if (i.id && Number(i.estoqueMinimo) > 0) chaves[i.id] = 1; });

  var conectado = !!_cuEstoque;
  var semCad = {};
  Object.keys(chaves).forEach(function(k) {
    if (!_cuSemCadastro(k)) return;
    semCad[k] = { c: 0, u: 0 };
    base.forEach(function(m) { semCad[k].c += m.comprado[k] || 0; semCad[k].u += m.uso[k] || 0; });
    delete chaves[k];
  });

  var linhas = Object.keys(chaves).map(function(k) {
    var info = _cuInfo(mapa, k);
    var somaComp = 0, somaUso = 0;
    base.forEach(function(m) { somaComp += m.comprado[k] || 0; somaUso += m.uso[k] || 0; });
    var mediaCompra = somaComp / nBase;
    // Uso por evento: consumo ÷ eventos lançados na Estimativa; sem nenhum lançado, usa a compra ÷ agenda.
    var porEvento = null, fonte = '';
    if (totalLancBase) { porEvento = somaUso / totalLancBase; fonte = 'uso'; }
    else if (totalAgendaBase) { porEvento = somaComp / totalAgendaBase; fonte = 'compra'; }
    var previsto = porEvento != null ? porEvento * evPrev : mediaCompra;
    var minimo = info.ins ? (Number(info.ins.estoqueMinimo) || 0) : 0;

    var est = null;
    if (conectado) { var e = _cuEstoqueDe(info); if (e) est = e.qtd; }
    else if (_cuTem(_cuEstoqueManual, k)) est = _cuEstoqueManual[k];
    var sugestao = Math.max(0, Math.ceil(previsto + minimo - (est || 0)));
    var abaixo = est != null && minimo > 0 && est < minimo;
    return { k: k, info: info, mediaCompra: mediaCompra, porEvento: porEvento, fonte: fonte,
      previsto: previsto, minimo: minimo, est: est, sugestao: sugestao, abaixo: abaixo,
      mov: somaComp + somaUso };
  });

  var bk = _cuFiltraBusca(linhas.map(function(l) { return l.k; }), mapa, busca);
  linhas = linhas.filter(function(l) { return bk.indexOf(l.k) >= 0; });
  if (soAbaixo) linhas = linhas.filter(function(l) { return l.abaixo; });
  linhas.sort(function(x, y) { return y.mov - x.mov || x.info.nome.localeCompare(y.info.nome, 'pt-BR'); });
  var qtdAbaixo = linhas.filter(function(l) { return l.abaixo; }).length;

  var nomeAlvo = _CU_MESES[parseInt(alvo.split('-')[1], 10) - 1] + ' ' + alvo.split('-')[0];
  var proporcao = totalAgendaBase ? (evPrev / (totalAgendaBase / nBase)) : null;
  var anoAtual = new Date().getFullYear();

  var html =
    '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px">' +
      '<div style="font-size:12px;color:var(--text2);padding-bottom:9px">Comprar para</div>' +
      _cuOpcoesMesAno('cu-s', alvo, '_cuAlvo=_cuMesAtualSelecionado(\'cu-s\');_cuEventosPrevistos=null;rCompraUso()', false, [String(anoAtual), String(anoAtual + 1)]) +
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
          return '<div style="border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;min-width:120px">' +
            '<div style="font-size:11px;color:var(--text3)">' + _cuLabel(m.anoMes) + '</div>' +
            '<div style="font-size:16px;font-weight:700;font-family:var(--mono)">' + m.agenda.qtd + ' eventos</div>' +
            '<div style="font-size:11px">' + _cuCoberturaTxt(m.lancados, m.agenda.qtd) + '</div>' +
          '</div>';
        }).join('') +
        '<div style="border:1px solid var(--blue);border-radius:var(--radius);padding:8px 12px;min-width:140px">' +
          '<div style="font-size:11px;color:var(--text3)">' + _cuLabel(alvo) + ' (a comprar)</div>' +
          '<div style="font-size:16px;font-weight:700;font-family:var(--mono);color:var(--blue)">' + evPrev + ' eventos</div>' +
          '<div style="font-size:11px;color:var(--text3)">' + (proporcao != null ? _cuNum(proporcao * 100) + '% da média da base' : 'base sem eventos') + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--text3);padding:0 16px 12px;line-height:1.5">' +
        'Uso por evento = consumo lançado na Estimativa de Bebidas ÷ eventos lançados nos meses-base (sem nenhum lançado, usa o comprado ÷ eventos da agenda — marcado "pela compra"). ' +
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
      ' O mínimo é o mesmo do Cadastro de Insumos (Estoque mínimo). Ordenado pela maior movimentação nos meses-base.' +
    '</div>';

  if (!linhas.length) {
    html += '<div style="padding:16px;font-size:12px;color:var(--text3)">' +
      (soAbaixo ? 'Nenhum item abaixo do mínimo.' : 'Nenhuma compra ou consumo de item cadastrado nos meses-base' + (busca.trim() ? ' com esse nome' : '') + ', e nenhum item com estoque mínimo.') +
      '</div></div>' + _cuCaixaSemCadastro(semCad);
    cont.innerHTML = html;
    return;
  }

  html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
    '<thead><tr style="border-bottom:1px solid var(--border);color:var(--text3);font-size:10px;text-transform:uppercase">' +
      '<th style="text-align:left;padding:8px 12px">Item</th>' +
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
      var minCampo = '<input class="inp" type="number" min="0" step="any" style="width:80px;text-align:right" value="' + (l.minimo || '') + '" placeholder="0" onchange="cuSalvarMinimo(\'' + _cuJs(l.k) + '\',this.value)">';
      var estCampo = conectado
        ? '<span style="font-family:var(--mono);' + (l.abaixo ? 'color:var(--red);font-weight:700' : '') + '">' + _cuEstoqueCelula(l.info) + '</span>'
        : '<input class="inp" type="number" min="0" step="any" style="width:80px;text-align:right;' + (l.abaixo ? 'border-color:var(--red);color:var(--red)' : '') + '" value="' + (l.est != null ? l.est : '') + '" placeholder="—" onchange="cuEstoqueManual(\'' + _cuJs(l.k) + '\',this.value)">';
      return '<tr style="border-bottom:1px solid var(--border);' + (l.abaixo ? 'background:rgba(240,90,90,.06)' : '') + '">' +
        '<td style="padding:6px 12px;color:var(--text)">' + _cuEsc(l.info.nome) + (l.abaixo ? ' <span style="font-size:10px;font-weight:600;color:var(--red)">ABAIXO DO MÍNIMO</span>' : '') + '</td>' +
        '<td style="padding:6px 6px;color:var(--text3)">' + _cuEsc(_cuUn(l.info)) + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + _cuNum(l.mediaCompra) + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + porEvTxt + '</td>' +
        '<td style="padding:6px 10px;text-align:right;font-family:var(--mono)">' + _cuNum(l.previsto) + '</td>' +
        '<td style="padding:4px 10px;text-align:right">' + minCampo + '</td>' +
        '<td style="padding:4px 10px;text-align:right">' + estCampo + '</td>' +
        '<td style="padding:6px 12px;text-align:right;font-family:var(--mono);font-weight:700;color:' + (l.sugestao > 0 ? 'var(--green)' : 'var(--text3)') + '">' + fN(l.sugestao) + '</td>' +
      '</tr>';
    }).join('') +
    '</tbody></table></div></div>' +
    _cuCaixaSemCadastro(semCad);

  cont.innerHTML = html;
}

function cuSalvarBase(v) {
  _cuDados().baseMeses = Math.max(1, Math.min(12, parseInt(v, 10) || 3));
  sv('compraUso');
  rCompraUso();
}

// Grava no Estoque mínimo do Cadastro de Insumos (mesmo campo da tela de lá).
function cuSalvarMinimo(insumoId, v) {
  var ins = (D.insumos || []).find(function(x) { return x.id === insumoId; });
  if (!ins) return;
  var n = Number(String(v).replace(',', '.')) || 0;
  if (n < 0) n = 0;
  ins.estoqueMinimo = n;
  sv('insumos');
  rCompraUso();
}

function cuEstoqueManual(chave, v) {
  var s = String(v).trim();
  if (s === '') delete _cuEstoqueManual[chave];
  else _cuEstoqueManual[chave] = Math.max(0, Number(s.replace(',', '.')) || 0);
  rCompraUso();
}
