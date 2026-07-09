// ─── FINANCEIRO ────────────────────────────────────────
// ═══════════════════════════════════════════════════════

// ── Detecta/remove parcelas duplicadas (mesmo id repetido) ──────────────────
// Pode acontecer se a mesma parcela ficar salva tanto no documento legado
// "financeiro" quanto em algum "financeiro_AAAA" (ex: divisão por ano
// interrompida no meio) — o valor de cada uma entra duas vezes nos totais.
function verificarDuplicatasFinanceiro() {
  const porId = {};
  (D.financeiro || []).forEach(f => { (porId[f.id] || (porId[f.id] = [])).push(f); });
  const duplicados = Object.values(porId).filter(arr => arr.length > 1);

  if (!duplicados.length) {
    alert2('✅ Nenhuma parcela duplicada encontrada no Financeiro.', 'success');
    return;
  }

  const valorDuplicado = duplicados.reduce((s, arr) => s + (arr.length - 1) * (arr[0].valorNum || 0), 0);
  const preview = duplicados.slice(0, 10).map(arr =>
    `• ${arr[0].evento || arr[0].contrato || '(sem nome)'} — ${arr[0].descricao || ''} — ${fR(arr[0].valorNum)} (${arr.length}x repetida)`
  ).join('\n');
  const mais = duplicados.length > 10 ? `\n... e mais ${duplicados.length - 10} grupo(s).` : '';

  if (!confirm(
    `⚠️ ${duplicados.length} parcela(s) duplicada(s) no Financeiro, somando ${fR(valorDuplicado)} contado(s) a mais nos totais:\n\n${preview}${mais}\n\n` +
    `Remover as cópias extras agora (mantém só 1 de cada)?`
  )) return;

  const idsVistos = new Set();
  D.financeiro = (D.financeiro || []).filter(f => {
    if (idsVistos.has(f.id)) return false;
    idsVistos.add(f.id);
    return true;
  });

  sv('financeiro');
  rFinanceiro();
  alert2(`✅ Duplicatas removidas! ${fR(valorDuplicado)} retirado(s) do total.`, 'success');
}

// ── Migração de comprovantes antigos embutidos no documento "financeiro" ────
// Antes da correção de 2026-07-08, comprovantes ficavam embutidos (base64)
// direto no array financeiro — como esse documento junta as parcelas de TODOS
// os contratos, isso pode estourar o limite de 1MB por documento do Firestore
// e travar QUALQUER salvamento no Financeiro (mesmo sem anexar nada novo).
// Esta função move os comprovantes que ainda estiverem embutidos para
// documentos próprios (coleção "comprovantes"), encolhendo o documento.
async function migrarComprovantesEmbutidos() {
  const alvos = (D.financeiro || []).filter(f => f.comprovante);
  if (!alvos.length) {
    alert2('Nenhum comprovante embutido encontrado no Financeiro — nada para migrar.', 'success');
    return;
  }
  if (!confirm(
    `Encontrado(s) ${alvos.length} comprovante(s) ainda embutido(s) dentro do documento "financeiro" — isso pode estar estourando o limite de 1MB do Firestore e travando os salvamentos.\n\n` +
    `Mover agora para documentos separados (não afeta os comprovantes, só onde eles ficam guardados)?`
  )) return;

  if (!window.salvarComprovante) { alert2('Não foi possível migrar — recarregue a página e tente de novo.', 'error'); return; }

  let migrados = 0, falhas = 0;
  for (const f of alvos) {
    const ok = await window.salvarComprovante(f.id, f.comprovante, f.comprovanteTipo, f.comprovanteNome);
    if (ok) { delete f.comprovante; f.temComprovante = true; migrados++; }
    else falhas++;
  }

  sv('financeiro');
  _finRefresh();
  alert2(
    `✅ ${migrados} comprovante(s) migrado(s) para documentos separados.` +
    (falhas ? ` ⚠️ ${falhas} falharam ao migrar (tente de novo).` : ' O Financeiro deve voltar a salvar normalmente agora.'),
    falhas ? 'error' : 'success'
  );
}

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

