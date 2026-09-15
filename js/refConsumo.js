// ─── REFERÊNCIA DE CONSUMO ────────────────────────────────────────────────────

const RC_GRUPOS_CAT = {
  'CELEBRAÇÃO':  ['CASAMENTO', 'CASAMENTO CIVIL', 'NOIVADO'],
  'ANIVERSÁRIO': ['ANIVERSÁRIO', 'ANIVERSÁRIO 15 ANOS', 'ANIVERSÁRIO 18 ANOS', 'ANIVERSÁRIO 30-50 ANOS', 'ANIVERSÁRIO 51-90 ANOS'],
  'DIVERSOS':    ['CORPORATIVO', 'CONFRATERNIZAÇÃO', 'FORMATURA', 'ALMOÇO'],
};
const RC_GRUPOS_LIST = Object.values(RC_GRUPOS_CAT).flat();

// ── Estado ────────────────────────────────────────────────────────────────────
var _rcView      = 'tabela';
var _rcGrupo     = 'CASAMENTO';
var _rcPax       = 100;
var _rcFiltro    = '';
var _rcNovoBev   = '';
var _rcNovoForm  = {};
var _rcHistPage      = 0;
var _rcHistGrupo     = '';
var _rcHistInsumo    = '';
var _rcHistConvMin   = '';
var _rcHistConvMax   = '';
var _rcHistObs       = '';
var _rcGruposVisiveis = ['CASAMENTO','ANIVERSÁRIO','FORMATURA'];
var _rcHistSelecionados = new Set();
const RC_HIST_PER_PAGE = 50;

// ── Storage (Firebase via D) ──────────────────────────────────────────────────
function _rcGetEventos()           { return D.rcEventos || []; }
function _rcGetEventosImportados() { return D.rcEventosImportados || []; }
function _rcSaveEventos(l)         { D.rcEventos = l; sv('rcEventos'); }
function _rcSaveEventosImp(l)      { D.rcEventosImportados = l; sv('rcEventosImportados'); }

// Eventos vindos de fechamento (calculados a partir de festas — ver
// _rcGetEventosDasFestas) não são um registro próprio, então "excluir" um
// deles não apaga a festa/contrato original: só marca o id aqui pra ele
// parar de entrar nas estatísticas/histórico do Ref. Consumo.
function _rcGetEventosExcluidos()  { return D.rcEventosExcluidos || []; }
function _rcSaveEventosExcluidos(l){ D.rcEventosExcluidos = l; sv('rcEventosExcluidos'); }

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

// ── Mapeamento produto → categoria RC ─────────────────────────────────────────
function _rcMapProdToRC(prod) {
  const p = (prod || '').toUpperCase()
    .replace(/[ÁÀÃÂ]/g,'A').replace(/[ÉÈÊ]/g,'E').replace(/[ÍÌÎ]/g,'I')
    .replace(/[ÓÒÕÔ]/g,'O').replace(/[ÚÙÛ]/g,'U').replace(/Ç/g,'C').trim();
  if (p.includes('VODKA'))                                                  return 'Vodka';
  if (p.includes('GIN ') || p==='GIN' || p.startsWith('GIN '))             return 'Gim';
  if (p.includes('APEROL'))                                                 return 'Aperol';
  if (p.includes('CAMPARI'))                                                return 'Campari';
  if (p.includes('TEQUILA'))                                                return 'Tequila';
  if (p.includes('WHISKY')||p.includes('WHISKEY')||
      /JAMESON|JACK DANIEL|CHIVAS|BULLEIT|BUFALO|BUFFALO|SINGLETON|DEWAR|HIBIKI|GLENLIVET|BLACK LABEL|RED LABEL|ROYAL SALUTE|TALISKER|BUCHANAN|JIM BEAM|LAMAS|OUL PARR|SARERAL/.test(p)) return 'Whisky';
  if (p.includes('ESPUMANTE')||p.includes('FOSS MARAI')||p.includes('LE BLANC')) return 'Espumante';
  if (p.includes('MANZA'))                                                  return 'Manzza';
  if (p.includes('LILLET'))                                                 return 'Lillet';
  if (p.includes('CACHACA'))                                                return 'Cachaça';
  if (p.includes('CARPANO')||p.includes('CINZANO')||p.includes('VERMOUTH')||
      p.includes('PUNT E MES')||p==='1757'||p.includes('RAMAZZOTTI')||p.includes('AMAROGUTTA')) return 'Vermouth';
  if (p.includes('VINHO'))                                                  return 'Vinho';
  if (/\bRUM\b|HAVANA/.test(p))                                             return 'Rum';
  if (p.includes('FERNET'))                                                 return 'Fernet';
  if (p.includes('FIREBALL'))                                               return 'Fireball';
  if (p.includes('LIMONCELLO')||p.includes('LIMONCHELLO'))                  return 'Limonchello';
  if (p.includes('BANANINHA'))                                              return 'Bananinha';
  if (p.includes('BALLENA'))                                                return 'Ballena';
  if (p.includes('NIB'))                                                    return 'Nib Shot';
  if (p.includes('PISCO'))                                                  return 'Pisco';
  if (p.includes('SAQUE')||p==='SAKE')                                      return 'Sake';
  if (p.includes('NEGRONI'))                                                return 'Negroni Romero';
  if (p.includes('LICOR 43'))                                               return 'Licor 43';
  if (p.includes('DOCE DE LEITE'))                                          return 'Licor Doce de Leite';
  if (p.includes('ESPUMA DE GENGIBRE'))                                     return 'Espuma de Gengibre';
  if (p.includes('ESPUMA DE SICILIANO'))                                    return 'Espuma de Siciliano';
  if (p.includes('GINGER ALE'))                                             return 'Ginger Ale';
  if (p.includes('GRAPEFRUIT'))                                             return 'Grapefruit';
  if (p.includes('AGUA TONICA')||p.includes('TONICO'))                      return 'Agua Tônica';
  if (p.includes('AGUA COM GAS')||p.includes('CAMBUQUIRA'))                 return 'Agua gasosa';
  if (p.includes('SUCO DE LIMAO')||p.includes('LIMAO SICILIANO'))           return 'Suco de Limão';
  if (p.includes('XAROPE DE ACUCAR'))                                       return 'Xarope de Açucar';
  if (p.includes('FRUTAS VERMELHAS'))                                       return 'Mix Frutas Vermelhas';
  if (/\bCAFE\b|CAFE SOLUVEL/.test(p))                                      return 'Café';
  return null;
}

// ── Normaliza tipo de evento → grupo RC ───────────────────────────────────────
function _rcNormalizarTipo(tipo) {
  const t = (tipo || '').toUpperCase()
    .replace(/[ÁÀÃÂ]/g,'A').replace(/[ÉÈÊ]/g,'E').replace(/[ÍÌÎ]/g,'I')
    .replace(/[ÓÒÕÔ]/g,'O').replace(/[ÚÙÛ]/g,'U').replace(/Ç/g,'C').trim();
  if (t.includes('CASAMENTO CIVIL'))           return 'CASAMENTO CIVIL';
  if (t.includes('CASAMENTO'))                 return 'CASAMENTO';
  if (t.includes('NOIVADO'))                   return 'NOIVADO';
  if (t.includes('15 ANOS')||t.includes('QUINZE')) return 'ANIVERSÁRIO 15 ANOS';
  if (t.includes('18 ANOS'))                   return 'ANIVERSÁRIO 18 ANOS';
  if (t.includes('ANIVERSARIO'))               return 'ANIVERSÁRIO';
  if (t.includes('FORMATURA'))                 return 'FORMATURA';
  if (t.includes('CORPORATIVO'))               return 'CORPORATIVO';
  if (t.includes('CONFRATERNIZACAO'))          return 'CONFRATERNIZAÇÃO';
  if (t.includes('ALMOCO'))                    return 'ALMOÇO';
  return '';
}

