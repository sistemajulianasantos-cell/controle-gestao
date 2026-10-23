// ─── DEGUSTAÇÃO (pedido dela 10-23) ─────────────────────────────────────────
// Acompanha as degustações e mede se elas ajudam a fechar contrato.
// Só dá pra agendar para um orçamento que já tem cálculo (valor > 0).
//
// D.degustacoes = [{ id, orcamentoId, data, hora, local, pessoas, custo,
//   responsavel, observacao, status, resultado, valorFechadoFora, criadoEm,
//   criadoPor }]
//   status:    'agendada' | 'realizada' | 'nao_compareceu' | 'cancelada'
//   resultado: '' (aguardando) | 'perdido' | 'fechou_fora' — vale quando o
//              orçamento não tem contrato no sistema; com contrato (Gerar
//              contrato no orçamento) é "fechou" automático.

var DEG_STATUS = {
  agendada:       { label: 'Agendada',        cor: 'var(--blue)' },
  realizada:      { label: 'Realizada',       cor: 'var(--green)' },
  nao_compareceu: { label: 'Não compareceu',  cor: 'var(--amber)' },
  cancelada:      { label: 'Cancelada',       cor: 'var(--text3)' },
};

var _degFiltroAno = String(new Date().getFullYear());
var _degFiltroMes = '';
var _degFiltroStatus = '';
var _degEditId = null;      // degustação sendo editada (null = nova)
var _degOrcSel = null;      // orçamento escolhido no agendamento

function _degEsc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function _degLista() { return D.degustacoes || (D.degustacoes = []); }
function _degOrc(id) { return (D.orcamentos || []).find(function(o) { return o.id === id; }) || null; }
function _degResumo(orc) { return (orc && typeof _orcCalcResumo === 'function') ? (_orcCalcResumo(orc) || {}) : {}; }
function _degTemCalculo(orc) { var r = _degResumo(orc); return (r.valorTotal || 0) > 0 || (r.valorTotalEssencial || 0) > 0; }

// Contrato do orçamento (gerado pelo botão do orçamento).
function _degContrato(orc) {
  if (!orc) return null;
  var lista = D.contratos || [];
  return lista.find(function(c) { return orc.contratoId && c.id === orc.contratoId; }) ||
    lista.find(function(c) { return c.orcamentoId === orc.id; }) || null;
}

// 'fechou' | 'perdido' | 'aguardando' | '' (não realizada)
function _degResultado(d) {
  if (d.status !== 'realizada') return '';
  if (_degContrato(_degOrc(d.orcamentoId)) || d.resultado === 'fechou_fora') return 'fechou';
  if (d.resultado === 'perdido') return 'perdido';
  return 'aguardando';
}

function _degValorFechado(d) {
  var c = _degContrato(_degOrc(d.orcamentoId));
  if (c) return Number(c.valorNum) || 0;
  return d.resultado === 'fechou_fora' ? (Number(d.valorFechadoFora) || 0) : 0;
}

function _degNoPeriodo(data) {
  if (!data) return !_degFiltroAno && !_degFiltroMes;
  if (_degFiltroAno && data.slice(0, 4) !== _degFiltroAno) return false;
  if (_degFiltroMes && data.slice(5, 7) !== _degFiltroMes) return false;
  return true;
}

function _degCriadoOrc(o) {
  return (o.criadoEm || (/^ORC(\d{13})/.test(o.id || '') ? new Date(Number(o.id.slice(3, 16))).toISOString() : '')).slice(0, 10);
}

// ─── INDICADORES ─────────────────────────────────────────────────────────────

