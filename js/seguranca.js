// ─── MÓDULO DE SEGURANÇA E RASTREAMENTO ─────────────────────────────────────
// Carregado antes de todos os módulos. Fornece utilitários globais para:
//   • Geração de IDs sem colisão
//   • Travamento de botões contra duplo clique
//   • Log centralizado de erros (acessível via verErros() no console)
//   • Captura de erros globais não tratados

// ── IDs à prova de colisão ────────────────────────────────────────────────────
function _gerarId(prefixo) {
  var p = prefixo || 'ID';
  if (window.crypto && typeof crypto.randomUUID === 'function') {
    return p + crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase();
  }
  return p + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ── Travamento de botão ───────────────────────────────────────────────────────
function _btnLock(btn, texto) {
  if (!btn || btn.disabled) return;
  btn._textoOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = (texto || 'Salvando') + '&nbsp;<span style="opacity:.5;font-size:10px">⏳</span>';
  btn.style.opacity = '0.6';
}

function _btnUnlock(btn) {
  if (!btn) return;
  btn.disabled = false;
  if (btn._textoOriginal !== undefined) {
    btn.innerHTML = btn._textoOriginal;
    delete btn._textoOriginal;
  }
  btn.style.opacity = '';
}

// Retorna o botão atualmente em foco (útil em handlers onclick)
function _btnAtivo() {
  var el = document.activeElement;
  return (el && el.tagName === 'BUTTON') ? el : null;
}

// ── Log centralizado ──────────────────────────────────────────────────────────
var _ERROS_LOG = [];

function _logErro(modulo, funcao, erro, extra) {
  var entry = {
    ts:     new Date().toISOString(),
    modulo: modulo || '?',
    funcao: funcao || '?',
    msg:    (erro && erro.message) ? erro.message : String(erro || ''),
    extra:  extra || null,
  };
  _ERROS_LOG.push(entry);
  if (_ERROS_LOG.length > 200) _ERROS_LOG.splice(0, _ERROS_LOG.length - 200);
  console.error('[' + entry.modulo + '::' + entry.funcao + ']', entry.msg, extra || '');
}

// ── Console público ───────────────────────────────────────────────────────────
// Digite  verErros()  no DevTools para ver todos os erros da sessão
window.verErros = function() {
  if (!_ERROS_LOG.length) { console.info('✅ Nenhum erro registrado nesta sessão.'); return; }
  console.group('🔴 Erros registrados — ' + _ERROS_LOG.length + ' entrada(s)');
  console.table(_ERROS_LOG);
  console.groupEnd();
};

// Digite  limparLogErros()  para resetar
window.limparLogErros = function() {
  _ERROS_LOG.length = 0;
  console.info('Log de erros limpo.');
};

// ── Captura erros globais não tratados ────────────────────────────────────────
window.addEventListener('error', function(ev) {
  _logErro('Global', ev.filename || 'script', ev.error || ev.message, {
    linha: ev.lineno, col: ev.colno
  });
});

window.addEventListener('unhandledrejection', function(ev) {
  _logErro('Promise', 'unhandledrejection', ev.reason);
});
