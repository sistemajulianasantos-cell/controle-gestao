// ─── ESTOQUE — LEITURA AO VIVO DO SISTEMA SEPARAÇÃO E FECHAMENTO ────────────
// A conexão com o projeto Firebase separado (login, leitura de "estoque")
// vive em index.html (script module: window.separacaoLogin/separacaoLogado/
// separacaoAuthReady/buscarEstoqueSeparacao). Este arquivo só cuida de:
// (1) casar cada insumo daqui com o item correspondente de lá por nome
// normalizado, e (2) a UI de conectar/mostrar o vínculo no Cadastro de
// Insumos. Nunca escreve no projeto secundário — só leitura.
//
// O casamento por nome é uma primeira aproximação (normaliza + remove
// sufixo de fornecimento tipo CONSIGNADO/ROMERO, igual o Sistema Separação
// já faz do lado dele). Ela pretende padronizar os nomes dos dois cadastros
// depois com uma lista própria — quando isso acontecer, esse matching por
// aproximação pode ser trocado por um vínculo explícito salvo por item.

var _estoqueSeparacaoCache = null; // null = ainda não carregado; [] = carregado e vazio
var _estoqueSeparacaoPorChave = {};

// Mesma lista usada em js/app.js do Sistema Separação (SUFIXOS_FORNECIMENTO).
var _SUFIXOS_FORNECIMENTO_SEP = ['consignado','cliente','romero','reserva','proprio','propria','terceiro','cortesia','gratis','gratuito','locacao','doacao','empresa'];

function _normalizarChaveEstoqueSep(nome) {
  var k = (nome || '')
    .normalize('NFD').replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  for (var i = 0; i < _SUFIXOS_FORNECIMENTO_SEP.length; i++) {
    var re = new RegExp('_?' + _SUFIXOS_FORNECIMENTO_SEP[i] + '$');
    if (re.test(k)) { k = k.replace(re, ''); break; }
  }
  return k;
}

async function _carregarEstoqueSeparacao() {
  if (typeof window.buscarEstoqueSeparacao !== 'function') return null;
  var lista = await window.buscarEstoqueSeparacao();
  if (!lista) return null;
  _estoqueSeparacaoCache = lista;
  _estoqueSeparacaoPorChave = {};
  lista.forEach(function(it) {
    var chave = _normalizarChaveEstoqueSep(it.nomeKey || it.nome);
    if (chave) _estoqueSeparacaoPorChave[chave] = it;
  });
  return lista;
}

// Tenta o nome do insumo e cada apelido, na ordem — primeiro que bater vale.
function _estoqueSeparacaoParaInsumo(insumo) {
  if (!_estoqueSeparacaoCache) return null;
  var candidatos = [insumo.nome].concat(insumo.aliases || []);
  for (var i = 0; i < candidatos.length; i++) {
    var chave = _normalizarChaveEstoqueSep(candidatos[i]);
    if (chave && _estoqueSeparacaoPorChave[chave]) return _estoqueSeparacaoPorChave[chave];
  }
  return null;
}

function abrirLoginEstoqueSeparacao() {
  var erroEl = document.getElementById('msep-erro');
  if (erroEl) { erroEl.style.display = 'none'; erroEl.textContent = ''; }
  var u = document.getElementById('msep-usuario'); if (u) u.value = '';
  var s = document.getElementById('msep-senha'); if (s) s.value = '';
  openM('msep-login');
  if (u) u.focus();
}

async function confirmarLoginSeparacao() {
  var usuario = (document.getElementById('msep-usuario')?.value || '').trim();
  var senha = document.getElementById('msep-senha')?.value || '';
  var erroEl = document.getElementById('msep-erro');
  var mostrarErro = function(msg) { if (erroEl) { erroEl.textContent = msg; erroEl.style.display = 'block'; } };
  if (!usuario || !senha) { mostrarErro('Preencha usuário e senha.'); return; }

  try {
    await window.separacaoLogin(usuario, senha);
    closeM('msep-login');
    await _carregarEstoqueSeparacao();
    _rEstoqueSeparacaoStatus();
    if (typeof rCadastroInsumos === 'function') rCadastroInsumos();
    alert2('Estoque do Sistema Separação conectado!');
  } catch (e) {
    var CODIGOS_CREDENCIAL_INVALIDA = ['auth/wrong-password','auth/user-not-found','auth/invalid-credential','auth/invalid-login-credentials'];
    if (e && CODIGOS_CREDENCIAL_INVALIDA.includes(e.code)) {
      mostrarErro('Usuário ou senha incorretos.');
    } else {
      mostrarErro('Não foi possível conectar (' + (e && e.message ? e.message : 'erro desconhecido') + ').');
    }
  }
}

async function _recarregarEstoqueSeparacao() {
  await _carregarEstoqueSeparacao();
  _rEstoqueSeparacaoStatus();
  if (typeof rCadastroInsumos === 'function') rCadastroInsumos();
}

function _rEstoqueSeparacaoStatus() {
  var cont = document.getElementById('cad-estoque-sep-status');
  if (!cont) return;
  var logado = typeof window.separacaoLogado === 'function' && window.separacaoLogado();
  if (!logado) {
    cont.innerHTML = '<button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2)" onclick="abrirLoginEstoqueSeparacao()">🔗 Conectar estoque do Sistema Separação</button>';
    return;
  }
  var qtdItens = _estoqueSeparacaoCache ? _estoqueSeparacaoCache.length : 0;
  cont.innerHTML =
    '<span style="font-size:11px;color:var(--green)">✅ Estoque do Sistema Separação conectado (' + qtdItens + ' iten' + (qtdItens === 1 ? '' : 's') + ')</span>' +
    ' <button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2);margin-left:8px" onclick="_recarregarEstoqueSeparacao()">🔄 Atualizar</button>';
}

// Se já havia sessão salva no navegador (login anterior), conecta sozinho
// sem pedir login de novo — só depois que o Firebase Auth confirma o estado
// (window.separacaoAuthReady). Chamado a partir de initCadastro() (não no
// carregamento da página) porque scripts type="module" só terminam de rodar
// DEPOIS de todo script clássico — se isso rodasse aqui direto no load do
// arquivo, window.separacaoAuthReady ainda nem existiria. Só tenta a
// reconexão automática uma vez por sessão de página; depois disso, quem
// atualiza é o botão "🔄 Atualizar".
var _estoqueSeparacaoAutoTentado = false;
function _tentarAutoConectarEstoqueSeparacao() {
  if (_estoqueSeparacaoAutoTentado) { _rEstoqueSeparacaoStatus(); return; }
  _estoqueSeparacaoAutoTentado = true;
  if (typeof window.separacaoAuthReady === 'undefined') { _rEstoqueSeparacaoStatus(); return; }
  window.separacaoAuthReady.then(async function(logado) {
    if (logado) await _carregarEstoqueSeparacao();
    _rEstoqueSeparacaoStatus();
    if (logado && typeof rCadastroInsumos === 'function' && document.getElementById('cad-lista-body')) rCadastroInsumos();
  });
}
