// ─── FINANCEIRO ────────────────────────────────────────
// ═══════════════════════════════════════════════════════

function registrarParcelasFinanceiro(info) {
  if (!D.financeiro) D.financeiro = [];
  const id = 'FIN' + Date.now();
  // Parcela 1: 20% na assinatura (hoje)
  D.financeiro.push({
    id: id + 'A', contrato: info.nome, data: info.data, evento: info.nome,
    descricao: '20% — Assinatura do contrato',
    valor: 'R$ ' + info.parc1,
    valorNum: info.valorNum * 0.2,
    vencimento: new Date().toISOString().slice(0,10),
    status: 'pendente'
  });
  // Parcela 2: 80% 7 dias antes do evento
  const dtEvento = info.data ? new Date(info.data + 'T12:00:00') : null;
  let venc2 = '';
  if (dtEvento) {
    dtEvento.setDate(dtEvento.getDate() - 7);
    venc2 = dtEvento.toISOString().slice(0,10);
  }
  D.financeiro.push({
    id: id + 'B', contrato: info.nome, data: info.data, evento: info.nome,
    descricao: '80% — 7 dias antes do evento',
    valor: 'R$ ' + info.parc2,
    valorNum: info.valorNum * 0.8,
    vencimento: venc2,
    status: 'pendente'
  });
  sv('financeiro');
}

function rKpiFaturamento() {
  // Apenas admin vê os KPIs
  const kpiBox = document.getElementById('kpi-box');
  if (kpiBox) kpiBox.style.display = perfilAtual === 'admin' ? '' : 'none';
  if (perfilAtual !== 'admin') return;

  const mes = document.getElementById('kpi-mes')?.value || '';
  const ano = document.getElementById('kpi-ano')?.value || new Date().getFullYear().toString();

  // Filtra contratos pelo mês/ano da data do evento
  const contratos = (D.contratos||[]).filter(c => {
    if (!c.data) return false;
    if (ano && !c.data.startsWith(ano)) return false;
    if (mes && !c.data.startsWith(`${ano}-${mes}`)) return false;
    return true;
  });

  // Faturamento fechado = soma dos valores dos contratos filtrados
  const faturamento = contratos.reduce((s,c) => {
    const v = parseFloat((c.opcao||'0').toString().replace(/[^\d,]/g,'').replace(',','.')) || 0;
    return s + v;
  }, 0);

  // Recebido e a receber = parcelas do financeiro ligadas a esses contratos
  const eventosIds = new Set(contratos.map(c => c.nome + c.data));
  const parcelas = (D.financeiro||[]).filter(f => {
    // Filtra parcelas pelo mês/ano de vencimento OU pela data do evento
    if (ano && mes) {
      return (f.vencimento && f.vencimento.startsWith(`${ano}-${mes}`))
          || (f.data && f.data.startsWith(`${ano}-${mes}`));
    }
    if (ano) {
      return (f.vencimento && f.vencimento.startsWith(ano))
          || (f.data && f.data.startsWith(ano));
    }
    return true;
  });

  const recebido  = parcelas.filter(f=>f.status==='pago').reduce((s,f)=>s+(f.valorNum||0),0);
  const aReceber  = parcelas.filter(f=>f.status!=='pago').reduce((s,f)=>s+(f.valorNum||0),0);
  const totalConv = contratos.reduce((s,c)=>s+(parseInt(c.convidados)||0),0);
  const ticket    = contratos.length ? faturamento / contratos.length : 0;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('kpi-fechado',    fR(faturamento));
  set('kpi-recebido',   fR(recebido));
  set('kpi-a-receber',  fR(aReceber));
  set('kpi-eventos',    contratos.length.toString());
  set('kpi-convidados', totalConv.toLocaleString('pt-BR'));
  set('kpi-ticket',     ticket ? fR(ticket) : '—');
}

// ── Troca de aba ─────────────────────────────────────────────────────────────
function finSetView(v) {
  document.getElementById('fin-view-sint').style.display = v === 'sintetico' ? '' : 'none';
  document.getElementById('fin-view-anal').style.display = v === 'analitico' ? '' : 'none';
  document.getElementById('fin-tab-sint').classList.toggle('active', v === 'sintetico');
  document.getElementById('fin-tab-anal').classList.toggle('active', v === 'analitico');
  if (v === 'sintetico') rFinanceiroSintetico();
  if (v === 'analitico') rFinanceiro();
}

