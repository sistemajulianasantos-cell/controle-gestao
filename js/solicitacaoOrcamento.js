// ─── SOLICITAÇÃO DE ORÇAMENTO ────────────────────────────────────────────────
// Funil de entrada comercial: todo pedido de orçamento que chega (WhatsApp,
// indicação, site etc.) é cadastrado aqui antes de virar um Orçamento formal
// (D.orcamentos). Cada solicitação pode gerar/linkar um Orçamento — o vínculo
// fica guardado em `orcamentoId`, nunca duplicado.

var _solView = 'lista';
var _solEditId = null;
// true quando o formulário foi aberto pelo "+ Novo orçamento" (tela de
// Orçamentos): salvar registra a solicitação E já cria o orçamento ligado.
var _solCriarOrc = false;
// Id do orçamento sendo clonado (botão Clonar) — salvar cria a cópia dele em
// vez de um orçamento do zero.
var _solClonarDeId = null;
var _solSelecionados = {}; // id -> true, seleção múltipla na lista (só na view atual)
// Filtros da lista — guardados aqui (e não lidos do DOM) porque a lista é
// redesenhada inteira a cada mudança, o que zerava busca/select antes.
var _solFiltro = { busca: '', status: '', tipo: '', solPor: '', mes: '' };

var SOL_STATUS_PADRAO = ['PENDENTE', 'ENVIADO', 'APROVADO', 'RECUSADO'];

function initSolicitacaoOrcamento() {
  if (!D.solicitacoesOrcamento) D.solicitacoesOrcamento = [];
  _solView = 'lista';
  _solEditId = null;
  _solCriarOrc = false;
  _solClonarDeId = null;
  _solSelecionados = {};
  rSolicitacao();
}

function _solSetView(v) {
  _solView = v;
  if (v === 'lista') _solEditId = null;
  rSolicitacao();
}

function rSolicitacao() {
  var el = document.getElementById('solicitacao-content');
  if (!el) return;
  if (_solView === 'form') el.innerHTML = _solBuildForm(_solEditId);
  else if (_solView === 'importar') el.innerHTML = _solBuildImportar();
  else el.innerHTML = _solBuildLista();
}

// ── Helpers de dados ─────────────────────────────────────────────────────────

function getSolicitacoesOrcamento() {
  return D.solicitacoesOrcamento || [];
}

function _solBuscar(id) {
  return (D.solicitacoesOrcamento || []).find(function(s) { return s.id === id; }) || null;
}

// Nº segue o padrão real usado por ela: MMAA-XXX, sequencial dentro do mês
// em que a solicitação/orçamento foi CADASTRADO (não o mês do evento).
// Olha Solicitações E Orçamentos, pra um orçamento lançado direto (sem
// solicitação) nunca repetir o número de uma solicitação e vice-versa.
function _solProximoNumero() {
  var hoje = new Date();
  var mes = hoje.getMonth() + 1, ano = hoje.getFullYear() % 100;
  var prefixo = String(mes).padStart(2, '0') + String(ano).padStart(2, '0');
  var max = 0;
  function considera(n) {
    var p = _solParseNumero(n);
    if (p && p.mes === mes && p.ano === ano) max = Math.max(max, p.seq);
  }
  (D.solicitacoesOrcamento || []).forEach(function(s) { considera(s.numero); });
  (D.orcamentos || []).forEach(function(o) { considera(o.numeroProposta); });
  return prefixo + '-' + String(max + 1).padStart(3, '0');
}

// Registros importados antes da correção guardaram a hora como texto de Date
// ("Sat Dec 30 1899 06:00:00 GMT-0300 ...") ou no formato da planilha
// ("6:00:00 AM") — exibe só o HH:MM.
function _solHoraTexto(h) {
  var t = String(h || '');
  var m = /\b\d{4}\b.*?(\d{2}):(\d{2}):\d{2}\s*GMT/.exec(t);
  if (m) return m[1] + ':' + m[2];
  var a = /^\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)\s*$/i.exec(t);
  if (a) {
    var hh = parseInt(a[1], 10);
    if (/pm/i.test(a[3]) && hh < 12) hh += 12;
    if (/am/i.test(a[3]) && hh === 12) hh = 0;
    return String(hh).padStart(2, '0') + ':' + a[2];
  }
  return t;
}

