// ─── FECHAMENTO DE EVENTO ─────────────────────────────────────────────────────

if (!D.fechamentos) D.fechamentos = [];

const TIPOS_FCH = [
  { id: 'produto',      label: 'Produto',           cor: '#22C55E'      },
  { id: 'peca',         label: 'Peça',              cor: 'var(--red)'   },
  { id: 'servico',      label: 'Serviço adicional', cor: '#FBBF24'      },
  // tipos antigos exibem com o mesmo label dos novos
  { id: 'bebida_extra', label: 'Produto',           cor: '#22C55E'      },
  { id: 'quebra',       label: 'Peça',              cor: 'var(--red)'   },
  { id: 'hora_extra',   label: 'Serviço adicional', cor: '#FBBF24'      },
  { id: 'adicional',    label: 'Serviço adicional', cor: '#FBBF24'      },
];

function _fchNormTipo(tipo) {
  if (tipo === 'bebida_extra')                     return 'produto';
  if (tipo === 'quebra')                           return 'peca';
  if (tipo === 'hora_extra' || tipo === 'adicional') return 'servico';
  return tipo || 'produto';
}

let _fchItens = [];

function _fchLabel(id) { return (TIPOS_FCH.find(t => t.id === id) || {}).label || id; }
function _fchCor(id)   { return (TIPOS_FCH.find(t => t.id === id) || {}).cor   || 'var(--text)'; }

// Normaliza item para exibição em colunas (suporta formato antigo e novo)
function _fchParseItem(it) {
  if (it.qtd != null && it.valorUnit != null) {
    return { produto: it.descricao || '—', qtd: it.qtd, valorUnit: it.valorUnit, valor: it.valor };
  }
  // Tenta extrair do formato legado "Produto — N un. × R$ X,XX"
  const m = (it.descricao || '').match(/^(.+?)\s*[—\-–]\s*(\d+)\s*un\.\s*[×x]\s*R\$\s*([\d.,]+)/i);
  if (m) {
    const qtd       = parseInt(m[2]);
    const valorUnit = parseFloat(m[3].replace(/\./g, '').replace(',', '.'));
    return { produto: m[1].trim(), qtd, valorUnit, valor: it.valor };
  }
  return { produto: it.descricao || '—', qtd: null, valorUnit: null, valor: it.valor };
}

function _fchMigrarItens() {
  let countFmt = 0, countTipo = 0;
  (D.fechamentos || []).forEach(fch => {
    (fch.itens || []).forEach(it => {
      // Migra formato antigo de descrição
      if (it.qtd == null || it.valorUnit == null) {
        const m = (it.descricao || '').match(/^(.+?)\s*[—\-–]\s*(\d+)\s*un\.\s*[×x]\s*R\$\s*([\d.,]+)/i);
        if (m) {
          it.descricao = m[1].trim();
          it.qtd       = parseInt(m[2]);
          it.valorUnit = parseFloat(m[3].replace(/\./g, '').replace(',', '.'));
          countFmt++;
        }
      }
      // Normaliza tipo antigo para novo
      const novoTipo = _fchNormTipo(it.tipo);
      if (novoTipo !== it.tipo) { it.tipo = novoTipo; countTipo++; }
    });
  });
  const total = countFmt + countTipo;
  if (total > 0) {
    sv('fechamentos');
    const partes = [];
    if (countFmt  > 0) partes.push(`${countFmt} formato${countFmt  !== 1 ? 's' : ''}`);
    if (countTipo > 0) partes.push(`${countTipo} tipo${countTipo !== 1 ? 's' : ''}`);
    alert2(`Atualizado: ${partes.join(' e ')}!`, 'success');
    rFechamentos();
    rFestaFechamentos();
  } else {
    alert2('Tudo já está no novo formato.', 'info');
  }
}

function _fchCalcTotal() {
  const qtd   = parseFloat(document.getElementById('fch-item-qtd')?.value   || 0);
  const vunit = parseFloat((document.getElementById('fch-item-vunit')?.value || '').replace(',', '.')) || 0;
  const tot   = qtd * vunit;
  const el    = document.getElementById('fch-item-total-prev');
  if (el) el.textContent = tot > 0 ? fR(tot) : '—';
}

