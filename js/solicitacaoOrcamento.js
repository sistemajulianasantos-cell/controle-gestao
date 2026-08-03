// ─── SOLICITAÇÃO DE ORÇAMENTO ────────────────────────────────────────────────
// Funil de entrada comercial: todo pedido de orçamento que chega (WhatsApp,
// indicação, site etc.) é cadastrado aqui antes de virar um Orçamento formal
// (D.orcamentos). Cada solicitação pode gerar/linkar um Orçamento — o vínculo
// fica guardado em `orcamentoId`, nunca duplicado.

var _solView = 'lista';
var _solEditId = null;
var _solSelecionados = {}; // id -> true, seleção múltipla na lista (só na view atual)

var SOL_STATUS_PADRAO = ['PENDENTE', 'ENVIADO', 'APROVADO', 'RECUSADO'];

function initSolicitacaoOrcamento() {
  if (!D.solicitacoesOrcamento) D.solicitacoesOrcamento = [];
  _solView = 'lista';
  _solEditId = null;
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
// em que a solicitação foi CADASTRADA (não o mês do evento).
function _solProximoNumero() {
  var hoje = new Date();
  var prefixo = String(hoje.getMonth() + 1).padStart(2, '0') + String(hoje.getFullYear()).slice(-2);
  var max = 0;
  (D.solicitacoesOrcamento || []).forEach(function(s) {
    var m = (s.numero || '').match(new RegExp('^' + prefixo + '-(\\d+)$'));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return prefixo + '-' + String(max + 1).padStart(3, '0');
}

function _solMapTipoEvento(t) {
  var n = (t || '').toLowerCase();
  if (n.includes('casamento')) return 'casamento';
  if (n.includes('15 anos') || n.includes('15anos')) return '15anos';
  if (n.includes('formatura')) return 'formatura';
  return 'outros';
}

function _solCorStatus(status) {
  var s = (status || '').toUpperCase();
  if (s === 'PENDENTE') return { bg: '#F5A62333', cor: '#F5A623' };
  if (s === 'ENVIADO') return { bg: '#4F8EF733', cor: '#4F8EF7' };
  if (s === 'APROVADO') return { bg: '#4FC78E33', cor: '#4FC78E' };
  if (s === 'RECUSADO') return { bg: '#F74F6B33', cor: '#F74F6B' };
  return { bg: 'var(--bg3)', cor: 'var(--text3)' };
}

// ── VIEW: LISTA ───────────────────────────────────────────────────────────────

// Ordem = por cadastro/importação (mais recente primeiro) — não pelo Nº como
// texto, porque o Nº importado da planilha nem sempre segue o mesmo padrão
// zero-preenchido do gerado pelo sistema (ex.: "2" ficando depois de "10").
function _solListaFiltrada() {
  var lista = getSolicitacoesOrcamento().slice().sort(function(a, b) {
    return (b.criadoEm || '').localeCompare(a.criadoEm || '');
  });

  var busca = (document.getElementById('sol-busca')?.value || '').toLowerCase();
  var statusFiltro = document.getElementById('sol-status-filtro')?.value || '';
  if (busca) lista = lista.filter(function(s) { return (s.cliente || '').toLowerCase().includes(busca); });
  if (statusFiltro) lista = lista.filter(function(s) { return (s.status || '').toUpperCase() === statusFiltro; });
  return lista;
}

function _solBuildLista() {
  var lista = _solListaFiltrada();
  var qtdSel = Object.keys(_solSelecionados).length;
  var todosSelecionados = lista.length > 0 && lista.every(function(s) { return _solSelecionados[s.id]; });

  var linhas = !lista.length
    ? '<tr><td colspan="15" style="text-align:center;color:var(--text3);padding:24px">Nenhuma solicitação encontrada</td></tr>'
    : lista.map(function(s) {
        var cor = _solCorStatus(s.status);
        var contato = [s.telefoneFixo, s.celular].filter(Boolean).join(' · ') || '—';
        var extras = [s.hora, s.bebidas, s.observacao].filter(Boolean).join(' · ');
        return '<tr style="border-bottom:1px solid var(--border)">' +
          '<td style="padding:8px 12px;text-align:center">' +
            '<input type="checkbox" ' + (_solSelecionados[s.id] ? 'checked' : '') + ' onchange="_solToggleSelecao(\'' + s.id + '\',this.checked)"></td>' +
          '<td style="padding:8px 12px;font-family:var(--mono);font-size:11px">' + (s.numero || '—') + '</td>' +
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3)">' + (s.solicitadoPor || '—') + '</td>' +
          '<td style="padding:8px 12px"><strong>' + (s.cliente || '—') + '</strong></td>' +
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
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3);max-width:180px" title="' + extras + '">' + (extras || '—') + '</td>' +
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3)">' + (s.modeloUtilizado || '—') + '</td>' +
          '<td style="padding:8px 12px;font-size:11px;color:var(--text3)">' + (s.bonificacaoCerimonial || '—') + '</td>' +
          '<td style="padding:8px 12px;white-space:nowrap">' +
            '<button class="btn-sm" style="background:var(--blue)" onclick="_solEditar(\'' + s.id + '\')" title="Editar">✏️</button> ' +
            (s.orcamentoId
              ? '<button class="btn-sm" style="background:var(--green)" onclick="_solAbrirOrcamento(\'' + s.id + '\')" title="Abrir orçamento gerado">📋 Orçamento</button> '
              : '<button class="btn-sm" style="background:var(--green)" onclick="_solGerarOrcamento(\'' + s.id + '\')" title="Gerar orçamento a partir desta solicitação">📋 Gerar Orçamento</button> ') +
            '<button class="btn-sm btn-red" onclick="_solExcluir(\'' + s.id + '\')" title="Excluir">✕</button>' +
          '</td>' +
        '</tr>';
      }).join('');

  return '<div style="padding:20px 24px">' +
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
      '<div style="display:flex;align-items:center;gap:10px;background:#F74F6B1A;border:1px solid var(--red);border-radius:8px;padding:8px 14px;margin-bottom:12px;flex-wrap:wrap">' +
        '<span style="font-size:12px;color:var(--text)">' + qtdSel + ' selecionada(s)</span>' +
        '<button class="btn-sm btn-red" onclick="_solExcluirSelecionados()">🗑️ Excluir selecionadas</button>' +
        '<button class="btn-sm" style="background:var(--bg3)" onclick="_solLimparSelecao()">Cancelar seleção</button>' +
      '</div>' : '') +

    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' +
      '<input class="inp" id="sol-busca" type="text" placeholder="🔍 Buscar por cliente..." style="flex:1;min-width:200px" oninput="rSolicitacao()">' +
      '<select class="inp" id="sol-status-filtro" style="width:180px" onchange="rSolicitacao()">' +
        '<option value="">Todos os status</option>' +
        SOL_STATUS_PADRAO.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join('') +
      '</select>' +
    '</div>' +

    '<div style="overflow-x:auto">' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="border-bottom:2px solid var(--border2);color:var(--text3);text-transform:uppercase;font-size:10px">' +
        '<th style="padding:8px 12px;text-align:center"><input type="checkbox" ' + (todosSelecionados ? 'checked' : '') + ' onchange="_solToggleSelecaoTodos(this.checked)" title="Selecionar todos"></th>' +
        '<th style="padding:8px 12px;text-align:left">Nº</th>' +
        '<th style="padding:8px 12px;text-align:left">Solicitado por</th>' +
        '<th style="padding:8px 12px;text-align:left">Cliente</th>' +
        '<th style="padding:8px 12px;text-align:left">Contato</th>' +
        '<th style="padding:8px 12px;text-align:left">Tipo de Evento</th>' +
        '<th style="padding:8px 12px;text-align:left">Data</th>' +
        '<th style="padding:8px 12px;text-align:left">Local</th>' +
        '<th style="padding:8px 12px;text-align:center">PAX</th>' +
        '<th style="padding:8px 12px;text-align:left">Serviços Orçados</th>' +
        '<th style="padding:8px 12px;text-align:left">Status</th>' +
        '<th style="padding:8px 12px;text-align:left">Hora / Bebidas / Obs.</th>' +
        '<th style="padding:8px 12px;text-align:left">Modelo Utilizado</th>' +
        '<th style="padding:8px 12px;text-align:left">Bonificação (bv)</th>' +
        '<th style="padding:8px 12px;text-align:left">Ações</th>' +
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
  var regioes = (typeof REGIOES_LOCAL !== 'undefined' ? REGIOES_LOCAL : []);

  return '<div style="padding:20px 24px;max-width:900px">' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">' +
      '<button class="btn" onclick="_solSetView(\'lista\')">← Voltar</button>' +
      '<div style="font-size:18px;font-weight:600;color:var(--text)">' + (s ? '✏️ Editar Solicitação' : '+ Nova Solicitação de Orçamento') + '</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">' +
      '<div><label class="lbl">Nº</label><input class="inp" id="sol-numero" type="text" value="' + (s ? s.numero : _solProximoNumero()) + '"></div>' +
      '<div><label class="lbl">Solicitado por</label><input class="inp" id="sol-solicitado-por" type="text" placeholder="Quem atendeu/recebeu o pedido" value="' + (s ? s.solicitadoPor || '' : '') + '"></div>' +
      '<div style="grid-column:span 2"><label class="lbl">Cliente *</label><input class="inp" id="sol-cliente" type="text" placeholder="Nome do cliente" value="' + (s ? s.cliente || '' : '') + '"></div>' +
      '<div><label class="lbl">Telefone Fixo</label><input class="inp" id="sol-tel-fixo" type="text" placeholder="(31) 3333-3333" value="' + (s ? s.telefoneFixo || '' : '') + '"></div>' +
      '<div><label class="lbl">Celular</label><input class="inp" id="sol-celular" type="text" placeholder="(31) 9 9999-9999" value="' + (s ? s.celular || '' : '') + '"></div>' +
      '<div><label class="lbl">Tipo de Evento</label><input class="inp" id="sol-tipo" type="text" placeholder="Ex: Casamento" value="' + (s ? s.tipoEvento || '' : '') + '"></div>' +
      '<div><label class="lbl">Data do Evento</label><input class="inp" id="sol-data" type="date" value="' + (s ? s.dataEvento || '' : '') + '"></div>' +
      '<div><label class="lbl">PAX</label><input class="inp" id="sol-pax" type="number" min="0" placeholder="Nº de convidados" value="' + (s ? s.pax || '' : '') + '"></div>' +
      '<div style="grid-column:span 2"><label class="lbl">Local do Evento</label><input class="inp" id="sol-local" type="text" placeholder="Nome do espaço / endereço" value="' + (s ? s.localEvento || '' : '') + '"></div>' +
      '<div><label class="lbl">Centro de Custo do Local</label><select class="inp" id="sol-centro-custo">' +
        '<option value="">— Selecione —</option>' +
        regioes.map(function(r) { return '<option value="' + r.key + '"' + (s && s.centroCusto === r.key ? ' selected' : '') + '>' + r.label + '</option>'; }).join('') +
      '</select></div>' +
      '<div><label class="lbl">Status</label><select class="inp" id="sol-status">' +
        SOL_STATUS_PADRAO.map(function(st) { return '<option value="' + st + '"' + (s && (s.status || 'PENDENTE') === st ? ' selected' : '') + '>' + st + '</option>'; }).join('') +
      '</select></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Serviços Orçados</label><input class="inp" id="sol-servicos" type="text" placeholder="Ex: Whiskeria opcional" value="' + (s ? s.servicosOrcados || '' : '') + '"></div>' +
      '<div><label class="lbl">Hora</label><input class="inp" id="sol-hora" type="text" placeholder="Ex: 06:00 07:00 (tempo de festa)" value="' + (s ? s.hora || '' : '') + '"></div>' +
      '<div style="grid-column:span 2"><label class="lbl">Bebidas</label><input class="inp" id="sol-bebidas" type="text" placeholder="Ex: Vinho e Whisky" value="' + (s ? s.bebidas || '' : '') + '"></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Observação</label><textarea class="inp" id="sol-obs" rows="2" style="resize:vertical">' + (s ? s.observacao || '' : '') + '</textarea></div>' +
      '<div><label class="lbl">Modelo Utilizado</label><input class="inp" id="sol-modelo" type="text" placeholder="Modelo de proposta" value="' + (s ? s.modeloUtilizado || '' : '') + '"></div>' +
      '<div><label class="lbl">Bonificação Cerimonial (bv)</label><input class="inp" id="sol-bv" type="text" placeholder="Ex: nome / % / valor" value="' + (s ? s.bonificacaoCerimonial || '' : '') + '"></div>' +
    '</div>' +
    '<div style="margin-top:16px;display:flex;gap:8px">' +
      '<button class="btn" style="background:var(--green)" onclick="_solSalvar()">💾 Salvar</button>' +
      '<button class="btn" style="background:var(--bg3);color:var(--text)" onclick="_solSetView(\'lista\')">Cancelar</button>' +
    '</div>' +
  '</div>';
}

