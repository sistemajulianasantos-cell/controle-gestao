// ─── GERAR CONTRATO A PARTIR DO ORÇAMENTO (pedido dela 10-22) ───────────────
// Botão "Gerar contrato" no card do orçamento: pergunta o pacote fechado,
// quem fornece as bebidas e os dados que o orçamento não tem. Gera o .docx e
// registra o contrato igual à tela Contratos (agenda + parcelas 20/80
// pendentes no financeiro + ficha de produção). O orçamento fica ligado ao
// contrato (orc.contratoId) — clicar de novo só baixa o .docx outra vez.
//
// Modelos (10-23): 3 contratos, um por forma de fornecimento das bebidas —
// Bebidas cliente / Bebidas consignadas / Bebidas Romero — importados na barra
// da lista de Orçamentos. O TEXTO do contrato (cláusulas, itens de reposição,
// valores fixos, formato) vem só do modelo: o sistema só troca as marcações.
// Valores que mudam por contrato (hora extra, convidado extra, duração,
// equipe, coquetéis, destilados) são campos da janela, já preenchidos com o
// que o orçamento tem e editáveis — sem conta inventada pelo sistema.
//
// Desconto (negociação): valor fechado, % ou R$; contrato, parcelas e
// Financeiro usam o valor final.

var CONTRATO_TEMPLATE_MAX_BYTES = 15 * 1024 * 1024;
var CONTRATO_MODELOS = [
  { id: 'cliente',     chave: 'contratoTemplateBebCliente',     rotulo: 'Bebidas cliente',     cor: 'var(--blue)' },
  { id: 'consignadas', chave: 'contratoTemplateBebConsignadas', rotulo: 'Bebidas consignadas', cor: 'var(--amber)' },
  { id: 'romero',      chave: 'contratoTemplateBebRomero',      rotulo: 'Bebidas Romero',      cor: 'var(--green)' },
];
var _orcContratoId = null;

function _contratoModeloInfo(tipo) { return CONTRATO_MODELOS.find(function(m) { return m.id === tipo; }) || null; }

// Modelo importado para o tipo de bebida. Os modelos por pacote de antes
// (Essencial/Completo, 10-22) e o único antigo ficam só de reserva.
function _contratoModelo(tipo) {
  var m = _contratoModeloInfo(tipo);
  var ok = function(t) { return t && t.base64 ? t : null; };
  return ok(m && D[m.chave]) ||
    ok(tipo === 'romero' ? D.contratoTemplateCompleto : D.contratoTemplateEssencial) ||
    ok(D.contratoTemplateDocx);
}

// Barra "Modelos do contrato" na lista de Orçamentos (abaixo da da proposta).
function contratoModelosBarraHTML() {
  var linha = function(m) {
    var tpl = D[m.chave];
    return '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<span style="font-size:11px;font-weight:700;color:' + m.cor + ';text-transform:uppercase;letter-spacing:.5px;min-width:190px">Contrato ' + m.rotulo + ' (.docx)</span>' +
      (tpl
        ? '<span style="font-size:12px;color:var(--green)">✓ ' + _propostaEsc(tpl.nome || 'modelo.docx') + (tpl.importadoEm ? ' · ' + new Date(tpl.importadoEm).toLocaleDateString('pt-BR') : '') + '</span>'
        : '<span style="font-size:12px;color:var(--text3)">Nenhum modelo importado.</span>') +
      (tpl ? '<button class="btn-sm" onclick="baixarModeloDocx(\'' + m.id + '\')" title="Baixa o modelo que o sistema está usando" style="background:var(--bg3);margin-left:auto">Baixar modelo</button>' : '') +
      '<label class="btn-sm" style="background:var(--bg3);cursor:pointer' + (tpl ? '' : ';margin-left:auto') + '">' + (tpl ? 'Substituir modelo' : 'Importar modelo') +
        '<input type="file" accept=".docx" onchange="contratoImportarModelo(this,\'' + m.id + '\')" style="display:none"></label>' +
    '</div>';
  };
  return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;margin-bottom:16px;display:grid;gap:8px">' +
    CONTRATO_MODELOS.map(linha).join('') +
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
  return '<button class="btn-sm" onclick="' + stop + 'orcAbrirGerarContrato(\'' + orc.id + '\')" title="Gerar o contrato deste orçamento" style="background:var(--blue);color:#fff">Gerar contrato</button>';
}

