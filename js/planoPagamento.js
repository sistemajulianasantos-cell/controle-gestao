// ─── PLANO DE PAGAMENTO DO CONTRATO (pedido dela 10-26) ─────────────────────
// Antes todo contrato virava 20% + 80% no Contas a Receber. Agora cada
// contrato tem um plano: 20/80, 30/70, 50/50, parcelado (entrada + N parcelas
// mensais num dia fixo) ou personalizado (ela digita cada parcela).
//   - Gerar contrato (orçamento) escolhe o plano e cria as parcelas;
//   - contrato que já existe: botão "Plano" (Contas a Receber / Contratos)
//     refaz só as parcelas PENDENTES — as pagas ficam como estão — e a soma
//     tem que bater com o valor do contrato.
// c.planoPagamento = { tipo, cfg, parcelas:[{descricao,valor,vencimento}],
//   atualizadoEm, atualizadoPor }

var PLANO_TIPOS = [
  { id: '20_80', rotulo: '20% + 80%', pct: [20, 80] },
  { id: '30_70', rotulo: '30% + 70%', pct: [30, 70] },
  { id: '50_50', rotulo: '50% + 50%', pct: [50, 50] },
  { id: 'parcelado', rotulo: 'Parcelado (entrada + parcelas mensais)' },
  { id: 'personalizado', rotulo: 'Personalizado (digitar cada parcela)' },
];
var _planoCtx = {};

