// ─── PRODUÇÃO ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════

function setProdView(v) {
  ['lista','nova'].forEach(k => {
    const el = document.getElementById('prodview-' + k);
    if (el) el.style.display = v === k ? '' : 'none';
  });
  if (v === 'lista') rProducoes();
  if (v === 'nova')  rFormProducao();
}

function parsearTextoProducao(txt) {
  const get = (label) => {
    const re = new RegExp(label + '[:\\s*]+([^\\n]+)', 'i');
    const m = txt.match(re);
    return m ? m[1].replace(/\*+/g,'').trim() : '';
  };
  const cardRe = /CARD[ÁA]PIO[\s\S]*?(?=\nBEBIDAS|\nRODADAS|\nWHISKERIA|\nOBS:|$)/i;
  const cardM = txt.match(cardRe);
  const cardapio = cardM ? cardM[0].replace(/CARD[ÁA]PIO[\s*:]*/i,'').replace(/\*+/g,'').trim() : '';
  const consRe = /BEBIDAS[\s]+CONSIGNADA[S]?[\s\S]*?(?=\nBEBIDAS[\s]+CLIENTE|\nBEBIDAS[\s]+ROMERO|\nCARD|\n[A-Z]{4,}:|$)/i;
  const consM = txt.match(consRe);
  const bebidasConsignadas = consM ? consM[0].replace(/BEBIDAS[\s]+CONSIGNADA[S]?[\s*:]*/i,'').replace(/\*+/g,'').trim() : '';
  const cliRe = /BEBIDAS[\s]+CLIENTE[\s\S]*?(?=\nBEBIDAS[\s]+ROMERO|\nCARD|\n[A-Z]{4,}:|$)/i;
  const cliM = txt.match(cliRe);
  const bebidasCliente = cliM ? cliM[0].replace(/BEBIDAS[\s]+CLIENTE[\s*:]*/i,'').replace(/\*+/g,'').trim() : '';
  const romRe = /BEBIDAS[\s]+ROMERO[\s\S]*?(?=\nCARD|\n[A-Z]{4,}:|$)/i;
  const romM = txt.match(romRe);
  const bebidasRomero = romM ? romM[0].replace(/BEBIDAS[\s]+ROMERO[\s*:]*/i,'').replace(/\*+/g,'').trim() : '';
  const equipe = [];
  const equipeRe = /^(\d+)[\s]+(BARTENDER|BAR[\s-]?BACK|COORDENADOR|COPEIRO|BARBACK)/gim;
  let em;
  while ((em = equipeRe.exec(txt)) !== null) {
    equipe.push({ qtd: parseInt(em[1]), cargo: em[2].trim().toUpperCase() });
  }
  const heRe = /HORA[\s]+EXTRA[\s*:]+R\$[\s]*([\d.,]+)/i;
  const heM = txt.match(heRe);
  const durRe = /(\d+)H DE FESTA/i;
  const durM = txt.match(durRe);
  const horRe = /HORARIO[\s]+FESTA[\s*:]+([0-9:]+)[\s]+[AÀ]+S[\s]+([0-9:]+)/i;
  const horM = txt.match(horRe);
  const convRe = /CONVIDADOS[\s*:]+(\d+)/i;
  const convM = txt.match(convRe);
  return {
    proposta: get('PROPOSTA'), tipo: get('OCASI[ÃA]O'), nome: get('CLIENTE'),
    data: '', convidados: convM ? convM[1] : '', local: get('LOCAL'),
    transporte: get('TRANSPORTE'), pecas: get('PE[ÇC]AS'), cerimonial: get('CERIMONIAL'),
    decorador: get('DECORADOR'), buffet: get('BUFFET'), layout: get('LAYOUT'),
    pontoEnergia: get('PONTO DE ENERGIA'), hrChegadaEquipe: get('HORARIO DE CHEGADA DA EQUIPE'),
    hrInicio: horM ? horM[1] : '', hrFim: horM ? horM[2] : '',
    duracao: durM ? durM[1] : '', horaExtra: heM ? heM[1] : '',
    equipe, equipeTexto: equipe.map(e=>e.qtd+' '+e.cargo).join(' · '),
    equipeTotal: equipe.reduce((s,e)=>s+e.qtd,0),
    cardapio, bebidasConsignadas, bebidasCliente, bebidasRomero, obs: '',
  };
}

