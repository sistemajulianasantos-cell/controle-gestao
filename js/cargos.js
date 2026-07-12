// ─── CADASTRO DE CARGOS (custo x preço) + BAIRROS/ENDEREÇOS ─────────────────
// Segundo domínio da centralização de cadastro (depois de Produtos/Insumos).
// Unifica "quanto pago" (D.regrasEquipe, equipe.js) com "quanto cobro"
// (D.orcPrecos.locais, orcCalc.js) numa única faixa de Região/Local — as duas
// telas antigas continuam existindo e não foram migradas ainda (fase futura).

// Lista única de faixas — usa EXATAMENTE as mesmas faixas/nomes que já
// existem em Equipe → Regras de Pagamento (REGIOES_PAGAMENTO, equipe.js),
// por pedido da Juliana: são as faixas com histórico mais completo e
// detalhado (vão até "acima de 400 km"). Quem precisa se encaixar aqui é o
// preço do orçamento, que usava uma régua diferente (até 300km).
var REGIOES_LOCAL = [
  { key: 'area_central',  label: 'Área Central BH' },
  { key: 'jardim_canada', label: 'Jardim Canadá / C. Nova' },
  { key: 'reg_metro',     label: 'Região Metropolitana' },
  { key: 'viagem_100',    label: 'Viagem 50 a 100 km' },
  { key: 'viagem_250',    label: 'Viagem 101 a 250 km' },
  { key: 'viagem_400',    label: 'Viagem 251 a 400 km' },
  { key: 'viagem_mais',   label: 'Viagem acima de 400 km' },
];

