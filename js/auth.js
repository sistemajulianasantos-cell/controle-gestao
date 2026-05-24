// ─── LOGIN / AUTENTICAÇÃO ───────────────────────────────
// ═══════════════════════════════════════════════════════

var SENHAS = { '2002': 'admin', '0035': 'financeiro', '0040': 'operacional' };
var ACESSO = {
  admin:       ['estoque','contratos','produtos','regras','producao','separacao','agenda','financeiro','analise'],
  financeiro:  ['contratos','produtos','producao','separacao','agenda','financeiro','analise'],
  operacional: ['contratos','producao','separacao','agenda']
};

let perfilAtual = null;

function tentarLogin() {
  const s = document.getElementById('login-senha').value.trim();
  const p = SENHAS[s];
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
