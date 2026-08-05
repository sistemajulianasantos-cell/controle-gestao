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
  'DESCARTÁVEIS', 'KIT BARTENDER', 'OUTROS',
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

  cont.innerHTML =
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
  if (D.categorias.some(function(c) { return c.id !== id && (c.nome || '').toUpperCase() === novoNome; })) {
    alert('Já existe uma categoria com esse nome.');
    rCategoriasLista();
    return;
  }
  var nomeAntigo = cat.nome;
  cat.nome = novoNome;
  // Atualiza os insumos que usavam o nome antigo, pra não ficarem órfãos.
  (D.insumos || []).forEach(function(i) { if (i.categoria === nomeAntigo) i.categoria = novoNome; });
  sv('categorias');
  if (D.insumos) sv('insumos');
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
