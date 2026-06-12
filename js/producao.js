// ─── PRODUÇÃO ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════

function setProdView(v) {
  ['lista','manual'].forEach(k => {
    const el = document.getElementById('prodview-'+k);
    if (el) el.style.display = v === k ? '' : 'none';
    const btn = document.getElementById('prod-btn-'+k);
    if (btn) btn.classList.toggle('active', v === k);
  });
  if (v === 'lista') rProducoes();
}

function inserirProducao() {
  const evento = document.getElementById('pm-evento')?.value?.trim();
  const data   = document.getElementById('pm-data')?.value;
  if (!evento || !data) { alert('Preencha Evento e Data.'); return; }
  if (!D.producoes) D.producoes = [];
  D.producoes.push({
    id: 'PRD'+Date.now(), evento, data,
    cliente: document.getElementById('pm-cliente')?.value?.trim() || '',
    convidados: document.getElementById('pm-conv')?.value?.trim() || '',
    obs: document.getElementById('pm-obs')?.value?.trim() || '',
    criadoEm: new Date().toISOString()
  });
  sv('producoes');
  ['pm-evento','pm-data','pm-cliente','pm-conv','pm-obs'].forEach(id => { const el=document.getElementById(id);if(el)el.value=''; });
  alert('Produção registrada!');
  setProdView('lista');
}

