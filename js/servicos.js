// ─── CADASTRO DE SERVIÇOS ────────────────────────────────────────────────────
// Quarto e último domínio planejado da centralização de cadastro. Hoje não
// existe catálogo nenhum de serviços — cada orçamento (js/orcamento.js,
// orc.servicos[]) redigita nome e preço do zero. Este cadastro cria uma fonte
// única (nome, categoria, custo, preço padrão), semeada com o histórico real
// de serviços já usados em orçamentos passados. A tela de orçamento em si
// ainda não foi reconectada pra usar este cadastro — fica pra uma fase futura.

var CATEGORIAS_SERVICO_PADRAO = [
  'DECORAÇÃO', 'ESTRUTURA E MOBILIÁRIO', 'ENTRETENIMENTO',
  'SOM E ILUMINAÇÃO', 'FOTOGRAFIA E VÍDEO', 'LOGÍSTICA EXTRA', 'OUTROS',
];

var _servicoEditandoId = null;

// ── Init ─────────────────────────────────────────────────────────────────────

function initServicosCadastro() {
  if (!D.categoriasServico) D.categoriasServico = [];
  if (!D.servicos) D.servicos = [];
  migrarCategoriasServico();
  migrarServicosDeOrcamentos();
  setServicosView('lista');
}

function setServicosView(v) {
  ['lista', 'form'].forEach(function(x) {
    var el = document.getElementById('svc-view-' + x);
    if (el) el.style.display = x === v ? '' : 'none';
  });
  if (v === 'lista') rServicosLista();
}

// ── Categorias de Serviço (lista própria, separada da de Insumos) ──────────

function migrarCategoriasServico() {
  if (D.categoriasServico && D.categoriasServico.length) return;
  if (!D.categoriasServico) D.categoriasServico = [];
  CATEGORIAS_SERVICO_PADRAO.forEach(function(nome) {
    D.categoriasServico.push({ id: 'CTS' + Date.now() + Math.random().toString(36).slice(2, 6), nome: nome });
  });
  sv('categoriasServico');
}

function getCategoriasServico() {
  if (!D.categoriasServico || !D.categoriasServico.length) return CATEGORIAS_SERVICO_PADRAO.slice();
  return D.categoriasServico.map(function(c) { return c.nome; });
}

function _categoriaServicoEmUso(nome) {
  return (D.servicos || []).filter(function(s) { return s.categoria === nome; }).length;
}

function adicionarCategoriaServico() {
  var nome = (document.getElementById('svc-ctg-nome')?.value || '').trim().toUpperCase();
  if (!nome) { alert('Informe o nome da categoria.'); return; }
  if (!D.categoriasServico) D.categoriasServico = [];
  if (D.categoriasServico.some(function(c) { return (c.nome || '').toUpperCase() === nome; })) {
    alert('Essa categoria já existe.');
    return;
  }
  D.categoriasServico.push({ id: 'CTS' + Date.now() + Math.random().toString(36).slice(2, 6), nome: nome });
  sv('categoriasServico');
  document.getElementById('svc-ctg-nome').value = '';
  rServicosLista();
}

function renomearCategoriaServico(id, novoNomeRaw) {
  var novoNome = (novoNomeRaw || '').trim().toUpperCase();
  var cat = (D.categoriasServico || []).find(function(c) { return c.id === id; });
  if (!cat) return;
  if (!novoNome) { alert('O nome não pode ficar vazio.'); rServicosLista(); return; }
  if (D.categoriasServico.some(function(c) { return c.id !== id && (c.nome || '').toUpperCase() === novoNome; })) {
    alert('Já existe uma categoria de serviço com esse nome.');
    rServicosLista();
    return;
  }
  var nomeAntigo = cat.nome;
  cat.nome = novoNome;
  (D.servicos || []).forEach(function(s) { if (s.categoria === nomeAntigo) s.categoria = novoNome; });
  sv('categoriasServico');
  if (D.servicos) sv('servicos');
  rServicosLista();
}

function excluirCategoriaServico(id) {
  var cat = (D.categoriasServico || []).find(function(c) { return c.id === id; });
  if (!cat) return;
  var qtd = _categoriaServicoEmUso(cat.nome);
  if (qtd) { alert('Essa categoria está em uso por ' + qtd + ' serviço(s) — recategorize antes de excluir.'); return; }
  if (!confirm('Excluir a categoria "' + cat.nome + '"?')) return;
  D.categoriasServico = (D.categoriasServico || []).filter(function(c) { return c.id !== id; });
  sv('categoriasServico');
  rServicosLista();
}