function rFormProducao() {
  const cont = document.getElementById('prodview-nova');
  if (!cont) return;
  // Montar lista de contratos disponíveis
  const contratos = (D.contratos||[]).sort((a,b)=>(b.data||'').localeCompare(a.data||''));
  const optsContratos = contratos.map(c=>`<option value="${c.id}">${c.nome||c.nomeEvento||'—'} · ${c.tipo||''} · ${fd(c.data)||''}</option>`).join('');

  cont.innerHTML = `
    <div class="sec">
      <div class="sec-head">
        <span class="sec-title">+ Nova Produção</span>
        <button class="btn-sm" onclick="setProdView('lista')" style="margin-left:auto">← Voltar</button>
      </div>
      <div style="padding:14px 16px">
        <div style="margin-bottom:14px">
          <label class="lbl" style="display:block;margin-bottom:6px">Importar de contrato existente</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <select id="prod-contrato-sel" class="inp" style="flex:1;min-width:280px">
              <option value="">— Selecione um contrato —</option>${optsContratos}
            </select>
            <button class="btn" onclick="puxarContrato()" style="background:var(--blue)">📥 Puxar dados do contrato</button>
          </div>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:6px">
          <label class="lbl" style="display:block;margin-bottom:6px">Ou cole o texto manualmente</label>
          <textarea id="prod-texto-raw" rows="8" style="width:100%;font-size:11px;padding:10px;border-radius:var(--radius);border:1px solid var(--border2);background:var(--bg3);color:var(--text);font-family:var(--mono);resize:vertical" placeholder="Cole o texto da proposta/produção aqui..."></textarea>
          <button class="btn" onclick="lerTextoProducao()" style="background:var(--blue);margin-top:8px">🔍 Ler e preencher campos</button>
        </div>
      </div>
      <div id="prod-campos-extraidos" style="display:none;padding:0 16px 16px">
        <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:12px 0 8px;border-top:1px solid var(--border);padding-top:12px">Campos extraídos — revise e edite antes de salvar</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
          <div><label class="lbl">PROPOSTA</label><input class="inp" id="pf-proposta" type="text"></div>
          <div><label class="lbl">OCASIÃO / TIPO</label><input class="inp" id="pf-tipo" type="text"></div>
          <div><label class="lbl">CLIENTE</label><input class="inp" id="pf-nome" type="text"></div>
          <div><label class="lbl">DATA DO EVENTO</label><input class="inp" id="pf-data" type="date"></div>
          <div><label class="lbl">CONVIDADOS</label><input class="inp" id="pf-convidados" type="number"></div>
          <div style="grid-column:1/-1"><label class="lbl">LOCAL</label><input class="inp" id="pf-local" type="text"></div>
          <div><label class="lbl">TRANSPORTE</label>
            <select class="inp" id="pf-transporte">
              <option value="Por conta do colaborador">Por conta do colaborador</option>
              <option value="Por conta da Romero">Por conta da Romero</option>
            </select>
          </div>
          <div><label class="lbl">PEÇAS</label><input class="inp" id="pf-pecas" type="text" placeholder="—"></div>
          <div><label class="lbl">CERIMONIAL</label><input class="inp" id="pf-cerimonial" type="text" placeholder="—"></div>
          <div><label class="lbl">DECORADOR</label><input class="inp" id="pf-decorador" type="text" placeholder="—"></div>
          <div><label class="lbl">BUFFET</label><input class="inp" id="pf-buffet" type="text" placeholder="—"></div>
          <div><label class="lbl">LAYOUT</label><input class="inp" id="pf-layout" type="text" placeholder="—"></div>
          <div><label class="lbl">PONTO DE ENERGIA</label>
            <select class="inp" id="pf-pontoenergia">
              <option value="">—</option><option value="SIM">SIM</option><option value="NAO">NÃO</option>
            </select>
          </div>
          <div><label class="lbl">CHEGADA DA EQUIPE</label><input class="inp" id="pf-chegada" type="time"></div>
          <div><label class="lbl">HORÁRIO INÍCIO</label><input class="inp" id="pf-hrini" type="time"></div>
          <div><label class="lbl">HORÁRIO FIM</label><input class="inp" id="pf-hrfim" type="time"></div>
          <div><label class="lbl">DURAÇÃO (h)</label><input class="inp" id="pf-duracao" type="number" placeholder="8"></div>
          <div><label class="lbl">HORA EXTRA (R$)</label><input class="inp" id="pf-horaextra" type="text" placeholder="—"></div>
          <div style="grid-column:1/-1"><label class="lbl">EQUIPE (uma por linha: qtd CARGO)</label>
            <textarea class="inp" id="pf-equipe" rows="4" placeholder="Ex:&#10;1 COORDENADOR&#10;6 BARTENDER&#10;2 BARBACK&#10;1 COPEIRO" style="font-size:12px;resize:vertical"></textarea>
          </div>
          <div style="grid-column:1/-1"><label class="lbl">BEBIDAS CONSIGNADAS</label>
            <textarea class="inp" id="pf-cons" rows="2" style="font-size:12px;resize:vertical"></textarea>
          </div>
          <div style="grid-column:1/-1"><label class="lbl">BEBIDAS CLIENTE</label>
            <textarea class="inp" id="pf-cli" rows="2" style="font-size:12px;resize:vertical"></textarea>
          </div>
          <div style="grid-column:1/-1"><label class="lbl">BEBIDAS ROMERO</label>
            <textarea class="inp" id="pf-romero" rows="2" style="font-size:12px;resize:vertical"></textarea>
          </div>
          <div style="grid-column:1/-1"><label class="lbl">CARDÁPIO</label>
            <textarea class="inp" id="pf-cardapio" rows="6" style="font-size:12px;resize:vertical"></textarea>
          </div>
          <div style="grid-column:1/-1"><label class="lbl">OBS</label><input class="inp" id="pf-obs" type="text" placeholder="—"></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn" id="pf-btn-salvar" onclick="salvarProducaoForm()" style="background:var(--green)">💾 Salvar Produção</button>
          <button class="btn" onclick="setProdView('lista')" style="background:var(--bg3);color:var(--text)">Cancelar</button>
        </div>
      </div>
    </div>
  `;
}


