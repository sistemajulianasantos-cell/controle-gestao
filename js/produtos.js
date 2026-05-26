// ─── PRODUTOS ──────────────────────────────────────────


// ── Importar produtos do MAR (Relatório Geral) ─────────
function importarProdutosDoMAR() {
  if (!MAR) { alert('Dados do estoque não disponíveis.'); return; }
  var novos = 0;
  var existentes = 0;
  if (!D.produtos) D.produtos = [];

  Object.entries(MAR).forEach(function(entry) {
    var nome = entry[0];
    var dados = entry[1];
    // Verificar se já existe (por nome exato ou alias)
    var jaExiste = D.produtos.some(function(p) {
      return p.nome === nome || (p.aliases||[]).includes(nome);
    });
    if (jaExiste) { existentes++; return; }
    // Mapear categoria do MAR para categoria do sistema
    var cat = 'OUTROS';
    var catMap = {
      'WHISKY':'BEBIDAS ALCOÓLICAS','GIN':'BEBIDAS ALCOÓLICAS','VODKA':'BEBIDAS ALCOÓLICAS',
      'RUM':'BEBIDAS ALCOÓLICAS','TEQUILA':'BEBIDAS ALCOÓLICAS','CACHACA':'BEBIDAS ALCOÓLICAS',
      'LICOR/SHOTS':'BEBIDAS ALCOÓLICAS','ESPUMANTES/VINHO':'BEBIDAS ALCOÓLICAS',
      'APERITIVOS/FORTIF.':'BEBIDAS ALCOÓLICAS','VERMUTE/BITTER':'ESPECIARIAS',
      'SEM ALCOOL':'BEBIDAS SEM ÁLCOOL','XAROPE/PURE':'XAROPES',
      'MIXING ARTESANAL':'MIX ARTESANAL','PRODUCAO':'PRODUÇÃO',
      'COPOS/TAÇAS':'COPOS E TAÇAS'
    };
    cat = catMap[dados.cat] || 'OUTROS';
    D.produtos.push({
      id: 'PRO' + Date.now() + Math.random().toString(36).slice(2,6),
      nome: nome,
      aliases: [],
      categoria: cat,
      categoriaMAR: dados.cat,
      unidade: cat === 'COPOS E TAÇAS' ? 'UN' : 'UN',
      tamanhoEmbalagem: 1,
      minimo: 0,
      obs: '',
      atualizadoEm: new Date().toISOString()
    });
    novos++;
  });

  if (novos > 0) {
    sv('produtos');
    alert('✅ ' + novos + ' produtos importados! ' + existentes + ' já existiam e foram mantidos.');
    rProdutos();
  } else {
    alert('Todos os ' + existentes + ' produtos já estavam cadastrados.');
  }
}

function initProdutos() {
  if (!D.produtos) D.produtos = [];
  setProdutosView('lista');
}

function setProdutosView(v) {
  ['lista','form'].forEach(function(x) {
    var el = document.getElementById('prd-view-' + x);
    if (el) el.style.display = x === v ? '' : 'none';
  });
  if (v === 'lista') rProdutos();
  if (v === 'form')  rFormProduto();
}

var _produtoEditandoId = null;

var UNIDADES_PRODUTO = ['UN','CX','FARDO','KG','LT','ML','PCT','PAR'];
var CATEGORIAS_PRODUTO = [
  'MATERIAL','COPOS E TAÇAS','DESCARTÁVEIS','ESPECIARIAS',
  'BEBIDAS ALCOÓLICAS','BEBIDAS SEM ÁLCOOL','HORTIFRUTI',
  'MIX ARTESANAL','PRODUÇÃO','XAROPES','KIT BARTENDER','GELO','OUTROS'
];

