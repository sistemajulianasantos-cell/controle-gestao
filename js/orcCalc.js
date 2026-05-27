// ─── CALCULADORA DE ORÇAMENTO ─────────────────────────────────────────────────

var CALC_LOCAIS = {
  area_central:  { label:'Área Central BH',         bt:320, bb:320, hb:230, cd:230, cp:230, la:35, rf:35, ca:400  },
  jardim_canada: { label:'Jardim Canadá / C.Nova',  bt:320, bb:320, hb:250, cd:250, cp:250, la:35, rf:35, ca:600  },
  reg_metro:     { label:'Região Metropolitana',    bt:320, bb:320, hb:260, cd:260, cp:260, la:35, rf:35, ca:800  },
  viagem_60:     { label:'Viagem até 60 km',        bt:320, bb:320, hb:270, cd:270, cp:270, la:20, rf:45, ca:1500 },
  viagem_100:    { label:'Viagem até 100 km',       bt:320, bb:320, hb:350, cd:350, cp:350, la:35, rf:45, ca:2500 },
  viagem_200:    { label:'Viagem até 200 km',       bt:320, bb:320, hb:450, cd:450, cp:450, la:35, rf:45, ca:4500 },
  viagem_300:    { label:'Viagem até 300 km',       bt:320, bb:320, hb:500, cd:500, cp:500, la:45, rf:45, ca:6500 },
};

var CALC_COND  = { padrao:1.0417, simples:0.63 };
var CALC_DESC  = 0.6417;
var CALC_CI    = { normal:3.4417, reduzido:2.53 };
var CALC_PERDA = { reduzida:0.42, padrao:0.60, alta:0.85 };
var CALC_SEG   = { casamento:1.67, '15anos':1.67, formatura:3.30, outros:2.20 };
var CALC_VAS   = { simples:133.33, padrao:191.67, complexo:241.67 };

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function _calcGetOrc() {
  return (D.orcamentos || []).find(o => o.id === orcAtualId);
}

function _calcAutoStaff(pax) {
  return {
    bt: Math.max(1, Math.ceil(pax / 50)),
    bb: Math.max(1, Math.ceil(pax / 100)),
    hb: pax > 500  ? 1 : 0,
    cd: pax > 1000 ? 1 : 0,
  };
}

function _mk(id, secao, nome, qtd, preco) {
  return {
    id, secao, nome,
    qtd:   Math.round(qtd   * 10000) / 10000,
    preco: Math.round(preco * 10000) / 10000,
    total: Math.round(qtd   * preco  * 100)   / 100,
    auto: true
  };
}

// ─── RECALCULAR AUTOMÁTICOS ───────────────────────────────────────────────────

function recalcularAutos() {
  const orc = _calcGetOrc();
  if (!orc) return;

  const p    = orc.calcParams || {};
  const pax  = orc.convidados || 0;
  const loc  = CALC_LOCAIS[p.local || 'area_central'];
  const autoS = _calcAutoStaff(pax);

  const qt = {
    bt: p.bartender != null ? Number(p.bartender) : autoS.bt,
    bb: p.barback   != null ? Number(p.barback)   : autoS.bb,
    hb: p.head      != null ? Number(p.head)      : autoS.hb,
    cd: p.coord     != null ? Number(p.coord)     : autoS.cd,
    cp: p.copeiro   != null ? Number(p.copeiro)   : 0,
  };
  const eqTotal = qt.bt + qt.bb + qt.hb + qt.cd + qt.cp;

  const cfCond  = p.cfCond    || 'padrao';
  const cfCI    = p.cfCI      || 'normal';
  const cfPerda = p.cfPerda   || 'padrao';
  const cfVas   = p.cfVas     || 'padrao';
  const tipoEvt = p.tipoEvento|| 'outros';

  const autos = [
    _mk('auto-bt',   'equipe',    'Bartender',           qt.bt,    loc.bt),
    _mk('auto-bb',   'equipe',    'Bar Back',            qt.bb,    loc.bb),
    _mk('auto-hb',   'equipe',    'Head Bartender',      qt.hb,    loc.hb),
    _mk('auto-cd',   'equipe',    'Coordenador',         qt.cd,    loc.cd),
    _mk('auto-cp',   'equipe',    'Copeiro',             qt.cp,    loc.cp),
    _mk('auto-ca',   'logistica', 'Carregamento',        1,        loc.ca),
    _mk('auto-rf',   'logistica', 'Refrigério equipe',   eqTotal,  loc.rf),
    _mk('auto-la',   'logistica', 'Limpeza equipe',      eqTotal,  loc.la),
    _mk('auto-cond', 'custos',    'Condicional',         pax,      CALC_COND[cfCond]),
    _mk('auto-desc', 'custos',    'Descartáveis',        pax,      CALC_DESC),
    _mk('auto-ci',   'custos',    'Cobertura de insumos',pax,      CALC_CI[cfCI]),
    _mk('auto-perd', 'custos',    'Previsão de perda',   pax,      CALC_PERDA[cfPerda]),
    _mk('auto-seg',  'seguro',    'Seguro',              pax,      CALC_SEG[tipoEvt]),
    _mk('auto-vas',  'copos',     'Vasilhames',          1,        CALC_VAS[cfVas]),
  ].filter(i => i.qtd > 0);

  const manuais = (orc.calcItens || []).filter(i => !i.auto);
  orc.calcItens = [...autos, ...manuais];
  sv('orcamentos');
  rOrcCalc();
}