function puxarContrato() {
  const sel = document.getElementById('prod-contrato-sel');
  if (!sel || !sel.value) { alert('Selecione um contrato primeiro.'); return; }
  const c = (D.contratos||[]).find(x=>x.id===sel.value);
  if (!c) return;

  // Preencher campos do form com dados do contrato
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val||''; };
  set('pf-proposta', c.proposta||'');
  set('pf-tipo', c.tipo||c.tipoEvento||'');
  set('pf-nome', c.nome||c.nomeEvento||'');
  set('pf-data', c.data||'');
  set('pf-convidados', c.convidados||'');
  set('pf-local', c.local||'');
  // Transporte
  const tSel = document.getElementById('pf-transporte');
  if (tSel && c.transporte) tSel.value = (c.transporte||'').includes('Romero') ? 'Por conta da Romero' : 'Por conta do colaborador';
  set('pf-hrini', c.hrInicio||'');
  set('pf-hrfim', c.hrFim||'');
  set('pf-duracao', c.duracao||'');
  set('pf-horaextra', c.horaExtra||'');
  // Equipe do contrato
  if (c.equipe && Array.isArray(c.equipe)) {
    set('pf-equipe', c.equipe.map(e=>e.qtd+' '+e.cargo).join('\n'));
  } else if (c.equipeTexto) {
    set('pf-equipe', c.equipeTexto);
  }
  // Cardápio — vem da cláusula e) do contrato
  set('pf-cardapio', c.cardapio||'');
  // Aviso se cardápio vazio
  if (!c.cardapio) {
    const cardEl = document.getElementById('pf-cardapio');
    if (cardEl) {
      cardEl.placeholder = '⚠ Cardápio não encontrado neste contrato. Cole manualmente ou edite o contrato (✏️ na aba Contratos) e salve o cardápio.';
      cardEl.style.borderColor = 'var(--amber)';
    }
  }
  // Bebidas
  set('pf-cons', c.bebidasConsignadas||'');
  set('pf-cli', c.bebidasCliente||'');
  set('pf-romero', c.bebidasRomero||'');
  set('pf-obs', '');
  // Mostrar campos
  document.getElementById('prod-campos-extraidos').style.display = '';
  // Resetar botão
  const btn = document.getElementById('pf-btn-salvar');
  if (btn) { btn.textContent = '💾 Salvar Produção'; btn.onclick = salvarProducaoForm; }
  // Feedback
  document.getElementById('prod-texto-raw').value = '';
}