function _planoEsc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function _planoR2(v) { return Math.round((Number(v) || 0) * 100) / 100; }
function _planoHoje() { return new Date().toISOString().slice(0, 10); }
function _planoNum(v) { return typeof parseValorBR === 'function' ? parseValorBR(String(v || '')) : parseFloat(String(v || '').replace(/\./g, '').replace(',', '.')) || 0; }
function _planoFmtBR(v) { return (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// Data no dia D do mês (AAAA-MM); dia maior que o mês → último dia.
function _planoDataNoDia(anoMes, dia) {
  var p = anoMes.split('-').map(Number);
  var ultimo = new Date(p[0], p[1], 0).getDate();
  return p[0] + '-' + String(p[1]).padStart(2, '0') + '-' + String(Math.min(dia, ultimo)).padStart(2, '0');
}
function _planoSomaMes(anoMes, n) {
  var p = anoMes.split('-').map(Number);
  var d = new Date(p[0], p[1] - 1 + n, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
function _plano7DiasAntes(dataEvento) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataEvento || '')) return '';
  var d = new Date(dataEvento + 'T12:00:00'); d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

// Parcelas do plano para um valor. Devolve { parcelas, erro }.
function planoGerar(valor, cfg, dataEvento) {
  valor = _planoR2(valor);
  cfg = cfg || { tipo: '20_80' };
  var t = PLANO_TIPOS.find(function(x) { return x.id === cfg.tipo; }) || PLANO_TIPOS[0];
  var parcelas = [];
  var entradaVenc = cfg.entradaVenc || _planoHoje();
  if (t.pct) {
    var e = _planoR2(valor * t.pct[0] / 100);
    parcelas.push({ descricao: 'Sinal ' + t.pct[0] + '% — assinatura do contrato', valor: e, vencimento: entradaVenc });
    parcelas.push({ descricao: 'Restante ' + t.pct[1] + '% — 7 dias antes do evento', valor: _planoR2(valor - e), vencimento: _plano7DiasAntes(dataEvento) });
  } else if (t.id === 'parcelado') {
    var entrada = cfg.entradaModo === '%' ? _planoR2(valor * (Number(cfg.entrada) || 0) / 100) : _planoR2(cfg.entrada);
    if (entrada > valor) return { parcelas: [], erro: 'A entrada é maior que o valor.' };
    var qtd = Math.max(1, parseInt(cfg.qtd, 10) || 1);
    var dia = Math.min(31, Math.max(1, parseInt(cfg.dia, 10) || Number(entradaVenc.slice(8, 10)) || 10));
    var mes1 = /^\d{4}-\d{2}$/.test(cfg.primeiroMes || '') ? cfg.primeiroMes : _planoSomaMes(entradaVenc.slice(0, 7), 1);
    if (entrada > 0) parcelas.push({ descricao: 'Entrada — assinatura do contrato', valor: entrada, vencimento: entradaVenc });
    var resto = _planoR2(valor - entrada);
    var cada = Math.floor(resto / qtd * 100) / 100;
    for (var i = 0; i < qtd; i++) {
      parcelas.push({
        descricao: 'Parcela ' + (i + 1) + '/' + qtd,
        valor: i === qtd - 1 ? _planoR2(resto - cada * (qtd - 1)) : cada,
        vencimento: _planoDataNoDia(_planoSomaMes(mes1, i), dia),
      });
    }
  } else {
    parcelas = (cfg.linhas || []).filter(function(l) { return _planoR2(l.valor) > 0; }).map(function(l, i) {
      return { descricao: (l.descricao || '').trim() || ('Parcela ' + (i + 1)), valor: _planoR2(l.valor), vencimento: l.vencimento || '' };
    });
    if (!parcelas.length) return { parcelas: [], erro: 'Digite pelo menos uma parcela.' };
  }
  parcelas.forEach(function(p, i) { p.ordem = i + 1; });
  var soma = _planoR2(parcelas.reduce(function(s, p) { return s + p.valor; }, 0));
  if (Math.abs(soma - valor) > 0.01) {
    return { parcelas: parcelas, erro: 'A soma das parcelas (' + fR(soma) + ') é diferente do valor (' + fR(valor) + ') — ' + (soma < valor ? 'faltam ' + fR(valor - soma) : 'sobram ' + fR(soma - valor)) + '.' };
  }
  return { parcelas: parcelas, erro: '' };
}

// Rótulo curto do plano de um contrato ("20/80", "Parcelado 1+7"…).
function planoRotulo(c, nParcelas) {
  var p = c && c.planoPagamento;
  if (p && p.tipo) {
    if (p.tipo === 'parcelado') return 'Parcelado (' + ((p.parcelas || []).length || nParcelas) + 'x)';
    if (p.tipo === 'personalizado') return 'Personalizado (' + ((p.parcelas || []).length || nParcelas) + 'x)';
    return p.tipo.replace('_', '/');
  }
  return !nParcelas || nParcelas <= 2 ? '20/80' : nParcelas + ' parcelas';
}

// Texto das parcelas para o contrato: "Entrada — assinatura do contrato:
// R$ 4.176,00 (quatro mil…) em 24/09/2025" — uma linha por parcela.
function planoTextoParcelas(parcelas) {
  return (parcelas || []).map(function(p) {
    var ext = typeof _propostaValorTexto === 'function' ? _propostaValorTexto(p.valor) : fR(p.valor);
    return p.descricao + ': ' + ext + (p.vencimento ? ' em ' + fd(p.vencimento) : '');
  }).join('\n');
}

// ─── FORMULÁRIO (reaproveitado na janela Gerar contrato e no botão Plano) ───
// ctx = { valor: () => número, dataEvento, soParcelado, onChange }

function planoFormHTML(pfx, cfg, ctx) {
  cfg = Object.assign({ tipo: '20_80', entradaModo: '%', entrada: '', entradaVenc: _planoHoje(), qtd: '', dia: '', primeiroMes: '', linhas: [] }, cfg || {});
  _planoCtx[pfx] = Object.assign({}, ctx, { linhas: (cfg.linhas || []).map(function(l) { return Object.assign({}, l); }) });
  if (!_planoCtx[pfx].linhas.length) _planoCtx[pfx].linhas = [{ descricao: '', valor: '', vencimento: '' }];
  var tipos = ctx && ctx.soParcelado ? PLANO_TIPOS.filter(function(t) { return !t.pct; }) : PLANO_TIPOS;
  if (!tipos.some(function(t) { return t.id === cfg.tipo; })) cfg.tipo = tipos[0].id;
  return '<div id="' + pfx + '-plano" data-cfg="' + _planoEsc(JSON.stringify(cfg)) + '">' +
    '<label class="lbl">Plano de pagamento *</label>' +
    '<select id="' + pfx + '-plano-tipo" class="inp" onchange="planoMudouTipo(\'' + pfx + '\')" style="width:100%;box-sizing:border-box;margin-bottom:8px">' +
      tipos.map(function(t) { return '<option value="' + t.id + '"' + (t.id === cfg.tipo ? ' selected' : '') + '>' + t.rotulo + '</option>'; }).join('') +
    '</select>' +
    '<div id="' + pfx + '-plano-campos">' + _planoCamposHTML(pfx, cfg) + '</div>' +
    '<div id="' + pfx + '-plano-preview" style="margin-top:8px"></div>' +
  '</div>';
}

function _planoCamposHTML(pfx, cfg) {
  var campo = 'width:100%;box-sizing:border-box';
  var on = 'oninput="planoPreview(\'' + pfx + '\')" onchange="planoPreview(\'' + pfx + '\')"';
  var entradaVenc = '<div><label class="lbl">' + (cfg.tipo === 'parcelado' ? 'Vencimento da entrada' : 'Vencimento do sinal') + '</label><input id="' + pfx + '-plano-evenc" class="inp" type="date" value="' + _planoEsc(cfg.entradaVenc || _planoHoje()) + '" ' + on + ' style="' + campo + '"></div>';
  if (cfg.tipo === 'parcelado') {
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      '<div><label class="lbl">Entrada</label><div style="display:flex;gap:4px">' +
        '<select id="' + pfx + '-plano-emodo" class="inp" ' + on + ' style="width:auto"><option value="%"' + (cfg.entradaModo === '%' ? ' selected' : '') + '>%</option><option value="R$"' + (cfg.entradaModo === 'R$' ? ' selected' : '') + '>R$</option></select>' +
        '<input id="' + pfx + '-plano-entrada" class="inp" type="text" inputmode="decimal" value="' + _planoEsc(cfg.entrada) + '" placeholder="0 = sem entrada" ' + on + ' style="flex:1;min-width:0"></div></div>' +
      entradaVenc +
      '<div><label class="lbl">Quantidade de parcelas *</label><input id="' + pfx + '-plano-qtd" class="inp" type="number" min="1" step="1" value="' + _planoEsc(cfg.qtd) + '" placeholder="ex: 7" ' + on + ' style="' + campo + '"></div>' +
      '<div><label class="lbl">Dia do vencimento</label><input id="' + pfx + '-plano-dia" class="inp" type="number" min="1" max="31" value="' + _planoEsc(cfg.dia) + '" placeholder="ex: 15" ' + on + ' style="' + campo + '"></div>' +
      '<div><label class="lbl">1ª parcela no mês</label><input id="' + pfx + '-plano-mes" class="inp" type="month" value="' + _planoEsc(cfg.primeiroMes) + '" ' + on + ' style="' + campo + '"></div>' +
      '<div style="font-size:10px;color:var(--text3);align-self:end;padding-bottom:6px">Em branco: mês seguinte à entrada.</div>' +
    '</div>';
  }
  if (cfg.tipo === 'personalizado') {
    var linhas = _planoCtx[pfx].linhas;
    return '<div style="display:grid;gap:6px">' + linhas.map(function(l, i) {
      var set = function(c) { return 'oninput="_planoCtx[\'' + pfx + '\'].linhas[' + i + '].' + c + '=this.value;planoPreview(\'' + pfx + '\')"'; };
      return '<div style="display:flex;gap:6px;align-items:center">' +
        '<input class="inp" type="text" value="' + _planoEsc(l.descricao) + '" placeholder="Descrição (ex: Sinal)" ' + set('descricao') + ' style="flex:2;min-width:0">' +
        '<input class="inp" type="text" inputmode="decimal" value="' + _planoEsc(l.valor) + '" placeholder="Valor" ' + set('valor') + ' style="flex:1;min-width:0;text-align:right">' +
        '<input class="inp" type="date" value="' + _planoEsc(l.vencimento) + '" ' + set('vencimento').replace('oninput', 'onchange') + ' style="flex:1;min-width:0">' +
        '<button class="btn-sm" onclick="planoRemoverLinha(\'' + pfx + '\',' + i + ')" style="background:var(--bg3)" title="Remover">×</button>' +
      '</div>';
    }).join('') +
    '<button class="btn-sm" onclick="planoAdicionarLinha(\'' + pfx + '\')" style="background:var(--bg3);justify-self:start">+ Adicionar parcela</button></div>';
  }
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + entradaVenc +
    '<div style="font-size:10px;color:var(--text3);align-self:end;padding-bottom:6px">Restante vence 7 dias antes do evento.</div></div>';
}

function planoLerCfg(pfx) {
  var v = function(s) { var el = document.getElementById(pfx + '-plano-' + s); return el ? el.value.trim() : ''; };
  var tipo = v('tipo') || '20_80';
  var cfg = { tipo: tipo, entradaVenc: v('evenc') || _planoHoje() };
  if (tipo === 'parcelado') {
    cfg.entradaModo = v('emodo') || '%';
    cfg.entrada = v('entrada') ? _planoNum(v('entrada')) : 0;
    cfg.qtd = parseInt(v('qtd'), 10) || 0;
    cfg.dia = parseInt(v('dia'), 10) || 0;
    cfg.primeiroMes = v('mes');
  }
  if (tipo === 'personalizado') {
    cfg.linhas = ((_planoCtx[pfx] || {}).linhas || []).map(function(l) {
      return { descricao: l.descricao || '', valor: _planoNum(l.valor), vencimento: l.vencimento || '' };
    });
  }
  return cfg;
}

function planoMudouTipo(pfx) {
  var cfg = planoLerCfg(pfx);
  var el = document.getElementById(pfx + '-plano-campos');
  if (el) el.innerHTML = _planoCamposHTML(pfx, cfg);
  planoPreview(pfx);
}
function planoAdicionarLinha(pfx) {
  _planoCtx[pfx].linhas.push({ descricao: '', valor: '', vencimento: '' });
  planoMudouTipo(pfx);
}
function planoRemoverLinha(pfx, i) {
  _planoCtx[pfx].linhas.splice(i, 1);
  if (!_planoCtx[pfx].linhas.length) _planoCtx[pfx].linhas.push({ descricao: '', valor: '', vencimento: '' });
  planoMudouTipo(pfx);
}

// Resultado do plano com o valor atual (para gravar ou mostrar).
function planoResultado(pfx) {
  var ctx = _planoCtx[pfx] || {};
  var valor = typeof ctx.valor === 'function' ? ctx.valor() : 0;
  var cfg = planoLerCfg(pfx);
  if (cfg.tipo === 'parcelado' && !cfg.qtd) return { cfg: cfg, parcelas: [], erro: 'Informe a quantidade de parcelas.', valor: valor };
  var r = planoGerar(valor, cfg, ctx.dataEvento);
  r.cfg = cfg; r.valor = valor;
  return r;
}

function planoPreview(pfx) {
  var el = document.getElementById(pfx + '-plano-preview');
  if (!el) return;
  var r = planoResultado(pfx);
  if (!(r.valor > 0)) { el.innerHTML = '<div style="font-size:11px;color:var(--text3)">Defina o valor para ver as parcelas.</div>'; return; }
  el.innerHTML = (r.parcelas.length
    ? '<table style="width:100%;border-collapse:collapse;font-size:12px">' + r.parcelas.map(function(p) {
        return '<tr style="border-top:1px solid var(--border)"><td style="padding:4px 6px;color:var(--text)">' + _planoEsc(p.descricao) + '</td>' +
          '<td style="padding:4px 6px;color:var(--text3)">' + (p.vencimento ? fd(p.vencimento) : 'sem vencimento') + '</td>' +
          '<td style="padding:4px 6px;text-align:right;font-family:var(--mono);color:var(--text)">' + fR(p.valor) + '</td></tr>';
      }).join('') + '</table>'
    : '') +
    (r.erro ? '<div style="font-size:11px;color:var(--red);margin-top:4px">' + _planoEsc(r.erro) + '</div>'
      : '<div style="font-size:11px;color:var(--text3);margin-top:4px">' + r.parcelas.length + ' parcela(s) · total ' + fR(r.valor) + '</div>');
  if (typeof (_planoCtx[pfx] || {}).onChange === 'function') _planoCtx[pfx].onChange(r);
}

// ─── BOTÃO "PLANO" EM CONTRATO QUE JÁ EXISTE ────────────────────────────────

function _planoValorContrato(c) {
  return parseFloat(String(c.opcao || '0').replace(/[^\d,]/g, '').replace(',', '.')) || Number(c.valorNum) || 0;
}

// Parcelas do contrato no Contas a Receber (sem o fechamento).
function _planoParcelasDoContrato(c) {
  var norm = function(s) { return String(s || '').toLowerCase().trim(); };
  return (D.financeiro || []).filter(function(f) {
    if (f.isFechamento) return false;
    if (f.contratoId) return f.contratoId === c.id;
    return norm(f.contrato || f.evento) === norm(c.nomeEvento || c.nome) && (f.data || '') === (c.data || '');
  }).sort(function(a, b) { return (a.vencimento || '9999').localeCompare(b.vencimento || '9999'); });
}

function _planoModalEl() {
  var el = document.getElementById('mplano');
  if (el) return el;
  el = document.createElement('div');
  el.className = 'modal-overlay';
  el.id = 'mplano';
  el.innerHTML = '<div class="modal" style="max-width:600px;width:95%">' +
    '<div class="modal-head"><span class="modal-title">Plano de pagamento</span>' +
    '<button class="modal-close" onclick="closeM(\'mplano\')">×</button></div>' +
    '<div id="mplano-corpo" style="padding:14px 18px;max-height:80vh;overflow:auto"></div></div>';
  document.body.appendChild(el);
  return el;
}

var _planoContratoId = null;

function planoAbrir(contratoId) {
  var c = (D.contratos || []).find(function(x) { return x.id === contratoId; });
  if (!c) return;
  var parcelas = _planoParcelasDoContrato(c);
  var bloqueio = parcelas.find(function(f) { return f.aprovacaoPendente; }) ? 'Tem pagamento aguardando aprovação do administrador neste contrato — resolva antes de mudar o plano.'
    : parcelas.find(function(f) { return f.status !== 'pago' && (Number(f.recebidoParcial) || (f.extratoParciais || []).length); }) ? 'Tem PIX parcial ligado a uma parcela pendente (Conciliação Bancária) — desfaça o vínculo antes de mudar o plano.'
    : parcelas.find(function(f) { return f.excedente && f.excedente.status === 'pendente'; }) ? 'Tem pagamento a mais aguardando decisão (abater ou manter como receita) — decida antes de mudar o plano.'
    : '';
  var pagas = parcelas.filter(function(f) { return f.status === 'pago'; });
  var valorContrato = _planoValorContrato(c);
  var jaPago = _planoR2(pagas.reduce(function(s, f) { return s + (typeof _finValorNoContrato === 'function' ? _finValorNoContrato(f) : (Number(f.valorNum) || 0)); }, 0));
  var aRefazer = _planoR2(valorContrato - jaPago);
  _planoContratoId = contratoId;
  _planoModalEl();
  var cfgAtual = (c.planoPagamento && c.planoPagamento.cfg) || null;
  var corpo = document.getElementById('mplano-corpo');
  corpo.innerHTML =
    '<div style="font-size:13px;font-weight:600;color:var(--text)">' + _planoEsc(c.nome || '') + ' <span style="font-weight:400;color:var(--text3);font-size:11px">evento ' + fd(c.data) + '</span></div>' +
    '<div style="font-size:12px;color:var(--text2);margin:4px 0 10px">Valor do contrato: <b style="font-family:var(--mono)">' + fR(valorContrato) + '</b> · plano atual: ' + _planoEsc(planoRotulo(c, parcelas.length)) + '</div>' +
    '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Parcelas lançadas</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px">' + (parcelas.length ? parcelas.map(function(f) {
      return '<tr style="border-top:1px solid var(--border)"><td style="padding:4px 6px">' + _planoEsc(f.descricao || '') + '</td>' +
        '<td style="padding:4px 6px;color:var(--text3)">' + (f.status === 'pago' ? 'paga ' + fd(f.dataPagamento) : 'pendente' + (f.vencimento ? ' · vence ' + fd(f.vencimento) : '')) + '</td>' +
        '<td style="padding:4px 6px;text-align:right;font-family:var(--mono);color:' + (f.status === 'pago' ? 'var(--green)' : 'var(--text)') + '">' + fR(f.valorNum) + '</td></tr>';
    }).join('') : '<tr><td style="padding:4px 6px;color:var(--text3)">Nenhuma parcela lançada.</td></tr>') + '</table>' +
    (bloqueio ? '<div style="font-size:12px;color:var(--amber);background:var(--bg3);border-radius:var(--radius);padding:8px 10px">' + bloqueio + '</div>'
    : !(aRefazer > 0.01) ? '<div style="font-size:12px;color:var(--text3)">As parcelas pagas já cobrem o valor do contrato — não há saldo para redistribuir.</div>'
    : '<div style="font-size:12px;color:var(--text2);margin-bottom:8px">' + (pagas.length ? 'Já pago: ' + fR(jaPago) + '. O novo plano divide o que falta: <b>' + fR(aRefazer) + '</b> (as parcelas pagas não mudam).' : 'O plano divide o valor do contrato: <b>' + fR(aRefazer) + '</b>.') + '</div>' +
      planoFormHTML('mplano', cfgAtual && (!pagas.length || !/^\d/.test(cfgAtual.tipo)) ? cfgAtual : (pagas.length ? { tipo: 'parcelado', entradaModo: 'R$', entrada: 0 } : null), {
        valor: function() { return aRefazer; }, dataEvento: c.data, soParcelado: pagas.length > 0,
      }) +
      '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">' +
        '<button class="btn" onclick="closeM(\'mplano\')" style="background:var(--bg3)">Cancelar</button>' +
        '<button class="btn" onclick="planoSalvarContrato()" style="background:var(--blue);color:#fff">Salvar plano</button>' +
      '</div>');
  if (!bloqueio && aRefazer > 0.01) planoPreview('mplano');
  openM('mplano');
}

function planoSalvarContrato() {
  var c = (D.contratos || []).find(function(x) { return x.id === _planoContratoId; });
  if (!c) return;
  var r = planoResultado('mplano');
  if (r.erro) { alert2(r.erro, 'error'); return; }
  var parcelas = _planoParcelasDoContrato(c);
  var pendentes = parcelas.filter(function(f) { return f.status !== 'pago'; });
  var pagas = parcelas.filter(function(f) { return f.status === 'pago'; });
  if (!confirm('Trocar as ' + pendentes.length + ' parcela(s) pendente(s) deste contrato por ' + r.parcelas.length + ' parcela(s) do novo plano (total ' + fR(r.valor) + ')?\n\n' + planoTextoParcelas(r.parcelas) + (pagas.length ? '\n\nAs ' + pagas.length + ' parcela(s) já paga(s) continuam como estão.' : ''))) return;
  var base = pendentes[0] || pagas[0] || {};
  var idsPendentes = {};
  pendentes.forEach(function(f) { idsPendentes[f.id] = true; });
  D.financeiro = (D.financeiro || []).filter(function(f) { return !idsPendentes[f.id]; });
  var inicio = pagas.length;
  r.parcelas.forEach(function(p, i) {
    D.financeiro.push({
      id: _gerarId('FIN'),
      contratoId: c.id, contrato: c.nome || base.contrato || '', evento: c.nomeEvento || c.nome || base.evento || '',
      data: c.data || base.data || '', tipo: c.tipo || base.tipo || '', convidados: c.convidados || base.convidados || '',
      descricao: p.descricao, valor: 'R$ ' + _planoFmtBR(p.valor), valorNum: p.valor,
      vencimento: p.vencimento || '', status: 'pendente', ordemParcela: inicio + i + 1,
    });
  });
  var usuario = typeof _orcUsuarioAtual === 'function' ? _orcUsuarioAtual() : ((typeof perfilAtual !== 'undefined' && perfilAtual) || '');
  c.planoPagamento = {
    tipo: r.cfg.tipo, cfg: r.cfg,
    parcelas: pagas.map(function(f) { return { descricao: f.descricao || '', valor: Number(f.valorNum) || 0, vencimento: f.vencimento || f.dataPagamento || '', paga: true }; }).concat(r.parcelas),
    atualizadoEm: new Date().toISOString(), atualizadoPor: usuario,
  };
  sv('financeiro'); sv('contratos');
  closeM('mplano');
  alert2('Plano de pagamento salvo — ' + r.parcelas.length + ' parcela(s) no Contas a Receber.');
  if (typeof _finRefresh === 'function' && document.getElementById('page-financeiro') && document.getElementById('page-financeiro').classList.contains('active')) _finRefresh();
  if (typeof rContratos === 'function') rContratos();
}
