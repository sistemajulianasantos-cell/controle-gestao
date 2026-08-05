// ─── CALCULADORA DE ORÇAMENTO ─────────────────────────────────────────────────

var _orcCardapioOpen  = false;
var _orcCardapioFichaId = '';
var _orcCardapioItems = []; // [{cat, nome, rcNome, qtd}]

// Valores padrão (fallback). O valor efetivo usado nos cálculos vem de
// getOrcPrecos(), que sobrepõe D.orcPrecos (editável em Regras e Cálculos →
// 💰 Preços do Orçamento) por cima destes padrões.
//
// bt/bb/hb/cd/cp (preço de equipe) NÃO ficam mais aqui — vêm do Cadastro de
// Cargos (js/cargos.js, buscarCargoPorKey()). Este objeto guarda só o que
// ainda é específico do orçamento: Carregamento (ca), Refrigério (rf) e
// Limpeza (la) da equipe. As faixas usam as mesmas 7 de REGIOES_LOCAL
// (cargos.js) — antes eram 7 faixas diferentes, específicas do orçamento.
var CALC_LOCAIS_PADRAO = {
  area_central:  { label:'Área Central BH',           la:35, rf:35, ca:400  },
  jardim_canada: { label:'Jardim Canadá / C. Nova',    la:35, rf:35, ca:600  },
  reg_metro:     { label:'Região Metropolitana',       la:35, rf:35, ca:800  },
  viagem_100:    { label:'Viagem 50 a 100 km',         la:35, rf:45, ca:2500 },
  viagem_250:    { label:'Viagem 101 a 250 km',        la:35, rf:45, ca:4500 },
  viagem_400:    { label:'Viagem 251 a 400 km',        la:45, rf:45, ca:6500 },
  viagem_mais:   { label:'Viagem acima de 400 km',     la:0,  rf:0,  ca:0    },
};

// ─── FATORES DE PREÇO (dinâmicos) ──────────────────────────────────────────────
// Substituem os antigos CALC_COND_PADRAO/CALC_DESC_PADRAO/CALC_CI_PADRAO/
// CALC_PERDA_PADRAO/CALC_SEG_PADRAO/CALC_VAS_PADRAO (valores fixos no código,
// sem tela de edição de nome/ordem). Cada fator tem nome editável e uma ou
// mais opções (ex. Padrão/Simples), cada opção com um valor "por convidado"
// ou "fixo" — editável em Regras e Cálculos → Preços do Orçamento
// (rPrecosOrcamento, js/regras.js). Os 6 fatores abaixo (builtin:true) não
// podem ser excluídos porque recalcularAutos() os lê por id; fatores novos
// criados nessa tela podem. 'seg' é especial: suas opções não ficam salvas
// aqui, vêm do Cadastro de Tipos de Evento (opcoesFonte:'tiposEvento',
// js/tiposEvento.js) — criar um tipo de evento novo já cria a opção de
// Seguro correspondente (valor 0 até ela editar).
var ORC_FATORES_PADRAO = [
  { id:'cond',  nome:'Condicional (por convidado)',                tipoValor:'porConvidado', unicoValor:false, opcoesFonte:null,         secao:'custos', builtin:true, chavePadrao:'padrao',
    opcoes:[{chave:'padrao',label:'Padrão',valor:1.0417},{chave:'simples',label:'Simples',valor:0.63}] },
  { id:'desc',  nome:'Descartáveis (por convidado)',                tipoValor:'porConvidado', unicoValor:true,  opcoesFonte:null,         secao:'custos', builtin:true, chavePadrao:null,
    opcoes:[{chave:'_unico',label:'Valor',valor:0.6417}] },
  { id:'ci',    nome:'Cobertura de Insumos (por convidado)',        tipoValor:'porConvidado', unicoValor:false, opcoesFonte:null,         secao:'custos', builtin:true, chavePadrao:'normal',
    opcoes:[{chave:'normal',label:'Normal',valor:3.4417},{chave:'reduzido',label:'Reduzido',valor:2.53}] },
  { id:'perda', nome:'Previsão de Perda (por convidado)',           tipoValor:'porConvidado', unicoValor:false, opcoesFonte:null,         secao:'custos', builtin:true, chavePadrao:'padrao',
    opcoes:[{chave:'reduzida',label:'Reduzida',valor:0.42},{chave:'padrao',label:'Padrão',valor:0.60},{chave:'alta',label:'Alta',valor:0.85}] },
  { id:'seg',   nome:'Seguro (por convidado, por tipo de evento)',  tipoValor:'porConvidado', unicoValor:false, opcoesFonte:'tiposEvento', secao:'seguro', builtin:true, chavePadrao:null,
    opcoes:[{chave:'casamento',label:'Casamento',valor:1.67},{chave:'15anos',label:'15 Anos',valor:1.67},{chave:'formatura',label:'Formatura',valor:3.30},{chave:'outros',label:'Outros',valor:2.20}] },
  { id:'vas',   nome:'Vasilhames (valor fixo, por complexidade)',   tipoValor:'fixo',         unicoValor:false, opcoesFonte:null,         secao:'copos',  builtin:true, chavePadrao:'padrao',
    opcoes:[{chave:'simples',label:'Simples',valor:133.33},{chave:'padrao',label:'Padrão',valor:191.67},{chave:'complexo',label:'Complexo',valor:241.67}] },
];

var ORC_BLOCOS_ORDEM_PADRAO = ['equipe', 'locais', 'cond', 'desc', 'ci', 'perda', 'seg', 'vas'];

// Semeia D.orcFatores/D.orcBlocosOrdem uma única vez (idempotente) — depois
// disso ela é livre pra renomear/adicionar/reordenar sem nunca ser resetada.
// Note que os VALORES continuam guardados só em D.orcPrecos (getOrcPrecos()),
// aqui fica só a definição (nome, quais opções existem). A ORDEM não fica no
// fator — vive só em D.orcBlocosOrdem (única fonte de verdade, evita os dois
// ficarem dessincronizados quando ela usa as setas ▲▼).
function migrarOrcFatores() {
  if (!D.orcFatores || !D.orcFatores.length) {
    D.orcFatores = ORC_FATORES_PADRAO.map(function(f) {
      return {
        id: f.id, nome: f.nome, tipoValor: f.tipoValor, unicoValor: f.unicoValor,
        opcoesFonte: f.opcoesFonte, secao: f.secao, builtin: f.builtin, chavePadrao: f.chavePadrao,
        opcoes: f.opcoes.map(function(o) { return { chave: o.chave, label: o.label }; }),
      };
    });
    sv('orcFatores');
  }
  if (!D.orcBlocosOrdem || !D.orcBlocosOrdem.length) {
    D.orcBlocosOrdem = ORC_BLOCOS_ORDEM_PADRAO.slice();
    sv('orcBlocosOrdem');
  }
  var faltantes = D.orcFatores.map(function(f) { return f.id; })
    .filter(function(id) { return D.orcBlocosOrdem.indexOf(id) === -1; });
  if (faltantes.length) { D.orcBlocosOrdem = D.orcBlocosOrdem.concat(faltantes); sv('orcBlocosOrdem'); }
}

