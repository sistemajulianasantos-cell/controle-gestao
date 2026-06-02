// ─── REFERÊNCIA DE CONSUMO ────────────────────────────────────────────────────

const RC_GRUPOS_LIST = ['CASAMENTO','ANIVERSÁRIO','CORPORATIVO','CONFRATERNIZAÇÃO','FORMATURA','NOIVADO','ALMOÇO'];

// ── Estado ────────────────────────────────────────────────────────────────────
var _rcView    = 'tabela';   // 'tabela' | 'eventos' | 'novo' | 'importar'
var _rcGrupo   = 'CASAMENTO';
var _rcPax     = 100;
var _rcFiltro  = '';
var _rcNovoBev = '';         // filtro de insumo no form novo evento
var _rcNovoForm = {};        // form state

// ── Storage ───────────────────────────────────────────────────────────────────
function _rcGetEventos() {
  try { return JSON.parse(localStorage.getItem('rcEventos') || '[]'); } catch(e) { return []; }
}
function _rcSaveEventos(list) {
  localStorage.setItem('rcEventos', JSON.stringify(list));
}
function _rcGetImportedStats() {
  try {
    const s = localStorage.getItem('refConsumoImportado');
    if (s) return JSON.parse(s);
  } catch(e) {}
  return (typeof REF_CONSUMO !== 'undefined') ? REF_CONSUMO : {};
}
function _rcGetMeta() {
  try { return JSON.parse(localStorage.getItem('refConsumoMeta') || 'null'); } catch(e) { return null; }
}

// ── Cálculo: mescla stats importadas + eventos novos ─────────────────────────
function _rcGetStats() {
  const base  = _rcGetImportedStats();
  const evts  = _rcGetEventos();
  if (!evts.length) return base;

  const stats = JSON.parse(JSON.stringify(base)); // deep clone

  evts.forEach(evt => {
    const g   = (evt.grupo || '').toUpperCase();
    const pax = parseFloat(evt.convidados) || 0;
    if (!g || pax <= 0) return;
    if (!stats[g]) stats[g] = {};

    Object.entries(evt.consumo || {}).forEach(([bev, qty]) => {
      qty = parseFloat(qty) || 0;
      if (qty <= 0) return;
      const rate = qty / pax;
      const d    = stats[g][bev];
      if (!d || d.count === 0) {
        stats[g][bev] = { min:_r(rate), max:_r(rate), avg:_r(rate), mediaGeral:null, count:1 };
      } else {
        const mn = d.min !== null ? Math.min(d.min, rate) : rate;
        const mx = d.max !== null ? Math.max(d.max, rate) : rate;
        stats[g][bev] = { min:_r(mn), max:_r(mx), avg:_r((mn+mx)/2), mediaGeral:null, count:(d.count||0)+1 };
      }
    });
  });
  return stats;
}

function _rcGetAllBebidas() {
  const data = _rcGetStats();
  const s = new Set();
  Object.values(data).forEach(g => Object.keys(g).forEach(b => s.add(b)));
  return [...s].sort((a,b) => a.localeCompare(b, 'pt-BR'));
}

function _r(v) { return Math.round(v * 10000) / 10000; }

// ── Render principal ──────────────────────────────────────────────────────────
function rRefConsumo() {
  const el = document.getElementById('refconsumo-content');
  if (!el) return;
  if      (_rcView === 'tabela')   el.innerHTML = _rcBuildTabela();
  else if (_rcView === 'eventos')  el.innerHTML = _rcBuildEventos();
  else if (_rcView === 'novo')     el.innerHTML = _rcBuildNovo();
  else if (_rcView === 'importar') el.innerHTML = _rcBuildImport();
}