// HTML de detalhe de itens — colunas: Tipo | Produto | Qtd | Val.Unit | Total
function _fchDetalheGrid(itens, colspan) {
  const header = `
    <div style="display:grid;grid-template-columns:120px 1fr 55px 90px 90px;gap:6px;padding:6px 14px;background:var(--bg4);border-bottom:1px solid var(--border)">
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Tipo</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Produto</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Qtd</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Val. unit.</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Total</span>
    </div>`;
  const rows = (itens || []).map(it => {
    const p = _fchParseItem(it);
    return `<div style="display:grid;grid-template-columns:120px 1fr 55px 90px 90px;gap:6px;padding:6px 14px;border-bottom:1px solid var(--border);font-size:11px;align-items:center">
      <span style="color:${_fchCor(it.tipo)};font-weight:600">${_fchLabel(it.tipo)}</span>
      <span style="color:var(--text2)">${p.produto}</span>
      <span style="font-family:var(--mono);text-align:right;color:var(--text2)">${p.qtd != null ? p.qtd : '—'}</span>
      <span style="font-family:var(--mono);text-align:right;color:var(--text2)">${p.valorUnit != null ? fR(p.valorUnit) : '—'}</span>
      <span style="font-family:var(--mono);font-weight:600;color:#FBBF24;text-align:right">${fR(p.valor)}</span>
    </div>`;
  }).join('') || '<div style="padding:10px 14px;font-size:11px;color:var(--text3)">Nenhum item lançado</div>';
  return header + rows;
}

// ── Tela principal ───────────────────────────────────────────────────────────
function rFechamentos() {
  const all = D.fechamentos || [];

  // Também inclui entradas do financeiro com isFechamento: true que não têm
  // entrada correspondente em D.fechamentos (criadas por versões anteriores)
  const fchFinIds = new Set(all.map(f => f.financeiroId).filter(Boolean));
  const fchIds    = new Set(all.map(f => f.id));
  const orfaos = (D.financeiro || [])
    .filter(f => f.isFechamento && !fchFinIds.has(f.id) && !fchIds.has(f.id))
    .map(f => ({
      id:          f.id,
      eventoNome:  f.evento || f.contrato || '—',
      clienteNome: f.contrato || '',
      dataEvento:  f.data || '',
      vencimento:  f.vencimento || '',
      itens:       [],
      totalExtras: f.valorNum || 0,
      status:      f.status || 'pendente',
      _orfao:      true,
    }));
  const lista_all = [...all, ...orfaos];

  const pendentes = lista_all.filter(f => f.status === 'pendente');
  const pagos     = lista_all.filter(f => f.status === 'pago');
  const totPend   = pendentes.reduce((s, f) => s + (f.totalExtras || 0), 0);
  const totPago   = pagos.reduce((s, f) => s + (f.totalExtras || 0), 0);

  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setEl('fch-tot-count', lista_all.length.toString());
  setEl('fch-tot-pend',  fR(totPend));
  setEl('fch-tot-pago',  fR(totPago));

  const tbody = document.getElementById('fch-body');
  if (!tbody) return;

  const filtro = document.getElementById('fch-filtro')?.value || 'todos';
  const busca  = (document.getElementById('fch-busca')?.value || '').toLowerCase();

  const lista = lista_all
    .filter(f => filtro === 'todos' || f.status === filtro)
    .filter(f => !busca || (f.eventoNome || '').toLowerCase().includes(busca) || (f.clienteNome || '').toLowerCase().includes(busca))
    .sort((a, b) => (b.dataEvento || '').localeCompare(a.dataEvento || ''));

  const hoje = new Date().toISOString().slice(0, 10);
  tbody.innerHTML = '';

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">Nenhum fechamento registrado</td></tr>';
    return;
  }

  lista.forEach(f => {
    const atrasado = f.status === 'pendente' && f.vencimento && f.vencimento < hoje;
    const statusTag = !f.totalExtras
      ? '<span class="tag tag-green">Sem cobrança</span>'
      : f.status === 'pago'
        ? '<span class="tag tag-green">Pago</span>'
        : atrasado
          ? '<span class="tag tag-red">Atrasado</span>'
          : '<span class="tag tag-yellow">Pendente</span>';

    const uid = 'fch-' + f.id;

    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.onclick = () => _toggleFch(uid);
    tr.innerHTML = `
      <td style="width:24px;font-size:12px;color:var(--text3);text-align:center;user-select:none" id="${uid}-arrow">▶</td>
      <td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(f.dataEvento) || '—'}</td>
      <td><strong>${f.eventoNome || '—'}</strong><div style="font-size:10px;font-weight:400;color:var(--text3)">${f.clienteNome || ''}${f._orfao ? ' <span style="color:#F87171">(lançamento antigo)</span>' : ''}</div></td>
      <td style="font-size:11px;color:var(--text3)">${(f.itens || []).length} item${(f.itens || []).length !== 1 ? 's' : ''}</td>
      <td style="font-family:var(--mono);font-weight:700;color:#FBBF24">${fR(f.totalExtras)}</td>
      <td>${statusTag}</td>
      <td onclick="event.stopPropagation()">
        ${f.status === 'pendente'
          ? `<button class="btn-sm btn-green" onclick="marcarFechamentoPago('${f.id}')">Recebido</button>`
          : `<button class="btn-sm" onclick="marcarFechamentoPendente('${f.id}')">Desfazer</button>`
        }
        <button class="btn-sm" onclick="editarFechamento('${f.id}')">✏️</button>
        <button class="btn-sm btn-red" onclick="excluirFechamento('${f.id}')">✕</button>
      </td>`;
    tbody.appendChild(tr);

    const trDetail = document.createElement('tr');
    trDetail.id = uid + '-detail';
    trDetail.style.display = 'none';
    trDetail.innerHTML = `<td colspan="7" style="padding:0;border-bottom:2px solid var(--border2)">
      <div style="background:var(--bg3)">
        ${_fchDetalheGrid(f.itens)}
        ${f.observacoes ? `<div style="padding:8px 14px;font-size:11px;color:var(--text3);border-top:1px solid var(--border)">📝 ${f.observacoes}</div>` : ''}
        ${f.vencimento ? `<div style="padding:6px 14px;font-size:11px;color:var(--text3)">Vencimento: <strong>${fd(f.vencimento)}</strong></div>` : ''}
      </div>
    </td>`;
    tbody.appendChild(trDetail);
  });
}

