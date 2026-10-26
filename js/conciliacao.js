// ─── CONCILIAÇÃO BANCÁRIA (pedido dela 10-26) ───────────────────────────────
// Ela importa o extrato do Itaú (.xlsx: Data | Lançamento | Razão Social |
// CPF/CNPJ | Valor | Saldo) sempre que quiser — períodos repetidos não
// duplicam, só entra o que ainda não existe. Cada entrada (crédito) é ligada
// a uma parcela do Contas a Receber:
//   - o sistema SUGERE (CPF do contrato, CPF já vinculado antes, ou nome +
//     valor) — nada é quitado sem ela confirmar;
//   - confirmar uma parcela pendente registra o pagamento pela mesma regra do
//     modal "Registrar pagamento" (_finAplicarPagamento: valor menor → precisa
//     de aprovação do admin; valor maior → abate das próximas parcelas);
//   - parcela que ela já tinha dado baixa à mão é só marcada como conferida.
//
// D.extratoBancario = [{ id, chave, data, lancamento, razao, cpf, valor,
//   arquivo, importadoEm, parcelaId, modo, conciliadoEm, conciliadoPor,
//   ignorado, motivoIgnorado }]
//   modo: 'registrado' (pagamento lançado pela conciliação) | 'jaPago'
// A parcela guarda f.extratoId; a entrada só conta como conciliada se a
// parcela ainda apontar pra ela (pagamento desfeito/rejeitado → volta a pendente).
// Gravado fatiado por ano (dados/extrato_AAAA), como o financeiro.

var _concFiltro = 'pendentes';
var _concAno = String(new Date().getFullYear());
var _concMes = '';
var _concBusca = '';
var _concVincularId = null;

function _concLista() { return D.extratoBancario || (D.extratoBancario = []); }
function _concEsc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function _concDig(s) { return String(s || '').replace(/\D/g, ''); }
function _concNorm(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim(); }
function _concTokens(s) {
  return _concNorm(s).split(/[^A-Z0-9]+/).filter(function(t) { return t.length >= 2 && !/^(DE|DA|DO|DOS|DAS|E|EM|LTDA|ME|EPP|SA)$/.test(t); });
}
function _concParcela(id) { return (D.financeiro || []).find(function(f) { return f.id === id; }) || null; }
function _concContratoDaParcela(f) {
  if (!f) return null;
  return (f.contratoId && (D.contratos || []).find(function(c) { return c.id === f.contratoId; })) ||
    (typeof _finContratoDoGrupo === 'function' ? _finContratoDoGrupo({ contratoId: f.contratoId, nome: f.evento || f.contrato, data: f.data }) : null);
}

// Conciliada = ligada a uma parcela que ainda aponta pra ela.
function _concConciliada(e) {
  if (!e.parcelaId) return false;
  var f = _concParcela(e.parcelaId);
  return !!(f && f.extratoId === e.id);
}

// ─── IMPORTAÇÃO ──────────────────────────────────────────────────────────────

function _concDataISO(v) {
  if (v == null || v === '') return '';
  if (typeof v === 'number' && window.XLSX && XLSX.SSF) {
    var d = XLSX.SSF.parse_date_code(v);
    return d ? d.y + '-' + String(d.m).padStart(2, '0') + '-' + String(d.d).padStart(2, '0') : '';
  }
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  var m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(String(v));
  return m ? m[3] + '-' + m[2] + '-' + m[1] : '';
}

function _concValor(v) {
  if (typeof v === 'number') return v;
  var t = String(v || '').replace(/[^\d,.\-]/g, '');
  if (!t) return 0;
  return typeof parseValorBR === 'function' ? parseValorBR(t) : parseFloat(t.replace(/\./g, '').replace(',', '.')) || 0;
}

// Chave do lançamento pra não duplicar: data + CPF + nome + valor (o texto do
// "Lançamento" muda entre exportações do banco, ex. "PIX RECEBIDO X" ×
// "ENTRADA PIX TRANSF X"). Sem CPF/nome (rendimento, resgate) entra o texto.
// O #n diferencia dois pagamentos iguais no mesmo dia.
function _concChaveBase(e) {
  var quem = _concDig(e.cpf) + '|' + _concNorm(e.razao);
  if (quem === '|') quem = _concNorm(e.lancamento);
  return e.data + '|' + quem + '|' + Math.round(e.valor * 100);
}