function _orcContratoModalEl() {
  var el = document.getElementById('morc-contrato');
  if (el) return el;
  el = document.createElement('div');
  el.className = 'modal-overlay';
  el.id = 'morc-contrato';
  el.innerHTML = '<div class="modal" style="max-width:640px;width:95%">' +
    '<div class="modal-head"><span class="modal-title">Gerar contrato</span>' +
    '<button class="modal-close" onclick="closeM(\'morc-contrato\')">×</button></div>' +
    '<div id="morc-contrato-corpo" style="padding:14px 18px;max-height:80vh;overflow:auto"></div></div>';
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

// ─── SUGESTÕES A PARTIR DO ORÇAMENTO (editáveis na janela) ──────────────────

function _orcContratoEquipeSugerida(orc) {
  var d = _propostaDadosComputados(orc);
  var linhas = [];
  var add = function(q, sing, plur) { if (q) linhas.push(q + ' ' + (q > 1 ? plur : sing)); };
  add(d.qHead, 'Head Bartender', 'Head Bartenders');
  add(d.qBartender, 'Bartender', 'Bartenders');
  add(d.qBarback, 'Bar Back', 'Bar Backs');
  add(d.qCoord, 'Coordenador', 'Coordenadores');
  add(d.qCopeiro, 'Copeiro', 'Copeiros');
  return linhas.join('\n');
}

// "- Moscow Mule (descrição da ficha)" — uma linha por coquetel.
function _orcContratoCoqueteisSugeridos(orc) {
  var nomes = Array.from(new Set((orc.insumos || []).flatMap(function(i) { return i.coqueteis || []; })));
  return nomes.map(function(n) {
    var ficha = (typeof _propostaFichaDoCoquetel === 'function') ? _propostaFichaDoCoquetel(n) : null;
    var desc = ficha && ficha.descricao ? String(ficha.descricao).split('\n')[0].trim() : '';
    return '- ' + _propostaNomeProprio(n) + (desc ? ' (' + desc + ')' : '');
  }).join('\n');
}

// "Vodka Absolut, Whiskey Jameson e Gin Beefeater"
function _orcContratoDestiladosSugeridos(orc) {
  var lista = _propostaRotulos(_propostaDadosComputados(orc).destilados);
  if (lista.length < 2) return lista.join('');
  return lista.slice(0, -1).join(', ') + ' e ' + lista[lista.length - 1];
}

function _orcContratoDuracaoSugerida(orc) {
  var t = _propostaTempoFesta(orc);
  return t.total ? String(t.total) : '';
}

// ─── JANELA ──────────────────────────────────────────────────────────────────

function _orcContratoRender(orc) {
  var corpo = document.getElementById('morc-contrato-corpo');
  if (!corpo) return;
  var esc = function(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var r = (typeof _orcCalcResumo === 'function') ? _orcCalcResumo(orc) : {};
  var campo = 'width:100%;box-sizing:border-box';
  var secao = function(t) { return '<div style="grid-column:1/-1;font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;border-top:1px solid var(--border);padding-top:10px;margin-top:4px">' + t + '</div>'; };
  var opcPacote = function(valor, rotulo, total, porPessoa, cor) {
    return '<label style="flex:1;min-width:180px;display:flex;gap:8px;align-items:flex-start;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:10px 12px;cursor:pointer">' +
      '<input type="radio" name="morc-pacote" value="' + valor + '" onchange="_orcContratoPacoteMudou()" style="width:auto;margin:3px 0 0">' +
      '<span><span style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;color:' + cor + '">' + rotulo + '</span>' +
      '<span style="display:block;font-family:var(--mono);font-size:15px;font-weight:600;color:' + cor + '">' + fR(total) + '</span>' +
      '<span style="display:block;font-size:10px;color:var(--text3)">' + (porPessoa ? fR(porPessoa) + ' / pessoa' : '') + '</span></span></label>';
  };
  var valHE = Number(orc.propostaValorHoraExtra) || 0;

  corpo.innerHTML =
    '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:2px">' + esc((orc.numeroProposta ? orc.numeroProposta + ' · ' : '') + (orc.nomeCliente || 'Sem nome')) + '</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:14px">' + fd(orc.dataEvento) + (orc.convidados ? ' · ' + orc.convidados + ' conv.' : '') + '</div>' +

    '<label class="lbl">Qual pacote foi fechado? *</label>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">' +
      opcPacote('essencial', 'Pacote Essencial', r.valorTotalEssencial, r.porPessoaEssencial, 'var(--blue)') +
      opcPacote('completo', 'Pacote Completo', r.valorTotal, r.porPessoa, 'var(--green)') +
    '</div>' +

    '<label class="lbl">Bebidas — define o modelo do contrato *</label>' +
    '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--text);margin-bottom:4px">' +
      CONTRATO_MODELOS.map(function(m) {
        return '<label style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="radio" name="morc-bebidas" value="' + m.id + '" onchange="_orcContratoBebidasMudou()" style="width:auto;margin:0"> ' + m.rotulo + '</label>';
      }).join('') +
    '</div>' +
    '<div id="morc-modelo-aviso" style="font-size:11px;color:var(--text3);margin-bottom:12px"></div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
      secao('Cliente') +
      '<div style="grid-column:1/-1"><label class="lbl">Nome completo *</label><input id="morc-nome" class="inp" type="text" value="' + esc(typeof _propostaCliente === 'function' ? _propostaCliente(orc) : orc.nomeCliente) + '" style="' + campo + '"></div>' +
      '<div><label class="lbl">CPF/CNPJ *</label><input id="morc-cpf" class="inp" type="text" inputmode="numeric" placeholder="000.000.000-00" onblur="this.value=_orcFormatarDoc(this.value)" style="' + campo + '"></div>' +
      '<div></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Endereço residencial *</label><input id="morc-endereco" class="inp" type="text" placeholder="Rua, número, bairro, cidade/UF" style="' + campo + '"></div>' +

      secao('Evento') +
      '<div style="grid-column:1/-1"><label class="lbl">Endereço do evento *</label><input id="morc-endereco-evento" class="inp" type="text" placeholder="Como deve sair no contrato (ex: Clube do Ipê: Alameda do Ipê Amarelo, 1040…)" style="' + campo + '"></div>' +
      '<div><label class="lbl">Horário de início da festa *</label><input id="morc-hora" class="inp" type="time" style="' + campo + '"></div>' +
      '<div><label class="lbl">Duração do bar (horas) *</label><input id="morc-duracao" class="inp" type="text" inputmode="decimal" value="' + esc(_orcContratoDuracaoSugerida(orc)) + '" style="' + campo + '"></div>' +
      '<div><label class="lbl">Módulos de bar (1,20m cada) *</label><input id="morc-modulos" class="inp" type="number" min="1" step="1" placeholder="ex: 2" style="' + campo + '"></div>' +
      '<div></div>' +
      '<div><label class="lbl">Valor da hora extra (R$) *</label><input id="morc-he" class="inp" type="text" inputmode="decimal" value="' + (valHE ? fmtValorBR(valHE) : '') + '" placeholder="ex: 770,00" style="' + campo + '"></div>' +
      '<div><label class="lbl">Valor por convidado extra (R$) *</label><input id="morc-convextra" class="inp" type="text" inputmode="decimal" placeholder="ex: 110,00" style="' + campo + '"></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Equipe (uma por linha)</label><textarea id="morc-equipe" class="inp" rows="3" style="' + campo + ';resize:vertical">' + esc(_orcContratoEquipeSugerida(orc)) + '</textarea></div>' +
      '<div style="grid-column:1/-1"><label class="lbl">Coquetéis (um por linha)</label><textarea id="morc-coqueteis" class="inp" rows="5" style="' + campo + ';resize:vertical">' + esc(_orcContratoCoqueteisSugeridos(orc)) + '</textarea></div>' +
      '<div id="morc-destilados-row" style="grid-column:1/-1"><label class="lbl">Destilados</label><textarea id="morc-destilados" class="inp" rows="2" style="' + campo + ';resize:vertical">' + esc(_orcContratoDestiladosSugeridos(orc)) + '</textarea></div>' +
      '<div style="grid-column:1/-1;font-size:10px;color:var(--text3);margin-top:-4px">Equipe, coquetéis e destilados vêm do orçamento — ajuste o que for diferente no contrato.</div>' +

      secao('Pagamento') +
      '<div><label class="lbl">Vencimento do restante (80%)</label><input id="morc-venc" class="inp" type="date" value="' + _orcContratoVencPadrao(orc) + '" style="' + campo + '"></div>' +
      '<div style="font-size:10px;color:var(--text3);align-self:end;padding-bottom:6px">Vem 7 dias antes do evento — dá pra trocar.</div>' +
    '</div>' +

    '<div style="margin-top:10px">' +
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
  _orcContratoBebidasMudou();
  _orcContratoAtualizarTotal();
}

function _orcContratoBebidasSel() {
  return (document.querySelector('input[name="morc-bebidas"]:checked') || {}).value || '';
}

// Completo = bebida da Romero: já marca, se ela ainda não escolheu.
function _orcContratoPacoteMudou() {
  var marcado = document.querySelector('input[name="morc-pacote"]:checked');
  if (marcado && marcado.value === 'completo' && !_orcContratoBebidasSel()) {
    var r = document.querySelector('input[name="morc-bebidas"][value="romero"]');
    if (r) r.checked = true;
    _orcContratoBebidasMudou();
  }
  _orcContratoAtualizarTotal();
}

function _orcContratoBebidasMudou() {
  var tipo = _orcContratoBebidasSel();
  var aviso = document.getElementById('morc-modelo-aviso');
  var linhaDest = document.getElementById('morc-destilados-row');
  if (linhaDest) linhaDest.style.display = tipo === 'cliente' ? 'none' : '';
  if (!aviso) return;
  if (!tipo) { aviso.innerHTML = ''; return; }
  var m = _contratoModeloInfo(tipo);
  var tpl = _contratoModelo(tipo);
  aviso.innerHTML = tpl
    ? 'Modelo: <span style="color:var(--green)">' + _propostaEsc(tpl.nome || 'modelo.docx') + '</span>' + (D[m.chave] ? '' : ' <span style="color:var(--amber)">(o de "' + m.rotulo + '" ainda não foi importado — usando este)</span>')
    : '<span style="color:var(--red)">Nenhum modelo "' + m.rotulo + '" importado — importe na lista de Orçamentos antes de gerar.</span>';
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
  if (!v.pacote) { el.innerHTML = 'Escolha o pacote para ver o valor final.'; return; }
  var porPessoa = v.convidados ? ' · ' + fR(v.final / v.convidados) + ' / pessoa' : '';
  el.innerHTML = (v.desconto ? fR(v.bruto) + ' − ' + fR(v.desconto) + ' = ' : '') +
    '<span style="font-family:var(--mono);font-size:15px;font-weight:600;color:var(--text)">' + fR(v.final) + '</span>' +
    '<div style="font-size:10px">valor final do contrato' + porPessoa +
      (v.desconto && v.bruto ? ' · desconto de ' + (v.desconto / v.bruto * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%' : '') + '</div>';
}

// Restante = 7 dias antes do evento ("80% até 7 dias antes do evento", da
// proposta). É só a sugestão do campo — ela troca na janela.
function _orcContratoVencPadrao(orc) {
  if (!orc || !/^\d{4}-\d{2}-\d{2}$/.test(orc.dataEvento || '')) return '';
  var d = new Date(orc.dataEvento + 'T12:00:00');
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

// "2" → "2 (dois) módulos"
function _orcContratoModulosTexto(n) {
  n = parseInt(n, 10) || 0;
  if (!n) return '';
  return n + ' (' + _propostaNumExtenso(n) + ') ' + (n === 1 ? 'módulo' : 'módulos');
}

// CPF (11 dígitos) ou CNPJ (14) com a máscara; outra coisa fica como digitou.
function _orcFormatarDoc(v) {
  var d = String(v || '').replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return String(v || '').trim();
}

// "2 Bartenders\n1 Bar Back" → [{qtd:2,cargo:'Bartenders'}, …] (agenda/produção)
function _orcContratoEquipeArray(txt) {
  return String(txt || '').split('\n').map(function(l) {
    var m = l.trim().replace(/^[-•]\s*/, '').match(/^(\d+)\s+(.+)$/);
    return m ? { qtd: parseInt(m[1], 10), cargo: m[2].trim() } : null;
  }).filter(Boolean);
}

function orcConfirmarGerarContrato() {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === _orcContratoId; });
  if (!orc) return;
  if (_orcContratoDoOrc(orc)) { closeM('morc-contrato'); orcBaixarContrato(orc.id); return; }
  var val = function(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var vals = _orcContratoLerValores();
  var dados = {
    pacote: vals.pacote,
    bebidasPor: _orcContratoBebidasSel(),
    nome: val('morc-nome'),
    cpf: _orcFormatarDoc(val('morc-cpf')),
    endereco: val('morc-endereco'),
    enderecoEvento: val('morc-endereco-evento'),
    hrInicio: val('morc-hora'),
    duracao: val('morc-duracao') ? parseValorBR(val('morc-duracao')) : 0,
    modulos: parseInt(val('morc-modulos'), 10) || 0,
    horaExtra: val('morc-he') ? parseValorBR(val('morc-he')) : 0,
    convExtra: val('morc-convextra') ? parseValorBR(val('morc-convextra')) : 0,
    equipeTexto: val('morc-equipe'),
    coqueteis: val('morc-coqueteis'),
    destilados: _orcContratoBebidasSel() === 'cliente' ? '' : val('morc-destilados'),
    vencRestante: val('morc-venc'),
  };
  var faltam = [];
  if (!dados.pacote) faltam.push('pacote fechado');
  if (!dados.bebidasPor) faltam.push('bebidas (cliente/consignadas/Romero)');
  if (!dados.nome) faltam.push('nome completo');
  if (!dados.cpf) faltam.push('CPF/CNPJ');
  if (!dados.endereco) faltam.push('endereço residencial');
  if (!dados.enderecoEvento) faltam.push('endereço do evento');
  if (!dados.hrInicio) faltam.push('horário de início');
  if (!(dados.duracao > 0)) faltam.push('duração do bar');
  if (!(dados.modulos > 0)) faltam.push('módulos de bar');
  if (!(dados.horaExtra > 0)) faltam.push('valor da hora extra');
  if (!(dados.convExtra > 0)) faltam.push('valor por convidado extra');
  if (faltam.length) { alert2('Preencha: ' + faltam.join(', ') + '.', 'error'); return; }
  var digitos = dados.cpf.replace(/\D/g, '').length;
  if (digitos !== 11 && digitos !== 14) { alert2('CPF deve ter 11 dígitos e CNPJ 14.', 'error'); return; }
  if (!_contratoModelo(dados.bebidasPor)) { alert2('Importe o modelo "' + _contratoModeloInfo(dados.bebidasPor).rotulo + '" na lista de Orçamentos antes de gerar.', 'error'); return; }

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
    var equipe = _orcContratoEquipeArray(dados.equipeTexto);
    var ok = salvarContrato({
      nome: dados.nome, cpf: dados.cpf, endereco: dados.endereco, enderecoEvento: dados.enderecoEvento,
      tipo: info.tipo, data: orc.dataEvento || '', local: dados.enderecoEvento, convidados: String(orc.convidados || ''),
      hrInicio: dados.hrInicio, hrFim: info.hrFim, duracao: info.duracaoTexto,
      equipe: equipe, equipeTexto: dados.equipeTexto.split('\n').map(function(l) { return l.trim(); }).filter(Boolean).join(' · '),
      opcao: fmt(valor), valorNum: valor,
      parcelas: [
        { valor: fmt(info.sinal), descricao: 'Sinal — assinatura do contrato', vencimento: td() },
        { valor: fmt(info.restante), descricao: 'Restante', vencimento: dados.vencRestante || '' },
      ],
      cardapio: dados.coqueteis,
      bebidasPor: dados.bebidasPor,
      bebidasRomero: dados.bebidasPor === 'cliente' ? '' : dados.destilados,
      bebidasCliente: dados.bebidasPor === 'cliente' ? 'Bebidas fornecidas pelo cliente' : '',
      horaExtra: fmt(dados.horaExtra), horaExtraNum: dados.horaExtra, convExtra: dados.convExtra,
      coqueteisTexto: dados.coqueteis, destiladosTexto: dados.destilados, duracaoHoras: dados.duracao,
      proposta: orc.numeroProposta || '',
      pacote: dados.pacote, vencRestante: dados.vencRestante || '', modulos: dados.modulos,
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

// Baixa de novo o .docx de um contrato já gerado (não grava nada) — com o que
// foi digitado na geração.
function orcBaixarContrato(orcId) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  var c = _orcContratoDoOrc(orc);
  if (!c) return;
  var dados = {
    pacote: c.pacote || orc.pacoteFechado || 'completo',
    bebidasPor: c.bebidasPor || 'romero',
    nome: c.nome, cpf: c.cpf, endereco: c.endereco || '', enderecoEvento: c.enderecoEvento || c.local || '',
    hrInicio: c.hrInicio || '', duracao: Number(c.duracaoHoras) || parseFloat(c.duracao) || 0,
    modulos: c.modulos || 0, horaExtra: Number(c.horaExtraNum) || 0, convExtra: Number(c.convExtra) || 0,
    equipeTexto: (c.equipeTexto || '').split(' · ').join('\n'),
    coqueteis: c.coqueteisTexto || c.cardapio || '', destilados: c.destiladosTexto || c.bebidasRomero || '',
    vencRestante: c.vencRestante || '',
    valorBruto: Number(c.valorBruto) || Number(c.valorNum) || 0, desconto: Number(c.desconto) || 0, descontoTexto: c.descontoTexto || '',
  };
  _orcContratoBaixarDocx(_orcContratoInfo(orc, dados, Number(c.valorNum) || 0));
}

// Tudo que vai no contrato: orçamento + o que foi digitado na janela.
function _orcContratoInfo(orc, dados, valor) {
  var hrFim = '';
  if (dados.hrInicio && dados.duracao) {
    var hm = dados.hrInicio.split(':').map(Number);
    var mins = (hm[0] * 60 + (hm[1] || 0) + Math.round(dados.duracao * 60)) % (24 * 60);
    hrFim = String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');
  }
  var dur = Number(dados.duracao) || 0;
  var sinal = Math.round(valor * 0.2 * 100) / 100;
  return {
    orc: orc, dados: dados, valor: valor, sinal: sinal, restante: Math.round((valor - sinal) * 100) / 100,
    hrFim: hrFim,
    duracaoNumero: dur ? String(dur).replace('.', ',') : '',
    duracaoTexto: dur ? String(dur).replace('.', ',') + (dur === 1 ? ' hora' : ' horas') : '',
    tipo: _propostaTipoEvento(orc), localNome: _propostaLocalEvento(orc),
    opcionais: _propostaOpcionaisMarcados(orc).map(function(o) { return o.nome; }).join(', '),
  };
}

// "17:00" → "17h00min" (como no contrato dela)
function _orcContratoHoraTexto(h) {
  var m = /^(\d{1,2}):(\d{2})/.exec(h || '');
  return m ? m[1].padStart(2, '0') + 'h' + m[2] + 'min' : (h || '');
}

function _orcContratoMarcacoes(info) {
  var orc = info.orc, dados = info.dados;
  var dt = orc.dataEvento ? new Date(orc.dataEvento + 'T12:00:00') : null;
  // Todo valor em R$ sai "R$ 900,00 (novecentos reais)"; _NUMERO = só o
  // número, _EXTENSO = só por extenso.
  var din = function(v) { return v ? _propostaValorTexto(v) : ''; };
  var num = function(v) { return v ? fR(v) : ''; };
  var ext = function(v) { return v ? _propostaExtenso(v) : ''; };
  var linhas = function(t) { return String(t || '').split('\n').map(function(l) { return l.trim(); }).filter(Boolean); };
  return {
    CONTRATANTE: dados.nome, NOME_CLIENTE: dados.nome, CLIENTE: dados.nome,
    CPF: dados.cpf, CNPJ: dados.cpf, CPF_CNPJ: dados.cpf, DOCUMENTO: dados.cpf,
    ENDERECO: dados.endereco,
    PACOTE: dados.pacote === 'completo' ? 'Pacote Completo' : 'Pacote Essencial',
    NUMERO_PROPOSTA: orc.numeroProposta || '',
    TIPO_EVENTO: info.tipo,
    DATA_EVENTO: fd(orc.dataEvento), DIA_FESTA: fd(orc.dataEvento),
    DATA_EVENTO_EXTENSO: dt ? dt.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '',
    DATA_ASSINATURA: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    CONVIDADOS: String(orc.convidados || ''),
    CONVIDADOS_EXTENSO: orc.convidados ? _propostaNumExtenso(orc.convidados) : '',
    // Endereço exatamente como ela digitou; o nome do local fica separado.
    LOCAL_EVENTO: dados.enderecoEvento || '', ENDERECO_EVENTO: dados.enderecoEvento || '', LOCAL_NOME: info.localNome,
    HORARIO_INICIO: _orcContratoHoraTexto(dados.hrInicio), HORARIO_FIM: _orcContratoHoraTexto(info.hrFim),
    HORA_INICIO: dados.hrInicio, HORA_FIM: info.hrFim,
    DURACAO: info.duracaoNumero, DURACAO_TEXTO: info.duracaoTexto, TEMPO_FESTA: info.duracaoTexto,
    VALOR_TOTAL: din(info.valor), VALOR_TOTAL_NUMERO: num(info.valor), VALOR_TOTAL_EXTENSO: ext(info.valor),
    VALOR_FINAL: din(info.valor),
    VALOR_PACOTE: din(dados.valorBruto), VALOR_PACOTE_NUMERO: num(dados.valorBruto),
    DESCONTO: dados.desconto ? fR(dados.desconto) + (dados.descontoTexto && dados.descontoTexto.indexOf('%') !== -1 ? ' (' + dados.descontoTexto + ')' : '') : '',
    DESCONTO_EXTENSO: din(dados.desconto),
    VALOR_SINAL: din(info.sinal), VALOR_SINAL_NUMERO: num(info.sinal), VALOR_SINAL_EXTENSO: ext(info.sinal),
    VALOR_RESTANTE: din(info.restante), VALOR_RESTANTE_NUMERO: num(info.restante), VALOR_RESTANTE_EXTENSO: ext(info.restante),
    VENCIMENTO_RESTANTE: dados.vencRestante ? fd(dados.vencRestante) : '',
    VALOR_HORA_EXTRA: din(dados.horaExtra), VALOR_HORA_EXTRA_NUMERO: num(dados.horaExtra), VALOR_HORA_EXTRA_EXTENSO: ext(dados.horaExtra),
    VALOR_CONVIDADO_EXTRA: din(dados.convExtra), VALOR_CONVIDADO_EXTRA_NUMERO: num(dados.convExtra), VALOR_CONVIDADO_EXTRA_EXTENSO: ext(dados.convExtra),
    MODULOS: _orcContratoModulosTexto(dados.modulos), MODULOS_NUMERO: dados.modulos ? String(dados.modulos) : '',
    // Listas: texto com uma linha por item, como digitado na janela.
    EQUIPE: linhas(dados.equipeTexto).join('\n'),
    COQUETEIS: linhas(dados.coqueteis).join('\n'), CARDAPIO: linhas(dados.coqueteis).join('\n'),
    DESTILADOS: dados.destilados || '',
    // Versões em lista ({#EQUIPE_LISTA}{ITEM}{/EQUIPE_LISTA}): um parágrafo por item.
    EQUIPE_LISTA: linhas(dados.equipeTexto).map(function(l) { return { ITEM: l }; }),
    COQUETEIS_LISTA: linhas(dados.coqueteis).map(function(l) { return { ITEM: l }; }),
    OPCIONAIS: info.opcionais,
  };
}

// Baixa o modelo em uso ('proposta' ou o tipo de bebida do contrato).
function baixarModeloDocx(qual) {
  var tpl = qual === 'proposta' ? D.propostaTemplateDocx : _contratoModelo(qual);
  if (!tpl || !tpl.base64) { alert2('Nenhum modelo para baixar.', 'error'); return; }
  try {
    var bytes = Uint8Array.from(atob(tpl.base64), function(c) { return c.charCodeAt(0); });
    var nome = tpl.nome || ('Modelo ' + qual + '.docx');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
    a.download = /\.docx$/i.test(nome) ? nome : nome + '.docx';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) {
    alert2('Erro ao baixar o modelo: ' + e.message, 'error');
  }
}

function _orcContratoBaixarDocx(info) {
  if (!window.PizZip || !window.Docxtemplater) { alert2('Bibliotecas de geração de Word ainda não carregaram — aguarde e tente novamente.', 'error'); return false; }
  var tpl = _contratoModelo(info.dados.bebidasPor);
  if (!tpl) { alert2('Nenhum modelo de contrato importado para esse tipo de bebida.', 'error'); return false; }
  try {
    var zip = new PizZip(Uint8Array.from(atob(tpl.base64), function(c) { return c.charCodeAt(0); }));
    // Modelo com {{MARCAÇÃO}} ou {MARCAÇÃO} (como o da proposta).
    var docXml = (zip.file('word/document.xml') || { asText: function() { return ''; } }).asText().replace(/<[^>]+>/g, '');
    var opts = { paragraphLoop: true, linebreaks: true, nullGetter: function(part) {
      return part && !part.module && part.value ? '[' + part.value + '?]' : '';
    } };
    if (docXml.indexOf('{{') !== -1) opts.delimiters = { start: '{{', end: '}}' };
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
    docx.setData(_orcContratoMarcacoes(info));
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

function contratoImportarModelo(inputEl, tipo) {
  var m = _contratoModeloInfo(tipo);
  if (!m) return;
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
    D[m.chave] = { base64: btoa(binario), nome: file.name, tamanho: file.size, importadoEm: new Date().toISOString() };
    sv(m.chave);
    alert2('Modelo do contrato "' + m.rotulo + '" importado!');
    if (typeof orcView !== 'undefined' && orcView === 'lista' && typeof rOrcLista === 'function') rOrcLista();
  };
  reader.onerror = function() { alert2('Erro ao ler o arquivo.', 'error'); };
  reader.readAsArrayBuffer(file);
  inputEl.value = '';
}
