// ─── ORÇAMENTO vs REAL ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

let orcView    = 'lista';  // 'lista' | 'detalhe'
let orcAtualId = null;
let orcDetTab  = 'calc';   // 'calc' | 'real'

function rOrcamento() {
  if (orcView === 'detalhe' && orcAtualId) rOrcDetalhe();
  else rOrcLista();
}

// ─── LISTA ──────────────────────────────────────────────────────────────────

function rOrcLista() {
  orcView = 'lista';
  const el = document.getElementById('orc-content');
  if (!el) return;

  const lista = (D.orcamentos || []).slice().sort((a,b) =>
    (b.dataEvento||b.criadoEm||'').localeCompare(a.dataEvento||a.criadoEm||'')
  );

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <span style="font-size:16px;font-weight:600;color:var(--text)">Orçamentos de Eventos</span>
      <button class="btn btn-primary btn-sm" onclick="document.getElementById('m-novo-orc').style.display='flex'"
        style="margin-left:auto">+ Novo orçamento</button>
    </div>

    ${!lista.length ? `
      <div style="text-align:center;padding:60px 20px;color:var(--text3)">
        <div style="font-size:36px;margin-bottom:12px">📋</div>
        <div style="margin-bottom:8px;font-size:14px">Nenhum orçamento cadastrado</div>
        <div style="font-size:12px">Crie um novo orçamento e importe o Excel com os valores orçados</div>
      </div>` :
    `<div style="display:grid;gap:10px">
      ${lista.map(o => {
        const totalOrc  = (o.itens||[]).reduce((s,i) => s+(i.totalOrc||0), 0);
        const totalReal = (o.itens||[]).reduce((s,i) => s+(i.totalReal||0), 0);
        const diff      = totalReal - totalOrc;
        const pendentes = (o.itens||[]).filter(i => i.qtdReal == null).length;
        const total     = (o.itens||[]).length;
        return `
          <div onclick="abrirOrcDetalhe('${o.id}')"
               style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);
                      padding:14px 18px;cursor:pointer;display:flex;gap:16px;align-items:center;
                      flex-wrap:wrap;transition:.15s" onmouseover="this.style.borderColor='var(--border2)'"
               onmouseout="this.style.borderColor='var(--border)'">
            <div style="flex:1;min-width:160px">
              <div style="font-weight:600;color:var(--text);font-size:14px">${o.nomeCliente||'Sem nome'}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px">
                ${fd(o.dataEvento)||'sem data'}
                ${o.convidados ? ' · '+o.convidados+' conv.' : ''}
                · ${total} ite${total===1?'m':'ns'}
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:10px;color:#4F8EF7;text-transform:uppercase;margin-bottom:2px">Orçado</div>
              <div style="font-family:var(--mono);font-size:14px;color:#4F8EF7;font-weight:600">${fR(totalOrc)}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:10px;color:var(--green);text-transform:uppercase;margin-bottom:2px">Real</div>
              <div style="font-family:var(--mono);font-size:14px;color:var(--green);font-weight:600">
                ${totalReal > 0 ? fR(totalReal) : '—'}
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Diferença</div>
              <div style="font-family:var(--mono);font-size:14px;font-weight:600;
                          color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--text3)'}">
                ${totalReal>0 ? (diff>=0?'+':'')+fR(diff) : '—'}
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              ${pendentes > 0
                ? `<span style="background:#7A5A00;color:#F7C84F;font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px">${pendentes} pendente${pendentes>1?'s':''}</span>`
                : total > 0
                  ? `<span style="background:#0D3B1E;color:var(--green);font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px">✓ Completo</span>`
                  : `<span style="background:var(--bg3);color:var(--text3);font-size:9px;padding:2px 7px;border-radius:3px">Vazio</span>`
              }
              <button class="btn-sm btn-red" onclick="event.stopPropagation();excluirOrc('${o.id}')" title="Excluir">✕</button>
            </div>
          </div>`;
      }).join('')}
    </div>`}`;
}

// ─── DETALHE ─────────────────────────────────────────────────────────────────

function abrirOrcDetalhe(id) {
  orcView = 'detalhe';
  orcAtualId = id;
  orcDetTab  = 'calc';
  rOrcDetalhe();
}

function setOrcTab(tab) {
  orcDetTab = tab;
  rOrcDetalhe();
}

function rOrcDetalhe() {
  const el = document.getElementById('orc-content');
  if (!el) return;

  const orc = (D.orcamentos||[]).find(o => o.id === orcAtualId);
  if (!orc) { rOrcLista(); return; }

  const itens     = orc.itens     || [];
  const calcItens = orc.calcItens || [];
  const totalOrc  = itens.reduce((s,i) => s+(i.totalOrc||0), 0);
  const totalReal = itens.reduce((s,i) => s+(i.totalReal||0), 0);
  const diff      = totalReal - totalOrc;
  const acima     = itens.filter(i => (i.totalReal||0) > (i.totalOrc||0));

  // Custo calculado para o card
  const p         = orc.calcParams || {};
  const custoCalc = calcItens.reduce((s,i) => s+(i.total||0), 0);
  const margSeg   = Number(p.margemSeguranca != null ? p.margemSeguranca : 10);
  const margLuc   = Number(p.margemLucro     != null ? p.margemLucro     : 30);
  const valorCalc = custoCalc * (1 + margSeg/100) * (1 + margLuc/100);

  el.innerHTML = `
    <!-- Cabeçalho -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn-sm" onclick="rOrcLista()" style="background:var(--bg3)">← Voltar</button>
      <div>
        <span style="font-weight:600;font-size:15px;color:var(--text)">${orc.nomeCliente||'Sem nome'}</span>
        <span style="font-size:11px;color:var(--text3);margin-left:8px">
          ${fd(orc.dataEvento)||''}${orc.convidados?' · '+orc.convidados+' convidados':''}
        </span>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-sm" onclick="abrirImportOrc('${orc.id}')"
          style="background:var(--bg2);border:1px solid var(--green);color:var(--green)">📥 Importar Excel</button>
        <button class="btn-sm btn-primary" onclick="abrirAddItemOrc('${orc.id}')">+ Item real</button>
      </div>
    </div>

    <!-- Cards -->
    <div class="cards" style="margin-bottom:14px">
      <div class="card">
        <div class="card-label">Orçamento calculado</div>
        <div class="card-val" style="color:var(--green)">${valorCalc > 0 ? fR(valorCalc) : '—'}</div>
      </div>
      <div class="card">
        <div class="card-label">Total orçado (manual)</div>
        <div class="card-val" style="color:#4F8EF7">${fR(totalOrc)}</div>
      </div>
      <div class="card">
        <div class="card-label">Total Real</div>
        <div class="card-val" style="color:${totalReal>totalOrc&&totalReal>0?'var(--red)':'var(--text)'}">
          ${totalReal > 0 ? fR(totalReal) : '—'}
        </div>
      </div>
      <div class="card">
        <div class="card-label">Diferença</div>
        <div class="card-val" style="color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--text3)'}">
          ${totalReal>0 ? (diff>=0?'+':'')+fR(diff) : '—'}
        </div>
      </div>
    </div>

    ${acima.length ? `
      <div style="background:#1A0808;border:1px solid var(--red);border-radius:var(--radius);
                  padding:10px 14px;margin-bottom:12px;font-size:12px;color:var(--red)">
        ⚠️ <strong>${acima.length} item(ns)</strong> com custo real acima do orçado:
        ${acima.slice(0,3).map(i=>`<strong>${i.nome}</strong>`).join(', ')}${acima.length>3?'...':''}
      </div>` : ''}

    <!-- Abas -->
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button class="sort-btn ${orcDetTab==='calc'?'active':''}" onclick="setOrcTab('calc')">📊 Calculadora</button>
      <button class="sort-btn ${orcDetTab==='real'?'active':''}" onclick="setOrcTab('real')">📋 Orçado vs Real</button>
    </div>

    <div id="orc-det-content"></div>`;

  if (orcDetTab === 'calc') rOrcCalc();
  else _rOrcRealContent(orc);
}

// ─── ABA ORÇADO VS REAL ───────────────────────────────────────────────────────

function _rOrcRealContent(orc) {
  const el = document.getElementById('orc-det-content');
  if (!el) return;

  const itens     = orc.itens || [];
  const totalOrc  = itens.reduce((s,i) => s+(i.totalOrc||0), 0);
  const totalReal = itens.reduce((s,i) => s+(i.totalReal||0), 0);
  const diff      = totalReal - totalOrc;

  const catMap = {};
  itens.forEach(i => {
    const c = i.categoria || 'Outros';
    if (!catMap[c]) catMap[c] = { orc:0, real:0 };
    catMap[c].orc  += i.totalOrc||0;
    catMap[c].real += i.totalReal||0;
  });

  if (!itens.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:48px;color:var(--text3)">
        <div style="font-size:28px;margin-bottom:10px">📥</div>
        <div style="margin-bottom:14px">Nenhum item. Importe o Excel ou adicione manualmente.</div>
        <button class="btn btn-primary" onclick="abrirImportOrc('${orc.id}')">📥 Importar orçamento do Excel</button>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="sec">
      <div class="sec-head">
        <span class="sec-title">Itens — Orçado vs Real</span>
        <span style="font-size:11px;color:var(--text3)">Preencha Qtd Real e Preço Real para cada item</span>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="border-bottom:2px solid var(--border2);font-size:10px;text-transform:uppercase;letter-spacing:.3px">
              <th style="padding:8px 10px;text-align:left;font-weight:500;color:var(--text3)">Produto</th>
              <th style="padding:8px 6px;text-align:left;font-weight:500;color:var(--text3)">Cat.</th>
              <th style="padding:8px 6px;text-align:right;font-weight:600;color:#4F8EF7">Qtd Orc</th>
              <th style="padding:8px 6px;text-align:right;font-weight:600;color:#4F8EF7">Preço Orc</th>
              <th style="padding:8px 6px;text-align:right;font-weight:600;color:#4F8EF7">Total Orc</th>
              <th style="padding:8px 6px;text-align:right;font-weight:600;color:var(--green)">Qtd Real</th>
              <th style="padding:8px 6px;text-align:right;font-weight:600;color:var(--green)">Preço Real</th>
              <th style="padding:8px 6px;text-align:right;font-weight:600;color:var(--green)">Total Real</th>
              <th style="padding:8px 6px;text-align:right;font-weight:500;color:var(--text3)">Diferença</th>
              <th style="padding:8px 6px"></th>
            </tr>
          </thead>
          <tbody>
            ${[...itens]
              .sort((a,b) => ((b.totalReal||0)-(b.totalOrc||0)) - ((a.totalReal||0)-(a.totalOrc||0)))
              .map(item => {
                const d = item.totalReal != null ? (item.totalReal||0)-(item.totalOrc||0) : null;
                const rowBg = d != null && d > 0 ? 'background:#1A0808;' : '';
                return `
                <tr style="border-bottom:1px solid var(--border);${rowBg}">
                  <td style="padding:6px 10px;font-weight:500;color:var(--text);max-width:200px">${item.nome}</td>
                  <td style="padding:6px 6px"><span class="badge b-blue" style="font-size:9px">${item.categoria||'—'}</span></td>
                  <td style="padding:6px 6px;text-align:right;font-family:var(--mono);color:#4F8EF7">${item.qtdOrc??'—'}</td>
                  <td style="padding:6px 6px;text-align:right;font-family:var(--mono);color:#4F8EF7">${item.precoUnitOrc?fR(item.precoUnitOrc):'—'}</td>
                  <td style="padding:6px 6px;text-align:right;font-family:var(--mono);font-weight:600;color:#4F8EF7">${item.totalOrc?fR(item.totalOrc):'—'}</td>
                  <td style="padding:4px 6px;text-align:right">
                    <input type="number" value="${item.qtdReal??''}" placeholder="—" min="0" step="0.01"
                      onchange="atualizarItemOrc('${orc.id}','${item.id}','qtdReal',this.value)"
                      style="width:65px;text-align:right;font-family:var(--mono);font-size:12px;padding:4px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--green);border-radius:4px">
                  </td>
                  <td style="padding:4px 6px;text-align:right">
                    <input type="number" value="${item.precoUnitReal??''}" placeholder="—" min="0" step="0.01"
                      onchange="atualizarItemOrc('${orc.id}','${item.id}','precoUnitReal',this.value)"
                      style="width:80px;text-align:right;font-family:var(--mono);font-size:12px;padding:4px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--green);border-radius:4px">
                  </td>
                  <td style="padding:6px 6px;text-align:right;font-family:var(--mono);font-weight:600;color:${item.totalReal!=null&&item.totalReal>0?'var(--green)':'var(--text3)'}">
                    ${item.totalReal!=null ? fR(item.totalReal) : '—'}
                  </td>
                  <td style="padding:6px 6px;text-align:right;font-family:var(--mono);font-weight:600;color:${d===null?'var(--text3)':d>0?'var(--red)':d<0?'var(--green)':'var(--text3)'}">
                    ${d===null ? '—' : (d>=0?'+':'')+fR(d)}
                  </td>
                  <td style="padding:6px 6px;text-align:center">
                    <button class="btn-sm btn-red" onclick="excluirItemOrc('${orc.id}','${item.id}')" title="Remover">✕</button>
                  </td>
                </tr>`;
              }).join('')}
            <tr style="border-top:2px solid var(--border2);background:var(--bg3);font-weight:700">
              <td colspan="4" style="padding:8px 10px;font-size:11px;color:var(--text3);text-transform:uppercase">Total Geral</td>
              <td style="padding:8px 6px;text-align:right;font-family:var(--mono);color:#4F8EF7">${fR(totalOrc)}</td>
              <td colspan="2"></td>
              <td style="padding:8px 6px;text-align:right;font-family:var(--mono);color:var(--green)">${totalReal>0?fR(totalReal):'—'}</td>
              <td style="padding:8px 6px;text-align:right;font-family:var(--mono);color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--text3)'}">
                ${totalReal>0?(diff>=0?'+':'')+fR(diff):'—'}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    ${Object.keys(catMap).length > 1 ? `
    <div class="sec" style="margin-top:12px">
      <div class="sec-head"><span class="sec-title">Resumo por categoria</span></div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr style="border-bottom:1px solid var(--border2);font-size:10px;text-transform:uppercase">
            <th style="padding:7px 10px;text-align:left;font-weight:500;color:var(--text3)">Categoria</th>
            <th style="padding:7px 10px;text-align:right;font-weight:600;color:#4F8EF7">Total Orc</th>
            <th style="padding:7px 10px;text-align:right;font-weight:600;color:var(--green)">Total Real</th>
            <th style="padding:7px 10px;text-align:right;font-weight:500;color:var(--text3)">Diferença</th>
            <th style="padding:7px 10px;text-align:right;font-weight:500;color:var(--text3)">% do total orc</th>
          </tr></thead>
          <tbody>
            ${Object.entries(catMap).sort((a,b)=>b[1].orc-a[1].orc).map(([cat,v])=>{
              const d = v.real - v.orc;
              const pct = totalOrc > 0 ? ((v.orc/totalOrc)*100).toFixed(0) : 0;
              return `<tr style="border-bottom:1px solid var(--border)">
                <td style="padding:7px 10px"><span class="badge b-blue" style="font-size:10px">${cat}</span></td>
                <td style="padding:7px 10px;text-align:right;font-family:var(--mono);color:#4F8EF7">${fR(v.orc)}</td>
                <td style="padding:7px 10px;text-align:right;font-family:var(--mono);color:var(--green)">${v.real>0?fR(v.real):'—'}</td>
                <td style="padding:7px 10px;text-align:right;font-family:var(--mono);font-weight:600;color:${d>0?'var(--red)':d<0?'var(--green)':'var(--text3)'}">
                  ${v.real>0?(d>=0?'+':'')+fR(d):'—'}
                </td>
                <td style="padding:7px 10px;text-align:right;color:var(--text3)">${pct}%</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}`;
}

// ─── CRIAR ORÇAMENTO ─────────────────────────────────────────────────────────

function criarOrcamento() {
  const nome = document.getElementById('orc-m-cliente')?.value?.trim();
  if (!nome) { alert2('Informe o nome do cliente/evento.', 'error'); return; }
  const conv = parseInt(document.getElementById('orc-m-conv')?.value) || 0;
  if (!conv) { alert2('Informe o número de convidados.', 'error'); return; }
  if (!D.orcamentos) D.orcamentos = [];
  const id = 'ORC' + Date.now();
  const local      = document.getElementById('orc-m-local')?.value || 'area_central';
  const tipoEvento = document.getElementById('orc-m-tipo')?.value  || 'outros';
  D.orcamentos.push({
    id,
    nomeCliente:  nome,
    dataEvento:   document.getElementById('orc-m-data')?.value || '',
    convidados:   conv,
    criadoEm:     new Date().toISOString(),
    itens:      [],
    calcItens:  [],
    insumos:    [],
    calcParams: {
      local,
      tipoEvento,
      cfVas:    'padrao',
      cfCond:   'padrao',
      cfCI:     'normal',
      cfPerda:  'padrao',
      margemSeguranca: 10,
      margemLucro:     30,
    }
  });
  sv('orcamentos');
  document.getElementById('m-novo-orc').style.display = 'none';
  ['orc-m-cliente','orc-m-data','orc-m-conv'].forEach(fid => {
    const el = document.getElementById(fid); if (el) el.value = '';
  });
  abrirOrcDetalhe(id);
}

// ─── ADICIONAR ITEM MANUAL ────────────────────────────────────────────────────

function abrirAddItemOrc(orcId) {
  document.getElementById('orc-add-orcid').value = orcId;
  ['orc-add-nome','orc-add-cat','orc-add-qtdorc','orc-add-preco','orc-add-qtdreal'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('orc-add-preco-ref').textContent = '';
  document.getElementById('m-add-orc-item').style.display = 'flex';
}

function orcAddAutoFill() {
  const nome = document.getElementById('orc-add-nome')?.value?.trim();
  if (!nome) return;
  const match = (typeof nomes !== 'undefined' ? nomes : [])
    .find(n => n.toLowerCase() === nome.toLowerCase() ||
               n.toLowerCase().includes(nome.toLowerCase()) ||
               nome.toLowerCase().includes(n.toLowerCase()));
  if (match) {
    if (typeof MAR !== 'undefined' && MAR[match])
      document.getElementById('orc-add-cat').value = MAR[match].cat || '';
    const precoRef = D.precos?.[match]?.custo;
    if (precoRef) {
      document.getElementById('orc-add-preco-ref').textContent = '← Preço cadastrado: ' + fR(precoRef);
    }
  }
}

function salvarAddItemOrc() {
  const orcId = document.getElementById('orc-add-orcid')?.value;
  const nome  = document.getElementById('orc-add-nome')?.value?.trim();
  if (!nome) { alert('Informe o nome do produto.'); return; }

  const orc = (D.orcamentos||[]).find(o => o.id === orcId);
  if (!orc) return;

  const qtdOrc      = parseFloat(document.getElementById('orc-add-qtdorc')?.value) || 0;
  const precoUnitOrc= parseFloat(document.getElementById('orc-add-preco')?.value)  || 0;
  const categoria   = document.getElementById('orc-add-cat')?.value?.trim() || '';
  const totalOrc    = Math.round(qtdOrc * precoUnitOrc * 100) / 100;

  // Tenta cruzar com cadastro
  const match = (typeof nomes !== 'undefined' ? nomes : [])
    .find(n => n.toLowerCase() === nome.toLowerCase() ||
               n.toLowerCase().includes(nome.toLowerCase()));
  const nomeFinal = match || nome;
  const cat = categoria || (typeof MAR !== 'undefined' && MAR[nomeFinal] ? MAR[nomeFinal].cat : '');
  const precoRef = D.precos?.[nomeFinal]?.custo || null;

  if (!orc.itens) orc.itens = [];
  orc.itens.push({
    id: 'OI' + Date.now() + Math.random().toString(36).slice(2,4),
    nome: nomeFinal,
    categoria: cat,
    unidade: 'un',
    qtdOrc, precoUnitOrc, totalOrc,
    qtdReal: null,
    precoUnitReal: precoRef,
    totalReal: null,
    diferenca: null
  });

  // Produto novo não cadastrado → oferecer adicionar
  if (!D.precos?.[nomeFinal] && precoUnitOrc > 0) {
    if (confirm(`"${nomeFinal}" não está no cadastro de preços.\nAdicionar com custo ${fR(precoUnitOrc)}?`)) {
      if (!D.precos) D.precos = {};
      if (!D.precos[nomeFinal]) D.precos[nomeFinal] = {};
      D.precos[nomeFinal].custo = precoUnitOrc;
      sv('precos');
    }
  }

  sv('orcamentos');
  document.getElementById('m-add-orc-item').style.display = 'none';
  rOrcDetalhe();
}

// ─── ATUALIZAR ITEM (VALORES REAIS) ──────────────────────────────────────────

function atualizarItemOrc(orcId, itemId, campo, valor) {
  const orc  = (D.orcamentos||[]).find(o => o.id === orcId);
  if (!orc) return;
  const item = (orc.itens||[]).find(i => i.id === itemId);
  if (!item) return;

  item[campo] = valor !== '' ? parseFloat(valor) : null;

  // Recalcular totais
  if (item.qtdReal != null && item.precoUnitReal != null) {
    item.totalReal = Math.round(item.qtdReal * item.precoUnitReal * 100) / 100;
    item.diferenca = Math.round((item.totalReal - (item.totalOrc||0)) * 100) / 100;
  } else {
    item.totalReal = null;
    item.diferenca = null;
  }

  // Preço real diferente do cadastro → oferecer atualizar
  if (campo === 'precoUnitReal' && item.precoUnitReal != null && item.nome) {
    const precoAtual = D.precos?.[item.nome]?.custo;
    if (precoAtual != null && Math.abs(precoAtual - item.precoUnitReal) > 0.01) {
      if (confirm(`Preço de "${item.nome}" mudou:\n${fR(precoAtual)} → ${fR(item.precoUnitReal)}\n\nAtualizar no cadastro de preços?`)) {
        if (!D.precos[item.nome]) D.precos[item.nome] = {};
        D.precos[item.nome].custo = item.precoUnitReal;
        sv('precos');
        alert2('Preço atualizado no cadastro!');
      }
    }
  }

  sv('orcamentos');
  // Atualiza só os totais sem re-renderizar a tabela toda (mantém foco no input)
  _atualizarTotaisOrc(orc);
}

function _atualizarTotaisOrc(orc) {
  const itens     = orc.itens || [];
  const totalOrc  = itens.reduce((s,i) => s+(i.totalOrc||0), 0);
  const totalReal = itens.reduce((s,i) => s+(i.totalReal||0), 0);
  // Re-renderiza só a linha da diferença e os cards — evita perder foco
  // Para simplicidade, chamamos rOrcDetalhe com um flag (ou só recarregamos após blur)
  // Aqui salvamos e confiamos no próximo render completo
}

// ─── EXCLUIR ─────────────────────────────────────────────────────────────────

function excluirOrc(id) {
  if (!confirm('Excluir este orçamento e todos os seus itens?')) return;
  D.orcamentos = (D.orcamentos||[]).filter(o => o.id !== id);
  sv('orcamentos');
  rOrcLista();
}

function excluirItemOrc(orcId, itemId) {
  const orc = (D.orcamentos||[]).find(o => o.id === orcId);
  if (!orc) return;
  orc.itens = (orc.itens||[]).filter(i => i.id !== itemId);
  sv('orcamentos');
  rOrcDetalhe();
}

// ─── IMPORTAR EXCEL ───────────────────────────────────────────────────────────
// Formato esperado (colado do Excel, separado por Tab):
// Produto  |  Qtd Orçada  |  Preço Unit Orçado
// -----------------------------------------------

function abrirImportOrc(orcId) {
  document.getElementById('orc-imp-orcid').value = orcId;
  document.getElementById('orc-imp-area').value  = '';
  document.getElementById('orc-imp-preview').innerHTML = '';
  document.getElementById('orc-imp-info').textContent  = '';
  document.getElementById('m-import-orc').style.display = 'flex';
}

function _parsearLinhasExcel() {
  const texto = document.getElementById('orc-imp-area')?.value || '';
  const itens = [];
  const linhas = texto.trim().split('\n').filter(l => l.trim());

  for (const linha of linhas) {
    const cols = linha.split('\t').map(c => c.trim().replace(/^"|"$/g,'').replace(/\s+/g,' '));
    if (cols.length < 2) continue;

    const nome = cols[0];
    if (!nome || /^(produto|item|descrição|descrição|name|#)/i.test(nome)) continue;

    // Aceita vírgula ou ponto como decimal
    const parseNum = s => parseFloat((s||'').replace(/\./g,'').replace(',','.')) || 0;
    const qtd   = parseNum(cols[1]);
    const preco = parseNum(cols[2] || '');

    if (!nome || qtd === 0) continue;
    itens.push({ nome, qtdOrc: qtd, precoUnitOrc: preco });
  }
  return itens;
}

function previewImportOrc() {
  const itens   = _parsearLinhasExcel();
  const preview = document.getElementById('orc-imp-preview');
  const info    = document.getElementById('orc-imp-info');

  if (!itens.length) {
    preview.innerHTML = '<div style="padding:16px;color:var(--text3);font-size:12px">Nenhum item reconhecido. Verifique o formato.</div>';
    info.textContent  = '';
    return;
  }

  let mapeados = 0;
  const rows = itens.map(it => {
    const match = (typeof nomes !== 'undefined' ? nomes : [])
      .find(n => n.toLowerCase() === it.nome.toLowerCase() ||
                 n.toLowerCase().includes(it.nome.toLowerCase()) ||
                 it.nome.toLowerCase().includes(n.toLowerCase()));
    const nomeFinal = match || it.nome;
    const cat       = match && typeof MAR !== 'undefined' ? MAR[match]?.cat : '';
    const precoRef  = D.precos?.[nomeFinal]?.custo;
    if (precoRef) mapeados++;

    return `<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:5px 8px;font-size:11px">
        ${it.nome}
        ${match ? `<span style="color:var(--green);font-size:9px;margin-left:4px">✓ mapeado</span>` : `<span style="color:var(--amber);font-size:9px;margin-left:4px">novo</span>`}
      </td>
      <td style="padding:5px 8px;font-size:10px">${cat||'—'}</td>
      <td style="padding:5px 8px;text-align:right;font-family:var(--mono);font-size:11px">${it.qtdOrc}</td>
      <td style="padding:5px 8px;text-align:right;font-family:var(--mono);font-size:11px">${it.precoUnitOrc?fR(it.precoUnitOrc):'—'}</td>
      <td style="padding:5px 8px;text-align:right;font-family:var(--mono);font-size:11px;font-weight:600">${fR(it.qtdOrc*it.precoUnitOrc)}</td>
      <td style="padding:5px 8px;text-align:right;font-family:var(--mono);font-size:11px;color:var(--green)">${precoRef?fR(precoRef):'—'}</td>
    </tr>`;
  }).join('');

  preview.innerHTML = `
    <div style="overflow-x:auto;max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius)">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:var(--bg3);font-size:10px;text-transform:uppercase;color:var(--text3)">
            <th style="padding:6px 8px;text-align:left;font-weight:500">Produto</th>
            <th style="padding:6px 8px;text-align:left;font-weight:500">Cat.</th>
            <th style="padding:6px 8px;text-align:right;font-weight:500">Qtd Orc</th>
            <th style="padding:6px 8px;text-align:right;font-weight:500">Preço Orc</th>
            <th style="padding:6px 8px;text-align:right;font-weight:500">Total Orc</th>
            <th style="padding:6px 8px;text-align:right;font-weight:500;color:var(--green)">Preço Ref</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  info.textContent = `${itens.length} item(ns) · ${mapeados} com preço de referência no cadastro`;
}

function confirmarImportOrc() {
  const orcId = document.getElementById('orc-imp-orcid')?.value;
  const orc   = (D.orcamentos||[]).find(o => o.id === orcId);
  if (!orc) return;

  const itens = _parsearLinhasExcel();
  if (!itens.length) { alert('Nenhum item para importar. Verifique o formato.'); return; }

  if (!orc.itens) orc.itens = [];

  itens.forEach(it => {
    const match = (typeof nomes !== 'undefined' ? nomes : [])
      .find(n => n.toLowerCase() === it.nome.toLowerCase() ||
                 n.toLowerCase().includes(it.nome.toLowerCase()) ||
                 it.nome.toLowerCase().includes(n.toLowerCase()));
    const nomeFinal = match || it.nome;
    const cat       = match && typeof MAR !== 'undefined' ? MAR[match]?.cat : '';
    const precoRef  = D.precos?.[nomeFinal]?.custo || null;
    const totalOrc  = Math.round(it.qtdOrc * it.precoUnitOrc * 100) / 100;

    orc.itens.push({
      id: 'OI' + Date.now() + Math.random().toString(36).slice(2,5),
      nome: nomeFinal,
      categoria: cat || '',
      unidade: 'un',
      qtdOrc:       it.qtdOrc,
      precoUnitOrc: it.precoUnitOrc,
      totalOrc,
      qtdReal:       null,
      precoUnitReal: precoRef,  // ← já preenche do cadastro
      totalReal:     null,
      diferenca:     null
    });
  });

  sv('orcamentos');
  document.getElementById('m-import-orc').style.display = 'none';
  alert2(`${itens.length} item(ns) importados!`);
  rOrcDetalhe();
}

// ═══════════════════════════════════════════════════════════════════════════