// ── Converte festas (fechamentos) no formato RC ───────────────────────────────
function _rcGetEventosDasFestas() {
  if (typeof _allFestas !== 'function') return [];
  const festas      = _allFestas();
  const agenda      = D.agenda      || [];
  const contratos   = D.contratos   || [];
  const fechamentos = D.fechamentos || [];

  return festas
    .filter(f => f.itens && f.itens.length)
    .map(f => {
      const nomeF = (f.nome || '').toLowerCase().trim();
      let tipo = '', convidados = 0;

      // Entradas virtuais (geradas de D.fechamentos): busca tipo/convidados via contratoId
      if (f._virtual) {
        const fchId = (f.id || '').replace('_fch_', '');
        const fch   = fechamentos.find(x => x.id === fchId);
        if (fch && fch.contratoId) {
          const ct = contratos.find(c => c.id === fch.contratoId);
          if (ct) { tipo = ct.tipo || ''; convidados = parseFloat(ct.convidados || 0); }
        }
      }

      // Festas reais: busca por nome+data na agenda, depois nos contratos
      if (!tipo || !(convidados > 0)) {
        const ag = agenda.find(a =>
          a.data === f.data && (a.nome || '').toLowerCase().trim() === nomeF
        );
        if (ag) { tipo = tipo || ag.tipo || ''; convidados = convidados || parseFloat(ag.convidados || 0); }
      }

      if (!tipo || !(convidados > 0)) {
        const ct = contratos.find(c =>
          c.data === f.data &&
          ((c.nome||'').toLowerCase().trim()===nomeF ||
           (c.nomeEvento||'').toLowerCase().trim()===nomeF)
        );
        if (ct) { tipo = tipo || ct.tipo || ''; convidados = convidados || parseFloat(ct.convidados||0); }
      }

      const grupo = _rcNormalizarTipo(tipo);
      if (!grupo || !(convidados > 0)) return null;

      const consumo = {};
      f.itens.forEach(item => {
        const qty = parseFloat(item.consumido ?? item.qtd ?? 0);
        if (qty <= 0) return;
        const rc = _rcMapProdToRC(item.prod || '');
        if (rc) consumo[rc] = (consumo[rc] || 0) + qty;
      });

      if (!Object.keys(consumo).length) return null;
      return { id: f.id, data: f.data, cliente: f.nome, grupo, convidados, consumo };
    })
    .filter(Boolean)
    .filter(e => !_rcGetEventosExcluidos().includes(e.id));
}

// ── Cálculo de stats a partir de todos os eventos ─────────────────────────────
function _rcGetStats() {
  const dasFestas = _rcGetEventosDasFestas();
  const manual    = _rcGetEventos();
  const all       = [...dasFestas, ...manual];
  if (!all.length) return (typeof REF_CONSUMO !== 'undefined') ? REF_CONSUMO : {};
  return _rcComputeStats(all);
}

function _rcComputeStats(evts) {
  const qtysMap = {};  // qtysMap[grupo][bev] = [qty,...]
  const qtysAll = {};  // global, para fallback

  evts.forEach(evt => {
    const g   = (evt.grupo||'').trim().toUpperCase();
    const pax = parseFloat(evt.convidados) || 0;
    if (!g || pax <= 0) return;
    if (!qtysMap[g]) qtysMap[g] = {};
    Object.entries(evt.consumo||{}).forEach(([bev, qty]) => {
      qty = parseFloat(qty) || 0;
      if (qty <= 0) return;
      if (!qtysMap[g][bev]) qtysMap[g][bev] = [];
      qtysMap[g][bev].push(qty);
      if (!qtysAll[bev]) qtysAll[bev] = [];
      qtysAll[bev].push(qty);
    });
  });

  // Stats globais (fallback para grupos sem histórico naquele insumo)
  const globalAvg = {};
  Object.entries(qtysAll).forEach(([bev, list]) => {
    globalAvg[bev] = list.reduce((a,b)=>a+b, 0) / list.length;
  });

  const allBevs = Object.keys(qtysAll);
  const out = {};
  Object.keys(qtysMap).forEach(g => {
    out[g] = {};
    allBevs.forEach(bev => {
      const list = qtysMap[g][bev] || [];
      if (list.length) {
        const mn  = Math.min(...list);
        const mx  = Math.max(...list);
        const avg = list.reduce((a,b)=>a+b, 0) / list.length;
        out[g][bev] = { min:mn, max:mx, avg:avg, mediaGeral:null, count:list.length };
      } else {
        out[g][bev] = { min:null, max:null, avg:null, mediaGeral: globalAvg[bev]??null, count:0 };
      }
    });
  });
  return out;
}

function _r(v) { return Math.round(v * 10000) / 10000; }

// ── Itens de consumo vindos do Cadastro (Cadastro → Insumos) ─────────────────
// A lista de insumos disponíveis pra lançar consumo não é mais hardcoded: vem
// direto do Cadastro, TODOS os itens (sem restringir por categoria — filtrar
// por nome só limitava a "copos" quando restringia por categoria fixa, porque
// nomes de categoria podem divergir em acento/grafia do cadastro real). Se
// faltar algum insumo aqui, o cadastro dele em Cadastro → Insumos que resolve
// (mesmo padrão de fonte única já usado em Biblioteca de Itens/Regras).
function _rcGetInsumosConsumo() {
  return (D.insumos || [])
    .slice()
    .sort((a,b) => (a.nome||'').localeCompare(b.nome||'', 'pt-BR'));
}

// ── Render ────────────────────────────────────────────────────────────────────
function rRefConsumo() {
  const el = document.getElementById('refconsumo-content');
  if (!el) return;
  if      (_rcView==='tabela')  el.innerHTML = _rcBuildTabela();
  else if (_rcView==='eventos') el.innerHTML = _rcBuildEventos();
  else if (_rcView==='novo')    el.innerHTML = _rcBuildNovo();
}

// ── VIEW: TABELA (comparativa) ────────────────────────────────────────────────
function _rcBuildTabela() {
  const dasFestas = _rcGetEventosDasFestas();
  const manual    = _rcGetEventos();
  const stats     = _rcGetStats();
  const total     = dasFestas.length + manual.length;

  const grupoToggles = Object.entries(RC_GRUPOS_CAT).map(([cat, gs]) => {
    const btns = gs.map(g => {
      const on = _rcGruposVisiveis.includes(g);
      return `<button class="rc-tab${on?' active':''}" onclick="_rcToggleGrupo('${g}')">${_rcGrupoLabel(g)}</button>`;
    }).join('');
    return `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;white-space:nowrap;min-width:96px">${cat}</span>
      <div style="width:1px;height:20px;background:var(--border);flex-shrink:0"></div>
      ${btns}
    </div>`;
  }).join('');

  // Tipo de evento lançado que tem dado na base mas não é nenhum dos buckets
  // fixos acima (ex: tipo/subgrupo do Cadastro com nome que não bate com
  // nenhum sinônimo conhecido) — nunca fica escondido, ganha sua própria
  // linha de alternância em vez de sumir da Tabela.
  const gruposExtras = Object.keys(stats)
    .filter(g => !RC_GRUPOS_LIST.includes(g))
    .sort((a,b) => a.localeCompare(b,'pt-BR'));
  const extrasToggle = gruposExtras.length ? `
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;white-space:nowrap;min-width:96px">OUTROS TIPOS</span>
      <div style="width:1px;height:20px;background:var(--border);flex-shrink:0"></div>
      ${gruposExtras.map(g => {
        const on = _rcGruposVisiveis.includes(g);
        return `<button class="rc-tab${on?' active':''}" onclick="_rcToggleGrupo('${g}')">${_rcGrupoLabel(g)}</button>`;
      }).join('')}
    </div>` : '';

  return `
<div style="padding:20px 24px">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;gap:12px;flex-wrap:wrap">
    <div>
      <div style="font-size:18px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:.5px">Estimativa de Consumo e Quebras</div>
      <div style="font-size:12px;color:var(--text3);margin-top:2px">
        ${total
          ? `<span style="color:var(--green)">${total} evento${total>1?'s':''} na base</span>${dasFestas.length?` · ${dasFestas.length} do fechamento`:''}${manual.length?` · ${manual.length} manuais`:''}`
          : `<span style="color:#F5A623">Nenhum fechamento com consumo encontrado</span> <span style="color:var(--text3)">· registre eventos com produtos consumidos para alimentar as estimativas</span>`
        }
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" onclick="_rcSetView('eventos')">Histórico</button>
      <button class="btn" onclick="_rcSetView('novo')">+ Lançar manual</button>
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;flex-wrap:wrap">
    <div style="display:flex;align-items:center;gap:8px">
      <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Convidados</label>
      <input id="rc-pax" type="number" min="1" value="${_rcPax}"
        style="width:90px;padding:7px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:16px;font-weight:700;text-align:center"
        oninput="_rcSetPax(this.value)">
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <label style="font-size:12px;color:var(--text3)">Filtrar:</label>
      <input id="rc-filtro" type="text" placeholder="ex: Vodka" value="${_rcFiltro}"
        style="width:160px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px"
        oninput="_rcSetFiltro(this.value)">
    </div>
  </div>

  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${grupoToggles}${extrasToggle}</div>

  <div style="overflow-x:auto">
    ${_rcBuildTabelaComparativa(stats)}
  </div>

  <div style="margin-top:14px;padding:12px 16px;background:var(--bg3);border-radius:8px;border-left:3px solid #4F8EF7;font-size:11px;color:var(--text3);line-height:1.7">
    <strong style="color:var(--text2)">Mínimo</strong> = piso histórico (nunca levar menos).&nbsp;
    <strong style="color:var(--text2)">Sugestão</strong> = média × convidados + margem de segurança (<strong>×1,20</strong> se &lt; 18 unid., <strong>×1,15</strong> se ≥ 18 unid.) — sempre arredondado para cima.&nbsp;
    <sup style="color:#F5A623">*</sup> = apenas 1 evento registrado nessa categoria. Itens sem histórico mostram sugestão global.
  </div>
</div>
<style>
.rc-tab{padding:6px 14px;border:1px solid var(--border);border-radius:20px;background:var(--bg3);color:var(--text2);font-size:12px;font-weight:500;cursor:pointer;transition:.15s}
.rc-tab:hover{border-color:#4F8EF7;color:#4F8EF7}
.rc-tab.active{background:#4F8EF7;border-color:#4F8EF7;color:#fff}
#rc-cmp-tbody tr{border-bottom:1px solid var(--border)}
#rc-cmp-tbody tr:hover td{background:rgba(255,255,255,.03)}
</style>`;
}

