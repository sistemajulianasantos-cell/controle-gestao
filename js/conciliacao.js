// ─── CONCILIAÇÃO BANCÁRIA (pedido dela 10-26) ───────────────────────────────
// Ela importa o extrato do Itaú (.xlsx: Data | Lançamento | Razão Social |
// CPF/CNPJ | Valor | Saldo) sempre que quiser — períodos repetidos não
// duplicam, só entra o que ainda não existe. Cada entrada (crédito) é ligada
// a uma parcela do Contas a Receber:
//   - o sistema SUGERE (CPF do contrato, CPF já vinculado antes, ou nome +
//     valor) — nada é quitado sem ela confirmar;
//   - confirmar uma parcela pendente registra o pagamento pela mesma regra do
//     modal "Registrar pagamento" (_finAplicarPagamento: valor menor → precisa
//     de aprovação do admin; valor maior → excedente fica sinalizado p/ o admin decidir);
//   - parcela que ela já tinha dado baixa à mão é só marcada como conferida.
//
// D.extratoBancario = [{ id, chave, data, lancamento, razao, cpf, valor,
//   arquivo, importadoEm, parcelaId, modo, conciliadoEm, conciliadoPor,
//   ignorado, motivoIgnorado }]
//   modo: 'registrado' (pagamento lançado pela conciliação) | 'jaPago'
// A parcela guarda f.extratoId; a entrada só conta como conciliada se a
// parcela ainda apontar pra ela (pagamento desfeito/rejeitado → volta a pendente).
// Gravado fatiado por ano (dados/extrato_AAAA), como o financeiro.

var _concFiltro = 'pendentes';
var _concAno = String(new Date().getFullYear());
var _concMes = '';
var _concBusca = '';
var _concVincularId = null;

// Confirmação dentro do sistema, no lugar do confirm()/prompt() do navegador
// (pedido 10-26: "toco em Confirmar e não faz nada" — com muitas caixas
// seguidas o navegador oferece bloquear os diálogos da página e, bloqueado,
// todo confirm() volta "Cancelar" na hora, sem aparecer nada).
// opts: { ok: 'texto do botão', campo: 'placeholder' (pede um texto), valor }
// onOk(textoDigitado) roda ao clicar no botão principal.
function sisDialogo(texto, onOk, opts) {
  opts = opts || {};
  var el = document.getElementById('msis-dialogo');
  if (!el) {
    el = document.createElement('div');
    el.className = 'modal-overlay';
    el.id = 'msis-dialogo';
    el.style.zIndex = '6000'; // acima das outras janelas (pode abrir de dentro delas)
    el.innerHTML = '<div class="modal" style="max-width:520px;width:95%"><div id="msis-dialogo-corpo" style="padding:16px 18px"></div></div>';
    document.body.appendChild(el);
  }
  window._sisDialogoOk = function() {
    var campo = document.getElementById('msis-dialogo-campo');
    var v = campo ? campo.value : '';
    closeM('msis-dialogo');
    onOk(v);
  };
  document.getElementById('msis-dialogo-corpo').innerHTML =
    '<div style="font-size:13px;color:var(--text);white-space:pre-line;line-height:1.5">' + _concEsc(texto) + '</div>' +
    (opts.campo !== undefined ? '<input id="msis-dialogo-campo" class="inp" type="text" value="' + _concEsc(opts.valor || '') + '" placeholder="' + _concEsc(opts.campo) + '" style="width:100%;box-sizing:border-box;margin-top:10px">' : '') +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
      '<button class="btn" onclick="closeM(\'msis-dialogo\')" style="background:var(--bg3)">Cancelar</button>' +
      '<button class="btn" onclick="window._sisDialogoOk()" style="background:var(--blue);color:#fff">' + _concEsc(opts.ok || 'Confirmar') + '</button>' +
    '</div>';
  openM('msis-dialogo');
  var campo = document.getElementById('msis-dialogo-campo');
  if (campo && campo.focus) campo.focus();
}

function _concLista() { return D.extratoBancario || (D.extratoBancario = []); }
function _concEsc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function _concDig(s) { return String(s || '').replace(/\D/g, ''); }
function _concNorm(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim(); }
function _concTokens(s) {
  return _concNorm(s).split(/[^A-Z0-9]+/).filter(function(t) { return t.length >= 2 && !/^(DE|DA|DO|DOS|DAS|E|EM|LTDA|ME|EPP|SA)$/.test(t); });
}
function _concParcela(id) { return (D.financeiro || []).find(function(f) { return f.id === id; }) || null; }
function _concContratoDaParcela(f) {
  if (!f) return null;
  return (f.contratoId && (D.contratos || []).find(function(c) { return c.id === f.contratoId; })) ||
    (typeof _finContratoDoGrupo === 'function' ? _finContratoDoGrupo({ contratoId: f.contratoId, nome: f.evento || f.contrato, data: f.data }) : null);
}

// Conciliada = ligada a uma parcela que ainda aponta pra ela (pagamento
// inteiro em f.extratoId; parcial — cliente pagou a parcela em vários PIX —
// em f.extratoParciais).
function _concConciliada(e) {
  // PIX distribuído entre várias parcelas do cliente (e.distribuicao =
  // { parcelaId: valor }) ou ligado a uma só (e.parcelaId).
  var ids = Object.keys(e.distribuicao || {});
  if (e.parcelaId && ids.indexOf(e.parcelaId) === -1) ids.push(e.parcelaId);
  return ids.some(function(pid) {
    var f = _concParcela(pid);
    return !!(f && (f.extratoId === e.id || (f.extratoParciais || []).indexOf(e.id) !== -1));
  });
}

// Quanto falta receber da parcela (descontando PIX parciais já ligados).
function _concRestante(f) {
  return Math.round(((Number(f.valorNum) || 0) - (Number(f.recebidoParcial) || 0)) * 100) / 100;
}
function _concSomaParciais(f) {
  return (f.extratoParciais || []).reduce(function(s, id) {
    var e = _concLista().find(function(x) { return x.id === id; });
    if (!e) return s;
    // PIX distribuído: só a parte que ela pôs nesta parcela.
    return s + (e.distribuicao && e.distribuicao[f.id] != null ? Number(e.distribuicao[f.id]) || 0 : e.valor);
  }, 0);
}

// ─── IMPORTAÇÃO ──────────────────────────────────────────────────────────────

function _concDataISO(v) {
  if (v == null || v === '') return '';
  if (typeof v === 'number' && window.XLSX && XLSX.SSF) {
    var d = XLSX.SSF.parse_date_code(v);
    return d ? d.y + '-' + String(d.m).padStart(2, '0') + '-' + String(d.d).padStart(2, '0') : '';
  }
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  var m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(String(v));
  return m ? m[3] + '-' + m[2] + '-' + m[1] : '';
}

function _concValor(v) {
  if (typeof v === 'number') return v;
  var t = String(v || '').replace(/[^\d,.\-]/g, '');
  if (!t) return 0;
  return typeof parseValorBR === 'function' ? parseValorBR(t) : parseFloat(t.replace(/\./g, '').replace(',', '.')) || 0;
}

// Chave do lançamento pra não duplicar: data + CPF + nome + valor (o texto do
// "Lançamento" muda entre exportações do banco, ex. "PIX RECEBIDO X" ×
// "ENTRADA PIX TRANSF X"). Sem CPF/nome (rendimento, resgate) entra o texto.
// O #n diferencia dois pagamentos iguais no mesmo dia.
function _concChaveBase(e) {
  var quem = _concDig(e.cpf) + '|' + _concNorm(e.razao);
  if (quem === '|') quem = _concNorm(e.lancamento);
  return e.data + '|' + quem + '|' + Math.round(e.valor * 100);
}

function concImportarExtrato(input) {
  var file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  if (!window.XLSX) { alert2('Biblioteca de planilha ainda não carregou — tente de novo em instantes.', 'error'); return; }
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
      var ws = wb.Sheets[wb.SheetNames[0]];
      var linhas = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
      _concProcessarLinhas(linhas, file.name);
    } catch (e) {
      console.error(e);
      alert2('Não consegui ler esse arquivo: ' + e.message + '. Use o extrato baixado do Itaú em Excel (.xlsx).', 'error');
    }
  };
  reader.onerror = function() { alert2('Erro ao ler o arquivo.', 'error'); };
  reader.readAsArrayBuffer(file);
}

