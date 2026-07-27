// ─── REGRAS E CÁLCULOS ─────────────────────────────────

// ── Lista completa de itens da folha de separação ──────

// Itens disponíveis na FICHA DE COQUETEL (específicos do coquetel)
// Não inclui itens calculados automaticamente (equipe, gelo, material base, kit bartender, descartáveis gerais)
var ITENS_FICHA_COQUETEL = {
  "BEBIDAS ALCOÓLICAS": [
    "VODKA ABSOLUT 1000ML","GIM BEEFEATER 750ML","GIM TANQUERAY","TEQUILA",
    "RUM HAVANA","ESPUMANTE LE BLANC","LICOR 43","CAMPARI","WHISKEY JAMESON 750ML",
    "VERMUTE CARPANO 950ML","APEROL","CACHAÇA SPIRAL","FERNET","BANANINHA",
    "FIREBALL","MANZA"
  ],
  "COPOS E TAÇAS": [
    "TAÇA XTAR","CANECA DE COBRE","COPO BAIXO TIMELLES","COPO LONGO REVEL",
    "COPO LONGO ELYSIA","COPO BAIXO ELYSIA","COPO WHISKY XTAR","TAÇA COUPE TIMELESS",
    "TUBO DE ENSAIO","TAÇA CALISE AMERICA","COPO LONGO LISO NOVO","COPO WHISKY ELYSIA",
    "COPO WHISKY LISO","COPO WHISKEY TIMELESS"
  ],
  "HORTIFRUTI": [
    "LIMÃO TAITI","LIMÃO SICILIANO","MORANGO","GRAPEFRUIT","LARANJA BAHIA",
    "UVA VERDE","HORTELÃ","MANJERICÃO","ALECRIM","TOMILHO","PEPINO",
    "FLOR COMESTÍVEL","MARACUJÁ","PERA","MAÇÃ VERDE","CASCA DE LIMÃO"
  ],
  "ESPECIARIAS": [
    "ANGOSTURA 200ML (RESERVA)","ANGOSTURA 50ML","SAL DE PÁPRICAS",
    "BITTER DE LARANJA","EMULSIFICANTE","INFUSÃO","DESIDRATADOS"
  ],
  "MIX ARTESANAL": [
    "SODA GINGER ALE","SODA GRAPEFRUIT","ESPUMA DE GENGIBRE","ESPUMA DE LIMÃO SICILIANO",
    "ESPUMA DE LIMÃO","MIX FRUTAS VERMELHAS"
  ],
  "PRODUÇÃO": [
    "SUCO DE LIMÃO","XAROPE DE AÇÚCAR","CAFÉ","MIX AÇÚCAR DE BAUNILHA E MARACUJÁ",
    "MIX FRUTAS VERMELHAS"
  ],
  "XAROPES": [
    "LICOR DE CAFÉ","PURE MONIN PERA 1000ML","XAROPE LICHIA","XAROPE MORANGO",
    "XAROPE MARACUJÁ","XAROPE TANGERINA","XAROPE CARAMELO","XAROPE CUCUMBER",
    "XAROPE PÊSSEGO","XAROPE FRAMBOESA","XAROPE BAUNILHA"
  ],
  "MATERIAL (ESPECÍFICO)": [
    "DESCASCADOR","MACERADOR","TESOURA","PRATINHO PRETO",
    "GARRAFA SOUR","GARRAFA SIMPLES","PALITO DE ACRÍLICO"
  ]
};

function getItensFicha() {
  // Se tiver biblioteca personalizada, usar; mas filtrar só categorias da ficha
  var bib = getBiblioteca();
  var resultado = {};
  var CATS_FICHA = Object.keys(ITENS_FICHA_COQUETEL);
  
  Object.entries(bib).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    // Verificar se é categoria da ficha
    var catFicha = CATS_FICHA.find(function(c) {
      return cat === c || cat === c.replace(' (ESPECÍFICO)','');
    });
    if (catFicha) {
      resultado[catFicha] = resultado[catFicha] 
        ? resultado[catFicha].concat(itens.filter(function(i){ return !resultado[catFicha].includes(i); }))
        : itens.slice();
    }
  });
  
  // Se resultado vazio, usar padrão
  if (!Object.keys(resultado).length) {
    return JSON.parse(JSON.stringify(ITENS_FICHA_COQUETEL));
  }
  return resultado;
}

var ITENS_FOLHA = {
  "EQUIPE": ["COORDENADOR","BARTENDER","BAR BACK","COPEIRO"],
  "GELO": ["GELO CUBO 4KG","GELO TRANSLÚCIDO"],
  "BEBIDAS SEM ÁLCOOL": ["ÁGUA TÔNICA","ÁGUA COM GÁS"],
  "COPOS E TAÇAS": [
    "TAÇA XTAR","CANECA DE COBRE","COPO BAIXO TIMELLES","COPO LONGO REVEL",
    "COPO LONGO ELYSIA","COPO BAIXO ELYSIA","COPO WHISKY XTAR","TAÇA COUPE TIMELESS",
    "TUBO DE ENSAIO","TAÇA CALISE AMERICA","COPO LONGO LISO NOVO","COPO WHISKY ELYSIA",
    "COPO WHISKY LISO","COPO WHISKEY TIMELESS"
  ],
  "MATERIAL": [
    "TAPETE","PRATINHO PRETO","GARRAFA SOUR","GARRAFA SIMPLES","MIXING GLASS",
    "BOWL PRETO","PÁ DE GELO","COQUETELEIRA COMPLETA","FUNIL","TÁBUA DE CORTE",
    "FACA PRETA","DOSADOR","DESCASCADOR","PENEIRA DE INOX - PEQUENA","MINI RALO",
    "BIQUEIRA","BAILARINA","MACERADOR","PINÇA","PEGADOR DE GELO","STREINER",
    "BALDE COPA","ESCORREDOR","DETERGENTE 500ML","BUCHA AMARELA","COOLER DE REPOSIÇÃO",
    "TÉRMICA PRETA","CAIXA TÉRMICA","SUPORTE PARA TÉRMICA","CAIXA AZUL DE GELO",
    "CUBA PRETA","LIXEIRA","RÁDIO","TESOURA","COLHER BAILARINA","PANO DE PRATO",
    "TABUA DE CORTE","MIXING GLASS"
  ],
  "DESCARTÁVEIS": [
    "ÁLCOOL","GUARDANAPO","CANUDO DE PLÁSTICO","SACO DE LIXO","COPO DESCARTÁVEL",
    "PALITO DE ACRÍLICO","PANO DE PRATO"
  ],
  "ESPECIARIAS": [
    "ANGOSTURA 200ML (RESERVA)","ANGOSTURA 50ML","ADOÇANTE","SAL DE PÁPRICAS",
    "BITTER DE LARANJA","EMULSIFICANTE","INFUSÃO","DESIDRATADOS"
  ],
  "HORTIFRUTI": [
    "LIMÃO TAITI","LIMÃO SICILIANO","MORANGO","GRAPEFRUIT","LARANJA BAHIA",
    "UVA VERDE","HORTELÃ","MANJERICÃO","ALECRIM","TOMILHO","PEPINO",
    "FLOR COMESTÍVEL","MARACUJÁ","PERA","MAÇÃ VERDE","CASCA DE LIMÃO"
  ],
  "BEBIDAS ALCOÓLICAS": [
    "VODKA ABSOLUT 1000ML","GIM BEEFEATER 750ML","GIM TANQUERAY","TEQUILA",
    "RUM HAVANA","ESPUMANTE LE BLANC","LICOR 43","CAMPARI","WHISKEY JAMESON 750ML",
    "VERMUTE CARPANO 950ML","APEROL","CACHAÇA SPIRAL","FERNET","BANANINHA",
    "FIREBALL","MANZA"
  ],
  "MIX ARTESANAL": [
    "SODA GINGER ALE","SODA GRAPEFRUIT","ESPUMA DE GENGIBRE","ESPUMA DE LIMÃO SICILIANO",
    "ESPUMA DE LIMÃO","MIX FRUTAS VERMELHAS"
  ],
  "PRODUÇÃO": [
    "SUCO DE LIMÃO","XAROPE DE AÇÚCAR","CAFÉ","MIX AÇÚCAR DE BAUNILHA E MARACUJÁ",
    "MIX FRUTAS VERMELHAS"
  ],
  "XAROPES": [
    "LICOR DE CAFÉ","PURE MONIN PERA 1000ML","XAROPE LICHIA","XAROPE MORANGO",
    "XAROPE MARACUJÁ","XAROPE TANGERINA","XAROPE CARAMELO","XAROPE CUCUMBER",
    "XAROPE PÊSSEGO","XAROPE FRAMBOESA","XAROPE BAUNILHA"
  ],
  "KIT BARTENDER": ["LANCHE","REFEIÇÃO","UNIFORME"]
};