function _solSalvar() {
  var cliente = (document.getElementById('sol-cliente')?.value || '').trim();
  if (!cliente) { alert('Informe o nome do cliente.'); return; }

  if (!D.solicitacoesOrcamento) D.solicitacoesOrcamento = [];
  var existente = _solEditId ? _solBuscar(_solEditId) : null;

  var registro = {
    id: existente ? existente.id : _gerarId('SOL'),
    numero: (document.getElementById('sol-numero')?.value || '').trim() || _solProximoNumero(),
    solicitadoPor: (document.getElementById('sol-solicitado-por')?.value || '').trim(),
    cliente: cliente,
    telefoneFixo: (document.getElementById('sol-tel-fixo')?.value || '').trim(),
    celular: (document.getElementById('sol-celular')?.value || '').trim(),
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

  if (!D.orcamentos) D.orcamentos = [];
  var orcId = 'ORC' + Date.now();
  D.orcamentos.push({
    id: orcId,
    nomeCliente: s.cliente,
    dataEvento: s.dataEvento || '',
    convidados: parseInt(s.pax) || 0,
    telefone: s.celular || s.telefoneFixo || '',
    numeroProposta: s.numero || '',
    criadoEm: new Date().toISOString(),
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
    }
  });

  s.orcamentoId = orcId;
  sv('orcamentos');
  sv('solicitacoesOrcamento');
  go('orcamento');
  setTimeout(function() { if (typeof abrirOrcDetalhe === 'function') abrirOrcDetalhe(orcId); }, 50);
}

