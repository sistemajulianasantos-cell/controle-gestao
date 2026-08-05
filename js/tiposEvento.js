// ─── CADASTRO DE TIPOS DE EVENTO ────────────────────────────────────────────
// Substitui os dicionários fixos {casamento,15anos,formatura,outros} que
// viviam duplicados em orcCalc.js, orcamento.js e orcProposta.js. O `id` de
// cada tipo é a chave usada em orc.calcParams.tipoEvento e nas opções do
// fator Seguro (js/regras.js) — por isso a semente usa os mesmos 4 ids de
// antes (não quebra orçamentos já salvos) e o id nunca muda depois de criado.

var TIPOS_EVENTO_PADRAO = [
  { id: 'casamento', nome: 'Casamento' },
  { id: '15anos',    nome: '15 Anos' },
  { id: 'formatura', nome: 'Formatura' },
  { id: 'outros',    nome: 'Outros' },
];

function initTiposEventoCadastro() {
  if (!D.tiposEvento) D.tiposEvento = [];
  migrarTiposEvento();
  rTiposEventoLista();
}

// Semeia D.tiposEvento uma única vez a partir da lista padrão — idempotente,
// mesmo padrão de migrarCategorias() (js/categorias.js).
function migrarTiposEvento() {
  if (D.tiposEvento && D.tiposEvento.length) return;
  if (!D.tiposEvento) D.tiposEvento = [];
  TIPOS_EVENTO_PADRAO.forEach(function(t, i) {
    D.tiposEvento.push({ id: t.id, nome: t.nome, ordem: i + 1 });
  });
  sv('tiposEvento');
}

// Lista ordenada — usada pelos dropdowns de Tipo de Evento e pelas opções
// dinâmicas do fator Seguro (Regras e Cálculos → Preços do Orçamento).
function getTiposEvento() {
  if (!D.tiposEvento || !D.tiposEvento.length) return TIPOS_EVENTO_PADRAO.map(function(t, i) { return { id: t.id, nome: t.nome, ordem: i + 1 }; });
  return D.tiposEvento.slice().sort(function(a, b) { return (a.ordem || 0) - (b.ordem || 0); });
}

function buscarTipoEventoPorId(id) {
  return (D.tiposEvento || []).find(function(t) { return t.id === id; }) || null;
}

function _tipoEventoEmUso(id) {
  return (D.orcamentos || []).filter(function(o) { return o.calcParams && o.calcParams.tipoEvento === id; }).length;
}

var _DIACRITICOS_RE = /[\u0300-\u036f]/g;
function _slugTipoEvento(nomeRaw) {
  var base = (nomeRaw || '').normalize('NFD').replace(_DIACRITICOS_RE, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (!base) base = 'tipo';
  var slug = base, n = 2;
  while ((D.tiposEvento || []).some(function(t) { return t.id === slug; })) { slug = base + n; n++; }
  return slug;
}

function rTiposEventoLista() {
  var cont = document.getElementById('tev-lista-body');
  if (!cont) return;
  var lista = getTiposEvento();

  var linhas = lista.length ? lista.map(function(t, i) {
    var qtd = _tipoEventoEmUso(t.id);
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
      '<div style="display:flex;flex-direction:column;gap:2px">' +
        '<button class="btn-sm" style="padding:0 6px;background:var(--bg2)" ' + (i === 0 ? 'disabled' : '') + ' onclick="moverTipoEvento(\'' + t.id + '\',-1)">▲</button>' +
        '<button class="btn-sm" style="padding:0 6px;background:var(--bg2)" ' + (i === lista.length - 1 ? 'disabled' : '') + ' onclick="moverTipoEvento(\'' + t.id + '\',1)">▼</button>' +
      '</div>' +
      '<input class="inp" type="text" value="' + t.nome + '" style="flex:1;font-size:12px;padding:5px 8px" onchange="renomearTipoEvento(\'' + t.id + '\',this.value)">' +
      (qtd ? '<span style="font-size:10px;color:var(--text3)">' + qtd + ' orçamento(s)</span>' : '<span style="font-size:10px;color:var(--text3)">sem uso</span>') +
      '<button class="btn-sm btn-red" onclick="excluirTipoEvento(\'' + t.id + '\')">×</button>' +
    '</div>';
  }).join('') : '<div style="text-align:center;color:var(--text3);padding:24px;font-size:13px">Nenhum tipo de evento cadastrado.</div>';

  cont.innerHTML =
    '<div style="display:flex;gap:8px;margin-bottom:12px">' +
      '<input class="inp" id="tev-nome" type="text" placeholder="Nome do novo tipo de evento" style="flex:1" onkeydown="if(event.key===\'Enter\')adicionarTipoEvento()">' +
      '<button class="btn" style="background:var(--green)" onclick="adicionarTipoEvento()">+ Adicionar</button>' +
    '</div>' +
    linhas;
}

function adicionarTipoEvento() {
  var nome = (document.getElementById('tev-nome')?.value || '').trim();
  if (!nome) { alert('Informe o nome do tipo de evento.'); return; }
  if (!D.tiposEvento) D.tiposEvento = [];
  if (D.tiposEvento.some(function(t) { return (t.nome || '').toUpperCase() === nome.toUpperCase(); })) {
    alert('Esse tipo de evento já existe.');
    return;
  }
  var ordemMax = D.tiposEvento.reduce(function(m, t) { return Math.max(m, t.ordem || 0); }, 0);
  D.tiposEvento.push({ id: _slugTipoEvento(nome), nome: nome, ordem: ordemMax + 1 });
  sv('tiposEvento');
  document.getElementById('tev-nome').value = '';
  rTiposEventoLista();
}

function renomearTipoEvento(id, novoNomeRaw) {
  var novoNome = (novoNomeRaw || '').trim();
  if (!novoNome) { alert('O nome não pode ficar vazio.'); rTiposEventoLista(); return; }
  var t = buscarTipoEventoPorId(id);
  if (!t) return;
  if (D.tiposEvento.some(function(x) { return x.id !== id && (x.nome || '').toUpperCase() === novoNome.toUpperCase(); })) {
    alert('Já existe um tipo de evento com esse nome.');
    rTiposEventoLista();
    return;
  }
  t.nome = novoNome;
  sv('tiposEvento');
  rTiposEventoLista();
}

function excluirTipoEvento(id) {
  var t = buscarTipoEventoPorId(id);
  if (!t) return;
  var qtd = _tipoEventoEmUso(id);
  if (qtd) { alert('Esse tipo de evento está em uso por ' + qtd + ' orçamento(s) — não é possível excluir.'); return; }
  if (!confirm('Excluir o tipo de evento "' + t.nome + '"?')) return;
  D.tiposEvento = (D.tiposEvento || []).filter(function(x) { return x.id !== id; });
  sv('tiposEvento');
  rTiposEventoLista();
}

function moverTipoEvento(id, dir) {
  var lista = getTiposEvento();
  var idx = lista.findIndex(function(t) { return t.id === id; });
  var swapIdx = idx + dir;
  if (idx === -1 || swapIdx < 0 || swapIdx >= lista.length) return;
  var a = buscarTipoEventoPorId(lista[idx].id);
  var b = buscarTipoEventoPorId(lista[swapIdx].id);
  var tmp = a.ordem; a.ordem = b.ordem; b.ordem = tmp;
  sv('tiposEvento');
  rTiposEventoLista();
}