function _concProcessarLinhas(linhas, arquivo) {
  // Acha a linha de cabeçalho (Data | Lançamento | Razão Social | CPF/CNPJ | Valor)
  var iCab = -1, col = {};
  for (var i = 0; i < Math.min(linhas.length, 40); i++) {
    var cab = linhas[i].map(function(c) { return _concNorm(c); });
    var iData = cab.indexOf('DATA');
    var iValor = cab.findIndex(function(c) { return /^VALOR/.test(c); });
    if (iData !== -1 && iValor !== -1) {
      iCab = i;
      col = {
        data: iData, valor: iValor,
        lanc: cab.findIndex(function(c) { return /^LANCAMENTO|^HISTORICO|^DESCRICAO/.test(c); }),
        razao: cab.findIndex(function(c) { return /RAZAO|NOME/.test(c); }),
        cpf: cab.findIndex(function(c) { return /CPF|CNPJ/.test(c); }),
      };
      break;
    }
  }
  if (iCab === -1) { alert2('Não achei as colunas Data e Valor nesse arquivo — confira se é o extrato de lançamentos do Itaú.', 'error'); return; }
  // Cabeçalho do extrato (Nome / Agência / Conta) — vai no "print do extrato".
  var conta = {};
  for (var k = 0; k < iCab; k++) {
    var rot = _concNorm(linhas[k][0]).replace(/:$/, '');
    var val = String(linhas[k][1] == null ? '' : linhas[k][1]).trim();
    if (rot === 'NOME') conta.titular = val;
    else if (rot === 'AGENCIA') conta.agencia = val;
    else if (rot === 'CONTA') conta.conta = val;
  }

  var existentes = {};
  _concLista().forEach(function(e) { existentes[e.chave] = true; });
  var contagem = {};
  var novos = [], repetidos = 0, saidas = 0;
  var agora = new Date().toISOString();
  for (var j = iCab + 1; j < linhas.length; j++) {
    var l = linhas[j];
    var data = _concDataISO(l[col.data]);
    var valor = Math.round(_concValor(l[col.valor]) * 100) / 100;
    if (!data || !valor) continue;
    if (valor < 0) { saidas++; continue; } // só entradas — é conciliação de recebimentos
    var e = {
      data: data, valor: valor,
      lancamento: col.lanc !== -1 ? String(l[col.lanc] || '').trim() : '',
      razao: col.razao !== -1 ? String(l[col.razao] || '').trim() : '',
      cpf: col.cpf !== -1 ? String(l[col.cpf] || '').trim() : '',
    };
    var base = _concChaveBase(e);
    contagem[base] = (contagem[base] || 0) + 1;
    e.chave = base + '#' + contagem[base];
    if (existentes[e.chave]) { repetidos++; continue; }
    existentes[e.chave] = true;
    e.id = _gerarId('EXT');
    e.arquivo = arquivo;
    if (conta.agencia || conta.conta) e.contaBanco = conta;
    e.importadoEm = agora;
    // Sem pagador (rendimento, resgate de aplicação): não é cliente — já
    // entra como ignorada; dá pra reativar.
    if (!e.razao && !_concDig(e.cpf)) { e.ignorado = true; e.motivoIgnorado = 'Movimentação do banco (sem pagador)'; }
    novos.push(e);
  }
  if (novos.length) {
    Array.prototype.push.apply(_concLista(), novos);
    sv('extratoBancario');
  }
  var clientes = novos.filter(function(e) { return !e.ignorado; }).length;
  alert2(novos.length
    ? novos.length + ' lançamento(s) novo(s) importado(s) (' + clientes + ' de clientes)' + (repetidos ? ', ' + repetidos + ' já estavam no sistema e foram ignorados' : '') + '.'
    : 'Nenhum lançamento novo — os ' + repetidos + ' do arquivo já estavam no sistema.');
  // Mostra o mês mais recente do arquivo.
  if (novos.length) { var ult = novos[novos.length - 1].data; _concAno = ult.slice(0, 4); _concMes = ''; }
  rConciliacao();
}

// ─── SUGESTÕES ───────────────────────────────────────────────────────────────

// CPFs que ela já vinculou à mão a algum contrato (pagador ≠ titular).
function _concCpfsAprendidos() {
  var mapa = {};
  _concLista().forEach(function(e) {
    var cpf = _concDig(e.cpf);
    if (!cpf || !_concConciliada(e)) return;
    var f = _concParcela(e.parcelaId);
    var k = typeof _finChaveContrato === 'function' ? _finChaveContrato(f) : (f.contratoId || f.contrato);
    (mapa[cpf] || (mapa[cpf] = {}))[k] = true;
  });
  return mapa;
}