function _solAbrirOrcamento(id) {
  var s = _solBuscar(id);
  if (!s || !s.orcamentoId) return;
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
      'Coluna obrigatória: <code style="background:var(--bg3);padding:1px 5px;border-radius:3px">Cliente</code>. As demais (Nº, Solicitado por, Contato ou Telefone Fixo/Celular, Tipo de Evento, Data, Local, Centro de Custo, PAX, Serviços Orçados, Status, Hora, Bebidas, Obs., Modelo Utilizado, Bonificação/bv) são reconhecidas pelo nome da coluna, em qualquer posição — colunas com outros nomes são ignoradas.<br>' +
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
          '<button class="btn" style="background:#4F8EF7;border-color:#4F8EF7;color:#fff;padding:9px 20px" onclick="_solProcessarImportColado()">Processar e salvar</button>' +
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
      var resultado = _solConstruirSolicitacoes(linhas);
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
  var numerosExistentes = new Set(D.solicitacoesOrcamento.map(function(s) { return s.numero; }).filter(Boolean));
  var importados = 0, ignorados = 0;
  novos.forEach(function(n) {
    if (n.numero && numerosExistentes.has(n.numero)) { ignorados++; return; }
    D.solicitacoesOrcamento.push(n);
    if (n.numero) numerosExistentes.add(n.numero);
    importados++;
  });
  if (importados > 0) sv('solicitacoesOrcamento');

  var msg = importados + ' importada(s)';
  if (ignorados) msg += ', ' + ignorados + ' ignorada(s) por já existir';
  var temSemCliente = semCliente && semCliente.length > 0;
  if (temSemCliente) {
    msg += ', ' + semCliente.length + ' linha(s) SEM a coluna "Cliente" preenchida (não importadas) — linha(s) da planilha: ' +
      semCliente.slice(0, 20).join(', ') + (semCliente.length > 20 ? '…' : '');
  }
  _solImpStatus(msg + '.', temSemCliente);
  if (importados > 0) setTimeout(function() { _solSetView('lista'); }, temSemCliente ? 4000 : 700);
}

