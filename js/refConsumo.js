// ─── REFERÊNCIA DE CONSUMO ────────────────────────────────────────────────────

const RC_GRUPOS = ['CASAMENTO','ANIVERSÁRIO','CORPORATIVO','CONFRATERNIZAÇÃO','FORMATURA','NOIVADO','ALMOÇO'];

const RC_BEBIDAS = [
  'Vodka','Gim','Aperol','Campari','Manzza','Vermouth','Fernet','Espumante',
  'Tequila','Whisky','Nib Shot','Limonchello','Fireball','Licor Doce de Leite',
  'Ballena','Licor 43','Bananinha','Lillet','Sake','Pisco','Cachaça','Rum',
  'Vinho','Negroni Romero','Espuma de Gengibre','Espuma de Siciliano',
  'Mix Frutas Vermelhas','Grapefruit','Ginger Ale','Café','Suco de Limão',
  'Xarope de Açucar','Agua gasosa','Agua Tônica','Long Drink','Long liso',
  'Gim2','Martini','Taça de Vinho','Caneca','Coupe','Receptivo','Taça Flute',
  'Suprema Multicristal','Calise','Baixo Liso','Lampada','Long Xtra',
  'Xtra Baixo','Bunello','Taça Xtar','Whiskey Elysia','Whiskey Timeles',
];

// Estado local da tela
var _rcGrupo = 'CASAMENTO';
var _rcPax   = 100;
var _rcFiltro = '';

function rRefConsumo() {
  const el = document.getElementById('refconsumo-content');
  if (!el) return;
  el.innerHTML = _rcBuild();
  _rcBindEvents();
}

function _rcBuild() {
  const grupoTabs = RC_GRUPOS.map(g =>
    `<button class="rc-tab${g === _rcGrupo ? ' active' : ''}" onclick="_rcSetGrupo('${g}')">${_rcGrupoLabel(g)}</button>`
  ).join('');

  const tableRows = _rcBuildRows();

  return `
<div style="padding:20px 24px;max-width:1100px">
  <div style="margin-bottom:20px">
    <div style="font-size:18px;font-weight:600;color:var(--text);margin-bottom:4px">Referência de Consumo por Evento</div>
    <div style="font-size:12px;color:var(--text3)">Taxas históricas reais — garrafas por convidado — base de ${_rcContEventos()} eventos registrados</div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px">
    ${grupoTabs}
  </div>

  <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap">
    <div style="display:flex;align-items:center;gap:8px">
      <label style="font-size:12px;color:var(--text3);font-weight:500">Convidados para projeção:</label>
      <input id="rc-pax" type="number" min="1" value="${_rcPax}"
        style="width:80px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"
        oninput="_rcSetPax(this.value)">
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <label style="font-size:12px;color:var(--text3);font-weight:500">Filtrar insumo:</label>
      <input id="rc-filtro" type="text" placeholder="ex: Vodka" value="${_rcFiltro}"
        style="width:160px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"
        oninput="_rcSetFiltro(this.value)">
    </div>
    <div style="font-size:11px;color:var(--text3);margin-left:auto">
      Valores = garrafas/convidado &times; ${_rcPax} convidados = <strong style="color:var(--text2)">garrafas sugeridas</strong>
    </div>
  </div>

  <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="background:var(--bg3);border-bottom:2px solid var(--border)">
          <th style="padding:10px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px;min-width:180px">Insumo</th>
          <th style="padding:10px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Mínimo<br><span style="font-weight:400;text-transform:none;font-size:10px">piso histórico</span></th>
          <th style="padding:10px 12px;text-align:right;color:var(--blue);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Média<br><span style="font-weight:400;text-transform:none;font-size:10px">referência</span></th>
          <th style="padding:10px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Máximo<br><span style="font-weight:400;text-transform:none;font-size:10px">pico histórico</span></th>
          <th style="padding:10px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Média Geral<br><span style="font-weight:400;text-transform:none;font-size:10px">fallback global</span></th>
          <th style="padding:10px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Eventos<br><span style="font-weight:400;text-transform:none;font-size:10px">com consumo</span></th>
        </tr>
      </thead>
      <tbody id="rc-tbody">
        ${tableRows}
      </tbody>
    </table>
  </div>

  <div style="margin-top:16px;padding:12px 16px;background:var(--bg3);border-radius:8px;border-left:3px solid var(--blue)">
    <div style="font-size:11px;color:var(--text3);line-height:1.7">
      <strong style="color:var(--text2)">Como usar:</strong>
      Informe os convidados no campo acima. Os valores nas colunas Mín/Média/Máx já mostram a quantidade de garrafas sugerida para esse total.
      <br>
      <strong style="color:var(--text2)">Média Geral</strong> aparece quando não há histórico desse insumo para esse tipo de evento — usa a taxa global de todos os eventos como referência.
      <br>
      <strong style="color:var(--text2)">Mínimo = piso:</strong> nunca levar menos do que isso para não correr risco de faltar.
    </div>
  </div>
</div>

<style>
.rc-tab{padding:6px 14px;border:1px solid var(--border);border-radius:20px;background:var(--bg3);color:var(--text2);font-size:12px;font-weight:500;cursor:pointer;transition:.15s}
.rc-tab:hover{border-color:var(--blue);color:var(--blue)}
.rc-tab.active{background:var(--blue);border-color:var(--blue);color:#fff}
#rc-tbody tr:hover{background:var(--bg3)}
#rc-tbody tr{border-bottom:1px solid var(--border)}
</style>`;
}