// ── Regras padrão para cada item ───────────────────────
// tipo: 'bartender' | 'convidado' | 'fixo' | 'cardapio' | 'equipe'
// valor: divisor ou quantidade fixa
// min: quantidade mínima sempre levada
// soSeCardapio: true = só aparece se tiver coquetel associado

var REGRAS_ITENS_PADRAO = [
  // KIT BARTENDER
  {item:"LANCHE",        cat:"KIT BARTENDER", tipo:"equipe",    valor:1, min:1},
  {item:"REFEIÇÃO",      cat:"KIT BARTENDER", tipo:"equipe",    valor:1, min:1},
  {item:"UNIFORME",      cat:"KIT BARTENDER", tipo:"equipe",    valor:1, min:1},
  // GELO
  {item:"GELO CUBO 4KG",    cat:"GELO", tipo:"convidado", valor:5,  min:10, obs:"Ajustar por horário/temperatura"},
  {item:"GELO TRANSLÚCIDO", cat:"GELO", tipo:"convidado", valor:1,  min:0,  soSeCardapio:true},
  // ÁGUA
  {item:"ÁGUA TÔNICA",   cat:"BEBIDAS SEM ÁLCOOL", tipo:"convidado", valor:5, min:6},
  {item:"ÁGUA COM GÁS",  cat:"BEBIDAS SEM ÁLCOOL", tipo:"convidado", valor:5, min:6},
  // MATERIAL — base bartender
  {item:"TAPETE",              cat:"MATERIAL", tipo:"bartender", valor:2, min:2},
  {item:"PRATINHO PRETO",      cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"GARRAFA SOUR",        cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"GARRAFA SIMPLES",     cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"MIXING GLASS",        cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"BOWL PRETO",          cat:"MATERIAL", tipo:"bartender", valor:2, min:2},
  {item:"PÁ DE GELO",          cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"COQUETELEIRA COMPLETA",cat:"MATERIAL",tipo:"bartender", valor:2, min:2},
  {item:"FUNIL",               cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"TÁBUA DE CORTE",      cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"FACA PRETA",          cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"DOSADOR",             cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"DESCASCADOR",         cat:"MATERIAL", tipo:"bartender", valor:1, min:1, soSeCardapio:true},
  {item:"PENEIRA DE INOX - PEQUENA",cat:"MATERIAL",tipo:"bartender",valor:1,min:1},
  {item:"MINI RALO",           cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"BIQUEIRA",            cat:"MATERIAL", tipo:"bartender", valor:2, min:2},
  {item:"BAILARINA",           cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"MACERADOR",           cat:"MATERIAL", tipo:"bartender", valor:1, min:1, soSeCardapio:true},
  {item:"PINÇA",               cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"PEGADOR DE GELO",     cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"STREINER",            cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"BALDE COPA",          cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"ESCORREDOR",          cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"DETERGENTE 500ML",    cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"BUCHA AMARELA",       cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"COOLER DE REPOSIÇÃO", cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"TÉRMICA PRETA",       cat:"MATERIAL", tipo:"bartender", valor:2, min:1},
  {item:"CAIXA TÉRMICA",       cat:"MATERIAL", tipo:"fixo",      valor:2, min:2},
  {item:"SUPORTE PARA TÉRMICA",cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"CAIXA AZUL DE GELO",  cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"CUBA PRETA",          cat:"MATERIAL", tipo:"bartender", valor:2, min:1},
  {item:"LIXEIRA",             cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"RÁDIO",               cat:"MATERIAL", tipo:"equipe",    valor:1, min:1},
  {item:"TESOURA",             cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"COLHER BAILARINA",    cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"PANO DE PRATO",       cat:"MATERIAL", tipo:"bartender", valor:1, min:2},
  // DESCARTÁVEIS
  {item:"ÁLCOOL",              cat:"DESCARTÁVEIS", tipo:"fixo",      valor:1, min:1},
  {item:"GUARDANAPO",          cat:"DESCARTÁVEIS", tipo:"convidado", valor:25,min:3},
  {item:"CANUDO DE PLÁSTICO",  cat:"DESCARTÁVEIS", tipo:"convidado", valor:50,min:1},
  {item:"SACO DE LIXO",        cat:"DESCARTÁVEIS", tipo:"bartender", valor:1, min:3},
  {item:"COPO DESCARTÁVEL",    cat:"DESCARTÁVEIS", tipo:"fixo",      valor:1, min:1},
  {item:"PALITO DE ACRÍLICO",  cat:"DESCARTÁVEIS", tipo:"convidado", valor:10,min:0, soSeCardapio:true},
  // ESPECIARIAS — só se cardápio
  {item:"ANGOSTURA 200ML (RESERVA)",cat:"ESPECIARIAS",tipo:"fixo",valor:1,min:0,soSeCardapio:true},
  {item:"ANGOSTURA 50ML",      cat:"ESPECIARIAS", tipo:"bartender",valor:1,min:0, soSeCardapio:true},
  {item:"ADOÇANTE",            cat:"ESPECIARIAS", tipo:"fixo",      valor:1, min:1},
  // PRODUÇÃO
  {item:"SUCO DE LIMÃO",       cat:"PRODUÇÃO", tipo:"convidado", valor:20, min:2, obs:"Litros"},
  {item:"XAROPE DE AÇÚCAR",    cat:"PRODUÇÃO", tipo:"convidado", valor:20, min:2, obs:"Litros"},
  {item:"MIX FRUTAS VERMELHAS",cat:"PRODUÇÃO", tipo:"convidado", valor:20, min:2, soSeCardapio:true},
];