function _rcBuildTabelaComparativa(stats) {
  const groups = _rcGruposVisiveis.length ? _rcGruposVisiveis : ['CASAMENTO'];

  const groupThs = groups.map(g =>
    `<th colspan="4" style="padding:9px 10px;text-align:center;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border-left:2px solid var(--border);white-space:nowrap;color:var(--text)">${_rcGrupoLabel(g)}</th>`
  ).join('');

  const subThs = groups.map(() => `
    <th style="padding:6px 8px;text-align:right;color:var(--text3);font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.5px;border-left:2px solid var(--border);min-width:44px">Mín</th>
    <th style="padding:6px 8px;text-align:right;color:var(--text3);font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.5px;min-width:44px">Méd</th>
    <th style="padding:6px 8px;text-align:right;color:var(--text3);font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.5px;min-width:44px">Máx</th>
    <th style="padding:6px 8px;text-align:right;color:#4F8EF7;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.5px;background:rgba(79,142,247,.07);min-width:52px">Sug.</th>
  `).join('');

  return `
<table style="border-collapse:collapse;font-size:12px">
  <thead>
    <tr style="background:var(--bg2)">
      <th rowspan="2" style="padding:10px 14px;text-align:left;color:var(--text3);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px;min-width:170px;vertical-align:bottom;border-bottom:2px solid var(--border)">Insumo</th>
      ${groupThs}
    </tr>
    <tr style="background:var(--bg3);border-bottom:2px solid var(--border)">${subThs}</tr>
  </thead>
  <tbody id="rc-cmp-tbody">${_rcBuildComparativaRows(stats, groups)}</tbody>
</table>`;
}

function _rcSugestao(avgQty) {
  return Math.ceil(avgQty * (avgQty < 18 ? 1.20 : 1.15));
}

// Categoria de um item na Tabela comparativa vem do Cadastro de Insumos
// (mesmo helper que Regras/Separação já usam pra resolver "categoria atual",
// já que a ficha/histórico pode guardar uma categoria antiga) — item sem
// insumo cadastrado com esse nome exato cai em OUTROS, nunca escondido.
function _rcCategoriaDoItem(nome) {
  return (typeof categoriaAtualDoInsumo === 'function') ? categoriaAtualDoInsumo(nome, 'OUTROS') : 'OUTROS';
}

function _rcBuildComparativaRows(statsArg, groupsArg) {
  const stats  = statsArg  || _rcGetStats();
  const groups = groupsArg || (_rcGruposVisiveis.length ? _rcGruposVisiveis : ['CASAMENTO']);
  const filtro = _rcFiltro.toLowerCase().trim();
  const ceil   = v => v == null ? '—' : Math.ceil(v);
  const nCols  = 1 + groups.length * 4;

  // União de bebidas com dados em todos os grupos visíveis
  const allBevSet = new Set();
  groups.forEach(g => _rcBebidaDoGrupo(stats, g).forEach(b => allBevSet.add(b)));

  // Agrupa por categoria (do Cadastro), respeitando filtro
  const categoriasOrdem = (typeof getCategorias === 'function') ? getCategorias().slice() : ['OUTROS'];
  if (!categoriasOrdem.includes('OUTROS')) categoriasOrdem.push('OUTROS');
  const ordemSet = new Set(categoriasOrdem);
  const porCat = {};
  [...allBevSet]
    .filter(b => !filtro || b.toLowerCase().includes(filtro))
    .forEach(b => {
      const cat = _rcCategoriaDoItem(b);
      if (!ordemSet.has(cat)) { ordemSet.add(cat); categoriasOrdem.push(cat); }
      (porCat[cat] || (porCat[cat]=[])).push(b);
    });

  const html = [];
  categoriasOrdem.forEach(cat => {
    const itens = porCat[cat];
    if (!itens || !itens.length) return;

    html.push(`<tr style="background:var(--bg3)">
      <td colspan="${nCols}" style="padding:9px 14px 5px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px;border-top:2px solid var(--border)">${cat}</td>
    </tr>`);

    itens.forEach(b => {
      const cells = groups.map(g => {
        const d   = (stats[g] || {})[b];
        const sep = 'border-left:2px solid var(--border)';
        if (!d || (d.count <= 0 && d.mediaGeral == null)) {
          return `<td style="padding:7px 8px;text-align:right;color:var(--text3);${sep}">—</td><td style="padding:7px 8px;text-align:right;color:var(--text3)">—</td><td style="padding:7px 8px;text-align:right;color:var(--text3)">—</td><td style="padding:7px 8px;text-align:right;color:var(--text3);background:rgba(79,142,247,.04)">—</td>`;
        }
        if (d.count <= 0) {
          return `<td style="padding:7px 8px;text-align:right;color:var(--text3);opacity:.55;${sep}">—</td><td style="padding:7px 8px;text-align:right;color:var(--text3);opacity:.55">—</td><td style="padding:7px 8px;text-align:right;color:var(--text3);opacity:.55">—</td><td style="padding:7px 8px;text-align:right;font-weight:600;color:#4F8EF7;opacity:.65;background:rgba(79,142,247,.04)">${d.mediaGeral!=null?_rcSugestao(d.mediaGeral):'—'}</td>`;
        }
        const suf = d.count===1 ? '<sup style="color:#F5A623;font-size:9px">*</sup>' : '';
        return `<td style="padding:7px 8px;text-align:right;color:var(--text2);${sep}">${ceil(d.min)}</td><td style="padding:7px 8px;text-align:right;color:var(--text2)">${ceil(d.avg)}</td><td style="padding:7px 8px;text-align:right;color:var(--text2)">${ceil(d.max)}</td><td style="padding:7px 8px;text-align:right;font-weight:700;color:#4F8EF7;font-size:12px;background:rgba(79,142,247,.04)">${d.avg!=null?_rcSugestao(d.avg):'—'}${suf}</td>`;
      }).join('');

      html.push(`<tr><td style="padding:7px 14px 7px 22px;color:var(--text);font-weight:500;white-space:nowrap">${b}</td>${cells}</tr>`);
    });
  });

  if (!html.length) {
    return `<tr><td colspan="${nCols}" style="padding:32px;text-align:center;color:var(--text3)">Nenhum insumo encontrado.</td></tr>`;
  }
  return html.join('');
}

