// ─── CADASTRO DE CATEGORIAS ─────────────────────────────────────────────────
// Terceiro domínio da centralização de cadastro (depois de Produtos/Insumos
// e Cargos). Substitui a lista fixa CATEGORIAS_INSUMO (que era só um array
// no código, sem tela) por um cadastro editável — usado hoje pelo Cadastro
// de Insumos; Produtos (produtos.js) e as fichas de coquetel continuam com
// suas próprias listas por enquanto, migração deles fica pra depois.

// Semente inicial — mesma lista que já existia hardcoded em insumos.js.
var CATEGORIAS_INSUMO_PADRAO = [
  'BEBIDAS ALCOÓLICAS', 'BEBIDAS SEM ÁLCOOL', 'COPOS E TAÇAS', 'HORTIFRUTI',
  'ESPECIARIAS', 'MIX ARTESANAL', 'PRODUÇÃO', 'XAROPES', 'MATERIAL', 'GELO',
  'DESCARTÁVEIS', 'KIT BARTENDER', 'SHOTS', 'OUTROS',
];

function initCategoriasCadastro() {
  if (!D.categorias) D.categorias = [];
  migrarCategorias();
  _migrarOrdemCategorias();
  rCategoriasLista();
}

// Semeia D.categorias uma única vez a partir da lista padrão — depois disso
// ela é livre pra adicionar/renomear/excluir sem nunca ser resetada.
function migrarCategorias() {
  if (D.categorias && D.categorias.length) return;
  if (!D.categorias) D.categorias = [];
  CATEGORIAS_INSUMO_PADRAO.forEach(function(nome, i) {
    D.categorias.push({ id: 'CAT' + Date.now() + Math.random().toString(36).slice(2, 6), nome: nome, ordem: i + 1 });
  });
  sv('categorias');
}

// Ordem antiga, fixa no código, usada pelo Cardápio/Calculadora do orçamento
// antes de existir o campo `ordem` aqui (js/orcamento.js, _orcOrdenarCats).
// Serve só pra reproduzir a ordem que já aparecia pra ela, na primeira vez
// que cada categoria ganha um `ordem` de verdade — depois disso, morre.
var _ORDEM_CATEGORIAS_LEGADA = ['BEBIDAS ALCOÓLICAS', 'COPOS E TAÇAS', 'HORTIFRUTI', 'ESPECIARIAS', 'MIX ARTESANAL', 'PRODUÇÃO', 'XAROPES', 'MATERIAL (ESPECÍFICO)'];

