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
    "CANECA DE COBRE","COPO BAIXO TIMELLES","COPO LONGO REVEL",
    "COPO LONGO ELYSIA","COPO BAIXO ELYSIA","TAÇA COUPE TIMELESS",
    "TUBO DE ENSAIO","TAÇA CALISE AMERICA","COPO LONGO LISO NOVO","COPO WHISKY ELYSIA",
    "COPO WHISKY LISO","COPO WHISKEY TIMELESS","COPO LONGO XTRA","COPO BAIXO XTRA",
    "COPO LONGO LISO VELHO","COPO BLOOD MARY","TAÇA BRUNELLO","TAÇA COUPE AMÉRICA",
    "TAÇA MARTINI AMERICA","TAÇA XTRA"
  ],
  "HORTIFRUTI": [
    "LIMÃO TAITI","LIMÃO SICILIANO","MORANGO","GRAPEFRUIT","LARANJA BAHIA",
    "UVA VERDE","HORTELÃ","MANJERICÃO","ALECRIM","TOMILHO","PEPINO",
    "FLOR COMESTÍVEL","MARACUJÁ","PERA","MAÇÃ VERDE","CASCA DE LIMÃO"
  ],
  "ESPECIARIAS": [
    "BITTER ANGOSTURA - 200ML (RESERVA)","ANGOSTURA 50ML","SAL DE PÁPRICAS",
    "BITTER DE LARANJA","EMULSIFICANTE","INFUSÃO","DESIDRATADOS"
  ],
  "MIX ARTESANAL": [
    "SODA GINGER ALE","SODA GRAPEFRUIT","ESPUMA DE GENGIBRE","ESPUMA DE LIMÃO SICILIANO",
    "ESPUMA DE LIMÃO","MIX FRUTAS VERMELHAS"
  ],
  "PRODUÇÃO": [
    "SUCO DE LIMÃO","XAROPE DE AÇUCAR","CAFÉ","MIX AÇÚCAR DE BAUNILHA E MARACUJÁ",
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
    "CANECA DE COBRE","COPO BAIXO TIMELLES","COPO LONGO REVEL",
    "COPO LONGO ELYSIA","COPO BAIXO ELYSIA","TAÇA COUPE TIMELESS",
    "TUBO DE ENSAIO","TAÇA CALISE AMERICA","COPO LONGO LISO NOVO","COPO WHISKY ELYSIA",
    "COPO WHISKY LISO","COPO WHISKEY TIMELESS","COPO LONGO XTRA","COPO BAIXO XTRA",
    "COPO LONGO LISO VELHO","COPO BLOOD MARY","TAÇA BRUNELLO","TAÇA COUPE AMÉRICA",
    "TAÇA MARTINI AMERICA","TAÇA XTRA"
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
    "BITTER ANGOSTURA - 200ML (RESERVA)","ANGOSTURA 50ML","ADOÇANTE","SAL DE PÁPRICAS",
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
    "SUCO DE LIMÃO","XAROPE DE AÇUCAR","CAFÉ","MIX AÇÚCAR DE BAUNILHA E MARACUJÁ",
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
  {item:"BITTER ANGOSTURA - 200ML (RESERVA)",cat:"ESPECIARIAS",tipo:"fixo",valor:1,min:0,soSeCardapio:true},
  {item:"ANGOSTURA 50ML",      cat:"ESPECIARIAS", tipo:"bartender",valor:1,min:0, soSeCardapio:true},
  {item:"ADOÇANTE",            cat:"ESPECIARIAS", tipo:"fixo",      valor:1, min:1},
  // PRODUÇÃO
  {item:"SUCO DE LIMÃO",       cat:"PRODUÇÃO", tipo:"convidado", valor:20, min:2, obs:"Litros"},
  {item:"XAROPE DE AÇUCAR",    cat:"PRODUÇÃO", tipo:"convidado", valor:20, min:2, obs:"Litros"},
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

  var biblioteca = getBiblioteca();
  // Categorias que vêm do Cadastro de Insumos só podem ser editadas lá —
  // evita o mesmo item existir com nomes diferentes nos dois lugares.
  var catsManual = Object.keys(biblioteca).filter(function(c){ return !_categoriaVemDoCadastroInsumos(c); });
  var problemas = _auditarItensNaoCadastrados();

  var html = '<div style="padding:14px 16px">' +
    (problemas.length ?
      '<div style="background:rgba(240,90,90,.08);border:1px solid rgba(240,90,90,.35);border-radius:var(--radius);padding:12px 14px;margin-bottom:14px">' +
        '<div style="font-size:11px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">⚠️ ' + problemas.length + ' item(ns) usado(s) em Fichas/Regras sem Insumo correspondente no Cadastro</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Esses nomes estão salvos numa ficha ou numa regra de proporção, mas não batem (nem por nome, nem por apelido) com nenhum insumo cadastrado — provavelmente nome antigo/digitado diferente. Confira no <a href="#" onclick="go(\'cadastro\');return false" style="color:var(--blue)">Cadastro de Insumos</a> se é o mesmo item com outro nome (aí é só cadastrar o apelido) ou se falta cadastrar o insumo.</div>' +
        '<div style="display:grid;gap:5px">' +
        problemas.map(function(p) {
          return '<div style="font-size:11px;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:5px 9px">' +
            '<strong>' + p.nome + '</strong> <span style="color:var(--text3)">(' + p.cat + ')</span> — usado em: ' + p.usos.join(', ') +
          '</div>';
        }).join('') +
        '</div>' +
      '</div>'
    : '') +
    '<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Itens disponíveis para seleção nas fichas de coquetéis e nas regras de proporção. Categorias que existem no <a href="#" onclick="go(\'cadastro\');return false" style="color:var(--blue)">Cadastro de Insumos</a> mostram os itens de lá — pra adicionar, remover ou renomear, edite no Cadastro de Insumos.</div>' +

    // Adicionar novo item (só em categorias que não vêm do Cadastro de Insumos)
    '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px">' +
      '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Adicionar novo item (categorias manuais, ex: Equipe)</div>' +
      (catsManual.length ?
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">' +
          '<div style="flex:1;min-width:160px"><label class="lbl">Categoria</label>' +
            '<select id="bib-cat" class="inp" style="width:100%">' +
              catsManual.map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('') +
            '</select>' +
          '</div>' +
          '<div style="flex:2;min-width:200px"><label class="lbl">Nome do item</label>' +
            '<input class="inp" id="bib-nome" type="text" placeholder="Ex: LIMÃO CRAVO" style="width:100%">' +
          '</div>' +
          '<button class="btn" onclick="adicionarItemBiblioteca()" style="background:var(--green);white-space:nowrap">+ Adicionar</button>' +
        '</div>'
      : '<div style="font-size:11px;color:var(--text3)">Nenhuma categoria manual no momento.</div>') +
      '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:12px 0 6px">Nova categoria (manual, fora do Cadastro de Insumos)</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<input class="inp" id="bib-nova-cat" type="text" placeholder="Ex: FLORES COMESTÍVEIS" style="flex:1;min-width:200px">' +
        '<button class="btn" onclick="adicionarCategoriaBiblioteca()" style="background:var(--blue);white-space:nowrap">+ Criar categoria</button>' +
      '</div>' +
    '</div>' +

    // Lista por categoria
    '<div style="display:grid;gap:12px">';

  Object.entries(biblioteca).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    var doCadastro = _categoriaVemDoCadastroInsumos(cat);
    html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">' +
      '<div style="padding:8px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">' +
        '<span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;flex:1">' + cat + ' <span style="color:var(--text3);font-weight:400">(' + itens.length + ' itens)</span></span>' +
        (doCadastro
          ? '<span style="font-size:9px;color:var(--text3);font-style:italic">🔒 Cadastro de Insumos</span>'
          : '<button class="btn-sm btn-red" onclick="excluirCat(this)" data-cat="' + cat + '" title="Excluir categoria inteira">🗑️ Cat.</button>') +
      '</div>' +
      '<div style="padding:8px;display:flex;flex-wrap:wrap;gap:6px">' +
        (itens.length ? itens.map(function(item) {
          return '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--bg4);border:1px solid var(--border2);border-radius:20px;padding:3px 10px;font-size:11px;color:var(--text2)">' +
            item +
            (doCadastro ? '' : '<button onclick="excluirBibItem(this)" data-cat="' + cat + '" data-item="' + item + '" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px;padding:0;margin-left:2px;line-height:1" title="Remover">×</button>') +
          '</span>';
        }).join('') : '<span style="font-size:11px;color:var(--text3)">' + (doCadastro ? 'Nenhum insumo cadastrado nesta categoria ainda.' : 'Nenhum item.') + '</span>') +
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
  if (_categoriaVemDoCadastroInsumos(cat)) { alert('Essa categoria vem do Cadastro de Insumos. Adicione o item por lá.'); return; }

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
  if (_categoriaVemDoCadastroInsumos(nome)) { alert('Essa categoria já existe no Cadastro de Insumos — os itens dela vêm de lá automaticamente.'); return; }
  if (!D.bibliotecaItens) D.bibliotecaItens = JSON.parse(JSON.stringify(ITENS_FOLHA));
  if (D.bibliotecaItens[nome]) { alert('Categoria já existe.'); return; }
  D.bibliotecaItens[nome] = [];
  sv('bibliotecaItens');
  document.getElementById('bib-nova-cat').value = '';
  rBiblioteca();
}