function prodCarregarContrato() {
  const sel = document.getElementById('prod-contrato-sel');
  if (!sel || !sel.value) { alert('Selecione um contrato primeiro.'); return; }
  const c = (D.contratos||[]).find(x=>x.id===sel.value);
  if (!c) return;

  // Preencher campos automaticamente
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val||''; };
  set('pf-tipo', c.tipo);
  set('pf-nome', c.nome||c.nomeEvento);
  set('pf-data', c.data);
  set('pf-convidados', c.convidados);
  set('pf-local', c.local);
  set('pf-hrini', c.hrInicio);
  set('pf-hrfim', c.hrFim);
  set('pf-duracao', c.duracao||'');
  set('pf-horaextra', c.horaExtra||'');
  set('pf-bebidas-cons', c.bebidasConsignadas||'');
  set('pf-cli', c.bebidasCliente||'');
  set('pf-romero', c.bebidasRomero||'');
  set('pf-cardapio', c.cardapio||'');

  // Transporte
  const tSel = document.getElementById('pf-transporte');
  if (tSel && c.transporte) tSel.value = c.transporte.includes('Romero') ? 'Por conta da Romero' : 'Por conta do colaborador';

  // Equipe
  if (c.equipe && c.equipe.length) {
    set('pf-equipe', c.equipe.map(e=>e.qtd+' '+e.cargo).join('\n'));
  } else if (c.equipeTexto) {
    set('pf-equipe', c.equipeTexto.split('·').map(e=>e.trim()).join('\n'));
  }

  // Mostrar campos
  document.getElementById('prod-campos-extraidos').style.display = '';

  // Aviso se cardápio vazio
  if (!c.cardapio) {
    const cardEl = document.getElementById('pf-cardapio');
    if (cardEl) {
      cardEl.placeholder = '⚠ Cardápio não encontrado neste contrato. Cole manualmente ou edite o contrato (✏️) e salve o cardápio.';
      cardEl.style.borderColor = 'var(--amber)';
    }
  }
}

function lerTextoProducao() {
  const txt = document.getElementById('prod-texto-raw')?.value || '';
  if (!txt.trim()) { alert('Cole o texto da produção primeiro.'); return; }
  const d = parsearTextoProducao(txt);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('pf-proposta', d.proposta); set('pf-tipo', d.tipo); set('pf-nome', d.nome);
  set('pf-data', d.data); set('pf-convidados', d.convidados); set('pf-local', d.local);
  if (d.transporte) { const sel = document.getElementById('pf-transporte'); if (sel) sel.value = d.transporte.includes('Romero') ? 'Por conta da Romero' : 'Por conta do colaborador'; }
  set('pf-pecas', d.pecas); set('pf-cerimonial', d.cerimonial); set('pf-decorador', d.decorador);
  set('pf-buffet', d.buffet); set('pf-layout', d.layout);
  if (d.pontoEnergia) { const sel = document.getElementById('pf-pontoenergia'); if (sel) sel.value = d.pontoEnergia.toUpperCase().startsWith('S') ? 'SIM' : 'NAO'; }
  set('pf-chegada', d.hrChegadaEquipe); set('pf-hrini', d.hrInicio); set('pf-hrfim', d.hrFim);
  set('pf-duracao', d.duracao); set('pf-horaextra', d.horaExtra);
  set('pf-equipe', d.equipe.map(e=>e.qtd+' '+e.cargo).join('\n'));
  set('pf-cons', d.bebidasConsignadas); set('pf-cli', d.bebidasCliente);
  set('pf-romero', d.bebidasRomero); set('pf-cardapio', d.cardapio); set('pf-obs', d.obs);
  document.getElementById('prod-campos-extraidos').style.display = '';
  // Resetar botão para modo criação
  const btn = document.getElementById('pf-btn-salvar');
  if (btn) { btn.textContent = '💾 Salvar Produção'; btn.onclick = salvarProducaoForm; }
}

