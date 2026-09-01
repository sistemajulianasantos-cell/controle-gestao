// ─── CADASTRO DE INSUMOS ────────────────────────────────────────────────────
// Fonte única de custo/preço de insumo — nasce a partir de D.produtos + D.precos
// (que continuam existindo, sem alteração) e passa a ser a referência usada
// pelas próximas telas a serem migradas (Fichas de Coquetel, Orçamento).

// Categoria agora vem do Cadastro de Categorias (js/categorias.js,
// getCategorias()) — deixou de ser uma lista fixa aqui.

// Margem mínima usada só para sugerir o preço-teto (alerta, não bloqueia).
var MARGEM_MINIMA_INSUMO = 0.30;

var CLASSIFICACOES_PRODUCAO = [
  ['materia_prima', 'Matéria-Prima'],
  ['semiacabado',   'Semiacabado'],
  ['acabado',       'Produto Acabado'],
];

var _insumoEditandoId = null;

// Código sequencial curto (tipo "000454" do Eide) — só pra identificar/anotar
// rápido, não substitui o id interno.
function _proximoCodigoInsumo() {
  var max = 0;
  (D.insumos || []).forEach(function(i) {
    var n = parseInt(i.codigo, 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return String(max + 1).padStart(6, '0');
}

function initCadastro() {
  if (!D.insumos) D.insumos = [];
  if (!D.categorias) D.categorias = [];
  if (typeof migrarCategorias === 'function') migrarCategorias();
  migrarInsumosDeProdutos();
  if (typeof _atualizarFiltrosDeCategoria === 'function') _atualizarFiltrosDeCategoria();
  if (typeof _tentarAutoConectarEstoqueSeparacao === 'function') _tentarAutoConectarEstoqueSeparacao();
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
  if (!D.insumos) D.insumos = [];
  var mudou = _preencherCamposNovosDosInsumos();

  if (!D.produtos || !D.produtos.length) { if (mudou) sv('insumos'); return; }
  var jaMigrados = new Set(D.insumos.map(function(i){ return i.origemProdutoId; }).filter(Boolean));
  var excluidos = new Set(D.insumosProdutosExcluidos || []);
  var criados = 0;
  D.produtos.forEach(function(p) {
    if (jaMigrados.has(p.id) || excluidos.has(p.id)) return;
    var pr = (D.precos && D.precos[p.nome]) || {};
    D.insumos.push({
      id: 'INS' + Date.now() + Math.random().toString(36).slice(2, 6),
      codigo: _proximoCodigoInsumo(),
      origemProdutoId: p.id,
      nome: p.nome,
      aliases: (p.aliases || []).slice(),
      categoria: p.categoria || 'OUTROS',
      unidadeCompra: p.unidade || 'UN',
      tamanhoEmbalagem: p.tamanhoEmbalagem || 1,
      estoqueMinimo: p.minimo || 0,
      classificacaoProducao: 'materia_prima',
      custoReposicao: pr.custo || 0,
      precoManual: null,
      ultimaCompra: pr.ultimaCompra || '',
      ultimoFornecedor: pr.ultimoFornecedor || '',
    });
    criados++;
  });
  if (criados > 0 || mudou) sv('insumos');
}

// Completa campos novos (codigo, classificacaoProducao, estoqueMinimo) em
// insumos que já existiam de uma versão anterior do cadastro, sem os ter.
function _preencherCamposNovosDosInsumos() {
  var mudou = false;
  (D.insumos || []).forEach(function(i) {
    if (!i.codigo) { i.codigo = _proximoCodigoInsumo(); mudou = true; }
    if (!i.classificacaoProducao) { i.classificacaoProducao = 'materia_prima'; mudou = true; }
    if (i.estoqueMinimo == null) { i.estoqueMinimo = 0; mudou = true; }
  });
  return mudou;
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

// Ficha de coquetel e Folha de Separação guardam uma cópia da categoria do
// insumo no momento em que o item foi adicionado à ficha — mudar a categoria
// do insumo depois, aqui no Cadastro de Insumos, não reescreve sozinha as
// fichas que já usam esse insumo. Por isso, toda tela que agrupa/filtra item
// de ficha por categoria deve resolver a categoria atual por nome (aqui) em
// vez de confiar na guardada na ficha (pedido 08-26, ex: mudou a categoria
// do Triple Sec e a ficha/folha continuavam mostrando a antiga).
function categoriaAtualDoInsumo(nome, catFallback) {
  var insumo = buscarInsumoPorNome(nome);
  return (insumo && insumo.categoria) || catFallback;
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

// Onde é usado — até a Fase 2 (fichas referenciando insumo por ID), faz o
// mesmo tipo de casamento por nome/apelido que o resto do sistema já usa hoje
// (ex: _rcMapFichaItemToRC em orcCalc.js). Não é definitivo, mas evita ficar
// em branco até a migração de verdade acontecer.
function _fichasQueUsamInsumo(insumo) {
  if (!D.fichas || !D.fichas.length) return [];
  var candidatos = [(insumo.nome || '').toUpperCase()]
    .concat((insumo.aliases || []).map(function(a) { return (a || '').toUpperCase(); }))
    .filter(function(c) { return c && c.length >= 3; }); // evita falso-positivo com apelido muito curto
  var resultado = [];
  D.fichas.forEach(function(f) {
    var achou = (f.itens || []).some(function(item) {
      var n = (item.nome || '').toUpperCase();
      if (!n) return false;
      return candidatos.some(function(c) { return n === c || n.includes(c) || c.includes(n); });
    });
    if (achou) resultado.push(f.nome);
  });
  return resultado;
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

  var pendentes = getInsumos().filter(function(i) { return i.origemAuto && !i.categoria; });
  var bannerPend = pendentes.length
    ? '<div style="background:rgba(247,195,90,.10);border:1px solid rgba(247,195,90,.4);border-radius:var(--radius);padding:10px 14px;margin-bottom:14px">' +
        '<div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + pendentes.length + ' item(ns) do Kit Base sem categoria</div>' +
        '<div style="font-size:11px;color:var(--text3)">Criados automaticamente a partir da Folha de Separação. Edite cada um e escolha a categoria: <strong>' +
          pendentes.map(function(i){ return i.nome; }).sort().join(', ') + '</strong></div>' +
      '</div>'
    : '';

  cont.innerHTML = bannerPend + Object.entries(porCat).map(function(entry) {
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
        var estoqueSep = (typeof _estoqueSeparacaoParaInsumo === 'function') ? _estoqueSeparacaoParaInsumo(i) : null;
        var estoqueSepConectado = typeof window.separacaoLogado === 'function' && window.separacaoLogado();
        return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px">' +
          '<span style="font-family:var(--mono);font-size:10px;color:var(--text3);white-space:nowrap">' + (i.codigo || '—') + '</span>' +
          '<div style="flex:1">' +
            '<span style="font-size:12px;font-weight:600;color:var(--text)">' + i.nome + '</span>' +
            (i.aliases && i.aliases.length ? '<div style="font-size:10px;color:var(--text3);margin-top:2px">Apelidos: ' + i.aliases.join(', ') + '</div>' : '') +
          '</div>' +
          '<div style="text-align:right;font-family:var(--mono);font-size:11px;white-space:nowrap">' +
            '<div style="color:var(--text3)">Reposição: ' + (i.custoReposicao ? fR(i.custoReposicao) : '—') + '</div>' +
            (i.precoManual != null && i.precoManual !== '' ? '<div style="color:var(--blue)">Manual: ' + fR(i.precoManual) + '</div>' : '') +
          '</div>' +
          (estoqueSep
            ? '<span style="font-family:var(--mono);font-size:11px;color:var(--blue);white-space:nowrap" title="Estoque no Sistema Separação">📦 ' + estoqueSep.qtd + ' ' + (estoqueSep.unidade || '') + '</span>'
            : (estoqueSepConectado ? '<span style="font-size:10px;color:var(--text3)" title="Nenhum item do Sistema Separação bateu com este nome/apelido">📦 —</span>' : '')) +
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
  var usadoEm = i ? _fichasQueUsamInsumo(i) : [];
  var classProd = (i && i.classificacaoProducao) || 'materia_prima';

  cont.innerHTML = '<div class="sec">' +
    '<div class="sec-head"><span class="sec-title">' + (i ? '✏️ Editar Insumo' : '+ Novo Insumo') + '</span>' +
      (i && i.codigo ? '<span style="font-family:var(--mono);font-size:11px;color:var(--text3);margin-left:10px">Código ' + i.codigo + '</span>' : '') +
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
            ((!i || !i.categoria) ? '<option value="" selected>— escolha a categoria —</option>' : '') +
            getCategorias().map(function(c) {
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

      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Classificação na Produção</div>' +
      '<div style="display:flex;gap:16px;margin-bottom:20px">' +
        CLASSIFICACOES_PRODUCAO.map(function(cp) {
          return '<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text);cursor:pointer">' +
            '<input type="radio" name="cad-classprod" value="' + cp[0] + '"' + (classProd === cp[0] ? ' checked' : '') + '> ' + cp[1] +
          '</label>';
        }).join('') +
      '</div>' +

      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Estoque</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:20px">' +
        '<div><label class="lbl">Quantidade mínima em estoque</label>' +
          '<input class="inp" id="cad-estoque-minimo" type="number" min="0" value="' + (i && i.estoqueMinimo ? i.estoqueMinimo : 0) + '" placeholder="0">' +
          '<div style="font-size:10px;color:var(--text3);margin-top:2px">Nunca deixar o estoque cair abaixo disso. 0 = sem mínimo.</div></div>' +
      '</div>' +

      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Custo e Preço</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:20px">' +
        '<div><label class="lbl">Custo de Reposição (última compra)</label>' +
          '<div class="inp" style="background:var(--bg3);color:var(--text3)">' + (custoRepos ? fR(custoRepos) : '— sem compras ainda') + '</div></div>' +
        '<div><label class="lbl">Custo Médio do Estoque</label>' +
          '<div class="inp" style="background:var(--bg3);color:var(--text3)">' + (custoMedio ? fR(custoMedio) : '— sem compras ainda') + '</div></div>' +
        '<div><label class="lbl">Preço Manual (opcional)</label>' +
          '<input class="inp" id="cad-preco-manual" type="number" min="0" step="0.01" placeholder="vazio = usa o de reposição" value="' + (i && i.precoManual != null ? i.precoManual : '') + '"></div>' +
        '<div><label class="lbl">Preço-teto sugerido</label>' +
          '<div class="inp" style="background:var(--bg3);color:var(--amber)" title="Mínimo recomendado — é só um alerta, não bloqueia nada">' + (teto ? fR(teto) : '—') + '</div></div>' +
      '</div>' +

      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Revenda por Temporada</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:10px">Quando preenchido, esse valor vira o preço final do item no orçamento (conforme a temporada escolhida em cada orçamento), no lugar do custo/manual acima.</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:20px">' +
        '<div><label class="lbl">Revenda — Baixa Temporada</label>' +
          '<input class="inp" id="cad-revenda-baixa" type="number" min="0" step="0.01" placeholder="0,00" value="' + (i && i.revendaBaixaTemporada ? i.revendaBaixaTemporada : '') + '"></div>' +
        '<div><label class="lbl">Revenda — Alta Temporada</label>' +
          '<input class="inp" id="cad-revenda-alta" type="number" min="0" step="0.01" placeholder="0,00" value="' + (i && i.revendaAltaTemporada ? i.revendaAltaTemporada : '') + '"></div>' +
      '</div>' +

      (i ? (
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Ficha Técnica</div>' +
        '<div style="font-size:12px;color:var(--text3);margin-bottom:8px">' +
          (usadoEm.length ? usadoEm.map(function(f) { return '• ' + f; }).join('<br>') : 'Nenhuma ficha de coquetel usa este insumo (ou o nome/apelido ainda não bate com a ficha).') +
          '<div style="font-size:10px;color:var(--text3);margin-top:6px;font-style:italic">Casamento por nome, provisório — na Fase 2 a ficha passa a referenciar o insumo por ID.</div>' +
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
  var categoriaSel = document.getElementById('cad-categoria')?.value || '';
  if (!categoriaSel) { alert('Escolha a categoria do insumo.'); return; }

  var aliasesRaw = (document.getElementById('cad-aliases')?.value || '').trim();
  var aliases = aliasesRaw ? aliasesRaw.split(',').map(function(a) { return a.trim().toUpperCase(); }).filter(Boolean) : [];
  var precoManualVal = document.getElementById('cad-preco-manual')?.value;
  var revendaBaixaVal = document.getElementById('cad-revenda-baixa')?.value;
  var revendaAltaVal  = document.getElementById('cad-revenda-alta')?.value;

  if (!D.insumos) D.insumos = [];
  var existente = _insumoEditandoId ? buscarInsumoPorId(_insumoEditandoId) : null;
  var nomeAntigo = existente ? (existente.nome || '').trim().toUpperCase() : '';
  var renomeou = !!existente && nomeAntigo && nomeAntigo !== nome;

  var classProdEl = document.querySelector('input[name="cad-classprod"]:checked');

  var insumo = {
    id: existente ? existente.id : ('INS' + Date.now()),
    codigo: existente ? existente.codigo : _proximoCodigoInsumo(),
    origemProdutoId: existente ? existente.origemProdutoId : null,
    nome: nome,
    aliases: aliases,
    categoria: categoriaSel,
    unidadeCompra: document.getElementById('cad-unidade')?.value || 'UN',
    tamanhoEmbalagem: parseInt(document.getElementById('cad-embalagem')?.value) || 1,
    classificacaoProducao: classProdEl ? classProdEl.value : 'materia_prima',
    estoqueMinimo: parseFloat(document.getElementById('cad-estoque-minimo')?.value) || 0,
    custoReposicao: existente ? existente.custoReposicao : 0,
    precoManual: (precoManualVal != null && precoManualVal !== '') ? Number(precoManualVal) : null,
    revendaBaixaTemporada: (revendaBaixaVal != null && revendaBaixaVal !== '') ? Number(revendaBaixaVal) : 0,
    revendaAltaTemporada:  (revendaAltaVal  != null && revendaAltaVal  !== '') ? Number(revendaAltaVal)  : 0,
    ultimaCompra: existente ? existente.ultimaCompra : '',
    ultimoFornecedor: existente ? existente.ultimoFornecedor : '',
  };

  // Renomeou um insumo já existente: guarda o nome antigo como apelido (assim
  // tudo que casa por nome — entradas, preços, contagens, festas passadas —
  // continua achando) e propaga o nome novo pras telas que gravam o nome como
  // texto puro (regras de cálculo do Kit Base, fichas de coquetel, associações).
  if (renomeou && insumo.aliases.indexOf(nomeAntigo) === -1) insumo.aliases.push(nomeAntigo);

  if (existente) {
    var idx = D.insumos.findIndex(function(x) { return x.id === existente.id; });
    if (idx >= 0) D.insumos[idx] = insumo; else D.insumos.push(insumo);
  } else {
    D.insumos.push(insumo);
  }

  sv('insumos');
  if (renomeou) _propagarRenomeInsumo(nomeAntigo, nome);
  alert('Insumo salvo!');
  setCadastroView('lista');
}

// Propaga a troca de nome de um insumo para as telas que guardam o nome como
// string (não por ID — Fase 1). Só mexe em quem tem exatamente o nome antigo.
function _propagarRenomeInsumo(de, para) {
  de = (de || '').trim().toUpperCase();
  para = (para || '').trim().toUpperCase();
  if (!de || !para || de === para) return;

  var mudouRegras = false;
  (D.regrasItens || []).forEach(function(r) {
    if ((r.item || '').toUpperCase() === de) { r.item = para; mudouRegras = true; }
    if ((r.principal || '').toUpperCase() === de) { r.principal = para; mudouRegras = true; }
  });
  if (mudouRegras) sv('regrasItens');

  var mudouFichas = false;
  (D.fichas || []).forEach(function(f) {
    (f.itens || []).forEach(function(it) {
      if ((it.nome || '').toUpperCase() === de) { it.nome = para; mudouFichas = true; }
    });
  });
  if (mudouFichas) sv('fichas');

  var mudouAssoc = false;
  (D.associacoes || []).forEach(function(a) {
    if ((a.acessorio || '').toUpperCase() === de) { a.acessorio = para; mudouAssoc = true; }
    if ((a.principal || '').toUpperCase() === de) { a.principal = para; mudouAssoc = true; }
  });
  if (mudouAssoc) sv('associacoes');
}

function editarInsumo(id) {
  setCadastroView('form');
  setTimeout(function() { rFormInsumo(id); }, 50);
}

function excluirInsumo(id) {
  var insumo = buscarInsumoPorId(id);
  var msg = (insumo && insumo.origemAuto)
    ? 'Excluir "' + (insumo.nome || '') + '"? Ele foi criado automaticamente pelo Kit Base — a regra de cálculo dele na Folha de Separação também será removida e ele não volta sozinho.'
    : 'Excluir este insumo do cadastro? (O produto original em "Produtos" não é apagado.)';
  if (!confirm(msg)) return;
  D.insumos = (D.insumos || []).filter(function(i) { return i.id !== id; });
  sv('insumos');

  // Insumo auto-criado pelo Kit Base: registra a exclusão pra migrarInsumosDoKitBase()
  // não recriar, e apaga a regra correspondente de D.regrasItens.
  if (insumo && insumo.origemAuto) {
    var nomeUp = (insumo.nome || '').toUpperCase();
    if (!D.kitBaseInsumosExcluidos) D.kitBaseInsumosExcluidos = [];
    if (D.kitBaseInsumosExcluidos.indexOf(nomeUp) === -1) D.kitBaseInsumosExcluidos.push(nomeUp);
    sv('kitBaseInsumosExcluidos');
    if (D.regrasItens && D.regrasItens.some(function(r){ return (r.item || '').toUpperCase() === nomeUp; })) {
      D.regrasItens = D.regrasItens.filter(function(r){ return (r.item || '').toUpperCase() !== nomeUp; });
      sv('regrasItens');
    }
  }

  // Insumo migrado de Produtos: sem isso, migrarInsumosDeProdutos() o recria
  // sozinho na próxima vez que a tela abrir (o produto original continua lá).
  if (insumo && insumo.origemProdutoId) {
    if (!D.insumosProdutosExcluidos) D.insumosProdutosExcluidos = [];
    if (D.insumosProdutosExcluidos.indexOf(insumo.origemProdutoId) === -1) {
      D.insumosProdutosExcluidos.push(insumo.origemProdutoId);
    }
    sv('insumosProdutosExcluidos');
  }
  rCadastroInsumos();
}

// ── Padronizar nomes ─────────────────────────────────────────────────────────
// Aplica a lista de nomes "oficiais" da Juliana sobre D.insumos. Só troca o
// campo "nome" (o que aparece nas telas daqui pra frente) — o nome antigo
// entra em aliases[] em vez de sumir, porque D.entradas/D.contagens/D.quebras/
// D.precos/festas passadas ainda guardam o nome antigo como string exata em
// vários lugares (ex: calcCustoMedioEstoque compara e.prod === nome). Trocar
// o nome ali também exigiria reescrever anos de histórico — decisão dela foi
// não mexer nisso agora, só no cadastro (ver memória do módulo).
var MAPA_PADRONIZACAO_INSUMOS = {
  "AGUA COM GAS": "AGUA COM GAS - 500ML",
  "AGUA SEM GAS 500ML": "AGUA SEM GAS - 500ML",
  "AGUA TONICA": "AGUA TONICA LATA TRADICIONAL - 350ML",
  "AMARENA": "AMARENA",
  "AMAROGUTTA": "AMAROGUTTA - 1000ML",
  "APEROL": "APEROL - 750ML",
  "ANGOSTURA": "BITTER ANGOSTURA - 200ML (RESERVA)",
  "BITTER LARANJA": "BITTER ORANGE - 200ML",
  "BANANINHA": "CACHAÇA BANANINHA - 750ML",
  "CACHACA SPIRAL": "CACHAÇA SPIRAL - 1000ML",
  "CAMPARI": "CAMPARI - 998 ML",
  "DOMEC": "CONHAQUE DOMECQ - 1000ML",
  "COPO BAIXO XTRA": "COPO BAIXO XTRA",
  "COPO BOODY MARY": "COPO BLOOD MARY",
  "CANECA DE COBRE": "COPO CANECA COBRE",
  "COPO LONG ELYSIA": "COPO LONGO ELYSIA",
  "COPO LONG LISO MODELO NOVO": "COPO LONGO LISO NOVO",
  "COPO LONG LISO MODELO VELHO": "COPO LONGO LISO VELHO",
  "COPO LONG REVEL": "COPO LONGO REVEL",
  "COPO LONG XTRA": "COPO LONGO XTRA",
  "EMULSIFICANTE": "EMULSIFICANTE - 200ml",
  "ESPUMA DE GENGIBRE": "ESPUMA DE GENGIBRE - 1000ML",
  "ESPUMA DE SICILIANO": "ESPUMA DE LIMAO SICILIANO - 1000ML",
  "ESPUMA DE TANGERINA": "ESPUMA DE TANGERINA - 1000ML",
  "ESPUMANTE BRUT": "ESPUMANTE BRUT - 750ML",
  "ESPUMANTE 0%": "ESPUMANTE FREIXENET 0% - 750ML",
  "FERNET": "FERNET BRANCA - 750ML",
  "FIREBALL": "FIREBALL - 750ML",
  "GIN BEEFEATER": "GIN BEEFEATER - 750ML",
  "GIN BOMBAY": "GIN BOMBAY - 750ML",
  "GIN HENDRICKS": "GIN HENDRICKS - 750ML",
  "GIN MARTIN MILLER": "GIN MARTIN MILLER - 750ML",
  "GIN ROKU": "GIN ROKU - 750ML",
  "GIN SPIRAL": "GIN SPIRAL - 1000ML",
  "GIN TANQUERAY": "GIN TANQUERAY - 750ML",
  "GIN YVY CERRADO": "GIN YVY CERRADO - 500ML",
  "GIN YVY MATA ATLANTICA": "GIN YVY MATA ATLANTICA - 500ML",
  "GIN ZURR": "GIN ZURR - 750ML",
  "JAGERMEISTER": "JAGERMEISTER - 750ML",
  "LICOR 43": "LICOR 43 - 700ML",
  "LILLET": "LILLET BLANC - 750ML",
  "LILLET ROSE": "LILLET ROSE - 750ML",
  "MANZA": "MANZA - 330ML",
  "MARACUJA PROD": "MARACUJA",
  "MEL": "MEL",
  "NEGRONI ROMERO": "NEGRONI",
  "PISCO CHI CAPEL RESERVADO 700 ML": "PISCO CAPEL - 750ML",
  "PURE MAÇA VERDE 1883 1L": "PURE 1883 MAÇA - 1000ML",
  "PURE DE MARACUJA": "PURE 1883 MARACUJA - 1000ML",
  "PURE DE ABACAXI": "PURE DE FRUTA ABACAXI",
  "PURE DE BANANA": "PURE DE FRUTA BANANA",
  "PURE DE FRUTAS VERMELHAS": "PURE DE FRUTAS VERMELHAS",
  "PURE DE JABUTICABA": "PURE MONIN JABUTICABA - 1000ML",
  "PURE DE PERA": "PURE MONIN PERA - 1000ML",
  "PURE DE TORANJA": "PURE MONIN TORANJA - 1000ML",
  "RUM HAVANA": "RUM HAVANA CLUB ANEJO - 700ML",
  "SAQUE": "SAQUE - 600ML",
  "GINGER ALE": "SODA GINGER ALE - 1000ML",
  "SODA DE GRAPEFRUIT": "SODA GRAPEFRUIT - 1000ML",
  "SUCO LARANJA": "SUCO DE LARANJA",
  "SUCO DE LIMAO": "SUCO DE LIMAO",
  "SUCO DE PESSEGO": "SUCO DE PESSEGO",
  "TAÇA DE VINHO BRUNELLO": "TAÇA BRUNELLO",
  "TAÇA CALISE AMERICA (RECEPTIVO)": "TAÇA CALISE AMERICA",
  "TAÇA COUPE AMERICA": "TAÇA COUPE AMÉRICA",
  "TAÇA COUPE TIMELEES": "TAÇA COUPE TIMELESS",
  "TAÇA MARTINI": "TAÇA MARTINI AMERICA",
  "TAÇA DE VINHO XTRA": "TAÇA XTRA",
  "TEQUILA DON JULIO": "TEQUILA DON JULIO - 750ML",
  "TEQUILA 1800 BLANCO": "TEQUILA JOSE CUERVO 1800 BLANCO - 750ML",
  "TEQUILA 1800 CRISTALINO": "TEQUILA JOSE CUERVO 1800 CRISTALINO - 750ML",
  "TEQUILA 1800 CRISTALINO AURORA": "TEQUILA JOSE CUERVO CRISTALINO (AURORA) - 700ML",
  "TEQUILA JOSE CUERVO ESPECIAL": "TEQUILA JOSE CUERVO ESPECIAL OURO - 750ML",
  "MAESTRO DOBEL": "TEQUILA MAESTRO DOBEL - 750ML",
  "1757": "VERMUTE 1757 - 750ML",
  "VERMUTE ARG CARPANO ROSSO": "VERMUTE CARPANO ROSSO - 950ML",
  "CINZANO": "VERMUTE ROSSO CINZANO - 1000ML",
  "VINHO DO PORTO BRANCO": "VINHO DO PORTO BRANCO - 750ML",
  "VODKA ABSOLUT": "VODKA ABSOLUT - 1000ML",
  "VODKA GREY GOOSE": "VODKA GREY GOOSE - 750ML",
  "VODKA IMPERIAL GOLD": "VODKA IMPERIAL GOLD - 750ML",
  "VODKA KETEL ONE": "VODKA KETEL ONE - 750ML",
  "VODKA RCV": "VODKA RCV - 750ML",
  "VODKA ROBERTO CAVALLI": "VODKA ROBERTO CAVALLI - 1000ML",
  "VODKA WYBOROWA": "VODKA WYBOROWA - 750ML",
  "WHISKY 3 LOBOS SINGLE MALT 750 ML": "WHISKEY 3 LOBOS - 750ML",
  "BLACK LABEL": "WHISKEY BLACK LABEL - 750ML",
  "WHISKY BUFFALO TRACE BOURBON - 750 ML": "WHISKEY BUFALO TRACE - 750ML",
  "BULLEIT": "WHISKEY BULLEIT - 750ML",
  "CHIVAS 12": "WHISKEY CHIVAS 12 - 750ML",
  "JACK DANIELS": "WHISKEY JACK DANIELS - 750ML",
  "WHISKY JAMESON - 750ML": "WHISKEY JAMESON - 750ML",
  "RED LABEL": "WHISKEY RED LABEL - 750ML",
  "SINGLETON": "WHISKEY SINGLETON - 750ML",
  "THE GLENLIVET": "WHISKEY THE GLENLIVET - 750ML",
  "ABACAXI XP": "XAROPE 1883 ABACAXI - 1000ML",
  "AMARETO": "XAROPE 1883 AMARETO - 1000ML",
  "XAROPE 1883 DE AMORA": "XAROPE 1883 AMORA - 1000ML",
  "CARAMELO": "XAROPE 1883 CARAMELO - 1000ML",
  "CARAMELO SALGADO": "XAROPE 1883 CARAMELO SALGADO - 1000ML",
  "CRAMBERRY": "XAROPE 1883 CRAMBERRY - 1000ML",
  "BLUE CURACAO": "XAROPE 1883 CURAÇAU BLUE - 1000ML",
  "XAROPE 1883 DE FRAMBOESA": "XAROPE 1883 FRAMBOESA - 1000ML",
  "GENGIBRE": "XAROPE 1883 GENGIBRE - 1000ML",
  "GRENADINE": "XAROPE 1883 GRENADINE - 1000ML",
  "XAROPE LARANJA VERMELHA 1L": "XAROPE 1883 LARANJA VERMELHA - 1000ML",
  "XAROPE 1883 DE LICHIA": "XAROPE 1883 LICHIA - 1000ML",
  "LIMAO SICILIANO": "XAROPE 1883 LIMAO SICILIANO - 1000ML",
  "XAROPE DE MAÇA VERDE": "XAROPE 1883 MAÇA VERDE - 1000ML",
  "MAPLE": "XAROPE 1883 MAPLE - 1000ML",
  "MARACUJA VERMELHO": "XAROPE 1883 MARACUJÁ VERMELHO - 1000ML",
  "MELANCIA": "XAROPE 1883 MELANCIA - 1000ML",
  "MENTA": "XAROPE 1883 MENTA - 1000ML",
  "PEPINO": "XAROPE 1883 PEPINO - 1000ML",
  "PIMENTA": "XAROPE 1883 PIMENTA - 1000ML",
  "POMEGRANATE ROMA": "XAROPE 1883 ROMA/POMEGRANATE - 1000ML",
  "XAROPE 1883 DE TANGERINA": "XAROPE 1883 TANGERINE - 1000ML",
  "TONIC XP": "XAROPE 1883 TONIC - 1000ML",
  "XAROPE DE ACUCAR": "XAROPE DE AÇUCAR",
  "FLOR DE SABUGUEIRO": "XAROPE FABRI FLOR DE SABUGUEIRO - 1000ML",
  "MANDARIN": "XAROPE FABRI MANDARIM - 1000ML",
  "AGAVE": "XAROPE MONIN AGAVEA - 1000ML",
  "MELON": "XAROPE MONIN MELON - 1000ML",
  "MENTA VERDE": "XAROPE MONIN MENTA VERDE - 1000ML",
  "MORANGO XP": "XAROPE MONIN MORANGO - 1000ML",
  "PIPOCA": "XAROPE MONIN PIPOCA - 1000ML",
  "PISTACHIO": "XAROPE MONIN PISTACHO - 1000ML",
  "PURE DE YUZU": "XAROPE MONIN YUZU - 1000ML",
};

var _padronizacaoInsumosPendente = []; // [{id, nomeAtual, nomeNovo}] montado no preview, usado na confirmação

function abrirModalPadronizarInsumos() {
  var porNomeAtual = {};
  (D.insumos || []).forEach(function(i) { porNomeAtual[(i.nome || '').trim().toUpperCase()] = i; });

  _padronizacaoInsumosPendente = [];
  var naoEncontrados = [];
  Object.entries(MAPA_PADRONIZACAO_INSUMOS).forEach(function(entry) {
    var nomeAtual = entry[0], nomeNovo = entry[1];
    var insumo = porNomeAtual[nomeAtual.trim().toUpperCase()];
    if (!insumo) { naoEncontrados.push(nomeAtual); return; }
    if ((insumo.nome || '').trim() === nomeNovo.trim()) return; // já está no padrão
    _padronizacaoInsumosPendente.push({ id: insumo.id, nomeAtual: insumo.nome, nomeNovo: nomeNovo });
  });

  var listaEl = document.getElementById('padroniza-insumos-lista');
  var btnAplicar = document.getElementById('btn-aplicar-padroniza-insumos');

  if (!_padronizacaoInsumosPendente.length) {
    listaEl.innerHTML = '<p style="font-size:12px;color:var(--text3);padding:12px 0">Nenhuma mudança pendente — os insumos já estão com o nome padrão (ou ainda não foram cadastrados aqui).</p>' +
      (naoEncontrados.length ? '<p style="font-size:11px;color:var(--text3)">' + naoEncontrados.length + ' nome(s) da lista não encontrados no Cadastro: ' + naoEncontrados.join(', ') + '</p>' : '');
    if (btnAplicar) btnAplicar.style.display = 'none';
  } else {
    listaEl.innerHTML =
      '<div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">' + _padronizacaoInsumosPendente.length + ' mudança(s):</div>' +
      _padronizacaoInsumosPendente.map(function(p) {
        return '<div style="display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px">' +
          '<span style="color:var(--text3);text-decoration:line-through">' + p.nomeAtual + '</span>' +
          '<span style="color:var(--text);font-weight:600">→ ' + p.nomeNovo + '</span>' +
        '</div>';
      }).join('') +
      (naoEncontrados.length ? '<div style="font-size:11px;color:var(--text3);margin-top:10px">' + naoEncontrados.length + ' nome(s) da lista não encontrados no Cadastro (podem já ter outro nome, ou não existir aqui ainda): ' + naoEncontrados.join(', ') + '</div>' : '');
    if (btnAplicar) btnAplicar.style.display = '';
  }

  openM('mpadroniza-insumos');
}

function confirmarPadronizarInsumos() {
  if (!_padronizacaoInsumosPendente.length) return;
  _padronizacaoInsumosPendente.forEach(function(p) {
    var insumo = buscarInsumoPorId(p.id);
    if (!insumo) return;
    if (!insumo.aliases) insumo.aliases = [];
    if (insumo.aliases.indexOf(p.nomeAtual) === -1 && p.nomeAtual !== p.nomeNovo) insumo.aliases.push(p.nomeAtual);
    insumo.nome = p.nomeNovo;
  });
  var total = _padronizacaoInsumosPendente.length;
  _padronizacaoInsumosPendente = [];
  sv('insumos');
  closeM('mpadroniza-insumos');
  rCadastroInsumos();
  alert2(total + ' nome(s) padronizado(s)!');
}
