// ─── REFERÊNCIA DE CONSUMO ────────────────────────────────────────────────────

const RC_GRUPOS = ['CASAMENTO','ANIVERSÁRIO','CORPORATIVO','CONFRATERNIZAÇÃO','FORMATURA','NOIVADO','ALMOÇO'];

// Estado local
var _rcGrupo  = 'CASAMENTO';
var _rcPax    = 100;
var _rcFiltro = '';
var _rcView   = 'tabela'; // 'tabela' | 'importar'

// ── Dados: localStorage > hardcoded ──────────────────────────────────────────
function _rcGetData() {
  const saved = localStorage.getItem('refConsumoImportado');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  return (typeof REF_CONSUMO !== 'undefined') ? REF_CONSUMO : {};
}

function _rcGetMeta() {
  const m = localStorage.getItem('refConsumoMeta');
  if (m) { try { return JSON.parse(m); } catch(e) {} }
  return null;
}

// ── Render principal ──────────────────────────────────────────────────────────
function rRefConsumo() {
  const el = document.getElementById('refconsumo-content');
  if (!el) return;
  el.innerHTML = _rcView === 'importar' ? _rcBuildImport() : _rcBuildTabela();
}

// ── VIEW: TABELA ──────────────────────────────────────────────────────────────
function _rcBuildTabela() {
  const meta  = _rcGetMeta();
  const data  = _rcGetData();
  const fonte = meta
    ? `<span style="color:var(--green)">Base importada: ${meta.nEventos} eventos em ${meta.data}</span>`
    : `<span style="color:var(--text3)">Base padrão (${_rcContEventos()} eventos)</span>`;

  const grupoTabs = RC_GRUPOS.map(g =>
    `<button class="rc-tab${g === _rcGrupo ? ' active' : ''}" onclick="_rcSetGrupo('${g}')">${_rcGrupoLabel(g)}</button>`
  ).join('');

  const bevList = _rcGetBebidas(data);

  return `
<div style="padding:20px 24px;max-width:1100px">

  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;gap:12px;flex-wrap:wrap">
    <div>
      <div style="font-size:18px;font-weight:600;color:var(--text);margin-bottom:4px">Referência de Consumo por Evento</div>
      <div style="font-size:12px;color:var(--text3)">${fonte}</div>
    </div>
    <button class="btn" style="background:var(--blue);color:#fff;border-color:var(--blue);white-space:nowrap" onclick="_rcSetView('importar')">
      Importar / Atualizar base
    </button>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px">${grupoTabs}</div>

  <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap">
    <div style="display:flex;align-items:center;gap:8px">
      <label style="font-size:12px;color:var(--text3);font-weight:500">Convidados:</label>
      <input id="rc-pax" type="number" min="1" value="${_rcPax}"
        style="width:80px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"
        oninput="_rcSetPax(this.value)">
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <label style="font-size:12px;color:var(--text3);font-weight:500">Filtrar:</label>
      <input id="rc-filtro" type="text" placeholder="ex: Vodka" value="${_rcFiltro}"
        style="width:160px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"
        oninput="_rcSetFiltro(this.value)">
    </div>
    <div style="font-size:11px;color:var(--text3);margin-left:auto">
      Estimativa = taxa &times; ${_rcPax} convidados
    </div>
  </div>

  <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="background:var(--bg3);border-bottom:2px solid var(--border)">
          <th style="padding:10px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px;min-width:170px">Insumo</th>
          <th style="padding:10px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Mínimo<br><span style="font-size:10px;font-weight:400;text-transform:none">garrafas</span></th>
          <th style="padding:10px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Média<br><span style="font-size:10px;font-weight:400;text-transform:none">garrafas</span></th>
          <th style="padding:10px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Máximo<br><span style="font-size:10px;font-weight:400;text-transform:none">garrafas</span></th>
          <th style="padding:10px 12px;text-align:right;color:#4F8EF7;font-weight:600;text-transform:uppercase;letter-spacing:.5px;background:rgba(79,142,247,.06)">Estimativa<br><span style="font-size:10px;font-weight:400;text-transform:none">${_rcPax} conv.</span></th>
          <th style="padding:10px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Eventos</th>
        </tr>
      </thead>
      <tbody id="rc-tbody">
        ${_rcBuildRows(bevList)}
      </tbody>
    </table>
  </div>

  <div style="margin-top:16px;padding:12px 16px;background:var(--bg3);border-radius:8px;border-left:3px solid #4F8EF7;font-size:11px;color:var(--text3);line-height:1.7">
    <strong style="color:var(--text2)">Mínimo</strong> = menor consumo/convidado já registrado (piso de compra).
    <strong style="color:var(--text2)">Média</strong> = ponto médio entre mín e máx.
    <strong style="color:var(--text2)">Estimativa</strong> = média &times; número de convidados.
    Itens sem histórico para o tipo selecionado mostram a taxa global como referência.
  </div>
</div>

<style>
.rc-tab{padding:6px 14px;border:1px solid var(--border);border-radius:20px;background:var(--bg3);color:var(--text2);font-size:12px;font-weight:500;cursor:pointer;transition:.15s}
.rc-tab:hover{border-color:#4F8EF7;color:#4F8EF7}
.rc-tab.active{background:#4F8EF7;border-color:#4F8EF7;color:#fff}
#rc-tbody tr{border-bottom:1px solid var(--border)}
#rc-tbody tr:hover td{background:var(--bg3)}
</style>`;
}