function _concDiasEntre(a, b) {
  if (!a || !b) return 999;
  return Math.abs(Math.round((new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / 86400000));
}

// Como o nome do pagador bate com o do contrato:
//   'completo' — 2+ palavras iguais (nome e sobrenome);
//   'parcial'  — só 1 palavra (só o primeiro nome, ou só um sobrenome —
//                parente pagando): só vale junto com valor igual.
function _concComparaNome(tokPagador, tokContrato) {
  var comuns = tokPagador.filter(function(t) { return tokContrato.indexOf(t) !== -1; });
  if (comuns.length >= 2) return { nivel: 'completo', comuns: comuns.length };
  if (comuns.length === 1) return { nivel: 'parcial', comuns: 1, sobrenome: comuns[0] !== tokPagador[0] };
  return null;
}

// " (ligada ao PIX de 06/10/2025)" / " (sugerida para o PIX de 06/10/2025)"
function _concOcupadaPor(f, reservadaPor) {
  if (f.extratoId) {
    var e = _concLista().find(function(x) { return x.id === f.extratoId; });
    return ' (ligada ao PIX de ' + (e ? fd(e.data) + ' ' + fR(e.valor) : 'outro lançamento') + ')';
  }
  if (reservadaPor) return ' (sugerida para o PIX de ' + fd(reservadaPor.data) + ' ' + fR(reservadaPor.valor) + ')';
  return '';
}

// Melhor parcela para cada entrada pendente, somando os fatores: CPF do
// contrato, CPF já vinculado antes, nome (completo ou parcial), valor igual ao
// que falta da parcela, data do PIX perto do vencimento/antes do evento.
// Parcela com valor igual fica reservada para um PIX só; com valor diferente
// pode aparecer para mais de um (cliente pagando a parcela em vários PIX).
// Sem parcela aberta, mas contrato reconhecido → devolve um diagnóstico.
function _concCalcularSugestoes() {
  var aprendidos = _concCpfsAprendidos();
  var reservadas = {};
  var parcelas = (D.financeiro || []).filter(function(f) { return !f.aprovacaoPendente && !f.isRecebidoAMais; }).map(function(f) {
    var c = _concContratoDaParcela(f);
    return {
      f: f, c: c,
      tokens: _concTokens([f.contrato, f.evento, c && c.nome].filter(Boolean).join(' ')),
      cpf: _concDig(c && c.cpf),
      chave: typeof _finChaveContrato === 'function' ? _finChaveContrato(f) : '',
    };
  });
  var sug = {};
  _concLista().filter(function(e) { return !e.ignorado && !_concConciliada(e); })
    .sort(function(a, b) { return a.data.localeCompare(b.data) || b.valor - a.valor; })
    .forEach(function(e) {
      var cpf = _concDig(e.cpf);
      var tok = _concTokens(e.razao);
      var melhor = null, reconhecidas = [];
      parcelas.forEach(function(p) {
        var porCpf = !!(cpf && (cpf === p.cpf || (aprendidos[cpf] && aprendidos[cpf][p.chave])));
        var nome = _concComparaNome(tok, p.tokens);
        var forte = porCpf || (nome && nome.nivel === 'completo');
        if (!forte && !nome) return;
        var pago = p.f.status === 'pago';
        var ocupada = !!p.f.extratoId || reservadas[p.f.id];
        var esperado = pago ? (Number(p.f.valorPago) || Number(p.f.valorNum) || 0) : _concRestante(p.f);
        var valorIgual = Math.abs(esperado - e.valor) <= 0.01;
        if (forte) reconhecidas.push(p);
        if (ocupada) return;
        // Só um nome/sobrenome em comum: precisa do valor igual.
        if (!forte && !valorIgual) return;
        // Já baixada à mão: só casa se valor e data do pagamento baterem.
        if (pago && (!valorIgual || _concDiasEntre(p.f.dataPagamento, e.data) > 5)) return;
        var venc = p.f.vencimento || p.f.data || '9999';
        var antesDoEvento = !p.f.data || e.data <= p.f.data || p.f.isFechamento;
        var nota = (valorIgual ? 100 : 0) + (porCpf ? 60 : 0) + (nome ? nome.comuns * 15 : 0) +
          (antesDoEvento ? 10 : 0) + (pago ? 5 : 0) -
          // Parcela que vence depois do PIX: quanto mais longe, menos provável.
          // Já vencida: todas empatam e fica a mais antiga (quita em ordem).
          (e.data < venc ? Math.min(30, _concDiasEntre(venc, e.data) / 10) : 0);
        if (!melhor || nota > melhor.nota + 0.001 || (Math.abs(nota - melhor.nota) <= 0.001 && venc < melhor.venc)) {
          melhor = { p: p, nota: nota, venc: venc, valorIgual: valorIgual, porCpf: porCpf, nome: nome, forte: forte, pago: pago };
        }
      });
      if (melhor) {
        if (melhor.valorIgual) reservadas[melhor.p.f.id] = e;
        var motivo = [];
        if (melhor.porCpf) motivo.push('CPF');
        if (melhor.nome) motivo.push(melhor.nome.nivel === 'completo' ? 'nome' : (melhor.nome.sobrenome ? 'mesmo sobrenome' : 'mesmo primeiro nome'));
        motivo.push(melhor.valorIgual ? 'valor igual' : 'valor diferente');
        if (melhor.pago) motivo.push('já baixada em ' + fd(melhor.p.f.dataPagamento));
        if (Number(melhor.p.f.recebidoParcial)) motivo.push('falta ' + fR(_concRestante(melhor.p.f)));
        // "Alta" (entra no confirmar em lote): identificado por CPF/nome completo E valor igual.
        sug[e.id] = { parcelaId: melhor.p.f.id, alta: melhor.valorIgual && melhor.forte, valorIgual: melhor.valorIgual, motivo: motivo.join(' · ') };
      } else if (reconhecidas.length) {
        // Contrato reconhecido, mas nenhuma parcela aberta pra esse PIX.
        var p0 = reconhecidas[0];
        var irmas = reconhecidas.filter(function(p) { return p.chave === p0.chave; }).map(function(p) {
          var f = p.f;
          return (f.descricao || 'parcela') + ' ' + fR(f.status === 'pago' ? (f.valorPago || f.valorNum) : f.valorNum) + ' — ' +
            (f.status === 'pago' ? 'paga ' + fd(f.dataPagamento) : 'pendente') + _concOcupadaPor(f, reservadas[f.id]);
        });
        sug[e.id] = { diag: true, contrato: p0.f.evento || p0.f.contrato || '', contratoId: p0.c ? p0.c.id : '', parcelas: irmas };
      }
    });
  return sug;
}

// ─── VINCULAR ────────────────────────────────────────────────────────────────

function _concUsuario() { return typeof _orcUsuarioAtual === 'function' ? _orcUsuarioAtual() : ((typeof perfilAtual !== 'undefined' && perfilAtual) || ''); }

// Liga a entrada à parcela. Não grava.
//   tipo 'total'   — registra o pagamento (regras do Contas a Receber), somando
//                    os PIX parciais que já estavam ligados à parcela;
//   tipo 'parcial' — cliente vai pagar a parcela em mais de um PIX: guarda o
//                    PIX e só quita quando a soma completar o valor;
//   parcela já paga → só marca como conferida.
function _concAplicarVinculo(e, f, tipo) {
  var marcar = function(modo) {
    e.modo = modo; e.parcelaId = f.id;
    e.conciliadoEm = new Date().toISOString(); e.conciliadoPor = _concUsuario();
  };
  // Registra o pagamento da parcela com o total recebido (este PIX + parciais).
  var registrar = function(total) {
    var qtd = (f.extratoParciais || []).length;
    var r = _finAplicarPagamento(f, {
      valorPago: Math.round(total * 100) / 100, dataPagamento: e.data,
      formaPagamento: /PIX/i.test(e.lancamento) ? 'pix' : 'transferencia',
      temComprovante: false, comprovanteTipo: '',
      comprovanteNome: 'Extrato bancário ' + fd(e.data) + (qtd > 1 ? ' (' + qtd + ' PIX)' : ''),
    });
    f.extratoId = e.id;
    f.recebidoParcial = 0;
    return { msg: r.msg, aguardando: r.aguardandoAprovacao };
  };

  if (f.status === 'pago') {
    f.extratoId = e.id; marcar('jaPago');
    return { msg: 'Pagamento já registrado — marcado como conferido no extrato.', aguardando: false };
  }
  if (tipo === 'parcial') {
    f.extratoParciais = (f.extratoParciais || []).concat(e.id);
    f.recebidoParcial = Math.round(_concSomaParciais(f) * 100) / 100;
    marcar('parcial');
    if (f.recebidoParcial < (Number(f.valorNum) || 0) - 0.01) {
      return { msg: 'PIX parcial guardado — recebido ' + fR(f.recebidoParcial) + ' de ' + fR(f.valorNum) + ', falta ' + fR(_concRestante(f)) + '. A parcela é quitada quando a soma completar.', aguardando: false };
    }
    return registrar(_concSomaParciais(f)); // a soma completou a parcela
  }
  marcar('registrado');
  return registrar(e.valor + _concSomaParciais(f));
}

function _concTextoParcela(f) {
  if (!f) return 'Parcela não encontrada';
  return (f.evento || f.contrato || '—') + ' — ' + (f.descricao || '') + ' (' + fR(f.status === 'pago' ? (f.valorPago || f.valorNum) : f.valorNum) + ')' +
    (f.status !== 'pago' && Number(f.recebidoParcial) ? ' · recebido ' + fR(f.recebidoParcial) + ', falta ' + fR(_concRestante(f)) : '');
}

function concConfirmarSugestao(entradaId) {
  var e = _concLista().find(function(x) { return x.id === entradaId; });
  var s = _concCalcularSugestoes()[entradaId];
  if (!e || !s || !s.parcelaId) return;
  _concVincular(e, _concParcela(s.parcelaId));
}

function _concVincular(e, f) {
  if (!e || !f) return;
  if (f.extratoId && f.extratoId !== e.id) { alert2('Essa parcela já está ligada a outro lançamento do extrato.', 'error'); return; }
  var cab = 'PIX de ' + fR(e.valor) + ' (' + (e.razao || e.lancamento) + ', ' + fd(e.data) + ') →\n' + _concTextoParcela(f) + '\n\n';
  var concluir = function(tipo) {
    var r = _concAplicarVinculo(e, f, tipo);
    sv('financeiro'); sv('extratoBancario');
    closeM('mconc-vincular');
    alert2(r.msg, r.aguardando ? 'error' : 'success');
    rConciliacao();
  };
  if (f.status === 'pago') {
    sisDialogo(cab + 'A parcela já está paga — só vai ser marcada como conferida no extrato.', function() { concluir('total'); }, { ok: 'Marcar como conferida' });
    return;
  }
  var restante = _concRestante(f);
  var dif = Math.round((e.valor - restante) * 100) / 100;
  var jaRecebido = Number(f.recebidoParcial) ? 'Já recebido nessa parcela: ' + fR(f.recebidoParcial) + ' — falta ' + fR(restante) + '.\n' : '';
  if (dif >= 0) {
    sisDialogo(cab + jaRecebido + (dif > 0
      ? 'O valor é ' + fR(dif) + ' MAIOR que o que falta — o excedente NÃO é abatido em nada: fica sinalizado para o administrador decidir (abater em outra parcela ou manter como receita).'
      : 'O pagamento da parcela será registrado.'), function() { concluir('total'); }, { ok: 'Registrar pagamento' });
    return;
  }
  // Valor menor que o que falta: parcial (vem mais PIX) ou valor final com desconto?
  _concEscolherMenor(e, f, restante, concluir);
}

// Janela de escolha quando o PIX é menor do que falta pagar da parcela.
function _concEscolherMenor(e, f, restante, concluir) {
  _concModalEl();
  var admin = typeof perfilAtual !== 'undefined' && perfilAtual === 'admin';
  window._concConcluirMenor = concluir;
  document.getElementById('mconc-corpo').innerHTML =
    '<div style="font-size:13px;color:var(--text);margin-bottom:6px"><b>' + fR(e.valor) + '</b> de ' + _concEsc(e.razao || e.lancamento) + ' (' + fd(e.data) + ')</div>' +
    '<div style="font-size:12px;color:var(--text2);margin-bottom:12px">' + _concEsc(_concTextoParcela(f)) + ' — falta ' + fR(restante) + '. O PIX é ' + fR(restante - e.valor) + ' menor.</div>' +
    '<div style="display:grid;gap:8px">' +
      '<button class="btn" onclick="window._concConcluirMenor(\'parcial\')" style="background:var(--blue);color:#fff;text-align:left">Pagamento parcial<br><span style="font-size:11px;font-weight:400">O cliente vai pagar o resto em outro(s) PIX. A parcela fica pendente e é quitada quando a soma completar.</span></button>' +
      '<button class="btn" onclick="window._concConcluirMenor(\'total\')" style="background:var(--bg3);text-align:left">Valor final da parcela (desconto)<br><span style="font-size:11px;font-weight:400;color:var(--text3)">' +
        (admin ? 'Quita a parcela com esse valor — a diferença fica como desconto.' : 'Vai para aprovação do administrador antes de quitar.') + '</span></button>' +
      '<button class="btn" onclick="closeM(\'mconc-vincular\')" style="background:var(--bg3)">Cancelar</button>' +
    '</div>';
  openM('mconc-vincular');
}

function concConfirmarTodas() {
  var sug = _concCalcularSugestoes();
  var lista = _concFiltradas().filter(function(e) { return sug[e.id] && sug[e.id].alta; });
  if (!lista.length) { alert2('Nenhuma sugestão com valor igual para confirmar.', 'error'); return; }
  var total = lista.reduce(function(s, e) { return s + e.valor; }, 0);
  sisDialogo('Confirmar ' + lista.length + ' sugestão(ões) com valor igual (' + fR(total) + ')?\n\nCada uma registra o pagamento na parcela sugerida (ou marca como conferida, se já estava paga). Confira a lista antes — dá pra desfazer depois.', function() {
    var ok = 0;
    lista.forEach(function(e) {
      var f = _concParcela(sug[e.id].parcelaId);
      if (f && !f.extratoId) { _concAplicarVinculo(e, f, 'total'); ok++; }
    });
    sv('financeiro'); sv('extratoBancario');
    alert2(ok + ' lançamento(s) conciliado(s).');
    rConciliacao();
  }, { ok: 'Confirmar ' + lista.length });
}

function concDesfazer(entradaId) {
  var e = _concLista().find(function(x) { return x.id === entradaId; });
  if (!e) return;
  if (e.modo === 'distribuido') { _concDesfazerDistribuicao(e); return; }
  var f = _concParcela(e.parcelaId);
  var limpar = function() {
    e.parcelaId = ''; e.modo = ''; e.conciliadoEm = ''; e.conciliadoPor = '';
    sv('financeiro'); sv('extratoBancario');
    rConciliacao();
  };
  if (f && e.modo === 'parcial' && f.status !== 'pago' && !f.aprovacaoPendente) {
    // Parcial com a parcela ainda aberta: só tira este PIX da soma.
    sisDialogo('Tirar este PIX parcial de ' + fR(e.valor) + ' da parcela?', function() {
      f.extratoParciais = (f.extratoParciais || []).filter(function(id) { return id !== e.id; });
      f.recebidoParcial = Math.round(_concSomaParciais(f) * 100) / 100;
      limpar();
    }, { ok: 'Tirar' });
  } else if (f && (f.extratoId === e.id || (f.extratoParciais || []).indexOf(e.id) !== -1) && e.modo !== 'jaPago') {
    // Pagamento lançado pela conciliação (inteiro, ou parciais que completaram
    // a parcela): desfaz pelo mesmo caminho do Contas a Receber — todos os PIX
    // dessa parcela voltam a ficar pendentes.
    sisDialogo('Desfazer o pagamento registrado nesta parcela?\n' + _concTextoParcela(f) + '\n\nA parcela volta a ficar pendente (e todos os PIX ligados a ela voltam para "A conciliar").', function() {
      marcarPendente(f.id, true);
      limpar();
    }, { ok: 'Desfazer pagamento' });
  } else if (f && f.extratoId === e.id) {
    // Pagamento que ela já tinha registrado à mão: só tira o vínculo.
    sisDialogo('Tirar o vínculo deste lançamento com a parcela? O pagamento que já estava registrado continua como está.', function() {
      f.extratoId = '';
      limpar();
    }, { ok: 'Tirar vínculo' });
  } else {
    limpar();
  }
}

// "Ajustar parcelas" (pedido dela 10-26 — caminho reverso, sem abrir o
// contrato): abre o Plano de pagamento do contrato já sugerindo parcelado a
// partir dos PIX do cliente — valor da parcela = este PIX, dia = o dia em que
// ele paga, 1º mês = o PIX mais antigo dele ainda sem vínculo. Ela confere e
// salva; o contrato e o Contas a Receber são atualizados (planoSalvarContrato).
function concAjustarParcelas(entradaId, contratoId) {
  var e = _concLista().find(function(x) { return x.id === entradaId; });
  var c = (D.contratos || []).find(function(x) { return x.id === contratoId; });
  if (!e || !c) return;
  var parcelas = typeof _planoParcelasDoContrato === 'function' ? _planoParcelasDoContrato(c) : [];
  var jaPago = parcelas.filter(function(f) { return f.status === 'pago'; })
    .reduce(function(s, f) { return s + (typeof _finValorNoContrato === 'function' ? _finValorNoContrato(f) : (Number(f.valorNum) || 0)); }, 0);
  var falta = Math.round((_planoValorContrato(c) - jaPago) * 100) / 100;
  // PIX do mesmo pagador (CPF, ou nome) com valor parecido, ainda sem vínculo.
  var cpf = _concDig(e.cpf), nome = _concNorm(e.razao);
  var irmaos = _concLista().filter(function(x) {
    if (x.ignorado || _concConciliada(x)) return false;
    var mesmo = cpf ? _concDig(x.cpf) === cpf : _concNorm(x.razao) === nome;
    return mesmo && Math.abs(x.valor - e.valor) <= Math.max(1, e.valor * 0.01);
  }).sort(function(a, b) { return a.data.localeCompare(b.data); });
  var primeiro = irmaos[0] || e;
  // Nada pago ainda e o cliente tem um PIX igual à 1ª parcela pendente (o
  // sinal) → esse PIX é a entrada; as parcelas dividem o resto.
  var entrada = 0, entradaVenc = primeiro.data;
  var pagas = parcelas.filter(function(f) { return f.status === 'pago'; });
  var pendentes = parcelas.filter(function(f) { return f.status !== 'pago'; });
  var p1 = pendentes.find(function(f) { return /sinal|entrada|assinatura|20%|30%|50%/i.test(f.descricao || ''); }) || pendentes[0];
  if (!pagas.length && p1) {
    var pixSinal = _concLista().find(function(x) {
      if (x.ignorado || _concConciliada(x) || Math.abs(x.valor - (Number(p1.valorNum) || 0)) > 0.01) return false;
      return cpf ? _concDig(x.cpf) === cpf : _concNorm(x.razao) === nome;
    });
    if (pixSinal) { entrada = pixSinal.valor; entradaVenc = pixSinal.data; }
  }
  var resto = falta - entrada;
  var cfg = {
    tipo: 'parcelado', entradaModo: 'R$', entrada: entrada, entradaVenc: entradaVenc,
    qtd: e.valor > 0 ? Math.max(1, Math.round(resto / e.valor)) : '',
    dia: Number(primeiro.data.slice(8, 10)), primeiroMes: primeiro.data.slice(0, 7),
  };
  planoAbrir(contratoId, cfg);
}

function concIgnorar(entradaId, ignorar) {
  var e = _concLista().find(function(x) { return x.id === entradaId; });
  if (!e) return;
  if (ignorar) {
    sisDialogo('Por que ignorar este lançamento?\n' + (e.razao || e.lancamento) + ' — ' + fR(e.valor) + ' em ' + fd(e.data), function(motivo) {
      e.ignorado = true; e.motivoIgnorado = String(motivo || '').trim() || 'Ignorado';
      sv('extratoBancario');
      rConciliacao();
    }, { ok: 'Ignorar', campo: 'ex: pagamento de degustação, transferência entre contas, devolução' });
    return;
  }
  e.ignorado = false; e.motivoIgnorado = '';
  sv('extratoBancario');
  rConciliacao();
}

// ─── "PRINT DO EXTRATO" (comprovante em imagem) ─────────────────────────────
// Os pagamentos antigos tinham um print do extrato anexado como comprovante;
// os da conciliação não têm arquivo — esta imagem é desenhada na hora, a
// partir da(s) linha(s) do extrato ligada(s) à parcela (pedido dela 10-26).
function concAbrirPrintExtrato(parcelaId) {
  var f = _concParcela(parcelaId);
  if (!f) return;
  var ids = [f.extratoId].concat(f.extratoParciais || []).filter(Boolean).filter(function(v, i, a) { return a.indexOf(v) === i; });
  var lista = ids.map(function(id) { return _concLista().find(function(e) { return e.id === id; }); }).filter(Boolean)
    .sort(function(a, b) { return a.data.localeCompare(b.data); });
  if (!lista.length) { alert2('Nenhum PIX do extrato ligado a esta parcela.', 'error'); return; }
  var png = _concDesenharPrint(f, lista);
  if (typeof _abrirComprovanteJanela === 'function') _abrirComprovanteJanela(png, 'image/png', 'Extrato ' + (f.evento || f.contrato || '') + ' ' + (f.descricao || ''));
}

function _concDesenharPrint(f, lista) {
  var W = 1100, linhaH = 34, topo = 150;
  var H = topo + 40 + lista.length * linhaH + 110;
  var cv = document.createElement('canvas');
  var esc = window.devicePixelRatio > 1 ? 2 : 1;
  cv.width = W * esc; cv.height = H * esc;
  var g = cv.getContext('2d');
  g.scale(esc, esc);
  var fonte = function(px, peso) { g.font = (peso || '') + ' ' + px + 'px Arial, Helvetica, sans-serif'; };
  var txt = function(s, x, y, alinhar) { g.textAlign = alinhar || 'left'; g.fillText(String(s == null ? '' : s), x, y); };
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);

  // Extrato importado antes de guardar a conta: usa a da importação mais recente.
  var c = lista[0].contaBanco || (_concLista().filter(function(e) { return e.contaBanco; })
    .sort(function(a, b) { return (b.importadoEm || '').localeCompare(a.importadoEm || ''); })[0] || {}).contaBanco || {};
  g.fillStyle = '#111111';
  fonte(22, 'bold'); txt('Extrato de lançamentos', 30, 44);
  fonte(13); g.fillStyle = '#444444';
  var y = 70;
  [['Titular', c.titular || 'ROMERO COQUETEIS'], ['Agência', c.agencia || ''], ['Conta', c.conta || '']].forEach(function(l) {
    if (!l[1]) return;
    fonte(13, 'bold'); g.fillStyle = '#444444'; txt(l[0] + ':', 30, y);
    fonte(13); g.fillStyle = '#111111'; txt(l[1], 110, y);
    y += 20;
  });
  fonte(12); g.fillStyle = '#666666';
  txt('Recebimento referente a: ' + (f.evento || f.contrato || '') + ' — ' + (f.descricao || ''), W - 30, 70, 'right');

  // Tabela: Data | Lançamento | Razão Social | CPF/CNPJ | Valor (R$)
  var cols = [{ t: 'Data', x: 30 }, { t: 'Lançamento', x: 140 }, { t: 'Razão Social', x: 470 }, { t: 'CPF/CNPJ', x: 800 }, { t: 'Valor (R$)', x: W - 30, a: 'right' }];
  var yCab = topo;
  g.fillStyle = '#e9e9e9'; g.fillRect(20, yCab - 22, W - 40, 32);
  g.fillStyle = '#111111'; fonte(13, 'bold');
  cols.forEach(function(col) { txt(col.t, col.x, yCab, col.a); });
  fonte(13);
  lista.forEach(function(e, i) {
    var yl = yCab + 34 + i * linhaH;
    g.fillStyle = '#c9f0c9'; g.fillRect(20, yl - 22, W - 40, linhaH - 2);
    g.fillStyle = '#111111';
    txt(fd(e.data), cols[0].x, yl);
    txt(String(e.lancamento || '').slice(0, 40), cols[1].x, yl);
    txt(String(e.razao || '').slice(0, 38), cols[2].x, yl);
    txt(e.cpf || '', cols[3].x, yl);
    txt(e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), cols[4].x, yl, 'right');
  });
  var yTot = yCab + 34 + lista.length * linhaH + 8;
  if (lista.length > 1) {
    fonte(13, 'bold');
    var soma = lista.reduce(function(s, e) { return s + e.valor; }, 0);
    txt('Total: ' + soma.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), W - 30, yTot + 6, 'right');
  }
  // Rodapé: de onde veio
  var e0 = lista[0];
  fonte(11); g.fillStyle = '#777777';
  txt('Gerado pelo sistema a partir do extrato importado' + (e0.arquivo ? ' (' + e0.arquivo + ')' : '') +
    (e0.importadoEm ? ' em ' + new Date(e0.importadoEm).toLocaleDateString('pt-BR') : '') +
    (e0.conciliadoPor ? ' · conciliado por ' + e0.conciliadoPor : '') +
    (e0.conciliadoEm ? ' em ' + new Date(e0.conciliadoEm).toLocaleDateString('pt-BR') : ''), 30, H - 30);
  return cv.toDataURL('image/png');
}