// Fatores ordenados pela posição em D.orcBlocosOrdem — mesma ordem usada na
// tela de Preços do Orçamento (setas ▲▼) e no painel de parâmetros da
// Calculadora, sempre em sincronia.
function getOrcFatores() {
  migrarOrcFatores();
  var ordem = D.orcBlocosOrdem;
  return D.orcFatores.slice().sort(function(a, b) { return ordem.indexOf(a.id) - ordem.indexOf(b.id); });
}

function buscarOrcFatorPorId(id) {
  return (D.orcFatores || []).find(function(f) { return f.id === id; }) || null;
}

// Opções selecionáveis de um fator — pra 'seg' vêm do Cadastro de Tipos de
// Evento (dinâmico), pros demais vêm da própria definição do fator.
function _orcFatorOpcoes(fator) {
  if (fator.opcoesFonte === 'tiposEvento') {
    return (typeof getTiposEvento === 'function') ? getTiposEvento().map(function(t) { return { chave: t.id, label: t.nome }; }) : [];
  }
  return fator.opcoes || [];
}

var _ORC_FATOR_PARAM_LEGADO = { cond: 'cfCond', ci: 'cfCI', perda: 'cfPerda', vas: 'cfVas' };
// Nome do campo em orc.calcParams que guarda a opção escolhida desse fator
// naquele orçamento. Os 4 fatores originais mantêm os nomes de sempre
// (cfCond/cfCI/cfPerda/cfVas) pra não precisar migrar orçamentos já salvos;
// fatores novos usam cf_<id>.
function _orcFatorParamKey(fatorId) {
  return _ORC_FATOR_PARAM_LEGADO[fatorId] || ('cf_' + fatorId);
}

function getOrcBlocosOrdem() {
  migrarOrcFatores();
  return D.orcBlocosOrdem.slice();
}

// Troca a posição de um bloco (fator, 'equipe' ou 'locais') com o vizinho —
// usado pelos botões ↑/↓ em Regras e Cálculos → Preços do Orçamento.
function moverOrcBloco(id, dir) {
  var ordem = getOrcBlocosOrdem();
  var idx = ordem.indexOf(id);
  var alvo = idx + dir;
  if (idx === -1 || alvo < 0 || alvo >= ordem.length) return;
  var tmp = ordem[idx]; ordem[idx] = ordem[alvo]; ordem[alvo] = tmp;
  D.orcBlocosOrdem = ordem;
  sv('orcBlocosOrdem');
  if (typeof rPrecosOrcamento === 'function') rPrecosOrcamento();
}

// ─── PREÇOS EDITÁVEIS ─────────────────────────────────────────────────────────
// Mescla os padrões acima com o que estiver salvo em D.orcPrecos, campo a
// campo — assim um valor que ela não editou continua vindo do padrão, mesmo
// que ela já tenha customizado outros.
function _orcMergeCat(padrao, salvo) {
  var keys = Object.keys(padrao);
  Object.keys(salvo || {}).forEach(function(k) { if (keys.indexOf(k) === -1) keys.push(k); });
  var out = {};
  keys.forEach(function(k) {
    var d = padrao[k], s = salvo && salvo[k];
    if ((d && typeof d === 'object') || (s && typeof s === 'object')) out[k] = Object.assign({}, d || {}, s || {});
    else out[k] = (s != null) ? s : d;
  });
  return out;
}

function getOrcPrecos() {
  _migrarOrcPrecosLocaisSeNecessario();
  migrarOrcFatores();
  var salvo = D.orcPrecos || {};
  var out = { locais: _orcMergeCat(CALC_LOCAIS_PADRAO, salvo.locais) };
  getOrcFatores().forEach(function(fator) {
    var padraoDef = ORC_FATORES_PADRAO.find(function(f) { return f.id === fator.id; });
    if (fator.unicoValor) {
      var padraoVal = (padraoDef && padraoDef.opcoes[0]) ? padraoDef.opcoes[0].valor : 0;
      out[fator.id] = salvo[fator.id] != null ? Number(salvo[fator.id]) : padraoVal;
    } else {
      var padraoObj = {};
      _orcFatorOpcoes(fator).forEach(function(o) {
        var seedOpt = padraoDef && padraoDef.opcoes.find(function(x) { return x.chave === o.chave; });
        padraoObj[o.chave] = seedOpt ? seedOpt.valor : 0; // opção sem valor de fábrica (ex: tipo de evento novo) começa em 0
      });
      out[fator.id] = _orcMergeCat(padraoObj, salvo[fator.id]);
    }
  });
  return out;
}

// D.orcPrecos.locais foi editado numa versão anterior (esquema de 7 faixas
// próprio do orçamento: viagem_60/100/200/300) — traduz pro esquema novo,
// compartilhado com o Cadastro de Cargos (viagem_100/250/400/mais), usando o
// mesmo mapa de aproximação de js/cargos.js. Idempotente: só roda uma vez,
// nunca sobrescreve um valor que já esteja no formato novo.
function _migrarOrcPrecosLocaisSeNecessario() {
  var salvo = D.orcPrecos && D.orcPrecos.locais;
  if (!salvo) return false;
  var temEsquemaAntigo = salvo.viagem_60 || salvo.viagem_200 || salvo.viagem_300;
  if (!temEsquemaAntigo) return false;
  if (typeof _MAPA_LOCAL_ORCAMENTO_PARA_REGIAO === 'undefined') return false;

  var novo = {};
  Object.keys(salvo).forEach(function(chaveAntiga) {
    var chaveNova = _MAPA_LOCAL_ORCAMENTO_PARA_REGIAO[chaveAntiga] || chaveAntiga;
    var aproximado = chaveNova !== chaveAntiga;
    var atual = salvo[chaveAntiga] || {};
    if (!novo[chaveNova]) novo[chaveNova] = {};
    ['la', 'rf', 'ca'].forEach(function(campo) {
      if (atual[campo] != null && novo[chaveNova][campo] == null) novo[chaveNova][campo] = atual[campo];
    });
    if (aproximado) novo[chaveNova].aproximado = true;
  });

  D.orcPrecos.locais = novo;
  sv('orcPrecos');
  return true;
}