function _rcBuildRows(bevList) {
  const grupo = _rcGrupo;
  const pax   = Math.max(1, _rcPax);
  const filtro = _rcFiltro.toLowerCase().trim();
  const data  = _rcGetData();
  const grupData = data[grupo] || {};

  return (bevList || _rcGetBebidas(data))
    .filter(b => !filtro || b.toLowerCase().includes(filtro))
    .map(b => {
      const d = grupData[b];
      if (!d) return '';

      const hasData    = d.count > 0;
      const isFallback = !hasData && d.mediaGeral !== null && d.mediaGeral !== undefined;
      if (!hasData && !isFallback) return '';

      const fmt = v => v == null ? '—' : (v * pax).toFixed(1);
      const rate = v => v == null ? '' : `<br><span style="font-size:10px;color:var(--text3)">${v.toFixed(4)}/pax</span>`;

      if (isFallback) {
        const est = (d.mediaGeral * pax).toFixed(1);
        return `<tr style="opacity:.6">
          <td style="padding:8px 12px;color:var(--text2)">${b} <span style="font-size:10px;font-style:italic;color:var(--text3)">sem histórico aqui</span></td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
          <td style="padding:8px 12px;text-align:right;font-weight:600;color:#4F8EF7;background:rgba(79,142,247,.04)">${est}${rate(d.mediaGeral)}</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
        </tr>`;
      }

      const onlyOne = d.count === 1;
      const badge = onlyOne ? ' <span style="font-size:9px;color:#F5A623;background:rgba(245,166,35,.12);padding:1px 5px;border-radius:4px;border:1px solid rgba(245,166,35,.3)">1 reg.</span>' : '';
      const est = d.avg != null ? (d.avg * pax).toFixed(1) : '—';

      return `<tr>
        <td style="padding:8px 12px;color:var(--text);font-weight:500">${b}${badge}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${fmt(d.min)}${rate(d.min)}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${fmt(d.avg)}${rate(d.avg)}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${fmt(d.max)}${rate(d.max)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:700;color:#4F8EF7;font-size:13px;background:rgba(79,142,247,.04)">${est}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text3)">${d.count}</td>
      </tr>`;
    })
    .join('');
}

