// ─── CONTRATOS ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════

let dadosContrato = {};

// Atualiza status dos contratos com base na data do evento:
// data passada → concluido | data futura/hoje → ativo
// Contratos cancelados nunca são alterados.
function atualizarStatusContratos() {
  if (!D.contratos || !D.contratos.length) return;
  const hoje = new Date().toISOString().slice(0, 10);
  let mudou = false;
  D.contratos.forEach(c => {
    if (c.status === 'cancelado' || !c.data) return;
    const novoStatus = c.data < hoje ? 'concluido' : 'ativo';
    if (c.status !== novoStatus) { c.status = novoStatus; mudou = true; }
  });
  if (mudou) sv('contratos');
}

function setContratoView(v) {
  if (v === 'importar') { setTimeout(initImportacao, 50); }
  ['importar','lista','manual'].forEach(k => {
    const el = document.getElementById('cview-'+k);
    if (el) el.style.display = v === k ? '' : 'none';
    const btn = document.getElementById('cv-'+k);
    if (btn) btn.classList.toggle('active', v === k);
  });
  if (v === 'lista') rContratos();
}

// ─── IMPORTAÇÃO DE CONTRATOS EXISTENTES VIA PDF ───────────────────────────────

function initImportacao() {
  const zone = document.getElementById('imp-upload-zone');
  if (!zone || zone._initDone) return;
  zone._initDone = true;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor='#4F8EF7'; });
  zone.addEventListener('dragleave', () => zone.style.borderColor='#2A2F42');
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.style.borderColor='#2A2F42';
    if (e.dataTransfer.files[0]) processarPDFImportacao(e.dataTransfer.files[0]);
  });
}

function lerPDFImportacao(input) {
  if (input.files[0]) processarPDFImportacao(input.files[0]);
}

async function processarPDFImportacao(file) {
  try {
    // Limpar dados anteriores antes de processar novo PDF
    window._dadosImportacao = {};
    // Limpar formulário
    ['imp-nome','imp-tipo','imp-data','imp-conv','imp-local','imp-ini','imp-fim','imp-equipe','imp-valor'].forEach(id => {
      const el = document.getElementById(id); if(el) el.value = '';
    });
    document.getElementById('imp-form').style.display = 'none';
    document.getElementById('imp-status').textContent = 'Lendo PDF…';
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    let txt = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const tc = await pg.getTextContent();
      // Preservar quebras de linha reais baseadas na posição Y dos itens
      let lastY = null;
      let pageLines = [];
      let currentLine = '';
      for (const item of tc.items) {
        const y = item.transform ? Math.round(item.transform[5]) : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          currentLine = item.str;
        } else {
          currentLine += (currentLine && item.str && !currentLine.endsWith(' ') ? ' ' : '') + item.str;
        }
        lastY = y;
      }
      if (currentLine.trim()) pageLines.push(currentLine.trim());
      txt += pageLines.join('\n') + '\n';
    }
    window._ultimoTxtPDF = txt;
    preencherFormImportacao(txt, file.name);
    document.getElementById('imp-status').textContent = 'PDF lido ✓ — confirme os dados ao lado.';
    document.getElementById('imp-form').style.display = '';
  } catch(e) {
    document.getElementById('imp-status').textContent = 'Erro ao ler PDF: ' + e.message;
  }
}