function rProdutos() {
  var cont = document.getElementById('prd-lista-body');
  if (!cont) return;
  var lista = (D.produtos||[]).slice().sort(function(a,b){
    return (a.categoria||'').localeCompare(b.categoria||'') || (a.nome||'').localeCompare(b.nome||'');
  });

  // Filtro de busca
  var busca = (document.getElementById('prd-busca')?.value||'').toLowerCase();
  var catFiltro = document.getElementById('prd-cat-filtro')?.value||'';
  if (busca) lista = lista.filter(function(p){
    return (p.nome||'').toLowerCase().includes(busca) ||
      (p.aliases||[]).some(function(a){return a.toLowerCase().includes(busca);});
  });
  if (catFiltro) lista = lista.filter(function(p){return p.categoria===catFiltro;});

  if (!lista.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhum produto cadastrado.<br>Clique em "+ Novo Produto" para começar.</div>';
    return;
  }

  // Agrupar por categoria
  var porCat = {};
  lista.forEach(function(p){
    if (!porCat[p.categoria||'OUTROS']) porCat[p.categoria||'OUTROS'] = [];
    porCat[p.categoria||'OUTROS'].push(p);
  });

  cont.innerHTML = Object.entries(porCat).map(function(entry){
    var cat = entry[0]; var prods = entry[1];
    return '<div style="margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;padding:6px 0;border-bottom:2px solid var(--border2);margin-bottom:6px">' +
        cat + ' <span style="font-weight:400">(' + prods.length + ')</span>' +
      '</div>' +
      '<div style="display:grid;gap:6px">' +
      prods.map(function(p){
        var badges = '';
        if (p.tamanhoEmbalagem > 1) badges += '<span style="font-size:9px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue-dim);padding:1px 6px;border-radius:10px;margin-left:4px">' + p.tamanhoEmbalagem + ' ' + (p.unidade||'UN') + '/cx</span>';
        if (p.minimo > 0) badges += '<span style="font-size:9px;background:var(--amber-bg);color:var(--amber);border:1px solid var(--amber-dim);padding:1px 6px;border-radius:10px;margin-left:4px">mín ' + p.minimo + '</span>';
        if (p.aliases && p.aliases.length) badges += '<span style="font-size:9px;background:var(--bg4);color:var(--text3);border:1px solid var(--border2);padding:1px 6px;border-radius:10px;margin-left:4px">' + p.aliases.length + ' alias</span>';
        return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px">' +
          '<div style="flex:1">' +
            '<span style="font-size:12px;font-weight:600;color:var(--text)">' + p.nome + '</span>' + badges +
            (p.aliases && p.aliases.length ? '<div style="font-size:10px;color:var(--text3);margin-top:2px">Aliases: ' + p.aliases.join(', ') + '</div>' : '') +
          '</div>' +
          '<span style="font-size:11px;color:var(--text3);font-family:var(--mono)">' + (p.unidade||'UN') + '</span>' +
          '<div style="display:flex;gap:6px">' +
            '<button class="btn-sm" style="background:var(--blue)" onclick="editarProduto(\'' + p.id + '\')">✏️</button>' +
            '<button class="btn-sm btn-red" onclick="excluirProduto(\'' + p.id + '\')">×</button>' +
          '</div>' +
        '</div>';
      }).join('') +
      '</div></div>';
  }).join('');
}