// ── Importação de histórico a partir de D.orcamentos[].servicos[] ──────────
// Cada orçamento tem seu array próprio de serviços digitados na hora — pega
// o nome usado mais recentemente (por data do evento) como sugestão inicial
// de preço padrão. Idempotente: nunca sobrescreve um serviço já cadastrado.
function migrarServicosDeOrcamentos() {
  if (!D.orcamentos || !D.orcamentos.length) return 0;
  if (!D.servicos) D.servicos = [];
  var existentes = new Set(D.servicos.map(function(s) { return (s.nome || '').toUpperCase(); }));
  var importados = 0;

  var orcsOrdenados = D.orcamentos.slice().sort(function(a, b) {
    return (b.dataEvento || '').localeCompare(a.dataEvento || '');
  });

  orcsOrdenados.forEach(function(orc) {
    (orc.servicos || []).forEach(function(svc) {
      var nome = (svc.nome || '').trim();
      if (!nome || existentes.has(nome.toUpperCase())) return;
      D.servicos.push({
        id: 'SRV' + Date.now() + Math.random().toString(36).slice(2, 6),
        nome: nome,
        categoria: 'OUTROS',
        custo: 0,
        precoPadrao: svc.precoUnit || 0,
        origemHistorico: true,
      });
      existentes.add(nome.toUpperCase());
      importados++;
    });
  });

  if (importados > 0) sv('servicos');
  return importados;
}

// ── Helpers de leitura ──────────────────────────────────────────────────────

function getServicos() {
  return D.servicos || [];
}

function buscarServicoPorId(id) {
  return (D.servicos || []).find(function(s) { return s.id === id; }) || null;
}

// ── Render: lista ────────────────────────────────────────────────────────────

function rServicosLista() {
  var cont = document.getElementById('svc-lista-body');
  var contCtg = document.getElementById('svc-ctg-body');
  if (!cont) return;

  if (contCtg) {
    var cats = (D.categoriasServico || []).slice().sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || ''); });
    contCtg.innerHTML =
      '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">' +
        '<input class="inp" id="svc-ctg-nome" type="text" placeholder="Nova categoria de serviço" style="flex:1;min-width:180px" onkeydown="if(event.key===\'Enter\')adicionarCategoriaServico()">' +
        '<button class="btn-sm" style="background:var(--green)" onclick="adicionarCategoriaServico()">+ Adicionar</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        cats.map(function(c) {
          var qtd = _categoriaServicoEmUso(c.nome);
          return '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--bg3);border:1px solid var(--border2);border-radius:12px;padding:3px 4px 3px 10px;font-size:11px;color:var(--text)">' +
            c.nome + (qtd ? ' <span style="color:var(--text3)">(' + qtd + ')</span>' : '') +
            ' <span onclick="var n=prompt(\'Renomear categoria:\',\'' + c.nome + '\');if(n!=null)renomearCategoriaServico(\'' + c.id + '\',n)" style="cursor:pointer;padding:0 4px" title="Renomear">✏️</span>' +
            ' <span onclick="excluirCategoriaServico(\'' + c.id + '\')" style="cursor:pointer;color:var(--red);padding:0 6px 0 0" title="Excluir">×</span>' +
          '</span>';
        }).join('') +
      '</div>';
  }

  var filtroEl = document.getElementById('svc-cat-filtro');
  if (filtroEl) {
    var catAtual = filtroEl.value;
    filtroEl.innerHTML = '<option value="">Todas as categorias</option>' +
      getCategoriasServico().map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');
    filtroEl.value = catAtual;
  }

  var busca = (document.getElementById('svc-busca')?.value || '').toLowerCase();
  var catFiltro = filtroEl?.value || '';
  var lista = getServicos().slice().sort(function(a, b) {
    return (a.categoria || '').localeCompare(b.categoria || '') || (a.nome || '').localeCompare(b.nome || '');
  });
  if (busca) lista = lista.filter(function(s) { return (s.nome || '').toLowerCase().includes(busca); });
  if (catFiltro) lista = lista.filter(function(s) { return s.categoria === catFiltro; });

  if (!lista.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhum serviço cadastrado ainda.</div>';
    return;
  }

  var porCat = {};
  lista.forEach(function(s) { (porCat[s.categoria || 'OUTROS'] = porCat[s.categoria || 'OUTROS'] || []).push(s); });

  cont.innerHTML = Object.entries(porCat).map(function(entry) {
    var cat = entry[0], itens = entry[1];
    return '<div style="margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;padding:6px 0;border-bottom:2px solid var(--border2);margin-bottom:6px">' +
        cat + ' <span style="font-weight:400">(' + itens.length + ')</span>' +
      '</div>' +
      '<div style="display:grid;gap:6px">' +
      itens.map(function(s) {
        return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px">' +
          '<div style="flex:1"><span style="font-size:12px;font-weight:600;color:var(--text)">' + s.nome + '</span></div>' +
          '<div style="text-align:right;font-family:var(--mono);font-size:11px">' +
            '<div style="color:var(--text3)">Custo: ' + (s.custo ? fR(s.custo) : '—') + '</div>' +
            '<div style="color:var(--green)">Preço: ' + (s.precoPadrao ? fR(s.precoPadrao) : '—') + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px">' +
            '<button class="btn-sm" style="background:var(--blue)" onclick="editarServico(\'' + s.id + '\')">✏️</button>' +
            '<button class="btn-sm btn-red" onclick="excluirServico(\'' + s.id + '\')">×</button>' +
          '</div>' +
        '</div>';
      }).join('') +
      '</div></div>';
  }).join('');
}