function extrairDadosContratoRomero(txt) {
  // Normaliza espaços entre dígitos (PDF às vezes separa "8 0 0 . 5 0 5" etc)
  let t = txt.replace(/(\d)\s+(\d)/g,'$1$2').replace(/(\d)\s+(\d)/g,'$1$2');

  // Normaliza letras isoladas separadas por espaço: "R a q u e l" → "Raquel"
  // Preserva espaços entre palavras completas: "festa com" continua "festa com"
  // Aplica 2x para pegar todas as ocorrências
  const normLetras = (s) => s
    .replace(/\b([A-ZÀ-Úa-zà-ú]) (?=[A-ZÀ-Úa-zà-ú] |[A-ZÀ-Úa-zà-ú]\b)/g,'$1')
    .replace(/\b([A-ZÀ-Úa-zà-ú]) (?=[A-ZÀ-Úa-zà-ú] |[A-ZÀ-Úa-zà-ú]\b)/g,'$1');
  t = normLetras(t);
  // Normaliza espaços múltiplos → simples
  t = t.replace(/  +/g,' ');
  const d = {};

  // ── CLIENTE ────────────────────────────────────────────────────────────────
  // PDF pode quebrar a linha entre o nome e "portadora/doravante", então
  // testamos cada linha e também o par linha[i] + linha[i+1] concatenados.
  // PDF pode vir com ou sem quebras de linha.
  // Estratégia 1: busca no texto corrido — "SERVIÇOS  Nome, portadora"
  const mNomeCorrido = txt.match(/SERVI[CÇ]OS\s+([A-ZÀ-Úa-zà-ú][^,\n]{3,80}?)\s*,\s*(?:portadora|portador)/i);
  if (mNomeCorrido) {
    d.contratante = mNomeCorrido[1].trim();
  } else {
    // Estratégia 2: busca linha a linha (ou par de linhas)
    const linhas = txt.split('\n').map(l=>l.trim()).filter(Boolean);
    for (let i = 0; i < linhas.length; i++) {
      const candidatos = [linhas[i], i+1 < linhas.length ? linhas[i]+' '+linhas[i+1] : ''];
      let achou = false;
      for (const linha of candidatos) {
        if (/portadora|portador|doravante/i.test(linha) && linha.length > 10) {
          const separador = linha.match(/,\s*(?:portadora|portador|CNPJ|CPF|residente|doravante)/i);
          const nome = separador
            ? linha.slice(0, separador.index).trim()
            : linha.replace(/\s*(portadora|portador|doravante).*/i,'').trim();
          if (nome && !/CONTRATO|PRESTAÇÃO/i.test(nome) && nome.length > 3) {
            d.contratante = nome; achou = true; break;
          }
        }
      }
      if (achou) break;
    }
  }

  // ── CPF ────────────────────────────────────────────────────────────────────
  const mCPF = t.match(/CPF\s*n[oº°]?\s*([\d]{3}[\.,][\d]{3}[\.,][\d]{3}[-][\d]{2})/i);
  if (mCPF) d.cpf = mCPF[1];

  // ── TIPO DE EVENTO ─────────────────────────────────────────────────────────
  // Captura: "no Casamento", "no noivado", "em um Festa Junina", "na festa de casamento"
  const mTipo = t.match(/\bno\s+(Casamento|Noivado|Aniversário|Aniversario|Formatura|15\s*Anos|Debutante)\b/i)
             || t.match(/\bna\s+(?:festa\s+de\s+)?(Casamento|Noivado|Aniversário|Formatura)\b/i)
             || t.match(/\bem\s+um\s+([\w\s]{3,30}?),\s*que\s+será/i)
             || t.match(/\b(Casamento|Noivado|Aniversário|Aniversario|Formatura|15\s*Anos|Festa\s+\w+)\b/i);
  d.tipo = mTipo ? mTipo[1].trim() : 'Evento';

  // ── NOME DO EVENTO ─────────────────────────────────────────────────────────
  // {3,60} sem limite de parada "engolia" o texto seguinte quando não havia
  // vírgula/ponto logo depois do nome (ex: "Casamento entre Vanessa e Allan
  // que será realizado no dia..." virava nome = "Vanessa e Allan que será
  // realizado no dia 07 de março de 202", cortado no limite de 60 caracteres).
  // Lookahead pára em " que ", vírgula, ponto, quebra de linha ou fim do texto.
  const paraNomeEvento = '[^\\n,.]{3,60}?(?=\\s+que\\s|[,.\\n]|$)';
  const mEvento = t.match(new RegExp(
    `(Casamento entre ${paraNomeEvento}|festa de casamento de ${paraNomeEvento}|noivado (?:da?|de) ${paraNomeEvento}|Aniversário de ${paraNomeEvento}|Formatura de ${paraNomeEvento}|15 [Aa]nos de ${paraNomeEvento})`, 'i'
  ));
  if (mEvento) d.nomeEvento = mEvento[1].trim();

  // ── DATA ───────────────────────────────────────────────────────────────────
  const meses = {janeiro:'01',fevereiro:'02','março':'03',abril:'04',maio:'05',junho:'06',
    julho:'07',agosto:'08',setembro:'09',outubro:'10',novembro:'11',dezembro:'12'};
  const mD = t.match(/no dia\s+(\d{1,2})[\/\-](\d{2})[\/\-](\d{4})/i);
  if (mD) {
    d.data = `${mD[3]}-${mD[2]}-${mD[1].padStart(2,'0')}`;
  } else {
    const mDE = t.match(/(?:no dia|realizada?\s+no\s+dia)\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i);
    if (mDE) {
      const mes = meses[mDE[2].toLowerCase()] || '00';
      d.data = `${mDE[3]}-${mes}-${mDE[1].padStart(2,'0')}`;
    } else {
      // "realizado no dia 01/05/2026" sem "no dia" explícito
      const mD2 = t.match(/realizado[^\n]*?(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i);
      if (mD2) d.data = `${mD2[3]}-${mD2[2]}-${mD2[1].padStart(2,'0')}`;
    }
  }

  // ── CONVIDADOS ─────────────────────────────────────────────────────────────
  const mConv = t.match(/atender\s+(\d+)\s*convidados/i)
             || t.match(/qual\s+seja\s+(\d+)\s*(?:\(|pessoas)/i);
  if (mConv) d.convidados = mConv[1];

  // ── LOCAL ──────────────────────────────────────────────────────────────────
  // Padrão 1: "no endereço localizado no/na X" → até \n ou Início ou Cerimonia
  const mL1 = txt.match(/endereço localizado (?:no|na)\s+(.+?)(?=\n|Início|Cerimoni|CLÁUSULA)/i);
  if (mL1) {
    d.local = mL1[1].trim().replace(/\s+/g,' ').replace(/\.\s*$/,'');
  } else {
    // Padrão 2: "no Espaço/Fazenda X, localizado Y"
    const mL2 = txt.match(/no\s+((?:Espaço|Fazenda|Chácara|Clube|Hotel|Sítio)\s+[^\n]+?),\s*localizado\s+(.+?)(?=\n|Cerimoni|CLÁUSULA)/i);
    if (mL2) {
      d.local = `${mL2[1].trim()}, ${mL2[2].trim().replace(/\.\s*$/,'')}`;
    } else {
      // Padrão 3: "realizado no dia X, Condomínio/Rua/Av/Espaço..." — pega após a data
      const mL3 = txt.match(/realizado[^\n]*?\d{2}[\/\-]\d{2}[\/\-]\d{4},?\s+(.+?)(?=\n|Início|Cerimoni|CLÁUSULA)/i);
      if (mL3) d.local = mL3[1].trim().replace(/\.\s*$/,'');
    }
  }

  // ── HORÁRIOS — SEMPRE da Cláusula 2b ──────────────────────────────────────
  // Formato real: "sendo o início às \n19h00min do dia 09/05/2026 e término às 03h00min"
  // Usa [\s\S] para tolerar quebra de linha entre "às" e o horário
  const txtH = txt.replace(/\r/g,'');
  const mH = txtH.match(/sendo o in[\u00ed\u0069]cio [\u00e0a]s[\s\S]{0,30}?(\d{1,2})h(\d{2})[\s\S]{0,80}?t[\u00e9e]rmino [\u00e0a]s\s*(\d{1,2})h(\d{2})/i)
           || txtH.match(/sendo o in[íi]cio [àa]s[\s\S]{0,30}?(\d{1,2}):(\d{2})[\s\S]{0,80}?t[ée]rmino [àa]s\s*(\d{1,2}):(\d{2})/i);
  if (mH) {
    d.hrInicio = `${mH[1].padStart(2,'0')}:${mH[2]}`;
    d.hrFim    = `${mH[3].padStart(2,'0')}:${mH[4]}`;
  }

  // ── DURAÇÃO ────────────────────────────────────────────────────────────────
  const mDur = t.match(/dura[cç][aã]o de\s+0*(\d+)h?\s*(?:horas?\s*)?(?:de\s*festa)?/i);
  if (mDur) d.duracao = parseInt(mDur[1]) + 'h';
  else if (d.hrInicio && d.hrFim) {
    const [hi,mi] = d.hrInicio.split(':').map(Number);
    let [hf,mf]   = d.hrFim.split(':').map(Number);
    if (hf < hi) hf += 24;
    const mins = (hf*60+mf)-(hi*60+mi);
    d.duracao = Math.floor(mins/60)+'h'+(mins%60?(mins%60)+'min':'');
  }

  // ── HORA EXTRA ─────────────────────────────────────────────────────────────
  const mHE = t.match(/horas?\s+extras?,?\s+no valor de\s+R\$\s*([\d\.]+,\d{2})/i);
  if (mHE) d.horaExtra = mHE[1];

  // ── EQUIPE — bloco após "equipe de trabalho que será composta por:" ─────────
  d.equipe = [];
  // Extrai o bloco até "m)" (Bebidas) ou "l)" ou "CLÁUSULA"
  // Extrai apenas cargos conhecidos — ordem fixa: Head Bartender, Bartender, Bar Back, Copeiro...
  // Funciona tanto com linhas separadas quanto com tudo numa linha só
  const CARGOS_DEF = [
    { re: /Head\s*Bartenders?|Coordenadores?/i,  nome: 'Head Bartender' },
    { re: /Bartenders?/i,          nome: 'Bartender' },
    { re: /Bar\s*Back/i,          nome: 'Bar Back' },
    { re: /Copeiros?/i,            nome: 'Copeiro' },
    { re: /Garç[oõ]ns?/i,         nome: 'Garçom' },
    { re: /Auxiliares?/i,          nome: 'Auxiliar' },
    { re: /Recepcionistas?/i,      nome: 'Recepcionista' },
  ];
  const ORDEM_CARGOS = CARGOS_DEF.map(c => c.nome);
  const mBloco = txt.match(/equipe de trabalho que ser[aá] composta por:([\s\S]{0,600})/i);
  if (mBloco) {
    const blocoTexto = mBloco[1];
    for (const c of CARGOS_DEF) {
      // Busca "número (extenso)? cargo" em qualquer ponto do bloco
      const mC = blocoTexto.match(new RegExp('(\\d+)\\.?\\s*(?:\\([^)]+\\))?\\s*' + c.re.source, 'i'));
      if (mC) {
        // Garante que não confunde "Bartender" com "Head Bartender"
        if (c.nome === 'Bartender' && /Head/i.test(mC[0])) continue;
        d.equipe.push({ qtd: parseInt(mC[1]), cargo: c.nome });
      }
    }
    // Ordenar pela ordem padrão
    d.equipe.sort((a, b) => ORDEM_CARGOS.indexOf(a.cargo) - ORDEM_CARGOS.indexOf(b.cargo));
  }
  const ordemCargo = ['Head Bartender','Bartender','Bar Back','Copeiro','Garçom','Auxiliar'];
  d.equipe.sort((a,b)=>{
    const ia = ordemCargo.findIndex(c=>a.cargo.toLowerCase().startsWith(c.toLowerCase()));
    const ib = ordemCargo.findIndex(c=>b.cargo.toLowerCase().startsWith(c.toLowerCase()));
    return (ia<0?99:ia)-(ib<0?99:ib);
  });
  d.equipeTotal = d.equipe.reduce((s,e)=>s+e.qtd,0);
  d.equipeTexto = d.equipe.map(e=>`${e.qtd} ${e.cargo}`).join(' · ');

  // ── VALOR TOTAL — "Valor total do serviço – R$ X" ou "Valor total do serviço – R$X" ──
  const mVT = t.match(/[Vv]alor total do servi[cç]o\s*[–\-]\s*R\$\s*([\d\.]+,\d{2})/i);
  if (mVT) d.valorTotal = mVT[1];

  // ── PARCELAS — padrão fixo com "R$ X" (com ou sem espaço após R$) ─────────
  d.parcelas = [];
  // Sinal: "R$ X.XXX,00 (extenso) no ato da assinatura deste contrato"
  const mSinal = t.match(/R\$\s*([\d\.]+,\d{2})\s*\([^)]+\)\s*no ato da assinatura deste contrato/i);
  if (mSinal) {
    d.parcelas.push({
      valor: mSinal[1],
      descricao: 'Sinal — assinatura do contrato',
      vencimento: new Date().toISOString().slice(0,10)
    });
  }
  // Restante: "R$ X.XXX,00 (extenso) para o dia DD/MM/AAAA"
  const mRest = t.match(/R\$\s*([\d\.]+,\d{2})\s*\([^)]+\)\s*para o dia\s+(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i);
  if (mRest) {
    d.parcelas.push({
      valor: mRest[1],
      descricao: `Restante — venc. ${mRest[2]}/${mRest[3]}/${mRest[4]}`,
      vencimento: `${mRest[4]}-${mRest[3]}-${mRest[2]}`
    });
  }

  // ── CARDÁPIO ─────────────────────────────────────────────────────────────
  // Pega tudo da letra e) até f) — cláusula 2.1 do contrato Romero
  {
    let cardapioRaw = '';
    const tCard = t.replace(/\r/g, '');
    // Tentativa 1: e)...f) com quebras de linha reais
    let mc = tCard.match(/\ne\)[^\n]*fornecimento[^\n]*\n([\s\S]*?)\nf\)\s*Responsabilizar/i);
    if (mc) { cardapioRaw = mc[1]; }
    // Tentativa 2: Coquetéis até f)
    if (!cardapioRaw) {
      mc = tCard.match(/Coquet[eé]is?:?([\s\S]*?)(?=\nf\)\s*Responsabilizar|\nf\)\s*Provid|CLÁUSULA\s*[23])/i);
      if (mc) { cardapioRaw = mc[0]; }
    }
    // Tentativa 3: e) até f) em linha única
    if (!cardapioRaw) {
      mc = tCard.match(/e\)[\s\S]*?Coquet[eé]is?:?([\s\S]*?)(?=f\)\s*Responsabilizar)/i);
      if (mc) { cardapioRaw = mc[1]; }
    }
    if (cardapioRaw) {
      const sep = cardapioRaw.includes('\n') ? '\n' : ' - ';
      const linhas = cardapioRaw.includes('\n')
        ? cardapioRaw.split('\n')
        : cardapioRaw.split(/(?= - [A-ZÁÉÍÓÚ])/);
      d.cardapio = linhas
        .map(function(l){ return l.trim(); })
        .filter(function(l){ return l.length > 1; })
        .filter(function(l){ return !/^f[).]|^g[).]|^CLÁUSULA|^Responsabilizar/i.test(l); })
        .join('\n')
        .trim();
    }
  }
  // ── BEBIDAS CLIENTE — cláusula 1, letra l) (opcional) ───────────────────
  // Formato: l) ...destilados...sendo:\nBEBIDA ESTIMATIVA\nVODKA 04 A 06 GARRAFAS\nGIN...
  {
    const mL = t.match(/l\)[^\n]*destilados?[^\n]*\n([\s\S]*?)(?=\nm\)|\nCLÁUSULA|\n[a-z]\))/i);
    if (mL) {
      const linhas = mL[1].split('\n')
        .map(function(l){return l.trim();})
        .filter(function(l){return l && !/^(BEBIDA|ESTIMATIVA|VALOR)(\s+(BEBIDA|ESTIMATIVA|VALOR))*$/i.test(l);})
        .map(function(l){
          return l.replace(/\s+\d+\s+A\s+\d+\s+GARRAFAS?.*$/i,'')
            .replace(/\s+\d+\s+GARRAFAS?.*$/i,'')
            .replace(/\s+R\$[\d.,]+\s*$/,'').trim();
        })
        .filter(function(l){return l.length > 1;});
      if (linhas.length) d.bebidasCliente = linhas.join('\n').trim();
    }
  }

  // ── BEBIDAS ROMERO ou CONSIGNADAS — letra m) ─────────────────────────────
  {
    var _idxM = txt.search(/m\s*\)\s*Bebidas fornecidas pela ROMERO/i);
    if (_idxM >= 0) {
      var _blocoM = txt.substring(_idxM);
      var _isC = /CONSIGNADA/i.test(_blocoM.split('\n')[0]);
      var _linhasM = _blocoM.split('\n').slice(1);
      var _bebs = [];
      for (var _li = 0; _li < _linhasM.length; _li++) {
        var _l = _linhasM[_li].trim();
        if (!_l) continue;
        if (/^(BEBIDA|ESTIMATIVA|VALOR)/i.test(_l)) continue;
        if (/^ESTIMATIVA DE BEBIDAS/i.test(_l)) continue;
        // Se começa com letra minúscula seguida de ) é nova alínea
        if (/^[a-z]\s*\)/.test(_l)) break;
        if (/^CLÁUSULA/i.test(_l)) break;
        _l = _l.replace(/\s+\d+\s+[Aa]\s+\d+\s+[Gg][Aa][Rr][Rr][Aa][Ff][Aa][Ss]?.*/,'')
               .replace(/\s+\d+\s+[Gg][Aa][Rr][Rr][Aa][Ff][Aa][Ss]?.*/,'')
               .replace(/\s+R\$[\d.,]+\s*$/,'').trim();
        if (_l.length > 2) _bebs.push(_l);
      }
      if (_bebs.length) {
        if (_isC) { d.bebidasConsignadas = _bebs.join('\n'); }
        else      { d.bebidasRomero = _bebs.join('\n'); }
      }
    }
  }

  // ── TRANSPORTE (regra 60km de BH) ─────────────────────────────────────────
  const cidadesForaBH = [
    'ponte nova','sete lagoas','pedro leopoldo','lagoa santa','vespasiano',
    'itabirito','ouro preto','mariana','congonhas','conselheiro lafaiete',
    'juiz de fora','uberlândia','uberaba','montes claros','governador valadares',
    'ipatinga','divinópolis','pará de minas','formiga','lavras','alfenas',
    'poços de caldas','três pontas','varginha','passos','patos de minas',
    'teófilo otoni','muriaé','viçosa','barbacena','são joão del rei',
    'coronel fabriciano','timóteo','caratinga','manhuaçu',
    'mateus leme','matheus leme','funilândia','florestal'
  ];
  const normExt = s => s.toLowerCase()
    .replace(/pte\.?\s*/g,'ponte ')
    .replace(/[áàã]/g,'a').replace(/[éê]/g,'e').replace(/[íi]/g,'i')
    .replace(/[óôõ]/g,'o').replace(/[úü]/g,'u').replace(/ç/g,'c');
  const localNorm = normExt(d.local||'');
  d.transporte = cidadesForaBH.some(c => localNorm.includes(normExt(c)))
    ? 'Por conta da Romero' : 'Por conta do colaborador';

  return d;
}

