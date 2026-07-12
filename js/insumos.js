// ─── CADASTRO DE INSUMOS ────────────────────────────────────────────────────
// Fonte única de custo/preço de insumo — nasce a partir de D.produtos + D.precos
// (que continuam existindo, sem alteração) e passa a ser a referência usada
// pelas próximas telas a serem migradas (Fichas de Coquetel, Orçamento).

var CATEGORIAS_INSUMO = [
  'BEBIDAS ALCOÓLICAS','BEBIDAS SEM ÁLCOOL','COPOS E TAÇAS','HORTIFRUTI',
  'ESPECIARIAS','MIX ARTESANAL','PRODUÇÃO','XAROPES','MATERIAL','GELO',
  'DESCARTÁVEIS','KIT BARTENDER','OUTROS'
];

// Margem mínima usada só para sugerir o preço-teto (alerta, não bloqueia).
var MARGEM_MINIMA_INSUMO = 0.30;

var _insumoEditandoId = null;

function initCadastro() {
  if (!D.insumos) D.insumos = [];
  migrarInsumosDeProdutos();
  setCadastroView('lista');
}

function setCadastroView(v) {
  ['lista','form'].forEach(function(x) {
    var el = document.getElementById('cad-view-' + x);
    if (el) el.style.display = x === v ? '' : 'none';
  });
  if (v === 'lista') rCadastroInsumos();
}

// ── Migração a partir de D.produtos + D.precos (não apaga nada) ────────────
// Roda toda vez que a tela abre — idempotente (pula quem já foi migrado) e
// pega automaticamente produtos novos cadastrados depois.
function migrarInsumosDeProdutos() {
  if (!D.produtos || !D.produtos.length) return;
  if (!D.insumos) D.insumos = [];
  var jaMigrados = new Set(D.insumos.map(function(i){ return i.origemProdutoId; }).filter(Boolean));
  var criados = 0;
  D.produtos.forEach(function(p) {
    if (jaMigrados.has(p.id)) return;
    var pr = (D.precos && D.precos[p.nome]) || {};
    D.insumos.push({
      id: 'INS' + Date.now() + Math.random().toString(36).slice(2, 6),
      origemProdutoId: p.id,
      nome: p.nome,
      aliases: (p.aliases || []).slice(),
      categoria: p.categoria || 'OUTROS',
      unidadeCompra: p.unidade || 'UN',
      tamanhoEmbalagem: p.tamanhoEmbalagem || 1,
      custoReposicao: pr.custo || 0,
      precoManual: null,
      ultimaCompra: pr.ultimaCompra || '',
      ultimoFornecedor: pr.ultimoFornecedor || '',
    });
    criados++;
  });
  if (criados > 0) sv('insumos');
}

// ── Helpers de leitura ──────────────────────────────────────────────────────

function getInsumos() {
  return D.insumos || [];
}

function buscarInsumoPorId(id) {
  return (D.insumos || []).find(function(i) { return i.id === id; }) || null;
}

function buscarInsumoPorNome(nome) {
  if (!nome) return null;
  var n = nome.trim().toUpperCase();
  return (D.insumos || []).find(function(i) {
    if ((i.nome || '').toUpperCase() === n) return true;
    return (i.aliases || []).some(function(a) { return (a || '').toUpperCase() === n; });
  }) || null;
}

// Média ponderada das últimas N compras registradas (D.entradas) — aproximação
// simples de "custo médio do estoque atual", sem precisar rastrear lote/FIFO.
function calcCustoMedioEstoque(nome, n) {
  n = n || 5;
  var entradas = (D.entradas || [])
    .filter(function(e) { return e.prod === nome && e.custo && Number(e.custo) > 0; })
    .sort(function(a, b) { return (b.data || '').localeCompare(a.data || ''); })
    .slice(0, n);
  if (!entradas.length) return 0;
  var somaQtdCusto = entradas.reduce(function(s, e) { return s + Number(e.qtd || 0) * Number(e.custo || 0); }, 0);
  var somaQtd = entradas.reduce(function(s, e) { return s + Number(e.qtd || 0); }, 0);
  return somaQtd > 0 ? somaQtdCusto / somaQtd : 0;
}

// Alerta de referência — não bloqueia nada.
function calcPrecoTetoSugerido(insumo) {
  var custo = insumo.custoReposicao || 0;
  return Math.round(custo * (1 + MARGEM_MINIMA_INSUMO) * 100) / 100;
}

// Valor que deve preencher automaticamente um item novo de orçamento:
// preço manual se existir, senão o custo de reposição.
function precoEfetivoInsumo(insumo) {
  if (insumo.precoManual != null && insumo.precoManual !== '') return Number(insumo.precoManual);
  return Number(insumo.custoReposicao || 0);
}

// Fase 2 (ainda não implementada): fichas de coquetel passarão a referenciar
// insumos por ID — até lá, não há como listar "onde é usado".
function _fichasQueUsamInsumo(insumoId) {
  return [];
}

// ── Render: lista ───────────────────────────────────────────────────────────