// ── KPIs globais ─────────────────────────────────────────────────────────────
function _finAtualizarKpis() {
  const fin   = D.financeiro || [];
  const hoje  = new Date().toISOString().slice(0, 10);
  const pagos = fin.filter(f => f.status === 'pago');
  const pend  = fin.filter(f => f.status === 'pendente');
  const atras = pend.filter(f => f.vencimento && f.vencimento < hoje);
  const totPago  = pagos.reduce((a, f) => a + (f.valorNum || 0), 0);
  const totPend  = pend.reduce((a, f) => a + (f.valorNum || 0), 0);
  const totAtras = atras.reduce((a, f) => a + (f.valorNum || 0), 0);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('fin-total-geral',    fR(totPago + totPend));
  set('fin-total-pend',     fR(totPend));
  set('fin-total-pago',     fR(totPago));
  set('fin-total-atrasado', fR(totAtras));
}

// ── Sincronização Fechamentos → Financeiro ────────────────────────────────────
// Todo fechamento em D.fechamentos precisa de uma parcela espelhada em
// D.financeiro (isFechamento:true) para aparecer em "Contas a Receber". Se essa
// parcela se perder (ex: contrato recriado com novo id, limpeza de órfãos etc.),
// o fechamento continua visível na aba "Fechamentos" mas some do Financeiro.
// Esta função recria a parcela que estiver faltando, sem duplicar as existentes.
function _finRepararFechamentosOrfaos() {
  const fechamentos = D.fechamentos || [];
  if (!fechamentos.length) return false;
  if (!D.financeiro) D.financeiro = [];

  const norm = s => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
  let mudou = false;

  fechamentos.forEach(f => {
    const jaExiste = f.financeiroId && D.financeiro.some(x => x.id === f.financeiroId);
    if (jaExiste) return;

    // Evita duplicar caso já exista uma parcela isFechamento equivalente sem financeiroId salvo nela
    let fin = D.financeiro.find(x => x.isFechamento && (
      (f.contratoId && x.contratoId === f.contratoId) ||
      (norm(x.evento || x.contrato) === norm(f.eventoNome) && x.data === f.dataEvento)
    ));

    if (!fin) {
      fin = {
        id:           _gerarId('FIN') + 'FCH',
        contrato:     f.clienteNome || '',
        contratoId:   f.contratoId || '',
        data:         f.dataEvento || '',
        evento:       f.eventoNome || f.clienteNome || '—',
        descricao:    'Fechamento — acerto pós-evento',
        valor:        'R$ ' + (f.totalExtras || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        valorNum:     f.totalExtras || 0,
        vencimento:   f.vencimento || '',
        status:       f.status || 'pendente',
        isFechamento: true,
      };
      D.financeiro.push(fin);
      mudou = true;
    }

    if (f.financeiroId !== fin.id) { f.financeiroId = fin.id; mudou = true; }
  });

  if (mudou) { sv('financeiro'); sv('fechamentos'); }
  return mudou;
}

// ── Vista Analítica ───────────────────────────────────────────────────────────
function rFinanceiro() {
  if (_finRepararFechamentosOrfaos()) alert2('Alguns fechamentos estavam sem parcela no Financeiro — sincronizados automaticamente.', 'success');
  rKpiFaturamento();
  _finAtualizarKpis();
  const fin = D.financeiro || [];
  gerarAnosFromData('fin-ano',  fin.map(f => f.vencimento));
  gerarAnosFromData('fins-ano', fin.map(f => f.data));

  // Render sintético (aba padrão)
  const sintVis = document.getElementById('fin-view-sint');
  const analVis = document.getElementById('fin-view-anal');
  const isAnalitico = analVis && analVis.style.display !== 'none';
  if (!isAnalitico) { rFinanceiroSintetico(); return; }

  const tbody = document.getElementById('fin-body');
  if (!tbody) return;

  const filtro  = document.getElementById('fin-filtro')?.value  || 'todos';
  const filtroI = document.getElementById('fin-data-ini')?.value || '';
  const filtroF = document.getElementById('fin-data-fim')?.value || '';

  const lista = fin
    .filter(f => filtro === 'todos' || f.status === filtro)
    .filter(f => !filtroI || (f.vencimento && f.vencimento >= filtroI))
    .filter(f => !filtroF || (f.vencimento && f.vencimento <= filtroF))
    .sort((a, b) => {
      if (!a.vencimento && !b.vencimento) return 0;
      if (!a.vencimento) return 1;
      if (!b.vencimento) return -1;
      return a.vencimento.localeCompare(b.vencimento);
    });

  tbody.innerHTML = '';
  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#8B91A8;padding:24px">Nenhum lançamento</td></tr>';
    return;
  }

  const hoje = new Date().toISOString().slice(0, 10);
  lista.forEach(f => {
    const atrasado = f.status === 'pendente' && f.vencimento && f.vencimento < hoje;
    const tr = document.createElement('tr');
    tr.style.background = atrasado ? 'rgba(248,113,113,0.05)' : '';
    tr.innerHTML = `
      <td style="${atrasado?'color:#F87171;font-weight:600':''}">${fd(f.vencimento)||'—'}</td>
      <td><strong>${f.evento||f.contrato||'—'}</strong>${f.isFechamento?'<span class="tag tag-blue" style="margin-left:6px;font-size:10px">Fechamento</span>':''}</td>
      <td>${fd(f.data)||'—'}</td>
      <td>${f.tipo||'—'}</td>
      <td style="text-align:center">${f.convidados||'—'}</td>
      <td style="font-size:11px;color:var(--text3)">${f.descricao||'—'}</td>
      <td><strong style="font-family:var(--mono)">${f.valor||'—'}</strong></td>
      <td>
        <span class="tag ${f.status==='pago'?'tag-green':atrasado?'tag-red':'tag-yellow'}">
          ${f.status==='pago'?'Pago':atrasado?'Atrasado':'Pendente'}
        </span>
        ${f.status==='pago' && f.dataPagamento ? `<div style="font-size:10px;color:var(--text3);margin-top:3px">${fd(f.dataPagamento)}${f.formaPagamento ? ' · ' + (FORMAS_PAGAMENTO[f.formaPagamento]||f.formaPagamento) : ''}</div>` : ''}
        ${f.status==='pago' && f.comprovante ? `<button class="btn-sm" onclick="verComprovante('${f.id}')" style="font-size:9px;padding:1px 6px;margin-top:3px" title="Ver comprovante">📎 Comprovante</button>` : ''}
      </td>
      <td>
        ${f.status==='pendente'
          ?`<button class="btn-sm btn-green" onclick="abrirModalPagamento('${f.id}')">Recebido</button>`
          :`<button class="btn-sm" onclick="marcarPendente('${f.id}')">Desfazer</button>`
        }
        <button class="btn-sm btn-red" onclick="excluirFinanceiro('${f.id}')">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Vista Sintética ───────────────────────────────────────────────────────────
function rFinanceiroSintetico() {
  if (_finRepararFechamentosOrfaos()) alert2('Alguns fechamentos estavam sem parcela no Financeiro — sincronizados automaticamente.', 'success');
  _finAtualizarKpis();
  const fin  = D.financeiro || [];
  const hoje = new Date().toISOString().slice(0, 10);

  gerarAnosFromData('fins-ano', fin.map(f => f.data));

  const filtroI = document.getElementById('fins-data-ini')?.value || '';
  const filtroF = document.getElementById('fins-data-fim')?.value || '';

  // Agrupa por evento+data (sem contratoId no key para unir entradas antigas com novas)
  const grupos = {};
  fin
    .filter(f => !filtroI || (f.data && f.data >= filtroI))
    .filter(f => !filtroF || (f.data && f.data <= filtroF))
    .forEach(f => {
      const chave = (f.evento || f.contrato || '') + '||' + (f.data || '');
      if (!grupos[chave]) grupos[chave] = {
        contratoId: f.contratoId || '',
        nome:       f.evento || f.contrato || '—',
        data:       f.data   || '',
        tipo:       f.tipo   || '—',
        convidados: f.convidados || '—',
        p20: null, p80: null, pFch: null,
      };
      const g = grupos[chave];
      // Preenche contratoId se essa entrada tiver e o grupo ainda não tiver
      if (!g.contratoId && f.contratoId) g.contratoId = f.contratoId;
      const desc = (f.descricao || '').toLowerCase();
      if (f.isFechamento)                                                          g.pFch = f;
      else if (desc.includes('20%') || desc.includes('sinal') || desc.includes('assinatura')) g.p20 = g.p20 || f;
      else if (desc.includes('80%') || desc.includes('restante') || desc.includes('saldo'))   g.p80 = g.p80 || f;
      else if (!g.p20)                                                             g.p20  = f;
      else if (!g.p80)                                                             g.p80  = f;
    });

  const tbody = document.getElementById('fins-body');
  if (!tbody) return;

  const linhas = Object.values(grupos).sort((a, b) => b.data.localeCompare(a.data));

  if (!linhas.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#8B91A8;padding:24px">Nenhum lançamento encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = '';

  linhas.forEach(g => {
    const total = (g.p20?.valorNum||0) + (g.p80?.valorNum||0) + (g.pFch?.valorNum||0);
    const todoPago = [g.p20, g.p80, g.pFch].filter(Boolean).every(p => p.status === 'pago');
    const temAtras = [g.p20, g.p80, g.pFch].some(p => p && p.status === 'pendente' && p.vencimento && p.vencimento < hoje);

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border)';
    if (todoPago) tr.style.opacity = '0.7';

    tr.innerHTML = `
      <td style="padding:12px;font-size:11px;color:var(--text3);white-space:nowrap">${fd(g.data)||'—'}</td>
      <td style="padding:12px">
        <strong style="font-size:13px">${g.nome}</strong>
      </td>
      <td style="padding:12px;font-size:11px;color:var(--text3)">${g.tipo}<br>${g.convidados !== '—' ? g.convidados+' conv.' : ''}</td>
      <td style="padding:10px 14px;text-align:center">${_finPilula(g.p20, hoje)}</td>
      <td style="padding:10px 14px;text-align:center">${_finPilula(g.p80, hoje)}</td>
      <td style="padding:10px 14px;text-align:center">${_finPilula(g.pFch, hoje)}</td>
      <td style="padding:12px;text-align:right;font-family:var(--mono);font-weight:700;font-size:14px;color:${todoPago?'var(--green)':temAtras?'var(--red)':'var(--text)'}">
        ${total ? fR(total) : '—'}
      </td>`;
    tbody.appendChild(tr);
  });
}

function _finPilula(parc, hoje) {
  if (!parc) return '<span style="color:var(--text3);font-size:12px">—</span>';
  const atrasado = parc.status === 'pendente' && parc.vencimento && parc.vencimento < hoje;
  const pago     = parc.status === 'pago';
  const bg    = pago ? '#1A3D2B' : atrasado ? '#3D1A1A' : '#2A2F42';
  const cor   = pago ? '#4ADE80' : atrasado ? '#F87171' : '#FBBF24';
  const label = pago ? 'Pago'    : atrasado ? '⚠ Atrasado' : 'Pendente';
  const venc  = parc.vencimento ? `<div style="font-size:10px;opacity:0.75;margin-top:2px">venc. ${fd(parc.vencimento)}</div>` : '';
  const pagoEm = pago && parc.dataPagamento ? `<div style="font-size:10px;opacity:0.75;margin-top:2px">pago em ${fd(parc.dataPagamento)}${parc.formaPagamento ? ' · ' + (FORMAS_PAGAMENTO[parc.formaPagamento]||parc.formaPagamento) : ''}</div>` : '';
  const botao = pago
    ? `<div style="margin-top:4px;display:flex;gap:4px;justify-content:center;flex-wrap:wrap">
         ${parc.comprovante ? `<button class="btn-sm" onclick="verComprovante('${parc.id}')" style="font-size:9px;padding:1px 6px" title="Ver comprovante">📎</button>` : ''}
         <button class="btn-sm" onclick="marcarPendente('${parc.id}')" style="font-size:9px;padding:1px 6px">Desfazer</button>
       </div>`
    : `<div style="margin-top:4px"><button class="btn-sm btn-green" onclick="abrirModalPagamento('${parc.id}')" style="font-size:9px;padding:1px 6px">Recebido</button></div>`;
  return `<div style="background:${bg};color:${cor};border-radius:8px;padding:7px 10px;display:inline-block;min-width:110px;text-align:center">
    <div style="font-family:var(--mono);font-weight:700;font-size:13px">${fR(parc.valorNum)}</div>
    ${venc}
    ${pagoEm}
    <div style="font-size:10px;margin-top:1px">${label}</div>
    ${botao}
  </div>`;
}

// ─── REGISTRO DE PAGAMENTO (com comprovante e reconciliação automática) ─────

// Chave que identifica o contrato de uma parcela, para agrupar as parcelas irmãs
function _finChaveContrato(f) {
  if (f.contratoId) return 'id|' + f.contratoId;
  const norm = s => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
  return 'nd|' + norm(f.contrato || f.evento) + '|' + (f.data || '');
}

const FORMAS_PAGAMENTO = {
  dinheiro: 'Dinheiro', pix: 'PIX', cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito', boleto: 'Boleto', transferencia: 'Transferência',
  cheque: 'Cheque', outros: 'Outros',
};

function abrirModalPagamento(id) {
  const f = (D.financeiro || []).find(x => x.id === id);
  if (!f) return;
  document.getElementById('pag-modal-id').value = id;
  document.getElementById('pag-modal-info').textContent = (f.evento || f.contrato || '—') + ' — ' + (f.descricao || '');
  document.getElementById('pag-modal-esperado').textContent = 'Valor previsto desta parcela: ' + fR(f.valorNum);
  document.getElementById('pag-modal-data').value = new Date().toISOString().slice(0, 10);
  document.getElementById('pag-modal-valor').value = (f.valorNum || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  document.getElementById('pag-modal-forma').value = '';
  document.getElementById('pag-modal-comprovante-input').value = '';
  document.getElementById('pag-modal-comprovante-b64').value = '';
  document.getElementById('pag-modal-comprovante-tipo').value = '';
  document.getElementById('pag-modal-comprovante-nome').textContent = '';
  openM('mpagamento');
}

// Todos os comprovantes ficam guardados dentro do mesmo documento "financeiro"
// no Firestore (limite de 1MB por documento), então precisam ser bem pequenos.
function _comprimirComprovante(file, cb) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const tentativas = [
        { maxPx: 1400, q: 0.75 },
        { maxPx: 1100, q: 0.6  },
        { maxPx: 900,  q: 0.5  },
        { maxPx: 700,  q: 0.4  },
      ];
      let resultado = '';
      for (const t of tentativas) {
        const scale = Math.min(t.maxPx / img.width, t.maxPx / img.height, 1);
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resultado = canvas.toDataURL('image/jpeg', t.q);
        if (resultado.length <= 200000) break; // ~200KB em base64
      }
      cb(resultado);
    };
    img.onerror = () => cb('');
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function pagPreviewComprovante(input) {
  const file = input.files[0];
  if (!file) return;
  const nomeEl = document.getElementById('pag-modal-comprovante-nome');
  if (file.type === 'application/pdf') {
    if (file.size > 400 * 1024) {
      alert2('PDF muito grande (máx. 400KB). Prefira uma foto/print do comprovante ou um PDF menor.', 'error');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('pag-modal-comprovante-b64').value = e.target.result;
      document.getElementById('pag-modal-comprovante-tipo').value = file.type;
      if (nomeEl) nomeEl.textContent = '📄 ' + file.name;
    };
    reader.readAsDataURL(file);
  } else if (file.type.startsWith('image/')) {
    if (nomeEl) nomeEl.textContent = 'Comprimindo imagem…';
    _comprimirComprovante(file, base64 => {
      if (!base64) { alert2('Não foi possível processar essa imagem.', 'error'); input.value = ''; if (nomeEl) nomeEl.textContent = ''; return; }
      document.getElementById('pag-modal-comprovante-b64').value = base64;
      document.getElementById('pag-modal-comprovante-tipo').value = 'image/jpeg';
      if (nomeEl) nomeEl.textContent = '🖼️ ' + file.name;
    });
  } else {
    alert2('Formato não suportado. Envie uma imagem ou PDF.', 'error');
    input.value = '';
  }
}

function verComprovante(id) {
  const f = (D.financeiro || []).find(x => x.id === id);
  if (!f || !f.comprovante) { alert2('Nenhum comprovante anexado.', 'error'); return; }
  const w = window.open('');
  if (!w) { alert2('Permita pop-ups para visualizar o comprovante.', 'error'); return; }
  w.document.title = f.comprovanteNome || 'Comprovante';
  if ((f.comprovanteTipo || '').includes('pdf')) {
    w.document.write(`<iframe src="${f.comprovante}" style="width:100%;height:100vh;border:none"></iframe>`);
  } else {
    w.document.write(`<body style="margin:0;background:#111"><img src="${f.comprovante}" style="max-width:100%;display:block;margin:0 auto"></body>`);
  }
}

// Aplica a diferença entre o valor pago e o valor previsto às próximas parcelas
// pendentes do mesmo contrato, para que o total do contrato permaneça correto.
// diff > 0: pagou a mais → abate das próximas parcelas (em cascata, se necessário)
// diff < 0: pagou a menos → soma o saldo devedor na próxima parcela pendente
function _aplicarAjusteContrato(f, diff) {
  const chave = _finChaveContrato(f);
  const pendentes = (D.financeiro || [])
    .filter(o => o.id !== f.id && o.status === 'pendente' && _finChaveContrato(o) === chave)
    .sort((a, b) => (a.vencimento || '').localeCompare(b.vencimento || '') || a.id.localeCompare(b.id));

  const ajustes = [];
  const fmt = v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  let resto = diff;

  for (const p of pendentes) {
    if (resto === 0) break;
    if (resto > 0) {
      const reduz = Math.min(resto, p.valorNum || 0);
      if (reduz <= 0) continue;
      p.valorNum -= reduz; p.valor = fmt(p.valorNum);
      resto -= reduz;
      ajustes.push({ id: p.id, delta: -reduz });
    } else {
      p.valorNum += -resto; p.valor = fmt(p.valorNum);
      ajustes.push({ id: p.id, delta: -resto });
      resto = 0;
    }
  }

  if (resto !== 0) {
    // Não há mais parcelas pendentes para absorver a diferença: cria um lançamento
    // de ajuste, para não perder o saldo (crédito do cliente ou saldo ainda devido).
    const novo = {
      id: _gerarId('FIN'), contrato: f.contrato, data: f.data, evento: f.evento,
      contratoId: f.contratoId || '', tipo: f.tipo, convidados: f.convidados,
      descricao: resto > 0 ? 'Crédito do cliente — pagamento acima do valor do contrato' : 'Ajuste — saldo restante do contrato',
      valorNum: Math.abs(resto), valor: fmt(Math.abs(resto)),
      vencimento: f.vencimento || new Date().toISOString().slice(0, 10),
      status: 'pendente',
    };
    D.financeiro.push(novo);
    ajustes.push({ id: novo.id, delta: -resto, criado: true });
  }

  return ajustes;
}

function confirmarPagamento() {
  const id = document.getElementById('pag-modal-id').value;
  const f = (D.financeiro || []).find(x => x.id === id);
  if (!f) { closeM('mpagamento'); return; }

  const dataPagamento     = document.getElementById('pag-modal-data').value;
  const valorStr          = document.getElementById('pag-modal-valor').value.trim();
  const formaPagamento    = document.getElementById('pag-modal-forma').value;
  const comprovante       = document.getElementById('pag-modal-comprovante-b64').value;
  const comprovanteTipo   = document.getElementById('pag-modal-comprovante-tipo').value;
  const comprovanteNome   = document.getElementById('pag-modal-comprovante-nome').textContent;

  if (!dataPagamento) { alert2('Informe a data do pagamento.', 'error'); return; }
  const valorPago = parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));
  if (!valorPago || valorPago <= 0) { alert2('Informe um valor pago válido.', 'error'); return; }
  if (!formaPagamento) { alert2('Selecione a forma de pagamento.', 'error'); return; }
  // Pagamento em dinheiro costuma não ter comprovante — só exige anexo para as demais formas
  if (!comprovante && formaPagamento !== 'dinheiro') { alert2('Anexe o comprovante de pagamento.', 'error'); return; }

  if (f.valorOriginal === undefined) f.valorOriginal = f.valorNum;
  const diff = Math.round((valorPago - f.valorOriginal) * 100) / 100;

  f.status           = 'pago';
  f.dataPagamento     = dataPagamento;
  f.valorPago         = valorPago;
  f.valorNum           = valorPago;
  f.valor             = 'R$ ' + valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  f.formaPagamento     = formaPagamento;
  f.comprovante        = comprovante;
  f.comprovanteTipo    = comprovanteTipo;
  f.comprovanteNome    = comprovanteNome;
  f._ajustes           = diff !== 0 ? _aplicarAjusteContrato(f, diff) : [];

  sv('financeiro');
  closeM('mpagamento');
  _finRefresh();

  if (diff > 0) alert2(`Pagamento registrado! Excedente de ${fR(diff)} aplicado automaticamente à(s) próxima(s) parcela(s).`, 'success');
  else if (diff < 0) alert2(`Pagamento registrado! Diferença de ${fR(-diff)} somada à próxima parcela pendente.`, 'success');
  else alert2('Pagamento registrado com sucesso!', 'success');
}

function marcarPendente(id) {
  const f = (D.financeiro || []).find(x => x.id === id);
  if (!f) return;
  if (f.status === 'pago' && !confirm('Desfazer este pagamento? O comprovante e os ajustes automáticos aplicados às parcelas seguintes serão revertidos (quando possível).')) return;

  if (f._ajustes && f._ajustes.length) {
    f._ajustes.forEach(a => {
      if (a.criado) {
        D.financeiro = D.financeiro.filter(o => o.id !== a.id);
      } else {
        const alvo = D.financeiro.find(o => o.id === a.id);
        if (alvo && alvo.status === 'pendente') {
          alvo.valorNum = Math.max(0, alvo.valorNum - a.delta);
          alvo.valor = 'R$ ' + alvo.valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        }
      }
    });
    f._ajustes = [];
  }

  if (f.valorOriginal !== undefined) {
    f.valorNum = f.valorOriginal;
    f.valor = 'R$ ' + f.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  f.status = 'pendente';
  f.dataPagamento = '';
  f.valorPago = null;
  f.formaPagamento = '';
  f.comprovante = '';
  f.comprovanteTipo = '';
  f.comprovanteNome = '';

  sv('financeiro'); _finRefresh();
}
function _finRefresh() {
  _finAtualizarKpis();
  const sint = document.getElementById('fin-view-sint');
  if (sint && sint.style.display !== 'none') rFinanceiroSintetico();
  else rFinanceiro();
}
function excluirFinanceiro(id) {
  if (!confirm('Excluir este lançamento?')) return;
  D.financeiro = (D.financeiro||[]).filter(f => f.id !== id);
  sv('financeiro'); rFinanceiro();
}

// ─── LIMPEZA DE LANÇAMENTOS ÓRFÃOS ──────────────────────────────────────────
// Remove lançamentos do financeiro cujo contrato de origem não existe mais.
function limparFinanceiroOrfaos() {
  try {
    const contratos = D.contratos || [];
    const financeiro = D.financeiro || [];

    // Índice 1: contratoId → existe?
    const idsValidos = new Set(contratos.map(c => c.id).filter(Boolean));

    // Índice 2: "nome completo normalizado|data" → existe?
    const norm = s => (s||'').toLowerCase().trim().replace(/\s+/g,' ');
    const nomeDataValidos = new Set(
      contratos.map(c => norm(c.nome) + '|' + (c.data||''))
    );

    const orfaos = financeiro.filter(f => {
      // Tem contratoId real → contrato precisa existir
      if (f.contratoId) return !idsValidos.has(f.contratoId);
      // Sem contratoId → cruza pelo nome completo + data do evento
      const chave = norm(f.contrato||f.evento) + '|' + (f.data||'');
      return !nomeDataValidos.has(chave);
    });

    if (!orfaos.length) {
      alert('✅ Nenhum lançamento órfão encontrado!\nO financeiro está limpo.');
      return;
    }

    // Preview (máx 8 linhas para não transbordar o dialog)
    const preview = orfaos.slice(0, 8).map(f =>
      `• ${f.evento||f.contrato||'(sem nome)'}  —  ${fd(f.data)||'sem data'}  —  ${f.valor||'—'}`
    ).join('\n');
    const mais = orfaos.length > 8 ? `\n... e mais ${orfaos.length - 8} lançamento(s).` : '';

    if (!confirm(
      `Encontrados ${orfaos.length} lançamento(s) sem contrato vinculado:\n\n${preview}${mais}\n\nExcluir todos esses lançamentos?`
    )) return;

    const orfaoIds = new Set(orfaos.map(f => f.id));
    D.financeiro = financeiro.filter(f => !orfaoIds.has(f.id));
    sv('financeiro');
    rFinanceiro();
    alert(`✅ ${orfaos.length} lançamento(s) excluído(s) com sucesso!`);

  } catch(e) {
    alert('Erro ao limpar órfãos: ' + e.message);
    console.error('limparFinanceiroOrfaos:', e);
  }
}

// ═══════════════════════════════════════════════════════
// ─── EXTENSÃO DO svFirebase PARA NOVOS CAMPOS ──────────
// ═══════════════════════════════════════════════════════

// Garantir que campos existam
if (!D.agenda) D.agenda = [];
if (!D.financeiro) D.financeiro = [];
if (!D.contratos) D.contratos = [];
if (!D.producoes) D.producoes = [];
if (!D.separacoes) D.separacoes = [];
if (!D.fichas) D.fichas = [];
if (!D.regrasProp) D.regrasProp = [];
if (!D.historico) D.historico = {};
if (!D.metas) D.metas = {};
if (!D.despesas) D.despesas = [];
if (!D.equipe) D.equipe = [];
if (!D.escalas) D.escalas = [];
if (!D.orcamentos) D.orcamentos = [];
if (!D.rcEventos) D.rcEventos = [];
if (!D.rcEventosImportados) D.rcEventosImportados = [];

function baixarModeloCSV() {
  const linhas = [
    'MES;ANO;PAX;FATURAMENTO',
    'Janeiro;2025;525;22990',
    'Fevereiro;2025;1965;95925',
    'Março;2025;1211;59900',
    'Abril;2025;2110;149450',
    'Maio;2025;2385;171545',
    'Junho;2025;2185;156980',
    'Julho;2025;663;48625',
    'Agosto;2025;2410;180771',
    'Setembro;2025;1520;139805',
    'Outubro;2025;3005;218546',
    'Novembro;2025;2210;154555',
    'Dezembro;2025;3105;437960',
    ';;;',
    'Janeiro;2026;;',
    'Fevereiro;2026;;',
    'Março;2026;;',
    'Abril;2026;;',
    'Maio;2026;;',
    'Junho;2026;;',
    'Julho;2026;;',
    'Agosto;2026;;',
    'Setembro;2026;;',
    'Outubro;2026;;',
    'Novembro;2026;;',
    'Dezembro;2026;;',
  ];
  const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'modelo_analise_romero.csv'; a.click();
  URL.revokeObjectURL(url);
}

function revisarMeta(chave, nomeMes) {
  const atual = parseFloat((D.metas||{})[chave]?.fat||0);
  const novaStr = prompt(
    `Meta de ${nomeMes} atual: R$ ${atual.toLocaleString('pt-BR',{minimumFractionDigits:2})}\n\nDigite a nova meta (R$):`,
    atual.toFixed(2).replace('.',',')
  );
  if (novaStr === null) return;
  const nova = parseFloat(novaStr.replace(',','.'));
  if (!nova || nova <= 0) { alert('Valor inválido.'); return; }
  if (!D.metas) D.metas = {};
  if (!D.metas[chave]) D.metas[chave] = {};
  D.metas[chave].fat = nova;
  sv('metas');
  rAnalise();
}



// ═══════════════════════════════════════════════════════
