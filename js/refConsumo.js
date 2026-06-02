// ─── REFERÊNCIA DE CONSUMO ────────────────────────────────────────────────────

const RC_GRUPOS_LIST = ['CASAMENTO','ANIVERSÁRIO','CORPORATIVO','CONFRATERNIZAÇÃO','FORMATURA','NOIVADO','ALMOÇO'];

// ── Estado ────────────────────────────────────────────────────────────────────
var _rcView      = 'tabela';
var _rcGrupo     = 'CASAMENTO';
var _rcPax       = 100;
var _rcFiltro    = '';
var _rcNovoBev   = '';
var _rcNovoForm  = {};
var _rcHistPage  = 0;        // paginação do histórico
var _rcHistGrupo = '';       // filtro de grupo no histórico
const RC_HIST_PER_PAGE = 50;

// ── Storage (Firebase via D) ──────────────────────────────────────────────────
function _rcGetEventos()           { return D.rcEventos || []; }
function _rcGetEventosImportados() { return D.rcEventosImportados || []; }
function _rcSaveEventos(l)         { D.rcEventos = l; sv('rcEventos'); }
function _rcSaveEventosImp(l)      { D.rcEventosImportados = l; sv('rcEventosImportados'); }

// Migração única: se houver dados no localStorage, move para Firebase
function _rcMigrarLocalStorage() {
  try {
    const lsEvt = localStorage.getItem('rcEventos');
    const lsImp = localStorage.getItem('rcEventosImportados');
    let migrou = false;
    if (lsEvt) {
      const evts = JSON.parse(lsEvt);
      if (evts.length && !D.rcEventos.length) { D.rcEventos = evts; sv('rcEventos'); migrou = true; }
      localStorage.removeItem('rcEventos');
    }
    if (lsImp) {
      const imps = JSON.parse(lsImp);
      if (imps.length && !D.rcEventosImportados.length) { D.rcEventosImportados = imps; sv('rcEventosImportados'); migrou = true; }
      localStorage.removeItem('rcEventosImportados');
    }
    if (migrou) rRefConsumo();
  } catch(e) {}
}

// ── Cálculo de stats a partir de todos os eventos ─────────────────────────────
function _rcGetStats() {
  const all = [..._rcGetEventosImportados(), ..._rcGetEventos()];
  if (!all.length) return (typeof REF_CONSUMO !== 'undefined') ? REF_CONSUMO : {};
  return _rcComputeStats(all);
}

function _rcComputeStats(evts) {
  const rates    = {};  // rates[grupo][bev] = [rate,...]
  const ratesAll = {};  // global, para fallback

  evts.forEach(evt => {
    const g   = (evt.grupo||'').trim().toUpperCase();
    const pax = parseFloat(evt.convidados) || 0;
    if (!g || pax <= 0) return;
    if (!rates[g]) rates[g] = {};
    Object.entries(evt.consumo||{}).forEach(([bev, qty]) => {
      qty = parseFloat(qty) || 0;
      if (qty <= 0) return;
      const r = qty / pax;
      if (!rates[g][bev]) rates[g][bev] = [];
      rates[g][bev].push(r);
      if (!ratesAll[bev]) ratesAll[bev] = [];
      ratesAll[bev].push(r);
    });
  });

  // Stats globais (fallback para grupos sem histórico naquele insumo)
  const globalAvg = {};
  Object.entries(ratesAll).forEach(([bev, list]) => {
    const mn = list.reduce((a,b)=>Math.min(a,b), Infinity);
    const mx = list.reduce((a,b)=>Math.max(a,b), -Infinity);
    globalAvg[bev] = _r((mn + mx) / 2);
  });

  const allBevs = Object.keys(ratesAll);
  const out = {};
  Object.keys(rates).forEach(g => {
    out[g] = {};
    allBevs.forEach(bev => {
      const list = rates[g][bev] || [];
      if (list.length) {
        const mn = list.reduce((a,b)=>Math.min(a,b), Infinity);
        const mx = list.reduce((a,b)=>Math.max(a,b), -Infinity);
        out[g][bev] = { min:_r(mn), max:_r(mx), avg:_r((mn+mx)/2), mediaGeral:null, count:list.length };
      } else {
        out[g][bev] = { min:null, max:null, avg:null, mediaGeral: globalAvg[bev]??null, count:0 };
      }
    });
  });
  return out;
}

function _r(v) { return Math.round(v * 10000) / 10000; }