function rCadastroInsumos() {
  var cont = document.getElementById('cad-lista-body');
  if (!cont) return;

  var lista = getInsumos().slice().sort(function(a, b) {
    return (a.categoria || '').localeCompare(b.categoria || '') || (a.nome || '').localeCompare(b.nome || '');
  });

  var busca = (document.getElementById('cad-busca')?.value || '').toLowerCase();
  var catFiltro = document.getElementById('cad-cat-filtro')?.value || '';
  if (busca) lista = lista.filter(function(i) {
    return (i.nome || '').toLowerCase().includes(busca) ||
      (i.aliases || []).some(function(a) { return a.toLowerCase().includes(busca); });
  });
  if (catFiltro) lista = lista.filter(function(i) { return i.categoria === catFiltro; });

  if (!lista.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhum insumo cadastrado ainda.<br>Eles aparecem aqui automaticamente a partir dos Produtos já cadastrados.</div>';
    return;
  }

  var porCat = {};
  lista.forEach(function(i) {
    (porCat[i.categoria || 'OUTROS'] = porCat[i.categoria || 'OUTROS'] || []).push(i);
  });

  cont.innerHTML = Object.entries(porCat).map(function(entry) {
    var cat = entry[0], itens = entry[1];
    return '<div style="margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;padding:6px 0;border-bottom:2px solid var(--border2);margin-bottom:6px">' +
        cat + ' <span style="font-weight:400">(' + itens.length + ')</span>' +
      '</div>' +
      '<div style="display:grid;gap:6px">' +
      itens.map(function(i) {
        var teto = calcPrecoTetoSugerido(i);
        var efetivo = precoEfetivoInsumo(i);
        var abaixoTeto = efetivo > 0 && teto > 0 && efetivo < teto;
        return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px">' +
          '<div style="flex:1">' +
            '<span style="font-size:12px;font-weight:600;color:var(--text)">' + i.nome + '</span>' +
            (i.aliases && i.aliases.length ? '<div style="font-size:10px;color:var(--text3);margin-top:2px">Apelidos: ' + i.aliases.join(', ') + '</div>' : '') +
          '</div>' +
          '<div style="text-align:right;font-family:var(--mono);font-size:11px;white-space:nowrap">' +
            '<div style="color:var(--text3)">Reposição: ' + (i.custoReposicao ? fR(i.custoReposicao) : '—') + '</div>' +
            (i.precoManual != null && i.precoManual !== '' ? '<div style="color:var(--blue)">Manual: ' + fR(i.precoManual) + '</div>' : '') +
          '</div>' +
          (abaixoTeto ? '<span title="Abaixo do preço-teto sugerido (' + fR(teto) + ')" style="font-size:14px">⚠️</span>' : '') +
          '<div style="display:flex;gap:6px">' +
            '<button class="btn-sm" style="background:var(--blue)" onclick="editarInsumo(\'' + i.id + '\')">✏️</button>' +
            '<button class="btn-sm btn-red" onclick="excluirInsumo(\'' + i.id + '\')">×</button>' +
          '</div>' +
        '</div>';
      }).join('') +
      '</div></div>';
  }).join('');
}

// ── Render: formulário ───────────────────────────────────────────────────────