// ─── VINCULAR À MÃO (janela) ─────────────────────────────────────────────────

function _concModalEl() {
  var el = document.getElementById('mconc-vincular');
  if (el) return el;
  el = document.createElement('div');
  el.className = 'modal-overlay';
  el.id = 'mconc-vincular';
  el.innerHTML = '<div class="modal" style="max-width:640px;width:95%">' +
    '<div class="modal-head"><span class="modal-title">Vincular lançamento a uma parcela</span>' +
    '<button class="modal-close" onclick="closeM(\'mconc-vincular\')">×</button></div>' +
    '<div id="mconc-corpo" style="padding:14px 18px;max-height:80vh;overflow:auto"></div></div>';
  document.body.appendChild(el);
  return el;
}

function concAbrirVincular(entradaId) {
  var e = _concLista().find(function(x) { return x.id === entradaId; });
  if (!e) return;
  _concVincularId = entradaId;
  _concModalEl();
  var primeiro = _concTokens(e.razao)[0] || '';
  document.getElementById('mconc-corpo').innerHTML =
    '<div style="background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:10px 12px;margin-bottom:12px;font-size:12px">' +
      '<div style="font-weight:600;color:var(--text)">' + _concEsc(e.razao || e.lancamento) + ' <span style="font-family:var(--mono);color:var(--green);margin-left:6px">' + fR(e.valor) + '</span></div>' +
      '<div style="color:var(--text3)">' + fd(e.data) + (e.cpf ? ' · ' + _concEsc(e.cpf) : '') + ' · ' + _concEsc(e.lancamento) + '</div>' +
    '</div>' +
    '<input id="mconc-busca" class="inp" type="text" value="' + _concEsc(primeiro.charAt(0) + primeiro.slice(1).toLowerCase()) + '" placeholder="Buscar contrato/evento pelo nome" oninput="_concRenderBuscaParcelas()" style="width:100%;box-sizing:border-box">' +
    '<label style="display:flex;gap:6px;align-items:center;font-size:11px;color:var(--text3);margin:6px 0"><input type="checkbox" id="mconc-pagas" onchange="_concRenderBuscaParcelas()" style="width:auto;margin:0"> Mostrar também parcelas já pagas (pagamento registrado à mão)</label>' +
    '<div id="mconc-resultados"></div>' +
    '<div style="font-size:11px;color:var(--text3);margin-top:10px">Depois de vincular, os próximos pagamentos desse CPF já aparecem sugeridos para o mesmo contrato.</div>';
  _concRenderBuscaParcelas();
  openM('mconc-vincular');
}