function rFormProduto(id) {
  _produtoEditandoId = id || null;
  var p = id ? (D.produtos||[]).find(function(x){return x.id===id;}) : null;
  var cont = document.getElementById('prd-view-form');
  if (!cont) return;

  var aliasesStr = p && p.aliases ? p.aliases.join(', ') : '';

  cont.innerHTML = '<div class="sec">' +
    '<div class="sec-head">' +
      '<span class="sec-title">' + (p ? '✏️ Editar Produto' : '+ Novo Produto') + '</span>' +
      '<button class="btn-sm" onclick="setProdutosView(\'lista\')" style="margin-left:auto">← Voltar</button>' +
    '</div>' +
    '<div style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">' +

      // Nome
      '<div style="grid-column:1/-1"><label class="lbl">Nome principal *</label>' +
        '<input class="inp" id="prd-nome" type="text" placeholder="Ex: ÁGUA TÔNICA LATA 350ML" value="' + (p ? p.nome : '') + '" style="text-transform:uppercase"></div>' +

      // Aliases
      '<div style="grid-column:1/-1"><label class="lbl">Aliases / variações de nome na NF</label>' +
        '<input class="inp" id="prd-aliases" type="text" placeholder="Ex: AGUA TONICA, TONICA ZERO, SCHWEPPES TONICA" value="' + aliasesStr + '">' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px">Separados por vírgula. O sistema reconhece esses nomes ao importar NFs.</div></div>' +

      // Categoria
      '<div><label class="lbl">Categoria *</label>' +
        '<select class="inp" id="prd-categoria">' +
          CATEGORIAS_PRODUTO.map(function(c){
            return '<option value="'+c+'"'+(p && p.categoria===c?' selected':'')+'>'+c+'</option>';
          }).join('') +
        '</select></div>' +

      // Unidade
      '<div><label class="lbl">Unidade de medida</label>' +
        '<select class="inp" id="prd-unidade">' +
          UNIDADES_PRODUTO.map(function(u){
            return '<option value="'+u+'"'+(p && p.unidade===u?' selected':'')+'>'+u+'</option>';
          }).join('') +
        '</select></div>' +

      // Tamanho embalagem
      '<div><label class="lbl">Qtd por embalagem (caixa/fardo)</label>' +
        '<input class="inp" id="prd-embalagem" type="number" min="1" value="' + (p && p.tamanhoEmbalagem ? p.tamanhoEmbalagem : 1) + '" placeholder="1">' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px">Ex: fardo de 12, caixa de 15. Use 1 se não se aplica.</div></div>' +

      // Mínimo
      '<div><label class="lbl">Quantidade mínima</label>' +
        '<input class="inp" id="prd-minimo" type="number" min="0" value="' + (p && p.minimo ? p.minimo : 0) + '" placeholder="0">' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px">Nunca levar menos que isso. 0 = sem mínimo.</div></div>' +

      // OBS
      '<div style="grid-column:1/-1"><label class="lbl">Observações</label>' +
        '<input class="inp" id="prd-obs" type="text" placeholder="—" value="' + (p ? (p.obs||'') : '') + '"></div>' +

    '</div>' +
    '<div style="padding:0 16px 16px;display:flex;gap:8px">' +
      '<button class="btn" onclick="salvarProduto()" style="background:var(--green)">💾 Salvar</button>' +
      '<button class="btn" onclick="setProdutosView(\'lista\')" style="background:var(--bg3);color:var(--text)">Cancelar</button>' +
    '</div>' +
  '</div>';
}

function salvarProduto() {
  var nome = (document.getElementById('prd-nome')?.value||'').trim().toUpperCase();
  if (!nome) { alert('Preencha o nome do produto.'); return; }

  var aliasesRaw = (document.getElementById('prd-aliases')?.value||'').trim();
  var aliases = aliasesRaw ? aliasesRaw.split(',').map(function(a){return a.trim().toUpperCase();}).filter(Boolean) : [];

  var prod = {
    id: _produtoEditandoId || ('PRO'+Date.now()),
    nome: nome,
    aliases: aliases,
    categoria: document.getElementById('prd-categoria')?.value || 'OUTROS',
    unidade: document.getElementById('prd-unidade')?.value || 'UN',
    tamanhoEmbalagem: parseInt(document.getElementById('prd-embalagem')?.value)||1,
    minimo: parseFloat(document.getElementById('prd-minimo')?.value)||0,
    obs: document.getElementById('prd-obs')?.value||'',
    atualizadoEm: new Date().toISOString()
  };

  if (!D.produtos) D.produtos = [];
  if (_produtoEditandoId) {
    var idx = D.produtos.findIndex(function(p){return p.id===_produtoEditandoId;});
    if (idx>=0) D.produtos[idx] = prod;
    else D.produtos.push(prod);
  } else {
    // Verificar se já existe com esse nome
    if (D.produtos.find(function(p){return p.nome===nome;})) {
      if (!confirm('Já existe um produto com esse nome. Criar mesmo assim?')) return;
    }
    D.produtos.push(prod);
  }

  sv('produtos');
  alert('Produto salvo!');
  setProdutosView('lista');
}

function editarProduto(id) {
  setProdutosView('form');
  setTimeout(function(){ rFormProduto(id); }, 50);
}