function rFormInsumo(id) {
  _insumoEditandoId = id || null;
  var i = id ? buscarInsumoPorId(id) : null;
  var cont = document.getElementById('cad-view-form');
  if (!cont) return;

  var aliasesStr = i && i.aliases ? i.aliases.join(', ') : '';
  var custoRepos = i ? (i.custoReposicao || 0) : 0;
  var custoMedio = i ? calcCustoMedioEstoque(i.nome) : 0;
  var teto = i ? calcPrecoTetoSugerido(i) : 0;
  var usadoEm = i ? _fichasQueUsamInsumo(i.id) : [];

  cont.innerHTML = '<div class="sec">' +
    '<div class="sec-head"><span class="sec-title">' + (i ? '✏️ Editar Insumo' : '+ Novo Insumo') + '</span>' +
      '<button class="btn-sm" onclick="setCadastroView(\'lista\')" style="margin-left:auto">← Voltar</button>' +
    '</div>' +
    '<div style="padding:16px">' +

      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Identificação</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:20px">' +
        '<div style="grid-column:1/-1"><label class="lbl">Nome *</label>' +
          '<input class="inp" id="cad-nome" type="text" placeholder="Ex: VODKA ABSOLUT 1000ML" value="' + (i ? i.nome : '') + '" style="text-transform:uppercase"></div>' +
        '<div style="grid-column:1/-1"><label class="lbl">Apelidos / outros nomes</label>' +
          '<input class="inp" id="cad-aliases" type="text" placeholder="Ex: Gim, Gin Tanqueray" value="' + aliasesStr + '">' +
          '<div style="font-size:10px;color:var(--text3);margin-top:2px">Separados por vírgula — resolve os diferentes nomes usados na ficha, na Ref. Consumo e na NF.</div></div>' +
        '<div><label class="lbl">Categoria *</label>' +
          '<select class="inp" id="cad-categoria">' +
            CATEGORIAS_INSUMO.map(function(c) {
              return '<option value="' + c + '"' + (i && i.categoria === c ? ' selected' : '') + '>' + c + '</option>';
            }).join('') +
          '</select></div>' +
        '<div><label class="lbl">Unidade de compra</label>' +
          '<select class="inp" id="cad-unidade">' +
            (typeof UNIDADES_PRODUTO !== 'undefined' ? UNIDADES_PRODUTO : ['UN']).map(function(u) {
              return '<option value="' + u + '"' + (i && i.unidadeCompra === u ? ' selected' : '') + '>' + u + '</option>';
            }).join('') +
          '</select></div>' +
        '<div><label class="lbl">Qtd por embalagem (caixa/fardo)</label>' +
          '<input class="inp" id="cad-embalagem" type="number" min="1" value="' + (i && i.tamanhoEmbalagem ? i.tamanhoEmbalagem : 1) + '"></div>' +
      '</div>' +

      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Custo e Preço</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:8px">' +
        '<div><label class="lbl">Custo de Reposição (última compra)</label>' +
          '<div class="inp" style="background:var(--bg3);color:var(--text3)">' + (custoRepos ? fR(custoRepos) : '— sem compras ainda') + '</div></div>' +
        '<div><label class="lbl">Custo Médio do Estoque</label>' +
          '<div class="inp" style="background:var(--bg3);color:var(--text3)">' + (custoMedio ? fR(custoMedio) : '— sem compras ainda') + '</div></div>' +
        '<div><label class="lbl">Preço Manual (opcional)</label>' +
          '<input class="inp" id="cad-preco-manual" type="number" min="0" step="0.01" placeholder="vazio = usa o de reposição" value="' + (i && i.precoManual != null ? i.precoManual : '') + '"></div>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:20px">Preço-teto sugerido (mínimo recomendado): <b>' + (teto ? fR(teto) : '—') + '</b> — é só um alerta, não bloqueia nada.</div>' +

      (i ? (
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Onde é usado</div>' +
        '<div style="font-size:12px;color:var(--text3);margin-bottom:8px">' +
          (usadoEm.length ? usadoEm.map(function(f) { return '• ' + f; }).join('<br>') : 'Ainda não disponível — as fichas de coquetel ainda não referenciam insumos por ID.') +
        '</div>'
      ) : '') +

    '</div>' +
    '<div style="padding:0 16px 16px;display:flex;gap:8px">' +
      '<button class="btn" onclick="salvarInsumo()" style="background:var(--green)">💾 Salvar</button>' +
      '<button class="btn" onclick="setCadastroView(\'lista\')" style="background:var(--bg3);color:var(--text)">Cancelar</button>' +
    '</div>' +
  '</div>';
}

function salvarInsumo() {
  var nome = (document.getElementById('cad-nome')?.value || '').trim().toUpperCase();
  if (!nome) { alert('Preencha o nome do insumo.'); return; }

  var aliasesRaw = (document.getElementById('cad-aliases')?.value || '').trim();
  var aliases = aliasesRaw ? aliasesRaw.split(',').map(function(a) { return a.trim().toUpperCase(); }).filter(Boolean) : [];
  var precoManualVal = document.getElementById('cad-preco-manual')?.value;

  if (!D.insumos) D.insumos = [];
  var existente = _insumoEditandoId ? buscarInsumoPorId(_insumoEditandoId) : null;

  var insumo = {
    id: existente ? existente.id : ('INS' + Date.now()),
    origemProdutoId: existente ? existente.origemProdutoId : null,
    nome: nome,
    aliases: aliases,
    categoria: document.getElementById('cad-categoria')?.value || 'OUTROS',
    unidadeCompra: document.getElementById('cad-unidade')?.value || 'UN',
    tamanhoEmbalagem: parseInt(document.getElementById('cad-embalagem')?.value) || 1,
    custoReposicao: existente ? existente.custoReposicao : 0,
    precoManual: (precoManualVal != null && precoManualVal !== '') ? Number(precoManualVal) : null,
    ultimaCompra: existente ? existente.ultimaCompra : '',
    ultimoFornecedor: existente ? existente.ultimoFornecedor : '',
  };

  if (existente) {
    var idx = D.insumos.findIndex(function(x) { return x.id === existente.id; });
    if (idx >= 0) D.insumos[idx] = insumo; else D.insumos.push(insumo);
  } else {
    D.insumos.push(insumo);
  }

  sv('insumos');
  alert('Insumo salvo!');
  setCadastroView('lista');
}

function editarInsumo(id) {
  setCadastroView('form');
  setTimeout(function() { rFormInsumo(id); }, 50);
}

function excluirInsumo(id) {
  if (!confirm('Excluir este insumo do cadastro? (O produto original em "Produtos" não é apagado.)')) return;
  D.insumos = (D.insumos || []).filter(function(i) { return i.id !== id; });
  sv('insumos');
  rCadastroInsumos();
}