function _degIndicadores() {
  var degs = _degLista().filter(function(d) { return _degNoPeriodo(d.data); });
  var realizadas = degs.filter(function(d) { return d.status === 'realizada'; });
  var fechou = realizadas.filter(function(d) { return _degResultado(d) === 'fechou'; });
  var perdido = realizadas.filter(function(d) { return _degResultado(d) === 'perdido'; });
  var aguardando = realizadas.filter(function(d) { return _degResultado(d) === 'aguardando'; });
  var custo = degs.reduce(function(s, d) { return s + (Number(d.custo) || 0); }, 0);
  var valorFechado = fechou.reduce(function(s, d) { return s + _degValorFechado(d); }, 0);

  // Dias da degustação até o contrato (só contrato gerado no sistema).
  var dias = fechou.map(function(d) {
    var c = _degContrato(_degOrc(d.orcamentoId));
    if (!c || !c.criadoEm || !d.data) return null;
    return Math.max(0, Math.round((new Date(c.criadoEm) - new Date(d.data + 'T12:00:00')) / 86400000));
  }).filter(function(n) { return n != null; });

  // Comparação: orçamentos com cálculo criados no período que NÃO tiveram
  // degustação realizada.
  var comDeg = {};
  _degLista().forEach(function(d) { if (d.status === 'realizada') comDeg[d.orcamentoId] = true; });
  var semDeg = (D.orcamentos || []).filter(function(o) { return !comDeg[o.id] && _degTemCalculo(o) && _degNoPeriodo(_degCriadoOrc(o)); });
  var semDegFechou = semDeg.filter(function(o) { return !!_degContrato(o); });

  var decididas = fechou.length + perdido.length;
  return {
    degs: degs, total: degs.length,
    agendadas: degs.filter(function(d) { return d.status === 'agendada'; }).length,
    realizadas: realizadas.length,
    faltas: degs.filter(function(d) { return d.status === 'nao_compareceu' || d.status === 'cancelada'; }).length,
    fechou: fechou.length, perdido: perdido.length, aguardando: aguardando.length,
    // Taxa sobre as realizadas (aguardando conta como "ainda não fechou").
    taxa: realizadas.length ? fechou.length / realizadas.length : null,
    taxaDecididas: decididas ? fechou.length / decididas : null,
    semDeg: semDeg.length, semDegFechou: semDegFechou.length,
    taxaSem: semDeg.length ? semDegFechou.length / semDeg.length : null,
    custo: custo, valorFechado: valorFechado,
    custoPorFechamento: fechou.length ? custo / fechou.length : null,
    retorno: custo ? valorFechado / custo : null,
    diasMedio: dias.length ? Math.round(dias.reduce(function(a, b) { return a + b; }, 0) / dias.length) : null,
  };
}