// ── VIEW: IMPORTAR ────────────────────────────────────────────────────────────
function _rcBuildImport() {
  const meta = _rcGetMeta();
  const info = meta
    ? `<div style="padding:10px 14px;background:rgba(61,220,132,.08);border:1px solid rgba(61,220,132,.25);border-radius:8px;font-size:12px;color:var(--green);margin-bottom:16px">
        Base importada em ${meta.data} — ${meta.nEventos} eventos, ${meta.nGrupos} tipos, ${meta.nBebidas} insumos
        <button onclick="_rcLimparImport()" style="margin-left:12px;background:none;border:none;color:var(--red);cursor:pointer;font-size:11px;text-decoration:underline">Remover e usar base padrão</button>
       </div>`
    : '';

  return `
<div style="padding:20px 24px;max-width:860px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <button class="btn" onclick="_rcSetView('tabela')" style="font-size:12px">← Voltar para tabela</button>
    <div>
      <div style="font-size:18px;font-weight:600;color:var(--text)">Importar Base de Eventos</div>
      <div style="font-size:12px;color:var(--text3)">Cole os dados exportados em formato Tab-separado (TSV)</div>
    </div>
  </div>

  ${info}

  <div style="margin-bottom:12px;font-size:12px;color:var(--text3);line-height:1.6">
    <strong style="color:var(--text2)">Como exportar:</strong> abra sua planilha de eventos, selecione tudo (Ctrl+A), copie (Ctrl+C) e cole abaixo.<br>
    A primeira linha deve ser o cabeçalho com as colunas: <code style="background:var(--bg3);padding:1px 5px;border-radius:3px">GRUPO</code>, <code style="background:var(--bg3);padding:1px 5px;border-radius:3px">Convidados</code> e as colunas de bebidas/insumos.
  </div>

  <textarea id="rc-tsv-input" placeholder="Cole aqui o conteúdo da planilha (Tab-separado)..."
    style="width:100%;height:220px;padding:12px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px;font-family:var(--mono);resize:vertical;box-sizing:border-box;line-height:1.5"></textarea>

  <div style="display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
    <button class="btn" style="background:#4F8EF7;border-color:#4F8EF7;color:#fff;font-size:13px;padding:9px 20px" onclick="_rcProcessarImport()">
      Processar e salvar
    </button>
    <button class="btn" onclick="document.getElementById('rc-tsv-input').value=''">Limpar</button>
    <div id="rc-import-status" style="font-size:12px;color:var(--text3)"></div>
  </div>

  <div style="margin-top:20px;padding:14px 16px;background:var(--bg3);border-radius:8px;font-size:11px;color:var(--text3);line-height:1.8">
    <strong style="color:var(--text2)">Colunas obrigatórias detectadas automaticamente:</strong><br>
    • <strong>GRUPO</strong> — tipo do evento (CASAMENTO, ANIVERSÁRIO, etc.)<br>
    • <strong>Convidados</strong> — número de convidados do evento<br>
    • Todas as demais colunas numéricas são tratadas como insumos/bebidas<br>
    <strong style="color:var(--text2)">Regras de cálculo:</strong><br>
    • Ignora linhas com Convidados = 0 ou vazio<br>
    • Ignora células não numéricas<br>
    • Mínimo/Máximo = extremos reais onde consumo > 0<br>
    • Média = (Mínimo + Máximo) / 2<br>
    • Estimativa = Média × convidados informados na tabela
  </div>
</div>`;
}

// ── PARSER / CÁLCULO ──────────────────────────────────────────────────────────
function _rcProcessarImport() {
  const raw = (document.getElementById('rc-tsv-input')?.value || '').trim();
  if (!raw) { _rcStatus('Cole os dados antes de processar.', 'error'); return; }

  _rcStatus('Processando...', 'info');

  try {
    const result = _rcParseTSV(raw);
    localStorage.setItem('refConsumoImportado', JSON.stringify(result.data));
    localStorage.setItem('refConsumoMeta', JSON.stringify({
      data: new Date().toLocaleDateString('pt-BR'),
      nEventos: result.nEventos,
      nGrupos:  result.nGrupos,
      nBebidas: result.nBebidas,
    }));
    _rcSetView('tabela');
  } catch(e) {
    _rcStatus('Erro ao processar: ' + e.message, 'error');
  }
}