function concImportarExtrato(input) {
  var file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  if (!window.XLSX) { alert2('Biblioteca de planilha ainda não carregou — tente de novo em instantes.', 'error'); return; }
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
      var ws = wb.Sheets[wb.SheetNames[0]];
      var linhas = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
      _concProcessarLinhas(linhas, file.name);
    } catch (e) {
      console.error(e);
      alert2('Não consegui ler esse arquivo: ' + e.message + '. Use o extrato baixado do Itaú em Excel (.xlsx).', 'error');
    }
  };
  reader.onerror = function() { alert2('Erro ao ler o arquivo.', 'error'); };
  reader.readAsArrayBuffer(file);
}

function _concProcessarLinhas(linhas, arquivo) {
  // Acha a linha de cabeçalho (Data | Lançamento | Razão Social | CPF/CNPJ | Valor)
  var iCab = -1, col = {};
  for (var i = 0; i < Math.min(linhas.length, 40); i++) {
    var cab = linhas[i].map(function(c) { return _concNorm(c); });
    var iData = cab.indexOf('DATA');
    var iValor = cab.findIndex(function(c) { return /^VALOR/.test(c); });
    if (iData !== -1 && iValor !== -1) {
      iCab = i;
      col = {
        data: iData, valor: iValor,
        lanc: cab.findIndex(function(c) { return /^LANCAMENTO|^HISTORICO|^DESCRICAO/.test(c); }),
        razao: cab.findIndex(function(c) { return /RAZAO|NOME/.test(c); }),
        cpf: cab.findIndex(function(c) { return /CPF|CNPJ/.test(c); }),
      };
      break;
    }
  }
  if (iCab === -1) { alert2('Não achei as colunas Data e Valor nesse arquivo — confira se é o extrato de lançamentos do Itaú.', 'error'); return; }

  var existentes = {};
  _concLista().forEach(function(e) { existentes[e.chave] = true; });
  var contagem = {};
  var novos = [], repetidos = 0, saidas = 0;
  var agora = new Date().toISOString();
  for (var j = iCab + 1; j < linhas.length; j++) {
    var l = linhas[j];
    var data = _concDataISO(l[col.data]);
    var valor = Math.round(_concValor(l[col.valor]) * 100) / 100;
    if (!data || !valor) continue;
    if (valor < 0) { saidas++; continue; } // só entradas — é conciliação de recebimentos
    var e = {
      data: data, valor: valor,
      lancamento: col.lanc !== -1 ? String(l[col.lanc] || '').trim() : '',
      razao: col.razao !== -1 ? String(l[col.razao] || '').trim() : '',
      cpf: col.cpf !== -1 ? String(l[col.cpf] || '').trim() : '',
    };
    var base = _concChaveBase(e);
    contagem[base] = (contagem[base] || 0) + 1;
    e.chave = base + '#' + contagem[base];
    if (existentes[e.chave]) { repetidos++; continue; }
    existentes[e.chave] = true;
    e.id = _gerarId('EXT');
    e.arquivo = arquivo;
    e.importadoEm = agora;
    // Sem pagador (rendimento, resgate de aplicação): não é cliente — já
    // entra como ignorada; dá pra reativar.
    if (!e.razao && !_concDig(e.cpf)) { e.ignorado = true; e.motivoIgnorado = 'Movimentação do banco (sem pagador)'; }
    novos.push(e);
  }
  if (novos.length) {
    Array.prototype.push.apply(_concLista(), novos);
    sv('extratoBancario');
  }
  var clientes = novos.filter(function(e) { return !e.ignorado; }).length;
  alert2(novos.length
    ? novos.length + ' lançamento(s) novo(s) importado(s) (' + clientes + ' de clientes)' + (repetidos ? ', ' + repetidos + ' já estavam no sistema e foram ignorados' : '') + '.'
    : 'Nenhum lançamento novo — os ' + repetidos + ' do arquivo já estavam no sistema.');
  // Mostra o mês mais recente do arquivo.
  if (novos.length) { var ult = novos[novos.length - 1].data; _concAno = ult.slice(0, 4); _concMes = ''; }
  rConciliacao();
}

