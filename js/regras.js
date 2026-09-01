// ─── REGRAS E CÁLCULOS ─────────────────────────────────

// ── Lista completa de itens da folha de separação ──────

// Fallback offline da FICHA DE COQUETEL — só é usado se ainda não houver
// nenhum insumo/categoria cadastrada no Cadastro de Insumos. Com o Cadastro
// já populado, getItensFicha() ignora esta lista e mostra todas as
// categorias de Insumo (pedido 08-26: "todos os insumos" devem aparecer).
var ITENS_FICHA_COQUETEL = {
  "BEBIDAS ALCOÓLICAS": [
    "VODKA ABSOLUT 1000ML","GIM BEEFEATER 750ML","GIM TANQUERAY","TEQUILA",
    "RUM HAVANA","ESPUMANTE LE BLANC","LICOR 43","CAMPARI","WHISKEY JAMESON 750ML",
    "VERMUTE CARPANO 950ML","APEROL","CACHAÇA SPIRAL","FERNET","BANANINHA",
    "FIREBALL","MANZA"
  ],
  "BEBIDAS SEM ÁLCOOL": [
    "ÁGUA TÔNICA","ÁGUA COM GÁS"
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
  // Todas as categorias do Cadastro de Insumos ficam disponíveis pra seleção
  // na Ficha de Coquetel — ela escolhe o que faz sentido em cada receita; o
  // que faltar, cadastra direto no Cadastro de Insumos (pedido 08-26).
  var bib = getBiblioteca();
  var categorias = (typeof getCategorias === 'function') ? getCategorias() : Object.keys(ITENS_FICHA_COQUETEL);
  var resultado = {};
  categorias.forEach(function(cat) {
    if (bib[cat] && bib[cat].length) resultado[cat] = bib[cat];
  });

  // Se resultado vazio (nada cadastrado ainda), usar padrão offline
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

// ── Modelo novo de base de cálculo (2026-08-27) ─────────────────────────────
// Cada regra passa a ter um campo `base`:
//   'fixo'      → sempre `valor` por evento (ex: balde, escorredor)
//   'convidado' → `valor` a cada `ref` convidados (ex: guardanapo, gelo)
//   'equipe'    → `valor` a cada `ref` pessoas escaladas (ex: lanche, uniforme)
//   'cargo'     → `valor` a cada `ref` pessoas nos cargos em `cargos[]`
//                 (ex: bailarina = 1 por Bartender + Head Bartender)
// O campo `tipo` antigo ('bartender'|'convidado'|'equipe'|'fixo') continua
// gravado por retrocompatibilidade (Orçamento ainda lê algumas regras), mas
// `base` é a fonte de verdade quando presente.

// Traduz uma regra (nova ou legada) para os parâmetros efetivos de cálculo,
// sem depender de a migração já ter rodado — assim calcQtdItem sempre acerta.
function _regraBaseEfetiva(r) {
  if (r.base) {
    return {
      base: r.base,
      valor: parseFloat(r.valor) || 1,
      ref: parseFloat(r.ref) || 1,
      cargos: (r.cargos || []).slice(),
      principal: r.principal || '',
    };
  }
  switch (r.tipo) {
    case 'convidado': return { base: 'convidado', valor: 1, ref: parseFloat(r.valor) || 1, cargos: [] };
    case 'equipe':    return { base: 'equipe',    valor: parseFloat(r.valor) || 1, ref: 1, cargos: [] };
    case 'bartender': return { base: 'cargo',     valor: parseFloat(r.valor) || 1, ref: 1, cargos: ['bt', 'hb'] };
    default:          return { base: 'fixo',      valor: parseFloat(r.valor) || 1, ref: 1, cargos: [] };
  }
}

// Soma de pessoas nos cargos selecionados. `cargoCounts` (mapa keyCargo->qtd)
// vem da Folha de Separação, montado a partir da equipe real do evento. Sem
// esse mapa (ex: Orçamento), cai numa aproximação: se os cargos são só
// bartender/head, usa o total de bartenders; senão, o total da equipe.
function _contarPessoasNosCargos(cargos, cargoCounts, bartenders, equipeTotal) {
  if (!cargos || !cargos.length) return equipeTotal || 0;
  if (cargoCounts) {
    return cargos.reduce(function(s, k) { return s + (parseInt(cargoCounts[k]) || 0); }, 0);
  }
  var soBartender = cargos.every(function(k) { return k === 'bt' || k === 'hb'; });
  return soBartender ? (bartenders || 0) : (equipeTotal || 0);
}

// Materializa D.regrasItens a partir do padrão e converte cada regra para o
// modelo novo (base/ref/cargos/id). Idempotente — só mexe em regra sem `base`.
function migrarRegrasBaseCalculo() {
  if (!D.regrasItens || !D.regrasItens.length) {
    D.regrasItens = JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
  }
  var mudou = false;
  D.regrasItens.forEach(function(r) {
    if (!r.id) { r.id = _gerarId('RG'); mudou = true; }
    if (!r.base) {
      var ef = _regraBaseEfetiva(r);
      r.base = ef.base;
      r.valor = ef.valor;
      r.ref = ef.ref;
      r.cargos = ef.cargos;
      mudou = true;
    }
    if (r.autoOrcamento == null) { r.autoOrcamento = false; mudou = true; }
    if (r.opcional == null) { r.opcional = false; mudou = true; }
  });

  // Dobra a antiga tela "Associações" (D.associacoes) dentro desta tabela —
  // cada associação vira uma regra com base 'associado'. Uma vez migrada, a
  // entrada em D.associacoes fica marcada e é ignorada daqui pra frente.
  (D.associacoes || []).forEach(function(a) {
    if (a._migrada) return;
    a._migrada = true;
    mudou = true;
    if (!a.acessorio || !a.principal) return;
    if (D.regrasItens.some(function(r) { return (r.item || '').toUpperCase() === a.acessorio.toUpperCase(); })) return;
    D.regrasItens.push({
      id: _gerarId('RG'), item: a.acessorio, cat: a.acessorioCat || 'MATERIAL',
      base: 'associado', tipo: 'fixo', principal: a.principal,
      valor: parseFloat(a.quantos) || 1, ref: parseFloat(a.aCada) || 1, cargos: [],
      min: parseFloat(a.min) || 0, soSeCardapio: false, autoOrcamento: false,
    });
  });
  if (mudou && (D.associacoes || []).length) sv('associacoes');

  // Dobra a antiga "tabela de estimativa" da Separação (D.sepCalculos) —
  // "X a cada Y convidados / bartenders" vira uma regra normal marcada
  // "só c/ cardápio" (era o comportamento dela: só ajustava item que já
  // estava no cardápio do evento).
  (D.sepCalculos || []).forEach(function(sc) {
    if (sc._migrada) return;
    sc._migrada = true;
    mudou = true;
    if (!sc.item) return;
    if (D.regrasItens.some(function(r) { return (r.item || '').toUpperCase() === (sc.item || '').toUpperCase(); })) return;
    var ehBar = sc.tipo === 'bartender';
    D.regrasItens.push({
      id: _gerarId('RG'), item: sc.item, cat: sc.cat || 'OUTROS',
      base: ehBar ? 'cargo' : 'convidado', tipo: ehBar ? 'bartender' : 'convidado',
      cargos: ehBar ? ['bt', 'hb'] : [],
      valor: parseFloat(sc.qtd) || 1, ref: parseFloat(sc.ref) || 1,
      min: 0, soSeCardapio: true, autoOrcamento: false,
    });
  });
  if (mudou && (D.sepCalculos || []).length) sv('sepCalculos');

  if (mudou) sv('regrasItens');
}

function _regraKitPorId(id) {
  return (D.regrasItens || []).find(function(r) { return r.id === id; }) || null;
}

// Cria no Cadastro de Insumos os itens do Kit Base que ainda são só texto
// (LANCHE, BAILARINA, BALDE COPA...). Categoria fica em branco de propósito —
// a Juliana classifica cada um; até lá aparece um alerta (na Separação e no
// próprio Cadastro de Insumos). Idempotente.
function migrarInsumosDoKitBase() {
  migrarRegrasBaseCalculo();
  if (!D.insumos) D.insumos = [];
  // Itens que ela excluiu do Cadastro de Insumos não devem voltar sozinhos —
  // ver excluirInsumo() em js/insumos.js, que também remove a regra do Kit Base.
  var excluidos = new Set((D.kitBaseInsumosExcluidos || []).map(function(n){ return (n || '').toUpperCase(); }));
  var criados = 0;
  (D.regrasItens || []).forEach(function(r) {
    if (!r.item) return;
    if (excluidos.has(r.item.toUpperCase())) return;
    if (typeof buscarInsumoPorNome === 'function' && buscarInsumoPorNome(r.item)) return;
    if (D.insumos.some(function(i){ return (i.nome || '').toUpperCase() === r.item.toUpperCase(); })) return;
    D.insumos.push({
      id: 'INS' + Date.now() + Math.random().toString(36).slice(2, 6),
      codigo: (typeof _proximoCodigoInsumo === 'function') ? _proximoCodigoInsumo() : '',
      origemProdutoId: null,
      origemAuto: true,
      nome: r.item.toUpperCase(),
      aliases: [],
      categoria: '',
      unidadeCompra: 'UN',
      tamanhoEmbalagem: 1,
      classificacaoProducao: 'materia_prima',
      estoqueMinimo: 0,
      custoReposicao: 0,
      precoManual: null,
      ultimaCompra: '',
      ultimoFornecedor: '',
    });
    criados++;
  });
  if (criados > 0) sv('insumos');
  return criados;
}

// Insumos criados pela migração acima que ainda estão sem categoria.
function kitBaseInsumosPendentes() {
  return (D.insumos || []).filter(function(i) { return i.origemAuto && !i.categoria; });
}

// Unidades de compra vendidas em embalagem fechada — arredondar pra cima até
// o próximo múltiplo do tamanho da embalagem. UN/KG/LT/ML ficam de fora por
// serem fracionáveis (compra-se exatamente a quantidade calculada).
var UNIDADES_EMBALAGEM_FECHADA = ['CX', 'FARDO', 'PCT'];

function calcQtdItem(regra, conv, bartenders, equipeTotal, cargoCounts) {
  var ef = _regraBaseEfetiva(regra);
  var v = ef.valor || 1;
  var ref = ef.ref || 1;
  var min = parseFloat(regra.min) || 0;
  var qtd = min;
  if (ef.base === 'convidado') {
    qtd = Math.max(min, Math.ceil(v * (conv || 0) / ref));
  } else if (ef.base === 'equipe') {
    qtd = Math.max(min, Math.ceil(v * (equipeTotal || 0) / ref));
  } else if (ef.base === 'cargo') {
    var n = _contarPessoasNosCargos(ef.cargos, cargoCounts, bartenders, equipeTotal);
    qtd = Math.max(min, Math.ceil(v * n / ref));
  } else if (ef.base === 'associado') {
    // A quantidade real depende de outro item — resolvida na Folha de
    // Separação (aplicarAssociacoesSeparacao). Aqui só o mínimo.
    qtd = min;
  } else {
    // 'fixo' e qualquer base não reconhecida (dado antigo/estranho) — sem
    // este fallback, base fora da lista caía direto em qtd = min = 0.
    qtd = Math.max(min, v);
  }
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
  // Proporções e Associações saíram daqui (2026-08-28) — viraram a tabela
  // única de Cálculo em Separação → Cálculos.
  ['fichas','nova-ficha','biblioteca','copos','precos'].forEach(function(x) {
    var el = document.getElementById('regras-view-' + x);
    if (el) el.style.display = x === v ? '' : 'none';
    var btn = document.getElementById('regras-tab-' + x);
    if (btn) btn.classList.toggle('active', x === v);
  });
  if (v === 'fichas') rFichas();
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
  var html = '<div style="font-size:11px;color:var(--text3);margin-bottom:10px">A ficha diz <strong>o que tem</strong> no coquetel. <strong>Quanto levar</strong> de cada item (base de cálculo, "segue outro item", etc.) agora fica em <a href="#" onclick="go(\'separacao\');setSepView(\'calculos\');return false" style="color:var(--blue)">Separação → Cálculos</a>.</div>' +
    '<input class="inp" id="fichas-busca" type="text" placeholder="Buscar coquetel..." oninput="filtrarFichas(this.value)" style="width:100%;max-width:320px;margin-bottom:12px">';
  html += fichas.map(function(f) {
    var porCat = {};
    var temMedida = false, temIngrediente = false;
    var _ehIngr = (typeof _ftItemEhIngrediente === 'function') ? _ftItemEhIngrediente : function(){ return true; };
    (f.itens||[]).forEach(function(i) {
      var cat = categoriaAtualDoInsumo(i.nome, i.cat);
      if(!porCat[cat]) porCat[cat]=[];
      var ingr = _ehIngr(i);
      if (ingr) temIngrediente = true;
      var temQtd = i.qtd != null && i.qtd !== '' && !isNaN(parseFloat(i.qtd));
      if (temQtd && ingr) temMedida = true;
      porCat[cat].push(
        (ingr ? '' : '<span style="opacity:.55">') +
        i.nome +
        (temQtd ? ' <strong style="color:var(--text2)">' + parseFloat(i.qtd) + (i.un && i.un !== '—' ? ' ' + i.un : '') + '</strong>' : '') +
        (ingr ? '' : ' <span style="font-size:9px">(só separação)</span></span>'));
    });
    var faltaMedida = temIngrediente && !temMedida;
    var busca = (f.nome + ' ' + (f.variantes||'')).toLowerCase();
    return '<div class="ficha-card sec" data-busca="' + busca.replace(/"/g,'&quot;') + '" style="margin-bottom:10px">' +
      '<div class="sec-head" style="display:flex;align-items:center;gap:10px">' +
        '<span class="sec-title">🍹 ' + f.nome + '</span>' +
        (f.variantes ? '<span style="color:var(--text3);font-size:11px">' + f.variantes + '</span>' : '') +
        (faltaMedida ? '<span style="color:var(--amber);font-size:10px" title="Nenhum ingrediente tem medida — edite a ficha e preencha as quantidades">sem medidas</span>' : '') +
        '<div style="margin-left:auto;display:flex;gap:6px">' +
          '<button class="btn-sm" style="background:#6C63FF" onclick="imprimirFichaTecnicaCoquetel(\'' + f.id + '\')">🖨️ Ficha Técnica</button>' +
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
  cont.innerHTML = html;
}

function filtrarFichas(v) {
  var termo = (v||'').trim().toLowerCase();
  document.querySelectorAll('#fichas-body .ficha-card').forEach(function(card) {
    card.style.display = (!termo || card.dataset.busca.indexOf(termo) !== -1) ? '' : 'none';
  });
}

function rFormFicha(fichaExistente) {
  var cont = document.getElementById('regras-view-nova-ficha');
  if (!cont) return;
  var f = fichaExistente || { nome:'', variantes:'', itens:[], descricao:'', copo:'', copoId:'', metodo:'', modoPreparo:'', finalizacao:'' };

  // Medidas dos ingredientes ({cat|nome} -> {qtd, un}), pré-carregadas da
  // ficha; _fcSyncMedidas() mantém isso em dia conforme ela marca/desmarca.
  window._fcMedidas = {};
  (f.itens||[]).forEach(function(i){
    window._fcMedidas[categoriaAtualDoInsumo(i.nome, i.cat) + '|' + i.nome] = { qtd: i.qtd, un: i.un, foraFT: i.foraFT };
  });

  var _copos = (typeof getCopos === 'function') ? getCopos().slice().sort(function(a,b){return (a.nome||'').localeCompare(b.nome||'');}) : [];
  // Nome do copo atual da ficha — resolve o id antigo (f.copoId) pra nome.
  var _copoAtual = (typeof nomeCopoDaFicha === 'function') ? nomeCopoDaFicha(f) : (f.copo || '');
  var _metodos = (typeof METODOS_PREPARO !== 'undefined') ? METODOS_PREPARO : ['BATIDO','MEXIDO','MONTADO','DIRETO','DRY SHAKE'];
  // "Já na ficha" usa a categoria ATUAL do insumo (não a guardada na ficha)
  // — senão, reclassificar um insumo (ex: Triple Sec) faz o checkbox dele
  // aparecer desmarcado na categoria nova, e resalvar a ficha sem notar
  // apaga o item dela (pedido 08-26).
  var itensIds = new Set((f.itens||[]).map(function(i){ return categoriaAtualDoInsumo(i.nome, i.cat) + '|' + i.nome; }));

  // Itens da ficha existente que não estão na nova lista filtrada — só sobra
  // aqui quem o NOME não existe mais em nenhuma categoria do Cadastro de
  // Insumos (insumo excluído/renomeado); quem só mudou de categoria já
  // aparece marcado corretamente na categoria nova, acima.
  var itensFicha = getItensFicha();
  var todosNomesAtuais = new Set();
  Object.values(itensFicha).forEach(function(lista){ lista.forEach(function(nome){ todosNomesAtuais.add(nome); }); });
  var itensExtras = fichaExistente ? (fichaExistente.itens||[]).filter(function(i){ return !todosNomesAtuais.has(i.nome); }) : [];

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
      '<div><label class="lbl">Copo / Serviço</label>' +
        '<select class="inp" id="fc-copo-id" data-copo-anterior="' + _copoAtual.replace(/"/g,'&quot;') + '" onchange="_fcCopoMudou(this)">' +
          '<option value="">— sem copo definido —</option>' +
          _copos.map(function(c){ var n = (c.nome||'').replace(/"/g,'&quot;'); return '<option value="'+n+'"'+(_copoAtual===c.nome?' selected':'')+'>'+c.nome+'</option>'; }).join('') +
          ((_copoAtual && !_copos.some(function(c){ return c.nome === _copoAtual; })) ? '<option value="'+_copoAtual.replace(/"/g,'&quot;')+'" selected>'+_copoAtual+' (fora da lista)</option>' : '') +
        '</select>' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px">O copo escolhido aqui já entra na ficha — não precisa marcar de novo lá embaixo. Vem da categoria "COPOS E TAÇAS" do Cadastro de Insumos · <a href="#" onclick="setRegrasView(\'copos\');return false" style="color:var(--blue)">fotos dos copos</a></div></div>' +
      '<div><label class="lbl">Método de preparo</label>' +
        '<input class="inp" id="fc-metodo" list="fc-metodo-lista" type="text" placeholder="Ex: BATIDO" value="' + (f.metodo||'').replace(/"/g,'&quot;') + '" style="text-transform:uppercase">' +
        '<datalist id="fc-metodo-lista">' + _metodos.map(function(m){ return '<option value="'+m+'">'; }).join('') + '</datalist></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Descrição (pra proposta / cardápio ao cliente)</label>' +
        '<textarea class="inp" id="fc-descricao" rows="2" style="width:100%;resize:vertical" placeholder="Ex: Vodka ou gin, ginger ale artesanal e espuma de gengibre">' + (f.descricao||'') + '</textarea></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Modo de preparo (pra ficha técnica dos colaboradores)</label>' +
        '<textarea class="inp" id="fc-modo-preparo" rows="2" style="width:100%;resize:vertical" placeholder="Ex: Adicionar todos os ingredientes na coqueteleira com gelo e bater vigorosamente. Servir no copo baixo.">' + (f.modoPreparo||'') + '</textarea></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Finalização</label>' +
        '<textarea class="inp" id="fc-finalizacao" rows="1" style="width:100%;resize:vertical" placeholder="Ex: Finalizar com casca de limão siciliano aromatizada.">' + (f.finalizacao||'') + '</textarea></div>' +
    '</div>' +
    '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Marque os itens que este coquetel precisa</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Só os itens já marcados ficam à vista. Pra adicionar outro, busque pelo nome abaixo.</div>' +
    '<input class="inp" id="fc-item-busca" type="text" placeholder="Buscar item..." oninput="filtrarItensFicha(this.value)" style="width:100%;max-width:320px;margin-bottom:8px">' +
    '<div id="fc-itens-dica" style="font-size:11px;color:var(--text3);margin-bottom:8px;display:none"></div>' +
    '<div id="fc-itens-container">';

  Object.entries(getItensFicha()).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    html += '<div class="fc-cat-block" style="margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
      itens.map(function(item) {
        var checked = itensIds.has(cat+'|'+item) ? 'checked' : '';
        return '<label class="fc-item-label" data-busca="' + item.toLowerCase() + '" style="display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;background:var(--bg3);padding:3px 8px;border-radius:var(--radius);border:1px solid var(--border)">' +
          '<input type="checkbox" data-cat="' + cat + '" data-nome="' + item + '" ' + checked + ' onchange="_fcSyncMedidas();filtrarItensFicha((document.getElementById(\'fc-item-busca\')||{}).value||\'\')" style="cursor:pointer"> ' + item + '</label>';
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
            '<input type="checkbox" data-cat="' + item.cat + '" data-nome="' + item.nome + '" checked onchange="_fcSyncMedidas()" style="cursor:pointer"> ' +
            '<span style="color:var(--text3)">' + item.cat + ':</span> ' + item.nome + '</label>';
        }).join('') +
        '</div>' +
      '</div>'
    : '') +
    '<div style="margin-top:18px;background:var(--blue-bg);border:1px solid var(--blue-dim);border-radius:var(--radius);padding:12px 14px">' +
      '<div style="font-size:12px;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Quantidade de cada ingrediente</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:10px">É isto que sai na <strong>Ficha Técnica</strong> dos bartenders — ex.: <strong>50 ML de Aperol</strong>, <strong>120 ML de Espumante</strong>. Cada ingrediente marcado acima aparece aqui; deixe em branco o que não tem medida (copo, guarnição).</div>' +
      '<div id="fc-medidas"></div>' +
    '</div>' +
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

  // A foto agora fica na Biblioteca de Copos (js/fichaTecnica.js), não mais
  // por ficha — a ficha só aponta pra um copo (fc-copo-id).
  // O copo escolhido no select já conta como item da ficha — marca o
  // checkbox correspondente pra ela não precisar marcar de novo.
  _fcMarcarCheckboxCopo((document.getElementById('fc-copo-id') || {}).value || '', '');
  if (typeof _fcSyncMedidas === 'function') _fcSyncMedidas();
  // Começa mostrando só os itens já marcados (esconde a lista gigante).
  if (typeof filtrarItensFicha === 'function') filtrarItensFicha('');
}

// Reconstrói a lista de medidas (#fc-medidas) a partir dos ingredientes
// marcados, preservando o que já foi digitado (em window._fcMedidas).
function _fcSyncMedidas() {
  var cont = document.getElementById('fc-medidas');
  if (!cont) return;
  if (!window._fcMedidas) window._fcMedidas = {};

  // 1) grava o que está digitado nas linhas atuais
  cont.querySelectorAll('[data-med-key]').forEach(function(row) {
    var k = row.dataset.medKey;
    var q = row.querySelector('.med-qtd');
    var u = row.querySelector('.med-un');
    var f = row.querySelector('.med-fora');
    window._fcMedidas[k] = { qtd: q ? q.value : '', un: u ? u.value : '', foraFT: f ? f.checked : undefined };
  });

  // 2) lista dos ingredientes marcados agora (checkbox + customizados)
  var sel = [];
  document.querySelectorAll('#regras-view-nova-ficha input[type="checkbox"]:checked').forEach(function(cb) {
    if (cb.dataset.nome) sel.push({ cat: cb.dataset.cat, nome: cb.dataset.nome });
  });
  (window._customItens || []).forEach(function(i) { sel.push({ cat: i.cat, nome: i.nome }); });
  var vistos = {};
  sel = sel.filter(function(x) { var k = x.cat + '|' + x.nome; if (vistos[k]) return false; vistos[k] = 1; return true; });

  if (!sel.length) {
    cont.innerHTML = '<div style="font-size:11px;color:var(--text3)">Marque os ingredientes acima pra definir as medidas.</div>';
    return;
  }
  var UNS = (typeof UNIDADES_INGREDIENTE !== 'undefined') ? UNIDADES_INGREDIENTE : ['ML','GR','UN','DASH','GTS','BSP','—'];
  var CATS_FORA = (typeof CATS_FORA_FICHA_TECNICA !== 'undefined') ? CATS_FORA_FICHA_TECNICA : ['MATERIAL','DESCARTÁVEIS','KIT BARTENDER','EQUIPE','COPOS E TAÇAS'];
  cont.innerHTML =
    '<div style="font-size:10px;color:var(--text3);margin-bottom:6px">Marque <strong>"fora da ficha"</strong> pro que é acessório/associação e não é ingrediente do drink (ex: garrafa vazia, bico) — não sai na Ficha Técnica.</div>' +
    sel.map(function(x) {
    var k = x.cat + '|' + x.nome;
    var m = window._fcMedidas[k] || {};
    var foraPadrao = CATS_FORA.indexOf((x.cat || '').toUpperCase()) !== -1;
    var fora = (m.foraFT != null) ? !!m.foraFT : foraPadrao;
    return '<div data-med-key="' + k.replace(/"/g,'&quot;') + '" style="display:grid;grid-template-columns:1fr 90px 70px 78px;gap:8px;align-items:center;padding:4px 0;border-bottom:1px solid var(--border)">' +
      '<span style="font-size:12px;color:' + (fora ? 'var(--text3)' : 'var(--text2)') + '">' + x.nome + ' <span style="font-size:9px;color:var(--text3)">' + x.cat + '</span></span>' +
      '<label style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text3);cursor:pointer">' +
        '<input type="checkbox" class="med-fora" ' + (fora ? 'checked' : '') + ' onchange="_fcSyncMedidas()"> fora da ficha</label>' +
      '<input class="inp med-qtd" type="number" min="0" step="any" value="' + (m.qtd != null ? m.qtd : '') + '" placeholder="qtd" ' + (fora ? 'disabled' : '') + ' style="font-size:12px;text-align:center' + (fora ? ';opacity:.4' : '') + '">' +
      '<select class="inp med-un" ' + (fora ? 'disabled' : '') + ' style="font-size:12px' + (fora ? ';opacity:.4' : '') + '">' + UNS.map(function(u){ return '<option' + (m.un === u ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select>' +
    '</div>';
  }).join('');
}

// Marca no checklist o copo `novo` e desmarca o `anterior` — mantém o
// checkbox em sincronia com o select "Copo / Serviço" pra ela escolher o
// copo num lugar só.
function _fcMarcarCheckboxCopo(novo, anterior) {
  var cont = document.getElementById('fc-itens-container');
  if (!cont) return;
  var N = (novo || '').trim().toUpperCase(), A = (anterior || '').trim().toUpperCase();
  cont.querySelectorAll('input[type="checkbox"][data-nome]').forEach(function(cb) {
    var nome = (cb.dataset.nome || '').trim().toUpperCase();
    if (A && nome === A && nome !== N) cb.checked = false;
    if (N && nome === N) cb.checked = true;
  });
}

function _fcCopoMudou(sel) {
  var anterior = sel.dataset.copoAnterior || '';
  var novo = sel.value || '';
  _fcMarcarCheckboxCopo(novo, anterior);
  sel.dataset.copoAnterior = novo;
  if (typeof _fcSyncMedidas === 'function') _fcSyncMedidas();
  if (typeof filtrarItensFicha === 'function') filtrarItensFicha((document.getElementById('fc-item-busca') || {}).value || '');
}

// Sem busca: mostra só os itens já marcados (a lista completa de insumos é
// enorme e atrapalha). Com busca: mostra os que casam com o termo, marcados
// ou não, pra ela poder incluir.
function filtrarItensFicha(v) {
  var termo = (v||'').trim().toLowerCase();
  var totalVisivel = 0, totalMarcados = 0;
  document.querySelectorAll('#fc-itens-container .fc-cat-block').forEach(function(bloco) {
    var algumVisivel = false;
    bloco.querySelectorAll('.fc-item-label').forEach(function(label) {
      var cb = label.querySelector('input[type="checkbox"]');
      var marcado = !!(cb && cb.checked);
      if (marcado) totalMarcados++;
      var casa = !!termo && label.dataset.busca.indexOf(termo) !== -1;
      var visivel = termo ? casa : marcado;
      label.style.display = visivel ? '' : 'none';
      if (visivel) { algumVisivel = true; totalVisivel++; }
    });
    bloco.style.display = algumVisivel ? '' : 'none';
  });

  var dica = document.getElementById('fc-itens-dica');
  if (dica) {
    var msg = '';
    if (termo && totalVisivel === 0) msg = 'Nenhum item encontrado. Se não estiver no Cadastro de Insumos, use "Item personalizado" abaixo.';
    else if (!termo && totalMarcados === 0) msg = 'Nenhum item marcado ainda — busque pelo nome acima para adicionar.';
    dica.textContent = msg;
    dica.style.display = msg ? '' : 'none';
  }
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
  if (typeof _fcSyncMedidas === 'function') _fcSyncMedidas();
}

function removerCustom(id, el) {
  window._customItens = (window._customItens||[]).filter(function(x){return x.id!==id;});
  if (typeof _fcSyncMedidas === 'function') setTimeout(_fcSyncMedidas, 0);
  if (el) el.remove();
}

function salvarFicha(idExistente) {
  var nome = (document.getElementById('fc-nome')?.value||'').trim().toUpperCase();
  if (!nome) { alert('Preencha o nome do coquetel.'); return; }
  if (typeof _fcSyncMedidas === 'function') _fcSyncMedidas(); // captura o que foi digitado sem sair do campo
  var variantes = (document.getElementById('fc-variantes')?.value||'').trim();
  var _fichaAnt = idExistente ? ((D.fichas||[]).find(function(f){return f.id===idExistente;}) || {}) : {};
  // O select agora guarda o NOME do copo (insumo da categoria COPOS E TAÇAS),
  // não mais um id de D.copos.
  var copoNome = document.getElementById('fc-copo-id')?.value || '';
  var descricao = (document.getElementById('fc-descricao')?.value||'').trim();
  var metodo = (document.getElementById('fc-metodo')?.value||'').trim().toUpperCase();
  var modoPreparo = (document.getElementById('fc-modo-preparo')?.value||'').trim();
  var finalizacao = (document.getElementById('fc-finalizacao')?.value||'').trim();
  var medidas = window._fcMedidas || {};
  var itens = [];
  var itensVistos = new Set();
  var CATS_FORA = (typeof CATS_FORA_FICHA_TECNICA !== 'undefined') ? CATS_FORA_FICHA_TECNICA : ['MATERIAL','DESCARTÁVEIS','KIT BARTENDER','EQUIPE','COPOS E TAÇAS'];
  function addItem(cat, nomeItem) {
    var key = cat + '|' + nomeItem;
    if (itensVistos.has(key)) return; // evita item duplicado na mesma ficha
    itensVistos.add(key);
    var it = { cat: cat, nome: nomeItem };
    var m = medidas[key];
    if (m) {
      if (m.qtd != null && m.qtd !== '' && !isNaN(parseFloat(m.qtd))) it.qtd = parseFloat(m.qtd);
      if (m.un && m.un !== '—') it.un = m.un;
    }
    // foraFT: fora da Ficha Técnica (acessório/associação). Explícito se ela
    // mexeu no checkbox "na receita"; senão, padrão pela categoria.
    var foraFT = (m && m.foraFT != null) ? m.foraFT : (CATS_FORA.indexOf((cat || '').toUpperCase()) !== -1);
    if (foraFT) it.foraFT = true;
    itens.push(it);
  }
  // Inclui tanto os checkboxes da lista padrão (#fc-itens-container) quanto os
  // de "Itens já associados (fora das categorias padrão)", que ficam fora
  // desse container — restrito só a #fc-itens-container, esses itens extras
  // (nome/categoria que não bate mais com o Cadastro de Insumos atual) eram
  // descartados a cada salvamento, mesmo marcados (bug real, 2026-08-26).
  document.querySelectorAll('#regras-view-nova-ficha input[type="checkbox"]:checked').forEach(function(cb){
    if (cb.dataset.nome) addItem(cb.dataset.cat, cb.dataset.nome);
  });
  (window._customItens||[]).forEach(function(i){ addItem(i.cat, i.nome); });
  // O copo do select "Copo / Serviço" sempre entra como item da ficha (assim
  // ela escolhe o copo num lugar só) — mesmo que o checkbox dele não exista
  // na lista (copo sem categoria / fora de COPOS E TAÇAS).
  if (copoNome && !itens.some(function(it){ return (it.nome||'').toUpperCase() === copoNome.toUpperCase(); })) {
    var _catCopo = (typeof categoriaAtualDoInsumo === 'function') ? categoriaAtualDoInsumo(copoNome, 'COPOS E TAÇAS') : 'COPOS E TAÇAS';
    addItem(_catCopo, copoNome);
  }
  if (!D.fichas) D.fichas = [];
  var idFicha = idExistente || _gerarId('FIC');
  var ficha = {
    id: idFicha, nome: nome, variantes: variantes,
    copo: copoNome, copoId: '',
    descricao: descricao, metodo: metodo, modoPreparo: modoPreparo, finalizacao: finalizacao,
    itens: itens,
    criadoEm: _fichaAnt.criadoEm || new Date().toISOString(),
  };
  if (idExistente) {
    var idx = D.fichas.findIndex(function(f){return f.id===idExistente;});
    if (idx>=0) D.fichas[idx] = ficha; else D.fichas.push(ficha);
  } else {
    D.fichas.push(ficha);
  }
  window._customItens = [];
  window._fcMedidas = {};
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

// ── Tabela única de Cálculo (Separação → Cálculos) ──────────────────────────
// Uma linha por item de D.regrasItens, com a base de cálculo. Absorveu, em
// 2026-08-28, o que antes eram as abas "Proporções" e "Associações" e a
// "tabela de estimativa" da Separação. rProporcoes fica só por compat.
function rProporcoes() {
  rRegrasKitBase('regras-prop-body', 'proporcoes');
}

function rRegrasKitBase(containerId, contexto) {
  var cont = document.getElementById(containerId);
  if (!cont) return;
  migrarRegrasBaseCalculo();
  migrarInsumosDoKitBase();
  window._rkCtx = { containerId: containerId, contexto: contexto };

  var mostrarAuto = true; // coluna "Auto Orçamento" — antes só na aba Proporções, que saiu
  var regras = getRegrasItens();
  var cargos = _cargosDisponiveis();

  var porCat = {};
  regras.forEach(function(r) { (porCat[r.cat] = porCat[r.cat] || []).push(r); });

  var BASE_OPCOES = [
    ['fixo', 'Fixo (por evento)'],
    ['convidado', 'Por convidado'],
    ['equipe', 'Por equipe'],
    ['cargo', 'Por cargo'],
    ['associado', 'Segue outro item'],
  ];

  // Itens que podem ser "principal" numa regra 'Segue outro item'
  var _bibFlat = [];
  var _bib = getBiblioteca();
  Object.keys(_bib).sort().forEach(function(c) { (_bib[c] || []).forEach(function(it) { _bibFlat.push(it); }); });

  // Todos os nomes de insumo cadastrados — usados pra "revincular" uma regra
  // cujo item foi renomeado no Cadastro de Insumos.
  var _insumosParaRevincular = (typeof getInsumos === 'function' ? getInsumos() : [])
    .map(function(i){ return i.nome; }).filter(Boolean)
    .sort(function(a, b){ return a.localeCompare(b); });

  var html = '<div>' +
    '<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Cada item é escolhido do Cadastro de Insumos e tem uma base de cálculo. As quantidades são geradas automaticamente na Folha de Separação.<br>' +
    '<span style="color:var(--text3)">Fixo = sempre a mesma quantidade por evento · Por convidado / equipe / cargo = quantidade a cada X pessoas · Segue outro item = a quantidade vem de outro item (ex: bico de angostura segue angostura).</span></div>' +
    '<input class="inp" id="rk-busca" type="text" placeholder="Buscar item..." value="' + (window._rkBusca || '').replace(/"/g, '&quot;') + '" oninput="_rkFiltrarBusca(this.value)" style="width:100%;max-width:320px;margin-bottom:14px">' +
    '<div id="rk-busca-vazio" style="display:none;font-size:12px;color:var(--text3);margin-bottom:14px">Nenhum item encontrado.</div>';

  Object.keys(porCat).forEach(function(cat) {
    var itens = porCat[cat];
    html += '<div class="rk-cat-block" style="margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:2px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:grid;gap:6px">';

    itens.forEach(function(r) {
      var ef = _regraBaseEfetiva(r);
      var insumoDaRegra = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(r.item) : null;
      var semInsumo = !insumoDaRegra;              // nome não bate com nenhum insumo (renomeado/excluído)
      var pendente = !insumoDaRegra || !insumoDaRegra.categoria;
      var cols = mostrarAuto ? 'minmax(120px,1fr) 118px 60px 108px 58px 66px 74px 66px 40px' : 'minmax(120px,1fr) 118px 60px 108px 58px 66px 66px 40px';

      html += '<div class="rk-row" data-rk-busca="' + (r.item + ' ' + cat).toLowerCase().replace(/"/g, '&quot;') + '" style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;font-size:11px">' +
        '<div style="display:grid;grid-template-columns:' + cols + ';gap:8px;align-items:end">' +

        '<div><span style="color:var(--text);font-weight:500">' + r.item + '</span>' +
          (semInsumo
            ? '<div style="font-size:9px;color:var(--amber);margin-top:2px">⚠️ esse nome não existe mais no Cadastro de Insumos (renomeado?). Revincular:' +
                '<select onchange="regraKitRevincular(\'' + r.id + '\',this.value)" style="display:block;margin-top:3px;width:100%;font-size:10px;padding:2px 4px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
                  '<option value="">— escolher insumo —</option>' +
                  _insumosParaRevincular.map(function(n){ return '<option value="' + n.replace(/"/g,'&quot;') + '">' + n + '</option>'; }).join('') +
                '</select>' +
              '</div>'
            : (pendente ? '<div style="font-size:9px;color:var(--amber);margin-top:2px">⚠️ falta categoria no Cadastro de Insumos</div>' : '')) +
        '</div>' +

        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">BASE</div>' +
          '<select onchange="regraKitSet(\'' + r.id + '\',\'base\',this.value)" style="width:100%;font-size:10px;padding:3px 4px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
            BASE_OPCOES.map(function(o){ return '<option value="'+o[0]+'"'+(ef.base===o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('') +
          '</select>' +
        '</div>' +

        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">' + (ef.base==='associado' ? 'QUANTOS' : 'QTD') + '</div>' +
          '<input type="number" value="' + ef.valor + '" min="0" step="0.5" onchange="regraKitSet(\'' + r.id + '\',\'valor\',this.value)" style="width:100%;font-size:11px;padding:3px 5px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center">' +
        '</div>' +

        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">' + (ef.base==='fixo' ? '—' : 'A CADA') + '</div>' +
          '<input type="number" value="' + ef.ref + '" min="1" ' + (ef.base==='fixo'?'disabled':'') + ' onchange="regraKitSet(\'' + r.id + '\',\'ref\',this.value)" style="width:100%;font-size:11px;padding:3px 5px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center' + (ef.base==='fixo'?';opacity:.4':'') + '">' +
        '</div>' +

        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">MÍN.</div>' +
          '<input type="number" value="' + (r.min||0) + '" min="0" onchange="regraKitSet(\'' + r.id + '\',\'min\',this.value)" style="width:100%;font-size:11px;padding:3px 5px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center">' +
        '</div>' +

        '<div style="text-align:center"><div style="font-size:9px;color:var(--text3);margin-bottom:2px">SÓ C/ COQUET.</div>' +
          '<input type="checkbox" ' + (r.soSeCardapio?'checked':'') + ' onchange="regraKitSet(\'' + r.id + '\',\'soSeCardapio\',this.checked)" style="cursor:pointer">' +
        '</div>' +

        (mostrarAuto ? '<div style="text-align:center" title="Gera automaticamente em todo orçamento, mesmo sem ficha de coquetel"><div style="font-size:9px;color:var(--text3);margin-bottom:2px">AUTO ORÇ.</div>' +
          '<input type="checkbox" ' + (r.autoOrcamento?'checked':'') + ' onchange="regraKitSet(\'' + r.id + '\',\'autoOrcamento\',this.checked)" style="cursor:pointer">' +
        '</div>' : '') +

        '<div style="text-align:center" title="Não entra sozinho na folha — só quando você marcar na Folha de Separação que o cliente incluiu (ex: shots, gelo translúcido)"><div style="font-size:9px;color:var(--text3);margin-bottom:2px">OPCIONAL</div>' +
          '<input type="checkbox" ' + (r.opcional?'checked':'') + ' onchange="regraKitSet(\'' + r.id + '\',\'opcional\',this.checked)" style="cursor:pointer">' +
        '</div>' +

        '<div style="text-align:center"><button class="btn-sm btn-red" onclick="regraKitExcluir(\'' + r.id + '\')" style="padding:2px 6px">×</button></div>' +

        '</div>' +

        (ef.base === 'cargo'
          ? '<div style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border2);display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
              '<span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Cargos:</span>' +
              (cargos.length ? cargos.map(function(c){
                var m = (r.cargos||[]).indexOf(c.key) !== -1;
                return '<label style="display:flex;align-items:center;gap:4px;font-size:10px;cursor:pointer;background:' + (m?'var(--green-bg)':'var(--bg)') + ';border:1px solid ' + (m?'var(--green-dim)':'var(--border2)') + ';padding:2px 8px;border-radius:12px">' +
                  '<input type="checkbox" ' + (m?'checked':'') + ' onchange="regraKitToggleCargo(\'' + r.id + '\',\'' + c.key + '\',this.checked)"> ' + c.nome + '</label>';
              }).join('') : '<span style="font-size:10px;color:var(--amber)">Nenhum cargo no Cadastro Central → Cargos</span>') +
            '</div>'
          : '') +

        (ef.base === 'associado'
          ? '<div style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border2);display:flex;flex-wrap:wrap;gap:6px;align-items:center">' +
              '<span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Segue o item:</span>' +
              '<select onchange="regraKitSet(\'' + r.id + '\',\'principal\',this.value)" style="font-size:10px;padding:2px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);max-width:240px">' +
                '<option value="">— escolher —</option>' +
                _bibFlat.map(function(it){ return '<option value="' + it.replace(/"/g,'&quot;') + '"' + (ef.principal===it?' selected':'') + '>' + it + '</option>'; }).join('') +
              '</select>' +
              '<span style="font-size:9px;color:var(--text3)">— ' + ef.valor + ' a cada ' + ef.ref + ' do principal</span>' +
              (!ef.principal ? '<span style="font-size:9px;color:var(--amber)">⚠️ escolha o item principal</span>' : '') +
            '</div>'
          : '') +
      '</div>';
    });

    html += '</div></div>';
  });

  // Adicionar item — sempre escolhido da Biblioteca de Itens / Cadastro de
  // Insumos, nunca digitado do zero (nome digitado diferente = regra que não
  // casa com nada e some silenciosamente).
  var biblioteca = getBiblioteca();
  html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;margin-top:8px">' +
    '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">+ Adicionar item</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">' +
      '<div style="flex:1;min-width:160px"><label class="lbl">Categoria</label>' +
        '<select id="rk-cat-' + contexto + '" class="inp" onchange="_rkAtualizarItens()" style="width:100%">' +
          Object.keys(biblioteca).sort().map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('') +
        '</select></div>' +
      '<div style="flex:2;min-width:200px"><label class="lbl">Item</label>' +
        '<select id="rk-item-' + contexto + '" class="inp" style="width:100%"></select></div>' +
      '<button class="btn" onclick="regraKitAdd()" style="background:var(--blue);white-space:nowrap">+ Adicionar</button>' +
    '</div>' +
    '<div style="font-size:10px;color:var(--text3);margin-top:6px">Item novo? <a href="#" onclick="go(\'cadastro\');return false" style="color:var(--blue)">Cadastre no Cadastro de Insumos</a> primeiro.</div>' +
  '</div>';

  html += '<div style="margin:8px 0 20px;display:flex;gap:8px">' +
    '<button class="btn" onclick="salvarRegrasItens()" style="background:var(--green)">💾 Salvar Regras</button>' +
    '<button class="btn" onclick="resetarRegras()" style="background:var(--red-dim);color:var(--red)">↺ Restaurar Padrão</button>' +
  '</div>';

  html += '</div>';
  cont.innerHTML = html;
  _rkAtualizarItens();
  _rkAplicarBusca();
}

// Filtro da barra de busca da tabela de Cálculo. Guarda o termo em
// window._rkBusca pra sobreviver aos re-renders (toda mudança de base/cargo
// redesenha a tabela inteira via _rkRerender).
function _rkFiltrarBusca(v) {
  window._rkBusca = v || '';
  _rkAplicarBusca();
}

function _rkAplicarBusca() {
  var raiz = (window._rkCtx && document.getElementById(window._rkCtx.containerId)) || document;
  var termo = (window._rkBusca || '').trim().toLowerCase();
  var achou = 0;
  raiz.querySelectorAll('.rk-row').forEach(function(row) {
    var ok = !termo || (row.dataset.rkBusca || '').indexOf(termo) !== -1;
    row.style.display = ok ? '' : 'none';
    if (ok) achou++;
  });
  // Esconde blocos de categoria que ficaram sem nenhuma linha visível
  raiz.querySelectorAll('.rk-cat-block').forEach(function(bloco) {
    var algum = Array.prototype.some.call(bloco.querySelectorAll('.rk-row'), function(r) {
      return r.style.display !== 'none';
    });
    bloco.style.display = algum ? '' : 'none';
  });
  var vazio = raiz.querySelector('#rk-busca-vazio');
  if (vazio) vazio.style.display = (termo && achou === 0) ? '' : 'none';
}

function _cargosDisponiveis() {
  var cs = (typeof getCargos === 'function' && getCargos().length) ? getCargos()
         : (typeof _CARGOS_DEF !== 'undefined' ? _CARGOS_DEF : []);
  return cs.map(function(c) { return { key: c.key, nome: c.nome }; });
}

function _rkRerender() {
  var c = window._rkCtx;
  if (c) rRegrasKitBase(c.containerId, c.contexto);
}

function _rkAtualizarItens() {
  var ctx = (window._rkCtx && window._rkCtx.contexto) || 'proporcoes';
  var cat = document.getElementById('rk-cat-' + ctx)?.value;
  var sel = document.getElementById('rk-item-' + ctx);
  if (!cat || !sel) return;
  var biblioteca = getBiblioteca();
  var jaTem = {};
  getRegrasItens().forEach(function(r) { jaTem[r.cat + '|' + r.item] = true; });
  var disp = (biblioteca[cat] || []).filter(function(item) { return !jaTem[cat + '|' + item]; });
  sel.innerHTML = disp.length
    ? disp.map(function(item){ return '<option value="'+item+'">'+item+'</option>'; }).join('')
    : '<option value="">(todos os itens desta categoria já têm regra)</option>';
}

function regraKitSet(id, campo, valor) {
  if (typeof migrarRegrasBaseCalculo === 'function') migrarRegrasBaseCalculo();
  var r = _regraKitPorId(id);
  if (!r) return;
  if (campo === 'soSeCardapio' || campo === 'autoOrcamento' || campo === 'opcional') {
    r[campo] = !!valor;
  } else if (campo === 'principal') {
    r.principal = valor;
  } else if (campo === 'base') {
    r.base = valor;
    if (valor !== 'cargo' && !r.cargos) r.cargos = [];
    if (valor === 'cargo' && !(r.cargos && r.cargos.length)) r.cargos = ['bt', 'hb'];
    if (valor === 'associado') {
      if (r.valor == null || r.valor === 0) r.valor = 1;
      if (r.ref == null || r.ref === 0) r.ref = 1;
    }
  } else {
    r[campo] = parseFloat(valor) || 0;
  }
  // `tipo` (legado, lido pelo Orçamento) acompanha a base nova.
  r.tipo = ({ fixo: 'fixo', convidado: 'convidado', equipe: 'equipe', cargo: 'bartender', associado: 'fixo' })[r.base || 'fixo'];
  if (campo === 'base' || campo === 'principal') _rkRerender();
}

// Reaponta uma regra cujo item foi renomeado/excluído no Cadastro de Insumos
// para um insumo existente, trazendo junto a categoria atual dele.
function regraKitRevincular(id, novoNome) {
  if (!novoNome) return;
  var r = _regraKitPorId(id);
  if (!r) return;
  var insumo = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(novoNome) : null;
  r.item = insumo ? insumo.nome : novoNome;
  if (insumo && insumo.categoria) r.cat = insumo.categoria;
  sv('regrasItens');
  _rkRerender();
}

function regraKitToggleCargo(id, cargoKey, checked) {
  var r = _regraKitPorId(id);
  if (!r) return;
  if (!r.cargos) r.cargos = [];
  var i = r.cargos.indexOf(cargoKey);
  if (checked && i === -1) r.cargos.push(cargoKey);
  if (!checked && i !== -1) r.cargos.splice(i, 1);
}

function regraKitExcluir(id) {
  var r = _regraKitPorId(id);
  if (!r) return;
  if (!confirm('Remover a regra de "' + r.item + '"?')) return;
  D.regrasItens = (D.regrasItens || []).filter(function(x) { return x.id !== id; });
  sv('regrasItens');
  _rkRerender();
}

function regraKitAdd() {
  if (typeof migrarRegrasBaseCalculo === 'function') migrarRegrasBaseCalculo();
  var ctx = (window._rkCtx && window._rkCtx.contexto) || 'proporcoes';
  var cat = document.getElementById('rk-cat-' + ctx)?.value;
  var item = document.getElementById('rk-item-' + ctx)?.value;
  if (!cat || !item) { alert('Escolha uma categoria e um item.'); return; }
  if (D.regrasItens.some(function(r){ return r.cat === cat && r.item === item; })) {
    alert('Esse item já tem uma regra cadastrada.');
    return;
  }
  D.regrasItens.push({
    id: _gerarId('RG'), item: item, cat: cat,
    base: 'fixo', tipo: 'fixo', valor: 1, ref: 1, cargos: [],
    min: 1, soSeCardapio: false, autoOrcamento: false, opcional: false,
  });
  sv('regrasItens');
  _rkRerender();
}

function salvarRegrasItens() {
  sv('regrasItens');
  alert('Regras salvas!');
}

function resetarRegras() {
  if (!confirm('Restaurar todas as regras para o padrão?')) return;
  D.regrasItens = JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
  migrarRegrasBaseCalculo();
  _rkRerender();
}

// Compat: chamadas antigas por índice (não usadas pelas telas atuais).
function atualizarRegra(idx, campo, valor) {
  if (!D.regrasItens || !D.regrasItens.length) D.regrasItens = JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
  if (D.regrasItens[idx]) D.regrasItens[idx][campo] = valor;
}
function adicionarItemRegra() { regraKitAdd(); }
function _rpAtualizarItensDisponiveis() { _rkAtualizarItens(); }

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

  var bibSec = '<div class="sec" style="margin-bottom:12px">' +
    '<div class="sec-head"><span class="sec-title">🥂 Biblioteca de Copos</span></div>' +
    '<div id="copos-biblioteca-body" style="padding:14px 16px"></div></div>';

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
    el.innerHTML = bibSec + '<div class="sec"><div class="sec-head"><span class="sec-title">🥂 Regras de Copos</span></div>' +
      '<div style="padding:20px;color:var(--text3)">Cadastre produtos na categoria COPOS E TAÇAS ou inclua copos nas Fichas de Coquetéis para configurar as regras.</div></div>';
    if (typeof rCoposBiblioteca === 'function') rCoposBiblioteca();
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

  el.innerHTML = bibSec +
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

  if (typeof rCoposBiblioteca === 'function') rCoposBiblioteca();
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