// ── VIEW: TABELA ──────────────────────────────────────────────────────────────
function _rcBuildTabela() {
  const meta      = _rcGetMeta();
  const evtNovos  = _rcGetEventos().length;
  const stats     = _rcGetStats();
  const totalEvts = _rcCountEventos(stats);

  const grupoTabs = RC_GRUPOS_LIST.map(g =>
    `<button class="rc-tab${g===_rcGrupo?' active':''}" onclick="_rcSetGrupo('${g}')">${_rcGrupoLabel(g)}</button>`
  ).join('');

  const bevList = _rcBebidaDoGrupo(stats, _rcGrupo);

  return `
<div style="padding:20px 24px;max-width:1100px">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;gap:12px;flex-wrap:wrap">
    <div>
      <div style="font-size:18px;font-weight:600;color:var(--text);margin-bottom:4px">Referência de Consumo</div>
      <div style="font-size:12px;color:var(--text3)">
        ${totalEvts} eventos na base
        ${evtNovos ? `· <span style="color:var(--green)">${evtNovos} lançado${evtNovos>1?'s':''} manualmente</span>` : ''}
        ${meta ? `· base importada em ${meta.data}` : ''}
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" style="background:#3DDC84;border-color:#3DDC84;color:#000;font-weight:600" onclick="_rcSetView('novo')">+ Lançar evento</button>
      <button class="btn" onclick="_rcSetView('eventos')">Histórico</button>
      <button class="btn" onclick="_rcSetView('importar')">Importar base</button>
    </div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px">${grupoTabs}</div>

  <div style="display:flex;align-items:center;gap:16px;margin-bottom:18px;flex-wrap:wrap">
    <div style="display:flex;align-items:center;gap:8px">
      <label style="font-size:12px;color:var(--text3)">Convidados:</label>
      <input id="rc-pax" type="number" min="1" value="${_rcPax}"
        style="width:80px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"
        oninput="_rcSetPax(this.value)">
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <label style="font-size:12px;color:var(--text3)">Filtrar:</label>
      <input id="rc-filtro" type="text" placeholder="ex: Vodka" value="${_rcFiltro}"
        style="width:160px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"
        oninput="_rcSetFiltro(this.value)">
    </div>
    <span style="font-size:11px;color:var(--text3);margin-left:auto">Estimativa = média × ${_rcPax} conv.</span>
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
      <tbody id="rc-tbody">${_rcBuildRows(bevList, stats)}</tbody>
    </table>
  </div>
  <div style="margin-top:16px;padding:12px 16px;background:var(--bg3);border-radius:8px;border-left:3px solid #4F8EF7;font-size:11px;color:var(--text3);line-height:1.7">
    <strong style="color:var(--text2)">Mínimo</strong> = piso histórico (nunca levar menos).
    <strong style="color:var(--text2)">Estimativa</strong> = média × convidados — use como referência de compra.
    Itens sem histórico para o tipo selecionado mostram taxa global.
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

function _rcBuildRows(bevList, stats) {
  const pax    = Math.max(1, _rcPax);
  const filtro = _rcFiltro.toLowerCase().trim();
  const grupData = (stats || _rcGetStats())[_rcGrupo] || {};

  return (bevList || [])
    .filter(b => !filtro || b.toLowerCase().includes(filtro))
    .map(b => {
      const d = grupData[b];
      if (!d) return '';
      const hasData    = d.count > 0;
      const isFallback = !hasData && d.mediaGeral != null;
      if (!hasData && !isFallback) return '';

      const fmt  = v => v == null ? '—' : (v * pax).toFixed(1);
      const rate = v => v == null ? '' : `<br><span style="font-size:10px;color:var(--text3)">${v.toFixed(4)}/pax</span>`;

      if (isFallback) {
        return `<tr style="opacity:.6">
          <td style="padding:8px 12px;color:var(--text2)">${b} <em style="font-size:10px;color:var(--text3)">sem histórico aqui</em></td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
          <td style="padding:8px 12px;text-align:right;font-weight:600;color:#4F8EF7;background:rgba(79,142,247,.04)">${fmt(d.mediaGeral)}${rate(d.mediaGeral)}</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
        </tr>`;
      }
      const badge = d.count===1 ? ' <span style="font-size:9px;color:#F5A623;background:rgba(245,166,35,.12);padding:1px 5px;border-radius:4px;border:1px solid rgba(245,166,35,.3)">1 reg.</span>' : '';
      return `<tr>
        <td style="padding:8px 12px;color:var(--text);font-weight:500">${b}${badge}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${fmt(d.min)}${rate(d.min)}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${fmt(d.avg)}${rate(d.avg)}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${fmt(d.max)}${rate(d.max)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:700;color:#4F8EF7;font-size:13px;background:rgba(79,142,247,.04)">${d.avg!=null?(d.avg*pax).toFixed(1):'—'}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text3)">${d.count}</td>
      </tr>`;
    }).join('');
}

// ── VIEW: HISTÓRICO DE EVENTOS ────────────────────────────────────────────────
function _rcBuildEventos() {
  const evts = _rcGetEventos();

  const rows = evts.length === 0
    ? `<tr><td colspan="6" style="padding:32px;text-align:center;color:var(--text3)">Nenhum evento lançado ainda.</td></tr>`
    : [...evts].reverse().map((e,ri) => {
        const i = evts.length - 1 - ri;
        const nitens = Object.values(e.consumo||{}).filter(v=>v>0).length;
        return `<tr>
          <td style="padding:9px 12px;color:var(--text2);font-family:var(--mono);font-size:11px">${e.data||'—'}</td>
          <td style="padding:9px 12px;color:var(--text);font-weight:500">${e.cliente||'—'}</td>
          <td style="padding:9px 12px"><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);color:var(--text2)">${e.grupo||'—'}</span></td>
          <td style="padding:9px 12px;text-align:right;color:var(--text);font-family:var(--mono)">${e.convidados||0}</td>
          <td style="padding:9px 12px;text-align:right;color:var(--text3);font-size:11px">${nitens} insumo${nitens!==1?'s':''}</td>
          <td style="padding:9px 12px;text-align:right">
            <button onclick="_rcVerEvento(${i})" style="background:none;border:none;color:#4F8EF7;cursor:pointer;font-size:11px;text-decoration:underline;margin-right:8px">ver</button>
            <button onclick="_rcDeleteEvento(${i})" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:11px">excluir</button>
          </td>
        </tr>`;
      }).join('');

  return `
<div style="padding:20px 24px;max-width:1000px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
    <button class="btn" onclick="_rcSetView('tabela')">← Tabela</button>
    <div style="font-size:18px;font-weight:600;color:var(--text)">Eventos Lançados</div>
    <button class="btn" style="margin-left:auto;background:#3DDC84;border-color:#3DDC84;color:#000;font-weight:600" onclick="_rcSetView('novo')">+ Lançar evento</button>
  </div>

  <div id="rc-evt-detalhe"></div>

  <table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead>
      <tr style="background:var(--bg3);border-bottom:2px solid var(--border)">
        <th style="padding:9px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Data</th>
        <th style="padding:9px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Cliente</th>
        <th style="padding:9px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Tipo</th>
        <th style="padding:9px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Convidados</th>
        <th style="padding:9px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Itens</th>
        <th style="padding:9px 12px"></th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  ${evts.length ? `<div style="margin-top:12px;text-align:right"><button class="btn" style="color:var(--red);border-color:var(--red)" onclick="_rcLimparEventos()">Apagar todos os eventos</button></div>` : ''}
</div>`;
}

function _rcVerEvento(i) {
  const evts = _rcGetEventos();
  const e = evts[i];
  if (!e) return;
  const itens = Object.entries(e.consumo||{}).filter(([,v])=>v>0)
    .sort((a,b)=>a[0].localeCompare(b[0],'pt-BR'))
    .map(([k,v])=>`<span style="display:inline-block;margin:3px;padding:3px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:12px;font-size:11px"><strong>${k}</strong>: ${v}</span>`)
    .join('');
  const el = document.getElementById('rc-evt-detalhe');
  if (el) el.innerHTML = `
    <div style="margin-bottom:16px;padding:14px 16px;background:var(--bg3);border-radius:8px;border-left:3px solid #4F8EF7">
      <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px">${e.cliente||'Sem nome'} — ${e.grupo} — ${e.convidados} convidados — ${e.data}</div>
      <div>${itens || '<span style="color:var(--text3);font-size:11px">Sem consumo registrado</span>'}</div>
    </div>`;
}

function _rcDeleteEvento(i) {
  if (!confirm('Excluir este evento da base de cálculo?')) return;
  const evts = _rcGetEventos();
  evts.splice(i, 1);
  _rcSaveEventos(evts);
  rRefConsumo();
}

function _rcLimparEventos() {
  if (!confirm('Apagar TODOS os eventos lançados manualmente? A base importada não será afetada.')) return;
  _rcSaveEventos([]);
  rRefConsumo();
}

// ── VIEW: NOVO EVENTO ─────────────────────────────────────────────────────────
function _rcBuildNovo() {
  const f     = _rcNovoForm;
  const hoje  = new Date().toISOString().slice(0,10);
  const todas = _rcGetAllBebidas();
  const filtro = (_rcNovoBev||'').toLowerCase().trim();
  const lista  = filtro ? todas.filter(b => b.toLowerCase().includes(filtro)) : todas;

  const grupoOpts = RC_GRUPOS_LIST.map(g =>
    `<option value="${g}"${(f.grupo||'CASAMENTO')===g?' selected':''}>${g}</option>`
  ).join('');

  const bevInputs = lista.map(b => {
    const val = (f.consumo&&f.consumo[b]) ? f.consumo[b] : '';
    const temValor = val && parseFloat(val) > 0;
    return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">
      <span style="flex:1;font-size:12px;color:${temValor?'var(--text)':'var(--text2)'}">${b}</span>
      <input type="number" min="0" step="0.5" placeholder="0"
        value="${val}"
        style="width:80px;padding:5px 8px;background:var(--bg3);border:1px solid ${temValor?'#4F8EF7':'var(--border)'};border-radius:6px;color:var(--text);font-size:13px;text-align:right"
        oninput="_rcNovoSetBev('${b.replace(/'/g,"\\'")}', this.value)">
      <span style="font-size:10px;color:var(--text3);width:36px">garr.</span>
    </div>`;
  }).join('');

  const nPreenchidos = Object.values(f.consumo||{}).filter(v=>parseFloat(v)>0).length;

  return `
<div style="padding:20px 24px;max-width:720px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <button class="btn" onclick="_rcSetView('tabela')">← Cancelar</button>
    <div style="font-size:18px;font-weight:600;color:var(--text)">Lançar Evento</div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
    <div>
      <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Data do evento</label>
      <input type="date" id="rc-n-data" value="${f.data||hoje}"
        style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
        oninput="_rcNovoForm.data=this.value">
    </div>
    <div>
      <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Cliente</label>
      <input type="text" id="rc-n-cliente" placeholder="Nome do cliente (opcional)" value="${f.cliente||''}"
        style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
        oninput="_rcNovoForm.cliente=this.value">
    </div>
    <div>
      <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Tipo de evento</label>
      <select id="rc-n-grupo"
        style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
        onchange="_rcNovoForm.grupo=this.value">
        ${grupoOpts}
      </select>
    </div>
    <div>
      <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Convidados</label>
      <input type="number" id="rc-n-conv" min="1" placeholder="ex: 150" value="${f.convidados||''}"
        style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
        oninput="_rcNovoForm.convidados=this.value">
    </div>
  </div>

  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;flex-wrap:wrap">
    <div style="font-size:13px;font-weight:600;color:var(--text)">Consumo por insumo <span style="font-size:11px;color:var(--text3);font-weight:400">(deixe 0 se não foi usado)</span></div>
    <div style="display:flex;align-items:center;gap:8px">
      ${nPreenchidos ? `<span style="font-size:11px;color:#3DDC84;font-weight:600">${nPreenchidos} preenchido${nPreenchidos>1?'s':''}</span>` : ''}
      <input type="text" placeholder="Filtrar insumo..." value="${_rcNovoBev}"
        style="width:150px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"
        oninput="_rcFiltrarNovoBev(this.value)">
    </div>
  </div>

  <div style="max-height:380px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px 14px;background:var(--bg2)">
    ${bevInputs || '<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px">Nenhum insumo encontrado</div>'}
  </div>

  <div style="margin-top:18px;display:flex;gap:10px;align-items:center">
    <button class="btn" style="background:#3DDC84;border-color:#3DDC84;color:#000;font-weight:600;font-size:13px;padding:10px 24px" onclick="_rcSalvarEvento()">Salvar evento</button>
    <button class="btn" onclick="_rcSetView('tabela')">Cancelar</button>
    <span id="rc-novo-status" style="font-size:12px;color:var(--text3)"></span>
  </div>
</div>`;
}