function getRegrasItens() {
  return (D.regrasItens && D.regrasItens.length) ? D.regrasItens : JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
}

// Unidades de compra vendidas em embalagem fechada — arredondar pra cima até
// o próximo múltiplo do tamanho da embalagem. UN/KG/LT/ML ficam de fora por
// serem fracionáveis (compra-se exatamente a quantidade calculada).
var UNIDADES_EMBALAGEM_FECHADA = ['CX', 'FARDO', 'PCT'];

function calcQtdItem(regra, conv, bartenders, equipeTotal) {
  var v = parseFloat(regra.valor) || 1;
  var min = parseFloat(regra.min) || 0;
  var qtd = min;
  if (regra.tipo === 'bartender') qtd = Math.max(min, bartenders * v);
  else if (regra.tipo === 'convidado') qtd = Math.max(min, Math.ceil(conv / v));
  else if (regra.tipo === 'equipe') qtd = Math.max(min, equipeTotal * v);
  else if (regra.tipo === 'fixo') qtd = Math.max(min, v);
  qtd = Math.ceil(qtd);

  // Casa com o Cadastro de Insumos pelo nome (mesmo casamento já usado no
  // Orçamento/Ref.Consumo) — se a unidade de compra for embalagem fechada,
  // fecha a quantidade no múltiplo do tamanho da embalagem.
  var insumo = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(regra.item) : null;
  if (insumo && UNIDADES_EMBALAGEM_FECHADA.indexOf(insumo.unidadeCompra) !== -1) {
    var emb = parseFloat(insumo.tamanhoEmbalagem) || 1;
    if (emb > 1) qtd = Math.ceil(qtd / emb) * emb;
  }
  return qtd;
}

// ── Módulo Regras e Cálculos ────────────────────────────

// ── Biblioteca de Itens ─────────────────────────────────
function rBiblioteca() {
  var cont = document.getElementById('regras-view-biblioteca');
  if (!cont) return;

  // Usar itens salvos ou padrão (verificar se tem chaves, não só se existe)
  var biblioteca = (D.bibliotecaItens && Object.keys(D.bibliotecaItens).length) ? D.bibliotecaItens : JSON.parse(JSON.stringify(ITENS_FOLHA));

  var html = '<div style="padding:14px 16px">' +
    '<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Gerencie a lista de itens disponíveis para seleção nas fichas de coquetéis e nas regras de proporção.</div>' +

    // Adicionar novo item
    '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px">' +
      '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Adicionar novo item</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">' +
        '<div style="flex:1;min-width:160px"><label class="lbl">Categoria</label>' +
          '<select id="bib-cat" class="inp" style="width:100%">' +
            Object.keys(biblioteca).map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('') +
          '</select>' +
        '</div>' +
        '<div style="flex:2;min-width:200px"><label class="lbl">Nome do item</label>' +
          '<input class="inp" id="bib-nome" type="text" placeholder="Ex: LIMÃO CRAVO" style="width:100%">' +
        '</div>' +
        '<button class="btn" onclick="adicionarItemBiblioteca()" style="background:var(--green);white-space:nowrap">+ Adicionar</button>' +
      '</div>' +
      '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:12px 0 6px">Nova categoria</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<input class="inp" id="bib-nova-cat" type="text" placeholder="Ex: FLORES COMESTÍVEIS" style="flex:1;min-width:200px">' +
        '<button class="btn" onclick="adicionarCategoriaBiblioteca()" style="background:var(--blue);white-space:nowrap">+ Criar categoria</button>' +
      '</div>' +
    '</div>' +

    // Lista por categoria
    '<div style="display:grid;gap:12px">';

  Object.entries(biblioteca).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">' +
      '<div style="padding:8px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">' +
        '<span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;flex:1">' + cat + ' <span style="color:var(--text3);font-weight:400">(' + itens.length + ' itens)</span></span>' +
        '<button class="btn-sm btn-red" onclick="excluirCat(this)" data-cat="' + cat + '" title="Excluir categoria inteira">🗑️ Cat.</button>' +
      '</div>' +
      '<div style="padding:8px;display:flex;flex-wrap:wrap;gap:6px">' +
        itens.map(function(item) {
          return '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--bg4);border:1px solid var(--border2);border-radius:20px;padding:3px 10px;font-size:11px;color:var(--text2)">' +
            item +
            '<button onclick="excluirBibItem(this)" data-cat="' + cat + '" data-item="' + item + '" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px;padding:0;margin-left:2px;line-height:1" title="Remover">×</button>' +
          '</span>';
        }).join('') +
      '</div>' +
    '</div>';
  });

  html += '</div></div>';
  cont.innerHTML = html;
}

function adicionarItemBiblioteca() {
  var cat = document.getElementById('bib-cat')?.value;
  var nome = (document.getElementById('bib-nome')?.value||'').trim().toUpperCase();
  if (!cat || !nome) { alert('Preencha categoria e nome.'); return; }

  if (!D.bibliotecaItens) D.bibliotecaItens = JSON.parse(JSON.stringify(ITENS_FOLHA));
  if (!D.bibliotecaItens[cat]) D.bibliotecaItens[cat] = [];
  if (D.bibliotecaItens[cat].includes(nome)) { alert('Item já existe nesta categoria.'); return; }
  D.bibliotecaItens[cat].push(nome);
  D.bibliotecaItens[cat].sort();
  sv('bibliotecaItens');
  document.getElementById('bib-nome').value = '';
  rBiblioteca();
}