// ─── SUGESTÕES ───────────────────────────────────────────────────────────────

// CPFs que ela já vinculou à mão a algum contrato (pagador ≠ titular).
function _concCpfsAprendidos() {
  var mapa = {};
  _concLista().forEach(function(e) {
    var cpf = _concDig(e.cpf);
    if (!cpf || !_concConciliada(e)) return;
    var f = _concParcela(e.parcelaId);
    var k = typeof _finChaveContrato === 'function' ? _finChaveContrato(f) : (f.contratoId || f.contrato);
    (mapa[cpf] || (mapa[cpf] = {}))[k] = true;
  });
  return mapa;
}

function _concDiasEntre(a, b) {
  if (!a || !b) return 999;
  return Math.abs(Math.round((new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / 86400000));
}

// Melhor parcela para cada entrada pendente. Uma parcela só é sugerida para
// uma entrada (as mais antigas primeiro).
function _concCalcularSugestoes() {
  var aprendidos = _concCpfsAprendidos();
  var usadas = {};
  (D.financeiro || []).forEach(function(f) { if (f.extratoId) usadas[f.id] = true; });
  var parcelas = (D.financeiro || []).filter(function(f) { return !usadas[f.id] && !f.aprovacaoPendente; }).map(function(f) {
    var c = _concContratoDaParcela(f);
    return {
      f: f, c: c,
      tokens: _concTokens([f.contrato, f.evento, c && c.nome].filter(Boolean).join(' ')),
      cpf: _concDig(c && c.cpf),
      chave: typeof _finChaveContrato === 'function' ? _finChaveContrato(f) : '',
    };
  });
  var sug = {};
  _concLista().filter(function(e) { return !e.ignorado && !_concConciliada(e); })
    .sort(function(a, b) { return a.data.localeCompare(b.data); })
    .forEach(function(e) {
      var cpf = _concDig(e.cpf);
      var tok = _concTokens(e.razao);
      var melhor = null;
      parcelas.forEach(function(p) {
        if (usadas[p.f.id]) return;
        var porCpf = cpf && (cpf === p.cpf || (aprendidos[cpf] && aprendidos[cpf][p.chave]));
        var comuns = tok.filter(function(t) { return p.tokens.indexOf(t) !== -1; }).length;
        var porNome = comuns >= 2;
        if (!porCpf && !porNome) return;
        var pago = p.f.status === 'pago';
        var esperado = pago ? (Number(p.f.valorPago) || Number(p.f.valorNum) || 0) : (Number(p.f.valorNum) || 0);
        var valorIgual = Math.abs(esperado - e.valor) <= 0.01;
        // Já baixada à mão: só casa se valor e data do pagamento baterem.
        if (pago && (!valorIgual || _concDiasEntre(p.f.dataPagamento, e.data) > 5)) return;
        var nota = (valorIgual ? 100 : 0) + (porCpf ? 50 : 0) + comuns * 10 + (pago ? 5 : 0);
        var venc = p.f.vencimento || p.f.data || '9999';
        if (!melhor || nota > melhor.nota || (nota === melhor.nota && venc < melhor.venc)) {
          melhor = { p: p, nota: nota, venc: venc, valorIgual: valorIgual, porCpf: !!porCpf, comuns: comuns, pago: pago };
        }
      });
      if (melhor) {
        usadas[melhor.p.f.id] = true;
        var motivo = [melhor.porCpf ? 'CPF' : 'nome', melhor.valorIgual ? 'valor igual' : 'valor diferente'];
        if (melhor.pago) motivo.push('já baixada em ' + fd(melhor.p.f.dataPagamento));
        sug[e.id] = { parcelaId: melhor.p.f.id, alta: melhor.valorIgual, motivo: motivo.join(' · ') };
      }
    });
  return sug;
}

// ─── VINCULAR ────────────────────────────────────────────────────────────────

function _concUsuario() { return typeof _orcUsuarioAtual === 'function' ? _orcUsuarioAtual() : ((typeof perfilAtual !== 'undefined' && perfilAtual) || ''); }

// Liga a entrada à parcela. Parcela pendente → registra o pagamento (regras do
// Contas a Receber); já paga → só marca como conferida. Não grava.
function _concAplicarVinculo(e, f) {
  var msg = '', aguardando = false;
  if (f.status === 'pago') {
    e.modo = 'jaPago';
    msg = 'Pagamento já registrado — marcado como conferido no extrato.';
  } else {
    var r = _finAplicarPagamento(f, {
      valorPago: e.valor, dataPagamento: e.data,
      formaPagamento: /PIX/i.test(e.lancamento) ? 'pix' : 'transferencia',
      temComprovante: false, comprovanteTipo: '', comprovanteNome: 'Extrato bancário ' + fd(e.data),
    });
    e.modo = 'registrado';
    msg = r.msg; aguardando = r.aguardandoAprovacao;
  }
  f.extratoId = e.id;
  e.parcelaId = f.id;
  e.conciliadoEm = new Date().toISOString();
  e.conciliadoPor = _concUsuario();
  return { msg: msg, aguardando: aguardando };
}

function _concTextoParcela(f) {
  if (!f) return 'Parcela não encontrada';
  return (f.evento || f.contrato || '—') + ' — ' + (f.descricao || '') + ' (' + fR(f.status === 'pago' ? (f.valorPago || f.valorNum) : f.valorNum) + ')';
}

function concConfirmarSugestao(entradaId) {
  var e = _concLista().find(function(x) { return x.id === entradaId; });
  var s = _concCalcularSugestoes()[entradaId];
  if (!e || !s) return;
  _concVincular(e, _concParcela(s.parcelaId));
}

function _concVincular(e, f) {
  if (!e || !f) return;
  if (f.extratoId && f.extratoId !== e.id) { alert2('Essa parcela já está ligada a outro lançamento do extrato.', 'error'); return; }
  var esperado = f.status === 'pago' ? (Number(f.valorPago) || Number(f.valorNum) || 0) : (Number(f.valorNum) || 0);
  var dif = Math.round((e.valor - esperado) * 100) / 100;
  var aviso = 'Ligar o PIX de ' + fR(e.valor) + ' (' + (e.razao || e.lancamento) + ', ' + fd(e.data) + ') a:\n\n' + _concTextoParcela(f) + '\n\n';
  if (f.status === 'pago') aviso += 'A parcela já está paga — só vai ser marcada como conferida no extrato.';
  else if (dif < 0) aviso += 'O valor é ' + fR(-dif) + ' MENOR que o previsto. ' + ((typeof perfilAtual !== 'undefined' && perfilAtual === 'admin') ? 'Como administrador, a parcela fica quitada com esse valor.' : 'Vai para aprovação do administrador.');
  else if (dif > 0) aviso += 'O valor é ' + fR(dif) + ' MAIOR que o previsto — o excedente abate das próximas parcelas do contrato.';
  else aviso += 'O pagamento será registrado nessa parcela.';
  if (!confirm(aviso)) return;
  var r = _concAplicarVinculo(e, f);
  sv('financeiro'); sv('extratoBancario');
  closeM('mconc-vincular');
  alert2(r.msg, r.aguardando ? 'error' : 'success');
  rConciliacao();
}

function concConfirmarTodas() {
  var sug = _concCalcularSugestoes();
  var lista = _concFiltradas().filter(function(e) { return sug[e.id] && sug[e.id].alta; });
  if (!lista.length) { alert2('Nenhuma sugestão com valor igual para confirmar.', 'error'); return; }
  var total = lista.reduce(function(s, e) { return s + e.valor; }, 0);
  if (!confirm('Confirmar ' + lista.length + ' sugestão(ões) com valor igual (' + fR(total) + ')?\n\nCada uma registra o pagamento na parcela sugerida (ou marca como conferida, se já estava paga). Confira a lista antes — dá pra desfazer depois.')) return;
  var ok = 0;
  lista.forEach(function(e) {
    var f = _concParcela(sug[e.id].parcelaId);
    if (f && !f.extratoId) { _concAplicarVinculo(e, f); ok++; }
  });
  sv('financeiro'); sv('extratoBancario');
  alert2(ok + ' lançamento(s) conciliado(s).');
  rConciliacao();
}

function concDesfazer(entradaId) {
  var e = _concLista().find(function(x) { return x.id === entradaId; });
  if (!e) return;
  var f = _concParcela(e.parcelaId);
  if (f && f.extratoId === e.id) {
    if (e.modo === 'registrado') {
      // Desfaz o pagamento lançado pela conciliação (mesmo botão do Contas a Receber).
      var antes = f.status;
      marcarPendente(f.id);
      if (antes === 'pago' && f.status === 'pago') return; // ela cancelou o confirm
      f.extratoId = '';
    } else {
      if (!confirm('Tirar o vínculo deste lançamento com a parcela? O pagamento que já estava registrado continua como está.')) return;
      f.extratoId = '';
    }
  }
  e.parcelaId = ''; e.modo = ''; e.conciliadoEm = ''; e.conciliadoPor = '';
  sv('financeiro'); sv('extratoBancario');
  rConciliacao();
}

function concIgnorar(entradaId, ignorar) {
  var e = _concLista().find(function(x) { return x.id === entradaId; });
  if (!e) return;
  if (ignorar) {
    var motivo = prompt('Por que ignorar este lançamento? (ex: transferência entre contas, devolução, não é de cliente)', '');
    if (motivo === null) return;
    e.ignorado = true; e.motivoIgnorado = motivo.trim() || 'Ignorado';
  } else {
    e.ignorado = false; e.motivoIgnorado = '';
  }
  sv('extratoBancario');
  rConciliacao();
}

// ─── VINCULAR À MÃO (janela) ─────────────────────────────────────────────────

function _concModalEl() {
  var el = document.getElementById('mconc-vincular');
  if (el) return el;
  el = document.createElement('div');
  el.className = 'modal-overlay';
  el.id = 'mconc-vincular';
  el.innerHTML = '<div class="modal" style="max-width:640px;width:95%">' +
    '<div class="modal-head"><span class="modal-title">Vincular lançamento a uma parcela</span>' +
    '<button class="modal-close" onclick="closeM(\'mconc-vincular\')">×</button></div>' +
    '<div id="mconc-corpo" style="padding:14px 18px;max-height:80vh;overflow:auto"></div></div>';
  document.body.appendChild(el);
  return el;
}

function concAbrirVincular(entradaId) {
  var e = _concLista().find(function(x) { return x.id === entradaId; });
  if (!e) return;
  _concVincularId = entradaId;
  _concModalEl();
  var primeiro = _concTokens(e.razao)[0] || '';
  document.getElementById('mconc-corpo').innerHTML =
    '<div style="background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:10px 12px;margin-bottom:12px;font-size:12px">' +
      '<div style="font-weight:600;color:var(--text)">' + _concEsc(e.razao || e.lancamento) + ' <span style="font-family:var(--mono);color:var(--green);margin-left:6px">' + fR(e.valor) + '</span></div>' +
      '<div style="color:var(--text3)">' + fd(e.data) + (e.cpf ? ' · ' + _concEsc(e.cpf) : '') + ' · ' + _concEsc(e.lancamento) + '</div>' +
    '</div>' +
    '<input id="mconc-busca" class="inp" type="text" value="' + _concEsc(primeiro.charAt(0) + primeiro.slice(1).toLowerCase()) + '" placeholder="Buscar contrato/evento pelo nome" oninput="_concRenderBuscaParcelas()" style="width:100%;box-sizing:border-box">' +
    '<label style="display:flex;gap:6px;align-items:center;font-size:11px;color:var(--text3);margin:6px 0"><input type="checkbox" id="mconc-pagas" onchange="_concRenderBuscaParcelas()" style="width:auto;margin:0"> Mostrar também parcelas já pagas (pagamento registrado à mão)</label>' +
    '<div id="mconc-resultados"></div>' +
    '<div style="font-size:11px;color:var(--text3);margin-top:10px">Depois de vincular, os próximos pagamentos desse CPF já aparecem sugeridos para o mesmo contrato.</div>';
  _concRenderBuscaParcelas();
  openM('mconc-vincular');
}

function _concRenderBuscaParcelas() {
  var el = document.getElementById('mconc-resultados');
  if (!el) return;
  var e = _concLista().find(function(x) { return x.id === _concVincularId; });
  var termo = _concTokens((document.getElementById('mconc-busca') || {}).value || '');
  var verPagas = (document.getElementById('mconc-pagas') || {}).checked;
  var lista = (D.financeiro || []).filter(function(f) {
    if (f.extratoId && f.extratoId !== _concVincularId) return false;
    if (f.aprovacaoPendente) return false;
    if (f.status === 'pago' && !verPagas) return false;
    if (!termo.length) return true;
    var c = _concContratoDaParcela(f);
    var tok = _concTokens([f.contrato, f.evento, f.descricao, c && c.nome].filter(Boolean).join(' '));
    return termo.every(function(t) { return tok.some(function(x) { return x.indexOf(t) === 0; }); });
  }).sort(function(a, b) {
    // Valor igual ao do PIX primeiro, depois por vencimento.
    var ia = e && Math.abs((a.status === 'pago' ? a.valorPago || a.valorNum : a.valorNum) - e.valor) <= 0.01 ? 0 : 1;
    var ib = e && Math.abs((b.status === 'pago' ? b.valorPago || b.valorNum : b.valorNum) - e.valor) <= 0.01 ? 0 : 1;
    return ia - ib || (a.vencimento || a.data || '').localeCompare(b.vencimento || b.data || '');
  }).slice(0, 40);
  if (!lista.length) { el.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:8px 2px">Nenhuma parcela encontrada.</div>'; return; }
  el.innerHTML = lista.map(function(f) {
    var valor = f.status === 'pago' ? (f.valorPago || f.valorNum) : f.valorNum;
    var igual = e && Math.abs(valor - e.valor) <= 0.01;
    return '<div onclick="_concVincularManual(\'' + f.id + '\')" style="display:flex;gap:10px;align-items:center;padding:8px 10px;border-bottom:1px solid var(--border);cursor:pointer;font-size:12px" onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'\'">' +
      '<div style="flex:1"><div style="color:var(--text);font-weight:600">' + _concEsc(f.evento || f.contrato || '—') + '</div>' +
        '<div style="color:var(--text3)">' + _concEsc(f.descricao || '') + ' · evento ' + fd(f.data) + (f.vencimento ? ' · vence ' + fd(f.vencimento) : '') + '</div></div>' +
      '<div style="text-align:right"><div style="font-family:var(--mono);color:' + (igual ? 'var(--green)' : 'var(--text)') + '">' + fR(valor) + '</div>' +
        '<div style="font-size:10px;color:' + (f.status === 'pago' ? 'var(--green)' : 'var(--amber)') + '">' + (f.status === 'pago' ? 'paga ' + fd(f.dataPagamento) : 'pendente') + (igual ? ' · valor igual' : '') + '</div></div>' +
    '</div>';
  }).join('');
}

function _concVincularManual(parcelaId) {
  var e = _concLista().find(function(x) { return x.id === _concVincularId; });
  _concVincular(e, _concParcela(parcelaId));
}

// ─── TELA ────────────────────────────────────────────────────────────────────

function _concFiltradas() {
  var termo = _concNorm(_concBusca);
  return _concLista().filter(function(e) {
    if (_concAno && e.data.slice(0, 4) !== _concAno) return false;
    if (_concMes && e.data.slice(5, 7) !== _concMes) return false;
    if (termo && _concNorm([e.razao, e.lancamento, e.cpf, String(e.valor).replace('.', ',')].join(' ')).indexOf(termo) === -1) return false;
    return true;
  });
}

function rConciliacao() {
  var el = document.getElementById('conciliacao-content');
  if (!el) return;
  var sug = _concCalcularSugestoes();
  var todas = _concFiltradas();
  var conc = todas.filter(_concConciliada);
  var ign = todas.filter(function(e) { return e.ignorado && !_concConciliada(e); });
  var pend = todas.filter(function(e) { return !e.ignorado && !_concConciliada(e); });
  var comSug = pend.filter(function(e) { return sug[e.id]; });
  var altas = comSug.filter(function(e) { return sug[e.id].alta; });
  var soma = function(l) { return l.reduce(function(s, e) { return s + e.valor; }, 0); };
  var lista = _concFiltro === 'conciliados' ? conc : _concFiltro === 'ignorados' ? ign : _concFiltro === 'sugestoes' ? comSug : _concFiltro === 'todos' ? todas : pend;
  lista = lista.slice().sort(function(a, b) { return b.data.localeCompare(a.data); });

  var anos = {}; anos[String(new Date().getFullYear())] = true;
  _concLista().forEach(function(e) { anos[e.data.slice(0, 4)] = true; });
  var MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  var sel = 'font-size:12px;padding:5px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)';
  var ultimo = _concLista().reduce(function(m, e) { return e.importadoEm > (m.importadoEm || '') ? e : m; }, {});
  var card = function(rot, val, sub, cor) {
    return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">' + rot + '</div>' +
      '<div style="font-family:var(--mono);font-size:20px;font-weight:600;color:' + (cor || 'var(--text)') + ';margin-top:4px">' + val + '</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-top:2px">' + sub + '</div></div>';
  };

  el.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
      '<button class="btn-sm" onclick="go(\'financeiro\')" style="background:var(--bg3)">← Contas a Receber</button>' +
      '<span style="font-size:16px;font-weight:600;color:var(--text)">Conciliação bancária</span>' +
      (ultimo.importadoEm ? '<span style="font-size:11px;color:var(--text3)">Última importação: ' + new Date(ultimo.importadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) + (ultimo.arquivo ? ' · ' + _concEsc(ultimo.arquivo) : '') + '</span>' : '') +
      '<label class="btn btn-primary btn-sm" style="margin-left:auto;cursor:pointer">Importar extrato (.xlsx)<input type="file" accept=".xlsx,.xls" onchange="concImportarExtrato(this)" style="display:none"></label>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:12px">' +
      card('A conciliar', String(pend.length), fR(soma(pend)) + ' em entradas', 'var(--amber)') +
      card('Com sugestão', String(comSug.length), altas.length + ' com valor igual', 'var(--blue)') +
      card('Conciliados', String(conc.length), fR(soma(conc)), 'var(--green)') +
      card('Ignorados', String(ign.length), 'rendimentos, transferências…') +
    '</div>' +

    '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">' +
      [['pendentes', 'A conciliar'], ['sugestoes', 'Com sugestão'], ['conciliados', 'Conciliados'], ['ignorados', 'Ignorados'], ['todos', 'Todos']].map(function(f) {
        return '<button class="sort-btn' + (_concFiltro === f[0] ? ' active' : '') + '" onclick="_concFiltro=\'' + f[0] + '\';rConciliacao()">' + f[1] + '</button>';
      }).join('') +
      '<select onchange="_concAno=this.value;rConciliacao()" style="' + sel + ';margin-left:8px"><option value="">Todos os anos</option>' +
        Object.keys(anos).sort().reverse().map(function(a) { return '<option value="' + a + '"' + (a === _concAno ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select>' +
      '<select onchange="_concMes=this.value;rConciliacao()" style="' + sel + '"><option value="">Todos os meses</option>' +
        MESES.map(function(m, i) { var v = String(i + 1).padStart(2, '0'); return '<option value="' + v + '"' + (v === _concMes ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select>' +
      '<input type="text" value="' + _concEsc(_concBusca) + '" placeholder="Buscar nome, CPF, valor" onchange="_concBusca=this.value;rConciliacao()" style="' + sel + ';min-width:180px">' +
      (altas.length ? '<button class="btn-sm" onclick="concConfirmarTodas()" style="margin-left:auto;background:var(--green);color:#fff">Confirmar sugestões com valor igual (' + altas.length + ')</button>' : '') +
    '</div>' +

    (lista.length ? '<div style="display:grid;gap:6px">' + lista.map(function(e) { return _concLinhaHTML(e, sug[e.id]); }).join('') + '</div>'
      : '<div style="text-align:center;padding:40px 20px;color:var(--text3);font-size:13px">' +
          (_concLista().length ? 'Nada nesse filtro.' : 'Nenhum extrato importado ainda. Baixe o extrato de lançamentos no Itaú (Excel) e clique em "Importar extrato".') + '</div>');
}

function _concLinhaHTML(e, s) {
  var conciliada = _concConciliada(e);
  var f = conciliada ? _concParcela(e.parcelaId) : (s ? _concParcela(s.parcelaId) : null);
  var cor = conciliada ? 'var(--green)' : e.ignorado ? 'var(--text3)' : s ? 'var(--blue)' : 'var(--amber)';
  var direita;
  if (conciliada) {
    direita = '<div style="font-size:12px;color:var(--green);font-weight:600">' + _concEsc(_concTextoParcela(f)) + '</div>' +
      '<div style="font-size:10px;color:var(--text3)">' + (f && f.aprovacaoPendente ? '<span style="color:var(--amber)">aguardando aprovação do admin</span> · ' : '') +
        (e.modo === 'jaPago' ? 'pagamento já estava registrado' : 'pagamento registrado pela conciliação') +
        (e.conciliadoPor ? ' · ' + _concEsc(e.conciliadoPor) : '') + '</div>' +
      '<button class="btn-sm" onclick="concDesfazer(\'' + e.id + '\')" style="background:var(--bg3);margin-top:4px">Desfazer</button>';
  } else if (e.ignorado) {
    direita = '<div style="font-size:11px;color:var(--text3)">Ignorado: ' + _concEsc(e.motivoIgnorado || '') + '</div>' +
      '<button class="btn-sm" onclick="concIgnorar(\'' + e.id + '\',false)" style="background:var(--bg3);margin-top:4px">Reativar</button>';
  } else {
    direita = (s && f
      ? '<div style="font-size:11px;color:var(--text3)">Sugestão (' + _concEsc(s.motivo) + ')</div>' +
        '<div style="font-size:12px;color:' + (s.alta ? 'var(--text)' : 'var(--amber)') + ';font-weight:600">' + _concEsc(_concTextoParcela(f)) + '</div>'
      : '<div style="font-size:11px;color:var(--amber)">Nenhum contrato encontrado — vincule à mão</div>') +
      '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:4px;flex-wrap:wrap">' +
        (s ? '<button class="btn-sm" onclick="concConfirmarSugestao(\'' + e.id + '\')" style="background:var(--green);color:#fff">Confirmar</button>' : '') +
        '<button class="btn-sm" onclick="concAbrirVincular(\'' + e.id + '\')" style="background:var(--bg3)">' + (s ? 'Outra parcela' : 'Vincular') + '</button>' +
        '<button class="btn-sm" onclick="concIgnorar(\'' + e.id + '\',true)" style="background:var(--bg3)">Ignorar</button>' +
      '</div>';
  }
  return '<div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid ' + cor + ';border-radius:var(--radius);padding:10px 14px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">' +
    '<div style="font-family:var(--mono);font-size:12px;color:var(--text);min-width:78px">' + fd(e.data) + '</div>' +
    '<div style="flex:1;min-width:200px">' +
      '<div style="font-size:13px;font-weight:600;color:var(--text)">' + _concEsc(e.razao || e.lancamento) + '</div>' +
      '<div style="font-size:11px;color:var(--text3)">' + (e.cpf ? _concEsc(e.cpf) + ' · ' : '') + _concEsc(e.lancamento) + '</div>' +
    '</div>' +
    '<div style="font-family:var(--mono);font-size:14px;font-weight:600;color:var(--green);min-width:100px;text-align:right">' + fR(e.valor) + '</div>' +
    '<div style="flex:1;min-width:260px;text-align:right">' + direita + '</div>' +
  '</div>';
}