// ── VIEW: HISTÓRICO ───────────────────────────────────────────────────────────
// A tabela/paginação/seleção ficam numa função à parte (_rcHistResultadosHTML)
// pra poder ser atualizada sozinha (#rc-hist-resultados) sempre que um filtro
// muda — sem reconstruir os campos de filtro no topo, que é o que fazia o
// cursor perder o foco a cada letra digitada.
function _rcBuildEventos() {
  // Une a lista fixa com qualquer grupo que já tenha evento salvo (manual ou
  // de fechamento) — mesmo padrão da Tabela: tipo lançado nunca fica de fora
  // do filtro só porque não é um dos buckets conhecidos.
  const gruposComDados = new Set([
    ..._rcGetEventos().map(e => (e.grupo||'').toUpperCase()),
    ..._rcGetEventosDasFestas().map(e => (e.grupo||'').toUpperCase()),
  ].filter(Boolean));
  const todosGrupos = [...new Set([...RC_GRUPOS_LIST, ...gruposComDados])].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const grupoOpts = ['', ...todosGrupos].map(g =>
    `<option value="${g}"${_rcHistGrupo===g?' selected':''}>${g||'Todos os tipos'}</option>`
  ).join('');

  return `
<div style="padding:20px 24px;max-width:1200px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
    <button class="btn" onclick="_rcSetView('tabela')">← Tabela</button>
    <div style="font-size:18px;font-weight:600;color:var(--text)">Histórico de Eventos</div>
    <button class="btn" style="background:#3DDC84;border-color:#3DDC84;color:#000;font-weight:600;margin-left:auto" onclick="_rcSetView('novo')">+ Manual</button>
  </div>

  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px;padding:12px 14px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
    <div style="display:flex;flex-direction:column;gap:3px">
      <label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Tipo de evento</label>
      <select style="padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;min-width:160px" onchange="_rcHistFiltrar(this.value)">${grupoOpts}</select>
    </div>
    <div style="display:flex;flex-direction:column;gap:3px">
      <label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Conv. mín.</label>
      <input type="number" min="0" value="${_rcHistConvMin}" placeholder="ex: 80"
        style="width:80px;padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"
        oninput="_rcHistFiltrarConvMin(this.value)">
    </div>
    <div style="display:flex;flex-direction:column;gap:3px">
      <label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Conv. máx.</label>
      <input type="number" min="0" value="${_rcHistConvMax}" placeholder="ex: 120"
        style="width:80px;padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"
        oninput="_rcHistFiltrarConvMax(this.value)">
    </div>
    <div style="display:flex;flex-direction:column;gap:3px">
      <label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Insumo (auditoria)</label>
      <input type="text" placeholder="ex: Vodka" value="${_rcHistInsumo}"
        style="width:140px;padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"
        oninput="_rcHistFiltrarInsumo(this.value)">
    </div>
    <div style="display:flex;flex-direction:column;gap:3px">
      <label style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Observação</label>
      <input type="text" placeholder="ex: 11 a 15 anos" value="${_rcHistObs}"
        style="width:160px;padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"
        oninput="_rcHistFiltrarObs(this.value)">
    </div>
    <button class="btn" id="rc-hist-limpar" style="color:var(--text3);font-size:11px;align-self:flex-end;${_rcHistTemFiltro()?'':'display:none'}" onclick="_rcHistLimparFiltros()">✕ Limpar filtros</button>
  </div>

  <div id="rc-evt-detalhe"></div>

  <div id="rc-hist-resultados">${_rcHistResultadosHTML()}</div>
</div>`;
}

function _rcHistTemFiltro() {
  return !!(_rcHistGrupo || _rcHistConvMin!=='' || _rcHistConvMax!=='' || _rcHistInsumo.trim() || _rcHistObs.trim());
}

function _rcHistRefresh() {
  const el = document.getElementById('rc-hist-resultados');
  if (el) el.innerHTML = _rcHistResultadosHTML();
  const btnLimpar = document.getElementById('rc-hist-limpar');
  if (btnLimpar) btnLimpar.style.display = _rcHistTemFiltro() ? '' : 'none';
}