// Mapa faixa antiga do ORÇAMENTO (CALC_LOCAIS_PADRAO/orcCalc.js) → faixa
// nova (REGIOES_LOCAL). As 3 primeiras são exatas (mesmo nome/corte nas
// duas telas). As de "viagem" são aproximação, porque a régua do orçamento
// ia só até 300km em cortes diferentes dos da Equipe — todo preço que
// entrar por essa via fica marcado com precoAproximado:true, nunca escondido.
var _MAPA_LOCAL_ORCAMENTO_PARA_REGIAO = {
  area_central:  'area_central',
  jardim_canada: 'jardim_canada',
  reg_metro:     'reg_metro',
  viagem_60:     'viagem_100',  // até 60km (orçamento) → 50 a 100km (aproximado)
  viagem_100:    'viagem_100',  // até 100km (orçamento) → 50 a 100km (mais próximo — processado por último, prevalece)
  viagem_200:    'viagem_250',  // até 200km (orçamento) → 101 a 250km (aproximado)
  viagem_300:    'viagem_400',  // até 300km (orçamento) → 251 a 400km (aproximado)
};
var _LOCAIS_ORCAMENTO_EXATOS = ['area_central', 'jardim_canada', 'reg_metro'];
// "Viagem acima de 400 km" não tem nenhuma faixa equivalente no orçamento
// antigo (que ia só até 300km) — fica sem preço migrado, precisa preencher na mão.

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

  // A lista de faixas mudou (agora usa as 7 faixas de Equipe, não as 8 que
  // a gente tinha inventado antes). Cargos migrados na versão anterior
  // ficaram com chaves que não existem mais — reconstrói do zero (a
  // Juliana confirmou que ainda não tinha editado nada manualmente).
  var esquemaAntigo = D.cargos.some(function(c) {
    return c.porRegiao && (c.porRegiao.viagem_60 || c.porRegiao.viagem_200 || c.porRegiao.viagem_300 || c.porRegiao.viagem_acima_300);
  });
  if (esquemaAntigo) D.cargos = [];

  var rg = D.regrasEquipe || {};
  var precos = (typeof getOrcPrecos === 'function') ? getOrcPrecos() : null;
  var locais = (precos && precos.locais) || {};
  var mudou = esquemaAntigo;

  _CARGOS_DEF.forEach(function(def) {
    if (D.cargos.some(function(c) { return c.key === def.key; })) return; // já existe, não sobrescreve edições

    var porRegiao = {};
    REGIOES_LOCAL.forEach(function(r) {
      // Custo (o que paga): migração exata — a lista nova É a lista antiga
      // de Região usada em Equipe → Regras de Pagamento.
      var baseReg = ((rg.base || {})[r.key] || {})[def.key] || {};
      porRegiao[r.key] = {
        custoNovato: baseReg.novato || 0,
        custoAntigo: baseReg.antigo || 0,
        precoOrcamento: 0,
        precoAproximado: false,
      };
    });

    // Preço (o que cobra): mapeado a partir das faixas antigas do orçamento.
    Object.keys(_MAPA_LOCAL_ORCAMENTO_PARA_REGIAO).forEach(function(localAntigo) {
      var novaKey = _MAPA_LOCAL_ORCAMENTO_PARA_REGIAO[localAntigo];
      var valor = (locais[localAntigo] || {})[def.key] || 0;
      if (!valor) return;
      porRegiao[novaKey].precoOrcamento = valor;
      porRegiao[novaKey].precoAproximado = _LOCAIS_ORCAMENTO_EXATOS.indexOf(localAntigo) === -1;
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

// "Falta preencher" = falta o custo (o que paga) pra essa faixa.
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
      (faltando ? '<span style="font-size:10px;color:var(--amber)">⚠️ ' + faltando + ' faixa(s) sem custo</span>' : '<span style="font-size:10px;color:var(--green)">completo</span>') +
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
        var v = (c.porRegiao || {})[r.key] || { custoNovato: 0, custoAntigo: 0, precoOrcamento: 0, precoAproximado: false };
        var custoVazio = !v.custoNovato && !v.custoAntigo;
        var precoVazio = !v.precoOrcamento;
        var precoAprox = !precoVazio && v.precoAproximado;
        var avisos = [];
        if (custoVazio) avisos.push('<span style="color:var(--amber);font-size:9px">⚠️ sem custo</span>');
        if (precoVazio) avisos.push('<span style="color:var(--amber);font-size:9px">⚠️ sem preço</span>');
        if (precoAprox) avisos.push('<span style="color:var(--amber);font-size:9px">⚠️ preço aproximado</span>');
        var destaque = custoVazio || precoVazio || precoAprox;
        return '<tr style="border-top:1px solid var(--border)' + (destaque ? ';background:rgba(247,195,90,.06)' : '') + '">' +
          '<td style="padding:6px 8px">' + r.label + (avisos.length ? ' ' + avisos.join(' ') : '') + '</td>' +
          '<td style="padding:4px 6px;text-align:center"><input type="number" min="0" step="1" value="' + (v.custoNovato || 0) + '" onchange="atualizarCargoValor(\'' + r.key + '\',\'custoNovato\',this.value)" style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px"></td>' +
          '<td style="padding:4px 6px;text-align:center"><input type="number" min="0" step="1" value="' + (v.custoAntigo || 0) + '" onchange="atualizarCargoValor(\'' + r.key + '\',\'custoAntigo\',this.value)" style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px"></td>' +
          '<td style="padding:4px 6px;text-align:center"><input type="number" min="0" step="1" value="' + (v.precoOrcamento || 0) + '" onchange="atualizarCargoValor(\'' + r.key + '\',\'precoOrcamento\',this.value)" style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px"></td>' +
        '</tr>';
      }).join('') +
    '</tbody></table>' +
    '<div style="font-size:11px;color:var(--text3);margin-top:10px">⚠️ "sem custo/preço" = nenhum histórico encontrado pra essa faixa. ⚠️ "preço aproximado" = o orçamento usava faixas de km diferentes até 300km — o valor veio da faixa mais parecida, confira se faz sentido.</div>' +
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
  // Uma vez editado à mão, o preço deixa de ser "aproximado" — ela confirmou o valor.
  if (campo === 'precoOrcamento') c.porRegiao[regiaoKey].precoAproximado = false;
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
// D.contratos[].folhaConfig.regiao já ficam salvos juntos em cada contrato.
// Como REGIOES_LOCAL agora usa exatamente as mesmas chaves de região que
// equipe.js já usava, o valor de folhaConfig.regiao bate direto, sem
// aproximação nenhuma. Roda toda vez que a tela abre, idempotente (pula
// endereço já cadastrado, nunca sobrescreve).
function importarEnderecosDeContratos() {
  if (!D.contratos || !D.contratos.length) return 0;
  if (!D.enderecos) D.enderecos = [];
  var existentes = new Set(D.enderecos.map(function(e) { return (e.nome || '').toUpperCase(); }));
  var chavesValidas = new Set(REGIOES_LOCAL.map(function(r) { return r.key; }));
  var importados = 0;

  D.contratos.forEach(function(ct) {
    var local = (ct.local || '').trim();
    var regiao = ct.folhaConfig && ct.folhaConfig.regiao;
    if (!local || !regiao || !chavesValidas.has(regiao) || existentes.has(local.toUpperCase())) return;

    D.enderecos.push({
      id: 'END' + Date.now() + Math.random().toString(36).slice(2, 6),
      nome: local,
      regiaoKey: regiao,
      origemHistorico: true,
    });
    existentes.add(local.toUpperCase());
    importados++;
  });

  if (importados > 0) sv('enderecos');
  return importados;
}

// Usado por outras telas (futuramente) pra sugerir a região automaticamente
// a partir do nome do bairro/cidade digitado.
// Casa por nome exato OU por trecho contido no texto (nos dois sentidos) —
// permite cadastrar só o bairro/cidade resumido (ex: "Lourdes", "Funilândia")
// e reconhecer isso dentro de um endereço completo digitado depois
// (ex: "Rua X, 123 - Lourdes - Belo Horizonte"). Prioriza o casamento mais
// específico (nome mais longo) quando mais de um bater.
function buscarRegiaoPorEndereco(nome) {
  if (!nome) return null;
  var n = (nome || '').trim().toUpperCase();
  if (!n) return null;

  var exato = (D.enderecos || []).find(function(x) { return (x.nome || '').toUpperCase() === n; });
  if (exato) return exato.regiaoKey;

  var candidatos = (D.enderecos || []).filter(function(x) {
    var cad = (x.nome || '').toUpperCase();
    return cad && cad.length >= 3 && (n.includes(cad) || cad.includes(n));
  });
  if (!candidatos.length) return null;
  candidatos.sort(function(a, b) { return (b.nome || '').length - (a.nome || '').length; });
  return candidatos[0].regiaoKey;
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
        (e.origemHistorico ? '<div style="font-size:9px;color:var(--text3);margin-top:2px">Importado do histórico de contratos</div>' : '') +
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