function _concRenderBuscaParcelas() {
  var el = document.getElementById('mconc-resultados');
  if (!el) return;
  var e = _concLista().find(function(x) { return x.id === _concVincularId; });
  var termo = _concTokens((document.getElementById('mconc-busca') || {}).value || '');
  var verPagas = (document.getElementById('mconc-pagas') || {}).checked;
  // Clientes (contratos) com o nome buscado: "Vincular ao cliente" e distribuir.
  var norm = function(s) { return _concTokens(s); };
  var contratos = termo.length ? (D.contratos || []).filter(function(c) {
    if (c.status === 'cancelado') return false;
    var tok = norm([c.nome, c.nomeEvento].filter(Boolean).join(' '));
    return termo.every(function(t) { return tok.some(function(x) { return x.indexOf(t) === 0; }); });
  }).slice(0, 6) : [];
  var htmlContratos = contratos.length ? '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:4px 0">Vincular ao cliente (você distribui no que está em aberto)</div>' +
    contratos.map(function(c) {
      var aberto = _concParcelasAbertas(c).reduce(function(s, f) { return s + _concRestante(f); }, 0);
      return '<div onclick="concAbrirDistribuir(\'' + _concVincularId + '\',\'' + c.id + '\')" style="display:flex;gap:10px;align-items:center;padding:8px 10px;border:1px solid var(--blue);border-radius:var(--radius);margin-bottom:4px;cursor:pointer;font-size:12px" onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'\'">' +
        '<div style="flex:1"><b style="color:var(--text)">' + _concEsc(c.nome || '') + '</b><div style="color:var(--text3)">evento ' + fd(c.data) + '</div></div>' +
        '<div style="text-align:right;font-size:11px;color:var(--text3)">em aberto<div style="font-family:var(--mono);color:var(--text)">' + fR(aberto) + '</div></div></div>';
    }).join('') + '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:10px 0 4px">Ou uma parcela específica</div>' : '';
  var lista = (D.financeiro || []).filter(function(f) {
    if (f.isRecebidoAMais) return false;
    if (f.extratoId && f.extratoId !== _concVincularId) return false;
    if (f.aprovacaoPendente) return false;
    if (f.status === 'pago' && !verPagas) return false;
    if (!termo.length) return true;
    var c = _concContratoDaParcela(f);
    var tok = _concTokens([f.contrato, f.evento, f.descricao, c && c.nome].filter(Boolean).join(' '));
    return termo.every(function(t) { return tok.some(function(x) { return x.indexOf(t) === 0; }); });
  }).sort(function(a, b) {
    // Valor igual ao do PIX primeiro, depois por vencimento.
    var ia = e && Math.abs((a.status === 'pago' ? a.valorPago || a.valorNum : _concRestante(a)) - e.valor) <= 0.01 ? 0 : 1;
    var ib = e && Math.abs((b.status === 'pago' ? b.valorPago || b.valorNum : _concRestante(b)) - e.valor) <= 0.01 ? 0 : 1;
    return ia - ib || (a.vencimento || a.data || '').localeCompare(b.vencimento || b.data || '');
  }).slice(0, 40);
  if (!lista.length) { el.innerHTML = htmlContratos + '<div style="font-size:12px;color:var(--text3);padding:8px 2px">Nenhuma parcela encontrada.</div>'; return; }
  el.innerHTML = htmlContratos + lista.map(function(f) {
    var valor = f.status === 'pago' ? (f.valorPago || f.valorNum) : _concRestante(f);
    var igual = e && Math.abs(valor - e.valor) <= 0.01;
    return '<div onclick="_concVincularManual(\'' + f.id + '\')" style="display:flex;gap:10px;align-items:center;padding:8px 10px;border-bottom:1px solid var(--border);cursor:pointer;font-size:12px" onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'\'">' +
      '<div style="flex:1"><div style="color:var(--text);font-weight:600">' + _concEsc(f.evento || f.contrato || '—') + '</div>' +
        '<div style="color:var(--text3)">' + _concEsc(f.descricao || '') + ' · evento ' + fd(f.data) + (f.vencimento ? ' · vence ' + fd(f.vencimento) : '') + '</div></div>' +
      '<div style="text-align:right"><div style="font-family:var(--mono);color:' + (igual ? 'var(--green)' : 'var(--text)') + '">' + fR(valor) + '</div>' +
        '<div style="font-size:10px;color:' + (f.status === 'pago' ? 'var(--green)' : 'var(--amber)') + '">' + (f.status === 'pago' ? 'paga ' + fd(f.dataPagamento) : (Number(f.recebidoParcial) ? 'falta (já recebido ' + fR(f.recebidoParcial) + ')' : 'pendente')) + (igual ? ' · valor igual' : '') + '</div></div>' +
    '</div>';
  }).join('');
}

