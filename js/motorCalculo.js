// ─── MOTOR DE CÁLCULO DE ORÇAMENTO ────────────────────────────────────────────
// Módulo novo e independente: NÃO lê nem escreve orc.calcItens/orc.insumos e não
// modifica orcCalc.js/refConsumo.js — só chama funções já existentes desses
// arquivos em modo leitura (_rcMapFichaItemToRC, _calcTipoToGrupoRC, _calcAutoStaff,
// _rcGetStats, _rcSugestao). As abas Calculadora e Cardápio continuam intactas.
//
// Dados de negócio (catálogo de itens, fatores, margem de segurança) vivem em
// D.motorCatalogo / D.motorFatores / D.motorMargemSeguranca (Firestore), editáveis
// pela tela "Regras e Cálculos". As constantes _PADRAO abaixo são só o seed inicial.

// ─── SEEDS (extraídos do Calculos.xlsx original via Excel COM) ───────────────

var MOTOR_LOCAIS = [
  { key:'area_central',       label:'Área Central BH' },
  { key:'jardim_canada',      label:'Jardim Canadá' },
  { key:'reg_metropolitana',  label:'Região Metropolitana' },
  { key:'viagem_60_100',      label:'Viagem 60-100 Km' },
  { key:'viagem_100_200',     label:'Viagem 100-200 Km' },
  { key:'viagem_200_300',     label:'Viagem 200-300 Km' },
  { key:'viagem_300_400',     label:'Viagem 300-400 Km' },
  { key:'viagem_geral',       label:'Viagem (geral)' },
];

// Itens de exemplo (~14) cobrindo os 5 tipos de regra. Preços marcados "placeholder"
// não vieram confirmados da planilha e devem ser ajustados na tela de admin.
var MOTOR_CATALOGO_PADRAO = [
  { id:'MI0001', categoria:'Gelo', nome:'Escama', unidade:'sc 20kg', tipoRegra:'patamar',
    regra:{ modo:'simples', minimo:1, minimoAte:100, incrementoACada:100, incremento:1 },
    precoMedio:11.00, ativo:true },
  { id:'MI0002', categoria:'Gelo', nome:'Cubo', unidade:'sc 5kg', tipoRegra:'patamar',
    regra:{ modo:'faixas', faixas:[
      { ate:60,   formula:'convidados/3.2' },
      { ate:150,  formula:'convidados/5'   },
      { ate:300,  formula:'convidados/6.5' },
      { ate:null, formula:'convidados/8'   },
    ]},
    precoMedio:7.50, ativo:true },
  { id:'MI0003', categoria:'Frutas', nome:'Abacaxi', unidade:'un', tipoRegra:'patamar',
    regra:{ modo:'simples', minimo:2, minimoAte:25, incrementoACada:25, incremento:1 },
    precoMedio:5.45, ativo:true },
  { id:'MI0004', categoria:'Frutas', nome:'Amora', unidade:'kg', tipoRegra:'patamar',
    regra:{ modo:'simples', minimo:2, minimoAte:100, incrementoACada:100, incremento:1 },
    precoMedio:20.39, ativo:true },
  { id:'MI0005', categoria:'Destilados', nome:'Vodka', unidade:'garrafa', tipoRegra:'faixaDestilado',
    regra:{ rcNomeOverride:'Vodka' }, precoMedio:90.00, ativo:true },
  { id:'MI0006', categoria:'Destilados', nome:'Gim', unidade:'garrafa', tipoRegra:'faixaDestilado',
    regra:{ rcNomeOverride:'Gim' }, precoMedio:100.00, ativo:true }, // preço placeholder
  { id:'MI0007', categoria:'Destilados', nome:'Aperol', unidade:'garrafa', tipoRegra:'faixaDestilado',
    regra:{ rcNomeOverride:'Aperol' }, precoMedio:55.00, ativo:true },
  { id:'MI0008', categoria:'Destilados', nome:'Whisky', unidade:'garrafa', tipoRegra:'faixaDestilado',
    regra:{ rcNomeOverride:'Whisky' }, precoMedio:120.00, ativo:true }, // preço placeholder
  { id:'MI0009', categoria:'Descartáveis', nome:'Copo Descartável', unidade:'un', tipoRegra:'porPessoa',
    regra:{ porQtd:1, minimo:50 }, precoMedio:0.30, ativo:true }, // preço placeholder
  { id:'MI0010', categoria:'Bebidas sem Álcool', nome:'Água Tônica', unidade:'un', tipoRegra:'porPessoa',
    regra:{ porQtd:5, minimo:6 }, precoMedio:4.50, ativo:true }, // preço placeholder
  { id:'MI0011', categoria:'Kit Bartender', nome:'Lanche da Equipe', unidade:'un', tipoRegra:'porEquipe',
    regra:{ porMembro:1, minimo:1 }, precoMedio:18.00, ativo:true }, // preço placeholder
  { id:'MI0012', categoria:'Kit Bartender', nome:'Uniforme da Equipe', unidade:'un', tipoRegra:'porEquipe',
    regra:{ porMembro:1, minimo:1 }, precoMedio:0, ativo:true },
  { id:'MI0013', categoria:'Serviços Especiais', nome:'Consultoria de Cardápio', unidade:'serviço', tipoRegra:'manual',
    regra:{}, precoMedio:0, ativo:true },
  { id:'MI0014', categoria:'Decoração', nome:'Arranjo Personalizado', unidade:'un', tipoRegra:'manual',
    regra:{}, precoMedio:0, ativo:true },
];

var MOTOR_FATORES_PADRAO = {
  expectativa:  { muito_baixo:0.70, baixo:0.90, padrao:1.00, alto:1.15, muito_alto:1.35, formatura:1.60 },
  complexidade: { baixa:0.9, padrao:1.0, alta:1.1, muito_alta:1.2 },
};