function preencherFormImportacao(txt, nomeArquivo) {
  const d = extrairDadosContratoRomero(txt);
  window._dadosImportacao = d;

  const set = (id,v) => { const el=document.getElementById(id); if(el && v!==undefined && v!=='') el.value=v; };
  console.log('[DEBUG] contratante:', JSON.stringify(d.contratante));
  console.log('[DEBUG] primeiras linhas:', JSON.stringify(txt.split('\n').slice(0,6)));
  set('imp-nome',   d.contratante);
  set('imp-tipo',   d.tipo);
  set('imp-data',   d.data);
  set('imp-conv',   d.convidados);
  set('imp-local',  d.local);
  set('imp-ini',    d.hrInicio);
  set('imp-fim',    d.hrFim);
  set('imp-equipe', d.equipeTexto);
  set('imp-valor',  d.valorTotal);

  // Mostrar resumo
  const resumo = document.getElementById('imp-resumo');
  if (resumo) {
    resumo.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;font-size:12px">
      ${d.nomeEvento?`<span class="tag tag-blue">🎉 ${d.nomeEvento}</span>`:''}
      ${d.equipeTexto?`<span class="tag tag-blue">👥 ${d.equipeTexto}</span>`:''}
      ${d.duracao?`<span class="tag tag-blue">⏱ ${d.duracao}</span>`:''}
      <span class="tag tag-yellow">🚗 ${d.transporte||''}</span>
      ${d.parcelas&&d.parcelas.length?`<span class="tag tag-green">💰 ${d.parcelas.length} parcela(s)</span>`:''}
    </div>`;
    resumo.style.display='';
  }
}

function salvarImportacao() {
  const nome  = document.getElementById('imp-nome')?.value?.trim();
  const data  = document.getElementById('imp-data')?.value;
  if (!nome || !data) { alert2('Preencha pelo menos Nome e Data.', 'error'); return; }

  const d = window._dadosImportacao || {};
  const valorText = document.getElementById('imp-valor')?.value?.trim() || '';
  const valorNum  = parseFloat(valorText.replace(/\./g,'').replace(',','.')) || 0;

  // Parcelas: usar as do contrato se existirem, senão calcular 20/80
  let parcelas = d.parcelas || [];
  if (!parcelas.length && valorNum > 0) {
    const p1 = (valorNum*0.2).toLocaleString('pt-BR',{minimumFractionDigits:2});
    const p2 = (valorNum*0.8).toLocaleString('pt-BR',{minimumFractionDigits:2});
    parcelas = [
      { valor: p1, descricao: 'Sinal — assinatura do contrato', vencimento: new Date().toISOString().slice(0,10) },
      { valor: p2, descricao: 'Restante', vencimento: '' }
    ];
  }

  const contrato = {
    nome, cpf: d.cpf||'',
    tipo:       document.getElementById('imp-tipo')?.value||'',
    nomeEvento: d.nomeEvento||nome,
    data,
    local:      document.getElementById('imp-local')?.value?.trim()||'',
    convidados: document.getElementById('imp-conv')?.value?.trim()||'',
    hrInicio:   document.getElementById('imp-ini')?.value||'',
    hrFim:      document.getElementById('imp-fim')?.value||'',
    duracao:    d.duracao||'',
    equipe:     d.equipe||[],
    equipeTexto:document.getElementById('imp-equipe')?.value?.trim()||'',
    equipeTotal:d.equipeTotal||0,
    opcao: valorText, valorNum,
    parc1: parcelas[0]?.valor||'', parc2: parcelas[1]?.valor||'',
    parcelas,
    horaExtra:  d.horaExtra||'',
    convExtra:  d.convExtra||'',
    cardapio:   d.cardapio||'',
    bebidasRomero: d.bebidasRomero||'',
    bebidasCliente: d.bebidasCliente||'',
    bebidasConsignadas: d.bebidasConsignadas||'',
    transporte: d.transporte||'',
    status:     document.getElementById('imp-contrato-status')?.value||'concluido',
    origem: 'importado'
  };

  salvarContratoCompleto(contrato);
  limparImportacao();
  alert('Contrato importado! Agenda, financeiro e produção atualizados.');
  setContratoView('lista');
}

function limparImportacao() {
  ['imp-nome','imp-tipo','imp-data','imp-conv','imp-local','imp-ini','imp-fim','imp-equipe','imp-valor','imp-contrato-status'].forEach(id => {
    const el=document.getElementById(id); if(el) el.value='';
  });
  document.getElementById('imp-form').style.display = 'none';
  document.getElementById('imp-status').textContent = '';
  document.getElementById('imp-pdf-input').value = '';
}


function initContratos() {
  setContratoView('lista');
  const zone = document.getElementById('contrato-upload-zone');
  if (!zone || zone._initDone) return;
  zone._initDone = true;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor='#4F8EF7'; });
  zone.addEventListener('dragleave', () => zone.style.borderColor='#2A2F42');
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.style.borderColor='#2A2F42';
    if (e.dataTransfer.files[0]) processarPDF(e.dataTransfer.files[0]);
  });
}

function lerPDFContrato(input) { if (input.files[0]) processarPDF(input.files[0]); }

async function processarPDF(file) {
  try {
    document.getElementById('contrato-status').textContent = 'Lendo PDF…';
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    let txt = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const tc = await pg.getTextContent();
      txt += tc.items.map(it => it.str).join(' ') + '\n';
    }
    extrairDadosContrato(txt);
    document.getElementById('contrato-status').textContent = 'PDF lido com sucesso ✓';
    document.getElementById('contrato-form').style.display = '';
  } catch (e) {
    document.getElementById('contrato-status').textContent = 'Erro ao ler PDF: ' + e.message;
  }
}

function extrairDadosContrato(txt) {
  // Usa a função completa de extração Romero para PDFs
  dadosContrato = extrairDadosContratoRomero(txt);

  const set = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
  set('c-tipo', dadosContrato.tipo);
  set('c-data', dadosContrato.data);
  set('c-convidados', dadosContrato.convidados);
  set('c-local', dadosContrato.local);
  set('c-opcao', dadosContrato.valorTotal);
  const isCas = dadosContrato.tipo === 'Casamento';
  const elCer = document.getElementById('c-cerimonia-row');
  if (elCer) elCer.style.display = isCas ? '' : 'none';
}

async function gerarContratoDocx() {
  const nome     = document.getElementById('c-nome')?.value?.trim();
  const cpf      = document.getElementById('c-cpf')?.value?.trim();
  const endereco = document.getElementById('c-endereco')?.value?.trim() || '';
  const tipo     = document.getElementById('c-tipo')?.value?.trim() || dadosContrato.tipo || '';
  const data     = document.getElementById('c-data')?.value?.trim() || '';
  const conv     = document.getElementById('c-convidados')?.value?.trim() || '';
  const local    = document.getElementById('c-local')?.value?.trim() || '';
  const hrIni    = document.getElementById('c-hora-inicio')?.value?.trim() || '';
  const opcao    = document.getElementById('c-opcao')?.value?.trim() || '';
  const cer      = document.getElementById('c-cerimonia')?.value?.trim() || '';

  if (!nome || !cpf) { alert('Preencha Nome e CPF.'); return; }

  const btn = document.getElementById('btn-gerar-contrato');
  if (btn) { btn.disabled = true; btn.textContent = 'Gerando…'; }

  try {
    const dtObj = data ? new Date(data + 'T12:00:00') : null;
    const dtFormatada = dtObj ? dtObj.toLocaleDateString('pt-BR', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : '';
    const dtSimples   = dtObj ? dtObj.toLocaleDateString('pt-BR') : '';

    let hrFim = '';
    if (hrIni && dadosContrato.duracao) {
      const [h, m] = hrIni.split(':').map(Number);
      const fim = new Date(0); fim.setHours(h + parseInt(dadosContrato.duracao), m);
      hrFim = `${String(fim.getHours()).padStart(2,'0')}:${String(fim.getMinutes()).padStart(2,'0')}`;
    }

    const valorNum = parseFloat((opcao||'0').replace(/[^\d,]/g,'').replace(',','.')) || 0;
    const parc1 = (valorNum * 0.2).toLocaleString('pt-BR', {minimumFractionDigits:2});
    const parc2 = (valorNum * 0.8).toLocaleString('pt-BR', {minimumFractionDigits:2});

    if (!window.PizZip || !window.Docxtemplater) { alert('Libs de geração não carregadas ainda. Aguarde e tente novamente.'); return; }
    if (!window.TEMPLATE_B64_GLOBAL) { alert('Template do contrato não carregado. Verifique a conexão.'); return; }

    const templateBytes = Uint8Array.from(atob(window.TEMPLATE_B64_GLOBAL), c => c.charCodeAt(0));
    const zip = new PizZip(templateBytes);
    const docx = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    docx.setData({
      CONTRATANTE: nome,
      CPF: cpf,
      ENDERECO: endereco,
      TIPO_EVENTO: tipo,
      DATA_EVENTO: dtFormatada || dtSimples,
      DIA_FESTA: dtSimples,
      CONVIDADOS: conv,
      LOCAL_EVENTO: local,
      HORARIO_INICIO: hrIni,
      HORARIO_FIM: hrFim,
      DURACAO: (dadosContrato.duracao||'') + 'h',
      VALOR_TOTAL: opcao ? 'R$ ' + opcao : '',
      VALOR_SINAL: 'R$ ' + parc1,
      VALOR_RESTANTE: 'R$ ' + parc2,
      EQUIPE: dadosContrato.equipeTexto || '',
      COQUETEIS: dadosContrato.coqueteis || '',
      DESTILADOS: dadosContrato.destilados || '',
      MODULOS: dadosContrato.modulos || '',
      VALOR_HORA_EXTRA: dadosContrato.horaExtra || '',
      VALOR_CONVIDADO_EXTRA: dadosContrato.convExtra || '',
    });
    docx.render();
    const blob = new Blob([docx.getZip().generate({type:'arraybuffer'})], {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Contrato_${nome.split(' ')[0]}_${dtSimples?.replace(/\//g,'-')||''}.docx`;
    a.click(); URL.revokeObjectURL(a.href);

    // Salvar na lista e alimentar agenda + financeiro
    // Criar estrutura de parcelas corretamente
    const parcelas = [
      { valor: parc1, descricao: 'Sinal — assinatura do contrato', vencimento: new Date().toISOString().slice(0,10) },
      { valor: parc2, descricao: 'Restante', vencimento: '' }
    ];

    salvarContrato({
      nome, cpf, tipo, data, local, convidados:conv,
      hrInicio:hrIni, hrFim,
      equipe:dadosContrato.equipe||[],
      equipeTexto:dadosContrato.equipeTexto||'',
      equipeTotal:dadosContrato.equipeTotal||0,
      opcao, valorNum,
      parcelas,
      status:'ativo', origem:'sistema'
    });
    rContratos();
    alert('Contrato gerado! Evento adicionado à agenda e parcelas ao financeiro.');
  } catch(e) {
    console.error(e); alert('Erro ao gerar: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📄 Gerar Contrato (.docx)'; }
  }
}

function salvarContrato(c) {
  const equipeArray = Array.isArray(c.equipe) ? c.equipe : [];
  const parcelas = c.parcelas || [];

  salvarContratoCompleto({...c,
    equipe: equipeArray,
    equipeTexto: c.equipeTexto || (equipeArray.map(e=>`${e.qtd} ${e.cargo}`).join(' · ')) || '',
    equipeTotal: c.equipeTotal || equipeArray.reduce((s,e)=>s+(e.qtd||0),0) || 0,
    parcelas: parcelas,
    nomeEvento: c.nome,
    duracao: c.duracao || '',
    transporte: c.transporte || '',
    hrInicio: c.hrInicio || c.hrIni || '',
    hrFim:    c.hrFim    || ''
  });
}