function _rcNovoSetBev(bev, val) {
  if (!_rcNovoForm.consumo) _rcNovoForm.consumo = {};
  _rcNovoForm.consumo[bev] = parseFloat(val) || 0;
  // Atualizar contador sem re-render completo
  const n = Object.values(_rcNovoForm.consumo).filter(v=>v>0).length;
  const badge = document.querySelector('#refconsumo-content [style*="preenchido"]');
  // Re-render só o badge (leve)
  rRefConsumo();
}

function _rcFiltrarNovoBev(v) {
  _rcNovoBev = v;
  rRefConsumo();
}

function _rcSalvarEvento() {
  const f = _rcNovoForm;
  if (!f.grupo)      { _rcNovoStatus('Selecione o tipo de evento.', true); return; }
  if (!f.convidados || parseFloat(f.convidados) <= 0) { _rcNovoStatus('Informe o número de convidados.', true); return; }

  const consumo = {};
  Object.entries(f.consumo||{}).forEach(([k,v]) => { if (parseFloat(v)>0) consumo[k] = parseFloat(v); });
  if (!Object.keys(consumo).length) { _rcNovoStatus('Informe ao menos um insumo consumido.', true); return; }

  const evts = _rcGetEventos();
  evts.push({
    id:         'rc-' + Date.now(),
    data:       f.data || new Date().toISOString().slice(0,10),
    cliente:    f.cliente || '',
    grupo:      (f.grupo||'').toUpperCase(),
    convidados: parseFloat(f.convidados),
    consumo,
  });
  _rcSaveEventos(evts);
  _rcNovoForm = { data:'', cliente:'', grupo:'CASAMENTO', convidados:'', consumo:{} };
  _rcNovoBev  = '';
  _rcSetView('tabela');
}

