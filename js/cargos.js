// ─── CADASTRO DE CARGOS (custo x preço) + BAIRROS/ENDEREÇOS ─────────────────
// Segundo domínio da centralização de cadastro (depois de Produtos/Insumos).
// Unifica "quanto pago" (D.regrasEquipe, equipe.js) com "quanto cobro"
// (D.orcPrecos.locais, orcCalc.js) numa única faixa de Região/Local — as duas
// telas antigas continuam existindo e não foram migradas ainda (fase futura).

// Lista única de faixas — substitui as duas divergentes (REGIOES_PAGAMENTO
// em equipe.js e CALC_LOCAIS_PADRAO em orcCalc.js) só dentro deste cadastro novo.
var REGIOES_LOCAL = [
  { key: 'area_central',     label: 'Área Central BH' },
  { key: 'jardim_canada',    label: 'Jardim Canadá / Condomínios Nova Lima' },
  { key: 'reg_metro',        label: 'Região Metropolitana (Grande BH)' },
  { key: 'viagem_60',        label: 'Viagem até 60 km' },
  { key: 'viagem_100',       label: 'Viagem até 100 km' },
  { key: 'viagem_200',       label: 'Viagem até 200 km' },
  { key: 'viagem_300',       label: 'Viagem até 300 km' },
  { key: 'viagem_acima_300', label: 'Viagem acima de 300 km' },
];

// As 3 primeiras faixas batem exatamente com a lista antiga de Região
// (equipe.js/REGIOES_PAGAMENTO) — migração direta, sem aproximação.
var _REGIOES_EXATAS = ['area_central', 'jardim_canada', 'reg_metro'];

// Mapa região antiga (equipe.js/REGIOES_PAGAMENTO) → faixa(s) nova(s)
// (REGIOES_LOCAL). Cada região antiga pode alimentar mais de uma faixa nova
// (ex: "viagem_60" nunca existiu separada no pagamento antigo — a Juliana
// pediu pra usar o mesmo valor de "50 a 100 km" nela também). As 3 primeiras
// são exatas; as faixas de "viagem" são uma aproximação (os cortes de km
// mudaram) — todo valor de custo que entrar por essa via fica marcado com
// custoAproximado:true pra ela revisar, nunca escondido.
var _MAPA_REGIAO_ANTIGA_PARA_NOVA = {
  area_central:  ['area_central'],
  jardim_canada: ['jardim_canada'],
  reg_metro:     ['reg_metro'],
  viagem_100:    ['viagem_60', 'viagem_100'],  // antiga "50 a 100 km" → novas "até 60 km" (pedido dela) e "até 100 km"
  viagem_250:    ['viagem_200'],               // antiga "101 a 250 km" → nova "até 200 km" (aproximado)
  viagem_400:    ['viagem_300'],               // antiga "251 a 400 km" → nova "até 300 km" (aproximado)
  viagem_mais:   ['viagem_acima_300'],         // antiga "acima de 400 km" → nova "acima de 300 km"
};

var _CARGOS_DEF = [
  { key: 'hb', nome: 'Head Bartender' },
  { key: 'cd', nome: 'Coordenador' },
  { key: 'bt', nome: 'Bartender' },
  { key: 'bb', nome: 'Bar Back' },
  { key: 'cp', nome: 'Copeiro' },
];

var _cargoEditandoId = null;
var cargosView = 'lista';

// ── Cargos: init / navegação ────────────────────────────────────────────────

function initCargosCadastro() {
  if (!D.cargos) D.cargos = [];
  migrarCargos();
  setCargosView('lista');
}

function setCargosView(v) {
  cargosView = v;
  ['lista', 'form'].forEach(function(x) {
    var el = document.getElementById('crg-view-' + x);
    if (el) el.style.display = x === v ? '' : 'none';
  });
  if (v === 'lista') rCargosLista();
}