// ── Render: formulário ───────────────────────────────────────────────────────

function rFormServico(id) {
  _servicoEditandoId = id || null;
  var s = id ? buscarServicoPorId(id) : null;
  var cont = document.getElementById('svc-view-form');
  if (!cont) return;

  cont.innerHTML = '<div class="sec">' +
    '<div class="sec-head"><span class="sec-title">' + (s ? '✏️ Editar Serviço' : '+ Novo Serviço') + '</span>' +
      '<button class="btn-sm" onclick="setServicosView(\'lista\')" style="margin-left:auto">← Voltar</button>' +
    '</div>' +
    '<div style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">' +
      '<div style="grid-column:1/-1"><label class="lbl">Nome *</label>' +
        '<input class="inp" id="svc-nome" type="text" placeholder="Ex: Decoração de mesa temática" value="' + (s ? s.nome : '') + '"></div>' +
      '<div><label class="lbl">Categoria *</label>' +
        '<select class="inp" id="svc-categoria">' +
          getCategoriasServico().map(function(c) {
            return '<option value="' + c + '"' + (s && s.categoria === c ? ' selected' : '') + '>' + c + '</option>';
          }).join('') +
        '</select></div>' +
      '<div><label class="lbl">Custo (opcional)</label>' +
        '<input class="inp" id="svc-custo" type="number" min="0" step="0.01" placeholder="Se você subcontrata" value="' + (s && s.custo ? s.custo : '') + '"></div>' +
      '<div><label class="lbl">Preço Padrão</label>' +
        '<input class="inp" id="svc-preco-padrao" type="number" min="0" step="0.01" placeholder="0,00" value="' + (s && s.precoPadrao ? s.precoPadrao : '') + '"></div>' +
    '</div>' +
    '<div style="padding:0 16px 16px;display:flex;gap:8px">' +
      '<button class="btn" onclick="salvarServico()" style="background:var(--green)">💾 Salvar</button>' +
      '<button class="btn" onclick="setServicosView(\'lista\')" style="background:var(--bg3);color:var(--text)">Cancelar</button>' +
    '</div>' +
  '</div>';
}

function salvarServico() {
  var nome = (document.getElementById('svc-nome')?.value || '').trim();
  if (!nome) { alert('Preencha o nome do serviço.'); return; }

  if (!D.servicos) D.servicos = [];
  var existente = _servicoEditandoId ? buscarServicoPorId(_servicoEditandoId) : null;

  var servico = {
    id: existente ? existente.id : ('SRV' + Date.now()),
    nome: nome,
    categoria: document.getElementById('svc-categoria')?.value || 'OUTROS',
    custo: parseFloat(document.getElementById('svc-custo')?.value) || 0,
    precoPadrao: parseFloat(document.getElementById('svc-preco-padrao')?.value) || 0,
  };

  if (existente) {
    var idx = D.servicos.findIndex(function(x) { return x.id === existente.id; });
    if (idx >= 0) D.servicos[idx] = servico; else D.servicos.push(servico);
  } else {
    D.servicos.push(servico);
  }

  sv('servicos');
  alert('Serviço salvo!');
  setServicosView('lista');
}

function editarServico(id) {
  setServicosView('form');
  setTimeout(function() { rFormServico(id); }, 50);
}

function excluirServico(id) {
  if (!confirm('Excluir este serviço do cadastro?')) return;
  D.servicos = (D.servicos || []).filter(function(s) { return s.id !== id; });
  sv('servicos');
  rServicosLista();
}