function _rcNovoStatus(msg, err) {
  const el = document.getElementById('rc-novo-status');
  if (el) { el.textContent = msg; el.style.color = err ? 'var(--red)' : 'var(--green)'; }
}

// ── VIEW: IMPORTAR ────────────────────────────────────────────────────────────
function _rcBuildImport() {
  const meta = _rcGetMeta();
  const info = meta
    ? `<div style="padding:10px 14px;background:rgba(61,220,132,.08);border:1px solid rgba(61,220,132,.25);border-radius:8px;font-size:12px;color:var(--green);margin-bottom:16px">
        Base importada em ${meta.data} — ${meta.nEventos} eventos, ${meta.nGrupos} tipos, ${meta.nBebidas} insumos
        <button onclick="_rcLimparImport()" style="margin-left:12px;background:none;border:none;color:var(--red);cursor:pointer;font-size:11px;text-decoration:underline">Remover</button>
       </div>`
    : '';

  return `
<div style="padding:20px 24px;max-width:860px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <button class="btn" onclick="_rcSetView('tabela')">← Voltar</button>
    <div>
      <div style="font-size:18px;font-weight:600;color:var(--text)">Importar Base de Eventos</div>
      <div style="font-size:12px;color:var(--text3)">Cole planilha Tab-separada (TSV) — primeira linha deve ser o cabeçalho</div>
    </div>
  </div>
  ${info}
  <textarea id="rc-tsv-input" placeholder="Cole aqui o conteúdo da planilha..."
    style="width:100%;height:220px;padding:12px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px;font-family:var(--mono);resize:vertical;box-sizing:border-box"></textarea>
  <div style="display:flex;gap:10px;margin-top:12px;align-items:center;flex-wrap:wrap">
    <button class="btn" style="background:#4F8EF7;border-color:#4F8EF7;color:#fff;font-size:13px;padding:9px 20px" onclick="_rcProcessarImport()">Processar e salvar</button>
    <button class="btn" onclick="document.getElementById('rc-tsv-input').value=''">Limpar</button>
    <span id="rc-import-status" style="font-size:12px;color:var(--text3)"></span>
  </div>
  <div style="margin-top:20px;padding:14px 16px;background:var(--bg3);border-radius:8px;font-size:11px;color:var(--text3);line-height:1.8">
    <strong style="color:var(--text2)">Colunas obrigatórias:</strong> GRUPO · Convidados<br>
    Todas as demais colunas numéricas são tratadas como insumos. Eventos lançados manualmente são preservados e somam à base importada.
  </div>
</div>`;
}

