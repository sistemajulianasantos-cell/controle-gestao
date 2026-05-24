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

function calcQtdItem(regra, conv, bartenders, equipeTotal) {
  var v = parseFloat(regra.valor) || 1;
  var min = parseFloat(regra.min) || 0;
  var qtd = min;
  if (regra.tipo === 'bartender') qtd = Math.max(min, bartenders * v);
  else if (regra.tipo === 'convidado') qtd = Math.max(min, Math.ceil(conv / v));
  else if (regra.tipo === 'equipe') qtd = Math.max(min, equipeTotal * v);
  else if (regra.tipo === 'fixo') qtd = Math.max(min, v);
  return Math.ceil(qtd);
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
  ['fichas','proporcoes','nova-ficha','biblioteca'].forEach(function(x) {
    var el = document.getElementById('regras-view-' + x);
    if (el) el.style.display = x === v ? '' : 'none';
    var btn = document.getElementById('regras-tab-' + x);
    if (btn) btn.classList.toggle('active', x === v);
  });
  if (v === 'fichas') rFichas();
  if (v === 'proporcoes') rProporcoes();
  if (v === 'nova-ficha') rFormFicha();
  if (v === 'biblioteca') rBiblioteca();
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
    D.fichas.push({id:'FIC'+Date.now(), nome:nome, variantes:variantes, itens:itens, criadoEm:new Date().toISOString()});
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