function adicionarCategoriaBiblioteca() {
  var nome = (document.getElementById('bib-nova-cat')?.value||'').trim().toUpperCase();
  if (!nome) { alert('Digite o nome da categoria.'); return; }
  if (!D.bibliotecaItens) D.bibliotecaItens = JSON.parse(JSON.stringify(ITENS_FOLHA));
  if (D.bibliotecaItens[nome]) { alert('Categoria já existe.'); return; }
  D.bibliotecaItens[nome] = [];
  sv('bibliotecaItens');
  document.getElementById('bib-nova-cat').value = '';
  rBiblioteca();
}

function excluirItemBiblioteca(cat, item) {
  if (!confirm('Remover "' + item + '" de ' + cat + '?')) return;
  if (!D.bibliotecaItens) D.bibliotecaItens = JSON.parse(JSON.stringify(ITENS_FOLHA));
  D.bibliotecaItens[cat] = (D.bibliotecaItens[cat]||[]).filter(function(i){return i!==item;});
  sv('bibliotecaItens');
  rBiblioteca();
}

function excluirCategoria(cat) {
  if (!confirm('Excluir a categoria inteira "' + cat + '" e todos seus itens?')) return;
  if (!D.bibliotecaItens) D.bibliotecaItens = JSON.parse(JSON.stringify(ITENS_FOLHA));
  delete D.bibliotecaItens[cat];
  sv('bibliotecaItens');
  rBiblioteca();
}


function excluirCat(btn) {
  var cat = btn.dataset.cat;
  excluirCategoria(cat);
}
function excluirBibItem(btn) {
  var cat = btn.dataset.cat;
  var item = btn.dataset.item;
  excluirItemBiblioteca(cat, item);
}
function getBiblioteca() {
  return D.bibliotecaItens && Object.keys(D.bibliotecaItens).length
    ? D.bibliotecaItens
    : JSON.parse(JSON.stringify(ITENS_FOLHA));
}


function initRegras() {
  if (!D.fichas) D.fichas = [];
  if (!D.regrasItens) D.regrasItens = [];
if (!D.bibliotecaItens) D.bibliotecaItens = {};
if (!D.produtos) D.produtos = [];
  setRegrasView('fichas');
}

function setRegrasView(v) {
  ['fichas','proporcoes','nova-ficha','biblioteca','copos','precos'].forEach(function(x) {
    var el = document.getElementById('regras-view-' + x);
    if (el) el.style.display = x === v ? '' : 'none';
    var btn = document.getElementById('regras-tab-' + x);
    if (btn) btn.classList.toggle('active', x === v);
  });
  if (v === 'fichas') rFichas();
  if (v === 'proporcoes') rProporcoes();
  if (v === 'nova-ficha') rFormFicha();
  if (v === 'biblioteca') rBiblioteca();
  if (v === 'copos') rCopos();
  if (v === 'precos') rPrecosOrcamento();
}