var MOTOR_MARGEM_PADRAO = {
  matriz: {
    area_central:      [1,2,2,3,3,4,4,5,5,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17],
    jardim_canada:      [2,2,3,3,4,4,5,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17],
    reg_metropolitana:  [2,3,3,4,4,5,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17],
    viagem_60_100:      [3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17],
    viagem_100_200:     [4,4,5,5,5,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17,18],
    viagem_200_300:     [4,4,5,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17,18,18],
    viagem_300_400:     [5,5,6,6,6,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17,18,18,18,18,19],
    viagem_geral:       [6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19],
  },
  fatorValorFaixas: [
    { ate:1000,  fator:1.3 },
    { ate:3000,  fator:1.2 },
    { ate:5000,  fator:1.1 },
    { ate:8000,  fator:1.0 },
    { ate:11000, fator:0.9 },
    { ate:null,  fator:0.8 },
  ],
};

function initMotorCalculo() {
  if (!D.motorCatalogo || !D.motorCatalogo.length) D.motorCatalogo = JSON.parse(JSON.stringify(MOTOR_CATALOGO_PADRAO));
  if (!D.motorFatores) D.motorFatores = JSON.parse(JSON.stringify(MOTOR_FATORES_PADRAO));
  if (!D.motorMargemSeguranca) D.motorMargemSeguranca = JSON.parse(JSON.stringify(MOTOR_MARGEM_PADRAO));
}

// ─── MOTOR (funções puras) ────────────────────────────────────────────────────

// Avaliador de fórmula seguro: só aceita "convidados", números, espaços e + - * / ( ).
// Autoria das fórmulas é só da Juliana via tela de admin (mesmo nível de confiança
// de qualquer outro número de regra já editável hoje no app) — por isso um allowlist
// + Function é suficiente, sem precisar de um parser recursivo dedicado.
function _motorFormula(formulaStr, ctx) {
  var expr = String(formulaStr || '').trim();
  if (!expr) return 0;
  var semVar = expr.replace(/convidados/g, '0');
  if (!/^[0-9+\-*/().\s]+$/.test(semVar)) {
    console.error('Motor: fórmula inválida (caractere não permitido):', formulaStr);
    return 0;
  }
  try {
    // eslint-disable-next-line no-new-func
    return Function('convidados', 'return (' + expr + ');')(ctx.convidados);
  } catch (e) {
    console.error('Motor: erro ao avaliar fórmula:', formulaStr, e);
    return 0;
  }
}

function _motorQtdPatamarSimples(r, convidados) {
  var minimo = Number(r.minimo || 0);
  var minimoAte = Number(r.minimoAte || 0);
  var incrementoACada = Number(r.incrementoACada || 1) || 1;
  var incremento = Number(r.incremento || 0);
  if (convidados <= minimoAte) return Math.ceil(minimo);
  return Math.ceil(minimo + ((convidados - minimoAte) / incrementoACada) * incremento);
}

function _motorQtdPatamarFaixas(r, convidados, ctx) {
  var faixas = r.faixas || [];
  var faixa = null;
  for (var i = 0; i < faixas.length; i++) {
    if (faixas[i].ate == null || convidados <= faixas[i].ate) { faixa = faixas[i]; break; }
  }
  if (!faixa) faixa = faixas[faixas.length - 1];
  if (!faixa) return 0;
  return Math.ceil(_motorFormula(faixa.formula, ctx));
}

// Reaproveita o Ref. Consumo já existente (refConsumo.js) em vez de recriar os
// polinômios de grau 6 da planilha antiga — decisão explícita da Juliana.
function _motorQtdDestilado(item, ctx) {
  var r = item.regra || {};
  var rcNome = r.rcNomeOverride || ((typeof _rcMapFichaItemToRC === 'function') ? _rcMapFichaItemToRC(item.nome) : null);
  if (!rcNome) return 0;
  var grupoRC = (typeof _calcTipoToGrupoRC === 'function') ? _calcTipoToGrupoRC(ctx.tipoEvento) : 'CASAMENTO';
  var stats = (typeof _rcGetStats === 'function') ? _rcGetStats() : {};
  var gd = (stats[grupoRC] || {})[rcNome];
  var avg = (gd && gd.avg != null) ? gd.avg : ((gd && gd.mediaGeral != null) ? gd.mediaGeral : null);
  if (avg == null) return 0;
  return (typeof _rcSugestao === 'function') ? _rcSugestao(avg) : Math.ceil(avg * (avg < 18 ? 1.20 : 1.15));
}

function _motorQtdBase(item, ctx) {
  var r = item.regra || {};
  switch (item.tipoRegra) {
    case 'manual': {
      var found = (ctx.motorItens || []).find(function(mi) { return mi.itemId === item.id; });
      return (found && found.qtdManualOverride != null) ? Number(found.qtdManualOverride) : 0;
    }
    case 'patamar':
      return r.modo === 'faixas' ? _motorQtdPatamarFaixas(r, ctx.convidados, ctx) : _motorQtdPatamarSimples(r, ctx.convidados);
    case 'porPessoa': {
      var porQtd = Number(r.porQtd || 1) || 1;
      return Math.ceil(Math.max(Number(r.minimo || 0), ctx.convidados / porQtd));
    }
    case 'porEquipe': {
      var porMembro = Number(r.porMembro || 1);
      return Math.ceil(Math.max(Number(r.minimo || 0), ctx.equipeTotal * porMembro));
    }
    case 'faixaDestilado':
      return _motorQtdDestilado(item, ctx);
    default:
      return 0;
  }
}

// Faixas de valor do orçamento: todos os limites são "menor que" (confirmado na
// fórmula real do Excel, IF(N2<1000,...IF(N2<3000,...)) — não "entre X e Y".
function _motorFatorValor(custoPresente, faixas) {
  faixas = faixas || MOTOR_MARGEM_PADRAO.fatorValorFaixas;
  for (var i = 0; i < faixas.length; i++) {
    if (faixas[i].ate == null) return faixas[i].fator;
    if (custoPresente < faixas[i].ate) return faixas[i].fator;
  }
  return faixas[faixas.length - 1].fator;
}

function _motorMesesEntreDatas(dataBase, dataEvento) {
  if (!dataBase || !dataEvento) return 0;
  var ms = new Date(dataEvento) - new Date(dataBase);
  if (!isFinite(ms) || ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 30));
}