// ── Migração a partir de D.regrasEquipe + D.orcPrecos.locais (não apaga nada) ──
function migrarCargos() {
  if (!D.cargos) D.cargos = [];
  var rg = D.regrasEquipe || {};
  var precos = (typeof getOrcPrecos === 'function') ? getOrcPrecos() : null;
  var locais = (precos && precos.locais) || {};
  var mudou = false;

  _CARGOS_DEF.forEach(function(def) {
    if (D.cargos.some(function(c) { return c.key === def.key; })) return; // já existe, não sobrescreve edições

    var porRegiao = {};
    REGIOES_LOCAL.forEach(function(r) {
      // Preço (o que cobra) migra sempre que a chave existir em Preços do
      // Orçamento — as faixas de viagem daqui usam a MESMA nomenclatura
      // (viagem_60/100/200/300) que orcCalc.js já usava, é o mesmo dado.
      var loc = locais[r.key] || {};
      porRegiao[r.key] = {
        custoNovato: 0,
        custoAntigo: 0,
        precoOrcamento: loc[def.key] || 0,
        custoAproximado: false,
      };
    });

    // Custo (o que paga), via mapa região antiga → nova(s). Exato pras 3
    // faixas fixas; aproximado (marcado) pras faixas de viagem remapeadas.
    Object.keys(_MAPA_REGIAO_ANTIGA_PARA_NOVA).forEach(function(regiaoAntiga) {
      var baseReg = ((rg.base || {})[regiaoAntiga] || {})[def.key] || {};
      if (!baseReg.novato && !baseReg.antigo) return;
      _MAPA_REGIAO_ANTIGA_PARA_NOVA[regiaoAntiga].forEach(function(novaKey) {
        porRegiao[novaKey].custoNovato = baseReg.novato || 0;
        porRegiao[novaKey].custoAntigo = baseReg.antigo || 0;
        porRegiao[novaKey].custoAproximado = _REGIOES_EXATAS.indexOf(regiaoAntiga) === -1;
      });
    });

    D.cargos.push({
      id: 'CRG' + Date.now() + Math.random().toString(36).slice(2, 6),
      key: def.key,
      nome: def.nome,
      porRegiao: porRegiao,
    });
    mudou = true;
  });

  if (_backfillCargosExistentes()) mudou = true;
  if (mudou) sv('cargos');
}

// Corrige cargos já migrados numa versão anterior (que zerou preço/custo de
// viagem por excesso de cautela) — preenche só onde ainda está 0 (custoNovato
// E custoAntigo, ou precoOrcamento), sem tocar em valor que ela já editou.
function _backfillCargosExistentes() {
  var precos = (typeof getOrcPrecos === 'function') ? getOrcPrecos() : null;
  var locais = (precos && precos.locais) || {};
  var rg = D.regrasEquipe || {};
  var mudou = false;

  (D.cargos || []).forEach(function(c) {
    // Preço
    REGIOES_LOCAL.forEach(function(r) {
      var v = (c.porRegiao || {})[r.key];
      if (!v) return;
      var doOrcamento = (locais[r.key] || {})[c.key] || 0;
      if (!v.precoOrcamento && doOrcamento) { v.precoOrcamento = doOrcamento; mudou = true; }
    });
    // Custo (via mapa antigo → novo), só se a faixa ainda estiver zerada
    Object.keys(_MAPA_REGIAO_ANTIGA_PARA_NOVA).forEach(function(regiaoAntiga) {
      var baseReg = ((rg.base || {})[regiaoAntiga] || {})[c.key] || {};
      if (!baseReg.novato && !baseReg.antigo) return;
      _MAPA_REGIAO_ANTIGA_PARA_NOVA[regiaoAntiga].forEach(function(novaKey) {
        var v = (c.porRegiao || {})[novaKey];
        if (!v || v.custoNovato || v.custoAntigo) return; // já preenchido, não sobrescreve
        v.custoNovato = baseReg.novato || 0;
        v.custoAntigo = baseReg.antigo || 0;
        v.custoAproximado = _REGIOES_EXATAS.indexOf(regiaoAntiga) === -1;
        mudou = true;
      });
    });
  });

  return mudou;
}

// ── Helpers de leitura ──────────────────────────────────────────────────────

function getCargos() {
  return D.cargos || [];
}