// ── Fichas de Coquetéis ─────────────────────────────────
function rFichas() {
  var cont = document.getElementById('fichas-body');
  if (!cont) return;
  var fichas = D.fichas || [];
  if (!fichas.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhuma ficha cadastrada.<br>Cadastre seus coquetéis para que a separação seja preenchida automaticamente.</div>';
    return;
  }
  cont.innerHTML = fichas.map(function(f) {
    var porCat = {};
    (f.itens||[]).forEach(function(i) { if(!porCat[i.cat]) porCat[i.cat]=[]; porCat[i.cat].push(i.nome); });
    return '<div class="sec" style="margin-bottom:10px">' +
      '<div class="sec-head" style="display:flex;align-items:center;gap:10px">' +
        '<span class="sec-title">🍹 ' + f.nome + '</span>' +
        (f.variantes ? '<span style="color:var(--text3);font-size:11px">' + f.variantes + '</span>' : '') +
        '<div style="margin-left:auto;display:flex;gap:6px">' +
          '<button class="btn-sm" style="background:var(--blue)" onclick="editarFicha(\'' + f.id + '\')">✏️ Editar</button>' +
          '<button class="btn-sm btn-red" onclick="excluirFicha(\'' + f.id + '\')">Excluir</button>' +
        '</div>' +
      '</div>' +
      '<div style="padding:8px 16px;display:flex;flex-wrap:wrap;gap:12px;font-size:11px">' +
        Object.entries(porCat).map(function(e) {
          return '<div><span style="color:var(--text3);font-weight:600">' + e[0] + ':</span> ' + e[1].join(', ') + '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }).join('');
}

function rFormFicha(fichaExistente) {
  var cont = document.getElementById('regras-view-nova-ficha');
  if (!cont) return;
  var f = fichaExistente || { nome:'', variantes:'', itens:[] };
  var itensIds = new Set((f.itens||[]).map(function(i){return i.cat+'|'+i.nome;}));

  // Itens da ficha existente que não estão na nova lista filtrada
  var itensFicha = getItensFicha();
  var todosItensNovos = new Set();
  Object.entries(itensFicha).forEach(function(e){ e[1].forEach(function(i){ todosItensNovos.add(e[0]+'|'+i); }); });
  var itensExtras = fichaExistente ? (fichaExistente.itens||[]).filter(function(i){ return !todosItensNovos.has(i.cat+'|'+i.nome); }) : [];

  var html = '<div class="sec"><div class="sec-head">' +
    '<span class="sec-title">' + (fichaExistente ? '✏️ Editar Ficha' : '+ Nova Ficha de Coquetel') + '</span>' +
    '<button class="btn-sm" onclick="setRegrasView(\'fichas\')" style="margin-left:auto">← Voltar</button>' +
    '</div><div style="padding:14px 16px">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">' +
      '<div><label class="lbl">Nome do Coquetel *</label>' +
        '<input class="inp" id="fc-nome" type="text" placeholder="Ex: FITZGERALD" value="' + f.nome + '" style="text-transform:uppercase"></div>' +
      '<div><label class="lbl">Variantes / Aliases</label>' +
        '<input class="inp" id="fc-variantes" type="text" placeholder="Ex: FITZ, FITZGERAL" value="' + (f.variantes||'') + '">' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px">Nomes alternativos separados por vírgula</div></div>' +
    '</div>' +
    '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Marque os itens que este coquetel precisa</div>' +
    '<div id="fc-itens-container">';

  Object.entries(getItensFicha()).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    html += '<div style="margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
      itens.map(function(item) {
        var checked = itensIds.has(cat+'|'+item) ? 'checked' : '';
        return '<label style="display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;background:var(--bg3);padding:3px 8px;border-radius:var(--radius);border:1px solid var(--border)">' +
          '<input type="checkbox" data-cat="' + cat + '" data-nome="' + item + '" ' + checked + ' style="cursor:pointer"> ' + item + '</label>';
      }).join('') +
      '</div></div>';
  });

  html += '</div>' +
    '<div style="margin-top:8px">' +
      '<label class="lbl" style="display:block;margin-bottom:4px">Item personalizado</label>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">' +
        '<select id="fc-custom-cat" class="inp" style="width:180px">' +
          Object.keys(getItensFicha()).map(function(cat){return '<option value="'+cat+'">'+cat+'</option>';}).join('') +
        '</select>' +
        '<input class="inp" id="fc-custom-nome" type="text" placeholder="Nome do item" style="flex:1;min-width:150px">' +
        '<button class="btn" onclick="adicionarItemCustom()" style="background:var(--blue)">+ Adicionar</button>' +
      '</div>' +
      '<div id="fc-custom-lista" style="display:flex;flex-wrap:wrap;gap:6px"></div>' +
    '</div>' +
    // Itens extras (já na ficha mas fora da lista atual)
    (itensExtras.length ? 
      '<div style="margin-top:14px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:10px 12px">' +
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Itens já associados (fora das categorias padrão)</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
        itensExtras.map(function(item) {
          return '<label style="display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;background:var(--bg4);padding:3px 8px;border-radius:var(--radius);border:1px solid var(--blue-dim)">' +
            '<input type="checkbox" data-cat="' + item.cat + '" data-nome="' + item.nome + '" checked style="cursor:pointer"> ' +
            '<span style="color:var(--text3)">' + item.cat + ':</span> ' + item.nome + '</label>';
        }).join('') +
        '</div>' +
      '</div>'
    : '') +
    '<div style="display:flex;gap:8px;margin-top:16px">' +
      '<button class="btn" id="pf-btn-salvar-ficha" onclick="salvarFicha(\'' + (fichaExistente ? fichaExistente.id : '') + '\')" style="background:var(--green)">💾 Salvar Ficha</button>' +
      '<button class="btn" onclick="setRegrasView(\'fichas\')" style="background:var(--bg3);color:var(--text)">Cancelar</button>' +
    '</div></div></div>';

  cont.innerHTML = html;
  window._customItens = [];

  if (fichaExistente) {
    var todosItens = new Set(Object.entries(ITENS_FOLHA).flatMap(function(e){return e[1].map(function(i){return e[0]+'|'+i;});}));
    (fichaExistente.itens||[]).filter(function(i){return !todosItens.has(i.cat+'|'+i.nome);}).forEach(function(i){
      adicionarTagCustom(i.cat, i.nome);
    });
  }
}

if (!window._customItens) window._customItens = [];

function adicionarItemCustom() {
  var cat = document.getElementById('fc-custom-cat')?.value;
  var nome = (document.getElementById('fc-custom-nome')?.value||'').trim().toUpperCase();
  if (!nome) return;
  adicionarTagCustom(cat, nome);
  document.getElementById('fc-custom-nome').value = '';
}

function adicionarTagCustom(cat, nome) {
  var id = 'cx'+Date.now()+Math.random().toString(36).slice(2);
  window._customItens.push({id:id, cat:cat, nome:nome});
  var cont = document.getElementById('fc-custom-lista');
  if (!cont) return;
  var tag = document.createElement('span');
  tag.style.cssText = 'display:inline-flex;align-items:center;gap:5px;background:var(--blue-bg);border:1px solid var(--blue-dim);color:var(--blue);padding:3px 10px;border-radius:20px;font-size:11px';
  tag.dataset.id = id;
  tag.innerHTML = cat + ': ' + nome + ' <span style="cursor:pointer;font-weight:700" onclick="removerCustom(\'' + id + '\',this.parentElement)">×</span>';
  cont.appendChild(tag);
}

function removerCustom(id, el) {
  window._customItens = (window._customItens||[]).filter(function(x){return x.id!==id;});
  if (el) el.remove();
}

function salvarFicha(idExistente) {
  var nome = (document.getElementById('fc-nome')?.value||'').trim().toUpperCase();
  if (!nome) { alert('Preencha o nome do coquetel.'); return; }
  var variantes = (document.getElementById('fc-variantes')?.value||'').trim();
  var itens = [];
  document.querySelectorAll('#fc-itens-container input[type="checkbox"]:checked').forEach(function(cb){
    itens.push({cat:cb.dataset.cat, nome:cb.dataset.nome});
  });
  (window._customItens||[]).forEach(function(i){itens.push({cat:i.cat, nome:i.nome});});
  if (!D.fichas) D.fichas = [];
  if (idExistente) {
    var idx = D.fichas.findIndex(function(f){return f.id===idExistente;});
    if (idx>=0) D.fichas[idx] = {id:idExistente, nome:nome, variantes:variantes, itens:itens};
  } else {
    D.fichas.push({id:_gerarId('FIC'), nome:nome, variantes:variantes, itens:itens, criadoEm:new Date().toISOString()});
  }
  window._customItens = [];
  sv('fichas');
  alert('Ficha salva!');
  setRegrasView('fichas');
}

function editarFicha(id) {
  var f = (D.fichas||[]).find(function(x){return x.id===id;});
  if (!f) return;
  window._customItens = [];
  setRegrasView('nova-ficha');
  setTimeout(function(){rFormFicha(f);}, 50);
}

function excluirFicha(id) {
  if (!confirm('Excluir esta ficha?')) return;
  D.fichas = (D.fichas||[]).filter(function(f){return f.id!==id;});
  sv('fichas'); rFichas();
}

// ── Regras de Proporção ─────────────────────────────────
function rProporcoes() {
  var cont = document.getElementById('regras-prop-body');
  if (!cont) return;
  var regras = getRegrasItens();

  var porCat = {};
  regras.forEach(function(r) {
    if (!porCat[r.cat]) porCat[r.cat] = [];
    porCat[r.cat].push(r);
  });

  var html = '<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Defina como cada item é calculado. As quantidades são geradas automaticamente na folha de separação.</div>';

  Object.entries(porCat).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    html += '<div style="margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:2px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:grid;gap:6px">';

    itens.forEach(function(r, idx) {
      var ri = regras.indexOf(r);
      html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:grid;grid-template-columns:180px 1fr 80px 80px 80px;gap:8px;align-items:center;font-size:11px">' +
        '<span style="color:var(--text);font-weight:500">' + r.item + '</span>' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          '<select onchange="atualizarRegra(' + ri + ',\'tipo\',this.value)" style="font-size:10px;padding:3px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
            ['bartender','convidado','equipe','fixo'].map(function(t){
              return '<option value="'+t+'"'+(r.tipo===t?' selected':'')+'>'+t+'</option>';
            }).join('') +
          '</select>' +
          '<span style="color:var(--text3);font-size:10px">' +
            (r.tipo==='bartender'?'× bartenders':r.tipo==='convidado'?'÷ convidados':r.tipo==='equipe'?'× equipe':'fixo') +
          '</span>' +
        '</div>' +
        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">VALOR</div>' +
          '<input type="number" value="' + r.valor + '" min="0" step="0.5" style="width:100%;font-size:11px;padding:3px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center" onchange="atualizarRegra(' + ri + ',\'valor\',parseFloat(this.value))">' +
        '</div>' +
        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">MÍNIMO</div>' +
          '<input type="number" value="' + r.min + '" min="0" style="width:100%;font-size:11px;padding:3px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center" onchange="atualizarRegra(' + ri + ',\'min\',parseFloat(this.value))">' +
        '</div>' +
        '<div style="text-align:center">' +
          '<label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">SÓ C/ COQUET.</label>' +
          '<input type="checkbox" ' + (r.soSeCardapio?'checked':'') + ' onchange="atualizarRegra(' + ri + ',\'soSeCardapio\',this.checked)" style="cursor:pointer">' +
        '</div>' +
      '</div>';
    });

    html += '</div></div>';
  });

  // Botão para adicionar item personalizado
  html += '<div style="margin-top:8px;display:flex;gap:8px">' +
    '<button class="btn" onclick="adicionarItemRegra()" style="background:var(--blue)">+ Novo Item</button>' +
    '<button class="btn" onclick="salvarRegrasItens()" style="background:var(--green)">💾 Salvar Regras</button>' +
    '<button class="btn" onclick="resetarRegras()" style="background:var(--red-dim);color:var(--red)">↺ Restaurar Padrão</button>' +
  '</div>';

  cont.innerHTML = html;
}

