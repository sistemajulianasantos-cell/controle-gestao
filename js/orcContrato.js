// ─── GERAR CONTRATO A PARTIR DO ORÇAMENTO (pedido dela 10-22) ───────────────
// Botão "Gerar contrato" no card do orçamento: pergunta qual pacote fechou
// (Essencial/Completo) e os dados do cliente que o orçamento não tem (nome
// completo, CPF/CNPJ, endereço, horário de início). Gera o .docx e registra o
// contrato igual à tela Contratos (agenda + parcelas 20/80 pendentes no
// financeiro + ficha de produção). O orçamento fica ligado ao contrato
// (orc.contratoId) — clicar de novo só baixa o .docx outra vez, sem duplicar.
//
// Modelos: um por pacote (D.contratoTemplateEssencial / Completo), importados
// na barra da lista de Orçamentos, igual ao modelo da proposta. Sem o do
// pacote: o modelo único antigo (D.contratoTemplateDocx) e, por último, o
// embutido (window.TEMPLATE_B64_GLOBAL, js/nav.js), que usa {{MARCAÇÃO}}.
//
// Desconto (negociação): % ou R$ sobre o valor do pacote; o contrato, as
// parcelas e o Financeiro usam o valor final.

var CONTRATO_TEMPLATE_MAX_BYTES = 15 * 1024 * 1024;
var CONTRATO_MODELO_CHAVE = { essencial: 'contratoTemplateEssencial', completo: 'contratoTemplateCompleto' };
var _orcContratoId = null;

function _contratoModelo(pacote) {
  var tpl = D[CONTRATO_MODELO_CHAVE[pacote]];
  if (tpl && tpl.base64) return tpl;
  return (D.contratoTemplateDocx && D.contratoTemplateDocx.base64) ? D.contratoTemplateDocx : null;
}

// Barra "Modelo do contrato" na lista de Orçamentos (abaixo da da proposta).
function contratoModelosBarraHTML() {
  var linha = function(pacote, rotulo, cor) {
    var tpl = D[CONTRATO_MODELO_CHAVE[pacote]];
    return '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;flex:1;min-width:300px">' +
      '<span style="font-size:11px;font-weight:700;color:' + cor + ';text-transform:uppercase;letter-spacing:.5px">Contrato ' + rotulo + ' (.docx)</span>' +
      (tpl
        ? '<span style="font-size:12px;color:var(--green)">✓ ' + _propostaEsc(tpl.nome || 'modelo.docx') + (tpl.importadoEm ? ' · ' + new Date(tpl.importadoEm).toLocaleDateString('pt-BR') : '') + '</span>'
        : '<span style="font-size:12px;color:var(--text3)">Nenhum modelo importado — usa o modelo padrão do sistema.</span>') +
      '<label class="btn-sm" style="background:var(--bg3);cursor:pointer;margin-left:auto">' + (tpl ? 'Substituir modelo' : 'Importar modelo') +
        '<input type="file" accept=".docx" onchange="contratoImportarModelo(this,\'' + pacote + '\')" style="display:none"></label>' +
    '</div>';
  };
  return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;margin-bottom:16px;display:flex;gap:10px 24px;flex-wrap:wrap">' +
    linha('essencial', 'Essencial', 'var(--blue)') + linha('completo', 'Completo', 'var(--green)') +
  '</div>';
}

// Valor final com o desconto: tipo '%', 'R$' ou 'final' (ela digita direto o
// valor fechado na negociação e o desconto sai da diferença).
function _orcContratoAplicarDesconto(bruto, tipo, qtd) {
  var n = Math.max(0, Number(qtd) || 0);
  var desc = tipo === '%' ? bruto * n / 100 : tipo === 'final' ? (n ? Math.max(0, bruto - n) : 0) : n;
  desc = Math.round(Math.min(desc, bruto) * 100) / 100;
  return { bruto: bruto, desconto: desc, final: Math.round((bruto - desc) * 100) / 100 };
}

function _orcContratoDoOrc(orc) {
  if (!orc || !orc.contratoId) return null;
  return (D.contratos || []).find(function(c) { return c.id === orc.contratoId; }) || null;
}

