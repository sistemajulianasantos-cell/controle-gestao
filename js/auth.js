// ─── LOGIN / AUTENTICAÇÃO ───────────────────────────────
// ═══════════════════════════════════════════════════════
// As senhas ficam em D.senhas (Firebase) como hashes SHA-256.

var ACESSO = {
  admin:       ['estoque','contratos','produtos','regras','producao','separacao','agenda','financeiro','analise','equipe','orcamento','refconsumo'],
  financeiro:  ['estoque','contratos','produtos','producao','separacao','agenda','equipe','orcamento','refconsumo'],
  operacional: ['contratos','producao','separacao','agenda']
};

let perfilAtual = null;

async function hashSenha(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function tentarLogin() {
  const s = document.getElementById('login-senha').value.trim();
  const hash = await hashSenha(s);
  const p = (D.senhas || {})[hash];
  if (!p) {
    document.getElementById('login-erro').textContent = 'Senha incorreta';
    return;
  }
  perfilAtual = p;
  sessionStorage.setItem('perfil', p);
  document.getElementById('login-overlay').style.display = 'none';
  aplicarPerfil(p);
  go('fechamento');
}

function aplicarPerfil(p) {
  const ac = ACESSO[p] || [];
  // Mostrar/ocultar itens do menu
  document.querySelectorAll('[data-modulo]').forEach(el => {
    const m = el.getAttribute('data-modulo');
    el.style.display = (m === 'estoque' ? ac.includes('estoque') : ac.includes(m)) ? '' : 'none';
  });
  // KPI de faturamento: só admin
  const kpiBox = document.getElementById('kpi-box');
  if (kpiBox) {
    kpiBox.style.display = p === 'admin' ? '' : 'none';
    if (p === 'admin') setTimeout(rKpiFaturamento, 300);
  }
  // Label do perfil
  const labels = { admin: 'Administrador', financeiro: 'Financeiro', operacional: 'Operacional' };
  const el = document.getElementById('perfil-label');
  if (el) el.textContent = labels[p] || p;
}

function fazerLogout() {
  sessionStorage.removeItem('perfil');
  perfilAtual = null;
  window._contratosInited = false;
  document.getElementById('login-senha').value = '';
  document.getElementById('login-erro').textContent = '';
  document.getElementById('login-overlay').style.display = 'flex';
}

// ═══════════════════════════════════════════════════════