function excluirItemBiblioteca(cat, item) {
  if (_categoriaVemDoCadastroInsumos(cat)) { alert('Essa categoria vem do Cadastro de Insumos. Remova o item por lá.'); return; }
  if (!confirm('Remover "' + item + '" de ' + cat + '?')) return;
  if (!D.bibliotecaItens) D.bibliotecaItens = JSON.parse(JSON.stringify(ITENS_FOLHA));
  D.bibliotecaItens[cat] = (D.bibliotecaItens[cat]||[]).filter(function(i){return i!==item;});
  sv('bibliotecaItens');
  rBiblioteca();
}

function excluirCategoria(cat) {
  if (_categoriaVemDoCadastroInsumos(cat)) { alert('Essa categoria vem do Cadastro de Insumos. Gerencie categorias por lá (Cadastro → Categorias).'); return; }
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
// Fonte única: pra categorias que existem no Cadastro de Insumos, a lista de
// itens vem de lá (D.insumos agrupado por categoria) — nunca mais duplicada
// aqui. Só categorias que não são de insumo (ex: EQUIPE, que vem de Cargos)
// continuam usando a lista manual/antiga (D.bibliotecaItens ou ITENS_FOLHA).
// Isso evita o problema de um item ser cadastrado com um nome no Cadastro de
// Insumos e aparecer com outro nome (ou não aparecer) aqui.
function _categoriaVemDoCadastroInsumos(cat) {
  return (typeof getCategorias === 'function') && getCategorias().indexOf(cat) !== -1;
}

// Diagnóstico: varre Fichas de Coquetel + Regras de Proporção procurando
// nomes de item que não batem com nenhum Insumo cadastrado (nem por nome
// exato, nem por alias) numa categoria que deveria vir do Cadastro de
// Insumos. É a forma de confirmar com certeza — a partir dos dados reais
// salvos no Firebase, não de suposição — se sobrou algum item "órfão" tipo
// o caso do Copo Whisky Xtar/Taça Xtar (2026-07-28).
function _auditarItensNaoCadastrados() {
  var problemas = {};
  function registrar(cat, nome, onde) {
    if (!nome || !cat) return;
    if (!_categoriaVemDoCadastroInsumos(cat)) return;
    if (typeof buscarInsumoPorNome === 'function' && buscarInsumoPorNome(nome)) return;
    var key = cat + '|' + nome;
    if (!problemas[key]) problemas[key] = { cat: cat, nome: nome, usos: [] };
    if (problemas[key].usos.indexOf(onde) === -1) problemas[key].usos.push(onde);
  }
  (D.fichas || []).forEach(function(f) {
    (f.itens || []).forEach(function(i) { registrar(i.cat, i.nome, 'Ficha: ' + f.nome); });
  });
  getRegrasItens().forEach(function(r) { registrar(r.cat, r.item, 'Regras de Proporção'); });
  return Object.keys(problemas).map(function(k){ return problemas[k]; }).sort(function(a,b){
    return (a.cat+a.nome).localeCompare(b.cat+b.nome);
  });
}

function getBiblioteca() {
  var porCat = {};
  (D.insumos || []).forEach(function(i) {
    var cat = i.categoria || 'OUTROS';
    if (!porCat[cat]) porCat[cat] = [];
    if (porCat[cat].indexOf(i.nome) === -1) porCat[cat].push(i.nome);
  });
  Object.keys(porCat).forEach(function(cat) { porCat[cat].sort(); });

  var resultado = {};
  if (typeof getCategorias === 'function') {
    getCategorias().forEach(function(cat) { resultado[cat] = porCat[cat] || []; });
  }

  var manual = (D.bibliotecaItens && Object.keys(D.bibliotecaItens).length) ? D.bibliotecaItens : ITENS_FOLHA;
  Object.keys(manual).forEach(function(cat) {
    if (!resultado.hasOwnProperty(cat)) resultado[cat] = manual[cat].slice();
  });
  return resultado;
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
  var f = fichaExistente || { nome:'', variantes:'', itens:[], descricao:'', copo:'' };
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
      '<div><label class="lbl">Copo</label>' +
        '<input class="inp" id="fc-copo" type="text" placeholder="Ex: Copo baixo, Taça, Copo mule..." value="' + (f.copo||'') + '"></div>' +
      '<div><label class="lbl">Foto do copo (pra Proposta em Word)</label>' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<img id="fc-foto-preview" src="" style="display:none;width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid var(--border2)">' +
          '<label class="btn-sm" style="background:var(--bg3);cursor:pointer">📷 Escolher foto' +
            '<input type="file" accept="image/*" onchange="fichaSelecionarFoto(this)" style="display:none"></label>' +
          '<button type="button" class="btn-sm" style="background:var(--bg3)" onclick="fichaRemoverFoto()">✕ Remover</button>' +
        '</div></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Descrição (pra proposta / cardápio ao cliente)</label>' +
        '<textarea class="inp" id="fc-descricao" rows="2" style="width:100%;resize:vertical" placeholder="Ex: Vodka ou gin, ginger ale artesanal e espuma de gengibre">' + (f.descricao||'') + '</textarea></div>' +
    '</div>' +
    '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Marque os itens que este coquetel precisa</div>' +
    '<input class="inp" id="fc-item-busca" type="text" placeholder="Buscar item..." oninput="filtrarItensFicha(this.value)" style="width:100%;max-width:320px;margin-bottom:10px">' +
    '<div id="fc-itens-container">';

  Object.entries(getItensFicha()).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    html += '<div class="fc-cat-block" style="margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
      itens.map(function(item) {
        var checked = itensIds.has(cat+'|'+item) ? 'checked' : '';
        return '<label class="fc-item-label" data-busca="' + item.toLowerCase() + '" style="display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;background:var(--bg3);padding:3px 8px;border-radius:var(--radius);border:1px solid var(--border)">' +
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
  // Os itens "fora das categorias padrão" (itensExtras, acima) já aparecem
  // como checkbox marcado nesta mesma tela — não pré-popular de novo aqui
  // como tag customizada, senão o mesmo item é salvo duas vezes em
  // salvarFicha() (uma vez pelo checkbox, outra pela tag). Bug real que
  // causava item duplicado no Cardápio do Orçamento (2026-07-28) — antes
  // comparava contra o ITENS_FOLHA estático (desatualizado em relação aos
  // nomes reais do Cadastro de Insumos), em vez do todosItensNovos já
  // calculado acima a partir de getItensFicha().

  // Foto fica em documento próprio (js/../fichaFotos), não em D.fichas — busca
  // assíncrona à parte. null = "sem alteração" (mantém a que já existe ao
  // salvar); '' = removida na tela; string base64 = nova foto selecionada.
  window._fichaFotoAtual = null;
  if (fichaExistente && typeof window.buscarFichaFoto === 'function') {
    window.buscarFichaFoto(fichaExistente.id).then(function(b64){
      var prev = document.getElementById('fc-foto-preview');
      if (b64 && prev) { prev.src = b64; prev.style.display = 'inline-block'; }
    });
  }
}

function filtrarItensFicha(v) {
  var termo = (v||'').trim().toLowerCase();
  document.querySelectorAll('#fc-itens-container .fc-cat-block').forEach(function(bloco) {
    var algumVisivel = false;
    bloco.querySelectorAll('.fc-item-label').forEach(function(label) {
      var visivel = !termo || label.dataset.busca.indexOf(termo) !== -1;
      label.style.display = visivel ? '' : 'none';
      if (visivel) algumVisivel = true;
    });
    bloco.style.display = algumVisivel ? '' : 'none';
  });
}

if (!window._customItens) window._customItens = [];

function fichaSelecionarFoto(inputEl) {
  var file = inputEl.files && inputEl.files[0];
  if (!file) return;
  var leitor = new FileReader();
  leitor.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var sc = Math.min(300/img.width, 300/img.height, 1);
      var cv = document.createElement('canvas');
      cv.width = Math.round(img.width*sc); cv.height = Math.round(img.height*sc);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      window._fichaFotoAtual = cv.toDataURL('image/jpeg', 0.8);
      var prev = document.getElementById('fc-foto-preview');
      if (prev) { prev.src = window._fichaFotoAtual; prev.style.display = 'inline-block'; }
    };
    img.src = e.target.result;
  };
  leitor.readAsDataURL(file);
  inputEl.value = '';
}

function fichaRemoverFoto() {
  window._fichaFotoAtual = '';
  var prev = document.getElementById('fc-foto-preview');
  if (prev) { prev.src = ''; prev.style.display = 'none'; }
}

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
  var copo = (document.getElementById('fc-copo')?.value||'').trim();
  var descricao = (document.getElementById('fc-descricao')?.value||'').trim();
  var itens = [];
  var itensVistos = new Set();
  function addItem(cat, nomeItem) {
    var key = cat + '|' + nomeItem;
    if (itensVistos.has(key)) return; // evita item duplicado na mesma ficha
    itensVistos.add(key);
    itens.push({cat:cat, nome:nomeItem});
  }
  document.querySelectorAll('#fc-itens-container input[type="checkbox"]:checked').forEach(function(cb){
    addItem(cb.dataset.cat, cb.dataset.nome);
  });
  (window._customItens||[]).forEach(function(i){ addItem(i.cat, i.nome); });
  if (!D.fichas) D.fichas = [];
  var idFicha = idExistente || _gerarId('FIC');
  if (idExistente) {
    var idx = D.fichas.findIndex(function(f){return f.id===idExistente;});
    if (idx>=0) D.fichas[idx] = {id:idExistente, nome:nome, variantes:variantes, copo:copo, descricao:descricao, itens:itens};
  } else {
    D.fichas.push({id:idFicha, nome:nome, variantes:variantes, copo:copo, descricao:descricao, itens:itens, criadoEm:new Date().toISOString()});
  }
  window._customItens = [];
  sv('fichas');

  // Foto fica em documento próprio (ver window.salvarFichaFoto/index.html) —
  // só grava/apaga se ela de fato mexeu na foto nesta tela.
  if (window._fichaFotoAtual && typeof window.salvarFichaFoto === 'function') {
    window.salvarFichaFoto(idFicha, window._fichaFotoAtual);
  } else if (window._fichaFotoAtual === '' && typeof window.excluirFichaFoto === 'function') {
    window.excluirFichaFoto(idFicha);
  }
  window._fichaFotoAtual = null;

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
      html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:grid;grid-template-columns:180px 1fr 80px 80px 80px 90px;gap:8px;align-items:center;font-size:11px">' +
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
        '<div style="text-align:center" title="Gera automaticamente em todo orçamento, mesmo sem ficha de coquetel — usa o Cadastro de Insumos pra achar o custo">' +
          '<label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">AUTO ORÇAMENTO</label>' +
          '<input type="checkbox" ' + (r.autoOrcamento?'checked':'') + ' onchange="atualizarRegra(' + ri + ',\'autoOrcamento\',this.checked)" style="cursor:pointer">' +
        '</div>' +
      '</div>';
    });

    html += '</div></div>';
  });

  // Adicionar item novo à lista de regras — escolhido da Biblioteca de Itens
  // (mesma fonte que a Ficha de Coquetel usa), nunca digitado do zero. Antes
  // era um prompt() de texto livre: bastava uma letra/acento diferente do
  // nome real do item pra regra "casar" com nada e sumir silenciosamente do
  // orçamento (aconteceu 3x na prática — Limão Siciliano, Gim Beefeater,
  // Angostura/Xarope de Açúcar). Escolher da lista elimina esse erro de raiz.
  var bibliotecaAdd = getBiblioteca();
  html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;margin-top:8px">' +
    '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">+ Adicionar item à lista de regras</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">' +
      '<div style="flex:1;min-width:160px"><label class="lbl">Categoria</label>' +
        '<select id="rp-nova-cat" class="inp" onchange="_rpAtualizarItensDisponiveis()" style="width:100%">' +
          Object.keys(bibliotecaAdd).sort().map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('') +
        '</select></div>' +
      '<div style="flex:2;min-width:200px"><label class="lbl">Item</label>' +
        '<select id="rp-novo-item" class="inp" style="width:100%"></select></div>' +
      '<button class="btn" onclick="adicionarItemRegra()" style="background:var(--blue);white-space:nowrap">+ Adicionar</button>' +
    '</div>' +
    '<div style="font-size:10px;color:var(--text3);margin-top:6px">Só aparecem itens já cadastrados na Biblioteca de Itens e que ainda não têm regra. Item novo? <a href="#" onclick="setRegrasView(\'biblioteca\');return false" style="color:var(--blue)">Cadastre lá primeiro</a>.</div>' +
  '</div>';

  html += '<div style="margin-top:8px;display:flex;gap:8px">' +
    '<button class="btn" onclick="salvarRegrasItens()" style="background:var(--green)">💾 Salvar Regras</button>' +
    '<button class="btn" onclick="resetarRegras()" style="background:var(--red-dim);color:var(--red)">↺ Restaurar Padrão</button>' +
  '</div>';

  cont.innerHTML = html;
  _rpAtualizarItensDisponiveis();
}