// Tipo de Evento vem do Cadastro de Tipos de Evento (js/tiposEvento.js). A
// solicitação guarda o NOME (texto, igual vem da planilha); a comparação
// ignora maiúscula/acento/espaço ("FESTA DE FAMÍLIA" = "Festa de Familia").
function _solNormTxt(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function _solTiposCadastro() {
  return typeof getTiposEvento === 'function' ? getTiposEvento() : [];
}

function _solTipoDoCadastro(txt) {
  var n = _solNormTxt(txt);
  if (!n) return null;
  return _solTiposCadastro().find(function(t) { return _solNormTxt(t.nome) === n; }) || null;
}

// <option>s agrupados como no cadastro; valor = nome do tipo. Se o valor
// atual (ex.: importado da planilha) não existir no cadastro, aparece como
// opção extra marcada "(não cadastrado)" pra não perder o dado ao salvar.
function _solTipoOptionsHtml(valorAtual) {
  var esc = function(x) { return String(x).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var atual = _solTipoDoCadastro(valorAtual);
  var porGrupo = {}, ordemGrupos = [];
  _solTiposCadastro().forEach(function(t) {
    var g = t.grupo || t.nome;
    if (!porGrupo[g]) { porGrupo[g] = []; ordemGrupos.push(g); }
    porGrupo[g].push(t);
  });
  var html = '<option value="">— Selecione —</option>';
  if (valorAtual && !atual) html += '<option value="' + esc(valorAtual) + '" selected>' + esc(valorAtual) + ' (não cadastrado)</option>';
  html += ordemGrupos.map(function(g) {
    var itens = porGrupo[g];
    var opts = itens.map(function(t) {
      return '<option value="' + esc(t.nome) + '"' + (atual && atual.id === t.id ? ' selected' : '') + '>' + esc(t.nome) + '</option>';
    }).join('');
    return itens.length > 1 ? '<optgroup label="' + esc(g) + '">' + opts + '</optgroup>' : opts;
  }).join('');
  return html;
}

function _solMapTipoEvento(t) {
  var doCadastro = _solTipoDoCadastro(t);
  if (doCadastro) return doCadastro.id;
  var n = (t || '').toLowerCase();
  if (n.includes('casamento')) return 'casamento';
  if (n.includes('15 anos') || n.includes('15anos')) return '15anos';
  if (n.includes('formatura')) return 'formatura';
  return 'outros';
}

function _solCorStatus(status) {
  var s = (status || '').toUpperCase();
  if (s === 'PENDENTE') return { bg: '#B4530933', cor: '#B45309' };
  if (s === 'ENVIADO') return { bg: '#C4622D33', cor: '#C4622D' };
  if (s === 'APROVADO') return { bg: '#15803D33', cor: '#15803D' };
  if (s === 'RECUSADO') return { bg: '#B91C1C33', cor: '#B91C1C' };
  return { bg: 'var(--bg3)', cor: 'var(--text3)' };
}

// ── VIEW: LISTA ───────────────────────────────────────────────────────────────

// Ordem = pelo Nº (MMAA-XXX): ano, depois mês, depois a sequência — lido como
// número, não como texto (senão "0127" ficaria antes de "0926" e "2" depois
// de "10"). Nº fora do padrão vai pro fim, na ordem de cadastro/importação.
// Aceita "0926-001", "0926 - 1", travessão (–/—) no lugar do hífen e também
// o Nº sem hífen ("0926001"/"926001") — que é como chega quando a célula do
// Excel é um número formatado pra parecer 0926-001.
function _solParseNumero(n) {
  var t = String(n == null ? '' : n).replace(/[ \s]+/g, ' ').trim();
  var m = t.match(/^(\d{3,4})\s*[-‐-―\/.]\s*(\d+)$/) || t.match(/^(\d{3,4})(\d{3})$/);
  if (!m) return null;
  var mmaa = parseInt(m[1], 10);
  return { mes: Math.floor(mmaa / 100), ano: mmaa % 100, seq: parseInt(m[2], 10) };
}

// Nº no formato padrão "MMAA-XXX" quando reconhecido; senão o texto original.
function _solNumeroTexto(n) {
  var p = _solParseNumero(n);
  if (!p) return String(n == null ? '' : n).trim();
  return String(p.mes).padStart(2, '0') + String(p.ano).padStart(2, '0') + '-' + String(p.seq).padStart(3, '0');
}

function _solChaveNumero(n) {
  var p = _solParseNumero(n);
  return p ? p.ano * 100000000 + p.mes * 1000000 + p.seq : null;
}

function _solListaFiltrada() {
  var lista = getSolicitacoesOrcamento().slice().sort(function(a, b) {
    var ka = _solChaveNumero(a.numero), kb = _solChaveNumero(b.numero);
    if (ka !== null && kb !== null && ka !== kb) return ka - kb;
    if (ka !== null && kb === null) return -1;
    if (ka === null && kb !== null) return 1;
    return (a.criadoEm || '').localeCompare(b.criadoEm || '');
  });

  var f = _solFiltro;
  var busca = _solNormTxt(f.busca);
  if (busca) lista = lista.filter(function(s) {
    return _solNormTxt([_solNumeroTexto(s.numero), s.cliente, s.homenageados, s.contatoCliente, s.solicitadoPor, s.localEvento, s.telefoneFixo, s.celular].join(' ')).includes(busca);
  });
  if (f.status) lista = lista.filter(function(s) { return _solStatusDe(s) === f.status; });
  if (f.tipo)   lista = lista.filter(function(s) { return _solNormTxt(s.tipoEvento) === f.tipo; });
  if (f.solPor) lista = lista.filter(function(s) { return _solNormTxt(s.solicitadoPor) === f.solPor; });
  if (f.mes)    lista = lista.filter(function(s) { return (s.dataEvento || '').slice(0, 7) === f.mes; });
  return lista;
}

function _solStatusDe(s) { return String(s.status || 'PENDENTE').trim().toUpperCase(); }

function _solFiltroAtivo() {
  return !!(_solFiltro.busca || _solFiltro.status || _solFiltro.tipo || _solFiltro.solPor || _solFiltro.mes);
}

function _solSetFiltro(campo, valor) {
  _solFiltro[campo] = valor;
  _solSelecionados = {};
  rSolicitacao();
  // Busca: a lista foi redesenhada — devolve o foco/cursor pro campo pra
  // continuar digitando sem clicar de novo.
  if (campo === 'busca') {
    var el = document.getElementById('sol-busca');
    if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
  }
}

function _solLimparFiltros() {
  _solFiltro = { busca: '', status: '', tipo: '', solPor: '', mes: '' };
  _solSelecionados = {};
  rSolicitacao();
}

// Barra de filtros: opções montadas a partir dos dados cadastrados, com a
// contagem de cada uma (ex.: "PENDENTE (40)").
function _solBuildFiltros(totalFiltrado) {
  var todas = getSolicitacoesOrcamento();
  var esc = function(x) { return String(x).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  function contagem(chaveFn, rotuloFn) {
    var mapa = {}, ordem = [];
    todas.forEach(function(s) {
      var k = chaveFn(s);
      if (!k) return;
      if (!mapa[k]) { mapa[k] = { rotulo: rotuloFn(s), n: 0 }; ordem.push(k); }
      mapa[k].n++;
    });
    return { mapa: mapa, ordem: ordem };
  }
  function opcoes(c, atual, vazio) {
    return '<option value="">' + vazio + '</option>' + c.ordem.map(function(k) {
      return '<option value="' + esc(k) + '"' + (atual === k ? ' selected' : '') + '>' + esc(c.mapa[k].rotulo) + ' (' + c.mapa[k].n + ')</option>';
    }).join('');
  }

  var st = contagem(_solStatusDe, _solStatusDe);
  // Status padrão primeiro (mesmo sem nenhuma solicitação), depois os que vieram da planilha
  var ordemSt = SOL_STATUS_PADRAO.slice();
  st.ordem.forEach(function(k) { if (ordemSt.indexOf(k) === -1) ordemSt.push(k); });
  SOL_STATUS_PADRAO.forEach(function(k) { if (!st.mapa[k]) st.mapa[k] = { rotulo: k, n: 0 }; });
  st.ordem = ordemSt;

  var tp = contagem(function(s) { return _solNormTxt(s.tipoEvento); }, function(s) { return (_solTipoDoCadastro(s.tipoEvento) || {}).nome || s.tipoEvento; });
  tp.ordem.sort(function(a, b) { return tp.mapa[a].rotulo.localeCompare(tp.mapa[b].rotulo, 'pt-BR'); });

  var sp = contagem(function(s) { return _solNormTxt(s.solicitadoPor); }, function(s) { return String(s.solicitadoPor).trim(); });
  sp.ordem.sort(function(a, b) { return sp.mapa[a].rotulo.localeCompare(sp.mapa[b].rotulo, 'pt-BR'); });

  var MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  var ms = contagem(function(s) { return /^\d{4}-\d{2}/.test(s.dataEvento || '') ? s.dataEvento.slice(0, 7) : ''; },
    function(s) { return MESES[parseInt(s.dataEvento.slice(5, 7), 10) - 1] + '/' + s.dataEvento.slice(0, 4); });
  ms.ordem.sort();

  var sel = 'class="inp" style="width:auto;min-width:150px;max-width:220px"';
  return '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">' +
      '<input class="inp" id="sol-busca" type="text" placeholder="Buscar por cliente, Nº, local, contato..." style="flex:1;min-width:200px" value="' + esc(_solFiltro.busca) + '" oninput="_solSetFiltro(\'busca\',this.value)">' +
      '<select ' + sel + ' onchange="_solSetFiltro(\'status\',this.value)">' + opcoes(st, _solFiltro.status, 'Todos os status') + '</select>' +
      '<select ' + sel + ' onchange="_solSetFiltro(\'tipo\',this.value)">' + opcoes(tp, _solFiltro.tipo, 'Todos os tipos') + '</select>' +
      '<select ' + sel + ' onchange="_solSetFiltro(\'solPor\',this.value)">' + opcoes(sp, _solFiltro.solPor, 'Solicitado por: todos') + '</select>' +
      '<select ' + sel + ' onchange="_solSetFiltro(\'mes\',this.value)">' + opcoes(ms, _solFiltro.mes, 'Mês do evento: todos') + '</select>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:12px;color:var(--text3)">' +
      (_solFiltroAtivo()
        ? 'Mostrando ' + totalFiltrado + ' de ' + todas.length + ' <button class="btn-sm" style="background:var(--bg3);color:var(--text)" onclick="_solLimparFiltros()">Limpar filtros</button>'
        : 'Mostrando todas (' + todas.length + ')') +
    '</div>';
}

function _solBuildLista() {
  var lista = _solListaFiltrada();
  var qtdSel = Object.keys(_solSelecionados).length;
  var todosSelecionados = lista.length > 0 && lista.every(function(s) { return _solSelecionados[s.id]; });

  var linhas = !lista.length
    ? '<tr><td colspan="16" style="text-align:center;color:var(--text3);padding:24px">Nenhuma solicitação encontrada</td></tr>'
    : lista.map(function(s) {
        var cor = _solCorStatus(s.status);
        var contato = [s.telefoneFixo, s.celular, s.contatoCliente ? 'Cliente: ' + s.contatoCliente : ''].filter(Boolean).join(' · ') || '—';
        return '<tr style="border-bottom:1px solid var(--border)">' +
          '<td style="padding:8px 12px;text-align:center">' +
            '<input type="checkbox" ' + (_solSelecionados[s.id] ? 'checked' : '') + ' onchange="_solToggleSelecao(\'' + s.id + '\',this.checked)"></td>' +
          '<td style="padding:8px 12px;font-family:var(--mono);font-size:11px;white-space:nowrap">' + (_solNumeroTexto(s.numero) || '—') + '</td>' +
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3)">' + (s.solicitadoPor || '—') + '</td>' +
          '<td style="padding:8px 12px"><strong>' + (s.cliente || '—') + '</strong>' + (s.homenageados ? '<br><span style="font-size:11px;color:var(--text2)">' + s.homenageados + '</span>' : '') + '</td>' +
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3)">' + contato + '</td>' +
          '<td style="padding:8px 12px">' + (s.tipoEvento || '—') + '</td>' +
          '<td style="padding:8px 12px">' + fd(s.dataEvento) + '</td>' +
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3)">' + (s.localEvento || '—') +
            (s.centroCusto ? '<br>' + _solLabelRegiao(s.centroCusto) : '') + '</td>' +
          '<td style="padding:8px 12px;text-align:center">' + (s.pax || '—') + '</td>' +
          '<td style="padding:8px 12px;font-size:11px;max-width:160px" title="' + (s.servicosOrcados || '') + '">' + (s.servicosOrcados || '—') + '</td>' +
          '<td style="padding:8px 12px">' +
            '<span style="background:' + cor.bg + ';color:' + cor.cor + ';font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;white-space:nowrap">' + (s.status || 'PENDENTE') + '</span>' +
          '</td>' +
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3);white-space:nowrap">' + (_solHoraTexto(s.hora) || '—') + '</td>' +
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3);max-width:180px" title="' + (s.observacao ? 'Obs.: ' + s.observacao : '') + '">' + (s.bebidas || '—') + '</td>' +
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3)">' + (s.modeloUtilizado || '—') + '</td>' +
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3)">' + (s.bonificacaoCerimonial || '—') + '</td>' +
          '<td style="padding:8px 12px;white-space:nowrap">' +
            '<button class="btn-sm" style="background:var(--blue)" onclick="_solEditar(\'' + s.id + '\')" title="Editar">✏️</button> ' +
            (_orcSolTemOrc(s)
              ? '<button class="btn-sm" style="background:var(--green)" onclick="_solAbrirOrcamento(\'' + s.id + '\')" title="Abrir orçamento gerado">📋 Orçamento</button> '
              : '<button class="btn-sm" style="background:var(--green)" onclick="_solGerarOrcamento(\'' + s.id + '\')" title="Gerar orçamento a partir desta solicitação">📋 Gerar Orçamento</button> ') +
            '<button class="btn-sm btn-red" onclick="_solExcluir(\'' + s.id + '\')" title="Excluir">✕</button>' +
          '</td>' +
        '</tr>';
      }).join('');

  var semPedido = _solOrcamentosSemPedido();
  return '<div style="padding:20px 24px">' +
    (semPedido.length
      ? '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--amber-bg);border:1px solid var(--amber-dim);border-radius:var(--radius);padding:10px 14px;margin-bottom:14px;font-size:12px;color:var(--text2)">' +
          '<span><strong>' + semPedido.length + ' orçamento(s)</strong> foram criados sem pedido registrado aqui (' +
            semPedido.slice(0, 5).map(function(o) { return (o.numeroProposta || '') + ' ' + (o.nomeCliente || 'Sem nome'); }).join(', ').replace(/</g, '&lt;') +
            (semPedido.length > 5 ? '…' : '') + ').</span>' +
          '<button class="btn btn-sm" style="margin-left:auto" onclick="solRegistrarOrcamentosSemPedido()">Registrar todos aqui</button>' +
        '</div>'
      : '') +
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;gap:12px;flex-wrap:wrap">' +
      '<div>' +
        '<div style="font-size:18px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:.5px">Solicitação de Orçamento</div>' +
        '<div style="font-size:12px;color:var(--text3);margin-top:2px">' + getSolicitacoesOrcamento().length + ' solicitação(ões) cadastrada(s)</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn" style="background:var(--green)" onclick="_solEditar(null)">+ Nova Solicitação</button>' +
        '<button class="btn" onclick="_solSetView(\'importar\')">📥 Importar</button>' +
      '</div>' +
    '</div>' +

    (qtdSel > 0 ?
      '<div style="display:flex;align-items:center;gap:10px;background:#B91C1C1A;border:1px solid var(--red);border-radius:8px;padding:8px 14px;margin-bottom:12px;flex-wrap:wrap">' +
        '<span style="font-size:12px;color:var(--text)">' + qtdSel + ' selecionada(s)</span>' +
        '<button class="btn-sm btn-red" onclick="_solExcluirSelecionados()">🗑️ Excluir selecionadas</button>' +
        '<button class="btn-sm" style="background:var(--bg3)" onclick="_solLimparSelecao()">Cancelar seleção</button>' +
      '</div>' : '') +

    _solBuildFiltros(lista.length) +

    // Tabela rola dentro da própria caixa (altura da tela) — assim título,
    // botões e busca ficam sempre visíveis, e o cabeçalho das colunas fica fixo.
    '<div style="overflow:auto;max-height:calc(100vh - 285px);border:1px solid var(--border);border-radius:8px">' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="border-bottom:2px solid var(--border2);color:var(--text3);text-transform:uppercase;font-size:10px">' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:center"><input type="checkbox" ' + (todosSelecionados ? 'checked' : '') + ' onchange="_solToggleSelecaoTodos(this.checked)" title="Selecionar todos"></th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Nº</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Solicitado por</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Cliente</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Contato</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Tipo de Evento</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Data</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Local</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:center">PAX</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Serviços Orçados</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Status</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Hora</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Bebidas</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Modelo Utilizado</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Bonificação (bv)</th>' +
        '<th style="position:sticky;top:0;z-index:1;background:var(--bg4);padding:8px 12px;text-align:left">Ações</th>' +
      '</tr></thead>' +
      '<tbody>' + linhas + '</tbody>' +
    '</table>' +
    '</div>' +
  '</div>';
}