function _rcParseTSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('Dados insuficientes — precisa de cabeçalho + pelo menos 1 linha.');

  const header = lines[0].split('\t').map(h => h.trim());

  // Detectar colunas-chave
  const iGrupo = header.findIndex(h => h.toUpperCase() === 'GRUPO');
  const iConv  = header.findIndex(h => h.toUpperCase().includes('CONVIDADO'));
  if (iGrupo < 0) throw new Error('Coluna "GRUPO" não encontrada no cabeçalho.');
  if (iConv  < 0) throw new Error('Coluna "Convidados" não encontrada no cabeçalho.');

  // Colunas de insumos: todas as demais exceto as de identificação
  const skipCols = new Set([iGrupo, iConv]);
  const SKIP_NAMES = ['código','cliente','sub grupo','data','horas','base','responsável','local','nome'];
  const insCols = header.reduce((acc, h, i) => {
    if (skipCols.has(i)) return acc;
    const hl = h.toLowerCase();
    if (SKIP_NAMES.some(s => hl.includes(s))) return acc;
    acc.push(i);
    return acc;
  }, []);

  if (insCols.length === 0) throw new Error('Nenhuma coluna de insumo encontrada.');

  // Estrutura: rates[grupo][insumo] = [rate, ...]
  const rates    = {};
  const ratesAll = {}; // global
  const grupos   = new Set();
  let nEventos   = 0;

  insCols.forEach(i => { ratesAll[i] = []; });

  for (let li = 1; li < lines.length; li++) {
    const cols = lines[li].split('\t');
    const grupo = (cols[iGrupo] || '').trim().toUpperCase();
    if (!grupo) continue;
    const paxRaw = (cols[iConv] || '').trim().replace(',', '.');
    const pax = parseFloat(paxRaw);
    if (!pax || pax <= 0) continue;

    nEventos++;
    grupos.add(grupo);
    if (!rates[grupo]) rates[grupo] = {};

    insCols.forEach(i => {
      const raw = (cols[i] || '').trim().replace(',', '.');
      const qty = parseFloat(raw);
      if (!qty || qty <= 0) return;
      const rate = qty / pax;
      if (!rates[grupo][i]) rates[grupo][i] = [];
      rates[grupo][i].push(rate);
      ratesAll[i].push(rate);
    });
  }

  if (nEventos === 0) throw new Error('Nenhum evento válido encontrado (verifique a coluna Convidados).');

  // Stats globais por insumo (fallback)
  const globalStats = {};
  insCols.forEach(i => {
    const list = ratesAll[i];
    if (!list.length) { globalStats[i] = null; return; }
    const mn = Math.min(...list);
    const mx = Math.max(...list);
    globalStats[i] = { min: mn, max: mx, avg: (mn + mx) / 2 };
  });

  // Montar objeto final
  const out = {};
  const allGrupos = [...grupos];

  allGrupos.forEach(g => {
    out[g] = {};
    insCols.forEach(i => {
      const bev  = header[i];
      const list = rates[g]?.[i] || [];
      if (list.length) {
        const mn = Math.min(...list);
        const mx = Math.max(...list);
        out[g][bev] = { min: _r(mn), max: _r(mx), avg: _r((mn+mx)/2), mediaGeral: null, count: list.length };
      } else {
        const gs = globalStats[i];
        out[g][bev] = gs
          ? { min: null, max: null, avg: null, mediaGeral: _r(gs.avg), count: 0 }
          : { min: null, max: null, avg: null, mediaGeral: null, count: 0 };
      }
    });
  });

  const nBebidas = insCols.filter(i => ratesAll[i].length > 0).length;
  return { data: out, nEventos, nGrupos: allGrupos.length, nBebidas };
}

function _r(v) { return Math.round(v * 10000) / 10000; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function _rcGetBebidas(data) {
  const grupo = _rcGrupo;
  const d = data[grupo] || {};
  return Object.keys(d).filter(b => {
    const v = d[b];
    return v && (v.count > 0 || (v.mediaGeral !== null && v.mediaGeral !== undefined));
  });
}

function _rcContEventos() {
  const data = _rcGetData();
  let total = 0;
  Object.values(data).forEach(g => {
    const vodka = g['Vodka'];
    if (vodka) total += (vodka.count || 0);
  });
  return total;
}

function _rcGrupoLabel(g) {
  const icons = {CASAMENTO:'💍',ANIVERSÁRIO:'🎂',CORPORATIVO:'🏢',CONFRATERNIZAÇÃO:'🥂',FORMATURA:'🎓',NOIVADO:'💐',ALMOÇO:'🍽️'};
  return (icons[g] || '') + ' ' + g.charAt(0) + g.slice(1).toLowerCase();
}

function _rcStatus(msg, tipo) {
  const el = document.getElementById('rc-import-status');
  if (!el) return;
  const cor = tipo === 'error' ? 'var(--red)' : tipo === 'ok' ? 'var(--green)' : 'var(--text3)';
  el.style.color = cor;
  el.textContent = msg;
}

function _rcLimparImport() {
  if (!confirm('Remover base importada e voltar para os dados padrão?')) return;
  localStorage.removeItem('refConsumoImportado');
  localStorage.removeItem('refConsumoMeta');
  rRefConsumo();
}

function _rcSetView(v)  { _rcView = v; rRefConsumo(); }
function _rcSetGrupo(g) { _rcGrupo = g; rRefConsumo(); }

function _rcSetPax(v) {
  _rcPax = parseFloat(v) || 100;
  const tbody = document.getElementById('rc-tbody');
  if (tbody) tbody.innerHTML = _rcBuildRows();
  const th = document.querySelector('#rc-tbody')?.closest('table')?.querySelector('th:nth-child(5) span');
  if (th) th.textContent = _rcPax + ' conv.';
}

function _rcSetFiltro(v) {
  _rcFiltro = v;
  const tbody = document.getElementById('rc-tbody');
  if (tbody) tbody.innerHTML = _rcBuildRows();
}