function salvarProducaoForm() {
  const get = id => document.getElementById(id)?.value?.trim() || '';
  const evento = get('pf-tipo') || get('pf-nome');
  if (!evento) { alert('Preencha pelo menos o Tipo/Ocasião do evento.'); return; }
  const equipeLinhas = get('pf-equipe').split('\n').filter(Boolean);
  const equipe = equipeLinhas.map(l => { const m = l.match(/^(\d+)\s+(.+)/); return m ? { qtd: parseInt(m[1]), cargo: m[2].trim().toUpperCase() } : null; }).filter(Boolean);
  if (!D.producoes) D.producoes = [];
  D.producoes.push({
    id: 'PRD'+Date.now(), proposta: get('pf-proposta'), evento, nomeEvento: evento,
    tipo: get('pf-tipo'), nome: get('pf-nome'), cliente: get('pf-nome'),
    data: get('pf-data'), convidados: get('pf-convidados'), local: get('pf-local'),
    transporte: get('pf-transporte'), pecas: get('pf-pecas'), cerimonial: get('pf-cerimonial'),
    decorador: get('pf-decorador'), buffet: get('pf-buffet'), layout: get('pf-layout'),
    pontoEnergia: get('pf-pontoenergia'), hrChegadaEquipe: get('pf-chegada'),
    hrInicio: get('pf-hrini'), hrFim: get('pf-hrfim'), duracao: get('pf-duracao'),
    horaExtra: get('pf-horaextra'), equipe,
    equipeTexto: equipe.map(e=>e.qtd+' '+e.cargo).join(' · '),
    equipeTotal: equipe.reduce((s,e)=>s+e.qtd,0),
    bebidasConsignadas: get('pf-cons'), bebidasCliente: get('pf-cli'),
    bebidasRomero: get('pf-romero'), cardapio: get('pf-cardapio'), obs: get('pf-obs'),
    criadoEm: new Date().toISOString()
  });
  sv('producoes'); alert('Produção salva!'); setProdView('lista');
}

