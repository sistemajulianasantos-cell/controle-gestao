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

// ── Vista Analítica ───────────────────────────────────────────────────────────
function rFinanceiro() {
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
      </td>
      <td>
        ${f.status==='pendente'
          ?`<button class="btn-sm btn-green" onclick="marcarPago('${f.id}')">Recebido</button>`
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
  const botao = pago
    ? `<div style="margin-top:4px"><button class="btn-sm" onclick="marcarPendente('${parc.id}')" style="font-size:9px;padding:1px 6px">Desfazer</button></div>`
    : `<div style="margin-top:4px"><button class="btn-sm btn-green" onclick="marcarPagoSint('${parc.id}')" style="font-size:9px;padding:1px 6px">Recebido</button></div>`;
  return `<div style="background:${bg};color:${cor};border-radius:8px;padding:7px 10px;display:inline-block;min-width:110px;text-align:center">
    <div style="font-family:var(--mono);font-weight:700;font-size:13px">${fR(parc.valorNum)}</div>
    ${venc}
    <div style="font-size:10px;margin-top:1px">${label}</div>
    ${botao}
  </div>`;
}

function marcarPagoSint(id) {
  marcarPago(id);
  rFinanceiroSintetico();
}

function marcarPago(id) {
  const f = (D.financeiro||[]).find(f => f.id === id);
  if (f) { f.status = 'pago'; sv('financeiro'); _finRefresh(); }
}
function marcarPendente(id) {
  const f = (D.financeiro||[]).find(f => f.id === id);
  if (f) { f.status = 'pendente'; sv('financeiro'); _finRefresh(); }
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
