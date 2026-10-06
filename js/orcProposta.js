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
  var t = (typeof buscarTipoEventoPorId === 'function') ? buscarTipoEventoPorId(p.tipoEvento || 'outros') : null;
  return (t && t.nome) || (p.tipoEvento || 'Evento');
}

// Campos do cabeçalho do orçamento (Solicitado por, Contato, Local do evento,
// Hora…) — mesma leitura da tela (_orcInfo, js/orcamento.js), que busca na
// Solicitação vinculada. Antes a proposta lia a região de preço como "Local"
// e um telefone separado digitado só na aba Proposta.
function _propostaInfo(orc, campo) {
  return (typeof _orcInfo === 'function') ? _orcInfo(orc, campo) : (orc[campo] || '');
}

function _propostaLocalEvento(orc) {
  return _propostaInfo(orc, 'localEvento') || _propostaLocalLabel(orc.calcParams || {});
}

// Valor por extenso em reais: 12500 → "doze mil e quinhentos reais".
function _propostaExtenso(valor) {
  var UN = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze',
    'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  var DZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  var CT = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  function ate999(n) {
    if (n === 100) return 'cem';
    var partes = [], c = Math.floor(n / 100), r = n % 100;
    if (c) partes.push(CT[c]);
    if (r) partes.push(r < 20 ? UN[r] : DZ[Math.floor(r / 10)] + (r % 10 ? ' e ' + UN[r % 10] : ''));
    return partes.join(' e ');
  }
  function inteiro(n) {
    var mi = Math.floor(n / 1e6), mil = Math.floor(n / 1000) % 1000, resto = n % 1000;
    var grupos = [];
    if (mi)  grupos.push(mi === 1 ? 'um milhão' : ate999(mi) + ' milhões');
    if (mil) grupos.push(mil === 1 ? 'mil' : ate999(mil) + ' mil');
    if (resto) grupos.push(ate999(resto));
    if (grupos.length < 2) return grupos[0] || 'zero';
    // "e" antes do último grupo quando ele é redondo ou < 100
    // (doze mil e quinhentos / doze mil trezentos e cinquenta).
    var ultimo = grupos.pop();
    var ultimoN = resto || mil;
    var usaE = ultimoN < 100 || ultimoN % 100 === 0;
    return grupos.join(' ') + (usaE ? ' e ' : ' ') + ultimo;
  }
  var cents = Math.round((Number(valor) || 0) * 100);
  var reais = Math.floor(cents / 100), cent = cents % 100;
  var txtReais = '';
  if (reais) txtReais = inteiro(reais) + (reais % 1e6 === 0 ? ' de reais' : (reais === 1 ? ' real' : ' reais'));
  var txtCent = cent ? ate999(cent) + (cent === 1 ? ' centavo' : ' centavos') : '';
  return [txtReais, txtCent].filter(Boolean).join(' e ') || 'zero reais';
}

function _propostaValorTexto(v) {
  return fR(v) + ' (' + _propostaExtenso(v) + ')';
}

// Campo "Hora" do cabeçalho = duração da festa (ex: 06:00 = 6 horas). Chega
// em vários formatos (digitado "06:00", "6", ou da planilha "6:00:00 AM").
function _propostaHoraCabecalho(orc) {
  var t = String(_propostaInfo(orc, 'hora') || '').trim();
  var m = /(\d{1,2})(?:\s*[:hH]\s*(\d{2}))?(?::\d{2})?\s*(AM|PM)?/i.exec(t);
  if (!m) return null;
  var h = parseInt(m[1], 10), min = parseInt(m[2] || '0', 10);
  if (m[3] && /pm/i.test(m[3]) && h < 12) h += 12;
  if (m[3] && /am/i.test(m[3]) && h === 12) h = 0;
  return { h: h, min: min, texto: String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0') };
}

// Tempo de festa: a Hora do cabeçalho, quando preenchida (é o que o cliente
// pediu); senão a duração prevista + horas extras da Calculadora → Taxas e
// adicionais.
function _propostaTempoFesta(orc) {
  var he = (typeof _orcGetAdic === 'function') ? _orcGetAdic(orc).horaExtra : { duracao: 7, horas: 0 };
  var extras = Number(he.horas) || 0;
  var cab = _propostaHoraCabecalho(orc);
  if (cab && (cab.h || cab.min)) {
    var txt = cab.h + ' hora' + (cab.h === 1 ? '' : 's') + (cab.min ? ' e ' + cab.min + ' minutos' : '');
    return { total: cab.h, extras: 0, extrasCalc: extras, texto: txt };
  }
  var total = (Number(he.duracao) || 0) + extras;
  return { total: total, extras: extras, extrasCalc: extras, texto: total + ' hora' + (total === 1 ? '' : 's') };
}

// Tipo de evento da proposta: tipo da Solicitação (ex: "Aniversário") + o
// nome do evento do cabeçalho (ex: "16 ANOS") → "Aniversário 16 ANOS". Sem
// solicitação, cai no tipo da Calculadora.
function _propostaTipoEvento(orc) {
  var tipo = _propostaInfo(orc, 'tipoEvento') || _propostaTipoLabel(orc.calcParams || {});
  var nome = String(orc.nomeCliente || '').trim();
  var norm = function(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); };
  var solicitante = _propostaInfo(orc, 'solicitadoPor');
  if (!nome || norm(nome) === norm(solicitante)) return _propostaFrase(tipo);
  if (norm(nome).indexOf(norm(tipo)) !== -1) return _propostaFrase(nome);
  return _propostaFrase((tipo && norm(tipo) !== 'outros' ? tipo + ' ' : '') + nome);
}