function _solLabelRegiao(key) {
  var r = (typeof REGIOES_LOCAL !== 'undefined' ? REGIOES_LOCAL : []).find(function(x) { return x.key === key; });
  return r ? r.label : key;
}

// ── VIEW: FORM (novo / editar) ────────────────────────────────────────────────

function _solBuildForm(id) {
  _solEditId = id || null;
  var s = id ? _solBuscar(id) : null;
  // Clonando: tipo, PAX e centro de custo já vêm do orçamento original.
  var p = s || _solPrefillClone();
  // Clonando: cabeçalho (cliente, contato, data, local, hora…) já vem do
  // pedido do orçamento original — clone costuma ser pro mesmo cliente
  // (10-19). Nº é novo; dá pra mudar qualquer campo antes de salvar.
  var f = s || _solCloneFonte();
  var regioes = (typeof REGIOES_LOCAL !== 'undefined' ? REGIOES_LOCAL : []);

  return '<div style="padding:20px 24px;max-width:900px">' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">' +
      '<button class="btn" onclick="_solVoltarDoForm()">← Voltar</button>' +
      '<div style="font-size:18px;font-weight:600;color:var(--text)">' + (s ? '✏️ Editar Solicitação' : (_solClonarDeId ? 'Clonar orçamento' : _solCriarOrc ? '+ Novo Orçamento' : '+ Nova Solicitação de Orçamento')) + '</div>' +
    '</div>' +
    (_solCriarOrc ? '<div style="font-size:12px;color:var(--text3);margin:-10px 0 16px">O pedido fica registrado em Solicitação de Orçamento e o orçamento já é criado ligado a ele.</div>' : '') +
    _solCloneVincularHtml() +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">' +
      '<div><label class="lbl">Nº</label><input class="inp" id="sol-numero" type="text" value="' + (s ? s.numero : _solProximoNumero()) + '"></div>' +
      '<div><label class="lbl">Solicitado por</label><input class="inp" id="sol-solicitado-por" type="text" placeholder="Quem atendeu/recebeu o pedido" value="' + (f ? f.solicitadoPor || '' : '') + '"></div>' +
      '<div style="grid-column:span 2"><label class="lbl">Cliente (noivos / aniversariante) *</label><input class="inp" id="sol-cliente" type="text" placeholder="Ex: Ana e Pedro / 15 anos da Maria" value="' + (f ? _solEscAttr(f.cliente) : '') + '"></div>' +
      '<div><label class="lbl">Contato</label><input class="inp" id="sol-contato" type="text" placeholder="(31) 9 9999-9999" value="' + (f ? _solEscAttr(f.celular || f.telefoneFixo || f.contatoCliente) : '') + '"></div>' +
      '<div><label class="lbl">Tipo de Evento</label><select class="inp" id="sol-tipo">' + _solTipoOptionsHtml(p ? p.tipoEvento || '' : '') + '</select></div>' +
      '<div><label class="lbl">Data do Evento</label><input class="inp" id="sol-data" type="date" value="' + (f ? f.dataEvento || '' : '') + '"></div>' +
      '<div><label class="lbl">PAX</label><input class="inp" id="sol-pax" type="number" min="0" placeholder="Nº de convidados" value="' + (p ? p.pax || '' : '') + '"></div>' +
      '<div style="grid-column:span 2"><label class="lbl">Local do Evento</label><input class="inp" id="sol-local" type="text" placeholder="Nome do espaço / endereço" value="' + (f ? f.localEvento || '' : '') + '"></div>' +
      '<div><label class="lbl">Centro de Custo do Local</label><select class="inp" id="sol-centro-custo">' +
        '<option value="">— Selecione —</option>' +
        regioes.map(function(r) { return '<option value="' + r.key + '"' + (p && p.centroCusto === r.key ? ' selected' : '') + '>' + r.label + '</option>'; }).join('') +
      '</select></div>' +
      '<div><label class="lbl">Status</label><select class="inp" id="sol-status">' +
        SOL_STATUS_PADRAO.map(function(st) { return '<option value="' + st + '"' + (s && (s.status || 'PENDENTE') === st ? ' selected' : '') + '>' + st + '</option>'; }).join('') +
      '</select></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Serviços Orçados</label><input class="inp" id="sol-servicos" type="text" placeholder="Ex: Whiskeria opcional" value="' + (f ? f.servicosOrcados || '' : '') + '"></div>' +
      '<div><label class="lbl">Hora</label><input class="inp" id="sol-hora" type="text" placeholder="Ex: 06:00 07:00 (tempo de festa)" value="' + (f ? _solHoraTexto(f.hora) : '') + '"></div>' +
      '<div style="grid-column:span 2"><label class="lbl">Bebidas</label><input class="inp" id="sol-bebidas" type="text" placeholder="Ex: Vinho e Whisky" value="' + (f ? f.bebidas || '' : '') + '"></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Observação</label><textarea class="inp" id="sol-obs" rows="2" style="resize:vertical">' + (f ? f.observacao || '' : '') + '</textarea></div>' +
      '<div><label class="lbl">Modelo Utilizado</label><input class="inp" id="sol-modelo" type="text" placeholder="Modelo de proposta" value="' + (f ? f.modeloUtilizado || '' : '') + '"></div>' +
      '<div><label class="lbl">Bonificação Cerimonial (bv)</label><input class="inp" id="sol-bv" type="text" placeholder="Ex: nome / % / valor" value="' + (f ? f.bonificacaoCerimonial || '' : '') + '"></div>' +
    '</div>' +
    '<div style="margin-top:16px;display:flex;gap:8px">' +
      '<button class="btn" style="background:var(--green);color:#fff" onclick="_solSalvar()">' + (_solClonarDeId ? 'Clonar orçamento' : _solCriarOrc ? 'Criar orçamento' : '💾 Salvar') + '</button>' +
      '<button class="btn" style="background:var(--bg3);color:var(--text)" onclick="_solVoltarDoForm()">Cancelar</button>' +
    '</div>' +
  '</div>';
}