function buscarCargoPorId(id) {
  return (D.cargos || []).find(function(c) { return c.id === id; }) || null;
}

function buscarCargoPorKey(key) {
  return (D.cargos || []).find(function(c) { return c.key === key; }) || null;
}

// "Falta preencher" = falta o custo (o que paga) — o preço (o que cobra) já
// vem migrado automaticamente pra quase todas as faixas.
function _cargoFaixasSemValor(cargo) {
  return REGIOES_LOCAL.filter(function(r) {
    var v = (cargo.porRegiao || {})[r.key] || {};
    return !v.custoNovato && !v.custoAntigo;
  });
}

// ── Render: lista de cargos ─────────────────────────────────────────────────

function rCargosLista() {
  var cont = document.getElementById('crg-lista-body');
  if (!cont) return;
  var lista = getCargos();

  if (!lista.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhum cargo cadastrado ainda.</div>';
    return;
  }

  cont.innerHTML = lista.map(function(c) {
    var faltando = _cargoFaixasSemValor(c).length;
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
      '<div style="flex:1"><span style="font-size:13px;font-weight:600;color:var(--text)">' + c.nome + '</span></div>' +
      (faltando ? '<span style="font-size:10px;color:var(--amber)">⚠️ ' + faltando + ' faixa(s) sem valor</span>' : '<span style="font-size:10px;color:var(--green)">completo</span>') +
      '<button class="btn-sm" style="background:var(--blue)" onclick="editarCargo(\'' + c.id + '\')">✏️ Editar</button>' +
    '</div>';
  }).join('');
}

// ── Render: formulário (matriz por Região/Local) ────────────────────────────

function rFormCargo(id) {
  _cargoEditandoId = id || null;
  var c = buscarCargoPorId(id);
  var cont = document.getElementById('crg-view-form');
  if (!c || !cont) return;

  cont.innerHTML = '<div class="sec">' +
    '<div class="sec-head"><span class="sec-title">✏️ ' + c.nome + ' — custo e preço por Região/Local</span>' +
      '<button class="btn-sm" onclick="setCargosView(\'lista\')" style="margin-left:auto">← Voltar</button>' +
    '</div>' +
    '<div style="padding:16px;overflow-x:auto">' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="color:var(--text3);text-transform:uppercase;font-size:9px">' +
        '<th style="text-align:left;padding:6px 8px">Região / Local</th>' +
        '<th style="text-align:center;padding:6px 8px">Custo Novato<br><span style="font-weight:400;text-transform:none">(o que você paga)</span></th>' +
        '<th style="text-align:center;padding:6px 8px">Custo Experiente<br><span style="font-weight:400;text-transform:none">(o que você paga)</span></th>' +
        '<th style="text-align:center;padding:6px 8px">Preço Orçamento<br><span style="font-weight:400;text-transform:none">(o que você cobra)</span></th>' +
      '</tr></thead><tbody>' +
      REGIOES_LOCAL.map(function(r) {
        var v = (c.porRegiao || {})[r.key] || { custoNovato: 0, custoAntigo: 0, precoOrcamento: 0, custoAproximado: false };
        var vazio = !v.custoNovato && !v.custoAntigo;
        var aproximado = !vazio && v.custoAproximado;
        var aviso = vazio ? ' <span style="color:var(--amber);font-size:9px">⚠️ sem custo cadastrado</span>'
                  : aproximado ? ' <span style="color:var(--amber);font-size:9px">⚠️ aproximado, confira</span>'
                  : '';
        return '<tr style="border-top:1px solid var(--border)' + (vazio || aproximado ? ';background:rgba(247,195,90,.06)' : '') + '">' +
          '<td style="padding:6px 8px">' + r.label + aviso + '</td>' +
          '<td style="padding:4px 6px;text-align:center"><input type="number" min="0" step="1" value="' + (v.custoNovato || 0) + '" onchange="atualizarCargoValor(\'' + r.key + '\',\'custoNovato\',this.value)" style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px"></td>' +
          '<td style="padding:4px 6px;text-align:center"><input type="number" min="0" step="1" value="' + (v.custoAntigo || 0) + '" onchange="atualizarCargoValor(\'' + r.key + '\',\'custoAntigo\',this.value)" style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px"></td>' +
          '<td style="padding:4px 6px;text-align:center"><input type="number" min="0" step="1" value="' + (v.precoOrcamento || 0) + '" onchange="atualizarCargoValor(\'' + r.key + '\',\'precoOrcamento\',this.value)" style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px"></td>' +
        '</tr>';
      }).join('') +
    '</tbody></table>' +
    '<div style="font-size:11px;color:var(--text3);margin-top:10px">⚠️ "sem custo cadastrado" = nenhum histórico encontrado pra essa faixa. ⚠️ "aproximado" = trazido de uma faixa antiga de km diferente (a régua mudou) — o preço cobrado já veio exato, mas confira se o valor pago faz sentido pra essa nova faixa.</div>' +
    '</div>' +
    '<div style="padding:0 16px 16px;display:flex;gap:8px">' +
      '<button class="btn" onclick="setCargosView(\'lista\')" style="background:var(--green)">💾 Concluído</button>' +
    '</div>' +
  '</div>';
}