function _rcGetAllBebidas() {
  const data = _rcGetStats();
  const s = new Set();
  Object.values(data).forEach(g => Object.keys(g).forEach(b => s.add(b)));
  return [...s].sort((a,b) => a.localeCompare(b,'pt-BR'));
}

// ── Render ────────────────────────────────────────────────────────────────────
function rRefConsumo() {
  const el = document.getElementById('refconsumo-content');
  if (!el) return;
  if      (_rcView==='tabela')   el.innerHTML = _rcBuildTabela();
  else if (_rcView==='eventos')  el.innerHTML = _rcBuildEventos();
  else if (_rcView==='novo')     el.innerHTML = _rcBuildNovo();
  else if (_rcView==='importar') el.innerHTML = _rcBuildImport();
}

// ── VIEW: TABELA ──────────────────────────────────────────────────────────────
function _rcBuildTabela() {
  const imp    = _rcGetEventosImportados();
  const manual = _rcGetEventos();
  const stats  = _rcGetStats();
  const total  = imp.length + manual.length;

  const grupoTabs = RC_GRUPOS_LIST.map(g =>
    `<button class="rc-tab${g===_rcGrupo?' active':''}" onclick="_rcSetGrupo('${g}')">${_rcGrupoLabel(g)}</button>`
  ).join('');

  const bevList = _rcBebidaDoGrupo(stats, _rcGrupo);

  return `
<div style="padding:20px 24px;max-width:1100px">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;gap:12px;flex-wrap:wrap">
    <div>
      <div style="font-size:18px;font-weight:600;color:var(--text)">Referência de Consumo</div>
      <div style="font-size:12px;color:var(--text3);margin-top:2px">
        ${total
          ? `<span style="color:var(--green)">${total} evento${total>1?'s':''} na base</span>${imp.length ? ` · ${imp.length} importados` : ''}${manual.length ? ` · ${manual.length} manuais` : ''}`
          : `<span style="color:#F5A623">Usando base padrão histórica</span> <span style="color:var(--text3)">· importe seus eventos para substituir</span>`
        }
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
          <th style="padding:10px 12px;text-align:right;color:#4F8EF7;font-weight:600;text-transform:uppercase;letter-spacing:.5px;background:rgba(79,142,247,.06)" id="rc-est-th">Estimativa<br><span style="font-size:10px;font-weight:400;text-transform:none">${_rcPax} conv.</span></th>
          <th style="padding:10px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Eventos</th>
        </tr>
      </thead>
      <tbody id="rc-tbody">${_rcBuildRows(bevList, stats)}</tbody>
    </table>
  </div>
  <div style="margin-top:16px;padding:12px 16px;background:var(--bg3);border-radius:8px;border-left:3px solid #4F8EF7;font-size:11px;color:var(--text3);line-height:1.7">
    <strong style="color:var(--text2)">Mínimo</strong> = piso histórico (nunca levar menos).
    <strong style="color:var(--text2)">Estimativa</strong> = média × convidados — referência de compra.
    Itens sem histórico para este tipo mostram a taxa global.
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
  const data   = stats || _rcGetStats();
  const gd     = data[_rcGrupo] || {};

  return (bevList || [])
    .filter(b => !filtro || b.toLowerCase().includes(filtro))
    .map(b => {
      const d = gd[b];
      if (!d) return '';
      const hasData    = d.count > 0;
      const isFallback = !hasData && d.mediaGeral != null;
      if (!hasData && !isFallback) return '';
      const ceil  = v => v == null ? '—' : Math.ceil(v * pax);
      const rate  = v => v == null ? '' : `<br><span style="font-size:10px;color:var(--text3)">${v.toFixed(4)}/pax</span>`;
      if (isFallback) {
        return `<tr style="opacity:.6">
          <td style="padding:8px 12px;color:var(--text2)">${b} <em style="font-size:10px;color:var(--text3)">sem histórico aqui</em></td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)" colspan="3">—</td>
          <td style="padding:8px 12px;text-align:right;font-weight:600;color:#4F8EF7;background:rgba(79,142,247,.04)">${ceil(d.mediaGeral)}${rate(d.mediaGeral)}</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
        </tr>`;
      }
      const badge = d.count===1 ? ' <span style="font-size:9px;color:#F5A623;background:rgba(245,166,35,.12);padding:1px 5px;border-radius:4px;border:1px solid rgba(245,166,35,.3)">1 reg.</span>' : '';
      return `<tr>
        <td style="padding:8px 12px;color:var(--text);font-weight:500">${b}${badge}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${ceil(d.min)}${rate(d.min)}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${ceil(d.avg)}${rate(d.avg)}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${ceil(d.max)}${rate(d.max)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:700;color:#4F8EF7;font-size:13px;background:rgba(79,142,247,.04)">${d.avg!=null?Math.ceil(d.avg*pax):'—'}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text3)">${d.count}</td>
      </tr>`;
    }).join('');
}

// ── VIEW: HISTÓRICO ───────────────────────────────────────────────────────────
function _rcBuildEventos() {
  const imp    = _rcGetEventosImportados().map(e => ({...e, _fonte:'importado'}));
  const manual = _rcGetEventos().map(e => ({...e, _fonte:'manual'}));
  // Mais recente primeiro — para imp, usamos índice reverso pois não tem timestamp confiável
  const todos  = [...manual.reverse(), ...imp.slice().reverse()];

  const grupoOpts = ['', ...RC_GRUPOS_LIST].map(g =>
    `<option value="${g}"${_rcHistGrupo===g?' selected':''}>${g||'Todos os tipos'}</option>`
  ).join('');

  const filtrados = _rcHistGrupo
    ? todos.filter(e => (e.grupo||'').toUpperCase() === _rcHistGrupo)
    : todos;

  const total  = filtrados.length;
  const inicio = _rcHistPage * RC_HIST_PER_PAGE;
  const pagina = filtrados.slice(inicio, inicio + RC_HIST_PER_PAGE);
  const nPags  = Math.ceil(total / RC_HIST_PER_PAGE);

  const rows = pagina.length === 0
    ? `<tr><td colspan="6" style="padding:32px;text-align:center;color:var(--text3)">Nenhum evento encontrado.</td></tr>`
    : pagina.map((e, ri) => {
        const idxReal = todos.indexOf(e);
        const nitens  = Object.values(e.consumo||{}).filter(v=>parseFloat(v)>0).length;
        const badge   = e._fonte==='manual'
          ? `<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:rgba(61,220,132,.12);border:1px solid rgba(61,220,132,.3);color:#3DDC84">manual</span>`
          : `<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:rgba(79,142,247,.1);border:1px solid rgba(79,142,247,.25);color:#4F8EF7">importado</span>`;
        return `<tr>
          <td style="padding:8px 12px;color:var(--text2);font-family:var(--mono);font-size:11px">${e.data||'—'}</td>
          <td style="padding:8px 12px;color:var(--text)">${e.cliente||'—'}</td>
          <td style="padding:8px 12px">${badge} <span style="font-size:11px;color:var(--text2);margin-left:4px">${e.grupo||'—'}</span></td>
          <td style="padding:8px 12px;text-align:right;font-family:var(--mono);color:var(--text)">${e.convidados||0}</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3);font-size:11px">${nitens} insumo${nitens!==1?'s':''}</td>
          <td style="padding:8px 12px;text-align:right">
            <button onclick="_rcVerEvento(${idxReal})" style="background:none;border:none;color:#4F8EF7;cursor:pointer;font-size:11px;text-decoration:underline;margin-right:8px">ver</button>
            ${e._fonte==='manual' ? `<button onclick="_rcDeleteEvento(${idxReal})" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:11px">excluir</button>` : ''}
          </td>
        </tr>`;
      }).join('');

  const paginacao = nPags > 1 ? `
    <div style="display:flex;align-items:center;gap:8px;margin-top:14px;justify-content:center">
      <button class="btn" ${_rcHistPage===0?'disabled':''} onclick="_rcHistSetPage(${_rcHistPage-1})">← Anterior</button>
      <span style="font-size:12px;color:var(--text3)">Página ${_rcHistPage+1} de ${nPags}</span>
      <button class="btn" ${_rcHistPage>=nPags-1?'disabled':''} onclick="_rcHistSetPage(${_rcHistPage+1})">Próxima →</button>
    </div>` : '';

  return `
<div style="padding:20px 24px;max-width:1000px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
    <button class="btn" onclick="_rcSetView('tabela')">← Tabela</button>
    <div style="font-size:18px;font-weight:600;color:var(--text)">Histórico de Eventos</div>
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
      <select style="padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px" onchange="_rcHistFiltrar(this.value)">${grupoOpts}</select>
      <button class="btn" style="background:#3DDC84;border-color:#3DDC84;color:#000;font-weight:600" onclick="_rcSetView('novo')">+ Lançar</button>
    </div>
  </div>

  <div id="rc-evt-detalhe"></div>

  <div style="font-size:12px;color:var(--text3);margin-bottom:10px">${total} evento${total!==1?'s':''} ${_rcHistGrupo?'· filtrado por '+_rcHistGrupo:''}</div>

  <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="background:var(--bg3);border-bottom:2px solid var(--border)">
          <th style="padding:9px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Data</th>
          <th style="padding:9px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Cliente</th>
          <th style="padding:9px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Tipo</th>
          <th style="padding:9px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Convidados</th>
          <th style="padding:9px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Itens</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  ${paginacao}

  <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
    ${manual.length ? `<button class="btn" style="color:var(--red);border-color:var(--red)" onclick="_rcLimparManuais()">Apagar lançamentos manuais</button>` : ''}
    ${imp.length    ? `<button class="btn" style="color:var(--red);border-color:var(--red)" onclick="_rcLimparImportados()">Apagar base importada</button>` : ''}
  </div>
</div>`;
}

function _rcHistSetPage(p)   { _rcHistPage = p; rRefConsumo(); }
function _rcHistFiltrar(g)   { _rcHistGrupo = g; _rcHistPage = 0; rRefConsumo(); }

function _rcVerEvento(i) {
  const todos = [..._rcGetEventos().reverse().map(e=>({...e,_fonte:'manual'})), ..._rcGetEventosImportados().slice().reverse().map(e=>({...e,_fonte:'importado'}))];
  const e = todos[i];
  if (!e) return;
  const itens = Object.entries(e.consumo||{}).filter(([,v])=>parseFloat(v)>0)
    .sort((a,b)=>b[1]-a[1])
    .map(([k,v])=>`<span style="display:inline-block;margin:2px;padding:2px 9px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;font-size:11px"><strong>${k}</strong>: ${v}</span>`)
    .join('');
  const el = document.getElementById('rc-evt-detalhe');
  if (el) el.innerHTML = `
    <div style="margin-bottom:14px;padding:12px 16px;background:var(--bg3);border-radius:8px;border-left:3px solid #4F8EF7">
      <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px">${e.cliente||'Sem nome'} · ${e.grupo} · ${e.convidados} conv. · ${e.data}</div>
      <div style="line-height:1.8">${itens||'<span style="color:var(--text3)">Sem consumo registrado</span>'}</div>
      <button onclick="document.getElementById('rc-evt-detalhe').innerHTML=''" style="margin-top:8px;background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px">fechar ▲</button>
    </div>`;
}

function _rcDeleteEvento(i) {
  if (!confirm('Excluir este evento?')) return;
  const todos  = [..._rcGetEventos().reverse().map(e=>({...e,_fonte:'manual'})), ..._rcGetEventosImportados().slice().reverse().map(e=>({...e,_fonte:'importado'}))];
  const e = todos[i];
  if (!e || e._fonte !== 'manual') return;
  // Encontra o índice real na lista manual
  const manuais = _rcGetEventos();
  const idx = manuais.findIndex(m => m.id === e.id);
  if (idx >= 0) { manuais.splice(idx, 1); _rcSaveEventos(manuais); }
  rRefConsumo();
}

function _rcLimparManuais()    { if (!confirm('Apagar todos os eventos lançados manualmente?')) return; _rcSaveEventos([]); rRefConsumo(); }
function _rcLimparImportados() { if (!confirm('Apagar toda a base importada?')) return; _rcSaveEventosImp([]); localStorage.removeItem('refConsumoMeta'); rRefConsumo(); }
function _rcLimparTudo()       { if (!confirm('Apagar TODA a base (importados + manuais)?')) return; D.rcEventos=[]; D.rcEventosImportados=[]; sv('rcEventos'); sv('rcEventosImportados'); localStorage.removeItem('refConsumoMeta'); rRefConsumo(); }


// ── VIEW: NOVO EVENTO ─────────────────────────────────────────────────────────
function _rcBuildNovo() {
  const f     = _rcNovoForm;
  const hoje  = new Date().toISOString().slice(0,10);
  const todas = _rcGetAllBebidas();
  const fil   = (_rcNovoBev||'').toLowerCase().trim();
  const lista = fil ? todas.filter(b=>b.toLowerCase().includes(fil)) : todas;

  const grupoOpts = RC_GRUPOS_LIST.map(g =>
    `<option value="${g}"${(f.grupo||'CASAMENTO')===g?' selected':''}>${g}</option>`
  ).join('');

  const nPreench = Object.values(f.consumo||{}).filter(v=>parseFloat(v)>0).length;

  const bevInputs = lista.map(b => {
    const val = (f.consumo&&f.consumo[b]) ? f.consumo[b] : '';
    const temVal = val && parseFloat(val) > 0;
    return `<div style="display:flex;align-items:center;gap:8px;padding:5px 2px;border-bottom:1px solid var(--border)">
      <span style="flex:1;font-size:12px;color:${temVal?'var(--text)':'var(--text2)'}">${b}</span>
      <input type="number" min="0" step="0.5" placeholder="0" value="${val}"
        style="width:80px;padding:5px 8px;background:var(--bg3);border:1px solid ${temVal?'#4F8EF7':'var(--border)'};border-radius:6px;color:var(--text);font-size:13px;text-align:right"
        oninput="_rcNovoSetBev('${b.replace(/'/g,"\\'")}',this.value)">
      <span style="font-size:10px;color:var(--text3);width:32px">garr.</span>
    </div>`;
  }).join('');

  return `