function _concVincularManual(parcelaId) {
  var e = _concLista().find(function(x) { return x.id === _concVincularId; });
  _concVincular(e, _concParcela(parcelaId));
}

// ─── VINCULAR AO CLIENTE E DISTRIBUIR (pedido dela 10-26) ───────────────────
// Quando não dá pra saber de qual parcela é o PIX: liga ao contrato do
// cliente e ela decide quanto vai pra cada parcela em aberto. Parte que
// completa a parcela → paga; parte menor → parcial (quita quando completar);
// sobra além do que está em aberto → lançamento "A mais" no contrato
// (f.isRecebidoAMais, com f.excedente pendente) para o admin decidir abater
// ou manter como receita — nada é abatido sozinho.
// e.modo = 'distribuido'; e.distribuicao = { parcelaId: valor }.

var _concDistrib = null; // { entradaId, contratoId, abertas: [ids] }

function _concParcelasAbertas(c) {
  return (typeof _planoParcelasDoContrato === 'function' ? _planoParcelasDoContrato(c) : [])
    .filter(function(f) { return f.status !== 'pago' && !f.aprovacaoPendente && !f.isRecebidoAMais && _concRestante(f) > 0.009; });
}

function concAbrirDistribuir(entradaId, contratoId) {
  var e = _concLista().find(function(x) { return x.id === entradaId; });
  var c = (D.contratos || []).find(function(x) { return x.id === contratoId; });
  if (!e || !c) return;
  var abertas = _concParcelasAbertas(c);
  _concDistrib = { entradaId: entradaId, contratoId: contratoId, abertas: abertas.map(function(f) { return f.id; }) };
  _concModalEl();
  var emAberto = abertas.reduce(function(s, f) { return s + _concRestante(f); }, 0);
  document.getElementById('mconc-corpo').innerHTML =
    '<div style="background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:10px 12px;margin-bottom:12px;font-size:12px">' +
      '<div style="font-weight:600;color:var(--text)">' + _concEsc(e.razao || e.lancamento) + ' <span style="font-family:var(--mono);color:var(--green);margin-left:6px">' + fR(e.valor) + '</span></div>' +
      '<div style="color:var(--text3)">' + fd(e.data) + (e.cpf ? ' · ' + _concEsc(e.cpf) : '') + ' · ' + _concEsc(e.lancamento) + '</div>' +
    '</div>' +
    '<div style="font-size:13px;color:var(--text);margin-bottom:4px">Cliente: <b>' + _concEsc(c.nome || '') + '</b> <span style="color:var(--text3);font-size:11px">evento ' + fd(c.data) + '</span></div>' +
    '<div style="font-size:12px;color:var(--text2);margin-bottom:10px">Em aberto no contrato: <b>' + fR(emAberto) + '</b>. Distribua o PIX entre as parcelas:</div>' +
    (abertas.length ? '<table style="width:100%;border-collapse:collapse;font-size:12px">' + abertas.map(function(f, i) {
      return '<tr style="border-top:1px solid var(--border)">' +
        '<td style="padding:6px 4px;color:var(--text)">' + _concEsc(f.descricao || 'Parcela') + '<div style="font-size:10px;color:var(--text3)">' + (f.vencimento ? 'vence ' + fd(f.vencimento) + ' · ' : '') + 'falta ' + fR(_concRestante(f)) + '</div></td>' +
        '<td style="padding:6px 4px;text-align:right;width:140px"><input id="mconc-dist-' + i + '" class="inp" type="text" inputmode="decimal" oninput="_concDistribAtualizar()" style="width:120px;text-align:right"></td>' +
      '</tr>';
    }).join('') + '</table>'
      : '<div style="font-size:12px;color:var(--amber)">Este contrato não tem parcela em aberto — o PIX inteiro fica como "A mais", aguardando decisão do administrador.</div>') +
    '<div id="mconc-dist-resumo" style="font-size:12px;margin-top:10px"></div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap">' +
      (abertas.length ? '<button class="btn" onclick="_concDistribAuto()" style="background:var(--bg3)">Preencher automático</button><button class="btn" onclick="_concDistribLimpar()" style="background:var(--bg3)">Limpar</button>' : '') +
      '<button class="btn" onclick="closeM(\'mconc-vincular\')" style="background:var(--bg3)">Cancelar</button>' +
      '<button class="btn" onclick="concSalvarDistribuicao()" style="background:var(--blue);color:#fff">Salvar</button>' +
    '</div>';
  _concDistribAuto();
  openM('mconc-vincular');
}

// Preenche das parcelas mais antigas para as mais novas, até acabar o PIX.
function _concDistribAuto() {
  if (!_concDistrib) return;
  var e = _concLista().find(function(x) { return x.id === _concDistrib.entradaId; });
  var resto = e ? e.valor : 0;
  _concDistrib.abertas.forEach(function(id, i) {
    var f = _concParcela(id);
    var v = Math.round(Math.min(resto, f ? _concRestante(f) : 0) * 100) / 100;
    resto = Math.round((resto - v) * 100) / 100;
    var el = document.getElementById('mconc-dist-' + i);
    if (el) el.value = v > 0 ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '';
  });
  _concDistribAtualizar();
}
function _concDistribLimpar() {
  if (!_concDistrib) return;
  _concDistrib.abertas.forEach(function(id, i) { var el = document.getElementById('mconc-dist-' + i); if (el) el.value = ''; });
  _concDistribAtualizar();
}

function _concDistribLer() {
  var e = _concLista().find(function(x) { return x.id === _concDistrib.entradaId; });
  var alocs = [], erro = '';
  _concDistrib.abertas.forEach(function(id, i) {
    var el = document.getElementById('mconc-dist-' + i);
    var v = el && el.value.trim() ? Math.round((parseValorBR(el.value) || 0) * 100) / 100 : 0;
    var f = _concParcela(id);
    if (v > 0 && f) {
      if (v > _concRestante(f) + 0.009) erro = (f.descricao || 'Parcela') + ': ponha no máximo ' + fR(_concRestante(f)) + ' (o que falta) — o que sobrar do PIX vai para "A mais".';
      alocs.push({ f: f, valor: v });
    }
  });
  var soma = Math.round(alocs.reduce(function(s, a) { return s + a.valor; }, 0) * 100) / 100;
  var sobra = Math.round(((e ? e.valor : 0) - soma) * 100) / 100;
  if (sobra < -0.009) erro = 'A soma (' + fR(soma) + ') passa do valor do PIX (' + fR(e.valor) + ').';
  return { e: e, alocs: alocs, soma: soma, sobra: Math.max(0, sobra), erro: erro };
}

function _concDistribAtualizar() {
  var el = document.getElementById('mconc-dist-resumo');
  if (!el || !_concDistrib) return;
  var r = _concDistribLer();
  el.innerHTML = 'Distribuído: <b style="font-family:var(--mono)">' + fR(r.soma) + '</b>' +
    (r.sobra > 0.009 ? ' · <span style="color:var(--amber)">Sobra ' + fR(r.sobra) + ' → fica como "A mais" no contrato, aguardando decisão do administrador (abater ou manter como receita)</span>' : '') +
    (r.erro ? '<div style="color:var(--red);margin-top:4px">' + _concEsc(r.erro) + '</div>' : '');
}