function _toggleFch(uid) {
  const detail = document.getElementById(uid + '-detail');
  const arrow  = document.getElementById(uid + '-arrow');
  if (!detail) return;
  const open = detail.style.display === 'none' || !detail.style.display;
  detail.style.display = open ? 'table-row' : 'none';
  if (arrow) arrow.textContent = open ? '▼' : '▶';
}

// ── Modal: novo / editar ─────────────────────────────────────────────────────
function fchToggleSemCobranca() {
  const sem = document.getElementById('fch-sem-cobranca')?.checked;
  ['fch-add-area','fch-itens-list','fch-total-row'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = sem ? 'none' : '';
  });
}

function novoFechamento(contratoId, festaRef) {
  _fchItens = [];
  const semEl = document.getElementById('fch-sem-cobranca');
  if (semEl) { semEl.checked = false; fchToggleSemCobranca(); }
  document.getElementById('fch-modal-id').value   = '';
  document.getElementById('fch-modal-nome').value  = '';
  document.getElementById('fch-modal-data').value  = '';
  document.getElementById('fch-modal-venc').value  = '';
  document.getElementById('fch-modal-obs').value   = '';

  const sel = document.getElementById('fch-modal-contrato');
  sel.innerHTML = '<option value="">Selecionar contrato...</option>' +
    (D.contratos || [])
      .slice().sort((a, b) => (b.data || '').localeCompare(a.data || ''))
      .map(c => `<option value="${c.id}"${c.id === contratoId ? ' selected' : ''}>${c.nome || '—'} — ${fd(c.data) || '—'}</option>`)
      .join('');

  if (contratoId) _fchPreencherContrato(contratoId);

  if (festaRef) {
    if (!document.getElementById('fch-modal-nome').value)
      document.getElementById('fch-modal-nome').value = festaRef.nome || '';
    if (!document.getElementById('fch-modal-data').value)
      document.getElementById('fch-modal-data').value = festaRef.data || '';
    if (!document.getElementById('fch-modal-venc').value && festaRef.data) {
      const d = new Date(festaRef.data + 'T12:00:00');
      d.setDate(d.getDate() + 3);
      document.getElementById('fch-modal-venc').value = d.toISOString().slice(0, 10);
    }
  }

  _rFchItens();
  openM('mfechamento');
}

function _fchPreencherContrato(cid) {
  const c = (D.contratos || []).find(x => x.id === cid);
  if (!c) return;
  const nomeEl = document.getElementById('fch-modal-nome');
  const dataEl = document.getElementById('fch-modal-data');
  const vencEl = document.getElementById('fch-modal-venc');
  if (nomeEl && !nomeEl.value) nomeEl.value = c.nome || '';
  if (dataEl && !dataEl.value) dataEl.value = c.data || '';
  if (vencEl && !vencEl.value && c.data) {
    const d = new Date(c.data + 'T12:00:00');
    d.setDate(d.getDate() + 3);
    vencEl.value = d.toISOString().slice(0, 10);
  }
}

function fchContratoChange() {
  const cid = document.getElementById('fch-modal-contrato').value;
  if (cid) _fchPreencherContrato(cid);
}