// Botão do card/cabeçalho do orçamento.
function orcContratoBotaoHTML(orc, pararClique) {
  var stop = pararClique ? 'event.stopPropagation();' : '';
  if (_orcContratoDoOrc(orc)) {
    return '<button class="btn-sm" onclick="' + stop + 'orcBaixarContrato(\'' + orc.id + '\')" title="Contrato já gerado para este orçamento — clique para baixar o .docx de novo" style="background:var(--bg3);color:var(--green);border:1px solid var(--green)">Contrato gerado</button>';
  }
  return '<button class="btn-sm" onclick="' + stop + 'orcAbrirGerarContrato(\'' + orc.id + '\')" title="Gerar o contrato deste orçamento (pergunta o pacote fechado e os dados do cliente)" style="background:var(--blue);color:#fff">Gerar contrato</button>';
}

function _orcContratoModalEl() {
  var el = document.getElementById('morc-contrato');
  if (el) return el;
  el = document.createElement('div');
  el.className = 'modal-overlay';
  el.id = 'morc-contrato';
  el.innerHTML = '<div class="modal" style="max-width:560px;width:95%">' +
    '<div class="modal-head"><span class="modal-title">Gerar contrato</span>' +
    '<button class="modal-close" onclick="closeM(\'morc-contrato\')">×</button></div>' +
    '<div id="morc-contrato-corpo" style="padding:14px 18px"></div></div>';
  document.body.appendChild(el);
  return el;
}

function orcAbrirGerarContrato(orcId) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc) return;
  if (_orcContratoDoOrc(orc)) { orcBaixarContrato(orcId); return; }
  _orcContratoId = orcId;
  _orcContratoModalEl();
  _orcContratoRender(orc);
  openM('morc-contrato');
}