function concSalvarDistribuicao() {
  if (!_concDistrib) return;
  var r = _concDistribLer();
  if (r.erro) { alert2(r.erro, 'error'); return; }
  if (!r.alocs.length && !(r.sobra > 0.009)) { alert2('Distribua o valor em pelo menos uma parcela.', 'error'); return; }
  var c = (D.contratos || []).find(function(x) { return x.id === _concDistrib.contratoId; });
  var e = r.e;
  var resumo = r.alocs.map(function(a) {
    return '• ' + (a.f.descricao || 'Parcela') + ': ' + fR(a.valor) + (a.valor >= _concRestante(a.f) - 0.009 ? ' (quita)' : ' (parcial, falta ' + fR(_concRestante(a.f) - a.valor) + ')');
  }).join('\n') + (r.sobra > 0.009 ? '\n• A mais: ' + fR(r.sobra) + ' (aguardando decisão do administrador)' : '');
  sisDialogo('Distribuir o PIX de ' + fR(e.valor) + ' no contrato de ' + (c ? c.nome : '') + ':\n\n' + resumo, function() {
    var msgs = _concAplicarDistribuicao(e, r.alocs, r.sobra, c);
    sv('financeiro'); sv('extratoBancario');
    closeM('mconc-vincular');
    alert2(msgs.aguardando ? msgs.texto : 'PIX distribuído no contrato. ' + msgs.texto, msgs.aguardando || r.sobra > 0.009 ? 'error' : 'success');
    rConciliacao();
  }, { ok: 'Distribuir' });
}

// Aplica a distribuição. Não grava.
function _concAplicarDistribuicao(e, alocs, sobra, c) {
  e.distribuicao = {};
  var textos = [], aguardando = false;
  alocs.forEach(function(a) {
    var f = a.f;
    e.distribuicao[f.id] = a.valor;
    f.extratoParciais = (f.extratoParciais || []).concat(e.id);
    f.recebidoParcial = Math.round(_concSomaParciais(f) * 100) / 100;
    if (f.recebidoParcial >= (Number(f.valorNum) || 0) - 0.009) {
      var qtd = f.extratoParciais.length;
      var res = _finAplicarPagamento(f, {
        valorPago: f.recebidoParcial, dataPagamento: e.data,
        formaPagamento: /PIX/i.test(e.lancamento) ? 'pix' : 'transferencia',
        temComprovante: false, comprovanteTipo: '',
        comprovanteNome: 'Extrato bancário ' + fd(e.data) + (qtd > 1 ? ' (' + qtd + ' PIX)' : ''),
      });
      f.extratoId = e.id; f.recebidoParcial = 0;
      if (res.aguardandoAprovacao) aguardando = true;
      textos.push((f.descricao || 'Parcela') + ' quitada');
    } else {
      textos.push((f.descricao || 'Parcela') + ': recebido ' + fR(f.recebidoParcial) + ', falta ' + fR(_concRestante(f)));
    }
  });
  if (sobra > 0.009) {
    var base = alocs[0] ? alocs[0].f : ((typeof _planoParcelasDoContrato === 'function' && c ? _planoParcelasDoContrato(c)[0] : null) || {});
    var rec = {
      id: _gerarId('FIN'), isRecebidoAMais: true,
      contratoId: (c && c.id) || base.contratoId || '', contrato: (c && c.nome) || base.contrato || '', evento: (c && (c.nomeEvento || c.nome)) || base.evento || '',
      data: (c && c.data) || base.data || '', tipo: (c && c.tipo) || base.tipo || '', convidados: (c && c.convidados) || base.convidados || '',
      descricao: 'A mais — PIX ' + fd(e.data), valorNum: sobra, valor: 'R$ ' + sobra.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      valorOriginal: 0, valorPago: sobra, status: 'pago', dataPagamento: e.data, vencimento: e.data,
      formaPagamento: /PIX/i.test(e.lancamento) ? 'pix' : 'transferencia', comprovanteNome: 'Extrato bancário ' + fd(e.data),
      extratoId: e.id, _ajustes: [],
      excedente: { valor: sobra, status: 'pendente', registradoPor: _concUsuario(), registradoEm: new Date().toISOString() },
    };
    (D.financeiro || (D.financeiro = [])).push(rec);
    e.distribuicao[rec.id] = sobra;
    textos.push('A mais ' + fR(sobra) + ' aguardando decisão do administrador');
  }
  e.modo = 'distribuido';
  e.parcelaId = Object.keys(e.distribuicao)[0] || '';
  e.conciliadoEm = new Date().toISOString(); e.conciliadoPor = _concUsuario();
  return { texto: textos.join(' · ') + '.', aguardando: aguardando };
}

function _concDesfazerDistribuicao(e) {
  var partes = Object.keys(e.distribuicao || {}).map(function(pid) { return _concParcela(pid); }).filter(Boolean);
  sisDialogo('Desfazer a distribuição deste PIX de ' + fR(e.valor) + '?\n\n' + partes.map(function(f) { return '• ' + (f.descricao || 'Parcela') + ' (' + fR(e.distribuicao[f.id]) + ')'; }).join('\n') +
    '\n\nParcelas quitadas por ele voltam a ficar pendentes (com os outros PIX ligados a elas); o "A mais" é apagado.', function() {
    partes.forEach(function(f) {
      if (f.isRecebidoAMais) {
        if (f.excedente && f.excedente.status === 'abatido') marcarPendente(f.id, true); // reverte o abatimento
        D.financeiro = (D.financeiro || []).filter(function(x) { return x.id !== f.id; });
      } else if (f.status === 'pago' || f.aprovacaoPendente) {
        if (f.extratoId === e.id || (f.extratoParciais || []).indexOf(e.id) !== -1) marcarPendente(f.id, true);
      } else {
        f.extratoParciais = (f.extratoParciais || []).filter(function(id) { return id !== e.id; });
        f.recebidoParcial = Math.round(_concSomaParciais(f) * 100) / 100;
      }
    });
    e.distribuicao = null; e.parcelaId = ''; e.modo = ''; e.conciliadoEm = ''; e.conciliadoPor = '';
    sv('financeiro'); sv('extratoBancario');
    rConciliacao();
  }, { ok: 'Desfazer distribuição' });
}

// ─── TELA ────────────────────────────────────────────────────────────────────

function _concFiltradas() {
  var termo = _concNorm(_concBusca);
  return _concLista().filter(function(e) {
    if (!termo && _concAno && e.data.slice(0, 4) !== _concAno) return false;
    if (!termo && _concMes && e.data.slice(5, 7) !== _concMes) return false;
    if (termo && _concNorm([e.razao, e.lancamento, e.cpf, String(e.valor).replace('.', ',')].join(' ')).indexOf(termo) === -1) return false;
    return true;
  });
}