// Ponto de entrada único do motor. Função pura: lê D.motorCatalogo/D.motorFatores/
// D.motorMargemSeguranca e orc.motorParams/orc.motorItens, não muta D nem chama sv().
function motorCalcular(orc) {
  var mp = orc.motorParams || {};
  var convidados = Number(orc.convidados || 0);
  var tipoEvento = (orc.calcParams && orc.calcParams.tipoEvento) || 'outros';
  var equipeTotal = 0;
  if (typeof _calcAutoStaff === 'function') {
    var autoS = _calcAutoStaff(convidados);
    equipeTotal = Object.keys(autoS).reduce(function(s, k) { return s + (autoS[k] || 0); }, 0);
  }

  var ctx = { convidados: convidados, tipoEvento: tipoEvento, equipeTotal: equipeTotal, motorItens: orc.motorItens || [] };

  var catalogo = D.motorCatalogo || MOTOR_CATALOGO_PADRAO;
  var itensSelecionados = (orc.motorItens || [])
    .map(function(mi) { return catalogo.find(function(c) { return c.id === mi.itemId; }); })
    .filter(Boolean);

  var fatoresData = D.motorFatores || MOTOR_FATORES_PADRAO;
  var nivelExp = mp.nivelExpectativa || 'padrao';
  var fatorExp = (fatoresData.expectativa && fatoresData.expectativa[nivelExp] != null) ? fatoresData.expectativa[nivelExp] : 1;

  var itensCalculados = itensSelecionados.map(function(item) {
    var qtdBase = _motorQtdBase(item, ctx);
    // manual (sem fórmula) e faixaDestilado (já usa a margem de segurança própria do
    // Ref.Consumo) não recebem o fator de expectativa por cima — mesmo comportamento
    // da planilha original (colunas AZ/BA dos destilados não usam a tabela de expectativa).
    var qtdFinal = (item.tipoRegra === 'manual' || item.tipoRegra === 'faixaDestilado')
      ? qtdBase
      : Math.ceil(fatorExp * qtdBase);
    var precoMedio = Number(item.precoMedio || 0);
    return {
      itemId: item.id, nome: item.nome, categoria: item.categoria,
      quantidadeBase: qtdBase, quantidadeFinal: qtdFinal,
      precoMedio: precoMedio, subtotal: Math.round(qtdFinal * precoMedio * 100) / 100,
      origem: item.tipoRegra,
    };
  });

  var custoPresente = Math.round(itensCalculados.reduce(function(s, i) { return s + i.subtotal; }, 0) * 100) / 100;

  var margemData = D.motorMargemSeguranca || MOTOR_MARGEM_PADRAO;
  var meses = _motorMesesEntreDatas(mp.dataBaseOrcamento, orc.dataEvento);
  var localArr = (margemData.matriz && margemData.matriz[mp.local]) || [];
  var mesIdx = Math.min(Math.max(meses, 0), Math.max(localArr.length - 1, 0));
  var fatorMatriz = localArr.length ? Number(localArr[mesIdx] || 0) : 0;
  var fatorValor = _motorFatorValor(custoPresente, margemData.fatorValorFaixas);
  var complexidadeKey = mp.complexidade || 'padrao';
  var fatorComplexidade = (fatoresData.complexidade && fatoresData.complexidade[complexidadeKey] != null) ? fatoresData.complexidade[complexidadeKey] : 1;
  var margemSegurancaPct = Math.floor(fatorMatriz * fatorValor * fatorComplexidade) / 100;

  var custoEstimado = Math.round(custoPresente * (1 + margemSegurancaPct) * 100) / 100;
  var margemLucro = Number(mp.margemLucro != null ? mp.margemLucro : 30) / 100;
  var lucro = Math.round(custoEstimado * margemLucro * 100) / 100;
  var aliquota = Number(mp.aliquotaImposto || 0) / 100;
  var valorTotal = Math.round((custoEstimado + lucro) * (1 + aliquota) * 100) / 100;
  var valorPorPessoa = convidados > 0 ? Math.round((valorTotal / convidados) * 100) / 100 : 0;

  return {
    itensCalculados: itensCalculados, custoPresente: custoPresente, margemSeguranca: margemSegurancaPct,
    custoEstimado: custoEstimado, lucro: lucro, valorTotal: valorTotal, valorPorPessoa: valorPorPessoa,
    debug: { meses: meses, fatorMatriz: fatorMatriz, fatorValor: fatorValor, fatorComplexidade: fatorComplexidade },
  };
}

// ─── ADMIN: CATÁLOGO DE ITENS ─────────────────────────────────────────────────

var _motorRegraAberta = null;   // id do item com o painel de regra expandido
var _motorCatFiltro    = { cat: '', busca: '' };

function _motorRegraLabel(tipo) {
  return { manual:'Manual', patamar:'Patamar', faixaDestilado:'Faixa (Destilado)', porPessoa:'Por Pessoa', porEquipe:'Por Equipe' }[tipo] || tipo;
}

function _motorRegraDefault(tipo) {
  if (tipo === 'patamar') return { modo:'simples', minimo:1, minimoAte:100, incrementoACada:100, incremento:1 };
  if (tipo === 'porPessoa') return { porQtd:20, minimo:1 };
  if (tipo === 'porEquipe') return { porMembro:1, minimo:1 };
  if (tipo === 'faixaDestilado') return {};
  return {};
}

