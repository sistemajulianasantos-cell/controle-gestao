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
  migrarGrupoTiposEvento();
  rTiposEventoLista();
}

// Semeia D.tiposEvento uma única vez a partir da lista padrão — idempotente,
// mesmo padrão de migrarCategorias() (js/categorias.js).
function migrarTiposEvento() {
  if (D.tiposEvento && D.tiposEvento.length) return;
  if (!D.tiposEvento) D.tiposEvento = [];
  TIPOS_EVENTO_PADRAO.forEach(function(t, i) {
    D.tiposEvento.push({ id: t.id, nome: t.nome, grupo: t.nome, ordem: i + 1 });
  });
  sv('tiposEvento');
}

// Tipo de evento ganhou "Grupo" (2026-09-13) — um tipo pode ser um subgrupo
// dentro de um grupo maior (ex: grupo "Aniversário" com subgrupos "0 a 10
// anos", "11 a 14 anos", "15 a 20 anos"...), pra poder ter regra de cálculo e
// cardápio sugerido diferentes por faixa em vez de um "Aniversário" único.
// Tipo cadastrado antes disso não tinha grupo — vira grupo de 1 item (o
// próprio nome), nunca fica "sem grupo" pendurado.
function migrarGrupoTiposEvento() {
  var mudou = false;
  (D.tiposEvento || []).forEach(function(t) {
    if (!t.grupo) { t.grupo = t.nome; mudou = true; }
  });
  if (mudou) sv('tiposEvento');
}

// Grupos distintos, na ordem em que aparecem na lista (mesma ordem de
// getTiposEvento) — usado no datalist do cadastro e pra agrupar <select>s.
function getGruposTiposEvento() {
  var vistos = [];
  getTiposEvento().forEach(function(t) {
    var g = t.grupo || t.nome;
    if (vistos.indexOf(g) === -1) vistos.push(g);
  });
  return vistos;
}