// ── Itens do modal ───────────────────────────────────────────────────────────
function fchAddItem() {
  const tipo      = document.getElementById('fch-item-tipo').value;
  const desc      = document.getElementById('fch-item-desc').value.trim();
  const qtd       = parseFloat(document.getElementById('fch-item-qtd').value  || 0);
  const valorUnit = parseFloat((document.getElementById('fch-item-vunit').value || '').replace(',', '.')) || 0;
  if (!tipo || !desc)               { alert2('Preencha tipo e produto', 'error'); return; }
  if (qtd <= 0 || valorUnit <= 0)   { alert2('Informe quantidade e valor unitário', 'error'); return; }
  const val = Math.round(qtd * valorUnit * 100) / 100;
  _fchItens.push({ tipo, descricao: desc, qtd, valorUnit, valor: val });
  document.getElementById('fch-item-desc').value  = '';
  document.getElementById('fch-item-qtd').value   = '';
  document.getElementById('fch-item-vunit').value = '';
  const prevEl = document.getElementById('fch-item-total-prev');
  if (prevEl) prevEl.textContent = '—';
  document.getElementById('fch-item-desc').focus();
  _rFchItens();
}

function _rFchItens() {
  const c     = document.getElementById('fch-itens-list');
  const totEl = document.getElementById('fch-total-preview');
  const tot   = _fchItens.reduce((s, i) => s + i.valor, 0);
  if (totEl) totEl.textContent = _fchItens.length ? fR(tot) : '—';
  if (!c) return;

  if (!_fchItens.length) {
    c.innerHTML = '<div style="font-size:11px;color:var(--text3);padding:12px 14px">Nenhum item adicionado ainda</div>';
    return;
  }

  c.innerHTML =
    `<div style="display:grid;grid-template-columns:120px 1fr 50px 88px 88px 24px;gap:6px;padding:6px 14px;background:var(--bg4);border-bottom:1px solid var(--border)">
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Tipo</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Produto</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Qtd</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Val. unit.</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Total</span>
      <span></span>
    </div>` +
    _fchItens.map((it, idx) => {
      const p = _fchParseItem(it);
      return `<div style="display:grid;grid-template-columns:120px 1fr 50px 88px 88px 24px;gap:6px;align-items:center;padding:6px 14px;border-bottom:1px solid var(--border);font-size:11px">
        <span style="color:${_fchCor(it.tipo)};font-weight:600">${_fchLabel(it.tipo)}</span>
        <span style="color:var(--text2)">${p.produto}</span>
        <span style="font-family:var(--mono);text-align:right;color:var(--text2)">${p.qtd != null ? p.qtd : '—'}</span>
        <span style="font-family:var(--mono);text-align:right;color:var(--text2)">${p.valorUnit != null ? fR(p.valorUnit) : '—'}</span>
        <span style="font-family:var(--mono);font-weight:600;color:#FBBF24;text-align:right">${fR(p.valor)}</span>
        <span style="cursor:pointer;color:var(--red);font-size:16px;text-align:center;line-height:1" onclick="_fchItens.splice(${idx},1);_rFchItens()">×</span>
      </div>`;
    }).join('');
}

