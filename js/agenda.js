// ─── AGENDA ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════

function registrarEventoNaAgenda(ev) {
  if (!D.agenda) D.agenda = [];
  D.agenda.push({
    id: 'AG'+Date.now(),
    contratoId: ev.contratoId||'',
    nome: ev.nome, data: ev.data, tipo: ev.tipo,
    local: ev.local, convidados: ev.conv,
    hrInicio: ev.hrIni, hrFim: ev.hrFim, duracao: ev.duracao||'',
    equipe: ev.equipe||[], equipeTexto: ev.equipeTexto||'', equipeTotal: ev.equipeTotal||0,
    fonte: ev.fonte||'contrato'
  });
  sv('agenda');
}

function rAgenda() {
  const ag = D.agenda || [];
  const filtroI = document.getElementById('ag-data-ini')?.value;
  const filtroF = document.getElementById('ag-data-fim')?.value;
  const tbody = document.getElementById('ag-body');
  if (!tbody) return;

  const lista = ag.filter(ev => {
    if (filtroI && ev.data < filtroI) return false;
    if (filtroF && ev.data > filtroF) return false;
    return true;
  }).sort((a,b)=>(a.data||'').localeCompare(b.data||''));

  tbody.innerHTML = '';

  // Cidades consideradas viagem (>60km de BH)
  // Cidades confirmadas >60km de BH (Nova Lima, Contagem, Betim são Grande BH — não são viagem)
  const CIDADES_VIAGEM_AG = [
    'ponte nova','sete lagoas','pedro leopoldo','lagoa santa','vespasiano',
    'itabirito','ouro preto','mariana','congonhas','conselheiro lafaiete',
    'juiz de fora','uberlândia','uberaba','montes claros','governador valadares',
    'ipatinga','divinópolis','pará de minas','formiga','lavras','alfenas',
    'poços de caldas','três pontas','varginha','passos','patos de minas',
    'teófilo otoni','muriaé','viçosa','barbacena','são joão del rei',
    'coronel fabriciano','timóteo','caratinga','manhuaçu'
  ];

  const normalizar = s => s.toLowerCase()
    .replace(/pte\.?\s*/g,'ponte ')
    .replace(/[áàã]/g,'a').replace(/[éê]/g,'e').replace(/[íi]/g,'i')
    .replace(/[óôõ]/g,'o').replace(/[úü]/g,'u').replace(/ç/g,'c');

  const ehViagem = ev => {
    const local = normalizar(ev.local||'');
    if (CIDADES_VIAGEM_AG.some(ci => local.includes(normalizar(ci)))) return true;
    if (/por conta da romero/i.test(ev.transporte||'')) return true;
    // Cruzar com contrato salvo pelo nome+data — só verifica o local, não o transporte
    // (transporte pode estar desatualizado de versões antigas do sistema)
    const contrato = (D.contratos||[]).find(c =>
      c.data === ev.data && (c.nome === ev.nome || (c.nomeEvento||'') === ev.nome)
    );
    if (contrato) {
      const locC = normalizar(contrato.local||'');
      if (CIDADES_VIAGEM_AG.some(ci => locC.includes(normalizar(ci)))) return true;
    }
    return false;
  };

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#8B91A8;padding:24px">Nenhum evento no período</td></tr>';
    ['ag-card-eventos','ag-card-convidados','ag-card-colab','ag-card-viagem'].forEach(id => {
      const el = document.getElementById(id); if(el) el.textContent = '—';
    });
    const vBox = document.getElementById('ag-card-viagem-box');
    if (vBox) vBox.style.borderColor = '#2A2F42';
    return;
  }

  // Totalizadores
  const totCargos = {};      // chave normalizada → quantidade
  const cargoDisplay = {};   // chave normalizada → nome para exibição (1ª ocorrência)
  let totalConv = 0;
  let totalViagens = 0;

  lista.forEach(ev => {
    totalConv += parseInt(ev.convidados||0);
    if (ehViagem(ev)) totalViagens++;
    (ev.equipe||[]).forEach(e => {
      const nomeOriginal = (e.cargo || 'Outros').trim();
      // Chave normalizada: lowercase + espaços simples (agrupa variações)
      const chave = nomeOriginal.toLowerCase().replace(/\s+/g,' ');
      if (!cargoDisplay[chave]) cargoDisplay[chave] = nomeOriginal;
      totCargos[chave] = (totCargos[chave]||0) + (e.qtd||0);
    });
    if (!(ev.equipe||[]).length && ev.equipeTotal) {
      if (!cargoDisplay['colaboradores']) cargoDisplay['colaboradores'] = 'Colaboradores';
      totCargos['colaboradores'] = (totCargos['colaboradores']||0) + ev.equipeTotal;
    }
  });
  const totalGeral = Object.values(totCargos).reduce((s,v)=>s+v,0);
  const totStr = Object.entries(totCargos)
    .map(([k,n])=>`<strong>${n}</strong> ${cargoDisplay[k]||k}`)
    .join(' &nbsp;·&nbsp; ');

  // Atualizar cards
  const setCard = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  setCard('ag-card-eventos',    lista.length);
  setCard('ag-card-convidados', totalConv.toLocaleString('pt-BR'));
  setCard('ag-card-colab',      totalGeral || '—');
  setCard('ag-card-viagem',     totalViagens || '0');

  // Card viagem — destaque amarelo se houver
  const vBox = document.getElementById('ag-card-viagem-box');
  if (vBox) {
    if (totalViagens > 0) {
      vBox.style.borderColor = '#F7C84F';
      vBox.style.background  = '#2E2A0D';
      document.getElementById('ag-card-viagem').style.color = '#F7C84F';
    } else {
      vBox.style.borderColor = '#2A2F42';
      vBox.style.background  = '';
      document.getElementById('ag-card-viagem').style.color = '';
    }
  }

  // Detalhe equipe por cargo
  const detEl = document.getElementById('ag-detalhe-equipe');
  if (detEl) detEl.innerHTML = totalGeral
    ? `Equipe no período: ${totStr}`
    : '';

  lista.forEach(ev => {
    const equipeDisplay = ev.equipeTexto || (ev.equipeTotal ? ev.equipeTotal+' colaboradores' : '—');
    const isViagem = ehViagem(ev);
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #1E2333';
    if (isViagem) tr.style.background = '#1A1800';
    tr.innerHTML = `
      <td style="padding:8px 12px">${fd(ev.data)}</td>
      <td style="padding:8px 12px">
        <strong>${ev.nome||'—'}</strong>
        ${isViagem ? '<span style="background:#F7C84F;color:#000;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:6px">✈ VIAGEM</span>' : ''}
      </td>
      <td style="padding:8px 12px">${ev.tipo||'—'}</td>
      <td style="padding:8px 12px;text-align:center">${ev.convidados||'—'}</td>
      <td style="padding:8px 12px;font-size:12px;color:#8B91A8">${ev.local||'—'}</td>
      <td style="padding:8px 12px">${ev.hrInicio||'—'}</td>
      <td style="padding:8px 12px">${ev.hrFim||'—'}</td>
      <td style="padding:8px 12px">${ev.duracao||calcDuracao(ev.hrInicio,ev.hrFim)||'—'}</td>
      <td style="padding:8px 12px;font-size:11px;line-height:1.6">${equipeDisplay}</td>
      <td style="padding:8px 12px;white-space:nowrap">
        <button class="btn-sm btn-red" onclick="excluirEventoAgenda('${ev.id}')" title="Remover da agenda">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function calcDuracao(ini, fim) {
  try {
    const [hi, mi] = ini.split(':').map(Number);
    const [hf, mf] = fim.split(':').map(Number);
    const diff = (hf * 60 + mf) - (hi * 60 + mi);
    if (diff <= 0) return '—';
    return `${Math.floor(diff/60)}h${diff%60 ? (diff%60)+'min' : ''}`;
  } catch { return '—'; }
}

function excluirEventoAgenda(id) {
  if (!confirm('Excluir este evento da agenda?')) return;
  D.agenda = (D.agenda || []).filter(e => e.id !== id);
  sv('agenda');
  rAgenda();
}

// ═══════════════════════════════════════════════════════