function atualizarRegra(idx, campo, valor) {
  var regras = getRegrasItens();
  if (!D.regrasItens || !D.regrasItens.length) D.regrasItens = JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
  if (D.regrasItens[idx]) D.regrasItens[idx][campo] = valor;
}

function salvarRegrasItens() {
  sv('regrasItens');
  alert('Regras salvas!');
}

function resetarRegras() {
  if (!confirm('Restaurar todas as regras para o padrão?')) return;
  D.regrasItens = JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
  sv('regrasItens');
  rProporcoes();
}

function adicionarItemRegra() {
  var nome = prompt('Nome do item:');
  if (!nome) return;
  var cat = prompt('Categoria (ex: MATERIAL, ESPECIARIAS, PRODUÇÃO):') || 'MATERIAL';
  if (!D.regrasItens || !D.regrasItens.length) D.regrasItens = JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
  D.regrasItens.push({item:nome.toUpperCase(), cat:cat.toUpperCase(), tipo:'fixo', valor:1, min:1, soSeCardapio:false});
  rProporcoes();
}

// ── Preços do Orçamento (Local, Condicional, Insumos, Perda, Seguro, Vasilhames) ──
// Estes valores alimentam os itens "auto" da Calculadora de Orçamento (orcCalc.js).
// getOrcPrecos() (definida em orcCalc.js) mescla D.orcPrecos por cima dos padrões.

function _ensureOrcPrecos() {
  if (!D.orcPrecos || !Object.keys(D.orcPrecos).length) {
    D.orcPrecos = JSON.parse(JSON.stringify(getOrcPrecos()));
  }
  return D.orcPrecos;
}

function atualizarPrecoLocal(localKey, campo, valor) {
  var p = _ensureOrcPrecos();
  if (!p.locais[localKey]) p.locais[localKey] = {};
  p.locais[localKey][campo] = (campo === 'label') ? valor : (parseFloat(valor) || 0);
  if (campo !== 'label') p.locais[localKey].aproximado = false; // ela confirmou o valor
}

function atualizarPrecoFator(grupo, chave, valor) {
  var p = _ensureOrcPrecos();
  if (!p[grupo]) p[grupo] = {};
  p[grupo][chave] = parseFloat(valor) || 0;
}

function atualizarPrecoDesc(valor) {
  var p = _ensureOrcPrecos();
  p.desc = parseFloat(valor) || 0;
}

function salvarPrecosOrcamento() {
  _ensureOrcPrecos();
  sv('orcPrecos');
  alert('Preços do orçamento salvos!');
}

function resetarPrecosOrcamento() {
  if (!confirm('Restaurar todos os preços do orçamento para o padrão?')) return;
  D.orcPrecos = {};
  sv('orcPrecos');
  rPrecosOrcamento();
}

