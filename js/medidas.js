// ─── CADASTRO DE MEDIDAS (FICHA TÉCNICA) ────────────────────────────────────
// Substitui a lista fixa UNIDADES_INGREDIENTE (js/fichaTecnica.js) — ela
// cadastra aqui as nomenclaturas (ml, dash, gr...) escritas do jeito que
// devem sair na Ficha Técnica. A ficha guarda a medida pelo NOME (item.un),
// então renomear aqui atualiza todas as fichas que usam a medida antiga.
// '—' (sem medida) não é cadastro: é sempre a última opção do select.

function initMedidasCadastro() {
  migrarMedidasIngrediente();
  rMedidasLista();
}

// Semeia uma única vez a partir da lista fixa de antes — idempotente,
// mesmo padrão de migrarTiposEvento() (js/tiposEvento.js).
function migrarMedidasIngrediente() {
  if (D.medidasIngrediente && D.medidasIngrediente.length) return;
  var base = (typeof UNIDADES_INGREDIENTE !== 'undefined') ? UNIDADES_INGREDIENTE : ['ML', 'GR', 'UN', 'DASH', 'GTS', 'BSP'];
  D.medidasIngrediente = base.filter(function(u) { return u !== '—'; }).map(function(u, i) {
    return { id: 'MED' + Date.now() + i, nome: u, ordem: i + 1 };
  });
  sv('medidasIngrediente');
}

// Nomes em ordem — usado no select de medida da ficha (js/regras.js).
function getMedidasIngrediente() {
  var lista = (D.medidasIngrediente && D.medidasIngrediente.length)
    ? D.medidasIngrediente.slice().sort(function(a, b) { return (a.ordem || 0) - (b.ordem || 0); }).map(function(m) { return m.nome; })
    : ((typeof UNIDADES_INGREDIENTE !== 'undefined') ? UNIDADES_INGREDIENTE : []).filter(function(u) { return u !== '—'; });
  return lista;
}

function _buscarMedida(id) {
  return (D.medidasIngrediente || []).find(function(m) { return m.id === id; }) || null;
}

function _medidaEmUso(nome) {
  var n = 0;
  (D.fichas || []).forEach(function(f) {
    (f.itens || []).forEach(function(i) { if (i.un === nome) n++; });
  });
  return n;
}

function _medidaJaExiste(nome, ignorarId) {
  // Compara sem diferenciar maiúscula: "ml" e "ML" são a mesma medida.
  return (D.medidasIngrediente || []).some(function(m) {
    return m.id !== ignorarId && (m.nome || '').toUpperCase() === nome.toUpperCase();
  });
}

function rMedidasLista() {
  var cont = document.getElementById('med-lista-body');
  if (!cont) return;
  var lista = (D.medidasIngrediente || []).slice().sort(function(a, b) { return (a.ordem || 0) - (b.ordem || 0); });

  var linhas = lista.length ? lista.map(function(m, i) {
    var qtd = _medidaEmUso(m.nome);
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
      '<div style="display:flex;flex-direction:column;gap:2px">' +
        '<button class="btn-sm" style="padding:0 6px;background:var(--bg2)" ' + (i === 0 ? 'disabled' : '') + ' onclick="moverMedida(\'' + m.id + '\',-1)">▲</button>' +
        '<button class="btn-sm" style="padding:0 6px;background:var(--bg2)" ' + (i === lista.length - 1 ? 'disabled' : '') + ' onclick="moverMedida(\'' + m.id + '\',1)">▼</button>' +
      '</div>' +
      '<input class="inp" type="text" value="' + (m.nome || '').replace(/"/g, '&quot;') + '" style="flex:1;font-size:12px;padding:5px 8px" onchange="renomearMedida(\'' + m.id + '\',this.value)">' +
      '<span style="font-size:10px;color:var(--text3)">' + (qtd ? qtd + ' ingrediente(s) em fichas' : 'sem uso') + '</span>' +
      '<button class="btn-sm btn-red" onclick="excluirMedida(\'' + m.id + '\')">×</button>' +
    '</div>';
  }).join('') : '<div style="text-align:center;color:var(--text3);padding:24px;font-size:13px">Nenhuma medida cadastrada.</div>';

  cont.innerHTML =
    '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">Escreva cada medida exatamente como deve sair na Ficha Técnica (ex: ml, dash, gr). As setas ▲▼ definem a ordem no campo de medida da ficha. Renomear aqui atualiza todas as fichas que já usam a medida.</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px">' +
      '<input class="inp" id="med-nome" type="text" placeholder="Nova medida (ex: fatia, folha, colher)" style="flex:1" onkeydown="if(event.key===\'Enter\')adicionarMedida()">' +
      '<button class="btn" style="background:var(--green)" onclick="adicionarMedida()">+ Adicionar</button>' +
    '</div>' +
    linhas;
}

function adicionarMedida() {
  var nome = (document.getElementById('med-nome')?.value || '').trim();
  if (!nome) { alert('Informe o nome da medida.'); return; }
  if (nome === '—') { alert('"—" já é a opção "sem medida" da ficha.'); return; }
  migrarMedidasIngrediente();
  if (_medidaJaExiste(nome)) { alert('Essa medida já existe.'); return; }
  var ordemMax = D.medidasIngrediente.reduce(function(m, x) { return Math.max(m, x.ordem || 0); }, 0);
  D.medidasIngrediente.push({ id: 'MED' + Date.now() + Math.random().toString(36).slice(2, 6), nome: nome, ordem: ordemMax + 1 });
  sv('medidasIngrediente');
  document.getElementById('med-nome').value = '';
  rMedidasLista();
}

function renomearMedida(id, novoNomeRaw) {
  var novo = (novoNomeRaw || '').trim();
  var m = _buscarMedida(id);
  if (!m) return;
  if (!novo) { alert('O nome não pode ficar vazio.'); rMedidasLista(); return; }
  if (_medidaJaExiste(novo, id)) { alert('Já existe uma medida com esse nome.'); rMedidasLista(); return; }
  var antigo = m.nome;
  if (novo === antigo) return;
  m.nome = novo;
  // Leva a troca pras fichas que usam a medida antiga (ex: "ML" -> "ml").
  var fichasMudaram = false;
  (D.fichas || []).forEach(function(f) {
    (f.itens || []).forEach(function(i) { if (i.un === antigo) { i.un = novo; fichasMudaram = true; } });
  });
  sv('medidasIngrediente');
  if (fichasMudaram) sv('fichas');
  rMedidasLista();
}

function excluirMedida(id) {
  var m = _buscarMedida(id);
  if (!m) return;
  var qtd = _medidaEmUso(m.nome);
  if (qtd) { alert('A medida "' + m.nome + '" está em uso em ' + qtd + ' ingrediente(s) de fichas — troque nas fichas antes de excluir.'); return; }
  if (!confirm('Excluir a medida "' + m.nome + '"?')) return;
  D.medidasIngrediente = D.medidasIngrediente.filter(function(x) { return x.id !== id; });
  sv('medidasIngrediente');
  rMedidasLista();
}

function moverMedida(id, dir) {
  var lista = (D.medidasIngrediente || []).slice().sort(function(a, b) { return (a.ordem || 0) - (b.ordem || 0); });
  var idx = lista.findIndex(function(m) { return m.id === id; });
  var alvo = idx + dir;
  if (idx === -1 || alvo < 0 || alvo >= lista.length) return;
  var tmp = lista[idx].ordem; lista[idx].ordem = lista[alvo].ordem; lista[alvo].ordem = tmp;
  sv('medidasIngrediente');
  rMedidasLista();
}