<div style="padding:20px 24px;max-width:680px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <button class="btn" onclick="_rcSetView('tabela')">← Cancelar</button>
    <div style="font-size:18px;font-weight:600;color:var(--text)">Lançar Evento</div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
    <div>
      <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Data do evento</label>
      <input type="date" value="${f.data||hoje}"
        style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
        oninput="_rcNovoForm.data=this.value">
    </div>
    <div>
      <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Cliente</label>
      <input type="text" placeholder="Nome do cliente (opcional)" value="${f.cliente||''}"
        style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
        oninput="_rcNovoForm.cliente=this.value">
    </div>
    <div>
      <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Tipo de evento</label>
      <select style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
        onchange="_rcNovoForm.grupo=this.value">${grupoOpts}</select>
    </div>
    <div>
      <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Convidados</label>
      <input type="number" min="1" placeholder="ex: 150" value="${f.convidados||''}"
        style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
        oninput="_rcNovoForm.convidados=this.value">
    </div>
  </div>

  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:10px;flex-wrap:wrap">
    <span style="font-size:13px;font-weight:600;color:var(--text)">
      Consumo por insumo
      ${nPreench ? `<span style="font-size:11px;color:#3DDC84;font-weight:600;margin-left:8px">${nPreench} preenchido${nPreench>1?'s':''}</span>` : ''}
    </span>
    <input type="text" placeholder="Filtrar insumo..." value="${_rcNovoBev}"
      style="width:150px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"
      oninput="_rcFiltrarNovoBev(this.value)">
  </div>

  <div style="max-height:360px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:6px 12px;background:var(--bg2)">
    ${bevInputs||'<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px">Nenhum insumo encontrado</div>'}
  </div>

  <div style="margin-top:18px;display:flex;gap:10px;align-items:center">
    <button class="btn" style="background:#3DDC84;border-color:#3DDC84;color:#000;font-weight:600;padding:10px 24px" onclick="_rcSalvarEvento()">Salvar evento</button>
    <button class="btn" onclick="_rcSetView('tabela')">Cancelar</button>
    <span id="rc-novo-status" style="font-size:12px;color:var(--text3)"></span>
  </div>