function _rcHistResultadosHTML() {
  const dasFestas = _rcGetEventosDasFestas().map(e => ({...e, _fonte:'fechamento'}));
  const manual    = _rcGetEventos().map(e => ({...e, _fonte:'manual'}));
  const todos     = [...manual.slice().reverse(), ...dasFestas];

  let filtrados = _rcHistGrupo
    ? todos.filter(e => (e.grupo||'').toUpperCase() === _rcHistGrupo)
    : todos;
  if (_rcHistInsumo.trim()) {
    const term = _rcHistInsumo.toLowerCase().trim();
    filtrados = filtrados.filter(e =>
      Object.keys(e.consumo||{}).some(k => k.toLowerCase().includes(term))
    );
  }
  if (_rcHistConvMin !== '') {
    const mn = parseFloat(_rcHistConvMin);
    if (!isNaN(mn)) filtrados = filtrados.filter(e => parseFloat(e.convidados||0) >= mn);
  }
  if (_rcHistConvMax !== '') {
    const mx = parseFloat(_rcHistConvMax);
    if (!isNaN(mx)) filtrados = filtrados.filter(e => parseFloat(e.convidados||0) <= mx);
  }
  if (_rcHistObs.trim()) {
    const termObs = _rcHistObs.toLowerCase().trim();
    filtrados = filtrados.filter(e => (e.observacao||'').toLowerCase().includes(termObs));
  }

  // Modo auditoria: detecta o insumo exato sendo pesquisado
  const insumoTerm = _rcHistInsumo.toLowerCase().trim();
  let auditBev = null;
  if (insumoTerm && filtrados.length) {
    for (const e of filtrados) {
      const match = Object.keys(e.consumo||{}).find(k => k.toLowerCase().includes(insumoTerm));
      if (match) { auditBev = match; break; }
    }
  }

  // Card de auditoria com min/méd/máx/sug calculados a partir dos eventos filtrados
  let auditSummary = '';
  if (auditBev) {
    const dados = filtrados
      .map(e => {
        const qty  = parseFloat((e.consumo||{})[auditBev] || 0);
        const conv = parseFloat(e.convidados) || 0;
        return (qty > 0 && conv > 0) ? { qty, conv } : null;
      })
      .filter(d => d !== null);
    if (dados.length) {
      const qtys      = dados.map(d => d.qty);
      const mn        = Math.min(...qtys);
      const mx        = Math.max(...qtys);
      const avgQty    = qtys.reduce((a,b)=>a+b,0) / qtys.length;
      const totalQty  = qtys.reduce((a,b)=>a+b,0);
      const margem    = avgQty < 18 ? 1.20 : 1.15;
      const sug       = Math.ceil(avgQty * margem);
      const convLabel = (_rcHistConvMin||_rcHistConvMax)
        ? ` · ${_rcHistConvMin||'?'}–${_rcHistConvMax||'?'} conv.` : '';
      auditSummary = `
        <div style="margin-bottom:14px;padding:14px 18px;background:rgba(79,142,247,.06);border-radius:8px;border:1px solid rgba(79,142,247,.25)">
          <div style="font-size:11px;font-weight:700;color:#4F8EF7;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">
            Auditoria · ${auditBev} · ${dados.length} evento${dados.length!==1?'s':''} · ${_rcHistGrupo||'todos os tipos'}${convLabel}
          </div>
          <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:13px">
            <div style="text-align:center"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Mínimo</div><strong style="color:var(--text);font-size:18px">${mn}</strong></div>
            <div style="text-align:center"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Médio</div><strong style="color:var(--text);font-size:18px">${Math.ceil(avgQty)}</strong></div>
            <div style="text-align:center"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Máximo</div><strong style="color:var(--text);font-size:18px">${mx}</strong></div>
            <div style="text-align:center;background:rgba(79,142,247,.12);border-radius:6px;padding:4px 16px"><div style="font-size:10px;color:#4F8EF7;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Sugestão</div><strong style="color:#4F8EF7;font-size:22px">${sug}</strong></div>
          </div>
          <div style="margin-top:8px;font-size:10px;color:var(--text3)">Média histórica: ${avgQty.toFixed(1)} unid. · Margem: ×${margem.toFixed(2)} · total histórico: ${totalQty} unid. em ${dados.length} eventos</div>
        </div>`;
    }
  }

  const total  = filtrados.length;
  const inicio = _rcHistPage * RC_HIST_PER_PAGE;
  const pagina = filtrados.slice(inicio, inicio + RC_HIST_PER_PAGE);
  const nPags  = Math.ceil(total / RC_HIST_PER_PAGE);

  const auditTh = auditBev ? `
    <th style="padding:9px 12px;text-align:right;color:#4F8EF7;font-weight:600;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap">Qtd ${auditBev}</th>
    <th style="padding:9px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Unid./Conv.</th>` : '';

  const idsVisiveis = pagina.map(e => e.id);
  const todosVisiveisMarcados = idsVisiveis.length>0 && idsVisiveis.every(id => _rcHistSelecionados.has(id));
  const selTh = idsVisiveis.length
    ? `<th style="padding:9px 6px;text-align:center;width:26px"><input type="checkbox" ${todosVisiveisMarcados?'checked':''} onchange='_rcHistSelecionarTodosVisiveis(${JSON.stringify(idsVisiveis)},this.checked)' title="Selecionar todos desta página"></th>`
    : `<th style="width:26px"></th>`;

  const rows = pagina.length === 0
    ? `<tr><td colspan="${auditBev?8:6}" style="padding:32px;text-align:center;color:var(--text3)">Nenhum evento encontrado.</td></tr>`
    : pagina.map((e) => {
        const idxReal = todos.indexOf(e);
        const badge   = e._fonte==='manual'
          ? `<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:rgba(61,220,132,.12);border:1px solid rgba(61,220,132,.3);color:#3DDC84">manual</span>`
          : `<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:rgba(245,166,35,.12);border:1px solid rgba(245,166,35,.3);color:#F5A623">fechamento</span>`;
        const selTd = `<td style="padding:8px 6px;text-align:center"><input type="checkbox" ${_rcHistSelecionados.has(e.id)?'checked':''} onchange="_rcHistToggleSel('${e.id}')"></td>`;

        // Produtos consumidos em lista vertical, ordenados por qtd desc
        const prods = Object.entries(e.consumo||{})
          .filter(([,v]) => parseFloat(v) > 0)
          .sort((a,b) => b[1]-a[1])
          .map(([k,v]) => {
            const destaque = auditBev && k === auditBev;
            return `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;${destaque?'color:#4F8EF7;font-weight:700':'color:var(--text2)'}">
              <strong style="font-family:var(--mono);min-width:22px;text-align:right;font-size:12px">${v}</strong>
              <span style="font-size:11px">${k}</span>
              ${destaque ? '<span style="font-size:9px;color:#4F8EF7">★</span>' : ''}
            </div>`;
          }).join('');

        let auditTds = '';
        if (auditBev) {
          const qty  = parseFloat((e.consumo||{})[auditBev] || 0);
          const taxa = (qty > 0 && e.convidados > 0) ? (qty / e.convidados) : 0;
          auditTds = `
            <td style="padding:8px 12px;text-align:right;font-weight:700;color:#4F8EF7;font-family:var(--mono)">${qty > 0 ? qty : '—'}</td>
            <td style="padding:8px 12px;text-align:right;color:var(--text3);font-family:var(--mono);font-size:11px">${taxa > 0 ? taxa.toFixed(4) : '—'}</td>`;
        }
        return `<tr style="border-bottom:1px solid var(--border)">
          ${selTd}
          <td style="padding:8px 12px;color:var(--text2);font-family:var(--mono);font-size:11px;white-space:nowrap">${e.data||'—'}</td>
          <td style="padding:8px 12px">${badge} <span style="font-size:11px;color:var(--text2);margin-left:4px">${e.grupo||'—'}</span>${e.observacao?`<div style="font-size:10px;color:var(--text3);margin-top:2px">${e.observacao}</div>`:''}</td>
          <td style="padding:8px 12px;text-align:right;font-family:var(--mono);color:var(--text);font-weight:600">${e.convidados||0}</td>
          ${auditTds}
          <td style="padding:6px 12px;line-height:1.8">${prods||'<span style="color:var(--text3);font-size:11px">—</span>'}</td>
          <td style="padding:8px 12px;text-align:right;white-space:nowrap">
            <button onclick="_rcVerEvento(${idxReal})" style="background:none;border:none;color:#4F8EF7;cursor:pointer;font-size:11px;text-decoration:underline;margin-right:8px">detalhes</button>
            ${e._fonte==='manual' ? `<button onclick="_rcEditarEvento(${idxReal})" style="background:none;border:none;color:#4F8EF7;cursor:pointer;font-size:11px;margin-right:8px">editar</button>` : ''}
            <button onclick="_rcDeleteEvento(${idxReal})" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:11px">excluir</button>
          </td>
        </tr>`;
      }).join('');

  const paginacao = nPags > 1 ? `
    <div style="display:flex;align-items:center;gap:8px;margin-top:14px;justify-content:center">
      <button class="btn" ${_rcHistPage===0?'disabled':''} onclick="_rcHistSetPage(${_rcHistPage-1})">← Anterior</button>
      <span style="font-size:12px;color:var(--text3)">Página ${_rcHistPage+1} de ${nPags}</span>
      <button class="btn" ${_rcHistPage>=nPags-1?'disabled':''} onclick="_rcHistSetPage(${_rcHistPage+1})">Próxima →</button>
    </div>` : '';

  const activeFilters = [
    _rcHistGrupo ? _rcHistGrupo : '',
    (_rcHistConvMin||_rcHistConvMax) ? `${_rcHistConvMin||'0'}–${_rcHistConvMax||'∞'} conv.` : '',
    _rcHistInsumo.trim() ? `insumo: ${_rcHistInsumo}` : '',
    _rcHistObs.trim() ? `observação: ${_rcHistObs}` : '',
  ].filter(Boolean).join(' · ');

  return `
  ${auditSummary}

  <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px">
    <div style="font-size:12px;color:var(--text3)">
      ${total} evento${total!==1?'s':''}${activeFilters ? ' · ' + activeFilters : ''}
    </div>
    ${_rcHistSelecionados.size ? `
      <button class="btn" style="background:var(--red);border-color:var(--red);color:#fff;font-size:11px;padding:5px 12px" onclick="_rcHistExcluirSelecionados()">Excluir selecionados (${_rcHistSelecionados.size})</button>
      <button class="btn" style="font-size:11px;padding:5px 12px" onclick="_rcHistLimparSelecao()">Limpar seleção</button>
    ` : ''}
  </div>

  <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="background:var(--bg3);border-bottom:2px solid var(--border)">
          ${selTh}
          <th style="padding:9px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Data</th>
          <th style="padding:9px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Tipo</th>
          <th style="padding:9px 12px;text-align:right;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Conv.</th>
          ${auditTh}
          <th style="padding:9px 12px;text-align:left;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Produtos consumidos</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  ${paginacao}

  <div style="margin-top:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    ${manual.length ? `<button class="btn" style="color:var(--red);border-color:var(--red)" onclick="_rcLimparManuais()">Apagar lançamentos manuais</button>` : ''}
  </div>`;
}

