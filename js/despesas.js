// ─── ANÁLISE DE DESPESAS ─────────────────────────────────────────────────────

function rDespesas() {
  const subView = document.getElementById('desp-sub-view')?.value || 'kpi';
  ['kpi', 'lancar', 'lista', 'importar'].forEach(v => {
    const el = document.getElementById('desp-view-' + v);
    if (el) el.style.display = v === subView ? '' : 'none';
  });
  document.querySelectorAll('[data-desp-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.despTab === subView);
  });
  if (subView === 'kpi') rDespesasKpi();
  else if (subView === 'lista') rDespesasLista();
}

function despSetView(v) {
  const input = document.getElementById('desp-sub-view');
  if (input) { input.value = v; rDespesas(); }
}

function rDespesasKpi() {
  const mes = document.getElementById('desp-mes')?.value || '';
  const ano = document.getElementById('desp-ano')?.value || new Date().getFullYear().toString();

  // Receita: parcelas pagas com vencimento (ou data do evento) no mês/ano
  const parcelas = (D.financeiro || []).filter(f => {
    if (f.status !== 'pago') return false;
    const ref = f.vencimento || f.data || '';
    if (!ref) return false;
    if (ano && !ref.startsWith(ano)) return false;
    if (mes && !ref.startsWith(`${ano}-${mes}`)) return false;
    return true;
  });
  const receita = parcelas.reduce((s, f) => s + (f.valorNum || 0), 0);

  // Despesas: lançamentos do mês/ano
  const despesasFiltradas = (D.despesas || []).filter(d => {
    const ref = d.data || '';
    if (ano && !ref.startsWith(ano)) return false;
    if (mes && !ref.startsWith(`${ano}-${mes}`)) return false;
    return true;
  });
  const totalDespesas = despesasFiltradas.reduce((s, d) => s + (d.valor || 0), 0);

  // Meta de faturamento do período
  const mKey = mes ? `${ano}-${mes}` : ano;
  const meta = parseFloat((D.metas || {})[mKey]?.fat || 0);

  const resultado = receita - totalDespesas;
  const margem = receita > 0 ? ((resultado / receita) * 100).toFixed(1) : 0;
  const percDespVsRec = receita > 0 ? Math.min(100, (totalDespesas / receita) * 100).toFixed(0) : 0;
  const percRecVsMeta = meta > 0 ? Math.min(100, (receita / meta) * 100).toFixed(0) : 0;

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
        <div class="card-label">💰 Receita (caixa)</div>
        <div class="card-val" style="color:#10B981">${fR(receita)}</div>
        <div style="font-size:11px;color:#8B91A8;margin-top:4px">${parcelas.length} parcela(s) paga(s)</div>
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
  const catFiltro = catSelect?.value || '';

  const lista = (D.despesas || []).filter(d => {
    const ref = d.data || '';
    if (ano && !ref.startsWith(ano)) return false;
    if (mes && !ref.startsWith(`${ano}-${mes}`)) return false;
    if (catFiltro && d.categoria !== catFiltro) return false;
    return true;
  }).sort((a, b) => (b.data || '').localeCompare(a.data || ''));

  const tbody = document.getElementById('desp-lista-body');
  if (!tbody) return;

  const total = lista.reduce((s, d) => s + (d.valor || 0), 0);
  const totEl = document.getElementById('desp-lista-total');
  if (totEl) totEl.textContent = fR(total);

  tbody.innerHTML = '';
  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#8B91A8;padding:24px">Nenhuma despesa encontrada para este período.</td></tr>';
    return;
  }

  lista.forEach(d => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #1E2235';
    tr.innerHTML = `
      <td style="padding:10px 12px">${fd(d.data) || '—'}</td>
      <td style="padding:10px 12px"><span class="tag" style="background:#2A2F42;color:#CDD3E3;border:none">${d.categoria || '—'}</span></td>
      <td style="padding:10px 12px">${d.descricao || '—'}</td>
      <td style="padding:10px 12px;color:#F74F6B;font-weight:600">${fR(d.valor || 0)}</td>
      <td style="padding:10px 12px;color:#8B91A8;font-size:12px">${d.obs || '—'}</td>
      <td style="padding:10px 12px">
        <button class="btn-sm btn-red" onclick="excluirDespesa('${d.id}')">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function salvarDespesa() {
  const data     = document.getElementById('desp-form-data')?.value;
  const categoria = document.getElementById('desp-form-cat')?.value;
  const descricao = document.getElementById('desp-form-desc')?.value?.trim();
  const valorStr  = document.getElementById('desp-form-valor')?.value;
  const obs       = document.getElementById('desp-form-obs')?.value?.trim() || '';

  if (!data || !categoria || !descricao || !valorStr) {
    alert('Preencha todos os campos obrigatórios (*).');
    return;
  }
  const valor = parseFloat(valorStr.replace(',', '.'));
  if (!valor || valor <= 0) { alert('Valor inválido.'); return; }

  if (!D.despesas) D.despesas = [];
  D.despesas.push({ id: 'DESP' + Date.now(), data, categoria, descricao, valor, obs });
  sv('despesas');

  document.getElementById('desp-form-data').value = '';
  document.getElementById('desp-form-desc').value = '';
  document.getElementById('desp-form-valor').value = '';
  document.getElementById('desp-form-obs').value = '';

  alert2('Despesa lançada com sucesso!');
  despSetView('lista');
}

function excluirDespesa(id) {
  if (!confirm('Excluir esta despesa?')) return;
  D.despesas = (D.despesas || []).filter(d => d.id !== id);
  sv('despesas');
  rDespesasLista();
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
      let importados = 0, erros = 0;
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
        D.despesas.push({ id: 'DESP' + Date.now() + '_' + i, data, categoria, descricao, valor, obs });
        importados++;
      }
      sv('despesas');
      alert(`✅ ${importados} despesa(s) importada(s) com sucesso!${erros ? `\n⚠️ ${erros} linha(s) ignorada(s).` : ''}`);
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

      // Extrai todos os itens de texto com posição X/Y de todas as páginas
      const allLines = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const tc = await page.getTextContent();

        // Agrupa itens por linha (tolerância 3px no eixo Y)
        const yMap = new Map();
        tc.items.filter(i => i.str.trim()).forEach(i => {
          const y = i.transform[5];
          let key = null;
          for (const k of yMap.keys()) {
            if (Math.abs(k - y) <= 3) { key = k; break; }
          }
          if (key === null) key = y;
          if (!yMap.has(key)) yMap.set(key, []);
          yMap.get(key).push({ text: i.str.trim(), x: i.transform[4] });
        });

        // Ordena linhas de cima para baixo (Y maior = mais acima no PDF)
        [...yMap.entries()]
          .sort((a, b) => b[0] - a[0])
          .forEach(([, items]) => allLines.push(items.sort((a, b) => a.x - b.x)));
      }

      // Padrões de linhas a ignorar
      const SKIP = [
        /documento/i, /operação financeira.descrição/i, /venc\.\s*previsto/i,
        /nome.historico/i, /total por operação financeira/i, /dt\s+emissão/i,
        /valor nominal/i, /data de vencimento/i, /atividade financeira/i,
        /quebra por/i, /romero coqueteis/i, /relatório de contas/i,
        /^desconto$/, /^multa$/, /^juros$/, /^despesas$/, /valor a pagar/i,
        /^vencimento$/, /página\s*\d/i,
      ];

      const despesas = [];
      let currentCategoria = 'Outros';

      for (const lineItems of allLines) {
        const texts = lineItems.map(i => i.text);
        const fullLine = texts.join(' ').trim();
        if (!fullLine) continue;
        if (SKIP.some(p => p.test(fullLine))) continue;

        // Ignora linhas de contato/detalhe
        if (/^(CEL:|CPF:|CNPJ:|EMAIL:|TEL:)/i.test(fullLine)) continue;

        const hasDate = texts.some(t => /^\d{2}\/\d{2}\/\d{4}$/.test(t));
        const hasNum  = texts.some(t => /^\d[\d.]*,\d{2}$/.test(t));

        // Detecta cabeçalho de categoria (texto todo maiúsculo, sem datas/números)
        if (!hasDate && !hasNum) {
          const joined = texts.join(' ').trim();
          if (joined.length > 1 && joined === joined.toUpperCase() && !/^\d/.test(joined)) {
            currentCategoria = joined;
            continue;
          }
        }

        // Linha de lançamento: contém "CO " + tem data + tem valor
        const hasCO = texts.some(t => /^CO\s+[A-ZÁÀÃÉÊÍÓÔÕÚ]/i.test(t));
        if (!hasCO || !hasDate || !hasNum) continue;

        const dateItems = lineItems.filter(i => /^\d{2}\/\d{2}\/\d{4}$/.test(i.text));
        const numItems  = lineItems.filter(i => /^\d[\d.]*,\d{2}$/.test(i.text));

        // Vencimento = segunda data da linha (coluna Vencimento); se só uma, usa ela
        dateItems.sort((a, b) => a.x - b.x);
        const vencStr = dateItems.length >= 2 ? dateItems[1].text : dateItems[0].text;
        const mDate = vencStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!mDate) continue;
        const data = `${mDate[3]}-${mDate[2]}-${mDate[1]}`;

        // Valor a Pagar = item numérico mais à direita (última coluna)
        numItems.sort((a, b) => a.x - b.x);
        const valorStr = numItems[numItems.length - 1].text;
        const valor = parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));
        if (!valor || valor <= 0) continue;

        // Descrição = itens que não são datas nem números
        const descricao = lineItems
          .filter(i => !/^\d{2}\/\d{2}\/\d{4}$/.test(i.text) && !/^\d[\d.]*,\d{2}$/.test(i.text))
          .map(i => i.text).join(' ').trim();

        despesas.push({
          id: 'DESP' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          data,
          categoria: currentCategoria,
          descricao: descricao || 'Sem descrição',
          valor,
          obs: 'PDF ' + file.name.replace(/\.pdf$/i, ''),
        });
      }

      if (!despesas.length) {
        alert('Nenhuma despesa encontrada no PDF.\nVerifique se o arquivo é o "Relatório de Contas a Pagar (Modelo 02)".');
        return;
      }

      if (!D.despesas) D.despesas = [];
      D.despesas.push(...despesas);
      sv('despesas');
      alert(`✅ ${despesas.length} despesa(s) importada(s) do PDF com sucesso!`);
      input.value = '';
      despSetView('lista');

    } catch (err) {
      alert('Erro ao processar o PDF: ' + err.message);
      console.error('importarDespesasPDF:', err);
    }
  };
  reader.readAsArrayBuffer(file);
}