// ── Orçamentos criados sem pedido (antes de 10-15 o "+ Novo orçamento" e o
// Clonar não registravam Solicitação) ─────────────────────────────────────────
function _solOrcamentosSemPedido() {
  if (typeof _orcSolVinculada !== 'function') return [];
  return (D.orcamentos || []).filter(function(o) { return !_orcSolVinculada(o); });
}

// Cria a Solicitação a partir dos dados do orçamento (mesmo Nº) e liga os dois.
function _solRegistrarDeOrcamento(o) {
  if (!o || (typeof _orcSolVinculada === 'function' && _orcSolVinculada(o))) return null;
  var p = o.calcParams || {};
  var t = (typeof buscarTipoEventoPorId === 'function') ? buscarTipoEventoPorId(p.tipoEvento) : null;
  var s = {
    id: _gerarId('SOL'),
    numero: o.numeroProposta || _solProximoNumero(),
    solicitadoPor: o.solicitadoPor || '',
    cliente: o.nomeCliente || '',
    telefoneFixo: '',
    celular: o.telefone || '',
    tipoEvento: t ? t.nome : '',
    dataEvento: o.dataEvento || '',
    localEvento: o.localEvento || '',
    centroCusto: p.local || '',
    pax: parseInt(o.convidados) || 0,
    servicosOrcados: o.servicosOrcados || '',
    status: 'PENDENTE',
    hora: o.hora || '',
    bebidas: o.bebidas || '',
    observacao: o.observacao || '',
    modeloUtilizado: '',
    bonificacaoCerimonial: '',
    orcamentoId: o.id,
    criadoEm: o.criadoEm || new Date().toISOString(),
  };
  if (!D.solicitacoesOrcamento) D.solicitacoesOrcamento = [];
  D.solicitacoesOrcamento.push(s);
  return s;
}

function solRegistrarOrcamentosSemPedido() {
  var lista = _solOrcamentosSemPedido();
  if (!lista.length) return;
  if (!confirm('Registrar ' + lista.length + ' orçamento(s) como Solicitação de Orçamento (com o mesmo Nº e os dados do orçamento)?')) return;
  lista.forEach(_solRegistrarDeOrcamento);
  sv('solicitacoesOrcamento');
  alert2(lista.length + ' pedido(s) registrado(s).');
  rSolicitacao();
}

function solRegistrarOrcamentoId(orcId) {
  var o = (D.orcamentos || []).find(function(x) { return x.id === orcId; });
  if (!_solRegistrarDeOrcamento(o)) return;
  sv('solicitacoesOrcamento');
  alert2('Pedido registrado em Solicitação de Orçamento.');
  if (typeof rOrcDetalhe === 'function') rOrcDetalhe();
}