// Preenche o select de item de acordo com a categoria escolhida, excluindo
// itens que já têm regra cadastrada (evita duplicar a mesma regra 2x).
function _rpAtualizarItensDisponiveis() {
  var cat = document.getElementById('rp-nova-cat')?.value;
  var sel = document.getElementById('rp-novo-item');
  if (!cat || !sel) return;
  var biblioteca = getBiblioteca();
  var jaTemRegra = {};
  getRegrasItens().forEach(function(r) { jaTemRegra[r.cat + '|' + r.item] = true; });
  var disponiveis = (biblioteca[cat] || []).filter(function(item) { return !jaTemRegra[cat + '|' + item]; });
  sel.innerHTML = disponiveis.length
    ? disponiveis.map(function(item){ return '<option value="'+item+'">'+item+'</option>'; }).join('')
    : '<option value="">(todos os itens desta categoria já têm regra)</option>';
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
  var cat  = document.getElementById('rp-nova-cat')?.value;
  var item = document.getElementById('rp-novo-item')?.value;
  if (!cat || !item) { alert('Escolha uma categoria e um item.'); return; }
  if (!D.regrasItens || !D.regrasItens.length) D.regrasItens = JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
  if (D.regrasItens.some(function(r){ return r.cat === cat && r.item === item; })) {
    alert('Esse item já tem uma regra cadastrada.');
    return;
  }
  D.regrasItens.push({item:item, cat:cat, tipo:'fixo', valor:1, min:1, soSeCardapio:false, autoOrcamento:false});
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

function atualizarPrecoUnico(fatorId, valor) {
  var p = _ensureOrcPrecos();
  p[fatorId] = parseFloat(valor) || 0;
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

  var ordem = getOrcBlocosOrdem();
  function _ordArrows(id) {
    var idx = ordem.indexOf(id);
    return '<div style="display:flex;flex-direction:column;gap:1px;margin-right:8px">' +
      '<button class="btn-sm" style="padding:0 5px;line-height:1.3;background:var(--bg3)" ' + (idx<=0?'disabled':'') + ' onclick="moverOrcBloco(\'' + id + '\',-1)" title="Mover para cima">▲</button>' +
      '<button class="btn-sm" style="padding:0 5px;line-height:1.3;background:var(--bg3)" ' + (idx>=ordem.length-1?'disabled':'') + ' onclick="moverOrcBloco(\'' + id + '\',1)" title="Mover para baixo">▼</button>' +
    '</div>';
  }

  // Injeta as setas de ordem no início do sec-head dos dois blocos estruturais
  // (Equipe/Locais não são "fatores" — têm formato próprio, só a posição é configurável).
  htmlPrecoEquipe = htmlPrecoEquipe.replace('<div class="sec-head">', '<div class="sec-head">' + _ordArrows('equipe'));
  htmlLocais      = htmlLocais.replace('<div class="sec-head">',      '<div class="sec-head">' + _ordArrows('locais'));

  // Cada categoria (fator) tem nome editável, ordem (setas ▲▼) e opções
  // editáveis (rename via input, valores, +/- opção). Os 6 fatores originais
  // (builtin) não podem ser excluídos; categorias criadas por ela podem.
  function blocoFator(fator) {
    var opcoes = _orcFatorOpcoes(fator);
    var podeEditarOpcoes = fator.opcoesFonte !== 'tiposEvento';
    var corpo;
    if (fator.unicoValor) {
      corpo = '<input type="number" value="' + (precos[fator.id]||0) + '" step="0.01" onchange="atualizarPrecoUnico(\'' + fator.id + '\',this.value)" ' +
        'style="width:100px;font-size:12px;padding:5px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">';
    } else {
      corpo = '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">' +
        opcoes.map(function(o) {
          var val = (precos[fator.id] && precos[fator.id][o.chave] != null) ? precos[fator.id][o.chave] : 0;
          return '<div style="position:relative;padding-top:2px">' +
            '<label style="font-size:9px;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">' + o.label + '</label>' +
            '<input type="number" value="' + val + '" step="0.01" onchange="atualizarPrecoFator(\'' + fator.id + '\',\'' + o.chave + '\',this.value)" ' +
            'style="width:100px;font-size:12px;padding:5px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
            (podeEditarOpcoes && opcoes.length > 1 ? '<button class="btn-sm btn-red" style="position:absolute;top:-4px;right:-4px;padding:0 4px;font-size:9px;line-height:1.4" onclick="removerOpcaoFator(\'' + fator.id + '\',\'' + o.chave + '\')" title="Remover opção">×</button>' : '') +
          '</div>';
        }).join('') +
        (podeEditarOpcoes ? '<button class="btn-sm" style="background:var(--bg3);align-self:flex-end" onclick="adicionarOpcaoFator(\'' + fator.id + '\')">+ opção</button>' : '') +
        '</div>' +
        (fator.opcoesFonte === 'tiposEvento' ? '<div style="font-size:10px;color:var(--text3);margin-top:10px">As opções vêm do <a href="#" onclick="go(\'tiposevento\');return false" style="color:var(--blue)">Cadastro → Tipos de Evento</a> — adicione ou renomeie um tipo de evento lá.</div>' : '');
    }
    var tituloEditavel = '<input type="text" value="' + fator.nome + '" onchange="renomearOrcFator(\'' + fator.id + '\',this.value)" ' +
      'style="font-size:13px;font-weight:600;background:transparent;border:none;border-bottom:1px dashed var(--border2);color:var(--text);padding:2px 0;flex:1;min-width:180px">';
    return '<div class="sec" style="margin-bottom:14px">' +
      '<div class="sec-head">' + _ordArrows(fator.id) + tituloEditavel +
        (!fator.builtin ? '<button class="btn-sm btn-red" style="margin-left:8px" onclick="excluirOrcFator(\'' + fator.id + '\')" title="Excluir categoria">🗑️</button>' : '') +
      '</div>' +
      '<div style="padding:12px 16px">' + corpo + '</div></div>';
  }

  var htmlPorId = { equipe: htmlPrecoEquipe, locais: htmlLocais };
  getOrcFatores().forEach(function(f) { htmlPorId[f.id] = blocoFator(f); });
  var corpoOrdenado = ordem.map(function(id) { return htmlPorId[id] || ''; }).join('');

  var htmlNovaCategoria = '<div class="sec" style="margin-bottom:14px;border-style:dashed">' +
    '<div class="sec-head"><span class="sec-title">➕ Nova categoria de preço</span></div>' +
    '<div style="padding:12px 16px;display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">' +
      '<div><label style="font-size:9px;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Nome</label>' +
        '<input class="inp" id="pfat-nome" type="text" placeholder="Ex: Locação de Gelo" style="width:220px"></div>' +
      '<div><label style="font-size:9px;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Tipo de valor</label>' +
        '<select class="inp" id="pfat-tipo" style="width:160px">' +
          '<option value="porConvidado">Por convidado</option>' +
          '<option value="fixo">Valor fixo</option>' +
        '</select></div>' +
      '<button class="btn" style="background:var(--green)" onclick="adicionarOrcFator()">+ Adicionar categoria</button>' +
    '</div></div>';

  cont.innerHTML =
    '<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Esses valores preenchem automaticamente os itens do orçamento (Bartender, Carregamento, Seguro etc.) conforme o Local, Tipo de Evento e Complexidade escolhidos na Calculadora de Orçamento. Use as setas ▲▼ pra mudar a ordem — o nome de cada categoria é editável, e dá pra criar novas categorias no fim da lista.</div>' +
    corpoOrdenado + htmlNovaCategoria +
    '<div style="display:flex;gap:8px">' +
      '<button class="btn" onclick="salvarPrecosOrcamento()" style="background:var(--green)">💾 Salvar Preços</button>' +
      '<button class="btn" onclick="resetarPrecosOrcamento()" style="background:var(--red-dim);color:var(--red)">↺ Restaurar Padrão</button>' +
    '</div>';
}

function renomearOrcFator(id, novoNomeRaw) {
  var novoNome = (novoNomeRaw || '').trim();
  if (!novoNome) { alert('O nome não pode ficar vazio.'); rPrecosOrcamento(); return; }
  var f = buscarOrcFatorPorId(id);
  if (!f) return;
  f.nome = novoNome;
  sv('orcFatores');
  rPrecosOrcamento();
}

function adicionarOrcFator() {
  var nome = (document.getElementById('pfat-nome')?.value || '').trim();
  var tipoValor = document.getElementById('pfat-tipo')?.value || 'porConvidado';
  if (!nome) { alert('Informe o nome da categoria.'); return; }
  if (!D.orcFatores) D.orcFatores = [];
  var id = 'fat' + Date.now() + Math.random().toString(36).slice(2, 5);
  D.orcFatores.push({
    id: id, nome: nome, tipoValor: tipoValor, unicoValor: false,
    opcoesFonte: null, secao: 'custos', builtin: false, chavePadrao: 'padrao',
    opcoes: [{ chave: 'padrao', label: 'Padrão' }],
  });
  sv('orcFatores');
  getOrcBlocosOrdem(); // migrarOrcFatores() detecta o id novo e já acrescenta ele ao fim da ordem
  document.getElementById('pfat-nome').value = '';
  rPrecosOrcamento();
}

function excluirOrcFator(id) {
  var f = buscarOrcFatorPorId(id);
  if (!f) return;
  if (f.builtin) { alert('Essa categoria faz parte do cálculo padrão e não pode ser excluída — renomeie ou edite as opções dela.'); return; }
  if (!confirm('Excluir a categoria "' + f.nome + '"?')) return;
  D.orcFatores = D.orcFatores.filter(function(x) { return x.id !== id; });
  D.orcBlocosOrdem = (D.orcBlocosOrdem || []).filter(function(x) { return x !== id; });
  sv('orcFatores');
  sv('orcBlocosOrdem');
  rPrecosOrcamento();
}

function adicionarOpcaoFator(fatorId) {
  var f = buscarOrcFatorPorId(fatorId);
  if (!f) return;
  var label = prompt('Nome da nova opção (ex: Premium):');
  if (!label || !label.trim()) return;
  var base = label.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '') || ('op' + Date.now());
  var chave = base, n = 2;
  while (f.opcoes.some(function(o) { return o.chave === chave; })) { chave = base + n; n++; }
  f.opcoes.push({ chave: chave, label: label.trim() });
  sv('orcFatores');
  rPrecosOrcamento();
}

function removerOpcaoFator(fatorId, chave) {
  var f = buscarOrcFatorPorId(fatorId);
  if (!f) return;
  if (f.opcoes.length <= 1) { alert('A categoria precisa ter pelo menos uma opção.'); return; }
  if (!confirm('Remover essa opção?')) return;
  f.opcoes = f.opcoes.filter(function(o) { return o.chave !== chave; });
  sv('orcFatores');
  rPrecosOrcamento();
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
        // Dedupe defensivo: ficha com item repetido (cat+nome) não deve
        // contar em dobro na estimativa de separação.
        var vistos = new Set();
        var itensUnicos = ficha.itens.filter(function(item) {
          var key = item.cat + '|' + item.nome;
          if (vistos.has(key)) return false;
          vistos.add(key);
          return true;
        });
        itensUnicos.forEach(function(item) {
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