// Nome de pessoa: "NICOLE CAIAFA PEDROSA" → "Nicole Caiafa Pedrosa"
// (de/da/do/dos/das/e ficam minúsculos: "Maria da Silva").
function _propostaNomeProprio(s) {
  return String(s || "").trim().toLowerCase().split(/\s+/).map(function(p, i) {
    if (i > 0 && /^(de|da|do|dos|das|e)$/.test(p)) return p;
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).join(" ");
}

// Frase: só a primeira letra maiúscula — "ANIVERSÁRIO 16 ANOS" → "Aniversário 16 anos".
function _propostaFrase(s) {
  var t = String(s || "").trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// "Cliente" na proposta = quem solicitou; sem isso, o nome do cabeçalho.
function _propostaCliente(orc) {
  return _propostaNomeProprio(_propostaInfo(orc, 'solicitadoPor') || orc.nomeCliente || '');
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

  var tpl = D.propostaTemplateDocx;
  var numeroEfetivo = _propostaNumeroEfetivo(orc);
  var cardapioAtual = _propostaCardapioTexto(orc);
  el.innerHTML =
    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-width:700px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">📄 Dados para a proposta</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">' +
        '<div><label class="lbl">Número da proposta</label>' +
          '<input class="inp" type="text" value="' + _propostaEsc(numeroEfetivo) + '" placeholder="Ex: 0142" ' +
          'onchange="propostaSetCampo(\'' + orc.id + '\',\'numeroProposta\',this.value)">' +
          '<div style="font-size:10px;color:var(--text3);margin-top:2px">Carrega sozinho do Nº da Solicitação de Orçamento vinculada, quando existir.</div></div>' +
        '<div style="font-size:11px;color:var(--text3);align-self:center">Cliente, Solicitado por, Contato, Data, Hora, Local e Convidados vêm do cabeçalho do orçamento, lá em cima — corrija lá.</div>' +
      '</div>' +
      '<div>' +
        '<label class="lbl">Cardápio na proposta</label>' +
        '<textarea class="inp" rows="8" readonly style="width:100%;font-family:var(--mono);font-size:12px;resize:vertical;opacity:.85;cursor:default">' + _propostaEsc(cardapioAtual) + '</textarea>' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px">Segue automaticamente os coquetéis aplicados na aba Cardápio (e a descrição cadastrada na Ficha de cada um).</div>' +
      '</div>' +
    '</div>' +

    '<details style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 20px;max-width:700px;margin-bottom:14px">' +
      '<summary style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;cursor:pointer">Marcações para o modelo Word</summary>' +
      '<div style="font-size:11px;color:var(--text3);margin:10px 0">Escreva no modelo .docx a marcação entre chaves, ex.: {LOCAL_EVENTO}. Ao gerar, ela é trocada pelo valor abaixo (deste orçamento).</div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:11px">' +
        _propostaMarcacoes(orc).map(function(m) {
          return '<tr style="border-top:1px solid var(--border)">' +
            '<td style="padding:5px 8px 5px 0;font-family:var(--mono);color:var(--text);white-space:nowrap;vertical-align:top">{' + m[0] + '}</td>' +
            '<td style="padding:5px 8px;color:var(--text3);vertical-align:top">' + _propostaEsc(m[1]) + '</td>' +
            '<td style="padding:5px 0;color:var(--text2);white-space:pre-line;vertical-align:top">' + (m[2] ? _propostaEsc(m[2].length > 160 ? m[2].slice(0, 160) + '…' : m[2]) : '<span style="opacity:.5">(vazio)</span>') + '</td>' +
          '</tr>';
        }).join('') +
      '</table>' +
    '</details>' +

    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-width:700px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">✅ O que aparece no PDF</div>' +
      checklistHtml +
      '<button class="btn-sm" style="background:var(--bg3);margin-top:6px" onclick="propostaUsarComoPadrao(\'' + orc.id + '\')">🔧 Usar esta configuração como padrão para novos orçamentos</button>' +
    '</div>' +

    '<button class="btn btn-primary" id="btn-gerar-proposta" onclick="gerarPropostaOrc(\'' + orc.id + '\')">' +
      (tpl ? '📄 Gerar Proposta (.docx)' : '📄 Gerar PDF da Proposta (versão simplificada)') + '</button>';
}

// ─── IMPORTAR MODELO (.docx) ──────────────────────────────────────────────────
// Vale pra todos os orçamentos (documento único, não por orçamento) — igual
// ao modelo de Contrato já usado em js/contratos.js, só que importável direto
// pela tela em vez de embutido no código.

// O modelo é salvo fatiado em vários documentos no Firestore (ver svFirebase
// em index.html), então não esbarra mais no limite de 1MB por documento —
// esse teto aqui é só pra pegar o caso de selecionar o arquivo errado.
var PROPOSTA_TEMPLATE_MAX_BYTES = 15 * 1024 * 1024;

function propostaImportarModelo(inputEl) {
  var file = inputEl.files && inputEl.files[0];
  if (!file) return;

  if (file.size > PROPOSTA_TEMPLATE_MAX_BYTES) {
    alert2('Esse arquivo tem ' + (file.size / 1024 / 1024).toFixed(1) + 'MB — parece grande demais pra ser o modelo da proposta. Confira se selecionou o arquivo certo.', 'error');
    inputEl.value = '';
    return;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    var bytes = new Uint8Array(e.target.result);
    var binario = '';
    for (var i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]);
    var base64 = btoa(binario);

    D.propostaTemplateDocx = {
      base64: base64,
      nome: file.name,
      tamanho: file.size,
      importadoEm: new Date().toISOString(),
    };
    sv('propostaTemplateDocx');
    alert2('Modelo importado! Já vale para gerar propostas.');
    if (typeof rOrcLista === 'function') rOrcLista();
  };
  reader.onerror = function() { alert2('Erro ao ler o arquivo.', 'error'); };
  reader.readAsArrayBuffer(file);
  inputEl.value = '';
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

// Cardápio da proposta segue direto os coquetéis aplicados na aba Cardápio do
// orçamento (orc.insumos[].coqueteis), puxando a descrição da Ficha de
// cada coquetel (Regras → Fichas de Coquetéis) — sempre calculado na hora,
// nunca um texto salvo que possa ficar desatualizado. O copo não entra (é
// informação interna, não vai pro cliente).
function _propostaCardapioTexto(orc) {
  var nomes = Array.from(new Set((orc.insumos || []).flatMap(function(i) { return i.coqueteis || []; })));
  if (!nomes.length) return '';
  return nomes.map(function(n) {
    var ficha = (D.fichas || []).find(function(f) { return f.nome === n; });
    var desc = (ficha && ficha.descricao) ? ficha.descricao : '';
    return n + (desc ? '\n' + desc : '');
  }).join('\n\n');
}

// Número da proposta: se não foi digitado manualmente, busca da Solicitação
// de Orçamento vinculada (mesmo Nº que já aparece lá) e já deixa salvo no
// orçamento pra não precisar buscar de novo.
function _propostaNumeroEfetivo(orc) {
  var fmt = function(n) { return (typeof _solNumeroTexto === 'function') ? _solNumeroTexto(n) : String(n); };
  if (orc.numeroProposta) return fmt(orc.numeroProposta);
  var sol = (D.solicitacoesOrcamento || []).find(function(s) { return s.orcamentoId === orc.id; });
  if (sol && sol.numero) {
    orc.numeroProposta = fmt(sol.numero);
    sv('orcamentos');
    return orc.numeroProposta;
  }
  return '';
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

// ─── DADOS DERIVADOS (compartilhados pelos dois geradores) ───────────────────

function _propostaDadosComputados(orc) {
  var p      = orc.calcParams || {};
  var resumo = (typeof _orcCalcResumo === 'function') ? _orcCalcResumo(orc) : { autoS: { bt: 0, bb: 0, hb: 0, cd: 0 }, insumos: [], valorTotal: 0, valorTotalEssencial: 0 };
  var autoS  = resumo.autoS || {};

  var qBartender = p.bartender != null ? p.bartender : (autoS.bt || 0);
  var qBarback   = p.barback   != null ? p.barback   : (autoS.bb || 0);
  var qHead      = p.head      != null ? p.head      : (autoS.hb || 0);
  var qCoord     = p.coord     != null ? p.coord     : (autoS.cd || 0);
  var qCopeiro   = p.copeiro   != null ? p.copeiro   : 0;

  // Comparação sem acento/caixa — categoria às vezes gravada sem acento
  // ("BEBIDAS ALCOOLICAS") em insumo/item antigo (ver mesmo ajuste em
  // _orcCalcResumo, js/orcCalc.js).
  var destilados = Array.from(new Set((resumo.insumos || [])
    .filter(function(i) { return (typeof _sepNormNome === 'function' ? _sepNormNome(i.cat) === _sepNormNome('BEBIDAS ALCOÓLICAS') : i.cat === 'BEBIDAS ALCOÓLICAS'); })
    .map(function(i) { return i.nome; })));

  return { p: p, resumo: resumo, qBartender: qBartender, qBarback: qBarback, qHead: qHead, qCoord: qCoord, qCopeiro: qCopeiro, destilados: destilados };
}

// Valores de cada marcação {TAG} do modelo .docx. Os nomes seguem os campos
// do cabeçalho do orçamento (Cliente, Solicitado por, Contato, Local do
// evento, Hora…). NOME_CLIENTE/TELEFONE continuam valendo pra modelos antigos.
// Também alimenta a tabela de referência mostrada na aba Proposta.
function _propostaMarcacoes(orc) {
  var d = _propostaDadosComputados(orc);
  var p = d.p;
  var v = function(id, valor) { return _propostaValor(orc, id) ? valor : ''; };
  var tempo   = _propostaTempoFesta(orc);
  var contato = _propostaInfo(orc, 'contato');
  var essencial = d.resumo.valorTotalEssencial || 0;
  var completo  = d.resumo.valorTotal || 0;
  return [
    ['NUMERO_PROPOSTA',          'Nº da proposta',            v('capa_numero', _propostaNumeroEfetivo(orc))],
    ['CLIENTE',                  'Cliente (Solicitado por)',  _propostaCliente(orc)],
    ['NOME_CLIENTE',             'Cliente (mesmo que CLIENTE)', _propostaCliente(orc)],
    ['NOME_EVENTO',              'Cliente / evento do cabeçalho', orc.nomeCliente || ''],
    ['SOLICITADO_POR',           'Solicitado por',            _propostaNomeProprio(_propostaInfo(orc, 'solicitadoPor'))],
    ['CONTATO',                  'Contato',                   v('capa_telefone', contato)],
    ['TELEFONE',                 'Contato (mesmo que CONTATO)', v('capa_telefone', contato)],
    ['TIPO_EVENTO',              'Tipo de evento',            v('capa_tipoEvento', _propostaTipoEvento(orc))],
    ['DATA_EVENTO',              'Data do evento',            (typeof fd === 'function') ? fd(orc.dataEvento) : (orc.dataEvento || '')],
    ['HORA',                     'Hora',                      (_propostaHoraCabecalho(orc) || {}).texto || ''],
    ['LOCAL_EVENTO',             'Local do evento',           v('capa_local', _propostaLocalEvento(orc))],
    ['CONVIDADOS',               'Convidados',                v('capa_convidados', String(orc.convidados || ''))],
    ['CARDAPIO',                 'Cardápio (nome + descrição)', _propostaCardapioTexto(orc)],
    ['EQUIPE',                   'Equipe (um cargo por linha)', _propostaEquipeLista(d).join('\n')],
    ['VALOR_ESSENCIAL',          'Valor Essencial + extenso', v('inv_essencial', _propostaValorTexto(essencial))],
    ['VALOR_ESSENCIAL_NUMERO',   'Valor Essencial só número', v('inv_essencial', fR(essencial))],
    ['VALOR_ESSENCIAL_EXTENSO',  'Valor Essencial só extenso', v('inv_essencial', _propostaExtenso(essencial))],
    ['VALOR_COMPLETO',           'Valor Completo + extenso',  v('inv_completo', _propostaValorTexto(completo))],
    ['VALOR_COMPLETO_NUMERO',    'Valor Completo só número',  v('inv_completo', fR(completo))],
    ['VALOR_COMPLETO_EXTENSO',   'Valor Completo só extenso', v('inv_completo', _propostaExtenso(completo))],
    ['DESTILADOS',               'Destilados (Completo)',     v('inv_destilados', d.destilados.join(', '))],
    ['TEMPO_FESTA',              'Tempo de festa',            v('inv_tempoFesta', tempo.texto)],
    ['HORAS_EXTRAS',             'Horas extras contratadas',  v('inv_tempoFesta', tempo.extrasCalc ? String(tempo.extrasCalc) : '')],
  ];
}

function _propostaEquipeLista(d) {
  var estrutura = [];
  if (d.qHead)    estrutura.push(d.qHead + ' Head Bartender' + (d.qHead > 1 ? 's' : ''));
  estrutura.push(d.qBartender + ' Bartender' + (d.qBartender !== 1 ? 's' : ''));
  if (d.qBarback) estrutura.push(d.qBarback + ' Bar Back' + (d.qBarback > 1 ? 's' : ''));
  if (d.qCoord)   estrutura.push(d.qCoord + ' Coordenador' + (d.qCoord > 1 ? 'es' : ''));
  if (d.qCopeiro) estrutura.push(d.qCopeiro + ' Copeiro' + (d.qCopeiro > 1 ? 's' : ''));
  return estrutura;
}

// ─── GERAÇÃO — DOCX (a partir do modelo importado, quando existe) ────────────
// Cardápio entra como texto (nome + descrição + copo, ver
// _propostaCardapioTexto) na marcação {CARDAPIO}. A ideia de inserir a foto
// de cada coquetel direto no .docx foi tentada e revertida — o módulo de
// imagem do Docxtemplater (docxtemplater-image-module-free) tem um bug de
// incompatibilidade com o DOM do navegador ("Cannot set property
// namespaceURI of #<Element> which has only a getter"), sem alternativa
// gratuita conhecida que funcione fora do Node. A foto continua disponível
// dentro do sistema, só não entra no arquivo gerado.

function _propostaGerarDocx(orc) {
  if (!window.PizZip || !window.Docxtemplater) {
    alert2('Bibliotecas de geração de Word ainda não carregaram — aguarde e tente novamente.', 'error');
    return Promise.resolve();
  }
  try {
    var tpl = D.propostaTemplateDocx;
    var templateBytes = Uint8Array.from(atob(tpl.base64), function(c) { return c.charCodeAt(0); });
    var zip  = new PizZip(templateBytes);
    // Marcação que não existe nos dados sai em branco (e não "undefined").
    var docx = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, nullGetter: function() { return ''; } });

    var dados = {};
    _propostaMarcacoes(orc).forEach(function(m) { dados[m[0]] = m[2]; });
    docx.setData(dados);
    docx.render();

    var blob = new Blob([docx.getZip().generate({ type: 'arraybuffer' })],
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Proposta_' + (orc.nomeCliente || 'cliente').split(' ')[0] + '.docx';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) {
    alert2('Erro ao gerar a proposta: ' + e.message + ' — confira se as marcações {TAG} no modelo estão digitadas certinho.', 'error');
  }
  return Promise.resolve();
}

// ─── GERAÇÃO — janela de impressão (alternativa enquanto não há modelo .docx) ─

function gerarPropostaOrc(orcId) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc) return;

  if (D.propostaTemplateDocx && D.propostaTemplateDocx.base64) {
    var btn = document.getElementById('btn-gerar-proposta');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Gerando…'; }
    _propostaGerarDocx(orc).then(function() { rOrcProposta(orc); });
    return;
  }

  var w = window.open('', '_blank');
  if (!w) { alert2('O navegador bloqueou a janela. Permita pop-ups para gerar a proposta.', 'error'); return; }
  w.document.write(_propostaMontarHtml(orc));
  w.document.close();
}