function rMotorCatalogo() {
  var el = document.getElementById('regras-view-motor-catalogo');
  if (!el) return;
  var catalogo = D.motorCatalogo || [];

  var categorias = Array.from(new Set(catalogo.map(function(i) { return i.categoria; }))).sort();
  var busca = (_motorCatFiltro.busca || '').toLowerCase();

  var visiveis = catalogo
    .map(function(item, idx) { return { item: item, idx: idx }; })
    .filter(function(e) {
      if (_motorCatFiltro.cat && e.item.categoria !== _motorCatFiltro.cat) return false;
      if (busca && e.item.nome.toLowerCase().indexOf(busca) === -1) return false;
      return true;
    });

  var porCat = {};
  visiveis.forEach(function(e) {
    if (!porCat[e.item.categoria]) porCat[e.item.categoria] = [];
    porCat[e.item.categoria].push(e);
  });

  var html = '<div class="sec">' +
    '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
      '<span class="sec-title">🧾 Catálogo de Itens (Motor)</span>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="btn" onclick="adicionarItemCatalogo()" style="background:var(--blue)">+ Novo Item</button>' +
        '<button class="btn" onclick="salvarMotorCatalogo()" style="background:var(--green)">💾 Salvar</button>' +
      '</div>' +
    '</div>' +
    '<div style="padding:12px 16px;display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">' +
      '<div><label class="lbl">Categoria</label><select class="inp" onchange="motorSetFiltroCat(this.value)">' +
        '<option value="">Todas</option>' +
        categorias.map(function(c) { return '<option value="' + c + '"' + (_motorCatFiltro.cat === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') +
      '</select></div>' +
      '<div><label class="lbl">Buscar</label><input class="inp" type="text" value="' + (_motorCatFiltro.busca || '') + '" placeholder="Nome do item..." onchange="motorSetFiltroBusca(this.value)"></div>' +
    '</div>';

  Object.keys(porCat).sort().forEach(function(cat) {
    html += '<div style="padding:0 16px 12px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:2px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:grid;gap:6px">';

    porCat[cat].forEach(function(e) {
      var item = e.item, idx = e.idx;
      html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px">' +
        '<div style="display:grid;grid-template-columns:1fr 90px 150px 100px 60px 90px;gap:8px;align-items:center;font-size:11px">' +
          '<input type="text" value="' + item.nome + '" style="font-size:11px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text)" onchange="atualizarCatalogoItem(' + idx + ',\'nome\',this.value)">' +
          '<input type="text" value="' + item.unidade + '" style="font-size:11px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text)" onchange="atualizarCatalogoItem(' + idx + ',\'unidade\',this.value)">' +
          '<select style="font-size:10px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text)" onchange="setCatalogoTipoRegra(' + idx + ',this.value)">' +
            ['manual','patamar','faixaDestilado','porPessoa','porEquipe'].map(function(t) {
              return '<option value="' + t + '"' + (item.tipoRegra === t ? ' selected' : '') + '>' + _motorRegraLabel(t) + '</option>';
            }).join('') +
          '</select>' +
          '<input type="number" step="0.01" min="0" value="' + item.precoMedio + '" style="font-size:11px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono)" onchange="atualizarCatalogoItem(' + idx + ',\'precoMedio\',parseFloat(this.value)||0)">' +
          '<div style="text-align:center"><input type="checkbox" ' + (item.ativo ? 'checked' : '') + ' onchange="atualizarCatalogoItem(' + idx + ',\'ativo\',this.checked)" style="cursor:pointer"></div>' +
          '<div style="display:flex;gap:4px;justify-content:flex-end">' +
            '<button class="btn-sm" onclick="motorToggleRegra(\'' + item.id + '\')">⚙️ Regra</button>' +
            '<button class="btn-sm btn-red" onclick="excluirItemCatalogo(' + idx + ')">🗑️</button>' +
          '</div>' +
        '</div>' +
        (_motorRegraAberta === item.id ? _motorRenderPainelRegra(item, idx) : '') +
      '</div>';
    });

    html += '</div></div>';
  });

  if (!visiveis.length) html += '<div style="padding:20px;text-align:center;color:var(--text3)">Nenhum item encontrado.</div>';

  html += '</div>';
  el.innerHTML = html;
}

function _motorRenderPainelRegra(item, idx) {
  var r = item.regra || {};
  var html = '<div style="margin-top:8px;padding:10px;background:var(--bg);border:1px solid var(--border2);border-radius:6px;font-size:11px">';

  if (item.tipoRegra === 'manual') {
    html += '<span style="color:var(--text3)">Quantidade digitada manualmente em cada orçamento — sem fórmula.</span>';
  } else if (item.tipoRegra === 'porPessoa') {
    html += '<div style="display:flex;gap:16px">' +
      '<div><label class="lbl">1 unidade a cada (convidados)</label><input type="number" step="0.1" min="0.1" value="' + (r.porQtd||0) + '" class="inp" style="width:100px" onchange="atualizarCatalogoRegra(' + idx + ',\'porQtd\',parseFloat(this.value)||1)"></div>' +
      '<div><label class="lbl">Mínimo</label><input type="number" min="0" value="' + (r.minimo||0) + '" class="inp" style="width:100px" onchange="atualizarCatalogoRegra(' + idx + ',\'minimo\',parseFloat(this.value)||0)"></div>' +
    '</div>';
  } else if (item.tipoRegra === 'porEquipe') {
    html += '<div style="display:flex;gap:16px">' +
      '<div><label class="lbl">Unidades por membro da equipe</label><input type="number" step="0.1" min="0" value="' + (r.porMembro||0) + '" class="inp" style="width:100px" onchange="atualizarCatalogoRegra(' + idx + ',\'porMembro\',parseFloat(this.value)||0)"></div>' +
      '<div><label class="lbl">Mínimo</label><input type="number" min="0" value="' + (r.minimo||0) + '" class="inp" style="width:100px" onchange="atualizarCatalogoRegra(' + idx + ',\'minimo\',parseFloat(this.value)||0)"></div>' +
    '</div>';
  } else if (item.tipoRegra === 'faixaDestilado') {
    var autoResolve = (typeof _rcMapFichaItemToRC === 'function') ? (_rcMapFichaItemToRC(item.nome) || '—') : '—';
    html += '<div><label class="lbl">Nome no Ref. Consumo (deixe vazio para detectar automaticamente pelo nome do item)</label>' +
      '<input type="text" value="' + (r.rcNomeOverride||'') + '" class="inp" style="width:220px" placeholder="Ex: Vodka" onchange="atualizarCatalogoRegra(' + idx + ',\'rcNomeOverride\',this.value)"></div>' +
      '<div style="margin-top:6px;color:var(--text3)">Detecção automática pelo nome atual: <strong>' + autoResolve + '</strong></div>';
  } else if (item.tipoRegra === 'patamar') {
    html += '<div style="margin-bottom:8px"><label class="lbl">Modo</label>' +
      '<select class="inp" style="width:140px" onchange="setCatalogoModoPatamar(' + idx + ',this.value)">' +
        '<option value="simples"' + (r.modo!=='faixas'?' selected':'') + '>Mínimo + incremento</option>' +
        '<option value="faixas"' + (r.modo==='faixas'?' selected':'') + '>Múltiplas faixas</option>' +
      '</select></div>';
    if (r.modo === 'faixas') {
      html += '<div style="display:grid;gap:6px">';
      (r.faixas||[]).forEach(function(f, fi) {
        html += '<div style="display:flex;gap:8px;align-items:center">' +
          '<label style="font-size:9px;color:var(--text3)">Até</label>' +
          '<input type="number" min="0" value="' + (f.ate==null?'':f.ate) + '" placeholder="(final)" style="width:80px;font-size:11px;padding:3px 6px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text)" onchange="atualizarFaixaPatamar(' + idx + ',' + fi + ',\'ate\',this.value===\'\'?null:parseFloat(this.value))">' +
          '<label style="font-size:9px;color:var(--text3)">Fórmula</label>' +
          '<input type="text" value="' + f.formula + '" style="flex:1;font-size:11px;padding:3px 6px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono)" onchange="atualizarFaixaPatamar(' + idx + ',' + fi + ',\'formula\',this.value)">' +
          '<button class="btn-sm btn-red" onclick="removerFaixaPatamar(' + idx + ',' + fi + ')">×</button>' +
        '</div>';
      });
      html += '</div><button class="btn-sm" style="margin-top:6px" onclick="adicionarFaixaPatamar(' + idx + ')">+ Faixa</button>';
    } else {
      html += '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
        '<div><label class="lbl">Mínimo</label><input type="number" min="0" value="' + (r.minimo||0) + '" class="inp" style="width:80px" onchange="atualizarCatalogoRegra(' + idx + ',\'minimo\',parseFloat(this.value)||0)"></div>' +
        '<div><label class="lbl">Até (convidados)</label><input type="number" min="0" value="' + (r.minimoAte||0) + '" class="inp" style="width:80px" onchange="atualizarCatalogoRegra(' + idx + ',\'minimoAte\',parseFloat(this.value)||0)"></div>' +
        '<div><label class="lbl">Incremento a cada</label><input type="number" min="1" value="' + (r.incrementoACada||1) + '" class="inp" style="width:80px" onchange="atualizarCatalogoRegra(' + idx + ',\'incrementoACada\',parseFloat(this.value)||1)"></div>' +
        '<div><label class="lbl">Incremento</label><input type="number" min="0" value="' + (r.incremento||0) + '" class="inp" style="width:80px" onchange="atualizarCatalogoRegra(' + idx + ',\'incremento\',parseFloat(this.value)||0)"></div>' +
      '</div>';
    }
  }

  html += '</div>';
  return html;
}

function motorSetFiltroCat(v) { _motorCatFiltro.cat = v; rMotorCatalogo(); }
function motorSetFiltroBusca(v) { _motorCatFiltro.busca = v; rMotorCatalogo(); }
function motorToggleRegra(itemId) { _motorRegraAberta = (_motorRegraAberta === itemId) ? null : itemId; rMotorCatalogo(); }

function atualizarCatalogoItem(idx, campo, valor) {
  if (!D.motorCatalogo || !D.motorCatalogo[idx]) return;
  D.motorCatalogo[idx][campo] = valor;
  if (campo !== 'nome' && campo !== 'unidade' && campo !== 'precoMedio' && campo !== 'ativo') rMotorCatalogo();
}

function setCatalogoTipoRegra(idx, tipo) {
  if (!D.motorCatalogo || !D.motorCatalogo[idx]) return;
  D.motorCatalogo[idx].tipoRegra = tipo;
  D.motorCatalogo[idx].regra = _motorRegraDefault(tipo);
  rMotorCatalogo();
}

function setCatalogoModoPatamar(idx, modo) {
  var item = D.motorCatalogo && D.motorCatalogo[idx];
  if (!item) return;
  item.regra = modo === 'faixas'
    ? { modo:'faixas', faixas:[{ ate:null, formula:'convidados/10' }] }
    : { modo:'simples', minimo:1, minimoAte:100, incrementoACada:100, incremento:1 };
  rMotorCatalogo();
}

function atualizarCatalogoRegra(idx, campo, valor) {
  var item = D.motorCatalogo && D.motorCatalogo[idx];
  if (!item) return;
  if (!item.regra) item.regra = {};
  item.regra[campo] = valor;
}

function adicionarFaixaPatamar(idx) {
  var item = D.motorCatalogo && D.motorCatalogo[idx];
  if (!item || !item.regra || !item.regra.faixas) return;
  item.regra.faixas.push({ ate:null, formula:'convidados/10' });
  rMotorCatalogo();
}

function removerFaixaPatamar(idx, faixaIdx) {
  var item = D.motorCatalogo && D.motorCatalogo[idx];
  if (!item || !item.regra || !item.regra.faixas) return;
  item.regra.faixas.splice(faixaIdx, 1);
  rMotorCatalogo();
}

function atualizarFaixaPatamar(idx, faixaIdx, campo, valor) {
  var item = D.motorCatalogo && D.motorCatalogo[idx];
  if (!item || !item.regra || !item.regra.faixas || !item.regra.faixas[faixaIdx]) return;
  item.regra.faixas[faixaIdx][campo] = valor;
}

function adicionarItemCatalogo() {
  var nome = prompt('Nome do item:');
  if (!nome) return;
  var categoria = prompt('Categoria (ex: Gelo, Frutas, Destilados):') || 'Outros';
  if (!D.motorCatalogo) D.motorCatalogo = [];
  D.motorCatalogo.push({
    id: _gerarId('MI'), categoria: categoria, nome: nome, unidade: 'un',
    tipoRegra: 'manual', regra: {}, precoMedio: 0, ativo: true,
  });
  rMotorCatalogo();
}

function excluirItemCatalogo(idx) {
  if (!confirm('Excluir este item do catálogo?')) return;
  D.motorCatalogo.splice(idx, 1);
  rMotorCatalogo();
}

function salvarMotorCatalogo() {
  sv('motorCatalogo');
  alert2('Catálogo salvo!');
}

// ─── ADMIN: FATORES (EXPECTATIVA / COMPLEXIDADE) ──────────────────────────────

function rMotorFatores() {
  var el = document.getElementById('regras-view-motor-fatores');
  if (!el) return;
  var f = D.motorFatores || MOTOR_FATORES_PADRAO;
  var expLabels = { muito_baixo:'Muito baixo', baixo:'Baixo', padrao:'Padrão', alto:'Alto', muito_alto:'Muito alto', formatura:'Formatura' };
  var cxLabels  = { baixa:'Baixa', padrao:'Padrão', alta:'Alta', muito_alta:'Muito alta' };

  el.innerHTML = '<div class="sec">' +
    '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center">' +
      '<span class="sec-title">🎚️ Fatores Multiplicadores (Motor)</span>' +
      '<button class="btn" onclick="salvarMotorFatores()" style="background:var(--green)">💾 Salvar</button>' +
    '</div>' +
    '<div style="padding:14px 16px;display:flex;gap:32px;flex-wrap:wrap">' +
      '<div>' +
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:8px">Expectativa de Consumo</div>' +
        Object.keys(expLabels).map(function(k) {
          return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px">' +
            '<label style="font-size:11px;color:var(--text2);min-width:110px">' + expLabels[k] + '</label>' +
            '<input id="mf-exp-' + k + '" type="number" step="0.01" min="0" value="' + (f.expectativa[k] != null ? f.expectativa[k] : 1) + '" style="width:80px;font-size:11px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono);text-align:center">' +
          '</div>';
        }).join('') +
        '<div style="font-size:9px;color:var(--amber);margin-top:4px;max-width:260px">"Formatura" está nesta lista porque assim está na planilha original (é usada como nível de consumo, não só tipo de evento) — mantido de propósito.</div>' +
      '</div>' +
      '<div>' +
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:8px">Complexidade do Evento</div>' +
        Object.keys(cxLabels).map(function(k) {
          return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px">' +
            '<label style="font-size:11px;color:var(--text2);min-width:110px">' + cxLabels[k] + '</label>' +
            '<input id="mf-cx-' + k + '" type="number" step="0.01" min="0" value="' + (f.complexidade[k] != null ? f.complexidade[k] : 1) + '" style="width:80px;font-size:11px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono);text-align:center">' +
          '</div>';
        }).join('') +
        '<div style="font-size:9px;color:var(--text3);margin-top:4px;max-width:260px">Multiplica dentro da fórmula de Margem de Segurança.</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function salvarMotorFatores() {
  if (!D.motorFatores) D.motorFatores = JSON.parse(JSON.stringify(MOTOR_FATORES_PADRAO));
  ['muito_baixo','baixo','padrao','alto','muito_alto','formatura'].forEach(function(k) {
    var el = document.getElementById('mf-exp-' + k);
    if (el) D.motorFatores.expectativa[k] = parseFloat(el.value) || 0;
  });
  ['baixa','padrao','alta','muito_alta'].forEach(function(k) {
    var el = document.getElementById('mf-cx-' + k);
    if (el) D.motorFatores.complexidade[k] = parseFloat(el.value) || 0;
  });
  sv('motorFatores');
  alert2('Fatores salvos!');
}

// ─── ADMIN: MARGEM DE SEGURANÇA (FAIXAS + MATRIZ) ─────────────────────────────

function rMotorMargem() {
  var el = document.getElementById('regras-view-motor-margem');
  if (!el) return;
  var m = D.motorMargemSeguranca || MOTOR_MARGEM_PADRAO;
  var faixas = m.fatorValorFaixas || [];
  var meses = (m.matriz && m.matriz[MOTOR_LOCAIS[0].key]) ? m.matriz[MOTOR_LOCAIS[0].key].length : 49;

  var html = '<div class="sec" style="margin-bottom:12px">' +
    '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center">' +
      '<span class="sec-title">🛡️ Faixas por Valor do Orçamento</span>' +
    '</div>' +
    '<div style="padding:12px 16px;font-size:11px;color:var(--text3);margin-bottom:4px">Todos os limites são "menor que" (confirmado na planilha original).</div>' +
    '<div style="padding:0 16px 14px;display:grid;gap:6px">' +
      faixas.map(function(f, i) {
        return '<div style="display:flex;align-items:center;gap:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:6px 10px;font-size:11px">' +
          '<span style="min-width:70px;color:var(--text3)">Menor que</span>' +
          '<input id="mm-faixa-' + i + '-ate" type="number" min="0" value="' + (f.ate==null?'':f.ate) + '" placeholder="(último)" style="width:100px;font-size:11px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono)">' +
          '<span style="color:var(--text3)">→ fator</span>' +
          '<input id="mm-faixa-' + i + '-fator" type="number" step="0.01" min="0" value="' + f.fator + '" style="width:80px;font-size:11px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono)">' +
        '</div>';
      }).join('') +
    '</div>' +
  '</div>';

  html += '<div class="sec">' +
    '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center">' +
      '<span class="sec-title">🗺️ Matriz Local × Meses de Antecedência</span>' +
      '<button class="btn" onclick="salvarMotorMargem()" style="background:var(--green)">💾 Salvar</button>' +
    '</div>' +
    '<div style="padding:12px 16px;overflow-x:auto">' +
      '<table style="border-collapse:collapse;font-size:9px;font-family:var(--mono)">' +
        '<thead><tr>' +
          '<th style="padding:3px 6px;text-align:left;color:var(--text3);position:sticky;left:0;background:var(--bg2)">Local</th>' +
          Array.from({length:meses}, function(_, i) { return '<th style="padding:3px 5px;color:var(--text3);font-weight:500">' + i + '</th>'; }).join('') +
        '</tr></thead>' +
        '<tbody>' +
          MOTOR_LOCAIS.map(function(loc) {
            var arr = (m.matriz && m.matriz[loc.key]) || [];
            return '<tr>' +
              '<td style="padding:3px 6px;color:var(--text2);white-space:nowrap;position:sticky;left:0;background:var(--bg2)">' + loc.label + '</td>' +
              arr.map(function(v, mesIdx) {
                var cellId = 'mm-cel-' + loc.key + '-' + mesIdx;
                return '<td style="padding:2px;text-align:center;border:1px solid var(--border)">' +
                  '<input id="' + cellId + '" type="number" value="' + v + '" style="width:32px;font-size:9px;padding:2px;text-align:center;background:var(--bg3);border:none;color:var(--text);font-family:var(--mono)">' +
                '</td>';
              }).join('') +
            '</tr>';
          }).join('') +
        '</tbody>' +
      '</table>' +
    '</div>' +
    '<div style="padding:0 16px 14px">' +
      '<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;margin-bottom:6px">Colar matriz (CSV/TSV) — uma linha por local, na mesma ordem acima, 49 valores por linha</div>' +
      '<textarea id="mm-import-textarea" rows="3" style="width:100%;font-size:10px;font-family:var(--mono);background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);padding:6px"></textarea>' +
      '<button class="btn-sm" style="margin-top:6px" onclick="importarMatrizColada()">Importar matriz colada</button>' +
    '</div>' +
  '</div>';

  el.innerHTML = html;
}

function salvarMotorMargem() {
  if (!D.motorMargemSeguranca) D.motorMargemSeguranca = JSON.parse(JSON.stringify(MOTOR_MARGEM_PADRAO));
  var faixas = D.motorMargemSeguranca.fatorValorFaixas || [];
  faixas.forEach(function(f, i) {
    var ateEl = document.getElementById('mm-faixa-' + i + '-ate');
    var fatorEl = document.getElementById('mm-faixa-' + i + '-fator');
    if (ateEl) f.ate = ateEl.value === '' ? null : parseFloat(ateEl.value);
    if (fatorEl) f.fator = parseFloat(fatorEl.value) || 0;
  });
  MOTOR_LOCAIS.forEach(function(loc) {
    var arr = D.motorMargemSeguranca.matriz[loc.key] || [];
    arr.forEach(function(_, mesIdx) {
      var cel = document.getElementById('mm-cel-' + loc.key + '-' + mesIdx);
      if (cel) arr[mesIdx] = parseFloat(cel.value) || 0;
    });
  });
  sv('motorMargemSeguranca');
  alert2('Margem de segurança salva!');
}

function importarMatrizColada() {
  var txt = (document.getElementById('mm-import-textarea') || {}).value || '';
  var linhas = txt.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
  if (!linhas.length) { alert2('Cole os dados antes de importar.', 'error'); return; }
  if (!D.motorMargemSeguranca) D.motorMargemSeguranca = JSON.parse(JSON.stringify(MOTOR_MARGEM_PADRAO));
  linhas.forEach(function(linha, i) {
    if (i >= MOTOR_LOCAIS.length) return;
    var valores = linha.split(/\t|,/).map(function(v) { return parseFloat(v.trim()); }).filter(function(v) { return !isNaN(v); });
    if (valores.length) D.motorMargemSeguranca.matriz[MOTOR_LOCAIS[i].key] = valores;
  });
  rMotorMargem();
  alert2('Matriz atualizada — confira e clique em Salvar.');
}

// ─── 6ª ABA DO ORÇAMENTO: "MOTOR" ─────────────────────────────────────────────
// Não lê nem escreve orc.calcItens/orc.insumos — só orc.motorParams/orc.motorItens.

var MOTOR_NIVEIS_EXPECTATIVA = ['muito_baixo','baixo','padrao','alto','muito_alto','formatura'];
var MOTOR_NIVEIS_COMPLEXIDADE = ['baixa','padrao','alta','muito_alta'];

function _motorLabel(key) {
  return { muito_baixo:'Muito baixo', baixo:'Baixo', padrao:'Padrão', alto:'Alto', muito_alto:'Muito alto', formatura:'Formatura',
           baixa:'Baixa', alta:'Alta', muito_alta:'Muito alta' }[key] || key;
}

function rOrcMotor(orc) {
  var el = document.getElementById('orc-det-content');
  if (!el) return;

  if (!orc.motorParams) {
    orc.motorParams = {
      dataBaseOrcamento: (orc.criadoEm || new Date().toISOString()).slice(0, 10),
      local: (orc.calcParams && orc.calcParams.local) ? _motorMapCalcLocalParaMotor(orc.calcParams.local) : MOTOR_LOCAIS[0].key,
      nivelExpectativa: 'padrao', complexidade: 'padrao', margemLucro: 30, aliquotaImposto: 0,
    };
  }
  if (!orc.motorItens) orc.motorItens = [];

  var mp = orc.motorParams;
  var catalogo = D.motorCatalogo || MOTOR_CATALOGO_PADRAO;
  var porCat = {};
  catalogo.filter(function(i) { return i.ativo !== false; }).forEach(function(item) {
    if (!porCat[item.categoria]) porCat[item.categoria] = [];
    porCat[item.categoria].push(item);
  });

  var paramsHtml = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">⚙️ Parâmetros do Motor</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
      '<div><label class="lbl">Data base do orçamento</label><input type="date" class="inp" value="' + mp.dataBaseOrcamento + '" onchange="motorSetParam(\'' + orc.id + '\',\'dataBaseOrcamento\',this.value)"></div>' +
      '<div><label class="lbl">Local</label><select class="inp" onchange="motorSetParam(\'' + orc.id + '\',\'local\',this.value)">' +
        MOTOR_LOCAIS.map(function(l) { return '<option value="' + l.key + '"' + (mp.local === l.key ? ' selected' : '') + '>' + l.label + '</option>'; }).join('') +
      '</select></div>' +
      '<div><label class="lbl">Expectativa de Consumo</label><select class="inp" onchange="motorSetParam(\'' + orc.id + '\',\'nivelExpectativa\',this.value)">' +
        MOTOR_NIVEIS_EXPECTATIVA.map(function(k) { return '<option value="' + k + '"' + (mp.nivelExpectativa === k ? ' selected' : '') + '>' + _motorLabel(k) + '</option>'; }).join('') +
      '</select></div>' +
      '<div><label class="lbl">Complexidade do Evento</label><select class="inp" onchange="motorSetParam(\'' + orc.id + '\',\'complexidade\',this.value)">' +
        MOTOR_NIVEIS_COMPLEXIDADE.map(function(k) { return '<option value="' + k + '"' + (mp.complexidade === k ? ' selected' : '') + '>' + _motorLabel(k) + '</option>'; }).join('') +
      '</select></div>' +
      '<div><label class="lbl">Margem de Lucro (%)</label><input type="number" step="1" min="0" class="inp" style="width:90px" value="' + mp.margemLucro + '" onchange="motorSetParam(\'' + orc.id + '\',\'margemLucro\',parseFloat(this.value)||0)"></div>' +
      '<div><label class="lbl">Alíquota de Imposto (%)</label><input type="number" step="1" min="0" class="inp" style="width:90px" value="' + mp.aliquotaImposto + '" onchange="motorSetParam(\'' + orc.id + '\',\'aliquotaImposto\',parseFloat(this.value)||0)"></div>' +
    '</div>' +
  '</div>';

  var itensHtml = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">🧾 Itens do Catálogo</div>' +
    Object.keys(porCat).sort().map(function(cat) {
      return '<div style="margin-bottom:12px">' +
        '<div style="font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;border-bottom:1px solid var(--border2);padding-bottom:4px;margin-bottom:6px">' + cat + '</div>' +
        porCat[cat].map(function(item) {
          var sel = orc.motorItens.find(function(mi) { return mi.itemId === item.id; });
          var checked = !!sel;
          var manualInput = (checked && item.tipoRegra === 'manual')
            ? '<input type="number" min="0" style="width:70px;text-align:center;font-size:11px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono)" value="' + (sel.qtdManualOverride != null ? sel.qtdManualOverride : '') + '" placeholder="qtd" onchange="motorSetQtdManual(\'' + orc.id + '\',\'' + item.id + '\',this.value)">'
            : '';
          return '<label style="display:flex;align-items:center;gap:8px;padding:5px 4px;font-size:12px;cursor:pointer">' +
            '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="motorToggleItem(\'' + orc.id + '\',\'' + item.id + '\',this.checked)">' +
            '<span style="flex:1;color:var(--text)">' + item.nome + '</span>' +
            '<span style="font-size:9px;color:var(--text3)">' + _motorRegraLabel(item.tipoRegra) + '</span>' +
            manualInput +
          '</label>';
        }).join('');
    }).join('') +
  '</div>';

  var resultado = motorCalcular(orc);
  var resumoHtml = '<div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid #8B5CF6;border-radius:var(--radius);padding:16px">' +
    '<div style="font-size:11px;font-weight:700;color:#8B5CF6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">📊 Resumo do Motor</div>' +
    '<div style="display:grid;grid-template-columns:1fr auto;gap:6px 16px;font-size:13px">' +
      '<span style="color:var(--text3)">Custo Presente</span><span style="text-align:right;font-family:var(--mono);color:var(--text)">' + fR(resultado.custoPresente) + '</span>' +
      '<span style="color:var(--text3)">Margem de Segurança</span><span style="text-align:right;font-family:var(--mono);color:var(--text)">' + (resultado.margemSeguranca * 100).toFixed(0) + '%</span>' +
      '<span style="color:var(--text3)">Custo Estimado</span><span style="text-align:right;font-family:var(--mono);color:var(--text)">' + fR(resultado.custoEstimado) + '</span>' +
      '<span style="color:var(--text3)">Lucro</span><span style="text-align:right;font-family:var(--mono);color:var(--text)">' + fR(resultado.lucro) + '</span>' +
      '<span style="font-weight:700;color:var(--text)">Valor Total</span><span style="text-align:right;font-family:var(--mono);font-weight:700;color:#8B5CF6">' + fR(resultado.valorTotal) + '</span>' +
      '<span style="color:var(--text3)">Valor por Pessoa</span><span style="text-align:right;font-family:var(--mono);color:var(--text)">' + fR(resultado.valorPorPessoa) + '</span>' +
    '</div>' +
    '<div style="margin-top:10px;font-size:9px;color:var(--text3)">meses: ' + resultado.debug.meses + ' · fator matriz: ' + resultado.debug.fatorMatriz + ' · fator valor: ' + resultado.debug.fatorValor + ' · fator complexidade: ' + resultado.debug.fatorComplexidade + '</div>' +
  '</div>';

  el.innerHTML = paramsHtml + itensHtml + resumoHtml;
}

// CALC_LOCAIS (orcCalc.js) tem 7 chaves e não inclui o "Viagem" genérico da planilha
// original — mapeamento só para sugerir um valor inicial ao abrir a aba pela 1ª vez.
function _motorMapCalcLocalParaMotor(calcLocalKey) {
  var mapa = {
    area_central:'area_central', jardim_canada:'jardim_canada', reg_metro:'reg_metropolitana',
    viagem_60:'viagem_60_100', viagem_100:'viagem_100_200', viagem_200:'viagem_200_300', viagem_300:'viagem_300_400',
  };
  return mapa[calcLocalKey] || MOTOR_LOCAIS[0].key;
}

function motorSetParam(orcId, campo, valor) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc || !orc.motorParams) return;
  orc.motorParams[campo] = valor;
  sv('orcamentos');
  rOrcMotor(orc);
}

function motorToggleItem(orcId, itemId, checked) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc) return;
  if (!orc.motorItens) orc.motorItens = [];
  if (checked) {
    if (!orc.motorItens.find(function(mi) { return mi.itemId === itemId; })) {
      orc.motorItens.push({ itemId: itemId, qtdManualOverride: null });
    }
  } else {
    orc.motorItens = orc.motorItens.filter(function(mi) { return mi.itemId !== itemId; });
  }
  sv('orcamentos');
  rOrcMotor(orc);
}

function motorSetQtdManual(orcId, itemId, valor) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc || !orc.motorItens) return;
  var mi = orc.motorItens.find(function(m) { return m.itemId === itemId; });
  if (!mi) return;
  mi.qtdManualOverride = valor === '' ? null : (parseFloat(valor) || 0);
  sv('orcamentos');
  rOrcMotor(orc);
}
