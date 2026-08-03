// ─── PROPOSTA EM PDF (aba do Orçamento) ──────────────────────────────────────
// Gera um documento de proposta comercial pra enviar ao cliente, a partir dos
// dados já preenchidos no orçamento. Ela escolhe quais campos/páginas
// aparecem (padrão + ajuste por orçamento) e o PDF sai pela tela de impressão
// do navegador — mesmo padrão já usado em Equipe/Despesas/Nav (window.print).

var PROPOSTA_CAMPOS = [
  { id: 'capa_numero',      grupo: 'Capa',         label: 'Número da proposta',              default: true },
  { id: 'capa_telefone',    grupo: 'Capa',         label: 'Telefone do cliente',             default: true },
  { id: 'capa_tipoEvento',  grupo: 'Capa',         label: 'Tipo de evento',                  default: true },
  { id: 'capa_local',       grupo: 'Capa',         label: 'Local do evento',                 default: true },
  { id: 'capa_convidados',  grupo: 'Capa',         label: 'Número de convidados',            default: true },
  { id: 'pag_institucional',grupo: 'Páginas',      label: 'Página institucional (sobre a Romero)', default: true },
  { id: 'pag_cardapio',     grupo: 'Páginas',      label: 'Sugestão de cardápio',            default: true },
  { id: 'pag_equipe',       grupo: 'Páginas',      label: 'Página da equipe',                default: true },
  { id: 'pag_complementos', grupo: 'Páginas',      label: 'Complementos (upsells)',          default: true },
  { id: 'pag_contato',      grupo: 'Páginas',      label: 'Página de contato',               default: true },
  { id: 'inv_essencial',    grupo: 'Investimento', label: 'Valor — Pacote Essencial',        default: true },
  { id: 'inv_completo',     grupo: 'Investimento', label: 'Valor — Pacote Completo',         default: true },
  { id: 'inv_destilados',   grupo: 'Investimento', label: 'Lista de destilados (só no Completo)', default: true },
  { id: 'inv_pagamento',    grupo: 'Investimento', label: 'Forma de pagamento',              default: true },
  { id: 'inv_tempoFesta',   grupo: 'Investimento', label: 'Tempo de festa / hora extra',     default: true },
];

function _propostaValor(orc, id) {
  var campo   = PROPOSTA_CAMPOS.find(function(c) { return c.id === id; });
  var def     = campo ? campo.default : true;
  var padrao  = (D.orcPrecos && D.orcPrecos.propostaConfigPadrao) || {};
  var overrid = (orc && orc.propostaConfig) || {};
  if (overrid[id] != null) return !!overrid[id];
  if (padrao[id]  != null) return !!padrao[id];
  return def;
}

function _propostaEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _propostaLocalLabel(p) {
  var localKey = (typeof _migrarLocalOrcamento === 'function') ? _migrarLocalOrcamento(p) : (p.local || 'area_central');
  var LOCAIS = (typeof REGIOES_LOCAL !== 'undefined')
    ? Object.fromEntries(REGIOES_LOCAL.map(function(r) { return [r.key, r.label]; }))
    : { area_central: 'Área Central BH', jardim_canada: 'Jardim Canadá / C. Nova', reg_metro: 'Região Metropolitana' };
  return LOCAIS[localKey] || localKey;
}

function _propostaTipoLabel(p) {
  var TIPOS = { casamento: 'Casamento', '15anos': '15 Anos', formatura: 'Formatura', outros: 'Outros' };
  return TIPOS[p.tipoEvento || 'outros'] || (p.tipoEvento || 'Evento');
}

// ─── ABA: EDIÇÃO DOS DADOS DA PROPOSTA ───────────────────────────────────────