</div>`;
}

function _rcNovoSetBev(bev, val) {
  if (!_rcNovoForm.consumo) _rcNovoForm.consumo = {};
  _rcNovoForm.consumo[bev] = parseFloat(val) || 0;
  rRefConsumo();
}

function _rcFiltrarNovoBev(v) { _rcNovoBev = v; rRefConsumo(); }

function _rcSalvarEvento() {
  const f = _rcNovoForm;
  if (!f.grupo)                              { _rcNovoStatus('Selecione o tipo de evento.', true); return; }
  if (!f.convidados || parseFloat(f.convidados)<=0) { _rcNovoStatus('Informe o número de convidados.', true); return; }
  const consumo = {};
  Object.entries(f.consumo||{}).forEach(([k,v])=>{ if(parseFloat(v)>0) consumo[k]=parseFloat(v); });
  if (!Object.keys(consumo).length)          { _rcNovoStatus('Informe ao menos um insumo.', true); return; }
  const evts = _rcGetEventos();
  evts.push({ id:'rc-'+Date.now(), data:f.data||new Date().toISOString().slice(0,10), cliente:f.cliente||'', grupo:(f.grupo||'').toUpperCase(), convidados:parseFloat(f.convidados), consumo });
  _rcSaveEventos(evts);
  _rcNovoForm = { data:'', cliente:'', grupo:'CASAMENTO', convidados:'', consumo:{} };
  _rcNovoBev  = '';
  _rcSetView('tabela');
}

function _rcNovoStatus(msg, err) {
  const el = document.getElementById('rc-novo-status');
  if (el) { el.textContent=msg; el.style.color=err?'var(--red)':'var(--green)'; }
}

// ── VIEW: IMPORTAR ────────────────────────────────────────────────────────────
function _rcBuildImport() {
  const imp    = _rcGetEventosImportados();
  const manual = _rcGetEventos();
  const meta   = _rcGetMeta();

  const statusImp = imp.length
    ? `<span style="color:var(--green);font-weight:600">${imp.length} eventos importados${meta?' · '+meta.data:''}</span>`
    : `<span style="color:var(--text3)">Nenhum evento importado</span>`;
  const statusMan = manual.length
    ? `<span style="color:#4F8EF7;font-weight:600">${manual.length} lançados manualmente</span>`
    : `<span style="color:var(--text3)">Nenhum lançado manualmente</span>`;

  return `
