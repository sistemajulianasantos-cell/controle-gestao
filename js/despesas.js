// ─── ANÁLISE DE DESPESAS ─────────────────────────────────────────────────────

const _CATS_DESP_DEFAULT = ['Pessoal','Fornecedores','Infraestrutura','Marketing','Operacional','Impostos','Outros'];

function _getCategoriasDespesas() {
  return (D.categoriasDespesas && D.categoriasDespesas.length) ? D.categoriasDespesas : [..._CATS_DESP_DEFAULT];
}

const _FORMAS_DESP = {
  dinheiro:       { label: 'Dinheiro',      bg: '#1A2E1A', cor: '#4FC78E' },
  pix:            { label: 'PIX',           bg: '#0A2E1A', cor: '#10B981' },
  pix_manual:     { label: 'PIX',           bg: '#0A2E1A', cor: '#10B981' },
  pix_nota:       { label: 'PIX+Nota',      bg: '#0A2430', cor: '#06B6D4' },
  cartao_credito: { label: 'Cartão Créd.',  bg: '#1D2E45', cor: '#60A5FA' },
  cartao_debito:  { label: 'Cartão Déb.',   bg: '#1A2040', cor: '#818CF8' },
  boleto:         { label: 'Boleto',        bg: '#1D3461', cor: '#3B82F6' },
  transferencia:  { label: 'Transferência', bg: '#1A2840', cor: '#38BDF8' },
  cheque:         { label: 'Cheque',        bg: '#2A2820', cor: '#F59E0B' },
  outros:         { label: 'Outros',        bg: '#2A2F42', cor: '#8B91A8' },
};

function _detectarFormaDespesa(d) {
  if (d.forma) return d.forma;
  const desc = (d.descricao || '').toUpperCase();
  if (desc.startsWith('BO ')) return 'boleto';
  if (desc.startsWith('CO ')) return 'pix_manual';
  if (desc.startsWith('PI ')) return 'pix_nota';
  return '';
}

function _descricaoSemPrefixo(d) {
  if (d.forma) return d.descricao || '';
  return (d.descricao || '').replace(/^(BO|CO|PI)\s+/i, '');
}

function _formaTag(forma) {
  if (!forma) return '<span style="color:#8B91A8;font-size:12px">—</span>';
  const f = _FORMAS_DESP[forma] || _FORMAS_DESP.outros;
  return `<span style="background:${f.bg};color:${f.cor};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;border:1px solid ${f.cor}40">${f.label}</span>`;
}

function _statusDesp(d) {
  if (d.dataPagamento || d.status === 'pago') return 'pago';
  const hoje = new Date().toISOString().slice(0, 10);
  if (d.dataVencimento && d.dataVencimento < hoje) return 'vencido';
  return 'pendente';
}

function _statusTag(status) {
  const MAP = {
    pago:     { label: 'Pago',     bg: '#0A2E1A', cor: '#10B981' },
    vencido:  { label: 'Vencido',  bg: '#2E1010', cor: '#F74F6B' },
    pendente: { label: 'Pendente', bg: '#251E0A', cor: '#F59E0B' },
  };
  const s = MAP[status] || MAP.pendente;
  return `<span style="background:${s.bg};color:${s.cor};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;border:1px solid ${s.cor}40">${s.label}</span>`;
}

function _populateCategoriasSelects() {
  const cats = _getCategoriasDespesas();
  ['desp-form-cat', 'desp-edit-cat', 'fn-cat', 'fn-edit-cat'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value;
    el.innerHTML = '<option value="">Selecione...</option>' + cats.map(c => `<option value="${c}" ${c===val?'selected':''}>${c}</option>`).join('');
  });
}

function _populateFornecedoresDespesas() {
  const opts = '<option value="">Nenhum</option>' + (D.fornecedores||[]).map(f=>`<option value="${f.nome}">${f.nome}</option>`).join('');
  ['desp-form-forn','desp-edit-forn'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.innerHTML=opts;
  });
}

function _autoFillCatFromForn(val, catId) {
  const el=document.getElementById(catId); if(!el) return;
  if(!val){ el.disabled=false; return; }
  const forn=(D.fornecedores||[]).find(f=>f.nome===val);
  if(forn && forn.categoria){ el.value=forn.categoria; }
  el.disabled=!!forn; // bloqueia se há fornecedor cadastrado (independente de ter categoria)
}

function _chaveDesp(data, descricao, valor) {
  return `${data}|${(descricao||'').trim().toLowerCase()}|${Math.round((valor||0)*100)}`;
}

function _isDespesaDuplicada(data, descricao, valor) {
  const k = _chaveDesp(data, descricao, valor);
  return (D.despesas||[]).some(d => _chaveDesp(d.data, d.descricao, d.valor) === k);
}