function _degPct(v) { return v == null ? '—' : (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'; }

function _degCard(rotulo, valor, sub, cor) {
  return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px">' +
    '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">' + rotulo + '</div>' +
    '<div style="font-family:var(--mono);font-size:20px;font-weight:600;color:' + (cor || 'var(--text)') + ';margin-top:4px">' + valor + '</div>' +
    (sub ? '<div style="font-size:11px;color:var(--text3);margin-top:2px">' + sub + '</div>' : '') +
  '</div>';
}

// Frase de leitura rápida: está valendo a pena?
function _degVeredito(k) {
  if (k.realizadas < 5) return 'Ainda são poucas degustações realizadas no período (' + k.realizadas + ') para concluir — a comparação fica confiável a partir de umas 5 a 10.';
  if (k.taxa == null || k.taxaSem == null) return '';
  var dif = (k.taxa - k.taxaSem) * 100;
  var txt = dif > 0
    ? 'Com degustação vocês fecham ' + _degPct(k.taxa) + ' contra ' + _degPct(k.taxaSem) + ' sem degustação — ' + dif.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' pontos a mais.'
    : 'Com degustação a taxa de fechamento (' + _degPct(k.taxa) + ') não está acima da dos orçamentos sem degustação (' + _degPct(k.taxaSem) + ').';
  if (k.retorno != null) txt += ' Cada R$ 1,00 gasto em degustação trouxe ' + fR(k.retorno) + ' em contratos.';
  if (k.aguardando) txt += ' ' + k.aguardando + ' ainda aguardando resposta do cliente.';
  return txt;
}

// ─── TELA ────────────────────────────────────────────────────────────────────

function rDegustacao() {
  var el = document.getElementById('degustacao-content');
  if (!el) return;
  var k = _degIndicadores();
  var anos = {};
  anos[String(new Date().getFullYear())] = true;
  _degLista().forEach(function(d) { if (d.data) anos[d.data.slice(0, 4)] = true; });
  var MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  var sel = 'font-size:12px;padding:5px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)';

  var lista = k.degs.filter(function(d) { return !_degFiltroStatus || d.status === _degFiltroStatus || _degResultado(d) === _degFiltroStatus; })
    .sort(function(a, b) { return ((b.data || '') + (b.hora || '')).localeCompare((a.data || '') + (a.hora || '')); });

  el.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
      '<span style="font-size:16px;font-weight:600;color:var(--text)">Degustações</span>' +
      '<select onchange="_degFiltroAno=this.value;rDegustacao()" style="' + sel + ';margin-left:12px">' +
        '<option value="">Todos os anos</option>' +
        Object.keys(anos).sort().reverse().map(function(a) { return '<option value="' + a + '"' + (a === _degFiltroAno ? ' selected' : '') + '>' + a + '</option>'; }).join('') +
      '</select>' +
      '<select onchange="_degFiltroMes=this.value;rDegustacao()" style="' + sel + '">' +
        '<option value="">Todos os meses</option>' +
        MESES.map(function(m, i) { var v = String(i + 1).padStart(2, '0'); return '<option value="' + v + '"' + (v === _degFiltroMes ? ' selected' : '') + '>' + m + '</option>'; }).join('') +
      '</select>' +
      '<button class="btn btn-primary btn-sm" onclick="degAbrirForm()" style="margin-left:auto">+ Agendar degustação</button>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-bottom:10px">' +
      _degCard('Taxa de fechamento', _degPct(k.taxa), k.fechou + ' de ' + k.realizadas + ' realizadas fecharam', 'var(--green)') +
      _degCard('Sem degustação', _degPct(k.taxaSem), k.semDegFechou + ' de ' + k.semDeg + ' orçamentos fecharam') +
      _degCard('Realizadas', String(k.realizadas), k.agendadas + ' agendada(s) · ' + k.faltas + ' falta(s)/cancelada(s)') +
      _degCard('Aguardando resposta', String(k.aguardando), k.perdido + ' não fecharam', 'var(--amber)') +
      _degCard('Valor fechado', k.valorFechado ? fR(k.valorFechado) : '—', 'contratos vindos de degustação', 'var(--green)') +
      _degCard('Custo das degustações', k.custo ? fR(k.custo) : '—', k.custoPorFechamento != null ? fR(k.custoPorFechamento) + ' por contrato fechado' : '') +
      _degCard('Retorno', k.retorno != null ? fR(k.retorno) : '—', 'em contrato para cada R$ 1,00 gasto') +
      _degCard('Tempo até fechar', k.diasMedio != null ? k.diasMedio + ' dias' : '—', 'média da degustação ao contrato') +
    '</div>' +
    (_degVeredito(k) ? '<div style="background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:10px 14px;font-size:12px;color:var(--text2);margin-bottom:16px">' + _degVeredito(k) + '</div>' : '') +

    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' +
      [['', 'Todas'], ['agendada', 'Agendadas'], ['realizada', 'Realizadas'], ['aguardando', 'Aguardando resposta'], ['fechou', 'Fecharam'], ['perdido', 'Não fecharam'], ['nao_compareceu', 'Não compareceu'], ['cancelada', 'Canceladas']].map(function(f) {
        return '<button class="sort-btn' + (_degFiltroStatus === f[0] ? ' active' : '') + '" onclick="_degFiltroStatus=\'' + f[0] + '\';rDegustacao()">' + f[1] + '</button>';
      }).join('') +
    '</div>' +

    (lista.length ? '<div style="display:grid;gap:8px">' + lista.map(_degLinhaHTML).join('') + '</div>'
      : '<div style="text-align:center;padding:40px 20px;color:var(--text3);font-size:13px">Nenhuma degustação ' + (k.total ? 'com esse filtro' : 'no período') + '. Use "+ Agendar degustação".</div>');
}

function _degLinhaHTML(d) {
  var orc = _degOrc(d.orcamentoId);
  var r = _degResumo(orc);
  var st = DEG_STATUS[d.status] || DEG_STATUS.agendada;
  var res = _degResultado(d);
  var contrato = _degContrato(orc);
  var sel = 'font-size:11px;padding:3px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px';
  var resultadoHTML = '';
  if (d.status === 'realizada') {
    if (contrato) {
      resultadoHTML = '<span style="font-size:11px;color:var(--green);font-weight:600">Fechou · ' + fR(contrato.valorNum) + (contrato.pacote ? ' (' + (contrato.pacote === 'completo' ? 'Completo' : 'Essencial') + ')' : '') + '</span>';
    } else {
      resultadoHTML = '<select onchange="degSetResultado(\'' + d.id + '\',this.value)" style="' + sel + ';color:' + (res === 'perdido' ? 'var(--red)' : res === 'fechou' ? 'var(--green)' : 'var(--amber)') + '">' +
        '<option value=""' + (!d.resultado ? ' selected' : '') + '>Aguardando resposta</option>' +
        '<option value="perdido"' + (d.resultado === 'perdido' ? ' selected' : '') + '>Não fechou</option>' +
        '<option value="fechou_fora"' + (d.resultado === 'fechou_fora' ? ' selected' : '') + '>Fechou (contrato fora do sistema)</option>' +
      '</select>' +
      (d.resultado === 'fechou_fora' ? '<div style="font-size:10px;color:var(--text3);margin-top:2px">' + (d.valorFechadoFora ? fR(d.valorFechadoFora) : 'informe o valor em Editar') + '</div>' : '');
    }
  }
  return '<div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid ' + st.cor + ';border-radius:var(--radius);padding:12px 16px;display:flex;gap:16px;align-items:center;flex-wrap:wrap">' +
    '<div style="min-width:110px">' +
      '<div style="font-family:var(--mono);font-size:13px;color:var(--text);font-weight:600">' + fd(d.data) + '</div>' +
      '<div style="font-size:11px;color:var(--text3)">' + (d.hora || '') + (d.local ? ' · ' + _degEsc(d.local) : '') + '</div>' +
    '</div>' +
    '<div style="flex:1;min-width:180px">' +
      '<div style="font-weight:600;color:var(--text);font-size:13px">' +
        (orc && orc.numeroProposta ? '<span style="font-family:var(--mono);font-size:11px;color:var(--text3);font-weight:400;margin-right:6px">' + _degEsc(orc.numeroProposta) + '</span>' : '') +
        _degEsc(orc ? (orc.nomeCliente || 'Sem nome') : 'Orçamento não encontrado') + '</div>' +
      '<div style="font-size:11px;color:var(--text3)">' + (orc ? 'Evento ' + fd(orc.dataEvento) + (orc.convidados ? ' · ' + orc.convidados + ' conv.' : '') : '') +
        (d.pessoas ? ' · ' + d.pessoas + ' pessoa(s) na degustação' : '') + (d.responsavel ? ' · ' + _degEsc(d.responsavel) : '') + '</div>' +
      (d.observacao ? '<div style="font-size:11px;color:var(--text2);margin-top:2px">' + _degEsc(d.observacao) + '</div>' : '') +
    '</div>' +
    '<div style="text-align:right;font-size:11px;color:var(--text3);min-width:130px">' +
      '<div>Essencial <span style="font-family:var(--mono);color:var(--blue)">' + fR(r.valorTotalEssencial) + '</span></div>' +
      '<div>Completo <span style="font-family:var(--mono);color:var(--green)">' + fR(r.valorTotal) + '</span></div>' +
      (Number(d.custo) ? '<div>Custo <span style="font-family:var(--mono)">' + fR(d.custo) + '</span></div>' : '') +
    '</div>' +
    '<div style="display:flex;flex-direction:column;gap:4px;min-width:170px">' +
      '<select onchange="degSetStatus(\'' + d.id + '\',this.value)" style="' + sel + ';color:' + st.cor + ';font-weight:600">' +
        Object.keys(DEG_STATUS).map(function(s) { return '<option value="' + s + '"' + (s === d.status ? ' selected' : '') + '>' + DEG_STATUS[s].label + '</option>'; }).join('') +
      '</select>' +
      resultadoHTML +
    '</div>' +
    '<div style="display:flex;gap:6px">' +
      (orc ? '<button class="btn-sm" onclick="degAbrirOrcamento(\'' + orc.id + '\')" style="background:var(--bg3)">Orçamento</button>' : '') +
      '<button class="btn-sm" onclick="degAbrirForm(\'' + d.id + '\')" style="background:var(--bg3)">Editar</button>' +
    '</div>' +
  '</div>';
}

function degAbrirOrcamento(orcId) {
  go('orcamento');
  if (typeof abrirOrcDetalhe === 'function') abrirOrcDetalhe(orcId);
}

function degSetStatus(id, status) {
  var d = _degLista().find(function(x) { return x.id === id; });
  if (!d || !DEG_STATUS[status]) return;
  d.status = status;
  if (status !== 'realizada') d.resultado = '';
  sv('degustacoes');
  rDegustacao();
}

function degSetResultado(id, resultado) {
  var d = _degLista().find(function(x) { return x.id === id; });
  if (!d) return;
  d.resultado = resultado;
  if (resultado === 'fechou_fora' && !d.valorFechadoFora) {
    var orc = _degOrc(d.orcamentoId);
    var r = _degResumo(orc);
    var txt = prompt('Valor fechado (R$) — o contrato foi feito fora do sistema:', r.valorTotal ? String(r.valorTotal.toFixed(2)).replace('.', ',') : '');
    if (txt != null && txt.trim()) d.valorFechadoFora = parseValorBR(txt);
  }
  sv('degustacoes');
  rDegustacao();
}

// ─── AGENDAR / EDITAR ────────────────────────────────────────────────────────

function _degModalEl() {
  var el = document.getElementById('mdegustacao');
  if (el) return el;
  el = document.createElement('div');
  el.className = 'modal-overlay';
  el.id = 'mdegustacao';
  el.innerHTML = '<div class="modal" style="max-width:560px;width:95%">' +
    '<div class="modal-head"><span class="modal-title" id="mdeg-titulo">Agendar degustação</span>' +
    '<button class="modal-close" onclick="closeM(\'mdegustacao\')">×</button></div>' +
    '<div id="mdeg-corpo" style="padding:14px 18px"></div></div>';
  document.body.appendChild(el);
  return el;
}

function degAbrirForm(id) {
  var d = id ? _degLista().find(function(x) { return x.id === id; }) : null;
  _degEditId = d ? d.id : null;
  _degOrcSel = d ? d.orcamentoId : null;
  _degModalEl();
  document.getElementById('mdeg-titulo').textContent = d ? 'Editar degustação' : 'Agendar degustação';
  var v = function(c, padrao) { return _degEsc(d && d[c] != null ? d[c] : (padrao || '')); };
  document.getElementById('mdeg-corpo').innerHTML =
    '<label class="lbl">Orçamento (só os que já têm cálculo) *</label>' +
    '<div id="mdeg-orc-sel" style="margin-bottom:6px"></div>' +
    '<input id="mdeg-busca" class="inp" type="text" placeholder="Buscar por nº da proposta, cliente ou data" oninput="_degRenderBusca()" style="width:100%;box-sizing:border-box">' +
    '<div id="mdeg-resultados" style="max-height:220px;overflow:auto;margin-top:4px"></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">' +
      '<div><label class="lbl">Data *</label><input id="mdeg-data" class="inp" type="date" value="' + v('data') + '" style="width:100%;box-sizing:border-box"></div>' +
      '<div><label class="lbl">Horário</label><input id="mdeg-hora" class="inp" type="time" value="' + v('hora') + '" style="width:100%;box-sizing:border-box"></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Local</label><input id="mdeg-local" class="inp" type="text" value="' + v('local') + '" placeholder="Onde vai ser a degustação" style="width:100%;box-sizing:border-box"></div>' +
      '<div><label class="lbl">Nº de pessoas</label><input id="mdeg-pessoas" class="inp" type="number" min="0" value="' + v('pessoas') + '" style="width:100%;box-sizing:border-box"></div>' +
      '<div><label class="lbl">Custo da degustação (R$)</label><input id="mdeg-custo" class="inp" type="text" inputmode="decimal" value="' + (d && d.custo ? fmtValorBR(d.custo) : '') + '" placeholder="insumos, equipe, transporte" style="width:100%;box-sizing:border-box"></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Responsável</label><input id="mdeg-resp" class="inp" type="text" value="' + v('responsavel', d ? '' : (typeof _orcUsuarioAtual === 'function' ? _orcUsuarioAtual() : '')) + '" style="width:100%;box-sizing:border-box"></div>' +
      (d && d.resultado === 'fechou_fora' ? '<div style="grid-column:1/-1"><label class="lbl">Valor fechado (contrato fora do sistema)</label><input id="mdeg-valorfora" class="inp" type="text" inputmode="decimal" value="' + (d.valorFechadoFora ? fmtValorBR(d.valorFechadoFora) : '') + '" style="width:100%;box-sizing:border-box"></div>' : '') +
      '<div style="grid-column:1/-1"><label class="lbl">Observação</label><textarea id="mdeg-obs" class="inp" rows="2" style="width:100%;box-sizing:border-box;resize:vertical">' + v('observacao') + '</textarea></div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:14px">' +
      (d ? '<button class="btn" onclick="degExcluir(\'' + d.id + '\')" style="background:var(--bg3);color:var(--red)">Excluir</button>' : '') +
      '<button class="btn" onclick="closeM(\'mdegustacao\')" style="background:var(--bg3);margin-left:auto">Cancelar</button>' +
      '<button class="btn" onclick="degSalvar()" style="background:var(--blue);color:#fff">' + (d ? 'Salvar' : 'Agendar') + '</button>' +
    '</div>';
  _degRenderSelecionado();
  _degRenderBusca();
  openM('mdegustacao');
}

function _degRotuloOrc(o) {
  return [o.numeroProposta, o.nomeCliente || 'Sem nome', o.dataEvento ? fd(o.dataEvento) : '', o.convidados ? o.convidados + ' conv.' : ''].filter(Boolean).join(' · ');
}

function _degRenderSelecionado() {
  var el = document.getElementById('mdeg-orc-sel');
  if (!el) return;
  var o = _degOrc(_degOrcSel);
  el.innerHTML = o
    ? '<div style="background:var(--bg3);border:1px solid var(--green);border-radius:var(--radius);padding:8px 12px;font-size:12px;color:var(--text)">' + _degEsc(_degRotuloOrc(o)) + '</div>'
    : '<div style="font-size:11px;color:var(--text3)">Nenhum orçamento escolhido.</div>';
}

function _degRenderBusca() {
  var el = document.getElementById('mdeg-resultados');
  if (!el) return;
  var norm = function(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var termo = norm((document.getElementById('mdeg-busca') || {}).value || '').trim();
  if (!termo) { el.innerHTML = ''; return; }
  var palavras = termo.split(/\s+/);
  var achados = (D.orcamentos || []).filter(function(o) {
    var txt = norm([o.numeroProposta, o.nomeCliente, fd(o.dataEvento), o.dataEvento].join(' '));
    return palavras.every(function(p) { return txt.indexOf(p) !== -1; });
  }).slice(0, 15);
  if (!achados.length) { el.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:6px 2px">Nenhum orçamento encontrado.</div>'; return; }
  el.innerHTML = achados.map(function(o) {
    var ok = _degTemCalculo(o);
    var jaTem = _degLista().some(function(d) { return d.orcamentoId === o.id && d.id !== _degEditId && d.status !== 'cancelada'; });
    return '<div ' + (ok ? 'onclick="_degEscolherOrc(\'' + o.id + '\')" ' : '') + 'style="padding:7px 10px;border-bottom:1px solid var(--border);font-size:12px;cursor:' + (ok ? 'pointer' : 'not-allowed') + ';color:' + (ok ? 'var(--text)' : 'var(--text3)') + '"' +
      (ok ? ' onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'\'"' : '') + '>' +
      _degEsc(_degRotuloOrc(o)) +
      (!ok ? ' <span style="font-size:10px">— sem cálculo, não pode agendar</span>' : '') +
      (ok && jaTem ? ' <span style="font-size:10px;color:var(--amber)">— já tem degustação</span>' : '') +
    '</div>';
  }).join('');
}

function _degEscolherOrc(id) {
  _degOrcSel = id;
  var b = document.getElementById('mdeg-busca');
  if (b) b.value = '';
  _degRenderSelecionado();
  _degRenderBusca();
}

function degSalvar() {
  var val = function(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var orc = _degOrc(_degOrcSel);
  if (!orc) { alert2('Escolha o orçamento.', 'error'); return; }
  if (!_degTemCalculo(orc)) { alert2('Esse orçamento ainda não tem cálculo — só dá pra agendar degustação de orçamento calculado.', 'error'); return; }
  var data = val('mdeg-data');
  if (!data) { alert2('Informe a data da degustação.', 'error'); return; }
  var outra = _degLista().find(function(d) { return d.orcamentoId === orc.id && d.id !== _degEditId && d.status !== 'cancelada'; });
  if (outra && !confirm('Este orçamento já tem uma degustação em ' + fd(outra.data) + '. Agendar outra mesmo assim?')) return;

  var campos = {
    orcamentoId: orc.id, data: data, hora: val('mdeg-hora'), local: val('mdeg-local'),
    pessoas: parseInt(val('mdeg-pessoas'), 10) || 0,
    custo: val('mdeg-custo') ? parseValorBR(val('mdeg-custo')) : 0,
    responsavel: val('mdeg-resp'), observacao: val('mdeg-obs'),
  };
  if (document.getElementById('mdeg-valorfora')) campos.valorFechadoFora = val('mdeg-valorfora') ? parseValorBR(val('mdeg-valorfora')) : 0;

  if (_degEditId) {
    var d = _degLista().find(function(x) { return x.id === _degEditId; });
    if (d) Object.assign(d, campos);
  } else {
    _degLista().push(Object.assign({
      id: _gerarId('DEG'), status: 'agendada', resultado: '',
      criadoEm: new Date().toISOString(),
      criadoPor: typeof _orcUsuarioAtual === 'function' ? _orcUsuarioAtual() : '',
    }, campos));
  }
  sv('degustacoes');
  closeM('mdegustacao');
  alert2(_degEditId ? 'Degustação atualizada.' : 'Degustação agendada!');
  rDegustacao();
}

function degExcluir(id) {
  if (!confirm('Excluir esta degustação? Ela sai dos indicadores.')) return;
  D.degustacoes = _degLista().filter(function(d) { return d.id !== id; });
  sv('degustacoes');
  closeM('mdegustacao');
  rDegustacao();
}