function rOrcProposta(orc) {
  var el = document.getElementById('orc-det-content');
  if (!el) return;

  var grupos = {};
  PROPOSTA_CAMPOS.forEach(function(c) { (grupos[c.grupo] = grupos[c.grupo] || []).push(c); });

  var checklistHtml = Object.keys(grupos).map(function(grupo) {
    return '<div style="margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">' + grupo + '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:6px 14px">' +
      grupos[grupo].map(function(c) {
        var checked = _propostaValor(orc, c.id);
        return '<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2);cursor:pointer">' +
          '<input type="checkbox" ' + (checked ? 'checked' : '') +
          ' onchange="propostaToggleCampo(\'' + orc.id + '\',\'' + c.id + '\',this.checked)">' +
          c.label + '</label>';
      }).join('') +
      '</div></div>';
  }).join('');

  el.innerHTML =
    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-width:700px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">📄 Dados para a proposta</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">' +
        '<div><label class="lbl">Número da proposta</label>' +
          '<input class="inp" type="text" value="' + _propostaEsc(orc.numeroProposta || '') + '" placeholder="Ex: 0142" ' +
          'onchange="propostaSetCampo(\'' + orc.id + '\',\'numeroProposta\',this.value)"></div>' +
        '<div><label class="lbl">Telefone do cliente</label>' +
          '<input class="inp" type="text" value="' + _propostaEsc(orc.telefone || '') + '" placeholder="(31) 99999-9999" ' +
          'onchange="propostaSetCampo(\'' + orc.id + '\',\'telefone\',this.value)"></div>' +
      '</div>' +
      '<div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;flex-wrap:wrap;gap:8px">' +
          '<label class="lbl" style="margin-bottom:0">Texto do cardápio para a proposta (nome, ingredientes, copo)</label>' +
          '<button class="btn-sm" style="background:var(--bg3)" onclick="propostaSugerirCardapio(\'' + orc.id + '\')">↺ Sugerir a partir dos coquetéis aplicados</button>' +
        '</div>' +
        '<textarea class="inp" rows="8" style="width:100%;font-family:var(--mono);font-size:12px;resize:vertical" ' +
          'placeholder="Ex:&#10;Moscow Mule&#10;Vodka ou gin, ginger ale artesanal e espuma de gengibre · copo mule" ' +
          'onchange="propostaSetCampo(\'' + orc.id + '\',\'cardapioTexto\',this.value)">' + _propostaEsc(orc.cardapioTexto || '') + '</textarea>' +
      '</div>' +
    '</div>' +

    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-width:700px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">✅ O que aparece no PDF</div>' +
      checklistHtml +
      '<button class="btn-sm" style="background:var(--bg3);margin-top:6px" onclick="propostaUsarComoPadrao(\'' + orc.id + '\')">🔧 Usar esta configuração como padrão para novos orçamentos</button>' +
    '</div>' +

    '<button class="btn btn-primary" onclick="gerarPropostaOrc(\'' + orc.id + '\')">📄 Gerar PDF da Proposta</button>';
}

function propostaSetCampo(orcId, campo, valor) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc) return;
  orc[campo] = valor;
  sv('orcamentos');
}

function propostaToggleCampo(orcId, campoId, checked) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc) return;
  if (!orc.propostaConfig) orc.propostaConfig = {};
  orc.propostaConfig[campoId] = checked;
  sv('orcamentos');
}

function propostaSugerirCardapio(orcId) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc) return;
  var nomes = Array.from(new Set((orc.insumos || []).flatMap(function(i) { return i.coqueteis || []; })));
  if (!nomes.length) { alert2('Nenhum coquetel aplicado ainda na aba Cardápio.', 'error'); return; }
  orc.cardapioTexto = nomes.map(function(n) { return n + '\n[ingredientes] · [copo]'; }).join('\n\n');
  sv('orcamentos');
  rOrcProposta(orc);
}

function propostaUsarComoPadrao(orcId) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc) return;
  if (!confirm('Usar a configuração de campos visíveis deste orçamento como padrão para novos orçamentos?')) return;
  var padrao = {};
  PROPOSTA_CAMPOS.forEach(function(c) { padrao[c.id] = _propostaValor(orc, c.id); });
  if (!D.orcPrecos) D.orcPrecos = {};
  D.orcPrecos.propostaConfigPadrao = padrao;
  sv('orcPrecos');
  alert2('Configuração salva como padrão para novos orçamentos!');
}

// ─── GERAÇÃO DO PDF (janela de impressão) ────────────────────────────────────

