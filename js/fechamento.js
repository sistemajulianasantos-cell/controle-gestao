// ─── FECHAMENTO DE EVENTO ─────────────────────────────────────────────────────

if (!D.fechamentos) D.fechamentos = [];

const TIPOS_FCH = [
  { id: 'bebida_extra', label: 'Bebida extra',     cor: 'var(--blue)'  },
  { id: 'quebra',       label: 'Quebra / Dano',    cor: 'var(--red)'   },
  { id: 'hora_extra',   label: 'Hora extra',       cor: '#FBBF24'      },
  { id: 'adicional',    label: 'Serv. adicional',  cor: 'var(--text2)' },
];

let _fchItens = [];

function _fchLabel(id) { return (TIPOS_FCH.find(t => t.id === id) || {}).label || id; }
function _fchCor(id)   { return (TIPOS_FCH.find(t => t.id === id) || {}).cor   || 'var(--text)'; }

// ── Tela principal ───────────────────────────────────────────────────────────
function rFechamentos() {
  const all      = D.fechamentos || [];
  const pendentes = all.filter(f => f.status === 'pendente');
  const pagos     = all.filter(f => f.status === 'pago');
  const totPend   = pendentes.reduce((s, f) => s + (f.totalExtras || 0), 0);
  const totPago   = pagos.reduce((s, f) => s + (f.totalExtras || 0), 0);

  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setEl('fch-tot-count', all.length.toString());
  setEl('fch-tot-pend',  fR(totPend));
  setEl('fch-tot-pago',  fR(totPago));

  const tbody = document.getElementById('fch-body');
  if (!tbody) return;

  const filtro = document.getElementById('fch-filtro')?.value || 'todos';
  const busca  = (document.getElementById('fch-busca')?.value || '').toLowerCase();

  const lista = all
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
    const statusTag = f.status === 'pago'
      ? '<span class="tag tag-green">Pago</span>'
      : atrasado
        ? '<span class="tag tag-red">Atrasado</span>'
        : '<span class="tag tag-yellow">Pendente</span>';

    const uid = 'fch-' + f.id;

    const detailRows = (f.itens || []).map(it =>
      `<div style="display:grid;grid-template-columns:140px 1fr 110px;gap:8px;padding:6px 14px;border-bottom:1px solid var(--border);font-size:11px;align-items:center">
        <span style="color:${_fchCor(it.tipo)};font-weight:600">${_fchLabel(it.tipo)}</span>
        <span style="color:var(--text2)">${it.descricao || '—'}</span>
        <span style="font-family:var(--mono);font-weight:600;color:#FBBF24;text-align:right">${fR(it.valor)}</span>
      </div>`
    ).join('') || '<div style="padding:10px 14px;font-size:11px;color:var(--text3)">Nenhum item lançado</div>';

    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.onclick = () => _toggleFch(uid);
    tr.innerHTML = `
      <td style="width:24px;font-size:12px;color:var(--text3);text-align:center;user-select:none" id="${uid}-arrow">▶</td>
      <td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(f.dataEvento) || '—'}</td>
      <td><strong>${f.eventoNome || '—'}</strong><div style="font-size:10px;font-weight:400;color:var(--text3)">${f.clienteNome || ''}</div></td>
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
        <div style="display:grid;grid-template-columns:140px 1fr 110px;gap:8px;padding:6px 14px;background:var(--bg4);border-bottom:1px solid var(--border)">
          <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Tipo</span>
          <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Descrição</span>
          <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Valor</span>
        </div>
        ${detailRows}
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
function novoFechamento(contratoId, festaRef) {
  _fchItens = [];
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
  const tipo = document.getElementById('fch-item-tipo').value;
  const desc = document.getElementById('fch-item-desc').value.trim();
  const val  = parseFloat(document.getElementById('fch-item-val').value.replace(',', '.'));
  if (!tipo || !desc || !val || val <= 0) { alert2('Preencha tipo, descrição e valor', 'error'); return; }
  _fchItens.push({ tipo, descricao: desc, valor: val });
  document.getElementById('fch-item-desc').value = '';
  document.getElementById('fch-item-val').value  = '';
  document.getElementById('fch-item-desc').focus();
  _rFchItens();
}

function _rFchItens() {
  const c      = document.getElementById('fch-itens-list');
  const totEl  = document.getElementById('fch-total-preview');
  const tot    = _fchItens.reduce((s, i) => s + i.valor, 0);
  if (totEl) totEl.textContent = _fchItens.length ? fR(tot) : '—';
  if (!c) return;

  if (!_fchItens.length) {
    c.innerHTML = '<div style="font-size:11px;color:var(--text3);padding:12px 14px">Nenhum item adicionado ainda</div>';
    return;
  }

  c.innerHTML =
    `<div style="display:grid;grid-template-columns:130px 1fr 100px 28px;gap:8px;padding:6px 14px;background:var(--bg4);border-bottom:1px solid var(--border)">
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Tipo</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Descrição</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Valor</span>
      <span></span>
    </div>` +
    _fchItens.map((it, idx) => `
      <div style="display:grid;grid-template-columns:130px 1fr 100px 28px;gap:8px;align-items:center;padding:6px 14px;border-bottom:1px solid var(--border);font-size:11px">
        <span style="color:${_fchCor(it.tipo)};font-weight:600">${_fchLabel(it.tipo)}</span>
        <span style="color:var(--text2)">${it.descricao}</span>
        <span style="font-family:var(--mono);font-weight:600;color:#FBBF24;text-align:right">${fR(it.valor)}</span>
        <span style="cursor:pointer;color:var(--red);font-size:16px;text-align:center;line-height:1" onclick="_fchItens.splice(${idx},1);_rFchItens()">×</span>
      </div>`).join('');
}

// ── Salvar ───────────────────────────────────────────────────────────────────
function salvarFechamento() {
  const id          = document.getElementById('fch-modal-id').value;
  const contratoId  = document.getElementById('fch-modal-contrato').value;
  const clienteNome = document.getElementById('fch-modal-nome').value.trim();
  const dataEvento  = document.getElementById('fch-modal-data').value;
  const vencimento  = document.getElementById('fch-modal-venc').value;
  const obs         = document.getElementById('fch-modal-obs').value.trim();

  if (!clienteNome && !contratoId) { alert2('Selecione o contrato ou informe o cliente', 'error'); return; }
  if (!_fchItens.length)           { alert2('Adicione ao menos um item', 'error'); return; }

  const c           = (D.contratos || []).find(x => x.id === contratoId);
  const eventoNome  = c ? (c.nomeEvento || c.nome) : clienteNome;
  const totalExtras = _fchItens.reduce((s, i) => s + i.valor, 0);

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
      if (existing.financeiroId) {
        const fin = (D.financeiro || []).find(f => f.id === existing.financeiroId);
        if (fin) {
          fin.valorNum   = totalExtras;
          fin.valor      = 'R$ ' + totalExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          fin.vencimento = vencimento;
          sv('financeiro');
        }
      }
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
      status:       'pendente',
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
      status:       'pendente',
      isFechamento: true,
    });
    sv('financeiro');
  }

  sv('fechamentos');
  closeM('mfechamento');
  rFechamentos();
  rFestaFechamentos();
  alert2('Fechamento salvo com sucesso!');
}

// ── Editar ───────────────────────────────────────────────────────────────────
function editarFechamento(id) {
  const f = (D.fechamentos || []).find(x => x.id === id);
  if (!f) return;
  _fchItens = (f.itens || []).map(i => ({ ...i }));

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
  if (!confirm('Excluir este fechamento? A parcela correspondente no financeiro também será removida.')) return;
  const f = (D.fechamentos || []).find(x => x.id === id);
  if (f?.financeiroId) {
    D.financeiro = (D.financeiro || []).filter(x => x.id !== f.financeiroId);
    sv('financeiro');
  }
  D.fechamentos = (D.fechamentos || []).filter(x => x.id !== id);
  sv('fechamentos');
  rFechamentos();
  rFestaFechamentos();
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

// ── Aba Fechamento dentro da tela de Festas ──────────────────────────────────
function rFestaFechamentos() {
  const all      = D.fechamentos || [];
  const pendentes = all.filter(f => f.status === 'pendente');
  const pagos     = all.filter(f => f.status === 'pago');
  const totPend   = pendentes.reduce((s, f) => s + (f.totalExtras || 0), 0);
  const totPago   = pagos.reduce((s, f) => s + (f.totalExtras || 0), 0);

  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setEl('fch-tab-count', all.length.toString());
  setEl('fch-tab-pend',  fR(totPend));
  setEl('fch-tab-pago',  fR(totPago));

  const tbody  = document.getElementById('fch-tab-body');
  if (!tbody) return;

  const filtro  = document.getElementById('fch-tab-filtro')?.value || 'todos';
  const busca   = (document.getElementById('fch-tab-busca')?.value || '').toLowerCase();
  const qbrMap  = typeof _qbrPorEvento === 'function' ? _qbrPorEvento() : {};
  const festas  = typeof _allFestas    === 'function' ? _allFestas()   : (D.festas || []);

  // Monta índice de fechamentos por evento (nome+data)
  const norm  = s => (s || '').toLowerCase().trim();
  const fchPorEvento = {};
  all.forEach(f => {
    const chave = norm(f.eventoNome) + '|' + (f.dataEvento || '');
    fchPorEvento[chave] = f;
  });

  // Índice de contratos por nome/data para cruzamento
  const contratoPorEvento = {};
  (D.contratos || []).forEach(c => {
    const chave = norm(c.nome) + '|' + (c.data || '');
    contratoPorEvento[chave] = c;
    if (c.nomeEvento) {
      const chave2 = norm(c.nomeEvento) + '|' + (c.data || '');
      contratoPorEvento[chave2] = c;
    }
  });

  const hoje = new Date().toISOString().slice(0, 10);

  // Filtra e ordena festas
  let rows = festas.map(f => {
    const chave    = norm(f.nome) + '|' + (f.data || '');
    const fch      = fchPorEvento[chave] || null;
    const contrato = contratoPorEvento[chave] || null;
    const qbr      = qbrMap[f.nome] || null;
    const valProd  = f.valor_total_evento || f.itens.reduce((a, i) => a + Number(i.valor || 0), 0);
    const valQbr   = qbr ? qbr.total : 0;
    return { f, fch, contrato, valProd, valQbr };
  });

  // Aplica filtros
  if (filtro === 'sem')      rows = rows.filter(r => !r.fch);
  else if (filtro !== 'todos') rows = rows.filter(r => r.fch && r.fch.status === filtro);
  if (busca) rows = rows.filter(r =>
    norm(r.f.nome).includes(busca) ||
    norm(r.contrato?.nome || '').includes(busca)
  );

  tbody.innerHTML = '';

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">Nenhum evento encontrado</td></tr>';
    return;
  }

  rows.forEach(({ f, fch, contrato, valProd, valQbr }) => {
    const uid = 'fcht-' + f.id;

    // Status tag
    let statusTag;
    if (!fch) {
      statusTag = '<span class="tag" style="background:#1A1E2E;color:#8B91A8">Sem fechamento</span>';
    } else if (fch.status === 'pago') {
      statusTag = '<span class="tag tag-green">Pago</span>';
    } else {
      const atrasado = fch.vencimento && fch.vencimento < hoje;
      statusTag = atrasado
        ? '<span class="tag tag-red">Atrasado</span>'
        : '<span class="tag tag-yellow">Pendente</span>';
    }

    // Botão de ação
    let acoes;
    if (!fch) {
      acoes = `<button class="btn-sm btn-primary" onclick="event.stopPropagation();abrirFechamentoDeFesta('${f.id}')" style="border-color:#1A2A3D;color:#60A5FA">+ Fechamento</button>`;
    } else {
      const btnStatus = fch.status === 'pendente'
        ? `<button class="btn-sm btn-green" onclick="event.stopPropagation();marcarFechamentoPago('${fch.id}')">Recebido</button>`
        : `<button class="btn-sm" onclick="event.stopPropagation();marcarFechamentoPendente('${fch.id}')">Desfazer</button>`;
      acoes = btnStatus + ` <button class="btn-sm" onclick="event.stopPropagation();editarFechamento('${fch.id}')">✏️</button>`;
    }

    // Linha principal
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.onclick = () => _toggleFchTab(uid);
    tr.innerHTML = `
      <td style="width:24px;font-size:12px;color:var(--text3);text-align:center;user-select:none" id="${uid}-arrow">${fch ? '▶' : '—'}</td>
      <td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(f.data) || '—'}</td>
      <td>
        <strong>${f.nome}</strong>
        ${contrato ? `<div style="font-size:10px;color:var(--text3)">${contrato.tipo || ''} · ${contrato.convidados || '—'} convidados</div>` : (f.local ? `<div style="font-size:10px;color:var(--text3)">${f.local}</div>` : '')}
      </td>
      <td style="font-family:var(--mono);font-size:11px;color:${valProd ? 'var(--green)' : 'var(--text3)'}">
        ${valProd ? fR(valProd) : '—'}
      </td>
      <td style="font-family:var(--mono);font-size:11px;color:${valQbr ? 'var(--red)' : 'var(--text3)'}">
        ${valQbr ? fR(valQbr) : '—'}
      </td>
      <td style="font-family:var(--mono);font-size:11px;font-weight:${fch ? 700 : 400};color:${fch ? '#FBBF24' : 'var(--text3)'}">
        ${fch ? fR(fch.totalExtras) : '—'}
      </td>
      <td>${statusTag}</td>
      <td onclick="event.stopPropagation()">${acoes}</td>`;
    tbody.appendChild(tr);

    // Linha de detalhes do fechamento (colapsável)
    if (fch) {
      const detailRows = (fch.itens || []).map(it =>
        `<div style="display:grid;grid-template-columns:140px 1fr 110px;gap:8px;padding:6px 14px;border-bottom:1px solid var(--border);font-size:11px">
          <span style="color:${_fchCor(it.tipo)};font-weight:600">${_fchLabel(it.tipo)}</span>
          <span style="color:var(--text2)">${it.descricao || '—'}</span>
          <span style="font-family:var(--mono);font-weight:600;color:#FBBF24;text-align:right">${fR(it.valor)}</span>
        </div>`
      ).join('') || '<div style="padding:10px 14px;font-size:11px;color:var(--text3)">Nenhum item</div>';

      const trDetail = document.createElement('tr');
      trDetail.id = uid + '-detail';
      trDetail.style.display = 'none';
      trDetail.innerHTML = `<td colspan="8" style="padding:0;border-bottom:2px solid var(--border2)">
        <div style="background:var(--bg3)">
          <div style="display:grid;grid-template-columns:140px 1fr 110px;gap:8px;padding:6px 14px;background:var(--bg4);border-bottom:1px solid var(--border)">
            <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Tipo</span>
            <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Descrição</span>
            <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Valor</span>
          </div>
          ${detailRows}
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