function _rcProcessarImport() {
  const raw = (document.getElementById('rc-tsv-input')?.value || '').trim();
  if (!raw) { _rcImpStatus('Cole os dados antes de processar.', true); return; }
  _rcImpStatus('Processando...', false);
  try {
    const r = _rcParseTSV(raw);
    localStorage.setItem('refConsumoImportado', JSON.stringify(r.data));
    localStorage.setItem('refConsumoMeta', JSON.stringify({ data: new Date().toLocaleDateString('pt-BR'), nEventos: r.nEventos, nGrupos: r.nGrupos, nBebidas: r.nBebidas }));
    _rcSetView('tabela');
  } catch(e) { _rcImpStatus('Erro: ' + e.message, true); }
}

function _rcParseTSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('Dados insuficientes.');
  const header = lines[0].split('\t').map(h => h.trim());
  const iGrupo = header.findIndex(h => h.toUpperCase() === 'GRUPO');
  const iConv  = header.findIndex(h => h.toUpperCase().includes('CONVIDADO'));
  if (iGrupo < 0) throw new Error('Coluna "GRUPO" não encontrada.');
  if (iConv  < 0) throw new Error('Coluna "Convidados" não encontrada.');
  const SKIP = ['código','cliente','sub grupo','data','horas','base','responsável','local','nome'];
  const insCols = header.reduce((a, h, i) => {
    if (i === iGrupo || i === iConv) return a;
    if (SKIP.some(s => h.toLowerCase().includes(s))) return a;
    a.push(i); return a;
  }, []);
  if (!insCols.length) throw new Error('Nenhuma coluna de insumo encontrada.');

  const rates = {}, ratesAll = {}, grupos = new Set();
  insCols.forEach(i => { ratesAll[i] = []; });
  let nEventos = 0;

  for (let li = 1; li < lines.length; li++) {
    const cols = lines[li].split('\t');
    const g   = (cols[iGrupo]||'').trim().toUpperCase();
    const pax = parseFloat((cols[iConv]||'').replace(',','.'));
    if (!g || !pax || pax <= 0) continue;
    nEventos++; grupos.add(g);
    if (!rates[g]) rates[g] = {};
    insCols.forEach(i => {
      const qty = parseFloat((cols[i]||'').replace(',','.'));
      if (!qty || qty <= 0) return;
      const r = qty / pax;
      if (!rates[g][i]) rates[g][i] = [];
      rates[g][i].push(r);
      ratesAll[i].push(r);
    });
  }
  if (!nEventos) throw new Error('Nenhum evento válido (verifique a coluna Convidados).');

  const globalStats = {};
  insCols.forEach(i => {
    if (!ratesAll[i].length) { globalStats[i] = null; return; }
    const mn = Math.min(...ratesAll[i]), mx = Math.max(...ratesAll[i]);
    globalStats[i] = { avg: (mn+mx)/2 };
  });

  const out = {};
  [...grupos].forEach(g => {
    out[g] = {};
    insCols.forEach(i => {
      const bev = header[i], list = rates[g]?.[i]||[];
      if (list.length) {
        const mn = Math.min(...list), mx = Math.max(...list);
        out[g][bev] = { min:_r(mn), max:_r(mx), avg:_r((mn+mx)/2), mediaGeral:null, count:list.length };
      } else {
        const gs = globalStats[i];
        out[g][bev] = gs ? { min:null, max:null, avg:null, mediaGeral:_r(gs.avg), count:0 } : { min:null, max:null, avg:null, mediaGeral:null, count:0 };
      }
    });
  });

  return { data:out, nEventos, nGrupos:[...grupos].length, nBebidas:insCols.filter(i=>ratesAll[i].length>0).length };
}