<div style="padding:20px 24px;max-width:860px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <button class="btn" onclick="_rcSetView('tabela')">← Voltar</button>
    <div>
      <div style="font-size:18px;font-weight:600;color:var(--text)">Importar Base de Eventos</div>
      <div style="font-size:12px;color:var(--text3)">Cada linha da planilha vira um evento no histórico</div>
    </div>
  </div>

  <!-- Situação atual + limpeza -->
  <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:20px">
    <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px">Base atual (Firebase)</div>
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center">
      <div style="flex:1;min-width:160px">
        <div style="font-size:11px;color:var(--text3);margin-bottom:3px">Importados da planilha</div>
        <div>${statusImp}</div>
      </div>
      <div style="flex:1;min-width:160px">
        <div style="font-size:11px;color:var(--text3);margin-bottom:3px">Lançados manualmente</div>
        <div>${statusMan}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${imp.length ? `<button class="btn" style="color:var(--red);border-color:var(--red);font-size:12px;padding:6px 12px" onclick="_rcLimparImportados()">🗑 Apagar importados</button>` : ''}
        ${manual.length ? `<button class="btn" style="color:var(--red);border-color:var(--red);font-size:12px;padding:6px 12px" onclick="_rcLimparManuais()">🗑 Apagar manuais</button>` : ''}
        ${(imp.length || manual.length) ? `<button class="btn" style="color:var(--red);border-color:var(--red);font-size:12px;padding:6px 12px;font-weight:600" onclick="_rcLimparTudo()">🗑 Limpar tudo</button>` : ''}
      </div>
    </div>
  </div>

  <div style="margin-bottom:12px;font-size:12px;color:var(--text3);line-height:1.7">
    <strong style="color:var(--text2)">Como exportar da planilha:</strong> selecione tudo (Ctrl+A) → copie (Ctrl+C) → cole abaixo.<br>
    Colunas obrigatórias: <code style="background:var(--bg3);padding:1px 5px;border-radius:3px">GRUPO</code> e <code style="background:var(--bg3);padding:1px 5px;border-radius:3px">Convidados</code>.
    Se tiver colunas <code style="background:var(--bg3);padding:1px 5px;border-radius:3px">Cliente</code> e <code style="background:var(--bg3);padding:1px 5px;border-radius:3px">Data</code> elas também são importadas.
  </div>
  <textarea id="rc-tsv-input" placeholder="Cole aqui o conteúdo da planilha (Tab-separado)..."
    style="width:100%;height:220px;padding:12px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px;font-family:var(--mono);resize:vertical;box-sizing:border-box"></textarea>
  <div style="display:flex;gap:10px;margin-top:12px;align-items:center;flex-wrap:wrap">
    <button class="btn" style="background:#4F8EF7;border-color:#4F8EF7;color:#fff;padding:9px 20px" onclick="_rcProcessarImport()">Processar e salvar</button>
    <button class="btn" onclick="document.getElementById('rc-tsv-input').value=''">Limpar campo</button>
    <span id="rc-import-status" style="font-size:12px;color:var(--text3)"></span>
  </div>