function excluirProduto(id) {
  if (!confirm('Excluir este produto?')) return;
  D.produtos = (D.produtos||[]).filter(function(p){return p.id!==id;});
  sv('produtos');
  rProdutos();
}

// Buscar produto pelo nome (para reconhecimento de NF e separação)
function buscarProdutoPorNome(nome) {
  if (!nome) return null;
  var nomeNorm = nome.trim().toUpperCase();
  return (D.produtos||[]).find(function(p){
    if (p.nome === nomeNorm) return true;
    return (p.aliases||[]).some(function(a){return a === nomeNorm;});
  }) || null;
}

// Arredondar quantidade para múltiplo da embalagem
function arredondarEmbalagem(qtd, produto) {
  if (!produto || !produto.tamanhoEmbalagem || produto.tamanhoEmbalagem <= 1) {
    return Math.max(qtd, produto ? (produto.minimo||0) : 0);
  }
  var emb = produto.tamanhoEmbalagem;
  var min = produto.minimo || 0;
  var qtdFinal = Math.max(qtd, min);
  if (qtdFinal === 0) return 0;
  // Arredondar para cima até o múltiplo de embalagem
  return Math.ceil(qtdFinal / emb) * emb;
}

// ─── CADASTRO RÁPIDO DE PRODUTO (a partir do lançamento de NF) ────────────────

function abrirCadastroProdutoRapido() {
  var el = document.getElementById('m-quick-produto');
  if (!el) return;
  // Pré-preenche o nome com o que o usuário digitou no campo de produto
  var nomePre = ((document.getElementById('eprod') || {}).value || '').trim().toUpperCase();
  document.getElementById('qp-nome').value  = nomePre;
  document.getElementById('qp-cat').value   = 'OUTROS';
  document.getElementById('qp-unid').value  = 'UN';
  el.style.display = 'flex';
  setTimeout(function(){ document.getElementById('qp-nome').focus(); }, 80);
}

function salvarProdutoRapido() {
  var nome = ((document.getElementById('qp-nome') || {}).value || '').trim().toUpperCase();
  if (!nome) { alert('Informe o nome do produto.'); return; }
  if (!D.produtos) D.produtos = [];

  // Verificação case-insensitive: evita duplicar produto que já existe
  var jaExiste = D.produtos.find(function(p){
    return (p.nome||'').toUpperCase() === nome;
  });
  if (jaExiste) {
    _selecionarProdutoNaNF(jaExiste.nome); // usa o nome exato do cadastro
    document.getElementById('m-quick-produto').style.display = 'none';
    if (typeof alert2 === 'function') alert2('⚠️ "' + jaExiste.nome + '" já está cadastrado e foi selecionado.');
    else alert('"' + jaExiste.nome + '" já existe no cadastro — foi selecionado.');
    return;
  }

  var prod = {
    id: 'PRO' + Date.now(),
    nome: nome,
    aliases: [],
    categoria: (document.getElementById('qp-cat')  || {}).value || 'OUTROS',
    unidade:   (document.getElementById('qp-unid') || {}).value || 'UN',
    tamanhoEmbalagem: 1,
    minimo: 0,
    obs: '',
    atualizadoEm: new Date().toISOString()
  };

  D.produtos.push(prod);
  sv('produtos');

  // Atualiza o datalist do campo de NF e seleciona o novo produto
  if (typeof populateEprodList === 'function') populateEprodList();
  _selecionarProdutoNaNF(nome);

  document.getElementById('m-quick-produto').style.display = 'none';
  if (typeof alert2 === 'function') alert2('✅ Produto "' + nome + '" cadastrado!');
  else alert('Produto "' + nome + '" cadastrado!');

  // Re-renderiza aba Produtos se estiver visível
  var pag = document.getElementById('page-produtos');
  if (pag && pag.classList.contains('active')) rProdutos();
}

function _selecionarProdutoNaNF(nome) {
  var inp = document.getElementById('eprod');
  if (inp) {
    inp.value = nome;
    // Foca no campo de quantidade para agilizar o lançamento
    var qtdEl = document.getElementById('eqtd');
    if (qtdEl) setTimeout(function(){ qtdEl.focus(); }, 80);
  }
}