function gerarPropostaOrc(orcId) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc) return;
  var w = window.open('', '_blank');
  if (!w) { alert2('O navegador bloqueou a janela. Permita pop-ups para gerar a proposta.', 'error'); return; }
  w.document.write(_propostaMontarHtml(orc));
  w.document.close();
}

function _propostaMontarHtml(orc) {
  var p       = orc.calcParams || {};
  var resumo  = (typeof _orcCalcResumo === 'function') ? _orcCalcResumo(orc) : { autoS: { bt: 0, bb: 0, hb: 0, cd: 0 }, insumos: [], valorTotal: 0, valorTotalEssencial: 0 };
  var autoS   = resumo.autoS || {};

  var qBartender = p.bartender != null ? p.bartender : (autoS.bt || 0);
  var qBarback   = p.barback   != null ? p.barback   : (autoS.bb || 0);
  var qHead      = p.head      != null ? p.head      : (autoS.hb || 0);
  var qCoord     = p.coord     != null ? p.coord     : (autoS.cd || 0);
  var qCopeiro   = p.copeiro   != null ? p.copeiro   : 0;

  var destilados = Array.from(new Set((resumo.insumos || [])
    .filter(function(i) { return i.cat === 'BEBIDAS ALCOÓLICAS'; })
    .map(function(i) { return i.nome; })));

  var paginas = [];

  // ── Página 1: Capa ──────────────────────────────────────────────────────
  var capaLinhas = [];
  if (_propostaValor(orc, 'capa_numero'))   capaLinhas.push(['Proposta', orc.numeroProposta || '—']);
  capaLinhas.push(['Nome', orc.nomeCliente || '—']);
  if (_propostaValor(orc, 'capa_telefone')) capaLinhas.push(['Telefone', orc.telefone || '—']);
  paginas.push(
    '<div class="prop-page prop-capa">' +
      '<div class="prop-corner tl">r.</div><div class="prop-corner tr">r.</div>' +
      '<div class="prop-corner bl">r.</div><div class="prop-corner br">r.</div>' +
      '<div class="prop-frame">' +
        '<h1 class="prop-h1">PROPOSTA DE SERVIÇO</h1>' +
        '<div class="prop-logo">romero<span class="prop-dot">.</span></div>' +
        '<div class="prop-tag">coquetéis exclusivos</div>' +
        '<div class="prop-capa-dados">' +
          capaLinhas.map(function(l) { return '<div><strong>' + l[0] + ':</strong> ' + _propostaEsc(l[1]) + '</div>'; }).join('') +
          '<hr class="prop-hr">' +
          '<div><strong>Evento:</strong> ' + (_propostaValor(orc, 'capa_tipoEvento') ? _propostaEsc(_propostaTipoLabel(p)) : '—') + '</div>' +
          '<div><strong>DATA:</strong> ' + _propostaEsc((typeof fd === 'function') ? fd(orc.dataEvento) : (orc.dataEvento || '—')) + '</div>' +
          '<div><strong>Local:</strong> ' + (_propostaValor(orc, 'capa_local') ? _propostaEsc(_propostaLocalLabel(p)) : '—') + '</div>' +
          '<div><strong>N° convidados:</strong> ' + (_propostaValor(orc, 'capa_convidados') ? (orc.convidados || '—') : '—') + '</div>' +
        '</div>' +
      '</div>' +
    '</div>');

  // ── Página 2: Institucional ─────────────────────────────────────────────
  if (_propostaValor(orc, 'pag_institucional')) {
    paginas.push(
      '<div class="prop-page">' +
        '<div class="prop-corner tl">r.</div><div class="prop-corner tr">r.</div>' +
        '<div class="prop-corner bl">r.</div><div class="prop-corner br">r.</div>' +
        '<div class="prop-frame">' +
          '<h2 class="prop-h2">CADA EVENTO É UMA CONVERSA.</h2>' +
          '<p class="prop-p">Há mais de 18 anos, atuamos com a coquetelaria clássica e autoral em casamentos, festas de 15 anos, aniversários e eventos corporativos.</p>' +
          '<div class="prop-box">Escuta ativa: criamos cada menu a partir do seu perfil e do estilo da celebração</div>' +
          '<div class="prop-box">Excelência técnica: bartenders experientes, processos bem estruturados e ritmo fluido de atendimento.</div>' +
          '<div class="prop-box">Estética funcional: um bar que é bonito, mas também pensado para funcionar com precisão.</div>' +
          '<div class="prop-box">Autenticidade: coquetéis que carregam histórias, não apenas sabores.</div>' +
        '</div>' +
      '</div>');
  }

  // ── Página 3: Cardápio ──────────────────────────────────────────────────
  if (_propostaValor(orc, 'pag_cardapio')) {
    var cardapioHtml = orc.cardapioTexto
      ? '<div class="prop-cardapio">' + _propostaEsc(orc.cardapioTexto).replace(/\n/g, '<br>') + '</div>'
      : '<div class="prop-p" style="opacity:.6">(nenhum coquetel definido — preencha o texto do cardápio na aba Proposta)</div>';
    paginas.push(
      '<div class="prop-page">' +
        '<div class="prop-corner tl">r.</div><div class="prop-corner tr">r.</div>' +
        '<div class="prop-corner bl">r.</div><div class="prop-corner br">r.</div>' +
        '<div class="prop-frame">' +
          '<h2 class="prop-h2">SUGESTÃO DE CARDÁPIO</h2>' +
          '<p class="prop-p">Este é apenas um recorte do cardápio. Agende sua degustação e descubra outras opções do nosso cardápio.<br>' +
          'Durante a degustação, ajustamos sabores e criações ao seu perfil e ao clima do evento.</p>' +
          cardapioHtml +
        '</div>' +
      '</div>');
  }

  // ── Página 4: Equipe ─────────────────────────────────────────────────────
  if (_propostaValor(orc, 'pag_equipe')) {
    var estrutura = [];
    if (qHead)     estrutura.push(qHead + ' Head Bartender' + (qHead > 1 ? 's' : ''));
    estrutura.push(qBartender + ' Bartender' + (qBartender !== 1 ? 's' : ''));
    if (qBarback)  estrutura.push(qBarback + ' Bar Back' + (qBarback > 1 ? 's' : ''));
    if (qCoord)    estrutura.push(qCoord + ' Coordenador' + (qCoord > 1 ? 'es' : ''));
    if (qCopeiro)  estrutura.push(qCopeiro + ' Copeiro' + (qCopeiro > 1 ? 's' : ''));
    paginas.push(
      '<div class="prop-page">' +
        '<div class="prop-corner tl">r.</div><div class="prop-corner tr">r.</div>' +
        '<div class="prop-corner bl">r.</div><div class="prop-corner br">r.</div>' +
        '<div class="prop-frame">' +
          '<h2 class="prop-h2">NOSSA EQUIPE</h2>' +
          '<p class="prop-p">Nossa equipe é treinada para que o bar acompanhe o ritmo da festa sem filas ou pausas indesejadas:</p>' +
          '<ul class="prop-lista">' + estrutura.map(function(e) { return '<li>' + e + '</li>'; }).join('') + '</ul>' +
          '<p class="prop-p">O <u>uniforme</u> (aventais, gravatas, blazeres, coletes, entre outros) acompanha o estilo do evento, mantendo técnica e elegância na apresentação.</p>' +
          '<p class="prop-p" style="font-size:12px">*Transporte e alimentação da equipe já inclusos no orçamento.</p>' +
          '<h3 class="prop-h3">MATERIAIS E INSUMOS</h3>' +
          '<p class="prop-p">Todos os insumos, copos e materiais alinhados de acordo com o seu evento.</p>' +
          '<h3 class="prop-h3">ESTRUTURA DO BAR</h3>' +
          '<p class="prop-p">Fornecida pelo decorador ou contratante. Consideramos ideal a proporção 1 metro de balcão por profissional, além da necessidade de divisórias internas para melhor organização e eficiência.</p>' +
        '</div>' +
      '</div>');
  }

  // ── Página 5: Investimento ───────────────────────────────────────────────
  var mostraEssencial = _propostaValor(orc, 'inv_essencial');
  var mostraCompleto  = _propostaValor(orc, 'inv_completo');
  if (mostraEssencial || mostraCompleto) {
    var invBlocos = [];
    if (mostraEssencial) invBlocos.push(
      '<h3 class="prop-h3 prop-under">Essencial</h3>' +
      '<p class="prop-p">Você fornece as bebidas e nós entregamos todo o serviço técnico e a estrutura Romero, garantindo execução impecável.</p>' +
      '<div class="prop-valor">' + fR(resumo.valorTotalEssencial) + '</div>');
    if (mostraCompleto) invBlocos.push(
      '<h3 class="prop-h3 prop-under">Completo</h3>' +
      '<p class="prop-p">Seleção de bebidas importadas incluída, com serviço ilimitado e preparo sob medida.' +
      (_propostaValor(orc, 'inv_destilados') && destilados.length ? ' Rótulos como ' + _propostaEsc(destilados.join(', ')) + '.' : '') + '</p>' +
      '<div class="prop-valor">' + fR(resumo.valorTotal) + '</div>');
    if (_propostaValor(orc, 'inv_pagamento')) invBlocos.push(
      '<h3 class="prop-h3 prop-under">Forma de pagamento</h3>' +
      '<p class="prop-p">20% na contratação e 80% até 7 dias antes do evento. Eventuais quebras de materiais são cobradas após o evento, com transparência e alinhamento prévio.</p>');
    if (_propostaValor(orc, 'inv_tempoFesta')) invBlocos.push(
      '<h3 class="prop-h3 prop-under">Tempo de festa</h3>' +
      '<p class="prop-p">Serviço de recepção tem duração de 7 (sete) horas. O valor da hora extra é de 20% do total do orçamento.</p>');
    paginas.push(
      '<div class="prop-page">' +
        '<div class="prop-corner tl">r.</div><div class="prop-corner tr">r.</div>' +
        '<div class="prop-corner bl">r.</div><div class="prop-corner br">r.</div>' +
        '<div class="prop-frame">' +
          '<h2 class="prop-h2">INVESTIMENTO</h2>' +
          invBlocos.join('') +
        '</div>' +
      '</div>');
  }

  // ── Página 6: Complementos ───────────────────────────────────────────────
  if (_propostaValor(orc, 'pag_complementos')) {
    var complementos = [
      ['Signature cocktail', 'Criação de coquetéis exclusivos para personalizar a sua comemoração.'],
      ['Torre de Taças', 'Momento de celebração do casal'],
      ['Shots Interativos', 'Para momentos descontraídos e de interação entre os convidados'],
      ['Whiskeria', 'Apreciação de whiskys com rótulos selecionados'],
      ['Gelo Especial', 'Formatos diferenciados, valorizam a apresentação dos coquetéis e preservam os sabores.'],
      ['Estações móveis', 'Traz praticidade e dinamismo.'],
    ];
    paginas.push(
      '<div class="prop-page">' +
        '<div class="prop-corner tl">r.</div><div class="prop-corner tr">r.</div>' +
        '<div class="prop-corner bl">r.</div><div class="prop-corner br">r.</div>' +
        '<div class="prop-frame">' +
          '<h2 class="prop-h2">QUER ELEVAR AINDA MAIS A EXPERIÊNCIA?</h2>' +
          '<p class="prop-p">Alguns formatos que costumam encantar:</p>' +
          complementos.map(function(c) { return '<div class="prop-compl"><strong>' + c[0] + '</strong><br>' + c[1] + '</div>'; }).join('') +
          '<p class="prop-p" style="text-align:center;margin-top:14px">Valores sob consulta</p>' +
        '</div>' +
      '</div>');
  }

  // ── Página 7: Contato ────────────────────────────────────────────────────
  if (_propostaValor(orc, 'pag_contato')) {
    paginas.push(
      '<div class="prop-page">' +
        '<div class="prop-corner tl">r.</div><div class="prop-corner tr">r.</div>' +
        '<div class="prop-corner bl">r.</div><div class="prop-corner br">r.</div>' +
        '<div class="prop-frame prop-contato">' +
          '<div class="prop-logo">romero<span class="prop-dot">.</span></div>' +
          '<div class="prop-tag">coquetéis exclusivos</div>' +
          '<div class="prop-contatos">' +
            '<div>📞 +55 (31) 2567-5614</div>' +
            '<div>📞 +55 (31) 99691-5614</div>' +
            '<div>🌐 romerocoqueteis.com</div>' +
            '<div>📷 @romerodrinksecoqueteis</div>' +
            '<div>✉️ contato@romerocoqueteis.com</div>' +
          '</div>' +
        '</div>' +
      '</div>');
  }

  var titulo = 'Proposta — ' + (orc.nomeCliente || 'Romero Coquetéis');

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + _propostaEsc(titulo) + '</title>' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">' +
    '<style>' + _propostaCss() + '</style>' +
    '</head><body>' + paginas.join('') +
    '<script>window.onload=function(){window.print()};<\/script>' +
    '</body></html>';
}