// Valor pra dentro de value="..." (nome com aspas não quebra o campo).
function _solEscAttr(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// "+ Novo orçamento" (tela de Orçamentos) abre este mesmo formulário — pedido
// dela 10-15: as duas telas iguais e todo orçamento novo registrado também
// como Solicitação.
function solAbrirFormNovoOrcamento() {
  go('solicitacao');
  _solCriarOrc = true;
  _solEditId = null;
  _solView = 'form';
  rSolicitacao();
}

function solAbrirFormClonar(orcId) {
  go('solicitacao');
  _solCriarOrc = true;
  _solClonarDeId = orcId;
  _solEditId = null;
  _solView = 'form';
  rSolicitacao();
}

function _solOrcClonado() {
  return _solClonarDeId ? (D.orcamentos || []).find(function(o) { return o.id === _solClonarDeId; }) || null : null;
}

function _solPrefillClone() {
  var o = _solOrcClonado();
  if (!o) return null;
  var p = o.calcParams || {};
  var t = (typeof buscarTipoEventoPorId === 'function') ? buscarTipoEventoPorId(p.tipoEvento) : null;
  return { pax: o.convidados || '', tipoEvento: t ? t.nome : '', centroCusto: p.local || '' };
}

function _solCloneFonte() {
  var o = _solOrcClonado();
  if (!o) return null;
  var sol = (typeof _orcSolVinculada === 'function') ? _orcSolVinculada(o) : null;
  if (sol) return sol;
  var info = function(campo) { return (typeof _orcInfo === 'function') ? _orcInfo(o, campo) : (o[campo] || ''); };
  return { cliente: o.nomeCliente || '', celular: o.telefone || '', dataEvento: o.dataEvento || '', localEvento: o.local || '', hora: o.hora || '', servicosOrcados: info('servicosOrcados'), observacao: info('observacao') };
}

// No modo Clonar: aviso + atalho pra usar uma Solicitação já cadastrada (sem
// orçamento) em vez de preencher o formulário.
function _solCloneVincularHtml() {
  var o = _solOrcClonado();
  if (!o) return '';
  var esc = function(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  // Todas as solicitações (10-19 — antes só as sem orçamento, e ela não achava
  // a do cliente). Sem orçamento: o clone fica ligado a ela. Já com orçamento:
  // só copia os dados dela pro formulário (vira um pedido novo, mesmo cliente).
  // 10-19: campo de busca (nº da proposta, cliente, data) no lugar do select.
  var temSol = (D.solicitacoesOrcamento || []).length > 0;
  return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px;font-size:12px;color:var(--text2)">' +
    'Copiando cardápio, insumos, serviços e Calculadora de <strong>' + esc((o.numeroProposta ? o.numeroProposta + ' ' : '') + (o.nomeCliente || 'Sem nome')) + '</strong>. Preencha o pedido abaixo' +
    (temSol
      ? ' ou puxe os dados de uma solicitação já cadastrada:' +
        '<div style="position:relative;margin-top:8px;max-width:520px">' +
          '<input class="inp" id="sol-clone-busca" type="text" autocomplete="off" placeholder="Digite o nº da proposta, cliente ou data (ex: 0926-097)" ' +
            'oninput="_solCloneBuscar(this.value)" onfocus="_solCloneBuscar(this.value)" onblur="setTimeout(function(){var d=document.getElementById(\'sol-clone-res\');if(d)d.style.display=\'none\';},200)">' +
          '<div id="sol-clone-res" style="display:none;position:absolute;left:0;right:0;top:100%;z-index:40;max-height:320px;overflow:auto;background:var(--bg2);border:1px solid var(--border2);border-radius:6px;box-shadow:0 8px 20px rgba(0,0,0,.35)"></div>' +
        '</div>'
      : '.') +
  '</div>';
}

function _solCloneBuscar(termo) {
  var box = document.getElementById('sol-clone-res');
  if (!box) return;
  var esc = function(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  var norm = function(x) { return String(x == null ? '' : x).normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase(); };
  var temOrc = function(s) { return typeof _orcSolTemOrc === 'function' ? _orcSolTemOrc(s) : !!s.orcamentoId; };
  var t = norm(termo).trim();
  var lista = (D.solicitacoesOrcamento || []).slice()
    .sort(function(a, b) { return (_solChaveNumero(b.numero) || 0) - (_solChaveNumero(a.numero) || 0); })
    .filter(function(s) {
      if (!t) return true;
      var alvo = norm([_solNumeroTexto(s.numero), s.cliente, s.dataEvento ? fd(s.dataEvento) : '', s.localEvento, s.tipoEvento].join(' '));
      return t.split(/\s+/).every(function(p) { return alvo.indexOf(p) !== -1; });
    })
    .slice(0, 50);
  box.innerHTML = lista.length ? lista.map(function(s) {
    var ja = temOrc(s);
    return '<div onmousedown="_solCloneEscolher(\'' + s.id + '\')" style="padding:7px 12px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;gap:8px;align-items:center" ' +
      'onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'\'">' +
      '<span style="font-family:var(--mono);font-weight:700;color:var(--text)">' + esc(_solNumeroTexto(s.numero)) + '</span>' +
      '<span style="flex:1;color:var(--text)">' + esc([s.cliente, s.dataEvento ? fd(s.dataEvento) : '', s.pax ? s.pax + ' pax' : ''].filter(Boolean).join(' · ')) + '</span>' +
      '<span style="font-size:10px;white-space:nowrap;color:' + (ja ? 'var(--text3)' : 'var(--green)') + '">' + (ja ? 'copia os dados' : 'sem orçamento · liga o clone') + '</span>' +
    '</div>';
  }).join('') : '<div style="padding:10px 12px;color:var(--text3)">Nenhuma solicitação encontrada.</div>';
  box.style.display = '';
}

function _solCloneEscolher(solId) {
  var s = _solBuscar(solId);
  if (!s) return;
  var temOrc = typeof _orcSolTemOrc === 'function' ? _orcSolTemOrc(s) : !!s.orcamentoId;
  if (!temOrc) { _solClonarParaExistente(solId); return; }
  // Já tem orçamento: copia o cabeçalho dela pro formulário (Nº continua novo)
  var set = function(id, v) { var el = document.getElementById(id); if (el) el.value = v == null ? '' : v; };
  set('sol-solicitado-por', s.solicitadoPor);
  set('sol-cliente', s.cliente);
  set('sol-contato', s.celular || s.telefoneFixo || s.contatoCliente);
  set('sol-tipo', s.tipoEvento);
  set('sol-data', s.dataEvento);
  set('sol-pax', s.pax || '');
  set('sol-local', s.localEvento);
  set('sol-centro-custo', s.centroCusto);
  set('sol-servicos', s.servicosOrcados);
  set('sol-hora', _solHoraTexto(s.hora));
  set('sol-bebidas', s.bebidas);
  set('sol-obs', s.observacao);
  set('sol-modelo', s.modeloUtilizado);
  set('sol-bv', s.bonificacaoCerimonial);
  alert2('Dados de "' + (s.cliente || _solNumeroTexto(s.numero)) + '" copiados — confira e clique em Clonar orçamento.');
}

function _solClonarParaExistente(solId) {
  var s = _solBuscar(solId);
  var origId = _solClonarDeId;
  if (!s || !origId) return;
  _solCriarOrc = false;
  _solClonarDeId = null;
  _solView = 'lista';
  if (typeof _orcClonarParaSolicitacao === 'function') _orcClonarParaSolicitacao(origId, s);
}

function _solVoltarDoForm() {
  if (_solCriarOrc) { _solCriarOrc = false; _solClonarDeId = null; _solView = 'lista'; go('orcamento'); return; }
  _solSetView('lista');
}

function _solSalvar() {
  var cliente = (document.getElementById('sol-cliente')?.value || '').trim();
  if (!cliente) { alert('Informe o nome do cliente.'); return; }
  var pax = parseInt(document.getElementById('sol-pax')?.value) || 0;
  if (_solCriarOrc && !pax) { alert('Informe o PAX (nº de convidados) para criar o orçamento.'); return; }

  if (!D.solicitacoesOrcamento) D.solicitacoesOrcamento = [];
  var existente = _solEditId ? _solBuscar(_solEditId) : null;
  // Um campo só de contato (10-15). Antes eram Telefone fixo + Celular +
  // Contato do cliente: o Contato grava em `celular` (o que o resto do
  // sistema lê); fixo antigo continua guardado quando já havia celular.
  var contato = (document.getElementById('sol-contato')?.value || '').trim();
  var fixoAntigo = existente && existente.celular ? (existente.telefoneFixo || '') : '';

  var registro = {
    id: existente ? existente.id : _gerarId('SOL'),
    numero: (document.getElementById('sol-numero')?.value || '').trim() || _solProximoNumero(),
    solicitadoPor: (document.getElementById('sol-solicitado-por')?.value || '').trim(),
    cliente: cliente,
    telefoneFixo: contato ? fixoAntigo : '',
    celular: contato,
    tipoEvento: (document.getElementById('sol-tipo')?.value || '').trim(),
    dataEvento: document.getElementById('sol-data')?.value || '',
    localEvento: (document.getElementById('sol-local')?.value || '').trim(),
    centroCusto: document.getElementById('sol-centro-custo')?.value || '',
    pax: parseInt(document.getElementById('sol-pax')?.value) || 0,
    servicosOrcados: (document.getElementById('sol-servicos')?.value || '').trim(),
    status: document.getElementById('sol-status')?.value || 'PENDENTE',
    hora: document.getElementById('sol-hora')?.value || '',
    bebidas: (document.getElementById('sol-bebidas')?.value || '').trim(),
    observacao: (document.getElementById('sol-obs')?.value || '').trim(),
    modeloUtilizado: (document.getElementById('sol-modelo')?.value || '').trim(),
    bonificacaoCerimonial: (document.getElementById('sol-bv')?.value || '').trim(),
    orcamentoId: existente ? existente.orcamentoId || '' : '',
    criadoEm: existente ? existente.criadoEm : new Date().toISOString(),
  };

  if (existente) {
    var idx = D.solicitacoesOrcamento.findIndex(function(x) { return x.id === existente.id; });
    if (idx >= 0) D.solicitacoesOrcamento[idx] = registro; else D.solicitacoesOrcamento.push(registro);
  } else {
    D.solicitacoesOrcamento.push(registro);
  }

  sv('solicitacoesOrcamento');
  if (_solCriarOrc) {
    var origId = _solClonarDeId;
    _solCriarOrc = false;
    _solClonarDeId = null;
    _solView = 'lista';
    if (origId && typeof _orcClonarParaSolicitacao === 'function') _orcClonarParaSolicitacao(origId, registro);
    else _solCriarOrcamentoDe(registro);
    return;
  }
  alert2('Solicitação salva!');
  _solSetView('lista');
}

function _solEditar(id) {
  _solEditId = id || null;
  _solSetView('form');
}

function _solExcluir(id) {
  if (!confirm('Excluir esta solicitação de orçamento?')) return;
  D.solicitacoesOrcamento = (D.solicitacoesOrcamento || []).filter(function(s) { return s.id !== id; });
  delete _solSelecionados[id];
  sv('solicitacoesOrcamento');
  rSolicitacao();
}

// ── Seleção múltipla / exclusão em lote (ex.: desfazer uma importação) ───────

function _solToggleSelecao(id, checked) {
  if (checked) _solSelecionados[id] = true; else delete _solSelecionados[id];
  rSolicitacao();
}

function _solToggleSelecaoTodos(checked) {
  _solListaFiltrada().forEach(function(s) {
    if (checked) _solSelecionados[s.id] = true; else delete _solSelecionados[s.id];
  });
  rSolicitacao();
}

function _solLimparSelecao() {
  _solSelecionados = {};
  rSolicitacao();
}

function _solExcluirSelecionados() {
  var ids = Object.keys(_solSelecionados);
  if (!ids.length) return;
  if (!confirm('Excluir ' + ids.length + ' solicitação(ões) selecionada(s)? Essa ação não pode ser desfeita.')) return;
  var idsSet = new Set(ids);
  D.solicitacoesOrcamento = (D.solicitacoesOrcamento || []).filter(function(s) { return !idsSet.has(s.id); });
  _solSelecionados = {};
  sv('solicitacoesOrcamento');
  rSolicitacao();
}

// ── Gerar / abrir Orçamento vinculado ─────────────────────────────────────────

function _solGerarOrcamento(id) {
  var s = _solBuscar(id);
  if (!s) return;
  if (!s.pax) { alert('Informe o PAX antes de gerar o orçamento.'); return; }
  if (!confirm('Gerar um Orçamento a partir desta solicitação?')) return;
  _solCriarOrcamentoDe(s);
}

// Cria o orçamento ligado à solicitação e abre ele.
function _solCriarOrcamentoDe(s) {
  if (!D.orcamentos) D.orcamentos = [];
  var orcId = 'ORC' + Date.now();
  D.orcamentos.push({
    id: orcId,
    // Sem Cliente preenchido (comum na planilha), nomeia pelo tipo + quem pediu
    nomeCliente: s.cliente || [s.tipoEvento, s.solicitadoPor].filter(Boolean).join(' - ') || 'Sem nome',
    dataEvento: s.dataEvento || '',
    convidados: parseInt(s.pax) || 0,
    telefone: s.celular || s.telefoneFixo || '',
    numeroProposta: s.numero || '',
    criadoEm: new Date().toISOString(),
    criadoPor: (typeof _orcUsuarioAtual === 'function') ? _orcUsuarioAtual() : '',
    itens: [],
    calcItens: [],
    insumos: [],
    servicos: [],
    calcParams: {
      local: s.centroCusto || 'area_central',
      tipoEvento: _solMapTipoEvento(s.tipoEvento),
      cfVas: 'padrao',
      cfCond: 'padrao',
      cfCI: 'normal',
      cfPerda: 'padrao',
      margemSeguranca: 10,
      margemLucro: 30,
      // Imposto/Comissão seguem o padrão do cadastro; Cerimônia/Hora extra
      // começam desligados — ajuste na Calculadora.
      adic: (typeof _orcAdicInicial === 'function') ? _orcAdicInicial() : null,
    }
  });

  s.orcamentoId = orcId;
  sv('orcamentos');
  sv('solicitacoesOrcamento');
  // Já entra com o cardápio sugerido do Tipo de Evento (como fazia o antigo
  // modal "Novo orçamento"). Erro aqui não pode impedir de abrir o orçamento.
  try {
    if (typeof orcAplicarSugestaoCardapio === 'function') orcAplicarSugestaoCardapio(orcId, { silencioso: true });
  } catch (e) { console.error('Erro ao aplicar cardápio sugerido:', e); }
  go('orcamento');
  setTimeout(function() { if (typeof abrirOrcDetalhe === 'function') abrirOrcDetalhe(orcId); }, 50);
}

function _solAbrirOrcamento(id) {
  var s = _solBuscar(id);
  if (!s || !s.orcamentoId) return;
  // Orçamento foi excluído: solta o vínculo e deixa gerar de novo
  if (typeof _orcSolTemOrc === 'function' && !_orcSolTemOrc(s)) {
    s.orcamentoId = '';
    sv('solicitacoesOrcamento');
    alert('O orçamento desta solicitação foi excluído — agora dá pra gerar um novo.');
    if (typeof rSolicitacao === 'function') rSolicitacao();
    return;
  }
  go('orcamento');
  setTimeout(function() { if (typeof abrirOrcDetalhe === 'function') abrirOrcDetalhe(s.orcamentoId); }, 50);
}

// ── VIEW: IMPORTAR (arquivo do Excel) ─────────────────────────────────────────
// Ela seleciona o arquivo .xlsx/.xls/.csv exportado da planilha de controle —
// lê a planilha inteira (via SheetJS), sem risco de esquecer a linha de
// cabeçalho como acontecia ao copiar/colar manualmente. Todas as colunas são
// reconhecidas pelo NOME do cabeçalho (não pela posição), então podem vir em
// qualquer ordem e colunas desconhecidas são simplesmente ignoradas.

function _solBuildImportar() {
  var total = getSolicitacoesOrcamento().length;
  return '<div style="padding:20px 24px;max-width:860px">' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">' +
      '<button class="btn" onclick="_solSetView(\'lista\')">← Voltar</button>' +
      '<div>' +
        '<div style="font-size:18px;font-weight:600;color:var(--text)">Importar Solicitações da Planilha</div>' +
        '<div style="font-size:12px;color:var(--text3)">Cada linha da planilha vira uma solicitação — ' + total + ' já cadastrada(s)</div>' +
      '</div>' +
    '</div>' +

    '<div style="margin-bottom:14px;font-size:12px;color:var(--text3);line-height:1.7">' +
      'O cabeçalho precisa ter a coluna <code style="background:var(--bg3);padding:1px 5px;border-radius:3px">Cliente</code>, mas linhas com Cliente (ou qualquer outra coluna) em branco são importadas mesmo assim. As colunas (Nº, Solicitado por, Contato ou Telefone Fixo/Celular, Tipo de Evento, Data, Local, Centro de Custo, PAX, Serviços Orçados, Status, Hora, Bebidas, Obs., Modelo Utilizado, Bonificação/bv) são reconhecidas pelo nome da coluna, em qualquer posição — colunas com outros nomes são ignoradas.<br>' +
      'Linhas cujo <code style="background:var(--bg3);padding:1px 5px;border-radius:3px">Nº</code> já existir no sistema são ignoradas (pode importar o mesmo arquivo de novo sem duplicar).' +
    '</div>' +

    '<div style="background:var(--bg3);border:1px dashed var(--border2);border-radius:10px;padding:24px;text-align:center;margin-bottom:16px">' +
      '<div style="font-size:13px;color:var(--text2);margin-bottom:12px">📂 Selecione o arquivo do Excel (.xlsx, .xls ou .csv)</div>' +
      '<input type="file" id="sol-arquivo-input" accept=".xlsx,.xls,.csv" style="width:auto;display:inline-block" onchange="_solLerArquivoImport(this)">' +
    '</div>' +
    '<div id="sol-import-status" style="font-size:12px;color:var(--text3);margin-bottom:16px"></div>' +

    '<details style="font-size:12px;color:var(--text3)">' +
      '<summary style="cursor:pointer;color:var(--text2)">Prefere colar os dados em vez de enviar o arquivo?</summary>' +
      '<div style="margin-top:10px">' +
        '<div style="margin-bottom:8px;line-height:1.6">Selecione tudo na planilha, incluindo a linha do cabeçalho (Ctrl+A) → copie (Ctrl+C) → cole abaixo.</div>' +
        '<textarea id="sol-tsv-input" placeholder="Cole aqui o conteúdo da planilha (Tab-separado), com a linha de cabeçalho incluída..." ' +
          'style="width:100%;height:180px;padding:12px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px;font-family:var(--mono);resize:vertical;box-sizing:border-box"></textarea>' +
        '<div style="display:flex;gap:10px;margin-top:10px;align-items:center;flex-wrap:wrap">' +
          '<button class="btn" style="background:var(--blue);border-color:var(--blue);color:#fff;padding:9px 20px" onclick="_solProcessarImportColado()">Processar e salvar</button>' +
          '<button class="btn" onclick="document.getElementById(\'sol-tsv-input\').value=\'\'">Limpar campo</button>' +
        '</div>' +
      '</div>' +
    '</details>' +
  '</div>';
}

function _solImpStatus(msg, err) {
  var el = document.getElementById('sol-import-status');
  if (el) { el.textContent = msg; el.style.color = err ? 'var(--red)' : 'var(--green)'; }
}

// Entrada 1: arquivo .xlsx/.xls/.csv selecionado do computador
function _solLerArquivoImport(inputEl) {
  var file = inputEl.files && inputEl.files[0];
  if (!file) return;
  if (typeof XLSX === 'undefined') {
    _solImpStatus('A biblioteca de leitura de Excel não carregou — verifique sua internet e recarregue a página.', true);
    return;
  }
  _solImpStatus('Lendo "' + file.name + '"...', false);
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
      var sheet = wb.Sheets[wb.SheetNames[0]];
      // raw:true + cellDates:true → células de data viram objetos Date reais em vez de
      // texto formatado (o formato de texto do SheetJS pra data é ambíguo/errado às vezes,
      // ex.: "08/08/2026" virando "8/7/26").
      var linhas = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' });
      // Mesma planilha como texto formatado (igual aparece no Excel) — usado só
      // pra Hora: célula de hora vira Date de 1899 no modo raw e o texto saía
      // "Sat Dec 30 1899 06:00:00 GMT...".
      var linhasTxt = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
      var resultado = _solConstruirSolicitacoes(linhas, linhasTxt);
      _solSalvarImportados(resultado.novos, resultado.semCliente);
    } catch (err) {
      _solImpStatus('Erro ao ler o arquivo: ' + err.message, true);
    } finally {
      inputEl.value = '';
    }
  };
  reader.onerror = function() { _solImpStatus('Erro ao ler o arquivo.', true); inputEl.value = ''; };
  reader.readAsArrayBuffer(file);
}

// Entrada 2: texto colado (Tab-separado), com cabeçalho incluído
function _solProcessarImportColado() {
  var raw = (document.getElementById('sol-tsv-input')?.value || '').trim();
  if (!raw) { _solImpStatus('Cole os dados antes de processar.', true); return; }
  _solImpStatus('Processando...', false);
  setTimeout(function() {
    try {
      var linhas = raw.split(/\r?\n/).filter(function(l) { return l.trim(); }).map(function(l) { return l.split('\t'); });
      var resultado = _solConstruirSolicitacoes(linhas);
      _solSalvarImportados(resultado.novos, resultado.semCliente);
    } catch (e) {
      _solImpStatus('Erro: ' + e.message, true);
    }
  }, 50);
}

function _solSalvarImportados(novos, semCliente) {
  if (!D.solicitacoesOrcamento) D.solicitacoesOrcamento = [];
  var numerosExistentes = new Set(D.solicitacoesOrcamento.map(function(s) { return _solNumeroTexto(s.numero); }).filter(Boolean));
  var importados = 0, ignorados = 0;
  novos.forEach(function(n) {
    if (n.numero && numerosExistentes.has(_solNumeroTexto(n.numero))) { ignorados++; return; }
    D.solicitacoesOrcamento.push(n);
    if (n.numero) numerosExistentes.add(_solNumeroTexto(n.numero));
    importados++;
  });
  if (importados > 0) sv('solicitacoesOrcamento');

  var msg = importados + ' importada(s)';
  if (ignorados) msg += ', ' + ignorados + ' ignorada(s) por já existir';
  var temSemCliente = semCliente && semCliente.length > 0;
  if (temSemCliente) {
    msg += ' — ' + semCliente.length + ' linha(s) sem Cliente preenchido (importadas mesmo assim, complete depois): linha(s) da planilha ' +
      semCliente.slice(0, 20).join(', ') + (semCliente.length > 20 ? '…' : '');
  }
  _solImpStatus(msg + '.', false);
  if (importados > 0) setTimeout(function() { _solSetView('lista'); }, temSemCliente ? 4000 : 700);
}

// Recebe linhas já como array de arrays (cada linha da planilha, cabeçalho
// incluído em algum lugar entre as 5 primeiras — cobre o caso de haver
// título/linhas em branco acima do cabeçalho de verdade) e devolve
// { novos, semCliente } — os registros prontos para salvar e os números das
// linhas da planilha (1-based, contando a linha do cabeçalho como linha 1)
// que foram ignoradas por não terem a coluna Cliente preenchida.
function _solConstruirSolicitacoes(linhas, linhasTxt) {
  // Mantém o número da linha ORIGINAL da planilha (1-based) atrelado a cada
  // linha, mesmo depois de descartar as linhas totalmente em branco — senão a
  // contagem de linha reportada pra ela não bate com o que ela vê no Excel.
  var comIndice = (linhas || []).map(function(l, i) { return { linha: l, txt: linhasTxt && linhasTxt[i], numPlanilha: i + 1 }; })
    .filter(function(x) { return x.linha && x.linha.some(function(c) { return String(c == null ? '' : c).trim(); }); });
  if (!comIndice.length) throw new Error('Planilha vazia.');

  var headerIdx = -1, header = null, HU = null;
  for (var r = 0; r < Math.min(comIndice.length, 5); r++) {
    var cand = comIndice[r].linha.map(function(c) { return String(c == null ? '' : c).trim(); });
    var candUp = cand.map(function(c) { return c.toUpperCase(); });
    if (candUp.some(function(c) { return c.includes('CLIENTE'); })) { headerIdx = r; header = cand; HU = candUp; break; }
  }
  if (headerIdx < 0) throw new Error('Coluna "CLIENTE" não encontrada nas primeiras linhas da planilha.');

  function acha(subs) {
    for (var i = 0; i < HU.length; i++) {
      if (subs.some(function(s) { return HU[i].includes(s); })) return i;
    }
    return -1;
  }

  var iNum     = acha(['Nº', 'N°', 'NUMERO', 'NÚMERO']);
  var iSolPor  = acha(['SOLICITADO POR']);
  var iCli     = acha(['CLIENTE']);
  var iContato = acha(['CONTATO']);
  var iTelFix  = acha(['TELEFONE FIXO', 'FIXO']);
  var iCel     = acha(['CELULAR']);
  var iTipo    = acha(['TIPO DE EVENTO', 'TIPO EVENTO']);
  var iData    = acha(['DATA DO EVENTO', 'DATA EVENTO', 'DATA']);
  var iLocal   = acha(['LOCAL DO EVENTO', 'LOCAL EVENTO', 'LOCAL']);
  var iCC      = acha(['CENTRO DE CUSTO']);
  var iPax     = acha(['PAX']);
  var iServ    = acha(['SERVIÇOS ORÇADOS', 'SERVICOS ORCADOS']);
  var iStatus  = acha(['STATUS']);
  var iHora    = acha(['HORA']);
  var iBebidas = acha(['BEBIDAS']);
  var iObs     = acha(['OBSERVA', 'OBS']);
  var iModelo  = acha(['MODELO UTILIZADO', 'MODELO']);
  var iBv      = acha(['BONIFICA', 'BV']);

  var regioes = (typeof REGIOES_LOCAL !== 'undefined' ? REGIOES_LOCAL : []);
  function centroCustoKey(txt) {
    var t = (txt || '').trim().toLowerCase();
    if (!t) return '';
    var r = regioes.find(function(x) { return x.label.toLowerCase().includes(t) || t.includes(x.label.toLowerCase()); });
    return r ? r.key : '';
  }
  function dataISO(val) {
    // Célula de data real do Excel (lida com cellDates:true) — usa os getters
    // locais, que cancelam o offset introduzido na serialização (mesmo timezone
    // na leitura e na escrita, então o dia sempre bate).
    if (val instanceof Date && !isNaN(val)) {
      return val.getFullYear() + '-' + String(val.getMonth() + 1).padStart(2, '0') + '-' + String(val.getDate()).padStart(2, '0');
    }
    var t = String(val == null ? '' : val).trim();
    var m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
    if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
    return '';
  }
  function cel(cols, i) { return i >= 0 ? String(cols[i] == null ? '' : cols[i]).trim() : ''; }
  // Hora: prefere o texto formatado da célula (ex.: "06:00"); sem ele,
  // converte Date/fração-de-dia do Excel pra HH:MM.
  function hora(item) {
    if (iHora < 0) return '';
    var v = item.linha[iHora];
    var txt = item.txt ? cel(item.txt, iHora) : '';
    if (txt && !/GMT|\d{4}/.test(txt)) return txt;
    var totalMin = null;
    if (v instanceof Date && !isNaN(v)) totalMin = v.getHours() * 60 + v.getMinutes() + (v.getSeconds() >= 30 ? 1 : 0);
    else if (typeof v === 'number' && v >= 0 && v < 1) totalMin = Math.round(v * 1440);
    if (totalMin === null) return cel(item.linha, iHora);
    totalMin = totalMin % 1440;
    return String(Math.floor(totalMin / 60)).padStart(2, '0') + ':' + String(totalMin % 60).padStart(2, '0');
  }

  var novos = [];
  var semCliente = [];
  for (var li = headerIdx + 1; li < comIndice.length; li++) {
    var cols = comIndice[li].linha;
    // Linha sem Cliente também entra (ela completa depois) — só linha 100%
    // em branco é descartada, lá em cima.
    var cliente = cel(cols, iCli);
    if (!cliente) semCliente.push(comIndice[li].numPlanilha);
    novos.push({
      id: _gerarId('SOL'),
      // Nº como aparece no Excel (texto formatado) — o valor bruto de uma
      // célula numérica formatada como "0000-000" viria "926001".
      numero: _solNumeroTexto((comIndice[li].txt ? cel(comIndice[li].txt, iNum) : '') || cel(cols, iNum)),
      solicitadoPor: cel(cols, iSolPor),
      cliente: cliente,
      telefoneFixo: cel(cols, iTelFix),
      // "Contato" na planilha dela é um campo único de telefone — se não tiver
      // as colunas antigas separadas (Telefone Fixo / Celular), usa esse.
      celular: iCel >= 0 ? cel(cols, iCel) : cel(cols, iContato),
      // Se bater com um tipo do cadastro, grava o nome como está lá.
      tipoEvento: (_solTipoDoCadastro(cel(cols, iTipo)) || {}).nome || cel(cols, iTipo),
      dataEvento: iData >= 0 ? dataISO(cols[iData]) : '',
      localEvento: cel(cols, iLocal),
      centroCusto: iCC >= 0 ? centroCustoKey(cols[iCC]) : '',
      pax: iPax >= 0 ? (parseInt(cel(cols, iPax).replace(/\D/g, '')) || 0) : 0,
      servicosOrcados: cel(cols, iServ),
      status: (cel(cols, iStatus) || 'PENDENTE').toUpperCase(),
      hora: hora(comIndice[li]),
      bebidas: cel(cols, iBebidas),
      observacao: cel(cols, iObs),
      modeloUtilizado: cel(cols, iModelo),
      bonificacaoCerimonial: cel(cols, iBv),
      orcamentoId: '',
      criadoEm: new Date().toISOString(),
    });
  }
  if (!novos.length) throw new Error('Nenhuma linha com dados encontrada abaixo do cabeçalho.');
  return { novos: novos, semCliente: semCliente };
}