var _salvandoContrato = false;
function salvarContratoCompleto(c) {
  if (_salvandoContrato) { _logErro('Contratos', 'salvarContratoCompleto', 'Duplo clique bloqueado'); return; }
  _salvandoContrato = true;
  if (!D.contratos) D.contratos = [];
  const id = _gerarId('CON');
  // ⚠️ cComId garante que o id correto seja propagado para agenda/financeiro/produção
  const cComId = { ...c, id, criadoEm: new Date().toISOString() };
  D.contratos.push(cComId);
  sv('contratos');

  // → AGENDA com equipe detalhada
  registrarEventoNaAgenda({
    contratoId: id,                           // ← CORRIGIDO: era c.id||'' (undefined)
    nome: c.nomeEvento||c.nome, data: c.data, tipo: c.tipo,
    local: c.local, conv: c.convidados,
    hrIni: c.hrInicio, hrFim: c.hrFim, duracao: c.duracao,
    equipe: c.equipe||[], equipeTexto: c.equipeTexto||'', equipeTotal: c.equipeTotal||0
  });

  // → FINANCEIRO com parcelas reais do contrato
  registrarParcelasContratoFinanceiro(cComId); // ← CORRIGIDO: passa cComId com .id

  // → PRODUÇÃO com ficha pré-preenchida
  registrarFichaProducao(cComId);              // ← CORRIGIDO: passa cComId com .id
  _salvandoContrato = false;
}

function registrarParcelasContratoFinanceiro(c) {
  if (!D.financeiro) D.financeiro = [];
  const parcelas = c.parcelas||[];
  if (parcelas.length) {
    parcelas.forEach((p,i) => {
      const valNum = parseFloat((p.valor||'0').replace(/\./g,'').replace(',','.')) || 0;
      D.financeiro.push({
        id: _gerarId('FIN'),
        contratoId: c.id||'',
        contrato: c.nome, evento: c.nomeEvento||c.nome,
        data: c.data, tipo: c.tipo, convidados: c.convidados,
        descricao: p.descricao,
        valor: 'R$ '+p.valor, valorNum: valNum,
        vencimento: p.vencimento||'',
        status: 'pendente'
      });
    });
  } else if (c.valorNum > 0) {
    const p1 = (c.valorNum*0.2).toLocaleString('pt-BR',{minimumFractionDigits:2});
    const p2 = (c.valorNum*0.8).toLocaleString('pt-BR',{minimumFractionDigits:2});
    D.financeiro.push({ id:_gerarId('FIN'), contratoId:c.id||'', contrato:c.nome, evento:c.nomeEvento||c.nome,
      data:c.data, tipo:c.tipo, convidados:c.convidados,
      descricao:'Sinal — assinatura do contrato', valor:'R$ '+p1, valorNum:c.valorNum*0.2,
      vencimento:new Date().toISOString().slice(0,10), status:'pendente' });
    D.financeiro.push({ id:_gerarId('FIN'), contratoId:c.id||'', contrato:c.nome, evento:c.nomeEvento||c.nome,
      data:c.data, tipo:c.tipo, convidados:c.convidados,
      descricao:'Restante', valor:'R$ '+p2, valorNum:c.valorNum*0.8,
      vencimento:'', status:'pendente' });
  }
  sv('financeiro');
}

function registrarFichaProducao(c) {
  if (!D.producoes) D.producoes = [];
  D.producoes.push({
    id:           _gerarId('PRD'),
    contratoId:   c.id||'',
    proposta:     c.proposta||'',
    evento:       c.nomeEvento||c.nome,
    cliente:      c.nome,
    tipo:         c.tipo||'',
    data:         c.data,
    convidados:   c.convidados,
    local:        c.local,
    transporte:   c.transporte||'',
    hrInicio:     c.hrInicio||'',
    hrFim:        c.hrFim||'',
    duracao:      c.duracao||'',
    equipe:       c.equipe||[],
    equipeTexto:  c.equipeTexto||'',
    horaExtra:    c.horaExtra||'',
    cardapio:     c.cardapio||'',
    bebidasRomero:  c.bebidasRomero||'',
    bebidasCliente: c.bebidasCliente||'',
    obs:          c.obs||'',
    // Campos manuais (editáveis depois)
    pecas:'', cerimonial:'', decorador:'', buffet:'', layout:'',
    pontoEnergia:'', hrChegadaEquipe:'',
    criadoEm: new Date().toISOString()
  });
  sv('producoes');
}