// Traduz orc.calcParams.local do esquema antigo (viagem_60/100/200/300) pro
// novo (viagem_100/250/400/mais, igual ao Cadastro de Cargos) e persiste a
// tradução no próprio orçamento. Idempotente — se já estiver no novo esquema
// (ou for uma das 3 regiões fixas), não faz nada.
function _migrarLocalOrcamento(calcParams) {
  var localKey = calcParams.local || 'area_central';
  if (typeof _MAPA_LOCAL_ORCAMENTO_PARA_REGIAO === 'undefined') return localKey;
  var chaveNova = _MAPA_LOCAL_ORCAMENTO_PARA_REGIAO[localKey];
  if (chaveNova && chaveNova !== localKey) {
    calcParams.local = chaveNova;
    return chaveNova;
  }
  return localKey;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function _calcGetOrc() {
  return (D.orcamentos || []).find(o => o.id === orcAtualId);
}

function _calcAutoStaff(pax) {
  return {
    bt: Math.max(1, Math.ceil(pax / 50)),
    bb: Math.max(1, Math.ceil(pax / 100)),
    hb: pax > 500  ? 1 : 0,
    cd: pax > 1000 ? 1 : 0,
  };
}

function _mk(id, secao, nome, qtd, preco) {
  return {
    id, secao, nome,
    qtd:   Math.round(qtd   * 10000) / 10000,
    preco: Math.round(preco * 10000) / 10000,
    total: Math.round(qtd   * preco  * 100)   / 100,
    auto: true
  };
}

// ─── RECALCULAR AUTOMÁTICOS ───────────────────────────────────────────────────

function recalcularAutos() {
  const orc = _calcGetOrc();
  if (!orc) return;

  const p    = orc.calcParams || {};
  const pax  = orc.convidados || 0;
  const precos = getOrcPrecos();
  const localKey = _migrarLocalOrcamento(p);
  const loc  = precos.locais[localKey] || Object.values(precos.locais)[0];
  const autoS = _calcAutoStaff(pax);

  const qt = {
    bt: p.bartender != null ? Number(p.bartender) : autoS.bt,
    bb: p.barback   != null ? Number(p.barback)   : autoS.bb,
    hb: p.head      != null ? Number(p.head)      : autoS.hb,
    cd: p.coord     != null ? Number(p.coord)     : autoS.cd,
    cp: p.copeiro   != null ? Number(p.copeiro)   : 0,
  };
  const eqTotal = qt.bt + qt.bb + qt.hb + qt.cd + qt.cp;

  const tipoEvt = p.tipoEvento|| 'outros';

  // Toda festa sempre tem alguém exercendo o papel de Head Bartender/
  // Coordenador — mesmo quando a sugestão automática não chega a listar HB/
  // Coordenador como cargo próprio (eventos até 500/1000 pax), um dos
  // Bartenders assume esse papel e cobra o bônus. Mesma fórmula já usada em
  // Equipe → Regras de Pagamento pro cargo 'hb' (D.regrasEquipe.bonusConvidados.hb):
  // valor fixo por evento, com mínimo garantido de 1 unidade mesmo com menos
  // de 100 convidados, escalando a cada 100 convidados acima disso.
  const bonusHeadUnit  = (D.regrasEquipe && D.regrasEquipe.bonusConvidados && D.regrasEquipe.bonusConvidados.hb) || 0;
  const bonusHeadValor = pax > 0 ? bonusHeadUnit * Math.max(1, pax / 100) : 0;

  const autos = [
    _mk('auto-bt',   'equipe',    'Bartender',           qt.bt,    _precoCargo('bt', localKey)),
    _mk('auto-bb',   'equipe',    'Bar Back',            qt.bb,    _precoCargo('bb', localKey)),
    _mk('auto-hb',   'equipe',    'Head Bartender',      qt.hb,    _precoCargo('hb', localKey)),
    _mk('auto-cd',   'equipe',    'Coordenador',         qt.cd,    _precoCargo('cd', localKey)),
    _mk('auto-cp',   'equipe',    'Copeiro',             qt.cp,    _precoCargo('cp', localKey)),
    _mk('auto-bonus-head', 'equipe', 'Bônus Head Bartender/Coordenador', bonusHeadValor > 0 ? 1 : 0, bonusHeadValor),
    _mk('auto-ca',   'logistica', 'Carregamento',        1,        loc.ca),
    _mk('auto-rf',   'logistica', 'Refrigério equipe',   eqTotal,  loc.rf),
    _mk('auto-la',   'logistica', 'Limpeza equipe',      eqTotal,  loc.la),
    ...getOrcFatores().map(function(fator) {
      var qtd = fator.tipoValor === 'porConvidado' ? pax : 1;
      var valor;
      if (fator.unicoValor) {
        valor = precos[fator.id] || 0;
      } else {
        var chave = fator.opcoesFonte === 'tiposEvento'
          ? tipoEvt
          : (p[_orcFatorParamKey(fator.id)] || fator.chavePadrao || (_orcFatorOpcoes(fator)[0] && _orcFatorOpcoes(fator)[0].chave));
        valor = (precos[fator.id] && precos[fator.id][chave] != null) ? precos[fator.id][chave] : 0;
      }
      var nomeCurto = fator.nome.replace(/\s*\([^)]*\)\s*$/, '');
      return _mk('auto-' + fator.id, fator.secao || 'custos', nomeCurto, qtd, valor);
    }),
  ].filter(i => i.qtd > 0);

  const manuais = (orc.calcItens || []).filter(i => !i.auto);
  orc.calcItens = [...autos, ...manuais];

  // Itens "sempre tem" que não vêm de Ficha de Coquetel (ex: Gelo) — Regra
  // de Proporção marcada "autoOrcamento" (Regras e Cálculos → Proporções).
  if (typeof _sincronizarInsumosAutoRegra === 'function') _sincronizarInsumosAutoRegra(orc, pax, qt.bt, eqTotal);

  sv('orcamentos');
  rOrcCalc();
}

// Preço de equipe (o que cobra do cliente) por cargo/faixa — vem do Cadastro
// de Cargos (js/cargos.js), não mais deste arquivo.
function _precoCargo(cargoKey, localKey) {
  var cargo = (typeof buscarCargoPorKey === 'function') ? buscarCargoPorKey(cargoKey) : null;
  var pr = (cargo && cargo.porRegiao && cargo.porRegiao[localKey]) || {};
  return pr.precoOrcamento || 0;
}

// ─── PARÂMETROS ───────────────────────────────────────────────────────────────