function _orcContratoRender(orc) {
  var corpo = document.getElementById('morc-contrato-corpo');
  if (!corpo) return;
  var esc = function(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var r = (typeof _orcCalcResumo === 'function') ? _orcCalcResumo(orc) : {};
  var opcPacote = function(valor, rotulo, total, porPessoa, cor) {
    return '<label style="flex:1;min-width:180px;display:flex;gap:8px;align-items:flex-start;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:10px 12px;cursor:pointer">' +
      '<input type="radio" name="morc-pacote" value="' + valor + '" onchange="_orcContratoAtualizarTotal()" style="width:auto;margin:3px 0 0">' +
      '<span><span style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;color:' + cor + '">' + rotulo + '</span>' +
      '<span style="display:block;font-family:var(--mono);font-size:15px;font-weight:600;color:' + cor + '">' + fR(total) + '</span>' +
      '<span style="display:block;font-size:10px;color:var(--text3)">' + (porPessoa ? fR(porPessoa) + ' / pessoa' : '') + '</span></span></label>';
  };
  corpo.innerHTML =
    '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:2px">' + esc((orc.numeroProposta ? orc.numeroProposta + ' · ' : '') + (orc.nomeCliente || 'Sem nome')) + '</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:14px">' + fd(orc.dataEvento) + (orc.convidados ? ' · ' + orc.convidados + ' conv.' : '') + '</div>' +

    '<label class="lbl">Qual pacote foi fechado? *</label>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">' +
      opcPacote('essencial', 'Pacote Essencial', r.valorTotalEssencial, r.porPessoaEssencial, 'var(--blue)') +
      opcPacote('completo', 'Pacote Completo', r.valorTotal, r.porPessoa, 'var(--green)') +
    '</div>' +
    // No Essencial a bebida pode ser nossa ou do cliente (no Completo é sempre nossa).
    '<div id="morc-bebidas-row" style="display:none;margin:-4px 0 14px">' +
      '<label class="lbl">Bebidas (destilados) fornecidas por *</label>' +
      '<div style="display:flex;gap:16px;font-size:13px;color:var(--text)">' +
        '<label style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="radio" name="morc-bebidas" value="romero" style="width:auto;margin:0"> Romero</label>' +
        '<label style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="radio" name="morc-bebidas" value="cliente" style="width:auto;margin:0"> Cliente</label>' +
      '</div>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      '<div style="grid-column:1/-1"><label class="lbl">Nome completo *</label><input id="morc-nome" class="inp" type="text" value="' + esc(typeof _propostaCliente === 'function' ? _propostaCliente(orc) : orc.nomeCliente) + '" style="width:100%;box-sizing:border-box"></div>' +
      '<div><label class="lbl">CPF/CNPJ *</label><input id="morc-cpf" class="inp" type="text" inputmode="numeric" placeholder="000.000.000-00" onblur="this.value=_orcFormatarDoc(this.value)" style="width:100%;box-sizing:border-box"></div>' +
      '<div><label class="lbl">Horário de início da festa *</label><input id="morc-hora" class="inp" type="time" style="width:100%;box-sizing:border-box"></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Endereço residencial *</label><input id="morc-endereco" class="inp" type="text" placeholder="Rua, número, bairro, cidade/UF" style="width:100%;box-sizing:border-box"></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Endereço do evento *</label><input id="morc-endereco-evento" class="inp" type="text" placeholder="' + esc((_propostaLocalEvento(orc) ? _propostaLocalEvento(orc) + ' — ' : '') + 'Rua, número, bairro, cidade/UF') + '" style="width:100%;box-sizing:border-box"></div>' +
      '<div><label class="lbl">Vencimento do restante (80%)</label><input id="morc-venc" class="inp" type="date" style="width:100%;box-sizing:border-box"></div>' +
      '<div style="font-size:10px;color:var(--text3);align-self:end;padding-bottom:6px">Em branco: sai "a combinar" no contrato.</div>' +
    '</div>' +

    '<div style="border-top:1px solid var(--border);margin-top:14px;padding-top:12px">' +
      '<label class="lbl">Desconto (valor negociado)</label>' +
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
        '<select id="morc-desc-tipo" class="inp" onchange="_orcContratoAtualizarTotal()" style="width:auto"><option value="final">Valor fechado (R$)</option><option value="%">Desconto em %</option><option value="R$">Desconto em R$</option></select>' +
        '<input id="morc-desc" class="inp" type="text" inputmode="decimal" placeholder="ex: 3.300,00" oninput="_orcContratoAtualizarTotal()" style="width:130px;text-align:right">' +
        '<div id="morc-total" style="margin-left:auto;text-align:right;font-size:12px;color:var(--text3)"></div>' +
      '</div>' +
    '</div>' +

    '<div style="font-size:11px;color:var(--text3);margin-top:10px">Ao gerar: o contrato entra em Contratos, o evento na Agenda, o sinal (20%) e o restante (80%) como pendentes no Financeiro, e a ficha em Produção.</div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
      '<button class="btn" onclick="closeM(\'morc-contrato\')" style="background:var(--bg3)">Cancelar</button>' +
      '<button class="btn" id="btn-morc-gerar" onclick="orcConfirmarGerarContrato()" style="background:var(--blue);color:#fff">Gerar contrato (.docx)</button>' +
    '</div>';
  _orcContratoAtualizarTotal();
}

// Lê pacote + desconto da janela → { pacote, bruto, desconto, final, tipo, qtd }.
function _orcContratoLerValores() {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === _orcContratoId; });
  var marcado = document.querySelector('input[name="morc-pacote"]:checked');
  var pacote = marcado ? marcado.value : '';
  var r = orc && typeof _orcCalcResumo === 'function' ? _orcCalcResumo(orc) : {};
  var bruto = pacote === 'completo' ? (r.valorTotal || 0) : pacote === 'essencial' ? (r.valorTotalEssencial || 0) : 0;
  var tipo = (document.getElementById('morc-desc-tipo') || {}).value || '%';
  var txt = ((document.getElementById('morc-desc') || {}).value || '').trim();
  var qtd = txt ? parseValorBR(txt) : 0;
  var v = _orcContratoAplicarDesconto(bruto, tipo, qtd);
  v.pacote = pacote; v.tipo = tipo; v.qtd = qtd; v.convidados = orc ? Number(orc.convidados) || 0 : 0;
  return v;
}

