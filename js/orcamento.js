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
  orcDetTab  = 'cardapio';
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
    <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
      <button class="sort-btn ${orcDetTab==='evento'?'active':''}" onclick="setOrcTab('evento')">📋 Evento</button>
      <button class="sort-btn ${orcDetTab==='cardapio'?'active':''}" onclick="setOrcTab('cardapio')">🍹 Cardápio</button>
      <button class="sort-btn ${orcDetTab==='servicos'?'active':''}" onclick="setOrcTab('servicos')">➕ Serviços</button>
      <button class="sort-btn ${orcDetTab==='calc'?'active':''}" onclick="setOrcTab('calc')">📊 Calculadora</button>
      <button class="sort-btn ${orcDetTab==='real'?'active':''}" onclick="setOrcTab('real')">📋 Orçado vs Real</button>
    </div>

    <div id="orc-det-content"></div>`;

  _rTabContent();
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
    servicos:   [],
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
    const precoRef = _orcPrecoInsumo(match);
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

// ─── ROTEADOR DE ABAS ────────────────────────────────────────────────────────

function _rTabContent() {
  const orc = (D.orcamentos||[]).find(o => o.id === orcAtualId);
  if (!orc) return;
  if      (orcDetTab === 'evento')   rOrcEvento(orc);
  else if (orcDetTab === 'cardapio') rOrcCardapio(orc);
  else if (orcDetTab === 'servicos') rOrcServicos(orc);
  else if (orcDetTab === 'calc')     rOrcCalc();
  else if (orcDetTab === 'real')     _rOrcRealContent(orc);
}

// ─── ABA EVENTO ──────────────────────────────────────────────────────────────

function rOrcEvento(orc) {
  const el = document.getElementById('orc-det-content');
  if (!el) return;
  const p = orc.calcParams || {};
  const localAtual = (typeof _migrarLocalOrcamento === 'function') ? _migrarLocalOrcamento(p) : (p.local || 'area_central');
  const LOCAIS = (typeof REGIOES_LOCAL !== 'undefined')
    ? Object.fromEntries(REGIOES_LOCAL.map(r => [r.key, r.label]))
    : { area_central:'Área Central BH', jardim_canada:'Jardim Canadá / C. Nova', reg_metro:'Região Metropolitana' };
  const TIPOS = {casamento:'Casamento', '15anos':'15 Anos', formatura:'Formatura', outros:'Outros'};

  el.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-width:600px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">📋 Dados do Evento</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="grid-column:1/-1">
          <label class="lbl">Nome do cliente / evento</label>
          <input id="ev-nome" class="inp" type="text" value="${orc.nomeCliente||''}" placeholder="Nome do cliente ou evento">
        </div>
        <div>
          <label class="lbl">Data do evento</label>
          <input id="ev-data" class="inp" type="date" value="${orc.dataEvento||''}">
        </div>
        <div>
          <label class="lbl">Nº de convidados</label>
          <input id="ev-conv" class="inp" type="number" min="1" value="${orc.convidados||''}" placeholder="Ex: 200">
        </div>
        <div>
          <label class="lbl">Local</label>
          <select id="ev-local" class="inp">
            ${Object.entries(LOCAIS).map(([k,v])=>`<option value="${k}"${localAtual===k?' selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="lbl">Tipo de evento</label>
          <select id="ev-tipo" class="inp">
            ${Object.entries(TIPOS).map(([k,v])=>`<option value="${k}"${(p.tipoEvento||'outros')===k?' selected':''}>${v}</option>`).join('')}
          </select>
        </div>
      </div>
      <div style="margin-top:16px">
        <button class="btn btn-primary" onclick="salvarDadosEvento('${orc.id}')">💾 Salvar alterações</button>
      </div>
    </div>`;
}

function salvarDadosEvento(orcId) {
  const orc = (D.orcamentos||[]).find(o => o.id === orcId);
  if (!orc) return;
  const nome = document.getElementById('ev-nome')?.value?.trim();
  const conv = parseInt(document.getElementById('ev-conv')?.value) || 0;
  if (!nome) { alert2('Informe o nome do cliente/evento.', 'error'); return; }
  if (!conv) { alert2('Informe o número de convidados.', 'error'); return; }
  orc.nomeCliente = nome;
  orc.dataEvento  = document.getElementById('ev-data')?.value || '';
  orc.convidados  = conv;
  if (!orc.calcParams) orc.calcParams = {};
  orc.calcParams.local      = document.getElementById('ev-local')?.value  || 'area_central';
  orc.calcParams.tipoEvento = document.getElementById('ev-tipo')?.value   || 'outros';
  sv('orcamentos');
  alert2('Alterações salvas!');
  rOrcDetalhe();
}

// ─── ABA CARDÁPIO ─────────────────────────────────────────────────────────────

// Ordem das categorias tal como cadastradas nas Fichas de Coquetéis (Regras → Fichas)
var _ORC_CAT_ORDEM = ['BEBIDAS ALCOÓLICAS','COPOS E TAÇAS','HORTIFRUTI','ESPECIARIAS','MIX ARTESANAL','PRODUÇÃO','XAROPES','MATERIAL (ESPECÍFICO)'];

function _orcOrdenarCats(cats) {
  return cats.sort((a,b) => {
    const ia = _ORC_CAT_ORDEM.indexOf(a), ib = _ORC_CAT_ORDEM.indexOf(b);
    if (ia===-1 && ib===-1) return a.localeCompare(b);
    if (ia===-1) return 1;
    if (ib===-1) return -1;
    return ia-ib;
  });
}

function rOrcCardapio(orc) {
  const el = document.getElementById('orc-det-content');
  if (!el) return;
  const insumos      = orc.insumos || [];
  const p            = orc.calcParams || {};
  const custoInsumos = insumos.reduce((s,i) => s + (i.total||0), 0);

  const grupoLabel = (typeof _calcTipoToGrupoRC === 'function') ? _calcTipoToGrupoRC(p.tipoEvento||'outros') : '';

  const coqueteisAplicados = [...new Set(insumos.flatMap(i => i.coqueteis||[]))];
  const coqueteisHtml = coqueteisAplicados.length ? `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">🍹 Coquetéis aplicados</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${coqueteisAplicados.map(nome => `
          <div style="display:flex;align-items:center;gap:2px;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:5px 5px 5px 12px">
            <span style="font-size:12px;font-weight:600;color:var(--text)">${nome}</span>
            <button data-nome="${nome}" onclick="orcExcluirCoquetel('${orc.id}',this.dataset.nome)"
              style="background:none;border:none;color:var(--red);cursor:pointer;font-size:11px;padding:4px 8px;border-radius:4px" title="Excluir este coquetel dos insumos">🗑️ Excluir</button>
          </div>`).join('')}
      </div>
    </div>` : '';

  const fichaSelectHtml = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">🍹 Selecionar Cardápio</div>
      <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <label class="lbl">Ficha de coquetel</label>
          ${(D.fichas||[]).length
            ? `<select id="orc-ficha-sel" onchange="orcSelecionarFicha(this.value)"
                style="width:100%;padding:7px 10px;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:12px">
                <option value="">— Selecione uma ficha —</option>
                ${(D.fichas||[]).map(f=>`<option value="${f.id}"${f.id===_orcCardapioFichaId?' selected':''}>${f.nome}${f.variantes?' ('+f.variantes+')':''}</option>`).join('')}
              </select>`
            : '<span style="font-size:11px;color:var(--text3)">Nenhuma ficha cadastrada. Vá em Regras → Fichas de Coquetéis.</span>'
          }
        </div>
        <div style="font-size:10px;color:var(--text3);padding-bottom:8px">
          Ref.: <strong>${grupoLabel}</strong> · ${orc.convidados||0} pax
        </div>
      </div>

      ${_orcCardapioItems.length ? `
        <div style="margin-top:12px;border:1px solid var(--border);border-radius:6px;overflow:hidden;font-size:12px">
          <div style="padding:6px 12px;background:var(--bg3);border-bottom:1px solid var(--border);display:flex;justify-content:space-between">
            <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Item do cardápio</span>
            <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd estimada</span>
          </div>
          ${(() => {
            const porCat = {};
            _orcCardapioItems.forEach((item,idx) => {
              const cat = item.cat || 'OUTROS';
              (porCat[cat] = porCat[cat]||[]).push({...item, idx});
            });
            return _orcOrdenarCats(Object.keys(porCat)).map(cat => `
              <div style="padding:5px 12px;background:var(--bg4,var(--bg3));font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;border-bottom:1px solid var(--border)">${cat}</div>
              ${porCat[cat].map(item=>`
                <div style="display:grid;grid-template-columns:1fr 120px;gap:8px;align-items:center;padding:6px 12px;border-bottom:1px solid var(--border)">
                  <div>
                    <span style="font-weight:500;color:var(--text)">${item.nome}</span>
                    ${item.origem==='proporcao'?'<span style="font-size:9px;color:var(--blue,#4F8EF7);margin-left:4px">(via Regras de Proporção)</span>':''}
                    ${!item.origem?'<span style="font-size:9px;color:var(--amber);margin-left:4px">(sem ref. histórica nem regra)</span>':''}
                  </div>
                  <div style="display:flex;align-items:center;gap:3px;justify-content:flex-end">
                    <input type="number" id="orc-card-item-${item.idx}" value="${item.qtd}" min="0" step="1"
                      onchange="calcUpdateCardapioItem(${item.idx},this.value)"
                      style="width:55px;text-align:center;font-size:12px;font-weight:700;padding:3px 5px;border-radius:4px;border:1px solid ${item.qtd>0?'var(--green-dim)':'var(--border2)'};background:var(--bg);color:${item.qtd>0?'var(--green)':'var(--text3)'};font-family:var(--mono)">
                    <span style="font-size:9px;color:var(--text3)">${typeof _orcGetUnit==='function'?_orcGetUnit(item.rcNome||''):''}</span>
                  </div>
                </div>`).join('')}`).join('');
          })()}
        </div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button onclick="orcAplicarCardapio('${orc.id}')"
            style="background:#4F8EF7;border:none;color:white;border-radius:var(--radius);font-size:12px;padding:8px 20px;cursor:pointer;font-weight:600">⚡ Aplicar ao orçamento</button>
          <button onclick="orcLimparCardapio()"
            style="background:var(--bg3);border:1px solid var(--border);color:var(--text2);border-radius:var(--radius);font-size:12px;padding:8px 12px;cursor:pointer">✕ Cancelar</button>
        </div>
      ` : ''}
    </div>`;

  const _insCols = 'minmax(0,1fr) 130px 110px 100px 26px';

  const insumosHtml = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid #F97316;border-radius:var(--radius)">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border)">
        <span style="font-size:12px;font-weight:700;color:#F97316">🍾 Insumos / Bebidas</span>
        <span style="font-size:13px;font-weight:700;font-family:var(--mono);color:#F97316">${fR(custoInsumos)}</span>
      </div>
      ${insumos.length ? `
        <div style="display:grid;grid-template-columns:${_insCols};font-size:9px;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border);padding:5px 10px">
          <div style="text-align:left;font-weight:500">Insumo</div>
          <div style="text-align:right;font-weight:500;padding-right:6px">Qtd</div>
          <div style="text-align:right;font-weight:500;padding-right:6px">Custo/uni</div>
          <div style="text-align:right;font-weight:500">Total</div>
          <div></div>
        </div>
        ${(() => {
          const porCat = {};
          insumos.forEach(ins => { const cat = ins.cat || 'OUTROS'; (porCat[cat] = porCat[cat]||[]).push(ins); });
          return _orcOrdenarCats(Object.keys(porCat)).map(cat => `
            <div style="padding:5px 10px;background:var(--bg4,var(--bg3));font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;border-bottom:1px solid var(--border)">${cat}</div>
            ${porCat[cat].map(ins => `
              <div style="display:grid;grid-template-columns:${_insCols};align-items:center;gap:0;padding:6px 10px;border-bottom:1px solid var(--border);font-size:12px">
                <div>
                  <span style="font-weight:500;color:var(--text)">${ins.nome}</span>
                  ${(ins.coqueteis&&ins.coqueteis.length) ? `<div style="margin-top:2px;display:flex;gap:3px;flex-wrap:wrap">${ins.coqueteis.map(c=>`<span style="font-size:8px;font-weight:600;color:#4F8EF7;background:rgba(79,142,247,.14);padding:1px 6px;border-radius:8px;white-space:nowrap">🍹 ${c}</span>`).join('')}</div>` : ''}
                </div>
                <div style="text-align:right">${typeof _calcInsumoQtdCell==='function' ? _calcInsumoQtdCell(ins) : `<input type="number" value="${ins.qtdGarrafas}" min="0" step="1" onchange="calcUpdateInsumo('${ins.id}','qtdGarrafas',this.value)" style="width:65px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">`}</div>
                <div style="text-align:right">
                  <input type="number" value="${ins.custoGarrafa||''}" min="0" step="0.01" placeholder="0,00"
                    onchange="calcUpdateInsumo('${ins.id}','custoGarrafa',this.value)"
                    style="width:80px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
                </div>
                <div style="text-align:right;font-family:var(--mono);font-weight:700;color:#F97316">${fR(ins.total||0)}</div>
                <div style="text-align:center">
                  <span onclick="calcRemoveInsumo('${ins.id}')" style="cursor:pointer;color:var(--red);font-size:15px;line-height:1" title="Remover">×</span>
                </div>
              </div>`).join('')}`).join('');
        })()}` : `
          <div style="padding:24px;text-align:center;color:var(--text3);font-size:12px">
            Nenhum insumo adicionado. Selecione um cardápio acima ou adicione manualmente abaixo.
          </div>`}
      <div style="padding:10px 14px;border-top:1px solid var(--border);background:var(--bg3);border-radius:0 0 var(--radius) var(--radius)">
        <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;margin-bottom:8px">+ Adicionar insumo manualmente</div>
        <div style="display:grid;grid-template-columns:1fr 120px 120px auto;gap:8px;align-items:flex-end">
          <div>
            <label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">Nome do insumo</label>
            <input id="ins-nome" type="text" placeholder="Ex: Vodka, Gin, Whisky..."
              style="width:100%;font-size:11px;padding:5px 7px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
          </div>
          <div>
            <label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">Qtd</label>
            <input id="ins-qtd" type="number" min="0" step="1" placeholder="0"
              style="width:100%;font-size:11px;padding:5px 7px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius);font-family:var(--mono)">
          </div>
          <div>
            <label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">Custo/uni (R$)</label>
            <input id="ins-custo" type="number" min="0" step="0.01" placeholder="0,00"
              style="width:100%;font-size:11px;padding:5px 7px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius);font-family:var(--mono)">
          </div>
          <button onclick="calcAddInsumoItem()"
            style="background:#F97316;border:none;color:white;border-radius:var(--radius);font-size:11px;padding:6px 14px;cursor:pointer;white-space:nowrap;font-weight:600">+ Adicionar</button>
        </div>
      </div>
    </div>`;

  el.innerHTML = fichaSelectHtml + coqueteisHtml + insumosHtml;
}