function removerDuplicatasDespesas() {
  if (!confirm('Remover despesas com mesma data, descrição e valor (mantém a primeira)?')) return;
  const antes = (D.despesas||[]).length;
  if (!antes) { alert2('Nenhuma despesa cadastrada.'); return; }
  const seen = new Set();
  D.despesas = D.despesas.filter(d => {
    const k = _chaveDesp(d.data, d.descricao, d.valor);
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
  const removidos = antes - D.despesas.length;
  if (!removidos) { alert2('Nenhuma duplicata encontrada.'); return; }
  sv('despesas');
  rDespesasLista();
  alert2(`${removidos} duplicata(s) removida(s)!`, 'success');
}

function _registrarPagamentoEquipeComoDespesa(p) {
  if (!D.despesas) D.despesas = [];
  if (D.despesas.some(d => d.pagamentoEquipeId === p.id)) return;
  const cats = _getCategoriasDespesas();
  const cat  = cats.includes('Pessoal') ? 'Pessoal' : (cats[0] || 'Pessoal');
  D.despesas.push({
    id:               'DESP_PE_' + p.id,
    data:             p.dataPagamento || p.dataEvento || new Date().toISOString().slice(0,10),
    categoria:        cat,
    descricao:        `${p.nomeColab} – ${p.nomeEvento}`,
    valor:            p.total,
    obs:              `Pgto equipe${p.cargo?' – '+p.cargo:''}`,
    pagamentoEquipeId: p.id,
    fornecedor:       '',
    forma:            'pix_manual',
  });
}

function _removerDespesaPagamentoEquipe(pagId) {
  if (!D.despesas) return;
  D.despesas = D.despesas.filter(d => d.pagamentoEquipeId !== pagId);
}

function _removerDespesasDoEvento(contratoId) {
  if (!D.despesas) return;
  D.despesas = D.despesas.filter(d => !d.pagamentoEquipeId?.startsWith('PE_' + contratoId + '_'));
}

function _sincronizarCategoriasComFornecedores() {
  if (!D.despesas || !D.fornecedores) return;
  let changed = false;
  D.fornecedores.forEach(f => {
    if (!f.nome || !f.categoria) return;
    const nomeLower = f.nome.trim().toLowerCase();
    if (nomeLower.length < 3) return;
    D.despesas.forEach(d => {
      const matchForn = d.fornecedor === f.nome;
      const descLower = (d.descricao || '').trim().toLowerCase();
      const matchDesc = !d.fornecedor &&
        (descLower === nomeLower || descLower.startsWith(nomeLower + ' '));
      if (matchForn || matchDesc) {
        if (matchDesc) { d.fornecedor = f.nome; changed = true; }
        if (d.categoria !== f.categoria) { d.categoria = f.categoria; changed = true; }
      }
    });
  });
  if (changed) sv('despesas');
}

function _limparDescricoesParcelas() {
  if (!D.despesas) return;
  let changed = false;
  D.despesas.forEach(d => {
    const nova = (d.descricao || '').replace(/\s*[-–]\s*\d+\/\d+\s*$/, '').trim();
    if (nova !== d.descricao) { d.descricao = nova; changed = true; }
  });
  if (changed) sv('despesas');
}

function rDespesas() {
  _sincronizarCategoriasComFornecedores();
  _limparDescricoesParcelas();
  const subView = document.getElementById('desp-sub-view')?.value || 'kpi';
  ['kpi', 'lancar', 'lista', 'importar', 'categorias'].forEach(v => {
    const el = document.getElementById('desp-view-' + v);
    if (el) el.style.display = v === subView ? '' : 'none';
  });
  document.querySelectorAll('[data-desp-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.despTab === subView);
  });
  _populateCategoriasSelects();
  _populateFornecedoresDespesas();
  if (subView === 'kpi') rDespesasKpi();
  else if (subView === 'lista') rDespesasLista();
  else if (subView === 'categorias') rDespesasCategorias();
}

function despSetView(v) {
  const input = document.getElementById('desp-sub-view');
  if (input) { input.value = v; rDespesas(); }
}

function rDespesasKpi() {
  const mes = document.getElementById('desp-mes')?.value || '';
  const ano = document.getElementById('desp-ano')?.value || new Date().getFullYear().toString();

  // Faturamento: soma dos contratos do período (igual à aba Análise)
  const contratosKpi = (D.contratos || []).filter(c => {
    if (!c.data) return false;
    if (!c.data.startsWith(ano)) return false;
    if (mes && !c.data.startsWith(`${ano}-${mes}`)) return false;
    return true;
  });
  const receita = contratosKpi.reduce((s, c) => {
    const v = parseFloat((c.opcao || '0').toString().replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    return s + v;
  }, 0);

  // Recebido em caixa: parcelas pagas no período
  const parcelas = (D.financeiro || []).filter(f => {
    if (f.status !== 'pago') return false;
    const ref = f.vencimento || f.data || '';
    if (!ref) return false;
    if (ano && !ref.startsWith(ano)) return false;
    if (mes && !ref.startsWith(`${ano}-${mes}`)) return false;
    return true;
  });
  const recebidoCaixa = parcelas.reduce((s, f) => s + (f.valorNum || 0), 0);

  // Despesas: lançamentos do mês/ano
  const despesasFiltradas = (D.despesas || []).filter(d => {
    const ref = d.data || '';
    if (ano && !ref.startsWith(ano)) return false;
    if (mes && !ref.startsWith(`${ano}-${mes}`)) return false;
    return true;
  });
  const totalDespesas = despesasFiltradas.reduce((s, d) => s + (d.valor || 0), 0);

  // Meta de faturamento do período
  const MESES_KPI = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const meta = mes
    ? parseFloat((D.metas || {})[`${ano}-${mes}`]?.fat || 0)
    : MESES_KPI.reduce((s, m) => s + parseFloat((D.metas || {})[`${ano}-${m}`]?.fat || 0), 0);

  const resultado = receita - totalDespesas;
  const margem = receita > 0 ? ((resultado / receita) * 100).toFixed(1) : 0;
  const percDespVsRec = receita > 0 ? Math.min(100, (totalDespesas / receita) * 100).toFixed(0) : 0;
  const percRecVsMeta = meta > 0 ? Math.min(100, (receita / meta) * 100).toFixed(0) : 0;
  const aReceberKpi = receita - recebidoCaixa;

  // Breakdown por status de pagamento
  let totalPago = 0, totalPendente = 0, totalVencido = 0;
  despesasFiltradas.forEach(d => {
    const st = _statusDesp(d);
    if (st === 'pago')     totalPago     += (d.valor || 0);
    else if (st === 'vencido') totalVencido += (d.valor || 0);
    else                   totalPendente += (d.valor || 0);
  });

  // Breakdown por categoria
  const byCategoria = {};
  despesasFiltradas.forEach(d => {
    const cat = d.categoria || 'Outros';
    byCategoria[cat] = (byCategoria[cat] || 0) + (d.valor || 0);
  });

  const el = document.getElementById('desp-view-kpi');
  if (!el) return;

  const corResultado = resultado >= 0 ? '#10B981' : '#F74F6B';
  const corPercDesp = parseFloat(percDespVsRec) > 80 ? '#F74F6B' : parseFloat(percDespVsRec) > 60 ? '#F59E0B' : '#10B981';

  el.innerHTML = `
    <div class="cards" style="margin-bottom:20px">
      <div class="card">
        <div class="card-label">💰 Faturamento</div>
        <div class="card-val" style="color:#10B981">${fR(receita)}</div>
        <div style="font-size:11px;color:#8B91A8;margin-top:4px">${contratosKpi.length} contrato(s) • recebido: <span style="color:#4FC78E">${fR(recebidoCaixa)}</span>${aReceberKpi > 0 ? ` • a receber: <span style="color:#F7C84F">${fR(aReceberKpi)}</span>` : ''}</div>
      </div>
      <div class="card">
        <div class="card-label">💸 Total de Despesas</div>
        <div class="card-val" style="color:#F74F6B">${fR(totalDespesas)}</div>
        <div style="font-size:11px;color:#8B91A8;margin-top:4px">${despesasFiltradas.length} lançamento(s)</div>
      </div>
      <div class="card">
        <div class="card-label">📊 Resultado</div>
        <div class="card-val" style="color:${corResultado}">${fR(resultado)}</div>
        <div style="font-size:11px;color:#8B91A8;margin-top:4px">Margem: ${margem}%</div>
      </div>
      <div class="card">
        <div class="card-label">🎯 Meta Faturamento</div>
        <div class="card-val" style="color:#F59E0B">${meta ? fR(meta) : '—'}</div>
        <div style="font-size:11px;color:#8B91A8;margin-top:4px">${meta ? percRecVsMeta + '% atingido' : 'Não definida'}</div>
      </div>
    </div>

    <div class="cards" style="margin-bottom:20px">
      <div class="card" style="border-left:3px solid #10B981">
        <div class="card-label">✅ Pagas</div>
        <div class="card-val" style="color:#10B981">${fR(totalPago)}</div>
        <div style="font-size:11px;color:#8B91A8;margin-top:4px">${despesasFiltradas.filter(d=>_statusDesp(d)==='pago').length} despesa(s)</div>
      </div>
      <div class="card" style="border-left:3px solid #F59E0B">
        <div class="card-label">⏳ A Pagar</div>
        <div class="card-val" style="color:#F59E0B">${fR(totalPendente)}</div>
        <div style="font-size:11px;color:#8B91A8;margin-top:4px">${despesasFiltradas.filter(d=>_statusDesp(d)==='pendente').length} despesa(s)</div>
      </div>
      <div class="card" style="border-left:3px solid #F74F6B">
        <div class="card-label">🚨 Vencidas</div>
        <div class="card-val" style="color:#F74F6B">${fR(totalVencido)}</div>
        <div style="font-size:11px;color:#8B91A8;margin-top:4px">${despesasFiltradas.filter(d=>_statusDesp(d)==='vencido').length} despesa(s)</div>
      </div>
    </div>

    <div class="sec" style="margin-bottom:16px">
      <div class="sec-head"><span class="sec-title">Indicadores</span></div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:16px">
        <div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#8B91A8;margin-bottom:6px">
            <span>Despesas vs Receita</span>
            <span style="color:${corPercDesp};font-weight:600">${percDespVsRec}%</span>
          </div>
          <div style="background:#2A2F42;border-radius:6px;height:10px;overflow:hidden">
            <div style="height:100%;width:${percDespVsRec}%;background:${corPercDesp};border-radius:6px;transition:.4s"></div>
          </div>
        </div>
        ${meta ? `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#8B91A8;margin-bottom:6px">
            <span>Receita vs Meta</span>
            <span style="color:#10B981;font-weight:600">${percRecVsMeta}%</span>
          </div>
          <div style="background:#2A2F42;border-radius:6px;height:10px;overflow:hidden">
            <div style="height:100%;width:${percRecVsMeta}%;background:#10B981;border-radius:6px;transition:.4s"></div>
          </div>
        </div>` : ''}
      </div>
    </div>

    ${Object.keys(byCategoria).length ? `
    <div class="sec">
      <div class="sec-head"><span class="sec-title">Despesas por Categoria</span></div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="color:#8B91A8;border-bottom:1px solid #2A2F42">
              <th style="padding:10px 12px;text-align:left;font-weight:500">Categoria</th>
              <th style="padding:10px 12px;text-align:right;font-weight:500">Total</th>
              <th style="padding:10px 12px;text-align:right;font-weight:500">% das despesas</th>
              <th style="padding:10px 12px;text-align:left;font-weight:500"></th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(byCategoria).sort((a, b) => b[1] - a[1]).map(([cat, val]) => {
              const pct = totalDespesas > 0 ? ((val / totalDespesas) * 100).toFixed(1) : 0;
              return `<tr style="border-bottom:1px solid #1E2235">
                <td style="padding:10px 12px">${cat}</td>
                <td style="padding:10px 12px;text-align:right;color:#F74F6B;font-weight:600">${fR(val)}</td>
                <td style="padding:10px 12px;text-align:right;color:#8B91A8">${pct}%</td>
                <td style="padding:10px 12px;min-width:140px">
                  <div style="background:#2A2F42;border-radius:4px;height:6px;overflow:hidden">
                    <div style="height:100%;width:${pct}%;background:#F74F6B;border-radius:4px"></div>
                  </div>
                </td>
              </tr>`;
            }).join('')}
            <tr style="border-top:2px solid #2A2F42;font-weight:600">
              <td style="padding:10px 12px">Total</td>
              <td style="padding:10px 12px;text-align:right;color:#F74F6B">${fR(totalDespesas)}</td>
              <td style="padding:10px 12px;text-align:right">100%</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>` : `
    <div style="text-align:center;color:#8B91A8;padding:40px">
      Nenhuma despesa lançada para este período.<br>
      <button class="btn" style="margin-top:16px" onclick="despSetView('lancar')">➕ Lançar Despesa</button>
    </div>`}
  `;
}

function rDespesasLista() {
  const mes = document.getElementById('desp-mes')?.value || '';
  const ano = document.getElementById('desp-ano')?.value || new Date().getFullYear().toString();

  // Atualiza o filtro de categorias dinamicamente (inclui categorias do PDF)
  const catSelect = document.getElementById('desp-cat-filtro');
  if (catSelect) {
    const currentVal = catSelect.value;
    const allCats = [...new Set((D.despesas || []).map(d => d.categoria).filter(Boolean))].sort();
    catSelect.innerHTML = '<option value="">Todas as categorias</option>' +
      allCats.map(c => `<option value="${c}"${c === currentVal ? ' selected' : ''}>${c}</option>`).join('');
  }
  const catFiltro   = catSelect?.value || '';
  const statusFiltro = document.getElementById('desp-status-filtro')?.value || '';
  const ordemLista  = document.getElementById('desp-lista-ordem')?.value || 'data_asc';

  const _sortFns = {
    data_asc:   (a,b) => (a.data||'').localeCompare(b.data||''),
    data_desc:  (a,b) => (b.data||'').localeCompare(a.data||''),
    venc_asc:   (a,b) => (a.dataVencimento||'9999').localeCompare(b.dataVencimento||'9999'),
    venc_desc:  (a,b) => (b.dataVencimento||'').localeCompare(a.dataVencimento||''),
    valor_asc:  (a,b) => (a.valor||0)-(b.valor||0),
    valor_desc: (a,b) => (b.valor||0)-(a.valor||0),
    cat_az:     (a,b) => (a.categoria||'').localeCompare(b.categoria||'', 'pt-BR'),
    cat_za:     (a,b) => (b.categoria||'').localeCompare(a.categoria||'', 'pt-BR'),
    desc_az:    (a,b) => (a.descricao||'').localeCompare(b.descricao||'', 'pt-BR'),
    desc_za:    (a,b) => (b.descricao||'').localeCompare(a.descricao||'', 'pt-BR'),
  };

  const lista = (D.despesas || []).filter(d => {
    const ref = d.data || '';
    if (ano && !ref.startsWith(ano)) return false;
    if (mes && !ref.startsWith(`${ano}-${mes}`)) return false;
    if (catFiltro && d.categoria !== catFiltro) return false;
    if (statusFiltro && _statusDesp(d) !== statusFiltro) return false;
    return true;
  }).sort(_sortFns[ordemLista] || _sortFns.data_asc);

  const tbody = document.getElementById('desp-lista-body');
  if (!tbody) return;

  const total = lista.reduce((s, d) => s + (d.valor || 0), 0);
  const totEl = document.getElementById('desp-lista-total');
  if (totEl) totEl.textContent = fR(total);

  tbody.innerHTML = '';
  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#8B91A8;padding:24px">Nenhuma despesa encontrada para este período.</td></tr>';
    return;
  }

  lista.forEach(d => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #1E2235';
    const forma  = _detectarFormaDespesa(d);
    const desc   = _descricaoSemPrefixo(d);
    const status = _statusDesp(d);
    const descEsc = (d.descricao||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');
    const temForn = !!(d.fornecedor && (D.fornecedores||[]).find(f=>f.nome===d.fornecedor));
    const vencCell = d.dataVencimento
      ? `<span style="color:${status==='vencido'?'#F74F6B':status==='pago'?'#8B91A8':'#F59E0B'};font-size:12px">${fd(d.dataVencimento)}</span>`
      : `<span style="color:#8B91A8;font-size:12px">—</span>`;
    const catCell = temForn
      ? `<td style="padding:8px 10px" title="Categoria gerenciada pelo fornecedor">
           <span class="tag" style="background:#2A2F42;color:#CDD3E3;border:none;opacity:.75">${d.categoria||'—'}</span>
         </td>`
      : `<td style="padding:4px 10px">
           <select onchange="editarCategoriaDespesa('${d.id}','${descEsc}',this.value)"
             style="background:#2A2F42;color:#CDD3E3;border:1px solid #3A4055;border-radius:4px;font-size:11px;padding:2px 6px;cursor:pointer;max-width:120px">
             ${_getCategoriasDespesas().map(c=>`<option value="${c}"${c===d.categoria?' selected':''}>${c}</option>`).join('')}
           </select>
         </td>`;
    const pagCell = status === 'pago' && d.dataPagamento
      ? `<div style="font-size:10px;color:#10B981;margin-top:2px">Pago em ${fd(d.dataPagamento)}</div>` : '';
    tr.innerHTML = `
      <td style="padding:8px 10px;white-space:nowrap">${fd(d.data)||'—'}</td>
      <td style="padding:8px 10px;white-space:nowrap">${vencCell}</td>
      <td style="padding:8px 10px">${_statusTag(status)}</td>
      ${catCell}
      <td style="padding:8px 10px">${_formaTag(forma)}</td>
      <td style="padding:8px 10px">${desc||'—'}${d.fornecedor?`<div style="font-size:10px;color:#8B91A8;margin-top:2px">${d.fornecedor}</div>`:''}${pagCell}</td>
      <td style="padding:8px 10px;color:#F74F6B;font-weight:600;white-space:nowrap">${fR(d.valor||0)}</td>
      <td style="padding:8px 10px;white-space:nowrap">
        <div style="display:flex;gap:4px;align-items:center">
          ${status !== 'pago' ? `<button class="btn-sm" onclick="marcarDespesaPaga('${d.id}')" style="background:#0A2E1A;border:1px solid #10B98140;color:#10B981;font-size:11px;padding:2px 7px" title="Marcar como pago">✓ Pagar</button>` : ''}
          <button class="btn-sm" onclick="abrirEditDespesa('${d.id}')" style="background:var(--bg3);border:1px solid var(--border2)" title="Editar">✏️</button>
          <button class="btn-sm btn-red" onclick="excluirDespesa('${d.id}')" title="Excluir">✕</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editarCategoriaDespesa(id, descricao, novaCategoria) {
  const idx = (D.despesas||[]).findIndex(d => d.id === id);
  if (idx < 0) return;
  D.despesas[idx].categoria = novaCategoria;
  const descLower = (descricao||'').trim().toLowerCase();
  const iguais = (D.despesas||[]).filter((d,i) =>
    i !== idx && (d.descricao||'').trim().toLowerCase() === descLower && d.categoria !== novaCategoria
  );
  if (iguais.length > 0 && confirm(`Aplicar "${novaCategoria}" para todas as ${iguais.length+1} despesas com descrição "${descricao}"?`)) {
    iguais.forEach(d => { d.categoria = novaCategoria; });
    // Atualiza também o fornecedor cadastrado, se existir
    const forn = (D.fornecedores||[]).find(f => f.nome.trim().toLowerCase() === descLower);
    if (forn) { forn.categoria = novaCategoria; sv('fornecedores'); }
  }
  sv('despesas');
  rDespesasLista();
}

var _salvandoDespesa = false;
function salvarDespesa() {
  if (_salvandoDespesa) return;
  _salvandoDespesa = true;
  const data       = document.getElementById('desp-form-data')?.value;
  const categoria  = document.getElementById('desp-form-cat')?.value;
  const forma      = document.getElementById('desp-form-forma')?.value || '';
  const fornecedor = document.getElementById('desp-form-forn')?.value || '';
  const descricao  = document.getElementById('desp-form-desc')?.value?.trim();
  const valorStr   = document.getElementById('desp-form-valor')?.value;
  const obs        = document.getElementById('desp-form-obs')?.value?.trim() || '';

  if (!data || !categoria || !descricao || !valorStr) {
    alert2('Preencha todos os campos obrigatórios (*).', 'error');
    _salvandoDespesa = false; return;
  }
  const valor = parseFloat(valorStr.replace(',', '.'));
  if (!valor || valor <= 0) { alert2('Valor inválido.', 'error'); _salvandoDespesa = false; return; }

  const dataVencimento = document.getElementById('desp-form-vencimento')?.value || '';
  const dataPagamento  = document.getElementById('desp-form-pagamento')?.value || '';
  const status         = dataPagamento ? 'pago' : 'pendente';

  if (!D.despesas) D.despesas = [];
  D.despesas.push({ id: _gerarId('DESP'), data, categoria, forma, fornecedor, descricao, valor, obs,
                    dataVencimento, dataPagamento, status });
  sv('despesas');
  _salvandoDespesa = false;

  document.getElementById('desp-form-data').value = '';
  document.getElementById('desp-form-desc').value = '';
  document.getElementById('desp-form-valor').value = '';
  document.getElementById('desp-form-obs').value = '';
  const formaEl = document.getElementById('desp-form-forma');
  if (formaEl) formaEl.value = '';
  const fornEl = document.getElementById('desp-form-forn');
  if (fornEl) fornEl.value = '';
  const vencEl = document.getElementById('desp-form-vencimento');
  if (vencEl) vencEl.value = '';
  const pagEl = document.getElementById('desp-form-pagamento');
  if (pagEl) pagEl.value = '';

  alert2('Despesa lançada com sucesso!');
  despSetView('lista');
}

function excluirDespesa(id) {
  if (!confirm('Excluir esta despesa?')) return;
  D.despesas = (D.despesas || []).filter(d => d.id !== id);
  sv('despesas');
  rDespesasLista();
}

function marcarDespesaPaga(id) {
  const d = (D.despesas||[]).find(x=>x.id===id);
  if (!d) return;
  d.status = 'pago';
  if (!d.dataPagamento) d.dataPagamento = new Date().toISOString().slice(0,10);
  sv('despesas');
  rDespesasLista();
  alert2('Despesa marcada como paga!', 'success');
}

function baixarModeloDespesasCSV() {
  const linhas = [
    'DATA;CATEGORIA;DESCRICAO;VALOR;OBSERVACAO',
    '28/05/2026;Pessoal;Salários equipe de maio;1500,00;Referente a maio',
    '15/05/2026;Fornecedores;Bebidas evento João;850,00;',
    '10/05/2026;Infraestrutura;Aluguel do espaço;2000,00;',
    '05/05/2026;Marketing;Posts patrocinados Instagram;300,00;',
    '01/05/2026;Operacional;Combustível e transporte;120,50;',
  ];
  const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'modelo_despesas.csv'; a.click();
  URL.revokeObjectURL(url);
}

function importarDespesasCSV(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const text = e.target.result;
      const linhas = text.split(/\r?\n/).filter(l => l.trim());
      if (!linhas.length) { alert('Arquivo vazio.'); return; }
      const inicio = linhas[0].toUpperCase().includes('DATA') ? 1 : 0;
      let importados = 0, erros = 0, pulados = 0;
      if (!D.despesas) D.despesas = [];
      for (let i = inicio; i < linhas.length; i++) {
        const cols = linhas[i].split(';');
        if (cols.length < 4) { erros++; continue; }
        const [dataStr, categoria, descricao, valorStr, obs = ''] = cols.map(c => c.trim());
        if (!dataStr || !categoria || !descricao || !valorStr) { erros++; continue; }
        // Converte DD/MM/YYYY para YYYY-MM-DD
        let data = dataStr;
        const m = dataStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) data = `${m[3]}-${m[2]}-${m[1]}`;
        const valor = parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));
        if (!valor || valor <= 0) { erros++; continue; }
        if (_isDespesaDuplicada(data, descricao, valor)) { pulados++; continue; }
        D.despesas.push({ id: _gerarId('DESP'), data, categoria, descricao, valor, obs });
        importados++;
      }
      sv('despesas');
      alert(`✅ ${importados} despesa(s) importada(s)!${pulados ? `\n🔁 ${pulados} duplicata(s) ignorada(s).` : ''}${erros ? `\n⚠️ ${erros} linha(s) com erro.` : ''}`);
      input.value = '';
      despSetView('lista');
    } catch (err) {
      alert('Erro ao processar o arquivo: ' + err.message);
    }
  };
  reader.readAsText(file, 'utf-8');
}

// ─── IMPORTAÇÃO DE PDF (Relatório de Contas a Pagar — Modelo 02) ─────────────

function importarDespesasPDF(input) {
  const file = input.files[0];
  if (!file) return;

  if (!window.pdfjsLib) {
    alert('PDF.js não disponível. Tente recarregar a página.');
    return;
  }
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(e.target.result) }).promise;

      const allLines = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const tc = await page.getTextContent();

        // Agrupa itens por linha usando Y (tolerância 5px — robusta contra pequenas variações)
        const pageLines = [];
        tc.items.filter(i => i.str.trim()).forEach(i => {
          const y = i.transform[5];
          // Busca a linha mais próxima dentro da tolerância
          let closest = null, minDiff = 5;
          for (const l of pageLines) {
            const diff = Math.abs(l.y - y);
            if (diff < minDiff) { minDiff = diff; closest = l; }
          }
          if (!closest) { closest = { y, items: [] }; pageLines.push(closest); }
          closest.items.push({ text: i.str.trim(), x: i.transform[4] });
        });

        // Ordena linhas de cima para baixo e itens da esquerda para direita
        pageLines
          .sort((a, b) => b.y - a.y)
          .forEach(l => {
            l.items.sort((a, b) => a.x - b.x);
            allLines.push(l.items);
          });
      }

      // Linhas a ignorar completamente
      const SKIP = [
        /documento/i, /venc\.?\s*previsto/i, /nome.historico/i,
        /total por operação financeira/i, /dt\s+emissão/i, /valor nominal/i,
        /data de vencimento/i, /atividade financeira/i, /quebra por/i,
        /romero coqueteis/i, /relatório de contas/i, /valor a pagar/i,
        /operação financeira.descrição/i, /^desconto$/, /^multa$/, /^juros$/,
        /^vencimento$/, /^despesas$/, /página\s*\d/i,
      ];

      const despesas = [];
      let currentCategoria = 'Outros';

      for (const lineItems of allLines) {
        // Junta todo o texto da linha em ordem (esquerda→direita = ordem da tabela)
        const fullLine = lineItems.map(i => i.text).join(' ').trim();
        if (!fullLine) continue;
        if (SKIP.some(p => p.test(fullLine))) continue;
        if (/^(CEL:|CPF:|CNPJ:|EMAIL:|TEL:|Venc\.)/i.test(fullLine)) continue;

        // Extrai datas e valores monetários do texto completo da linha
        const datas   = [...fullLine.matchAll(/\d{2}\/\d{2}\/\d{4}/g)].map(m => m[0]);
        const valores = [...fullLine.matchAll(/\d{1,3}(?:\.\d{3})*,\d{2}/g)].map(m => m[0]);

        // ── Cabeçalho de categoria: sem datas, sem valores, texto maiúsculo ──
        if (!datas.length && !valores.length) {
          const up = fullLine.toUpperCase();
          if (fullLine === up && fullLine.length > 1 && !/^\d/.test(fullLine)
              && !/relatório|página|emissão|atividade|quebra|operação/i.test(fullLine)) {
            currentCategoria = fullLine;
          }
          continue;
        }

        // ── Linha de lançamento: tem pelo menos 1 data e 1 valor ──
        // (o "CO " pode vir em fragmentos no PDF, então não exigimos o padrão exato)
        if (!datas.length || !valores.length) continue;

        // Filtra linhas de detalhe (sub-linhas com 1 data e sem CO)
        // Linha real de despesa tem ≥ 2 datas (DtEmissão + Vencimento) ou "CO" no texto
        const temCO   = /\bCO\b/.test(fullLine);
        const temTraco = /\s-\s?\d+\/\d+/.test(fullLine); // padrão "- 1/1"
        if (!temCO && !temTraco && datas.length < 2) continue;

        // Vencimento = 2ª data na linha (ordem esquerda→direita); se só 1, usa ela
        const vencStr = datas.length >= 2 ? datas[1] : datas[0];
        const mDate = vencStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!mDate) continue;
        const data = `${mDate[3]}-${mDate[2]}-${mDate[1]}`;

        // Valor a Pagar = ÚLTIMO valor na linha (coluna mais à direita)
        const valorStr = valores[valores.length - 1];
        const valor = parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));
        if (!valor || valor <= 0) continue;

        // Descrição = texto sem datas, valores e sufixo de parcela (ex: "- 1/1")
        const descricao = fullLine
          .replace(/\d{2}\/\d{2}\/\d{4}/g, '')
          .replace(/\d{1,3}(?:\.\d{3})*,\d{2}/g, '')
          .replace(/\s*[-–]\s*\d+\/\d+\s*$/, '')
          .replace(/\s+/g, ' ').trim() || 'Sem descrição';

        despesas.push({
          id: 'DESP' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          data,
          categoria: currentCategoria,
          descricao,
          valor,
          obs: 'PDF ' + file.name.replace(/\.pdf$/i, ''),
        });
      }

      if (!despesas.length) {
        alert(
          'Nenhuma despesa encontrada no PDF.\n\n' +
          'Verifique:\n• O arquivo é o "Relatório de Contas a Pagar (Modelo 02)"?\n' +
          '• O PDF contém texto (não é imagem escaneada)?'
        );
        return;
      }

      if (!D.despesas) D.despesas = [];
      const novasPDF = despesas.filter(d => !_isDespesaDuplicada(d.data, d.descricao, d.valor));
      const puladasPDF = despesas.length - novasPDF.length;
      D.despesas.push(...novasPDF);
      sv('despesas');
      alert(`✅ ${novasPDF.length} despesa(s) importada(s) do PDF!${puladasPDF ? `\n🔁 ${puladasPDF} duplicata(s) ignorada(s).` : ''}`);
      input.value = '';
      despSetView('lista');

    } catch (err) {
      alert('Erro ao processar o PDF: ' + err.message);
      console.error('importarDespesasPDF:', err);
    }
  };
  reader.readAsArrayBuffer(file);
}

// ─── EDITAR DESPESA ───────────────────────────────────────────────────────────

function abrirEditDespesa(id) {
  const d = (D.despesas||[]).find(x=>x.id===id);
  if (!d) return;
  _populateCategoriasSelects();
  _populateFornecedoresDespesas();
  document.getElementById('desp-edit-id').value         = id;
  document.getElementById('desp-edit-data').value       = d.data || '';
  document.getElementById('desp-edit-cat').value        = d.categoria || '';
  document.getElementById('desp-edit-forma').value      = d.forma || _detectarFormaDespesa(d);
  document.getElementById('desp-edit-forn').value       = d.fornecedor || '';
  document.getElementById('desp-edit-desc').value       = _descricaoSemPrefixo(d);
  document.getElementById('desp-edit-valor').value      = d.valor || '';
  document.getElementById('desp-edit-obs').value        = d.obs || '';
  document.getElementById('desp-edit-vencimento').value = d.dataVencimento || '';
  document.getElementById('desp-edit-pagamento').value  = d.dataPagamento || '';
  // Bloqueia categoria se há fornecedor vinculado
  const catEditEl = document.getElementById('desp-edit-cat');
  if(catEditEl) catEditEl.disabled = !!(d.fornecedor && (D.fornecedores||[]).find(f=>f.nome===d.fornecedor));
  document.getElementById('m-edit-despesa').style.display = 'flex';
}

function salvarEditDespesa() {
  const id        = document.getElementById('desp-edit-id')?.value;
  const d         = (D.despesas||[]).find(x=>x.id===id);
  if (!d) return;
  const data       = document.getElementById('desp-edit-data')?.value;
  const categoria  = document.getElementById('desp-edit-cat')?.value;
  const forma      = document.getElementById('desp-edit-forma')?.value || '';
  const fornecedor = document.getElementById('desp-edit-forn')?.value || '';
  const descricao  = document.getElementById('desp-edit-desc')?.value?.trim();
  const valorStr   = document.getElementById('desp-edit-valor')?.value;
  const obs        = document.getElementById('desp-edit-obs')?.value?.trim() || '';
  const dataVencimento = document.getElementById('desp-edit-vencimento')?.value || '';
  const dataPagamento  = document.getElementById('desp-edit-pagamento')?.value || '';
  if (!data || !categoria || !descricao || !valorStr) { alert2('Preencha todos os campos obrigatórios.', 'error'); return; }
  const valor = parseFloat(valorStr.toString().replace(',','.'));
  if (!valor || valor <= 0) { alert2('Valor inválido.', 'error'); return; }
  d.data = data; d.categoria = categoria; d.forma = forma;
  d.fornecedor = fornecedor; d.descricao = descricao; d.valor = valor; d.obs = obs;
  d.dataVencimento = dataVencimento;
  d.dataPagamento  = dataPagamento;
  d.status         = dataPagamento ? 'pago' : (d.status === 'pago' && !dataPagamento ? 'pendente' : d.status || 'pendente');
  sv('despesas');
  document.getElementById('m-edit-despesa').style.display = 'none';
  rDespesasLista();
  alert2('Despesa atualizada!', 'success');
}

// ─── CATEGORIAS DE DESPESAS ───────────────────────────────────────────────────

function rDespesasCategorias() {
  const el = document.getElementById('desp-view-categorias');
  if (!el) return;
  const cats = _getCategoriasDespesas();

  el.innerHTML = `
    <div class="sec">
      <div class="sec-head"><span class="sec-title">🏷️ Categorias de Despesas</span></div>
      <div style="padding:16px">
        <div style="display:flex;gap:8px;margin-bottom:20px;align-items:flex-end;flex-wrap:wrap">
          <div>
            <label class="lbl">Nova categoria</label>
            <input id="desp-nova-cat" class="inp" type="text" placeholder="Nome da categoria" style="width:220px"
              onkeydown="if(event.key==='Enter')adicionarCategoriaDespesa()">
          </div>
          <button class="btn btn-primary btn-sm" onclick="adicionarCategoriaDespesa()">+ Adicionar</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${cats.map(c => {
            const qtd = (D.despesas||[]).filter(d=>d.categoria===c).length;
            return `<div style="display:flex;align-items:center;gap:8px;background:var(--bg3);border:1px solid var(--border2);border-radius:8px;padding:7px 12px">
              <span style="font-size:13px;color:var(--text)">${c}</span>
              ${qtd ? `<span style="font-size:10px;color:#8B91A8;background:var(--bg2);padding:1px 6px;border-radius:4px">${qtd}</span>` : ''}
              <button onclick="excluirCategoriaDespesa('${c.replace(/'/g,"\\'")}')"
                style="background:none;border:none;color:#F74F6B;cursor:pointer;padding:0;font-size:13px;line-height:1;margin-left:2px" title="Remover">✕</button>
            </div>`;
          }).join('')}
        </div>
        <div style="margin-top:14px;font-size:11px;color:#8B91A8">O número mostra quantas despesas usam cada categoria.</div>
      </div>
    </div>`;
}

function adicionarCategoriaDespesa() {
  const inp  = document.getElementById('desp-nova-cat');
  const nome = inp?.value?.trim();
  if (!nome) { alert('Digite o nome da categoria.'); return; }
  const cats = _getCategoriasDespesas();
  if (cats.map(c=>c.toLowerCase()).includes(nome.toLowerCase())) { alert('Categoria já existe.'); return; }
  if (!D.categoriasDespesas) D.categoriasDespesas = [...cats];
  D.categoriasDespesas.push(nome);
  sv('categoriasDespesas');
  if (inp) inp.value = '';
  _populateCategoriasSelects();
  rDespesasCategorias();
}

function excluirCategoriaDespesa(nome) {
  const qtd = (D.despesas||[]).filter(d=>d.categoria===nome).length;
  const msg = qtd
    ? `A categoria "${nome}" está em uso em ${qtd} despesa(s). Remover mesmo assim?`
    : `Remover a categoria "${nome}"?`;
  if (!confirm(msg)) return;
  if (!D.categoriasDespesas) D.categoriasDespesas = _getCategoriasDespesas();
  D.categoriasDespesas = D.categoriasDespesas.filter(c => c !== nome);
  sv('categoriasDespesas');
  _populateCategoriasSelects();
  rDespesasCategorias();
}

// ─── IMPRESSÃO DE DESPESAS ────────────────────────────────────────────────────

function imprimirDespesas() {
  const mes       = document.getElementById('desp-mes')?.value || '';
  const ano       = document.getElementById('desp-ano')?.value || new Date().getFullYear().toString();
  const catFiltro = document.getElementById('desp-cat-filtro')?.value || '';
  const ordem     = document.getElementById('desp-print-ordem')?.value || 'data';

  const NOMES_MESES = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const periodoLabel = mes ? `${NOMES_MESES[parseInt(mes)]}/${ano}` : ano;
  const formaLabel   = { boleto:'Boleto', pix_manual:'PIX Manual', pix_nota:'PIX c/ Nota', outros:'Outros' };
  const formaColor   = { boleto:'#1d4ed8', pix_manual:'#15803d', pix_nota:'#0e7490', outros:'#555' };

  const lista = (D.despesas || []).filter(d => {
    const ref = d.data || '';
    if (ano && !ref.startsWith(ano)) return false;
    if (mes && !ref.startsWith(`${ano}-${mes.padStart(2,'0')}`)) return false;
    if (catFiltro && d.categoria !== catFiltro) return false;
    return true;
  }).sort((a,b) => (a.data||'').localeCompare(b.data||''));

  if (!lista.length) { alert('Nenhuma despesa para imprimir com os filtros atuais.'); return; }

  const total = lista.reduce((s,d) => s+(d.valor||0), 0);
  const fmtR  = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;
  const fmtD  = d => d ? d.split('-').reverse().join('/') : '—';

  // Resumo por categoria (sempre presente)
  const porCat = {};
  lista.forEach(d => { const c = d.categoria||'Outros'; porCat[c] = (porCat[c]||0)+(d.valor||0); });
  const catRows = Object.entries(porCat).sort((a,b)=>b[1]-a[1])
    .map(([c,v]) => `<tr><td>${c}</td><td style="text-align:right">${fmtR(v)}</td><td style="text-align:right;color:#888;font-size:9px">${((v/total)*100).toFixed(1)}%</td></tr>`).join('');

  const CSS = `
    *{box-sizing:border-box}
    body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#111}
    .cabecalho{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #111}
    .cabecalho h2{margin:0 0 3px;font-size:16px;text-transform:uppercase}
    .cabecalho .sub{font-size:10px;color:#555;margin-top:2px}
    .cabecalho .periodo{font-size:13px;font-weight:700;color:#b91c1c}
    .resumo{display:flex;gap:16px;margin-bottom:18px;flex-wrap:wrap}
    .card-r{border:1px solid #ddd;border-radius:4px;padding:8px 14px;min-width:120px}
    .card-r .lbl{font-size:9px;color:#777;text-transform:uppercase;letter-spacing:.05em}
    .card-r .val{font-size:14px;font-weight:700;margin-top:2px}
    .sec-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#222;margin:18px 0 6px;border-bottom:2px solid #222;padding-bottom:4px}
    .grupo-titulo{background:#222;color:#fff;padding:5px 10px;font-size:11px;font-weight:700;display:flex;justify-content:space-between}
    .grupo-subtotal td{background:#f4f4f4;font-weight:700;border-top:1px solid #ccc;font-size:10px;color:#333}
    table{width:100%;border-collapse:collapse;margin-bottom:6px}
    th{background:#f4f4f4;color:#444;padding:5px 8px;text-align:left;font-size:10px;text-transform:uppercase;border:1px solid #ddd;font-weight:600}
    td{padding:5px 8px;border-bottom:1px solid #f0f0f0;vertical-align:top}
    tfoot td{background:#efefef;font-weight:700;border-top:2px solid #999}
    .t-cat td{padding:4px 8px}
    .rodape{margin-top:24px;font-size:9px;color:#aaa;border-top:1px solid #eee;padding-top:6px;display:flex;justify-content:space-between}
    @media print{
      body{margin:8mm}
      .grupo-titulo{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      @page{size:A4;margin:12mm}
    }`;

  // ── Detalhamento: agrupado com subtotais (por categoria ou por data)
  let detalheHtml = '';

  function _blocoGrupo(titulo, itens, colunas, subTotLabel) {
    const subTot = itens.reduce((s,d)=>s+(d.valor||0),0);
    const linhas = itens.map(d => {
      const forma = _detectarFormaDespesa(d);
      const desc  = _descricaoSemPrefixo(d);
      return `<tr>
        ${colunas === 'cat'
          ? `<td style="width:80px">${fmtD(d.data)}</td>
             <td style="color:${formaColor[forma]||'#555'};font-weight:600;width:80px">${formaLabel[forma]||'—'}</td>
             <td>${desc||'—'}</td>`
          : `<td style="width:120px">${d.categoria||'—'}</td>
             <td style="color:${formaColor[forma]||'#555'};font-weight:600;width:80px">${formaLabel[forma]||'—'}</td>
             <td>${desc||'—'}</td>`}
        <td style="text-align:right;font-weight:600;color:#b91c1c;width:110px">${fmtR(d.valor||0)}</td>
      </tr>`;
    }).join('');
    const thsData  = `<th>Data</th><th>Forma</th><th>Descrição</th><th style="text-align:right">Valor</th>`;
    const thsCat   = `<th>Categoria</th><th>Forma</th><th>Descrição</th><th style="text-align:right">Valor</th>`;
    return `
      <div class="grupo-titulo"><span>${titulo}</span><span>${fmtR(subTot)}</span></div>
      <table>
        <thead><tr>${colunas==='cat'?thsData:thsCat}</tr></thead>
        <tbody>${linhas}</tbody>
        <tbody class="grupo-subtotal"><tr>
          <td colspan="3" style="text-align:right;text-transform:uppercase;font-size:10px">${subTotLabel}</td>
          <td style="text-align:right;color:#b91c1c">${fmtR(subTot)}</td>
        </tr></tbody>
      </table>`;
  }

  if (ordem === 'categoria') {
    const grupos = {};
    lista.forEach(d => { const c = d.categoria||'Outros'; if (!grupos[c]) grupos[c]=[]; grupos[c].push(d); });
    Object.keys(grupos).sort().forEach(cat => {
      const itens = grupos[cat].sort((a,b)=>(a.data||'').localeCompare(b.data||''));
      detalheHtml += _blocoGrupo(cat, itens, 'cat', `Total ${cat}`);
    });
  } else {
    // Agrupa por data, ordem crescente
    const grupos = {};
    lista.forEach(d => { const dt = d.data||''; if (!grupos[dt]) grupos[dt]=[]; grupos[dt].push(d); });
    Object.keys(grupos).sort().forEach(dt => {
      detalheHtml += _blocoGrupo(fmtD(dt), grupos[dt], 'data', `Total ${fmtD(dt)}`);
    });
  }

  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Despesas — ${periodoLabel}</title>
  <style>${CSS}</style>
  </head><body>
  <div class="cabecalho">
    <div>
      <h2>Relatório de Despesas</h2>
      <div class="sub">Controle e Gestão — Juliana Santos</div>
      <div class="sub">Impresso em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
      <div class="sub">Agrupamento: ${ordem === 'categoria' ? 'Por categoria (subtotal por categoria)' : 'Por data de vencimento (subtotal por dia)'}</div>
    </div>
    <div style="text-align:right">
      <div class="periodo">${periodoLabel}</div>
      ${catFiltro ? `<div class="sub" style="margin-top:4px">Categoria: <strong>${catFiltro}</strong></div>` : ''}
    </div>
  </div>

  <div class="resumo">
    <div class="card-r"><div class="lbl">Total de despesas</div><div class="val" style="color:#b91c1c">${fmtR(total)}</div></div>
    <div class="card-r"><div class="lbl">Lançamentos</div><div class="val">${lista.length}</div></div>
    <div class="card-r"><div class="lbl">Categorias</div><div class="val">${Object.keys(porCat).length}</div></div>
  </div>

  <div class="sec-title">Resumo por categoria</div>
  <table style="width:auto;min-width:300px;margin-bottom:20px">
    <thead><tr><th>Categoria</th><th style="text-align:right">Total</th><th style="text-align:right">%</th></tr></thead>
    <tbody class="t-cat">${catRows}</tbody>
    <tfoot><tr><td><strong>Total</strong></td><td style="text-align:right;color:#b91c1c">${fmtR(total)}</td><td></td></tr></tfoot>
  </table>

  <div class="sec-title">Detalhamento — ${ordem==='categoria'?'por categoria':'por data de vencimento'}</div>
  ${detalheHtml}

  <table style="margin-top:8px"><tfoot><tr>
    <td colspan="3" style="text-align:right;font-size:10px;text-transform:uppercase;color:#555;background:#efefef;border-top:2px solid #999;font-weight:700;padding:6px 8px">Total geral</td>
    <td style="text-align:right;color:#b91c1c;font-size:13px;background:#efefef;border-top:2px solid #999;font-weight:700;padding:6px 8px;width:110px">${fmtR(total)}</td>
  </tr></tfoot></table>

  <div class="rodape">
    <span>Controle e Gestão — Juliana Santos</span>
    <span>${new Date().toLocaleDateString('pt-BR')}</span>
  </div>
  <script>window.onload=function(){window.print()};<\/script>
  </body></html>`);
  w.document.close();
}
