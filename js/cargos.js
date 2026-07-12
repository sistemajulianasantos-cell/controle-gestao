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

// As 3 primeiras faixas batem exatamente com as duas listas antigas — dá pra
// migrar o valor com segurança. As faixas de "viagem" mudaram de corte nas
// duas listas antigas (e de um jeito incompatível entre si), então não tem
// como migrar automaticamente sem arriscar um valor financeiro errado.
var _REGIOES_MIGRAVEIS = ['area_central', 'jardim_canada', 'reg_metro'];

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
      var migravel = _REGIOES_MIGRAVEIS.indexOf(r.key) !== -1;
      var baseReg = migravel ? (((rg.base || {})[r.key] || {})[def.key] || {}) : {};
      var loc = migravel ? (locais[r.key] || {}) : {};
      porRegiao[r.key] = {
        custoNovato: migravel ? (baseReg.novato || 0) : 0,
        custoAntigo: migravel ? (baseReg.antigo || 0) : 0,
        precoOrcamento: migravel ? (loc[def.key] || 0) : 0,
      };
    });

    D.cargos.push({
      id: 'CRG' + Date.now() + Math.random().toString(36).slice(2, 6),
      key: def.key,
      nome: def.nome,
      porRegiao: porRegiao,
    });
    mudou = true;
  });

  if (mudou) sv('cargos');
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

function _cargoFaixasSemValor(cargo) {
  return REGIOES_LOCAL.filter(function(r) {
    var v = (cargo.porRegiao || {})[r.key] || {};
    return !v.custoNovato && !v.custoAntigo && !v.precoOrcamento;
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
        var v = (c.porRegiao || {})[r.key] || { custoNovato: 0, custoAntigo: 0, precoOrcamento: 0 };
        var vazio = !v.custoNovato && !v.custoAntigo && !v.precoOrcamento;
        return '<tr style="border-top:1px solid var(--border)' + (vazio ? ';background:rgba(247,195,90,.06)' : '') + '">' +
          '<td style="padding:6px 8px">' + r.label + (vazio ? ' <span style="color:var(--amber);font-size:9px">⚠️ revisar</span>' : '') + '</td>' +
          '<td style="padding:4px 6px;text-align:center"><input type="number" min="0" step="1" value="' + (v.custoNovato || 0) + '" onchange="atualizarCargoValor(\'' + r.key + '\',\'custoNovato\',this.value)" style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px"></td>' +
          '<td style="padding:4px 6px;text-align:center"><input type="number" min="0" step="1" value="' + (v.custoAntigo || 0) + '" onchange="atualizarCargoValor(\'' + r.key + '\',\'custoAntigo\',this.value)" style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px"></td>' +
          '<td style="padding:4px 6px;text-align:center"><input type="number" min="0" step="1" value="' + (v.precoOrcamento || 0) + '" onchange="atualizarCargoValor(\'' + r.key + '\',\'precoOrcamento\',this.value)" style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px"></td>' +
        '</tr>';
      }).join('') +
    '</tbody></table>' +
    '<div style="font-size:11px;color:var(--text3);margin-top:10px">⚠️ = faixa nova ou não migrada automaticamente — as distâncias de viagem mudaram entre as duas telas antigas, então não copiamos nenhum valor pra essas faixas pra não arriscar um número financeiro errado. Preencha com o valor real quando tiver.</div>' +
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
  rEnderecos();
}

function getEnderecos() {
  return D.enderecos || [];
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
    var r = REGIOES_LOCAL.find(function(x) { return x.key === e.regiaoKey; });
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
      '<div style="flex:1;font-size:12px;font-weight:600;color:var(--text)">' + e.nome + '</div>' +
      '<span class="badge b-blue" style="font-size:10px">' + (r ? r.label : e.regiaoKey) + '</span>' +
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