function calcSetParam(chave, valor) {
  const orc = _calcGetOrc();
  if (!orc) return;
  if (!orc.calcParams) orc.calcParams = {};
  orc.calcParams[chave] = valor;
  sv('orcamentos');
  // 'local'/'tipoEvento' + qualquer seletor de fator (cfCond/cfCI/cfPerda/
  // cfVas legados, ou cf_<id> de fatores novos — ver _orcFatorParamKey)
  // exigem recalcular os itens automáticos; o resto só redesenha a tela.
  const disparaRecalc = chave === 'local' || chave === 'tipoEvento' || chave.indexOf('cf') === 0;
  if (disparaRecalc) recalcularAutos();
  else rOrcCalc();
}

// ─── ITENS ────────────────────────────────────────────────────────────────────

function calcUpdateItem(itemId, campo, valor) {
  const orc = _calcGetOrc();
  if (!orc) return;
  const item = (orc.calcItens || []).find(i => i.id === itemId);
  if (!item) return;
  item[campo] = parseFloat(valor) || 0;
  item.total  = Math.round(item.qtd * item.preco * 100) / 100;
  sv('orcamentos');
  rOrcCalc();
}

function calcRemoveItem(itemId) {
  const orc = _calcGetOrc();
  if (!orc) return;
  orc.calcItens = (orc.calcItens || []).filter(i => i.id !== itemId);
  sv('orcamentos');
  rOrcCalc();
}

function calcAddItemPrompt(secao) {
  const nome = prompt('Nome do item:');
  if (!nome || !nome.trim()) return;
  const preco = parseFloat(prompt('Preço unitário (R$):') || '0') || 0;
  const qtd   = parseFloat(prompt('Quantidade:') || '1') || 1;
  const orc = _calcGetOrc();
  if (!orc) return;
  if (!orc.calcItens) orc.calcItens = [];
  orc.calcItens.push({
    id: 'ci-' + Date.now() + Math.random().toString(36).slice(2, 5),
    secao, nome: nome.trim(),
    qtd, preco,
    total: Math.round(qtd * preco * 100) / 100,
    auto: false
  });
  sv('orcamentos');
  rOrcCalc();
}

// ─── INSUMOS / BEBIDAS ────────────────────────────────────────────────────────

function calcAddInsumoItem() {
  const nome  = document.getElementById('ins-nome')?.value?.trim();
  const qtd   = parseFloat(document.getElementById('ins-qtd')?.value)   || 0;
  const custo = parseFloat(document.getElementById('ins-custo')?.value) || 0;

  if (!nome) { alert2('Informe o nome do insumo', 'error'); return; }
  if (!qtd)  { alert2('Informe a quantidade de garrafas', 'error'); return; }

  const orc = _calcGetOrc();
  if (!orc) return;
  if (!orc.insumos) orc.insumos = [];

  orc.insumos.push({
    id:           'ins-' + Date.now() + Math.random().toString(36).slice(2, 4),
    nome,
    qtdGarrafas:  qtd,
    custoGarrafa: custo,
    total:        Math.round(qtd * custo * 100) / 100,
  });

  document.getElementById('ins-nome').value  = '';
  document.getElementById('ins-qtd').value   = '';
  document.getElementById('ins-custo').value = '';

  sv('orcamentos');
  _rTabContent();
}

function calcUpdateInsumo(itemId, campo, valor) {
  const orc = _calcGetOrc();
  if (!orc) return;
  const item = (orc.insumos || []).find(i => i.id === itemId);
  if (!item) return;
  item[campo] = parseFloat(valor) || 0;
  item.total  = Math.round(item.qtdGarrafas * item.custoGarrafa * 100) / 100;
  sv('orcamentos');
  _rTabContent();
}

function calcRemoveInsumo(itemId) {
  const orc = _calcGetOrc();
  if (!orc) return;
  orc.insumos = (orc.insumos || []).filter(i => i.id !== itemId);
  sv('orcamentos');
  _rTabContent();
}

// ─── RESUMO (reutilizável pela Calculadora e pela Proposta) ──────────────────