function atualizarCargoValor(regiaoKey, campo, valor) {
  var c = buscarCargoPorId(_cargoEditandoId);
  if (!c) return;
  if (!c.porRegiao) c.porRegiao = {};
  if (!c.porRegiao[regiaoKey]) c.porRegiao[regiaoKey] = {};
  c.porRegiao[regiaoKey][campo] = parseFloat(valor) || 0;
  // Uma vez editado à mão, o custo deixa de ser "aproximado" — ela confirmou o valor.
  if (campo === 'custoNovato' || campo === 'custoAntigo') c.porRegiao[regiaoKey].custoAproximado = false;
  sv('cargos');
}

function editarCargo(id) {
  setCargosView('form');
  setTimeout(function() { rFormCargo(id); }, 50);
}

// ── Bairros / Endereços ──────────────────────────────────────────────────────
// Aponta um bairro/cidade/condomínio pra uma das faixas de REGIOES_LOCAL —
// evita escolher a região errada na hora do orçamento/contrato.

function initEnderecosCadastro() {
  if (!D.enderecos) D.enderecos = [];
  importarEnderecosDeContratos();
  rEnderecos();
}

function getEnderecos() {
  return D.enderecos || [];
}

// Puxa histórico real: D.contratos[].local (endereço em texto livre) +
// D.contratos[].folhaConfig.regiao (região usada na folha de pagamento
// daquele contrato) já ficam salvos juntos em cada contrato — dá pra
// reconstruir "esse endereço já foi classificado como região X" sem
// perguntar de novo. Roda toda vez que a tela abre, idempotente (pula
// endereço já cadastrado, nunca sobrescreve).
function importarEnderecosDeContratos() {
  if (!D.contratos || !D.contratos.length) return 0;
  if (!D.enderecos) D.enderecos = [];
  var existentes = new Set(D.enderecos.map(function(e) { return (e.nome || '').toUpperCase(); }));
  var importados = 0;

  D.contratos.forEach(function(ct) {
    var local = (ct.local || '').trim();
    var regiaoAntiga = ct.folhaConfig && ct.folhaConfig.regiao;
    if (!local || !regiaoAntiga || existentes.has(local.toUpperCase())) return;
    var novasKeys = _MAPA_REGIAO_ANTIGA_PARA_NOVA[regiaoAntiga];
    if (!novasKeys || !novasKeys.length) return;
    // Uma região antiga pode virar mais de uma faixa nova (ex: "50 a 100 km"
    // virou "até 60km" e "até 100km") — pro endereço (um local físico só),
    // usa a faixa mais ampla como sugestão de partida; ela corrige se precisar.
    var novaKey = novasKeys[novasKeys.length - 1];

    D.enderecos.push({
      id: 'END' + Date.now() + Math.random().toString(36).slice(2, 6),
      nome: local,
      regiaoKey: novaKey,
      origemHistorico: true,
      aproximado: _REGIOES_EXATAS.indexOf(regiaoAntiga) === -1,
    });
    existentes.add(local.toUpperCase());
    importados++;
  });

  if (importados > 0) sv('enderecos');
  return importados;
}