// Dá um `ordem` numérico pra toda categoria que ainda não tem (idempotente —
// só mexe em quem estiver faltando, nunca reordena quem já foi ajustado).
// Reconstrói a ordem visual de antes (legada primeiro, resto alfabético) pra
// não embaralhar nada no primeiro carregamento depois desse deploy.
function _migrarOrdemCategorias() {
  var faltantes = (D.categorias || []).filter(function(c) { return c.ordem == null; });
  if (!faltantes.length) return;
  var ordenados = faltantes.slice().sort(function(a, b) {
    var ia = _ORDEM_CATEGORIAS_LEGADA.indexOf((a.nome || '').toUpperCase());
    var ib = _ORDEM_CATEGORIAS_LEGADA.indexOf((b.nome || '').toUpperCase());
    if (ia === -1 && ib === -1) return (a.nome || '').localeCompare(b.nome || '');
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  var maxAtual = (D.categorias || []).reduce(function(m, c) { return Math.max(m, c.ordem || 0); }, 0);
  ordenados.forEach(function(c, i) { c.ordem = maxAtual + i + 1; });
  sv('categorias');
}

// Lista de nomes (compatível com o antigo CATEGORIAS_INSUMO) — usada pelos
// dropdowns de categoria em outras telas (Cadastro de Insumos, etc).
function getCategorias() {
  if (!D.categorias || !D.categorias.length) return CATEGORIAS_INSUMO_PADRAO.slice();
  return D.categorias.map(function(c) { return c.nome; });
}

function buscarCategoriaPorId(id) {
  return (D.categorias || []).find(function(c) { return c.id === id; }) || null;
}

function _categoriaEmUso(nome) {
  return (D.insumos || []).filter(function(i) { return i.categoria === nome; }).length;
}

function rCategoriasLista() {
  var cont = document.getElementById('ctg-lista-body');
  if (!cont) return;
  var lista = (D.categorias || []).slice().sort(function(a, b) { return (a.ordem || 0) - (b.ordem || 0); });

  var linhas = lista.length ? lista.map(function(c, i) {
    var qtd = _categoriaEmUso(c.nome);
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
      '<div style="display:flex;flex-direction:column;gap:2px">' +
        '<button class="btn-sm" style="padding:0 6px;background:var(--bg2)" ' + (i === 0 ? 'disabled' : '') + ' onclick="moverCategoria(\'' + c.id + '\',-1)">▲</button>' +
        '<button class="btn-sm" style="padding:0 6px;background:var(--bg2)" ' + (i === lista.length - 1 ? 'disabled' : '') + ' onclick="moverCategoria(\'' + c.id + '\',1)">▼</button>' +
      '</div>' +
      '<input class="inp" type="text" value="' + c.nome + '" style="flex:1;font-size:12px;padding:5px 8px" onchange="renomearCategoria(\'' + c.id + '\',this.value)">' +
      (qtd ? '<span style="font-size:10px;color:var(--text3)">' + qtd + ' insumo(s)</span>' : '<span style="font-size:10px;color:var(--text3)">sem uso</span>') +
      '<button class="btn-sm btn-red" onclick="excluirCategoria(\'' + c.id + '\')">×</button>' +
    '</div>';
  }).join('') : '<div style="text-align:center;color:var(--text3);padding:24px;font-size:13px">Nenhuma categoria cadastrada.</div>';

  var dups = _gruposCategoriasDuplicadas();
  var bannerDup = dups.length
    ? '<div style="background:var(--amber-bg);border:1px solid var(--amber-dim);border-radius:var(--radius);padding:10px 14px;margin-bottom:12px">' +
        '<div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + dups.length + ' categoria(s) duplicada(s)</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Mesma categoria escrita de formas diferentes (acento, maiúscula, espaço) — inclui categoria "fantasma" que aparece em algum insumo/ficha/regra mas não está cadastrada: ' +
          dups.map(function(g){ return g.map(function(n){ return '"' + n + '"'; }).join(' = '); }).join(' · ') +
        '</div>' +
        '<button class="btn-sm" style="background:var(--amber);color:#1a1400;font-weight:700" onclick="unificarCategoriasDuplicadas()">Unificar automaticamente</button>' +
      '</div>'
    : '';

  cont.innerHTML =
    bannerDup +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">Use as setas ▲▼ pra definir a ordem em que as categorias aparecem no Cardápio e na Calculadora do orçamento.</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px">' +
      '<input class="inp" id="ctg-nome" type="text" placeholder="Nome da nova categoria" style="flex:1" onkeydown="if(event.key===\'Enter\')adicionarCategoria()">' +
      '<button class="btn" style="background:var(--green)" onclick="adicionarCategoria()">+ Adicionar</button>' +
    '</div>' +
    linhas;
}

function moverCategoria(id, dir) {
  var lista = (D.categorias || []).slice().sort(function(a, b) { return (a.ordem || 0) - (b.ordem || 0); });
  var idx = lista.findIndex(function(c) { return c.id === id; });
  var alvo = idx + dir;
  if (idx === -1 || alvo < 0 || alvo >= lista.length) return;
  var a = buscarCategoriaPorId(lista[idx].id);
  var b = buscarCategoriaPorId(lista[alvo].id);
  var tmp = a.ordem; a.ordem = b.ordem; b.ordem = tmp;
  sv('categorias');
  rCategoriasLista();
}

function adicionarCategoria() {
  var nome = (document.getElementById('ctg-nome')?.value || '').trim().toUpperCase();
  if (!nome) { alert('Informe o nome da categoria.'); return; }
  if (!D.categorias) D.categorias = [];
  if (D.categorias.some(function(c) { return (c.nome || '').toUpperCase() === nome; })) {
    alert('Essa categoria já existe.');
    return;
  }
  var parecida = D.categorias.find(function(c) { return _normCat(c.nome) === _normCat(nome); });
  if (parecida && !confirm('Já existe "' + parecida.nome + '", que é praticamente a mesma coisa. Criar "' + nome + '" mesmo assim (vai virar duplicada)?')) {
    return;
  }
  var ordemMax = D.categorias.reduce(function(m, c) { return Math.max(m, c.ordem || 0); }, 0);
  D.categorias.push({ id: 'CAT' + Date.now() + Math.random().toString(36).slice(2, 6), nome: nome, ordem: ordemMax + 1 });
  sv('categorias');
  document.getElementById('ctg-nome').value = '';
  rCategoriasLista();
  _atualizarFiltrosDeCategoria();
}

function renomearCategoria(id, novoNomeRaw) {
  var novoNome = (novoNomeRaw || '').trim().toUpperCase();
  if (!novoNome) { alert('O nome não pode ficar vazio.'); rCategoriasLista(); return; }
  var cat = buscarCategoriaPorId(id);
  if (!cat) return;
  if (cat.nome === novoNome) return;

  var jaExiste = D.categorias.find(function(c) { return c.id !== id && (c.nome || '').toUpperCase() === novoNome; });
  if (jaExiste) {
    if (!confirm('Já existe a categoria "' + jaExiste.nome + '". Juntar "' + cat.nome + '" nela? Os insumos, fichas e regras de "' + cat.nome + '" passam pra "' + jaExiste.nome + '".')) {
      rCategoriasLista();
      return;
    }
    _reatribuirCategoria(cat.nome, jaExiste.nome);
    D.categorias = D.categorias.filter(function(c) { return c.id !== id; });
    _salvarTudoQueUsaCategoria();
    rCategoriasLista();
    _atualizarFiltrosDeCategoria();
    return;
  }

  _reatribuirCategoria(cat.nome, novoNome);
  cat.nome = novoNome;
  _salvarTudoQueUsaCategoria();
  rCategoriasLista();
  _atualizarFiltrosDeCategoria();
}

// ── Unificar categorias escritas de formas diferentes ─────────────────────
// "BEBIDAS ALCOÓLICAS" / "BEBIDAS ALCOOLICAS" / "bebidas alcoolicas" viram uma
// só. Detecta por chave normalizada (sem acento, sem caixa, sem pontuação,
// sem conectivo "E/DE/DA/DO").
var _CONECTIVOS_CAT = ['E', 'DE', 'DA', 'DO', 'DAS', 'DOS'];

function _normCat(s) {
  var base = (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
  return base.split(/\s+/).filter(function(t) {
    return t && _CONECTIVOS_CAT.indexOf(t) === -1;
  }).join(' ');
}

function _contaAcentos(s) {
  var m = (s || '').normalize('NFD').match(/[̀-ͯ]/g);
  return m ? m.length : 0;
}

// Todos os nomes de categoria em jogo: os cadastrados (D.categorias) MAIS os
// que aparecem "soltos" em insumos/produtos/fichas/regras (categoria fantasma
// — nunca foi cadastrada, ou é uma grafia antiga de uma que existe).
function _todosNomesDeCategoria() {
  var set = {};
  function add(n) { n = (n || '').trim(); if (n) set[n.toUpperCase()] = n; }
  (D.categorias || []).forEach(function(c) { add(c.nome); });
  (D.insumos || []).forEach(function(i) { add(i.categoria); });
  (D.produtos || []).forEach(function(p) { add(p.categoria); });
  (D.fichas || []).forEach(function(f) { (f.itens || []).forEach(function(it) { add(it.cat); }); });
  (D.regrasItens || []).forEach(function(r) { add(r.cat); });
  return Object.keys(set).map(function(k) { return set[k]; });
}

// Grupos de nomes de categoria que são "a mesma" a menos de acento/caixa/
// pontuação. Cada grupo é uma lista de STRINGS (nomes), não de objetos.
// Pega tanto duplicata em D.categorias quanto categoria fantasma (ex: um
// insumo em "PRODUCAO" quando a cadastrada é "PRODUÇÃO").
function _gruposCategoriasDuplicadas() {
  var porChave = {};
  _todosNomesDeCategoria().forEach(function(nome) {
    var k = _normCat(nome);
    if (!k) return;
    (porChave[k] = porChave[k] || []).push(nome);
  });
  return Object.keys(porChave)
    .map(function(k) { return porChave[k]; })
    .filter(function(g) { return g.length > 1; });
}

// Nome oficial de um grupo (lista de strings): grafia do padrão se houver;
// senão a que está cadastrada em D.categorias; senão a mais acentuada; senão
// a mais usada; senão a mais longa.
function _canonicaDoGrupo(grupo) {
  var chave = _normCat(grupo[0]);
  var padrao = CATEGORIAS_INSUMO_PADRAO.find(function(p) { return _normCat(p) === chave; });
  if (padrao) return padrao;
  return grupo.slice().sort(function(a, b) {
    var cadA = (D.categorias || []).some(function(c) { return c.nome === a; }) ? 1 : 0;
    var cadB = (D.categorias || []).some(function(c) { return c.nome === b; }) ? 1 : 0;
    if (cadA !== cadB) return cadB - cadA;
    var ac = _contaAcentos(b) - _contaAcentos(a);
    if (ac) return ac;
    var us = _categoriaEmUso(b) - _categoriaEmUso(a);
    if (us) return us;
    return (b || '').length - (a || '').length;
  })[0];
}

// Move tudo que referencia a categoria `de` (por nome) pra `para`.
function _reatribuirCategoria(de, para) {
  if (!de || !para || de === para) return;
  var deU = (de || '').toUpperCase();
  (D.insumos || []).forEach(function(i) { if ((i.categoria || '').toUpperCase() === deU) i.categoria = para; });
  (D.produtos || []).forEach(function(p) { if ((p.categoria || '').toUpperCase() === deU) p.categoria = para; });
  (D.fichas || []).forEach(function(f) {
    (f.itens || []).forEach(function(it) { if ((it.cat || '').toUpperCase() === deU) it.cat = para; });
  });
  (D.regrasItens || []).forEach(function(r) { if ((r.cat || '').toUpperCase() === deU) r.cat = para; });
  if (D.bibliotecaItens) {
    Object.keys(D.bibliotecaItens).forEach(function(k) {
      if (k.toUpperCase() === deU && k !== para) {
        D.bibliotecaItens[para] = (D.bibliotecaItens[para] || []).concat(D.bibliotecaItens[k] || []);
        delete D.bibliotecaItens[k];
      }
    });
  }
}

function _salvarTudoQueUsaCategoria() {
  sv('categorias');
  if (D.insumos) sv('insumos');
  if (D.produtos) sv('produtos');
  if (D.fichas) sv('fichas');
  if (D.regrasItens) sv('regrasItens');
  if (D.bibliotecaItens) sv('bibliotecaItens');
}

function unificarCategoriasDuplicadas() {
  var grupos = _gruposCategoriasDuplicadas();
  if (!grupos.length) { alert('Nenhuma categoria duplicada encontrada.'); return; }

  var resumo = grupos.map(function(g) {
    var canon = _canonicaDoGrupo(g);
    var outras = g.filter(function(n) { return n !== canon; });
    return '• ' + outras.map(function(n){ return '"' + n + '"'; }).join(' + ') + '  →  "' + canon + '"';
  }).join('\n');

  if (!confirm('Unificar ' + grupos.length + ' grupo(s) de categoria:\n\n' + resumo +
    '\n\nOs insumos, fichas e regras passam a usar a versão oficial. Orçamentos já fechados não são alterados. Continuar?')) return;

  var mudou = 0;
  grupos.forEach(function(g) {
    var canon = _canonicaDoGrupo(g);
    // Garante a categoria oficial cadastrada.
    if (!D.categorias.some(function(c) { return c.nome === canon; })) {
      var ordemMax = D.categorias.reduce(function(m, c) { return Math.max(m, c.ordem || 0); }, 0);
      D.categorias.push({ id: 'CAT' + Date.now() + Math.random().toString(36).slice(2, 6), nome: canon, ordem: ordemMax + 1 });
    }
    g.forEach(function(nome) {
      if (nome === canon) return;
      _reatribuirCategoria(nome, canon);
      D.categorias = D.categorias.filter(function(c) { return c.nome !== nome; });
      mudou++;
    });
  });

  _salvarTudoQueUsaCategoria();
  alert(mudou + ' grafia(s) de categoria unificada(s).');
  rCategoriasLista();
  _atualizarFiltrosDeCategoria();
}

function excluirCategoria(id) {
  var cat = buscarCategoriaPorId(id);
  if (!cat) return;
  var qtd = _categoriaEmUso(cat.nome);
  if (qtd) { alert('Essa categoria está em uso por ' + qtd + ' insumo(s) — renomeie os insumos pra outra categoria antes de excluir.'); return; }
  if (!confirm('Excluir a categoria "' + cat.nome + '"?')) return;
  D.categorias = (D.categorias || []).filter(function(c) { return c.id !== id; });
  sv('categorias');
  rCategoriasLista();
  _atualizarFiltrosDeCategoria();
}

// Repopula os <select> de categoria de outras telas (hoje só o filtro do
// Cadastro de Insumos) sempre que a lista de categorias mudar.
function _atualizarFiltrosDeCategoria() {
  var filtro = document.getElementById('cad-cat-filtro');
  if (filtro) {
    var atual = filtro.value;
    filtro.innerHTML = '<option value="">Todas as categorias</option>' +
      getCategorias().map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');
    filtro.value = atual;
  }
}