function _orcCalcResumo(orc) {
  const p    = orc.calcParams || {};
  const pax  = orc.convidados || 0;
  const autoS = _calcAutoStaff(pax);
  const itens  = orc.calcItens || [];
  const insumos = orc.insumos || [];

  // Insumos com preço de revenda por temporada (viaRevenda, ver
  // orcAplicarCardapio/_orcPrecoInsumoComTemporada em orcamento.js) já têm
  // valor final de venda — não entram na base de custo que recebe margem de
  // segurança/lucro, são somados direto no total depois. Sem nenhum item
  // viaRevenda (todo orçamento anterior a essa funcionalidade), o cálculo é
  // idêntico ao de sempre.
  const insumosCusto   = insumos.filter(i => !i.viaRevenda);
  const insumosRevenda = insumos.filter(i => i.viaRevenda);
  const custoInsumos = insumosCusto.reduce((s, i) => s + (i.total || 0), 0);
  const valorInsumosRevenda = insumosRevenda.reduce((s, i) => s + (i.total || 0), 0);

  const custoPresente = itens.reduce((s, i) => s + (i.total || 0), 0) + custoInsumos;
  const margSeg = Number(p.margemSeguranca != null ? p.margemSeguranca : 10);
  const margLuc = Number(p.margemLucro     != null ? p.margemLucro     : 30);
  const custoEst  = custoPresente * (1 + margSeg / 100);
  const valorTotal = custoEst * (1 + margLuc / 100) + valorInsumosRevenda;
  const porPessoa  = pax > 0 ? valorTotal / pax : 0;

  // Pacote Essencial = mesmo cálculo (custo → +margem segurança → +margem
  // lucro), só que sem o custo das Bebidas Alcoólicas do Cardápio/Insumos —
  // Pacote Completo é o valorTotal de sempre, com tudo incluso.
  const custoBebidasAlc = insumosCusto.filter(i => i.cat === 'BEBIDAS ALCOÓLICAS').reduce((s, i) => s + (i.total || 0), 0);
  const valorBebidasAlcRevenda = insumosRevenda.filter(i => i.cat === 'BEBIDAS ALCOÓLICAS').reduce((s, i) => s + (i.total || 0), 0);
  const custoPresenteEssencial = custoPresente - custoBebidasAlc;
  const custoEstEssencial  = custoPresenteEssencial * (1 + margSeg / 100);
  const valorTotalEssencial = custoEstEssencial * (1 + margLuc / 100) + (valorInsumosRevenda - valorBebidasAlcRevenda);
  const porPessoaEssencial  = pax > 0 ? valorTotalEssencial / pax : 0;

  return {
    pax, autoS, itens, insumos, custoInsumos, custoPresente, margSeg, margLuc,
    custoEst, valorTotal, porPessoa, custoBebidasAlc, custoPresenteEssencial,
    custoEstEssencial, valorTotalEssencial, porPessoaEssencial, valorInsumosRevenda,
  };
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

function rOrcCalc() {
  const orc = _calcGetOrc();
  const el  = document.getElementById('orc-det-content');
  if (!el || !orc) return;

  const p    = orc.calcParams || {};
  const precos = getOrcPrecos();
  const {
    pax, autoS, itens, insumos, custoInsumos, custoPresente, margSeg, margLuc,
    custoEst, valorTotal, porPessoa, custoBebidasAlc,
    valorTotalEssencial, porPessoaEssencial,
  } = _orcCalcResumo(orc);

  const localKey = _migrarLocalOrcamento(p);

  const secoes = [
    { id:'equipe',    label:'👥 Equipe',             cor:'#4F8EF7' },
    { id:'logistica', label:'🚚 Logística',           cor:'#F7A84F' },
    { id:'custos',    label:'💸 Custos variáveis',    cor:'#8B5CF6' },
    { id:'seguro',    label:'🛡️ Seguro',              cor:'#EC4899' },
    { id:'copos',     label:'🥂 Vasilhames',          cor:'#14B8A6' },
    { id:'extras',    label:'➕ Extras',               cor:'#94A3B8' },
  ];

  // ── Parâmetros ──────────────────────────────────────────────────────────────
  const paramHtml = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">⚙️ Parâmetros do evento</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-bottom:12px">

        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Local</label>
          <select onchange="calcSetParam('local',this.value)" style="width:100%;font-size:12px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
            ${Object.entries(precos.locais).map(([k,v])=>`<option value="${k}"${k===localKey?' selected':''}>${v.label}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Tipo de evento</label>
          <select onchange="calcSetParam('tipoEvento',this.value)" style="width:100%;font-size:12px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
            ${getTiposEvento().map(t=>`<option value="${t.id}"${(p.tipoEvento||'outros')===t.id?' selected':''}>${t.nome}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px" title="Usada pra escolher o preço de revenda (baixa/alta) dos insumos aplicados via Cardápio">Temporada</label>
          <select onchange="calcSetParam('temporada',this.value)" style="width:100%;font-size:12px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
            <option value="baixa"${(p.temporada||'baixa')==='baixa'?' selected':''}>Baixa Temporada</option>
            <option value="alta"${p.temporada==='alta'?' selected':''}>Alta Temporada</option>
          </select>
        </div>

        ${getOrcFatores().filter(function(f){ return !f.unicoValor && f.opcoesFonte !== 'tiposEvento'; }).map(function(f) {
          var paramKey = _orcFatorParamKey(f.id);
          var opcoes = _orcFatorOpcoes(f);
          var atual = p[paramKey] || f.chavePadrao || (opcoes[0] && opcoes[0].chave);
          var labelCurto = f.nome.replace(/\s*\([^)]*\)\s*$/, '');
          return `
        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">${labelCurto}</label>
          <select onchange="calcSetParam('${paramKey}',this.value)" style="width:100%;font-size:12px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
            ${opcoes.map(function(o){ return `<option value="${o.chave}"${atual===o.chave?' selected':''}>${o.label}</option>`; }).join('')}
          </select>
        </div>`;
        }).join('')}

      </div>

      <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
        <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:10px">
          👥 Equipe — sugestão automática para ${pax} pax:
          ${autoS.bt} bartender · ${autoS.bb} bar back${autoS.hb?' · 1 head BT':''}${autoS.cd?' · 1 coord':''}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px">
          ${[
            ['Bartender',     'bartender', autoS.bt],
            ['Bar Back',      'barback',   autoS.bb],
            ['Head Bartender','head',      autoS.hb],
            ['Coordenador',   'coord',     autoS.cd],
            ['Copeiro',       'copeiro',   0],
          ].map(([label, key, def]) => `
            <div>
              <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">${label}</label>
              <input type="number" min="0" step="1" placeholder="${def}"
                value="${p[key] != null ? p[key] : ''}"
                onchange="calcSetParam('${key}', this.value===''?null:Number(this.value))"
                style="width:100%;font-size:13px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius);font-family:var(--mono)">
            </div>`).join('')}
        </div>
      </div>

      <div style="border-top:1px solid var(--border);padding-top:12px;display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">
        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Margem segurança %</label>
          <input type="number" min="0" max="100" step="1" value="${margSeg}"
            onchange="calcSetParam('margemSeguranca', Number(this.value))"
            style="width:100px;font-size:13px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--amber);border-radius:var(--radius);font-family:var(--mono)">
        </div>
        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Margem lucro %</label>
          <input type="number" min="0" max="500" step="1" value="${margLuc}"
            onchange="calcSetParam('margemLucro', Number(this.value))"
            style="width:100px;font-size:13px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--green);border-radius:var(--radius);font-family:var(--mono)">
        </div>
        <button onclick="atualizarValoresOrcamento('${orc.id}')" class="btn btn-primary" style="padding:8px 20px" title="Recalcula os itens automáticos da Calculadora e o custo/quantidade dos insumos do Cardápio a partir dos cadastros atuais">🔄 Atualizar valores</button>
      </div>
    </div>`;

  // ── Seções + Resumo ─────────────────────────────────────────────────────────
  const secoesHtml = secoes.map(sec => {
    const sItens = itens.filter(i => i.secao === sec.id);
    const sTotal = sItens.reduce((s, i) => s + (i.total || 0), 0);
    return `
      <div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid ${sec.cor};border-radius:var(--radius);margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;${sItens.length ? 'border-bottom:1px solid var(--border)' : ''}">
          <span style="font-size:12px;font-weight:700;color:${sec.cor}">${sec.label}</span>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:13px;font-weight:700;font-family:var(--mono);color:${sec.cor}">${fR(sTotal)}</span>
            <button onclick="calcAddItemPrompt('${sec.id}')"
              style="background:transparent;border:1px solid ${sec.cor};color:${sec.cor};border-radius:var(--radius);font-size:10px;padding:3px 8px;cursor:pointer">+ item</button>
          </div>
        </div>
        ${sItens.length ? `
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <tbody>
              ${sItens.map(item => `
                <tr style="border-bottom:1px solid var(--border)">
                  <td style="padding:6px 10px;color:var(--text);font-weight:500">
                    ${item.nome}
                    ${item.auto ? `<span style="font-size:9px;color:var(--text3);font-weight:400;margin-left:4px">auto</span>` : ''}
                  </td>
                  <td style="padding:4px 6px;text-align:right">
                    <input type="number" value="${item.qtd}" min="0" step="0.01"
                      onchange="calcUpdateItem('${item.id}','qtd',this.value)"
                      style="width:60px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
                  </td>
                  <td style="padding:4px 6px;text-align:right">
                    <input type="number" value="${Number(item.preco).toFixed(4)}" min="0" step="0.01"
                      onchange="calcUpdateItem('${item.id}','preco',this.value)"
                      style="width:85px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
                  </td>
                  <td style="padding:6px 8px;text-align:right;font-family:var(--mono);font-weight:700;color:${sec.cor};white-space:nowrap">${fR(item.total || 0)}</td>
                  <td style="padding:6px 8px;text-align:center;width:28px">
                    <span onclick="calcRemoveItem('${item.id}')" style="cursor:pointer;color:var(--red);font-size:15px;line-height:1" title="Remover">×</span>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>` : `
          <div style="padding:12px 14px;font-size:11px;color:var(--text3)">Nenhum item — clique em "+ item" para adicionar.</div>`}
      </div>`;
  }).join('');

  const resumoHtml = `
    <div style="position:sticky;top:16px">
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:10px">
        <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px">💰 Resumo</div>

        <div style="margin-bottom:10px">
          <div style="font-size:10px;color:var(--text3);margin-bottom:2px">Custo Presente</div>
          <div style="font-size:20px;font-weight:700;font-family:var(--mono);color:var(--text)">${fR(custoPresente)}</div>
        </div>

        <div style="padding:8px 10px;background:rgba(247,168,79,.1);border:1px solid rgba(247,168,79,.3);border-radius:6px;margin-bottom:10px">
          <div style="font-size:10px;color:var(--amber);margin-bottom:2px">+ Margem segurança (${margSeg}%)</div>
          <div style="font-size:14px;font-family:var(--mono);color:var(--amber);font-weight:600">+ ${fR(custoEst - custoPresente)}</div>
        </div>

        <div style="margin-bottom:10px">
          <div style="font-size:10px;color:var(--text3);margin-bottom:2px">Custo Estimado</div>
          <div style="font-size:16px;font-weight:700;font-family:var(--mono);color:var(--text)">${fR(custoEst)}</div>
        </div>

        <div style="padding:8px 10px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:6px;margin-bottom:12px">
          <div style="font-size:10px;color:var(--green);margin-bottom:2px">+ Margem lucro (${margLuc}%)</div>
          <div style="font-size:14px;font-family:var(--mono);color:var(--green);font-weight:600">+ ${fR(valorTotal - custoEst)}</div>
        </div>

        <div style="border-top:2px solid var(--border2);padding-top:12px;margin-bottom:10px">
          <div style="font-size:10px;color:#4F8EF7;margin-bottom:2px">🍹 Pacote Essencial <span style="opacity:.7">(sem bebidas alcoólicas)</span></div>
          <div style="font-size:22px;font-weight:800;font-family:var(--mono);color:#4F8EF7">${fR(valorTotalEssencial)}</div>
        </div>

        <div style="border-top:1px solid var(--border);padding-top:10px;margin-bottom:${pax > 0 || custoBebidasAlc > 0 ? '12' : '0'}px">
          <div style="font-size:10px;color:var(--green);margin-bottom:2px">🥂 Pacote Completo <span style="opacity:.7">(com bebidas)</span></div>
          <div style="font-size:22px;font-weight:800;font-family:var(--mono);color:var(--green)">${fR(valorTotal)}</div>
        </div>

        ${custoBebidasAlc > 0 ? `
          <div style="font-size:10px;color:var(--text3);text-align:right;margin-bottom:${pax > 0 ? '12' : '0'}px">
            Diferença entre pacotes (bebidas alcoólicas): ${fR(valorTotal - valorTotalEssencial)}
          </div>` : ''}

        ${pax > 0 ? `
          <div style="background:rgba(79,142,247,.1);border:1px solid rgba(79,142,247,.3);border-radius:6px;padding:10px;text-align:center">
            <div style="font-size:10px;color:#4F8EF7;margin-bottom:4px">${pax} convidados · Por pessoa</div>
            <div style="font-size:13px;font-family:var(--mono)">Essencial: <strong style="color:#4F8EF7">${fR(porPessoaEssencial)}</strong> &nbsp;·&nbsp; Completo: <strong style="color:var(--green)">${fR(porPessoa)}</strong></div>
          </div>` : ''}
      </div>

      ${custoPresente > 0 ? `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px">
        <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:10px">Breakdown</div>
        ${secoes.map(sec => {
          const t = itens.filter(i => i.secao === sec.id).reduce((s, i) => s + (i.total || 0), 0);
          if (!t) return '';
          const pct = Math.min(100, Math.round(t / custoPresente * 100));
          return `
            <div style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:10px;color:${sec.cor}">${sec.label.replace(/^\S+\s/, '')}</span>
                <span style="font-size:10px;font-family:var(--mono);color:var(--text3)">${fR(t)} · ${pct}%</span>
              </div>
              <div style="height:4px;background:var(--bg3);border-radius:2px">
                <div style="width:${pct}%;height:4px;background:${sec.cor};border-radius:2px"></div>
              </div>
            </div>`;
        }).join('')}
        ${custoInsumos > 0 ? (() => {
          const pct = Math.min(100, Math.round(custoInsumos / custoPresente * 100));
          return `
            <div style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:10px;color:#F97316">Insumos / Bebidas</span>
                <span style="font-size:10px;font-family:var(--mono);color:var(--text3)">${fR(custoInsumos)} · ${pct}%</span>
              </div>
              <div style="height:4px;background:var(--bg3);border-radius:2px">
                <div style="width:${pct}%;height:4px;background:#F97316;border-radius:2px"></div>
              </div>
            </div>`;
        })() : ''}
      </div>` : ''}
    </div>`;

  // ── Resumo de Insumos por categoria (gerenciados na aba Cardapio) ────────────
  // Uma "seção" por categoria (Copos e Taças, Hortifruti, Bebidas Alcoólicas
  // etc.), igual o padrão visual de Equipe/Logística/Custos — só que somente
  // leitura aqui (edição continua na aba Cardápio, cada bloco clicável leva
  // pra lá). Só aparece seção pra categoria que realmente tem item aplicado
  // neste orçamento.
  const CAT_COR_INSUMO = {
    'BEBIDAS ALCOÓLICAS': '#F97316',
    'BEBIDAS SEM ÁLCOOL':  '#FB923C',
    'COPOS E TAÇAS':       '#06B6D4',
    'HORTIFRUTI':          '#22C55E',
    'ESPECIARIAS':         '#D946EF',
    'MIX ARTESANAL':       '#F43F5E',
    'PRODUÇÃO':            '#84CC16',
    'XAROPES':             '#A855F7',
    'GELO':                '#38BDF8',
    'DESCARTÁVEIS':        '#64748B',
    'MATERIAL':            '#78716C',
    'MATERIAL (ESPECÍFICO)': '#78716C',
    'KIT BARTENDER':       '#EAB308',
  };
  const insumosPorCat = {};
  insumos.forEach(i => {
    const cat = i.cat || 'OUTROS';
    (insumosPorCat[cat] = insumosPorCat[cat] || []).push(i);
  });
  const catsInsumos = (typeof _orcOrdenarCats === 'function') ? _orcOrdenarCats(Object.keys(insumosPorCat)) : Object.keys(insumosPorCat);

  const insumosHtml = catsInsumos.length ? catsInsumos.map(cat => {
    const itensCat  = insumosPorCat[cat];
    const totalCat  = itensCat.reduce((s, i) => s + (i.total || 0), 0);
    const cor       = CAT_COR_INSUMO[cat] || '#F97316';
    return `
      <div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid ${cor};border-radius:var(--radius);margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;padding:10px 14px;cursor:pointer"
        onclick="setOrcTab('cardapio')">
        <div>
          <span style="font-size:12px;font-weight:700;color:${cor}">${cat}</span>
          <span style="font-size:10px;color:var(--text3);margin-left:8px">${itensCat.length} item(ns) &middot; clique para gerenciar</span>
        </div>
        <span style="font-size:13px;font-weight:700;font-family:var(--mono);color:${cor}">${fR(totalCat)}</span>
      </div>`;
  }).join('') : `
    <div style="background:var(--bg2);border:1px dashed var(--border);border-radius:var(--radius);margin-bottom:10px;padding:12px 14px;cursor:pointer;opacity:.7"
      onclick="setOrcTab('cardapio')">
      <span style="font-size:12px;color:var(--text3)">Nenhum insumo &mdash; <u>ir para aba Cardapio</u></span>
    </div>
    `;

  el.innerHTML = paramHtml + `
    <div style="display:grid;grid-template-columns:1fr 270px;gap:14px;align-items:start">
      <div>${insumosHtml}${secoesHtml}</div>
      ${resumoHtml}
    </div>`;
}

// ─── PREENCHER INSUMOS VIA CARDÁPIO ──────────────────────────────────────────

function calcToggleCardapio() {
  _orcCardapioOpen = !_orcCardapioOpen;
  if (!_orcCardapioOpen) { _orcCardapioFichaId = ''; _orcCardapioItems = []; }
  rOrcCalc();
}

function calcSelectCardapioFicha(fichaId) {
  _orcCardapioFichaId = fichaId;
  _orcCardapioItems = [];
  if (!fichaId) { rOrcCalc(); return; }

  const orc = _calcGetOrc();
  const pax = orc ? (orc.convidados || 0) : 0;
  const grupoRC = _calcTipoToGrupoRC(((orc && orc.calcParams) || {}).tipoEvento || 'outros');
  const stats = (typeof _rcGetStats === 'function') ? _rcGetStats() : {};
  const gd = stats[grupoRC] || {};

  const ficha = (D.fichas || []).find(f => f.id === fichaId);
  if (!ficha) { rOrcCalc(); return; }

  (ficha.itens || []).forEach(item => {
    const rc  = _rcMapFichaItemToRC(item.nome);
    const d   = rc ? gd[rc] : null;
    const qtd = (d && d.avg != null) ? _rcSugestao(d.avg) : 0;
    _orcCardapioItems.push({ cat: item.cat, nome: item.nome, rcNome: rc, qtd });
  });
  rOrcCalc();
}

function calcUpdateCardapioItem(idx, val) {
  if (_orcCardapioItems[idx]) _orcCardapioItems[idx].qtd = parseInt(val) || 0;
}

// Mapeia nome de item da ficha de coquetel para nome na Ref. Consumo
function _rcMapFichaItemToRC(nome) {
  const n = nome.toUpperCase();
  const checks = [
    [/VODKA/,                       'Vodka'],
    [/GIM|GIN|BEEFEATER|TANQUERAY/, 'Gim'],
    [/APEROL/,                      'Aperol'],
    [/CAMPARI/,                     'Campari'],
    [/VERMU|VERMUTE|CARPANO/,       'Vermouth'],
    [/TEQUILA/,                     'Tequila'],
    [/\bRUM\b/,                     'Rum'],
    [/ESPUMANTE|LE BLANC/,          'Espumante'],
    [/LICOR 43/,                    'Licor 43'],
    [/WHISKEY|WHISKY|JAMESON/,      'Whisky'],
    [/CACHA[CÇ]A|SPIRAL/,          'Cachaça'],
    [/FERNET/,                      'Fernet'],
    [/BANANINHA/,                   'Bananinha'],
    [/FIREBALL/,                    'Fireball'],
    [/MANZA/,                       'Manzza'],
    [/LILLET/,                      'Lillet'],
    [/\bSAKE\b/,                    'Sake'],
    [/\bVINHO\b/,                   'Vinho'],
    [/\bPISCO\b/,                   'Pisco'],
    [/NEGRONI ROMERO/,              'Negroni Romero'],
    [/LIMONCHELL|LIMONCELL/,        'Limonchello'],
    [/NIB SHOT/,                    'Nib Shot'],
    [/LICOR DOCE DE LEITE/,         'Licor Doce de Leite'],
    [/BALLENA/,                     'Ballena'],
    [/LICOR DE CAF[EÉ]/,            'Licor 43'],
    // Espumas / mixes
    [/ESPUMA.*GENGIB/,              'Espuma de Gengibre'],
    [/ESPUMA.*SICIL/,               'Espuma de Siciliano'],
    [/MIX FRUTAS VERMELHAS/,        'Mix Frutas Vermelhas'],
    [/GRAPEFRUIT/,                  'Grapefruit'],
    [/GINGER/,                      'Ginger Ale'],
    [/ANGOSTURA/,                   'Angostura'],
    [/\bCAF[EÉ]\b/,                 'Café'],
    [/SUCO DE LIM[AÃ]O/,           'Suco de Limão'],
    [/XAROPE DE A[CÇ][UÚ]CAR/,    'Xarope de Açucar'],
    [/[AÁ]GUA.*GAS/,               'Agua gasosa'],
    [/[AÁ]GUA.*T[OÔ]N/,           'Agua Tônica'],
    // Copos e taças
    [/LONGO LISO|LONG LISO/,        'Long liso'],
    [/LONGO REVEL|LONG DRINK/,      'Long Drink'],
    [/LONGO ELYSIA/,                'Long Xtra'],
    [/LONGO XTRA|LONG XTRA/,        'Long Xtra'],
    // "Whisky Xtar" era só um nome antigo pro Copo Baixo Xtra (confirmado com
    // a Juliana em 2026-07-28) — não é um copo separado, por isso cai aqui.
    [/BAIXO XTRA|XTRA BAIXO|BAIXO ELYSIA|BAIXO TIMELL|WHISKY XTAR|WHISKEY XTAR/, 'Xtra Baixo'],
    [/BAIXO LISO/,                  'Baixo Liso'],
    [/TAÇA.*VINHO|VINHO.*TAÇA/,    'Taça de Vinho'],
    [/\bCANECA\b/,                  'Caneca'],
    [/\bCOUPE\b/,                   'Coupe'],
    // "Taça Xtar" era só grafia antiga de "Taça Xtra" (confirmado 2026-07-28).
    [/TAÇA XTAR|TAÇA XTRA/,         'Taça Xtar'],
    [/TAÇA FLUTE|FLUTE/,            'Taça Flute'],
    [/\bCALISE\b/,                  'Calise'],
    [/RECEPTIVO/,                   'Receptivo'],
    [/LAMPADA/,                     'Lampada'],
    [/BUNELLO/,                     'Bunello'],
    [/TIMELESS|TIMELES/,            'Whiskey Timeles'],
    [/WHISKEY.*ELYSIA|ELYSIA.*WHISKEY/, 'Whiskey Elysia'],
  ];
  for (const [re, rc] of checks) {
    if (re.test(n)) return rc;
  }
  return null;
}

function _orcGetUnit(nome) {
  const cat = (typeof RC_ITEM_CAT !== 'undefined') ? RC_ITEM_CAT[nome] : null;
  if (cat === 'COPOS E TAÇAS') return 'uni';
  if (['Espuma de Gengibre','Espuma de Siciliano','Suco de Limão','Xarope de Açucar',
       'Ginger Ale','Grapefruit','Mix Frutas Vermelhas','Agua gasosa','Agua Tônica'].includes(nome)) return 'und';
  return 'garrafas';
}

function _getEmbalagemProduto(nome) {
  const p = (D.produtos||[]).find(x => (x.nome||'').toUpperCase() === nome.toUpperCase());
  return (p && p.tamanhoEmbalagem > 1) ? p.tamanhoEmbalagem : 1;
}

function _calcInsumoQtdCell(ins) {
  const isCopo = (typeof RC_ITEM_CAT !== 'undefined') && RC_ITEM_CAT[ins.nome] === 'COPOS E TAÇAS';
  const emb    = isCopo ? _getEmbalagemProduto(ins.nome) : 1;
  if (emb > 1) {
    const cx = Math.ceil((ins.qtdGarrafas||0) / emb);
    return `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
      <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px">
        <input type="number" value="${cx}" min="0" step="1"
          onchange="calcUpdateInsumo('${ins.id}','qtdGarrafas',this.value*${emb})"
          style="width:60px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
        <span style="font-size:9px;color:var(--text3);white-space:nowrap;display:inline-block;width:22px;text-align:left">cx</span>
      </div>
      <div style="font-size:9px;color:var(--text3)">${ins.qtdGarrafas||0} uni · ${emb}/cx</div>
    </div>`;
  }
  return `<div style="display:flex;align-items:center;justify-content:flex-end;gap:4px">
    <input type="number" value="${ins.qtdGarrafas}" min="0" step="1"
      onchange="calcUpdateInsumo('${ins.id}','qtdGarrafas',this.value)"
      style="width:60px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
    <span style="font-size:9px;color:var(--text3);white-space:nowrap;display:inline-block;width:34px;text-align:left">${_orcGetUnit(ins.nome)}</span>
  </div>`;
}

function _calcQtdCopo(nome, convidados) {
  const rc         = D.regrasCopos || {};
  const fatorBase  = rc.fatorBase  != null ? rc.fatorBase  : 2;
  const fatorExtra = rc.fatorExtra != null ? rc.fatorExtra : 0.5;
  const nFichas    = (D.fichas||[]).filter(f =>
    (f.itens||[]).some(i => i.cat === 'COPOS E TAÇAS' && i.nome === nome)
  ).length;
  const fator = fatorBase + Math.max(0, nFichas - 1) * fatorExtra;
  return Math.ceil(convidados * fator);
}

function _calcTipoToGrupoRC(tipo) {
  return { casamento:'CASAMENTO', '15anos':'ANIVERSÁRIO 15 ANOS', formatura:'FORMATURA', outros:'CASAMENTO' }[tipo] || 'CASAMENTO';
}

function calcPreencherPorCardapio() {
  const orc = _calcGetOrc();
  if (!orc) return;
  if (!_orcCardapioItems.length) { alert2('Selecione uma ficha de coquetel.', 'error'); return; }

  // Sync quantities from live inputs before saving
  _orcCardapioItems.forEach((item, idx) => {
    const inp = document.getElementById('orc-card-item-' + idx);
    if (inp) item.qtd = parseInt(inp.value) || 0;
  });

  if (!orc.insumos) orc.insumos = [];
  let adicionados = 0, atualizados = 0;

  _orcCardapioItems.forEach(item => {
    const nome = item.rcNome || item.nome;
    const qtd  = item.qtd;

    const existing = orc.insumos.find(i => i.nome === nome);
    if (existing) {
      existing.qtdGarrafas = qtd;
      existing.total = Math.round(qtd * (existing.custoGarrafa || 0) * 100) / 100;
      atualizados++;
    } else {
      const precoRef = (D.precos && D.precos[nome]) ? (D.precos[nome].custo || 0) : 0;
      orc.insumos.push({
        id: 'ins-' + Date.now() + '-' + Math.random().toString(36).slice(2, 4),
        nome,
        qtdGarrafas: qtd,
        custoGarrafa: precoRef,
        total: Math.round(qtd * precoRef * 100) / 100,
      });
      adicionados++;
    }
  });

  sv('orcamentos');
  _orcCardapioOpen = false;
  _orcCardapioFichaId = '';
  _orcCardapioItems = [];
  alert2(`✅ ${adicionados} insumo(s) adicionado(s)${atualizados ? ' · ' + atualizados + ' atualizado(s)' : ''} para ${orc.convidados||0} convidados.`);
  rOrcCalc();
}