// Usado por outras telas (futuramente) pra sugerir a região automaticamente
// a partir do nome do bairro/cidade digitado.
function buscarRegiaoPorEndereco(nome) {
  if (!nome) return null;
  var n = nome.trim().toUpperCase();
  var e = (D.enderecos || []).find(function(x) { return (x.nome || '').toUpperCase() === n; });
  return e ? e.regiaoKey : null;
}

function rEnderecos() {
  var cont = document.getElementById('end-lista-body');
  if (!cont) return;

  var busca = (document.getElementById('end-busca')?.value || '').toLowerCase();
  var lista = getEnderecos().slice().sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || ''); });
  if (busca) lista = lista.filter(function(e) { return (e.nome || '').toLowerCase().includes(busca); });

  var linhas = lista.length ? lista.map(function(e) {
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
      '<div style="flex:1">' +
        '<span style="font-size:12px;font-weight:600;color:var(--text)">' + e.nome + '</span>' +
        (e.origemHistorico ? '<div style="font-size:9px;color:var(--text3);margin-top:2px">Importado do histórico de contratos' + (e.aproximado ? ' — <span style="color:var(--amber)">⚠️ faixa aproximada, confira</span>' : '') + '</div>' : '') +
      '</div>' +
      '<select class="inp" style="width:240px;font-size:11px;padding:4px 6px" onchange="atualizarRegiaoEndereco(\'' + e.id + '\',this.value)">' +
        REGIOES_LOCAL.map(function(r) { return '<option value="' + r.key + '"' + (r.key === e.regiaoKey ? ' selected' : '') + '>' + r.label + '</option>'; }).join('') +
      '</select>' +
      '<button class="btn-sm btn-red" onclick="excluirEndereco(\'' + e.id + '\')">×</button>' +
    '</div>';
  }).join('') : '<div style="text-align:center;color:var(--text3);padding:24px;font-size:13px">Nenhum bairro/endereço cadastrado ainda.</div>';

  cont.innerHTML =
    '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">' +
      '<input class="inp" id="end-nome" type="text" placeholder="Nome do bairro/cidade/condomínio" style="flex:1;min-width:200px">' +
      '<select class="inp" id="end-regiao" style="width:240px">' +
        REGIOES_LOCAL.map(function(r) { return '<option value="' + r.key + '">' + r.label + '</option>'; }).join('') +
      '</select>' +
      '<button class="btn" style="background:var(--green)" onclick="adicionarEndereco()">+ Adicionar</button>' +
    '</div>' +
    linhas;
}

function atualizarRegiaoEndereco(id, regiaoKey) {
  var e = (D.enderecos || []).find(function(x) { return x.id === id; });
  if (!e) return;
  e.regiaoKey = regiaoKey;
  e.aproximado = false; // ela confirmou/corrigiu, não é mais aproximado
  sv('enderecos');
}

function adicionarEndereco() {
  var nome = (document.getElementById('end-nome')?.value || '').trim();
  if (!nome) { alert('Informe o nome do bairro/cidade/condomínio.'); return; }
  var regiaoKey = document.getElementById('end-regiao')?.value || REGIOES_LOCAL[0].key;

  if (!D.enderecos) D.enderecos = [];
  if (D.enderecos.some(function(e) { return (e.nome || '').toUpperCase() === nome.toUpperCase(); })) {
    alert('Esse endereço já está cadastrado.');
    return;
  }

  D.enderecos.push({
    id: 'END' + Date.now() + Math.random().toString(36).slice(2, 6),
    nome: nome,
    regiaoKey: regiaoKey,
  });
  sv('enderecos');
  document.getElementById('end-nome').value = '';
  rEnderecos();
}

function excluirEndereco(id) {
  if (!confirm('Excluir este endereço?')) return;
  D.enderecos = (D.enderecos || []).filter(function(e) { return e.id !== id; });
  sv('enderecos');
  rEnderecos();
}