function _rcBuildRows() {
  const grupo = _rcGrupo;
  const pax   = Math.max(1, _rcPax);
  const filtro = _rcFiltro.toLowerCase().trim();
  const data  = (typeof REF_CONSUMO !== 'undefined') ? REF_CONSUMO[grupo] : {};

  return RC_BEBIDAS
    .filter(b => !filtro || b.toLowerCase().includes(filtro))
    .map(b => {
      const d = data && data[b];
      if (!d) return '';

      const hasData = d.count > 0;
      const isFallback = !hasData && d.mediaGeral !== null;

      if (!hasData && d.mediaGeral === null) return ''; // sem nenhum dado global — omitir

      const fmt = (v) => v === null || v === undefined ? '—' : (v * pax).toFixed(1);
      const fmtRate = (v) => v === null ? '' : `<span style="font-size:10px;color:var(--text3)">(${v.toFixed(4)}/pax)</span>`;

      if (isFallback) {
        return `<tr style="opacity:.65">
          <td style="padding:8px 12px;color:var(--text2)">${b} <span style="font-size:10px;color:var(--text3);font-style:italic">sem histórico</span></td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
          <td style="padding:8px 12px;text-align:right;color:var(--blue)">${fmt(d.mediaGeral)} ${fmtRate(d.mediaGeral)}</td>
          <td style="padding:8px 12px;text-align:right;color:var(--text3)">0</td>
        </tr>`;
      }

      const onlyOne = d.count === 1;
      const avgColor = onlyOne ? 'var(--text3)' : 'var(--blue)';
      const badge = onlyOne ? ' <span style="font-size:9px;color:#F5A623;background:rgba(245,166,35,.1);padding:1px 5px;border-radius:4px;border:1px solid rgba(245,166,35,.3)">1 reg.</span>' : '';

      return `<tr>
        <td style="padding:8px 12px;color:var(--text);font-weight:500">${b}${badge}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${fmt(d.min)} ${fmtRate(d.min)}</td>
        <td style="padding:8px 12px;text-align:right;font-weight:600;color:${avgColor}">${fmt(d.avg)} ${fmtRate(d.avg)}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text2)">${fmt(d.max)} ${fmtRate(d.max)}</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text3)">—</td>
        <td style="padding:8px 12px;text-align:right;color:var(--text3)">${d.count}</td>
      </tr>`;
    })
    .join('');
}

function _rcContEventos() {
  if (typeof REF_CONSUMO === 'undefined') return '?';
  // count via Vodka as proxy (present in most events)
  let total = 0;
  RC_GRUPOS.forEach(g => {
    const d = REF_CONSUMO[g] && REF_CONSUMO[g]['Vodka'];
    if (d) total += (d.count || 0);
  });
  return total; // approximate — events that used Vodka
}

function _rcGrupoLabel(g) {
  const icons = {CASAMENTO:'💍',ANIVERSÁRIO:'🎂',CORPORATIVO:'🏢',CONFRATERNIZAÇÃO:'🥂',FORMATURA:'🎓',NOIVADO:'💐',ALMOÇO:'🍽️'};
  return (icons[g] || '') + ' ' + g.charAt(0) + g.slice(1).toLowerCase();
}

function _rcSetGrupo(g) {
  _rcGrupo = g;
  rRefConsumo();
}

function _rcSetPax(v) {
  _rcPax = parseFloat(v) || 100;
  const tbody = document.getElementById('rc-tbody');
  if (tbody) tbody.innerHTML = _rcBuildRows();
}

function _rcSetFiltro(v) {
  _rcFiltro = v;
  const tbody = document.getElementById('rc-tbody');
  if (tbody) tbody.innerHTML = _rcBuildRows();
}

function _rcBindEvents() {
  // inputs already bound via inline oninput handlers
}