function _rcHistSetPage(p)           { _rcHistPage = p; _rcHistRefresh(); }
function _rcHistFiltrar(g)           { _rcHistGrupo = g; _rcHistPage = 0; _rcHistRefresh(); }
function _rcHistFiltrarInsumo(v)     { _rcHistInsumo = v; _rcHistPage = 0; _rcHistRefresh(); }
function _rcHistFiltrarConvMin(v)    { _rcHistConvMin = v; _rcHistPage = 0; _rcHistRefresh(); }
function _rcHistFiltrarConvMax(v)    { _rcHistConvMax = v; _rcHistPage = 0; _rcHistRefresh(); }
function _rcHistFiltrarObs(v)        { _rcHistObs = v; _rcHistPage = 0; _rcHistRefresh(); }
function _rcHistLimparFiltros()      { _rcHistGrupo=''; _rcHistInsumo=''; _rcHistConvMin=''; _rcHistConvMax=''; _rcHistObs=''; _rcHistPage=0; rRefConsumo(); }

function _rcHistToggleSel(id) {
  if (_rcHistSelecionados.has(id)) _rcHistSelecionados.delete(id);
  else _rcHistSelecionados.add(id);
  _rcHistRefresh();
}
function _rcHistSelecionarTodosVisiveis(ids, marcar) {
  ids.forEach(id => { if (marcar) _rcHistSelecionados.add(id); else _rcHistSelecionados.delete(id); });
  _rcHistRefresh();
}
function _rcHistLimparSelecao() { _rcHistSelecionados.clear(); _rcHistRefresh(); }

// Separa os ids selecionados em "manual" (remove do array D.rcEventos) e
// "fechamento" (não tem registro próprio — só entra na lista de excluídos,
// pra não contar mais nas estatísticas, sem tocar na festa/contrato original).
function _rcHistExcluirSelecionados() {
  const n = _rcHistSelecionados.size;
  if (!n) return;
  if (!confirm(`Excluir ${n} lançamento${n>1?'s':''} selecionado${n>1?'s':''} do histórico do Ref. Consumo?\n\nOs vindos de "fechamento" não têm a festa/contrato apagados — só param de contar nas estatísticas daqui.`)) return;
  const ids = new Set(_rcHistSelecionados);
  const manuais = _rcGetEventos();
  const idsManuais = new Set(manuais.filter(m => ids.has(m.id)).map(m => m.id));
  if (idsManuais.size) _rcSaveEventos(manuais.filter(m => !idsManuais.has(m.id)));

  const idsFechamento = [...ids].filter(id => !idsManuais.has(id));
  if (idsFechamento.length) {
    const excl = _rcGetEventosExcluidos();
    idsFechamento.forEach(id => { if (!excl.includes(id)) excl.push(id); });
    _rcSaveEventosExcluidos(excl);
  }
  _rcHistSelecionados.clear();
  _rcHistRefresh();
}

function _rcVerEvento(i) {
  const todos = [..._rcGetEventos().slice().reverse().map(e=>({...e,_fonte:'manual'})), ..._rcGetEventosDasFestas().map(e=>({...e,_fonte:'fechamento'}))];
  const e = todos[i];
  if (!e) return;
  const itens = Object.entries(e.consumo||{}).filter(([,v])=>parseFloat(v)>0)
    .sort((a,b)=>b[1]-a[1])
    .map(([k,v])=>`<span style="display:inline-block;margin:2px;padding:2px 9px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;font-size:11px"><strong>${k}</strong>: ${v}</span>`)
    .join('');
  const el = document.getElementById('rc-evt-detalhe');
  if (el) el.innerHTML = `
    <div style="margin-bottom:14px;padding:12px 16px;background:var(--bg3);border-radius:8px;border-left:3px solid #4F8EF7">
      <div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:8px">${e.cliente||'Sem nome'} · ${e.grupo} · ${e.convidados} conv.${e.convidadosContrato?` (${e.convidadosContrato} no contrato)`:''} · ${e.data}</div>
      ${e.observacao ? `<div style="font-size:11px;color:var(--text2);margin-bottom:8px">Obs.: ${e.observacao}</div>` : ''}
      <div style="line-height:1.8">${itens||'<span style="color:var(--text3)">Sem consumo registrado</span>'}</div>
      <button onclick="document.getElementById('rc-evt-detalhe').innerHTML=''" style="margin-top:8px;background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px">fechar ▲</button>
    </div>`;
}

function _rcDeleteEvento(i) {
  const todos  = [..._rcGetEventos().slice().reverse().map(e=>({...e,_fonte:'manual'})), ..._rcGetEventosDasFestas().map(e=>({...e,_fonte:'fechamento'}))];
  const e = todos[i];
  if (!e) return;
  if (e._fonte === 'manual') {
    if (!confirm('Excluir este evento?')) return;
    const manuais = _rcGetEventos();
    const idx = manuais.findIndex(m => m.id === e.id);
    if (idx >= 0) { manuais.splice(idx, 1); _rcSaveEventos(manuais); }
  } else {
    if (!confirm('Excluir este evento do histórico do Ref. Consumo?\n\nA festa/contrato original não é apagada — ele só para de contar nas estatísticas daqui.')) return;
    const excl = _rcGetEventosExcluidos();
    if (!excl.includes(e.id)) { excl.push(e.id); _rcSaveEventosExcluidos(excl); }
  }
  _rcHistRefresh();
}

function _rcLimparManuais()    { if (!confirm('Apagar todos os eventos lançados manualmente?')) return; _rcSaveEventos([]); rRefConsumo(); }
function _rcLimparImportados() { if (!confirm('Apagar toda a base importada?')) return; _rcSaveEventosImp([]); localStorage.removeItem('refConsumoMeta'); rRefConsumo(); }
function _rcLimparTudo()       { if (!confirm('Apagar TODA a base (importados + manuais)?')) return; D.rcEventos=[]; D.rcEventosImportados=[]; sv('rcEventos'); sv('rcEventosImportados'); localStorage.removeItem('refConsumoMeta'); rRefConsumo(); }


// ── VIEW: NOVO EVENTO ─────────────────────────────────────────────────────────
// Só oferece contratos "pendentes" — que ainda não viraram um lançamento
// aqui (D.rcEventos[].contratoId). Assim que ela lança o consumo de um
// contrato, ele some da lista sozinho, sobrando só quem falta lançar. O
// contrato já selecionado no formulário atual nunca some da lista embaixo
// dela, mesmo que já tenha sido usado (evita perder a seleção em edição).
function _rcContratoOptionsHTML(selecionadoId) {
  const usados = new Set(_rcGetEventos().map(e => e.contratoId).filter(Boolean));
  const contratos = (D.contratos || [])
    .filter(c => c.id === selecionadoId || !usados.has(c.id))
    .slice()
    .sort((a,b) => (b.data||'').localeCompare(a.data||''));
  const opts = contratos.map(c => {
    const dataBR = c.data ? c.data.split('-').reverse().join('/') : 's/ data';
    const label  = `${c.nome||c.nomeEvento||'(sem nome)'} — ${dataBR}${c.tipo?' — '+c.tipo:''}`;
    return `<option value="${c.id}"${selecionadoId===c.id?' selected':''}>${label}</option>`;
  }).join('');
  return `<option value="">— sem contrato / lançar manualmente —</option>${opts}`;
}

// ── Tipo de evento: segue o Cadastro → Tipos de Evento (js/tiposEvento.js) ───
// em vez da lista fixa RC_GRUPOS_CAT. A bucket usada pro cálculo de
// estatística (evt.grupo) continua normalizada por _rcNormalizarTipo (mesma
// função que já casa o histórico de festas/contratos) quando reconhecida;
// tipo/subgrupo novo que ela cadastrar e que a normalizadora não reconheça
// ainda vira bucket próprio pelo nome — nunca é descartado silenciosamente.
function _rcResolverGrupoPorTipoEventoId(id) {
  const t = (typeof buscarTipoEventoPorId === 'function') ? buscarTipoEventoPorId(id) : null;
  if (!t) return '';
  return _rcNormalizarTipo(t.nome) || (t.nome || '').toUpperCase();
}

function _rcNovoSetTipoEvento(id) {
  _rcNovoForm.tipoEventoId = id;
  _rcNovoForm.grupo = _rcResolverGrupoPorTipoEventoId(id);
  rRefConsumo();
}