function rPrecosOrcamento() {
  var cont = document.getElementById('regras-view-precos');
  if (!cont) return;
  var precos = getOrcPrecos();

  // bt/bb/hb/cd/cp (preço de equipe) saíram daqui — vêm do Cadastro de
  // Cargos agora. Só Refrigério/Limpeza/Carregamento continuam editáveis
  // nesta tela (não fazem parte do Cadastro de Cargos).
  var colsLocais = [
    ['rf','Refrigério'],['la','Limpeza'],['ca','Carregamento'],
  ];

  var htmlLocais = '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">📍 Preços por Local (Refrigério, Limpeza, Carregamento)</span></div>' +
    '<div style="padding:12px 16px;overflow-x:auto">' +
    '<table style="width:100%;border-collapse:collapse;font-size:11px">' +
    '<thead><tr style="color:var(--text3);text-transform:uppercase;font-size:9px">' +
      '<th style="text-align:left;padding:4px 8px">Local</th>' +
      colsLocais.map(function(c){ return '<th style="text-align:center;padding:4px 6px">'+c[1]+'</th>'; }).join('') +
    '</tr></thead><tbody>' +
    Object.entries(precos.locais).map(function(entry) {
      var key = entry[0], v = entry[1];
      return '<tr style="border-top:1px solid var(--border)' + (v.aproximado ? ';background:rgba(247,195,90,.06)' : '') + '">' +
        '<td style="padding:6px 8px"><input type="text" value="' + (v.label||'') + '" ' +
          'onchange="atualizarPrecoLocal(\'' + key + '\',\'label\',this.value)" ' +
          'style="width:170px;font-size:11px;padding:3px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
          (v.aproximado ? ' <span title="Valor trazido de uma faixa antiga de km diferente — confira" style="color:var(--amber);font-size:9px">⚠️ aproximado</span>' : '') +
        '</td>' +
        colsLocais.map(function(c) {
          return '<td style="padding:4px 4px"><input type="number" value="' + (v[c[0]]!=null?v[c[0]]:0) + '" step="1" ' +
            'onchange="atualizarPrecoLocal(\'' + key + '\',\'' + c[0] + '\',this.value)" ' +
            'style="width:70px;text-align:right;font-size:11px;padding:3px 5px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)"></td>';
        }).join('') +
      '</tr>';
    }).join('') +
    '</tbody></table></div></div>';

  // Preço de equipe (bt/bb/hb/cd/cp) — somente leitura, vem do Cadastro de Cargos.
  var htmlPrecoEquipe = '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">👥 Preço de Equipe por Local</span>' +
      '<button class="btn-sm" style="margin-left:auto;background:var(--blue)" onclick="go(\'cargos\')">✏️ Editar em Cadastro → Cargos</button>' +
    '</div>' +
    '<div style="padding:12px 16px;overflow-x:auto">' +
    '<div style="font-size:10px;color:var(--text3);margin-bottom:8px">Somente leitura — para alterar, use o Cadastro → Cargos.</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:11px">' +
    '<thead><tr style="color:var(--text3);text-transform:uppercase;font-size:9px">' +
      '<th style="text-align:left;padding:4px 8px">Local</th>' +
      (typeof _CARGOS_DEF !== 'undefined' ? _CARGOS_DEF.map(function(c){ return '<th style="text-align:center;padding:4px 6px">'+c.nome+'</th>'; }).join('') : '') +
    '</tr></thead><tbody>' +
    (typeof REGIOES_LOCAL !== 'undefined' && typeof _CARGOS_DEF !== 'undefined' ? REGIOES_LOCAL.map(function(r) {
      return '<tr style="border-top:1px solid var(--border)">' +
        '<td style="padding:6px 8px;color:var(--text)">' + r.label + '</td>' +
        _CARGOS_DEF.map(function(c) {
          var cargo = (typeof buscarCargoPorKey === 'function') ? buscarCargoPorKey(c.key) : null;
          var pr = (cargo && cargo.porRegiao && cargo.porRegiao[r.key]) || {};
          return '<td style="padding:4px 6px;text-align:center;font-family:var(--mono);color:var(--text2)">' + (pr.precoOrcamento ? fR(pr.precoOrcamento) : '—') + '</td>';
        }).join('') +
      '</tr>';
    }).join('') : '') +
    '</tbody></table></div></div>';

  function bloco(titulo, grupo, labels) {
    return '<div class="sec" style="margin-bottom:14px">' +
      '<div class="sec-head"><span class="sec-title">' + titulo + '</span></div>' +
      '<div style="padding:12px 16px;display:flex;gap:16px;flex-wrap:wrap">' +
      Object.keys(precos[grupo]).map(function(k) {
        return '<div><label style="font-size:9px;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">' + (labels[k]||k) + '</label>' +
          '<input type="number" value="' + precos[grupo][k] + '" step="0.01" ' +
          'onchange="atualizarPrecoFator(\'' + grupo + '\',\'' + k + '\',this.value)" ' +
          'style="width:100px;font-size:12px;padding:5px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)"></div>';
      }).join('') +
      '</div></div>';
  }

  var htmlCond  = bloco('⚖️ Condicional (por convidado)',                    'cond',  { padrao:'Padrão', simples:'Simples' });
  var htmlCI    = bloco('🧴 Cobertura de Insumos (por convidado)',            'ci',    { normal:'Normal', reduzido:'Reduzido' });
  var htmlPerda = bloco('📉 Previsão de Perda (por convidado)',               'perda', { reduzida:'Reduzida', padrao:'Padrão', alta:'Alta' });
  var htmlSeg   = bloco('🛡️ Seguro (por convidado, por tipo de evento)',      'seg',   { casamento:'Casamento', '15anos':'15 Anos', formatura:'Formatura', outros:'Outros' });
  var htmlVas   = bloco('🥂 Vasilhames (valor fixo, por complexidade)',       'vas',   { simples:'Simples', padrao:'Padrão', complexo:'Complexo' });

  var htmlDesc = '<div class="sec" style="margin-bottom:14px">' +
    '<div class="sec-head"><span class="sec-title">🗑️ Descartáveis (por convidado)</span></div>' +
    '<div style="padding:12px 16px">' +
    '<input type="number" value="' + precos.desc + '" step="0.01" onchange="atualizarPrecoDesc(this.value)" ' +
    'style="width:100px;font-size:12px;padding:5px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
    '</div></div>';

  cont.innerHTML =
    '<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Esses valores preenchem automaticamente os itens do orçamento (Bartender, Carregamento, Seguro etc.) conforme o Local, Tipo de Evento e Complexidade escolhidos na Calculadora de Orçamento.</div>' +
    htmlPrecoEquipe + htmlLocais + htmlCond + htmlDesc + htmlCI + htmlPerda + htmlSeg + htmlVas +
    '<div style="display:flex;gap:8px">' +
      '<button class="btn" onclick="salvarPrecosOrcamento()" style="background:var(--green)">💾 Salvar Preços</button>' +
      '<button class="btn" onclick="resetarPrecosOrcamento()" style="background:var(--red-dim);color:var(--red)">↺ Restaurar Padrão</button>' +
    '</div>';
}

// ── Cruzar cardápio com fichas ──────────────────────────
function cruzarCardapioComFichas(cardapioTexto) {
  if (!cardapioTexto || !(D.fichas||[]).length) return {};
  // resultado[cat][item] = { count, coqueteis: ['FITZGERALD', 'NEGRONI', ...] }
  var resultado = {};
  var linhas = cardapioTexto.split('\n').filter(Boolean);
  linhas.forEach(function(linha) {
    var linhaNorm = linha.toUpperCase().replace(/[-•*]/g,'').trim();
    (D.fichas||[]).forEach(function(ficha) {
      var nomes = [ficha.nome].concat((ficha.variantes||'').split(',').map(function(v){return v.trim();})).filter(Boolean);
      var encontrou = nomes.some(function(n){ return linhaNorm.includes(n.toUpperCase()); });
      if (encontrou && ficha.itens) {
        ficha.itens.forEach(function(item) {
          if (!resultado[item.cat]) resultado[item.cat] = {};
          if (!resultado[item.cat][item.nome]) resultado[item.cat][item.nome] = { count: 0, coqueteis: [] };
          resultado[item.cat][item.nome].count++;
          if (!resultado[item.cat][item.nome].coqueteis.includes(ficha.nome)) {
            resultado[item.cat][item.nome].coqueteis.push(ficha.nome);
          }
        });
      }
    });
  });
  return resultado;
}

