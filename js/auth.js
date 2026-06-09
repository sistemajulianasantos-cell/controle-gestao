// ─── LOGIN / AUTENTICAÇÃO ─────────────────────────────────────────────────────
// D.senhas: { hash → 'perfil' } (legado) ou { hash → { p:'perfil', mfa:'BASE32' } }
// ══════════════════════════════════════════════════════════════════════════════

var ACESSO = {
  admin:       ['estoque','contratos','produtos','regras','producao','separacao','agenda','financeiro','analise','equipe','orcamento','refconsumo','seguranca'],
  financeiro:  ['estoque','contratos','produtos','producao','separacao','agenda','financeiro','equipe','orcamento','refconsumo'],
  operacional: ['contratos','producao','separacao','agenda']
};

var perfilAtual = null;

// ── SHA-256 ───────────────────────────────────────────────────────────────────
async function hashSenha(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── Brute-force ───────────────────────────────────────────────────────────────
const _BF = { tentativas: 0, bloqueadoAte: 0 };
const _BF_ATRASOS = [30, 120, 600]; // 30s → 2min → 10min

function _bfSegundos() {
  return Date.now() < _BF.bloqueadoAte ? Math.ceil((_BF.bloqueadoAte - Date.now()) / 1000) : 0;
}

function _bfFalha() {
  _BF.tentativas++;
  if (_BF.tentativas >= 3) {
    const idx = Math.min(_BF.tentativas - 3, _BF_ATRASOS.length - 1);
    _BF.bloqueadoAte = Date.now() + _BF_ATRASOS[idx] * 1000;
  }
}

function _bfReset() {
  _BF.tentativas = 0;
  _BF.bloqueadoAte = 0;
}

// ── TOTP RFC 6238 ─────────────────────────────────────────────────────────────
function _base32Decode(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  str = str.replace(/=+$/, '').toUpperCase().replace(/\s/g, '');
  let bits = 0, val = 0;
  const out = [];
  for (const c of str) {
    const i = chars.indexOf(c);
    if (i < 0) continue;
    val = (val << 5) | i;
    bits += 5;
    if (bits >= 8) { out.push((val >> (bits - 8)) & 255); bits -= 8; }
  }
  return new Uint8Array(out);
}

async function _totpCodigo(secret, janela) {
  const key = await crypto.subtle.importKey(
    'raw', _base32Decode(secret),
    { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const buf = new ArrayBuffer(8);
  new DataView(buf).setBigUint64(0, BigInt(janela), false);
  const h = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
  const off = h[19] & 0x0f;
  const n = (((h[off]&0x7f)<<24)|((h[off+1]&0xff)<<16)|((h[off+2]&0xff)<<8)|(h[off+3]&0xff)) % 1_000_000;
  return n.toString().padStart(6, '0');
}

async function _totpVerificar(secret, codigo) {
  const janela = Math.floor(Date.now() / 30000);
  for (const w of [janela - 1, janela, janela + 1]) {
    if (await _totpCodigo(secret, w) === String(codigo).padStart(6, '0')) return true;
  }
  return false;
}

function _totpGerarSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const rand = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(rand, b => chars[b % 32]).join('');
}

// ── Sessão e inatividade ──────────────────────────────────────────────────────
const _SESSAO_AVISO_MS   = 25 * 60 * 1000; // 25 min
const _SESSAO_TIMEOUT_MS = 30 * 60 * 1000; // 30 min
let _timerAviso = null, _timerTimeout = null;

function _resetarSessao() {
  clearTimeout(_timerAviso);
  clearTimeout(_timerTimeout);
  if (!perfilAtual) return;
  _timerAviso   = setTimeout(_mostrarAvisoSessao, _SESSAO_AVISO_MS);
  _timerTimeout = setTimeout(_expirarSessao,      _SESSAO_TIMEOUT_MS);
}

function _mostrarAvisoSessao() {
  const el = document.getElementById('sessao-aviso');
  if (el) el.style.display = 'flex';
}

function _expirarSessao() {
  const el = document.getElementById('sessao-aviso');
  if (el) el.style.display = 'none';
  fazerLogout();
  document.getElementById('login-erro').textContent = 'Sessão encerrada por inatividade.';
}

function _iniciarMonitorAtividade() {
  ['mousemove', 'keydown', 'click', 'touchstart'].forEach(ev =>
    document.addEventListener(ev, () => {
      const av = document.getElementById('sessao-aviso');
      if (av && av.style.display !== 'none') av.style.display = 'none';
      if (perfilAtual) _resetarSessao();
    }, { passive: true })
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
let _mfaPendente = null; // { perfil, secret }

async function tentarLogin() {
  const bloq = _bfSegundos();
  if (bloq > 0) {
    document.getElementById('login-erro').textContent = `Muitas tentativas. Aguarde ${bloq}s`;
    return;
  }
  const s = document.getElementById('login-senha').value.trim();
  if (!s) return;

  const hash = await hashSenha(s);
  const entry = (D.senhas || {})[hash];
  if (!entry) {
    _bfFalha();
    const t = _bfSegundos();
    document.getElementById('login-erro').textContent = t > 0
      ? `Senha incorreta. Aguarde ${t}s`
      : `Senha incorreta`;
    return;
  }

  const perfil     = typeof entry === 'string' ? entry : entry.p;
  const mfaSecret  = typeof entry === 'object' ? (entry.mfa || null) : null;

  if (mfaSecret) {
    _mfaPendente = { perfil, secret: mfaSecret };
    document.getElementById('login-step-senha').style.display = 'none';
    document.getElementById('login-step-mfa').style.display  = '';
    document.getElementById('login-mfa-input').value = '';
    document.getElementById('login-mfa-input').focus();
    document.getElementById('login-erro').textContent = '';
    return;
  }
  _concluirLogin(perfil);
}

async function tentarLoginMFA() {
  if (!_mfaPendente) return;
  const codigo = document.getElementById('login-mfa-input').value.trim();
  if (!/^\d{6}$/.test(codigo)) {
    document.getElementById('login-mfa-erro').textContent = 'Código de 6 dígitos inválido';
    return;
  }
  const ok = await _totpVerificar(_mfaPendente.secret, codigo);
  if (!ok) {
    _bfFalha();
    document.getElementById('login-mfa-erro').textContent = 'Código incorreto';
    return;
  }
  const perfil = _mfaPendente.perfil;
  _mfaPendente = null;
  _concluirLogin(perfil);
}

function cancelarMFA() {
  _mfaPendente = null;
  document.getElementById('login-step-senha').style.display = '';
  document.getElementById('login-step-mfa').style.display  = 'none';
  document.getElementById('login-senha').value = '';
  document.getElementById('login-erro').textContent = '';
  document.getElementById('login-mfa-erro').textContent = '';
}

function _concluirLogin(perfil) {
  _bfReset();
  perfilAtual = perfil;
  sessionStorage.setItem('perfil', perfil);
  document.getElementById('login-overlay').style.display = 'none';
  document.getElementById('login-step-senha').style.display = '';
  document.getElementById('login-step-mfa').style.display  = 'none';
  aplicarPerfil(perfil);
  _resetarSessao();
  go('fechamento');
}

// ── Perfil e menus ────────────────────────────────────────────────────────────
function aplicarPerfil(p) {
  const ac = ACESSO[p] || [];
  document.querySelectorAll('[data-modulo]').forEach(el => {
    const m = el.getAttribute('data-modulo');
    el.style.display = (m === 'estoque' ? ac.includes('estoque') : ac.includes(m)) ? '' : 'none';
  });
  document.querySelectorAll('.nav-group').forEach(g => {
    const vis = [...g.querySelectorAll('.nav-item')].some(i => i.style.display !== 'none');
    g.style.display = vis ? '' : 'none';
  });
  const kpiBox = document.getElementById('kpi-box');
  if (kpiBox) {
    kpiBox.style.display = p === 'admin' ? '' : 'none';
    if (p === 'admin') setTimeout(rKpiFaturamento, 300);
  }
  const labels = { admin: 'Administrador', financeiro: 'Financeiro', operacional: 'Operacional' };
  const el = document.getElementById('perfil-label');
  if (el) el.textContent = labels[p] || p;
}

// ── Logout ────────────────────────────────────────────────────────────────────
function fazerLogout() {
  clearTimeout(_timerAviso);
  clearTimeout(_timerTimeout);
  sessionStorage.removeItem('perfil');
  perfilAtual = null;
  _mfaPendente = null;
  window._contratosInited = false;
  document.getElementById('login-senha').value = '';
  document.getElementById('login-erro').textContent = '';
  document.getElementById('login-overlay').style.display = 'flex';
}

// ── Guard de acesso ───────────────────────────────────────────────────────────
function verificarAcesso(modulo) {
  if (!perfilAtual) {
    document.getElementById('login-overlay').style.display = 'flex';
    return false;
  }
  return !modulo || (ACESSO[perfilAtual] || []).includes(modulo);
}

// ── Política de senhas ────────────────────────────────────────────────────────
function validarPoliticaSenha(senha) {
  const erros = [];
  if (senha.length < 8)               erros.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(senha))           erros.push('Pelo menos 1 letra maiúscula');
  if (!/[a-z]/.test(senha))           erros.push('Pelo menos 1 letra minúscula');
  if (!/[0-9]/.test(senha))           erros.push('Pelo menos 1 número');
  return erros;
}

// ══════════════════════════════════════════════════════════════════════════════