// ─── PARÂMETROS ───────────────────────────────────────────────────────────────

function calcSetParam(chave, valor) {
  const orc = _calcGetOrc();
  if (!orc) return;
  if (!orc.calcParams) orc.calcParams = {};
  orc.calcParams[chave] = valor;
  sv('orcamentos');
  const triggerRecalc = ['local','tipoEvento','cfCond','cfCI','cfPerda','cfVas'];
  if (triggerRecalc.includes(chave)) recalcularAutos();
  else rOrcCalc();
}

// ─── ITENS ────────────────────────────────────────────────────────────────────

function calcUpdateItem(itemId, campo, valor) {
  const orc = _calcGetOrc();
  if (!orc) return;
  const item = (orc.calcItens || []).find(i => i.id === itemId);
  if (!item) return;
  item[campo] = parseFloat(valor) || 0;
  item.total  = Math.round(item.qtd * item.preco * 100) / 100;
  sv('orcamentos');
  rOrcCalc();
}

function calcRemoveItem(itemId) {
  const orc = _calcGetOrc();
  if (!orc) return;
  orc.calcItens = (orc.calcItens || []).filter(i => i.id !== itemId);
  sv('orcamentos');
  rOrcCalc();
}

function calcAddItemPrompt(secao) {
  const nome = prompt('Nome do item:');
  if (!nome || !nome.trim()) return;
  const preco = parseFloat(prompt('Preço unitário (R$):') || '0') || 0;
  const qtd   = parseFloat(prompt('Quantidade:') || '1') || 1;
  const orc = _calcGetOrc();
  if (!orc) return;
  if (!orc.calcItens) orc.calcItens = [];
  orc.calcItens.push({
    id: 'ci-' + Date.now() + Math.random().toString(36).slice(2, 5),
    secao, nome: nome.trim(),
    qtd, preco,
    total: Math.round(qtd * preco * 100) / 100,
    auto: false
  });
  sv('orcamentos');
  rOrcCalc();
}

// ─── CARDÁPIO (BEBIDAS) ───────────────────────────────────────────────────────

function calcAddCardapioItem() {
  const fichaId = document.getElementById('card-ficha')?.value || '';
  const nomeInput = document.getElementById('card-nome')?.value?.trim();
  const doses  = parseFloat(document.getElementById('card-doses')?.value) || 0;
  const custo  = parseFloat(document.getElementById('card-custo')?.value) || 0;

  // Nome: usa o da ficha se selecionado, senão o campo livre
  const ficha = (D.fichas || []).find(f => f.id === fichaId);
  const nome = ficha ? ficha.nome : nomeInput;
  if (!nome) { alert2('Informe o nome do coquetel', 'error'); return; }
  if (!doses) { alert2('Informe as doses por pessoa', 'error'); return; }

  const orc = _calcGetOrc();
  if (!orc) return;
  if (!orc.cardapio) orc.cardapio = [];

  orc.cardapio.push({
    id: 'cd-' + Date.now() + Math.random().toString(36).slice(2, 4),
    nome,
    fichaId: ficha ? ficha.id : '',
    dosesPorPessoa: doses,
    custoPorDose: custo,
  });
  sv('orcamentos');
  rOrcCalc();
}

function calcUpdateCardapio(itemId, campo, valor) {
  const orc = _calcGetOrc();
  if (!orc) return;
  const item = (orc.cardapio || []).find(i => i.id === itemId);
  if (!item) return;
  item[campo] = parseFloat(valor) || 0;
  sv('orcamentos');
  rOrcCalc();
}