// ── Salvar ───────────────────────────────────────────────────────────────────
function salvarFechamento() {
  const id          = document.getElementById('fch-modal-id').value;
  const contratoId  = document.getElementById('fch-modal-contrato').value;
  const clienteNome = document.getElementById('fch-modal-nome').value.trim();
  const dataEvento  = document.getElementById('fch-modal-data').value;
  const vencimento  = document.getElementById('fch-modal-venc').value;
  const obs         = document.getElementById('fch-modal-obs').value.trim();

  const semCobranca = document.getElementById('fch-sem-cobranca')?.checked;
  if (!clienteNome && !contratoId) { alert2('Selecione o contrato ou informe o cliente', 'error'); return; }
  if (!_fchItens.length && !semCobranca) { alert2('Adicione ao menos um item ou marque "Sem acerto adicional"', 'error'); return; }

  const c           = (D.contratos || []).find(x => x.id === contratoId);
  const eventoNome  = c ? (c.nomeEvento || c.nome) : clienteNome;
  const totalExtras = _fchItens.reduce((s, i) => s + i.valor, 0);
  const statusInicial = (semCobranca || totalExtras === 0) ? 'pago' : 'pendente';

  if (!D.fechamentos) D.fechamentos = [];

  if (id) {
    const existing = D.fechamentos.find(f => f.id === id);
    if (existing) {
      existing.contratoId  = contratoId;
      existing.clienteNome = clienteNome || c?.nome || '';
      existing.eventoNome  = eventoNome;
      existing.dataEvento  = dataEvento;
      existing.vencimento  = vencimento;
      existing.itens       = [..._fchItens];
      existing.totalExtras = totalExtras;
      existing.observacoes = obs;
      if (semCobranca || totalExtras === 0) existing.status = 'pago';

      // Sincroniza a parcela no Financeiro — recria se estiver órfã (perdida),
      // para o fechamento não sumir de "Contas a Receber".
      let fin = existing.financeiroId ? (D.financeiro || []).find(f => f.id === existing.financeiroId) : null;
      if (!fin) {
        if (!D.financeiro) D.financeiro = [];
        fin = { id: _gerarId('FIN') + 'FCH', isFechamento: true, status: existing.status };
        D.financeiro.push(fin);
        existing.financeiroId = fin.id;
      }
      fin.contrato   = existing.clienteNome;
      fin.contratoId = contratoId;
      fin.evento     = eventoNome;
      fin.data       = dataEvento;
      fin.tipo       = c?.tipo || fin.tipo || '—';
      fin.convidados = c?.convidados || fin.convidados || '—';
      fin.descricao  = fin.descricao || 'Fechamento — acerto pós-evento';
      fin.vencimento = vencimento;
      // Se já foi pago (valorNum reflete o que o cliente realmente pagou),
      // editar os itens do fechamento NÃO pode sobrescrever esse valor —
      // senão o pagamento registrado (com comprovante, data, forma) fica
      // corrompido pelo novo total de itens. Deixa como está e quem cuida de
      // uma eventual diferença é o alerta de divergência (Contas a Receber),
      // com aprovação do admin. Só atualiza o valor livremente se ainda não
      // foi pago (a parcela pendente deve sempre refletir o total atual).
      if (fin.status !== 'pago') {
        fin.valorNum = totalExtras;
        fin.valor    = 'R$ ' + totalExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        if (semCobranca || totalExtras === 0) fin.status = 'pago';
      }
      sv('financeiro');
    }
  } else {
    const newId = 'FCH' + Date.now();
    const finId = 'FIN' + Date.now() + 'FCH';
    D.fechamentos.push({
      id:           newId,
      contratoId,
      clienteNome:  clienteNome || c?.nome || '',
      eventoNome,
      dataEvento,
      vencimento,
      itens:        [..._fchItens],
      totalExtras,
      status:       statusInicial,
      observacoes:  obs,
      financeiroId: finId,
    });
    if (!D.financeiro) D.financeiro = [];
    D.financeiro.push({
      id:           finId,
      contrato:     clienteNome || c?.nome || '',
      contratoId,
      data:         dataEvento,
      evento:       eventoNome,
      tipo:         c?.tipo || '—',
      convidados:   c?.convidados || '—',
      descricao:    'Fechamento — acerto pós-evento',
      valor:        'R$ ' + totalExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      valorNum:     totalExtras,
      vencimento,
      status:       statusInicial,
      isFechamento: true,
    });
    sv('financeiro');
  }

  sv('fechamentos');
  closeM('mfechamento');
  rFechamentos();
  rFestaFechamentos();
  rFestaPendentes();
  alert2('Fechamento salvo com sucesso!');
}

// ── Editar ───────────────────────────────────────────────────────────────────
function editarFechamento(id) {
  const f = (D.fechamentos || []).find(x => x.id === id);
  if (!f) return;
  _fchItens = (f.itens || []).map(i => ({ ...i }));
  const semEl = document.getElementById('fch-sem-cobranca');
  if (semEl) { semEl.checked = false; fchToggleSemCobranca(); }

  const sel = document.getElementById('fch-modal-contrato');
  sel.innerHTML = '<option value="">Selecionar contrato...</option>' +
    (D.contratos || [])
      .slice().sort((a, b) => (b.data || '').localeCompare(a.data || ''))
      .map(c => `<option value="${c.id}"${c.id === f.contratoId ? ' selected' : ''}>${c.nome || '—'} — ${fd(c.data) || '—'}</option>`)
      .join('');

  document.getElementById('fch-modal-id').value   = f.id;
  document.getElementById('fch-modal-nome').value  = f.clienteNome || '';
  document.getElementById('fch-modal-data').value  = f.dataEvento  || '';
  document.getElementById('fch-modal-venc').value  = f.vencimento  || '';
  document.getElementById('fch-modal-obs').value   = f.observacoes || '';
  _rFchItens();
  openM('mfechamento');
}