function orcExcluirCoquetel(orcId, nomeCoquetel) {
  const orc = (D.orcamentos||[]).find(o => o.id === orcId);
  if (!orc || !orc.insumos) return;
  if (!confirm(`Excluir "${nomeCoquetel}"?\n\nInsumos usados só por este coquetel serão removidos. Insumos compartilhados com outros coquetéis aplicados serão mantidos.`)) return;

  let removidos = 0;
  orc.insumos = orc.insumos.filter(ins => {
    if (!ins.coqueteis || !ins.coqueteis.includes(nomeCoquetel)) return true;
    ins.coqueteis = ins.coqueteis.filter(c => c !== nomeCoquetel);
    if (ins.coqueteis.length === 0) { removidos++; return false; }
    return true;
  });

  sv('orcamentos');
  alert2(`🗑️ "${nomeCoquetel}" removido${removidos ? ' · ' + removidos + ' insumo(s) exclusivo(s) excluído(s)' : ''}.`);
  rOrcCardapio(orc);
}

function orcSelecionarFicha(fichaId) {
  _orcCardapioFichaId = fichaId;
  _orcCardapioItems   = [];
  const orc = _calcGetOrc();
  if (!fichaId || !orc) { if (orc) rOrcCardapio(orc); return; }

  const p       = orc.calcParams || {};
  const conv    = orc.convidados || 0;
  const grupoRC = (typeof _calcTipoToGrupoRC === 'function') ? _calcTipoToGrupoRC(p.tipoEvento||'outros') : 'CASAMENTO';
  const gd      = (typeof _rcGetStats === 'function') ? (_rcGetStats()[grupoRC] || {}) : {};
  const ficha   = (D.fichas||[]).find(f => f.id === fichaId);
  if (!ficha) { rOrcCardapio(orc); return; }

  // Fallback para Regras de Proporção (Regras e Cálculos → Proporções) quando o item não é uma
  // bebida rastreada pelo Ref.Consumo (ex: itens de MATERIAL/ESPECIARIAS/PRODUÇÃO como
  // Descascador, Tesoura, Suco de Limão) — mesma fórmula (calcQtdItem) que a Folha de
  // Separação já usa para gerar essas quantidades automaticamente.
  const autoS       = (typeof _calcAutoStaff === 'function') ? _calcAutoStaff(conv) : {bt:0,bb:0,hb:0,cd:0};
  const bartenders  = p.bartender != null ? Number(p.bartender) : (autoS.bt||0);
  const equipeTotal = bartenders
    + (p.barback != null ? Number(p.barback) : (autoS.bb||0))
    + (p.head    != null ? Number(p.head)    : (autoS.hb||0))
    + (p.coord   != null ? Number(p.coord)   : (autoS.cd||0))
    + (p.copeiro != null ? Number(p.copeiro) : 0);
  const regrasProp  = (typeof getRegrasItens === 'function') ? getRegrasItens() : [];

  (ficha.itens||[]).forEach(item => {
    const rc      = (typeof _rcMapFichaItemToRC === 'function') ? _rcMapFichaItemToRC(item.nome) : null;
    const d       = rc ? gd[rc] : null;
    // Sem histórico específico para este tipo de evento (d.avg), cai para a média geral
    // entre todos os tipos de evento (d.mediaGeral) — mesma lógica já usada na tabela
    // comparativa do Ref. Consumo (refConsumo.js). Sem isso, qualquer insumo sem histórico
    // "15 Anos"/"Formatura"/etc. específico vinha sempre zerado mesmo tendo dado de outros eventos.
    const base = d ? (d.avg != null ? d.avg : d.mediaGeral) : null;
    let   qtd    = (base != null && typeof _rcSugestao === 'function') ? _rcSugestao(base) : null;
    let   origem = qtd != null ? 'refconsumo' : null;

    if (qtd == null) {
      // categoria da ficha (ex: "MATERIAL (ESPECÍFICO)") não bate literalmente com a categoria
      // das Regras de Proporção (ex: "MATERIAL") — casa só pelo nome do item, que já é único.
      const regra = regrasProp.find(r => (r.item||'').trim().toUpperCase() === (item.nome||'').trim().toUpperCase());
      if (regra && typeof calcQtdItem === 'function') { qtd = calcQtdItem(regra, conv, bartenders, equipeTotal); origem = 'proporcao'; }
    }

    _orcCardapioItems.push({ cat: item.cat, nome: item.nome, rcNome: rc, origem, qtd: qtd != null ? qtd : 0 });
  });
  rOrcCardapio(orc);
}