function calcRemoveCardapio(itemId) {
  const orc = _calcGetOrc();
  if (!orc) return;
  orc.cardapio = (orc.cardapio || []).filter(i => i.id !== itemId);
  sv('orcamentos');
  rOrcCalc();
}

// Retorna os ingredientes de uma ficha como string de tags
function _calcFichaIngredientes(fichaId) {
  if (!fichaId) return '';
  const f = (D.fichas || []).find(f => f.id === fichaId);
  if (!f || !f.itens || !f.itens.length) return '';
  return f.itens.map(i => i.nome).join(', ');
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

function rOrcCalc() {
  const orc = _calcGetOrc();
  const el  = document.getElementById('orc-det-content');
  if (!el || !orc) return;

  const p    = orc.calcParams || {};
  const pax  = orc.convidados || 0;
  const autoS = _calcAutoStaff(pax);
  const itens = orc.calcItens || [];
  const cardapio = orc.cardapio || [];

  // Custo do cardápio = soma de (doses/pessoa × pax × custo/dose)
  const custoCardapio = cardapio.reduce((s, c) => {
    const totalDoses = (c.dosesPorPessoa || 0) * pax;
    return s + Math.round(totalDoses * (c.custoPorDose || 0) * 100) / 100;
  }, 0);

  const custoPresente = itens.reduce((s, i) => s + (i.total || 0), 0) + custoCardapio;
  const margSeg = Number(p.margemSeguranca != null ? p.margemSeguranca : 10);
  const margLuc = Number(p.margemLucro     != null ? p.margemLucro     : 30);
  const custoEst  = custoPresente * (1 + margSeg / 100);
  const valorTotal = custoEst  * (1 + margLuc / 100);
  const porPessoa  = pax > 0 ? valorTotal / pax : 0;

  const localKey = p.local || 'area_central';

  const secoes = [
    { id:'equipe',    label:'👥 Equipe',             cor:'#4F8EF7' },
    { id:'logistica', label:'🚚 Logística',           cor:'#F7A84F' },
    { id:'custos',    label:'💸 Custos variáveis',    cor:'#8B5CF6' },
    { id:'seguro',    label:'🛡️ Seguro',              cor:'#EC4899' },
    { id:'copos',     label:'🥂 Vasilhames',          cor:'#14B8A6' },
    { id:'extras',    label:'➕ Extras',               cor:'#94A3B8' },
  ];

  // ── Parâmetros ──────────────────────────────────────────────────────────────
  const paramHtml = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">⚙️ Parâmetros do evento</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-bottom:12px">

        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Local</label>
          <select onchange="calcSetParam('local',this.value)" style="width:100%;font-size:12px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
            ${Object.entries(CALC_LOCAIS).map(([k,v])=>`<option value="${k}"${k===localKey?' selected':''}>${v.label}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Tipo de evento</label>
          <select onchange="calcSetParam('tipoEvento',this.value)" style="width:100%;font-size:12px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
            ${[['casamento','Casamento'],['15anos','15 Anos'],['formatura','Formatura'],['outros','Outros']].map(([k,l])=>`<option value="${k}"${(p.tipoEvento||'outros')===k?' selected':''}>${l}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Complexidade</label>
          <select onchange="calcSetParam('cfVas',this.value)" style="width:100%;font-size:12px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
            ${[['simples','Simples'],['padrao','Padrão'],['complexo','Complexo']].map(([k,l])=>`<option value="${k}"${(p.cfVas||'padrao')===k?' selected':''}>${l}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Condicional</label>
          <select onchange="calcSetParam('cfCond',this.value)" style="width:100%;font-size:12px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
            ${[['padrao','Padrão'],['simples','Simples']].map(([k,l])=>`<option value="${k}"${(p.cfCond||'padrao')===k?' selected':''}>${l}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Insumos</label>
          <select onchange="calcSetParam('cfCI',this.value)" style="width:100%;font-size:12px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
            ${[['normal','Normal'],['reduzido','Reduzido']].map(([k,l])=>`<option value="${k}"${(p.cfCI||'normal')===k?' selected':''}>${l}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Previsão de perda</label>
          <select onchange="calcSetParam('cfPerda',this.value)" style="width:100%;font-size:12px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
            ${[['reduzida','Reduzida'],['padrao','Padrão'],['alta','Alta']].map(([k,l])=>`<option value="${k}"${(p.cfPerda||'padrao')===k?' selected':''}>${l}</option>`).join('')}
          </select>
        </div>

      </div>

      <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:12px">
        <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:10px">
          👥 Equipe — sugestão automática para ${pax} pax:
          ${autoS.bt} bartender · ${autoS.bb} bar back${autoS.hb?' · 1 head BT':''}${autoS.cd?' · 1 coord':''}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px">
          ${[
            ['Bartender',     'bartender', autoS.bt],
            ['Bar Back',      'barback',   autoS.bb],
            ['Head Bartender','head',      autoS.hb],
            ['Coordenador',   'coord',     autoS.cd],
            ['Copeiro',       'copeiro',   0],
          ].map(([label, key, def]) => `
            <div>
              <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">${label}</label>
              <input type="number" min="0" step="1" placeholder="${def}"
                value="${p[key] != null ? p[key] : ''}"
                onchange="calcSetParam('${key}', this.value===''?null:Number(this.value))"
                style="width:100%;font-size:13px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius);font-family:var(--mono)">
            </div>`).join('')}
        </div>
      </div>

      <div style="border-top:1px solid var(--border);padding-top:12px;display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">
        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Margem segurança %</label>
          <input type="number" min="0" max="100" step="1" value="${margSeg}"
            onchange="calcSetParam('margemSeguranca', Number(this.value))"
            style="width:100px;font-size:13px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--amber);border-radius:var(--radius);font-family:var(--mono)">
        </div>
        <div>
          <label style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;display:block;margin-bottom:3px">Margem lucro %</label>
          <input type="number" min="0" max="500" step="1" value="${margLuc}"
            onchange="calcSetParam('margemLucro', Number(this.value))"
            style="width:100px;font-size:13px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--green);border-radius:var(--radius);font-family:var(--mono)">
        </div>
        <button onclick="recalcularAutos()" class="btn btn-primary" style="padding:8px 20px">⚡ Recalcular automáticos</button>
      </div>
    </div>`;

  // ── Seções + Resumo ─────────────────────────────────────────────────────────
  const secoesHtml = secoes.map(sec => {
    const sItens = itens.filter(i => i.secao === sec.id);
    const sTotal = sItens.reduce((s, i) => s + (i.total || 0), 0);
    return `
      <div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid ${sec.cor};border-radius:var(--radius);margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;${sItens.length ? 'border-bottom:1px solid var(--border)' : ''}">
          <span style="font-size:12px;font-weight:700;color:${sec.cor}">${sec.label}</span>
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:13px;font-weight:700;font-family:var(--mono);color:${sec.cor}">${fR(sTotal)}</span>
            <button onclick="calcAddItemPrompt('${sec.id}')"
              style="background:transparent;border:1px solid ${sec.cor};color:${sec.cor};border-radius:var(--radius);font-size:10px;padding:3px 8px;cursor:pointer">+ item</button>
          </div>
        </div>
        ${sItens.length ? `
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <tbody>
              ${sItens.map(item => `
                <tr style="border-bottom:1px solid var(--border)">
                  <td style="padding:6px 10px;color:var(--text);font-weight:500">
                    ${item.nome}
                    ${item.auto ? `<span style="font-size:9px;color:var(--text3);font-weight:400;margin-left:4px">auto</span>` : ''}
                  </td>
                  <td style="padding:4px 6px;text-align:right">
                    <input type="number" value="${item.qtd}" min="0" step="0.01"
                      onchange="calcUpdateItem('${item.id}','qtd',this.value)"
                      style="width:60px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
                  </td>
                  <td style="padding:4px 6px;text-align:right">
                    <input type="number" value="${Number(item.preco).toFixed(4)}" min="0" step="0.01"
                      onchange="calcUpdateItem('${item.id}','preco',this.value)"
                      style="width:85px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
                  </td>
                  <td style="padding:6px 8px;text-align:right;font-family:var(--mono);font-weight:700;color:${sec.cor};white-space:nowrap">${fR(item.total || 0)}</td>
                  <td style="padding:6px 8px;text-align:center;width:28px">
                    <span onclick="calcRemoveItem('${item.id}')" style="cursor:pointer;color:var(--red);font-size:15px;line-height:1" title="Remover">×</span>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>` : `
          <div style="padding:12px 14px;font-size:11px;color:var(--text3)">Nenhum item — clique em "+ item" para adicionar.</div>`}
      </div>`;
  }).join('');

  const resumoHtml = `
    <div style="position:sticky;top:16px">
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:10px">
        <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px">💰 Resumo</div>

        <div style="margin-bottom:10px">
          <div style="font-size:10px;color:var(--text3);margin-bottom:2px">Custo Presente</div>
          <div style="font-size:20px;font-weight:700;font-family:var(--mono);color:var(--text)">${fR(custoPresente)}</div>
        </div>

        <div style="padding:8px 10px;background:rgba(247,168,79,.1);border:1px solid rgba(247,168,79,.3);border-radius:6px;margin-bottom:10px">
          <div style="font-size:10px;color:var(--amber);margin-bottom:2px">+ Margem segurança (${margSeg}%)</div>
          <div style="font-size:14px;font-family:var(--mono);color:var(--amber);font-weight:600">+ ${fR(custoEst - custoPresente)}</div>
        </div>

        <div style="margin-bottom:10px">
          <div style="font-size:10px;color:var(--text3);margin-bottom:2px">Custo Estimado</div>
          <div style="font-size:16px;font-weight:700;font-family:var(--mono);color:var(--text)">${fR(custoEst)}</div>
        </div>

        <div style="padding:8px 10px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:6px;margin-bottom:12px">
          <div style="font-size:10px;color:var(--green);margin-bottom:2px">+ Margem lucro (${margLuc}%)</div>
          <div style="font-size:14px;font-family:var(--mono);color:var(--green);font-weight:600">+ ${fR(valorTotal - custoEst)}</div>
        </div>

        <div style="border-top:2px solid var(--border2);padding-top:12px;margin-bottom:${pax > 0 ? '12' : '0'}px">
          <div style="font-size:10px;color:var(--text3);margin-bottom:2px">Valor Total do Orçamento</div>
          <div style="font-size:24px;font-weight:800;font-family:var(--mono);color:var(--green)">${fR(valorTotal)}</div>
        </div>

        ${pax > 0 ? `
          <div style="background:rgba(79,142,247,.1);border:1px solid rgba(79,142,247,.3);border-radius:6px;padding:10px;text-align:center">
            <div style="font-size:10px;color:#4F8EF7;margin-bottom:2px">${pax} convidados · Por pessoa</div>
            <div style="font-size:18px;font-weight:700;font-family:var(--mono);color:#4F8EF7">${fR(porPessoa)}</div>
          </div>` : ''}
      </div>

      ${custoPresente > 0 ? `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px">
        <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:10px">Breakdown</div>
        ${secoes.map(sec => {
          const t = itens.filter(i => i.secao === sec.id).reduce((s, i) => s + (i.total || 0), 0);
          if (!t) return '';
          const pct = Math.min(100, Math.round(t / custoPresente * 100));
          return `
            <div style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:10px;color:${sec.cor}">${sec.label.replace(/^\S+\s/, '')}</span>
                <span style="font-size:10px;font-family:var(--mono);color:var(--text3)">${fR(t)} · ${pct}%</span>
              </div>
              <div style="height:4px;background:var(--bg3);border-radius:2px">
                <div style="width:${pct}%;height:4px;background:${sec.cor};border-radius:2px"></div>
              </div>
            </div>`;
        }).join('')}
        ${custoCardapio > 0 ? (() => {
          const pct = Math.min(100, Math.round(custoCardapio / custoPresente * 100));
          return `
            <div style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:10px;color:#F97316">Cardápio (bebidas)</span>
                <span style="font-size:10px;font-family:var(--mono);color:var(--text3)">${fR(custoCardapio)} · ${pct}%</span>
              </div>
              <div style="height:4px;background:var(--bg3);border-radius:2px">
                <div style="width:${pct}%;height:4px;background:#F97316;border-radius:2px"></div>
              </div>
            </div>`;
        })() : ''}
      </div>` : ''}
    </div>`;

  // ── Cardápio HTML ────────────────────────────────────────────────────────────
  const fichasOpts = (D.fichas || []).map(f =>
    `<option value="${f.id}">${f.nome}</option>`
  ).join('');

  const cardapioHtml = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid #F97316;border-radius:var(--radius);margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border)">
        <span style="font-size:12px;font-weight:700;color:#F97316">🍹 Cardápio / Bebidas</span>
        <span style="font-size:13px;font-weight:700;font-family:var(--mono);color:#F97316">${fR(custoCardapio)}</span>
      </div>

      ${cardapio.length ? `
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="font-size:9px;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border)">
              <th style="padding:5px 10px;text-align:left;font-weight:500">Coquetel</th>
              <th style="padding:5px 6px;text-align:right;font-weight:500">Doses/pax</th>
              <th style="padding:5px 6px;text-align:right;font-weight:500">Total doses</th>
              <th style="padding:5px 6px;text-align:right;font-weight:500">Custo/dose</th>
              <th style="padding:5px 6px;text-align:right;font-weight:500">Total</th>
              <th style="width:28px"></th>
            </tr>
          </thead>
          <tbody>
            ${cardapio.map(c => {
              const totalDoses = Math.round((c.dosesPorPessoa || 0) * pax * 10) / 10;
              const total = Math.round(totalDoses * (c.custoPorDose || 0) * 100) / 100;
              const ingredientes = _calcFichaIngredientes(c.fichaId);
              return `
                <tr style="border-bottom:1px solid var(--border)">
                  <td style="padding:6px 10px">
                    <div style="font-weight:500;color:var(--text)">${c.nome}</div>
                    ${ingredientes ? `<div style="font-size:9px;color:var(--text3);margin-top:2px" title="${ingredientes}">
                      ${ingredientes.split(', ').slice(0,4).map(i=>`<span style="background:var(--bg3);border:1px solid var(--border);border-radius:3px;padding:1px 4px;margin-right:2px">${i}</span>`).join('')}
                      ${ingredientes.split(', ').length > 4 ? `<span style="color:var(--text3)">+${ingredientes.split(', ').length-4}</span>` : ''}
                    </div>` : ''}
                  </td>
                  <td style="padding:4px 6px;text-align:right">
                    <input type="number" value="${c.dosesPorPessoa}" min="0" step="0.5"
                      onchange="calcUpdateCardapio('${c.id}','dosesPorPessoa',this.value)"
                      style="width:55px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
                  </td>
                  <td style="padding:6px 6px;text-align:right;font-family:var(--mono);color:var(--text3)">${totalDoses}</td>
                  <td style="padding:4px 6px;text-align:right">
                    <input type="number" value="${c.custoPorDose || ''}" min="0" step="0.5" placeholder="0,00"
                      onchange="calcUpdateCardapio('${c.id}','custoPorDose',this.value)"
                      style="width:70px;text-align:right;font-size:12px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:var(--mono)">
                  </td>
                  <td style="padding:6px 8px;text-align:right;font-family:var(--mono);font-weight:700;color:#F97316">${fR(total)}</td>
                  <td style="padding:6px 8px;text-align:center">
                    <span onclick="calcRemoveCardapio('${c.id}')" style="cursor:pointer;color:var(--red);font-size:15px;line-height:1" title="Remover">×</span>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>` : ''}

      <!-- Formulário inline para adicionar -->
      <div style="padding:10px 14px;border-top:${cardapio.length?'1px solid var(--border)':'none'};background:var(--bg3);border-radius:0 0 var(--radius) var(--radius)">
        <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;margin-bottom:8px">+ Adicionar coquetel ao cardápio</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 110px 110px auto;gap:8px;align-items:flex-end">
          <div>
            <label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">Ficha cadastrada</label>
            <select id="card-ficha" onchange="
              const f=(D.fichas||[]).find(x=>x.id===this.value);
              const n=document.getElementById('card-nome');
              if(n&&f)n.value=f.nome;
            " style="width:100%;font-size:11px;padding:5px 7px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
              <option value="">— Selecionar ficha —</option>
              ${fichasOpts}
            </select>
          </div>
          <div>
            <label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">Nome (ou livre)</label>
            <input id="card-nome" type="text" placeholder="Ex: Moscow Mule"
              style="width:100%;font-size:11px;padding:5px 7px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
          </div>
          <div>
            <label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">Doses/pessoa</label>
            <input id="card-doses" type="number" min="0" step="0.5" placeholder="1.5"
              style="width:100%;font-size:11px;padding:5px 7px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius);font-family:var(--mono)">
          </div>
          <div>
            <label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">Custo/dose (R$)</label>
            <input id="card-custo" type="number" min="0" step="0.5" placeholder="0,00"
              style="width:100%;font-size:11px;padding:5px 7px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius);font-family:var(--mono)">
          </div>
          <button onclick="calcAddCardapioItem()"
            style="background:#F97316;border:none;color:white;border-radius:var(--radius);font-size:11px;padding:6px 14px;cursor:pointer;white-space:nowrap;font-weight:600">+ Adicionar</button>
        </div>
      </div>
    </div>`;

  el.innerHTML = paramHtml + `
    <div style="display:grid;grid-template-columns:1fr 270px;gap:14px;align-items:start">
      <div>${cardapioHtml}${secoesHtml}</div>
      ${resumoHtml}
    </div>`;
}