// Monta <optgroup>/<option> agrupados por Grupo, na ordem de getTiposEvento().
// Usado em todo <select> de Tipo de Evento pra já vir organizado por grupo.
function tiposEventoOptionsHtml(valorAtual) {
  var porGrupo = {}, ordemGrupos = [];
  getTiposEvento().forEach(function(t) {
    var g = t.grupo || t.nome;
    if (!porGrupo[g]) { porGrupo[g] = []; ordemGrupos.push(g); }
    porGrupo[g].push(t);
  });
  return ordemGrupos.map(function(g) {
    var itens = porGrupo[g];
    var opts = itens.map(function(t) {
      return '<option value="' + t.id + '"' + (valorAtual === t.id ? ' selected' : '') + '>' + t.nome + '</option>';
    }).join('');
    return itens.length > 1 ? '<optgroup label="' + g.replace(/"/g, '&quot;') + '">' + opts + '</optgroup>' : opts;
  }).join('');
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

  var porGrupo = {}, ordemGrupos = [];
  lista.forEach(function(t) {
    var g = t.grupo || t.nome;
    if (!porGrupo[g]) { porGrupo[g] = []; ordemGrupos.push(g); }
    porGrupo[g].push(t);
  });

  var blocos = ordemGrupos.length ? ordemGrupos.map(function(g) {
    var itens = porGrupo[g];
    var linhas = itens.map(function(t) {
      var i = lista.indexOf(t);
      var qtd = _tipoEventoEmUso(t.id);
      return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<div style="display:flex;flex-direction:column;gap:2px">' +
          '<button class="btn-sm" style="padding:0 6px;background:var(--bg2)" ' + (i === 0 ? 'disabled' : '') + ' onclick="moverTipoEvento(\'' + t.id + '\',-1)">▲</button>' +
          '<button class="btn-sm" style="padding:0 6px;background:var(--bg2)" ' + (i === lista.length - 1 ? 'disabled' : '') + ' onclick="moverTipoEvento(\'' + t.id + '\',1)">▼</button>' +
        '</div>' +
        (itens.length > 1
          ? '<input class="inp" type="text" value="' + t.nome + '" placeholder="Subgrupo" style="flex:1;font-size:12px;padding:5px 8px" onchange="renomearTipoEvento(\'' + t.id + '\',this.value)">'
          : '<span style="flex:1;font-size:10px;color:var(--text3)">único subgrupo deste grupo</span>') +
        (qtd ? '<span style="font-size:10px;color:var(--text3)">' + qtd + ' orçamento(s)</span>' : '<span style="font-size:10px;color:var(--text3)">sem uso</span>') +
        '<button class="btn-sm btn-red" onclick="excluirTipoEvento(\'' + t.id + '\')">×</button>' +
      '</div>';
    }).join('');

    return '<div style="margin-bottom:16px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
        '<input class="inp" type="text" value="' + g + '" style="font-size:12px;font-weight:700;padding:5px 8px;max-width:260px;text-transform:uppercase;letter-spacing:.4px" onchange="renomearGrupoTipoEvento(\'' + g.replace(/'/g, "\\'") + '\',this.value)">' +
        '<button class="btn-sm" style="background:var(--bg3)" onclick="adicionarSubgrupoTipoEvento(\'' + g.replace(/'/g, "\\'") + '\')">+ subgrupo neste grupo</button>' +
      '</div>' +
      '<div style="padding-left:4px">' + linhas + '</div>' +
    '</div>';
  }).join('') : '<div style="text-align:center;color:var(--text3);padding:24px;font-size:13px">Nenhum tipo de evento cadastrado.</div>';

  cont.innerHTML =
    '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">Grupo = a categoria maior (ex: "Aniversário"). Subgrupo = a variação dentro dela (ex: "0 a 10 anos", "15 a 20 anos") — cada subgrupo é o que você escolhe como Tipo de Evento no Orçamento. Um grupo com um único subgrupo (ex: Casamento) não precisa ser dividido.</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">' +
      '<input class="inp" id="tev-grupo" list="tev-grupos-datalist" type="text" placeholder="Grupo (ex: Aniversário)" style="flex:1;min-width:160px">' +
      '<datalist id="tev-grupos-datalist">' + getGruposTiposEvento().map(function(g){ return '<option value="' + g.replace(/"/g,'&quot;') + '">'; }).join('') + '</datalist>' +
      '<input class="inp" id="tev-nome" type="text" placeholder="Subgrupo (ex: 15 a 20 anos) — deixe em branco se o grupo não se divide" style="flex:2;min-width:220px" onkeydown="if(event.key===\'Enter\')adicionarTipoEvento()">' +
      '<button class="btn" style="background:var(--green)" onclick="adicionarTipoEvento()">+ Adicionar</button>' +
    '</div>' +
    blocos;
}

function adicionarTipoEvento() {
  var grupo = (document.getElementById('tev-grupo')?.value || '').trim();
  var nome  = (document.getElementById('tev-nome')?.value  || '').trim();
  if (!nome && !grupo) { alert('Informe ao menos o nome do grupo ou do subgrupo.'); return; }
  if (!nome) nome = grupo;      // grupo sem divisão: o subgrupo tem o nome do próprio grupo
  if (!grupo) grupo = nome;
  if (!D.tiposEvento) D.tiposEvento = [];
  if (D.tiposEvento.some(function(t) { return (t.nome || '').toUpperCase() === nome.toUpperCase(); })) {
    alert('Esse tipo de evento já existe.');
    return;
  }
  var ordemMax = D.tiposEvento.reduce(function(m, t) { return Math.max(m, t.ordem || 0); }, 0);
  D.tiposEvento.push({ id: _slugTipoEvento(nome), nome: nome, grupo: grupo, ordem: ordemMax + 1 });
  sv('tiposEvento');
  document.getElementById('tev-nome').value = '';
  rTiposEventoLista();
}

// Atalho pra "+ subgrupo neste grupo": preenche o form de cima já com o
// grupo escolhido, só falta digitar o nome do subgrupo.
function adicionarSubgrupoTipoEvento(grupo) {
  var elGrupo = document.getElementById('tev-grupo');
  if (elGrupo) elGrupo.value = grupo;
  var elNome = document.getElementById('tev-nome');
  if (elNome) elNome.focus();
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

// Renomeia o grupo em TODOS os subgrupos que o compartilham de uma vez —
// evita ter que editar linha por linha quando é só o rótulo do grupo que
// mudou (ex: "Aniversario" -> "Aniversário").
function renomearGrupoTipoEvento(grupoAntigo, novoGrupoRaw) {
  var novoGrupo = (novoGrupoRaw || '').trim();
  if (!novoGrupo) { alert('O nome do grupo não pode ficar vazio.'); rTiposEventoLista(); return; }
  var membros = (D.tiposEvento || []).filter(function(t) { return (t.grupo || t.nome) === grupoAntigo; });
  if (!membros.length) return;
  membros.forEach(function(t) { t.grupo = novoGrupo; });
  // Grupo de subgrupo único: não tem input de subgrupo próprio na lista (a
  // linha só mostra "único subgrupo deste grupo"), então o nome do item
  // segue o nome do grupo pra não ficar com um "nome antigo" escondido.
  if (membros.length === 1) membros[0].nome = novoGrupo;
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