function _propostaMontarHtml(orc) {
  var d = _propostaDadosComputados(orc);
  var p = d.p;
  var qBartender = d.qBartender, qBarback = d.qBarback, qHead = d.qHead, qCoord = d.qCoord, qCopeiro = d.qCopeiro;
  var destilados = d.destilados;

  var paginas = [];

  // ── Página 1: Capa ──────────────────────────────────────────────────────
  var capaLinhas = [];
  if (_propostaValor(orc, 'capa_numero'))   capaLinhas.push(['Proposta', _propostaNumeroEfetivo(orc) || '—']);
  capaLinhas.push(['Cliente', _propostaCliente(orc) || '—']);
  if (_propostaValor(orc, 'capa_telefone')) capaLinhas.push(['Contato', _propostaInfo(orc, 'contato') || '—']);
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
          '<div><strong>Evento:</strong> ' + (_propostaValor(orc, 'capa_tipoEvento') ? _propostaEsc(_propostaTipoEvento(orc)) : '—') + '</div>' +
          '<div><strong>Data:</strong> ' + _propostaEsc((typeof fd === 'function') ? fd(orc.dataEvento) : (orc.dataEvento || '—')) + '</div>' +
          '<div><strong>Local:</strong> ' + (_propostaValor(orc, 'capa_local') ? _propostaEsc(_propostaLocalEvento(orc)) : '—') + '</div>' +
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
    var cardapioAtualHtml = _propostaCardapioTexto(orc);
    var cardapioHtml = cardapioAtualHtml
      ? '<div class="prop-cardapio">' + _propostaEsc(cardapioAtualHtml).replace(/\n/g, '<br>') + '</div>'
      : '<div class="prop-p" style="opacity:.6">(nenhum coquetel aplicado ainda na aba Cardápio)</div>';
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
    var estrutura = _propostaEquipeLista(d);
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
      '<div class="prop-valor">' + fR(d.resumo.valorTotalEssencial) + '</div>' +
      '<div class="prop-extenso">(' + _propostaExtenso(d.resumo.valorTotalEssencial) + ')</div>');
    if (mostraCompleto) invBlocos.push(
      '<h3 class="prop-h3 prop-under">Completo</h3>' +
      '<p class="prop-p">Seleção de bebidas importadas incluída, com serviço ilimitado e preparo sob medida.' +
      (_propostaValor(orc, 'inv_destilados') && destilados.length ? ' Rótulos como ' + _propostaEsc(destilados.join(', ')) + '.' : '') + '</p>' +
      '<div class="prop-valor">' + fR(d.resumo.valorTotal) + '</div>' +
      '<div class="prop-extenso">(' + _propostaExtenso(d.resumo.valorTotal) + ')</div>');
    if (_propostaValor(orc, 'inv_pagamento')) invBlocos.push(
      '<h3 class="prop-h3 prop-under">Forma de pagamento</h3>' +
      '<p class="prop-p">20% na contratação e 80% até 7 dias antes do evento. Eventuais quebras de materiais são cobradas após o evento, com transparência e alinhamento prévio.</p>');
    // Duração vem do orçamento (Calculadora → Taxas e adicionais: prevista +
    // horas extras antecipadas); antes era texto fixo "7 horas". Os 20% são
    // da hora extra pedida na hora, não mudam.
    var _tf = _propostaTempoFesta(orc), _sx = _tf.extras > 1 ? 's' : '';
    if (_propostaValor(orc, 'inv_tempoFesta')) invBlocos.push(
      '<h3 class="prop-h3 prop-under">Tempo de festa</h3>' +
      '<p class="prop-p">Serviço de recepção tem duração de ' + _tf.texto +
        (_tf.extras > 0 ? ' (já incluídas ' + _tf.extras + ' hora' + _sx + ' extra' + _sx + ' contratada' + _sx + ')' : '') +
        '. O valor da hora extra é de 20% do total do orçamento.</p>');
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
    '.prop-extenso{font-size:12px;font-style:italic;margin:-10px 0 14px;position:relative;z-index:1}',
    '.prop-compl{font-size:13px;line-height:1.5;margin-bottom:12px;position:relative;z-index:1}',
    '.prop-contato{display:flex;flex-direction:column;justify-content:center;align-items:center}',
    '.prop-contatos{margin-top:30mm;font-size:13px;line-height:2.2;text-align:center;position:relative;z-index:1}',
    '@media print{.prop-page{-webkit-print-color-adjust:exact;print-color-adjust:exact}}',
  ].join('');
}
