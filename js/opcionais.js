// ─── OPCIONAIS DE EVENTO ─────────────────────────────────────────────────────
// Serviços compostos que o cliente pode incluir num evento (SHOTS, RECEPTIVO,
// WHISKERIA, GELO TRANSLÚCIDO, PAPEL DE ARROZ...). Cada opcional tem um nome,
// um preço (usado na aba Serviços do Orçamento) e uma lista de insumos que ele
// traz — os insumos são escolhidos do Cadastro de Insumos, nunca digitados.
//
// Na Folha de Separação (js/separacao.js, SEÇÃO 4) a Juliana marca quais
// opcionais o cliente incluiu, ajusta as linhas de insumo por evento e digita
// as quantidades à mão (não há cálculo automático).
//
// A categoria de cada insumo NÃO é gravada aqui — é resolvida sempre por
// categoriaAtualDoInsumo() (js/insumos.js), pra acompanhar o Cadastro de
// Insumos, mesma lógica de sincronizarCategoriasRegras.
//
// Documento Firestore: `opcionais` (wired em index.html carregarDados/svFirebase).

function initOpcionais() {
  if (!D.opcionais) D.opcionais = [];
  rOpcionaisLista();
}

function getOpcionais() {
  return D.opcionais || [];
}

function buscarOpcionalPorId(id) {
  return (D.opcionais || []).find(function(o) { return o.id === id; }) || null;
}