function _rcNovoAplicarContrato(id) {
  const f = _rcNovoForm;
  f.contratoId = id || '';
  if (!id) { rRefConsumo(); return; }
  const c = (D.contratos || []).find(x => x.id === id);
  if (!c) { rRefConsumo(); return; }
  f.cliente = c.nome || c.nomeEvento || '';
  if (c.data) f.data = c.data;
  const grupoNorm = _rcNormalizarTipo(c.tipo);
  if (grupoNorm) {
    f.grupo = grupoNorm;
    // Tenta casar o tipo do contrato (texto livre) com um tipo cadastrado,
    // só pra manter o <select> sincronizado com o que foi aplicado.
    const lista = (typeof getTiposEvento === 'function') ? getTiposEvento() : [];
    const match = lista.find(t => _rcResolverGrupoPorTipoEventoId(t.id) === grupoNorm);
    if (match) f.tipoEventoId = match.id;
  }
  f.convidadosContrato = c.convidados || '';
  if (!f.convidados) f.convidados = c.convidados || '';
  rRefConsumo();
}

function _rcBuildNovo() {
  const f     = _rcNovoForm;
  const hoje  = new Date().toISOString().slice(0,10);
  const editando = !!f.id;

  // Só cai no primeiro tipo cadastrado por padrão pra um lançamento NOVO —
  // editando um existente sem tipo reconhecido, mantém o grupo salvo como
  // está em vez de sobrescrever silenciosamente.
  if (!f.tipoEventoId && !editando) {
    const primeiro = (typeof getTiposEvento === 'function') ? (getTiposEvento()[0] || null) : null;
    if (primeiro) { f.tipoEventoId = primeiro.id; f.grupo = _rcResolverGrupoPorTipoEventoId(primeiro.id); }
  }
  const grupoOpts = (typeof tiposEventoOptionsHtml === 'function')
    ? tiposEventoOptionsHtml(f.tipoEventoId || '')
    : '<option value="">(Cadastro de Tipos de Evento não carregado)</option>';

  const nPreench = Object.values(f.consumo||{}).filter(v=>parseFloat(v)>0).length;

  return `
<div style="padding:20px 24px;max-width:680px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <button class="btn" onclick="_rcNovoCancelar()">← Cancelar</button>
    <div style="font-size:18px;font-weight:600;color:var(--text)">${editando ? 'Editar Evento' : 'Lançar Evento'}</div>
  </div>

  <div style="margin-bottom:16px">
    <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Contrato</label>
    <select style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
      onchange="_rcNovoAplicarContrato(this.value)">${_rcContratoOptionsHTML(f.contratoId||'')}</select>
    <div style="font-size:11px;color:var(--text3);margin-top:4px">Selecionar um contrato preenche cliente, data, tipo de evento e convidados automaticamente. Só mostra contratos pendentes — some da lista assim que o lançamento é salvo.</div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
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
    <div style="grid-column:1/-1">
      <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Tipo de evento</label>
      <select style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
        onchange="_rcNovoSetTipoEvento(this.value)">${grupoOpts}</select>
      <div style="font-size:10px;color:var(--text3);margin-top:4px">Vem do Cadastro → Tipos de Evento. Falta algum? Cadastre lá primeiro.</div>
    </div>
    <div style="grid-column:1/-1">
      <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Observação</label>
      <input type="text" placeholder="ex: 11 a 15 anos" value="${f.observacao||''}"
        style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
        oninput="_rcNovoForm.observacao=this.value">
      <div style="font-size:10px;color:var(--text3);margin-top:4px">Livre — ex: faixa etária, detalhe do evento. Aparece no Histórico e pode ser usada pra filtrar.</div>
    </div>
  </div>

  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px 14px;margin-bottom:20px">
    <label style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:8px">Convidados</label>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div>
        <label style="font-size:10px;color:var(--text3);display:block;margin-bottom:5px">Convidados no contrato</label>
        <input type="number" min="0" placeholder="ex: 150" value="${f.convidadosContrato||''}"
          style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
          oninput="_rcNovoForm.convidadosContrato=this.value">
      </div>
      <div>
        <label style="font-size:10px;color:var(--text3);display:block;margin-bottom:5px">Convidados no evento (real)</label>
        <input type="number" min="1" placeholder="ex: 150" value="${f.convidados||''}"
          style="width:100%;padding:8px 10px;background:var(--bg3);border:1px solid #4F8EF7;border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box"
          oninput="_rcNovoForm.convidados=this.value">
      </div>
    </div>
    <div style="font-size:10px;color:var(--text3);margin-top:6px">"Convidados no evento" é o valor usado para calcular a taxa de consumo (min/méd/máx/sugestão).</div>
  </div>

  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:10px;flex-wrap:wrap">
    <span style="font-size:13px;font-weight:600;color:var(--text)">
      Consumo por insumo
      <span id="rc-novo-count" style="font-size:11px;color:#3DDC84;font-weight:600;margin-left:8px;${nPreench?'':'display:none'}">${nPreench} preenchido${nPreench===1?'':'s'}</span>
    </span>
    <input type="text" placeholder="Filtrar insumo..." value="${_rcNovoBev}"
      style="width:150px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"
      oninput="_rcFiltrarNovoBev(this.value)">
  </div>
  <div style="font-size:10px;color:var(--text3);margin-bottom:8px">Itens vêm do Cadastro → Insumos. Falta algum? Cadastre lá primeiro.</div>

  <div id="rc-novo-itens" style="max-height:360px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:6px 12px;background:var(--bg2)">
    ${_rcNovoItensHTML()}
  </div>

  <div style="margin-top:18px;display:flex;gap:10px;align-items:center">
    <button class="btn" style="background:#3DDC84;border-color:#3DDC84;color:#000;font-weight:600;padding:10px 24px" onclick="_rcSalvarEvento()">${editando ? 'Salvar alterações' : 'Salvar evento'}</button>
    <button class="btn" onclick="_rcNovoCancelar()">Cancelar</button>
    <span id="rc-novo-status" style="font-size:12px;color:var(--text3)"></span>
  </div>
</div>`;
}

// Monta só a lista de insumos (categorias + linhas), pra poder ser atualizada
// sozinha (#rc-novo-itens) sem redesenhar o formulário inteiro — evitar que
// o campo de busca/quantidade perca o foco a cada tecla digitada.
function _rcNovoItensHTML() {
  const f = _rcNovoForm;
  const insumos = _rcGetInsumosConsumo();
  const fil     = (_rcNovoBev||'').toLowerCase().trim();

  // Ordem de categoria vem do Cadastro de Categorias; qualquer categoria de
  // insumo que não esteja lá (nome divergente/órfão) ainda aparece no fim,
  // nunca escondida.
  const ordemCats = (typeof getCategorias === 'function') ? getCategorias().slice() : [];
  const ordemSet   = new Set(ordemCats);
  const porCat     = {};
  insumos.forEach(i => {
    const nome  = i.nome;
    const temQtd = f.consumo && parseFloat(f.consumo[nome]) > 0;
    // Sem busca ativa: só mostra o que já tem quantidade lançada (evita
    // rolar centenas de insumos do Cadastro à toa). Com busca, mostra tudo
    // que bate, tenha quantidade ou não — é assim que ela adiciona um novo.
    if (fil) {
      if (!(nome||'').toLowerCase().includes(fil)) return;
    } else if (!temQtd) {
      return;
    }
    const cat = i.categoria || 'OUTROS';
    if (!ordemSet.has(cat)) { ordemSet.add(cat); ordemCats.push(cat); }
    (porCat[cat] || (porCat[cat]=[])).push(nome);
  });

  const bevBlocks = ordemCats.map(cat => {
    const itens = porCat[cat] || [];
    if (!itens.length) return '';
    const rows = itens.map(b => {
      const val = (f.consumo&&f.consumo[b]) ? f.consumo[b] : '';
      const temVal = val && parseFloat(val) > 0;
      return `<div style="display:flex;align-items:center;gap:8px;padding:5px 2px;border-bottom:1px solid var(--border)">
        <span style="flex:1;font-size:12px;color:${temVal?'var(--text)':'var(--text2)'}">${b}</span>
        <input type="number" min="0" step="0.5" placeholder="0" value="${val}"
          style="width:80px;padding:5px 8px;background:var(--bg3);border:1px solid ${temVal?'#4F8EF7':'var(--border)'};border-radius:6px;color:var(--text);font-size:13px;text-align:right"
          oninput="_rcNovoSetBev('${b.replace(/'/g,"\\'")}',this)">
        <span style="font-size:10px;color:var(--text3);width:32px">garr.</span>
      </div>`;
    }).join('');
    return `<div style="margin-bottom:4px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;padding:8px 2px 4px">${cat}</div>
      ${rows}
    </div>`;
  }).join('');

  const vazio = fil
    ? 'Nenhum insumo encontrado no Cadastro com esse nome.'
    : 'Nenhum item lançado ainda. Digite acima pra buscar e adicionar um insumo.';
  return bevBlocks || `<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px">${vazio}</div>`;
}