function rProducoes() {
  const lista = D.producoes || [];
  const cont = document.getElementById('prod-body');
  if (!cont) return;
  if (!lista.length) { cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhuma produção registrada. Clique em "+ Nova Produção".</div>'; return; }
  cont.innerHTML = '';
  [...lista].sort((a,b)=>(b.data||'').localeCompare(a.data||'')).forEach(p => {
    const div = document.createElement('div');
    div.className = 'sec'; div.style.marginBottom = '14px';
    const equipeHtml = (p.equipe||[]).length ? p.equipe.map(e=>`<span style="margin-right:12px">${e.qtd} ${e.cargo}</span>`).join('') : (p.equipeTexto||'—');
    div.innerHTML = `
      <div class="sec-head" style="display:flex;align-items:center;gap:10px">
        <span class="sec-title">🎉 ${p.evento||p.cliente||'—'}</span>
        <span style="color:var(--text3);font-size:12px">${fd(p.data)||''}</span>
        <div style="margin-left:auto;display:flex;gap:6px">
          <button class="btn-sm" style="background:var(--green)" onclick="editarProducaoModal('${p.id}')">✏️ Editar</button>
          <button class="btn-sm btn-red" onclick="excluirProducao('${p.id}')">Excluir</button>
        </div>
      </div>
      <div style="padding:10px 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;font-size:12px">
        <div><span style="color:var(--text3)">PROPOSTA:</span> ${p.proposta||'—'}</div>
        <div><span style="color:var(--text3)">CLIENTE:</span> ${p.cliente||p.nome||'—'}</div>
        <div><span style="color:var(--text3)">DIA:</span> ${fd(p.data)||'—'}</div>
        <div><span style="color:var(--text3)">CONVIDADOS:</span> ${p.convidados||'—'}</div>
        <div><span style="color:var(--text3)">LOCAL:</span> ${p.local||'—'}</div>
        <div><span style="color:var(--text3)">HORÁRIO:</span> ${p.hrInicio||'—'} às ${p.hrFim||'—'}</div>
        <div style="grid-column:1/-1"><span style="color:var(--text3)">EQUIPE:</span> ${equipeHtml}</div>
        ${p.cardapio?`<div style="grid-column:1/-1"><span style="color:var(--text3)">CARDÁPIO:</span> <span style="white-space:pre-wrap">${p.cardapio.substring(0,200)}${p.cardapio.length>200?'…':''}</span></div>`:''}
        ${p.bebidasConsignadas?`<div style="grid-column:1/-1"><span style="color:var(--text3)">CONSIGNADO:</span> ${p.bebidasConsignadas.substring(0,120)}</div>`:''}
        ${p.bebidasRomero?`<div style="grid-column:1/-1"><span style="color:var(--text3)">ROMERO:</span> ${p.bebidasRomero}</div>`:''}
      </div>`;
    cont.appendChild(div);
  });
}

function editarProducaoModal(id) {
  const p = (D.producoes||[]).find(x=>x.id===id);
  if (!p) return;
  setProdView('nova');
  setTimeout(() => {
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val||''; };
    document.getElementById('prod-texto-raw').value = '';
    set('pf-proposta',p.proposta); set('pf-tipo',p.tipo); set('pf-nome',p.nome||p.cliente);
    set('pf-data',p.data); set('pf-convidados',p.convidados); set('pf-local',p.local);
    const tSel=document.getElementById('pf-transporte'); if(tSel&&p.transporte) tSel.value=p.transporte.includes('Romero')?'Por conta da Romero':'Por conta do colaborador';
    set('pf-pecas',p.pecas); set('pf-cerimonial',p.cerimonial); set('pf-decorador',p.decorador);
    set('pf-buffet',p.buffet); set('pf-layout',p.layout);
    const peSel=document.getElementById('pf-pontoenergia'); if(peSel&&p.pontoEnergia) peSel.value=p.pontoEnergia;
    set('pf-chegada',p.hrChegadaEquipe); set('pf-hrini',p.hrInicio); set('pf-hrfim',p.hrFim);
    set('pf-duracao',p.duracao); set('pf-horaextra',p.horaExtra);
    set('pf-equipe',(p.equipe||[]).map(e=>e.qtd+' '+e.cargo).join('\n'));
    set('pf-cons',p.bebidasConsignadas); set('pf-cli',p.bebidasCliente);
    set('pf-romero',p.bebidasRomero); set('pf-cardapio',p.cardapio); set('pf-obs',p.obs);
    document.getElementById('prod-campos-extraidos').style.display = '';
    const btn = document.getElementById('pf-btn-salvar');
    if (btn) {
      btn.textContent = '💾 Atualizar Produção';
      btn.onclick = () => {
        const idx = (D.producoes||[]).findIndex(x=>x.id===id);
        if (idx<0) return;
        const get = elId => document.getElementById(elId)?.value?.trim()||'';
        const equipeLinhas = get('pf-equipe').split('\n').filter(Boolean);
        const equipe = equipeLinhas.map(l=>{const m=l.match(/^(\d+)\s+(.+)/);return m?{qtd:parseInt(m[1]),cargo:m[2].trim().toUpperCase()}:null;}).filter(Boolean);
        const evento = get('pf-tipo')||get('pf-nome');
        D.producoes[idx] = { ...D.producoes[idx], proposta:get('pf-proposta'), tipo:get('pf-tipo'), nome:get('pf-nome'), cliente:get('pf-nome'), evento, nomeEvento:evento, data:get('pf-data'), convidados:get('pf-convidados'), local:get('pf-local'), transporte:get('pf-transporte'), pecas:get('pf-pecas'), cerimonial:get('pf-cerimonial'), decorador:get('pf-decorador'), buffet:get('pf-buffet'), layout:get('pf-layout'), pontoEnergia:get('pf-pontoenergia'), hrChegadaEquipe:get('pf-chegada'), hrInicio:get('pf-hrini'), hrFim:get('pf-hrfim'), duracao:get('pf-duracao'), horaExtra:get('pf-horaextra'), equipe, equipeTexto:equipe.map(e=>e.qtd+' '+e.cargo).join(' · '), equipeTotal:equipe.reduce((s,e)=>s+e.qtd,0), bebidasConsignadas:get('pf-cons'), bebidasCliente:get('pf-cli'), bebidasRomero:get('pf-romero'), cardapio:get('pf-cardapio'), obs:get('pf-obs') };
        sv('producoes'); alert('Produção atualizada!'); setProdView('lista');
      };
    }
  }, 100);
}

function excluirProducao(id) {
  if (!confirm('Excluir esta produção?')) return;
  D.producoes = (D.producoes||[]).filter(p=>p.id!==id);
  sv('producoes'); rProducoes();
}

// ═══════════════════════════════════════════════════════