function rConciliacao() {
  var el = document.getElementById('conciliacao-content');
  if (!el) return;
  var sug = _concCalcularSugestoes();
  var todas = _concFiltradas();
  var conc = todas.filter(_concConciliada);
  var ign = todas.filter(function(e) { return e.ignorado && !_concConciliada(e); });
  var pend = todas.filter(function(e) { return !e.ignorado && !_concConciliada(e); });
  var comSug = pend.filter(function(e) { return sug[e.id] && sug[e.id].parcelaId; });
  var altas = comSug.filter(function(e) { return sug[e.id].alta; });
  var soma = function(l) { return l.reduce(function(s, e) { return s + e.valor; }, 0); };
  var lista = _concFiltro === 'conciliados' ? conc : _concFiltro === 'ignorados' ? ign : _concFiltro === 'sugestoes' ? comSug : _concFiltro === 'todos' ? todas : pend;
  lista = lista.slice().sort(function(a, b) { return b.data.localeCompare(a.data); });

  var anos = {}; anos[String(new Date().getFullYear())] = true;
  _concLista().forEach(function(e) { anos[e.data.slice(0, 4)] = true; });
  var MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  var sel = 'font-size:12px;padding:5px 8px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)';
  var ultimo = _concLista().reduce(function(m, e) { return e.importadoEm > (m.importadoEm || '') ? e : m; }, {});
  var card = function(rot, val, sub, cor) {
    return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">' + rot + '</div>' +
      '<div style="font-family:var(--mono);font-size:20px;font-weight:600;color:' + (cor || 'var(--text)') + ';margin-top:4px">' + val + '</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-top:2px">' + sub + '</div></div>';
  };

  el.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
      '<button class="btn-sm" onclick="go(\'financeiro\')" style="background:var(--bg3)">← Contas a Receber</button>' +
      '<span style="font-size:16px;font-weight:600;color:var(--text)">Conciliação bancária</span>' +
      (ultimo.importadoEm ? '<span style="font-size:11px;color:var(--text3)">Última importação: ' + new Date(ultimo.importadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) + (ultimo.arquivo ? ' · ' + _concEsc(ultimo.arquivo) : '') + '</span>' : '') +
      '<label class="btn btn-primary btn-sm" style="margin-left:auto;cursor:pointer">Importar extrato (.xlsx)<input type="file" accept=".xlsx,.xls" onchange="concImportarExtrato(this)" style="display:none"></label>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:12px">' +
      card('A conciliar', String(pend.length), fR(soma(pend)) + ' em entradas', 'var(--amber)') +
      card('Com sugestão', String(comSug.length), altas.length + ' com valor igual', 'var(--blue)') +
      card('Conciliados', String(conc.length), fR(soma(conc)), 'var(--green)') +
      card('Ignorados', String(ign.length), 'rendimentos, transferências…') +
    '</div>' +

    '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">' +
      [['pendentes', 'A conciliar'], ['sugestoes', 'Com sugestão'], ['conciliados', 'Conciliados'], ['ignorados', 'Ignorados'], ['todos', 'Todos']].map(function(f) {
        return '<button class="sort-btn' + (_concFiltro === f[0] ? ' active' : '') + '" onclick="_concFiltro=\'' + f[0] + '\';rConciliacao()">' + f[1] + '</button>';
      }).join('') +
      '<select onchange="_concAno=this.value;rConciliacao()" style="' + sel + ';margin-left:8px"><option value="">Todos os anos</option>' +
        Object.keys(anos).sort().reverse().map(function(a) { return '<option value="' + a + '"' + (a === _concAno ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select>' +
      '<select onchange="_concMes=this.value;rConciliacao()" style="' + sel + '"><option value="">Todos os meses</option>' +
        MESES.map(function(m, i) { var v = String(i + 1).padStart(2, '0'); return '<option value="' + v + '"' + (v === _concMes ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select>' +
      '<input type="text" value="' + _concEsc(_concBusca) + '" placeholder="Buscar nome, CPF, valor" onchange="_concBusca=this.value;rConciliacao()" style="' + sel + ';min-width:180px">' +
      (_concBusca.trim() ? '<span style="font-size:11px;color:var(--text3)">buscando em todos os anos e meses</span>' : '') +
      (altas.length ? '<button class="btn-sm" onclick="concConfirmarTodas()" style="margin-left:auto;background:var(--green);color:#fff">Confirmar sugestões com valor igual (' + altas.length + ')</button>' : '') +
    '</div>' +

    (lista.length ? '<div style="display:grid;gap:6px">' + lista.map(function(e) { return _concLinhaHTML(e, sug[e.id]); }).join('') + '</div>'
      : '<div style="text-align:center;padding:40px 20px;color:var(--text3);font-size:13px">' +
          (_concLista().length ? 'Nada nesse filtro.' : 'Nenhum extrato importado ainda. Baixe o extrato de lançamentos no Itaú (Excel) e clique em "Importar extrato".') + '</div>');
}

function _concLinhaHTML(e, s) {
  var conciliada = _concConciliada(e);
  var diag = s && s.diag ? s : null;
  if (diag) s = null;
  // Contrato da linha (reconhecido ou da parcela sugerida) — para "Ajustar parcelas".
  var contratoIdLinha = diag ? diag.contratoId : (s ? ((_concContratoDaParcela(_concParcela(s.parcelaId)) || {}).id || '') : '');
  var f = conciliada ? _concParcela(e.parcelaId) : (s ? _concParcela(s.parcelaId) : null);
  var parcialAberta = conciliada && e.modo === 'parcial' && f && f.status !== 'pago';
  var cor = parcialAberta ? 'var(--blue)' : conciliada ? 'var(--green)' : e.ignorado ? 'var(--text3)' : s ? 'var(--blue)' : 'var(--amber)';
  var direita;
  if (conciliada) {
    var textoVinculo = e.modo === 'distribuido'
      ? (f ? (f.evento || f.contrato || '') : '') + ' — distribuído: ' + Object.keys(e.distribuicao || {}).map(function(pid) {
          var p = _concParcela(pid);
          return (p ? (p.isRecebidoAMais ? 'A mais' : (p.descricao || 'parcela').split(' —')[0]) : 'parcela') + ' ' + fR(e.distribuicao[pid]) +
            (p && !p.isRecebidoAMais && p.status !== 'pago' ? ' (parcial)' : '');
        }).join(' · ')
      : _concTextoParcela(f);
    direita = '<div style="font-size:12px;color:' + (parcialAberta ? 'var(--blue)' : 'var(--green)') + ';font-weight:600">' + _concEsc(textoVinculo) + '</div>' +
      '<div style="font-size:10px;color:var(--text3)">' + (f && f.aprovacaoPendente ? '<span style="color:var(--amber)">aguardando aprovação do admin</span> · ' : '') +
        (e.modo === 'jaPago' ? 'pagamento já estava registrado' : e.modo === 'distribuido' ? 'vinculado ao cliente e distribuído por você' : parcialAberta ? 'PIX parcial — parcela quitada quando a soma completar' : e.modo === 'parcial' ? 'parcela quitada com a soma dos PIX' : 'pagamento registrado pela conciliação') +
        (e.conciliadoPor ? ' · ' + _concEsc(e.conciliadoPor) : '') + '</div>' +
      '<button class="btn-sm" onclick="concDesfazer(\'' + e.id + '\')" style="background:var(--bg3);margin-top:4px">Desfazer</button>';
  } else if (e.ignorado) {
    direita = '<div style="font-size:11px;color:var(--text3)">Ignorado: ' + _concEsc(e.motivoIgnorado || '') + '</div>' +
      '<button class="btn-sm" onclick="concIgnorar(\'' + e.id + '\',false)" style="background:var(--bg3);margin-top:4px">Reativar</button>';
  } else {
    direita = (s && f
      ? '<div style="font-size:11px;color:var(--text3)">Sugestão (' + _concEsc(s.motivo) + ')</div>' +
        '<div style="font-size:12px;color:' + (s.alta ? 'var(--text)' : 'var(--amber)') + ';font-weight:600">' + _concEsc(_concTextoParcela(f)) + '</div>'
      : diag
        ? '<div style="font-size:11px;color:var(--amber)">Contrato encontrado: <b>' + _concEsc(diag.contrato) + '</b> — nenhuma parcela aberta para este valor</div>' +
          '<div style="font-size:10px;color:var(--text3)">' + diag.parcelas.map(_concEsc).join('<br>') + '</div>'
        : '<div style="font-size:11px;color:var(--amber)">Nenhum contrato encontrado — vincule à mão</div>') +
      '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:4px;flex-wrap:wrap">' +
        (s ? '<button class="btn-sm" onclick="concConfirmarSugestao(\'' + e.id + '\')" style="background:var(--green);color:#fff">Confirmar</button>' : '') +
        '<button class="btn-sm" onclick="concAbrirVincular(\'' + e.id + '\')" style="background:var(--bg3)">' + (s ? 'Outra parcela' : 'Vincular') + '</button>' +
        (contratoIdLinha ? '<button class="btn-sm" onclick="concAbrirDistribuir(\'' + e.id + '\',\'' + contratoIdLinha + '\')" style="background:var(--blue);color:#fff" title="Liga o PIX ao cliente e você decide como distribuir no que está em aberto">Vincular ao cliente</button>' : '') +
        (contratoIdLinha && typeof planoAbrir === 'function' ? '<button class="btn-sm" onclick="concAjustarParcelas(\'' + e.id + '\',\'' + contratoIdLinha + '\')" style="background:var(--bg3)" title="Mudar o plano de pagamento deste contrato (nº de parcelas) a partir dos PIX dele — atualiza o contrato e o Contas a Receber">Ajustar parcelas</button>' : '') +
        '<button class="btn-sm" onclick="concIgnorar(\'' + e.id + '\',true)" style="background:var(--bg3)">Ignorar</button>' +
      '</div>';
  }
  return '<div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid ' + cor + ';border-radius:var(--radius);padding:10px 14px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">' +
    '<div style="font-family:var(--mono);font-size:12px;color:var(--text);min-width:78px">' + fd(e.data) + '</div>' +
    '<div style="flex:1;min-width:200px">' +
      '<div style="font-size:13px;font-weight:600;color:var(--text)">' + _concEsc(e.razao || e.lancamento) + '</div>' +
      '<div style="font-size:11px;color:var(--text3)">' + (e.cpf ? _concEsc(e.cpf) + ' · ' : '') + _concEsc(e.lancamento) + '</div>' +
    '</div>' +
    '<div style="font-family:var(--mono);font-size:14px;font-weight:600;color:var(--green);min-width:100px;text-align:right">' + fR(e.valor) + '</div>' +
    '<div style="flex:1;min-width:260px;text-align:right">' + direita + '</div>' +
  '</div>';
}
