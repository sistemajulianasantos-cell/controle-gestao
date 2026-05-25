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

function rFinanceiro() {
  rKpiFaturamento();
  const fin = D.financeiro || [];
  const tbody = document.getElementById('fin-body');
  if (!tbody) return;

  const pendentes = fin.filter(f=>f.status==='pendente');
  const pagos     = fin.filter(f=>f.status==='pago');
  const totPend   = pendentes.reduce((a,f)=>a+(f.valorNum||0),0);
  const totPago   = pagos.reduce((a,f)=>a+(f.valorNum||0),0);

  if (document.getElementById('fin-total-pend')) document.getElementById('fin-total-pend').textContent = fR(totPend);
  if (document.getElementById('fin-total-pago')) document.getElementById('fin-total-pago').textContent = fR(totPago);
  if (document.getElementById('fin-total-geral')) document.getElementById('fin-total-geral').textContent = fR(totPend+totPago);

  const filtro = document.getElementById('fin-filtro')?.value||'todos';
  const filtroI = document.getElementById('fin-data-ini')?.value||'';
  const filtroF = document.getElementById('fin-data-fim')?.value||'';

  const lista = fin
    .filter(f => filtro==='todos' || f.status===filtro)
    .filter(f => !filtroI || (f.vencimento && f.vencimento >= filtroI))
    .filter(f => !filtroF || (f.vencimento && f.vencimento <= filtroF))
    .sort((a,b)=>{
      // Sem data de vencimento vai para o fim
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

  const hoje = new Date().toISOString().slice(0,10);
  lista.forEach(f => {
    const atrasado = f.status==='pendente' && f.vencimento && f.vencimento < hoje;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fd(f.vencimento)||'—'}</td>
      <td><strong>${f.evento||f.contrato||'—'}</strong></td>
      <td>${fd(f.data)||'—'}</td>
      <td>${f.tipo||'—'}</td>
      <td>${f.convidados||'—'}</td>
      <td>${f.descricao||'—'}</td>
      <td><strong>${f.valor||'—'}</strong></td>
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

function marcarPago(id) {
  const f = (D.financeiro||[]).find(f => f.id === id);
  if (f) { f.status = 'pago'; sv('financeiro'); rFinanceiro(); }
}
function marcarPendente(id) {
  const f = (D.financeiro||[]).find(f => f.id === id);
  if (f) { f.status = 'pendente'; sv('financeiro'); rFinanceiro(); }
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
if (!D.equipe) D.equipe = [];
if (!D.escalas) D.escalas = [];
if (!D.orcamentos) D.orcamentos = [];

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