function _orcContratoAtualizarTotal() {
  var el = document.getElementById('morc-total');
  if (!el) return;
  var v = _orcContratoLerValores();
  var linhaBebidas = document.getElementById('morc-bebidas-row');
  if (linhaBebidas) linhaBebidas.style.display = v.pacote === 'essencial' ? '' : 'none';
  if (!v.pacote) { el.innerHTML = 'Escolha o pacote para ver o valor final.'; return; }
  var porPessoa = v.convidados ? ' · ' + fR(v.final / v.convidados) + ' / pessoa' : '';
  el.innerHTML = (v.desconto ? fR(v.bruto) + ' − ' + fR(v.desconto) + ' = ' : '') +
    '<span style="font-family:var(--mono);font-size:15px;font-weight:600;color:var(--text)">' + fR(v.final) + '</span>' +
    '<div style="font-size:10px">valor final do contrato' + porPessoa +
      (v.desconto && v.bruto ? ' · desconto de ' + (v.desconto / v.bruto * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%' : '') + '</div>';
}

// CPF (11 dígitos) ou CNPJ (14) com a máscara; outra coisa fica como digitou.
function _orcFormatarDoc(v) {
  var d = String(v || '').replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return String(v || '').trim();
}

function orcConfirmarGerarContrato() {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === _orcContratoId; });
  if (!orc) return;
  if (_orcContratoDoOrc(orc)) { closeM('morc-contrato'); orcBaixarContrato(orc.id); return; }
  var val = function(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var vals = _orcContratoLerValores();
  var dados = {
    pacote: vals.pacote,
    nome: val('morc-nome'),
    cpf: _orcFormatarDoc(val('morc-cpf')),
    endereco: val('morc-endereco'),
    enderecoEvento: val('morc-endereco-evento'),
    hrInicio: val('morc-hora'),
    vencRestante: val('morc-venc'),
    bebidasPor: vals.pacote === 'completo' ? 'romero' : ((document.querySelector('input[name="morc-bebidas"]:checked') || {}).value || ''),
  };
  var faltam = [];
  if (!dados.pacote) faltam.push('pacote fechado');
  else if (!dados.bebidasPor) faltam.push('quem fornece as bebidas');
  if (!dados.nome) faltam.push('nome completo');
  if (!dados.cpf) faltam.push('CPF/CNPJ');
  if (!dados.endereco) faltam.push('endereço residencial');
  if (!dados.enderecoEvento) faltam.push('endereço do evento');
  if (!dados.hrInicio) faltam.push('horário de início');
  if (faltam.length) { alert2('Preencha: ' + faltam.join(', ') + '.', 'error'); return; }
  var digitos = dados.cpf.replace(/\D/g, '').length;
  if (digitos !== 11 && digitos !== 14) { alert2('CPF deve ter 11 dígitos e CNPJ 14.', 'error'); return; }

  if (!(vals.bruto > 0)) { alert2('Este orçamento está sem valor calculado para o pacote escolhido — confira a Calculadora antes de gerar o contrato.', 'error'); return; }
  if (vals.tipo === 'final' && vals.qtd > vals.bruto) { alert2('O valor fechado (' + fR(vals.qtd) + ') está acima do valor do pacote (' + fR(vals.bruto) + ').', 'error'); return; }
  if (!(vals.final > 0)) { alert2('O desconto não pode ser igual ou maior que o valor do pacote.', 'error'); return; }
  if (vals.tipo === '%' && vals.qtd > 100) { alert2('Desconto em % não pode passar de 100.', 'error'); return; }
  dados.valorBruto = vals.bruto;
  dados.desconto = vals.desconto;
  dados.descontoTexto = vals.desconto ? (vals.tipo === '%' ? String(vals.qtd).replace('.', ',') + '%' : fR(vals.desconto)) : '';
  var valor = vals.final;

  var btn = document.getElementById('btn-morc-gerar');
  if (btn) { btn.disabled = true; btn.textContent = 'Gerando…'; }
  try {
    var info = _orcContratoInfo(orc, dados, valor);
    if (!_orcContratoBaixarDocx(info)) return;

    var fmt = function(v) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
    var ok = salvarContrato({
      nome: dados.nome, cpf: dados.cpf, endereco: dados.endereco, enderecoEvento: dados.enderecoEvento,
      tipo: info.tipo, data: orc.dataEvento || '', local: info.local, convidados: String(orc.convidados || ''),
      hrInicio: dados.hrInicio, hrFim: info.hrFim, duracao: info.tempo.texto,
      equipe: info.equipe, equipeTexto: info.equipe.map(function(e) { return e.qtd + ' ' + e.cargo; }).join(' · '),
      opcao: fmt(valor), valorNum: valor,
      parcelas: [
        { valor: fmt(info.sinal), descricao: 'Sinal — assinatura do contrato', vencimento: td() },
        { valor: fmt(info.restante), descricao: 'Restante', vencimento: dados.vencRestante || '' },
      ],
      cardapio: info.coqueteis,
      bebidasPor: dados.bebidasPor,
      bebidasRomero: dados.bebidasPor === 'romero' ? info.destilados : '',
      bebidasCliente: dados.bebidasPor === 'cliente' ? 'Destilados fornecidos pelo cliente' : '',
      proposta: orc.numeroProposta || '',
      pacote: dados.pacote, vencRestante: dados.vencRestante || '',
      valorBruto: dados.valorBruto, desconto: dados.desconto, descontoTexto: dados.descontoTexto,
      orcamentoId: orc.id,
      status: 'ativo', origem: 'orcamento',
    });
    if (ok === false) return;
    var novo = (D.contratos || []).filter(function(c) { return c.orcamentoId === orc.id; }).pop();
    if (novo) {
      orc.contratoId = novo.id;
      orc.pacoteFechado = dados.pacote;
      sv('orcamentos');
    }
    closeM('morc-contrato');
    alert2('Contrato gerado! Evento na Agenda, parcelas no Financeiro e ficha em Produção.');
    if (typeof orcView !== 'undefined' && orcView === 'detalhe' && typeof rOrcDetalhe === 'function') rOrcDetalhe();
    else if (typeof rOrcLista === 'function') rOrcLista();
  } catch (e) {
    console.error(e);
    alert2('Erro ao gerar o contrato: ' + e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Gerar contrato (.docx)'; }
  }
}

// Baixa de novo o .docx de um contrato já gerado (não grava nada).
function orcBaixarContrato(orcId) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  var c = _orcContratoDoOrc(orc);
  if (!c) return;
  var dados = { pacote: c.pacote || orc.pacoteFechado || 'completo', nome: c.nome, cpf: c.cpf, endereco: c.endereco || '', enderecoEvento: c.enderecoEvento || '', hrInicio: c.hrInicio || '', vencRestante: c.vencRestante || '',
    bebidasPor: c.bebidasPor || (c.pacote === 'essencial' && !c.bebidasRomero ? 'cliente' : 'romero'),
    valorBruto: Number(c.valorBruto) || Number(c.valorNum) || 0, desconto: Number(c.desconto) || 0, descontoTexto: c.descontoTexto || '' };
  _orcContratoBaixarDocx(_orcContratoInfo(orc, dados, Number(c.valorNum) || 0));
}

// Tudo que vai no contrato, a partir do orçamento + dados digitados.
function _orcContratoInfo(orc, dados, valor) {
  var d = _propostaDadosComputados(orc);
  var tempo = _propostaTempoFesta(orc);
  var completo = dados.pacote === 'completo';

  var hrFim = '';
  if (dados.hrInicio && tempo.total) {
    var hm = dados.hrInicio.split(':').map(Number);
    var mins = (hm[0] * 60 + (hm[1] || 0) + Math.round(tempo.total * 60)) % (24 * 60);
    hrFim = String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');
  }

  var equipe = [];
  if (d.qHead)      equipe.push({ qtd: d.qHead, cargo: 'Head Bartender' });
  if (d.qBartender) equipe.push({ qtd: d.qBartender, cargo: 'Bartender' });
  if (d.qBarback)   equipe.push({ qtd: d.qBarback, cargo: 'Bar Back' });
  if (d.qCoord)     equipe.push({ qtd: d.qCoord, cargo: 'Coordenador' });
  if (d.qCopeiro)   equipe.push({ qtd: d.qCopeiro, cargo: 'Copeiro' });

  var coqueteis = Array.from(new Set((orc.insumos || []).flatMap(function(i) { return i.coqueteis || []; })))
    .map(_propostaFrase).join(', ');
  var destilados = (completo || dados.bebidasPor !== 'cliente')
    ? _propostaRotulos(d.destilados).join(', ')
    : 'destilados fornecidos pelo(a) CONTRATANTE';

  var sinal = Math.round(valor * 0.2 * 100) / 100;
  var r = d.resumo || {};
  return {
    orc: orc, dados: dados, valor: valor, sinal: sinal, restante: Math.round((valor - sinal) * 100) / 100,
    tempo: tempo, hrFim: hrFim, equipe: equipe, coqueteis: coqueteis, destilados: destilados,
    // Local = nome do espaço + endereço do evento ("Casa Marble — Rua X, 10, Bairro").
    tipo: _propostaTipoEvento(orc), localNome: _propostaLocalEvento(orc),
    local: [_propostaLocalEvento(orc), dados.enderecoEvento].filter(Boolean).join(' — '),
    // Com desconto, o convidado extra segue o por pessoa negociado.
    porPessoa: orc.convidados ? valor / Number(orc.convidados) : (completo ? r.porPessoa : r.porPessoaEssencial),
    opcionais: _propostaOpcionaisMarcados(orc).map(function(o) { return o.nome; }).join(', '),
  };
}

function _orcContratoMarcacoes(info) {
  var orc = info.orc, dados = info.dados;
  var dt = orc.dataEvento ? new Date(orc.dataEvento + 'T12:00:00') : null;
  var dataLonga = dt ? dt.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  var valHE = Number(orc.propostaValorHoraExtra) || 0;
  var pacote = dados.pacote === 'completo' ? 'Pacote Completo' : 'Pacote Essencial';
  return {
    CONTRATANTE: dados.nome, NOME_CLIENTE: dados.nome, CLIENTE: dados.nome,
    CPF: dados.cpf, CNPJ: dados.cpf, CPF_CNPJ: dados.cpf, DOCUMENTO: dados.cpf,
    ENDERECO: dados.endereco,
    PACOTE: pacote,
    NUMERO_PROPOSTA: orc.numeroProposta || '',
    TIPO_EVENTO: info.tipo,
    DATA_EVENTO: dataLonga || fd(orc.dataEvento),
    DIA_FESTA: fd(orc.dataEvento),
    CONVIDADOS: String(orc.convidados || ''),
    LOCAL_EVENTO: info.local,
    LOCAL_NOME: info.localNome, ENDERECO_EVENTO: dados.enderecoEvento || '',
    HORARIO_INICIO: dados.hrInicio,
    HORARIO_FIM: info.hrFim,
    DURACAO: info.tempo.texto, TEMPO_FESTA: info.tempo.texto, TEMPO_FESTA_COMPLETO: info.tempo.completo,
    VALOR_TOTAL: _propostaValorTexto(info.valor), VALOR_TOTAL_NUMERO: fR(info.valor), VALOR_TOTAL_EXTENSO: _propostaExtenso(info.valor),
    VALOR_FINAL: _propostaValorTexto(info.valor),
    VALOR_PACOTE: dados.valorBruto ? _propostaValorTexto(dados.valorBruto) : '', VALOR_PACOTE_NUMERO: dados.valorBruto ? fR(dados.valorBruto) : '',
    DESCONTO: dados.desconto ? fR(dados.desconto) + (dados.descontoTexto && dados.descontoTexto.indexOf('%') !== -1 ? ' (' + dados.descontoTexto + ')' : '') : '',
    DESCONTO_EXTENSO: dados.desconto ? _propostaValorTexto(dados.desconto) : '',
    VALOR_SINAL: fR(info.sinal), VALOR_SINAL_EXTENSO: _propostaExtenso(info.sinal),
    VALOR_RESTANTE: fR(info.restante), VALOR_RESTANTE_EXTENSO: _propostaExtenso(info.restante),
    VENCIMENTO_RESTANTE: dados.vencRestante ? fd(dados.vencRestante) : 'data a combinar',
    EQUIPE: info.equipe.map(function(e) { return e.qtd + ' ' + e.cargo + (e.qtd > 1 ? (e.cargo === 'Coordenador' ? 'es' : 's') : ''); }).join(', '),
    COQUETEIS: info.coqueteis, CARDAPIO: info.coqueteis,
    DESTILADOS: info.destilados,
    BEBIDAS_FORNECIDAS_POR: dados.bebidasPor === 'cliente' ? 'CONTRATANTE' : 'CONTRATADA (Romero Coquetéis)',
    MODULOS: info.opcionais, OPCIONAIS: info.opcionais,
    VALOR_HORA_EXTRA: valHE ? fR(valHE) : '',
    VALOR_CONVIDADO_EXTRA: info.porPessoa ? fR(info.porPessoa) : '',
  };
}

// O modelo embutido saiu de um contrato antigo e tem por extenso e data fixos
// ("(novecentos reais)", "(três mil e seiscentos reais) para o dia
// 21/08/2025") — troca por marcações antes de preencher.
function _orcContratoCorrigirModeloPadrao(zip) {
  var f = zip.file('word/document.xml');
  if (!f) return;
  var xml = f.asText()
    .replace(/<w:t>\(novecentos<\/w:t>([\s\S]*?)<w:t>reais\)<\/w:t>/, '<w:t>({{VALOR_SINAL_EXTENSO}})</w:t>$1<w:t></w:t>')
    .replace(' (três mil e seiscentos reais) para o dia ', ' ({{VALOR_RESTANTE_EXTENSO}}) para o dia ')
    .replace('>21/08/2025.<', '>{{VENCIMENTO_RESTANTE}}.<');
  zip.file('word/document.xml', xml);
}

function _orcContratoBaixarDocx(info) {
  if (!window.PizZip || !window.Docxtemplater) { alert2('Bibliotecas de geração de Word ainda não carregaram — aguarde e tente novamente.', 'error'); return false; }
  var tpl = _contratoModelo(info.dados.pacote);
  var b64 = (tpl && tpl.base64) || window.TEMPLATE_B64_GLOBAL;
  if (!b64) { alert2('Modelo do contrato não carregado.', 'error'); return false; }
  try {
    var zip = new PizZip(Uint8Array.from(atob(b64), function(c) { return c.charCodeAt(0); }));
    if (!(tpl && tpl.base64)) _orcContratoCorrigirModeloPadrao(zip);
    // Modelo com {{MARCAÇÃO}} (o embutido) ou {MARCAÇÃO} (como o da proposta).
    var docXml = (zip.file('word/document.xml') || { asText: function() { return ''; } }).asText().replace(/<[^>]+>/g, '');
    var opts = { paragraphLoop: true, linebreaks: true, nullGetter: function(part) {
      return part && !part.module && part.value ? '[' + part.value + '?]' : '';
    } };
    if (docXml.indexOf('{{') !== -1) opts.delimiters = { start: '{{', end: '}}' };
    var dados = _orcContratoMarcacoes(info);
    // Marcação com pequena diferença no Word ({Valor Total}, { CPF }) — mesma
    // tolerância da proposta.
    opts.parser = function(tag) {
      var chave = (typeof _propostaNormTag === 'function') ? _propostaNormTag(tag) : tag;
      return { get: function(scope) {
        if (tag === '.') return scope;
        if (scope == null || typeof scope !== 'object') return undefined;
        return scope[tag] !== undefined ? scope[tag] : scope[chave];
      } };
    };
    var docx = new Docxtemplater(zip, opts);
    docx.setData(dados);
    docx.render();
    var blob = new Blob([docx.getZip().generate({ type: 'arraybuffer' })],
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Contrato_' + String(info.dados.nome || 'cliente').split(' ')[0] + '_' + fd(info.orc.dataEvento).replace(/\//g, '-') + '.docx';
    a.click();
    URL.revokeObjectURL(a.href);
    return true;
  } catch (e) {
    console.error(e);
    alert2('Erro ao montar o contrato: ' + e.message + ' — confira se as marcações no modelo estão digitadas certinho.', 'error');
    return false;
  }
}

function contratoImportarModelo(inputEl, pacote) {
  var chave = CONTRATO_MODELO_CHAVE[pacote];
  if (!chave) return;
  var file = inputEl.files && inputEl.files[0];
  if (!file) return;
  if (file.size > CONTRATO_TEMPLATE_MAX_BYTES) {
    alert2('Esse arquivo tem ' + (file.size / 1024 / 1024).toFixed(1) + 'MB — grande demais pra ser o modelo do contrato.', 'error');
    inputEl.value = '';
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var bytes = new Uint8Array(e.target.result);
    var binario = '';
    for (var i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]);
    D[chave] = { base64: btoa(binario), nome: file.name, tamanho: file.size, importadoEm: new Date().toISOString() };
    sv(chave);
    alert2('Modelo do contrato ' + (pacote === 'completo' ? 'Completo' : 'Essencial') + ' importado!');
    if (typeof orcView !== 'undefined' && orcView === 'lista' && typeof rOrcLista === 'function') rOrcLista();
  };
  reader.onerror = function() { alert2('Erro ao ler o arquivo.', 'error'); };
  reader.readAsArrayBuffer(file);
  inputEl.value = '';
}