// Preço que deve preencher automaticamente um insumo vindo do Cardápio/ficha:
// busca no Cadastro de Insumos (preço manual se existir, senão custo de
// reposição — mesma regra de precoEfetivoInsumo, js/insumos.js). Cai pro
// D.precos antigo (Estoque → Preços) só se o item ainda não estiver
// cadastrado em Insumos.
function _orcPrecoInsumo(nome) {
  const insumo = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(nome) : null;
  if (insumo) return (typeof precoEfetivoInsumo === 'function') ? precoEfetivoInsumo(insumo) : Number(insumo.precoManual || insumo.custoReposicao || 0);
  return (D.precos && D.precos[nome]) ? (D.precos[nome].custo || 0) : 0;
}

function orcAplicarCardapio(orcId) {
  const orc = (D.orcamentos||[]).find(o => o.id === orcId);
  if (!orc) return;
  const fichaAtual = (D.fichas||[]).find(f => f.id === _orcCardapioFichaId);
  const fichaNome  = fichaAtual ? fichaAtual.nome : '';
  _orcCardapioItems.forEach((item, idx) => {
    const inp = document.getElementById('orc-card-item-' + idx);
    if (inp) item.qtd = parseInt(inp.value) || 0;
  });
  if (!orc.insumos) orc.insumos = [];
  let adicionados = 0, atualizados = 0;
  _orcCardapioItems.forEach(item => {
    const nome = item.rcNome || item.nome;
    const qtd  = item.qtd;
    const existing = orc.insumos.find(i => i.nome === nome);
    if (existing) {
      existing.qtdGarrafas = qtd;
      // Backfill: só preenche se ainda estiver zerado (nunca sobrescreve um
      // custo que ela já tenha ajustado manualmente na tabela do orçamento).
      if (!existing.custoGarrafa) existing.custoGarrafa = _orcPrecoInsumo(nome);
      existing.total = Math.round(qtd * (existing.custoGarrafa||0) * 100) / 100;
      if (!existing.cat) existing.cat = item.cat;
      if (!existing.coqueteis) existing.coqueteis = [];
      if (fichaNome && !existing.coqueteis.includes(fichaNome)) existing.coqueteis.push(fichaNome);
      atualizados++;
    } else {
      const precoRef = _orcPrecoInsumo(nome);
      orc.insumos.push({
        id: 'ins-' + Date.now() + '-' + Math.random().toString(36).slice(2,4),
        nome, qtdGarrafas: qtd, custoGarrafa: precoRef,
        total: Math.round(qtd * precoRef * 100) / 100,
        cat: item.cat,
        coqueteis: fichaNome ? [fichaNome] : [],
      });
      adicionados++;
    }
  });
  sv('orcamentos');
  _orcCardapioFichaId = '';
  _orcCardapioItems   = [];
  alert2(`✅ ${adicionados} insumo(s) adicionado(s)${atualizados?' · '+atualizados+' atualizado(s)':''}.`);
  rOrcCardapio(orc);
}

