// ─── ASSOCIAÇÕES ENTRE ITENS ───────────────────────────────────────────────
// Um item ACESSÓRIO tem a quantidade "puxada" de um item PRINCIPAL, sem
// precisar de regra própria no Kit Base. Ex: BICO DE ANGOSTURA segue
// ANGOSTURA (1:1) — se a folha calcula 3 de ANGOSTURA, aparece 3 BICO.
//
// D.associacoes[] = {
//   id,
//   acessorio,          // nome (casa com Cadastro de Insumos)
//   acessorioCat,       // categoria de fallback p/ agrupar na folha
//   principal,          // nome do item que determina a quantidade
//   quantos, aCada,     // qtdAcessorio = arredonda pra cima(qtdPrincipal * quantos / aCada)
//   min,                // mínimo sempre levado
// }

function getAssociacoes() {
  return D.associacoes || [];
}

// Regra fixa: 1 principal por acessório (decisão da Juliana, 2026-08-27).
// Se um acessório aparecer 2x, a última associação prevalece.
function _assocDoAcessorio(nome) {
  var n = (nome || '').toUpperCase();
  return (D.associacoes || []).filter(function(a) { return (a.acessorio || '').toUpperCase() === n; }).pop() || null;
}

// ── Aplicar na Folha de Separação ──────────────────────────────────────────
// Recebe o `todosItens` (cat -> [ {item, qtd, ...} ]) já montado pelas regras
// do Kit Base + fichas + tabela de estimativa, e ajusta/insere os acessórios.
function aplicarAssociacoesSeparacao(todosItens) {
  var assocs = D.associacoes || [];
  if (!assocs.length || !todosItens) return;

  function qtdDoItem(nome) {
    var alvo = (nome || '').toUpperCase();
    var q = null;
    Object.keys(todosItens).forEach(function(cat) {
      (todosItens[cat] || []).forEach(function(x) {
        if ((x.item || '').toUpperCase() === alvo) q = x.qtd || 0;
      });
    });
    return q;
  }

  assocs.forEach(function(a) {
    if (!a.acessorio || !a.principal) return;
    var quantos = parseFloat(a.quantos) || 1;
    var aCada = parseFloat(a.aCada) || 1;
    var min = parseFloat(a.min) || 0;
    var qp = qtdDoItem(a.principal);
    var qtd = Math.max(min, qp == null ? 0 : Math.ceil(qp * quantos / aCada));

    var cat = (typeof categoriaAtualDoInsumo === 'function')
      ? categoriaAtualDoInsumo(a.acessorio, a.acessorioCat || 'MATERIAL')
      : (a.acessorioCat || 'MATERIAL');

    // Tira o acessório de qualquer outra categoria onde uma regra antiga o
    // tenha colocado — ele passa a existir só onde a associação manda.
    Object.keys(todosItens).forEach(function(c2) {
      if (c2 === cat) return;
      todosItens[c2] = (todosItens[c2] || []).filter(function(x) {
        return (x.item || '').toUpperCase() !== (a.acessorio || '').toUpperCase();
      });
    });

    if (!todosItens[cat]) todosItens[cat] = [];
    var ex = todosItens[cat].find(function(x) {
      return (x.item || '').toUpperCase() === (a.acessorio || '').toUpperCase();
    });
    var dados = {
      qtd: qtd, travado: true, associadoA: a.principal,
      assocQuantos: quantos, assocACada: aCada, assocMin: min,
    };
    if (ex) {
      Object.assign(ex, dados);
    } else {
      todosItens[cat].push(Object.assign({
        item: a.acessorio, doCardapio: false, coqueteis: [],
        soSeCardapio: false, obs: '', semFicha: false,
      }, dados));
    }
  });
}