</div>`;
}

function _rcProcessarImport() {
  const raw = (document.getElementById('rc-tsv-input')?.value||'').trim();
  if (!raw) { _rcImpStatus('Cole os dados antes de processar.', true); return; }
  _rcImpStatus('Processando...', false);
  setTimeout(() => {
    try {
      const evts = _rcParseTSVEventos(raw);
      _rcSaveEventosImp(evts);
      localStorage.setItem('refConsumoMeta', JSON.stringify({ data: new Date().toLocaleDateString('pt-BR'), nEventos: evts.length }));
      _rcSetView('eventos');
    } catch(e) { _rcImpStatus('Erro: '+e.message, true); }
  }, 50);
}

function _rcParseTSVEventos(text) {
  const lines = text.split(/\r?\n/).filter(l=>l.trim());
  if (lines.length < 2) throw new Error('Dados insuficientes.');
  const header = lines[0].split('\t').map(h=>h.trim());

  const iGrupo    = header.findIndex(h=>h.toUpperCase()==='GRUPO');
  const iConv     = header.findIndex(h=>h.toUpperCase().includes('CONVIDADO'));
  const iCliente  = header.findIndex(h=>h.toUpperCase().includes('CLIENTE'));
  const iData     = header.findIndex(h=>h.toUpperCase().includes('DATA'));
  if (iGrupo < 0) throw new Error('Coluna "GRUPO" não encontrada.');
  if (iConv  < 0) throw new Error('Coluna "Convidados" não encontrada.');

  const SKIP = ['código','sub grupo','horas','base','responsável','local','nome'];
  const insCols = header.reduce((a,h,i)=>{
    if ([iGrupo,iConv,iCliente,iData].includes(i)) return a;
    if (SKIP.some(s=>h.toLowerCase().includes(s))) return a;
    a.push(i); return a;
  }, []);
  if (!insCols.length) throw new Error('Nenhuma coluna de insumo encontrada.');

  const evts = [];
  for (let li=1; li<lines.length; li++) {
    const cols = lines[li].split('\t');
    const g    = (cols[iGrupo]||'').trim().toUpperCase();
    const pax  = parseFloat((cols[iConv]||'').replace(',','.'));
    if (!g || !pax || pax<=0) continue;
    const consumo = {};
    insCols.forEach(i => {
      const qty = parseFloat((cols[i]||'').replace(',','.'));
      if (qty>0) consumo[header[i]] = qty;
    });
    evts.push({
      id:         'imp-'+li,
      data:       iData>=0 ? (cols[iData]||'').trim() : '',
      cliente:    iCliente>=0 ? (cols[iCliente]||'').trim() : '',
      grupo:      g,
      convidados: pax,
      consumo,
    });
  }
  if (!evts.length) throw new Error('Nenhum evento válido encontrado.');
  return evts;
}

function _rcGetMeta() { try { return JSON.parse(localStorage.getItem('refConsumoMeta')||'null'); } catch(e){return null;} }
function _rcImpStatus(msg,err){const el=document.getElementById('rc-import-status');if(el){el.textContent=msg;el.style.color=err?'var(--red)':'var(--green)';}}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _rcBebidaDoGrupo(stats, grupo) {
  const d = stats[grupo] || {};
  return Object.keys(d).filter(b=>{const v=d[b];return v&&(v.count>0||(v.mediaGeral!=null));});
}
function _rcGrupoLabel(g){const m={CASAMENTO:'💍',ANIVERSÁRIO:'🎂',CORPORATIVO:'🏢',CONFRATERNIZAÇÃO:'🥂',FORMATURA:'🎓',NOIVADO:'💐',ALMOÇO:'🍽️'};return (m[g]||'')+' '+g.charAt(0)+g.slice(1).toLowerCase();}
function _rcSetView(v)   { _rcView=v; rRefConsumo(); }
function _rcSetGrupo(g)  { _rcGrupo=g; rRefConsumo(); }
function _rcSetPax(v)    { _rcPax=parseFloat(v)||100; const tb=document.getElementById('rc-tbody'); if(tb) tb.innerHTML=_rcBuildRows(); }
function _rcSetFiltro(v) { _rcFiltro=v; const tb=document.getElementById('rc-tbody'); if(tb) tb.innerHTML=_rcBuildRows(); }