// ── Regras de Copos ─────────────────────────────────────
function rCopos() {
  var el = document.getElementById('regras-view-copos');
  if (!el) return;

  var rc         = D.regrasCopos || {};
  var fatorBase  = rc.fatorBase  != null ? rc.fatorBase  : 2;
  var fatorExtra = rc.fatorExtra != null ? rc.fatorExtra : 0.5;
  var prevConv   = rc.prevConv   || 100;

  // Coleta copos das fichas
  var copoPorFicha = {};
  (D.fichas||[]).forEach(function(f) {
    (f.itens||[]).forEach(function(item) {
      if (item.cat === 'COPOS E TAÇAS') {
        if (!copoPorFicha[item.nome]) copoPorFicha[item.nome] = [];
        if (copoPorFicha[item.nome].indexOf(f.nome) === -1) copoPorFicha[item.nome].push(f.nome);
      }
    });
  });
  // Inclui produtos da categoria ainda sem ficha
  (D.produtos||[]).filter(function(p) {
    return p.categoria === 'COPOS E TAÇAS' || p.categoria === 'COPOS/TAÇAS';
  }).forEach(function(p) {
    if (!copoPorFicha[p.nome]) copoPorFicha[p.nome] = [];
  });

  var nomes = Object.keys(copoPorFicha).sort();

  if (!nomes.length) {
    el.innerHTML = '<div class="sec"><div class="sec-head"><span class="sec-title">🥂 Regras de Copos</span></div>' +
      '<div style="padding:20px;color:var(--text3)">Cadastre produtos na categoria COPOS E TAÇAS ou inclua copos nas Fichas de Coquetéis para configurar as regras.</div></div>';
    return;
  }

  var rows = nomes.map(function(nome) {
    var fichas = copoPorFicha[nome] || [];
    var prod   = (D.produtos||[]).find(function(p){ return p.nome === nome; });
    var emb    = (prod && prod.tamanhoEmbalagem > 1) ? prod.tamanhoEmbalagem : 1;
    var nF     = fichas.length;
    var fator  = fatorBase + Math.max(0, nF - 1) * fatorExtra;
    var qtd    = Math.ceil(prevConv * fator);
    var cx     = emb > 1 ? Math.ceil(qtd / emb) : null;

    var tags = nF
      ? fichas.map(function(f){ return '<span style="display:inline-block;margin:1px 2px;font-size:9px;padding:1px 7px;border-radius:8px;background:rgba(79,142,247,.12);border:1px solid rgba(79,142,247,.3);color:#4F8EF7">' + f + '</span>'; }).join('')
      : '<span style="font-size:9px;color:var(--text3)">sem ficha</span>';

    return '<tr style="border-bottom:1px solid var(--border)">' +
      '<td style="padding:8px 12px;font-weight:500;color:var(--text)">' + nome + '</td>' +
      '<td style="padding:8px 10px;line-height:1.8">' + tags + '</td>' +
      '<td style="padding:8px 12px;text-align:center;font-family:var(--mono);font-size:12px;color:var(--text2)">' + nF + '</td>' +
      '<td style="padding:8px 12px;text-align:center;font-family:var(--mono);font-size:12px;color:var(--text2)">' + fator.toFixed(1) + '/conv.</td>' +
      '<td style="padding:8px 12px;text-align:center;font-size:11px;color:var(--text3)">' + (emb > 1 ? emb + ' uni/cx' : '—') + '</td>' +
      '<td style="padding:8px 12px;text-align:right;font-family:var(--mono);font-size:12px;color:var(--text2)">' + qtd + ' uni</td>' +
      '<td style="padding:8px 12px;text-align:right;font-weight:700;color:#4F8EF7;font-family:var(--mono)">' + (cx != null ? cx + ' cx' : '—') + '</td>' +
    '</tr>';
  }).join('');

  el.innerHTML =
    '<div class="sec" style="margin-bottom:12px">' +
      '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center">' +
        '<span class="sec-title">🥂 Regras de Copos</span>' +
        '<button class="btn btn-primary btn-sm" onclick="salvarRegrasCopos()">Salvar regras</button>' +
      '</div>' +
      '<div style="padding:14px 16px">' +
        '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">' +
          'Fórmula: <strong>fator = base + (nº de coquetéis − 1) × extra</strong> · qtd = teto(convidados × fator) · caixas = teto(qtd ÷ embalagem)' +
        '</div>' +
        '<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">' +
          '<div>' +
            '<label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:4px">Base / convidado (mínimo)</label>' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<input id="rc-fator-base" type="number" step="0.5" min="0.5" value="' + fatorBase + '" ' +
                'style="width:70px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:13px;font-family:var(--mono);text-align:center">' +
              '<span style="font-size:11px;color:var(--text3)">uni/conv.</span>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:4px">Extra por coquetel adicional</label>' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<input id="rc-fator-extra" type="number" step="0.25" min="0" value="' + fatorExtra + '" ' +
                'style="width:70px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:13px;font-family:var(--mono);text-align:center">' +
              '<span style="font-size:11px;color:var(--text3)">uni/conv. a mais</span>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:4px">Prévia para</label>' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<input id="rc-prev-conv" type="number" step="10" min="10" value="' + prevConv + '" onchange="rCopos()" ' +
                'style="width:70px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:13px;font-family:var(--mono);text-align:center">' +
              '<span style="font-size:11px;color:var(--text3)">convidados</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="sec">' +
      '<div class="sec-head"><span class="sec-title">Prévia para ' + prevConv + ' convidados</span></div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:12px">' +
        '<thead><tr style="font-size:9px;text-transform:uppercase;color:var(--text3);border-bottom:2px solid var(--border)">' +
          '<th style="padding:7px 12px;text-align:left;font-weight:600">Copo / Taça</th>' +
          '<th style="padding:7px 10px;text-align:left;font-weight:600">Coquetéis associados</th>' +
          '<th style="padding:7px 12px;text-align:center;font-weight:600">Nº fichas</th>' +
          '<th style="padding:7px 12px;text-align:center;font-weight:600">Fator</th>' +
          '<th style="padding:7px 12px;text-align:center;font-weight:600">Embalagem</th>' +
          '<th style="padding:7px 12px;text-align:right;font-weight:600">Unidades</th>' +
          '<th style="padding:7px 12px;text-align:right;font-weight:600">Caixas</th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
    '</div>';
}

function salvarRegrasCopos() {
  if (!D.regrasCopos) D.regrasCopos = {};
  var base  = parseFloat(document.getElementById('rc-fator-base')  ? document.getElementById('rc-fator-base').value  : 2)  || 2;
  var extra = parseFloat(document.getElementById('rc-fator-extra') ? document.getElementById('rc-fator-extra').value : 0.5) || 0;
  var prev  = parseInt(document.getElementById('rc-prev-conv')  ? document.getElementById('rc-prev-conv').value  : 100) || 100;
  D.regrasCopos.fatorBase  = base;
  D.regrasCopos.fatorExtra = extra;
  D.regrasCopos.prevConv   = prev;
  sv('regrasCopos');
  rCopos();
  alert2('Regras de copos salvas!');
}