// ── Tela: Regras e Cálculos → Associações ──────────────────────────────────
function rAssociacoes() {
  var cont = document.getElementById('regras-assoc-body');
  if (!cont) return;
  if (!D.associacoes) D.associacoes = [];

  var biblioteca = (typeof getBiblioteca === 'function') ? getBiblioteca() : {};
  var todosItens = [];
  Object.keys(biblioteca).sort().forEach(function(c) {
    (biblioteca[c] || []).forEach(function(it) { todosItens.push({ cat: c, nome: it }); });
  });
  var optItens = todosItens.map(function(x) {
    return '<option value="' + x.nome + '" data-cat="' + x.cat + '">' + x.nome + ' (' + x.cat + ')</option>';
  }).join('');

  var lista = (D.associacoes || []).slice();

  var html = '<div style="font-size:12px;color:var(--text3);margin-bottom:14px">' +
    'O <strong>acessório</strong> não precisa de regra no Kit Base — a quantidade dele sai do <strong>principal</strong>.<br>' +
    'Fórmula: <span style="font-family:var(--mono)">qtd acessório = arredonda pra cima( qtd do principal × quantos ÷ a cada )</span>, respeitando o mínimo.' +
  '</div>';

  if (lista.length) {
    html += '<div style="display:grid;grid-template-columns:1fr 24px 1fr 70px 70px 60px 40px;gap:8px;padding:0 0 6px;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid var(--border2)">' +
      '<span>Acessório</span><span></span><span>Principal</span><span style="text-align:center">Quantos</span><span style="text-align:center">A cada</span><span style="text-align:center">Mín.</span><span></span>' +
    '</div>';
    lista.forEach(function(a) {
      var semAcess = (typeof buscarInsumoPorNome === 'function') && !buscarInsumoPorNome(a.acessorio);
      var semPrinc = (typeof buscarInsumoPorNome === 'function') && !buscarInsumoPorNome(a.principal);
      html += '<div style="display:grid;grid-template-columns:1fr 24px 1fr 70px 70px 60px 40px;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px">' +
        '<span style="color:var(--text)">' + a.acessorio + (semAcess ? ' <span style="font-size:9px;color:var(--amber)">⚠️ sem insumo</span>' : '') + '</span>' +
        '<span style="text-align:center;color:var(--text3)">←</span>' +
        '<span style="color:var(--text)">' + a.principal + (semPrinc ? ' <span style="font-size:9px;color:var(--amber)">⚠️ sem insumo</span>' : '') + '</span>' +
        '<input class="inp" type="number" min="0" step="0.5" value="' + (a.quantos != null ? a.quantos : 1) + '" onchange="assocSet(\'' + a.id + '\',\'quantos\',this.value)" style="text-align:center;font-size:12px">' +
        '<input class="inp" type="number" min="1" step="1" value="' + (a.aCada != null ? a.aCada : 1) + '" onchange="assocSet(\'' + a.id + '\',\'aCada\',this.value)" style="text-align:center;font-size:12px">' +
        '<input class="inp" type="number" min="0" step="1" value="' + (a.min != null ? a.min : 0) + '" onchange="assocSet(\'' + a.id + '\',\'min\',this.value)" style="text-align:center;font-size:12px">' +
        '<button class="btn-sm btn-red" onclick="assocDel(\'' + a.id + '\')" style="justify-self:center">×</button>' +
      '</div>';
    });
  } else {
    html += '<div style="text-align:center;color:var(--text3);padding:20px 0;font-size:13px">Nenhuma associação. Adicione abaixo (ex: BICO DE ANGOSTURA ← ANGOSTURA, 1 a cada 1).</div>';
  }

  html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-top:14px">' +
    '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">+ Nova associação</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">' +
      '<div style="flex:1;min-width:200px"><label class="lbl">Acessório (segue o principal)</label>' +
        '<select id="assoc-acessorio" class="inp" style="width:100%"><option value="">—</option>' + optItens + '</select></div>' +
      '<div style="flex:1;min-width:200px"><label class="lbl">Principal (define a quantidade)</label>' +
        '<select id="assoc-principal" class="inp" style="width:100%"><option value="">—</option>' + optItens + '</select></div>' +
      '<div style="width:80px"><label class="lbl">Quantos</label><input class="inp" id="assoc-quantos" type="number" min="0" step="0.5" value="1" style="width:100%"></div>' +
      '<div style="width:80px"><label class="lbl">A cada</label><input class="inp" id="assoc-acada" type="number" min="1" step="1" value="1" style="width:100%"></div>' +
      '<div style="width:70px"><label class="lbl">Mínimo</label><input class="inp" id="assoc-min" type="number" min="0" step="1" value="0" style="width:100%"></div>' +
      '<button class="btn" onclick="assocAdd()" style="background:var(--blue)">Adicionar</button>' +
    '</div>' +
    '<div style="font-size:10px;color:var(--text3);margin-top:6px">Só aparecem itens já cadastrados na Biblioteca de Itens / Cadastro de Insumos.</div>' +
  '</div>';

  cont.innerHTML = html;
}

function assocAdd() {
  var acessSel = document.getElementById('assoc-acessorio');
  var acessorio = acessSel ? acessSel.value : '';
  var acessorioCat = (acessSel && acessSel.selectedOptions[0]) ? acessSel.selectedOptions[0].dataset.cat : '';
  var principal = document.getElementById('assoc-principal')?.value || '';
  var quantos = parseFloat(document.getElementById('assoc-quantos')?.value);
  var aCada = parseFloat(document.getElementById('assoc-acada')?.value);
  var min = parseFloat(document.getElementById('assoc-min')?.value) || 0;

  if (!acessorio || !principal) { alert('Escolha o acessório e o principal.'); return; }
  if (acessorio.toUpperCase() === principal.toUpperCase()) { alert('O acessório e o principal não podem ser o mesmo item.'); return; }
  if (!quantos || !aCada) { alert('Preencha "quantos" e "a cada".'); return; }

  if (!D.associacoes) D.associacoes = [];
  if (D.associacoes.some(function(a) { return (a.acessorio || '').toUpperCase() === acessorio.toUpperCase(); })) {
    alert('Esse acessório já está associado a um item. Exclua a associação atual primeiro.');
    return;
  }

  D.associacoes.push({
    id: _gerarId('ASC'),
    acessorio: acessorio, acessorioCat: acessorioCat,
    principal: principal, quantos: quantos, aCada: aCada, min: min,
  });
  sv('associacoes');

  // Um acessório com associação não precisa mais de regra própria no Kit Base
  // (senão as duas brigam pela quantidade). Remove a regra se existir.
  var tinhaRegra = D.regrasItens && D.regrasItens.some(function(r) { return (r.item || '').toUpperCase() === acessorio.toUpperCase(); });
  if (tinhaRegra) {
    D.regrasItens = D.regrasItens.filter(function(r) { return (r.item || '').toUpperCase() !== acessorio.toUpperCase(); });
    sv('regrasItens');
  }

  rAssociacoes();
  if (tinhaRegra) alert('Associação criada. A regra de Kit Base de "' + acessorio + '" foi removida — agora a quantidade dele vem de "' + principal + '".');
}

function assocSet(id, campo, valor) {
  var a = (D.associacoes || []).find(function(x) { return x.id === id; });
  if (!a) return;
  a[campo] = parseFloat(valor) || 0;
  sv('associacoes');
}

function assocDel(id) {
  var a = (D.associacoes || []).find(function(x) { return x.id === id; });
  if (!a) return;
  if (!confirm('Excluir a associação "' + a.acessorio + ' ← ' + a.principal + '"?')) return;
  D.associacoes = (D.associacoes || []).filter(function(x) { return x.id !== id; });
  sv('associacoes');
  rAssociacoes();
}