// ── Excluir ──────────────────────────────────────────────────────────────────
function excluirFechamento(id) {
  if (!confirm('Excluir este fechamento?\nOs itens extras e a parcela no financeiro serão removidos.\nO evento permanece como "Pendente fechamento".')) return;

  let removeu = false;

  // Tenta remover de D.fechamentos (fluxo normal)
  const f = (D.fechamentos || []).find(x => x.id === id);
  if (f) {
    if (f.financeiroId) {
      D.financeiro = (D.financeiro || []).filter(x => x.id !== f.financeiroId);
    }
    D.fechamentos = D.fechamentos.filter(x => x.id !== id);
    sv('fechamentos');
    sv('financeiro');
    removeu = true;
  }

  // Fallback: entrada pode estar só em D.financeiro (isFechamento: true)
  const fin = (D.financeiro || []).find(x => x.id === id && x.isFechamento);
  if (fin) {
    D.financeiro = D.financeiro.filter(x => x.id !== id);
    sv('financeiro');
    removeu = true;
  }

  // Remove também qualquer entrada financeiro com isFechamento ligada ao mesmo contratoId
  if (f && f.contratoId && !fin) {
    const finVinc = (D.financeiro || []).find(x => x.contratoId === f.contratoId && x.isFechamento);
    if (finVinc) {
      D.financeiro = D.financeiro.filter(x => x.id !== finVinc.id);
      sv('financeiro');
    }
  }

  if (!removeu) { alert2('Fechamento não encontrado. Pode ter sido removido já.', 'error'); return; }

  alert2('Fechamento excluído com sucesso!', 'success');
  rFechamentos();
  rFestaFechamentos();
  rFestaPendentes();
}

// ── Importar dados da festa para o fechamento ─────────────────────────────────
function importarFechamento(contratoId) {
  const c = (D.contratos || []).find(x => x.id === contratoId);
  if (!c) return;

  _fchItens = [];

  // Produtos consumidos da festa vinculada pela data
  const festa = (D.festas || []).find(f => f.data === c.data);
  if (festa) {
    (festa.itens || []).forEach(it => {
      const v = parseFloat(it.valor) || 0;
      if (v > 0) _fchItens.push({ tipo: 'adicional', descricao: it.prod || 'Produto', valor: v });
    });
    if (festa.valor_total_evento && !_fchItens.length) {
      _fchItens.push({ tipo: 'adicional', descricao: 'Total evento', valor: festa.valor_total_evento });
    }
  }

  // Quebras vinculadas pela data
  (D.quebras || [])
    .filter(q => q.data === c.data && q.obs)
    .forEach(q => {
      const v = parseFloat(q.qtd || 0) * parseFloat(q.custo || 0);
      if (v > 0) _fchItens.push({ tipo: 'quebra', descricao: q.prod || 'Quebra', valor: v });
    });

  if (!_fchItens.length) {
    alert2('Nenhum dado de produtos/quebras encontrado para esta data. Preencha manualmente.', 'warning');
  }

  // Pré-preenche o modal
  document.getElementById('fch-modal-id').value  = '';
  document.getElementById('fch-modal-obs').value  = '';
  const sel = document.getElementById('fch-modal-contrato');
  sel.innerHTML = '<option value="">Selecionar contrato...</option>' +
    (D.contratos || [])
      .slice().sort((a, b) => (b.data || '').localeCompare(a.data || ''))
      .map(ct => `<option value="${ct.id}"${ct.id === contratoId ? ' selected' : ''}>${ct.nome || '—'} — ${fd(ct.data) || '—'}</option>`)
      .join('');
  document.getElementById('fch-modal-nome').value = c.nome || '';
  document.getElementById('fch-modal-data').value = c.data || '';
  if (c.data) {
    const d = new Date(c.data + 'T12:00:00');
    d.setDate(d.getDate() + 3);
    document.getElementById('fch-modal-venc').value = d.toISOString().slice(0, 10);
  }
  _rFchItens();
  openM('mfechamento');
}

// ── Status ───────────────────────────────────────────────────────────────────
function marcarFechamentoPago(id) {
  const f = (D.fechamentos || []).find(x => x.id === id);
  if (!f) return;
  f.status = 'pago';
  _fchSincFinanceiro(f, 'pago');
  sv('fechamentos');
  rFechamentos();
  rFestaFechamentos();
}

function marcarFechamentoPendente(id) {
  const f = (D.fechamentos || []).find(x => x.id === id);
  if (!f) return;
  f.status = 'pendente';
  _fchSincFinanceiro(f, 'pendente');
  sv('fechamentos');
  rFechamentos();
  rFestaFechamentos();
}

function _fchSincFinanceiro(f, status) {
  if (!f.financeiroId) return;
  const fin = (D.financeiro || []).find(x => x.id === f.financeiroId);
  if (fin) { fin.status = status; sv('financeiro'); }
}