// <option>s de insumo agrupadas por categoria (Cadastro de Insumos), menos os
// que o opcional já tem. Mesmo padrão de _rkOpcoesItem() em js/regras.js.
function _opcOpcoesInsumo(jaTem) {
  var biblioteca = (typeof getBiblioteca === 'function') ? getBiblioteca() : {};
  var usados = {};
  (jaTem || []).forEach(function(n) { usados[(n || '').toUpperCase()] = true; });
  var html = '';
  Object.keys(biblioteca).sort().forEach(function(cat) {
    var disp = (biblioteca[cat] || []).filter(function(item) { return !usados[item.toUpperCase()]; });
    if (!disp.length) return;
    html += '<optgroup label="' + cat.replace(/"/g, '&quot;') + '">' +
      disp.map(function(item) { return '<option value="' + item.replace(/"/g, '&quot;') + '">' + item + '</option>'; }).join('') +
    '</optgroup>';
  });
  return html;
}

function rOpcionaisLista() {
  var cont = document.getElementById('regras-view-opcionais');
  if (!cont) return;
  if (!D.opcionais) D.opcionais = [];

  var servicos = (typeof getServicos === 'function') ? getServicos().slice().sort(function(a, b) {
    return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
  }) : [];

  var lista = getOpcionais();

  var html = '<div class="sec">' +
    '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">' +
      '<span class="sec-title">Opcionais de Evento</span>' +
      '<button class="btn btn-sm" style="background:var(--green)" onclick="opcionalAdd()">+ Novo opcional</button>' +
    '</div>' +
    '<div style="padding:12px 16px">' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:14px">' +
        'Cada opcional traz uma lista de insumos (escolhidos do Cadastro de Insumos). Na Folha de Separação você marca o que o cliente incluiu e digita as quantidades. O preço é usado na aba Serviços do Orçamento.' +
      '</div>';

  if (!lista.length) {
    html += '<div style="font-size:12px;color:var(--text3);padding:12px 0">Nenhum opcional cadastrado. Clique em "+ Novo opcional".</div>';
  } else {
    html += '<div style="display:grid;gap:12px">' + lista.map(function(o) {
      var itens = o.itens || [];
      var nomesItens = itens.map(function(it) { return it.nome; });
      return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px">' +

        '<div style="display:grid;grid-template-columns:minmax(160px,1fr) 120px minmax(150px,1fr) 40px;gap:10px;align-items:end">' +
          '<div><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Nome</div>' +
            '<input type="text" value="' + (o.nome || '').replace(/"/g, '&quot;') + '" onchange="opcionalSet(\'' + o.id + '\',\'nome\',this.value)" ' +
              'style="width:100%;font-size:12px;padding:5px 7px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)"></div>' +
          '<div><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Preço (R$)</div>' +
            '<input type="number" min="0" step="0.01" value="' + (o.precoPadrao || '') + '" onchange="opcionalSet(\'' + o.id + '\',\'precoPadrao\',this.value)" ' +
              'style="width:100%;font-size:12px;padding:5px 7px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:right;font-family:var(--mono)"></div>' +
          '<div><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Serviço vinculado (opcional)</div>' +
            '<select onchange="opcionalSet(\'' + o.id + '\',\'servicoId\',this.value)" ' +
              'style="width:100%;font-size:11px;padding:5px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
              '<option value="">— nenhum —</option>' +
              servicos.map(function(s) { return '<option value="' + s.id + '"' + (o.servicoId === s.id ? ' selected' : '') + '>' + (s.nome || '').replace(/</g, '&lt;') + '</option>'; }).join('') +
            '</select></div>' +
          '<div style="text-align:center"><button class="btn-sm btn-red" onclick="opcionalExcluir(\'' + o.id + '\')" style="padding:2px 7px" title="Excluir opcional">×</button></div>' +
        '</div>' +

        '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--border2)">' +
          '<div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Insumos que traz</div>' +
          (itens.length
            ? '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">' + itens.map(function(it, idx) {
                var cat = (typeof categoriaAtualDoInsumo === 'function') ? categoriaAtualDoInsumo(it.nome, '') : '';
                return '<span style="display:inline-flex;align-items:center;gap:5px;background:var(--bg);border:1px solid var(--border2);border-radius:12px;padding:3px 4px 3px 10px;font-size:11px;color:var(--text)">' +
                  it.nome + (cat ? ' <span style="font-size:9px;color:var(--text3)">' + cat + '</span>' : ' <span style="font-size:9px;color:var(--amber)" title="sem categoria no Cadastro de Insumos">sem categoria</span>') +
                  ' <span onclick="opcionalRemoveInsumo(\'' + o.id + '\',' + idx + ')" style="cursor:pointer;color:var(--red);padding:0 4px" title="Remover">×</span>' +
                '</span>';
              }).join('') + '</div>'
            : '<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Nenhum insumo ainda.</div>') +
          '<select onchange="if(this.value){opcionalAddInsumo(\'' + o.id + '\',this.value);this.value=\'\'}" ' +
            'style="font-size:11px;padding:4px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);max-width:280px">' +
            '<option value="">+ adicionar insumo…</option>' +
            _opcOpcoesInsumo(nomesItens) +
          '</select>' +
        '</div>' +

      '</div>';
    }).join('') + '</div>';
  }

  html += '</div></div>';
  cont.innerHTML = html;
}

function opcionalAdd() {
  if (!D.opcionais) D.opcionais = [];
  D.opcionais.push({
    id: 'OPC' + Date.now(),
    nome: 'NOVO OPCIONAL',
    precoPadrao: 0,
    servicoId: '',
    itens: [],
    criadoEm: new Date().toISOString(),
  });
  sv('opcionais');
  rOpcionaisLista();
}

function opcionalSet(id, campo, valor) {
  var o = buscarOpcionalPorId(id);
  if (!o) return;
  if (campo === 'precoPadrao') {
    o.precoPadrao = parseFloat(valor) || 0;
  } else if (campo === 'nome') {
    o.nome = (valor || '').trim().toUpperCase();
  } else {
    o[campo] = valor;
  }
  sv('opcionais');
  rOpcionaisLista();
}

function opcionalAddInsumo(id, nome) {
  var o = buscarOpcionalPorId(id);
  if (!o || !nome) return;
  if (!o.itens) o.itens = [];
  if (o.itens.some(function(it) { return (it.nome || '').toUpperCase() === nome.toUpperCase(); })) return;
  o.itens.push({ nome: nome });
  sv('opcionais');
  rOpcionaisLista();
}

function opcionalRemoveInsumo(id, idx) {
  var o = buscarOpcionalPorId(id);
  if (!o || !o.itens) return;
  o.itens.splice(idx, 1);
  sv('opcionais');
  rOpcionaisLista();
}

function opcionalExcluir(id) {
  var o = buscarOpcionalPorId(id);
  if (!o) return;
  if (!confirm('Excluir o opcional "' + (o.nome || '') + '"?')) return;
  D.opcionais = (D.opcionais || []).filter(function(x) { return x.id !== id; });
  sv('opcionais');
  rOpcionaisLista();
}

// Preço de referência de um opcional pro Orçamento: preço próprio ou, se
// vinculado a um Serviço do cadastro, o preço padrão do serviço.
function precoOpcional(o) {
  if (!o) return 0;
  if (o.precoPadrao) return o.precoPadrao;
  if (o.servicoId && typeof buscarServicoPorId === 'function') {
    var s = buscarServicoPorId(o.servicoId);
    if (s && s.precoPadrao) return s.precoPadrao;
  }
  return 0;
}