function _rcLimparImport() {
  if (!confirm('Remover base importada?')) return;
  localStorage.removeItem('refConsumoImportado');
  localStorage.removeItem('refConsumoMeta');
  rRefConsumo();
}

function _rcImpStatus(msg, err) {
  const el = document.getElementById('rc-import-status');
  if (el) { el.textContent = msg; el.style.color = err ? 'var(--red)' : 'var(--green)'; }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _rcBebidaDoGrupo(stats, grupo) {
  const d = stats[grupo] || {};
  return Object.keys(d).filter(b => { const v=d[b]; return v&&(v.count>0||(v.mediaGeral!=null)); });
}

function _rcCountEventos(stats) {
  let n = 0;
  Object.values(stats||{}).forEach(g => { const v = g['Vodka']||g[Object.keys(g)[0]]; if(v) n += (v.count||0); });
  return n;
}

function _rcGrupoLabel(g) {
  const m = {CASAMENTO:'💍',ANIVERSÁRIO:'🎂',CORPORATIVO:'🏢',CONFRATERNIZAÇÃO:'🥂',FORMATURA:'🎓',NOIVADO:'💐',ALMOÇO:'🍽️'};
  return (m[g]||'') + ' ' + g.charAt(0) + g.slice(1).toLowerCase();
}

function _rcSetView(v)  { _rcView = v; rRefConsumo(); }
function _rcSetGrupo(g) { _rcGrupo = g; rRefConsumo(); }
function _rcSetPax(v)   { _rcPax = parseFloat(v)||100; const tb=document.getElementById('rc-tbody'); if(tb) tb.innerHTML=_rcBuildRows(); }
function _rcSetFiltro(v){ _rcFiltro = v; const tb=document.getElementById('rc-tbody'); if(tb) tb.innerHTML=_rcBuildRows(); }