function rProducoes() {
  const lista = D.producoes || [];
  const cont = document.getElementById('prod-body');
  if (!cont) return;

  if (!lista.length) {
    cont.innerHTML = '<div style="text-align:center;color:#8B91A8;padding:32px">Nenhuma produção registrada</div>';
    return;
  }

  cont.innerHTML = '';
  [...lista].sort((a,b)=>(b.data||'').localeCompare(a.data||'')).forEach(p => {
    const div = document.createElement('div');
    div.className = 'sec';
    div.style.marginBottom = '14px';

    const equipeHtml = (p.equipe||[]).length
      ? p.equipe.map(e=>`<span style="margin-right:12px">${e.qtd} ${e.cargo}</span>`).join('')
      : (p.equipeTexto || '—');

    div.innerHTML = `
      <div class="sec-head" style="display:flex;align-items:center;gap:10px">
        <span class="sec-title">🎉 ${p.evento||p.cliente||'—'}</span>
        <span style="color:#8B91A8;font-size:12px">${fd(p.data)||''}</span>
        <button class="btn-sm" style="background:#4F8EF7;margin-left:auto" onclick="gerarFolhaProducao('${p.id}')">📄 Word</button>
        <button class="btn-sm btn-red" onclick="excluirProducao('${p.id}')">Excluir</button>
      </div>
      <div style="padding:12px 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">

        <div><label class="lbl">PROPOSTA</label><input class="inp" type="text" value="${p.proposta||''}" placeholder="Ex: 0126-061" onchange="editarProducao('${p.id}','proposta',this.value)"></div>
        <div><label class="lbl">OCASIÃO</label><div style="color:#E8EAF0;font-size:13px">${p.tipo||'—'}</div></div>
        <div><label class="lbl">CLIENTE</label><div style="color:#E8EAF0;font-size:13px">${p.cliente||'—'}</div></div>
        <div><label class="lbl">DIA</label><div style="color:#E8EAF0;font-size:13px">${fd(p.data)||'—'}</div></div>
        <div><label class="lbl">CONVIDADOS</label><div style="color:#E8EAF0;font-size:13px">${p.convidados||'—'}</div></div>
        <div style="grid-column:1/-1"><label class="lbl">LOCAL</label><div style="color:#E8EAF0;font-size:13px">${p.local||'—'}</div></div>

        <div><label class="lbl">TRANSPORTE</label>
          <select class="inp" onchange="editarProducao('${p.id}','transporte',this.value)">
            <option ${(p.transporte||'').includes('colaborador')?'selected':''}>Por conta do colaborador</option>
            <option ${(p.transporte||'').includes('Romero')?'selected':''}>Por conta da Romero</option>
          </select>
        </div>
        <div><label class="lbl">PEÇAS</label><input class="inp" type="text" value="${p.pecas||''}" placeholder="—" onchange="editarProducao('${p.id}','pecas',this.value)"></div>
        <div><label class="lbl">CERIMONIAL</label><input class="inp" type="text" value="${p.cerimonial||''}" placeholder="—" onchange="editarProducao('${p.id}','cerimonial',this.value)"></div>
        <div><label class="lbl">DECORADOR</label><input class="inp" type="text" value="${p.decorador||''}" placeholder="—" onchange="editarProducao('${p.id}','decorador',this.value)"></div>
        <div><label class="lbl">BUFFET</label><input class="inp" type="text" value="${p.buffet||''}" placeholder="—" onchange="editarProducao('${p.id}','buffet',this.value)"></div>
        <div><label class="lbl">LAYOUT</label><input class="inp" type="text" value="${p.layout||''}" placeholder="—" onchange="editarProducao('${p.id}','layout',this.value)"></div>
        <div><label class="lbl">PONTO DE ENERGIA</label>
          <select class="inp" onchange="editarProducao('${p.id}','pontoEnergia',this.value)">
            <option value="">—</option>
            <option ${p.pontoEnergia==='SIM'?'selected':''} value="SIM">SIM</option>
            <option ${p.pontoEnergia==='NAO'?'selected':''} value="NAO">NÃO</option>
          </select>
        </div>
        <div><label class="lbl">HORÁRIO CHEGADA DA EQUIPE</label><input class="inp" type="time" value="${p.hrChegadaEquipe||''}" onchange="editarProducao('${p.id}','hrChegadaEquipe',this.value)"></div>
        <div><label class="lbl">HORÁRIO FESTA</label><div style="color:#E8EAF0;font-size:13px">${p.hrInicio||'—'} às ${p.hrFim||'—'} ${p.duracao?'· '+p.duracao:''}</div></div>
        <div><label class="lbl">HORA EXTRA (valor)</label><div style="color:#E8EAF0;font-size:13px">${p.horaExtra?'R$ '+p.horaExtra:'—'}</div></div>

        <div style="grid-column:1/-1"><label class="lbl">EQUIPE</label>
          <div style="color:#E8EAF0;font-size:13px;line-height:2">${equipeHtml}</div>
        </div>

        <div style="grid-column:1/-1"><label class="lbl">BEBIDAS CLIENTE</label><input class="inp" type="text" value="${p.bebidasCliente||''}" placeholder="Ex: Vodka (21) e Gin (18)" onchange="editarProducao('${p.id}','bebidasCliente',this.value)"></div>
        ${p.bebidasRomero?`<div style="grid-column:1/-1"><label class="lbl">BEBIDAS ROMERO</label><div style="color:#E8EAF0;font-size:13px">${p.bebidasRomero}</div></div>`:''}
        ${p.cardapio?`<div style="grid-column:1/-1"><label class="lbl">CARDÁPIO</label><div style="color:#E8EAF0;font-size:13px;white-space:pre-wrap">${p.cardapio}</div></div>`:''}
        <div style="grid-column:1/-1"><label class="lbl">OBS</label><input class="inp" type="text" value="${p.obs||''}" placeholder="—" onchange="editarProducao('${p.id}','obs',this.value)"></div>

      </div>
    `;
    cont.appendChild(div);
  });
}

function editarProducao(id, campo, valor) {
  const p = (D.producoes||[]).find(x=>x.id===id);
  if (p) { p[campo] = valor; sv('producoes'); }
}

function excluirProducao(id) {
  if (!confirm('Excluir esta produção?')) return;
  D.producoes = (D.producoes||[]).filter(p => p.id !== id);
  sv('producoes'); rProducoes();
}