// ── Aba Fechamento — fonte primária: contratos concluídos ────────────────────
function rFestaFechamentos() {
  const fchAll  = D.fechamentos || [];
  const _PROD   = ['produto', 'bebida_extra'];
  const _PECA   = ['peca', 'quebra'];

  let totProd = 0, totQbr = 0, totExt = 0, totGeral = 0, totPago = 0, totPend = 0;
  fchAll.forEach(f => {
    const itens = f.itens || [];
    const vProd = itens.filter(it => _PROD.includes(it.tipo || '')).reduce((s, it) => s + (it.valor || 0), 0);
    const vQbr  = itens.filter(it => _PECA.includes(it.tipo || '')).reduce((s, it) => s + (it.valor || 0), 0);
    const vExt  = itens.filter(it => !_PROD.includes(it.tipo || '') && !_PECA.includes(it.tipo || '')).reduce((s, it) => s + (it.valor || 0), 0);
    totProd  += vProd;
    totQbr   += vQbr;
    totExt   += vExt;
    totGeral += f.totalExtras || 0;
    if (f.status === 'pago')     totPago += f.totalExtras || 0;
    else                         totPend += f.totalExtras || 0;
  });

  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setEl('fch-tab-count',    fchAll.length.toString());
  setEl('fch-tab-tot-prod', fR(totProd));
  setEl('fch-tab-tot-qbr',  fR(totQbr));
  setEl('fch-tab-tot-ext',  fR(totExt));
  setEl('fch-tab-tot',      fR(totGeral));
  setEl('fch-tab-pago',     fR(totPago));
  setEl('fch-tab-pend',     fR(totPend));

  const tbody = document.getElementById('fch-tab-body');
  if (!tbody) return;

  const filtro = document.getElementById('fch-tab-filtro')?.value || 'todos';
  const busca  = (document.getElementById('fch-tab-busca')?.value || '').toLowerCase();
  const norm   = s => (s || '').toLowerCase().trim();
  const qbrMap = typeof _qbrPorEvento === 'function' ? _qbrPorEvento() : {};
  const festas = typeof _allFestas    === 'function' ? _allFestas()   : (D.festas || []);

  // Índice de festas por data para cruzar com contratos
  const festasPorData = {};
  festas.forEach(f => { festasPorData[f.data] = f; });

  // Índice de fechamentos: por contratoId e por nome+data (fallback)
  const fchPorContrato = {};
  const fchPorChave    = {};
  fchAll.forEach(f => {
    if (f.contratoId) fchPorContrato[f.contratoId] = f;
    const chave = norm(f.eventoNome) + '|' + (f.dataEvento || '');
    fchPorChave[chave] = f;
  });

  // Fonte primária: todos os contratos concluídos
  const concluidos = (D.contratos || []).filter(c => c.status === 'concluido');

  const hoje = new Date().toISOString().slice(0, 10);

  let rows = concluidos.map(c => {
    const fch = fchPorContrato[c.id] || fchPorChave[norm(c.nome) + '|' + (c.data || '')] || null;
    const itens = fch ? (fch.itens || []) : [];
    const valProd    = itens.filter(it => _PROD.includes(it.tipo || '')).reduce((s, it) => s + (it.valor || 0), 0);
    const valQbr     = itens.filter(it => _PECA.includes(it.tipo || '')).reduce((s, it) => s + (it.valor || 0), 0);
    const valExtras  = itens.filter(it => !_PROD.includes(it.tipo || '') && !_PECA.includes(it.tipo || '')).reduce((s, it) => s + (it.valor || 0), 0);
    return { c, fch, valProd, valQbr, valExtras };
  });

  // Esta aba mostra APENAS contratos com fechamento lançado.
  // Contratos sem fechamento ficam na aba "📋 Sem fechamento".
  rows = rows.filter(r => r.fch);
  if (filtro === 'pendente') rows = rows.filter(r => r.fch.status === 'pendente');
  else if (filtro === 'pago') rows = rows.filter(r => r.fch.status === 'pago');
  if (busca) rows = rows.filter(r =>
    norm(r.c.nome).includes(busca) ||
    norm(r.c.nomeEvento || '').includes(busca)
  );

  // Ordena por data mais recente
  rows.sort((a, b) => (b.c.data || '').localeCompare(a.c.data || ''));

  tbody.innerHTML = '';

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">Nenhum fechamento lançado. Use a aba "📋 Sem fechamento" para lançar o acerto dos eventos.</td></tr>';
    return;
  }

  rows.forEach(({ c, fch, valProd, valQbr, valExtras, festaId }) => {
    const uid = 'fcht-' + c.id;

    // Status tag
    let statusTag;
    if (!fch) {
      statusTag = '<span class="tag" style="background:#1A1E2E;color:#8B91A8">Pendente fechamento</span>';
    } else if (!fch.totalExtras) {
      statusTag = '<span class="tag tag-green">Sem cobrança</span>';
    } else if (fch.status === 'pago') {
      statusTag = '<span class="tag tag-green">Pago</span>';
    } else {
      const atrasado = fch.vencimento && fch.vencimento < hoje;
      statusTag = atrasado
        ? '<span class="tag tag-red">Atrasado</span>'
        : '<span class="tag tag-yellow">Pendente</span>';
    }

    // Ações
    let acoes;
    if (!fch) {
      acoes = `<button class="btn-sm" onclick="event.stopPropagation();novoFechamento('${c.id}')" style="border-color:#1A2A3D;color:#60A5FA">+ Fechamento</button>`;
    } else {
      const btnPag = fch.status === 'pendente'
        ? `<button class="btn-sm btn-green" onclick="event.stopPropagation();marcarFechamentoPago('${fch.id}')">Recebido</button>`
        : `<button class="btn-sm" onclick="event.stopPropagation();marcarFechamentoPendente('${fch.id}')">Desfazer</button>`;
      acoes = btnPag + ` <button class="btn-sm" onclick="event.stopPropagation();editarFechamento('${fch.id}')">✏️</button> <button class="btn-sm btn-red" onclick="event.stopPropagation();excluirFechamento('${fch.id}')">✕</button>`;
    }

    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.onclick = () => _toggleFchTab(uid);
    tr.innerHTML = `
      <td style="width:24px;font-size:12px;color:var(--text3);text-align:center;user-select:none" id="${uid}-arrow">${fch ? '▶' : '—'}</td>
      <td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(c.data) || '—'}</td>
      <td>
        <strong>${c.nomeEvento || c.nome}</strong>
        <div style="font-size:10px;color:var(--text3)">${c.tipo || ''} · ${c.convidados || '—'} convidados · ${c.local || ''}</div>
      </td>
      <td style="font-family:var(--mono);font-size:11px;color:${valProd ? 'var(--green)' : 'var(--text3)'}">${valProd ? fR(valProd) : '—'}</td>
      <td style="font-family:var(--mono);font-size:11px;color:${valQbr ? 'var(--red)' : 'var(--text3)'}">${valQbr ? fR(valQbr) : '—'}</td>
      <td style="font-family:var(--mono);font-size:11px;font-weight:${valExtras ? 700 : 400};color:${valExtras ? '#FBBF24' : 'var(--text3)'}">
        ${valExtras ? fR(valExtras) : '—'}
      </td>
      <td style="font-family:var(--mono);font-size:12px;font-weight:700;color:${fch&&fch.totalExtras?'var(--text)':'var(--text3)'}">
        ${fch && fch.totalExtras ? fR(fch.totalExtras) : '—'}
      </td>
      <td>${statusTag}</td>
      <td onclick="event.stopPropagation()">${acoes}</td>`;
    tbody.appendChild(tr);

    if (fch) {
      const trDetail = document.createElement('tr');
      trDetail.id = uid + '-detail';
      trDetail.style.display = 'none';
      trDetail.innerHTML = `<td colspan="9" style="padding:0;border-bottom:2px solid var(--border2)">
        <div style="background:var(--bg3)">
          ${_fchDetalheGrid(fch.itens)}
          ${fch.vencimento ? `<div style="padding:6px 14px;font-size:11px;color:var(--text3)">Vencimento: <strong>${fd(fch.vencimento)}</strong></div>` : ''}
          ${fch.observacoes ? `<div style="padding:6px 14px;font-size:11px;color:var(--text3)">📝 ${fch.observacoes}</div>` : ''}
        </div>
      </td>`;
      tbody.appendChild(trDetail);
    }
  });
}

function _toggleFchTab(uid) {
  const detail = document.getElementById(uid + '-detail');
  const arrow  = document.getElementById(uid + '-arrow');
  if (!detail) return;
  const open = detail.style.display === 'none' || !detail.style.display;
  detail.style.display = open ? 'table-row' : 'none';
  if (arrow) arrow.textContent = open ? '▼' : '▶';
}

// ── Atalho a partir da tela de Festas ────────────────────────────────────────
function abrirFechamentoDeFesta(festaId) {
  const all  = typeof _allFestas === 'function' ? _allFestas() : (D.festas || []);
  const f    = all.find(x => x.id === festaId);
  if (!f) return;
  const norm = s => (s || '').toLowerCase().trim();
  const c    = (D.contratos || []).find(ct =>
    ct.data === f.data ||
    norm(ct.nome).slice(0, 10) === norm(f.nome).slice(0, 10)
  );
  novoFechamento(c?.id || '', f);
}