function orcLimparCardapio() {
  _orcCardapioFichaId = '';
  _orcCardapioItems   = [];
  const orc = _calcGetOrc();
  if (orc) rOrcCardapio(orc);
}

// ─── ABA SERVIÇOS OPCIONAIS ───────────────────────────────────────────────────

function rOrcServicos(orc) {
  const el = document.getElementById('orc-det-content');
  if (!el) return;
  const servicos = orc.servicos || [];
  const totalSvc = servicos.reduce((s,v) => s + (v.total||0), 0);

  el.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid #8B5CF6;border-radius:var(--radius)">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border)">
        <span style="font-size:12px;font-weight:700;color:#8B5CF6">➕ Serviços Opcionais</span>
        <span style="font-size:13px;font-weight:700;font-family:var(--mono);color:#8B5CF6">${fR(totalSvc)}</span>
      </div>
      ${servicos.length ? `
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="font-size:9px;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border)">
              <th style="padding:5px 10px;text-align:left;font-weight:500">Serviço</th>
              <th style="padding:5px 6px;text-align:right;font-weight:500">Qtd</th>
              <th style="padding:5px 6px;text-align:right;font-weight:500">Preço unit.</th>
              <th style="padding:5px 6px;text-align:right;font-weight:500">Total</th>
              <th style="width:28px"></th>
            </tr>
          </thead>
          <tbody>
            ${servicos.map(svc => `
              <tr style="border-bottom:1px solid var(--border)">
                <td style="padding:6px 10px;font-weight:500;color:var(--text)">${svc.nome}</td>
                <td style="padding:4px 6px;text-align:right">
                  <input type="number" value="${svc.qtd}" min="0" step="1"
                    onchange="updateServico('${orc.id}','${svc.id}','qtd',this.value)"
                    style="width:65px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
                </td>
                <td style="padding:4px 6px;text-align:right">
                  <input type="number" value="${svc.precoUnit||''}" min="0" step="0.01" placeholder="0,00"
                    onchange="updateServico('${orc.id}','${svc.id}','precoUnit',this.value)"
                    style="width:85px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
                </td>
                <td style="padding:6px 8px;text-align:right;font-family:var(--mono);font-weight:700;color:#8B5CF6">${fR(svc.total||0)}</td>
                <td style="padding:6px 8px;text-align:center">
                  <span onclick="removerServico('${orc.id}','${svc.id}')" style="cursor:pointer;color:var(--red);font-size:15px;line-height:1">×</span>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>` : `
          <div style="padding:24px;text-align:center;color:var(--text3);font-size:12px">
            Nenhum serviço opcional adicionado.
          </div>`}
      <div style="padding:10px 14px;border-top:1px solid var(--border);background:var(--bg3);border-radius:0 0 var(--radius) var(--radius)">
        <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;margin-bottom:8px">+ Adicionar serviço</div>
        <div style="display:grid;grid-template-columns:1fr 80px 110px auto;gap:8px;align-items:flex-end">
          <div>
            <label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">Nome do serviço</label>
            <input id="svc-nome" type="text" placeholder="Ex: Coquetel de boas-vindas, Aluguel de equipamento..."
              style="width:100%;font-size:11px;padding:5px 7px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
          </div>
          <div>
            <label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">Qtd</label>
            <input id="svc-qtd" type="number" min="1" step="1" value="1"
              style="width:100%;font-size:11px;padding:5px 7px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius);font-family:var(--mono)">
          </div>
          <div>
            <label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">Preço unit. (R$)</label>
            <input id="svc-preco" type="number" min="0" step="0.01" placeholder="0,00"
              style="width:100%;font-size:11px;padding:5px 7px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius);font-family:var(--mono)">
          </div>
          <button onclick="addServico('${orc.id}')"
            style="background:#8B5CF6;border:none;color:white;border-radius:var(--radius);font-size:11px;padding:6px 14px;cursor:pointer;white-space:nowrap;font-weight:600">+ Adicionar</button>
        </div>
      </div>
    </div>`;
}

function addServico(orcId) {
  const nome  = document.getElementById('svc-nome')?.value?.trim();
  const qtd   = parseFloat(document.getElementById('svc-qtd')?.value)   || 1;
  const preco = parseFloat(document.getElementById('svc-preco')?.value) || 0;
  if (!nome) { alert2('Informe o nome do serviço.', 'error'); return; }
  const orc = (D.orcamentos||[]).find(o => o.id === orcId);
  if (!orc) return;
  if (!orc.servicos) orc.servicos = [];
  orc.servicos.push({
    id: 'svc-' + Date.now() + Math.random().toString(36).slice(2,4),
    nome, qtd, precoUnit: preco,
    total: Math.round(qtd * preco * 100) / 100
  });
  sv('orcamentos');
  rOrcServicos(orc);
}

function updateServico(orcId, svcId, campo, valor) {
  const orc = (D.orcamentos||[]).find(o => o.id === orcId);
  if (!orc) return;
  const svc = (orc.servicos||[]).find(s => s.id === svcId);
  if (!svc) return;
  svc[campo] = parseFloat(valor) || 0;
  svc.total  = Math.round((svc.qtd||0) * (svc.precoUnit||0) * 100) / 100;
  sv('orcamentos');
  rOrcServicos(orc);
}

function removerServico(orcId, svcId) {
  const orc = (D.orcamentos||[]).find(o => o.id === orcId);
  if (!orc) return;
  orc.servicos = (orc.servicos||[]).filter(s => s.id !== svcId);
  sv('orcamentos');
  rOrcServicos(orc);
}

// ═══════════════════════════════════════════════════════════════════════════