// Vencimento "efetivo" para decidir pendente x atrasado: usa o vencimento
// cadastrado quando existe; se estiver em branco (comum em contratos antigos
// importados sem essa data), cai para 7 dias antes do evento — o mesmo prazo
// padrão que o sistema já usa pra calcular o vencimento da parcela de 80%.
// Sem isso, uma parcela sem vencimento cadastrado nunca ficava "Atrasada",
// mesmo com o evento há meses no passado — sempre aparecia como "Pendente".
function _finVencimentoEfetivo(f) {
  if (f.vencimento) return f.vencimento;
  if (!f.data) return '';
  const d = new Date(f.data + 'T12:00:00');
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

// ── KPIs globais ─────────────────────────────────────────────────────────────
function _finAtualizarKpis() {
  const fin   = D.financeiro || [];
  const hoje  = new Date().toISOString().slice(0, 10);
  const pagos = fin.filter(f => f.status === 'pago');
  const pend  = fin.filter(f => f.status === 'pendente');
  const atras = pend.filter(f => { const v = _finVencimentoEfetivo(f); return v && v < hoje; });
  const totPago  = pagos.reduce((a, f) => a + (f.valorNum || 0), 0);
  // OBS: não soma _finSaldoContratosTotal() aqui de propósito — esse card é o
  // número de confiança do dia a dia. A divergência entre parcelas e valor do
  // contrato (comum em contratos antigos com problema de cadastro na
  // importação) já aparece por contrato na vista Sintética ("⚠ falta do
  // contrato"); somar tudo aqui infla o total geral de forma enganosa quando
  // há muitos contratos com esse problema histórico.
  const totPend  = pend.reduce((a, f) => a + (f.valorNum || 0), 0);
  const totAtras = atras.reduce((a, f) => a + (f.valorNum || 0), 0);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('fin-total-geral',    fR(totPago + totPend));
  set('fin-total-pend',     fR(totPend));
  set('fin-total-pago',     fR(totPago));
  set('fin-total-atrasado', fR(totAtras));

  // Detalhamento por categoria: Contrato (20%/80%) x Fechamento x Geral
  const contratoRecs   = fin.filter(f => !f.isFechamento);
  const fechamentoRecs = fin.filter(f => f.isFechamento);
  const linhaCategoria = (nome, recs) => {
    const pg = recs.filter(f => f.status === 'pago').reduce((s, f) => s + (f.valorNum || 0), 0);
    const pd = recs.filter(f => f.status === 'pendente');
    const at = pd.filter(f => { const v = _finVencimentoEfetivo(f); return v && v < hoje; });
    const pdValor = pd.reduce((s, f) => s + (f.valorNum || 0), 0);
    const atValor = at.reduce((s, f) => s + (f.valorNum || 0), 0);
    return { nome, total: pg + pdValor, recebido: pg, pendente: pdValor - atValor, atrasado: atValor };
  };
  const linhas = [
    linhaCategoria('Contrato (20% + 80%)', contratoRecs),
    linhaCategoria('Fechamento', fechamentoRecs),
    linhaCategoria('Geral', fin),
  ];
  const bodyEl = document.getElementById('fin-breakdown-body');
  if (bodyEl) {
    bodyEl.innerHTML = linhas.map(l => `
      <tr style="border-bottom:1px solid var(--border)">
        <td style="padding:8px 12px;font-weight:600">${l.nome}</td>
        <td style="padding:8px 12px;text-align:right;font-family:var(--mono)">${fR(l.total)}</td>
        <td style="padding:8px 12px;text-align:right;font-family:var(--mono);color:var(--green)">${fR(l.recebido)}</td>
        <td style="padding:8px 12px;text-align:right;font-family:var(--mono);color:#FBBF24">${fR(l.pendente)}</td>
        <td style="padding:8px 12px;text-align:right;font-family:var(--mono);color:var(--red)">${fR(l.atrasado)}</td>
      </tr>`).join('');
  }
}

// ── Sincronização Fechamentos ↔ Financeiro (ação manual, com confirmação) ───
// Todo fechamento em D.fechamentos precisa de uma parcela espelhada em
// D.financeiro (isFechamento:true) para aparecer em "Contas a Receber", e
// vice-versa. Duas coisas podem quebrar esse vínculo:
//  a) fechamento sem parcela no Financeiro (ex: contrato recriado com novo id)
//     → continua visível em "Fechamentos" mas some do Financeiro.
//  b) parcela isFechamento no Financeiro sem nenhum fechamento correspondente
//     (ex: fechamento excluído sem remover a parcela junto) → aparece na
//     coluna "Fechamento" de Contas a Receber sem existir na aba Fechamentos.
// Não roda sozinha: só grava no banco quando o usuário confirma, como as demais
// rotinas de reparo do sistema (ex: "Limpar órfãos").
function _finFechamentosSemParcela() {
  const fechamentos = D.fechamentos || [];
  const finIds = new Set((D.financeiro || []).map(x => x.id));
  return fechamentos.filter(f => !(f.financeiroId && finIds.has(f.financeiroId)));
}

function sincronizarFechamentosFinanceiro() {
  const faltando = _finFechamentosSemParcela();
  const norm = s => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
  if (!D.financeiro) D.financeiro = [];

  // Marca como "já usados" os financeiroId que outros fechamentos já apontam,
  // para nunca ligar duas parcelas diferentes ao mesmo fechamento por engano.
  const idsUsados = new Set((D.fechamentos || []).map(f => f.financeiroId).filter(Boolean));
  const relinks = [];
  const aCriar = [];

  faltando.forEach(f => {
    const fin = D.financeiro.find(x => x.isFechamento && !idsUsados.has(x.id) && (
      (f.contratoId && x.contratoId === f.contratoId) ||
      (norm(x.evento || x.contrato) === norm(f.eventoNome) && x.data === f.dataEvento)
    ));
    if (fin) { idsUsados.add(fin.id); relinks.push({ fechamento: f, fin }); }
    else aCriar.push(f);
  });

  // Sobrou como parcela isFechamento sem NENHUM fechamento que a reivindique
  // (nem existente, nem prestes a ser religado acima) → é órfã de verdade.
  const orfaosFinanceiro = D.financeiro.filter(x => x.isFechamento && !idsUsados.has(x.id));

  if (!relinks.length && !aCriar.length && !orfaosFinanceiro.length) {
    alert2('✅ Nenhuma pendência de sincronização de fechamentos. Tudo certo!', 'success');
    return;
  }

  const partes = [];
  const faltandoTodos = [...relinks.map(r => r.fechamento), ...aCriar];
  if (faltandoTodos.length) {
    partes.push(`${faltandoTodos.length} fechamento(s) sem parcela no Financeiro (serão criadas/recuperadas):\n` +
      faltandoTodos.slice(0, 8).map(f => `• ${f.eventoNome || f.clienteNome || '(sem nome)'} — ${fd(f.dataEvento) || 'sem data'} — ${fR(f.totalExtras || 0)}`).join('\n'));
  }
  if (orfaosFinanceiro.length) {
    partes.push(`${orfaosFinanceiro.length} lançamento(s) de Fechamento no Financeiro sem nenhum fechamento correspondente (serão excluídos):\n` +
      orfaosFinanceiro.slice(0, 8).map(f => `• ${f.evento || f.contrato || '(sem nome)'} — ${fd(f.data) || 'sem data'} — ${f.valor || '—'}`).join('\n'));
  }

  if (!confirm(`${partes.join('\n\n')}\n\nAplicar essas correções agora?`)) return;

  relinks.forEach(({ fechamento, fin }) => { fechamento.financeiroId = fin.id; });

  aCriar.forEach(f => {
    const fin = {
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
    f.financeiroId = fin.id;
  });

  if (orfaosFinanceiro.length) {
    const idsRemover = new Set(orfaosFinanceiro.map(x => x.id));
    D.financeiro = D.financeiro.filter(x => !idsRemover.has(x.id));
  }

  sv('financeiro'); sv('fechamentos');
  rFinanceiro(); rFechamentos(); rFestaFechamentos();
  alert2(`✅ Sincronização concluída! ${aCriar.length} parcela(s) criada(s), ${relinks.length} recuperada(s), ${orfaosFinanceiro.length} órfã(s) removida(s).`, 'success');
}

// ── Diagnóstico: contratos com parcela 20%/80% faltando OU com valor errado ─
// A divisão 20%/80% do valor do contrato nunca deve ser editada manualmente —
// o sistema é quem calcula e mantém essas parcelas batendo com o contrato.
// Detecta tanto parcela totalmente ausente quanto parcela que existe mas tem
// valor diferente de 20%/80% do contrato (erro comum de cadastro/importação).
// Só considera parcelas ainda PENDENTES — nunca mexe em nada já pago.
function _finContratosComParcelaFaltando() {
  const grupos = _finAgruparEventos(D.financeiro || []);
  const porContratoId = {};
  Object.values(grupos).forEach(g => { if (g.contratoId) porContratoId[g.contratoId] = g; });
  const norm = s => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');

  const problemas = [];
  (D.contratos || []).forEach(c => {
    if (!c.data || c.status === 'cancelado') return;
    const valorContrato = parseFloat((c.opcao || '0').toString().replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    if (!valorContrato) return; // contrato sem valor definido, nada a checar

    const g = (c.id && porContratoId[c.id])
      || Object.values(grupos).find(x => norm(x.nome) === norm(c.nomeEvento || c.nome) && x.data === c.data);

    const faltaP20 = !g || !g.p20;
    const faltaP80 = !g || !g.p80;
    const esperadoP20 = Math.round(valorContrato * 0.2 * 100) / 100;
    const esperadoP80 = Math.round(valorContrato * 0.8 * 100) / 100;
    const p20Errado = !faltaP20 && g.p20.status === 'pendente' && Math.abs((g.p20.valorNum || 0) - esperadoP20) > 0.01;
    const p80Errado = !faltaP80 && g.p80.status === 'pendente' && Math.abs((g.p80.valorNum || 0) - esperadoP80) > 0.01;

    if (faltaP20 || faltaP80 || p20Errado || p80Errado) {
      problemas.push({ contrato: c, valorContrato, esperadoP20, esperadoP80, faltaP20, faltaP80, p20Errado, p80Errado, g });
    }
  });

  problemas.sort((a, b) => (b.contrato.data || '').localeCompare(a.contrato.data || ''));
  return problemas;
}

function verificarParcelasContratos() {
  const problemas = _finContratosComParcelaFaltando();

  if (!problemas.length) {
    alert2('✅ Todos os contratos com valor definido têm as parcelas 20%/80% lançadas e corretas no Financeiro.', 'success');
    return;
  }

  const desc = p => {
    const partes = [];
    if (p.faltaP20) partes.push('falta a parcela de 20%');
    else if (p.p20Errado) partes.push(`20% incorreta (está ${fR(p.g.p20.valorNum)}, deveria ser ${fR(p.esperadoP20)})`);
    if (p.faltaP80) partes.push('falta a parcela de 80%');
    else if (p.p80Errado) partes.push(`80% incorreta (está ${fR(p.g.p80.valorNum)}, deveria ser ${fR(p.esperadoP80)})`);
    return partes.join('; ');
  };
  const preview = problemas.slice(0, 15).map(p =>
    `• ${p.contrato.nomeEvento || p.contrato.nome} — ${fd(p.contrato.data)} — ${desc(p)}`
  ).join('\n');
  const mais = problemas.length > 15 ? `\n... e mais ${problemas.length - 15} contrato(s).` : '';

  if (!confirm(
    `⚠️ ${problemas.length} contrato(s) com parcela 20%/80% faltando ou com valor diferente do contrato:\n\n${preview}${mais}\n\n` +
    `Corrigir agora, usando sempre 20%/80% do valor cadastrado na aba Contratos? Só mexe em parcelas ainda PENDENTES — nenhuma parcela já paga é alterada.`
  )) return;

  corrigirParcelasContratos(problemas);
}

function corrigirParcelasContratos(problemas) {
  if (!D.financeiro) D.financeiro = [];
  let criadas = 0, corrigidas = 0;
  const fmt = v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  problemas.forEach(({ contrato: c, esperadoP20, esperadoP80, faltaP20, faltaP80, p20Errado, p80Errado, g }) => {
    const base = {
      contratoId: c.id || '', contrato: c.nome || '', evento: c.nomeEvento || c.nome || '—',
      data: c.data || '', tipo: c.tipo || '—', convidados: c.convidados || '—', status: 'pendente',
    };
    if (faltaP20) {
      D.financeiro.push({ ...base, id: _gerarId('FIN'), descricao: '20% — Assinatura do contrato',
        valorNum: esperadoP20, valor: fmt(esperadoP20), vencimento: '' });
      criadas++;
    } else if (p20Errado) {
      g.p20.valorNum = esperadoP20; g.p20.valor = fmt(esperadoP20); g.p20.valorOriginal = esperadoP20;
      corrigidas++;
    }
    if (faltaP80) {
      let venc = '';
      if (c.data) { const d = new Date(c.data + 'T12:00:00'); d.setDate(d.getDate() - 7); venc = d.toISOString().slice(0, 10); }
      D.financeiro.push({ ...base, id: _gerarId('FIN'), descricao: '80% — 7 dias antes do evento',
        valorNum: esperadoP80, valor: fmt(esperadoP80), vencimento: venc });
      criadas++;
    } else if (p80Errado) {
      g.p80.valorNum = esperadoP80; g.p80.valor = fmt(esperadoP80); g.p80.valorOriginal = esperadoP80;
      corrigidas++;
    }
  });

  sv('financeiro');
  rFinanceiro();
  alert2(`✅ ${criadas} parcela(s) criada(s), ${corrigidas} corrigida(s) para bater com o valor do contrato.`, 'success');
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
    const semCobranca = f.status !== 'pago' && !f.valorNum && !f.aprovacaoPendente;
    const vencEfetivo = _finVencimentoEfetivo(f);
    const atrasado = !semCobranca && f.status === 'pendente' && vencEfetivo && vencEfetivo < hoje;
    const tr = document.createElement('tr');
    tr.style.background = atrasado ? 'rgba(248,113,113,0.05)' : '';

    let statusCell;
    if (f.aprovacaoPendente) {
      statusCell = `
        <span class="tag" style="background:#3D2E0F;color:#FBBF24">⚠ Aguardando aprovação</span>
        <div style="font-size:10px;color:var(--text3);margin-top:3px">pago ${fR(f.aprovacaoPendente.valorPago)} · previsto ${fR(f.valorOriginal)}</div>
      `;
    } else if (semCobranca) {
      statusCell = `<span class="tag tag-green">Sem cobrança</span>`;
    } else {
      statusCell = `
        <span class="tag ${f.status==='pago'?'tag-green':atrasado?'tag-red':'tag-yellow'}">
          ${f.status==='pago'?'Pago':atrasado?'Atrasado':'Pendente'}
        </span>
        ${f.status==='pago' && f.dataPagamento ? `<div style="font-size:10px;color:var(--text3);margin-top:3px">${fd(f.dataPagamento)}${f.formaPagamento ? ' · ' + (FORMAS_PAGAMENTO[f.formaPagamento]||f.formaPagamento) : ''}</div>` : ''}
        ${f.status==='pago' && (f.comprovante || f.temComprovante) ? `<button class="btn-sm" onclick="verComprovante('${f.id}')" style="font-size:9px;padding:1px 6px;margin-top:3px" title="Ver comprovante">📎 Comprovante</button>` : ''}
      `;
    }

    let acoesCell;
    if (f.aprovacaoPendente) {
      acoesCell = (typeof perfilAtual !== 'undefined' && perfilAtual === 'admin')
        ? `<button class="btn-sm btn-green" onclick="aprovarPagamentoMenor('${f.id}')">✓ Aprovar</button>
           <button class="btn-sm btn-red" onclick="rejeitarPagamentoMenor('${f.id}')">✕ Rejeitar</button>`
        : `<span style="font-size:10px;color:var(--text3)">Aguardando admin</span>`;
    } else if (semCobranca) {
      acoesCell = `<button class="btn-sm btn-red" onclick="excluirFinanceiro('${f.id}')">✕</button>`;
    } else {
      acoesCell = `
        ${f.status==='pendente'
          ?`<button class="btn-sm btn-green" onclick="abrirModalPagamento('${f.id}')">Recebido</button>`
          :`<button class="btn-sm" onclick="marcarPendente('${f.id}')">Desfazer</button>`
        }
        <button class="btn-sm btn-red" onclick="excluirFinanceiro('${f.id}')">✕</button>
      `;
    }

    tr.innerHTML = `
      <td style="${atrasado?'color:#F87171;font-weight:600':''}">${fd(vencEfetivo)||'—'}${!f.vencimento && vencEfetivo ? ' <span style="font-size:10px;color:var(--text3)">(estimado)</span>' : ''}</td>
      <td><strong>${f.evento||f.contrato||'—'}</strong>${f.isFechamento?'<span class="tag tag-blue" style="margin-left:6px;font-size:10px">Fechamento</span>':''}</td>
      <td>${fd(f.data)||'—'}</td>
      <td>${f.tipo||'—'}</td>
      <td style="text-align:center">${f.convidados||'—'}</td>
      <td style="font-size:11px;color:var(--text3)">${f.descricao||'—'}</td>
      <td><strong style="font-family:var(--mono)">${f.valor||'—'}</strong></td>
      <td>${statusCell}</td>
      <td>${acoesCell}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Acha o contrato de um grupo (evento+data) e devolve seu valor total numérico,
// para comparar com o que já foi lançado nas parcelas 20%/80% — a fonte da
// verdade do valor do contrato é a aba Contratos, não a soma das parcelas.
function _finValorContrato(g) {
  const norm = s => (s || '').toLowerCase().trim();
  const c = (g.contratoId && (D.contratos || []).find(x => x.id === g.contratoId))
    || (D.contratos || []).find(x => norm(x.nome) === norm(g.nome) && x.data === g.data);
  if (!c) return 0;
  return parseFloat((c.opcao || '0').toString().replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

// Agrupa as parcelas do financeiro por contrato (usado pela vista sintética e
// pelos KPIs). Usa contratoId quando existe — assim, se uma parcela ficar com
// o nome/data do evento levemente diferente das outras (ex: contrato editado
// depois de criar as parcelas), elas continuam caindo na mesma linha em vez
// de "sumir" numa segunda linha escondida.
function _finAgruparEventos(fin) {
  const grupos = {};
  fin.forEach(f => {
    const chave = _finChaveContrato(f);
    if (!grupos[chave]) grupos[chave] = {
      contratoId: f.contratoId || '',
      nome:       f.evento || f.contrato || '—',
      data:       f.data   || '',
      tipo:       f.tipo   || '—',
      convidados: f.convidados || '—',
      p20: null, p80: null, pFch: null,
    };
    const g = grupos[chave];
    if (!g.contratoId && f.contratoId) g.contratoId = f.contratoId;
    const desc = (f.descricao || '').toLowerCase();
    if (f.isFechamento)                                                          g.pFch = f;
    else if (desc.includes('20%') || desc.includes('sinal') || desc.includes('assinatura')) g.p20 = g.p20 || f;
    else if (desc.includes('80%') || desc.includes('restante') || desc.includes('saldo'))   g.p80 = g.p80 || f;
    else if (!g.p20)                                                             g.p20  = f;
    else if (!g.p80)                                                             g.p80  = f;
  });
  return grupos;
}

// ── Vista Sintética ───────────────────────────────────────────────────────────
function rFinanceiroSintetico() {
  _finAtualizarKpis();
  const fin  = D.financeiro || [];
  const hoje = new Date().toISOString().slice(0, 10);

  gerarAnosFromData('fins-ano', fin.map(f => f.data));

  const filtroI = document.getElementById('fins-data-ini')?.value || '';
  const filtroF = document.getElementById('fins-data-fim')?.value || '';

  const grupos = _finAgruparEventos(fin
    .filter(f => !filtroI || (f.data && f.data >= filtroI))
    .filter(f => !filtroF || (f.data && f.data <= filtroF)));

  const tbody = document.getElementById('fins-body');
  if (!tbody) return;

  const linhas = Object.values(grupos).sort((a, b) => b.data.localeCompare(a.data));

  if (!linhas.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#8B91A8;padding:24px">Nenhum lançamento encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = '';

  linhas.forEach(g => {
    const quitado = p => p.status === 'pago' || (!p.valorNum && !p.aprovacaoPendente);
    const temAtras = [g.p20, g.p80, g.pFch].some(p => { if (!p || p.status !== 'pendente' || quitado(p)) return false; const v = _finVencimentoEfetivo(p); return v && v < hoje; });
    const todoPago = [g.p20, g.p80, g.pFch].filter(Boolean).every(quitado);

    // Subtotal = valor do contrato direto da aba Contratos — NUNCA a soma das
    // parcelas 20%/80%, que pode ficar fora de sincronia (reconciliação de
    // pagamento, correção manual, erro histórico de cadastro na importação).
    // O contrato é a fonte da verdade; se não achar o contrato vinculado, usa
    // a soma das parcelas lançadas como única alternativa disponível.
    const valorContrato   = _finValorContrato(g);
    const totalParcelas   = (g.p20?.valorNum||0) + (g.p80?.valorNum||0);
    const subtotal         = valorContrato || totalParcelas;
    const valorFechamento = g.pFch?.valorNum || 0;
    const total            = subtotal + valorFechamento;

    const saldoContrato = valorContrato ? Math.round((valorContrato - totalParcelas) * 100) / 100 : 0;
    const faltaContrato = Math.abs(saldoContrato) > 0.01;

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border)';
    if (todoPago && !faltaContrato) tr.style.opacity = '0.7';

    tr.innerHTML = `
      <td style="padding:12px;font-size:11px;color:var(--text3);white-space:nowrap">${fd(g.data)||'—'}</td>
      <td style="padding:12px">
        <strong style="font-size:13px">${g.nome}</strong>
      </td>
      <td style="padding:12px;font-size:11px;color:var(--text3)">${g.tipo}<br>${g.convidados !== '—' ? g.convidados+' conv.' : ''}</td>
      <td style="padding:10px 14px;text-align:center">${_finPilula(g.p20, hoje)}</td>
      <td style="padding:10px 14px;text-align:center">${_finPilula(g.p80, hoje)}</td>
      <td style="padding:10px 14px;text-align:center">${_finPilula(g.pFch, hoje)}</td>
      <td style="padding:12px;text-align:right;font-family:var(--mono);font-weight:700;font-size:13px;color:${faltaContrato?'var(--red)':'var(--text)'}">
        ${fR(subtotal)}
        ${faltaContrato ? `<div style="font-size:10px;font-weight:600;color:#F87171;margin-top:2px" title="Valor do contrato: ${fR(valorContrato)} · Lançado nas parcelas 20%/80%: ${fR(totalParcelas)}">⚠ ${saldoContrato>0?'falta':'excedeu'} ${fR(Math.abs(saldoContrato))}</div>` : ''}
      </td>
      <td style="padding:12px;text-align:right;font-family:var(--mono);font-weight:700;font-size:14px;color:${todoPago&&!faltaContrato?'var(--green)':temAtras?'var(--red)':'var(--text)'}">
        ${fR(total)}
      </td>`;
    tbody.appendChild(tr);
  });
}

function _finPilula(parc, hoje) {
  if (!parc) return '<span style="color:var(--text3);font-size:12px">—</span>';

  // Aguardando aprovação do admin (valor pago abaixo do previsto)
  if (parc.aprovacaoPendente) {
    const p = parc.aprovacaoPendente;
    const souAdmin = typeof perfilAtual !== 'undefined' && perfilAtual === 'admin';
    const acoes = souAdmin
      ? `<div style="margin-top:4px;display:flex;gap:4px;justify-content:center;flex-wrap:wrap">
           <button class="btn-sm btn-green" onclick="aprovarPagamentoMenor('${parc.id}')" style="font-size:9px;padding:1px 6px">✓ Aprovar</button>
           <button class="btn-sm btn-red" onclick="rejeitarPagamentoMenor('${parc.id}')" style="font-size:9px;padding:1px 6px">✕</button>
         </div>`
      : `<div style="font-size:9px;opacity:0.8;margin-top:4px">Aguardando admin</div>`;
    return `<div style="background:#3D2E0F;color:#FBBF24;border-radius:8px;padding:7px 10px;display:inline-block;min-width:110px;text-align:center">
      <div style="font-family:var(--mono);font-weight:700;font-size:13px">${fR(p.valorPago)}</div>
      <div style="font-size:10px;opacity:0.75;margin-top:2px">previsto ${fR(parc.valorOriginal)}</div>
      <div style="font-size:10px;margin-top:1px">⚠ Abaixo do valor</div>
      ${acoes}
    </div>`;
  }

  // Sem valor a receber (fechamento sem cobrança, ou parcela zerada por uma
  // cascata de excedente) — não exige ação, mesmo que o status ainda diga "pendente"
  const semCobranca = parc.status !== 'pago' && !parc.valorNum;
  if (semCobranca) {
    return `<div style="background:#1A3D2B;color:#4ADE80;border-radius:8px;padding:7px 10px;display:inline-block;min-width:110px;text-align:center">
      <div style="font-size:10px">Sem cobrança</div>
    </div>`;
  }

  const vencEfetivo = _finVencimentoEfetivo(parc);
  const atrasado = parc.status === 'pendente' && vencEfetivo && vencEfetivo < hoje;
  const pago     = parc.status === 'pago';
  const bg    = pago ? '#1A3D2B' : atrasado ? '#3D1A1A' : '#2A2F42';
  const cor   = pago ? '#4ADE80' : atrasado ? '#F87171' : '#FBBF24';
  const label = pago ? 'Pago'    : atrasado ? '⚠ Atrasado' : 'Pendente';
  const venc  = vencEfetivo
    ? `<div style="font-size:10px;opacity:0.75;margin-top:2px">venc. ${fd(vencEfetivo)}${!parc.vencimento ? ' (estimado)' : ''}</div>`
    : '';
  const pagoEm = pago && parc.dataPagamento ? `<div style="font-size:10px;opacity:0.75;margin-top:2px">pago em ${fd(parc.dataPagamento)}${parc.formaPagamento ? ' · ' + (FORMAS_PAGAMENTO[parc.formaPagamento]||parc.formaPagamento) : ''}${parc._quitadoPorAjuste ? ' · quitado automaticamente' : ''}</div>` : '';
  const botao = pago
    ? `<div style="margin-top:4px;display:flex;gap:4px;justify-content:center;flex-wrap:wrap">
         ${(parc.comprovante || parc.temComprovante) ? `<button class="btn-sm" onclick="verComprovante('${parc.id}')" style="font-size:9px;padding:1px 6px" title="Ver comprovante">📎</button>` : ''}
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

function _abrirComprovanteJanela(base64, tipo, nome) {
  const w = window.open('');
  if (!w) { alert2('Permita pop-ups para visualizar o comprovante.', 'error'); return null; }
  w.document.title = nome || 'Comprovante';
  if ((tipo || '').includes('pdf')) {
    w.document.write(`<iframe src="${base64}" style="width:100%;height:100vh;border:none"></iframe>`);
  } else {
    w.document.write(`<body style="margin:0;background:#111"><img src="${base64}" style="max-width:100%;display:block;margin:0 auto"></body>`);
  }
  return w;
}

// Comprovantes recentes ficam num documento próprio no Firestore (não embutidos
// no financeiro — ver salvarComprovante em index.html). Entradas antigas ainda
// podem ter o comprovante embutido direto em f.comprovante (compatibilidade).
async function verComprovante(id) {
  const f = (D.financeiro || []).find(x => x.id === id);
  if (!f) { alert2('Lançamento não encontrado.', 'error'); return; }
  if (!f.comprovante && !f.temComprovante) { alert2('Nenhum comprovante anexado.', 'error'); return; }

  if (f.comprovante) {
    _abrirComprovanteJanela(f.comprovante, f.comprovanteTipo, f.comprovanteNome);
    return;
  }

  // Abre a janela já (dentro do clique do usuário, senão o navegador bloqueia
  // o pop-up) e preenche assim que o comprovante chegar do Firestore.
  const w = window.open('');
  if (!w) { alert2('Permita pop-ups para visualizar o comprovante.', 'error'); return; }
  w.document.write('<body style="margin:0;background:#111;color:#ccc;font-family:sans-serif;padding:20px">Carregando comprovante…</body>');

  if (!window.buscarComprovante) { w.document.body.textContent = 'Não foi possível carregar o comprovante.'; return; }
  const dados = await window.buscarComprovante(id);
  if (!dados) { w.document.body.textContent = 'Comprovante não encontrado.'; return; }

  w.document.title = dados.nome || 'Comprovante';
  w.document.body.innerHTML = (dados.tipo || '').includes('pdf')
    ? `<iframe src="${dados.base64}" style="width:100%;height:100vh;border:none"></iframe>`
    : `<img src="${dados.base64}" style="max-width:100%;display:block;margin:0 auto">`;
}

// Aplica um EXCEDENTE (pagou a mais) às próximas parcelas pendentes do mesmo
// contrato, em cascata, para que o valor total do contrato permaneça correto.
// Parcela totalmente quitada pelo excedente já é marcada como paga na hora —
// não fica pendente esperando um "Recebido" de R$ 0,00 (ver marcarPendente para o desfazer).
// Só lida com excedente (diff > 0). Falta de pagamento (diff < 0) nunca cria
// lançamento automático nem mexe em outras parcelas — depende de aprovação do
// admin, ver confirmarPagamento/aprovarPagamentoMenor.
function _aplicarAjusteContrato(f, diff) {
  const norm = s => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
  // Casa por contratoId OU por nome+data do evento — não só uma coisa ou só a
  // outra. Se uma parcela tiver o contratoId e a parcela irmã não (ou os dois
  // tiverem, mas divergentes por algum problema de cadastro), ainda assim
  // acham uma a outra pelo nome+data em vez de a cascata falhar silenciosamente.
  const mesmoContrato = o =>
    (f.contratoId && o.contratoId && o.contratoId === f.contratoId) ||
    (norm(o.contrato || o.evento) === norm(f.contrato || f.evento) && (o.data || '') === (f.data || ''));
  const pendentes = (D.financeiro || [])
    .filter(o => o.id !== f.id && o.status === 'pendente' && !o.aprovacaoPendente && mesmoContrato(o))
    .sort((a, b) => (a.vencimento || '').localeCompare(b.vencimento || '') || a.id.localeCompare(b.id));

  const ajustes = [];
  const fmt = v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  let resto = diff;

  for (const p of pendentes) {
    if (resto <= 0) break;
    const reduz = Math.min(resto, p.valorNum || 0);
    if (reduz <= 0) continue;
    if (p.valorOriginal === undefined) p.valorOriginal = p.valorNum;
    p.valorNum -= reduz; p.valor = fmt(p.valorNum);
    resto -= reduz;
    ajustes.push({ id: p.id, delta: -reduz });
    if (p.valorNum <= 0) {
      // Excedente cobriu essa parcela inteira: já quita automaticamente.
      p.status = 'pago';
      p.valorPago = 0;
      p.dataPagamento = f.dataPagamento;
      p.formaPagamento = f.formaPagamento;
      p._quitadoPorAjuste = true;
    }
  }

  return { ajustes, resto };
}

async function confirmarPagamento() {
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

  // Comprovante fica num documento próprio no Firestore (nunca embutido no
  // array "financeiro" — ver salvarComprovante em index.html), pra esse
  // documento único nunca chegar perto do limite de 1MB por documento.
  // Falha ao salvar o comprovante NÃO bloqueia o pagamento — só avisa depois,
  // pra um problema de permissão/rede no upload não travar o financeiro inteiro.
  let comprovanteSalvo = false;
  let avisoComprovante = '';
  if (comprovante) {
    comprovanteSalvo = window.salvarComprovante ? await window.salvarComprovante(id, comprovante, comprovanteTipo, comprovanteNome) : false;
    if (!comprovanteSalvo) avisoComprovante = ' ⚠️ O comprovante NÃO pôde ser salvo (erro acima) — anexe de novo quando o problema for resolvido.';
  }

  if (f.valorOriginal === undefined) f.valorOriginal = f.valorNum;
  const diff = Math.round((valorPago - f.valorOriginal) * 100) / 100;
  const souAdmin = typeof perfilAtual !== 'undefined' && perfilAtual === 'admin';

  // Valor abaixo do previsto (ex: NF com desconto) e quem está lançando não é
  // admin: fica pendente de aprovação. A parcela só é dada como quitada depois
  // que um admin confirmar — o financeiro não pode liberar isso sozinho.
  if (diff < 0 && !souAdmin) {
    f.aprovacaoPendente = {
      valorPago, dataPagamento, formaPagamento, temComprovante: comprovanteSalvo, comprovanteTipo, comprovanteNome,
      registradoPor: (typeof perfilAtual !== 'undefined' && perfilAtual) || '',
      registradoEm: new Date().toISOString(),
    };
    sv('financeiro');
    closeM('mpagamento');
    _finRefresh();
    alert2(`Valor pago (${fR(valorPago)}) é menor que o previsto (${fR(f.valorOriginal)}). Enviado para aprovação do administrador — só fica quitado depois da liberação.${avisoComprovante}`, 'error');
    return;
  }

  f.status           = 'pago';
  f.dataPagamento     = dataPagamento;
  f.valorPago         = valorPago;
  f.valorNum           = valorPago;
  f.valor             = 'R$ ' + valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  f.formaPagamento     = formaPagamento;
  f.temComprovante     = comprovanteSalvo;
  f.comprovanteTipo    = comprovanteTipo;
  f.comprovanteNome    = comprovanteNome;
  f.aprovacaoPendente  = null;

  let resto = 0;
  if (diff > 0) {
    const r = _aplicarAjusteContrato(f, diff);
    f._ajustes = r.ajustes;
    resto = r.resto;
  } else {
    f._ajustes = [];
  }

  sv('financeiro');
  closeM('mpagamento');
  _finRefresh();

  let msg = 'Pagamento registrado com sucesso!';
  let ehErro = false;
  if (diff > 0) {
    if (resto > 0) {
      msg = `Pagamento registrado, mas sobraram ${fR(resto)} do excedente que NÃO foi possível aplicar a nenhuma parcela pendente do contrato (nenhuma parcela irmã encontrada, ou já estão todas quitadas). Verifique manualmente.`;
      ehErro = true;
    } else {
      msg = `Pagamento registrado! Excedente de ${fR(diff)} aplicado automaticamente à(s) próxima(s) parcela(s).`;
    }
  } else if (diff < 0) {
    msg = `Pagamento registrado com valor abaixo do previsto (faltam ${fR(-diff)}), autorizado como administrador.`;
  }
  alert2(msg + avisoComprovante, (avisoComprovante || ehErro) ? 'error' : 'success');
}

// ── Aprovação de pagamento abaixo do valor previsto (somente admin) ─────────
function aprovarPagamentoMenor(id) {
  if (!(typeof perfilAtual !== 'undefined' && perfilAtual === 'admin')) {
    alert2('Somente o administrador pode aprovar pagamentos abaixo do valor do contrato.', 'error');
    return;
  }
  const f = (D.financeiro || []).find(x => x.id === id);
  if (!f || !f.aprovacaoPendente) return;
  const p = f.aprovacaoPendente;
  if (!confirm(
    `Confirmar aprovação de pagamento abaixo do valor previsto?\n\n` +
    `Valor previsto: ${fR(f.valorOriginal)}\nValor pago: ${fR(p.valorPago)}\nDiferença: ${fR(p.valorPago - f.valorOriginal)}\n\n` +
    `Essa diferença será aceita como definitiva — nenhum valor será cobrado a mais em outra parcela.`
  )) return;

  f.status           = 'pago';
  f.dataPagamento     = p.dataPagamento;
  f.valorPago         = p.valorPago;
  f.valorNum           = p.valorPago;
  f.valor             = 'R$ ' + p.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  f.formaPagamento     = p.formaPagamento;
  f.temComprovante     = p.temComprovante; // já salvo no Firestore em confirmarPagamento
  f.comprovanteTipo    = p.comprovanteTipo;
  f.comprovanteNome    = p.comprovanteNome;
  f.aprovadoPor        = (typeof perfilAtual !== 'undefined' && perfilAtual) || '';
  f.aprovacaoPendente  = null;

  sv('financeiro'); _finRefresh();
  alert2('Pagamento aprovado e quitado!', 'success');
}

function rejeitarPagamentoMenor(id) {
  const f = (D.financeiro || []).find(x => x.id === id);
  if (!f || !f.aprovacaoPendente) return;
  if (!confirm('Rejeitar este pagamento? O comprovante enviado será descartado e a parcela volta a ficar pendente para lançar novamente.')) return;
  if (f.aprovacaoPendente.temComprovante && window.excluirComprovante) window.excluirComprovante(id);
  f.aprovacaoPendente = null;
  sv('financeiro'); _finRefresh();
  alert2('Pagamento rejeitado. A parcela voltou a ficar pendente.', 'success');
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
        if (alvo && (alvo.status === 'pendente' || alvo._quitadoPorAjuste)) {
          alvo.valorNum = Math.max(0, alvo.valorNum - a.delta);
          alvo.valor = 'R$ ' + alvo.valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          if (alvo._quitadoPorAjuste) {
            alvo.status = 'pendente';
            alvo.dataPagamento = '';
            alvo.formaPagamento = '';
            alvo.valorPago = null;
            alvo._quitadoPorAjuste = false;
          }
        }
      }
    });
    f._ajustes = [];
  }

  if (f.valorOriginal !== undefined) {
    f.valorNum = f.valorOriginal;
    f.valor = 'R$ ' + f.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  if ((f.comprovante || f.temComprovante) && window.excluirComprovante) window.excluirComprovante(id);

  f.status = 'pendente';
  f.dataPagamento = '';
  f.valorPago = null;
  f.formaPagamento = '';
  f.comprovante = '';
  f.temComprovante = false;
  f.comprovanteTipo = '';
  f.comprovanteNome = '';
  f.aprovacaoPendente = null;
  f._quitadoPorAjuste = false;

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