// Recebe linhas já como array de arrays (cada linha da planilha, cabeçalho
// incluído em algum lugar entre as 5 primeiras — cobre o caso de haver
// título/linhas em branco acima do cabeçalho de verdade) e devolve
// { novos, semCliente } — os registros prontos para salvar e os números das
// linhas da planilha (1-based, contando a linha do cabeçalho como linha 1)
// que foram ignoradas por não terem a coluna Cliente preenchida.
function _solConstruirSolicitacoes(linhas) {
  // Mantém o número da linha ORIGINAL da planilha (1-based) atrelado a cada
  // linha, mesmo depois de descartar as linhas totalmente em branco — senão a
  // contagem de linha reportada pra ela não bate com o que ela vê no Excel.
  var comIndice = (linhas || []).map(function(l, i) { return { linha: l, numPlanilha: i + 1 }; })
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

  var novos = [];
  var semCliente = [];
  for (var li = headerIdx + 1; li < comIndice.length; li++) {
    var cols = comIndice[li].linha;
    var cliente = cel(cols, iCli);
    if (!cliente) { semCliente.push(comIndice[li].numPlanilha); continue; }
    novos.push({
      id: _gerarId('SOL'),
      numero: cel(cols, iNum),
      solicitadoPor: cel(cols, iSolPor),
      cliente: cliente,
      telefoneFixo: cel(cols, iTelFix),
      // "Contato" na planilha dela é um campo único de telefone — se não tiver
      // as colunas antigas separadas (Telefone Fixo / Celular), usa esse.
      celular: iCel >= 0 ? cel(cols, iCel) : cel(cols, iContato),
      tipoEvento: cel(cols, iTipo),
      dataEvento: iData >= 0 ? dataISO(cols[iData]) : '',
      localEvento: cel(cols, iLocal),
      centroCusto: iCC >= 0 ? centroCustoKey(cols[iCC]) : '',
      pax: iPax >= 0 ? (parseInt(cel(cols, iPax).replace(/\D/g, '')) || 0) : 0,
      servicosOrcados: cel(cols, iServ),
      status: (cel(cols, iStatus) || 'PENDENTE').toUpperCase(),
      hora: cel(cols, iHora),
      bebidas: cel(cols, iBebidas),
      observacao: cel(cols, iObs),
      modeloUtilizado: cel(cols, iModelo),
      bonificacaoCerimonial: cel(cols, iBv),
      orcamentoId: '',
      criadoEm: new Date().toISOString(),
    });
  }
  if (!novos.length) throw new Error('Nenhuma linha válida encontrada (verifique a coluna Cliente).');
  return { novos: novos, semCliente: semCliente };
}
