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
    'coronel fabriciano','timóteo','caratinga','manhuaçu',
    'oliveira','itaúna','piumhi','campo belo','bom despacho',
    'mateus leme','matheus leme','funilândia'
  ];

  const normalizar = s => s.toLowerCase()
    .replace(/[ –—​ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/pte\.?\s*/g,'ponte ')
    .replace(/[áàã]/g,'a').replace(/[éê]/g,'e').replace(/[íi]/g,'i')
    .replace(/[óôõ]/g,'o').replace(/[úü]/g,'u').replace(/ç/g,'c');

  // Prefixos de logradouro: se a cidade aparece logo após um desses, é nome de rua, não município
  const PREFIX_RUA = /(?:^|,\s*)(?:r\.?\s*|rua\s+|av\.?\s*|avenida\s+|al\.?\s*|alameda\s+|tv\.?\s*|travessa\s+|pca\.?\s*|praca\s+|estrada\s+|rod\.?\s*|rodovia\s+|trav\.\s*)$/;

  const cidadeNoLocal = (local, ci) => {
    const ciN = normalizar(ci);
    let pos = 0;
    while (true) {
      const idx = local.indexOf(ciN, pos);
      if (idx === -1) return false;
      // Ignora se precedida por prefixo de rua
      if (!PREFIX_RUA.test(local.slice(0, idx))) return true;
      pos = idx + 1;
    }
  };

  const ehViagem = ev => {
    const local = normalizar(ev.local||'');
    // Endereço em Belo Horizonte nunca é viagem
    if (local.includes('belo horizonte') || /\bbh\b/.test(local)) return false;
    if (CIDADES_VIAGEM_AG.some(ci => cidadeNoLocal(local, ci))) return true;
    if (/mateus\s*leme/i.test(ev.local||'')) return true;
    if (/por conta da romero/i.test(ev.transporte||'')) return true;
    const contrato = (D.contratos||[]).find(c =>
      c.data === ev.data && (c.nome === ev.nome || (c.nomeEvento||'') === ev.nome)
    );
    if (contrato) {
      const locC = normalizar(contrato.local||'');
      if (locC.includes('belo horizonte') || /\bbh\b/.test(locC)) return false;
      if (CIDADES_VIAGEM_AG.some(ci => cidadeNoLocal(locC, ci))) return true;
    }
    return false;
  };

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#8B91A8;padding:24px">Nenhum evento no período</td></tr>';
    ['ag-card-eventos','ag-card-convidados','ag-card-colab','ag-card-viagem'].forEach(id => {
      const el = document.getElementById(id); if(el) el.textContent = '—';
    });
    const vBox = document.getElementById('ag-card-viagem-box');
    if (vBox) { vBox.classList.remove('card-viagem-ativo'); vBox.style.borderColor = ''; vBox.style.background = ''; }
    const vVal = document.getElementById('ag-card-viagem');
    if (vVal) { vVal.classList.remove('card-viagem-val'); vVal.style.color = ''; }
    return;
  }

  // Mapa de variações → cargo canônico (singular/plural, maiúsc/minúsc)
  const CARGO_CANONICO = [
    { variações: ['head bartender','head bartenders','coordenador','coordenadores','coordenador de eventos','head'], exibir: 'Head Bartender', ordem: 1 },
    { variações: ['bartender','bartenders'],           exibir: 'Bartender',      ordem: 2 },
    { variações: ['bar back','bar backs','barback','barbacks'], exibir: 'Bar Back', ordem: 3 },
    { variações: ['copeiro','copeiros'],               exibir: 'Copeiro',        ordem: 4 },
  ];
  function resolverCargo(nome) {
    const n = (nome||'').toLowerCase().trim().replace(/\s+/g,' ');
    for (const c of CARGO_CANONICO) {
      if (c.variações.includes(n)) return c;
    }
    return { variações: [n], exibir: (nome||'').trim(), ordem: 99 };
  }

  // Parseia texto livre: "2 Bartenders 1 Bar back" ou "1 Head · 4 Bartender · 1 Bar Back"
  // → [{cargo:'Bartenders', qtd:2}, {cargo:'Bar back', qtd:1}]
  function parsearTextoEquipe(texto) {
    const resultado = [];
    const limpo = (texto||'').replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim();
    // Tenta separadores explícitos: ·  ,  ;  ou " . " (ponto com espaços, formato legado)
    if (/[·,;]|\s\.\s/.test(limpo)) {
      limpo.split(/\s*[·,;]\s*|\s+\.\s+/).forEach(parte => {
        const m = parte.trim().match(/^(\d+)\.?\s+(.+)$/);
        if (m && parseInt(m[1]) > 0) resultado.push({ qtd: parseInt(m[1]), cargo: m[2].trim() });
      });
      if (resultado.length) return resultado;
    }
    // Sem separadores: extrai pares "número[.] nome" até o próximo número ou fim
    const re = /\b(\d+)\.?\s+([A-Za-zÀ-ú][A-Za-zÀ-ú ]*?)(?=\s+\d|\s*$)/g;
    let m;
    while ((m = re.exec(limpo)) !== null) {
      const qtd = parseInt(m[1]);
      const cargo = m[2].trim();
      if (qtd > 0 && cargo.length > 1) resultado.push({ qtd, cargo });
    }
    return resultado;
  }

  // Totalizadores
  const totCargos = {};   // chave canônica → quantidade
  const cargoMeta  = {};  // chave canônica → { exibir, ordem }
  let totalConv = 0;
  let totalViagens = 0;

  const adicionarCargo = (cargoNome, qtd) => {
    if (!qtd || qtd <= 0) return;
    const canon = resolverCargo(cargoNome);
    const chave = canon.variações[0];
    if (!cargoMeta[chave]) cargoMeta[chave] = { exibir: canon.exibir || cargoNome, ordem: canon.ordem };
    totCargos[chave] = (totCargos[chave]||0) + qtd;
  };

  lista.forEach(ev => {
    totalConv += parseInt(ev.convidados||0);
    if (ehViagem(ev)) totalViagens++;

    let adicionou = false;

    // Prioridade 1: equipeTexto — fonte mais confiável (é o que aparece na tabela)
    if (ev.equipeTexto) {
      const partes = parsearTextoEquipe(ev.equipeTexto);
      partes.forEach(p => { adicionarCargo(p.cargo, p.qtd); });
      if (partes.length) adicionou = true;
    }

    // Prioridade 2: equipe[] estruturado (quando equipeTexto não retornou nada)
    if (!adicionou) {
      (ev.equipe||[]).forEach(e => {
        const cargoNome = (e.cargo||'').trim();
        const canon = resolverCargo(cargoNome);
        if (canon.ordem < 99) {
          adicionarCargo(cargoNome, e.qtd||0);
          adicionou = true;
        } else {
          const textoBase = /^\d/.test(cargoNome)
            ? cargoNome
            : ((e.qtd||0) > 0 ? `${e.qtd} ${cargoNome}` : cargoNome);
          const partes = parsearTextoEquipe(textoBase.trim());
          partes.forEach(p => { adicionarCargo(p.cargo, p.qtd); });
          if (partes.length) adicionou = true;
        }
      });
    }

    // Último recurso: total genérico
    if (!adicionou && ev.equipeTotal) {
      adicionarCargo('Colaboradores', ev.equipeTotal);
    }
  });

  const totalGeral = Object.values(totCargos).reduce((s,v)=>s+v,0);
  const totStr = Object.entries(totCargos)
    .sort(([a],[b]) => (cargoMeta[a]?.ordem||99) - (cargoMeta[b]?.ordem||99))
    .map(([k,n]) => `<strong>${n}</strong> ${cargoMeta[k]?.exibir||k}`)
    .join(' &nbsp;·&nbsp; ');

  // Atualizar cards
  const setCard = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  setCard('ag-card-eventos',    lista.length);
  setCard('ag-card-convidados', totalConv.toLocaleString('pt-BR'));
  setCard('ag-card-colab',      totalGeral || '—');
  setCard('ag-card-viagem',     totalViagens || '0');

  // Card viagem — destaque amarelo se houver
  const vBox = document.getElementById('ag-card-viagem-box');
  const vVal = document.getElementById('ag-card-viagem');
  if (vBox) {
    vBox.classList.toggle('card-viagem-ativo', totalViagens > 0);
    if (vVal) vVal.classList.toggle('card-viagem-val', totalViagens > 0);
    // Remove inline styles remanescentes de versões anteriores
    vBox.style.borderColor = ''; vBox.style.background = '';
    if (vVal) vVal.style.color = '';
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
    if (isViagem) tr.classList.add('tr-viagem');
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