function rAnalise() {
  const subView = document.getElementById('analise-sub-view')?.value || 'dashboard';
  document.getElementById('an-view-dashboard') && (document.getElementById('an-view-dashboard').style.display = subView === 'dashboard' ? '' : 'none');
  document.getElementById('an-view-config')    && (document.getElementById('an-view-config').style.display    = subView === 'config'    ? '' : 'none');
  if (subView === 'config') { rAnaliseConfig(); return; }

  const mes = document.getElementById('an-mes')?.value || '';
  const ano = document.getElementById('an-ano')?.value || '2026';
  const anoPrev = String(parseInt(ano) - 1);

  const fR = v => 'R$\u00a0' + (v||0).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
  const fN = v => (v||0).toLocaleString('pt-BR');

  // Contratos do período
  const todos = D.contratos || [];
  const filtrar = (a, m) => todos.filter(c => {
    if (!c.data) return false;
    if (!c.data.startsWith(a)) return false;
    if (m && !c.data.startsWith(`${a}-${m}`)) return false;
    return true;
  });

  const contratos = filtrar(ano, mes);
  const MESES = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const MESES_NOME = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const somarContratos = (lista) => {
    const fat = lista.reduce((s,c) => {
      const v = parseFloat((c.opcao||'0').toString().replace(/[^\d,]/g,'').replace(',','.')) || 0;
      return s + v;
    }, 0);
    const pax = lista.reduce((s,c) => s + (parseInt(c.convidados)||0), 0);
    return { fat, pax, ticket: pax > 0 ? fat/pax : 0 };
  };

  const atual = somarContratos(contratos);
  const meta  = mes
    ? { fat: parseFloat((D.metas||{})[`${ano}-${mes}`]?.fat||0), pax: parseInt((D.metas||{})[`${ano}-${mes}`]?.pax||0) }
    : Object.values((D.metas||{})).filter((_,i) => MESES.map(m=>`${ano}-${m}`).includes(Object.keys(D.metas||{})[i]))
        .reduce((s,m) => ({ fat: s.fat + (parseFloat(m.fat)||0), pax: s.pax + (parseInt(m.pax)||0) }), {fat:0, pax:0});

  const histKey = mes ? `${anoPrev}-${mes}` : null;
  const hist = mes
    ? { fat: parseFloat((D.historico||{})[`${anoPrev}-${mes}`]?.fat||0), pax: parseInt((D.historico||{})[`${anoPrev}-${mes}`]?.pax||0) }
    : MESES.reduce((s,m) => {
        const h = (D.historico||{})[`${anoPrev}-${m}`] || {};
        return { fat: s.fat + (parseFloat(h.fat)||0), pax: s.pax + (parseInt(h.pax)||0) };
      }, {fat:0, pax:0});

  const pctMeta = meta.fat > 0 ? (atual.fat / meta.fat * 100) : null;
  const difFat  = atual.fat - hist.fat;
  const difPax  = atual.pax - hist.pax;

  // ── Cards principais ──────────────────────────────────────────────────────
  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.innerHTML = v; };

  // Card meta — semáforo
  const corMeta = pctMeta === null ? '#8B91A8' : pctMeta >= 100 ? '#4FC78E' : pctMeta >= 80 ? '#F7C84F' : '#F74F6B';
  const iconMeta = pctMeta === null ? '—' : pctMeta >= 100 ? '🟢' : pctMeta >= 80 ? '🟡' : '🔴';
  setEl('an-faturamento', fR(atual.fat));
  setEl('an-recebido', '');
  setEl('an-a-receber', '');
  setEl('an-eventos', contratos.length);
  setEl('an-convidados', fN(atual.pax));
  setEl('an-ticket', atual.pax > 0 ? 'R$\u00a0' + (atual.fat/atual.pax).toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—');
  setEl('an-equipe', contratos.reduce((s,c)=>s+(c.equipeTotal||0),0) || '—');

  // Viagens — 60km+ de BH
  const CIDADES_VIAGEM = [
    'ponte nova','sete lagoas','pedro leopoldo','lagoa santa','vespasiano',
    'itabirito','ouro preto','mariana','congonhas','conselheiro lafaiete',
    'juiz de fora','uberlândia','uberaba','montes claros','governador valadares',
    'ipatinga','divinópolis','pará de minas','formiga','lavras','alfenas',
    'poços de caldas','três pontas','varginha','passos','patos de minas',
    'teófilo otoni','muriaé','viçosa','barbacena','são joão del rei',
    'coronel fabriciano','timóteo','caratinga','manhuaçu',
    'mateus leme','matheus leme','funilândia','florestal'
  ];
  const normAn = s => s.toLowerCase()
    .replace(/pte\.?\s*/g,'ponte ')
    .replace(/[áàã]/g,'a').replace(/[éê]/g,'e').replace(/[íi]/g,'i')
    .replace(/[óôõ]/g,'o').replace(/[úü]/g,'u').replace(/ç/g,'c');
  const viagems = contratos.filter(c => {
    const loc = normAn(c.local||'');
    return CIDADES_VIAGEM.some(ci => loc.includes(normAn(ci)))
        || /por conta da romero/i.test(c.transporte||'');
  });
  setEl('an-viagem', viagems.length);

  // ── Barra de meta ─────────────────────────────────────────────────────────
  const metaBox = document.getElementById('an-meta-box');
  if (metaBox && meta.fat > 0) {
    const pct = Math.min(pctMeta, 100).toFixed(1);
    const faltam = meta.fat - atual.fat;
    metaBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-weight:600;color:#E8EAF0">${iconMeta} Meta ${mes ? MESES_NOME[parseInt(mes)-1] : ano}</span>
        <span style="color:${corMeta};font-weight:700;font-size:18px">${pctMeta.toFixed(1)}%</span>
      </div>
      <div style="background:#0D1117;border-radius:6px;height:10px;overflow:hidden;margin-bottom:8px">
        <div style="height:100%;width:${pct}%;background:${corMeta};border-radius:6px;transition:width .6s ease"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#8B91A8">
        <span>Realizado: <b style="color:#E8EAF0">${fR(atual.fat)}</b></span>
        <span>Meta: <b style="color:#E8EAF0">${fR(meta.fat)}</b></span>
        ${faltam > 0 ? `<span style="color:#F74F6B">Faltam: <b>${fR(faltam)}</b></span>` : `<span style="color:#4FC78E">✓ Meta batida!</span>`}
      </div>`;
    metaBox.style.display = '';
  } else if (metaBox) {
    metaBox.innerHTML = '<span style="color:#8B91A8;font-size:13px">Configure as metas na aba ⚙️ Configurar.</span>';
    metaBox.style.display = '';
  }

  // ── Comparativo ano anterior ──────────────────────────────────────────────
  const compBox = document.getElementById('an-comp-box');
  if (compBox) {
    const linhas = MESES.map((m, i) => {
      const cx = filtrar(ano, m);
      const s  = somarContratos(cx);
      const h  = (D.historico||{})[`${anoPrev}-${m}`] || {};
      const hFat = parseFloat(h.fat||0);
      const hPax = parseInt(h.pax||0);
      const mt  = (D.metas||{})[`${ano}-${m}`] || {};
      const mFat = parseFloat(mt.fat||0);
      const pct  = mFat > 0 ? s.fat/mFat*100 : null;
      const cor  = pct === null ? '#2A2F42' : pct >= 100 ? '#0D2E1A' : pct >= 80 ? '#2E2A0D' : '#2E0D0D';
      const corT = pct === null ? '#8B91A8' : pct >= 100 ? '#4FC78E' : pct >= 80 ? '#F7C84F' : '#F74F6B';
      const difF = s.fat - hFat;
      const difP = s.pax - hPax;
      const seta = v => v > 0 ? `<span style="color:#4FC78E">▲</span>` : v < 0 ? `<span style="color:#F74F6B">▼</span>` : '';
      return `<tr style="border-bottom:1px solid #1E2333;background:${cor}">
        <td style="padding:8px 12px;font-weight:600;color:#E8EAF0">${MESES_NOME[i]}</td>
        <td style="padding:8px 12px;color:#8B91A8;text-align:right">${hPax > 0 ? fN(hPax) : '—'}</td>
        <td style="padding:8px 12px;color:#8B91A8;text-align:right">${hFat > 0 ? fR(hFat) : '—'}</td>
        <td style="padding:8px 12px;color:#8B91A8;text-align:right">${hPax > 0 ? 'R$\u00a0'+(hFat/hPax).toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—'}</td>
        <td style="padding:8px 12px;color:#E8EAF0;text-align:right;font-weight:500">${s.pax > 0 ? fN(s.pax) : '—'}</td>
        <td style="padding:8px 12px;color:#E8EAF0;text-align:right;font-weight:500">${s.fat > 0 ? fR(s.fat) : '—'}</td>
        <td style="padding:8px 12px;color:#E8EAF0;text-align:right;font-weight:500">${s.pax > 0 ? 'R$\u00a0'+(s.fat/s.pax).toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—'}</td>
        <td style="padding:8px 12px;text-align:right">${seta(difP)}<span style="color:${difP>=0?'#4FC78E':'#F74F6B'}">${difP !== 0 ? (difP>0?'+':'')+fN(difP) : '—'}</span></td>
        <td style="padding:8px 12px;text-align:right">${seta(difF)}<span style="color:${difF>=0?'#4FC78E':'#F74F6B'}">${difF !== 0 ? (difF>0?'+':'')+fR(difF) : '—'}</span></td>
        <td style="padding:8px 12px;text-align:right;font-weight:700;color:${corT}">${pct !== null ? pct.toFixed(0)+'%' : '—'}</td>
      </tr>`;
    });
    // Totais
    const totAtual = somarContratos(filtrar(ano, ''));
    const totHist  = MESES.reduce((s,m) => { const h=(D.historico||{})[`${anoPrev}-${m}`]||{}; return {fat:s.fat+(parseFloat(h.fat)||0), pax:s.pax+(parseInt(h.pax)||0)}; }, {fat:0,pax:0});
    const totMeta  = MESES.reduce((s,m) => { const mt=(D.metas||{})[`${ano}-${m}`]||{}; return {fat:s.fat+(parseFloat(mt.fat)||0), pax:s.pax+(parseInt(mt.pax)||0)}; }, {fat:0,pax:0});
    const totPct   = totMeta.fat > 0 ? (totAtual.fat/totMeta.fat*100).toFixed(0)+'%' : '—';
    compBox.innerHTML = `
      <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="color:#8B91A8;border-bottom:2px solid #2A2F42;font-size:11px">
          <th style="padding:8px 12px;text-align:left">MÊS</th>
          <th style="padding:8px 12px;text-align:right">PAX ${anoPrev}</th>
          <th style="padding:8px 12px;text-align:right">FAT ${anoPrev}</th>
          <th style="padding:8px 12px;text-align:right">TICKET ${anoPrev}</th>
          <th style="padding:8px 12px;text-align:right">PAX ${ano}</th>
          <th style="padding:8px 12px;text-align:right">FAT ${ano}</th>
          <th style="padding:8px 12px;text-align:right">TICKET ${ano}</th>
          <th style="padding:8px 12px;text-align:right">Δ PAX</th>
          <th style="padding:8px 12px;text-align:right">Δ FAT</th>
          <th style="padding:8px 12px;text-align:right">% META</th>
        </tr></thead>
        <tbody>${linhas.join('')}</tbody>
        <tfoot><tr style="border-top:2px solid #2A2F42;font-weight:700;background:#1A1F2E">
          <td style="padding:8px 12px;color:#E8EAF0">TOTAL</td>
          <td style="padding:8px 12px;text-align:right;color:#8B91A8">${fN(totHist.pax)}</td>
          <td style="padding:8px 12px;text-align:right;color:#8B91A8">${fR(totHist.fat)}</td>
          <td style="padding:8px 12px;text-align:right;color:#8B91A8">${totHist.pax>0?'R$\u00a0'+(totHist.fat/totHist.pax).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td>
          <td style="padding:8px 12px;text-align:right;color:#E8EAF0">${fN(totAtual.pax)}</td>
          <td style="padding:8px 12px;text-align:right;color:#E8EAF0">${fR(totAtual.fat)}</td>
          <td style="padding:8px 12px;text-align:right;color:#E8EAF0">${totAtual.pax>0?'R$\u00a0'+(totAtual.fat/totAtual.pax).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td>
          <td style="padding:8px 12px;text-align:right;color:${totAtual.pax>=totHist.pax?'#4FC78E':'#F74F6B'}">${totAtual.pax-totHist.pax >= 0 ? '+' : ''}${fN(totAtual.pax-totHist.pax)}</td>
          <td style="padding:8px 12px;text-align:right;color:${totAtual.fat>=totHist.fat?'#4FC78E':'#F74F6B'}">${totAtual.fat-totHist.fat >= 0 ? '+' : ''}${fR(totAtual.fat-totHist.fat)}</td>
          <td style="padding:8px 12px;text-align:right;color:${parseInt(totPct)>=100?'#4FC78E':parseInt(totPct)>=80?'#F7C84F':'#F74F6B'}">${totPct}</td>
        </tr></tfoot>
      </table></div>`;
  }

  // ── Semáforo mensal ───────────────────────────────────────────────────────
  const semaBox = document.getElementById('an-semaforo');
  if (semaBox) {
    semaBox.innerHTML = MESES.map((m, i) => {
      const cx = filtrar(ano, m);
      const s  = somarContratos(cx);
      const mt = (D.metas||{})[`${ano}-${m}`] || {};
      const mFat = parseFloat(mt.fat||0);
      const pct  = mFat > 0 ? s.fat/mFat*100 : null;
      const cor  = pct === null ? '#2A2F42' : pct >= 100 ? '#4FC78E' : pct >= 80 ? '#F7C84F' : '#F74F6B';
      const bg   = pct === null ? '#1A1F2E' : pct >= 100 ? '#0D2E1A' : pct >= 80 ? '#2E2A0D' : '#2E0D0D';
      const revisar = pct !== null && pct >= 100
        ? `<div onclick="event.stopPropagation();revisarMeta('${ano}-${m}','${MESES_NOME[i]}')"
            style="font-size:9px;background:#4FC78E;color:#000;border-radius:4px;padding:2px 6px;margin-top:4px;cursor:pointer;font-weight:700">
            ↑ Revisar meta
           </div>` : '';
      return `<div onclick="document.getElementById('an-mes').value='${m}';rAnalise()"
        style="cursor:pointer;background:${bg};border:1px solid ${cor};border-radius:8px;padding:10px 14px;min-width:80px;text-align:center;transition:.2s"
        onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
        <div style="font-size:11px;color:#8B91A8;margin-bottom:4px">${MESES_NOME[i]}</div>
        <div style="font-size:16px;font-weight:700;color:${cor}">${pct !== null ? pct.toFixed(0)+'%' : cx.length > 0 ? cx.length+'ev' : '—'}</div>
        <div style="font-size:10px;color:#8B91A8;margin-top:2px">${cx.length} evento${cx.length !== 1 ? 's' : ''}</div>
        ${revisar}
      </div>`;
    }).join('');
  }
}

function rAnaliseConfig() {
  const ano = document.getElementById('an-ano')?.value || '2026';
  const anoPrev = String(parseInt(ano) - 1);
  const MESES_NOME = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const MESES = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  // Exibir meta anual configurada
  const metaAnualEl = document.getElementById('an-meta-anual-input');
  if (metaAnualEl && !metaAnualEl._loaded) {
    metaAnualEl.value = (D.metas||{}).metaAnual || '';
    metaAnualEl._loaded = true;
  }

  const configBody = document.getElementById('an-config-body');
  if (!configBody) return;

  // Total histórico do ano anterior para calcular proporção
  const totalHist = MESES.reduce((s,m) => s + (parseFloat((D.historico||{})[`${anoPrev}-${m}`]?.fat)||0), 0);

  configBody.innerHTML = MESES.map((m, i) => {
    const hKey = `${anoPrev}-${m}`;
    const mKey = `${ano}-${m}`;
    const h  = (D.historico||{})[hKey] || {};
    const mt = (D.metas||{})[mKey] || {};
    const metaAnual = parseFloat((D.metas||{}).metaAnual) || 0;
    const hFat = parseFloat(h.fat||0);
    // Meta sugerida = proporcional ao histórico
    const metaSugerida = (totalHist > 0 && metaAnual > 0) ? (hFat/totalHist*metaAnual).toFixed(2) : '';
    const metaAtual = mt.fat || metaSugerida;
    return `<tr style="border-bottom:1px solid #1E2333">
      <td style="padding:8px 12px;color:#E8EAF0;font-weight:500">${MESES_NOME[i]}</td>
      <td style="padding:6px 8px"><input class="inp" type="number" style="width:90px" placeholder="PAX" value="${h.pax||''}"
        onchange="salvarHistorico('${hKey}','pax',this.value)"></td>
      <td style="padding:6px 8px"><input class="inp" type="number" style="width:120px" placeholder="R$" value="${hFat||''}"
        onchange="salvarHistorico('${hKey}','fat',this.value);rAnaliseConfig()"></td>
      <td style="padding:6px 8px"><input class="inp" type="number" style="width:90px" placeholder="PAX meta" value="${mt.pax||''}"
        onchange="salvarMeta('${mKey}','pax',this.value)"></td>
      <td style="padding:6px 8px">
        <div style="display:flex;align-items:center;gap:6px">
          <input class="inp" type="number" style="width:120px" placeholder="R$ meta"
            value="${metaAtual}"
            onchange="salvarMeta('${mKey}','fat',this.value)">
          ${metaSugerida && !mt.fat ? `<button class="btn-sm" style="font-size:10px;padding:3px 7px;white-space:nowrap" onclick="salvarMeta('${mKey}','fat',${metaSugerida});rAnaliseConfig()" title="Usar sugestão">✓ usar</button>` : ''}
        </div>
        ${metaSugerida ? `<div style="font-size:10px;color:#8B91A8;margin-top:2px">Sugerido: R$ ${parseFloat(metaSugerida).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>` : ''}
      </td>
    </tr>`;
  }).join('');
}

function distribuirMetaAnual() {
  const metaAnual = parseFloat(document.getElementById('an-meta-anual-input')?.value||0);
  if (!metaAnual || metaAnual <= 0) { alert('Digite a meta anual primeiro.'); return; }
  const ano = document.getElementById('an-ano')?.value || '2026';
  const anoPrev = String(parseInt(ano) - 1);
  const MESES = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const totalHist = MESES.reduce((s,m) => s + (parseFloat((D.historico||{})[`${anoPrev}-${m}`]?.fat)||0), 0);
  if (totalHist === 0) { alert('Insira o histórico de ' + anoPrev + ' antes de distribuir.'); return; }

  if (!D.metas) D.metas = {};
  D.metas.metaAnual = metaAnual;
  MESES.forEach(m => {
    const hFat = parseFloat((D.historico||{})[`${anoPrev}-${m}`]?.fat||0);
    const mKey = `${ano}-${m}`;
    if (!D.metas[mKey]) D.metas[mKey] = {};
    D.metas[mKey].fat = parseFloat((hFat/totalHist*metaAnual).toFixed(2));
  });
  sv('metas');
  rAnaliseConfig();
  alert('✅ Metas distribuídas proporcionalmente ao histórico de ' + anoPrev + '!');
}

function salvarHistorico(chave, campo, valor) {
  if (!D.historico) D.historico = {};
  if (!D.historico[chave]) D.historico[chave] = {};
  D.historico[chave][campo] = parseFloat(valor) || 0;
  sv('historico');
}

function salvarMeta(chave, campo, valor) {
  if (!D.metas) D.metas = {};
  if (!D.metas[chave]) D.metas[chave] = {};
  D.metas[chave][campo] = parseFloat(valor) || 0;
  sv('metas');
}

function importarCSVAnalise(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const linhas = e.target.result.split('\n').map(l => l.trim()).filter(Boolean);
    const MESES_MAP = {
      'jan':'01','fev':'02','mar':'03','abr':'04','mai':'05','jun':'06',
      'jul':'07','ago':'08','set':'09','out':'10','nov':'11','dez':'12',
      'janeiro':'01','fevereiro':'02','março':'03','abril':'04','maio':'05','junho':'06',
      'julho':'07','agosto':'08','setembro':'09','outubro':'10','novembro':'11','dezembro':'12'
    };

    let importados = 0;
    linhas.forEach(linha => {
      // Detecta separador: ; ou ,
      const sep = linha.includes(';') ? ';' : ',';
      const cols = linha.split(sep).map(c => c.trim().replace(/["']/g,''));
      if (cols.length < 3) return;

      // Formato esperado: MES | ANO | PAX | FATURAMENTO  ou  MES/ANO | PAX | FAT
      let mesNome = cols[0].toLowerCase();
      let ano, pax, fat;

      if (cols.length >= 4) {
        // MES ; ANO ; PAX ; FAT
        ano = cols[1];
        pax = parseFloat(cols[2].replace(/[^\d,]/g,'').replace(',','.')) || 0;
        fat = parseFloat(cols[3].replace(/[^\d,]/g,'').replace(',','.')) || 0;
      } else {
        // MES/ANO ; PAX ; FAT
        const partes = mesNome.split(/[\/\-]/);
        mesNome = partes[0];
        ano = partes[1] || cols[1];
        pax = parseFloat(cols[1].replace(/[^\d,]/g,'').replace(',','.')) || 0;
        fat = parseFloat(cols[2].replace(/[^\d,]/g,'').replace(',','.')) || 0;
      }

      const mesNum = MESES_MAP[mesNome] || MESES_MAP[mesNome.substring(0,3)];
      if (!mesNum || !ano || (!pax && !fat)) return;

      const anoAtual = document.getElementById('an-ano')?.value || '2026';
      const chave = `${ano}-${mesNum}`;

      if (ano === String(parseInt(anoAtual) - 1)) {
        if (!D.historico) D.historico = {};
        if (!D.historico[chave]) D.historico[chave] = {};
        if (pax) D.historico[chave].pax = pax;
        if (fat) D.historico[chave].fat = fat;
      } else if (ano === anoAtual) {
        if (!D.metas) D.metas = {};
        if (!D.metas[chave]) D.metas[chave] = {};
        if (pax) D.metas[chave].pax = pax;
        if (fat) D.metas[chave].fat = fat;
      }
      importados++;
    });

    if (importados > 0) {
      sv('historico'); sv('metas');
      alert(`✅ ${importados} linhas importadas! Atualize a tela.`);
      rAnaliseConfig();
    } else {
      alert('Nenhuma linha reconhecida. Verifique o formato: MES;ANO;PAX;FATURAMENTO');
    }
  };
  reader.readAsText(file, 'UTF-8');
}


function rContratos() {
  const dataIni = document.getElementById('ct-data-ini')?.value || '';
  const dataFim = document.getElementById('ct-data-fim')?.value || '';
  const busca = (document.getElementById('ct-busca')?.value || '').trim().toLowerCase();
  const todos = D.contratos || [];
  gerarAnosFromData('ct-ano', todos.map(function(c){ return c.data; }));
  const lista = todos.filter(c => {
    if (c.data) {
      if (dataIni && c.data < dataIni) return false;
      if (dataFim && c.data > dataFim) return false;
    }
    if (busca) {
      const alvo = `${c.nome||''} ${c.nomeEvento||''}`.toLowerCase();
      if (!alvo.includes(busca)) return false;
    }
    return true;
  });
  // Cards de resumo — refletem os contratos que passaram no filtro (busca/data),
  // igual ao que já aparece na tabela. Cancelado fica de fora: não é venda fechada.
  const valorEl = document.getElementById('ct-total-valor');
  if (valorEl) {
    const fechados = lista.filter(c => c.status !== 'cancelado');
    const total = fechados.reduce((s, c) => s + (parseFloat((c.opcao||'0').toString().replace(/[^\d,]/g,'').replace(',','.')) || 0), 0);
    valorEl.textContent = 'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const cancelados = lista.length - fechados.length;
    document.getElementById('ct-total-sub').textContent = cancelados ? (cancelados + ' cancelado' + (cancelados !== 1 ? 's' : '') + ' fora da conta') : 'nenhum cancelado no filtro';

    document.getElementById('ct-total-contratos').textContent = fechados.length.toLocaleString('pt-BR');
    document.getElementById('ct-total-contratos-sub').textContent = cancelados ? ('+ ' + cancelados + ' cancelado' + (cancelados !== 1 ? 's' : '')) : 'todos ativos/concluídos';

    const clientesUnicos = new Set(fechados.map(c => (c.nome || '').toLowerCase().trim()).filter(Boolean));
    document.getElementById('ct-total-clientes').textContent = clientesUnicos.size.toLocaleString('pt-BR');
  }

  const tbody = document.getElementById('contratos-body');
  if (!tbody) return;
  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#8B91A8;padding:24px">Nenhum contrato encontrado</td></tr>';
    return;
  }
  const statCor = { ativo:'tag-blue', concluido:'tag-green', cancelado:'tag-red' };
  tbody.innerHTML = '';
  [...lista].sort((a,b) => (b.data||'').localeCompare(a.data||'')).forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.nome||'—'}</strong></td>
      <td>${c.tipo||'—'}</td>
      <td>${fd(c.data)}</td>
      <td style="text-align:center">${c.convidados||'—'}</td>
      <td style="font-size:12px">${c.local||'—'}</td>
      <td style="font-size:12px;color:#A8ADB8">${c.equipeTexto||'—'}</td>
      <td>${c.opcao ? 'R$ '+c.opcao : '—'}</td>
      <td><span class="tag ${statCor[c.status]||'tag-yellow'}">${c.status||'ativo'}</span></td>
      <td style="white-space:nowrap">
        <button class="btn-sm" onclick="abrirEdicaoContrato('${c.id}')" title="Editar contrato">✏️</button>
        <button class="btn-sm btn-red" onclick="excluirContrato('${c.id}')">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function excluirContrato(id) {
  if (!confirm('Excluir este contrato e todos os registros vinculados (agenda, financeiro, produção)?')) return;
  const c = (D.contratos||[]).find(x => x.id === id);
  const nomeC = c ? (c.nome||'').toLowerCase().trim() : '';
  const dataC = c ? c.data : '';
  D.contratos  = (D.contratos ||[]).filter(x => x.id !== id);
  // Remover por contratoId (registros novos) OU por nome+data (registros antigos sem contratoId)
  D.agenda     = (D.agenda    ||[]).filter(a => {
    if ((a.contratoId||'') === id) return false;
    if (!a.contratoId && nomeC && (a.nome||'').toLowerCase().includes(nomeC.split(' ')[0]) && a.data === dataC) return false;
    return true;
  });
  D.financeiro = (D.financeiro||[]).filter(f => {
    if ((f.contratoId||'') === id) return false;
    if (!f.contratoId && nomeC && (f.contrato||'').toLowerCase().includes(nomeC.split(' ')[0]) && f.data === dataC) return false;
    return true;
  });
  D.producoes  = (D.producoes ||[]).filter(p => {
    if ((p.contratoId||'') === id) return false;
    if (!p.contratoId && nomeC && (p.cliente||p.evento||'').toLowerCase().includes(nomeC.split(' ')[0]) && p.data === dataC) return false;
    return true;
  });
  sv('contratos'); sv('agenda'); sv('financeiro'); sv('producoes');
  rContratos();
}

function abrirEdicaoContrato(id) {
  const c = (D.contratos||[]).find(x => x.id === id);
  if (!c) return;
  document.getElementById('ec-id').value         = id;
  document.getElementById('ec-nome').value        = c.nome || '';
  document.getElementById('ec-nome-evento').value = c.nomeEvento || '';
  document.getElementById('ec-cpf').value         = c.cpf || '';
  document.getElementById('ec-tipo').value        = c.tipo || '';
  document.getElementById('ec-data').value        = c.data || '';
  document.getElementById('ec-convidados').value  = c.convidados || '';
  document.getElementById('ec-ini').value         = c.hrInicio || '';
  document.getElementById('ec-fim').value         = c.hrFim || '';
  document.getElementById('ec-opcao').value       = c.opcao || '';
  document.getElementById('ec-status').value      = c.status || 'ativo';
  document.getElementById('ec-local').value       = c.local || '';
  document.getElementById('ec-equipe').value      = c.equipeTexto || '';
  document.getElementById('ec-bebidas').value     = c.bebidasRomero || '';
  const ecCard = document.getElementById('ec-cardapio'); if(ecCard) ecCard.value = c.cardapio || '';
  document.getElementById('m-edit-contrato').style.display = 'flex';
}

function salvarEdicaoContrato() {
  const id   = document.getElementById('ec-id').value;
  const nome = document.getElementById('ec-nome').value.trim();
  const data = document.getElementById('ec-data').value;
  if (!nome || !data) { alert2('Preencha Cliente e Data.', 'error'); return; }

  const idx = (D.contratos||[]).findIndex(x => x.id === id);
  if (idx === -1) return;

  const equipeTexto = document.getElementById('ec-equipe').value.trim();
  // Parser robusto: aceita "N Cargo · N Cargo" (com ·) ou "N Cargo N Cargo" (sem ·)
  const equipeArray = (() => {
    const res = [];
    if (/[·,;]|\s\.\s/.test(equipeTexto)) {
      // Separado por · ou " . " (ponto com espaços, formato legado)
      equipeTexto.split(/\s*[·,;]\s*|\s+\.\s+/).forEach(parte => {
        const m = parte.trim().match(/^(\d+)\.?\s+(.+)$/);
        if (m && parseInt(m[1]) > 0) res.push({ qtd: parseInt(m[1]), cargo: m[2].trim() });
      });
      if (res.length) return res;
    }
    // Sem ·: extrai pares "número [.] cargo" do texto livre
    const re = /\b(\d+)\.?\s+([A-Za-zÀ-ú][A-Za-zÀ-ú ]*?)(?=\s+\d|\s*$)/g;
    let m;
    while ((m = re.exec(equipeTexto)) !== null) {
      const qtd = parseInt(m[1]);
      const cargo = m[2].trim();
      if (qtd > 0 && cargo.length > 1) res.push({ qtd, cargo });
    }
    return res;
  })();

  const opcaoEditada = document.getElementById('ec-opcao').value.trim();
  // valorNum é o número de verdade usado em KPIs/relatórios (Fechamento Mensal
  // inclusive) — "opcao" é só o texto exibido. Sem isso, editar o valor do
  // contrato deixava a tela de Contratos mostrando um número e o Financeiro/
  // Fechamento Mensal (que lêem as parcelas 20%/80% já lançadas) mostrando
  // outro, porque as parcelas nunca eram recalculadas. Isso NÃO corrige
  // parcelas já lançadas (ver "🔍 Verificar parcelas" no Financeiro para as
  // pendentes; parcelas já pagas exigem correção manual, de propósito).
  const valorNumEditado = parseFloat(opcaoEditada.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

  D.contratos[idx] = {
    ...D.contratos[idx],
    nome,
    nomeEvento:   document.getElementById('ec-nome-evento').value.trim(),
    cpf:          document.getElementById('ec-cpf').value.trim(),
    tipo:         document.getElementById('ec-tipo').value.trim(),
    data,
    convidados:   document.getElementById('ec-convidados').value.trim(),
    hrInicio:     document.getElementById('ec-ini').value,
    hrFim:        document.getElementById('ec-fim').value,
    opcao:        opcaoEditada,
    valorNum:     valorNumEditado || D.contratos[idx].valorNum,
    status:       document.getElementById('ec-status').value,
    local:        document.getElementById('ec-local').value.trim(),
    equipeTexto,
    equipe:       equipeArray,
    equipeTotal:  equipeArray.reduce((s,e)=>s+(e.qtd||0),0),
    bebidasRomero: document.getElementById('ec-bebidas').value.trim(),
    cardapio: (document.getElementById('ec-cardapio')?.value||'').trim(),
  };

  // ── Sincronizar Agenda, Financeiro e Produção com os novos dados ──────────
  sincronizarContratoComAbas(D.contratos[idx]);

  sv('contratos');
  rContratos();
  document.getElementById('m-edit-contrato').style.display = 'none';
}

// ─── SINCRONIZAÇÃO CONTRATO → ABAS ───────────────────────────────────────────
// Atualiza (ou cria) os registros vinculados em Agenda, Financeiro e Produção
// para um contrato já existente. Usado na edição e na reparação de dados antigos.
function sincronizarContratoComAbas(c) {
  const id = c.id;
  if (!id) return;

  const nomeChave = (c.nome||'').toLowerCase().split(' ')[0];

  // IDs válidos — para detectar contratoId obsoleto (de reparação anterior errada)
  const idsValidos = new Set((D.contratos||[]).map(x => x.id).filter(Boolean));

  // Busca robusta: id exato → fallback por nome+data (mesmo que tenha contratoId obsoleto)
  const acharNaAgenda = () => D.agenda.findIndex(a => {
    if (a.contratoId === id) return true;
    if (a.data !== c.data) return false;
    const nomeA = (a.nome||'').toLowerCase();
    const nomeMatch = nomeA.includes(nomeChave) ||
                      nomeA.includes((c.nomeEvento||'').toLowerCase().split(' ')[0]);
    if (!nomeMatch) return false;
    // Aceita: sem contratoId OU contratoId obsoleto (não aponta para nenhum contrato)
    return !a.contratoId || !idsValidos.has(a.contratoId);
  });

  // ── AGENDA ─────────────────────────────────────────────────────────────────
  if (!D.agenda) D.agenda = [];
  const agIdx = acharNaAgenda();
  const agDados = {
    contratoId:  id,
    nome:        c.nomeEvento||c.nome,
    data:        c.data,
    tipo:        c.tipo||'',
    local:       c.local||'',
    convidados:  c.convidados||'',
    hrInicio:    c.hrInicio||'',
    hrFim:       c.hrFim||'',
    duracao:     c.duracao||'',
    equipe:      c.equipe||[],
    equipeTexto: c.equipeTexto||'',
    equipeTotal: c.equipeTotal||0
  };
  if (agIdx !== -1) {
    D.agenda[agIdx] = { ...D.agenda[agIdx], ...agDados };
  } else {
    registrarEventoNaAgenda({
      ...agDados, conv: c.convidados,
      hrIni: c.hrInicio, hrFim: c.hrFim
    });
    return; // sv('agenda') já chamado dentro de registrarEventoNaAgenda
  }
  sv('agenda');

  // ── FINANCEIRO ─────────────────────────────────────────────────────────────
  if (!D.financeiro) D.financeiro = [];
  const finDados = { contratoId:id, contrato:c.nome, evento:c.nomeEvento||c.nome,
                     data:c.data, tipo:c.tipo||'', convidados:c.convidados||'' };
  let finAtualizado = false;
  D.financeiro.forEach((f, fi) => {
    if (f.contratoId === id ||
        (!f.contratoId && (f.contrato||'').toLowerCase().includes(nomeChave) && f.data === c.data)) {
      D.financeiro[fi] = { ...D.financeiro[fi], ...finDados };
      finAtualizado = true;
    }
  });
  if (finAtualizado) sv('financeiro');

  // ── PRODUÇÃO ───────────────────────────────────────────────────────────────
  if (!D.producoes) D.producoes = [];
  const prdIdx = D.producoes.findIndex(p =>
    p.contratoId === id ||
    (!p.contratoId && (p.cliente||p.evento||'').toLowerCase().includes(nomeChave) && p.data === c.data)
  );
  if (prdIdx !== -1) {
    D.producoes[prdIdx] = {
      ...D.producoes[prdIdx],
      contratoId:  id,
      evento:      c.nomeEvento||c.nome,
      cliente:     c.nome,
      tipo:        c.tipo||'',
      data:        c.data,
      convidados:  c.convidados||'',
      local:       c.local||'',
      hrInicio:    c.hrInicio||'',
      hrFim:       c.hrFim||'',
      duracao:     c.duracao||'',
      equipe:      c.equipe||[],
      equipeTexto: c.equipeTexto||'',
      transporte:  c.transporte||''
    };
    sv('producoes');
  }
}

// ─── REPARAÇÃO DE DADOS HISTÓRICOS ───────────────────────────────────────────
// Corrige vínculos quebrados em contratos importados antes da correção do bug.
// Pode ser chamada uma única vez para corrigir a base existente.
function repararVinculosContratos() {
  if (!confirm('Isso vai sincronizar TODOS os contratos com Agenda, Financeiro e Produção\n(equipe, local, horário, etc. serão atualizados).\n\nContinuar?')) return;
  let corrigidos = 0;
  const nomeChave = c => (c.nome||'').toLowerCase().split(' ')[0];

  // IDs válidos — para detectar contratoId obsoleto
  const idsValidos = new Set((D.contratos||[]).map(x => x.id).filter(Boolean));

  // ── PASSO 0: remover duplicatas na agenda (mesmo contratoId ou mesmo nome+data) ─
  const agendaLimpa = [];
  const agendaVistos = new Set();
  (D.agenda||[]).forEach(a => {
    const key = (a.contratoId && idsValidos.has(a.contratoId))
      ? 'id:' + a.contratoId
      : 'nd:' + (a.nome||'').toLowerCase().trim() + '|' + a.data;
    if (!agendaVistos.has(key)) {
      agendaVistos.add(key);
      agendaLimpa.push(a);
    } else {
      corrigidos++; // conta como duplicata removida
    }
  });
  D.agenda = agendaLimpa;

  (D.contratos||[]).forEach(c => {
    const id = c.id;
    const chave = nomeChave(c);
    const chaveEvento = (c.nomeEvento||'').toLowerCase().split(' ')[0];

    // Campos completos que devem ser espelhados do contrato → agenda
    const agDados = {
      contratoId:  id,
      nome:        c.nomeEvento||c.nome,
      data:        c.data,
      tipo:        c.tipo||'',
      local:       c.local||'',
      convidados:  c.convidados||'',
      hrInicio:    c.hrInicio||'',
      hrFim:       c.hrFim||'',
      duracao:     c.duracao||'',
      equipe:      c.equipe||[],
      equipeTexto: c.equipeTexto||'',
      equipeTotal: c.equipeTotal||0
    };

    // ── AGENDA: busca robusta (aceita contratoId obsoleto como fallback) ──────
    const agIdx = (D.agenda||[]).findIndex(a => {
      if (a.contratoId === id) return true;
      if (a.data !== c.data) return false;
      const nomeA = (a.nome||'').toLowerCase();
      if (!nomeA.includes(chave) && !(chaveEvento && nomeA.includes(chaveEvento))) return false;
      return !a.contratoId || !idsValidos.has(a.contratoId); // sem vínculo ou vínculo obsoleto
    });

    if (agIdx !== -1) {
      D.agenda[agIdx] = { ...D.agenda[agIdx], ...agDados };
      corrigidos++;
    } else if (c.data && c.nome) {
      if (!D.agenda) D.agenda = [];
      D.agenda.push({
        id: 'AG'+Date.now()+'_'+corrigidos,
        ...agDados, fonte: 'contrato'
      });
      corrigidos++;
    }

    // ── FINANCEIRO: corrigir contratoId e dados básicos ───────────────────────
    (D.financeiro||[]).forEach((f, fi) => {
      if (f.contratoId === id ||
          (!f.contratoId && (f.contrato||'').toLowerCase().includes(chave) && f.data === c.data)) {
        D.financeiro[fi] = {
          ...D.financeiro[fi],
          contratoId: id,
          contrato:   c.nome,
          evento:     c.nomeEvento||c.nome,
          data:       c.data,
          tipo:       c.tipo||'',
          convidados: c.convidados||''
        };
        corrigidos++;
      }
    });

    // ── PRODUÇÃO: corrigir contratoId e dados básicos ─────────────────────────
    (D.producoes||[]).forEach((p, pi) => {
      if (p.contratoId === id ||
          (!p.contratoId && (p.cliente||p.evento||'').toLowerCase().includes(chave) && p.data === c.data)) {
        D.producoes[pi] = {
          ...D.producoes[pi],
          contratoId:  id,
          evento:      c.nomeEvento||c.nome,
          cliente:     c.nome,
          tipo:        c.tipo||'',
          data:        c.data,
          convidados:  c.convidados||'',
          local:       c.local||'',
          hrInicio:    c.hrInicio||'',
          hrFim:       c.hrFim||'',
          duracao:     c.duracao||'',
          equipe:      c.equipe||[],
          equipeTexto: c.equipeTexto||'',
          transporte:  c.transporte||''
        };
        corrigidos++;
      }
    });
  });

  sv('agenda'); sv('financeiro'); sv('producoes');
  alert('✅ Sincronização concluída!\n' + corrigidos + ' registros atualizados em ' + (D.contratos||[]).length + ' contratos.\n\nA agenda já reflete a equipe atual de cada contrato.');
}

// ─── CONFERIR VALORES (contrato x parcelas 20%/80% já lançadas) ─────────────
// Diferente de "🔧 Reparar vínculos" (que só arruma qual contrato cada
// registro aponta) e do "🔍 Verificar parcelas" do Financeiro (que só mexe em
// parcela ainda pendente): esta tela mostra TUDO que diverge, inclusive
// parcela já paga, e deixa a usuária decidir uma por uma o que corrigir —
// nunca aplica sozinho em cima de dinheiro já marcado como recebido.
var _conferirValoresPendente = []; // itens marcados pra aplicar, montado no preview

function abrirModalConferirValores() {
  var divergencias = (typeof _finTodasDivergenciasValor === 'function') ? _finTodasDivergenciasValor() : [];
  var listaEl = document.getElementById('conferir-valores-lista');
  var btnAplicar = document.getElementById('btn-aplicar-conferir-valores');

  if (!divergencias.length) {
    listaEl.innerHTML = '<p style="font-size:12px;color:var(--text3);padding:12px 0">Nenhuma divergência encontrada — todos os contratos com valor definido têm parcelas 20%/80% batendo no Financeiro.</p>';
    if (btnAplicar) btnAplicar.style.display = 'none';
    openM('mconferir-valores');
    return;
  }

  var linha = function(d, parcela, tipo) {
    // parcela pode ser null (falta lançar) ou o registro do Financeiro (diverge)
    var chk = 'cv-' + d.contrato.id + '-' + tipo;
    var esperado = tipo === 'p20' ? d.esperadoP20 : d.esperadoP80;
    var falta = tipo === 'p20' ? d.faltaP20 : d.faltaP80;
    var pago = parcela && parcela.status === 'pago';
    var descricaoTag = falta
      ? ('falta lançar (' + (tipo === 'p20' ? '20%' : '80%') + ')')
      : ((tipo === 'p20' ? '20%' : '80%') + ' — "' + (parcela.descricao || '') + '"' + (pago ? ' · já recebida' : ' · pendente'));
    return '<label style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer">' +
      '<input type="checkbox" id="' + chk + '" checked style="margin-top:2px">' +
      '<span style="flex:1">' +
        '<span style="color:' + (pago ? 'var(--amber)' : 'var(--text3)') + '">' + (pago ? '⚠️ ' : '') + descricaoTag + '</span><br>' +
        (falta
          ? '<span style="font-family:var(--mono)">criar ' + fR(esperado) + '</span>'
          : '<span style="font-family:var(--mono);color:var(--text3);text-decoration:line-through">' + fR(parcela.valorNum || 0) + '</span> <span style="font-family:var(--mono)">→ ' + fR(esperado) + '</span>') +
      '</span></label>';
  };

  listaEl.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">' + divergencias.length + ' contrato(s) com divergência:</div>' +
    divergencias.map(function(d) {
      var c = d.contrato;
      return '<div style="padding:8px 0;border-bottom:1px solid var(--border2)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
          '<span style="font-weight:600;font-size:12px">' + (c.nomeEvento || c.nome) + '</span>' +
          '<span style="font-size:11px;color:var(--text3)">' + fd(c.data) + ' · contrato: ' + fR(d.valorContrato) + '</span>' +
        '</div>' +
        (d.faltaP20 || d.p20Diverge ? linha(d, d.g && d.g.p20, 'p20') : '') +
        (d.faltaP80 || d.p80Diverge ? linha(d, d.g && d.g.p80, 'p80') : '') +
      '</div>';
    }).join('');

  if (btnAplicar) btnAplicar.style.display = '';
  openM('mconferir-valores');
}

function confirmarCorrecaoValoresContratos() {
  var divergencias = (typeof _finTodasDivergenciasValor === 'function') ? _finTodasDivergenciasValor() : [];
  if (!divergencias.length) { closeM('mconferir-valores'); return; }

  if (!D.financeiro) D.financeiro = [];
  var fmt = function(v) { return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }); };
  var criadas = 0, corrigidas = 0;

  divergencias.forEach(function(d) {
    var c = d.contrato;
    ['p20', 'p80'].forEach(function(tipo) {
      var chk = document.getElementById('cv-' + c.id + '-' + tipo);
      if (!chk || !chk.checked) return;
      var falta = tipo === 'p20' ? d.faltaP20 : d.faltaP80;
      var diverge = tipo === 'p20' ? d.p20Diverge : d.p80Diverge;
      var esperado = tipo === 'p20' ? d.esperadoP20 : d.esperadoP80;
      if (falta) {
        var venc = '';
        if (tipo === 'p80' && c.data) { var dt = new Date(c.data + 'T12:00:00'); dt.setDate(dt.getDate() - 7); venc = dt.toISOString().slice(0, 10); }
        D.financeiro.push({
          id: _gerarId('FIN'), contratoId: c.id || '', contrato: c.nome || '', evento: c.nomeEvento || c.nome || '—',
          data: c.data || '', tipo: c.tipo || '—', convidados: c.convidados || '—', status: 'pendente',
          descricao: tipo === 'p20' ? '20% — Assinatura do contrato' : '80% — 7 dias antes do evento',
          valorNum: esperado, valor: fmt(esperado), vencimento: venc,
        });
        criadas++;
      } else if (diverge) {
        var p = tipo === 'p20' ? d.g.p20 : d.g.p80;
        // Guarda o valor anterior no próprio registro — nada some, só fica marcado.
        if (!p.historicoCorrecaoValor) p.historicoCorrecaoValor = [];
        p.historicoCorrecaoValor.push({ de: p.valorNum || 0, para: esperado, em: new Date().toISOString() });
        p.valorNum = esperado;
        p.valor = fmt(esperado);
        corrigidas++;
      }
    });
  });

  sv('financeiro');
  closeM('mconferir-valores');
  if (typeof rContratos === 'function') rContratos();
  alert2(criadas + ' parcela(s) criada(s), ' + corrigidas + ' corrigida(s).');
}

function novoContrato() {
  dadosContrato = {};
  document.getElementById('contrato-form').style.display = 'none';
  document.getElementById('contrato-status').textContent = '';
  ['c-nome','c-cpf','c-endereco','c-hora-inicio','c-opcao'].forEach(id => { const el=document.getElementById(id);if(el)el.value='';});
}

// ─── CONTRATO MANUAL ──────────────────────────────────────────────────────────

function salvarContratoManual() {
  const nome  = document.getElementById('mn-nome')?.value?.trim();
  const data  = document.getElementById('mn-data')?.value;
  if (!nome || !data) { alert2('Preencha pelo menos Nome e Data do evento.', 'error'); return; }

  const tipo        = document.getElementById('mn-tipo')?.value || '';
  const convidados  = document.getElementById('mn-conv')?.value?.trim() || '';
  const local       = document.getElementById('mn-local')?.value?.trim() || '';
  const hrInicio    = document.getElementById('mn-ini')?.value || '';
  const hrFim       = document.getElementById('mn-fim')?.value || '';
  const equipeTexto = document.getElementById('mn-equipe')?.value?.trim() || '';
  const valorText   = document.getElementById('mn-valor')?.value?.trim() || '';
  const sinalText   = document.getElementById('mn-sinal')?.value?.trim() || '';
  const sinalVenc   = document.getElementById('mn-sinal-venc')?.value || new Date().toISOString().slice(0,10);
  const restVenc    = document.getElementById('mn-rest-venc')?.value || '';
  const status      = document.getElementById('mn-status')?.value || 'ativo';
  const transporte  = document.getElementById('mn-transporte')?.value || 'Por conta do colaborador';
  const cardapio    = document.getElementById('mn-cardapio')?.value?.trim() || '';
  const bebidasRomero  = document.getElementById('mn-bebidas-romero')?.value?.trim() || '';
  const bebidasCliente = document.getElementById('mn-bebidas-cliente')?.value?.trim() || '';
  const obs         = document.getElementById('mn-obs')?.value?.trim() || '';

  const valorNum = parseFloat((valorText||'0').replace(/\./g,'').replace(',','.')) || 0;

  // Calcular parcelas
  let parcelas = [];
  if (valorNum > 0) {
    const sinalNum = sinalText
      ? (parseFloat(sinalText.replace(/\./g,'').replace(',','.')) || 0)
      : valorNum * 0.2;
    const restNum  = valorNum - sinalNum;
    const fmt = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    parcelas = [
      { valor: fmt(sinalNum), descricao: 'Sinal — assinatura do contrato', vencimento: sinalVenc },
      { valor: fmt(restNum),  descricao: 'Restante', vencimento: restVenc }
    ];
  }

  // Parser de equipe (mesmo padrão do editor)
  const equipeArray = (() => {
    const res = [];
    if (/[·,;]/.test(equipeTexto)) {
      equipeTexto.split(/\s*[·,;]\s*/).forEach(parte => {
        const m = parte.trim().match(/^(\d+)\.?\s+(.+)$/);
        if (m && parseInt(m[1]) > 0) res.push({ qtd: parseInt(m[1]), cargo: m[2].trim() });
      });
      if (res.length) return res;
    }
    const re = /\b(\d+)\.?\s+([A-Za-zÀ-ú][A-Za-zÀ-ú ]*?)(?=\s+\d|\s*$)/g;
    let m;
    while ((m = re.exec(equipeTexto)) !== null) {
      const qtd = parseInt(m[1]);
      const cargo = m[2].trim();
      if (qtd > 0 && cargo.length > 1) res.push({ qtd, cargo });
    }
    return res;
  })();

  // Duração automática se horários preenchidos
  let duracao = '';
  if (hrInicio && hrFim) {
    const [hi, mi] = hrInicio.split(':').map(Number);
    let [hf, mf]   = hrFim.split(':').map(Number);
    if (hf < hi) hf += 24;
    const mins = (hf * 60 + mf) - (hi * 60 + mi);
    duracao = Math.floor(mins / 60) + 'h' + (mins % 60 ? (mins % 60) + 'min' : '');
  }

  const contrato = {
    nome, cpf: document.getElementById('mn-cpf')?.value?.trim() || '',
    tipo, nomeEvento: nome, data,
    local, convidados, hrInicio, hrFim, duracao,
    equipe: equipeArray,
    equipeTexto: equipeTexto || equipeArray.map(e => `${e.qtd} ${e.cargo}`).join(' · '),
    equipeTotal: equipeArray.reduce((s, e) => s + (e.qtd || 0), 0),
    opcao: valorText, valorNum,
    parcelas,
    parc1: parcelas[0]?.valor || '',
    parc2: parcelas[1]?.valor || '',
    transporte, cardapio,
    bebidasRomero, bebidasCliente,
    obs, status,
    origem: 'manual'
  };

  salvarContratoCompleto(contrato);
  limparContratoManual();
  alert('Contrato salvo! Agenda, financeiro e produção atualizados.');
  setContratoView('lista');
}

function limparContratoManual() {
  ['mn-nome','mn-cpf','mn-conv','mn-local','mn-equipe','mn-valor','mn-sinal',
   'mn-sinal-venc','mn-rest-venc','mn-cardapio','mn-bebidas-romero','mn-bebidas-cliente','mn-obs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['mn-tipo','mn-status','mn-ini','mn-fim','mn-data','mn-transporte'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = id === 'mn-status' ? 'ativo'
                     : id === 'mn-transporte' ? 'Por conta do colaborador' : '';
  });
}


// ═══════════════════════════════════════════════════════