// Recebe o <input> em si (não só o valor) pra poder ajustar seu próprio
// estilo direto, sem precisar redesenhar a lista inteira a cada tecla.
function _rcNovoSetBev(bev, inputEl) {
  const val = inputEl.value;
  if (!_rcNovoForm.consumo) _rcNovoForm.consumo = {};
  _rcNovoForm.consumo[bev] = parseFloat(val) || 0;
  const temVal = parseFloat(val) > 0;
  inputEl.style.borderColor = temVal ? '#4F8EF7' : 'var(--border)';
  const label = inputEl.previousElementSibling;
  if (label) label.style.color = temVal ? 'var(--text)' : 'var(--text2)';

  const n = Object.values(_rcNovoForm.consumo||{}).filter(v=>parseFloat(v)>0).length;
  const badge = document.getElementById('rc-novo-count');
  if (badge) {
    badge.textContent = n ? `${n} preenchido${n===1?'':'s'}` : '';
    badge.style.display = n ? '' : 'none';
  }
}

function _rcFiltrarNovoBev(v) {
  _rcNovoBev = v;
  const cont = document.getElementById('rc-novo-itens');
  if (cont) cont.innerHTML = _rcNovoItensHTML();
}

function _rcSalvarEvento() {
  const f = _rcNovoForm;
  if (!f.grupo)                              { _rcNovoStatus('Selecione o tipo de evento.', true); return; }
  if (!f.convidados || parseFloat(f.convidados)<=0) { _rcNovoStatus('Informe o número de convidados.', true); return; }
  const consumo = {};
  Object.entries(f.consumo||{}).forEach(([k,v])=>{ if(parseFloat(v)>0) consumo[k]=parseFloat(v); });
  if (!Object.keys(consumo).length)          { _rcNovoStatus('Informe ao menos um insumo.', true); return; }

  const dadosEvento = {
    data:f.data||new Date().toISOString().slice(0,10),
    cliente:f.cliente||'',
    contratoId:f.contratoId||'',
    grupo:(f.grupo||'').toUpperCase(),
    observacao:(f.observacao||'').trim(),
    convidados:parseFloat(f.convidados),
    convidadosContrato:f.convidadosContrato ? parseFloat(f.convidadosContrato) : null,
    consumo,
  };

  const evts = _rcGetEventos();
  const editando = !!f.id;
  if (editando) {
    const idx = evts.findIndex(e => e.id === f.id);
    if (idx >= 0) evts[idx] = { ...evts[idx], ...dadosEvento };
    else evts.push({ id:f.id, ...dadosEvento });
  } else {
    evts.push({ id:_gerarId('RC'), ...dadosEvento });
  }
  _rcSaveEventos(evts);
  // Garante que o tipo lançado fique visível de cara na Tabela comparativa,
  // mesmo que seja um grupo novo (não estava marcado antes).
  if (!_rcGruposVisiveis.includes(dadosEvento.grupo)) _rcGruposVisiveis.push(dadosEvento.grupo);
  _rcNovoForm = { data:'', cliente:'', contratoId:'', tipoEventoId:'', grupo:'', observacao:'', convidados:'', convidadosContrato:'', consumo:{} };
  _rcNovoBev  = '';
  _rcSetView(editando ? 'eventos' : 'tabela');
}

// Descarta a edição/lançamento em andamento e volta pra onde fazia sentido:
// Histórico se estava editando um evento existente, Tabela se era um novo.
function _rcNovoCancelar() {
  const destino = _rcNovoForm.id ? 'eventos' : 'tabela';
  _rcNovoForm = { data:'', cliente:'', contratoId:'', tipoEventoId:'', grupo:'', observacao:'', convidados:'', convidadosContrato:'', consumo:{} };
  _rcNovoBev  = '';
  _rcSetView(destino);
}

// Carrega um evento manual já salvo no formulário de Lançar Evento pra
// edição. Eventos de fechamento não têm registro próprio (ver
// _rcGetEventosDasFestas) — não dá pra editar, só excluir.
function _rcEditarEvento(i) {
  const todos = [..._rcGetEventos().slice().reverse().map(e=>({...e,_fonte:'manual'})), ..._rcGetEventosDasFestas().map(e=>({...e,_fonte:'fechamento'}))];
  const e = todos[i];
  if (!e || e._fonte !== 'manual') return;

  const grupoUp = (e.grupo||'').toUpperCase();
  const lista   = (typeof getTiposEvento === 'function') ? getTiposEvento() : [];
  const match   = lista.find(t => _rcResolverGrupoPorTipoEventoId(t.id) === grupoUp);

  _rcNovoForm = {
    id: e.id,
    data: e.data || '',
    cliente: e.cliente || '',
    contratoId: e.contratoId || '',
    tipoEventoId: match ? match.id : '',
    grupo: e.grupo || '',
    observacao: e.observacao || '',
    convidados: e.convidados || '',
    convidadosContrato: e.convidadosContrato || '',
    consumo: { ...(e.consumo||{}) },
  };
  _rcNovoBev = '';
  _rcSetView('novo');
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
function _rcGrupoLabel(g) {
  const ico   = {'CASAMENTO':'💍','CASAMENTO CIVIL':'💍','NOIVADO':'💐','ANIVERSÁRIO':'🎂','CORPORATIVO':'🏢','CONFRATERNIZAÇÃO':'🥂','FORMATURA':'🎓','ALMOÇO':'🍽️'};
  const label = {'CASAMENTO':'Casamento','CASAMENTO CIVIL':'Casamento Civil','NOIVADO':'Noivado','ANIVERSÁRIO':'Aniversário','ANIVERSÁRIO 15 ANOS':'15 anos','ANIVERSÁRIO 18 ANOS':'18 anos','ANIVERSÁRIO 30-50 ANOS':'30–50 anos','ANIVERSÁRIO 51-90 ANOS':'51–90 anos','CORPORATIVO':'Corporativo','CONFRATERNIZAÇÃO':'Confraternização','FORMATURA':'Formatura','ALMOÇO':'Almoço'};
  const i = ico[g] ? ico[g] + ' ' : '';
  return i + (label[g] || g.charAt(0)+g.slice(1).toLowerCase());
}
function _rcSetView(v)   { _rcView=v; rRefConsumo(); }
function _rcSetGrupo(g)  { _rcGrupo=g; rRefConsumo(); }
function _rcToggleGrupo(g) {
  const i = _rcGruposVisiveis.indexOf(g);
  if (i >= 0) { if (_rcGruposVisiveis.length > 1) _rcGruposVisiveis.splice(i, 1); }
  else { _rcGruposVisiveis.push(g); }
  rRefConsumo();
}
function _rcSetPax(v)    { _rcPax=parseFloat(v)||100; const tb=document.getElementById('rc-cmp-tbody'); if(tb) tb.innerHTML=_rcBuildComparativaRows(); }
function _rcSetFiltro(v) { _rcFiltro=v; const tb=document.getElementById('rc-cmp-tbody'); if(tb) tb.innerHTML=_rcBuildComparativaRows(); }