function _propostaCss() {
  return [
    '@page{size:A4;margin:0}',
    '*{box-sizing:border-box}',
    'body{margin:0;font-family:"Nunito",sans-serif;color:#2f3b30;background:#8a8168}',
    '.prop-page{width:210mm;min-height:297mm;background:#cdbb8e;padding:14mm;page-break-after:always;position:relative}',
    '.prop-page:last-child{page-break-after:auto}',
    '.prop-corner{position:absolute;width:28px;height:28px;border-radius:50%;background:#2f3b30;color:#d97a35;font-family:"Playfair Display",serif;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;z-index:2}',
    '.prop-corner.tl{top:10mm;left:10mm}.prop-corner.tr{top:10mm;right:10mm}',
    '.prop-corner.bl{bottom:10mm;left:10mm}.prop-corner.br{bottom:10mm;right:10mm}',
    '.prop-frame{border:1px solid #4a4636;padding:22mm 14mm;height:calc(297mm - 28mm);position:relative}',
    '.prop-frame::before{content:"";position:absolute;inset:4mm;border:1px solid #4a4636}',
    '.prop-h1{font-family:"Playfair Display",serif;font-size:26px;font-weight:700;margin:14mm 0 16mm;position:relative;z-index:1}',
    '.prop-h2{font-family:"Playfair Display",serif;font-size:22px;font-weight:700;margin:0 0 10px;position:relative;z-index:1}',
    '.prop-h3{font-family:"Playfair Display",serif;font-size:16px;font-weight:700;margin:16px 0 6px;position:relative;z-index:1}',
    '.prop-under{text-decoration:underline}',
    '.prop-p{font-size:13px;line-height:1.5;margin:0 0 10px;position:relative;z-index:1}',
    '.prop-logo{font-family:"Playfair Display",serif;font-size:44px;font-weight:700;text-align:center;margin:20mm 0 4px;position:relative;z-index:1}',
    '.prop-dot{color:#d97a35}',
    '.prop-tag{text-align:center;color:#d97a35;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:20mm;position:relative;z-index:1}',
    '.prop-capa-dados{font-size:13px;line-height:1.9;position:relative;z-index:1}',
    '.prop-hr{border:none;border-top:1px solid #4a4636;margin:10px 0}',
    '.prop-box{border:1px solid #d97a35;border-radius:4px;padding:10px 12px;margin-bottom:10px;font-size:12px;line-height:1.5;position:relative;z-index:1}',
    '.prop-cardapio{font-size:13px;line-height:1.7;white-space:pre-wrap;position:relative;z-index:1}',
    '.prop-lista{font-size:13px;line-height:1.8;margin:0 0 10px;padding-left:18px;position:relative;z-index:1}',
    '.prop-valor{font-family:"Playfair Display",serif;font-size:20px;font-weight:700;margin:4px 0 14px;position:relative;z-index:1}',
    '.prop-compl{font-size:13px;line-height:1.5;margin-bottom:12px;position:relative;z-index:1}',
    '.prop-contato{display:flex;flex-direction:column;justify-content:center;align-items:center}',
    '.prop-contatos{margin-top:30mm;font-size:13px;line-height:2.2;text-align:center;position:relative;z-index:1}',
    '@media print{.prop-page{-webkit-print-color-adjust:exact;print-color-adjust:exact}}',
  ].join('');
}