async function gerarFolhaProducao(id) {
  const p = (D.producoes||[]).find(x => x.id === id);
  if (!p) return;

  const fmtData = d => {
    if (!d) return '—';
    if (d.includes('/')) return d;
    const [a,m,di] = d.split('-');
    return `${di}/${m}/${a}`;
  };

  const hrFesta = (p.hrInicio && p.hrFim)
    ? `${p.hrInicio} ÀS ${p.hrFim}${p.duracao ? ' (' + p.duracao + 'H DE FESTA)' : ''}`
    : '—';

  const horaExtra = p.horaExtra
    ? 'R$ ' + parseFloat(String(p.horaExtra).replace(/[R$\s]/g,'').replace('.','').replace(',','.'))
        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    : '—';

  // Monta linhas da equipe
  let equipeHtml = '';
  if (Array.isArray(p.equipe) && p.equipe.length) {
    equipeHtml = p.equipe.map(e => `<p>${String(e.qtd).padStart(2,'0')} ${e.cargo.toUpperCase()}</p>`).join('');
  } else if (p.equipeTexto) {
    equipeHtml = p.equipeTexto.split('·').map(e => `<p>${e.trim().toUpperCase()}</p>`).join('');
  }

  // Monta cardápio
  let cardapioHtml = '';
  if (p.cardapio) {
    cardapioHtml = p.cardapio.split('\n').filter(Boolean)
      .map(l => `<p>${l.trim()}</p>`).join('');
  }

  const lin = (label, val) => val && val !== '—'
    ? `<p><b>${label}:</b> ${val}</p>` : `<p><b>${label}:</b> —</p>`;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; font-size: 11pt; margin: 2cm; color: #000; }
      h1 { color: #B8860B; font-size: 14pt; margin-bottom: 2px; }
      h2 { font-size: 12pt; border-bottom: 2px solid #B8860B; padding-bottom: 4px; margin-bottom: 12px; }
      p { margin: 4px 0; line-height: 1.4; }
      .sec { font-weight: bold; margin-top: 14px; margin-bottom: 4px; }
    </style>
    </head><body>
    <h1>ROMERO COQUETÉIS E EVENTOS</h1>
    <h2>FOLHA DE PRODUÇÃO</h2>
    ${lin('PROPOSTA', p.proposta || '—')}
    ${lin('OCASIÃO', (p.tipo||'').toUpperCase())}
    ${lin('CLIENTE', (p.cliente||'').toUpperCase())}
    ${lin('DIA', fmtData(p.data))}
    ${lin('CONVIDADOS', String(p.convidados||'—'))}
    ${lin('LOCAL', (p.local||'—').toUpperCase())}
    ${lin('TRANSPORTE', (p.transporte||'POR CONTA DO COLABORADOR').toUpperCase())}
    ${lin('PEÇAS', (p.pecas||'').toUpperCase() || '—')}
    ${lin('CERIMONIAL', (p.cerimonial||'').toUpperCase() || '—')}
    ${lin('DECORADOR', (p.decorador||'').toUpperCase() || '—')}
    ${lin('BUFFET', (p.buffet||'').toUpperCase() || '—')}
    ${lin('LAYOUT', (p.layout||'').toUpperCase() || '—')}
    ${lin('PONTO DE ENERGIA', (p.pontoEnergia||'NÃO').toUpperCase())}
    ${lin('HORÁRIO CHEGADA DA EQUIPE', p.hrChegadaEquipe || '—')}
    ${lin('HORÁRIO FESTA', hrFesta)}
    ${lin('HORA EXTRA', horaExtra)}
    <p class="sec">EQUIPE:</p>
    ${equipeHtml || '<p>—</p>'}
    ${p.bebidasCliente ? lin('BEBIDAS CLIENTE', (p.bebidasCliente||'').toUpperCase()) : ''}
    ${p.bebidasRomero  ? lin('BEBIDAS ROMERO',  (p.bebidasRomero||'').toUpperCase())  : ''}
    ${cardapioHtml ? `<p class="sec">CARDÁPIO:</p>${cardapioHtml}` : ''}
    ${p.obs ? lin('OBS', p.obs) : ''}
    </body></html>`;

  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'PRODUCAO_' + (p.cliente||'evento').replace(/\s+/g,'_').toUpperCase() + '_' + (p.data||'').replace(/-/g,'') + '.doc';
  a.click();
  URL.revokeObjectURL(url);
}


// ═══════════════════════════════════════════════════════
